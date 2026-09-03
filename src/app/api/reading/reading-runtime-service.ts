import type { AstrologyResult } from '@/lib/engines/astrology';
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

import type { ThaiAstrologyResult } from '@/lib/engines/thai-astrology';
import { calculateThaiAstrology } from '@/lib/engines/thai-astrology';
import type { ZiweiChartResult } from '@/lib/engines/ziwei';
import { calculateZiweiChart } from '@/lib/engines/ziwei';
import type { YearHeatmapResult } from '@/lib/engines/timing-heatmap';
import { calculateWeeklyTimingHeatmap } from '@/lib/engines/timing-heatmap';
import type { ShadowTransformationResult } from '@/lib/engines/saju-transformation';
import { calculateShadowTransformations } from '@/lib/engines/saju-transformation';
import type { Compatibility4DResult } from '@/lib/engines/compatibility-matrix';
import { calculate4DCompatibility } from '@/lib/engines/compatibility-matrix';
import { calculateScenarioDecision, type ScenarioVerdictResult } from '@/lib/engines/scenario-engine';

export type AssembledReadingRuntime = {
  guide: ReadingGuideSnapshot;
  saju: StoredLegacySajuResult;
  partnerSaju: StoredLegacySajuResult | null;
  astrology: AstrologyResult;
  resolvedQuestionIntent: OracleQuestionIntent;
  decisionAction: DecisionActionContract;
  resolvedCharacterId: ReturnType<typeof resolveOracleCharacterId>;
  effectiveSelectionMode: OracleSelectionMode;
  advisorProfile: ReturnType<typeof buildOracleAdvisorProfile>;
  advisorEvidenceSummary: string;
  cards: unknown[];
  precisionMetadata?: OracleSajuProfile['precisionMetadata'] | null;
  oracleCouncil?: OracleSajuProfile['oracleCouncil'] | null;
  thaiAstrology?: ThaiAstrologyResult | null;
  ziweiChart?: ZiweiChartResult | null;
  weeklyHeatmap?: YearHeatmapResult | null;
  shadowTransformations?: ShadowTransformationResult | null;
  compatibility4D?: Compatibility4DResult | null;
  scenarioDecision?: ScenarioVerdictResult | null;
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
  ziSiMode?: 'tongja' | 'yaja' | 'joja';
  dstCorrection?: boolean;
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
  scenarioA?: string;
  scenarioB?: string;
};

export async function assembleReadingRuntime(
  params: ReadingRuntimeAssemblyParams
): Promise<AssembledReadingRuntime> {
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
      cards: storedRuntime.cards || [],
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
    timezoneOffset: 9,
    ziSiMode: params.ziSiMode,
    dstCorrection: params.dstCorrection,
  });

  const saju = mapToLegacySaju(sajuProfile);
  const precisionMetadata = sajuProfile.precisionMetadata;
  const oracleCouncil = sajuProfile.oracleCouncil;

  const partnerSajuProfile = params.partnerBirthDate
    ? await calculateOracleSajuProfile({
        birthDate: params.partnerBirthDate,
        birthTime: params.partnerBirthTime || '12:00',
        gender: params.partnerGender || 'male',
        unknownTime: !params.partnerBirthTime,
      })
    : null;

  const partnerSaju = partnerSajuProfile ? mapToLegacySaju(partnerSajuProfile) : null;
  const astrology = sajuProfile.westernAstrology;
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
  const cards: unknown[] = [];
  const guide = generateInterpretationGuide(extractAllTags(saju, astrology, []), params.question);

  let thaiAstrology: ThaiAstrologyResult | null = null;
  try {
    thaiAstrology = calculateThaiAstrology({
      birthDate: params.birthDate,
      birthTime: params.birthTime || '12:00',
      tropicalSunSign: 4,
      tropicalMoonSign: 9,
      tropicalAscendantSign: 7,
    });
  } catch (e) {
    console.error('Failed to compute Thai astrology in runtime:', e);
  }

  let ziweiChart: ZiweiChartResult | null = null;
  try {
    const birthDateObj = new Date(params.birthDate);
    const hour = parseInt((params.birthTime || '12').split(':')[0] || '12', 10);
    ziweiChart = calculateZiweiChart(
      isNaN(birthDateObj.getTime()) ? new Date() : birthDateObj,
      isNaN(hour) ? 12 : hour,
      params.gender,
      params.calendarType === 'lunar'
    );
  } catch (e) {
    console.error('Failed to compute Ziwei chart in runtime:', e);
  }

  let weeklyHeatmap: YearHeatmapResult | null = null;
  try {
    weeklyHeatmap = calculateWeeklyTimingHeatmap(saju, new Date().getFullYear());
  } catch (e) {
    console.error('Failed to compute weekly heatmap in runtime:', e);
  }

  let shadowTransformations: ShadowTransformationResult | null = null;
  try {
    shadowTransformations = calculateShadowTransformations(saju);
  } catch (e) {
    console.error('Failed to compute shadow transformations in runtime:', e);
  }

  let compatibility4D: Compatibility4DResult | null = null;
  try {
    compatibility4D = partnerSaju ? calculate4DCompatibility(saju, partnerSaju) : calculate4DCompatibility(saju);
  } catch (e) {
    console.error('Failed to compute 4D compatibility in runtime:', e);
  }

  let scenarioDecision: ScenarioVerdictResult | null = null;
  try {
    scenarioDecision = calculateScenarioDecision({
      scenarioA: params.scenarioA,
      scenarioB: params.scenarioB,
      question: params.question,
      weeklyHeatmap,
      language: params.language,
    });
  } catch (e) {
    console.error('Failed to compute scenario decision:', e);
  }

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
    thaiAstrology,
    ziweiChart,
    weeklyHeatmap,
    shadowTransformations,
    compatibility4D,
    scenarioDecision,
  };
}
