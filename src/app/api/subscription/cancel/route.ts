import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/payment/stripe';
import { devLog } from '@/lib/dev-logger';

const activeSubscriptionStatuses = new Set<Stripe.Subscription.Status>([
    'trialing',
    'active',
    'past_due',
]);

interface SubscriptionLookupInput {
    email: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
}

function errorResponse(code: number, message: string, details?: string) {
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

function isActiveSubscription(subscription: Stripe.Subscription | null): subscription is Stripe.Subscription {
    return !!subscription && activeSubscriptionStatuses.has(subscription.status);
}

function resolvePeriodEndTimestamp(subscription: Stripe.Subscription): number | null {
    const periodEnds = subscription.items.data
        .map((item) => item.current_period_end)
        .filter((value): value is number => typeof value === 'number');

    if (periodEnds.length === 0) return null;
    return Math.max(...periodEnds);
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription): string {
    const periodEnd = resolvePeriodEndTimestamp(subscription);
    return new Date((periodEnd ?? Date.now() / 1000) * 1000).toISOString();
}

async function findSubscriptionById(
    stripe: Stripe,
    stripeSubscriptionId: string | null
): Promise<Stripe.Subscription | null> {
    if (!stripeSubscriptionId) return null;

    try {
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        return isActiveSubscription(subscription) ? subscription : null;
    } catch (error) {
        devLog.error('[Stripe] Failed to retrieve subscription by id:', error);
        return null;
    }
}

async function findCustomerByEmail(stripe: Stripe, email: string | null): Promise<string | null> {
    if (!email) return null;

    const customers = await stripe.customers.list({
        email,
        limit: 1,
    });

    return customers.data[0]?.id ?? null;
}

async function findSubscriptionByCustomer(
    stripe: Stripe,
    stripeCustomerId: string | null
): Promise<Stripe.Subscription | null> {
    if (!stripeCustomerId) return null;

    const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
        limit: 20,
    });

    return subscriptions.data.find(isActiveSubscription) ?? null;
}

async function findActiveSubscription(
    stripe: Stripe,
    input: SubscriptionLookupInput
): Promise<{ stripeCustomerId: string | null; subscription: Stripe.Subscription | null }> {
    const subscriptionById = await findSubscriptionById(stripe, input.stripeSubscriptionId);
    if (subscriptionById) {
        const customerId =
            typeof subscriptionById.customer === 'string'
                ? subscriptionById.customer
                : subscriptionById.customer?.id ?? input.stripeCustomerId;

        return {
            stripeCustomerId: customerId,
            subscription: subscriptionById,
        };
    }

    const subscriptionByCustomer = await findSubscriptionByCustomer(stripe, input.stripeCustomerId);
    if (subscriptionByCustomer) {
        return {
            stripeCustomerId: input.stripeCustomerId,
            subscription: subscriptionByCustomer,
        };
    }

    const stripeCustomerId = await findCustomerByEmail(stripe, input.email);
    if (!stripeCustomerId) {
        return {
            stripeCustomerId: null,
            subscription: null,
        };
    }

    return {
        stripeCustomerId,
        subscription: await findSubscriptionByCustomer(stripe, stripeCustomerId),
    };
}

async function syncStripeIds(
    userId: string,
    stripeCustomerId: string | null,
    stripeSubscriptionId: string
) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            stripeCustomerId,
            stripeSubscriptionId,
        },
    });
}

export async function POST() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return errorResponse(401, '로그인이 필요합니다.');
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                stripeCustomerId: true,
                stripeSubscriptionId: true,
            },
        });

        if (!user) {
            return errorResponse(404, '사용자를 찾을 수 없습니다.');
        }

        const stripe = getStripe();
        const { stripeCustomerId, subscription } = await findActiveSubscription(stripe, user);

        if (!subscription) {
            return errorResponse(404, '활성 구독이 없습니다.');
        }

        if (subscription.cancel_at_period_end) {
            return NextResponse.json({
                ok: true,
                subscriptionId: subscription.id,
                cancelAtPeriodEnd: true,
                currentPeriodEnd: getCurrentPeriodEnd(subscription),
            });
        }

        const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: true,
        });

        await syncStripeIds(userId, stripeCustomerId, canceledSubscription.id);

        devLog.log(
            `[Stripe] Subscription ${canceledSubscription.id} set to cancel at period end for user ${userId}`
        );

        return NextResponse.json({
            ok: true,
            subscriptionId: canceledSubscription.id,
            cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
            currentPeriodEnd: getCurrentPeriodEnd(canceledSubscription),
        });
    } catch (error) {
        devLog.error('Error cancelling subscription:', error);
        const details = error instanceof Error ? error.message : '알 수 없는 오류';
        return errorResponse(500, '구독 해지 처리에 실패했습니다.', details);
    }
}
