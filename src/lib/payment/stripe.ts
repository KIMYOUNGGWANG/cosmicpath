import Stripe from 'stripe';
import { READING_PRODUCT, FOLLOW_UP_PRODUCT } from './payment-config';

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

const stripe = getStripe();

/**
 * 상품 ID로 현재 활성화된 가격 정보를 가져옵니다.
 * 특정 통화(currency)를 우선적으로 찾습니다.
 */
export async function getProductPrice(productId: string, targetCurrency: string = 'USD') {
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

        console.log(`[Stripe] Resolved price: ${price.unit_amount} ${price.currency} for product ${productId}`);

        return {
            productId: product.id,
            priceId: price.id,
            amount: price.unit_amount ? price.unit_amount / 100 : 0,
            currency: price.currency.toUpperCase(),
            formattedPrice: price.unit_amount
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: price.currency
                }).format(price.unit_amount / 100)
                : 'Free'
        };
    } catch (error) {
        console.error('Error fetching product price:', error);
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
}

/**
 * Stripe Checkout 세션을 생성합니다.
 */
export async function createCheckoutSession({
    productId,
    successUrl,
    cancelUrl,
    metadata,
}: CheckoutSessionOptions) {
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

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata,
        });

        return { url: session.url };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
}

/**
 * Checkout Session 검증
 */
export async function verifyCheckoutSession(sessionId: string) {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    return {
        success: session.payment_status === 'paid',
        sessionId: session.id,
        productId: session.metadata?.productId,
        followUpQuestions: Number(session.metadata?.followUpQuestions || 0),
        customerEmail: session.customer_details?.email,
    };
}

export { getStripe };
