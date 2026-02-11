import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, verifyCheckoutSession } from '@/lib/payment/stripe';
import { READING_PRODUCT } from '@/lib/payment/payment-config';

/**
 * POST /api/payment - 결제 세션 생성 (Stripe)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, email, readingId } = body;

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        const session = await createCheckoutSession({
            productId: productId || READING_PRODUCT.id,
            successUrl: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&reading_id=${readingId || ''}`,
            cancelUrl: `${origin}/start?canceled=true`,
            metadata: {
                email: email || '',
                readingId: readingId || ''
            },
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

        // [Sync] If paid, update the ReadingResult in DB immediately to avoid webhook race condition
        if (result.success && result.readingId) {
            try {
                const { prisma } = await import('@/lib/prisma');
                const reading = await prisma.readingResult.findUnique({
                    where: { id: result.readingId }
                });

                if (reading) {
                    const meta = reading.metadata ? JSON.parse(reading.metadata) : {};
                    if (!meta.isPremium) {
                        await prisma.readingResult.update({
                            where: { id: result.readingId },
                            data: {
                                metadata: JSON.stringify({
                                    ...meta,
                                    isPremium: true,
                                    paymentVerifiedAt: new Date().toISOString(),
                                    paymentSource: 'sync_verification'
                                })
                            }
                        });
                        console.log(`[Sync] Updated reading ${result.readingId} status to premium via sync.`);
                    }
                }
            } catch (syncErr) {
                console.error('[Sync] Failed to sync payment status to DB:', syncErr);
            }
        }

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
