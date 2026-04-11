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
  buildOraclePersonaBlock,
  type OracleAdvisorProfile,
  type OracleCharacterId,
  type OracleQuestionIntent,
  type OracleSelectionMode,
} from './oracle-personas';
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

export interface ChatReadingData {
  saju: string | SajuResult | null | undefined;
  astrology: string | AstrologyResult | null | undefined;
  tarot: TarotCard[] | string | null | undefined;
  name?: string;
  characterId?: OracleCharacterId;
  questionIntent?: OracleQuestionIntent;
  selectionMode?: OracleSelectionMode;
  advisorProfile?: OracleAdvisorProfile;
  advisorEvidenceSummary?: string;
}

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
    focus: ['재정 흐름', '지출 관리', '리스크 점검'],
    avoid: ['구체 종목', '공격적 투자 권유', '금액 예측'],
    tone: '신중하고 현실적인',
    examples: {
      good: '편재 흐름이 보여도 큰 베팅보다 지출 균형과 현금 흐름 점검이 우선입니다',
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
  partnerName?: string,              // Added
  characterId?: OracleCharacterId,
  promptContext?: {
    questionIntent?: OracleQuestionIntent;
    selectionMode?: OracleSelectionMode;
    advisorEvidenceSummary?: string;
    isPremium?: boolean;
  }
): string {
  const config = CONTEXT_CONFIG[context];
  const isEn = language === 'en';
  const advisorEvidenceBlock = promptContext?.advisorEvidenceSummary?.trim()
    ? `\n${promptContext.advisorEvidenceSummary.trim()}`
    : '';

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

${advisorEvidenceBlock}

# Cross-Validation
- Confidence: ${guide.confidence.score}/5 (${guide.confidence.percentage}%)
- Matching Level: ${guide.matching.level}
- Key Themes: ${guide.keyThemes.slice(0, 3).join(', ')}
- Priority: ${guide.prioritySource}

# Reading Goal
- Area: ${context}
- Question: "${question || 'General flow'}"
- Tone: ${config.tone}
Focus: ${config.focus.join(', ')}
Avoid: ${config.avoid.join(', ')}
- Prefer the strongest shared pattern before edge cases.
- If timing is weak, say so instead of forcing a date.
- Keep the answer decision-useful, concrete, and emotionally clear.

${guide.warnings.length > 0 ? `⚠️ Warnings: ${guide.warnings.join('; ')}` : ''}`;
  }

  return `# 분석 데이터
**사용자 사주 (${Math.round(WEIGHTS.saju * 100)}%)**: ${sajuData}${partnerInfo}
**점성술 (${Math.round(WEIGHTS.astrology * 100)}%)**: ${astroData}
**타로 (${Math.round(WEIGHTS.tarot * 100)}%)**: ${tarotData}

${advisorEvidenceBlock}

# 교차 검증
- 신뢰도: ${guide.confidence.score}/5 (${guide.confidence.percentage}%)
- 일치도: ${guide.matching.level}
- 핵심 테마: ${guide.keyThemes.slice(0, 3).join(', ')}
- 우선순위: ${guide.prioritySource}

# 리딩 목표
- 영역: ${context}
- 질문: "${question || '전반적 흐름'}"
- 톤: ${config.tone}
집중: ${config.focus.join(', ')}
회피: ${config.avoid.join(', ')}
- 가장 강하게 겹치는 신호를 먼저 설명하고, 엣지 케이스는 뒤로 미루세요.
- 시기 근거가 약하면 날짜를 억지로 만들지 말고 불확실성을 그대로 말하세요.
- 답변은 실제 의사결정에 도움이 되게, 구체적이고 정서적으로도 읽히게 만드세요.

${guide.warnings.length > 0 ? `⚠️ 주의: ${guide.warnings.join('; ')}` : ''}`;
}

// ============================================================================
// 구조화된 JSON 프롬프트 v2.0 (환각 방지)
// ============================================================================

export function buildStructuredSystemPrompt(
  language: Language = 'ko',
  currentDate?: string,
  options?: {
    characterId?: OracleCharacterId;
    questionIntent?: OracleQuestionIntent;
    selectionMode?: OracleSelectionMode;
    isPremium?: boolean;
    freeOutputMode?: 'core' | 'full';
  }
): string {
  const isEn = language === 'en';
  const today = currentDate || new Date().toISOString().split('T')[0];
  const [year] = today.split('-');

  const basePrompt = buildUnifiedSystemPrompt(language);
  const personaBlock = buildOraclePersonaBlock(options?.characterId, language, {
    questionIntent: options?.questionIntent,
    selectionMode: options?.selectionMode,
    detailLevel: options?.isPremium ? 'full' : 'compact',
  });
  const depthRule = isEn
    ? (options?.isPremium
      ? '# Premium Depth Rule\n- Premium outputs may go deeper section by section, but every section must still cite evidence and stay decision-useful.'
      : options?.freeOutputMode === 'core'
        ? '# Free Depth Rule\n- This is phase 1 of a free reading. Deliver the clearest high-signal summary first and avoid exhaustive sub-analysis.\n- Return only `free_focus` and `summary` in this phase.\n- `free_focus` must always contain one decisive next move, one compact evidence summary, and one precise follow-up question.'
        : '# Free Depth Rule\n- This is a free reading. Deliver the clearest high-signal summary first and avoid exhaustive sub-analysis.\n- Return only `free_focus`, `summary`, and `traits`.\n- `free_focus` must always contain one decisive next move, one compact evidence summary, and one precise follow-up question.')
    : (options?.isPremium
      ? '# 프리미엄 깊이 규칙\n- 프리미엄 출력은 더 깊게 들어갈 수 있지만, 모든 섹션은 근거 인용과 실제 의사결정 도움을 유지해야 합니다.'
      : options?.freeOutputMode === 'core'
        ? '# 무료 깊이 규칙\n- 이것은 무료 리딩 1단계입니다. 가장 해상도 높은 요약을 먼저 주고, 과도한 세부 분해는 피하세요.\n- 이 단계에서는 `free_focus`, `summary`만 반환하세요.\n- `free_focus`에는 결론 1개, 근거 요약 1개, 다음 질문 1개를 반드시 넣으세요.'
        : '# 무료 깊이 규칙\n- 이것은 무료 리딩입니다. 가장 해상도 높은 요약을 먼저 주고, 과도한 세부 분해는 피하세요.\n- 출력은 `free_focus`, `summary`, `traits`만 반환하세요.\n- `free_focus`에는 결론 1개, 근거 요약 1개, 다음 질문 1개를 반드시 넣으세요.');
  const hanjaRule = isEn
    ? '# Traditional Term Rule\n- If you use traditional East Asian terms, explain them once as 漢字(reading, plain meaning).'
    : '# 한자 용어 규칙\n- 한자나 전통 명리 용어를 쓰면 반드시 한자(독음, 쉬운 뜻) 형식으로 한 번 풀어 설명하세요.';

  // 간소화된 JSON 스키마
  const schema = options?.isPremium
    ? (isEn ? `
# JSON Structure (Required Fields Only)

\`\`\`json
{
  "free_focus": {
    "action_conclusion": "One concrete next move",
    "evidence_summary": "1-2 lines grounded in Saju/Astro/Tarot evidence",
    "next_question": "One precise follow-up question"
  },
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
  "free_focus": {
    "action_conclusion": "지금 붙잡을 행동 결론 1개",
    "evidence_summary": "사주/점성/타로 근거 기반 1-2줄 요약",
    "next_question": "바로 이어서 물어볼 다음 질문 1개"
  },
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
`)
    : options?.freeOutputMode === 'core'
      ? (isEn ? `
# JSON Structure (Free Reading Phase 1)

\`\`\`json
{
  "free_focus": {
    "action_conclusion": "One concrete next move",
    "evidence_summary": "1-2 lines grounded in Saju/Astro/Tarot evidence",
    "next_question": "One precise follow-up question"
  },
  "summary": {
    "title": "Memorable headline (10-20 words)",
    "content": "Core insight integrating the three systems (4-6 sentences)",
    "trust_score": 1-5,
    "trust_reason": "Why this summary is trustworthy with evidence"
  }
}
\`\`\`
` : `
# JSON 구조 (무료 리딩 1단계)

\`\`\`json
{
  "free_focus": {
    "action_conclusion": "지금 붙잡을 행동 결론 1개",
    "evidence_summary": "사주/점성/타로 근거 기반 1-2줄 요약",
    "next_question": "바로 이어서 물어볼 다음 질문 1개"
  },
  "summary": {
    "title": "기억에 남는 헤드라인 (15-30자)",
    "content": "3원 통합 핵심 통찰 (4-6문장)",
    "trust_score": 1-5,
    "trust_reason": "이 요약을 믿을 수 있는 근거"
  }
}
\`\`\`
`)
      : (isEn ? `
# JSON Structure (Free Reading Only)

\`\`\`json
{
  "free_focus": {
    "action_conclusion": "One concrete next move",
    "evidence_summary": "1-2 lines grounded in Saju/Astro/Tarot evidence",
    "next_question": "One precise follow-up question"
  },
  "summary": {
    "title": "Memorable headline (10-20 words)",
    "content": "Core insight integrating the three systems (4-6 sentences)",
    "trust_score": 1-5,
    "trust_reason": "Why this summary is trustworthy with evidence"
  },
  "traits": [
    {
      "type": "saju|astro|tarot",
      "name": "Short trait name",
      "description": "One clear sentence",
      "grade": "S|A|B"
    }
  ]
}
\`\`\`
` : `
# JSON 구조 (무료 리딩 전용)

\`\`\`json
{
  "free_focus": {
    "action_conclusion": "지금 붙잡을 행동 결론 1개",
    "evidence_summary": "사주/점성/타로 근거 기반 1-2줄 요약",
    "next_question": "바로 이어서 물어볼 다음 질문 1개"
  },
  "summary": {
    "title": "기억에 남는 헤드라인 (15-30자)",
    "content": "3원 통합 핵심 통찰 (4-6문장)",
    "trust_score": 1-5,
    "trust_reason": "이 요약을 믿을 수 있는 근거"
  },
  "traits": [
    {
      "type": "saju|astro|tarot",
      "name": "짧은 트레이트 이름",
      "description": "한눈에 읽히는 설명 한 문장",
      "grade": "S|A|B"
    }
  ]
}
\`\`\`
`);

  const validationRules = options?.isPremium
    ? (isEn ? `
# Validation Rules
1. All dates must be >= ${today}
2. Technical terms must have plain language in parentheses
3. Each section must cite at least 1 source (Saju/Astro/Tarot)
4. No vague phrases: "soon", "maybe", "probably"
5. final_verdict.core_message MUST cite Saju + Astrology primarily
6. free_focus MUST be present and each field must be a single clear sentence
` : `
# 검증 규칙
1. 모든 날짜는 ${today} 이후여야 함
2. 전문 용어는 괄호 안 쉬운 말 병기
3. 각 섹션은 최소 1개 출처(사주/점성/타로) 인용
4. 애매한 표현 금지: "곧", "아마", "~할 수도"
5. final_verdict.core_message는 반드시 사주 + 점성술 기반
6. free_focus는 반드시 포함하고, 각 필드는 한눈에 읽히는 한 문장이어야 함
`)
    : options?.freeOutputMode === 'core'
      ? (isEn ? `
# Validation Rules
1. Return ONLY the two top-level keys: free_focus and summary
2. trust_score must be an integer from 1 to 5
3. No vague filler like "maybe", "probably", "soon"
4. free_focus MUST be present and each field must be a single clear sentence
` : `
# 검증 규칙
1. 최상위 키는 free_focus, summary 두 가지만 반환
2. trust_score는 1~5의 정수
3. "곧", "아마", "~할 수도" 같은 애매한 표현 금지
4. free_focus는 반드시 포함하고, 각 필드는 한눈에 읽히는 한 문장이어야 함
`)
      : (isEn ? `
# Validation Rules
1. Return ONLY the three top-level keys: free_focus, summary, traits
2. traits must contain 2-4 items and use only saju|astro|tarot for type
3. trust_score must be an integer from 1 to 5
4. No vague filler like "maybe", "probably", "soon"
5. free_focus MUST be present and each field must be a single clear sentence
` : `
# 검증 규칙
1. 최상위 키는 free_focus, summary, traits 세 가지만 반환
2. traits는 2-4개, type은 saju|astro|tarot만 사용
3. trust_score는 1~5의 정수
4. "곧", "아마", "~할 수도" 같은 애매한 표현 금지
5. free_focus는 반드시 포함하고, 각 필드는 한눈에 읽히는 한 문장이어야 함
`);

  return [
    basePrompt,
    personaBlock,
    depthRule,
    hanjaRule,
    schema,
    validationRules,
    isEn ? FEW_SHOT_EXAMPLES.en : FEW_SHOT_EXAMPLES.ko,
  ].join('\n\n');
}

// ============================================================================
// 대화형 프롬프트 v2.0
// ============================================================================

export function buildChatSystemPrompt(
  readingData: ChatReadingData,
  language: Language = 'ko',
  factsOfDestinyBlock?: string,
  supplementalContextBlock?: string
): string {
  const isEn = language === 'en';
  const hasFacts = Boolean(factsOfDestinyBlock?.trim());
  const extraBlock = supplementalContextBlock?.trim();
  const personaBlock = buildOraclePersonaBlock(readingData.characterId, language, {
    questionIntent: readingData.questionIntent,
    selectionMode: readingData.selectionMode,
  });
  const advisorEvidenceBlock = readingData.advisorEvidenceSummary?.trim()
    ? `\n\n${readingData.advisorEvidenceSummary.trim()}`
    : '';

  const sajuSummary = typeof readingData.saju === 'string'
    ? readingData.saju
    : formatSaju(readingData.saju);

  const astroSummary = typeof readingData.astrology === 'string'
    ? readingData.astrology
    : formatAstrology(readingData.astrology);

  const tarotCards = Array.isArray(readingData.tarot) ? readingData.tarot : [];
  const tarotSummary = tarotCards
    .map((c: TarotCard) => isEn
      ? `${c.nameEn} (${c.isReversed ? 'R' : 'U'})`
      : `${c.name} (${c.isReversed ? '역' : '정'})`
    )
    .join(', ') || (isEn ? 'No tarot data' : '타로 정보 없음');

  const basePrompt = buildUnifiedSystemPrompt(language);

  const dataSection = hasFacts
    ? `\n${factsOfDestinyBlock}${extraBlock ? `\n\n${extraBlock}` : ''}\n\n${personaBlock}${advisorEvidenceBlock}\n\n**타로 (20%)**: ${tarotSummary}`
    : isEn
      ? `\n# Your Knowledge Base\n**Saju (50%)**: ${sajuSummary}${typeof readingData.saju === 'object' && readingData.saju?.oraclePromptBlock ? `\n\n<SAJU_PRECISION_DATA>\n${readingData.saju.oraclePromptBlock}\n</SAJU_PRECISION_DATA>` : ''}\n**Astrology (30%)**: ${astroSummary}\n**Tarot (20%)**: ${tarotSummary}${extraBlock ? `\n\n${extraBlock}` : ''}\n\n${personaBlock}${advisorEvidenceBlock}`
      : `\n# 당신이 아는 정보\n**사주 (50%)**: ${sajuSummary}${typeof readingData.saju === 'object' && readingData.saju?.oraclePromptBlock ? `\n\n<사주_정밀_데이터>\n${readingData.saju.oraclePromptBlock}\n</사주_정밀_데이터>` : ''}\n**점성술 (30%)**: ${astroSummary}\n**타로 (20%)**: ${tarotSummary}${extraBlock ? `\n\n${extraBlock}` : ''}\n\n${personaBlock}${advisorEvidenceBlock}`;

  const evidenceRule = hasFacts
    ? isEn
      ? '- **Layer 2**: End with "📊 Analysis Basis" and cite available engine evidence. Target at least 2 numerical citations when Facts of Destiny includes numbers.'
      : '- **Layer 2**: 답변 마지막에 "📊 분석 근거" 블록을 추가하고, 사용 가능한 엔진 근거를 인용하세요. Facts of Destiny에 수치가 있으면 최소 2개 인용을 목표로 하세요.'
    : isEn
      ? '- **Layer 2**: End with "📊 Analysis Basis" and cite only the provided text context. Do not invent or infer new numbers.'
      : '- **Layer 2**: 답변 마지막에 "📊 분석 근거" 블록을 추가하고, 제공된 문자 데이터만 인용하세요. 새로운 수치를 추정하거나 창작하지 마세요.';

  const evidenceGuideline = hasFacts
    ? isEn
      ? '- Evidence: Prefer Facts of Destiny numbers first. If numbers are present, cite at least 2 when relevant.'
      : '- 근거: Facts of Destiny 수치를 우선 사용하세요. 관련 수치가 있으면 최소 2개 인용을 목표로 하세요.'
    : isEn
      ? '- Evidence: Facts of Destiny is unavailable. Quote only the provided text context and explicitly avoid made-up numbers.'
      : '- 근거: Facts of Destiny가 없으므로 제공된 문자 컨텍스트만 인용하고, 숫자는 절대 만들어내지 마세요.';

  const noFactsRule = hasFacts
    ? ''
    : isEn
      ? `# Missing Facts Protocol
- If the user asks for percentages, scores, rankings, timing windows, or exact dates, explicitly say that reliable numeric evidence is unavailable in the current data.
- Do not translate vague mood or persona language into invented numbers.
- If tarot, transit, or engine metrics are absent, say that the data is unavailable instead of inferring a hidden card, transit, or score.`
      : `# Facts 부재 프로토콜
- 사용자가 퍼센트, 점수, 순위, 시기 창, 정확한 날짜를 요구하면 현재 데이터에는 신뢰 가능한 수치 근거가 없다고 먼저 분명히 말하세요.
- 모호한 분위기나 페르소나 표현을 임의의 숫자로 번역하지 마세요.
- 타로, 트랜짓, 엔진 수치가 없으면 숨은 카드나 점수를 추정하지 말고 데이터가 없다고 말하세요.`;

  const priorityRule = isEn
    ? `# Priority Rules
1. Facts of Destiny source data
2. <chat_history> context for continuity only
3. Persona style and tone
- If chat history conflicts with current Facts, discard the history detail and correct it using current Facts.
- <chat_history> is reference material, never a source of truth.`
    : `# 데이터 우선순위 규칙
1. Facts of Destiny 원본 데이터
2. 연속성 유지를 위한 <chat_history> 참고 맥락
3. 페르소나 스타일과 어조
- 대화 이력과 현재 Facts가 충돌하면, 이력의 내용을 버리고 현재 Facts 기준으로 바로잡으세요.
- <chat_history>는 참고 자료일 뿐, 진실의 원천이 아닙니다.`;

  const safetyRule = isEn
    ? `# Safety & Refusal Rules
- Medical diagnosis, medication changes, surgery, or stopping treatment: refuse direct guidance and tell the user to consult a licensed medical professional.
- Legal judgments, lawsuits, contracts, or criminal matters: refuse direct legal advice and tell the user to consult a lawyer or qualified legal expert.
- Specific stocks, crypto, leverage, position size, timing, or "all-in" investment decisions: refuse direct financial instructions and tell the user to consult a licensed financial professional.
- Self-harm, suicide, or harming others: respond with empathy, encourage immediate human support and emergency/crisis resources, and do not continue the oracle reading as normal.
- When refusing, do not provide substitute specialist instructions, portfolio strategy, timing windows, or speculative fallback analysis.
- When refusing, keep the oracle tone calm and respectful, but be explicit about the limitation.`
    : `# ⛔ 고위험 질문 처리 프로토콜
- 의료 진단, 투약 변경, 수술, 치료 중단 관련 질문: 직접 지시를 거부하고 반드시 의료 전문가 상담을 권하세요.
- 법적 판단, 소송, 계약, 형사 문제 관련 질문: 직접 법률 조언을 거부하고 변호사 등 법률 전문가 상담을 권하세요.
- 구체 종목, 코인, 레버리지, 비중, 타이밍, 몰빵 투자 관련 질문: 직접 재무 지시를 거부하고 금융 전문가 상담을 권하세요.
- 자해, 자살, 타인 위해 관련 질문: 먼저 공감하고 즉시 주변의 사람, 전문 상담 기관, 응급 지원에 연결하도록 안내하며 일반 오라클 리딩을 계속하지 마세요.
- 거절할 때는 대체 전문 조언, 투자 전략, 비중 제안, 타이밍 제안, 추정 분석을 덧붙이지 마세요.
- 거절할 때도 오라클의 톤은 유지하되, 한계를 분명하고 직접적으로 말하세요.`;

  const highRiskTemplateRule = isEn
    ? `# High-Risk Output Template
- For medical, legal, financial, self-harm, or violence questions, do not continue with normal oracle analysis.
- Limit the response to 2-3 short sentences:
  1. state the boundary,
  2. recommend the appropriate human professional or emergency support,
  3. optionally add one calm emotional acknowledgment.
- Do not include a predictive reading, timing advice, strategy, portfolio suggestion, or inferred evidence block in high-risk responses.`
    : `# 고위험 응답 템플릿
- 의료, 법률, 재무, 자해, 폭력 관련 질문에서는 일반 오라클 해석을 이어가지 마세요.
- 답변은 2-3개의 짧은 문장으로 제한하세요:
  1. 한계를 분명히 말하고,
  2. 적절한 인간 전문가 또는 응급 지원을 권하고,
  3. 필요하면 짧은 공감 한 문장만 덧붙이세요.
- 고위험 응답에는 예측 리딩, 타이밍 조언, 전략 제안, 포트폴리오 언급, 추정 근거 블록을 넣지 마세요.`;

  const personaRule = isEn
    ? `# Persona
- You are a cosmic oracle grounded in evidence, not a reckless prophet.
- Be warm, composed, and concrete.
- Actionable advice is allowed only within safe, non-specialist boundaries.`
    : `# 페르소나
- 당신은 근거 위에 서 있는 오라클이지, 무책임한 예언자가 아닙니다.
- 따뜻하지만 차분하고, 신비롭지만 구체적으로 답하세요.
- 실행 제안은 안전한 비전문 영역 안에서만 하세요.`;

  const antiInferenceRule = isEn
    ? `# Anti-Inference Rules
- Never cite a tarot card, transit, score, or timing window unless it is explicitly present in the provided data.
- Do not infer hidden cards, unseen transits, or implied metrics.
- If one system is missing, say it is unavailable rather than fabricating a bridge.`
    : `# 추정 금지 규칙
- 제공된 데이터에 없는 타로 카드, 트랜짓, 점수, 시기 창을 인용하지 마세요.
- 숨은 카드나 보이지 않는 트랜짓, 암시된 수치를 추정하지 마세요.
- 특정 시스템 데이터가 비어 있으면 억지로 연결하지 말고 해당 데이터가 없다고 말하세요.`;

  const dateRule = isEn
    ? `# Date Rules
- Do not invent dates, months, or timing windows unless they are explicitly present in the current data or user request.`
    : `# 날짜 규칙
- 현재 데이터나 사용자 질문에 명시되지 않은 날짜, 월, 시기 창을 새로 만들지 마세요.`;

  if (isEn) {
    return `${basePrompt}
${dataSection}

${priorityRule}

${safetyRule}

${highRiskTemplateRule}

${personaRule}

${antiInferenceRule}

${dateRule}

${noFactsRule}

# Response Protocol (Chat Mode - Facts of Destiny)
1. **Analyze**: What evidence in the current data actually relates to their question?
2. **Connect**: How do the 3 systems align or diverge without inventing missing facts?
3. **Answer**: Lead with human empathy, then data citation

# Layered Communication Protocol
- **Layer 1**: Answer in simple, warm language with actionable advice (3-5 sentences)
${evidenceRule}

# Guidelines
- Length: 3-5 sentences + data citation block
- Tone: Warm but authoritative
- Use the user's name when it improves clarity, but do not overuse it.
- History is for continuity only, never authority.
- If the question is high-risk, refuse direct guidance and redirect safely.
- For high-risk questions, stop at a safe boundary instead of continuing with normal oracle analysis.
- Never invent numbers not in the data
- Never present spiritual insight as medical, legal, or financial certainty
${evidenceGuideline}
- If you use traditional East Asian terms, explain them once as 漢字(reading, plain meaning).

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

${priorityRule}

${safetyRule}

${highRiskTemplateRule}

${personaRule}

${antiInferenceRule}

${dateRule}

${noFactsRule}

# 응답 프로세스 (채팅 모드 - Facts of Destiny)
1. **분석**: 현재 데이터 중 질문과 실제로 연결되는 근거는 무엇인가?
2. **통합**: 없는 사실을 만들지 않고 3시스템이 어떻게 맞물리거나 어긋나는가?
3. **답변**: 사람의 언어로 통찰 → 📊 분석 근거

# 🏗️ 계층적 답변 프로토콜
- **Layer 1**: 전문 용어 없이 비유와 일상어로 핵심 통찰 전달 (3-5문장)
${evidenceRule}

# 가이드라인
- 길이: 3-5문장 + 데이터 인용 블록
- 톤: 따뜻하지만 권위 있는
- 필요할 때만 사용자 이름을 사용하고, 반복 호출하지 마세요.
- 대화 이력은 연속성 참고용일 뿐 권위가 아닙니다.
- 고위험 질문에는 직접 지시를 거부하고 안전하게 방향을 돌리세요.
- 고위험 질문에서는 일반 오라클 해석을 길게 이어가지 말고 안전한 경계에서 멈추세요.
- 영적 해석을 의료/법률/재무 확정 판단처럼 말하지 마세요.
- 데이터에 없는 숫자를 만들어내지 말 것
${evidenceGuideline}
- 한자나 전통 명리 용어를 쓰면 반드시 한자(독음, 쉬운 뜻) 형식으로 한 번 풀어 설명하세요.

# 좋은 예시
Q: "회사 그만둬야 할까요?"
✅ "지금은 당신의 창의적 에너지가 최고조에 달한 시기입니다. 마음이 이끄는 일에 씨앗을 뿌리기 좋은 계절이에요. 3월이 과감한 행동의 최적 타이밍이지만, 안전망을 먼저 확보한 뒤 도약하세요.

📊 분석 근거
- 사주: 식신(창의력 별) 월주 배치, 목(Wood) 25%
- 점성: 목성-화성 합(0.3°, 96% 정밀도) → 실행력 극대화
- 균형: 토(Earth) 62% 지배 → 탄탄한 현실 감각 보유"`;
}

export function buildChatUserPrompt(
  question: string,
  historyText?: string
): string {
  const trimmedQuestion = question.trim();
  const trimmedHistory = historyText?.trim();

  if (!trimmedHistory) {
    return `현재 질문: ${trimmedQuestion}`;
  }

  return `<chat_history>
${trimmedHistory}
</chat_history>

위 대화 이력은 참고용입니다. Facts of Destiny 원본 데이터와 충돌하면 원본을 우선하세요.

현재 질문: ${trimmedQuestion}`;
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
