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
    "delayed_choice": "The choice the user has been postponing",
    "timing_boundary": "When to act, wait, review, or stop",
    "first_action": "The first concrete action to take today",
    "avoid": "The move or risk to avoid first",
    "confidence_note": "One sentence about source agreement or uncertainty",
    "copy_ready_message": "Optional line or message only when useful",
    "action_conclusion": "Decision label plus one concrete next move",
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
    "decision_label": "move_now|wait_with_deadline|narrow_first|hold_or_stop",
    "delayed_choice": "사용자가 미루고 있는 선택",
    "timing_boundary": "움직일지, 기다릴지, 재검토할지, 멈출지의 시간 경계",
    "first_action": "오늘 바로 할 첫 행동",
    "avoid": "먼저 피해야 할 행동이나 리스크",
    "confidence_note": "근거 일치도 또는 불확실성 한 문장",
    "copy_ready_message": "필요할 때만 쓰는 선택적 문장 또는 메시지",
    "action_conclusion": "판정 라벨과 지금 붙잡을 행동 결론 1개",
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
    "decision_label": "move_now|wait_with_deadline|narrow_first|hold_or_stop",
    "delayed_choice": "The choice the user has been postponing",
    "timing_boundary": "When to act, wait, review, or stop",
    "first_action": "The first concrete action to take today",
    "avoid": "The move or risk to avoid first",
    "confidence_note": "One sentence about source agreement or uncertainty",
    "copy_ready_message": "Optional line or message only when useful",
    "action_conclusion": "Decision label plus one concrete next move",
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
    "decision_label": "move_now|wait_with_deadline|narrow_first|hold_or_stop",
    "delayed_choice": "사용자가 미루고 있는 선택",
    "timing_boundary": "움직일지, 기다릴지, 재검토할지, 멈출지의 시간 경계",
    "first_action": "오늘 바로 할 첫 행동",
    "avoid": "먼저 피해야 할 행동이나 리스크",
    "confidence_note": "근거 일치도 또는 불확실성 한 문장",
    "copy_ready_message": "필요할 때만 쓰는 선택적 문장 또는 메시지",
    "action_conclusion": "판정 라벨과 지금 붙잡을 행동 결론 1개",
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
