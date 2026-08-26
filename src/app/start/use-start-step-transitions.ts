'use client';

import type { MutableRefObject } from 'react';
import type { ReadingData } from '@/components/reading/reading-input';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { USER_LANGUAGE_STORAGE_KEY } from '@/lib/language-preference';
import type { ReadingMetadata, ReadingStep, StartReadingFn, TarotSelection } from './start-page-helpers';
import {
  clearSessionAndBackup,
  saveToSessionAndBackup,
} from './start-page-storage';

export function debugStartFlow(event: string, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') return;
  console.debug('[StartFlow]', event, details || {});
}

type UseStartStepTransitionsOptions = {
  dynamicPrice: string;
  entry: string | null;
  initialQuestion?: string;
  isDecisionTimingEntry: boolean;
  isInvitationMode: boolean;
  landingSource: string;
  language: 'ko' | 'en';
  readingData: ReadingData | null;
  resetResultTracking: () => void;
  startReadingRef: MutableRefObject<StartReadingFn | null>;
  step: ReadingStep;
  syncResultUrl: (readingId?: string | null) => void;
  hasRetriedLowConfidenceFree: MutableRefObject<boolean>;
  setIsDecisionAccepted: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setIsPremium: (value: boolean) => void;
  setLanguage: (value: 'ko' | 'en') => void;
  setLoadingPhase: (value: { phase: number; label: string }) => void;
  setMetadata: (value: ReadingMetadata | undefined) => void;
  setReadingData: (value: ReadingData | null) => void;
  setReportData: (value: null) => void;
  setSelectedCards: (value: TarotSelection[]) => void;
  setShareUrl: (value: string | undefined) => void;
  setStep: (value: ReadingStep) => void;
  setStreamContent: (value: string) => void;
};

export function useStartStepTransitions(options: UseStartStepTransitionsOptions) {
  const {
    dynamicPrice,
    entry,
    isInvitationMode,
    landingSource,
    language,
    readingData,
    resetResultTracking,
    startReadingRef,
    step,
    syncResultUrl,
    hasRetriedLowConfidenceFree,
    setIsDecisionAccepted,
    setIsLoading,
    setIsPremium,
    setLanguage,
    setLoadingPhase,
    setMetadata,
    setReadingData,
    setReportData,
    setSelectedCards,
    setShareUrl,
    setStep,
    setStreamContent,
  } = options;

  const transitionToStep = (nextStep: ReadingStep, reason: string, details?: Record<string, unknown>) => {
    debugStartFlow('step_transition', {
      from: step,
      to: nextStep,
      reason,
      ...details,
    });
    setStep(nextStep);
  };

  const handleInputSubmit = (data: ReadingData) => {
    clearSessionAndBackup();
    resetResultTracking();
    hasRetriedLowConfidenceFree.current = false;
    setReadingData(data);
    setSelectedCards([]);
    setReportData(null);
    setStreamContent('');
    setMetadata(undefined);
    setIsPremium(false);
    setShareUrl(undefined);
    setIsDecisionAccepted(false);
    setLanguage(data.language);
    localStorage.setItem(USER_LANGUAGE_STORAGE_KEY, data.language);
    saveToSessionAndBackup('pending_reading_data', JSON.stringify({ ...data, tarotCards: [] }));
    saveToSessionAndBackup('is_session_active', 'true');
    saveToSessionAndBackup('reading_step', 'reveal');
    syncResultUrl(null);
    void trackQuestionStart(data, options);
    setLoadingPhase({ phase: 0, label: '' });
    setIsLoading(true);
    transitionToStep('reveal', 'input_submit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void startReadingRef.current?.([], false, data);
  };

  const handleTarotComplete = (cards: TarotSelection[]) => {
    setSelectedCards(cards);
    saveToSessionAndBackup('is_session_active', 'true');

    if (readingData) {
      saveToSessionAndBackup('pending_reading_data', JSON.stringify({ ...readingData, tarotCards: cards }));
    }

    void trackClientGrowthEvent({
      event: 'tarot_complete',
      source: landingSource,
      step: 'tarot',
      language,
      context: readingData?.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
      metadata: {
        tarotCount: cards.length,
        entry: entry || undefined,
      },
    });

    transitionToStep('reveal', 'tarot_complete');
    saveToSessionAndBackup('reading_step', 'reveal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void startReadingRef.current?.(cards, false, readingData || undefined);
  };

  const handleRevealComplete = () => {
    setTimeout(() => {
      transitionToStep('result', 'reveal_complete');
      saveToSessionAndBackup('reading_step', 'result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  return { handleInputSubmit, handleRevealComplete, handleTarotComplete, transitionToStep };
}

function trackQuestionStart(
  data: ReadingData,
  options: Pick<
    UseStartStepTransitionsOptions,
    'dynamicPrice' | 'entry' | 'initialQuestion' | 'isDecisionTimingEntry' | 'isInvitationMode' | 'landingSource'
  >
) {
  void trackClientGrowthEvent({
    event: 'analysis_start',
    source: options.landingSource,
    step: 'input',
    language: data.language,
    context: data.context,
    invitationMode: options.isInvitationMode,
    price: options.dynamicPrice || undefined,
    metadata: {
      entry: options.entry || undefined,
      questionLength: data.question.length,
    },
  });

  if (!options.isDecisionTimingEntry) return;

  void trackClientGrowthEvent({
    event: 'decision_question_submit',
    source: options.landingSource,
    step: 'input',
    language: data.language,
    context: data.context,
    invitationMode: options.isInvitationMode,
    price: options.dynamicPrice || undefined,
    metadata: {
      questionLength: data.question.length,
      hasPrefilledQuestion: Boolean(options.initialQuestion),
    },
  });
}
