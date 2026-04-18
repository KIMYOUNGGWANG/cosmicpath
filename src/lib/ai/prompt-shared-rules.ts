import {
  buildOraclePersonaBlock,
  type OracleCharacterId,
  type OracleQuestionIntent,
  type OracleSelectionMode,
} from './oracle-personas';

export type PromptRuleLanguage = 'ko' | 'en';
export type PromptRuleFormat = 'markdown' | 'inline';
export type PromptDepthMode = 'premium' | 'free-core' | 'free-full' | 'free-phase2';
export type StructuredPromptMode = 'premium' | 'free-core' | 'free-full';

type PromptSharedPreludeOptions = {
  language: PromptRuleLanguage;
  characterId?: OracleCharacterId;
  questionIntent?: OracleQuestionIntent;
  selectionMode?: OracleSelectionMode;
  advisorEvidenceSummary?: string;
  detailLevel?: 'full' | 'compact';
  depthMode?: PromptDepthMode;
  format?: PromptRuleFormat;
};

function getJoiner(format: PromptRuleFormat) {
  return format === 'markdown' ? '\n\n' : '\n';
}

export function buildTraditionalTermRule(
  language: PromptRuleLanguage,
  format: PromptRuleFormat = 'markdown'
) {
  if (format === 'inline') {
    return language === 'en'
      ? 'If you use traditional East Asian terms, explain them once as 漢字(reading, plain meaning).'
      : '한자나 전통 용어를 쓰면 반드시 한자(독음, 쉬운 뜻) 형식으로 한 번 풀어 설명하세요.';
  }

  return language === 'en'
    ? '# Traditional Term Rule\n- If you use traditional East Asian terms, explain them once as 漢字(reading, plain meaning).'
    : '# 한자 용어 규칙\n- 한자나 전통 명리 용어를 쓰면 반드시 한자(독음, 쉬운 뜻) 형식으로 한 번 풀어 설명하세요.';
}

export function buildDecisionTimingCoreRule(
  language: PromptRuleLanguage,
  format: PromptRuleFormat = 'markdown'
) {
  if (format === 'inline') {
    return language === 'en'
      ? 'Core role: You are an evidence-led oracle for decisions and timing. Lead with the clearest next move, why it matters now, and the main risk to watch. Do not drift into generic life coaching or fate-only language.'
      : '핵심 역할: 당신은 결정과 타이밍을 읽는 근거 기반 오라클입니다. 가장 선명한 다음 행동, 지금 그게 중요한 이유, 주의할 리스크를 먼저 말하고, generic한 라이프 코치식 위로나 막연한 운명론으로 흐르지 마세요.';
  }

  return language === 'en'
    ? '# Decision Timing Oracle\n- You are an evidence-led oracle for decisions and timing, not a generic life coach or reckless fortune teller.\n- Lead with the clearest next move, why it matters now, and the main risk to watch.\n- Warmth is allowed, but it must never replace judgment, evidence, or specificity.'
    : '# 결정과 타이밍 오라클 규칙\n- 당신은 generic한 라이프 코치나 무책임한 예언자가 아니라, 결정과 타이밍을 읽는 근거 기반 오라클입니다.\n- 가장 선명한 다음 행동, 지금 그게 중요한 이유, 주의할 리스크를 먼저 말하세요.\n- 따뜻한 어조는 가능하지만, 판단·근거·구체성을 대신해서는 안 됩니다.';
}

export function buildEvidenceFirstNarrativeRule(
  language: PromptRuleLanguage,
  format: PromptRuleFormat = 'markdown'
) {
  if (format === 'inline') {
    return language === 'en'
      ? 'Writing rule: start from the strongest shared signal, keep uncertainty explicit when evidence is thin, and avoid filler, repeated reassurance, or empty inspiration.'
      : '작성 규칙: 가장 강하게 겹치는 신호에서 시작하고, 근거가 약하면 불확실성을 그대로 말하며, 빈 위로나 반복 위안, 공허한 고무 문장을 넣지 마세요.';
  }

  return language === 'en'
    ? '# Evidence-First Writing Rule\n- Start from the strongest shared signal before edge cases.\n- If evidence is thin, say that clearly instead of padding with confidence.\n- Avoid filler, repeated reassurance, and empty inspiration.'
    : '# 근거 우선 서술 규칙\n- 엣지 케이스보다 가장 강하게 겹치는 신호에서 먼저 시작하세요.\n- 근거가 약하면 자신감 있는 말로 덮지 말고, 불확실성을 그대로 밝히세요.\n- 빈 위로, 반복 위안, 공허한 고무 문장은 피하세요.';
}

export function buildPromptDepthRule(
  language: PromptRuleLanguage,
  mode: PromptDepthMode,
  format: PromptRuleFormat = 'markdown'
) {
  if (mode === 'premium') {
    if (format === 'inline') {
      return language === 'en'
        ? 'Premium depth rule: each section may go deep, but every paragraph must remain evidence-led and decision-useful.'
        : '프리미엄 깊이 규칙: 각 섹션은 깊게 들어가되, 모든 단락은 근거 중심이고 실제 의사결정에 도움이 되어야 합니다.';
    }

    return language === 'en'
      ? '# Premium Depth Rule\n- Premium outputs may go deeper section by section, but every section must still cite evidence and stay decision-useful.'
      : '# 프리미엄 깊이 규칙\n- 프리미엄 출력은 더 깊게 들어갈 수 있지만, 모든 섹션은 근거 인용과 실제 의사결정 도움을 유지해야 합니다.';
  }

  if (mode === 'free-core') {
    return language === 'en'
      ? '# Free Depth Rule\n- This is phase 1 of a free reading. Deliver the clearest high-signal outline first and avoid exhaustive sub-analysis.\n- Return only `free_focus` and compact `summary` metadata in this phase.\n- Do not write the long summary body yet. Phase 2 will expand it later.\n- `free_focus` must always contain one decisive next move, one compact evidence summary, and one precise follow-up question.'
      : '# 무료 깊이 규칙\n- 이것은 무료 리딩 1단계입니다. 가장 해상도 높은 아웃라인을 먼저 주고, 과도한 세부 분해는 피하세요.\n- 이 단계에서는 `free_focus`와 압축된 `summary` 메타데이터만 반환하세요.\n- 긴 summary 본문은 아직 쓰지 마세요. 본문은 2단계에서 확장합니다.\n- `free_focus`에는 결론 1개, 근거 요약 1개, 다음 질문 1개를 반드시 넣으세요.';
  }

  if (mode === 'free-phase2') {
    return language === 'en'
      ? '# Free Reading Phase 2\n- Write only the final `summary.content` body as plain text.\n- Expand the existing phase-1 conclusion into 3-4 short sentences that stay concrete, emotionally readable, and decision-useful.\n- Integrate the shared Saju, Astrology, and Tarot signal without repeating raw data dumps.'
      : '# 무료 리딩 2단계\n- 최종 `summary.content` 본문만 plain text로 작성하세요.\n- 1단계 결론을 바탕으로 3-4개의 짧은 문장으로 확장하되, 구체적이고 정서적으로 읽히며 실제 판단에 도움이 되게 쓰세요.\n- 사주, 점성, 타로의 공통 신호를 묶되 데이터 나열을 반복하지 마세요.';
  }

  return language === 'en'
    ? '# Free Depth Rule\n- This is a free reading. Deliver the clearest high-signal summary first and avoid exhaustive sub-analysis.\n- Return only `free_focus`, `summary`, and `traits`.\n- `free_focus` must always contain one decisive next move, one compact evidence summary, and one precise follow-up question.'
    : '# 무료 깊이 규칙\n- 이것은 무료 리딩입니다. 가장 해상도 높은 요약을 먼저 주고, 과도한 세부 분해는 피하세요.\n- 출력은 `free_focus`, `summary`, `traits`만 반환하세요.\n- `free_focus`에는 결론 1개, 근거 요약 1개, 다음 질문 1개를 반드시 넣으세요.';
}

export function buildPromptSharedPrelude(options: PromptSharedPreludeOptions) {
  const detailLevel = options.detailLevel ?? 'compact';
  const format = options.format ?? 'markdown';
  const blocks = [
    buildDecisionTimingCoreRule(options.language, format),
    buildEvidenceFirstNarrativeRule(options.language, format),
    buildOraclePersonaBlock(options.characterId, options.language, {
      questionIntent: options.questionIntent,
      selectionMode: options.selectionMode,
      detailLevel,
    }),
    options.advisorEvidenceSummary?.trim() || '',
    options.depthMode ? buildPromptDepthRule(options.language, options.depthMode, format) : '',
    detailLevel === 'compact' ? buildTraditionalTermRule(options.language, format) : '',
  ].filter(Boolean);

  return blocks.join(getJoiner(format));
}

export function buildStructuredJsonSchema(
  language: PromptRuleLanguage,
  options: {
    mode: StructuredPromptMode;
    year: string;
  }
) {
  const isEn = language === 'en';

  if (options.mode === 'premium') {
    return isEn ? `
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
    "yearly": { "year": ${options.year}, "opportunities": [...], "cautions": [...] }
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
    "yearly": { "year": ${options.year}, "opportunities": [...], "cautions": [...] }
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
  }

  if (options.mode === 'free-core') {
    return isEn ? `
# JSON Structure (Free Reading Phase 1)

\`\`\`json
{
  "free_focus": {
    "action_conclusion": "One concrete next move",
    "evidence_summary": "1-2 lines grounded in Saju/Astro/Tarot evidence",
    "next_question": "One precise follow-up question"
  },
  "summary": {
    "title": "Memorable headline (10-20 words)"
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
    "title": "기억에 남는 헤드라인 (15-30자)"
  }
}
\`\`\`
`;
  }

  return isEn ? `
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
    "content": "Core insight integrating the three systems (3-4 short sentences, max 480 chars)",
    "trust_score": 1-5,
    "trust_reason": "Why this summary is trustworthy with evidence (one short sentence)"
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
    "content": "3원 통합 핵심 통찰 (짧은 3-4문장, 480자 이내)",
    "trust_score": 1-5,
    "trust_reason": "이 요약을 믿을 수 있는 근거 한 문장"
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
`;
}

export function buildStructuredValidationRules(
  language: PromptRuleLanguage,
  options: {
    mode: StructuredPromptMode;
    today: string;
  }
) {
  const isEn = language === 'en';

  if (options.mode === 'premium') {
    return isEn ? `
# Validation Rules
1. All dates must be >= ${options.today}
2. Technical terms must have plain language in parentheses
3. Each section must cite at least 1 source (Saju/Astro/Tarot)
4. No vague phrases: "soon", "maybe", "probably"
5. final_verdict.core_message MUST cite Saju + Astrology primarily
6. free_focus MUST be present and each field must be a single clear sentence
` : `
# 검증 규칙
1. 모든 날짜는 ${options.today} 이후여야 함
2. 전문 용어는 괄호 안 쉬운 말 병기
3. 각 섹션은 최소 1개 출처(사주/점성/타로) 인용
4. 애매한 표현 금지: "곧", "아마", "~할 수도"
5. final_verdict.core_message는 반드시 사주 + 점성술 기반
6. free_focus는 반드시 포함하고, 각 필드는 한눈에 읽히는 한 문장이어야 함
`;
  }

  if (options.mode === 'free-core') {
    return isEn ? `
# Validation Rules
1. Return ONLY the two top-level keys: free_focus and summary
2. Every string must stay on one line with no raw line breaks
3. Keep lengths compact: action_conclusion <= 96 chars, evidence_summary <= 160 chars, next_question <= 96 chars, title <= 40 chars
4. No vague filler like "maybe", "probably", "soon"
5. Do not include summary.content, trust_score, or trust_reason in this phase
6. free_focus MUST be present and each field must be a single clear sentence
` : `
# 검증 규칙
1. 최상위 키는 free_focus, summary 두 가지만 반환
2. 모든 문자열은 줄바꿈 없이 한 줄로 유지
3. 길이는 짧게 유지: action_conclusion 96자 이하, evidence_summary 160자 이하, next_question 96자 이하, title 40자 이하
4. "곧", "아마", "~할 수도" 같은 애매한 표현 금지
5. 이 단계에서는 summary.content, trust_score, trust_reason을 넣지 말 것
6. free_focus는 반드시 포함하고, 각 필드는 한눈에 읽히는 한 문장이어야 함
`;
  }

  return isEn ? `
# Validation Rules
1. Return ONLY the three top-level keys: free_focus, summary, traits
2. traits must contain 2-4 items and use only saju|astro|tarot for type
3. trust_score must be an integer from 1 to 5
4. Every string must stay on one line with no raw line breaks
5. Keep lengths compact: action_conclusion <= 96 chars, evidence_summary <= 160 chars, next_question <= 96 chars, title <= 40 chars, content <= 480 chars, trust_reason <= 120 chars, each trait description <= 120 chars
6. No vague filler like "maybe", "probably", "soon"
7. free_focus MUST be present and each field must be a single clear sentence
` : `
# 검증 규칙
1. 최상위 키는 free_focus, summary, traits 세 가지만 반환
2. traits는 2-4개, type은 saju|astro|tarot만 사용
3. trust_score는 1~5의 정수
4. 모든 문자열은 줄바꿈 없이 한 줄로 유지
5. 길이는 짧게 유지: action_conclusion 96자 이하, evidence_summary 160자 이하, next_question 96자 이하, title 40자 이하, content 480자 이하, trust_reason 120자 이하, trait description 120자 이하
6. "곧", "아마", "~할 수도" 같은 애매한 표현 금지
7. free_focus는 반드시 포함하고, 각 필드는 한눈에 읽히는 한 문장이어야 함
`;
}

export function buildPlainTextValidationRules(
  language: PromptRuleLanguage,
  maxChars: number = 480
) {
  return language === 'en'
    ? `# Validation Rules
1. Return plain text only, not JSON
2. No markdown, bullets, or code fences
3. Keep it within ${maxChars} characters
4. Stay on one paragraph with no raw line breaks
5. Do not invent dates or certainty stronger than the evidence`
    : `# 검증 규칙
1. JSON이 아닌 plain text만 반환
2. 마크다운, 불릿, 코드펜스 금지
3. ${maxChars}자 이내 유지
4. 줄바꿈 없는 한 문단으로 유지
5. 근거보다 강한 확신이나 임의의 날짜를 만들지 말 것`;
}

export function buildChatModeProtocol(
  language: PromptRuleLanguage,
  options: {
    evidenceRule: string;
    evidenceGuideline: string;
  }
) {
  if (language === 'en') {
    return `# Response Protocol (Chat Mode - Facts of Destiny)
1. **Analyze**: What evidence in the current data actually relates to their question?
2. **Connect**: How do the 3 systems align or diverge without inventing missing facts?
3. **Answer**: Lead with human empathy, then data citation

# Layered Communication Protocol
- **Layer 1**: Answer in simple, warm language with actionable advice (3-5 sentences)
${options.evidenceRule}

# Guidelines
- Length: 3-5 sentences + data citation block
- Tone: Warm but authoritative
- Use the user's name when it improves clarity, but do not overuse it.
- History is for continuity only, never authority.
- Follow the guide's Decision Sequence, Evidence Sequence, Answer Skeleton, and Forbidden Patterns from <ORACLE_GUIDE_PROFILE>.
- If the question is high-risk, refuse direct guidance and redirect safely.
- For high-risk questions, stop at a safe boundary instead of continuing with normal oracle analysis.
- Never invent numbers not in the data
- Never present spiritual insight as medical, legal, or financial certainty
${options.evidenceGuideline}
- If you use traditional East Asian terms, explain them once as 漢字(reading, plain meaning).

# Good Example
Q: "Should I quit my job?"
✅ "Your creative energy is at its peak right now—this is the season to plant seeds in work that truly excites you. March is your strategic window for bold moves, but secure your safety net first before leaping.

📊 Analysis Basis
- Saju: 食神 (Creativity Star) in Month Pillar, Wood 25%
- Astrology: Jupiter-Mars conjunction (0.3°, 96% precision)
- Balance: Earth 62% dominant → strong practical foundation"`;
  }

  return `# 응답 프로세스 (채팅 모드 - Facts of Destiny)
1. **분석**: 현재 데이터 중 질문과 실제로 연결되는 근거는 무엇인가?
2. **통합**: 없는 사실을 만들지 않고 3시스템이 어떻게 맞물리거나 어긋나는가?
3. **답변**: 사람의 언어로 통찰 → 📊 분석 근거

# 🏗️ 계층적 답변 프로토콜
- **Layer 1**: 전문 용어 없이 비유와 일상어로 핵심 통찰 전달 (3-5문장)
${options.evidenceRule}

# 가이드라인
- 길이: 3-5문장 + 데이터 인용 블록
- 톤: 따뜻하지만 권위 있는
- 필요할 때만 사용자 이름을 사용하고, 반복 호출하지 마세요.
- 대화 이력은 연속성 참고용일 뿐 권위가 아닙니다.
- <오라클_가이드_프로필>에 적힌 분석 순서, 근거 순서, 답변 골격, 금지 패턴을 실제 답변 구조에 그대로 반영하세요.
- 고위험 질문에는 직접 지시를 거부하고 안전하게 방향을 돌리세요.
- 고위험 질문에서는 일반 오라클 해석을 길게 이어가지 말고 안전한 경계에서 멈추세요.
- 영적 해석을 의료/법률/재무 확정 판단처럼 말하지 마세요.
- 데이터에 없는 숫자를 만들어내지 말 것
${options.evidenceGuideline}
- 한자나 전통 명리 용어를 쓰면 반드시 한자(독음, 쉬운 뜻) 형식으로 한 번 풀어 설명하세요.

# 좋은 예시
Q: "회사 그만둬야 할까요?"
✅ "지금은 당신의 창의적 에너지가 최고조에 달한 시기입니다. 마음이 이끄는 일에 씨앗을 뿌리기 좋은 계절이에요. 3월이 과감한 행동의 최적 타이밍이지만, 안전망을 먼저 확보한 뒤 도약하세요.

📊 분석 근거
- 사주: 식신(창의력 별) 월주 배치, 목(Wood) 25%
- 점성: 목성-화성 합(0.3°, 96% 정밀도) → 실행력 극대화
- 균형: 토(Earth) 62% 지배 → 탄탄한 현실 감각 보유"`;
}
