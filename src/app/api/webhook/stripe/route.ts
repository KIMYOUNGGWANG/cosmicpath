import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/payment/stripe';
import { devLog } from '@/lib/dev-logger';
import { sendResultEmail } from '@/lib/email/sender';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        devLog.error('[Webhook] Missing stripe-signature');
        return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        devLog.error(`[Webhook] Signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const { type, readingId, credits, email } = session.metadata || {};

        // 0. Payment 테이블에 기록 저장
        try {
            await prisma.payment.create({
                data: {
                    orderId: session.id,
                    amount: session.amount_total || 0,
                    currency: session.currency || 'usd',
                    status: 'DONE',
                    method: 'STRIPE',
                    receiptUrl: session.url, // 참고: session.url은 결제창 URL일 수 있음, 영수증 URL은 아님. 필요시 수정.
                    customerEmail: email || session.customer_details?.email || '',
                    readingId: readingId || null,
                    metadata: JSON.stringify(session.metadata),
                },
            });
            devLog.log(`[Webhook] Payment record created for session ${session.id}`);
        } catch (dbError) {
            devLog.error(`[Webhook] Failed to create payment record: ${dbError}`);
            // 결제 기록 실패가 전체 로직을 막지 않도록 continue
        }

        // 1. 채팅 크레딧 결제 처리
        if (type === 'chat_credit' && readingId) {
            try {
                const creditAmount = parseInt(credits || '1', 10);
                devLog.log(`[Webhook] Processing chat credit purchase for reading ${readingId}. Amount: ${creditAmount}`);

                const chatSession = await prisma.chatSession.upsert({
                    where: { readingResultId: readingId },
                    create: {
                        readingResultId: readingId,
                        credits: 1 + creditAmount
                    },
                    update: {
                        credits: { increment: creditAmount }
                    }
                });

                devLog.log(`[Webhook] Successfully updated credits. New total: ${chatSession.credits}`);
            } catch (error) {
                devLog.error('[Webhook] Failed to update credits in database:', error);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }
        }

        // 2. 프리미엄 리딩 결제 처리 (이메일 발송 & 유저 연동)
        // type이 없거나 'premium_reading'인 경우 = 리딩 결제
        if (!type || type === 'premium_reading') {
            const customerEmail = email || session.customer_email;

            if (customerEmail && readingId) {
                devLog.log(`[Webhook] Premium reading payment completed. Email: ${customerEmail}, ReadingID: ${readingId}`);

                try {
                    // [New] 결제 이메일로 유저 찾기 (계정 연동)
                    const user = await prisma.user.findUnique({
                        where: { email: customerEmail }
                    });

                    // DB에서 리딩 결과 조회 및 업데이트
                    const reading = await prisma.readingResult.findUnique({
                        where: { id: readingId }
                    });

                    if (reading) {
                        const savedMeta = reading.metadata ? JSON.parse(reading.metadata) : {};

                        // 이미 발송된 경우 스킵
                        if (savedMeta.emailSent) {
                            devLog.log(`[Webhook] Email already sent for ${readingId}, skipping`);
                        } else {
                            // 이메일 발송
                            await sendResultEmail({
                                email: customerEmail,
                                resultId: readingId,
                                title: savedMeta.userContext || '통합 분석 리포트',
                                birthInfo: savedMeta.birthInfo,
                                sajuSummary: savedMeta.sajuSummary,
                                userContext: savedMeta.userContext
                            });

                            // 이메일 발송 완료 플래그 & 유저 ID 업데이트
                            await prisma.readingResult.update({
                                where: { id: readingId },
                                data: {
                                    metadata: JSON.stringify({
                                        ...savedMeta,
                                        isPremium: true, // Explicitly set as premium
                                        email: customerEmail,
                                        emailSent: true,
                                        emailSentVia: 'webhook'
                                    }),
                                    // 유저가 존재하고, 아직 연동 안된 경우 연동
                                    ...(user && !reading.userId ? { userId: user.id } : {})
                                }
                            });

                            devLog.log(`[Webhook] Email sent successfully to ${customerEmail}. User linked: ${!!user}`);
                        }
                    } else {
                        devLog.warn(`[Webhook] Reading not found in DB: ${readingId}`);
                    }
                } catch (emailError: any) {
                    devLog.error('[Webhook] Email sending failed:', emailError);
                    // 이메일 실패해도 결제는 성공으로 처리 (사용자에게 불이익 없도록)
                }
            } else {
                devLog.warn(`[Webhook] Missing email or readingId for premium reading. Email: ${customerEmail}, ReadingID: ${readingId}`);
            }
        }

        // 3. Match Compatibility Unlock 처리
        const { productType, matchSessionId } = session.metadata || {};
        if (productType === 'match' && matchSessionId) {
            try {
                devLog.log(`[Webhook] Match unlock payment completed. SessionID: ${matchSessionId}`);

                await prisma.matchSession.update({
                    where: { id: matchSessionId },
                    data: {
                        isUnlocked: true,
                        unlockedAt: new Date(),
                        paymentId: session.id,
                    },
                });

                devLog.log(`[Webhook] Match session ${matchSessionId} unlocked successfully`);
            } catch (matchError: any) {
                devLog.error(`[Webhook] Failed to unlock match session: ${matchError.message}`);
                return NextResponse.json({ error: 'Match unlock failed' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
