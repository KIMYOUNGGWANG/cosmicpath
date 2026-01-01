import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, verifyCheckoutSession } from '@/lib/payment/stripe';
import { READING_PRODUCT } from '@/lib/payment/payment-config';

/**
 * POST /api/payment - 결제 세션 생성 (Stripe)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, email } = body;

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        const session = await createCheckoutSession({
            productId: productId || READING_PRODUCT.id,
            successUrl: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${origin}/start?canceled=true`,
            metadata: { email: email || '' },
        });

        if (!session.url) {
            throw new Error('Failed to create checkout session');
        }

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Payment initialization failed:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/payment?session_id=xxx - 결제 검증 (Stripe - Temporarily Disabled)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Missing session ID' },
                { status: 400 }
            );
        }

        const result = await verifyCheckoutSession(sessionId);

        return NextResponse.json({
            status: result.success ? 'paid' : 'unpaid',
            customer_email: result.customerEmail,
        });
    } catch (error: any) {
        console.error('Payment verification failed:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
