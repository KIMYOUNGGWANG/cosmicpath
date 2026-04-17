'use client';

import { useEffect, useRef } from 'react';
import type { ReadingData } from '@/components/reading/reading-input';
import {
  getReadingPhaseLabels,
  normalizeStoredTarotCards,
  type PremiumReportState,
  type ReadingMetadata,
  type ReadingStep,
  type StartReadingFn,
  type TarotSelection,
} from './start-page-helpers';
import {
  fetchSavedReadingSnapshot,
  persistSavedReadingSnapshot,
  restoreClientSnapshotFromStorage,
  reverifyPremiumCheckout,
  waitForPremiumVerification,
} from './start-page-persistence';
import {
  clearSessionAndBackup,
  clearTransientPremiumResumeFlags,
  getAccessKeyFromLocation,
  getStoredReadingAccessKey,
  getStoredReadingId,
  hasStoredPayload,
  saveToSessionAndBackup,
  stripAccessKeyFromLocation,
  syncReadingAccessKey,
} from './start-page-storage';

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
          clearSessionAndBackup();
          clearTransientPremiumResumeFlags();
          options.setStep('input');
          options.setReadingData(null);
          options.setSelectedCards([]);
          options.setReportData(null);
          options.setStreamContent('');
          options.setMetadata(undefined);
          options.setShareUrl(undefined);
          options.setIsPremium(false);
          options.setIsDecisionAccepted(false);
          options.setLoadingPhase({ phase: 0, label: '' });
          options.syncResultUrl(null);
          options.setHasCheckedResume(true);
          return;
        }

        const sessionReadingId = sessionStorage.getItem('pending_reading_id');
        const sessionReadingAccessKey = sessionStorage.getItem('pending_reading_access_key');
        const sessionPendingData = sessionStorage.getItem('pending_reading_data');
        const sessionPendingReport = sessionStorage.getItem('pending_report_data');
        const sessionPendingMetadata = sessionStorage.getItem('pending_metadata');
        const storedReadingStep = sessionStorage.getItem('reading_step') || localStorage.getItem('reading_step');

        const localTimestampRaw = localStorage.getItem('backup_timestamp');
        const localTimestamp = Number(localTimestampRaw);
        const oneDay = 24 * 60 * 60 * 1000;
        const hasFreshBackup =
          Number.isFinite(localTimestamp) &&
          Date.now() - localTimestamp < oneDay;

        const backupReadingId = hasFreshBackup ? localStorage.getItem('pending_reading_id') : null;
        const backupReadingAccessKey = hasFreshBackup ? localStorage.getItem('pending_reading_access_key') : null;
        const backupPendingData = hasFreshBackup ? localStorage.getItem('pending_reading_data') : null;
        const backupPendingReport = hasFreshBackup ? localStorage.getItem('pending_report_data') : null;
        const backupPendingMetadata = hasFreshBackup ? localStorage.getItem('pending_metadata') : null;

        const hasSessionResume =
          hasStoredPayload(sessionReadingId) ||
          hasStoredPayload(sessionReadingAccessKey) ||
          hasStoredPayload(sessionPendingData) ||
          hasStoredPayload(sessionPendingReport) ||
          hasStoredPayload(sessionPendingMetadata);
        const hasBackupResume =
          hasStoredPayload(backupReadingId) ||
          hasStoredPayload(backupReadingAccessKey) ||
          hasStoredPayload(backupPendingData) ||
          hasStoredPayload(backupPendingReport) ||
          hasStoredPayload(backupPendingMetadata);
        const readingId = readingIdFromUrl || sessionReadingId || backupReadingId;

        if (!(readingId || paid === 'true' || canceled === 'true' || hasSessionResume || hasBackupResume)) {
          options.setHasCheckedResume(true);
          return;
        }

        if (readingId && !hasStoredPayload(sessionStorage.getItem('pending_reading_id'))) {
          sessionStorage.setItem('pending_reading_id', readingId);
        }

        if (hasStoredPayload(accessKeyFromUrl)) {
          syncReadingAccessKey(accessKeyFromUrl);
          stripAccessKeyFromLocation();
        }

        let pendingData = sessionPendingData;
        let pendingReportJson = sessionPendingReport;
        let pendingMetadataJson = sessionPendingMetadata;
        let pendingReadingId = sessionReadingId || backupReadingId;
        let pendingReadingAccessKey = accessKeyFromUrl || sessionReadingAccessKey || backupReadingAccessKey;

        if (hasBackupResume) {
          if (!hasStoredPayload(pendingReadingAccessKey) && hasStoredPayload(backupReadingAccessKey)) {
            pendingReadingAccessKey = backupReadingAccessKey;
          }
          if (!hasStoredPayload(pendingData) && hasStoredPayload(backupPendingData)) {
            pendingData = backupPendingData;
          }
          if (!hasStoredPayload(pendingReportJson) && hasStoredPayload(backupPendingReport)) {
            pendingReportJson = backupPendingReport;
          }
          if (!hasStoredPayload(pendingMetadataJson) && hasStoredPayload(backupPendingMetadata)) {
            pendingMetadataJson = backupPendingMetadata;
          }
          if (!hasStoredPayload(pendingReadingId) && hasStoredPayload(backupReadingId)) {
            pendingReadingId = backupReadingId;
          }
        }

        if (hasStoredPayload(pendingReadingId)) {
          sessionStorage.setItem('pending_reading_id', pendingReadingId as string);
        }
        if (hasStoredPayload(pendingReadingAccessKey)) {
          sessionStorage.setItem('pending_reading_access_key', pendingReadingAccessKey as string);
        }
        if (hasStoredPayload(pendingData)) {
          sessionStorage.setItem('pending_reading_data', pendingData as string);
        }
        if (hasStoredPayload(pendingReportJson)) {
          sessionStorage.setItem('pending_report_data', pendingReportJson as string);
        }
        if (hasStoredPayload(pendingMetadataJson)) {
          sessionStorage.setItem('pending_metadata', pendingMetadataJson as string);
        }
        if (isSessionActive) {
          sessionStorage.setItem('is_session_active', 'true');
        }

        let parsedMetadata: Record<string, unknown> | null = null;
        if (hasStoredPayload(pendingMetadataJson)) {
          try {
            parsedMetadata = JSON.parse(pendingMetadataJson as string) as Record<string, unknown>;
          } catch (error) {
            console.error('[Resume] Failed to parse metadata backup:', error);
          }
        }

        if (!hasStoredPayload(pendingData) && parsedMetadata?.readingData) {
          pendingData = JSON.stringify(parsedMetadata.readingData);
          sessionStorage.setItem('pending_reading_data', pendingData);
        }

        const hasClientPremiumResumeFlag =
          paid === 'true' ||
          sessionStorage.getItem('payment_completed') === 'true' ||
          sessionStorage.getItem('is_premium_user') === 'true';

        if (readingId && (!hasStoredPayload(pendingData) || hasClientPremiumResumeFlag)) {
          try {
            const saved = await fetchSavedReadingSnapshot(
              readingId,
              pendingReadingAccessKey || getStoredReadingAccessKey()
            );

            if (saved) {
              persistSavedReadingSnapshot(saved);

              const restoredData = saved.metadata?.readingData || null;
              const restoredReport = saved.data || null;
              const restoredMetadata = saved.metadata || null;

              if (restoredData) {
                pendingData = JSON.stringify(restoredData);
                sessionStorage.setItem('pending_reading_data', pendingData);
              }
              if (restoredReport) {
                pendingReportJson = JSON.stringify(restoredReport);
                sessionStorage.setItem('pending_report_data', pendingReportJson);
              }
              if (restoredMetadata) {
                pendingMetadataJson = JSON.stringify(restoredMetadata);
                sessionStorage.setItem('pending_metadata', pendingMetadataJson);
                parsedMetadata = restoredMetadata;
              }
              localStorage.setItem('backup_timestamp', Date.now().toString());
            }
          } catch (error) {
            console.error('[Resume] DB fetch failed:', error);
          }
        }

        if (readingId && hasClientPremiumResumeFlag && parsedMetadata?.isPremium !== true) {
          await reverifyPremiumCheckout(readingId);

          const verifiedSnapshot = await waitForPremiumVerification(
            readingId,
            pendingReadingAccessKey || getStoredReadingAccessKey()
          );

          if (verifiedSnapshot?.metadata) {
            pendingMetadataJson = JSON.stringify(verifiedSnapshot.metadata);
            sessionStorage.setItem('pending_metadata', pendingMetadataJson);
            parsedMetadata = verifiedSnapshot.metadata;
          }

          if (verifiedSnapshot?.metadata?.readingData) {
            pendingData = JSON.stringify(verifiedSnapshot.metadata.readingData);
            sessionStorage.setItem('pending_reading_data', pendingData);
          }

          if (verifiedSnapshot?.data) {
            pendingReportJson = JSON.stringify(verifiedSnapshot.data);
            sessionStorage.setItem('pending_report_data', pendingReportJson);
          }
        }

        const hasAnyRestorablePayload =
          hasStoredPayload(pendingData) ||
          hasStoredPayload(pendingReportJson) ||
          hasStoredPayload(pendingMetadataJson);

        if (hasAnyRestorablePayload) {
          try {
            const restoredReport = hasStoredPayload(pendingReportJson)
              ? JSON.parse(pendingReportJson as string)
              : null;
            const restoredReadingData = hasStoredPayload(pendingData)
              ? JSON.parse(pendingData as string)
              : (parsedMetadata?.readingData as ReadingData | null) || null;
            const hasRestoredReportPayload = Boolean(
              restoredReport &&
              typeof restoredReport === 'object' &&
              Object.keys(restoredReport).length > 0
            );

            if (restoredReadingData) {
              options.setReadingData(restoredReadingData);
              options.setLanguage(restoredReadingData.language as 'ko' | 'en');

              const restoredCards = normalizeStoredTarotCards(
                (restoredReadingData as ReadingData & { tarotCards?: unknown }).tarotCards
              );
              if (restoredCards.length > 0) {
                options.setSelectedCards(restoredCards);
              }
            }

            if (restoredReport) {
              options.setReportData(restoredReport);
            }

            if (parsedMetadata) {
              options.setMetadata(parsedMetadata as ReadingMetadata);
              if (parsedMetadata.language) {
                options.setLanguage(parsedMetadata.language as 'ko' | 'en');
              }
            }

            const isServerVerifiedPremium = parsedMetadata?.isPremium === true;
            if (isServerVerifiedPremium) {
              options.setIsPremium(true);
            }

            if (sessionStorage.getItem('decision_accepted') === 'true') {
              options.setIsDecisionAccepted(true);
            }

            const restoredCards = restoredReadingData
              ? normalizeStoredTarotCards(
                  (restoredReadingData as ReadingData & { tarotCards?: unknown }).tarotCards
                )
              : [];
            const nextRestoredStep =
              hasRestoredReportPayload ||
              storedReadingStep === 'result' ||
              paid === 'true' ||
              canceled === 'true' ||
              sessionStorage.getItem('payment_completed') === 'true'
                ? 'result'
                : storedReadingStep === 'reveal'
                  ? 'reveal'
                  : storedReadingStep === 'tarot'
                    ? 'tarot'
                    : restoredCards.length > 0
                      ? 'reveal'
                      : 'input';

            options.setStep(nextRestoredStep);

            const pendingId = sessionStorage.getItem('pending_reading_id');
            if (pendingId) {
              options.setShareUrl(`${window.location.origin}/share/${pendingId}`);
              options.syncResultUrl(pendingId);
            }

            const isPaymentCompleted = sessionStorage.getItem('payment_completed') === 'true';
            if ((paid === 'true' || isPaymentCompleted) && restoredReadingData && isServerVerifiedPremium) {
              options.setIsPremium(true);
              if (paid === 'true') {
                saveToSessionAndBackup('payment_completed', 'true');
              }

              if (!options.isLoadingRef.current) {
                const nextPhase = options.determineNextPremiumPhase(restoredReport);
                if (nextPhase <= options.totalPremiumPhases) {
                  const resumeLanguage =
                    (restoredReadingData.language as 'ko' | 'en') ||
                    (parsedMetadata?.language as 'ko' | 'en') ||
                    'ko';
                  const labels = getReadingPhaseLabels(resumeLanguage, 'premium');
                  options.setLoadingPhase({
                    phase: nextPhase,
                    label: labels[nextPhase] || (resumeLanguage === 'en' ? 'Preparing your reading...' : '리딩을 정리하는 중...'),
                  });
                  options.setHasCheckedResume(true);
                  await options.startReadingRef.current?.(
                    normalizeStoredTarotCards((restoredReadingData as ReadingData & { tarotCards?: unknown }).tarotCards),
                    true,
                    restoredReadingData,
                    restoredReport || undefined,
                    nextPhase,
                    {
                      readingId: readingId || pendingReadingId || getStoredReadingId(),
                      accessKey: pendingReadingAccessKey || getStoredReadingAccessKey(),
                    }
                  );
                }
              }
            } else if ((paid === 'true' || isPaymentCompleted) && !isServerVerifiedPremium) {
              options.setStreamContent(
                restoredReadingData?.language === 'en'
                  ? 'Your payment is still syncing. Please wait a moment and reopen the premium report.'
                  : '결제 정보가 아직 동기화되는 중입니다. 잠시 후 프리미엄 리포트를 다시 열어주세요.'
              );
            }

            if (paid === 'true' || canceled === 'true') {
              window.history.replaceState({}, '', window.location.pathname);
            }
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
  }, []);

  useEffect(() => {
    if (!options.hasCheckedResume || options.step !== 'input') return;
    if (typeof window === 'undefined') return;

    const storedStep = sessionStorage.getItem('reading_step') || localStorage.getItem('reading_step');
    if (!storedStep || storedStep === 'input') return;

    const hasPendingData = hasStoredPayload(
      sessionStorage.getItem('pending_reading_data') || localStorage.getItem('pending_reading_data')
    );
    const hasPendingReport = hasStoredPayload(
      sessionStorage.getItem('pending_report_data') || localStorage.getItem('pending_report_data')
    );
    const hasActiveSession = sessionStorage.getItem('is_session_active') === 'true';
    const hasLiveState = Boolean(options.readingData || options.reportData || options.selectedCardCount > 0 || options.isLoading);

    if (!(hasPendingData || hasPendingReport || hasActiveSession || hasLiveState)) {
      return;
    }

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

    if (!restored.hasSnapshot) {
      return;
    }

    options.setStep(restored.restoredStep);
  }, [
    options.hasCheckedResume,
    options.isLoading,
    options.readingData,
    options.reportData,
    options.selectedCardCount,
    options.setIsPremium,
    options.setLanguage,
    options.setMetadata,
    options.setReadingData,
    options.setReportData,
    options.setSelectedCards,
    options.setShareUrl,
    options.setStep,
    options.step,
    options.syncResultUrl,
  ]);
}
