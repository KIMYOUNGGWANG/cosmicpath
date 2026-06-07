import { NextResponse } from 'next/server';
import { ZODIAC_SIGNS } from '@/lib/engines/astrology';
import { isExternalEffectsDisabled } from '@/lib/runtime-environment';
import {
  buildFreeSummaryExpansionSystemPrompt,
  buildStructuredSystemPrompt,
  buildUserPrompt,
  type ReadingContext,
} from '@/lib/ai/prompt-builder';
import {
  generateCompletion,
  generateStructuredReport,
  StructuredParseError,
  type ModelTier,
} from '@/lib/ai/llm-client';
import { generatePremiumReport, generateSinglePhase } from '@/lib/ai/premium-reading-service';
import type { PremiumReportPartial } from '@/lib/ai/phase-prompts';
import {
  buildFreeSummaryPhaseTwoUserPrompt,
  buildOracleReportEnrichment,
  buildReadingMetadata,
  extractPartialJsonStringValue,
  finalizeFreeReport,
  FreeReadingCoreSchema,
  normalizeFreeSummaryContent,
  sanitizeText,
  type ReadingLanguage,
} from './route-helpers';
import type { AssembledReadingRuntime } from './reading-runtime-service';

type EnrichedPayload = {
  success: boolean;
  report: ReturnType<typeof buildOracleReportEnrichment>;
  isPremium: boolean;
  metadata: ReturnType<typeof buildReadingMetadata> & { freeGenerationMode?: string };
  phase?: number;
  error?: string;
};

type BuildPayloadParams = {
  success: boolean;
  report: unknown;
  runtime: AssembledReadingRuntime;
  language: ReadingLanguage;
  isPremium: boolean;
  phase?: number;
  error?: string;
  freeGenerationMode?: string;
};

type PremiumReadingParams = {
  runtime: AssembledReadingRuntime;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: string;
  context: ReadingContext;
  question: string;
  language: ReadingLanguage;
  phase?: number;
  previousReport?: unknown;
  partnerName?: string;
  partnerBirthDate?: string;
  partnerBirthTime?: string;
};

type FreeReadingParams = {
  runtime: AssembledReadingRuntime;
  context: ReadingContext;
  question: string;
  language: ReadingLanguage;
  currentPhase: number;
  effectiveModelTier: ModelTier;
  previousReport?: unknown;
  partnerName?: string;
};

function getCurrentKoreanDate() {
  return new Date().toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\. /g, '-').replace(/\./g, '');
}

function buildEnrichedPayload(params: BuildPayloadParams): EnrichedPayload {
  const metadata = {
    ...buildReadingMetadata({
      guide: params.runtime.guide,
      saju: params.runtime.saju,
      astrology: params.runtime.astrology,
      cards: params.runtime.cards,
      characterId: params.runtime.resolvedCharacterId,
      questionIntent: params.runtime.resolvedQuestionIntent,
      decisionAction: params.runtime.decisionAction,
      selectionMode: params.runtime.effectiveSelectionMode,
      advisorProfile: params.runtime.advisorProfile,
      advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
      precisionMetadata: params.runtime.precisionMetadata,
      oracleCouncil: params.runtime.oracleCouncil,
      partnerSaju: params.runtime.partnerSaju,
    }),
    ...(params.freeGenerationMode ? { freeGenerationMode: params.freeGenerationMode } : {}),
  };

  return {
    success: params.success,
    phase: params.phase,
    report: buildOracleReportEnrichment(params.report, {
      characterId: params.runtime.resolvedCharacterId,
      questionIntent: params.runtime.resolvedQuestionIntent,
      decisionAction: params.runtime.decisionAction,
      selectionMode: params.runtime.effectiveSelectionMode,
      language: params.language,
      advisorProfile: params.runtime.advisorProfile,
      advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
      precisionMetadata: params.runtime.precisionMetadata,
      oracleCouncil: params.runtime.oracleCouncil,
    }),
    isPremium: params.isPremium,
    error: params.error,
    metadata,
  };
}

export async function runPremiumReading(params: PremiumReadingParams) {
  const apiKey = process.env.GOOGLE_AI_API_KEY as string;
  const currentDate = getCurrentKoreanDate();
  const previousPhaseReport: PremiumReportPartial | null =
    params.previousReport && typeof params.previousReport === 'object' && !Array.isArray(params.previousReport)
      ? params.previousReport as PremiumReportPartial
      : null;
  const userData = {
    name: params.name,
    gender: params.gender,
    birthDate: params.birthDate,
    birthTime: params.birthTime,
    characterId: params.runtime.resolvedCharacterId,
    selectionMode: params.runtime.effectiveSelectionMode,
    questionIntent: params.runtime.resolvedQuestionIntent,
    advisorProfile: params.runtime.advisorProfile,
    advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
    context: params.context,
    question: params.question,
    sajuData: params.runtime.saju,
    astroData: {
      sunSign: ZODIAC_SIGNS[params.runtime.astrology.sunSign].name,
      moonSign: ZODIAC_SIGNS[params.runtime.astrology.moonSign].name,
      ascendant: ZODIAC_SIGNS[params.runtime.astrology.ascendant].name,
    },
    tarotCards: params.runtime.cards,
    language: params.language,
    currentDate,
    partnerName: params.partnerName || undefined,
    partnerBirthDate: params.partnerBirthDate || undefined,
    partnerBirthTime: params.partnerBirthTime || undefined,
    partnerSajuData: params.runtime.partnerSaju || undefined,
  };

  try {
    if (params.phase) {
      console.log(`Executing Phase ${params.phase} for Premium Reading`);
      const phaseResult = await generateSinglePhase(
        params.phase,
        userData,
        previousPhaseReport,
        apiKey
      );

      if (!phaseResult.success) {
        return NextResponse.json(
          { error: phaseResult.error || 'Phase execution failed' },
          { status: 500 }
        );
      }

      return NextResponse.json(buildEnrichedPayload({
        success: true,
        phase: params.phase,
        report: phaseResult.data,
        runtime: params.runtime,
        language: params.language,
        isPremium: true,
      }));
    }

    const premiumResult = await generatePremiumReport(userData, apiKey);

    return NextResponse.json(buildEnrichedPayload({
      success: premiumResult.success,
      report: premiumResult.report,
      runtime: params.runtime,
      language: params.language,
      isPremium: true,
      error: premiumResult.error,
    }));
  } catch (premiumError) {
    console.error('Premium generation failed:', premiumError);
    return NextResponse.json(
      {
        error: '프리미엄 리포트를 불러오는 중 오류가 발생했습니다.',
        code: 'PREMIUM_GENERATION_FAILED',
      },
      { status: 500 }
    );
  }
}

export async function runFreeReading(params: FreeReadingParams) {
  const currentDate = getCurrentKoreanDate();
  const baseUserPrompt = buildUserPrompt(
    params.runtime.guide,
    params.runtime.saju,
    params.runtime.astrology,
    params.runtime.cards,
    params.context,
    params.question,
    params.language,
    currentDate,
    params.runtime.partnerSaju,
    params.partnerName,
    params.runtime.resolvedCharacterId,
    {
      questionIntent: params.runtime.resolvedQuestionIntent,
      selectionMode: params.runtime.effectiveSelectionMode,
      advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
      isPremium: false,
    }
  );

  if (isExternalEffectsDisabled()) {
    const fallbackReport = finalizeFreeReport({
      guide: params.runtime.guide,
      saju: params.runtime.saju,
      astrology: params.runtime.astrology,
      cards: params.runtime.cards,
      questionIntent: params.runtime.resolvedQuestionIntent,
      decisionAction: params.runtime.decisionAction,
      question: params.question,
      advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
      language: params.language,
      previousReport: params.previousReport,
    });

    return NextResponse.json(buildEnrichedPayload({
      success: true,
      phase: params.currentPhase,
      report: fallbackReport,
      runtime: params.runtime,
      language: params.language,
      isPremium: false,
      freeGenerationMode: params.currentPhase > 1
        ? 'phase_2_fallback'
        : 'deterministic_fallback_outline',
    }));
  }

  if (params.currentPhase > 1) {
    try {
      const summaryExpansion = await generateCompletion(
        buildFreeSummaryExpansionSystemPrompt(params.language, {
          characterId: params.runtime.resolvedCharacterId,
          questionIntent: params.runtime.resolvedQuestionIntent,
          selectionMode: params.runtime.effectiveSelectionMode,
        }),
        buildFreeSummaryPhaseTwoUserPrompt({
          baseUserPrompt,
          previousReport: params.previousReport,
          language: params.language,
        }),
        params.effectiveModelTier
      );

      const finalizedReport = finalizeFreeReport({
        guide: params.runtime.guide,
        saju: params.runtime.saju,
        astrology: params.runtime.astrology,
        cards: params.runtime.cards,
        questionIntent: params.runtime.resolvedQuestionIntent,
        decisionAction: params.runtime.decisionAction,
        question: params.question,
        advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
        language: params.language,
        previousReport: params.previousReport,
        coreReport: {
          summary: {
            content: normalizeFreeSummaryContent(summaryExpansion.content),
          },
        },
      });

      return NextResponse.json(buildEnrichedPayload({
        success: true,
        phase: params.currentPhase,
        report: finalizedReport,
        runtime: params.runtime,
        language: params.language,
        isPremium: false,
        freeGenerationMode: 'phase_2_text',
      }));
    } catch (aiError) {
      console.warn('[Reading API] Free phase 2 text expansion failed. Keeping deterministic summary fallback.', aiError);

      const finalizedReport = finalizeFreeReport({
        guide: params.runtime.guide,
        saju: params.runtime.saju,
        astrology: params.runtime.astrology,
        cards: params.runtime.cards,
        questionIntent: params.runtime.resolvedQuestionIntent,
        decisionAction: params.runtime.decisionAction,
        question: params.question,
        advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
        language: params.language,
        previousReport: params.previousReport,
      });

      return NextResponse.json(buildEnrichedPayload({
        success: true,
        phase: params.currentPhase,
        report: finalizedReport,
        runtime: params.runtime,
        language: params.language,
        isPremium: false,
        freeGenerationMode: 'phase_2_fallback',
      }));
    }
  }

  try {
    const freeCoreReport = await generateStructuredReport(
      buildStructuredSystemPrompt(params.language, currentDate, {
        characterId: params.runtime.resolvedCharacterId,
        questionIntent: params.runtime.resolvedQuestionIntent,
        selectionMode: params.runtime.effectiveSelectionMode,
        isPremium: false,
        freeOutputMode: 'core',
      }),
      baseUserPrompt,
      params.effectiveModelTier,
      FreeReadingCoreSchema
    );

    const report = finalizeFreeReport({
      guide: params.runtime.guide,
      saju: params.runtime.saju,
      astrology: params.runtime.astrology,
      cards: params.runtime.cards,
      questionIntent: params.runtime.resolvedQuestionIntent,
      decisionAction: params.runtime.decisionAction,
      question: params.question,
      advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
      language: params.language,
      previousReport: params.previousReport,
      coreReport: freeCoreReport,
    });

    return NextResponse.json(buildEnrichedPayload({
      success: true,
      phase: params.currentPhase,
      report,
      runtime: params.runtime,
      language: params.language,
      isPremium: false,
      freeGenerationMode: 'ai_outline',
    }));
  } catch (aiError) {
    const aiErrorMessage = aiError instanceof Error ? aiError.message : String(aiError);
    const isProviderPressure =
      aiErrorMessage.includes('503:') ||
      aiErrorMessage.includes('429:') ||
      aiErrorMessage.includes('API timeout after');
    const isStructuredParseFailure = aiError instanceof StructuredParseError;

    if (isProviderPressure) {
      console.warn('[Reading API] Free structured generation unavailable on primary model:', aiErrorMessage);
    } else if (isStructuredParseFailure) {
      console.warn('[Reading API] Free structured generation returned malformed JSON. Recovering with partial parse fallback.');
    } else {
      console.error('AI generation failed:', aiError);
    }

    if (isStructuredParseFailure) {
      const recoveredReport = finalizeFreeReport({
        guide: params.runtime.guide,
        saju: params.runtime.saju,
        astrology: params.runtime.astrology,
        cards: params.runtime.cards,
        questionIntent: params.runtime.resolvedQuestionIntent,
        decisionAction: params.runtime.decisionAction,
        question: params.question,
        advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
        language: params.language,
        previousReport: params.previousReport,
        coreReport: {
          free_focus: {
            decision_label: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'decision_label')),
            delayed_choice: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'delayed_choice')),
            timing_boundary: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'timing_boundary')),
            first_action: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'first_action')),
            avoid: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'avoid')),
            confidence_note: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'confidence_note')),
            copy_ready_message: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'copy_ready_message')),
            action_conclusion: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'action_conclusion')),
            evidence_summary: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'evidence_summary')),
            next_question: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'next_question')),
          },
          summary: {
            title: sanitizeText(extractPartialJsonStringValue(aiError.cleanedText, 'title')),
          },
        },
      });

      return NextResponse.json(buildEnrichedPayload({
        success: true,
        phase: params.currentPhase,
        report: recoveredReport,
        runtime: params.runtime,
        language: params.language,
        isPremium: false,
        freeGenerationMode: 'partial_json_recovery_outline',
      }));
    }

    const fallbackReport = finalizeFreeReport({
      guide: params.runtime.guide,
      saju: params.runtime.saju,
      astrology: params.runtime.astrology,
      cards: params.runtime.cards,
      questionIntent: params.runtime.resolvedQuestionIntent,
      decisionAction: params.runtime.decisionAction,
      question: params.question,
      advisorEvidenceSummary: params.runtime.advisorEvidenceSummary,
      language: params.language,
      previousReport: params.previousReport,
    });

    return NextResponse.json(buildEnrichedPayload({
      success: true,
      phase: params.currentPhase,
      report: fallbackReport,
      runtime: params.runtime,
      language: params.language,
      isPremium: false,
      freeGenerationMode: isProviderPressure
        ? 'provider_fallback_outline'
        : 'deterministic_fallback_outline',
    }));
  }
}
