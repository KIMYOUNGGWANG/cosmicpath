import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/payment/stripe';
import { devLog } from '@/lib/dev-logger';
import { handleCheckoutSessionCompleted } from '@/lib/payment/stripe-checkout-session';
import {
    handleSubscriptionEvent,
    isStripeSubscriptionEventType,
} from '@/lib/payment/stripe-subscription-sync';
import { alertWebhookIssue } from '@/lib/payment/stripe-webhook-alerts';
import { getErrorMessage } from '@/lib/payment/stripe-webhook-utils';

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
        const reason = error instanceof Error ? error.message : getErrorMessage(error);
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
            const result = await handleCheckoutSessionCompleted({
                requestId,
                eventId: event.id,
                eventType: event.type,
                session,
            });
            if (!result.ok) {
                return NextResponse.json({ error: result.error }, { status: result.status });
            }
        }

        if (isStripeSubscriptionEventType(event.type)) {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionEvent(event.type, subscription);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        const reason = error instanceof Error ? error.message : getErrorMessage(error);
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
