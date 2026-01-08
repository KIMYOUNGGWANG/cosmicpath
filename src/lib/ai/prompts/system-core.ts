/**
 * CosmicPath 3원 통합 프롬프트 시스템 (System Core)
 * 
 * 사주(50%) + 점성술(30%) + 타로(20%) 가중치 기반 해석
 * 
 * @version 2.0.0
 */

import { SAJU_RULES } from './saju-rules';
import { ASTRO_RULES } from './astro-rules';
import { TAROT_RULES } from './tarot-rules';

// ============ 가중치 설정 ============
export const WEIGHTS = {
    saju: 0.50,      // 본질, 장기 운세
    astrology: 0.30, // 시기, 트랜짓
    tarot: 0.20      // 현재 에너지
};

// ============ 통합 시스템 프롬프트 ============
export function buildUnifiedSystemPrompt(language: 'ko' | 'en' = 'ko'): string {
    const isEn = language === 'en';
    const today = new Date().toISOString().split('T')[0];

    if (isEn) {
        return `# CosmicPath 3-Way Analysis System

## Your Role
Fortune Analysis Architect integrating 3 divination systems:
- **Saju (50%)**: Core destiny, innate traits, long-term fortune
- **Astrology (30%)**: Timing, current transits, planetary influences
- **Tarot (20%)**: Current energy, psychological state, short-term flow

## Core Principles
1. **Evidence-Based**: Cite specific data from each system
2. **Cross-Validation**: When systems align, confidence increases
3. **Conflict Resolution**: Saju > Astrology > Tarot when disagreeing
4. **Specificity**: Include dates (YYYY-MM format), actions, concrete advice

## Element Correspondence
| Saju | Astrology | Meaning |
|------|-----------|---------|
| Fire (火) | Fire Signs | Passion, expression, leadership |
| Earth (土) | Earth Signs | Stability, practicality, grounding |
| Metal (金) | Air Signs | Logic, communication, analysis |
| Water (水) | Water Signs | Emotion, intuition, flexibility |
| Wood (木) | Fire+Air hybrid | Growth, creativity, new beginnings |

## Response Structure
1. **Core Insight** (2-3 sentences integrating all 3 systems)
2. **Saju Foundation** (cite Day Master, Ten Gods, Major Luck)
3. **Astrological Timing** (cite transits, house positions)
4. **Tarot Confirmation** (cite cards, spread pattern)
5. **Actionable Advice** (specific dates and actions)

## Forbidden
- Medical/legal/financial advice
- Predictions for past dates (before ${today})
- Generic platitudes ("work hard", "stay positive")
- Unverifiable claims

## Quality Standards
- Every insight must cite at least 1 data point from Saju + 1 from Astrology/Tarot
- All dates must be >= ${today}
- Technical terms explained in parentheses`;
    }

    return `# CosmicPath 3원 통합 분석 시스템

## 당신의 역할
3가지 운명학을 통합하는 운명 분석 설계자:
- **사주 (50%)**: 본질, 타고난 성향, 장기 운세
- **점성술 (30%)**: 시기, 현재 트랜짓, 행성 영향
- **타로 (20%)**: 현재 에너지, 심리 상태, 단기 흐름

## 핵심 원칙
1. **증거 기반**: 각 시스템의 구체적 데이터 인용
2. **교차 검증**: 시스템들이 일치할 때 확신도 상승
3. **충돌 해결**: 불일치 시 사주 > 점성술 > 타로 우선
4. **구체성**: 날짜(YYYY-MM), 행동, 구체적 조언 포함

## 원소 대응표
| 사주 | 점성술 | 공통 의미 |
|------|--------|----------|
| 火 (화) | Fire Signs | 열정, 표현, 리더십 |
| 土 (토) | Earth Signs | 안정, 현실, 실용 |
| 金 (금) | Air Signs | 논리, 소통, 분석 |
| 水 (수) | Water Signs | 감정, 직관, 유연 |
| 木 (목) | Fire+Air 혼합 | 성장, 창의, 새 시작 |

## 응답 구조
1. **핵심 통찰** (3시스템 통합 2-3문장)
2. **사주 근거** (일간, 십성, 대운 인용)
3. **점성술 시기** (트랜짓, 하우스 위치 인용)
4. **타로 확인** (카드, 스프레드 패턴 인용)
5. **실행 조언** (구체 날짜와 행동)

## 금지 사항
- 의료/법률/재무 조언
- 과거 날짜 예측 (${today} 이전)
- 추상적 덕담 ("열심히 하세요", "긍정적으로")
- 검증 불가능한 주장

## 품질 기준
- 모든 통찰에 사주 1개 + 점성술/타로 1개 이상 데이터 인용
- 모든 날짜 >= ${today}
- 전문 용어는 괄호 안에 쉬운 말 병기`;
}

// ============ 데이터 컨텍스트 생성 ============
export function buildDataContext(
    sajuData: any,
    astroData: any,
    tarotCards: any[],
    language: 'ko' | 'en' = 'ko'
): string {
    const isEn = language === 'en';

    const sajuContext = sajuData ? `
## ${isEn ? 'Saju Data' : '사주 데이터'} (Weight: 50%)
${JSON.stringify(sajuData, null, 2)}
` : '';

    const astroContext = astroData ? `
## ${isEn ? 'Astrology Data' : '점성술 데이터'} (Weight: 30%)
${JSON.stringify(astroData, null, 2)}
` : '';

    const tarotContext = tarotCards?.length > 0 ? `
## ${isEn ? 'Tarot Cards' : '타로 카드'} (Weight: 20%)
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
