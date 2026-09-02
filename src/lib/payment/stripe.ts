import Stripe from 'stripe';
import { devLog } from '@/lib/dev-logger';
import { safeIncrementUsageCounter } from '@/lib/usage-metrics';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeInstance;
}

// Simple in-memory cache for pricing
interface CachedPrice {
    productId: string;
    priceId: string;
    amount: number;
    currency: string;
    formattedPrice: string;
    metadata: Stripe.Metadata;
}
const priceCache = new Map<string, { data: CachedPrice, timestamp: number }>();
const CACHE_TTL = 3600 * 1000; // 1 hour

function isRecoverableStripeLookupError(error: unknown) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
        return true;
    }

    if (!(error instanceof Error)) {
        return false;
    }

    return /No such (product|price)|resource_missing|STRIPE_SECRET_KEY is not configured|Price is not active/i.test(error.message);
}

function getCachedPrice(cacheKey: string) {
    const cached = priceCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }

    return null;
}

function buildCachedPrice(input: {
    productId: string;
    price: Stripe.Price;
    metadata: Stripe.Metadata;
}): CachedPrice {
    return {
        productId: input.productId,
        priceId: input.price.id,
        amount: input.price.unit_amount ? input.price.unit_amount / 100 : 0,
        currency: input.price.currency.toUpperCase(),
        formattedPrice: input.price.unit_amount
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: input.price.currency,
            }).format(input.price.unit_amount / 100)
            : 'Free',
        metadata: input.metadata,
    };
}

/**
 * 상품 ID로 현재 활성화된 가격 정보를 가져옵니다.
 * 특정 통화(currency)를 우선적으로 찾습니다.
 */
export async function getProductPrice(productId: string, targetCurrency: string = 'USD') {
    const stripe = getStripe();

    // 0. Cache Check
    const cacheKey = `${productId}-${targetCurrency}`;
    const cached = getCachedPrice(cacheKey);
    if (cached) return cached;

    try {
        // 1. 상품 정보 가져오기 (기본 가격 확인용)
        const product = await stripe.products.retrieve(productId, {
            expand: ['default_price']
        });

        // 2. 해당 상품의 모든 활성 가격 목록 가져오기
        const prices = await stripe.prices.list({
            product: productId,
            active: true,
            limit: 10
        });

        await safeIncrementUsageCounter({
            provider: 'stripe',
            metric: 'api_requests',
            count: 1,
            metadata: { action: 'get_product_price', productId },
        });

        // 3. 목표 통화(예: USD)와 일치하는 가격 찾기
        // 우선순위: 1) 목표 통화이면서 기본 가격인 것, 2) 목표 통화인 것, 3) 기본 가격인 것, 4) 아무거나 첫 번째
        const defaultPriceId = typeof product.default_price === 'string'
            ? product.default_price
            : product.default_price?.id;

        const price =
            prices.data.find(p => p.currency.toUpperCase() === targetCurrency.toUpperCase() && p.id === defaultPriceId) ||
            prices.data.find(p => p.currency.toUpperCase() === targetCurrency.toUpperCase()) ||
            prices.data.find(p => p.id === defaultPriceId) ||
            prices.data[0];

        if (!price) {
            throw new Error('No active price found for this product');
        }

        devLog.log(`[Stripe] Resolved price: ${price.unit_amount} ${price.currency} for product ${productId}`);

        const result = buildCachedPrice({
            productId: product.id,
            price,
            metadata: product.metadata,
        });

        // Update Cache
        priceCache.set(cacheKey, { data: result, timestamp: Date.now() });

        return result;
    } catch (error) {
        if (isRecoverableStripeLookupError(error)) {
            devLog.log(`[Stripe] Using fallback price label for product lookup: ${productId}`);
        } else {
            devLog.error('Error fetching product price:', error);
        }
        throw error;
    }
}

export async function getPriceById(priceId: string, targetCurrency: string = 'USD') {
    const stripe = getStripe();
    const cacheKey = `${priceId}-${targetCurrency}`;
    const cached = getCachedPrice(cacheKey);
    if (cached) return cached;

    try {
        const price = await stripe.prices.retrieve(priceId, {
            expand: ['product'],
        });

        await safeIncrementUsageCounter({
            provider: 'stripe',
            metric: 'api_requests',
            count: 1,
            metadata: { action: 'get_price_by_id', priceId },
        });

        if (!price.active) {
            throw new Error('Price is not active');
        }

        const expandedProduct =
            typeof price.product === 'string' || price.product.deleted
                ? null
                : price.product;
        const productId = expandedProduct?.id || (typeof price.product === 'string' ? price.product : price.product.id);

        if (!productId) {
            throw new Error('Price product is missing');
        }

        if (targetCurrency && price.currency.toUpperCase() !== targetCurrency.toUpperCase()) {
            devLog.log(`[Stripe] Price ${priceId} currency ${price.currency} differs from target ${targetCurrency}`);
        }

        const result = buildCachedPrice({
            productId,
            price,
            metadata: expandedProduct?.metadata ?? {},
        });

        priceCache.set(cacheKey, { data: result, timestamp: Date.now() });

        return result;
    } catch (error) {
        if (isRecoverableStripeLookupError(error)) {
            devLog.log(`[Stripe] Using fallback price label for price lookup: ${priceId}`);
        } else {
            devLog.error('Error fetching price by id:', error);
        }
        throw error;
    }
}

/**
 * 결제 세션 생성을 위한 옵션
 */
interface CheckoutSessionOptions {
    productId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    discountPercent?: number;
}

function withReadingId(successUrl: string, readingId?: string): string {
    if (!readingId) return successUrl;

    try {
        const url = new URL(successUrl);
        if (!url.searchParams.has('reading_id')) {
            url.searchParams.set('reading_id', readingId);
        }
        return url.toString();
    } catch {
        const separator = successUrl.includes('?') ? '&' : '?';
        if (successUrl.includes('reading_id=')) {
            return successUrl;
        }
        return `${successUrl}${separator}reading_id=${readingId}`;
    }
}

/**
 * Stripe Checkout 세션을 생성합니다.
 */
export async function createCheckoutSession({
    productId,
    successUrl,
    cancelUrl,
    metadata,
    discountPercent,
}: CheckoutSessionOptions) {
    const stripe = getStripe();

    try {
        // Find the product and its default price
        const stripeProduct = await stripe.products.retrieve(productId, {
            expand: ['default_price']
        });

        const price = stripeProduct.default_price as Stripe.Price;
        const priceId = price?.id;

        if (!priceId) {
            throw new Error('Default price not found for product');
        }

        const shouldApplyDiscount =
            typeof discountPercent === 'number' &&
            Number.isFinite(discountPercent) &&
            discountPercent > 0 &&
            discountPercent < 100;

        if (shouldApplyDiscount && price.type !== 'one_time') {
            throw new Error('Discounted checkout is only supported for one-time products');
        }

        if (shouldApplyDiscount && typeof price.unit_amount !== 'number') {
            throw new Error('Discounted checkout requires a fixed unit amount');
        }

        const discountedUnitAmount = shouldApplyDiscount && typeof price.unit_amount === 'number'
            ? Math.max(50, Math.round(price.unit_amount * ((100 - discountPercent) / 100)))
            : null;

        const sessionMetadata: Record<string, string> = {
            ...(metadata ?? {}),
            ...(shouldApplyDiscount && discountedUnitAmount !== null
                ? {
                    originalAmount: String(price.unit_amount),
                    discountedAmount: String(discountedUnitAmount),
                }
                : {}),
        };

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                shouldApplyDiscount && discountedUnitAmount !== null
                    ? {
                        price_data: {
                            currency: price.currency,
                            product: stripeProduct.id,
                            unit_amount: discountedUnitAmount,
                            tax_behavior:
                                price.tax_behavior && price.tax_behavior !== 'unspecified'
                                    ? price.tax_behavior
                                    : undefined,
                        },
                        quantity: 1,
                    }
                    : {
                        price: priceId,
                        quantity: 1,
                    },
            ],
            mode: 'payment',
            success_url: withReadingId(successUrl, sessionMetadata?.readingId),
            cancel_url: cancelUrl,
            customer_email: sessionMetadata?.email || undefined,
            metadata: sessionMetadata,
        });

        await safeIncrementUsageCounter({
            provider: 'stripe',
            metric: 'api_requests',
            count: 1,
            metadata: {
                action: 'create_checkout_session',
                productId,
                ...(shouldApplyDiscount ? { discountPercent: String(discountPercent) } : {}),
            },
        });

        return { url: session.url };
    } catch (error) {
        if (
            process.env.NODE_ENV === 'development' &&
            error instanceof Error &&
            /ENOTFOUND|StripeConnectionError|connection to Stripe|STRIPE_SECRET_KEY/i.test(error.message)
        ) {
            const mockSessionId = `mock_dev_session_${Date.now()}`;
            const resolvedSuccessUrl = withReadingId(successUrl, metadata?.readingId).replace('{CHECKOUT_SESSION_ID}', mockSessionId);
            devLog.log('[Stripe Dev Fallback] Offline development redirect to:', resolvedSuccessUrl);
            return { url: resolvedSuccessUrl };
        }

        devLog.error('Error creating checkout session:', error);
        throw error;
    }
}

/**
 * Checkout Session 검증
 */
export async function verifyCheckoutSession(sessionId: string) {
    if (sessionId.startsWith('mock_dev_session_')) {
        return {
            success: true,
            type: 'premium_reading',
            sessionId,
            productId: 'cosmicpath_reading_v1',
            readingId: undefined,
            credits: 0,
            followUpQuestions: 0,
            customerEmail: 'dev@cosmicpath.live',
            session: null as unknown as Stripe.Checkout.Session,
        };
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    await safeIncrementUsageCounter({
        provider: 'stripe',
        metric: 'api_requests',
        count: 1,
        metadata: { action: 'verify_checkout_session' },
    });

    return {
        success: session.payment_status === 'paid',
        type: session.metadata?.type || null,
        sessionId: session.id,
        productId: session.metadata?.productId,
        readingId: session.metadata?.readingId, // Added readingId
        credits: Number.parseInt(session.metadata?.credits || '0', 10) || 0,
        followUpQuestions: Number(session.metadata?.followUpQuestions || 0),
        customerEmail: session.customer_details?.email,
        session,
    };
}

export { getStripe };
