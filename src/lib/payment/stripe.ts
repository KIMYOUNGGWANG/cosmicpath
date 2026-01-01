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
 * 상품 ID로 현재 활성화된 기본 가격 정보를 가져옵니다.
 */
export async function getProductPrice(productId: string) {
    try {
        const product = await stripe.products.retrieve(productId);
        const priceId = typeof product.default_price === 'string'
            ? product.default_price
            : product.default_price?.id;

        if (!priceId) {
            throw new Error('No default price found for this product');
        }

        const price = await stripe.prices.retrieve(priceId);

        return {
            priceId: price.id,
            amount: price.unit_amount ? price.unit_amount / 100 : 0,
            currency: price.currency.toUpperCase(),
            formattedPrice: price.unit_amount
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(price.unit_amount / 100)
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
        const stripeProduct = await stripe.products.retrieve(productId);
        const priceId = typeof stripeProduct.default_price === 'string'
            ? stripeProduct.default_price
            : stripeProduct.default_price?.id;

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
