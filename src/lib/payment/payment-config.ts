/**
 * CosmicPath 결제 상품 설정 (Stripe 최적화)
 */
export const READING_PRODUCT = {
    id: 'cosmicpath_reading_v1',
    name: 'CosmicPath 통합 운명 리포트',
    description: '사주 + 점성술 + 타로 통합 분석 프리미엄 결과지',
    price: 399, // $3.99 (Stripe cents unit)
    currency: 'USD',
    followUpQuestions: 0,
} as const;

export const FOLLOW_UP_PRODUCT = {
    id: 'cosmicpath_followup_v1',
    name: '운명의 가이드 추가 질문권',
    description: 'AI 설계자에게 물어보는 추가 질문 3회권',
    price: 199, // $1.99 (Stripe cents unit)
    currency: 'USD',
    followUpQuestions: 3,
} as const;

export type ProductType = typeof READING_PRODUCT | typeof FOLLOW_UP_PRODUCT;
