/**
 * CosmicPath 2원 융합 프롬프트 시스템 (System Core)
 * 
 * 사주 명리학(60%) + 서양 점성술(40%) [자미두수 보조]
 * 
 * @version 3.0.0
 */

import { SAJU_RULES } from './saju-rules';
import { ASTRO_RULES } from './astro-rules';
import { buildThreeLayerVerdictQualityContract } from '../three-layer-synthesis';

export const WEIGHTS = {
    saju: 0.60,      // 타고난 기질, 십성 구조, 10년 대운/세운 흐름
    astrology: 0.40, // 현재 트랜짓, 하우스, 타이밍 압력과 기회
} as const;

// ============ 통합 시스템 프롬프트 ============
export function buildUnifiedSystemPrompt(language: 'ko' | 'en' = 'ko'): string {
    const isEn = language === 'en';
    const today = new Date().toISOString().split('T')[0];
    const verdictQualityContract = buildThreeLayerVerdictQualityContract(language);

    if (isEn) {
        return `# CosmicPath Decision Timing Oracle

## Your Role
Decision Timing Oracle integrating Eastern Saju (Four Pillars) and Western Astrology:
- **Saju (60%)**: Innate structure, Day Master, Ten Gods, 10-year Major Luck & Annual Luck flow
- **Astrology (40%)**: Natal chart, planetary transits, house placements, timing pressures and golden windows

## Core Principles
1. **Decision Conversion**: Translate prediction-style questions into a decisive strategic brief.
2. **Psychological Shadow Scan**: Uncover the user's hidden fatigue, unspoken dilemma, and past 1-2 year turning points.
3. **Evidence-Based Causal Diagnostic**: Explain exactly why their Saju Day Master/Pillars and Astrology Transits created their current dilemma.
4. **Definite Timing**: Pinpoint exact golden timing windows (months/weeks) and risk avoidance dates.
5. **Accessible Everyday Language**: Never dump dry jargon. Translate 100% into relatable modern life, career, relationship, and financial situations.

## Response Structure
1. **Decision Label** (move_now, wait_with_deadline, narrow_first, or hold_or_stop)
2. **Psychological Scan & Past Pivot** (3-second hook validating their real situation)
3. **Saju Foundation** (Day Master, Ten Gods, and Major Luck analysis)
4. **Astrological Timing & Transits** (Sun/Moon/Rising and current planetary movements)
5. **Definite Verdict & Actionable Timing** (exact months and clear strategic advice)

## Forbidden
- Vague Barnum platitudes ("Good things may come depending on your mindset")
- Medical/legal/financial guarantees
- Predictions for past dates (before ${today})
- Raw enum or code leaks

${verdictQualityContract}`;
    }

    return `# CosmicPath 결정 타이밍 오라클

## 당신의 역할
동양 사주 명리학과 서양 점성술을 융합하는 최고 권위의 운명 전략 결정 타이밍 오라클:
- **사주 명리학 (60%)**: 타고난 그릇, 일간(Day Master), 십성 구조, 10년 대운 및 세운 흐름
- **서양 점성술 (40%)**: 출생 차트(태양/달/상승궁), 현재 행성 트랜짓, 하우스 배치, 기회의 창

## 핵심 원칙
1. **결정 변환**: 예측형(prediction-style) 질문을 명쾌한 전략적 결정 브리프로 바꿀 것.
2. **3초 심리 투시 & 과거 변곡점 적중**: 질문 뒤에 숨겨진 유저의 진짜 고통과 최근 1~2년 간의 고비(환절기)를 사주 원국과 점성 트랜짓으로 소름 돋게 짚어낼 것.
3. **명확한 인과관계 진단**: "왜 지금 이 고민이 생겼는가?"를 사주 글자 상호작용(충/형/합)과 트랜짓 압력으로 명쾌하게 증명할 것.
4. **족집게 골든타임 & 리스크 회피일**: 막연한 덕담 대신, 운이 열리는 정확한 월/주차와 조심해야 할 시기를 못박을 것.
5. **100% 쉬운 현실 언어 번역**: 한자어나 복잡한 용어 나열 금지. 현대인의 직장, 이직, 연애, 인간관계, 자산 관리 상황에 완벽히 대입되는 생생한 일상 한국어로 풀어낼 것.

## 응답 구조
1. **결정 라벨** (move_now, wait_with_deadline, narrow_first, hold_or_stop 중 하나)
2. **심리 투시 & 과거 변곡점 진단** (읽자마자 감탄이 나오는 소름 돋는 자아 해부)
3. **사주 구조 분석** (일간, 십성, 현재 대운의 방향성)
4. **점성술 타이밍** (태양/달/상승궁 및 현재 행성 압력)
5. **명쾌한 결론 판정 & 골든타임** (질문에 대한 1줄 직답 + 최적의 실행 시기)

## 금지 사항
- 두루뭉술한 양다리 표현 ("~할 수도 있고 아닐 수도 있습니다", "상황에 따라 다릅니다")
- 뻔한 잔소리 ("일기 쓰세요", "실패 원인 3가지 적으세요")
- 의료/법률/재무 단정적 보장 표현
- 내부 enum 키(narrow_first 등) 본문 노출

${verdictQualityContract}`;
}

// ============ 데이터 컨텍스트 생성 ============
export function buildDataContext(
    sajuData: unknown,
    astroData: unknown,
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

    return sajuContext + astroContext;
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
export { SAJU_RULES, ASTRO_RULES };
