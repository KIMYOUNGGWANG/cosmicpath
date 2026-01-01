/**
 * CosmicPath 결제 상품 설정 (Stripe 최적화)
 */
export const READING_PRODUCT = {
    id: 'cosmicpath_reading_v1',
    name: 'CosmicPath 통합 운명 리포트',
    description: '사주 + 점성술 + 타로 통합 분석 프리미엄 결과지',
    priceId: 'price_1Sktbb0RiEHwZwUJPItKYxpl', // Stripe Dashboard의 Price ID
    displayPrice: 399, // UI 표시용 ($3.99)
    currency: 'USD',
    followUpQuestions: 0,
} as const;

export const FOLLOW_UP_PRODUCT = {
    id: 'cosmicpath_followup_v1',
    name: '운명의 가이드 추가 질문권',
    description: 'AI 설계자에게 물어보는 추가 질문 3회권',
    priceId: '', // TODO: 여기에 Stripe Dashboard의 Price ID를 입력해주세요.
    displayPrice: 199, // UI 표시용 ($1.99)
    currency: 'USD',
    followUpQuestions: 3,
} as const;

export type ProductType = typeof READING_PRODUCT | typeof FOLLOW_UP_PRODUCT;
