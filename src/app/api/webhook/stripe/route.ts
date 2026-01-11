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

        // 2. 프리미엄 리딩 결제 처리 (이메일 발송)
        // type이 없거나 'premium_reading'인 경우 = 리딩 결제
        if (!type || type === 'premium_reading') {
            const customerEmail = email || session.customer_email;

            if (customerEmail && readingId) {
                devLog.log(`[Webhook] Premium reading payment completed. Email: ${customerEmail}, ReadingID: ${readingId}`);

                try {
                    // DB에서 리딩 결과 조회
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

                            // 이메일 발송 완료 플래그 업데이트
                            await prisma.readingResult.update({
                                where: { id: readingId },
                                data: {
                                    metadata: JSON.stringify({
                                        ...savedMeta,
                                        email: customerEmail,
                                        emailSent: true,
                                        emailSentVia: 'webhook'
                                    })
                                }
                            });

                            devLog.log(`[Webhook] Email sent successfully to ${customerEmail}`);
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
    }

    return NextResponse.json({ received: true });
}
