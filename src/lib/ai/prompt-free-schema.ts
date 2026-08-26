import type {
  PromptRuleLanguage,
  StructuredPromptMode,
} from './prompt-rule-types';

export function buildFreeStructuredJsonSchema(
  language: PromptRuleLanguage,
  mode: Exclude<StructuredPromptMode, 'premium'>
) {
  const isEn = language === 'en';

  if (mode === 'free-core') {
    return isEn ? `
# JSON Structure (Free Reading Phase 1)

\`\`\`json
{
  "free_focus": {
    "decision_label": "move_now|wait_with_deadline|narrow_first|hold_or_stop",
    "delayed_choice": "The core dilemma/decision the user brought",
    "timing_boundary": "Action or review window grounded in chart timing",
    "first_action": "The immediate strategic move or mindset shift (no generic self-help tasks)",
    "avoid": "The primary risk pattern or trap to avoid (grounded in chart clash)",
    "confidence_note": "Consensus summary between Saju structure and Astrology timing",
    "copy_ready_message": "Optional empowering key phrase",
    "gaeun_action": "Practical real-world energy-balancing ritual/action",
    "action_conclusion": "Decisive, captivating verdict in natural human language. DO NOT prefix with 'narrow_first:' or enum names.",
    "evidence_summary": "1-2 lines grounded in Saju Day Master/Luck & Astrology Transits",
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
    "decision_label": "move_now|wait_with_deadline|narrow_first|hold_or_stop",
    "delayed_choice": "사용자가 질문한 핵심 고민/갈림길",
    "timing_boundary": "사주 대운 및 점성술 트랜짓 기반 최적의 행동/검토 시기",
    "first_action": "지금 취해야 할 가장 현명한 전략적 첫 방향 (뻔한 일기 쓰기/목록 적기 같은 자기계발 잔소리 금지)",
    "avoid": "사주 원국의 충/형 및 점성술 흉각에서 비롯되는 피해야 할 리스크",
    "confidence_note": "사주 구조와 점성술 타이밍의 일치도 진단 한 문장",
    "copy_ready_message": "가슴에 꽂히는 핵심 한 문장",
    "gaeun_action": "사주 부족 오행과 점성 행성 에너지를 보완하는 실전 개운 팁",
    "action_conclusion": "질문에 대한 소름 돋고 명쾌한 최종 결론 판정문. (절대 'narrow_first:', 'move_now:' 같은 영문 라벨을 본문에 쓰지 말고 자연스러운 완성형 한국어 문장으로 작성할 것)",
    "evidence_summary": "사주 일간/대운과 점성술 트랜짓이 가리키는 과거 변곡점 및 현재 에너지 요약",
    "next_question": "바로 이어서 물어볼 심층 질문 1개"
  },
  "summary": {
    "title": "기억에 남는 강렬한 헤드라인 (15-30자)"
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
    "decision_label": "move_now|wait_with_deadline|narrow_first|hold_or_stop",
    "delayed_choice": "The core dilemma/decision the user brought",
    "timing_boundary": "Action or review window grounded in chart timing",
    "first_action": "The immediate strategic move or mindset shift (no generic self-help tasks)",
    "avoid": "The primary risk pattern or trap to avoid (grounded in chart clash)",
    "confidence_note": "Consensus summary between Saju structure and Astrology timing",
    "copy_ready_message": "Optional empowering key phrase",
    "gaeun_action": "Practical real-world energy-balancing ritual/action",
    "action_conclusion": "Decisive, captivating verdict in natural human language. DO NOT prefix with 'narrow_first:' or enum names.",
    "evidence_summary": "1-2 lines grounded in Saju Day Master/Luck & Astrology Transits",
    "next_question": "One precise follow-up question"
  },
  "summary": {
    "title": "Memorable headline (10-20 words)",
    "content": "Deep psychological scan and past pivot insight integrating Saju & Astrology (3-4 sentences, max 480 chars)",
    "trust_score": 1-5,
    "trust_reason": "Clear causal basis connecting chart evidence with the verdict"
  },
  "traits": [
    {
      "type": "saju|astro|ziwei",
      "name": "Trait badge title",
      "description": "Sharp personality/destiny trait grounded in chart data",
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
    "decision_label": "move_now|wait_with_deadline|narrow_first|hold_or_stop",
    "delayed_choice": "사용자가 질문한 핵심 고민/갈림길",
    "timing_boundary": "사주 대운 및 점성술 트랜짓 기반 최적의 행동/검토 시기",
    "first_action": "지금 취해야 할 가장 현명한 전략적 첫 방향 (뻔한 일기 쓰기/목록 적기 같은 자기계발 잔소리 금지)",
    "avoid": "사주 원국의 충/형 및 점성술 흉각에서 비롯되는 피해야 할 리스크",
    "confidence_note": "사주 구조와 점성술 타이밍의 일치도 진단 한 문장",
    "copy_ready_message": "가슴에 꽂히는 핵심 한 문장",
    "gaeun_action": "사주 부족 오행과 점성 행성 에너지를 보완하는 실전 개운 팁",
    "action_conclusion": "질문에 대한 소름 돋고 명쾌한 최종 결론 판정문. (절대 'narrow_first:', 'move_now:' 같은 영문 라벨을 본문에 쓰지 말고 자연스러운 완성형 한국어 문장으로 작성할 것)",
    "evidence_summary": "사주 일간/대운과 점성술 트랜짓이 가리키는 과거 변곡점 및 현재 에너지 요약",
    "next_question": "바로 이어서 물어볼 심층 질문 1개"
  },
  "summary": {
    "title": "기억에 남는 강렬한 헤드라인 (15-30자)",
    "content": "사주와 점성술을 융합한 심리 투시 및 과거 변곡점 적중 통찰 (3-4문장, 480자 이내)",
    "trust_score": 1-5,
    "trust_reason": "원국의 글자 상호작용과 트랜짓 압력으로 증명하는 신뢰 근거"
  },
  "traits": [
    {
      "type": "saju|astro|ziwei",
      "name": "핵심 기질 뱃지 (15자 이하)",
      "description": "사주 원국과 점성술 배치에서 드러나는 선명한 기질 분석 한 문장",
      "grade": "S|A|B"
    }
  ]
}
\`\`\`
`;
}
