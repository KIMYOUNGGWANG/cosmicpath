'use client';

import { useEffect, useRef } from 'react';
import type { ReadingData } from '@/components/reading/reading-input';
import {
  type PremiumReportState,
  type ReadingMetadata,
  type ReadingStep,
  type StartReadingFn,
  type TarotSelection,
} from './start-page-helpers';
import { getAccessKeyFromLocation, hasStoredPayload } from './start-page-storage';
import { applyRestoredResumePayload } from './start-resume-premium';
import { resetStartResume } from './start-resume-reset';
import {
  activatePreparedResumeSnapshot,
  hydrateResumeSnapshotFromServer,
  prepareResumeSnapshot,
} from './start-resume-snapshot-state';
import { useStartResumeClientSnapshot } from './use-start-resume-client-snapshot';

type SearchParamsLike = Pick<URLSearchParams, 'get' | 'toString'>;

type UseStartResumeOptions = {
  searchParams: SearchParamsLike;
  step: ReadingStep;
  hasCheckedResume: boolean;
  readingData: ReadingData | null;
  reportData: PremiumReportState | null;
  selectedCardCount: number;
  isLoading: boolean;
  isLoadingRef: React.MutableRefObject<boolean>;
  startReadingRef: React.MutableRefObject<StartReadingFn | null>;
  totalPremiumPhases: number;
  determineNextPremiumPhase: (report: PremiumReportState | null | undefined) => number;
  syncResultUrl: (readingId?: string | null) => void;
  setHasCheckedResume: (value: boolean) => void;
  setStep: (value: ReadingStep) => void;
  setReadingData: (value: ReadingData | null) => void;
  setSelectedCards: (value: TarotSelection[]) => void;
  setReportData: (value: PremiumReportState | null) => void;
  setStreamContent: (value: string) => void;
  setMetadata: (value: ReadingMetadata | undefined) => void;
  setShareUrl: (value: string | undefined) => void;
  setIsPremium: (value: boolean) => void;
  setIsDecisionAccepted: (value: boolean) => void;
  setIsLoading?: (value: boolean) => void;
  setLoadingPhase: (value: { phase: number; label: string }) => void;
  setLanguage: (value: 'ko' | 'en') => void;
};

export function useStartResume(options: UseStartResumeOptions) {
  const isProcessingResume = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const resumeFailsafeId = window.setTimeout(() => {
      if (!isMounted) return;
      console.warn('[Resume] Failsafe released initial loading gate.');
      options.setHasCheckedResume(true);
    }, 2500);

    const checkResume = async () => {
      if (isProcessingResume.current) {
        return;
      }

      isProcessingResume.current = true;

      try {
        const params = new URLSearchParams(
          typeof window !== 'undefined' ? window.location.search : options.searchParams.toString()
        );
        const paid = params.get('paid');
        const canceled = params.get('canceled');
        const readingIdFromUrl = params.get('reading_id');
        const accessKeyFromUrl = getAccessKeyFromLocation() || params.get('accessKey');

        if (!paid && !canceled && !readingIdFromUrl) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const reset = params.get('reset') === 'true';
        const isSessionActive = sessionStorage.getItem('is_session_active') === 'true';

        if (reset) {
          resetStartResume(options);
          return;
        }

        let snapshot = prepareResumeSnapshot({ accessKeyFromUrl, isSessionActive, readingIdFromUrl });
        const shouldResume =
          snapshot.readingId ||
          paid === 'true' ||
          canceled === 'true' ||
          snapshot.hasSessionResume ||
          snapshot.hasBackupResume;

        if (!shouldResume) {
          options.setHasCheckedResume(true);
          return;
        }

        activatePreparedResumeSnapshot(snapshot);

        const hasClientPremiumResumeFlag =
          paid === 'true' ||
          params.get('resume') === 'premium' ||
          sessionStorage.getItem('payment_completed') === 'true' ||
          sessionStorage.getItem('is_premium_user') === 'true';
        snapshot = await hydrateResumeSnapshotFromServer({ hasClientPremiumResumeFlag, snapshot });

        const hasAnyRestorablePayload =
          hasStoredPayload(snapshot.pendingData) ||
          hasStoredPayload(snapshot.pendingReportJson) ||
          hasStoredPayload(snapshot.pendingMetadataJson);

        if (hasAnyRestorablePayload) {
          try {
            await applyRestoredResumePayload({
              canceled,
              options,
              paid,
              parsedMetadata: snapshot.parsedMetadata,
              pendingData: snapshot.pendingData,
              pendingMetadataJson: snapshot.pendingMetadataJson,
              pendingReadingAccessKey: snapshot.pendingReadingAccessKey,
              pendingReadingId: snapshot.pendingReadingId,
              pendingReportJson: snapshot.pendingReportJson,
              readingId: snapshot.readingId,
              storedReadingStep: snapshot.storedReadingStep,
            });
          } catch (error) {
            console.error('[Resume] Failure during restoration:', error);
          }
        }
      } catch (error) {
        console.error('[Resume] Unhandled restoration failure:', error);
      } finally {
        window.clearTimeout(resumeFailsafeId);
        isProcessingResume.current = false;
        if (isMounted) {
          options.setHasCheckedResume(true);
        }
      }
    };

    void checkResume();

    return () => {
      isMounted = false;
      window.clearTimeout(resumeFailsafeId);
      isProcessingResume.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useStartResumeClientSnapshot(options);
}
