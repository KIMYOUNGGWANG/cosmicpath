'use client';

import { useEffect } from 'react';
import type { ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportState, ReadingMetadata, ReadingStep, TarotSelection } from './start-page-helpers';
import { restoreClientSnapshotFromStorage } from './start-page-persistence';
import { hasStoredPayload } from './start-page-storage';

type UseStartResumeClientSnapshotOptions = {
  hasCheckedResume: boolean;
  isLoading: boolean;
  readingData: ReadingData | null;
  reportData: PremiumReportState | null;
  selectedCardCount: number;
  step: ReadingStep;
  syncResultUrl: (readingId?: string | null) => void;
  setIsPremium: (value: boolean) => void;
  setLanguage: (value: 'ko' | 'en') => void;
  setMetadata: (value: ReadingMetadata | undefined) => void;
  setReadingData: (value: ReadingData | null) => void;
  setReportData: (value: PremiumReportState | null) => void;
  setSelectedCards: (value: TarotSelection[]) => void;
  setShareUrl: (value: string | undefined) => void;
  setStep: (value: ReadingStep) => void;
};

export function useStartResumeClientSnapshot(options: UseStartResumeClientSnapshotOptions) {
  useEffect(() => {
    if (!options.hasCheckedResume || options.step !== 'input') return;
    if (typeof window === 'undefined') return;
    const storedStep = sessionStorage.getItem('reading_step') || localStorage.getItem('reading_step');
    if (!storedStep || storedStep === 'input') return;
    if (!hasRecoverableSnapshot(options)) return;

    const restored = restoreClientSnapshotFromStorage({
      setReadingData: options.setReadingData,
      setLanguage: options.setLanguage,
      setSelectedCards: options.setSelectedCards,
      setReportData: options.setReportData,
      setMetadata: options.setMetadata,
      setShareUrl: options.setShareUrl,
      setIsPremium: options.setIsPremium,
      syncResultUrl: options.syncResultUrl,
    });

    if (restored.hasSnapshot) options.setStep(restored.restoredStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.hasCheckedResume, options.isLoading, options.readingData, options.reportData, options.selectedCardCount, options.step]);
}

function hasRecoverableSnapshot(options: UseStartResumeClientSnapshotOptions) {
  const hasPendingData = hasStoredPayload(
    sessionStorage.getItem('pending_reading_data') || localStorage.getItem('pending_reading_data')
  );
  const hasPendingReport = hasStoredPayload(
    sessionStorage.getItem('pending_report_data') || localStorage.getItem('pending_report_data')
  );
  const hasActiveSession = sessionStorage.getItem('is_session_active') === 'true';
  const hasLiveState = Boolean(options.readingData || options.reportData || options.selectedCardCount > 0 || options.isLoading);

  return hasPendingData || hasPendingReport || hasActiveSession || hasLiveState;
}
