import { calculateAstrology } from '@/lib/engines/astrology';
import { drawCards, type TarotCard } from '@/lib/engines/tarot';
import { extractAllTags } from '@/lib/core/tag-engine';
import { generateInterpretationGuide } from '@/lib/core/conflict-resolver';
import {
  buildOracleAdvisorEvidenceSummary,
  calculateOracleSajuProfile,
  type OracleSajuProfile,
} from '@/lib/saju/saju-engine';
import {
  buildOracleAdvisorProfile,
  getRecommendedOracleCharacterId,
  inferQuestionIntent,
  resolveOracleCharacterId,
  type OracleQuestionIntent,
  type OracleSelectionMode,
} from '@/lib/ai/oracle-personas';
import {
  buildDecisionActionContract,
  type DecisionActionContract,
} from '@/lib/ai/decision-action-contract';
import type { ReadingContext } from '@/lib/ai/prompt-builder';
import {
  extractStoredReadingRuntime,
  mapToLegacySaju,
  type ReadingGuideSnapshot,
  type ReadingLanguage,
  type StoredLegacySajuResult,
} from './route-helpers';

export type AssembledReadingRuntime = {
  guide: ReadingGuideSnapshot;
  saju: StoredLegacySajuResult;
  partnerSaju: StoredLegacySajuResult | null;
  astrology: ReturnType<typeof calculateAstrology>;
  resolvedQuestionIntent: OracleQuestionIntent;
  decisionAction: DecisionActionContract;
  resolvedCharacterId: ReturnType<typeof resolveOracleCharacterId>;
  effectiveSelectionMode: OracleSelectionMode;
  advisorProfile: ReturnType<typeof buildOracleAdvisorProfile>;
  advisorEvidenceSummary: string;
  cards: TarotCard[];
  precisionMetadata?: OracleSajuProfile['precisionMetadata'] | null;
  oracleCouncil?: OracleSajuProfile['oracleCouncil'] | null;
};

type RequestTarotCard = {
  id: number;
  name: string;
  nameEn: string;
  keywords: string[];
  interpretation: string;
  isReversed: boolean;
  image?: string;
};

type ReadingRuntimeAssemblyParams = {
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  cityName?: string;
  longitude?: number;
  latitude?: number;
  calendarType: 'solar' | 'lunar';
  unknownTime: boolean;
  partnerBirthDate?: string;
  partnerBirthTime?: string;
  partnerGender?: 'male' | 'female';
  partnerName?: string;
  context: ReadingContext;
  question: string;
  language: ReadingLanguage;
  tarotCards?: RequestTarotCard[];
  storedReadingMetadata: Record<string, unknown>;
  useStoredRuntime: boolean;
  requestedQuestionIntent?: OracleQuestionIntent;
  selectionMode: OracleSelectionMode;
  characterId?: string;
  readingId?: string;
  currentPhase: number;
};

export async function assembleReadingRuntime(
  params: ReadingRuntimeAssemblyParams
): Promise<AssembledReadingRuntime> {
  const [yearPart, monthPart, dayPart] = params.birthDate.split('-').map(Number);
  const [hours, minutes] = params.birthTime.split(':').map(Number);
  const exactBirthDateTime = new Date(yearPart, monthPart - 1, dayPart, hours, minutes || 0, 0);
  const storedRuntime = params.useStoredRuntime
    ? extractStoredReadingRuntime(params.storedReadingMetadata)
    : null;

  if (storedRuntime) {
    const partnerSaju = storedRuntime.partnerSaju
      ? storedRuntime.partnerSaju
      : params.partnerBirthDate
        ? mapToLegacySaju(await calculateOracleSajuProfile({
            birthDate: params.partnerBirthDate,
            birthTime: params.partnerBirthTime || '12:00',
            gender: params.partnerGender || 'male',
            unknownTime: !params.partnerBirthTime,
          }))
        : null;

    console.log('[Reading API] Reused stored oracle runtime context', {
      readingId: params.readingId,
      phase: params.currentPhase,
    });

    return {
      guide: storedRuntime.guide,
      saju: storedRuntime.saju,
      partnerSaju,
      astrology: storedRuntime.astrology,
      resolvedQuestionIntent: storedRuntime.questionIntent,
      decisionAction: storedRuntime.decisionAction,
      resolvedCharacterId: storedRuntime.characterId,
      effectiveSelectionMode: storedRuntime.selectionMode,
      advisorProfile: storedRuntime.advisorProfile,
      advisorEvidenceSummary: storedRuntime.advisorEvidenceSummary,
      cards: storedRuntime.cards.length > 0
        ? storedRuntime.cards
        : (params.tarotCards || drawCards(1)) as TarotCard[],
      precisionMetadata: storedRuntime.precisionMetadata,
      oracleCouncil: storedRuntime.oracleCouncil,
    };
  }

  const sajuProfile = await calculateOracleSajuProfile({
    birthDate: params.birthDate,
    birthTime: params.birthTime,
    gender: params.gender,
    cityName: params.cityName,
    longitude: params.longitude,
    latitude: params.latitude,
    isLunar: params.calendarType === 'lunar',
    unknownTime: params.unknownTime || false,
  });

  const saju = mapToLegacySaju(sajuProfile);
  const precisionMetadata = sajuProfile.precisionMetadata;
  const oracleCouncil = sajuProfile.oracleCouncil;

  const [partnerSajuProfile, astrology] = await Promise.all([
    params.partnerBirthDate
      ? calculateOracleSajuProfile({
          birthDate: params.partnerBirthDate,
          birthTime: params.partnerBirthTime || '12:00',
          gender: params.partnerGender || 'male',
          unknownTime: !params.partnerBirthTime,
        })
      : Promise.resolve(null),
    Promise.resolve(calculateAstrology(exactBirthDateTime, params.birthTime)),
  ]);

  const partnerSaju = partnerSajuProfile ? mapToLegacySaju(partnerSajuProfile) : null;
  const resolvedQuestionIntent = params.requestedQuestionIntent ?? inferQuestionIntent({
    context: params.context,
    question: params.question,
    partnerBirthDate: params.partnerBirthDate,
    partnerName: params.partnerName,
  });
  const decisionAction = buildDecisionActionContract({
    context: params.context,
    question: params.question,
  });
  const effectiveSelectionMode = params.selectionMode;
  const resolvedCharacterId = effectiveSelectionMode === 'manual'
    ? resolveOracleCharacterId(params.characterId)
    : getRecommendedOracleCharacterId({
        context: params.context,
        question: params.question,
        partnerBirthDate: params.partnerBirthDate,
        partnerName: params.partnerName,
        questionIntent: resolvedQuestionIntent,
      });
  const advisorProfile = buildOracleAdvisorProfile(resolvedCharacterId, effectiveSelectionMode);
  const advisorEvidenceSummary = buildOracleAdvisorEvidenceSummary({
    profile: sajuProfile,
    questionIntent: resolvedQuestionIntent,
    evidencePriority: advisorProfile.evidencePriority,
    language: params.language,
  });
  const cards = (params.tarotCards || drawCards(1)) as TarotCard[];
  const guide = generateInterpretationGuide(extractAllTags(saju, astrology, cards), params.question);

  return {
    guide,
    saju,
    partnerSaju,
    astrology,
    resolvedQuestionIntent,
    decisionAction,
    resolvedCharacterId,
    effectiveSelectionMode,
    advisorProfile,
    advisorEvidenceSummary,
    cards,
    precisionMetadata,
    oracleCouncil,
  };
}
