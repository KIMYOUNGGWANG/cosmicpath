import type { ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportData } from '@/components/reading/premium-report';
import type { ReadingContext } from '@/lib/ai/prompt-builder';

export type TarotSelection = {
  id: number;
  name: string;
  nameEn: string;
  keywords?: string[];
  interpretation?: string;
  isReversed: boolean;
  image?: string;
};

export type PremiumReportState = Partial<PremiumReportData> & {
  summary?: PremiumReportData['summary'] & { keywords?: string[] };
};

export type ResumeRequestContext = {
  readingId?: string | null;
  accessKey?: string | null;
};

export type StartReadingFn = (
  cards: TarotSelection[],
  isPremiumOverride?: boolean,
  readingDataOverride?: ReadingData,
  initialReport?: PremiumReportState,
  startPhaseOverride?: number,
  resumeContext?: ResumeRequestContext
) => Promise<void>;

export type KeyTheme = string | { tag?: string };

export type SourceSummaryRecord = Record<string, unknown> & { summary?: string };

export type ReadingMetadata = {
  tarot?: TarotSelection[] | SourceSummaryRecord;
  tarotCards?: TarotSelection[];
  radarScores?: { saju: number; astrology: number; ziwei?: number; tarot?: number };
  precisionMetadata?: {
    inputDate: string;
    inputTime: string;
    tstOffset: number;
    correctedDate: string;
    correctedTime: string;
    lon: number;
    hourPillar: string;
  };
  oracleCouncil?: { convergenceScore: number; ziweiSummary: string; natalSummary: string };
  characterId?: string;
  oraclePersona?: { id: string; name: string; title: string };
  language?: 'ko' | 'en';
  isPremium?: boolean;
  keyThemes?: KeyTheme[];
  saju?: { fullSaju?: string };
  sajuResult?: SourceSummaryRecord;
  astrology?: SourceSummaryRecord;
  astrologyResult?: SourceSummaryRecord;
  readingData?: ReadingData;
  [key: string]: unknown;
};

export type PremiumReportViewMetadata = {
  readingData?: (Record<string, unknown> & { name?: string }) | undefined;
  tarot?: TarotSelection[] | undefined;
  tarotCards?: TarotSelection[] | undefined;
  radarScores?: { saju: number; astrology: number; ziwei?: number; tarot?: number } | undefined;
  precisionMetadata?: ReadingMetadata['precisionMetadata'];
  oracleCouncil?: ReadingMetadata['oracleCouncil'];
  characterId?: string;
  oraclePersona?: { id: string; name: string; title: string } | undefined;
  language?: 'ko' | 'en';
  isPremium?: boolean;
  sajuResult?: Record<string, unknown>;
  astrologyResult?: Record<string, unknown>;
};

export type ReadingStep = 'input' | 'tarot' | 'reveal' | 'result';

export type SavedReadingSnapshot = {
  success?: boolean;
  id?: string;
  data?: PremiumReportState | null;
  metadata?: (ReadingMetadata & { readingData?: ReadingData }) | null;
};

const SUPPORTED_READING_CONTEXTS: ReadonlySet<ReadingContext> = new Set([
  'career',
  'love',
  'money',
  'health',
  'general',
]);

const DECISION_TIMING_ENTRY_SOURCES: ReadonlySet<string> = new Set([
  'decision_timing_rebuild_v1',
  'career_timing_wedge_399',
  'next_move_report_mvp_v1',
  'relationship_contact_timing_v1',
  'en_relationship_contact_timing_v1',
]);

export function getPrefilledReadingContext(value: string | null): ReadingContext | undefined {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();
  if (SUPPORTED_READING_CONTEXTS.has(normalized as ReadingContext)) {
    return normalized as ReadingContext;
  }

  return undefined;
}

export function getPrefilledQuestion(value: string | null): string | undefined {
  if (!value) return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  return normalized.slice(0, 240);
}

export function getPrefilledScenario(value: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, 100) : undefined;
}

export interface ScenarioPresetDefinition {
  context: ReadingContext;
  questionKo: string;
  questionEn: string;
  scenarioAKo: string;
  scenarioAEn: string;
  scenarioBKo: string;
  scenarioBEn: string;
}

export const PRESET_SCENARIOS: Record<string, ScenarioPresetDefinition> = {
  career_jump: {
    context: 'career',
    questionKo: '스타트업/새 포지션 이직 vs 현 직장 잔류 및 내실 다지기',
    questionEn: 'Accept high-growth job offer vs Stay at current role',
    scenarioAKo: '새로운 회사/포지션으로 이직 실행',
    scenarioAEn: 'Accept job offer and transition',
    scenarioBKo: '현 직장 잔류 및 리스크 방어',
    scenarioBEn: 'Stay in current position and build capital',
  },
  startup_founding: {
    context: 'money',
    questionKo: '독립 창업 및 사이드 프로젝트 런칭 vs 직장인 신분 유지',
    questionEn: 'Launch independent startup vs Keep employment stability',
    scenarioAKo: '독립 창업 및 사업자 등록 추진',
    scenarioAEn: 'Launch startup and pursue independent venture',
    scenarioBKo: '직장 유지하며 실탄 비축',
    scenarioBEn: 'Maintain salary stability and build savings',
  },
  relationship_decision: {
    context: 'love',
    questionKo: '먼저 연락하여 관계 매듭짓기 vs 침묵 유지 및 상대 행동 관망',
    questionEn: 'Initiate direct contact vs Maintain silence and observe',
    scenarioAKo: '먼저 대화를 시도하여 담판',
    scenarioAEn: 'Reach out first and establish clear boundaries',
    scenarioBKo: '연락을 멈추고 관망',
    scenarioBEn: 'Hold silence and let the situation unfold',
  },
};

export function getScenarioPreset(presetKey: string | null | undefined, language: 'ko' | 'en' = 'ko') {
  if (!presetKey) return undefined;
  const normalized = presetKey.trim().toLowerCase();
  const preset = PRESET_SCENARIOS[normalized];
  if (!preset) return undefined;

  const isEn = language === 'en';
  return {
    context: preset.context,
    question: isEn ? preset.questionEn : preset.questionKo,
    scenarioA: isEn ? preset.scenarioAEn : preset.scenarioAKo,
    scenarioB: isEn ? preset.scenarioBEn : preset.scenarioBKo,
  };
}

export function getStartPageSource(hasInvite: boolean, entry: string | null): string {
  if (hasInvite) {
    return 'start_page_invite';
  }

  const normalizedEntry = entry?.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_');

  if (!normalizedEntry) {
    return 'start_page';
  }

  if (
    DECISION_TIMING_ENTRY_SOURCES.has(normalizedEntry)
  ) {
    return normalizedEntry;
  }

  return `start_page_${normalizedEntry}`.slice(0, 64);
}

export function isDecisionTimingSource(source: string): boolean {
  return DECISION_TIMING_ENTRY_SOURCES.has(source);
}

export function getSourceSummary(value: unknown, fallback: string) {
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const summary = (value as SourceSummaryRecord).summary;
  return typeof summary === 'string' && summary.trim() ? summary : fallback;
}

export function isTarotSelection(value: unknown): value is TarotSelection {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof (value as TarotSelection).id === 'number' &&
    typeof (value as TarotSelection).name === 'string' &&
    typeof (value as TarotSelection).nameEn === 'string' &&
    Array.isArray((value as TarotSelection).keywords) &&
    typeof (value as TarotSelection).interpretation === 'string' &&
    typeof (value as TarotSelection).isReversed === 'boolean'
  );
}

export function normalizeStoredTarotCards(cards: unknown): TarotSelection[] {
  if (!Array.isArray(cards)) {
    return [];
  }

  return cards.flatMap((card, index) => {
    if (isTarotSelection(card)) {
      return [card];
    }

    if (!card || typeof card !== 'object') {
      return [];
    }

    const partialCard = card as { id?: number; name?: string; nameEn?: string; isReversed?: boolean; keywords?: string[]; interpretation?: string };
    return [{
      id: typeof partialCard.id === 'number' ? partialCard.id : index,
      name: partialCard.name || 'Celestial Signal',
      nameEn: partialCard.nameEn || 'Celestial Signal',
      keywords: Array.isArray(partialCard.keywords) ? partialCard.keywords : [],
      interpretation: partialCard.interpretation || '',
      isReversed: Boolean(partialCard.isReversed),
    }];
  });
}

export function hasPremiumReportContent(report: PremiumReportState | null): report is PremiumReportData {
  return Boolean(report?.summary && report?.traits);
}

export function getReadingPhaseLabels(language: 'ko' | 'en', tier: 'free' | 'premium') {
  if (tier === 'free') {
    const labelsKo = [
      '',
      '움직일지 기다릴지 먼저 판정하는 중... (1/2)',
      '근거와 다음 행동을 압축하는 중... (2/2)',
    ];
    const labelsEn = [
      '',
      'Judging whether to move or wait... (1/2)',
      'Compressing the evidence and next action... (2/2)',
    ];

    return language === 'en' ? labelsEn : labelsKo;
  }

  const labelsKo = [
    '',
    '질문에 맞는 가이드를 정리 중... (1/8)',
    '점성술 심층 신호를 해석 중... (2/8)',
    '자미두수와 수비학 흐름을 교차 확인 중... (3/8)',
    '사주 원국을 계산 중... (4/8)',
    '변곡점과 흐름을 읽는 중... (5/8)',
    '분야별 포인트를 정리 중... (6/8)',
    '언제 움직일지 정리 중... (7/8)',
    '첫 결론을 마무리 중... (8/8)',
  ];
  const labelsEn = [
    '',
    'Aligning the decision lens... (1/8)',
    'Reading your deeper astrology signals... (2/8)',
    'Cross-checking Ziwei and numerology... (3/8)',
    'Calculating your saju foundation... (4/8)',
    'Mapping the flow and turning points... (5/8)',
    'Weaving signals across life areas... (6/8)',
    'Opening your action window and timing map... (7/8)',
    'Finishing the final decision note... (8/8)',
  ];

  return language === 'en' ? labelsEn : labelsKo;
}
