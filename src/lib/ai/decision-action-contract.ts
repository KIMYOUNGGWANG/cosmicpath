export const DECISION_ACTION_VERDICTS = [
  'move_now',
  'wait_with_deadline',
  'narrow_first',
  'hold_or_stop',
] as const;

export const DECISION_QUESTION_JOBS = [
  'choose_or_time_action',
  'wants_timing_prediction',
  'wants_outcome_prediction',
  'needs_next_action',
  'broad_reading',
] as const;

export type DecisionActionVerdict = typeof DECISION_ACTION_VERDICTS[number];
export type DecisionQuestionJob = typeof DECISION_QUESTION_JOBS[number];

export interface DecisionActionContract {
  questionJob: DecisionQuestionJob;
  defaultVerdict: DecisionActionVerdict;
  decisionLabelKo: string;
  decisionLabelEn: string;
}

type DecisionActionInput = {
  question?: string | null;
  context?: string | null;
};

const VERDICT_LABELS: Record<DecisionActionVerdict, { ko: string; en: string }> = {
  move_now: { ko: '지금 움직이기', en: 'Move now' },
  wait_with_deadline: { ko: '기한을 두고 기다리기', en: 'Wait with a deadline' },
  narrow_first: { ko: '선택지 먼저 좁히기', en: 'Narrow first' },
  hold_or_stop: { ko: '보류하거나 멈추기', en: 'Hold or stop' },
};

const JOB_TO_DEFAULT_VERDICT: Record<DecisionQuestionJob, DecisionActionVerdict> = {
  choose_or_time_action: 'narrow_first',
  wants_timing_prediction: 'wait_with_deadline',
  wants_outcome_prediction: 'narrow_first',
  needs_next_action: 'move_now',
  broad_reading: 'narrow_first',
};

const HIGH_RISK_TERMS = [
  '자살',
  '자해',
  '죽고',
  '수술',
  '약 끊',
  '소송',
  '고소',
  '계약서',
  '레버리지',
  '몰빵',
  '스토킹',
  '감시',
  '협박',
  'suicide',
  'self-harm',
  'surgery',
  'medication',
  'lawsuit',
  'contract',
  'leverage',
  'all-in',
  'stalking',
  'threat',
] as const;

const CHOOSE_OR_TIME_TERMS = [
  '할까',
  '말까',
  '해야 할까',
  '해도 될까',
  '맞을까',
  '괜찮을까',
  '밀어붙',
  '버티',
  '기다릴까',
  '움직일까',
  '먼저',
  'should i',
  'or wait',
  'move now',
  'push forward',
  'hold back',
  'is it right',
] as const;

const TIMING_TERMS = [
  '언제',
  '언제쯤',
  '시기',
  '타이밍',
  '몇 월',
  '몇월',
  '기한',
  '때가',
  'when',
  'timing',
  'what month',
  'which month',
  'deadline',
  'window',
] as const;

const NEXT_ACTION_TERMS = [
  '어떻게',
  '뭐부터',
  '무엇부터',
  '다음 행동',
  '다음 단계',
  '첫 행동',
  '첫 단계',
  '첫 문장',
  'what should i do',
  'next step',
  'first step',
  'how should',
] as const;

const OUTCOME_TERMS = [
  '될까',
  '가능할까',
  '성공',
  '합격',
  '붙을까',
  '이뤄질까',
  '돌아올까',
  'will i',
  'can i',
  'possible',
  'succeed',
  'work out',
  'come back',
] as const;

function normalizeQuestion(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function hasAnyTerm(value: string, terms: readonly string[]): boolean {
  return terms.some((term) => value.includes(term));
}

function hasChoiceContrast(value: string): boolean {
  return /\b(or|versus|vs\.?)\b/u.test(value) || /,|\?|\/|아니면|혹은|대신|보다/u.test(value);
}

export function inferDecisionActionJob(input: DecisionActionInput): DecisionQuestionJob {
  const question = normalizeQuestion(input.question);

  if (!question) {
    return 'broad_reading';
  }

  if (hasAnyTerm(question, CHOOSE_OR_TIME_TERMS) && (question.includes('지금') || hasChoiceContrast(question))) {
    return 'choose_or_time_action';
  }

  if (hasAnyTerm(question, TIMING_TERMS)) {
    return 'wants_timing_prediction';
  }

  if (hasAnyTerm(question, NEXT_ACTION_TERMS)) {
    return 'needs_next_action';
  }

  if (hasAnyTerm(question, OUTCOME_TERMS)) {
    return 'wants_outcome_prediction';
  }

  return input.context === 'general' ? 'broad_reading' : 'needs_next_action';
}

export function inferDecisionActionVerdict(input: DecisionActionInput): DecisionActionVerdict {
  const question = normalizeQuestion(input.question);

  if (hasAnyTerm(question, HIGH_RISK_TERMS)) {
    return 'hold_or_stop';
  }

  return JOB_TO_DEFAULT_VERDICT[inferDecisionActionJob(input)];
}

export function buildDecisionActionContract(input: DecisionActionInput): DecisionActionContract {
  const questionJob = inferDecisionActionJob(input);
  const defaultVerdict = inferDecisionActionVerdict(input);
  const labels = VERDICT_LABELS[defaultVerdict];

  return {
    questionJob,
    defaultVerdict,
    decisionLabelKo: labels.ko,
    decisionLabelEn: labels.en,
  };
}

export function isDecisionActionVerdict(value: unknown): value is DecisionActionVerdict {
  return typeof value === 'string' && DECISION_ACTION_VERDICTS.includes(value as DecisionActionVerdict);
}

export function isDecisionQuestionJob(value: unknown): value is DecisionQuestionJob {
  return typeof value === 'string' && DECISION_QUESTION_JOBS.includes(value as DecisionQuestionJob);
}
