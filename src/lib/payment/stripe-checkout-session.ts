import Stripe from 'stripe';
import { devLog } from '@/lib/dev-logger';
import { applyChatCreditFromSession } from '@/lib/payment/chat-credit';
import { mergePaymentMetadata, upsertCheckoutPaymentRecord } from '@/lib/payment/stripe-payment-metadata';
import { handlePremiumReadingCheckout } from '@/lib/payment/stripe-premium-reading';
import { redeemCheckoutPromo } from '@/lib/payment/stripe-promo-redemption';
import { alertWebhookIssue } from '@/lib/payment/stripe-webhook-alerts';
import { getErrorMessage, WEBHOOK_OK, type WebhookHandlerResult } from '@/lib/payment/stripe-webhook-utils';
import { prisma } from '@/lib/prisma';

async function applyCheckoutPromo(params: {
    readonly requestId: string;
    readonly eventId: string;
    readonly session: Stripe.Checkout.Session;
}): Promise<void> {
    const { requestId, eventId, session } = params;

    try {
        const promoResult = await redeemCheckoutPromo(session);
        if (!promoResult.skipped) {
            await mergePaymentMetadata(session.id, {
                promoRedemptionId: promoResult.redemptionId || null,
                promoRedeemedAt: new Date().toISOString(),
                promoAlreadyRedeemed: promoResult.alreadyRedeemed === true,
            });
        }
    } catch (error) {
        const reason = error instanceof Error ? error.message : getErrorMessage(error);
        devLog.error('[Webhook] Promo redemption failed:', reason);
        await mergePaymentMetadata(session.id, {
            promoRedemptionError: reason.slice(0, 300),
        }).catch((metadataError: unknown) => {
            if (metadataError instanceof Error) return undefined;
            return undefined;
        });
        await alertWebhookIssue({
            severity: 'warning',
            title: 'Promo redemption failed',
            message: 'Checkout completed but promo code redemption could not be finalized.',
            details: {
                requestId,
                eventId,
                sessionId: session.id,
                promoCodeId: session.metadata?.promoCodeId || null,
            },
        });
    }
}

async function applyChatCreditCheckout(params: {
    readonly requestId: string;
    readonly eventId: string;
    readonly session: Stripe.Checkout.Session;
}): Promise<WebhookHandlerResult> {
    const { requestId, eventId, session } = params;

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
        return WEBHOOK_OK;
    } catch (error) {
        const reason = error instanceof Error ? error.message : getErrorMessage(error);
        devLog.error('[Webhook] Failed to update credits in database:', reason);
        await alertWebhookIssue({
            severity: 'critical',
            title: 'Chat credit update failed',
            message: 'Webhook failed while applying chat credit purchase.',
            details: { requestId, eventId, readingId: session.metadata?.readingId || null },
        });
        return { ok: false, error: 'Database update failed', status: 500 };
    }
}

async function unlockMatchSession(params: {
    readonly requestId: string;
    readonly eventId: string;
    readonly session: Stripe.Checkout.Session;
}): Promise<WebhookHandlerResult> {
    const { requestId, eventId, session } = params;
    const { productType, matchSessionId } = session.metadata || {};

    if (productType !== 'match' || !matchSessionId) {
        return WEBHOOK_OK;
    }

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
        return WEBHOOK_OK;
    } catch (error) {
        const reason = error instanceof Error ? error.message : getErrorMessage(error);
        devLog.error(`[Webhook] Failed to unlock match session: ${reason}`);
        await alertWebhookIssue({
            severity: 'critical',
            title: 'Match unlock failed',
            message: 'Webhook could not unlock paid match session.',
            details: { requestId, eventId, matchSessionId },
        });
        return { ok: false, error: 'Match unlock failed', status: 500 };
    }
}

export async function handleCheckoutSessionCompleted(params: {
    readonly requestId: string;
    readonly eventId: string;
    readonly eventType: string;
    readonly session: Stripe.Checkout.Session;
}): Promise<WebhookHandlerResult> {
    const { requestId, eventId, eventType, session } = params;
    const checkoutType = session.metadata?.type;

    try {
        await upsertCheckoutPaymentRecord({ session, eventId, eventType });
        devLog.log(`[Webhook] Payment record created for session ${session.id}`);
    } catch (error) {
        const reason = error instanceof Error ? error.message : getErrorMessage(error);
        devLog.error(`[Webhook] Failed to create payment record: ${reason}`);
        await alertWebhookIssue({
            severity: 'warning',
            title: 'Payment record create failed',
            message: 'Webhook could not persist payment record in DB.',
            details: { requestId, eventId, sessionId: session.id },
        });
    }

    await applyCheckoutPromo({ requestId, eventId, session });

    if (checkoutType === 'chat_credit') {
        const chatCreditResult = await applyChatCreditCheckout({ requestId, eventId, session });
        if (!chatCreditResult.ok) return chatCreditResult;
    }

    if (!checkoutType || checkoutType === 'premium_reading') {
        await handlePremiumReadingCheckout({ requestId, eventId, session });
    }

    return unlockMatchSession({ requestId, eventId, session });
}
