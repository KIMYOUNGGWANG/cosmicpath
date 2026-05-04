'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import type { ReadingData } from '@/components/reading/reading-input';
import { createSession } from '@/lib/session/reading-session';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { ProductShell } from '@/components/common/ProductShell';
import { getLandingVariant, readPreferredClientLanguage, USER_LANGUAGE_STORAGE_KEY } from '@/lib/language-preference';
import {
  getPrefilledQuestion,
  getPrefilledReadingContext,
  getReadingPhaseLabels,
  getSourceSummary,
  getStartPageSource,
  hasPremiumReportContent,
  normalizeStoredTarotCards,
  type PremiumReportState,
  type PremiumReportViewMetadata,
  type ReadingMetadata,
  type ReadingStep,
  type ResumeRequestContext,
  type StartReadingFn,
  type TarotSelection,
  type KeyTheme,
  type SourceSummaryRecord,
} from './start-page-helpers';
import {
  reverifyPremiumCheckout,
  waitForPremiumVerification,
} from './start-page-persistence';
import {
  buildReadingShareUrl,
  clearSessionAndBackup,
  clearTransientPremiumResumeFlags,
  getStoredReadingAccessKey,
  getStoredReadingId,
  saveToSessionAndBackup,
  sleep,
  syncReadingAccessKey,
  syncResultUrl as syncStartResultUrl,
  waitForPendingReadingId,
} from './start-page-storage';
import { useStartResultModals } from './use-start-result-modals';
import { useStartReviewGate } from './use-start-review-gate';
import { useStartResume } from './use-start-resume';
import { StartInputStage } from './start-input-stage';
import { StartRevealStage } from './start-reveal-stage';
import { StartResultStage } from './start-result-stage';
import { StartTarotStage } from './start-tarot-stage';

import { Footer } from '@/components/landing/Footer';
import type { CosmicTag, UnifiedReadingResult } from '@/lib/cosmic/schema';
import { Skeleton } from '@/components/ui/skeleton';

// 🚀 Dynamic Imports - 초기 번들 크기 최적화
// 이 컴포넌트들은 사용자가 해당 단계에 도달할 때만 로드됩니다
const PaymentModal = dynamic(() => import('@/components/payment/PaymentModal').then(mod => mod.PaymentModal));
const ReviewModal = dynamic(() => import('@/components/review/ReviewModal').then(mod => mod.ReviewModal));
const ShareCardModal = dynamic(() => import('@/components/share/ShareCardModal').then(mod => mod.ShareCardModal));

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
  const [language, setLanguage] = useState<'ko' | 'en'>(() =>
    typeof window !== 'undefined' ? readPreferredClientLanguage() : 'ko'
  );

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
  const autoReferralCode =
    searchParams.get('referralCode') ||
    searchParams.get('ref') ||
    searchParams.get('promo') ||
    undefined;
  const entry = searchParams.get('entry');
  const initialContext = getPrefilledReadingContext(searchParams.get('context'));
  const initialQuestion = getPrefilledQuestion(searchParams.get('question'));
  const landingSource = getStartPageSource(Boolean(searchParams.get('invite')), entry);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);

  // Dynamic Price State (fetched from Stripe)
  const [dynamicPrice, setDynamicPrice] = useState<string>('');

  // Viral Invitation State
  const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);
  const [inviterName, setInviterName] = useState<string | undefined>(undefined);
  const [isInvitationMode, setIsInvitationMode] = useState(false);
  const hasTrackedLandingView = useRef(false);
  const hasTrackedFreeResult = useRef(false);
  const hasTrackedReportComplete = useRef(false);
  const hasRetriedLowConfidenceFree = useRef(false);
  const isLoadingRef = useRef(isLoading);
  const startReadingRef = useRef<StartReadingFn | null>(null);
  isLoadingRef.current = isLoading;

  const debugStartFlow = (event: string, details?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'production') return;
    console.debug('[StartFlow]', event, details || {});
  };

  const transitionToStep = (nextStep: ReadingStep, reason: string, details?: Record<string, unknown>) => {
    debugStartFlow('step_transition', {
      from: step,
      to: nextStep,
      reason,
      ...details,
    });
    setStep(nextStep);
  };

  const syncResultUrl = (readingId?: string | null) => {
    syncStartResultUrl({
      readingId,
      inviteCode,
      autoReferralCode,
      onDebug: debugStartFlow,
      updateUrl: (url: string) => {
        router.replace(url, { scroll: false });
      }
    });
  };

  const ensureReadingReadyForPayment = async () => {
    const existingId =
      sessionStorage.getItem('pending_reading_id') ||
      localStorage.getItem('pending_reading_id');

    if (existingId) {
      syncResultUrl(existingId);
      return existingId;
    }

    const waitedId = await waitForPendingReadingId();
    if (waitedId) {
      syncResultUrl(waitedId);
      return waitedId;
    }

    if (!reportData || !readingData) {
      syncResultUrl(null);
      return null;
    }

    try {
      const response = await fetch('/api/reading/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessKey: getStoredReadingAccessKey() || undefined,
          data: reportData,
          metadata: {
            ...(metadata || {}),
            isPremium: false,
            readingData,
            tarotCards: selectedCards,
            language,
            paymentSource: 'stripe_pending',
          },
        }),
      });

      if (!response.ok) {
        syncResultUrl(null);
        return null;
      }

      const savedPayload = await response.json().catch(() => null);
      syncReadingAccessKey(savedPayload?.accessKey);

      const savedId = typeof savedPayload?.id === 'string' ? savedPayload.id : null;
      if (!savedId) {
        syncResultUrl(null);
        return null;
      }

      saveToSessionAndBackup('pending_reading_id', savedId);

      setShareUrl(buildReadingShareUrl(savedId));
      syncResultUrl(savedId);

      return savedId;
    } catch (error) {
      console.error('Failed to prepare reading for payment modal:', error);
      syncResultUrl(null);
      return null;
    }
  };

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/payment/price');
        const data = await response.json();
        if (data.metadata?.fallback !== 'true' && data.formattedPrice) {
          setDynamicPrice(data.formattedPrice);
        }
      } catch (error) {
        console.error('Failed to fetch dynamic price:', error);
      }
    };
    fetchPrice();

  }, []);

  useEffect(() => {
    if (hasTrackedLandingView.current) return;

    hasTrackedLandingView.current = true;
    void trackClientGrowthEvent({
      event: 'landing_view',
      source: landingSource,
      step: step,
      language,
      invitationMode: Boolean(searchParams.get('invite')),
      referralCode: autoReferralCode,
      price: dynamicPrice || undefined,
      metadata: {
        landingVariant: getLandingVariant(language),
        entry: entry || undefined,
        initialContext: initialContext || undefined,
        hasPrefilledQuestion: Boolean(initialQuestion),
      },
    });
  }, [autoReferralCode, dynamicPrice, entry, initialContext, initialQuestion, landingSource, language, searchParams, step]);

  // 🎫 Viral Invitation Verification
  useEffect(() => {
    const code = searchParams.get('invite');
    if (code) {
      setInviteCode(code);
      // Verify Code
      fetch(`/api/invite/verify?code=${code}`)
        .then(res => res.json())
        .then(data => {
          if (data.isValid) {
            setInviterName(data.hostName);
            setIsInvitationMode(true);
          }
        })
        .catch(err => console.error('Invite verification failed:', err));
    }
  }, [searchParams]);

  useEffect(() => {
    if (step !== 'result' || !reportData?.summary || isPremium) return;
    if (hasTrackedFreeResult.current) return;

    hasTrackedFreeResult.current = true;
    void trackClientGrowthEvent({
      event: 'first_result_view',
      source: 'start_result',
      step,
      language,
      context: readingData?.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
      readingId: sessionStorage.getItem('pending_reading_id') || undefined,
      metadata: {
        landingVariant: getLandingVariant(language),
      },
    });
  }, [dynamicPrice, isInvitationMode, isPremium, language, readingData, reportData, step]);

  useEffect(() => {
    const isPaidSession =
      isPremium ||
      searchParams.get('paid') === 'true' ||
      sessionStorage.getItem('payment_completed') === 'true';

    if (step !== 'result' || !reportData?.final_verdict || !isPaidSession) return;
    if (hasTrackedReportComplete.current) return;

    hasTrackedReportComplete.current = true;
    void trackClientGrowthEvent({
      event: 'report_complete',
      source: 'start_result',
      step,
      language,
      context: readingData?.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
      readingId: sessionStorage.getItem('pending_reading_id') || undefined,
      plan: 'premium_reading',
    });
  }, [dynamicPrice, isInvitationMode, isPremium, language, readingData, reportData, searchParams, step]);

  // 🚨 beforeunload: 로딩 중 창 닫기 방지
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLoading) {
        e.preventDefault();
        // 최신 브라우저에서는 커스텀 메시지가 표시되지 않지만,
        // 기본 경고 다이얼로그가 표시됨
        return '분석 중입니다. 정말 닫으시겠습니까? 결과가 손실될 수 있습니다.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLoading]);

  const hasReportSummary = !!reportData?.summary;
  const paidFromSearchParams = searchParams.get('paid') === 'true';
  useStartReviewGate({
    step,
    isLoading,
    hasReportSummary,
    hasDismissedReview,
    paidFromSearchParams,
    openReviewModal,
  });

  // Step 1: Question + birth data -> tarot selection

  const handleInputSubmit = (data: ReadingData) => {
    clearSessionAndBackup(); // Clear previous session data

    hasTrackedFreeResult.current = false;
    hasTrackedReportComplete.current = false;
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
    saveToSessionAndBackup('reading_step', 'tarot');
    syncResultUrl(null);
    void trackClientGrowthEvent({
      event: 'analysis_start',
      source: 'reading_input',
      step: 'input',
      language: data.language,
      context: data.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
    });
    setLoadingPhase({ phase: 0, label: '' });
    setIsLoading(false);
    transitionToStep('tarot', 'input_submit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTarotComplete = (cards: TarotSelection[]) => {
    setSelectedCards(cards);
    saveToSessionAndBackup('is_session_active', 'true');

    if (readingData) {
      saveToSessionAndBackup('pending_reading_data', JSON.stringify({ ...readingData, tarotCards: cards }));
    }

    void trackClientGrowthEvent({
      event: 'tarot_complete',
      source: 'tarot_picker',
      step: 'tarot',
      language,
      context: readingData?.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
      metadata: {
        tarotCount: cards.length,
      },
    });

    transitionToStep('reveal', 'tarot_complete');
    saveToSessionAndBackup('reading_step', 'reveal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void startReading(cards);
  };

  const handleRevealComplete = () => {
    setTimeout(() => {
      setStep('result');
      saveToSessionAndBackup('reading_step', 'result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  const handleUpgrade = async () => {
    // Open payment modal instead of direct unlock, unless already premium
    if (isPremium) return;
    await ensureReadingReadyForPayment();
    openPaymentModal('start_result_unlock');
  };

  const TOTAL_FREE_PHASES = 2;
  const TOTAL_PREMIUM_PHASES = 8;

  const determineNextPremiumPhase = (report: PremiumReportState | null | undefined) => {
    if (!report?.summary || !report?.traits || !report?.core_analysis) return 1;
    if (!report?.astro_deep) return 2;
    if (!report?.tarot_details || !report?.numerology) return 3;
    if (!report?.saju_sections) return 4;
    if (!report?.fortune_flow) return 5;
    if (!report?.life_areas) return 6;
    if (!report?.special_analysis || !report?.action_plan || !report?.date_selection) return 7;
    if (!report?.past_life || !report?.glossary || !report?.final_verdict) return 8;
    return TOTAL_PREMIUM_PHASES + 1;
  };

  useStartResume({
    searchParams,
    step,
    hasCheckedResume,
    readingData,
    reportData,
    selectedCardCount: selectedCards.length,
    isLoading,
    isLoadingRef,
    startReadingRef,
    totalPremiumPhases: TOTAL_PREMIUM_PHASES,
    determineNextPremiumPhase,
    syncResultUrl,
    setHasCheckedResume,
    setStep,
    setReadingData,
    setSelectedCards,
    setReportData,
    setStreamContent,
    setMetadata,
    setShareUrl,
    setIsPremium,
    setIsDecisionAccepted,
    setLoadingPhase,
    setLanguage,
  });


  const startReading = async (
    cards: TarotSelection[],
    isPremiumOverride = false,
    readingDataOverride?: ReadingData,
    initialReport?: PremiumReportState,
    startPhaseOverride?: number,
    resumeContext?: ResumeRequestContext
  ) => {
    let dataToUse = readingDataOverride || readingData;
    if (!dataToUse) return;
    const activeLanguage = (dataToUse.language as 'ko' | 'en') || language;
    const resumeReadingId = resumeContext?.readingId || getStoredReadingId();
    const resumeAccessKey = resumeContext?.accessKey || getStoredReadingAccessKey();

    try {
      setIsLoading(true);
      setStreamContent('');

      // If resuming, use existing report, otherwise start empty
      let accumulatedReport: PremiumReportState = initialReport || {};
      let accumulatedMetadata: ReadingMetadata = metadata || {};
      const requestTier = (isPremium || isPremiumOverride) ? 'premium' : 'free';
      const totalPhases = requestTier === 'premium' ? TOTAL_PREMIUM_PHASES : TOTAL_FREE_PHASES;
      const labels = getReadingPhaseLabels(activeLanguage, requestTier);

      const startPhase = startPhaseOverride || 1;
      const maxPhase = totalPhases;

      // If we are just starting fresh free reading, phase 1 only.
      // If we upgraded, resume from the first missing premium phase.

      for (let phase = startPhase; phase <= maxPhase; phase++) {
        let shouldRetryPhase = true;
        let hasRetriedPremiumVerification = false;
        let shouldStopAfterCurrentPhase = false;
        let providerPressureRetryCount = 0;
        const maxProviderPressureRetries = 2;
        let aiGenerationRetryCount = 0;
        const maxAiGenerationRetries = 1;
        let premiumPhaseTimeoutRetryCount = 0;
        const maxPremiumPhaseTimeoutRetries = 1;

        while (shouldRetryPhase) {
          shouldRetryPhase = false;
          setLoadingPhase({ phase, label: labels[phase] });

          const response = await fetch('/api/reading', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...dataToUse,
              tarotCards: cards,
              tier: requestTier,
              phase,
              previousReport: accumulatedReport,
              ...(requestTier === 'premium'
                ? {
                    isPaid: isPremium || isPremiumOverride,
                    readingId: resumeReadingId || undefined,
                    accessKey: resumeAccessKey || undefined,
                  }
                : {}),
            }),
          });

          const result = await response.json().catch(() => null);

          if (!response.ok) {
            const isTemporaryOraclePressure =
              (response.status === 503 || response.status === 429) &&
              result?.code === 'AI_TEMPORARILY_UNAVAILABLE';
            const isAiGenerationFailure =
              response.status >= 500 &&
              result?.code === 'AI_GENERATION_FAILED';
            const isPremiumPhaseTimeout =
              requestTier === 'premium' &&
              response.status >= 500 &&
              typeof result?.error === 'string' &&
              result.error.includes('timed out after');

            const isPaymentVerificationPending =
              response.status === 402 &&
              result?.code === 'PAYMENT_REQUIRED' &&
              requestTier === 'premium' &&
              Boolean(resumeReadingId);

            if (isPaymentVerificationPending && !hasRetriedPremiumVerification && resumeReadingId) {
              hasRetriedPremiumVerification = true;
              setLoadingPhase({
                phase,
                label: activeLanguage === 'en'
                  ? 'Confirming payment and reopening your premium report...'
                  : '결제를 다시 확인하고 프리미엄 리포트를 이어가는 중...',
              });

              await reverifyPremiumCheckout(resumeReadingId);

              const verifiedSnapshot = await waitForPremiumVerification(
                resumeReadingId,
                resumeAccessKey
              );

              if (verifiedSnapshot?.metadata?.isPremium === true) {
                if (verifiedSnapshot.data && typeof verifiedSnapshot.data === 'object') {
                  accumulatedReport = { ...accumulatedReport, ...verifiedSnapshot.data };
                  setReportData({ ...accumulatedReport });
                  saveToSessionAndBackup('pending_report_data', JSON.stringify(accumulatedReport));
                }

                if (verifiedSnapshot.metadata && typeof verifiedSnapshot.metadata === 'object') {
                  accumulatedMetadata = { ...accumulatedMetadata, ...verifiedSnapshot.metadata };
                  setMetadata({ ...accumulatedMetadata });
                  saveToSessionAndBackup('pending_metadata', JSON.stringify(accumulatedMetadata));
                }

                if (verifiedSnapshot.metadata?.readingData) {
                  dataToUse = verifiedSnapshot.metadata.readingData;
                  setReadingData(verifiedSnapshot.metadata.readingData);
                }

                const recoveredCards = normalizeStoredTarotCards(
                  (verifiedSnapshot.metadata?.readingData as ReadingData & { tarotCards?: unknown } | undefined)?.tarotCards
                    ?? verifiedSnapshot.metadata?.tarotCards
                );
                if (recoveredCards.length > 0) {
                  setSelectedCards(recoveredCards);
                }

                setIsPremium(true);
                shouldRetryPhase = true;
                continue;
              }

              setStreamContent(
                activeLanguage === 'en'
                  ? 'Your payment went through, but premium access is still syncing. Please wait a moment and tap retry again.'
                  : '결제는 완료되었지만 프리미엄 권한 반영이 조금 지연되고 있습니다. 잠시 후 다시 한 번 이어서 진행해 주세요.'
              );
              return;
            }

            if (isTemporaryOraclePressure && providerPressureRetryCount < maxProviderPressureRetries) {
              providerPressureRetryCount += 1;
              const retryDelayMs = 4000 * providerPressureRetryCount;
              setLoadingPhase({
                phase,
                label: activeLanguage === 'en'
                  ? `The oracle is crowded. Holding your place and retrying... (${providerPressureRetryCount}/${maxProviderPressureRetries})`
                  : `오라클이 혼잡해 자리를 유지한 채 다시 시도하는 중입니다... (${providerPressureRetryCount}/${maxProviderPressureRetries})`,
              });
              await sleep(retryDelayMs);
              shouldRetryPhase = true;
              continue;
            }

            if (isTemporaryOraclePressure) {
              setStreamContent(
                activeLanguage === 'en'
                  ? 'The oracle is crowded right now. Please wait a moment and try again.'
                  : '지금 오라클 리딩이 혼잡합니다. 잠시 후 다시 시도해주세요.'
              );
              return;
            }

            if (isAiGenerationFailure && aiGenerationRetryCount < maxAiGenerationRetries) {
              aiGenerationRetryCount += 1;
              setLoadingPhase({
                phase,
                label: activeLanguage === 'en'
                  ? 'The oracle is reorganizing the reading. Retrying once more...'
                  : '오라클이 리딩 구조를 다시 정리하는 중입니다. 한 번 더 시도할게요...',
              });
              await sleep(2500);
              shouldRetryPhase = true;
              continue;
            }

            if (isAiGenerationFailure) {
              setStreamContent(
                result && typeof result.error === 'string'
                  ? result.error
                  : (activeLanguage === 'en'
                      ? 'We could not complete your reading right now. Please try again.'
                      : '지금은 리딩을 끝까지 생성하지 못했습니다. 다시 시도해주세요.')
              );
              return;
            }

            if (isPremiumPhaseTimeout && premiumPhaseTimeoutRetryCount < maxPremiumPhaseTimeoutRetries) {
              premiumPhaseTimeoutRetryCount += 1;
              setLoadingPhase({
                phase,
                label: activeLanguage === 'en'
                  ? 'The oracle phase is taking longer than usual. Holding your progress and retrying...'
                  : '오라클 단계가 평소보다 오래 걸리고 있어, 진행 상태를 유지한 채 다시 시도하는 중입니다...',
              });
              await sleep(3500);
              shouldRetryPhase = true;
              continue;
            }

            if (isPremiumPhaseTimeout) {
              setStreamContent(
                activeLanguage === 'en'
                  ? 'This oracle phase is taking longer than usual. Please wait a moment and try again.'
                  : '이 오라클 단계가 평소보다 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.'
              );
              return;
            }

            if (response.status === 402 && result?.code === 'QUOTA_EXCEEDED') {
              // Quota exceeded - show dedicated UX instead of generic error
              const hoursUntilReset = (() => {
                const now = new Date();
                const midnight = new Date(now);
                midnight.setHours(24, 0, 0, 0);
                return Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
              })();

              void trackClientGrowthEvent({
                event: 'quota_exceeded',
                source: 'start_reading',
                step: 'reading',
                language: activeLanguage,
                context: dataToUse.context,
                price: dynamicPrice || undefined,
              });

              setStreamContent(
                activeLanguage === 'en'
                  ? `__QUOTA_EXCEEDED__|You've used your free reading for today. Your next free reading refreshes in about ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''}. Unlock your full premium report now to see all 5 locked sections.|${hoursUntilReset}`
                  : `__QUOTA_EXCEEDED__|오늘의 무료 사주를 이미 사용했습니다. 다음 무료 리딩은 약 ${hoursUntilReset}시간 후에 갱신됩니다. 지금 프리미엄 리포트를 잠금 해제하면 5개 섹션을 모두 볼 수 있습니다.|${hoursUntilReset}`
              );
              setIsLoading(false);
              return;
            }

            if (response.status === 402) {
              clearTransientPremiumResumeFlags();
              setIsPremium(false);
            }
            const serverMessage =
              result && typeof result.error === 'string'
                ? result.error
                : `Phase ${phase} failed: ${response.statusText}`;
            throw new Error(serverMessage);
          }

          if (!result.success) {
            if (result.isFallback && typeof result.fallbackMessage === 'string') {
              const fallbackReport: PremiumReportState = {
                summary: {
                  title: activeLanguage === 'en' ? 'Your reading summary' : '첫 리딩 요약',
                  content: result.fallbackMessage,
                  trust_score: 3,
                  trust_reason: activeLanguage === 'en'
                    ? 'A simplified fallback summary was prepared because the full AI response was unstable.'
                    : '전체 AI 응답이 불안정해서 요약형 fallback 결과를 먼저 준비했습니다.',
                },
                traits: [],
              };

              accumulatedReport = { ...accumulatedReport, ...fallbackReport };
              setReportData({ ...accumulatedReport });
              setStreamContent(result.fallbackMessage);
              saveToSessionAndBackup('pending_report_data', JSON.stringify(accumulatedReport));
              shouldStopAfterCurrentPhase = true;
              break;
            }

            throw new Error(result.error || `Phase ${phase} validation failed`);
          }

          // Merge results
          accumulatedReport = { ...accumulatedReport, ...result.report };

          // Update UI immediately for each phase
          setReportData({ ...accumulatedReport });
          saveToSessionAndBackup('pending_report_data', JSON.stringify(accumulatedReport));

          // Metadata update
          if (result.metadata) {
            accumulatedMetadata = { ...accumulatedMetadata, ...result.metadata };
            setMetadata({ ...accumulatedMetadata });
            saveToSessionAndBackup('pending_metadata', JSON.stringify(accumulatedMetadata));

            if (!cards.length && Array.isArray(result.metadata.tarotCards)) {
              const autoCards = normalizeStoredTarotCards(result.metadata.tarotCards);
              setSelectedCards(autoCards);
              saveToSessionAndBackup('pending_reading_data', JSON.stringify({ ...dataToUse, tarotCards: autoCards }));
            }
          }
        }

        if (shouldStopAfterCurrentPhase) {
          break;
        }

        const phaseTarotCardsForSave =
          cards.length > 0
            ? cards
            : Array.isArray(accumulatedMetadata.tarotCards)
              ? accumulatedMetadata.tarotCards
              : [];

        // [New] Intermediate Save for Premium Users after Phase 1
        // This ensures a ReadingResult record exists in DB for payment verification in Phase 2+
        if ((isPremium || isPremiumOverride) && phase === 1) {
          try {
            const premiumPaymentSource =
              typeof accumulatedMetadata.paymentSource === 'string'
                ? accumulatedMetadata.paymentSource
                : sessionStorage.getItem('promo_user') === 'true'
                  ? 'promo'
                  : isPremiumOverride
                    ? 'override'
                    : 'pending';
            const saveRes = await fetch('/api/reading/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: sessionStorage.getItem('pending_reading_id') || undefined,
                accessKey: getStoredReadingAccessKey() || undefined,
                data: accumulatedReport,
                metadata: {
                  ...accumulatedMetadata,
                  // Premium generation was already server-verified for this request.
                  isPremium: true,
                  readingData: dataToUse,
                  tarotCards: phaseTarotCardsForSave,
                  language: activeLanguage,
                  paymentSource: premiumPaymentSource,
                }
              })
            });
            if (saveRes.ok) {
              const saved = await saveRes.json();
              syncReadingAccessKey(saved.accessKey);
              if (saved.id && !sessionStorage.getItem('pending_reading_id')) {
                saveToSessionAndBackup('pending_reading_id', saved.id);
              }
            }
          } catch (e) {
            console.error('[Intermediate Save] Failed:', e);
          }
        }

      }

      const finalTrustScore =
        typeof accumulatedReport.summary?.trust_score === 'number'
          ? accumulatedReport.summary.trust_score
          : null;
      const isLowConfidenceFreeResult =
        requestTier === 'free' &&
        finalTrustScore !== null &&
        finalTrustScore <= 2;

      if (isLowConfidenceFreeResult) {
        hasRetriedLowConfidenceFree.current = true;
      }

      // Save result to DB for sharing (Async) - Final save
      if (accumulatedReport.summary) {
        saveToSessionAndBackup('reading_step', 'result');
        setStep('result');
      }
      const isComplete = maxPhase === TOTAL_PREMIUM_PHASES;
      if (isComplete) {
        setIsPremium(true);
        saveToSessionAndBackup('is_premium_user', 'true');
      }
      const finalTarotCardsForSave =
        cards.length > 0
          ? cards
          : Array.isArray(accumulatedMetadata.tarotCards)
            ? accumulatedMetadata.tarotCards
            : [];
      (async () => {
        try {
          const existingId = sessionStorage.getItem('pending_reading_id');

          // Prepare Email Metadata
          const userEmail = localStorage.getItem('user_email');
          const hasBirthTime = !dataToUse.unknownTime && Boolean(dataToUse.birthTime);
          const birthInfoLanguage = activeLanguage;
          const birthInfoStr = birthInfoLanguage === 'en'
            ? hasBirthTime
              ? `Born on ${dataToUse.birthDate} at ${dataToUse.birthTime}`
              : `Born on ${dataToUse.birthDate} (time unknown)`
            : hasBirthTime
              ? `${dataToUse.birthDate} ${dataToUse.birthTime}생`
              : `${dataToUse.birthDate}생 (시간 모름)`;
          const sajuStr = accumulatedMetadata.saju?.fullSaju || '';
          const contextMap: Record<'ko' | 'en', Record<string, string>> = {
            ko: {
              career: '커리어 / 직업',
              love: '연애 / 관계',
              money: '금전 / 재물',
              health: '건강 / 웰빙',
              general: '종합 리딩',
            },
            en: {
              career: 'Career / Job',
              love: 'Love / Relationship',
              money: 'Money / Wealth',
              health: 'Health / Wellness',
              general: 'General reading',
            },
          };
          const contextStr =
            dataToUse.question ||
            contextMap[activeLanguage][dataToUse.context] ||
            (activeLanguage === 'en' ? 'Your reading' : '운세 리딩');

          const response = await fetch('/api/reading/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: existingId || undefined,
              accessKey: getStoredReadingAccessKey() || undefined,
              data: accumulatedReport,

              metadata: {
                ...accumulatedMetadata,
                isPremium: isComplete,
                readingData: dataToUse,
                tarotCards: finalTarotCardsForSave,
                language: activeLanguage,
                // Email Trigger Data
                email: userEmail,
                birthInfo: birthInfoStr,
                sajuSummary: sajuStr,
                userContext: contextStr,
                // Payment Source Tracking (To prevent double emails)
                paymentSource: sessionStorage.getItem('promo_user') === 'true' ? 'promo' : 'stripe'
              }
            })
          });


          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('Failed to save to database:', response.status, errData);
            return;
          }

          const savedPayload = await response.json().catch(() => null);
          syncReadingAccessKey(savedPayload?.accessKey);
          const savedId = savedPayload?.id;
          if (savedId) {
            saveToSessionAndBackup('pending_reading_id', savedId);
            setShareUrl(buildReadingShareUrl(savedId));
            syncResultUrl(savedId);

            // Client-side email trigger REMOVED (Moved to Server-side in /api/reading/save)
          }
        } catch (err) {
          console.error('Failed to save result:', err);
        }
      })();

      // Create session for follow-up chat (바이럴 모드: 기본 0회, 공유 시 추가)
      createSession('free_session', accumulatedReport, 0);

    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : (activeLanguage === 'en' ? "Failed to connect to the server. Please try again." : "서버 연결에 실패했습니다. 다시 시도해주세요.");
      if (
        message.includes('지금은 리딩을 끝까지 생성하지 못했습니다') ||
        message.includes('We could not complete your reading right now') ||
        message.includes('지금 오라클 리딩이 혼잡합니다') ||
        message.includes('The oracle is crowded right now') ||
        message.includes('timed out after')
      ) {
        console.warn('Reading deferred:', message);
      } else {
        console.error('Reading failed:', error);
      }
      setStreamContent(message);
    } finally {
      setIsLoading(false);
    }
  };
  startReadingRef.current = startReading;

  // --- Integration: Helper to map Korean text tags to CosmicTagEnum ---
  const mapTagToEnum = (tag: string): CosmicTag => {
    const map: Record<string, CosmicTag> = {
      // Wealth
      '#재물운': 'WEALTH_WINDFALL', '#횡재': 'WEALTH_WINDFALL', '#투자': 'WEALTH_WINDFALL',
      '#손재': 'WEALTH_LOSS', '#절약': 'WEALTH_STEADY', '#안정': 'WEALTH_STEADY',
      // Career
      '#승진': 'CAREER_PROMOTION', '#취업': 'CAREER_PROMOTION', '#명예': 'CAREER_PROMOTION',
      '#이직': 'CAREER_CHANGE', '#변동': 'CAREER_CHANGE', '#창업': 'CAREER_CHANGE',
      '#압박': 'CAREER_PRESSURE', '#책임': 'CAREER_PRESSURE', '#과로': 'CAREER_PRESSURE',
      // Love
      '#연애': 'LOVE_NEW', '#만남': 'LOVE_NEW', '#사랑': 'LOVE_DEEPENING',
      '#이별': 'LOVE_BREAKUP', '#갈등': 'LOVE_CONFLICT', '#결혼': 'LOVE_DEEPENING',
      // Life
      '#새로운_시작': 'NEW_START', '#이동': 'NEW_START', '#독립': 'NEW_START',
      '#건강': 'HEALTH_CAUTION', '#스트레스': 'MENTAL_STRESS', '#휴식': 'PEACE_STABILITY',
      '#평화': 'PEACE_STABILITY', '#귀인': 'DESTINY_MOMENT', '#기회': 'DESTINY_MOMENT',
      '#변화': 'KARMA_CYCLE', '#운명': 'KARMA_CYCLE', '#경고': 'CAUTION'
    };
    // Strip # if present for matching
    const key = tag.startsWith('#') ? tag : `#${tag}`;
    return map[key] || 'DESTINY_MOMENT'; // Fallback
  };

  // --- Integration: Construct Unified Result from Metadata ---
  const getUnifiedResult = (): UnifiedReadingResult | null => {
    if (!reportData || !metadata) return null;

    // 1. Map Tags from keyThemes (passed from API)
    const rawTags = metadata.keyThemes || [];
    const mappedTags = rawTags.map((theme) => {
      const rawTag = typeof theme === 'string' ? theme : theme.tag || '';
      return mapTagToEnum(rawTag);
    });
    const uniqueTags = Array.from(new Set(mappedTags)) as CosmicTag[];

    // 2. Build Source Results (Simulated from Metadata)
    const sources: UnifiedReadingResult['sources'] = [];
    if (metadata.sajuResult) {
      sources.push({
        source: 'SAJU',
        originalText: getSourceSummary(metadata.sajuResult, "사주 원국 분석"),
        detectedTags: uniqueTags.slice(0, 2),
        confidence: ((metadata.radarScores?.saju || 80) / 100)
      });
    }
    if (metadata.astrology) {
      sources.push({
        source: 'ASTROLOGY',
        originalText: getSourceSummary(metadata.astrology, "천체 배치 분석"),
        detectedTags: uniqueTags.slice(1, 3),
        confidence: ((metadata.radarScores?.astrology || 75) / 100)
      });
    }
    if (metadata.tarot) {
      sources.push({
        source: 'TAROT',
        originalText: getSourceSummary(metadata.tarot, "타로 카드 리딩"),
        detectedTags: uniqueTags.slice(2, 4),
        confidence: ((metadata.radarScores?.tarot || 85) / 100)
      });
    }

    return {
      summary: reportData.summary?.title || "핵심 리딩 요약",
      detailedContent: reportData.summary?.content || "사주, 별자리, 타로를 함께 읽어 정리한 현재 결론입니다.",
      primaryTags: uniqueTags.slice(0, 5), // Top 5
      totalConfidenceScore: reportData.summary?.trust_score ? reportData.summary.trust_score * 20 : 85, // Scale 1-5 to 100
      matchLevel: (reportData.summary?.trust_score || 0) >= 4.5 ? 'PERFECT' : (reportData.summary?.trust_score || 0) >= 3 ? 'PARTIAL' : 'CONFLICT',
      sources: sources
    };
  };

  const hasPreciseBirthLocation = Boolean(
    readingData?.cityName || typeof readingData?.longitude === 'number'
  );
  const unifiedResult = getUnifiedResult();
  const premiumReportData = hasPremiumReportContent(reportData) ? reportData : null;
  const premiumReportMetadata: PremiumReportViewMetadata | undefined = metadata
    ? {
        readingData: metadata.readingData
          ? ({ ...metadata.readingData } as Record<string, unknown> & { name?: string })
          : undefined,
        tarot: Array.isArray(metadata.tarot) ? metadata.tarot : undefined,
        tarotCards: Array.isArray(metadata.tarotCards) ? metadata.tarotCards : undefined,
        radarScores: metadata.radarScores,
        sajuResult: metadata.sajuResult,
        astrologyResult: metadata.astrologyResult,
        precisionMetadata: metadata.precisionMetadata,
        oracleCouncil: metadata.oracleCouncil,
        characterId: metadata.characterId,
        oraclePersona: metadata.oraclePersona,
        language: metadata.language,
        isPremium: metadata.isPremium,
      }
    : undefined;
  const shouldHideProductHeader = !hasCheckedResume || (step === 'result' && isLoading);
  const returnToInputWithDraft = (guideOverride?: { characterId?: string; selectionMode?: 'auto' | 'manual' }) => {
    if (guideOverride?.characterId) {
      setReadingData((prev) =>
        prev
          ? ({ ...prev, characterId: guideOverride.characterId, selectionMode: guideOverride.selectionMode ?? 'manual' } as typeof prev)
          : prev
      );
    }
    setIsLoading(false);
    setLoadingPhase({ phase: 0, label: '' });
    setStep('input');
    hasRetriedLowConfidenceFree.current = false;
    saveToSessionAndBackup('reading_step', 'input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const hasPaidQuery = searchParams.get('paid') === 'true';

  const handleOwnerInvite = async () => {
    const readingId = shareUrl?.split('/').pop() || sessionStorage.getItem('pending_reading_id');
    if (!readingId) {
      alert(language === 'en' ? 'Your result is still being saved. Please try again in a moment.' : '결과를 저장 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/invite/create', {
        method: 'POST',
        body: JSON.stringify({ readingId }),
      });
      const data = await response.json();

      if (!data.code) {
        return;
      }

      void trackClientGrowthEvent({
        event: 'invite_created',
        source: 'start_result_cta',
        step: 'result',
        language,
        context: readingData?.context,
        invitationMode: isInvitationMode,
        price: dynamicPrice || undefined,
        readingId: readingId || undefined,
        referralCode: data.code,
      });

      await fetch('/api/invite/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: data.code,
          action: 'invite_cta_clicked',
          channel: 'start_result_cta',
        }),
      }).catch(() => null);

      const link = `${window.location.origin}/start?invite=${data.code}`;
      await navigator.clipboard.writeText(link);

      void trackClientGrowthEvent({
        event: 'invite_copied',
        source: 'start_result_cta',
        step: 'result',
        language,
        context: readingData?.context,
        invitationMode: isInvitationMode,
        price: dynamicPrice || undefined,
        readingId: readingId || undefined,
        referralCode: data.code,
      });

      await fetch('/api/invite/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: data.code,
          action: 'invite_link_copied',
          channel: 'clipboard',
        }),
      }).catch(() => null);

      alert(language === 'en' ? 'Invitation link copied!' : '초대 링크를 복사했어요.\n친구에게 보내면 궁합 결과를 무료로 볼 수 있어요.');
    } catch (error) {
      console.error(error);
      alert(language === 'en' ? 'Failed to create invite link.' : '초대 링크 생성 중 오류가 발생했어요.');
    }
  };

  const handleInvitationUpsell = async () => {
    await ensureReadingReadyForPayment();
    openPaymentModal('invite_upsell');
  };

  const handleShareCardOpen = () => {
    void trackClientGrowthEvent({
      event: 'share_clicked',
      source: 'result_share_button',
      step: 'result',
      language,
      context: readingData?.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
      readingId: shareUrl?.split('/').pop() || sessionStorage.getItem('pending_reading_id') || undefined,
    });
    openShareModal();
  };

  const handleRetryPremiumResult = () => {
    setIsLoading(true);
    setStreamContent('');
    const nextPhase = determineNextPremiumPhase(reportData);
    if (nextPhase <= TOTAL_PREMIUM_PHASES) {
      void startReading(selectedCards, true, readingData!, reportData ?? undefined, nextPhase);
      return;
    }
    setIsLoading(false);
  };

  const handleRetryFreeResult = () => {
    if (!readingData) return;
    hasRetriedLowConfidenceFree.current = false;
    setIsLoading(true);
    setStreamContent('');
    void startReading(selectedCards, false, readingData, undefined, 1);
  };

  const handleRematchGuide = async (targetGuideId: string) => {
    void trackClientGrowthEvent({
      event: 'guide_rematch_clicked',
      source: 'guide_rematch_cta',
      step: 'result',
      language,
      context: readingData?.context,
      metadata: {
        currentGuide: readingData?.characterId,
        targetGuide: targetGuideId,
        isPremium,
      },
    });

    if (!isPremium) {
      await ensureReadingReadyForPayment();
      openPaymentModal('guide_rematch_cta');
    } else {
      returnToInputWithDraft({ characterId: targetGuideId, selectionMode: 'manual' });
    }
  };

  return (
    <ProductShell
      language={language}
      showBackButton={step === 'input' || step === 'result' || step === 'tarot'}
      showHeader={!shouldHideProductHeader}
    >
      {/* Step 0: Initial Loading/Resume Check */}
      {!hasCheckedResume && (
        <div className="flex flex-col items-center justify-center min-h-screen relative z-20">
          <div className="w-12 h-12 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/60 text-sm animate-pulse tracking-widest font-cinzel">
            {searchParams.get('paid') === 'true'
              ? (language === 'en' ? 'PAYMENT VERIFIED! PREPARING PREMIUM REPORT...' : '결제 확인 완료! 프리미엄 리포트를 준비 중입니다...')
              : (language === 'en' ? 'PREPARING YOUR READING...' : '리딩을 준비하는 중...')}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
          {/* Step 1: Input (The Ritual) */}
          {hasCheckedResume && step === 'input' && (
            <StartInputStage
              language={language}
              initialData={readingData ?? undefined}
              isLoading={isLoading}
              inviterName={inviterName}
              inviteCode={inviteCode}
              initialContext={initialContext}
              initialQuestion={initialQuestion}
              onLanguageChange={setLanguage}
              onSubmit={handleInputSubmit}
            />
          )}

          {step === 'tarot' && (
            <StartTarotStage
              language={language}
              onSelect={handleTarotComplete}
            />
          )}

          {step === 'reveal' && (
            <StartRevealStage
              language={language}
              loadingPhase={loadingPhase}
              characterId={readingData?.characterId}
              precisionMetadata={metadata?.precisionMetadata ?? reportData?.precisionMetadata}
              oracleCouncil={metadata?.oracleCouncil ?? reportData?.oracleCouncil}
              hasPreciseBirthLocation={hasPreciseBirthLocation}
              onReveal={handleRevealComplete}
            />
          )}

          {/* Step 4: Result (Deep Dive) */}
          {step === 'result' && (
            <StartResultStage
              language={language}
              isLoading={isLoading}
              loadingPhase={loadingPhase}
              metadata={metadata}
              reportData={reportData}
              readingData={readingData}
              hasPreciseBirthLocation={hasPreciseBirthLocation}
              unifiedResult={unifiedResult}
              premiumReportData={premiumReportData}
              premiumReportMetadata={premiumReportMetadata}
              shareUrl={shareUrl}
              isPremium={isPremium}
              hasPaidQuery={hasPaidQuery}
              isInvitationMode={isInvitationMode}
              dynamicPrice={dynamicPrice}
              streamContent={streamContent}
              onInviteOwner={handleOwnerInvite}
              onInviteUpsell={handleInvitationUpsell}
              onShareCard={handleShareCardOpen}
              onUnlock={handleUpgrade}
              onRetryPremium={handleRetryPremiumResult}
              onRetryFree={handleRetryFreeResult}
              onReturnToInput={returnToInputWithDraft}
              onRematchGuide={handleRematchGuide}
            />
          )}
        </AnimatePresence>

      {/* Ambient Footer */}
      <Footer language={language} />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        readingData={readingData ? { ...readingData, tarotCards: selectedCards, language } : undefined}
        currentReport={reportData}
        metadata={metadata}
        isDecisionAccepted={isDecisionAccepted}
        price={dynamicPrice}
        trackingSource={paymentTrackingSource}
        autoReferralCode={autoReferralCode}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={dismissReviewModal}
        readingId={shareUrl?.split('/').pop()}
      />

      {/* Share Card Modal */}
      {reportData && (
        <ShareCardModal
          isOpen={isShareModalOpen}
          onClose={closeShareModal}
          title={reportData.summary?.title || "내 리딩 결과"}
          trustScore={reportData.summary?.trust_score ? Math.round(reportData.summary.trust_score * 20) : 85}
          matchLevel={
            (reportData.summary?.trust_score || 0) >= 4.5 ? 'PERFECT' :
              (reportData.summary?.trust_score || 0) >= 3 ? 'PARTIAL' : 'CONFLICT'
          }
          keywords={reportData.summary?.keywords?.slice(0, 4) || ['타이밍', '변화', '선택']}
          userName={readingData?.name}
        />
      )}

    </ProductShell>

  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-4 max-w-2xl mx-auto pt-20 px-6 min-h-screen">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </div>
    }>
      <CosmicPathContent />
    </Suspense>
  );
}
