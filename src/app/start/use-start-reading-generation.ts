'use client';

import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import type { ReadingData } from '@/components/reading/reading-input';
import { createSession } from '@/lib/session/reading-session';
import type { PremiumReportState, ReadingMetadata, ResumeRequestContext, TarotSelection } from './start-page-helpers';
import { normalizeStoredTarotCards, type ReadingStep } from './start-page-helpers';
import { saveToSessionAndBackup } from './start-page-storage';
import { resolveReadingError } from './start-reading-error-handling';
import {
  TOTAL_PREMIUM_PHASES,
  buildFallbackReport,
  createPhaseRetryState,
  getGenerationSetup,
  getTarotCardsForSave,
  parseReadingApiResult,
} from './start-reading-generation';
import {
  saveFinalReadingResult,
  saveIntermediatePremiumResult,
} from './start-reading-save';

type UseStartReadingGenerationOptions = {
  readonly readingData: ReadingData | null;
  readonly metadata?: ReadingMetadata;
  readonly language: 'ko' | 'en';
  readonly isPremium: boolean;
  readonly landingSource: string;
  readonly dynamicPrice: string;
  readonly hasRetriedLowConfidenceFree: MutableRefObject<boolean>;
  readonly setIsLoading: (value: boolean) => void;
  readonly setLoadingPhase: (value: { phase: number; label: string }) => void;
  readonly setStreamContent: (value: string) => void;
  readonly setReportData: (value: PremiumReportState | null) => void;
  readonly setMetadata: (value: ReadingMetadata | undefined) => void;
  readonly setReadingData: (value: ReadingData | null) => void;
  readonly setSelectedCards: (value: TarotSelection[]) => void;
  readonly setIsPremium: (value: boolean) => void;
  readonly setShareUrl: (value: string | undefined) => void;
  readonly setStep: (value: ReadingStep) => void;
  readonly syncResultUrl: (readingId?: string | null) => void;
};

export function useStartReadingGeneration(options: UseStartReadingGenerationOptions) {
  return useCallback(async (
    cards: TarotSelection[],
    isPremiumOverride = false,
    readingDataOverride?: ReadingData,
    initialReport?: PremiumReportState,
    startPhaseOverride?: number,
    resumeContext?: ResumeRequestContext
  ) => {
    let dataToUse = readingDataOverride || options.readingData;
    if (!dataToUse) return;

    const setup = getGenerationSetup({
      dataToUse,
      language: options.language,
      isPremium: options.isPremium,
      isPremiumOverride,
      resumeContext,
    });

    try {
      options.setIsLoading(true);
      options.setStreamContent('');
      let accumulatedReport: PremiumReportState = initialReport || {};
      let accumulatedMetadata: ReadingMetadata = options.metadata || {};
      const startPhase = startPhaseOverride || 1;

      for (let phase = startPhase; phase <= setup.totalPhases; phase++) {
        let shouldRetryPhase = true;
        let shouldStopAfterCurrentPhase = false;
        let retryState = createPhaseRetryState();

        while (shouldRetryPhase) {
          shouldRetryPhase = false;
          options.setLoadingPhase({ phase, label: setup.labels[phase] });
          const response = await fetch('/api/reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...dataToUse,
              tarotCards: cards,
              tier: setup.requestTier,
              phase,
              previousReport: accumulatedReport,
              ...(setup.requestTier === 'premium'
                ? {
                    isPaid: options.isPremium || isPremiumOverride,
                    readingId: setup.resumeReadingId || undefined,
                    accessKey: setup.resumeAccessKey || undefined,
                  }
                : {}),
            }),
          });
          const result = await parseReadingApiResult(response);

          if (!response.ok) {
            const recovery = await resolveReadingError({
              response,
              result,
              phase,
              requestTier: setup.requestTier,
              activeLanguage: setup.activeLanguage,
              dataToUse,
              landingSource: options.landingSource,
              dynamicPrice: options.dynamicPrice,
              resumeReadingId: setup.resumeReadingId,
              resumeAccessKey: setup.resumeAccessKey,
              accumulatedReport,
              accumulatedMetadata,
              retryState,
              setLoadingPhase: options.setLoadingPhase,
              setStreamContent: options.setStreamContent,
              setReportData: options.setReportData,
              setMetadata: options.setMetadata,
              setReadingData: options.setReadingData,
              setSelectedCards: options.setSelectedCards,
              setIsPremium: options.setIsPremium,
            });

            retryState = recovery.retryState;
            if (recovery.kind === 'retry') {
              shouldRetryPhase = true;
              continue;
            }
            if (recovery.kind === 'premium-verified') {
              accumulatedReport = recovery.report;
              accumulatedMetadata = recovery.metadata;
              dataToUse = recovery.readingData || dataToUse;
              shouldRetryPhase = true;
              continue;
            }
            if (recovery.kind === 'stop') return;

            throw new Error(recovery.message);
          }

          if (!result.success) {
            if (result.isFallback && typeof result.fallbackMessage === 'string') {
              const fallbackReport = buildFallbackReport(result.fallbackMessage, setup.activeLanguage);
              accumulatedReport = { ...accumulatedReport, ...fallbackReport };
              options.setReportData({ ...accumulatedReport });
              options.setStreamContent(result.fallbackMessage);
              saveToSessionAndBackup('pending_report_data', JSON.stringify(accumulatedReport));
              shouldStopAfterCurrentPhase = true;
              break;
            }
            throw new Error(result.error || `Phase ${phase} validation failed`);
          }

          accumulatedReport = { ...accumulatedReport, ...result.report };
          options.setReportData({ ...accumulatedReport });
          saveToSessionAndBackup('pending_report_data', JSON.stringify(accumulatedReport));
          if (result.metadata) {
            accumulatedMetadata = { ...accumulatedMetadata, ...result.metadata };
            options.setMetadata({ ...accumulatedMetadata });
            saveToSessionAndBackup('pending_metadata', JSON.stringify(accumulatedMetadata));
            if (!cards.length && Array.isArray(result.metadata.tarotCards)) {
              const autoCards = normalizeStoredTarotCards(result.metadata.tarotCards);
              options.setSelectedCards(autoCards);
              saveToSessionAndBackup('pending_reading_data', JSON.stringify({ ...dataToUse, tarotCards: autoCards }));
            }
          }
        }

        if (shouldStopAfterCurrentPhase) break;
        const tarotCardsForSave = getTarotCardsForSave(cards, accumulatedMetadata);

        if ((options.isPremium || isPremiumOverride) && phase === 1) {
          void saveIntermediatePremiumResult({
            report: accumulatedReport,
            metadata: accumulatedMetadata,
            readingData: dataToUse,
            tarotCards: tarotCardsForSave,
            activeLanguage: setup.activeLanguage,
            paymentSource: getPremiumPaymentSource(accumulatedMetadata, isPremiumOverride),
          });
        }
      }

      finalizeGeneration({
        ...options,
        cards,
        dataToUse,
        accumulatedReport,
        accumulatedMetadata,
        isComplete: setup.totalPhases === TOTAL_PREMIUM_PHASES,
        requestTier: setup.requestTier,
        activeLanguage: setup.activeLanguage,
      });
    } catch (error) {
      const message = getGenerationErrorMessage(error, setup.activeLanguage);
      if (shouldWarnDeferred(message)) {
        console.warn('Reading deferred:', message);
      } else {
        console.error('Reading failed:', error);
      }
      options.setStreamContent(message);
    } finally {
      options.setIsLoading(false);
    }
  }, [options]);
}

function finalizeGeneration(options: UseStartReadingGenerationOptions & {
  readonly cards: readonly TarotSelection[];
  readonly dataToUse: ReadingData;
  readonly accumulatedReport: PremiumReportState;
  readonly accumulatedMetadata: ReadingMetadata;
  readonly isComplete: boolean;
  readonly requestTier: 'free' | 'premium';
  readonly activeLanguage: 'ko' | 'en';
}) {
  const trustScore = options.accumulatedReport.summary?.trust_score;
  if (options.requestTier === 'free' && typeof trustScore === 'number' && trustScore <= 2) {
    options.hasRetriedLowConfidenceFree.current = true;
  }
  if (options.accumulatedReport.summary) {
    saveToSessionAndBackup('reading_step', 'result');
    options.setStep('result');
  }
  if (options.isComplete) {
    options.setIsPremium(true);
    saveToSessionAndBackup('is_premium_user', 'true');
  }

  void saveFinalReadingResult({
    report: options.accumulatedReport,
    metadata: options.accumulatedMetadata,
    readingData: options.dataToUse,
    tarotCards: getTarotCardsForSave(options.cards, options.accumulatedMetadata),
    activeLanguage: options.activeLanguage,
    isComplete: options.isComplete,
    setShareUrl: options.setShareUrl,
    syncResultUrl: options.syncResultUrl,
  });
  createSession('free_session', options.accumulatedReport, 0);
}

function getPremiumPaymentSource(metadata: ReadingMetadata, isPremiumOverride: boolean) {
  if (typeof metadata.paymentSource === 'string') return metadata.paymentSource;
  if (sessionStorage.getItem('promo_user') === 'true') return 'promo';

  return isPremiumOverride ? 'override' : 'pending';
}

function getGenerationErrorMessage(error: unknown, activeLanguage: 'ko' | 'en') {
  if (error instanceof Error && error.message) return error.message;

  return activeLanguage === 'en'
    ? 'Failed to connect to the server. Please try again.'
    : '서버 연결에 실패했습니다. 다시 시도해주세요.';
}

function shouldWarnDeferred(message: string) {
  return (
    message.includes('지금은 리딩을 끝까지 생성하지 못했습니다') ||
    message.includes('We could not complete your reading right now') ||
    message.includes('지금 오라클 리딩이 혼잡합니다') ||
    message.includes('The oracle is crowded right now') ||
    message.includes('timed out after')
  );
}
