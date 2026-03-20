import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, verifyCheckoutSession } from '@/lib/payment/stripe';
import { READING_PRODUCT } from '@/lib/payment/payment-config';
import { validatePromotionCodeForCheckout } from '@/lib/promo-codes';

/**
 * POST /api/payment - 결제 세션 생성 (Stripe)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, email, readingId, referralCode, promoCodeId, discount } = body;
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        let appliedDiscount = 0;
        let appliedPromoCodeId = '';

        if (promoCodeId) {
            const promoCode = await validatePromotionCodeForCheckout({
                codeId: promoCodeId,
                expectedDiscount: typeof discount === 'number' ? discount : undefined,
                email: normalizedEmail || undefined,
            });

            if (promoCode.discount >= 100) {
                return NextResponse.json(
                    { error: '100% 할인 코드는 직접 사용 흐름으로만 처리됩니다.' },
                    { status: 400 }
                );
            }

            appliedDiscount = promoCode.discount;
            appliedPromoCodeId = promoCode.id;
        }

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        const session = await createCheckoutSession({
            productId: productId || READING_PRODUCT.productId,
            successUrl: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&reading_id=${readingId || ''}`,
            cancelUrl: `${origin}/start?canceled=true`,
            discountPercent: appliedDiscount || undefined,
            metadata: {
                type: 'premium_reading',
                productId: productId || READING_PRODUCT.productId,
                email: normalizedEmail,
                readingId: readingId || '',
                referralCode: referralCode || '',
                promoCodeId: appliedPromoCodeId,
                discount: appliedDiscount ? String(appliedDiscount) : '',
            },
        });

        if (!session.url) {
            throw new Error('Failed to create checkout session');
        }

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('Payment initialization failed:', error);
        return NextResponse.json(
            { error: message },
            { status: message.includes('프로모션') || message.includes('코드') ? 400 : 500 }
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

        let chatCreditApplied = false;
        let chatCreditTotal: number | undefined;

        // [Sync] Chat credit purchase: apply credits immediately to avoid webhook delay/miss
        if (result.success && result.type === 'chat_credit' && result.session) {
            try {
                const { applyChatCreditFromSession } = await import('@/lib/payment/chat-credit');
                const applied = await applyChatCreditFromSession(result.session, 'sync_verify');
                chatCreditApplied = applied.applied;
                chatCreditTotal = applied.totalCredits;
            } catch (syncErr) {
                console.error('[Sync] Failed to apply chat credits via sync verification:', syncErr);
            }
        }

        // [Sync] Premium reading purchase: update ReadingResult immediately to avoid webhook race condition
        if (result.success && result.readingId && (!result.type || result.type === 'premium_reading')) {
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
            payment_type: result.type || 'premium_reading',
            reading_id: result.readingId || null,
            credits_applied: chatCreditApplied,
            credits_total: chatCreditTotal ?? null,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('Payment verification failed:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
