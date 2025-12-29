import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, verifyCheckoutSession } from '@/lib/payment/stripe';
import { READING_PRODUCT } from '@/lib/payment/payment-config';

/**
 * POST /api/payment - 결제 세션 생성
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId = READING_PRODUCT.id } = body;

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        const session = await createCheckoutSession({
            productId,
            successUrl: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${origin}?canceled=true`,
            metadata: {}, // readingData saved in localStorage on client side
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        console.error('Payment session creation failed - FULL ERROR:', error);
        console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return NextResponse.json(
            { error: 'Failed to create payment session' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/payment?session_id=xxx - 결제 검증
 */
export async function GET(request: NextRequest) {
    try {
        const sessionId = request.nextUrl.searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID required' },
                { status: 400 }
            );
        }

        const result = await verifyCheckoutSession(sessionId);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Payment verification failed:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
