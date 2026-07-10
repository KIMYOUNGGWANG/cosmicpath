/**
 * Decision Note 결제 상품 설정 (Stripe 최적화)
 */
import { PAID_DECISION_REPORT_NAME_EN, READING_PRODUCT_PRICE_CENTS } from '@/lib/product-positioning';

function hasRealStripeLookupId(value: string | undefined, type: 'prod' | 'price'): boolean {
    if (!value) return false;

    const trimmed = value.trim();
    const pattern = type === 'prod' ? /^prod_[A-Za-z0-9]+$/ : /^price_[A-Za-z0-9]+$/;

    return pattern.test(trimmed) && !/(test|live|tbd)/i.test(trimmed);
}

function resolveStripeLookupId(value: string | undefined, fallback: string, type: 'prod' | 'price'): string {
    const trimmed = value?.trim();
    return trimmed && hasRealStripeLookupId(trimmed, type) ? trimmed : fallback;
}

const readingProductId = process.env.NODE_ENV === 'development'
    ? resolveStripeLookupId(process.env.NEXT_PUBLIC_STRIPE_READING_PRODUCT_ID_TEST, 'prod_TgwKnGfpJBusty', 'prod')
    : resolveStripeLookupId(process.env.NEXT_PUBLIC_STRIPE_READING_PRODUCT_ID, 'prod_ThdoB65NmPU37y', 'prod');

export const READING_PRODUCT = {
    id: 'cosmicpath_reading_v1',
    // Live 모드 전환 시 .env 에 NEXT_PUBLIC_STRIPE_READING_PRODUCT_ID 를 설정해주세요.
    // 개발 모드에서는 테스트용 ID를 우선 사용합니다.
    productId: readingProductId,
    name: PAID_DECISION_REPORT_NAME_EN,
    description: '7-day decision packet unlock',
    currency: 'USD',
    price: READING_PRODUCT_PRICE_CENTS,
    followUpQuestions: 0,
    stripeConfigured: hasRealStripeLookupId(readingProductId, 'prod'),
} as const;

const followUpProductId = process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_STRIPE_FOLLOWUP_PRODUCT_ID_TEST || 'prod_TestFollowUpId')
    : (process.env.NEXT_PUBLIC_STRIPE_FOLLOWUP_PRODUCT_ID || 'prod_LiveFollowUpId');

export const FOLLOW_UP_PRODUCT = {
    id: 'cosmicpath_followup_v1',
    productId: followUpProductId,
    name: 'Decision Chat Additional Credit',
    description: '1 Additional Question for Decision Chat',
    currency: 'USD',
    followUpQuestions: 1,
    stripeConfigured: hasRealStripeLookupId(followUpProductId, 'prod'),
} as const;

// Chat Credit Products (Upsell Options)
const chatCreditSingleProductId = process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_STRIPE_CREDIT_SINGLE_ID_TEST || 'prod_TestCreditSingle')
    : (process.env.NEXT_PUBLIC_STRIPE_CREDIT_SINGLE_ID || 'prod_LiveCreditSingle');

export const CHAT_CREDIT_SINGLE = {
    id: 'cosmicpath_credit_single',
    productId: chatCreditSingleProductId,
    name: '질문권 1회',
    description: 'Decision Chat 1 Question',
    price: 199, // $1.99 in cents
    credits: 1,
    stripeConfigured: hasRealStripeLookupId(chatCreditSingleProductId, 'prod'),
} as const;

const chatCreditPackProductId = process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_STRIPE_CREDIT_PACK_ID_TEST || 'prod_TestCreditPack')
    : (process.env.NEXT_PUBLIC_STRIPE_CREDIT_PACK_ID || 'prod_LiveCreditPack');

export const CHAT_CREDIT_PACK = {
    id: 'cosmicpath_credit_pack',
    productId: chatCreditPackProductId,
    name: '질문권 3회 패키지',
    description: 'Decision Chat 3 Questions (33% OFF)',
    price: 399, // $3.99 in cents
    credits: 3,
    stripeConfigured: hasRealStripeLookupId(chatCreditPackProductId, 'prod'),
} as const;

const matchProductId = process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_STRIPE_MATCH_PRODUCT_ID_TEST || 'prod_TestMatchId')
    : (process.env.NEXT_PUBLIC_STRIPE_MATCH_PRODUCT_ID || 'prod_LiveMatchId');

export const MATCH_PRODUCT = {
    id: 'cosmicpath_match_v1',
    productId: matchProductId,
    name: 'Compatibility Decision Note',
    description: '사주 + 점성술 기반 상세 궁합 결정 정리',
    currency: 'USD',
    price: 799, // $7.99 in cents
    stripeConfigured: hasRealStripeLookupId(matchProductId, 'prod'),
} as const;

export const SUBSCRIPTION_PLAN_IDS = ['pro_weekly', 'pro_monthly', 'pro_yearly', 'couple_monthly'] as const;
export type SubscriptionPlanId = (typeof SUBSCRIPTION_PLAN_IDS)[number];
export const SUBSCRIPTION_PLAN_TYPES = ['WEEKLY', 'MONTHLY', 'ANNUAL'] as const;
export type SubscriptionPlanType = (typeof SUBSCRIPTION_PLAN_TYPES)[number];
export type ConsumerSubscriptionPlanType = Extract<SubscriptionPlanType, 'MONTHLY' | 'ANNUAL'>;

export const SUBSCRIPTION_FALLBACK_AMOUNTS = {
    MONTHLY: 9.99,
    ANNUAL: 49.99,
} as const satisfies Record<ConsumerSubscriptionPlanType, number>;

const subscriptionPriceIds = {
    pro_weekly: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_WEEKLY_TEST || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_WEEKLY || 'price_pro_weekly_TBD')
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_WEEKLY || 'price_pro_weekly_TBD'),
    pro_monthly: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY_TEST || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_1T7Ken0RiEHwZwUJ9BYSpD74')
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_1T7Ken0RiEHwZwUJ9BYSpD74'),
    pro_yearly: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY_TEST || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_1T7Ken0RiEHwZwUJydDuq9Tq')
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_1T7Ken0RiEHwZwUJydDuq9Tq'),
    couple_monthly: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLE_MONTHLY_TEST || process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLE_MONTHLY || 'price_1T7Keo0RiEHwZwUJVtCaF6Nn')
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLE_MONTHLY || 'price_1T7Keo0RiEHwZwUJVtCaF6Nn'),
} as const satisfies Record<SubscriptionPlanId, string>;

export const SUBSCRIPTION_PRICE_IDS = subscriptionPriceIds;

export const SUBSCRIPTION_PRICE_CONFIGURED = {
    pro_weekly: hasRealStripeLookupId(subscriptionPriceIds.pro_weekly, 'price'),
    pro_monthly: hasRealStripeLookupId(subscriptionPriceIds.pro_monthly, 'price'),
    pro_yearly: hasRealStripeLookupId(subscriptionPriceIds.pro_yearly, 'price'),
    couple_monthly: hasRealStripeLookupId(subscriptionPriceIds.couple_monthly, 'price'),
} as const satisfies Record<SubscriptionPlanId, boolean>;

export const SUBSCRIPTION_CHECKOUT_PLAN_MAP = {
    WEEKLY: 'pro_weekly',
    MONTHLY: 'pro_monthly',
    ANNUAL: 'pro_yearly',
} as const satisfies Record<SubscriptionPlanType, SubscriptionPlanId>;

export const SUBSCRIPTION_CHECKOUT_PRICE_IDS = {
    WEEKLY: SUBSCRIPTION_PRICE_IDS.pro_weekly,
    MONTHLY: SUBSCRIPTION_PRICE_IDS.pro_monthly,
    ANNUAL: SUBSCRIPTION_PRICE_IDS.pro_yearly,
} as const satisfies Record<SubscriptionPlanType, string>;

export function getSubscriptionPriceId(planId: SubscriptionPlanId): string {
    return SUBSCRIPTION_PRICE_IDS[planId];
}

export function getSubscriptionPriceIdForPlanType(planType: SubscriptionPlanType): string {
    return SUBSCRIPTION_CHECKOUT_PRICE_IDS[planType];
}

export function formatUsdAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

export function formatUsdFromCents(cents: number): string {
    return formatUsdAmount(cents / 100);
}

export function normalizePriceLabel(value?: string | null): string | null {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    return trimmed && trimmed !== '...' ? trimmed : null;
}

export function getReadingFallbackPriceLabel(): string {
    return formatUsdFromCents(READING_PRODUCT.price);
}

export function getSubscriptionFallbackPriceLabel(planType: ConsumerSubscriptionPlanType): string {
    return formatUsdAmount(SUBSCRIPTION_FALLBACK_AMOUNTS[planType]);
}

export type ProductType = typeof READING_PRODUCT | typeof FOLLOW_UP_PRODUCT | typeof MATCH_PRODUCT;

/**
 * 서버 사이드 productId 허용 목록.
 * payment/route.ts에서 클라이언트 요청의 productId를 검증하는 데 사용.
 * 허용 목록 외의 productId로는 체크아웃 세션을 생성할 수 없음.
 */
export function getAllowedProductIds(): Set<string> {
    return new Set([
        READING_PRODUCT.productId,
        FOLLOW_UP_PRODUCT.productId,
        CHAT_CREDIT_SINGLE.productId,
        CHAT_CREDIT_PACK.productId,
        MATCH_PRODUCT.productId,
    ].filter(Boolean));
}

export function isProductAllowed(productId: string | null | undefined): boolean {
    if (!productId) return false;
    const trimmed = productId.trim();
    if (!trimmed) return false;
    return getAllowedProductIds().has(trimmed);
}
