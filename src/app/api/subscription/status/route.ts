import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/payment/stripe';
import {
    SUBSCRIPTION_PLAN_IDS,
    SUBSCRIPTION_PRICE_IDS,
    type SubscriptionPlanId,
} from '@/lib/payment/payment-config';

const subscriptionPlanSchema = z.enum(SUBSCRIPTION_PLAN_IDS);
const activeSubscriptionStatuses = new Set<Stripe.Subscription.Status>([
    'trialing',
    'active',
    'past_due',
]);

function errorResponse(
    code: number,
    message: string,
    details?: string
) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
                ...(details ? { details } : {}),
            },
        },
        { status: code }
    );
}

function parsePlanId(raw: string | null | undefined): SubscriptionPlanId | null {
    if (!raw) return null;
    const parsed = subscriptionPlanSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
}

function resolvePlanIdFromSubscription(
    subscription: Stripe.Subscription
): SubscriptionPlanId | null {
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

function toTierStatus(planId: SubscriptionPlanId | null): 'free' | 'pro' | 'couple' {
    if (!planId) return 'free';
    return planId === 'couple_monthly' ? 'couple' : 'pro';
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): number | null {
    const periodEnds = subscription.items.data
        .map((item) => item.current_period_end)
        .filter((value): value is number => typeof value === 'number');

    if (periodEnds.length === 0) return null;
    return Math.max(...periodEnds);
}

export async function GET() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return errorResponse(401, 'Unauthorized');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true },
    });

    if (!user) {
        return errorResponse(404, 'User not found');
    }

    if (!user.email) {
        return NextResponse.json({
            status: 'free',
            expiresAt: null,
            stripeCustomerId: null,
            plan: null,
        });
    }

    try {
        const stripe = getStripe();
        const customers = await stripe.customers.list({
            email: user.email,
            limit: 1,
        });

        const customer = customers.data[0];
        if (!customer) {
            return NextResponse.json({
                status: 'free',
                expiresAt: null,
                stripeCustomerId: null,
                plan: null,
            });
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'all',
            limit: 20,
        });

        const activeSubscription = subscriptions.data.find((subscription) =>
            activeSubscriptionStatuses.has(subscription.status)
        );

        const planId = activeSubscription
            ? resolvePlanIdFromSubscription(activeSubscription)
            : null;
        const periodEnd = activeSubscription
            ? getSubscriptionPeriodEnd(activeSubscription)
            : null;

        return NextResponse.json({
            status: toTierStatus(planId),
            expiresAt: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            stripeCustomerId: customer.id,
            plan: planId,
        });
    } catch (error) {
        const details = error instanceof Error ? error.message : 'Unknown error';
        return errorResponse(500, 'Server Error', details);
    }
}
