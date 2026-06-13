import type {
  PromptRuleLanguage,
  StructuredPromptMode,
} from './prompt-rule-types';

type StructuredValidationOptions = {
  readonly mode: StructuredPromptMode;
  readonly today: string;
};

export function buildStructuredValidationRules(
  language: PromptRuleLanguage,
  options: StructuredValidationOptions
) {
  const isEn = language === 'en';

  if (options.mode === 'premium') {
    return isEn ? `
# Validation Rules
1. All dates must be >= ${options.today}
2. Technical terms must have plain language in parentheses
3. Each section must cite at least 1 source (Saju/Astro/Tarot)
4. No vague phrases: "soon", "maybe", "probably"
5. final_verdict MUST include convergence_diagnosis with shared_signal, conflict_note, decision_rule, and verdict_modifier
6. final_verdict.core_message MUST synthesize Saju structure, Astrology timing, and Tarot immediate signal with all three roles active.
7. free_focus MUST include decision_label, delayed_choice, timing_boundary, first_action, avoid, confidence_note, action_conclusion, evidence_summary, and next_question; copy_ready_message is optional.
8. free_focus is the free brief; final_verdict is the paid three-layer verdict. Do not copy one into the other.
` : `
# 검증 규칙
1. 모든 날짜는 ${options.today} 이후여야 함
2. 전문 용어는 괄호 안 쉬운 말 병기
3. 각 섹션은 최소 1개 출처(사주/점성/타로) 인용
4. 애매한 표현 금지: "곧", "아마", "~할 수도"
5. final_verdict는 convergence_diagnosis의 shared_signal, conflict_note, decision_rule, verdict_modifier를 반드시 포함
6. final_verdict.core_message는 사주 구조, 점성 타이밍, 타로 즉각 신호를 합성하고 세 역할을 모두 살아 있게 쓸 것
7. free_focus는 decision_label, delayed_choice, timing_boundary, first_action, avoid, confidence_note, action_conclusion, evidence_summary, next_question을 반드시 포함하고, copy_ready_message는 선택
8. free_focus는 무료 브리프이고 final_verdict는 유료 3단 최종판정입니다. 둘을 복사해 같은 내용으로 만들지 마십시오.
`;
  }

  if (options.mode === 'free-core') {
    return isEn ? `
# Validation Rules
1. Return ONLY the two top-level keys: free_focus and summary
2. Every string must stay on one line with no raw line breaks
3. Keep lengths: delayed_choice <= 160 chars, timing_boundary <= 180 chars, first_action <= 180 chars, avoid <= 180 chars, confidence_note <= 180 chars, copy_ready_message <= 180 chars, action_conclusion <= 250 chars, evidence_summary <= 320 chars, next_question <= 96 chars, title <= 40 chars
4. No vague filler like "maybe", "probably", "soon"
5. Do not include summary.content, trust_score, or trust_reason in this phase
6. free_focus MUST include decision_label, delayed_choice, timing_boundary, first_action, avoid, confidence_note, action_conclusion, evidence_summary, and next_question. decision_label must be move_now, wait_with_deadline, narrow_first, or hold_or_stop.
` : `
# 검증 규칙
1. 최상위 키는 free_focus, summary 두 가지만 반환
2. 모든 문자열은 줄바꿈 없이 한 줄로 유지
3. 길이: delayed_choice 160자 이하, timing_boundary 180자 이하, first_action 180자 이하, avoid 180자 이하, confidence_note 180자 이하, copy_ready_message 180자 이하, action_conclusion 250자 이하, evidence_summary 320자 이하, next_question 96자 이하, title 40자 이하
4. "곧", "아마", "~할 수도" 같은 애매한 표현 금지
5. 이 단계에서는 summary.content, trust_score, trust_reason을 넣지 말 것
6. free_focus는 decision_label, delayed_choice, timing_boundary, first_action, avoid, confidence_note, action_conclusion, evidence_summary, next_question을 반드시 포함. decision_label은 move_now, wait_with_deadline, narrow_first, hold_or_stop 중 하나.
`;
  }

  return isEn ? `
# Validation Rules
1. Return ONLY the three top-level keys: free_focus, summary, traits
2. traits must contain 2-4 items and use only saju|astro|tarot for type
3. trust_score must be an integer from 1 to 5
4. Every string must stay on one line with no raw line breaks
5. Keep lengths: delayed_choice <= 160 chars, timing_boundary <= 180 chars, first_action <= 180 chars, avoid <= 180 chars, confidence_note <= 180 chars, copy_ready_message <= 180 chars, action_conclusion <= 250 chars, evidence_summary <= 320 chars, next_question <= 96 chars, title <= 40 chars, content <= 480 chars, trust_reason <= 120 chars, each trait description <= 120 chars
6. No vague filler like "maybe", "probably", "soon"
7. free_focus MUST include decision_label, delayed_choice, timing_boundary, first_action, avoid, confidence_note, action_conclusion, evidence_summary, and next_question; copy_ready_message is optional.
` : `
# 검증 규칙
1. 최상위 키는 free_focus, summary, traits 세 가지만 반환
2. traits는 2-4개, type은 saju|astro|tarot만 사용
3. trust_score는 1~5의 정수
4. 모든 문자열은 줄바꿈 없이 한 줄로 유지
5. 길이: delayed_choice 160자 이하, timing_boundary 180자 이하, first_action 180자 이하, avoid 180자 이하, confidence_note 180자 이하, copy_ready_message 180자 이하, action_conclusion 250자 이하, evidence_summary 320자 이하, next_question 96자 이하, title 40자 이하, content 480자 이하, trust_reason 120자 이하, trait description 120자 이하
6. "곧", "아마", "~할 수도" 같은 애매한 표현 금지
7. free_focus는 decision_label, delayed_choice, timing_boundary, first_action, avoid, confidence_note, action_conclusion, evidence_summary, next_question을 반드시 포함하고, copy_ready_message는 선택
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
