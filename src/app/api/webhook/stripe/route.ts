import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/payment/stripe';
import { devLog } from '@/lib/dev-logger';

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
        const { type, readingId, credits } = session.metadata || {};

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
    }

    return NextResponse.json({ received: true });
}

