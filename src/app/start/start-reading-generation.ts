import type { ReadingData } from '@/components/reading/reading-input';
import {
  getReadingPhaseLabels,
  type PremiumReportState,
  type ReadingMetadata,
  type ResumeRequestContext,
  type TarotSelection,
} from './start-page-helpers';
import {
  getStoredReadingAccessKey,
  getStoredReadingId,
} from './start-page-storage';

export const TOTAL_FREE_PHASES = 2;
export const TOTAL_PREMIUM_PHASES = 8;

export type ReadingTier = 'free' | 'premium';

export type ReadingApiResult = {
  readonly success?: boolean;
  readonly report?: PremiumReportState;
  readonly metadata?: ReadingMetadata;
  readonly isFallback?: boolean;
  readonly fallbackMessage?: string;
  readonly error?: string;
  readonly code?: string;
};

export type PhaseRetryState = {
  readonly providerPressureRetryCount: number;
  readonly aiGenerationRetryCount: number;
  readonly premiumPhaseTimeoutRetryCount: number;
  readonly hasRetriedPremiumVerification: boolean;
};

type GenerationSetupInput = {
  readonly dataToUse: ReadingData;
  readonly language: 'ko' | 'en';
  readonly isPremium: boolean;
  readonly isPremiumOverride: boolean;
  readonly resumeContext?: ResumeRequestContext;
};

export function determineNextPremiumPhase(report: PremiumReportState | null | undefined) {
  if (!report?.summary || !report?.traits || !report?.core_analysis) return 1;
  if (!report?.astro_deep) return 2;
  if (!report?.tarot_details || !report?.numerology) return 3;
  if (!report?.saju_sections) return 4;
  if (!report?.fortune_flow) return 5;
  if (!report?.life_areas) return 6;
  if (!report?.special_analysis || !report?.action_plan || !report?.date_selection) return 7;
  if (!report?.past_life || !report?.glossary || !report?.final_verdict) return 8;

  return TOTAL_PREMIUM_PHASES + 1;
}

export function createPhaseRetryState(): PhaseRetryState {
  return {
    providerPressureRetryCount: 0,
    aiGenerationRetryCount: 0,
    premiumPhaseTimeoutRetryCount: 0,
    hasRetriedPremiumVerification: false,
  };
}

export function getGenerationSetup(input: GenerationSetupInput) {
  const activeLanguage = (input.dataToUse.language as 'ko' | 'en') || input.language;
  const requestTier: ReadingTier = input.isPremium || input.isPremiumOverride ? 'premium' : 'free';
  const totalPhases = requestTier === 'premium' ? TOTAL_PREMIUM_PHASES : TOTAL_FREE_PHASES;

  return {
    activeLanguage,
    labels: getReadingPhaseLabels(activeLanguage, requestTier),
    requestTier,
    resumeAccessKey: input.resumeContext?.accessKey || getStoredReadingAccessKey(),
    resumeReadingId: input.resumeContext?.readingId || getStoredReadingId(),
    totalPhases,
  };
}

export async function parseReadingApiResult(response: Response): Promise<ReadingApiResult> {
  return response.json().catch(() => ({})) as Promise<ReadingApiResult>;
}

export function buildFallbackReport(
  fallbackMessage: string,
  language: 'ko' | 'en'
): PremiumReportState {
  return {
    summary: {
      title: language === 'en' ? 'Your reading summary' : '첫 리딩 요약',
      content: fallbackMessage,
      trust_score: 3,
      trust_reason: language === 'en'
        ? 'A simplified fallback summary was prepared because the full AI response was unstable.'
        : '전체 AI 응답이 불안정해서 요약형 fallback 결과를 먼저 준비했습니다.',
    },
    traits: [],
  };
}

export function getTarotCardsForSave(
  cards: readonly TarotSelection[],
  metadata: ReadingMetadata
) {
  return cards.length > 0
    ? [...cards]
    : Array.isArray(metadata.tarotCards)
      ? metadata.tarotCards
      : [];
}

export function getHoursUntilDailyReset() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  return Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
}
