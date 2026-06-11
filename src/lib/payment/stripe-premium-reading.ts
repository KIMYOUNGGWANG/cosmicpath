import Stripe from 'stripe';
import { devLog } from '@/lib/dev-logger';
import { sendResultEmail } from '@/lib/email/sender';
import { scheduleDefaultFollowUps } from '@/lib/followup-jobs';
import { prisma } from '@/lib/prisma';
import { extractReadingAccessKey } from '@/lib/reading-access';
import { stampRuntimeMetadata } from '@/lib/runtime-environment';
import { mergePaymentMetadata } from '@/lib/payment/stripe-payment-metadata';
import { alertWebhookIssue } from '@/lib/payment/stripe-webhook-alerts';
import { optionalString, parseJsonObject } from '@/lib/payment/stripe-webhook-utils';

async function markReadingPremium(params: {
    readonly requestId: string;
    readonly eventId: string;
    readonly readingId: string;
    readonly customerEmail?: string;
}): Promise<void> {
    const { requestId, eventId, readingId, customerEmail } = params;

    try {
        const reading = await prisma.readingResult.findUnique({
            where: { id: readingId },
        });

        if (!reading) {
            await alertWebhookIssue({
                severity: 'warning',
                title: 'Premium reading not found',
                message: 'Webhook received a premium payment but the target reading was missing.',
                details: { requestId, eventId, readingId },
            });
            return;
        }

        const savedMeta = parseJsonObject(reading.metadata);
        if (!savedMeta.isPremium) {
            await prisma.readingResult.update({
                where: { id: readingId },
                data: {
                    metadata: JSON.stringify(stampRuntimeMetadata({
                        ...savedMeta,
                        isPremium: true,
                        paymentVerifiedAt: new Date().toISOString(),
                        paymentSource: 'stripe_webhook',
                        email: customerEmail || optionalString(savedMeta.email) || '',
                    })),
                },
            });
        }
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        devLog.error('[Webhook] Failed to mark reading as premium:', reason);
        await alertWebhookIssue({
            severity: 'critical',
            title: 'Premium reading status update failed',
            message: 'Webhook failed while marking reading result as premium.',
            details: { requestId, eventId, readingId, error: reason.slice(0, 300) },
        });
    }
}

async function sendPremiumReadingEmail(params: {
    readonly eventId: string;
    readonly requestId: string;
    readonly sessionId: string;
    readonly readingId: string;
    readonly customerEmail: string;
}): Promise<void> {
    const { eventId, requestId, sessionId, readingId, customerEmail } = params;

    try {
        const user = await prisma.user.findUnique({ where: { email: customerEmail } });
        const reading = await prisma.readingResult.findUnique({ where: { id: readingId } });

        if (!reading) {
            devLog.warn(`[Webhook] Reading not found in DB: ${readingId}`);
            return;
        }

        const savedMeta = parseJsonObject(reading.metadata);
        const accessKey = extractReadingAccessKey(reading.metadata);
        if (savedMeta.emailSent) {
            devLog.log(`[Webhook] Email already sent for ${readingId}, skipping`);
            return;
        }

        const language = savedMeta.language === 'en' ? 'en' : 'ko';
        await sendResultEmail({
            email: customerEmail,
            resultId: readingId,
            language,
            title: optionalString(savedMeta.userContext) || (language === 'en' ? 'Your reading' : '통합 분석 리포트'),
            birthInfo: optionalString(savedMeta.birthInfo),
            sajuSummary: optionalString(savedMeta.sajuSummary),
            userContext: optionalString(savedMeta.userContext),
            accessKey: accessKey ?? undefined,
        });

        await prisma.readingResult.update({
            where: { id: readingId },
            data: {
                metadata: JSON.stringify(stampRuntimeMetadata({
                    ...savedMeta,
                    isPremium: true,
                    email: customerEmail,
                    emailSent: true,
                    emailSentVia: 'webhook',
                })),
                ...(user && !reading.userId ? { userId: user.id } : {}),
            },
        });

        devLog.log(`[Webhook] Email sent successfully to ${customerEmail}. User linked: ${Boolean(user)}`);
        await mergePaymentMetadata(sessionId, {
            premiumEmailSentAt: new Date().toISOString(),
        });
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        devLog.error('[Webhook] Email sending failed:', reason);
        await alertWebhookIssue({
            severity: 'warning',
            title: 'Premium email post-processing failed',
            message: 'Webhook completed payment but failed in premium email post-processing.',
            details: { requestId, eventId, readingId, error: reason.slice(0, 300) },
        });
    }
}

async function schedulePremiumFollowUps(params: {
    readonly eventId: string;
    readonly requestId: string;
    readonly session: Stripe.Checkout.Session;
    readonly readingId: string;
    readonly customerEmail: string;
}): Promise<void> {
    const { eventId, requestId, session, readingId, customerEmail } = params;

    try {
        await scheduleDefaultFollowUps({
            readingId,
            email: customerEmail,
            source: session.metadata?.source || 'stripe_webhook',
        });
        await mergePaymentMetadata(session.id, {
            followUpsScheduledAt: new Date().toISOString(),
        });
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        devLog.error('[Webhook] Failed to schedule follow-up jobs:', reason);
        await alertWebhookIssue({
            severity: 'warning',
            title: 'Follow-up schedule failed',
            message: 'Payment completed but follow-up jobs could not be scheduled.',
            details: { requestId, eventId, readingId, error: reason.slice(0, 300) },
        });
    }
}

export async function handlePremiumReadingCheckout(params: {
    readonly eventId: string;
    readonly requestId: string;
    readonly session: Stripe.Checkout.Session;
}): Promise<void> {
    const { eventId, requestId, session } = params;
    const readingId = session.metadata?.readingId;
    const customerEmail = session.metadata?.email || session.customer_email || undefined;

    if (!readingId) {
        devLog.warn('[Webhook] Missing readingId for premium reading checkout session');
        await alertWebhookIssue({
            severity: 'warning',
            title: 'Premium payment missing readingId',
            message: 'Premium reading checkout completed without readingId metadata.',
            details: { requestId, eventId, sessionId: session.id },
        });
    } else {
        await markReadingPremium({ requestId, eventId, readingId, customerEmail });
    }

    if (customerEmail && readingId) {
        devLog.log(`[Webhook] Premium reading payment completed. Email: ${customerEmail}, ReadingID: ${readingId}`);
        await sendPremiumReadingEmail({ requestId, eventId, sessionId: session.id, readingId, customerEmail });
        await schedulePremiumFollowUps({ requestId, eventId, session, readingId, customerEmail });
        return;
    }

    devLog.warn(`[Webhook] Missing email or readingId for premium reading. Email: ${customerEmail}, ReadingID: ${readingId}`);
    await alertWebhookIssue({
        severity: 'warning',
        title: 'Premium payment metadata incomplete',
        message: 'Premium reading checkout completed without full metadata required for email/follow-up.',
        details: {
            requestId,
            eventId,
            sessionId: session.id,
            readingId: readingId || null,
            customerEmail: customerEmail || null,
        },
    });
}
