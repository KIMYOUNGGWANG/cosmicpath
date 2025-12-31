/**
 * CosmicPath 결제 상품 설정
 */
export const READING_PRODUCT = {
    id: 'cosmicpath_reading_v1',
    name: 'CosmicPath 3원 통합 리딩',
    description: '사주 + 점성술 + 타로 통합 분석',
    price: 399, // cents ($3.99)
    currency: 'usd',
    followUpQuestions: 0,
} as const;

export const FOLLOW_UP_PRODUCT = {
    id: 'cosmicpath_followup_v1',
    name: '추가 질문권',
    description: '추가 질문 3회',
    price: 299, // cents ($2.99)
    currency: 'usd',
    followUpQuestions: 3,
} as const;

export type ProductType = typeof READING_PRODUCT | typeof FOLLOW_UP_PRODUCT;
