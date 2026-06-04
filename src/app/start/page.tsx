'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { ReadingData } from '@/components/reading/reading-input';
import {
  hasPremiumReportContent,
  type PremiumReportState,
  type ReadingMetadata,
  type ReadingStep,
  type StartReadingFn,
  type TarotSelection,
} from './start-page-helpers';
import { useStartResultModals } from './use-start-result-modals';
import { useStartGrowthTracking } from './use-start-growth-tracking';
import { useStartInvitation } from './use-start-invitation';
import { useStartPaymentPrep } from './use-start-payment-prep';
import { useStartReadingGeneration } from './use-start-reading-generation';
import { useStartReviewGate } from './use-start-review-gate';
import { useStartResume } from './use-start-resume';
import { useStartResultActions } from './use-start-result-actions';
import { debugStartFlow, useStartStepTransitions } from './use-start-step-transitions';
import {
  useBeforeUnloadGuard,
  useStartDynamicPrice,
  useStartPreferredLanguage,
} from './use-start-page-effects';
import { useStartPageQuery } from './use-start-page-query';
import {
  TOTAL_PREMIUM_PHASES,
  determineNextPremiumPhase,
} from './start-reading-generation';
import {
  buildPremiumReportMetadata,
  buildStartUnifiedResult,
} from './start-unified-result';
import { StartPageFallback } from './start-page-fallback';
import { StartPageModals } from './start-page-modals';
import { StartPageStages } from './start-page-stages';

function CosmicPathContent() {
  const [step, setStep] = useState<ReadingStep>('input');
  const [readingData, setReadingData] = useState<ReadingData | null>(null);
  const [selectedCards, setSelectedCards] = useState<TarotSelection[]>([]);

  // 결과 상태
  const [reportData, setReportData] = useState<PremiumReportState | null>(null);
  const [streamContent, setStreamContent] = useState(''); // Fallback용
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<{ phase: number; label: string }>({ phase: 0, label: '' });
  const [metadata, setMetadata] = useState<ReadingMetadata | undefined>(undefined);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  // Decision Guard State
  const [isDecisionAccepted, setIsDecisionAccepted] = useState(false);

  // Share URL State
  const [shareUrl, setShareUrl] = useState<string | undefined>(undefined);

  // Payment State
  const [isPremium, setIsPremium] = useState(false); // Paywall Enabled
  const {
    hasDismissedReview,
    isPaymentModalOpen,
    isReviewOpen,
    isShareModalOpen,
    paymentTrackingSource,
    closePaymentModal,
    closeShareModal,
    dismissReviewModal,
    openPaymentModal,
    openShareModal,
    openReviewModal,
  } = useStartResultModals();

  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    activeLandingVariant,
    autoReferralCode,
    effectiveInitialContext,
    entry,
    initialContext,
    initialQuestion,
    isDecisionTimingEntry,
    isNextMoveReportEntry,
    landingSource,
    paidFromSearchParams,
    queryLanguage,
  } = useStartPageQuery(searchParams, language);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);
  const dynamicPrice = useStartDynamicPrice();
  const { inviteCode, inviterName, isInvitationMode } = useStartInvitation(searchParams);
  const hasRetriedLowConfidenceFree = useRef(false);
  const isLoadingRef = useRef(isLoading);
  const startReadingRef = useRef<StartReadingFn | null>(null);
  const readingSetters = {
    setIsLoading, setIsPremium, setLoadingPhase, setMetadata, setReadingData,
    setReportData, setSelectedCards, setShareUrl, setStep, setStreamContent,
  };

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const { ensureReadingReadyForPayment, syncResultUrl } = useStartPaymentPrep({
    reportData,
    readingData,
    metadata,
    selectedCards,
    language,
    inviteCode,
    autoReferralCode,
    replaceUrl: (url: string) => {
      router.replace(url, { scroll: false });
    },
    setShareUrl,
    onDebug: debugStartFlow,
  });

  useStartPreferredLanguage(queryLanguage, setLanguage);
  useBeforeUnloadGuard(isLoading);
  const { resetResultTracking } = useStartGrowthTracking({
    activeLandingVariant,
    autoReferralCode,
    dynamicPrice,
    entry,
    hasInvite: Boolean(searchParams.get('invite')),
    initialContext,
    initialQuestion,
    isInvitationMode,
    isPremium,
    landingSource,
    language,
    paidFromSearchParams,
    readingData,
    reportData,
    step,
  });
  const {
    handleInputSubmit,
    handleRevealComplete,
    handleTarotComplete,
  } = useStartStepTransitions({
    dynamicPrice,
    entry,
    initialQuestion,
    isDecisionTimingEntry,
    isInvitationMode,
    landingSource,
    language,
    readingData,
    resetResultTracking,
    startReadingRef,
    step,
    syncResultUrl,
    hasRetriedLowConfidenceFree,
    ...readingSetters,
    setIsDecisionAccepted,
    setLanguage,
  });

  const hasReportSummary = !!reportData?.summary;
  useStartReviewGate({
    step,
    isLoading,
    hasReportSummary,
    hasDismissedReview,
    paidFromSearchParams,
    openReviewModal,
  });

  const handleUpgrade = async () => {
    // Open payment modal instead of direct unlock, unless already premium
    if (isPremium) return;
    await ensureReadingReadyForPayment();
    openPaymentModal(entry ? landingSource : 'start_result_unlock');
  };

  const startReading = useStartReadingGeneration({
    dynamicPrice, hasRetriedLowConfidenceFree, isPremium, landingSource,
    language, metadata, readingData, syncResultUrl,
    ...readingSetters,
  });

  useEffect(() => {
    startReadingRef.current = startReading;
  }, [startReading]);

  useStartResume({
    searchParams, step, hasCheckedResume, readingData, reportData,
    selectedCardCount: selectedCards.length, isLoading, isLoadingRef, startReadingRef,
    totalPremiumPhases: TOTAL_PREMIUM_PHASES, determineNextPremiumPhase, syncResultUrl,
    ...readingSetters,
    setHasCheckedResume,
    setIsDecisionAccepted,
    setLanguage,
  });

  const hasPreciseBirthLocation = Boolean(
    readingData?.cityName || typeof readingData?.longitude === 'number'
  );
  const unifiedResult = buildStartUnifiedResult(reportData, metadata);
  const premiumReportData = hasPremiumReportContent(reportData) ? reportData : null;
  const premiumReportMetadata = buildPremiumReportMetadata(metadata);
  const shouldHideProductHeader = !hasCheckedResume || (step === 'result' && isLoading);
  const hasPaidQuery = searchParams.get('paid') === 'true';
  const {
    handleInvitationUpsell,
    handleOwnerInvite,
    handleRematchGuide,
    handleRetryFreeResult,
    handleRetryPremiumResult,
    handleShareCardOpen,
    returnToInputWithDraft,
  } = useStartResultActions({
    readingData, selectedCards, reportData, shareUrl, language, isInvitationMode,
    dynamicPrice, isPremium, landingSource, totalPremiumPhases: TOTAL_PREMIUM_PHASES,
    determineNextPremiumPhase, ensureReadingReadyForPayment, openPaymentModal,
    openShareModal, startReading, hasRetriedLowConfidenceFree,
    ...readingSetters,
  });

  return (
    <>
      <StartPageStages
        language={language} step={step} hasCheckedResume={hasCheckedResume}
        shouldHideProductHeader={shouldHideProductHeader} isLoading={isLoading}
        loadingPhase={loadingPhase} searchPaid={paidFromSearchParams}
        readingData={readingData} inviterName={inviterName} inviteCode={inviteCode}
        initialContext={effectiveInitialContext} initialQuestion={initialQuestion}
        landingSource={landingSource} isNextMoveReportEntry={isNextMoveReportEntry}
        metadata={metadata} reportData={reportData}
        hasPreciseBirthLocation={hasPreciseBirthLocation} unifiedResult={unifiedResult}
        premiumReportData={premiumReportData} premiumReportMetadata={premiumReportMetadata}
        shareUrl={shareUrl} isPremium={isPremium} hasPaidQuery={hasPaidQuery}
        isInvitationMode={isInvitationMode} dynamicPrice={dynamicPrice}
        streamContent={streamContent} onLanguageChange={setLanguage}
        onInputSubmit={handleInputSubmit} onTarotComplete={handleTarotComplete}
        onRevealComplete={handleRevealComplete} onInviteOwner={handleOwnerInvite}
        onInviteUpsell={handleInvitationUpsell} onShareCard={handleShareCardOpen}
        onUnlock={handleUpgrade} onRetryPremium={handleRetryPremiumResult}
        onRetryFree={handleRetryFreeResult} onReturnToInput={returnToInputWithDraft}
        onRematchGuide={handleRematchGuide}
      />
      <StartPageModals
        language={language} isPaymentModalOpen={isPaymentModalOpen}
        isReviewOpen={isReviewOpen} isShareModalOpen={isShareModalOpen}
        readingData={readingData} selectedCards={selectedCards}
        reportData={reportData} metadata={metadata}
        isDecisionAccepted={isDecisionAccepted} dynamicPrice={dynamicPrice}
        trackingSource={entry ? landingSource : paymentTrackingSource}
        autoReferralCode={autoReferralCode} shareUrl={shareUrl}
        onClosePayment={closePaymentModal} onCloseReview={dismissReviewModal}
        onCloseShare={closeShareModal}
      />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<StartPageFallback />}>
      <CosmicPathContent />
    </Suspense>
  );
}
