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
    productId: '', // TODO: 여기에 Stripe Dashboard의 Product ID를 입력해주세요.
    name: '운명의 가이드 추가 질문권',
    description: 'AI 설계자에게 물어보는 추가 질문 3회권',
    currency: 'USD',
    followUpQuestions: 3,
} as const;

export type ProductType = typeof READING_PRODUCT | typeof FOLLOW_UP_PRODUCT;
