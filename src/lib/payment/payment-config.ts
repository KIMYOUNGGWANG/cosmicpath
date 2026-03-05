/**
 * CosmicPath 결제 상품 설정 (Stripe 최적화)
 */
export const READING_PRODUCT = {
    id: 'cosmicpath_reading_v1',
    // Live 모드 전환 시 .env 에 NEXT_PUBLIC_STRIPE_READING_PRODUCT_ID 를 설정해주세요.
    // 개발 모드에서는 테스트용 ID를 우선 사용합니다.
    productId: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_READING_PRODUCT_ID_TEST || 'prod_TgwKnGfpJBusty')
        : (process.env.NEXT_PUBLIC_STRIPE_READING_PRODUCT_ID || 'prod_ThdoB65NmPU37y'),
    name: 'CosmicPath 통합 운명 리포트',
    description: '사주 + 점성술 + 타로 통합 분석 프리미엄 결과지',
    currency: 'USD',
    followUpQuestions: 0,
} as const;

export const FOLLOW_UP_PRODUCT = {
    id: 'cosmicpath_followup_v1',
    productId: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_FOLLOWUP_PRODUCT_ID_TEST || 'prod_TestFollowUpId')
        : (process.env.NEXT_PUBLIC_STRIPE_FOLLOWUP_PRODUCT_ID || 'prod_LiveFollowUpId'),
    name: 'Oracle Chat Additional Credit',
    description: '1 Additional Question for Oracle Chat',
    currency: 'USD',
    followUpQuestions: 1,
} as const;

// Chat Credit Products (Upsell Options)
export const CHAT_CREDIT_SINGLE = {
    id: 'cosmicpath_credit_single',
    productId: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_CREDIT_SINGLE_ID_TEST || 'prod_TestCreditSingle')
        : (process.env.NEXT_PUBLIC_STRIPE_CREDIT_SINGLE_ID || 'prod_LiveCreditSingle'),
    name: '질문권 1회',
    description: 'Oracle Chat 1 Question',
    price: 100, // $1.00 in cents
    credits: 1,
} as const;

export const CHAT_CREDIT_PACK = {
    id: 'cosmicpath_credit_pack',
    productId: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_CREDIT_PACK_ID_TEST || 'prod_TestCreditPack')
        : (process.env.NEXT_PUBLIC_STRIPE_CREDIT_PACK_ID || 'prod_LiveCreditPack'),
    name: '질문권 3회 패키지',
    description: 'Oracle Chat 3 Questions (33% OFF)',
    price: 199, // $1.99 in cents
    credits: 3,
} as const;

export const MATCH_PRODUCT = {
    id: 'cosmicpath_match_v1',
    productId: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_MATCH_PRODUCT_ID_TEST || 'prod_TestMatchId')
        : (process.env.NEXT_PUBLIC_STRIPE_MATCH_PRODUCT_ID || 'prod_LiveMatchId'),
    name: 'Cosmic Compatibility Full Report',
    description: '사주 + 점성술 기반 상세 궁합 분석 리포트',
    currency: 'USD',
    price: 299, // $2.99 in cents
} as const;

export const SUBSCRIPTION_PLAN_IDS = ['pro_monthly', 'pro_yearly', 'couple_monthly'] as const;
export type SubscriptionPlanId = (typeof SUBSCRIPTION_PLAN_IDS)[number];

export const SUBSCRIPTION_PRICE_IDS = {
    pro_monthly: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY_TEST || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_TBD')
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_TBD'),
    pro_yearly: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY_TEST || process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly_TBD')
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly_TBD'),
    couple_monthly: process.env.NODE_ENV === 'development'
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLE_MONTHLY_TEST || process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLE_MONTHLY || 'price_couple_monthly_TBD')
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_COUPLE_MONTHLY || 'price_couple_monthly_TBD'),
} as const satisfies Record<SubscriptionPlanId, string>;

export function getSubscriptionPriceId(planId: SubscriptionPlanId): string {
    return SUBSCRIPTION_PRICE_IDS[planId];
}

export type ProductType = typeof READING_PRODUCT | typeof FOLLOW_UP_PRODUCT | typeof MATCH_PRODUCT;
