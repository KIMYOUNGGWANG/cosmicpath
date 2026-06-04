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
  getStoredReadingAccessKey,
  getStoredReadingId,
  hasStoredPayload,
  saveToSessionAndBackup,
} from './start-page-storage';

type ResumeRestoreOptions = {
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

type ApplyRestoredResumePayloadInput = {
  canceled: string | null;
  options: ResumeRestoreOptions;
  paid: string | null;
  parsedMetadata: Record<string, unknown> | null;
  pendingData: string | null;
  pendingMetadataJson: string | null;
  pendingReadingAccessKey: string | null;
  pendingReadingId: string | null;
  pendingReportJson: string | null;
  readingId: string | null;
  storedReadingStep: string | null;
};

export async function applyRestoredResumePayload(input: ApplyRestoredResumePayloadInput) {
  const { options } = input;
  const restoredReport = hasStoredPayload(input.pendingReportJson)
    ? JSON.parse(input.pendingReportJson as string)
    : null;
  const restoredReadingData = hasStoredPayload(input.pendingData)
    ? JSON.parse(input.pendingData as string)
    : (input.parsedMetadata?.readingData as ReadingData | null) || null;
  const hasRestoredReportPayload = Boolean(
    restoredReport && typeof restoredReport === 'object' && Object.keys(restoredReport).length > 0
  );

  restoreBasicClientState(input, restoredReadingData, restoredReport);
  const isServerVerifiedPremium = input.parsedMetadata?.isPremium === true;
  if (isServerVerifiedPremium) options.setIsPremium(true);
  if (sessionStorage.getItem('decision_accepted') === 'true') options.setIsDecisionAccepted(true);

  const restoredCards = restoredReadingData
    ? normalizeStoredTarotCards((restoredReadingData as ReadingData & { tarotCards?: unknown }).tarotCards)
    : [];
  options.setStep(getNextRestoredStep(input, hasRestoredReportPayload, restoredCards.length));
  restoreShareUrl(input);
  await resumePremiumIfNeeded(input, restoredReadingData, restoredReport, isServerVerifiedPremium);

  if (input.paid === 'true' || input.canceled === 'true') {
    window.history.replaceState({}, '', window.location.pathname);
  }
}

function restoreBasicClientState(
  input: ApplyRestoredResumePayloadInput,
  restoredReadingData: ReadingData | null,
  restoredReport: PremiumReportState | null
) {
  if (restoredReadingData) {
    input.options.setReadingData(restoredReadingData);
    input.options.setLanguage(restoredReadingData.language as 'ko' | 'en');
    const restoredCards = normalizeStoredTarotCards(
      (restoredReadingData as ReadingData & { tarotCards?: unknown }).tarotCards
    );
    if (restoredCards.length > 0) input.options.setSelectedCards(restoredCards);
  }
  if (restoredReport) input.options.setReportData(restoredReport);
  if (input.parsedMetadata) {
    input.options.setMetadata(input.parsedMetadata as ReadingMetadata);
    if (input.parsedMetadata.language) input.options.setLanguage(input.parsedMetadata.language as 'ko' | 'en');
  }
}

function getNextRestoredStep(
  input: ApplyRestoredResumePayloadInput,
  hasRestoredReportPayload: boolean,
  restoredCardCount: number
): ReadingStep {
  if (
    hasRestoredReportPayload ||
    input.storedReadingStep === 'result' ||
    input.paid === 'true' ||
    input.canceled === 'true' ||
    sessionStorage.getItem('payment_completed') === 'true'
  ) {
    return 'result';
  }
  if (input.storedReadingStep === 'reveal') return 'reveal';
  if (input.storedReadingStep === 'tarot') return 'tarot';
  return restoredCardCount > 0 ? 'reveal' : 'input';
}

function restoreShareUrl(input: ApplyRestoredResumePayloadInput) {
  const pendingId = sessionStorage.getItem('pending_reading_id');
  if (!pendingId) return;

  input.options.setShareUrl(`${window.location.origin}/share/${pendingId}`);
  input.options.syncResultUrl(pendingId);
}

async function resumePremiumIfNeeded(
  input: ApplyRestoredResumePayloadInput,
  restoredReadingData: ReadingData | null,
  restoredReport: PremiumReportState | null,
  isServerVerifiedPremium: boolean
) {
  const isPaymentCompleted = sessionStorage.getItem('payment_completed') === 'true';
  if ((input.paid === 'true' || isPaymentCompleted) && restoredReadingData && isServerVerifiedPremium) {
    await resumeVerifiedPremium(input, restoredReadingData, restoredReport);
    return;
  }
  if ((input.paid === 'true' || isPaymentCompleted) && !isServerVerifiedPremium) {
    input.options.setStreamContent(
      restoredReadingData?.language === 'en'
        ? 'Your payment is still syncing. Please wait a moment and reopen the premium report.'
        : '결제 정보가 아직 동기화되는 중입니다. 잠시 후 프리미엄 리포트를 다시 열어주세요.'
    );
  }
}

async function resumeVerifiedPremium(
  input: ApplyRestoredResumePayloadInput,
  restoredReadingData: ReadingData,
  restoredReport: PremiumReportState | null
) {
  input.options.setIsPremium(true);
  if (input.paid === 'true') saveToSessionAndBackup('payment_completed', 'true');
  if (input.options.isLoadingRef.current) return;

  const nextPhase = input.options.determineNextPremiumPhase(restoredReport);
  if (nextPhase > input.options.totalPremiumPhases) return;

  const resumeLanguage =
    (restoredReadingData.language as 'ko' | 'en') ||
    (input.parsedMetadata?.language as 'ko' | 'en') ||
    'ko';
  const labels = getReadingPhaseLabels(resumeLanguage, 'premium');
  input.options.setLoadingPhase({
    phase: nextPhase,
    label: labels[nextPhase] || (resumeLanguage === 'en' ? 'Preparing your reading...' : '리딩을 정리하는 중...'),
  });
  input.options.setHasCheckedResume(true);
  await input.options.startReadingRef.current?.(
    normalizeStoredTarotCards((restoredReadingData as ReadingData & { tarotCards?: unknown }).tarotCards),
    true,
    restoredReadingData,
    restoredReport || undefined,
    nextPhase,
    {
      readingId: input.readingId || input.pendingReadingId || getStoredReadingId(),
      accessKey: input.pendingReadingAccessKey || getStoredReadingAccessKey(),
    }
  );
}
