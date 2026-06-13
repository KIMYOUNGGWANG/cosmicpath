import type { PromptRuleLanguage } from './prompt-rule-types';

export function buildPremiumStructuredJsonSchema(
  language: PromptRuleLanguage,
  year: string
) {
  return language === 'en' ? `
# JSON Structure (Required Fields Only)

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
    "core_message": "3-4 sentences that synthesize Saju structure + Astrology timing + Tarot immediate signal",
    "saju_foundation": "...",
    "astro_support": "...",
    "tarot_insight": "...",
    "convergence_diagnosis": {
      "level": "all_aligned|two_aligned|divergent",
      "shared_signal": "Where the three sources point in the same direction",
      "conflict_note": "What source diverges or what uncertainty remains",
      "decision_rule": "How the alignment/conflict changes the next action",
      "verdict_modifier": "Confidence and action-size adjustment from the convergence level"
    },
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
    "title": "최종 3단 판정",
    "core_message": "사주 구조 + 점성 타이밍 + 타로 즉각 신호를 통합한 3-4문장",
    "saju_foundation": "...",
    "astro_support": "...",
    "tarot_insight": "...",
    "convergence_diagnosis": {
      "level": "all_aligned|two_aligned|divergent",
      "shared_signal": "세 원천이 같은 방향을 가리키는 공통 신호",
      "conflict_note": "엇갈리는 원천 또는 남은 불확실성",
      "decision_rule": "일치/충돌이 다음 행동을 어떻게 바꾸는지",
      "verdict_modifier": "수렴 수준에 따른 확신도와 행동 크기 조정"
    },
    "action_priorities": ["...", "...", "..."],
    "closing_words": "..."
  }
}
\`\`\`
`;
}
