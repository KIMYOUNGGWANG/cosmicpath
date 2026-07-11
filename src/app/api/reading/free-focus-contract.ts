import { z } from 'zod';
import {
  DECISION_ACTION_VERDICTS,
  isDecisionActionVerdict,
  type DecisionActionContract,
} from '@/lib/ai/decision-action-contract';
import type { OracleQuestionIntent } from '@/lib/ai/oracle-personas';

export type FreeFocusLanguage = 'ko' | 'en';
type DecisionActionVerdict = typeof DECISION_ACTION_VERDICTS[number];

const FORBIDDEN_GAEUN_ACTION_PATTERN =
  /(?:치료|임상|진단|투약|상담\s*치료|반드시|무조건|100%|보장|답장하게|guarantee|guaranteed|clinical|therapy|therapeutic|diagnosis|treatment|make\s+them\s+respond)/iu;

const GaeunActionSchema = z.string().trim().min(1).max(180).refine(
  (value) => isSafeGaeunAction(value),
  'gaeun_action must be bounded, non-clinical, non-therapeutic, and non-guarantee.'
);

export const FreeFocusSchema = z.object({
  decision_label: z.enum(DECISION_ACTION_VERDICTS),
  delayed_choice: z.string().min(1).max(160),
  timing_boundary: z.string().min(1).max(180),
  first_action: z.string().min(1).max(180),
  avoid: z.string().min(1).max(180),
  confidence_note: z.string().min(1).max(180),
  copy_ready_message: z.string().min(1).max(180).optional(),
  gaeun_action: GaeunActionSchema.optional(),
  action_conclusion: z.string().min(1).max(280),
  evidence_summary: z.string().min(1).max(360),
  next_question: z.string().min(1).max(96),
});

export const FreeFocusCoreSchema = z.object({
  decision_label: z.enum(DECISION_ACTION_VERDICTS).optional(),
  delayed_choice: z.string().min(1).max(160).optional(),
  timing_boundary: z.string().min(1).max(180).optional(),
  first_action: z.string().min(1).max(180).optional(),
  avoid: z.string().min(1).max(180).optional(),
  confidence_note: z.string().min(1).max(180).optional(),
  copy_ready_message: z.string().min(1).max(180).optional(),
  gaeun_action: GaeunActionSchema.optional(),
  action_conclusion: z.string().min(1).max(280),
  evidence_summary: z.string().min(1).max(360),
  next_question: z.string().min(1).max(96),
});

export type FreeFocusPayload = z.infer<typeof FreeFocusSchema>;

export function sanitizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function takeLeadSentences(text: string, maxLength = 160): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  const sentences = normalized.split(/(?<=[.!?。])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
  if (sentences.length === 0) return normalized.slice(0, maxLength).trim();

  let collected = '';
  for (const sentence of sentences) {
    const candidate = collected ? `${collected} ${sentence}` : sentence;
    if (candidate.length > maxLength && collected) break;
    collected = candidate.slice(0, maxLength).trim();
    if (candidate.length >= maxLength) break;
  }
  return collected || normalized.slice(0, maxLength).trim();
}

function isSafeGaeunAction(value: string): boolean {
  return /[A-Za-z가-힣]/u.test(value) && !FORBIDDEN_GAEUN_ACTION_PATTERN.test(value);
}

function sanitizeGaeunAction(value: unknown): string {
  const text = sanitizeText(value);
  return text.length > 0 && text.length <= 180 && isSafeGaeunAction(text) ? text : '';
}

function buildFallbackGaeunAction(params: {
  readonly firstAction: string;
  readonly avoid: string;
  readonly language: FreeFocusLanguage;
}): string {
  const firstAction = takeLeadSentences(params.firstAction, 86);
  const avoid = takeLeadSentences(params.avoid, 72);
  const candidate = params.language === 'en'
    ? `Gaeun action: ${firstAction} Avoid first: ${avoid}`
    : `가은 액션: ${firstAction} 먼저 피할 것: ${avoid}`;
  const safeCandidate = sanitizeGaeunAction(takeLeadSentences(candidate, 180));
  if (safeCandidate) return safeCandidate;
  return params.language === 'en'
    ? 'Gaeun action: write one evidence-based next step today, and avoid forcing an outcome.'
    : '가은 액션: 오늘 근거 기반 다음 행동 하나를 적고, 결과를 억지로 만들려는 행동은 피하세요.';
}

function fallbackMap<T extends string>(map: Record<T, Record<FreeFocusLanguage, string>>, key: T, language: FreeFocusLanguage): string {
  return map[key][language];
}

function buildFallbackActionConclusion(questionIntent: OracleQuestionIntent, language: FreeFocusLanguage): string {
  return fallbackMap({
    general: { ko: '선택지 축소: 지금은 감정 반응보다 패턴을 먼저 읽고, 이번 주 안에 기준 3개로 다음 한 수를 정리하세요.', en: 'Narrow the option: read the pattern before reacting emotionally, then define three decision criteria this week.' },
    compatibility: { ko: '지금 움직여도 됨: 상대를 바꾸려 하기보다 이번 주 안에 소통 방식부터 작게 조정하세요.', en: 'Move now: instead of trying to change the other person, adjust one communication pattern this week.' },
    reunion: { ko: '기다릴 것: 재회를 서두르기보다 이번 달에는 흐름을 안정시키고 반응 신호를 확인하세요.', en: 'Wait: instead of rushing reunion, stabilize the flow and confirm response signals this month.' },
    wealth: { ko: '아직 진행 금지: 확장보다 이번 달 현금 흐름과 손실 리스크를 먼저 정리하세요.', en: 'Do not proceed yet: prioritize cash flow and downside control this month before expansion.' },
    timing: { ko: '선택지 축소: 지금은 밀어붙이기보다 이번 주에 움직일 일과 기다릴 일을 분리하세요.', en: 'Narrow the option: separate what to move on and what to wait on this week before pushing ahead.' },
    career: { ko: '기다릴 것: 결정을 서두르기보다 이번 달 커리어 신호를 확인하고 준비를 정리하세요.', en: 'Wait: before making the career decision, confirm the signals and tighten your preparation this month.' },
    business: { ko: '아직 진행 금지: 확장보다 이번 주 병목과 수익 구조부터 먼저 검증하세요.', en: 'Do not proceed yet: validate the bottleneck and revenue structure this week before expanding.' },
  }, questionIntent, language);
}

function buildFallbackNextQuestion(questionIntent: OracleQuestionIntent, language: FreeFocusLanguage): string {
  return fallbackMap({
    general: { ko: '지금 흐름에서 먼저 멈춰야 할 것과 밀어야 할 것을 더 구체적으로 알려줘.', en: 'Tell me more specifically what I should stop forcing and what I should push forward now.' },
    compatibility: { ko: '이 관계에서 내가 먼저 조정해야 할 소통 패턴은 뭐야?', en: 'What communication pattern should I adjust first in this relationship?' },
    reunion: { ko: '재회를 원한다면 지금 내 쪽에서 먼저 바꿔야 할 행동은 뭐야?', en: 'If I want reunion, what should I change on my side first?' },
    wealth: { ko: '이번 달엔 확장과 방어 중 어디에 더 무게를 둬야 해?', en: 'This month, should I lean more toward expansion or protection?' },
    timing: { ko: '지금 움직여야 할 시기와 더 기다려야 할 시기를 나눠서 말해줘.', en: 'Break down when I should move now and when I should wait longer.' },
    career: { ko: '이직을 밀어붙이기 전에 확인해야 할 신호 한 가지는 뭐야?', en: 'What is the one signal I should confirm before pushing this career move?' },
    business: { ko: '이 사업에서 가장 먼저 검증해야 할 병목은 뭐야?', en: 'What bottleneck should I validate first in this business?' },
  }, questionIntent, language);
}

function buildFallbackDelayedChoice(params: {
  readonly question?: string;
  readonly questionIntent: OracleQuestionIntent;
  readonly language: FreeFocusLanguage;
}): string {
  const question = takeLeadSentences(params.question ?? '', 140);
  if (question) return question;
  return fallbackMap({
    general: { ko: '지금 미루고 있는 선택 하나', en: 'The delayed choice in front of you' },
    compatibility: { ko: '관계에서 먼저 조정할 행동', en: 'The relationship move to adjust first' },
    reunion: { ko: '재회를 서두를지 기다릴지', en: 'Whether to rush reunion or wait' },
    wealth: { ko: '돈 문제에서 확장할지 방어할지', en: 'Whether to expand or protect financially' },
    timing: { ko: '지금 움직일지 더 기다릴지', en: 'Whether to move now or wait longer' },
    career: { ko: '커리어에서 옮길지 더 다질지', en: 'Whether to move or build deeper in career' },
    business: { ko: '사업을 확장할지 먼저 검증할지', en: 'Whether to expand or validate the business first' },
  }, params.questionIntent, params.language);
}

function buildDecisionFallback(map: Record<DecisionActionVerdict, Record<FreeFocusLanguage, string>>, decisionAction: DecisionActionContract, language: FreeFocusLanguage): string {
  return map[decisionAction.defaultVerdict][language];
}

function buildFallbackTimingBoundary(decisionAction: DecisionActionContract, language: FreeFocusLanguage): string {
  return buildDecisionFallback({
    move_now: { ko: '이번 주 안에 첫 행동을 시작하고, 결과는 다음 2주 안에 다시 확인하세요.', en: 'Start the first action this week, then review the result within the next two weeks.' },
    wait_with_deadline: { ko: '기다리되 무기한으로 두지 말고, 48시간에서 2주 사이에 재검토 기준을 정하세요.', en: 'Wait, but set a review boundary between 48 hours and two weeks instead of leaving it open-ended.' },
    narrow_first: { ko: '이번 주 안에 조건을 좁히고, 다음 2주 안에 움직일지 보류할지 정하세요.', en: 'Narrow the criteria this week, then decide within two weeks whether to move or hold.' },
    hold_or_stop: { ko: '지금은 멈추고, 안전 조건이나 추가 근거가 생긴 뒤에만 다시 검토하세요.', en: 'Stop now, and review only after safety conditions or stronger evidence appear.' },
  }, decisionAction, language);
}

function buildFallbackFirstAction(decisionAction: DecisionActionContract, language: FreeFocusLanguage): string {
  return buildDecisionFallback({
    move_now: { ko: '오늘 바로 작게 실행할 수 있는 첫 단계 하나를 완료하세요.', en: 'Complete one small first step you can take today.' },
    wait_with_deadline: { ko: '기다리는 동안 확인할 신호 하나와 재검토 날짜를 적어두세요.', en: 'Write down one signal to watch and the date you will review it.' },
    narrow_first: { ko: '선택 기준 3개를 적고, 맞지 않는 선택지를 먼저 제거하세요.', en: 'Write three criteria and remove the option that does not fit them.' },
    hold_or_stop: { ko: '오늘은 행동을 멈추고 안전한 경계나 전문가 확인을 먼저 잡으세요.', en: 'Pause the action today and set a safer boundary or professional check first.' },
  }, decisionAction, language);
}

function buildFallbackAvoid(decisionAction: DecisionActionContract, language: FreeFocusLanguage): string {
  return buildDecisionFallback({
    move_now: { ko: '준비가 끝났다는 느낌을 기다리느라 첫 행동을 미루지 마세요.', en: 'Do not delay the first step while waiting to feel fully ready.' },
    wait_with_deadline: { ko: '무기한 기다리거나 불안해서 중간에 여러 번 확인하지 마세요.', en: 'Do not wait indefinitely or check repeatedly from anxiety.' },
    narrow_first: { ko: '모든 선택지를 동시에 붙잡고 결정을 더 흐리지 마세요.', en: 'Do not hold every option at once and blur the decision further.' },
    hold_or_stop: { ko: '근거보다 강하게 밀어붙이거나 고위험 결정을 혼자 확정하지 마세요.', en: 'Do not push beyond the evidence or make a high-risk decision alone.' },
  }, decisionAction, language);
}

export function buildFreeFocusFallback(
  report: Record<string, unknown>,
  params: {
    readonly questionIntent: OracleQuestionIntent;
    readonly decisionAction: DecisionActionContract;
    readonly language: FreeFocusLanguage;
    readonly advisorEvidenceSummary: string;
    readonly question?: string;
  }
): FreeFocusPayload {
  const summary = isRecord(report.summary) ? report.summary : {};
  const finalVerdict = isRecord(report.final_verdict) ? report.final_verdict : {};
  const actionSource = sanitizeText(isRecord(report.free_focus) ? report.free_focus.action_conclusion : null) ||
    takeLeadSentences(sanitizeText(finalVerdict.core_message), 120) ||
    buildFallbackActionConclusion(params.questionIntent, params.language);
  const evidenceSource = takeLeadSentences(
    sanitizeText(isRecord(report.free_focus) ? report.free_focus.evidence_summary : null) ||
    params.advisorEvidenceSummary ||
    sanitizeText(summary.trust_reason) ||
    sanitizeText(summary.content),
    170
  );
  const firstAction = buildFallbackFirstAction(params.decisionAction, params.language);
  const avoid = buildFallbackAvoid(params.decisionAction, params.language);

  return {
    decision_label: params.decisionAction.defaultVerdict,
    delayed_choice: buildFallbackDelayedChoice(params),
    timing_boundary: buildFallbackTimingBoundary(params.decisionAction, params.language),
    first_action: firstAction,
    avoid,
    confidence_note: evidenceSource || buildFallbackActionConclusion(params.questionIntent, params.language),
    gaeun_action: buildFallbackGaeunAction({ firstAction, avoid, language: params.language }),
    action_conclusion: actionSource,
    evidence_summary: evidenceSource || buildFallbackActionConclusion(params.questionIntent, params.language),
    next_question: sanitizeText(isRecord(report.free_focus) ? report.free_focus.next_question : null) ||
      buildFallbackNextQuestion(params.questionIntent, params.language),
  };
}

export function normalizeFreeFocus(
  report: Record<string, unknown>,
  params: {
    readonly questionIntent: OracleQuestionIntent;
    readonly decisionAction: DecisionActionContract;
    readonly language: FreeFocusLanguage;
    readonly advisorEvidenceSummary: string;
    readonly question?: string;
  }
): FreeFocusPayload {
  const fallback = buildFreeFocusFallback(report, params);
  const existingFreeFocus = isRecord(report.free_focus) ? report.free_focus : {};
  const firstAction = sanitizeText(existingFreeFocus.first_action) || fallback.first_action;
  const avoid = sanitizeText(existingFreeFocus.avoid) || fallback.avoid;

  return {
    decision_label: isDecisionActionVerdict(existingFreeFocus.decision_label) ? existingFreeFocus.decision_label : fallback.decision_label,
    delayed_choice: sanitizeText(existingFreeFocus.delayed_choice) || fallback.delayed_choice,
    timing_boundary: sanitizeText(existingFreeFocus.timing_boundary) || fallback.timing_boundary,
    first_action: firstAction,
    avoid,
    confidence_note: sanitizeText(existingFreeFocus.confidence_note) || fallback.confidence_note,
    ...(sanitizeText(existingFreeFocus.copy_ready_message)
      ? { copy_ready_message: sanitizeText(existingFreeFocus.copy_ready_message) }
      : {}),
    gaeun_action: sanitizeGaeunAction(existingFreeFocus.gaeun_action) ||
      buildFallbackGaeunAction({ firstAction, avoid, language: params.language }),
    action_conclusion: sanitizeText(existingFreeFocus.action_conclusion) || fallback.action_conclusion,
    evidence_summary: sanitizeText(existingFreeFocus.evidence_summary) || fallback.evidence_summary,
    next_question: sanitizeText(existingFreeFocus.next_question) || fallback.next_question,
  };
}
