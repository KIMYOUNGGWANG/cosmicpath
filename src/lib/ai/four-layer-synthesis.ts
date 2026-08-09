/**
 * 4원 통합 신호 합성 엔진 (Task 11)
 * 사주 (Structure) + 점성 (Timing) + 자미두수 (Destiny Architecture) + 타로 (Immediate Signal)
 */

import { THREE_LAYER_SOURCE_ROLES, type ThreeLayerConvergenceDiagnosis } from './three-layer-synthesis';

export const FOUR_LAYER_SOURCE_ROLES = {
  saju: THREE_LAYER_SOURCE_ROLES.saju,
  astrology: THREE_LAYER_SOURCE_ROLES.astrology,
  ziwei: {
    label: 'Ziwei Doushu',
    role: 'destiny architecture: 12-palace star map, SiHua dynamics, long-term life trajectory',
    failureMode: 'do not use it to replace Saju elements or invent non-existent star placements',
  },
  tarot: THREE_LAYER_SOURCE_ROLES.tarot,
} as const;

export type FourLayerConvergenceDiagnosis = ThreeLayerConvergenceDiagnosis & {
  readonly ziwei_signal?: string;
};

export function buildFourLayerSynthesisPrompt(language: 'ko' | 'en' = 'ko'): string {
  if (language === 'en') {
    return `
[4-LAYER DECISION SUPPORT ARCHITECTURE]
You are synthesizing four distinct metaphysical engines into one authoritative decision verdict:
1. SAJU (Structure): Durable baseline temperament & repeating energy cycles.
2. ASTROLOGY (Timing): Transits, aspects, natal houses, and current time release windows.
3. ZIWEI DOUSHU (Destiny Architecture): 12-Palace star map, 14 main stars, and SiHua (化祿/化權/化科/化忌) dynamics.
4. TAROT (Immediate Signal): Emotional weather, psychological triggers, and near-term action boundaries.

RULES FOR SYNTHESIS:
- Look for convergence across all 4 layers. When 3 or 4 layers align, increase verdict confidence.
- When layers diverge, explain how Ziwei architecture bounds the action while Astrology timing marks the execution window.
- Do not invent Saju, Astrology, or Ziwei facts not present in the provided JSON runtime.
`.trim();
  }

  return `
[4원 통합 운명 결정 지원 아키텍처]
당신은 4개의 독립적 명리학/점성 엔진을 융합하여 단 하나의 명확한 인생 결정 판정을 내립니다:
1. 사주(四柱) (기초 구조): 개인의 변하지 않는 타고난 기질과 오행의 억부/조후 균형.
2. 점성술(Astrology) (타이밍): 행성 애스펙트, 키론/노드 및 현재 활성화된 하우스 시기.
3. 자미두수(紫微斗數) (운명 청사진): 12궁 명반, 14주성 격국 및 사화(化祿/化權/化科/化忌) 길흉 구조.
4. 타로(Tarot) (즉각 신호): 심리적 상태, 근미래 위험 요소 및 구체적 실행 경계.

통합 원칙:
- 4원천 신호의 수렴(Convergence) 여부를 분석하세요. 3개 이상 수렴 시 판정 확신도를 높입니다.
- 충돌 발생 시, 자미두수의 명반 구조가 거대한 틀(경계)을 제공하고 점성술이 실행 타이밍을 결정함을 설명하세요.
- 데이터에 없는 사주/점성/자미두수 사실을 임의로 날조하지 마세요.
`.trim();
}
