import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/payment/stripe';
import { devLog } from '@/lib/dev-logger';
import { sendResultEmail } from '@/lib/email/sender';
import { sendOpsAlert } from '@/lib/ops-alert';
import { scheduleDefaultFollowUps } from '@/lib/followup-jobs';
import { applyChatCreditFromSession } from '@/lib/payment/chat-credit';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

async function alertWebhookIssue(params: {
    severity: 'warning' | 'critical';
    title: string;
    message: string;
    details?: Record<string, unknown>;
}): Promise<void> {
    await sendOpsAlert({
        source: 'stripe-webhook',
        severity: params.severity,
        title: params.title,
        message: params.message,
        details: params.details,
        dedupeKey: `stripe-webhook:${params.title}`,
    });
}

export async function POST(req: NextRequest) {
    const requestId = req.headers.get('x-request-id') ?? `stripe-webhook-${Date.now()}`;
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        devLog.error('[Webhook] Missing stripe-signature');
        await alertWebhookIssue({
            severity: 'warning',
            title: 'Missing stripe signature',
            message: 'Webhook request was rejected because stripe-signature header is missing.',
            details: { requestId },
        });
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
    } catch (error) {
        const reason = getErrorMessage(error);
        devLog.error(`[Webhook] Signature verification failed: ${reason}`);
        await alertWebhookIssue({
            severity: 'warning',
            title: 'Webhook signature verification failed',
            message: 'Stripe webhook signature verification failed.',
            details: { requestId, error: reason.slice(0, 300) },
        });
        return NextResponse.json({ error: `Webhook Error: ${reason}` }, { status: 400 });
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const { type, readingId, email } = session.metadata || {};

            // 0. Payment 테이블에 기록 저장 (idempotent)
            try {
                await prisma.payment.upsert({
                    where: { orderId: session.id },
                    create: {
                        orderId: session.id,
                        amount: session.amount_total || 0,
                        currency: session.currency || 'usd',
                        status: 'DONE',
                        method: 'STRIPE',
                        receiptUrl: session.url || null,
                        customerEmail: email || session.customer_details?.email || '',
                        readingId: readingId || null,
                        metadata: JSON.stringify(session.metadata || {}),
                    },
                    // Keep existing metadata as-is to preserve idempotency markers.
                    update: {
                        amount: session.amount_total || 0,
                        currency: session.currency || 'usd',
                        status: 'DONE',
                        method: 'STRIPE',
                        receiptUrl: session.url || null,
                        customerEmail: email || session.customer_details?.email || '',
                        readingId: readingId || null,
                    },
                });
                devLog.log(`[Webhook] Payment record created for session ${session.id}`);
            } catch (dbError) {
                devLog.error(`[Webhook] Failed to create payment record: ${dbError}`);
                await alertWebhookIssue({
                    severity: 'warning',
                    title: 'Payment record create failed',
                    message: 'Webhook could not persist payment record in DB.',
                    details: { requestId, eventId: event.id, sessionId: session.id },
                });
                // 결제 기록 실패가 전체 로직을 막지 않도록 continue
            }

            // 1. 채팅 크레딧 결제 처리
            if (type === 'chat_credit') {
                try {
                    const result = await applyChatCreditFromSession(session, 'webhook');
                    if (result.applied) {
                        devLog.log(
                            `[Webhook] Applied chat credits. Reading: ${result.readingId}, Added: ${result.creditsAdded}, Total: ${result.totalCredits}`
                        );
                    } else {
                        devLog.log(
                            `[Webhook] Skipped chat credit apply. Reason: ${result.reason || 'unknown'}, Reading: ${result.readingId || 'n/a'}`
                        );
                    }
                } catch (error) {
                    devLog.error('[Webhook] Failed to update credits in database:', error);
                    await alertWebhookIssue({
                        severity: 'critical',
                        title: 'Chat credit update failed',
                        message: 'Webhook failed while applying chat credit purchase.',
                        details: { requestId, eventId: event.id, readingId: readingId || null },
                    });
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
                    } catch (emailError) {
                        devLog.error('[Webhook] Email sending failed:', emailError);
                        await alertWebhookIssue({
                            severity: 'warning',
                            title: 'Premium email post-processing failed',
                            message: 'Webhook completed payment but failed in premium email post-processing.',
                            details: { requestId, eventId: event.id, readingId },
                        });
                        // 이메일 실패해도 결제는 성공으로 처리 (사용자에게 불이익 없도록)
                    }

                    try {
                        await scheduleDefaultFollowUps({
                            readingId,
                            email: customerEmail,
                        });
                    } catch (scheduleError) {
                        devLog.error('[Webhook] Failed to schedule follow-up jobs:', scheduleError);
                        await alertWebhookIssue({
                            severity: 'warning',
                            title: 'Follow-up schedule failed',
                            message: 'Payment completed but follow-up jobs could not be scheduled.',
                            details: { requestId, eventId: event.id, readingId },
                        });
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
                } catch (matchError) {
                    devLog.error(`[Webhook] Failed to unlock match session: ${getErrorMessage(matchError)}`);
                    await alertWebhookIssue({
                        severity: 'critical',
                        title: 'Match unlock failed',
                        message: 'Webhook could not unlock paid match session.',
                        details: { requestId, eventId: event.id, matchSessionId },
                    });
                    return NextResponse.json({ error: 'Match unlock failed' }, { status: 500 });
                }
            }
        }
        return NextResponse.json({ received: true });
    } catch (error) {
        const reason = getErrorMessage(error);
        devLog.error('[Webhook] Unhandled processing error:', reason);
        await alertWebhookIssue({
            severity: 'critical',
            title: 'Unhandled webhook processing failure',
            message: 'Unexpected failure occurred during Stripe webhook processing.',
            details: {
                requestId,
                eventId: event.id,
                eventType: event.type,
                error: reason.slice(0, 300),
            },
        });
        return NextResponse.json({ error: 'Unhandled webhook processing failure' }, { status: 500 });
    }
}
