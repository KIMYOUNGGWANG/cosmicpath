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

export interface CreateCheckoutSessionParams {
    productId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}

/**
 * Stripe Checkout Session 생성
 */
export async function createCheckoutSession({
    productId,
    successUrl,
    cancelUrl,
    metadata = {},
}: CreateCheckoutSessionParams) {
    const product = productId === READING_PRODUCT.id ? READING_PRODUCT : FOLLOW_UP_PRODUCT;

    const session = await getStripe().checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: product.currency,
                    product_data: {
                        name: product.name,
                        description: product.description,
                    },
                    unit_amount: product.price,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            productId: product.id,
            followUpQuestions: String(product.followUpQuestions),
            ...metadata,
        },
    });

    return session;
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
