import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { stampRuntimeMetadata } from '@/lib/runtime-environment';
import { parseJsonObject } from '@/lib/payment/stripe-webhook-utils';

export async function mergePaymentMetadata(
    orderId: string,
    patch: Record<string, unknown>
): Promise<void> {
    const payment = await prisma.payment.findUnique({
        where: { orderId },
        select: { metadata: true },
    });

    await prisma.payment.update({
        where: { orderId },
        data: {
            metadata: JSON.stringify(stampRuntimeMetadata({
                ...parseJsonObject(payment?.metadata),
                ...patch,
            })),
        },
    });
}

export async function upsertCheckoutPaymentRecord(params: {
    readonly session: Stripe.Checkout.Session;
    readonly eventId: string;
    readonly eventType: string;
}): Promise<void> {
    const { session, eventId, eventType } = params;
    const metadataPatch = {
        ...(session.metadata || {}),
        webhookEventId: eventId,
        webhookEventType: eventType,
        webhookProcessedAt: new Date().toISOString(),
    };
    const existingPayment = await prisma.payment.findUnique({
        where: { orderId: session.id },
        select: { metadata: true },
    });
    const mergedMetadata = stampRuntimeMetadata({
        ...parseJsonObject(existingPayment?.metadata),
        ...metadataPatch,
    });

    await prisma.payment.upsert({
        where: { orderId: session.id },
        create: {
            orderId: session.id,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'DONE',
            method: 'STRIPE',
            receiptUrl: session.url || null,
            customerEmail: session.metadata?.email || session.customer_details?.email || '',
            readingId: session.metadata?.readingId || null,
            metadata: JSON.stringify(mergedMetadata),
        },
        update: {
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'DONE',
            method: 'STRIPE',
            receiptUrl: session.url || null,
            customerEmail: session.metadata?.email || session.customer_details?.email || '',
            readingId: session.metadata?.readingId || null,
            metadata: JSON.stringify(mergedMetadata),
        },
    });
}
