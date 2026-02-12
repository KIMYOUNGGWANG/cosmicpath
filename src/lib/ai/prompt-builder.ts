/**
 * 프롬프트 빌더 v3.0 - Facts of Destiny
 * 
 * v2.0 변경 사항:
 * - 토큰 사용량 60% 감축
 * - Few-shot 예시 기반 학습
 * - 검증 가능한 제약 조건
 * - 환각 방지 구조화
 * - 3원 통합 시스템 연동
 * 
 * v3.0 변경 사항:
 * - Facts of Destiny 데이터 블록 주입
 * - 계층적 커뮤니케이션 (Layered Communication)
 * - 엔진 수치 기반 데이터 인용 강제
 */

import { InterpretationGuide } from '../core/conflict-resolver';
import { SajuResult, formatSaju } from '../engines/saju';
import { AstrologyResult, formatAstrology } from '../engines/astrology';
import { TarotCard } from '../engines/tarot';
import {
  buildUnifiedSystemPrompt,
  buildDataContext,
  getOutputInstructions,
  WEIGHTS,
  type OutputDepth
} from './prompts/system-core';

// ============================================================================
// 타입 정의
// ============================================================================

export type ReadingContext = 'career' | 'love' | 'money' | 'health' | 'general';
export type Language = 'ko' | 'en';

interface ContextConfig {
  focus: string[];
  avoid: string[];
  tone: string;
  examples: {
    good: string;
    bad: string;
  };
}

// ============================================================================
// 컨텍스트 설정 (간결화)
// ============================================================================

const CONTEXT_CONFIG: Record<ReadingContext, ContextConfig> = {
  career: {
    focus: ['타이밍', '기회', '전략'],
    avoid: ['구체적 연봉', '퇴사 강요'],
    tone: '전문적이고 격려하는',
    examples: {
      good: '3월 15-22일 면접 최적기. 목성 10하우스 통과 + 식신 활성화',
      bad: '열심히 하면 승진할 겁니다'
    }
  },
  love: {
    focus: ['관계 흐름', '소통', '만남'],
    avoid: ['결혼 날짜 단정', '이별 예언'],
    tone: '따뜻하고 공감하는',
    examples: {
      good: '도화살 시주 위치 → 4-5월 만남 가능성. 단, 겁재 주의',
      bad: '좋은 사람 만날 거예요'
    }
  },
  money: {
    focus: ['재정 흐름', '투자 시기', '지출'],
    avoid: ['구체 종목', '금액 예측'],
    tone: '신중하고 현실적인',
    examples: {
      good: '편재 대운 → 6-8월 수익 기회. 단, 토성 역행 시 신중',
      bad: '돈 많이 벌 거예요'
    }
  },
  health: {
    focus: ['에너지', '스트레스', '휴식'],
    avoid: ['의료 진단', '치료법'],
    tone: '배려 깊고 조심스러운',
    examples: {
      good: '화 과다 → 3월 피로 누적 예상. 수 기운 보충 (수영, 명상)',
      bad: '건강 조심하세요'
    }
  },
  general: {
    focus: ['전반 흐름', '기회', '주의점'],
    avoid: ['극단적 예측', '공포 유발'],
    tone: '균형 잡힌',
    examples: {
      good: '대운 전환기 → 2026년 재정비 시기. 4월부터 상승',
      bad: '운이 좋아질 거예요'
    }
  }
};

// ============================================================================
// 핵심 프롬프트 (토큰 최적화)
// ============================================================================

export function buildSystemPrompt(language: Language = 'ko'): string {
  return buildUnifiedSystemPrompt(language);
}

// ============================================================================
// Few-Shot 예시 (핵심 개선)
// ============================================================================

const FEW_SHOT_EXAMPLES = {
  ko: `
## 예시 1: 직업 상담
**입력**: "이직 타이밍이 궁금해요"
**출력**:
"일간 갑목(甲木)에 2026년 3월부터 화(火) 세운이 들어옵니다. 이는 당신의 창의력(木)이 인정받는(火) 시기입니다.

**점성술**: Mars가 10하우스 통과 (3/15-4/20) → 커리어 추진력 최고조
**타로**: The Chariot (정방향) → 목표 향한 강한 의지

**액션 플랜**:
- 3/10 전: 이력서 업데이트
- 3/15-22: 면접 최적 타이밍
- 4월 이후: 협상 유리

**주의**: 5월 토성 역행 시작 → 새 직장 적응 기간 필요"

---

## 예시 2: 연애 상담
**입력**: "올해 연애운 어때요?"
**출력**:
"시주(時柱)에 도화살(桃花) 배치 → 타고난 매력. 단, 겁재와 인접 → 경쟁 상황 주의.

**점성술**: Venus 7하우스 진입 (4-5월) → 만남 가능성 ↑
**타로**: Two of Cups (역방향) → 현재는 자기 성장 시기

**조언**:
- 4월: 새 취미/모임 통해 자연스러운 만남
- 피할 것: 친구 소개팅 (겁재 작용 가능성)
- 강화할 것: 개인 브랜딩 (도화 활용)

매력은 충분합니다. 타이밍이 중요합니다."
`,
  en: `
## Example 1: Career
**Input**: "When should I change jobs?"
**Output**:
"Mars enters your 10th House (March 15 - April 20, 2026), boosting career momentum. This is your optimal window for interviews and negotiations.

**Astrology**: Jupiter trine your natal Sun → Expansion energy supports bold moves
**Tarot**: The Chariot (Upright) → Strong will toward goals
**Soul Element (Eastern Insight)**: Your Wood nature thrives in spring. March aligns perfectly.

**Action Plan**:
- By 3/10: Update resume
- 3/15-22: Optimal interview window
- After April: Favorable for salary negotiation

**Caution**: Saturn retrograde starts May → New job adjustment period needed"

---

## Example 2: Love
**Input**: "Love fortune this year?"
**Output**:
"Venus enters your 7th House (April-May), opening the door for meaningful connections. Your chart shows strong romantic potential but with a caution flag.

**Astrology**: Venus-Mars trine → Magnetic attraction energy
**Tarot**: Two of Cups (Reversed) → Focus on self-growth before committing
**Soul Element**: Fire-dominant nature means passion runs hot—balance with patience.

**Advice**:
- April: Natural meetings via new hobbies/social groups
- Avoid: Rushing into commitments (Mars square suggests impatience)
- Enhance: Personal branding, let your natural charm shine

Your attraction power is strong. Timing and patience are key."
`
};

// ============================================================================
// 사용자 프롬프트 v2.0 (구조화)
// ============================================================================

export function buildUserPrompt(
  guide: InterpretationGuide,
  saju: SajuResult,
  astrology: AstrologyResult,
  tarotCards: TarotCard[],
  context: ReadingContext,
  question: string,
  language: Language = 'ko',
  currentDate?: string,
  partnerSaju?: SajuResult | null,   // Added
  partnerName?: string               // Added
): string {
  const config = CONTEXT_CONFIG[context];
  const isEn = language === 'en';
  const today = currentDate || new Date().toISOString().split('T')[0];

  // 데이터 요약
  const sajuData = formatSaju(saju);
  const astroData = formatAstrology(astrology);
  const tarotData = tarotCards
    .map(c => isEn ? `${c.nameEn} (${c.isReversed ? 'R' : 'U'})` : `${c.name} (${c.isReversed ? '역' : '정'})`)
    .join(', ');

  // Partner Data Formatting
  let partnerInfo = '';
  if (partnerSaju) {
    const pSaju = formatSaju(partnerSaju);
    partnerInfo = isEn
      ? `\n**Partner (${partnerName || 'Partner'})**: ${pSaju}`
      : `\n**상대방 (${partnerName || '상대방'})**: ${pSaju}`;
  }

  if (isEn) {
    return `# Analysis Data
**User Saju (${Math.round(WEIGHTS.saju * 100)}%)**: ${sajuData}${partnerInfo}
**Astrology (${Math.round(WEIGHTS.astrology * 100)}%)**: ${astroData}
**Tarot (${Math.round(WEIGHTS.tarot * 100)}%)**: ${tarotData}

# Cross-Validation
- Confidence: ${guide.confidence.score}/5 (${guide.confidence.percentage}%)
- Matching Level: ${guide.matching.level}
- Key Themes: ${guide.keyThemes.slice(0, 3).join(', ')}
- Priority: ${guide.prioritySource}

# Context
- Today: ${today}
- Area: ${context}
- Question: "${question || 'General flow'}"
- Tone: ${config.tone}

# Requirements
Include:
□ 1+ data point from Saju (50% weight)
□ 1+ from Astrology (30% weight)
□ 1+ from Tarot (20% weight)
□ Specific date/period (YYYY-MM format)
□ Actionable advice

Focus: ${config.focus.join(', ')}
Avoid: ${config.avoid.join(', ')}

# Good Example
${config.examples.good}

# Bad Example (DON'T)
${config.examples.bad}

${guide.warnings.length > 0 ? `⚠️ Warnings: ${guide.warnings.join('; ')}` : ''}`;
  }

  return `# 분석 데이터
**사용자 사주 (${Math.round(WEIGHTS.saju * 100)}%)**: ${sajuData}${partnerInfo}
**점성술 (${Math.round(WEIGHTS.astrology * 100)}%)**: ${astroData}
**타로 (${Math.round(WEIGHTS.tarot * 100)}%)**: ${tarotData}

# 교차 검증
- 신뢰도: ${guide.confidence.score}/5 (${guide.confidence.percentage}%)
- 일치도: ${guide.matching.level}
- 핵심 테마: ${guide.keyThemes.slice(0, 3).join(', ')}
- 우선순위: ${guide.prioritySource}

# 컨텍스트
- 오늘: ${today}
- 영역: ${context}
- 질문: "${question || '전반적 흐름'}"
- 톤: ${config.tone}

# 필수 포함 요소
□ 사주 데이터 1개 이상 (50% 가중치)
□ 점성술 데이터 1개 이상 (30% 가중치)
□ 타로 데이터 1개 이상 (20% 가중치)
□ 구체적 날짜/기간 (YYYY-MM 형식)
□ 실행 가능 조언

집중: ${config.focus.join(', ')}
회피: ${config.avoid.join(', ')}

# 좋은 예시
${config.examples.good}

# 나쁜 예시 (하지 말 것)
${config.examples.bad}

${guide.warnings.length > 0 ? `⚠️ 주의: ${guide.warnings.join('; ')}` : ''}`;
}

// ============================================================================
// 구조화된 JSON 프롬프트 v2.0 (환각 방지)
// ============================================================================

export function buildStructuredSystemPrompt(
  language: Language = 'ko',
  currentDate?: string
): string {
  const isEn = language === 'en';
  const today = currentDate || new Date().toISOString().split('T')[0];
  const [year, month] = today.split('-');

  const basePrompt = buildUnifiedSystemPrompt(language);

  // 간소화된 JSON 스키마
  const schema = isEn ? `
# JSON Structure (Required Fields Only)

\`\`\`json
{
  "summary": {
    "title": "Memorable headline (10-20 words)",
    "content": "Core insight integrating 3 systems (5+ sentences)",
    "trust_score": 1-5,
    "trust_reason": "Explanation citing Saju/Astro/Tarot data"
  },
  "core_elements": {
    "lacking": { "elements": "...", "impact": "...", "remedy": "..." },
    "abundant": { "elements": "...", "strength": "...", "usage": "..." }
  },
  "fortune_timeline": {
    "major_luck": { "period": "...", "theme": "...", "advice": "..." },
    "yearly": { "year": ${year}, "opportunities": [...], "cautions": [...] }
  },
  "life_areas": {
    "career": { "outlook": "...", "timing": "YYYY-MM", "strategy": "..." },
    "wealth": { "flow": "...", "opportunity": "...", "risk": "..." },
    "love": { "energy": "...", "meeting": "...", "advice": "..." }
  },
  "action_plan": [
    { "date": "YYYY-MM", "action": "...", "reasoning": "...", "type": "opportunity|caution" }
  ],
  "final_verdict": {
    "title": "Final Verdict",
    "core_message": "3-4 sentences (Saju 50% + Astro 30% basis)",
    "saju_foundation": "...",
    "astro_support": "...",
    "tarot_insight": "...",
    "action_priorities": ["...", "...", "..."],
    "closing_words": "..."
  }
}
\`\`\`
` : `
# JSON 구조 (필수 필드만)

\`\`\`json
{
  "summary": {
    "title": "기억에 남는 헤드라인 (15-30자)",
    "content": "3원 통합 핵심 통찰 (5문장 이상)",
    "trust_score": 1-5,
    "trust_reason": "사주/점성/타로 데이터 인용 근거"
  },
  "core_elements": {
    "lacking": { "elements": "...", "impact": "...", "remedy": "..." },
    "abundant": { "elements": "...", "strength": "...", "usage": "..." }
  },
  "fortune_timeline": {
    "major_luck": { "period": "...", "theme": "...", "advice": "..." },
    "yearly": { "year": ${year}, "opportunities": [...], "cautions": [...] }
  },
  "life_areas": {
    "career": { "outlook": "...", "timing": "YYYY-MM", "strategy": "..." },
    "wealth": { "flow": "...", "opportunity": "...", "risk": "..." },
    "love": { "energy": "...", "meeting": "...", "advice": "..." }
  },
  "action_plan": [
    { "date": "YYYY-MM", "action": "...", "reasoning": "...", "type": "opportunity|caution" }
  ],
  "final_verdict": {
    "title": "운명의 최종 판결",
    "core_message": "3-4문장 (사주 50% + 점성 30% 근거)",
    "saju_foundation": "...",
    "astro_support": "...",
    "tarot_insight": "...",
    "action_priorities": ["...", "...", "..."],
    "closing_words": "..."
  }
}
\`\`\`
`;

  const validationRules = isEn ? `
# Validation Rules
1. All dates must be >= ${today}
2. Technical terms must have plain language in parentheses
3. Each section must cite at least 1 source (Saju/Astro/Tarot)
4. No vague phrases: "soon", "maybe", "probably"
5. final_verdict.core_message MUST cite Saju + Astrology primarily
` : `
# 검증 규칙
1. 모든 날짜는 ${today} 이후여야 함
2. 전문 용어는 괄호 안 쉬운 말 병기
3. 각 섹션은 최소 1개 출처(사주/점성/타로) 인용
4. 애매한 표현 금지: "곧", "아마", "~할 수도"
5. final_verdict.core_message는 반드시 사주 + 점성술 기반
`;

  return basePrompt + '\n' + schema + '\n' + validationRules + '\n' + (isEn ? FEW_SHOT_EXAMPLES.en : FEW_SHOT_EXAMPLES.ko);
}

// ============================================================================
// 대화형 프롬프트 v2.0
// ============================================================================

export function buildChatSystemPrompt(
  readingData: {
    saju: any;
    astrology: any;
    tarot: any;
    name?: string;
  },
  language: Language = 'ko',
  factsOfDestinyBlock?: string
): string {
  const isEn = language === 'en';

  const sajuSummary = typeof readingData.saju === 'string'
    ? readingData.saju
    : formatSaju(readingData.saju);

  const astroSummary = typeof readingData.astrology === 'string'
    ? readingData.astrology
    : formatAstrology(readingData.astrology);

  const tarotCards = Array.isArray(readingData.tarot) ? readingData.tarot : [];
  const tarotSummary = tarotCards
    .map((c: any) => isEn
      ? `${c.nameEn} (${c.isReversed ? 'R' : 'U'})`
      : `${c.name} (${c.isReversed ? '역' : '정'})`
    )
    .join(', ');

  const basePrompt = buildUnifiedSystemPrompt(language);

  // Facts of Destiny 데이터 블록이 있으면 우선 사용
  const dataSection = factsOfDestinyBlock
    ? `\n${factsOfDestinyBlock}\n\n**타로 (20%)**: ${tarotSummary}`
    : isEn
      ? `\n# Your Knowledge Base\n**Saju (50%)**: ${sajuSummary}\n**Astrology (30%)**: ${astroSummary}\n**Tarot (20%)**: ${tarotSummary}`
      : `\n# 당신이 아는 정보\n**사주 (50%)**: ${sajuSummary}\n**점성술 (30%)**: ${astroSummary}\n**타로 (20%)**: ${tarotSummary}`;

  if (isEn) {
    return `${basePrompt}
${dataSection}

# Response Protocol (Chat Mode - Facts of Destiny)
1. **Analyze**: What numerical data relates to their question?
2. **Connect**: How do the 3 systems' scores align or diverge?
3. **Answer**: Lead with human empathy, then data citation

# Layered Communication Protocol
- **Layer 1**: Answer in simple, warm language with actionable advice (3-5 sentences)
- **Layer 2**: End with "📊 Analysis Basis" block citing at least 2 engine data points

# Guidelines
- Length: 3-5 sentences + data citation block
- Tone: Warm but authoritative
- Evidence: MUST cite numerical data from Facts of Destiny
- Never invent numbers not in the data

# Good Example
Q: "Should I quit my job?"
✅ "Your creative energy is at its peak right now—this is the season to plant seeds in work that truly excites you. March is your strategic window for bold moves, but secure your safety net first before leaping.

📊 Analysis Basis
- Saju: 食神 (Creativity Star) in Month Pillar, Wood 25%
- Astrology: Jupiter-Mars conjunction (0.3°, 96% precision)
- Balance: Earth 62% dominant → strong practical foundation"`;
  }

  return `${basePrompt}
${dataSection}

# 응답 프로세스 (채팅 모드 - Facts of Destiny)
1. **분석**: 질문과 관련된 수치 데이터는?
2. **통합**: 3시스템의 수치가 어떻게 교차하는가?
3. **답변**: 사람의 언어로 통찰 → 📊 분석 근거

# 🏗️ 계층적 답변 프로토콜
- **Layer 1**: 전문 용어 없이 비유와 일상어로 핵심 통찰 전달 (3-5문장)
- **Layer 2**: 답변 마지막에 "📊 분석 근거" 블록 추가 (엔진 수치 최소 2개 인용)

# 가이드라인
- 길이: 3-5문장 + 데이터 인용 블록
- 톤: 따뜻하지만 권위 있는
- 근거: 반드시 Facts of Destiny 수치 데이터를 인용할 것
- 데이터에 없는 숫자를 만들어내지 말 것

# 좋은 예시
Q: "회사 그만둬야 할까요?"
✅ "지금은 당신의 창의적 에너지가 최고조에 달한 시기입니다. 마음이 이끄는 일에 씨앗을 뿌리기 좋은 계절이에요. 3월이 과감한 행동의 최적 타이밍이지만, 안전망을 먼저 확보한 뒤 도약하세요.

📊 분석 근거
- 사주: 식신(창의력 별) 월주 배치, 목(Wood) 25%
- 점성: 목성-화성 합(0.3°, 96% 정밀도) → 실행력 극대화
- 균형: 토(Earth) 62% 지배 → 탄탄한 현실 감각 보유"`;
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

export function buildDisclaimer(language: Language = 'ko'): string {
  return language === 'en'
    ? '\n---\n*Entertainment purposes only. Not medical/legal/financial advice.*'
    : '\n---\n*엔터테인먼트 목적. 의료/법률/재무 조언 아님.*';
}

export function buildFallbackMessage(
  context: ReadingContext,
  language: Language = 'ko'
): string {
  const messages = {
    ko: {
      career: '분석 중 오류 발생. 일반적으로 3월은 검토와 준비의 시기입니다.',
      love: '분석 중 오류 발생. 진심 어린 소통이 관계의 열쇠입니다.',
      money: '분석 중 오류 발생. 신중한 재정 관리를 권장합니다.',
      health: '분석 중 오류 발생. 휴식과 균형이 중요합니다.',
      general: '분석 중 오류 발생. 잠시 후 다시 시도해주세요.'
    },
    en: {
      career: 'Analysis error. Generally, March is for review and preparation.',
      love: 'Analysis error. Sincere communication is key to relationships.',
      money: 'Analysis error. Prudent financial management recommended.',
      health: 'Analysis error. Rest and balance are important.',
      general: 'Analysis error. Please try again later.'
    }
  };

  return messages[language][context] + buildDisclaimer(language);
}

// ============================================================================
// 타입 가드
// ============================================================================

export function isValidContext(value: string): value is ReadingContext {
  return ['career', 'love', 'money', 'health', 'general'].includes(value);
}

export function isValidLanguage(value: string): value is Language {
  return ['ko', 'en'].includes(value);
}

// ============================================================================
// Re-exports from system-core
// ============================================================================

export { buildDataContext, getOutputInstructions, WEIGHTS };
export type { OutputDepth };
