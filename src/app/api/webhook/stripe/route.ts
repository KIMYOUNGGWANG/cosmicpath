import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/payment/stripe';
import {
    SUBSCRIPTION_PLAN_IDS,
    SUBSCRIPTION_PRICE_IDS,
    type SubscriptionPlanId,
} from '@/lib/payment/payment-config';
import { devLog } from '@/lib/dev-logger';
import { sendResultEmail } from '@/lib/email/sender';
import { sendOpsAlert } from '@/lib/ops-alert';
import { scheduleDefaultFollowUps } from '@/lib/followup-jobs';
import { applyChatCreditFromSession } from '@/lib/payment/chat-credit';
import { redeemPromotionCode } from '@/lib/promo-codes';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

function parseJsonObject(raw: string | null | undefined): Record<string, unknown> {
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as Record<string, unknown>;
        }
    } catch {
        // Ignore malformed metadata and fall back to empty object.
    }
    return {};
}

const activeSubscriptionStatuses = new Set<Stripe.Subscription.Status>([
    'trialing',
    'active',
    'past_due',
]);

let userTableCache: 'User' | 'users' | null | undefined;
let subscriptionColumnsAvailableCache: boolean | undefined;

function parsePlanId(raw: string | null | undefined): SubscriptionPlanId | null {
    if (!raw) return null;
    return SUBSCRIPTION_PLAN_IDS.includes(raw as SubscriptionPlanId)
        ? (raw as SubscriptionPlanId)
        : null;
}

function resolvePlanIdFromSubscription(subscription: Stripe.Subscription): SubscriptionPlanId | null {
    const metadataPlan = parsePlanId(subscription.metadata?.planId);
    if (metadataPlan) return metadataPlan;

    const firstPriceId = subscription.items.data[0]?.price?.id;
    if (!firstPriceId) return null;

    for (const planId of SUBSCRIPTION_PLAN_IDS) {
        if (SUBSCRIPTION_PRICE_IDS[planId] === firstPriceId) {
            return planId;
        }
    }

    return null;
}

function toSubscriptionStatus(planId: SubscriptionPlanId | null): 'free' | 'pro' {
    return planId ? 'pro' : 'free';
}

function getCustomerIdFromSubscription(subscription: Stripe.Subscription): string | null {
    if (typeof subscription.customer === 'string') return subscription.customer;
    return subscription.customer?.id ?? null;
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): number | null {
    const periodEnds = subscription.items.data
        .map((item) => item.current_period_end)
        .filter((value): value is number => typeof value === 'number');

    if (periodEnds.length === 0) return null;
    return Math.max(...periodEnds);
}

async function getUserTableName(): Promise<'User' | 'users' | null> {
    if (userTableCache !== undefined) return userTableCache;

    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('User', 'users')
        ORDER BY CASE WHEN table_name = 'User' THEN 0 ELSE 1 END
        LIMIT 1
    `;

    const resolved = rows[0]?.table_name;
    if (resolved === 'User' || resolved === 'users') {
        userTableCache = resolved;
    } else {
        userTableCache = null;
    }

    return userTableCache;
}

function getQualifiedUserTable(tableName: 'User' | 'users'): string {
    return tableName === 'User' ? 'public."User"' : 'public.users';
}

async function hasSubscriptionColumns(): Promise<boolean> {
    if (subscriptionColumnsAvailableCache !== undefined) {
        return subscriptionColumnsAvailableCache;
    }

    const tableName = await getUserTableName();
    if (!tableName) {
        subscriptionColumnsAvailableCache = false;
        return false;
    }

    const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${tableName}
          AND column_name IN (
            'subscription_status',
            'subscription_expires_at',
            'stripe_customer_id',
            'stripe_subscription_id'
          )
    `;

    const names = new Set(rows.map((row) => row.column_name));
    subscriptionColumnsAvailableCache =
        names.has('subscription_status') &&
        names.has('subscription_expires_at') &&
        names.has('stripe_customer_id') &&
        names.has('stripe_subscription_id');

    return subscriptionColumnsAvailableCache;
}

async function resolveUserIdFromSubscription(subscription: Stripe.Subscription): Promise<string | null> {
    const metadataUserId = subscription.metadata?.userId?.trim();
    if (metadataUserId) return metadataUserId;

    const stripeCustomerId = getCustomerIdFromSubscription(subscription);
    if (!stripeCustomerId) return null;

    const tableName = await getUserTableName();
    const hasColumns = await hasSubscriptionColumns();
    if (!tableName || !hasColumns) return null;

    const qualifiedTable = getQualifiedUserTable(tableName);
    const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
        `SELECT id
         FROM ${qualifiedTable}
         WHERE stripe_customer_id = $1
         LIMIT 1`,
        stripeCustomerId
    );

    return rows[0]?.id ?? null;
}

async function updateSubscriptionState(params: {
    userId: string;
    status: 'free' | 'pro';
    expiresAt: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
}): Promise<boolean> {
    const tableName = await getUserTableName();
    const hasColumns = await hasSubscriptionColumns();
    if (!tableName || !hasColumns) return false;

    const qualifiedTable = getQualifiedUserTable(tableName);
    await prisma.$executeRawUnsafe(
        `UPDATE ${qualifiedTable}
         SET subscription_status = $1,
             subscription_expires_at = $2::timestamptz,
             stripe_customer_id = $3,
             stripe_subscription_id = $4
         WHERE id = $5`,
        params.status,
        params.expiresAt,
        params.stripeCustomerId,
        params.stripeSubscriptionId,
        params.userId
    );

    return true;
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

async function mergePaymentMetadata(orderId: string, patch: Record<string, unknown>): Promise<void> {
    const payment = await prisma.payment.findUnique({
        where: { orderId },
        select: { metadata: true },
    });

    const existing = parseJsonObject(payment?.metadata);

    await prisma.payment.update({
        where: { orderId },
        data: {
            metadata: JSON.stringify({
                ...existing,
                ...patch,
            }),
        },
    });
}

async function redeemCheckoutPromo(session: Stripe.Checkout.Session): Promise<{
    skipped: boolean;
    alreadyRedeemed?: boolean;
    redemptionId?: string;
}> {
    const promoCodeId = session.metadata?.promoCodeId?.trim();
    const discount = Number(session.metadata?.discount || '0');

    if (!promoCodeId || !(discount > 0 && discount < 100)) {
        return { skipped: true };
    }

    const customerEmail =
        session.metadata?.email?.trim() ||
        session.customer_details?.email?.trim() ||
        session.customer_email?.trim();

    if (!customerEmail) {
        throw new Error('Promo checkout completed without customer email');
    }

    const result = await redeemPromotionCode({
        codeId: promoCodeId,
        email: customerEmail,
        readingId: session.metadata?.readingId || undefined,
        userAgent: 'stripe_webhook',
    });

    return {
        skipped: false,
        alreadyRedeemed: result.alreadyRedeemed,
        redemptionId: result.redemptionId,
    };
}

export async function POST(req: NextRequest) {
    const requestId = req.headers.get('x-request-id') ?? `stripe-webhook-${Date.now()}`;
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

    if (!webhookSecret) {
        devLog.error('[Webhook] STRIPE_WEBHOOK_SECRET is not configured');
        await alertWebhookIssue({
            severity: 'critical',
            title: 'STRIPE_WEBHOOK_SECRET missing',
            message: 'Stripe webhook route is enabled but STRIPE_WEBHOOK_SECRET is missing.',
            details: { requestId },
        });
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

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
            webhookSecret
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
            const metadataPatch = {
                ...(session.metadata || {}),
                webhookEventId: event.id,
                webhookEventType: event.type,
                webhookProcessedAt: new Date().toISOString(),
            };

            // 0. Payment 테이블에 기록 저장 (idempotent)
            try {
                const existingPayment = await prisma.payment.findUnique({
                    where: { orderId: session.id },
                    select: { metadata: true },
                });

                const mergedMetadata = {
                    ...parseJsonObject(existingPayment?.metadata),
                    ...metadataPatch,
                };

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
                        metadata: JSON.stringify(mergedMetadata),
                    },
                    update: {
                        amount: session.amount_total || 0,
                        currency: session.currency || 'usd',
                        status: 'DONE',
                        method: 'STRIPE',
                        receiptUrl: session.url || null,
                        customerEmail: email || session.customer_details?.email || '',
                        readingId: readingId || null,
                        metadata: JSON.stringify(mergedMetadata),
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

            try {
                const promoResult = await redeemCheckoutPromo(session);
                if (!promoResult.skipped) {
                    await mergePaymentMetadata(session.id, {
                        promoRedemptionId: promoResult.redemptionId || null,
                        promoRedeemedAt: new Date().toISOString(),
                        promoAlreadyRedeemed: promoResult.alreadyRedeemed === true,
                    });
                }
            } catch (promoError) {
                devLog.error('[Webhook] Promo redemption failed:', promoError);
                await mergePaymentMetadata(session.id, {
                    promoRedemptionError: getErrorMessage(promoError).slice(0, 300),
                }).catch(() => undefined);
                await alertWebhookIssue({
                    severity: 'warning',
                    title: 'Promo redemption failed',
                    message: 'Checkout completed but promo code redemption could not be finalized.',
                    details: {
                        requestId,
                        eventId: event.id,
                        sessionId: session.id,
                        promoCodeId: session.metadata?.promoCodeId || null,
                    },
                });
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

                if (!readingId) {
                    devLog.warn('[Webhook] Missing readingId for premium reading checkout session');
                    await alertWebhookIssue({
                        severity: 'warning',
                        title: 'Premium payment missing readingId',
                        message: 'Premium reading checkout completed without readingId metadata.',
                        details: { requestId, eventId: event.id, sessionId: session.id },
                    });
                }

                if (readingId) {
                    try {
                        const reading = await prisma.readingResult.findUnique({
                            where: { id: readingId },
                        });

                        if (!reading) {
                            await alertWebhookIssue({
                                severity: 'warning',
                                title: 'Premium reading not found',
                                message: 'Webhook received a premium payment but the target reading was missing.',
                                details: { requestId, eventId: event.id, readingId },
                            });
                        } else {
                            const savedMeta = reading.metadata ? JSON.parse(reading.metadata) : {};
                            if (!savedMeta.isPremium) {
                                await prisma.readingResult.update({
                                    where: { id: readingId },
                                    data: {
                                        metadata: JSON.stringify({
                                            ...savedMeta,
                                            isPremium: true,
                                            paymentVerifiedAt: new Date().toISOString(),
                                            paymentSource: 'stripe_webhook',
                                            email: customerEmail || savedMeta.email || '',
                                        }),
                                    },
                                });
                            }
                        }
                    } catch (readingUpdateError) {
                        devLog.error('[Webhook] Failed to mark reading as premium:', readingUpdateError);
                        await alertWebhookIssue({
                            severity: 'critical',
                            title: 'Premium reading status update failed',
                            message: 'Webhook failed while marking reading result as premium.',
                            details: { requestId, eventId: event.id, readingId },
                        });
                    }
                }

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
                                await mergePaymentMetadata(session.id, {
                                    premiumEmailSentAt: new Date().toISOString(),
                                });
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
                        await mergePaymentMetadata(session.id, {
                            followUpsScheduledAt: new Date().toISOString(),
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
                    await alertWebhookIssue({
                        severity: 'warning',
                        title: 'Premium payment metadata incomplete',
                        message: 'Premium reading checkout completed without full metadata required for email/follow-up.',
                        details: {
                            requestId,
                            eventId: event.id,
                            sessionId: session.id,
                            readingId: readingId || null,
                            customerEmail: customerEmail || null,
                        },
                    });
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

        if (
            event.type === 'customer.subscription.created' ||
            event.type === 'customer.subscription.updated' ||
            event.type === 'customer.subscription.deleted'
        ) {
            const subscription = event.data.object as Stripe.Subscription;
            const planId = resolvePlanIdFromSubscription(subscription);
            const isActive = activeSubscriptionStatuses.has(subscription.status);
            const stripeCustomerId = getCustomerIdFromSubscription(subscription);
            const userId = await resolveUserIdFromSubscription(subscription);
            const periodEnd = getSubscriptionPeriodEnd(subscription);

            if (!userId) {
                devLog.warn(
                    `[Webhook] Subscription event skipped: user not resolved (${event.type}, subscriptionId=${subscription.id})`
                );
                return NextResponse.json({ received: true });
            }

            const persisted = await updateSubscriptionState({
                userId,
                status: isActive ? toSubscriptionStatus(planId) : 'free',
                expiresAt: isActive && periodEnd
                    ? new Date(periodEnd * 1000).toISOString()
                    : null,
                stripeCustomerId,
                stripeSubscriptionId:
                    event.type === 'customer.subscription.deleted' ? null : subscription.id,
            });

            if (!persisted) {
                devLog.warn(
                    '[Webhook] Subscription columns are missing. Run migration before relying on DB subscription status.'
                );
            } else {
                devLog.log(
                    `[Webhook] Subscription state synced (${event.type}) user=${userId} status=${isActive ? toSubscriptionStatus(planId) : 'free'}`
                );
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
