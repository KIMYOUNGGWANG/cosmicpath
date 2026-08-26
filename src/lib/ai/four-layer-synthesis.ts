/**
 * 4원 통합 신호 합성 엔진 (Task 11)
 * 사주 (Structure) + 점성 (Timing) + 자미두수 (Destiny Architecture) + 타로 (Immediate Signal)
 */

import { THREE_LAYER_SOURCE_ROLES, type ThreeLayerConvergenceDiagnosis } from './three-layer-synthesis';

export const FOUR_LAYER_SOURCE_ROLES = {
  saju: THREE_LAYER_SOURCE_ROLES.saju,
  astrology: THREE_LAYER_SOURCE_ROLES.astrology,
  ziwei: THREE_LAYER_SOURCE_ROLES.ziwei,
  thaiAstrology: {
    label: 'Thai Astrology (โหราศาสตร์ไทย)',
    role: 'past pivot verification, Lagna/Karmic axis (Rahu-Ketu), and mature life alignment',
    failureMode: 'do not make deterministic fatalistic claims without action boundaries',
  },
} as const;

export type FourLayerConvergenceDiagnosis = ThreeLayerConvergenceDiagnosis & {
  readonly ziwei_signal?: string;
  readonly thai_astrology_insight?: string;
};

export function buildFourLayerSynthesisPrompt(language: 'ko' | 'en' = 'ko'): string {
  if (language === 'en') {
    return `
[4-ENGINE COMPREHENSIVE DECISION ARCHITECTURE]
You are synthesizing four distinct Eastern and Western metaphysical engines into one authoritative, psychologically profound decision verdict:
1. SAJU (Structure): Durable baseline temperament, five-element balance, and 10-year major luck cycles.
2. WESTERN ASTROLOGY (Timing): Transits, aspects, natal houses, and active time release windows.
3. ZIWEI DOUSHU (Destiny Architecture): 12-Palace star map, 14 main stars, and SiHua (化祿/化權/化科/化忌) dynamics.
4. THAI TRADITIONAL ASTROLOGY (Past Verification & Karmic Mastery): Past pivotal life turning points, Lagna (ลัคนา) essence, and how to maturely master this chart to transcend repetitive cycles.

SYNTHESIS & RESONANCE RULES:
- Lead with an astonishingly accurate psychological scan of the user's unspoken inner reality and perfectionist bottlenecks.
- Cite specific past life pivots (last 2-3 years or major transition windows) to build undeniable credibility.
- Cross-validate across all 4 layers for convergence and golden timing milestones.
- Explain in vivid, accessible everyday language with zero dry jargon dumping.
`.trim();
  }

  return `
[동서양 4대 정통 학문 융합 운명 결정 아키텍처]
당신은 4개의 정통 명리학/점성술 체계를 융합하여 단 하나의 소름 돋는 심리 적중과 명쾌한 인생 전략 판정을 내립니다:
1. 사주명리학(四柱) (기초 구조): 타고난 오행 기질, 내면의 무의식적 습관, 10년 대운의 거대한 파도.
2. 서양 점성술(Astrology) (타이밍): 현재 행성 트랜짓, 애스펙트, 압력이 집중되는 하우스와 골든타임.
3. 자미두수(紫微斗數) (운명 청사진): 12궁 명반, 14주성 격국 및 사화(祿權科忌)를 통한 인생 그릇과 기회의 방향성.
4. 태국 전통 점성학(Thai Astrology / โหราศาสตร์ไทย) (과거 변곡점 검증 & 카르마 성숙 가이드): 과거 겪었던 주요 인생 전환점(진로/관계/멘탈) 역추적 적중, 라그나(ลัคนา)의 본질, 그리고 "이 차트를 가장 성숙하게 다루어 반복되는 굴레를 끊는 방법".

융합 및 서술 원칙:
- [1단계: 내면 투시]: 겉모습 뒤에 숨겨진 완벽주의, 고립감, 불안, 질문 뒤의 진짜 속마음을 2문장으로 먼저 정확히 팩트 폭격하여 "어떻게 알았지?"라는 전율을 줄 것.
- [2단계: 과거 변곡점 적중]: 최근 1~3년 사이 겪었을 인생의 큰 고비나 방향 전환을 사주/점성/태국 점성학 주기로 짚어주어 자책감을 해소시킬 것.
- [3단계: 골든타임 & 실전 액션]: 언제 풀리는지(월/주 단위)와 지금 당장 취해야 할 명쾌한 실전 행동 매뉴얼 제시.
- 사전식 한자어나 뜬구름 잡는 위로 전면 금지. 100% 현대인의 직장/연애/돈/심리 일상 언어로 번역할 것.
`.trim();
}
