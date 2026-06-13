export const REPORT_SIGNAL_TYPES = [
  'saju_structure',
  'astrology_timing',
  'tarot_immediate',
  'decision_action',
  'uncertainty_boundary',
  'source_boundary',
] as const;

export const EVAL_CONTEXTS = ['love', 'career', 'money', 'health', 'general'] as const;

export type ReportSignal = (typeof REPORT_SIGNAL_TYPES)[number];
export type EvalContext = (typeof EVAL_CONTEXTS)[number];
export type EvalLanguage = 'ko' | 'en';
export type DominantLayer = 'saju' | 'astrology' | 'tarot';

export type PartnerInput = {
  readonly name: string;
  readonly birthDate: string;
  readonly birthTime: string;
};

export type PremiumReportEvalCase = {
  readonly id: string;
  readonly marketNeed: string;
  readonly name: string;
  readonly birthDate: string;
  readonly birthTime: string;
  readonly unknownTime: boolean;
  readonly context: EvalContext;
  readonly question: string;
  readonly language: EvalLanguage;
  readonly expected: {
    readonly dominantLayer: DominantLayer;
    readonly requiredSignals: readonly ReportSignal[];
    readonly mustMention: readonly string[];
    readonly downgradeRules: readonly string[];
    readonly commercialValue: string;
  };
  readonly partner?: PartnerInput;
};

export type InvalidIntakeEvalCase = {
  readonly id: string;
  readonly name?: string;
  readonly birthDate?: string;
  readonly question?: string;
  readonly expectedMissingFields: readonly string[];
};

const REQUIRED_REPORT_SIGNALS = [
  'saju_structure',
  'astrology_timing',
  'tarot_immediate',
  'decision_action',
  'uncertainty_boundary',
  'source_boundary',
] as const satisfies readonly ReportSignal[];

export const PREMIUM_REPORT_EVAL_CASES = [
  buildCase('reunion-contact-boundary', '재회/연락 타이밍 수요', '민서', '1994-04-12', '08:40', false, 'love', '전 애인에게 다시 연락해도 되는 시점과 기준이 궁금해.', 'ko', 'saju', ['재회', '연락', '검증 창']),
  buildCase('job-change-offer-window', '이직 제안 판단 수요', '지훈', '1991-09-03', '21:15', false, 'career', '지금 받은 이직 제안을 받아도 될까, 아니면 3개월 더 기다릴까?', 'ko', 'saju', ['이직', '제안', '3개월']),
  buildCase('kim-vancouver-visa-premium', '밴쿠버 비자 만료/귀국 결정 수요', '김영광', '1993-08-02', '15:10', false, 'career', '나는 밴쿠버에서 버텨야 할지, 한국으로 돌아가야 할지 모르겠어. 11월에 비자가 만료되는데 어떻게 결정해야 할까?', 'ko', 'saju', ['밴쿠버', '한국', '비자', '11월']),
  buildCase('business-investment-risk', '창업/투자 리스크 판단 수요', '도윤', '1988-12-19', '23:30', false, 'money', '새 사업 투자를 이번 달에 시작해도 될까?', 'ko', 'saju', ['사업', '투자', '이번 달']),
  buildCase('money-recovery-boundary', '손실 회복/재정 결정 수요', '서연', '1996-01-22', '14:20', false, 'money', '손실을 회복하려고 더 공격적으로 움직여도 될까?', 'ko', 'saju', ['손실', '회복', '공격적']),
  buildCase('unknown-time-relationship', '생시 미상 관계 판단 수요', '하린', '1997-07-08', '12:00', true, 'love', '이 관계를 계속 이어가도 되는지 판단 기준이 필요해.', 'ko', 'saju', ['관계', '시간 미상', '판단 기준']),
  {
    ...buildCase('marriage-compatibility-choice', '결혼/궁합 의사결정 수요', '유나', '1990-05-17', '06:10', false, 'love', '이 사람과 결혼 결정을 진행해도 될까?', 'ko', 'saju', ['결혼', '궁합', '진행']),
    partner: { name: '상대방', birthDate: '1989-11-02', birthTime: '17:25' },
  },
  buildCase('founder-focus-burnout', '창업자 번아웃/우선순위 수요', '현우', '1986-03-29', '10:05', false, 'career', '내가 지금 밀어붙여야 할 일과 줄여야 할 일을 구분하고 싶어.', 'ko', 'saju', ['밀어붙임', '줄이기', '우선순위']),
  buildCase('layoff-recovery-plan', '퇴사/해고 이후 회복 계획 수요', '나린', '1992-10-11', '19:45', false, 'career', '퇴사 후 다음 커리어를 어떤 순서로 회복해야 할까?', 'ko', 'saju', ['퇴사', '다음 커리어', '순서']),
  buildCase('housing-contract-timing', '계약/이사 타이밍 수요', '태오', '1984-06-30', '04:55', false, 'general', '집 계약을 이번 주에 진행해도 되는지 확인하고 싶어.', 'ko', 'astrology', ['집 계약', '이번 주', '확인']),
  buildCase('family-boundary-decision', '가족/관계 경계 설정 수요', '은채', '1999-02-14', '16:35', false, 'general', '가족 요구를 어디까지 받아줘야 하는지 기준이 필요해.', 'ko', 'saju', ['가족', '요구', '기준']),
  buildCase('english-career-crossroads', 'English paid report readiness', 'Alex', '1993-08-02', '15:10', false, 'career', 'Should I accept the new role or keep building my own product?', 'en', 'saju', ['new role', 'own product', 'decision window']),
  buildCase('stress-health-boundary', '건강 불안/안전 경계 수요', '수아', '1995-09-25', '11:30', false, 'health', '스트레스가 심한데 생활 루틴을 어떻게 조정해야 할까?', 'ko', 'saju', ['스트레스', '생활 루틴', '의료 경계']),
] as const satisfies readonly PremiumReportEvalCase[];

export const INVALID_INTAKE_EVAL_CASES = [
  { id: 'question-only', question: '올해 커리어는 어때?', expectedMissingFields: ['name', 'birthDate'] },
  { id: 'missing-name', birthDate: '1993-08-02', question: '11월 비자 만료 전에 밴쿠버에 남을지 한국으로 돌아갈지 결정해야 해.', expectedMissingFields: ['name'] },
  { id: 'missing-birthdate', name: '민서', question: '재회 가능성이 있을까?', expectedMissingFields: ['birthDate'] },
  { id: 'missing-question', name: '도윤', birthDate: '1988-12-19', expectedMissingFields: ['question'] },
] as const satisfies readonly InvalidIntakeEvalCase[];

function buildCase(
  id: string,
  marketNeed: string,
  name: string,
  birthDate: string,
  birthTime: string,
  unknownTime: boolean,
  context: EvalContext,
  question: string,
  language: EvalLanguage,
  dominantLayer: DominantLayer,
  mustMention: readonly string[],
): PremiumReportEvalCase {
  return {
    id,
    marketNeed,
    name,
    birthDate,
    birthTime,
    unknownTime,
    context,
    question,
    language,
    expected: {
      dominantLayer,
      requiredSignals: REQUIRED_REPORT_SIGNALS,
      mustMention,
      downgradeRules: [
        'Birth date is required before premium CTA/report generation.',
        'Unknown birth time must downgrade ascendant, house, and hour-pillar certainty.',
        'Astrology can tune timing, but it must not replace the Saju structure layer.',
        'Tarot can shape the immediate next move, but it must not invent a guaranteed outcome.',
      ],
      commercialValue: 'A paid report must end in a bounded decision, review window, and concrete first action.',
    },
  };
}
