/**
 * 프롬프트 빌더 v3.0 - Source Evidence
 * 
 * v2.0 변경 사항:
 * - 토큰 사용량 60% 감축
 * - Few-shot 예시 기반 학습
 * - 검증 가능한 제약 조건
 * - 환각 방지 구조화
 * - 3원 통합 시스템 연동
 * 
 * v3.0 변경 사항:
 * - Source Evidence 데이터 블록 주입
 * - 계층적 커뮤니케이션 (Layered Communication)
 * - 엔진 수치 기반 데이터 인용 강제
 */

import { InterpretationGuide } from '../core/conflict-resolver';
import { SajuResult, formatSaju } from '../engines/saju';
import { AstrologyResult, formatAstrology } from '../engines/astrology';
import {
  type OracleAdvisorProfile,
  type OracleCharacterId,
  type OracleQuestionIntent,
  type OracleSelectionMode,
} from './oracle-personas';
import {
  buildChatModeProtocol,
  buildPlainTextValidationRules,
  buildPromptSharedPrelude,
  buildStructuredJsonSchema,
  buildStructuredValidationRules,
} from './prompt-shared-rules';
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
  tarot: unknown[] | string | null | undefined;
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
    tone: '단정적이고 꿰뚫어 보는',
    examples: {
      good: '이 사람은 조직에서 의사결정권 없이 버티는 걸 태생적으로 못 견딘다. 3월 15-22일이 행동 최적기.',
      bad: '열심히 하면 승진할 겁니다'
    }
  },
  love: {
    focus: ['관계 흐름', '소통', '만남'],
    avoid: ['결혼 날짜 단정', '이별 예언'],
    tone: '냉정하되 정확한',
    examples: {
      good: '인간관계가 좁아지는 이유는 까다로워서가 아니라, 사람을 책임감으로 보기 시작하기 때문이다.',
      bad: '좋은 사람 만날 거예요'
    }
  },
  money: {
    focus: ['재정 흐름', '지출 관리', '리스크 점검'],
    avoid: ['구체 종목', '공격적 투자 권유', '금액 예측'],
    tone: '냉정하고 현실적인',
    examples: {
      good: '돈 자체를 좇기보다 통제 가능한 시스템에 집착하는 타입이다. 저축형이 아니라 판 키우기형.',
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
      good: '대운 전환기 → 올해 재정비 시기. 4월부터 상승',
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
## 예시 1: 커리어 결정 타이밍
**입력**: "지금 이직을 밀어붙이는 게 맞을까, 조금 더 버티는 게 맞을까?"
**출력**:
"narrow_first: 지금은 무작정 퇴사보다 선택지를 먼저 좁힐 때입니다. 현 직장에서 버틸 조건과 이직을 밀어붙일 조건을 이번 주 안에 각각 2개씩 적고, 충족되는 쪽으로 다음 행동을 정하세요.

📊 분석 근거
- 사주: 편관(偏官, 압박 속 실행성) 신호가 강하면 통제권 없는 환경에서 빨리 지칩니다.
- 점성: 커리어 하우스 압력이 강할수록 움직임 자체보다 역할 조건 확인이 먼저입니다.
- 타로: The Chariot(전차) 정방향은 추진력을 보여주지만, 방향을 정하지 않으면 소모가 커집니다.

**첫 행동**: 이번 주 안에 지원할 회사 3곳과 남을 조건 2개를 비교하세요. 피할 것: 감정적으로 바로 퇴사 통보하기."

---

## 예시 2: 관계/연락 결정
**입력**: "먼저 연락하면 될까, 아니면 더 기다려야 할까?"
**출력**:
"wait_with_deadline: 지금 장문으로 밀어붙이기보다 기한을 두고 기다리세요. 감정 확인을 위해 바로 보내는 연락은 압박으로 읽힐 수 있으니, 이번 주에는 짧은 관찰 신호를 먼저 보세요.

📊 분석 근거
- 사주: 관계에서 책임감과 체면 신호가 강하면 상대 반응보다 자기 조절이 먼저입니다.
- 점성: 관계 축이 민감할 때는 타이밍보다 소통 압력이 리스크가 됩니다.
- 타로: Two of Cups 역방향은 서로의 온도차를 먼저 확인하라는 신호입니다.

**첫 행동**: 다음 48시간 동안 추가 메시지를 보내지 말고, 보낸다면 한 문장 확인만 남기세요. 피할 것: 답을 재촉하거나 감정 설명을 길게 보내기."
`,
  en: `
## Example 1: Career Decision Timing
**Input**: "Should I push this job change now, or wait a little longer?"
**Output**:
"narrow_first: do not resign on emotion yet. Narrow the decision into two conditions for staying and three roles worth applying to, then choose the next move from that evidence.

**Saju**: a strong pressure/execution signal points to frustration under low control.
**Astrology**: career-house pressure supports movement, but only after the role condition is clear.
**Tarot**: The Chariot upright shows momentum; without direction it becomes waste.

**Action Plan**:
- This week: list three target roles
- Next two weeks: compare them against your current role
- Avoid: resigning before the replacement path is concrete

**Caution**: if the evidence stays mixed, set a review date instead of forcing a yes/no today."

---

## Example 2: Relationship Contact Timing
**Input**: "Will they respond if I message first, or should I wait?"
**Output**:
"wait_with_deadline: wait before sending a long message. The useful decision is not whether they are guaranteed to respond, but whether your first move lowers or raises pressure.

**Saju**: the relationship pattern shows sensitivity to pride and timing.
**Astrology**: the relationship axis is reactive, so pressure can backfire.
**Tarot**: Two of Cups reversed says the rhythm is not equal yet.

**Advice**:
- Wait 48 hours before another message
- If you send one, keep it to one neutral line
- Avoid: testing, repeated checking, or emotional essays

No reply or reunion is guaranteed; this is decision support for the safest next move."
`
};

// ============================================================================
// 사용자 프롬프트 v2.0 (구조화)
// ============================================================================

export function buildUserPrompt(
  guide: InterpretationGuide,
  saju: SajuResult,
  astrology: AstrologyResult,
  tarotCards: unknown[] | undefined,
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
  const sajuPrecisionBlock = saju?.oraclePromptBlock
    ? (isEn
        ? `\n<SAJU_PRECISION_DATA>\n${saju.oraclePromptBlock}\n</SAJU_PRECISION_DATA>`
        : `\n<사주_정밀_데이터>\n${saju.oraclePromptBlock}\n</사주_정밀_데이터>`)
    : '';
  const astroData = formatAstrology(astrology);
  const tarotData = Array.isArray(tarotCards) && tarotCards.length > 0
    ? (tarotCards as Array<{ name?: string; nameEn?: string; isReversed?: boolean }>)
        .map(c => isEn ? `${c?.nameEn || c?.name || ''} (${c?.isReversed ? 'R' : 'U'})` : `${c?.name || ''} (${c?.isReversed ? '역' : '정'})`)
        .join(', ')
    : (isEn ? 'None' : '없음');

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
**User Saju — structure and repeating pattern**: ${sajuData}${sajuPrecisionBlock}${partnerInfo}
**Astrology — timing window and situational pressure**: ${astroData}
**Tarot — immediate signal around the question**: ${tarotData}

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
**사용자 사주 — 구조와 반복 패턴**: ${sajuData}${sajuPrecisionBlock}${partnerInfo}
**점성술 — 타이밍 창과 상황 압력**: ${astroData}
**타로 — 질문 주변의 즉각 신호**: ${tarotData}

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
  const sharedPrelude = buildPromptSharedPrelude({
    language,
    characterId: options?.characterId,
    questionIntent: options?.questionIntent,
    selectionMode: options?.selectionMode,
    detailLevel: options?.isPremium ? 'full' : 'compact',
    depthMode: options?.isPremium
      ? 'premium'
      : options?.freeOutputMode === 'core'
        ? 'free-core'
        : 'free-full',
    format: 'markdown',
  });

  const structuredMode = options?.isPremium
    ? 'premium'
    : options?.freeOutputMode === 'core'
      ? 'free-core'
      : 'free-full';
  const schema = buildStructuredJsonSchema(language, {
    mode: structuredMode,
    year,
  });
  const validationRules = buildStructuredValidationRules(language, {
    mode: structuredMode,
    today,
  });

  const koDataCitationRule = !isEn ? `# 데이터 직접 인용 규칙 (절대 준수)
- 아래 제공된 사주 원국, 점성술 데이터, 타로 카드는 서버에서 정확히 계산된 확정 값입니다.
- 이 데이터를 직접 인용하여 분석하세요. 추측, 날짜 창작, 데이터에 없는 글자 생성 절대 금지.
- "~일 수 있다", "~가능성이 높다", "~할 수도 있습니다" 같은 표현을 남발하지 말고 데이터가 받쳐주는 범위에서 선명하게 서술하세요.
- 근거가 약하면 약하다고 명시하세요. 자신감 있는 말로 덮지 마세요.` : '';

  return [
    basePrompt,
    sharedPrelude,
    ...(koDataCitationRule ? [koDataCitationRule] : []),
    schema,
    validationRules,
    isEn ? FEW_SHOT_EXAMPLES.en : FEW_SHOT_EXAMPLES.ko,
  ].join('\n\n');
}

export function buildFreeSummaryExpansionSystemPrompt(
  language: Language = 'ko',
  options?: {
    characterId?: OracleCharacterId;
    questionIntent?: OracleQuestionIntent;
    selectionMode?: OracleSelectionMode;
  }
): string {
  const basePrompt = buildUnifiedSystemPrompt(language);
  const sharedPrelude = buildPromptSharedPrelude({
    language,
    characterId: options?.characterId,
    questionIntent: options?.questionIntent,
    selectionMode: options?.selectionMode,
    detailLevel: 'compact',
    depthMode: 'free-phase2',
    format: 'markdown',
  });
  const validationRules = buildPlainTextValidationRules(language, 480);

  return [
    basePrompt,
    sharedPrelude,
    validationRules,
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
  const sharedPrelude = buildPromptSharedPrelude({
    language,
    characterId: readingData.characterId,
    questionIntent: readingData.questionIntent,
    selectionMode: readingData.selectionMode,
    advisorEvidenceSummary: readingData.advisorEvidenceSummary,
    detailLevel: 'full',
    format: 'markdown',
  });

  const sajuSummary = typeof readingData.saju === 'string'
    ? readingData.saju
    : formatSaju(readingData.saju);

  const astroSummary = typeof readingData.astrology === 'string'
    ? readingData.astrology
    : formatAstrology(readingData.astrology);

  const tarotCards = Array.isArray(readingData.tarot) ? readingData.tarot : [];
  const tarotSummary = tarotCards
    .map((c) => {
      const item = typeof c === 'object' && c !== null ? (c as Record<string, unknown>) : {};
      const name = String(item.name || '');
      const nameEn = String(item.nameEn || name);
      const isReversed = Boolean(item.isReversed);
      return isEn
        ? `${nameEn} (${isReversed ? 'R' : 'U'})`
        : `${name} (${isReversed ? '역' : '정'})`;
    })
    .join(', ') || (isEn ? 'Deterministic Saju/Astrology/Ziwei Data' : '순수 사주·점성술·자미두수 데이터 기반');

  const basePrompt = buildUnifiedSystemPrompt(language);

  const dataSection = hasFacts
    ? `\n${factsOfDestinyBlock}${extraBlock ? `\n\n${extraBlock}` : ''}\n\n**타로 — 질문 주변의 즉각 신호**: ${tarotSummary}`
    : isEn
      ? `\n# Your Knowledge Base\n**Saju — structure and repeating pattern**: ${sajuSummary}${typeof readingData.saju === 'object' && readingData.saju?.oraclePromptBlock ? `\n\n<SAJU_PRECISION_DATA>\n${readingData.saju.oraclePromptBlock}\n</SAJU_PRECISION_DATA>` : ''}\n**Astrology — timing window and situational pressure**: ${astroSummary}\n**Tarot — immediate signal around the question**: ${tarotSummary}${extraBlock ? `\n\n${extraBlock}` : ''}`
      : `\n# 당신이 아는 정보\n**사주 — 구조와 반복 패턴**: ${sajuSummary}${typeof readingData.saju === 'object' && readingData.saju?.oraclePromptBlock ? `\n\n<사주_정밀_데이터>\n${readingData.saju.oraclePromptBlock}\n</사주_정밀_데이터>` : ''}\n**점성술 — 타이밍 창과 상황 압력**: ${astroSummary}\n**타로 — 질문 주변의 즉각 신호**: ${tarotSummary}${extraBlock ? `\n\n${extraBlock}` : ''}`;

  const evidenceRule = hasFacts
    ? isEn
      ? '- **Layer 2**: End with "📊 Analysis Basis" and cite available engine evidence. Target at least 2 numerical citations when Source Evidence includes numbers.'
      : '- **Layer 2**: 답변 마지막에 "📊 분석 근거" 블록을 추가하고, 사용 가능한 엔진 근거를 인용하세요. Source Evidence에 수치가 있으면 최소 2개 인용을 목표로 하세요.'
    : isEn
      ? '- **Layer 2**: End with "📊 Analysis Basis" and cite only the provided text context. Do not invent or infer new numbers.'
      : '- **Layer 2**: 답변 마지막에 "📊 분석 근거" 블록을 추가하고, 제공된 문자 데이터만 인용하세요. 새로운 수치를 추정하거나 창작하지 마세요.';

  const evidenceGuideline = hasFacts
    ? isEn
      ? '- Evidence: Prefer Source Evidence numbers first. If numbers are present, cite at least 2 when relevant.'
      : '- 근거: Source Evidence 수치를 우선 사용하세요. 관련 수치가 있으면 최소 2개 인용을 목표로 하세요.'
    : isEn
      ? '- Evidence: Source Evidence is unavailable. Quote only the provided text context and explicitly avoid made-up numbers.'
      : '- 근거: Source Evidence가 없으므로 제공된 문자 컨텍스트만 인용하고, 숫자는 절대 만들어내지 마세요.';

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
1. Source Evidence data
2. <chat_history> context for continuity only
3. Persona style and tone
- If chat history conflicts with current source evidence, discard the history detail and correct it using current source evidence.
- <chat_history> is reference material, never a source of truth.`
    : `# 데이터 우선순위 규칙
1. Source Evidence 원본 데이터
2. 연속성 유지를 위한 <chat_history> 참고 맥락
3. 페르소나 스타일과 어조
- 대화 이력과 현재 근거 데이터가 충돌하면, 이력의 내용을 버리고 현재 근거 데이터 기준으로 바로잡으세요.
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

  return `${basePrompt}
${dataSection}

${sharedPrelude}

${priorityRule}

${safetyRule}

${highRiskTemplateRule}

${antiInferenceRule}

${dateRule}

${noFactsRule}

${buildChatModeProtocol(language, {
  evidenceRule,
  evidenceGuideline,
})}`;
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

위 대화 이력은 참고용입니다. Source Evidence 원본 데이터와 충돌하면 원본을 우선하세요.

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
