import { z } from 'zod';
import { generateInterpretationGuide } from '@/lib/core/conflict-resolver';
import { calculateAstrology, ZODIAC_SIGNS } from '@/lib/engines/astrology';
import type { TarotCard } from '@/lib/engines/tarot';
import {
  buildOracleAdvisorProfile,
  ORACLE_QUESTION_INTENTS,
  resolveOracleCharacterId,
  type OracleQuestionIntent,
  type OracleSelectionMode,
} from '@/lib/ai/oracle-personas';
import {
  buildOracleSajuPromptBlock,
  type OracleSajuProfile,
} from '@/lib/saju/saju-engine';

export const ReadingRequestSchema = z.object({
  name: z.string().optional().default(''),
  gender: z.enum(['male', 'female']).default('male'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '생년월일 형식이 올바르지 않습니다'),
  birthTime: z.string().default('12:00'),
  context: z.enum(['career', 'love', 'money', 'health', 'general']).default('general'),
  question: z.string().max(500).optional().default(''),
  partnerBirthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  partnerBirthTime: z.string().optional(),
  partnerGender: z.enum(['male', 'female']).optional(),
  partnerName: z.string().optional(),
  tarotCards: z.array(z.object({
    id: z.number(),
    name: z.string(),
    nameEn: z.string(),
    keywords: z.array(z.string()),
    interpretation: z.string(),
    isReversed: z.boolean(),
  })).optional(),
  tier: z.enum(['free', 'basic', 'premium']).default('free'),
  language: z.enum(['ko', 'en']).optional().default('ko'),
  phase: z.number().min(1).max(8).optional(),
  previousReport: z.object({}).passthrough().optional(),
  calendarType: z.enum(['solar', 'lunar']).default('solar'),
  unknownTime: z.boolean().default(false),
  cityName: z.string().optional(),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  questionIntent: z.enum(ORACLE_QUESTION_INTENTS).optional(),
  selectionMode: z.enum(['auto', 'manual']).optional().default('auto'),
  characterId: z.string().optional(),
  isPaid: z.boolean().default(false),
  inviteCode: z.string().optional(),
  readingId: z.string().optional(),
  accessKey: z.string().optional(),
});

export type ReadingLanguage = 'ko' | 'en';
export type ReadingGuideSnapshot = ReturnType<typeof generateInterpretationGuide>;
export type StoredLegacySajuResult = ReturnType<typeof mapToLegacySaju>;

export interface StoredReadingRuntime {
  guide: ReadingGuideSnapshot;
  saju: StoredLegacySajuResult;
  astrology: ReturnType<typeof calculateAstrology>;
  cards: TarotCard[];
  characterId: ReturnType<typeof resolveOracleCharacterId>;
  questionIntent: OracleQuestionIntent;
  selectionMode: OracleSelectionMode;
  advisorProfile: ReturnType<typeof buildOracleAdvisorProfile>;
  advisorEvidenceSummary: string;
  precisionMetadata?: OracleSajuProfile['precisionMetadata'] | null;
  oracleCouncil?: OracleSajuProfile['oracleCouncil'] | null;
  partnerSaju?: StoredLegacySajuResult | null;
}

interface FreeFocusPayload {
  action_conclusion: string;
  evidence_summary: string;
  next_question: string;
}

const FreeReadingTraitSchema = z.object({
  type: z.enum(['saju', 'astro', 'tarot']),
  name: z.string().min(1).max(32),
  description: z.string().min(1).max(120),
  grade: z.enum(['S', 'A', 'B']),
});

const FreeReadingReportSchema = z.object({
  free_focus: z.object({
    action_conclusion: z.string().min(1).max(280),
    evidence_summary: z.string().min(1).max(360),
    next_question: z.string().min(1).max(96),
  }),
  summary: z.object({
    title: z.string().min(1).max(40),
    content: z.string().min(1).max(720),
    trust_score: z.coerce.number().int().min(1).max(5),
    trust_reason: z.string().min(1).max(120),
  }),
  traits: z.array(FreeReadingTraitSchema).min(1).max(4),
});

export const FreeReadingCoreSchema = z.object({
  free_focus: z.object({
    action_conclusion: z.string().min(1).max(280),
    evidence_summary: z.string().min(1).max(360),
    next_question: z.string().min(1).max(96),
  }),
  summary: z.object({
    title: z.string().min(1).max(40),
  }),
});

type FreeReadingReport = z.infer<typeof FreeReadingReportSchema>;
export type FreeReadingCore = z.infer<typeof FreeReadingCoreSchema>;

const ZODIAC_SIGNS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

const FREE_READING_TITLES: Record<OracleQuestionIntent, Record<ReadingLanguage, string>> = {
  general: {
    ko: '지금 흐름에서 먼저 볼 한 수',
    en: 'The next move to read first',
  },
  compatibility: {
    ko: '관계에서 먼저 조정할 신호',
    en: 'The first relationship signal to adjust',
  },
  reunion: {
    ko: '재회 전에 먼저 안정시킬 흐름',
    en: 'What to stabilize before reunion',
  },
  wealth: {
    ko: '지금 돈 흐름에서 먼저 잡을 기준',
    en: 'The money signal to anchor first',
  },
  timing: {
    ko: '지금은 움직일지 더 기다릴지',
    en: 'Whether to move now or wait longer',
  },
  career: {
    ko: '커리어에서 먼저 선명해질 포인트',
    en: 'The career move to clarify first',
  },
  business: {
    ko: '사업에서 먼저 검증할 병목',
    en: 'The business bottleneck to validate first',
  },
};

const CONFIDENCE_TEXT_EN = {
  very_high: {
    message: 'Saju, natal timing, and tarot are converging in the same direction.',
    recommendation: 'Act with conviction, but keep execution disciplined.',
  },
  high: {
    message: 'Most signals are aligned in one workable direction.',
    recommendation: 'Follow the main current and stay flexible on details.',
  },
  medium: {
    message: 'The reading has a clear center, but there are still competing angles.',
    recommendation: 'Use the main signal, but leave room for alternatives.',
  },
  low: {
    message: 'Different systems are showing different angles right now.',
    recommendation: 'Avoid forcing one answer too early and compare options.',
  },
  very_low: {
    message: 'The signals conflict too much to force a definitive answer now.',
    recommendation: 'Wait, observe, and gather one more concrete signal first.',
  },
} as const;

export function sanitizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function extractEvidenceLine(summary: string, labels: string[]): string {
  const lines = summary.split('\n').map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    for (const label of labels) {
      const prefix = `- [${label}]`;
      if (line.startsWith(prefix)) {
        return line.slice(prefix.length).trim();
      }
    }
  }

  return '';
}

export function parseJsonRecord(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return {};
  }

  return {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isTarotCard(value: unknown): value is TarotCard {
  if (!isRecord(value)) return false;

  return typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.nameEn === 'string' &&
    Array.isArray(value.keywords) &&
    value.keywords.every((keyword) => typeof keyword === 'string') &&
    typeof value.interpretation === 'string' &&
    typeof value.isReversed === 'boolean';
}

function isQuestionIntent(value: unknown): value is OracleQuestionIntent {
  return typeof value === 'string' &&
    ORACLE_QUESTION_INTENTS.includes(value as OracleQuestionIntent);
}

function isSelectionMode(value: unknown): value is OracleSelectionMode {
  return value === 'auto' || value === 'manual';
}

function isAstrologyResult(value: unknown): value is ReturnType<typeof calculateAstrology> {
  return isRecord(value) &&
    typeof value.sunSign === 'number' &&
    typeof value.moonSign === 'number' &&
    typeof value.ascendant === 'number';
}

export function extractStoredReadingRuntime(metadata: Record<string, unknown>): StoredReadingRuntime | null {
  const confidence = isRecord(metadata.confidence) ? metadata.confidence : null;
  const matching = isRecord(metadata.matching) ? metadata.matching : null;
  const radarScores = isRecord(metadata.radarScores) ? metadata.radarScores : null;
  const keyThemes = Array.isArray(metadata.keyThemes) && metadata.keyThemes.every((item) => typeof item === 'string')
    ? metadata.keyThemes as string[]
    : null;
  const saju = isRecord(metadata.sajuResult) ? metadata.sajuResult as StoredLegacySajuResult : null;
  const astrology = isAstrologyResult(metadata.astrologyResult) ? metadata.astrologyResult : null;
  const questionIntent = isQuestionIntent(metadata.questionIntent) ? metadata.questionIntent : null;
  const selectionMode = isSelectionMode(metadata.selectionMode) ? metadata.selectionMode : null;
  const characterId = typeof metadata.characterId === 'string'
    ? resolveOracleCharacterId(metadata.characterId)
    : null;

  if (!confidence || !matching || !radarScores || !keyThemes || !saju || !astrology || !questionIntent || !selectionMode || !characterId) {
    return null;
  }

  const cards = Array.isArray(metadata.tarotCards) && metadata.tarotCards.every(isTarotCard)
    ? metadata.tarotCards as TarotCard[]
    : [];
  const advisorProfile = isRecord(metadata.advisorProfile)
    ? metadata.advisorProfile as unknown as ReturnType<typeof buildOracleAdvisorProfile>
    : buildOracleAdvisorProfile(characterId, selectionMode);
  const precisionMetadata = isRecord(metadata.precisionMetadata)
    ? metadata.precisionMetadata as unknown as OracleSajuProfile['precisionMetadata']
    : isRecord(metadata.precision)
      ? metadata.precision as unknown as OracleSajuProfile['precisionMetadata']
      : null;
  const oracleCouncil = isRecord(metadata.oracleCouncil)
    ? metadata.oracleCouncil as unknown as OracleSajuProfile['oracleCouncil']
    : null;
  const partnerSaju = isRecord(metadata.partnerSajuResult)
    ? metadata.partnerSajuResult as unknown as StoredLegacySajuResult
    : null;

  return {
    guide: {
      confidence: confidence as unknown as ReadingGuideSnapshot['confidence'],
      matching: matching as unknown as ReadingGuideSnapshot['matching'],
      radarScores: radarScores as unknown as ReadingGuideSnapshot['radarScores'],
      prioritySource: 'saju',
      tone: 'balanced',
      keyThemes,
      warnings: [],
    },
    saju,
    astrology,
    cards,
    characterId,
    questionIntent,
    selectionMode,
    advisorProfile,
    advisorEvidenceSummary: sanitizeText(metadata.advisorEvidenceSummary),
    precisionMetadata,
    oracleCouncil,
    partnerSaju,
  };
}

function takeLeadSentences(text: string, maxLength = 160): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const sentences = normalized
    .split(/(?<=[.!?。])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return normalized.slice(0, maxLength).trim();
  }

  let collected = '';
  for (const sentence of sentences) {
    const candidate = collected ? `${collected} ${sentence}` : sentence;
    if (candidate.length > maxLength && collected) {
      break;
    }
    collected = candidate.slice(0, maxLength).trim();
    if (candidate.length >= maxLength) {
      break;
    }
  }

  return collected || normalized.slice(0, maxLength).trim();
}

export function normalizeFreeSummaryContent(value: string): string {
  return takeLeadSentences(
    value
      .replace(/^```[a-z]*\s*/i, '')
      .replace(/\s*```$/i, '')
      .replace(/^["']|["']$/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
    480
  );
}

export function buildFreeSummaryPhaseTwoUserPrompt(params: {
  baseUserPrompt: string;
  previousReport?: unknown;
  language: ReadingLanguage;
}): string {
  const previousFreeReport = isRecord(params.previousReport) ? params.previousReport : {};
  const previousFreeFocus = isRecord(previousFreeReport.free_focus) ? previousFreeReport.free_focus : {};
  const previousSummary = isRecord(previousFreeReport.summary) ? previousFreeReport.summary : {};

  return params.language === 'en'
    ? `${params.baseUserPrompt}\n\n# Phase 1 Outline\n- Action conclusion: ${sanitizeText(previousFreeFocus.action_conclusion)}\n- Evidence summary: ${sanitizeText(previousFreeFocus.evidence_summary)}\n- Next question: ${sanitizeText(previousFreeFocus.next_question)}\n- Headline: ${sanitizeText(previousSummary.title)}\n\n# Phase 2 Task\nWrite only the final summary.content as plain text.\n- 3-4 short sentences\n- max 720 characters\n- no JSON, markdown, bullets, or code fences\n- turn the outline into one readable, decision-useful paragraph\n- 5-7 sentences: intro + saju evidence + astro evidence + 1-2 actions + closing`
    : `${params.baseUserPrompt}\n\n# 1단계 아웃라인\n- 행동 결론: ${sanitizeText(previousFreeFocus.action_conclusion)}\n- 근거 요약: ${sanitizeText(previousFreeFocus.evidence_summary)}\n- 다음 질문: ${sanitizeText(previousFreeFocus.next_question)}\n- 헤드라인: ${sanitizeText(previousSummary.title)}\n\n# 2단계 작업\n최종 summary.content 본문만 plain text로 작성하세요.\n- 5~7문장 (도입 1 + 사주 근거 1~2 + 점성 근거 1 + 행동 1~2 + 마무리 1)\n- 720자 이내\n- JSON, 마크다운, 불릿, 코드펜스 금지\n- 1단계 아웃라인을 실제 판단에 도움이 되는 한 문단으로 풀어쓰기`;
}

function buildFallbackActionConclusion(
  questionIntent: OracleQuestionIntent,
  language: ReadingLanguage
): string {
  const fallbackMap: Record<OracleQuestionIntent, Record<ReadingLanguage, string>> = {
    general: {
      ko: '선택지 축소: 지금은 감정 반응보다 패턴을 먼저 읽고, 이번 주 안에 기준 3개로 다음 한 수를 정리하세요.',
      en: 'Narrow the option: read the pattern before reacting emotionally, then define three decision criteria this week.',
    },
    compatibility: {
      ko: '지금 움직여도 됨: 상대를 바꾸려 하기보다 이번 주 안에 소통 방식부터 작게 조정하세요.',
      en: 'Move now: instead of trying to change the other person, adjust one communication pattern this week.',
    },
    reunion: {
      ko: '기다릴 것: 재회를 서두르기보다 이번 달에는 흐름을 안정시키고 반응 신호를 확인하세요.',
      en: 'Wait: instead of rushing reunion, stabilize the flow and confirm response signals this month.',
    },
    wealth: {
      ko: '아직 진행 금지: 확장보다 이번 달 현금 흐름과 손실 리스크를 먼저 정리하세요.',
      en: 'Do not proceed yet: prioritize cash flow and downside control this month before expansion.',
    },
    timing: {
      ko: '선택지 축소: 지금은 밀어붙이기보다 이번 주에 움직일 일과 기다릴 일을 분리하세요.',
      en: 'Narrow the option: separate what to move on and what to wait on this week before pushing ahead.',
    },
    career: {
      ko: '기다릴 것: 결정을 서두르기보다 이번 달 커리어 신호를 확인하고 준비를 정리하세요.',
      en: 'Wait: before making the career decision, confirm the signals and tighten your preparation this month.',
    },
    business: {
      ko: '아직 진행 금지: 확장보다 이번 주 병목과 수익 구조부터 먼저 검증하세요.',
      en: 'Do not proceed yet: validate the bottleneck and revenue structure this week before expanding.',
    },
  };

  return fallbackMap[questionIntent][language];
}

function buildFallbackNextQuestion(
  questionIntent: OracleQuestionIntent,
  language: ReadingLanguage
): string {
  const questionMap: Record<OracleQuestionIntent, Record<ReadingLanguage, string>> = {
    general: {
      ko: '지금 흐름에서 먼저 멈춰야 할 것과 밀어야 할 것을 더 구체적으로 알려줘.',
      en: 'Tell me more specifically what I should stop forcing and what I should push forward now.',
    },
    compatibility: {
      ko: '이 관계에서 내가 먼저 조정해야 할 소통 패턴은 뭐야?',
      en: 'What communication pattern should I adjust first in this relationship?',
    },
    reunion: {
      ko: '재회를 원한다면 지금 내 쪽에서 먼저 바꿔야 할 행동은 뭐야?',
      en: 'If I want reunion, what should I change on my side first?',
    },
    wealth: {
      ko: '이번 달엔 확장과 방어 중 어디에 더 무게를 둬야 해?',
      en: 'This month, should I lean more toward expansion or protection?',
    },
    timing: {
      ko: '지금 움직여야 할 시기와 더 기다려야 할 시기를 나눠서 말해줘.',
      en: 'Break down when I should move now and when I should wait longer.',
    },
    career: {
      ko: '이직을 밀어붙이기 전에 확인해야 할 신호 한 가지는 뭐야?',
      en: 'What is the one signal I should confirm before pushing this career move?',
    },
    business: {
      ko: '이 사업에서 가장 먼저 검증해야 할 병목은 뭐야?',
      en: 'What bottleneck should I validate first in this business?',
    },
  };

  return questionMap[questionIntent][language];
}

function buildFreeFocusFallback(
  report: Record<string, unknown>,
  params: {
    questionIntent: OracleQuestionIntent;
    language: ReadingLanguage;
    advisorEvidenceSummary: string;
  }
): FreeFocusPayload {
  const summary = report.summary && typeof report.summary === 'object'
    ? report.summary as Record<string, unknown>
    : {};
  const finalVerdict = report.final_verdict && typeof report.final_verdict === 'object'
    ? report.final_verdict as Record<string, unknown>
    : {};

  const actionSource =
    sanitizeText((report.free_focus as Record<string, unknown> | undefined)?.action_conclusion) ||
    takeLeadSentences(sanitizeText(finalVerdict.core_message), 120) ||
    buildFallbackActionConclusion(params.questionIntent, params.language);

  const evidenceSource = takeLeadSentences(
    sanitizeText((report.free_focus as Record<string, unknown> | undefined)?.evidence_summary) ||
    params.advisorEvidenceSummary ||
    sanitizeText(summary.trust_reason) ||
    sanitizeText(summary.content),
    170
  );

  return {
    action_conclusion: actionSource,
    evidence_summary: evidenceSource || buildFallbackActionConclusion(params.questionIntent, params.language),
    next_question:
      sanitizeText((report.free_focus as Record<string, unknown> | undefined)?.next_question) ||
      buildFallbackNextQuestion(params.questionIntent, params.language),
  };
}

function normalizeFreeFocus(
  report: Record<string, unknown>,
  params: {
    questionIntent: OracleQuestionIntent;
    language: ReadingLanguage;
    advisorEvidenceSummary: string;
  }
): FreeFocusPayload {
  const fallback = buildFreeFocusFallback(report, params);
  const existingFreeFocus =
    report.free_focus && typeof report.free_focus === 'object' && !Array.isArray(report.free_focus)
      ? report.free_focus as Record<string, unknown>
      : {};

  return {
    action_conclusion: sanitizeText(existingFreeFocus.action_conclusion) || fallback.action_conclusion,
    evidence_summary: sanitizeText(existingFreeFocus.evidence_summary) || fallback.evidence_summary,
    next_question: sanitizeText(existingFreeFocus.next_question) || fallback.next_question,
  };
}

export function buildOracleReportEnrichment(
  report: unknown,
  params: {
    characterId: string;
    questionIntent: OracleQuestionIntent;
    selectionMode: OracleSelectionMode;
    language: ReadingLanguage;
    advisorProfile: ReturnType<typeof buildOracleAdvisorProfile>;
    advisorEvidenceSummary: string;
    precisionMetadata?: OracleSajuProfile['precisionMetadata'] | null;
    oracleCouncil?: OracleSajuProfile['oracleCouncil'] | null;
  }
) {
  const baseReport =
    report && typeof report === 'object' && !Array.isArray(report)
      ? report as Record<string, unknown>
      : {};

  return {
    ...baseReport,
    free_focus: normalizeFreeFocus(baseReport, {
      questionIntent: params.questionIntent,
      language: params.language,
      advisorEvidenceSummary: params.advisorEvidenceSummary,
    }),
    characterId: params.characterId,
    questionIntent: params.questionIntent,
    selectionMode: params.selectionMode,
    precisionMetadata: params.precisionMetadata ?? null,
    oracleCouncil: params.oracleCouncil ?? null,
    advisorProfile: params.advisorProfile,
    advisorEvidenceSummary: params.advisorEvidenceSummary,
    oraclePersona: {
      id: params.advisorProfile.id,
      name: params.advisorProfile.name,
      title: params.advisorProfile.title,
    },
  };
}

export function buildReadingMetadata(params: {
  guide: ReadingGuideSnapshot;
  saju: StoredLegacySajuResult;
  astrology: ReturnType<typeof calculateAstrology>;
  cards: TarotCard[];
  characterId: string;
  questionIntent: OracleQuestionIntent;
  selectionMode: OracleSelectionMode;
  advisorProfile: ReturnType<typeof buildOracleAdvisorProfile>;
  advisorEvidenceSummary: string;
  precisionMetadata?: OracleSajuProfile['precisionMetadata'] | null;
  oracleCouncil?: OracleSajuProfile['oracleCouncil'] | null;
  partnerSaju?: StoredLegacySajuResult | null;
}) {
  return {
    confidence: params.guide.confidence,
    matching: params.guide.matching,
    radarScores: params.guide.radarScores,
    keyThemes: params.guide.keyThemes,
    saju: {
      yeonPillar: `${params.saju.yeonPillar.stem}${params.saju.yeonPillar.branch}`,
      dayMaster: params.saju.dayMaster,
      fullSaju: `${params.saju.yeonPillar.stem}${params.saju.yeonPillar.branch}년 ${params.saju.monthPillar.stem}${params.saju.monthPillar.branch}월 ${params.saju.dayPillar.stem}${params.saju.dayPillar.branch}일 ${params.saju.hourPillar.stem}${params.saju.hourPillar.branch}시`,
    },
    sajuResult: params.saju,
    astrology: {
      sunSign: params.astrology.sunSign,
      moonSign: params.astrology.moonSign,
      ascendant: params.astrology.ascendant,
    },
    astrologyResult: params.astrology,
    tarot: params.cards.map((card) => ({ name: card.name, isReversed: card.isReversed })),
    tarotCards: params.cards,
    characterId: params.characterId,
    questionIntent: params.questionIntent,
    selectionMode: params.selectionMode,
    advisorProfile: params.advisorProfile,
    advisorEvidenceSummary: params.advisorEvidenceSummary,
    oraclePersona: {
      id: params.advisorProfile.id,
      name: params.advisorProfile.name,
      title: params.advisorProfile.title,
    },
    precisionMetadata: params.precisionMetadata ?? null,
    precision: params.precisionMetadata ?? null,
    oracleCouncil: params.oracleCouncil ?? null,
    partnerSajuResult: params.partnerSaju ?? null,
  };
}

function toTraitGrade(score: number): 'S' | 'A' | 'B' {
  if (score >= 88) return 'S';
  if (score >= 72) return 'A';
  return 'B';
}

function getLocalizedConfidenceCopy(
  guide: ReadingGuideSnapshot,
  language: ReadingLanguage
) {
  if (language === 'ko') {
    return {
      message: guide.confidence.message,
      recommendation: guide.confidence.recommendation,
    };
  }

  return CONFIDENCE_TEXT_EN[guide.confidence.level];
}

function getAstrologySignalName(index: number, language: ReadingLanguage): string {
  if (language === 'en') {
    return ZODIAC_SIGNS_EN[index] ?? 'Unknown';
  }

  return ZODIAC_SIGNS[index]?.name ?? '미상';
}

function buildDeterministicFreeReport(params: {
  guide: ReadingGuideSnapshot;
  saju: StoredLegacySajuResult;
  astrology: ReturnType<typeof calculateAstrology>;
  cards: TarotCard[];
  questionIntent: OracleQuestionIntent;
  advisorEvidenceSummary: string;
  language: ReadingLanguage;
}): FreeReadingReport {
  const confidenceCopy = getLocalizedConfidenceCopy(params.guide, params.language);
  const freeFocus = buildFreeFocusFallback({}, {
    questionIntent: params.questionIntent,
    language: params.language,
    advisorEvidenceSummary: params.advisorEvidenceSummary,
  });
  const sajuLine = extractEvidenceLine(
    params.advisorEvidenceSummary,
    params.language === 'en' ? ['Saju'] : ['사주']
  );
  const astroLine = extractEvidenceLine(
    params.advisorEvidenceSummary,
    params.language === 'en' ? ['Natal', 'Ziwei'] : ['점성', '자미']
  );
  const tarotLine = extractEvidenceLine(
    params.advisorEvidenceSummary,
    params.language === 'en' ? ['Tarot'] : ['타로']
  );
  const tarotCard = params.cards[0];
  const evidenceSummary = takeLeadSentences(
    [sajuLine, astroLine].filter(Boolean).join(' '),
    140
  ) || freeFocus.evidence_summary;
  const tarotDescription = tarotLine || (
    params.language === 'en'
      ? `${tarotCard?.nameEn || 'Tarot'}${tarotCard?.isReversed ? ' reversed' : ''} reflects the immediate emotional weather around this question.`
      : `${tarotCard?.name || '타로'}${tarotCard?.isReversed ? ' 역방향' : ''} 카드가 지금 질문의 즉각적인 심리 신호를 비춥니다. ${takeLeadSentences(tarotCard?.interpretation || '', 90)}`
  );

  return {
    free_focus: {
      ...freeFocus,
      evidence_summary: evidenceSummary,
    },
    summary: {
      title: FREE_READING_TITLES[params.questionIntent][params.language],
      content: takeLeadSentences(
        [
          freeFocus.action_conclusion,
          evidenceSummary,
          confidenceCopy.recommendation,
        ].filter(Boolean).join(' '),
        380
      ),
      trust_score: params.guide.confidence.score,
      trust_reason: params.language === 'en'
        ? `${params.guide.matching.matchingTags.length} cross-checked themes overlap, and ${confidenceCopy.message.toLowerCase()}`
        : `공통 테마 ${params.guide.matching.matchingTags.length}개가 겹치고, ${confidenceCopy.message}`,
    },
    traits: buildDeterministicFreeTraits(params, {
      sajuLine,
      astroLine,
      tarotDescription,
    }),
  };
}

export function extractPartialJsonStringValue(source: string, key: string): string | null {
  const keyIndex = source.indexOf(`"${key}"`);
  if (keyIndex === -1) return null;

  const colonIndex = source.indexOf(':', keyIndex);
  if (colonIndex === -1) return null;

  const quoteStart = source.indexOf('"', colonIndex + 1);
  if (quoteStart === -1) return null;

  let value = '';
  let escaped = false;

  for (let index = quoteStart + 1; index < source.length; index += 1) {
    const char = source[index];

    if (escaped) {
      value += char === 'n' ? '\n' : char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      return value.trim() || null;
    }

    value += char;
  }

  return value.trim() || null;
}

export function finalizeFreeReport(params: {
  guide: ReadingGuideSnapshot;
  saju: StoredLegacySajuResult;
  astrology: ReturnType<typeof calculateAstrology>;
  cards: TarotCard[];
  questionIntent: OracleQuestionIntent;
  advisorEvidenceSummary: string;
  language: ReadingLanguage;
  previousReport?: unknown;
  coreReport?: unknown;
}): FreeReadingReport {
  const deterministicFallback = buildDeterministicFreeReport(params);
  const previousFreeReport = isRecord(params.previousReport) ? params.previousReport : {};
  const previousFreeFocus = isRecord(previousFreeReport.free_focus) ? previousFreeReport.free_focus : {};
  const previousSummary = isRecord(previousFreeReport.summary) ? previousFreeReport.summary : {};
  const currentCoreReport = isRecord(params.coreReport) ? params.coreReport : {};
  const currentFreeFocus = isRecord(currentCoreReport.free_focus) ? currentCoreReport.free_focus : {};
  const currentSummary = isRecord(currentCoreReport.summary) ? currentCoreReport.summary : {};

  return FreeReadingReportSchema.parse({
    free_focus: {
      action_conclusion:
        sanitizeText(currentFreeFocus.action_conclusion) ||
        sanitizeText(previousFreeFocus.action_conclusion) ||
        deterministicFallback.free_focus.action_conclusion,
      evidence_summary:
        sanitizeText(currentFreeFocus.evidence_summary) ||
        sanitizeText(previousFreeFocus.evidence_summary) ||
        deterministicFallback.free_focus.evidence_summary,
      next_question:
        sanitizeText(currentFreeFocus.next_question) ||
        sanitizeText(previousFreeFocus.next_question) ||
        deterministicFallback.free_focus.next_question,
    },
    summary: {
      title:
        sanitizeText(currentSummary.title) ||
        sanitizeText(previousSummary.title) ||
        deterministicFallback.summary.title,
      content:
        sanitizeText(currentSummary.content) ||
        sanitizeText(previousSummary.content) ||
        deterministicFallback.summary.content,
      trust_score: deterministicFallback.summary.trust_score,
      trust_reason: deterministicFallback.summary.trust_reason,
    },
    traits: buildDeterministicFreeTraits(params),
  });
}

function buildDeterministicFreeTraits(
  params: {
    guide: ReadingGuideSnapshot;
    saju: StoredLegacySajuResult;
    astrology: ReturnType<typeof calculateAstrology>;
    cards: TarotCard[];
    questionIntent: OracleQuestionIntent;
    advisorEvidenceSummary: string;
    language: ReadingLanguage;
  },
  overrides?: {
    sajuLine?: string;
    astroLine?: string;
    tarotDescription?: string;
  }
): FreeReadingReport['traits'] {
  const tarotCard = params.cards[0];
  const sajuLine = overrides?.sajuLine || extractEvidenceLine(
    params.advisorEvidenceSummary,
    params.language === 'en' ? ['Saju'] : ['사주']
  );
  const astroLine = overrides?.astroLine || extractEvidenceLine(
    params.advisorEvidenceSummary,
    params.language === 'en' ? ['Natal', 'Ziwei'] : ['점성', '자미']
  );
  const tarotDescription = overrides?.tarotDescription || extractEvidenceLine(
    params.advisorEvidenceSummary,
    params.language === 'en' ? ['Tarot'] : ['타로']
  ) || (
    params.language === 'en'
      ? `${tarotCard?.nameEn || 'Tarot'}${tarotCard?.isReversed ? ' reversed' : ''} reflects the immediate emotional weather around this question.`
      : `${tarotCard?.name || '타로'}${tarotCard?.isReversed ? ' 역방향' : ''} 카드가 지금 질문의 즉각적인 심리 신호를 비춥니다. ${takeLeadSentences(tarotCard?.interpretation || '', 90)}`
  );

  return [
    {
      type: 'saju',
      name: params.language === 'en' ? `Day Master ${params.saju.dayMaster}` : `일간 ${params.saju.dayMaster} 중심축`,
      description: takeLeadSentences(
        sajuLine || (
          params.language === 'en'
            ? `Your Day Master ${params.saju.dayMaster} and month pillar ${params.saju.monthPillar.stem}${params.saju.monthPillar.branch} set the base pace of this decision.`
            : `${params.saju.dayMaster} 일간과 ${params.saju.monthPillar.stem}${params.saju.monthPillar.branch} 월주가 이번 선택의 기본 축을 잡습니다.`
        ),
        110
      ),
      grade: toTraitGrade(params.guide.radarScores.saju),
    },
    {
      type: 'astro',
      name: params.language === 'en' ? 'Natal timing signal' : '점성 타이밍 신호',
      description: takeLeadSentences(
        astroLine || (
          params.language === 'en'
            ? `Sun ${getAstrologySignalName(params.astrology.sunSign, 'en')}, Moon ${getAstrologySignalName(params.astrology.moonSign, 'en')}, and Ascendant ${getAstrologySignalName(params.astrology.ascendant, 'en')} show how your outer timing and inner mood are lining up.`
            : `태양 ${getAstrologySignalName(params.astrology.sunSign, 'ko')}, 달 ${getAstrologySignalName(params.astrology.moonSign, 'ko')}, 상승궁 ${getAstrologySignalName(params.astrology.ascendant, 'ko')} 조합이 겉의 흐름과 속마음의 결을 함께 보여줍니다.`
        ),
        110
      ),
      grade: toTraitGrade(params.guide.radarScores.astrology),
    },
    {
      type: 'tarot',
      name: params.language === 'en'
        ? `${tarotCard?.nameEn || 'Tarot'} signal`
        : `${tarotCard?.name || '타로'} 카드 신호`,
      description: takeLeadSentences(tarotDescription, 110),
      grade: toTraitGrade(params.guide.radarScores.tarot),
    },
  ];
}

export function mapToLegacySaju(profile: OracleSajuProfile) {
  const raw = profile.raw;
  const pillars = raw.pillars;

  const legacyPillars = {
    hour: { stem: pillars[0].pillar.fullStem, branch: pillars[0].pillar.fullBranch },
    day: { stem: pillars[1].pillar.fullStem, branch: pillars[1].pillar.fullBranch },
    month: { stem: pillars[2].pillar.fullStem, branch: pillars[2].pillar.fullBranch },
    year: { stem: pillars[3].pillar.fullStem, branch: pillars[3].pillar.fullBranch },
  };

  return {
    ...legacyPillars,
    yeonPillar: legacyPillars.year,
    monthPillar: legacyPillars.month,
    dayPillar: legacyPillars.day,
    hourPillar: legacyPillars.hour,
    dayMaster: pillars[1].pillar.fullStem,
    elements: pillars.map((pillarEntry: typeof pillars[number]) => ({
      stem: pillarEntry.pillar.stemElement,
      branch: pillarEntry.pillar.branchElement,
    })).reverse(),
    tenGods: {
      yeonStem: pillars[3].stemSipsin,
      monthStem: pillars[2].stemSipsin,
      dayStem: pillars[1].stemSipsin,
      hourStem: pillars[0].stemSipsin,
      yeonBranch: pillars[3].branchSipsin,
      monthBranch: pillars[2].branchSipsin,
      dayBranch: pillars[1].branchSipsin,
      hourBranch: pillars[0].branchSipsin,
    },
    oraclePromptBlock: profile.raw.pillars ? buildOracleSajuPromptBlock(profile) : '',
    precisionMetadata: profile.precisionMetadata,
    oracleCouncil: profile.oracleCouncil,
    raw: profile,
  };
}
