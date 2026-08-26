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

export function cleanActionVerdictText(text: string): string {
  if (!text) return '';
  return text.replace(/^(?:narrow_first|move_now|wait_with_deadline|hold_or_stop|선택지\s*좁히기|지금\s*움직이기|기한을\s*두고\s*기다리기|보류\s*또는\s*중단)\s*:\s*/iu, '').trim();
}

export function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return cleanActionVerdictText(value.trim());
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
    general: {
      ko: '단도직입 판정: 여러 갈래로 에너지를 분산시키지 마십시오. 당신의 명식은 잔가지를 쳐내고 단 하나의 핵심 킬러 무기에 집중할 때 비로소 운이 폭발합니다. 불필요한 일들을 정리하고 주도권을 잡으십시오.',
      en: 'Direct Verdict: Stop scattering your energy across too many fronts. Your chart unlocks its highest breakthrough only when you eliminate distractions and focus on one single core weapon.',
    },
    compatibility: {
      ko: '단도직입 판정: 상대를 억지로 바꾸려 하거나 참기만 하지 마십시오. 당신의 명식은 선을 넘는 순간 한 번에 관계를 끊는 패턴이 있으니, 감정 대신 명확한 경계 기준 1가지를 먼저 제시하십시오.',
      en: 'Direct Verdict: Do not try to force change or swallow your frustration. State one clear, calm boundary now before resentment triggers an abrupt detachment.',
    },
    reunion: {
      ko: '단도직입 판정: 지금 조급하게 장문의 연락을 보내면 상대의 방어기제만 자극합니다. 이번 달은 침묵으로 흐름을 반전시키고, 상대 쪽에서 신호가 올 때까지 내 축을 먼저 세우십시오.',
      en: 'Direct Verdict: Rushing to send an emotional message now will only trigger defensiveness. Hold your ground with calm silence this month until the reaction signals shift in your favor.',
    },
    wealth: {
      ko: '단도직입 판정: 무리한 분산 투자나 충동적 확장은 손실로 이어집니다. 당신의 차트는 현재 현금흐름 방어가 최우선이며, 하반기 골든 윈도우 전까지 새 판을 벌리지 말고 지출 누수를 먼저 막으십시오.',
      en: 'Direct Verdict: Premature expansion or speculative risk will trigger unnecessary leaks. Prioritize cash flow defense now and eliminate financial leaks before the upcoming golden window.',
    },
    timing: {
      ko: '단도직입 판정: 지금 억지로 결과를 밀어붙일 때가 아닙니다. 1~2개월 뒤 맞이할 대형 기회의 창(골든타임)을 위해 리소스를 비축하고, 이번 달은 내실을 다지는 전략적 대기를 택하십시오.',
      en: 'Direct Verdict: Do not force an outcome prematurely. Conserve your firepower and build leverage now to seize the massive timing window opening over the next 1-2 months.',
    },
    career: {
      ko: '단도직입 판정: 감정적인 즉시 퇴사나 섣부른 이직은 불리합니다. 당신의 차트에서 하반기 9~10월에 훨씬 유리한 제안과 협상 테이블이 열리니, 지금은 포트폴리오를 날카롭게 다듬으십시오.',
      en: 'Direct Verdict: Do not make an impulsive exit out of frustration. A far stronger negotiation window opens in Q3-Q4; spend this period sharpening your portfolio and leverage.',
    },
    business: {
      ko: '단도직입 판정: 외형 확장이나 무리한 마케팅 집행을 멈추십시오. 현재 구조에서 가장 새어나가는 현금 누수 병목 1개를 먼저 틀어막지 않으면 성장이 밑 빠진 독이 됩니다.',
      en: 'Direct Verdict: Pause outward expansion and excessive spend. Validate and fix the single biggest leak in your operational funnel before attempting to scale.',
    },
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
