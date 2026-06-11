import Stripe from 'stripe';
import { devLog } from '@/lib/dev-logger';
import { prisma } from '@/lib/prisma';
import {
    SUBSCRIPTION_PLAN_IDS,
    SUBSCRIPTION_PRICE_IDS,
    type SubscriptionPlanId,
} from '@/lib/payment/payment-config';

type StripeSubscriptionEventType =
    | 'customer.subscription.created'
    | 'customer.subscription.updated'
    | 'customer.subscription.deleted';

const ACTIVE_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>([
    'trialing',
    'active',
    'past_due',
]);

let userTableCache: 'User' | 'users' | null | undefined;
let subscriptionColumnsAvailableCache: boolean | undefined;

export function isStripeSubscriptionEventType(type: string): type is StripeSubscriptionEventType {
    return type === 'customer.subscription.created' ||
        type === 'customer.subscription.updated' ||
        type === 'customer.subscription.deleted';
}

function parsePlanId(raw: string | null | undefined): SubscriptionPlanId | null {
    if (!raw) return null;

    for (const planId of SUBSCRIPTION_PLAN_IDS) {
        if (planId === raw) return planId;
    }

    return null;
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

function toSubscriptionStatus(planId: SubscriptionPlanId | null): 'free' | 'pro' | 'couple' {
    if (!planId) return 'free';
    return planId === 'couple_monthly' ? 'couple' : 'pro';
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
    userTableCache = resolved === 'User' || resolved === 'users' ? resolved : null;

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
    readonly userId: string;
    readonly status: 'free' | 'pro' | 'couple';
    readonly expiresAt: string | null;
    readonly stripeCustomerId: string | null;
    readonly stripeSubscriptionId: string | null;
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

export async function handleSubscriptionEvent(
    eventType: StripeSubscriptionEventType,
    subscription: Stripe.Subscription
): Promise<void> {
    const planId = resolvePlanIdFromSubscription(subscription);
    const isActive = ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status);
    const stripeCustomerId = getCustomerIdFromSubscription(subscription);
    const userId = await resolveUserIdFromSubscription(subscription);
    const periodEnd = getSubscriptionPeriodEnd(subscription);

    if (!userId) {
        devLog.warn(
            `[Webhook] Subscription event skipped: user not resolved (${eventType}, subscriptionId=${subscription.id})`
        );
        return;
    }

    const status = isActive ? toSubscriptionStatus(planId) : 'free';
    const persisted = await updateSubscriptionState({
        userId,
        status,
        expiresAt: isActive && periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        stripeCustomerId,
        stripeSubscriptionId: eventType === 'customer.subscription.deleted' ? null : subscription.id,
    });

    if (!persisted) {
        devLog.warn(
            '[Webhook] Subscription columns are missing. Run migration before relying on DB subscription status.'
        );
        return;
    }

    devLog.log(`[Webhook] Subscription state synced (${eventType}) user=${userId} status=${status}`);
}
