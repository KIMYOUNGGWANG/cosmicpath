/** 직업 키워드 한 조각 */
export interface CareerKeyword {
  rank: number;
  keyword: string;       // 예: "콘텐츠 크리에이터"
  reason: string;        // 사주/점성술 근거 1줄
  compatibility: number; // 0~100 (레이더 차트용)
}

export const CAREER_AURA_COLORS = [
  'violet',
  'gold',
  'emerald',
  'crimson',
  'azure',
] as const;

export type CareerAuraColor = (typeof CAREER_AURA_COLORS)[number];

export const CAREER_WORRY_TYPES = [
  'transition',
  'first_job',
  'promotion',
  'burnout',
] as const;

export type CareerWorryType = (typeof CAREER_WORRY_TYPES)[number];

export const CAREER_WORRY_OPTIONS: ReadonlyArray<{
  value: CareerWorryType;
  label: string;
}> = [
  { value: 'transition', label: '이직 타이밍' },
  { value: 'first_job', label: '첫 직장 향방' },
  { value: 'promotion', label: '승진 및 평가' },
  { value: 'burnout', label: '직장 번아웃' },
];

export interface CareerInputValues {
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  worryType: CareerWorryType;
}

export type CareerReadingMetadata = Record<string, unknown> & {
  context: 'career';
  isPremium: boolean;
  source: string;
  birthDate?: string;
  birthTime?: string;
  gender: 'male' | 'female';
  worryType: CareerWorryType;
};

/** Career Oracle 최종 결과 리포트 */
export interface CareerKeywordsReport {
  keywords: CareerKeyword[]; // 최대 3개
  timingInsight: string;     // 올해 시운 요약 (사주, 1~2문장)
  talentInsight: string;     // 선천적 재능 요약 (점성술, 1~2문장)
  catchphrase: string;       // 1줄 캐치카피 (스몰 스냅샷용)
  auraColor: CareerAuraColor;
}

/** Career Oracle 최종 결과 리포트 (Full) */
export interface CareerPremiumReport {
  readingId: string;
  sajuTiming: string;
  astrologyTalent: string;
  tarotAdvice: string;
  actionPlan: string[];
  snapshot: string;
  phase1_pastAnalysis: string;
  phase2_timing: string;
  phase3_keywords: string[];
}

export interface CareerTeaserResponse {
  hook: string;
}

export interface CareerUnlockResponse {
  unlocked: true;
  report: CareerPremiumReport;
  metadata: unknown;
  readingId: string;
}

export interface CareerProxyFormValues {
  friendName: string;
  friendBirthDate: string;
  friendBirthTime: string;
  friendGender: string;
}

export interface CareerProxyResponse {
  success: boolean;
  proxySessionId: string;
  usedCount: number;
  maxCount: number;
  report: CareerKeywordsReport;
  metadata: {
    friendName?: string;
    sajuResult?: unknown;
    astrology?: {
      sunSign: number;
      moonSign: number;
    };
  };
}
