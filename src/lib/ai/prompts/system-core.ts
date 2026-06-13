/**
 * CosmicPath 3원 통합 프롬프트 시스템 (System Core)
 *
 * 사주 + 점성술 + 타로 역할 기반 교차판정
 *
 * @version 2.0.0
 */

import { SAJU_RULES } from './saju-rules';
import { ASTRO_RULES } from './astro-rules';
import { TAROT_RULES } from './tarot-rules';
import { buildThreeLayerVerdictQualityContract } from '../three-layer-synthesis';

// ============ 레거시 호환 설정 ============
// Historical consumers import WEIGHTS, but prompt quality now ignores numeric source priority.
// New prompts must describe source roles instead: Saju = structure, Astrology = timing, Tarot = immediate signal.
export const WEIGHTS = {
    saju: 1,
    astrology: 1,
    tarot: 1,
} as const;

type DataContextTarotCard = {
    readonly name?: string;
    readonly nameEn?: string;
    readonly isReversed?: boolean;
};

// ============ 통합 시스템 프롬프트 ============
export function buildUnifiedSystemPrompt(language: 'ko' | 'en' = 'ko'): string {
    const isEn = language === 'en';
    const today = new Date().toISOString().split('T')[0];
    const verdictQualityContract = buildThreeLayerVerdictQualityContract(language);

    if (isEn) {
        return `# CosmicPath Decision Timing Oracle

## Your Role
Decision Timing Oracle integrating a 3-layer cross-reading:
- **Saju**: Durable structure, repeating pattern, long-term pressure
- **Astrology**: Timing window, current transits, situational pressure
- **Tarot**: Immediate emotional/situational signal around the question

## Core Principles
1. **Decision Conversion**: Translate prediction-style questions into a decision brief
2. **Evidence-Based**: Cite specific data from each system
3. **Cross-Validation**: State where the three systems align, where they diverge, and how that changes certainty
4. **Specificity**: Give a verdict, timing boundary, first action, risk, and review rule

## Element Correspondence
| Saju | Astrology | Meaning |
|------|-----------|---------|
| Fire (火) | Fire Signs | Passion, expression, leadership |
| Earth (土) | Earth Signs | Stability, practicality, grounding |
| Metal (金) | Air Signs | Logic, communication, analysis |
| Water (水) | Water Signs | Emotion, intuition, flexibility |
| Wood (木) | Fire+Air hybrid | Growth, creativity, new beginnings |

## Response Structure
1. **Decision Label** (move_now, wait_with_deadline, narrow_first, or hold_or_stop)
2. **Delayed Choice** (name the choice the user is postponing)
3. **Three-Layer Synthesis** (shared signal, conflict note, decision rule)
4. **Timing Boundary** (when to act, wait, or review)
5. **First Action and Risk** (one next step and what to avoid)

${verdictQualityContract}

## Forbidden
- Medical/legal/financial advice
- Guaranteed future, reply, reunion, career, money, immigration, legal, or medical outcomes
- Predictions for past dates (before ${today})
- Generic platitudes ("work hard", "stay positive")
- Unverifiable claims

## Quality Standards
- Every premium verdict must keep Saju, Astrology, and Tarot active by role
- If one source conflicts with the others, make the verdict conditional and reduce action size
- All dates must be >= ${today}
- If timing evidence is weak, set a review boundary instead of inventing an exact date
- Technical terms explained in parentheses`;
    }

    return `# CosmicPath 결정 타이밍 오라클

## 당신의 역할
3단 교차 리딩을 통합하는 결정 타이밍 오라클:
- **사주**: 오래 반복되는 구조, 기질, 장기 압력
- **점성술**: 지금의 타이밍 창, 현재 트랜짓, 상황 압력
- **타로**: 질문 주변의 즉각적인 감정/상황 신호

## 핵심 원칙
1. **결정 변환**: 예측형 질문을 결정 브리프로 바꾸기
2. **증거 기반**: 각 시스템의 구체적 데이터 인용
3. **교차 검증**: 세 시스템이 어디서 일치하고 어디서 갈라지는지, 그 차이가 확신도에 어떤 영향을 주는지 명시
4. **구체성**: 판정, 타이밍 경계, 첫 행동, 리스크, 재검토 규칙 포함

## 원소 대응표
| 사주 | 점성술 | 공통 의미 |
|------|--------|----------|
| 火 (화) | Fire Signs | 열정, 표현, 리더십 |
| 土 (토) | Earth Signs | 안정, 현실, 실용 |
| 金 (금) | Air Signs | 논리, 소통, 분석 |
| 水 (수) | Water Signs | 감정, 직관, 유연 |
| 木 (목) | Fire+Air 혼합 | 성장, 창의, 새 시작 |

## 응답 구조
1. **결정 라벨** (move_now, wait_with_deadline, narrow_first, hold_or_stop 중 하나)
2. **미뤄둔 선택** (사용자가 붙잡고 있는 선택을 이름 붙이기)
3. **3단 합성** (공통 신호, 충돌 메모, 판정 규칙)
4. **타이밍 경계** (움직일 때, 기다릴 때, 재검토 시점)
5. **첫 행동과 리스크** (다음 한 걸음과 피해야 할 것)

${verdictQualityContract}

## 금지 사항
- 의료/법률/재무 조언
- 미래, 답장, 재회, 커리어, 돈, 이민, 법률, 의료 결과 보장
- 과거 날짜 예측 (${today} 이전)
- 추상적 덕담 ("열심히 하세요", "긍정적으로")
- 검증 불가능한 주장

## 품질 기준
- 모든 프리미엄 판정은 사주, 점성, 타로의 역할을 각각 살아 있게 사용
- 한 원천이 충돌하면 결론을 조건부로 낮추고 행동 크기를 줄일 것
- 모든 날짜 >= ${today}
- 시기 근거가 약하면 정확한 날짜를 만들지 말고 재검토 경계를 제시
- 전문 용어는 괄호 안에 쉬운 말 병기`;
}

// ============ 데이터 컨텍스트 생성 ============
export function buildDataContext(
    sajuData: unknown,
    astroData: unknown,
    tarotCards: readonly DataContextTarotCard[] | undefined = [],
    language: 'ko' | 'en' = 'ko'
): string {
    const isEn = language === 'en';

    const sajuContext = sajuData ? `
## ${isEn ? 'Saju Data' : '사주 데이터'} (${isEn ? 'Role: structure and repeating pattern' : '역할: 구조와 반복 패턴'})
${JSON.stringify(sajuData, null, 2)}
` : '';

    const astroContext = astroData ? `
## ${isEn ? 'Astrology Data' : '점성술 데이터'} (${isEn ? 'Role: timing window and situational pressure' : '역할: 타이밍 창과 상황 압력'})
${JSON.stringify(astroData, null, 2)}
` : '';

    const tarotContext = tarotCards && tarotCards.length > 0 ? `
## ${isEn ? 'Tarot Cards' : '타로 카드'} (${isEn ? 'Role: immediate signal around the question' : '역할: 질문 주변의 즉각 신호'})
${tarotCards.map((card, i) =>
        isEn
            ? `Card ${i + 1}: ${card.nameEn || card.name} (${card.isReversed ? 'Reversed' : 'Upright'})`
            : `카드 ${i + 1}: ${card.name} (${card.isReversed ? '역방향' : '정방향'})`
    ).join('\n')}
` : '';

    return sajuContext + astroContext + tarotContext;
}

// ============ 교차 검증 힌트 ============
export function buildCrossValidationHint(
    sajuElement: string,
    astroElement: string,
    language: 'ko' | 'en' = 'ko'
): string {
    const isEn = language === 'en';

    const elementMap: Record<string, string[]> = {
        Fire: ['Fire', '火'],
        Earth: ['Earth', '土'],
        Air: ['Air', '金'],
        Water: ['Water', '水']
    };

    const sajuEl = sajuElement;
    const astroEl = astroElement;

    // 원소 일치 확인
    const isMatch = Object.values(elementMap).some(
        group => group.includes(sajuEl) && group.includes(astroEl)
    );

    if (isMatch) {
        return isEn
            ? `✅ ELEMENT MATCH: Saju (${sajuEl}) aligns with Astrology (${astroEl}). High confidence.`
            : `✅ 원소 일치: 사주(${sajuEl})와 점성술(${astroEl}) 일치. 확신도 높음.`;
    }

    return isEn
        ? `⚠️ ELEMENT DIFFERENCE: Saju (${sajuEl}) differs from Astrology (${astroEl}). Nuanced interpretation needed.`
        : `⚠️ 원소 차이: 사주(${sajuEl})와 점성술(${astroEl}) 차이. 세밀한 해석 필요.`;
}

// ============ 출력 깊이 설정 ============
export type OutputDepth = 'short' | 'full';

export function getOutputInstructions(depth: OutputDepth, language: 'ko' | 'en' = 'ko'): string {
    const isEn = language === 'en';

    if (depth === 'short') {
        return isEn
            ? `## Output Format: SHORT (3-5 sentences)
Focus on: Core insight + 1 key timing + 1 action.
Skip: Detailed breakdowns, lengthy explanations.`
            : `## 출력 형식: 짧음 (3-5문장)
집중: 핵심 통찰 + 주요 시기 1개 + 행동 1개.
생략: 상세 분석, 긴 설명.`;
    }

    return isEn
        ? `## Output Format: FULL (Comprehensive Report)
Include: All sections, detailed analysis, multiple action items.
Minimum: 500 words, 3+ data citations per system.`
        : `## 출력 형식: 전체 (종합 리포트)
포함: 모든 섹션, 상세 분석, 다중 행동 항목.
최소: 500자, 시스템당 3개 이상 데이터 인용.`;
}

// ============ 규칙 모듈 내보내기 ============
export { SAJU_RULES, ASTRO_RULES, TAROT_RULES };
