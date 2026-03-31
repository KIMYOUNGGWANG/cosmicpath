'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { ReadingInput, ReadingData } from '@/components/reading/reading-input';
import { ReadingSession, createSession } from '@/lib/session/reading-session';
import { StickyCTA } from '@/components/common/sticky-cta';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';

import { Footer } from '@/components/landing/Footer';
import { GlobalHeader } from '@/components/common/GlobalHeader';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UnifiedReadingDisplay } from '@/components/cosmic/UnifiedReadingDisplay'; // Integration
import { Skeleton } from '@/components/ui/skeleton';

// 🚀 Dynamic Imports - 초기 번들 크기 최적화
// 이 컴포넌트들은 사용자가 해당 단계에 도달할 때만 로드됩니다
const TarotPicker = dynamic(() => import('@/components/reading/tarot-picker').then(mod => mod.TarotPicker), {
  loading: () => <div className="flex justify-center py-20"><Skeleton className="h-64 w-full max-w-2xl" /></div>
});
const PremiumReport = dynamic(() => import('@/components/reading/premium-report').then(mod => mod.PremiumReport), {
  loading: () => <div className="flex justify-center py-20"><Skeleton className="h-96 w-full" /></div>
});
const DecisionGuard = dynamic(() => import('@/components/reading/decision-guard').then(mod => mod.DecisionGuard));
const PaymentModal = dynamic(() => import('@/components/payment/PaymentModal').then(mod => mod.PaymentModal));
const ReviewModal = dynamic(() => import('@/components/review/ReviewModal').then(mod => mod.ReviewModal));
const ChatInterface = dynamic(() => import('@/components/oracle-chat/ChatInterface').then(mod => mod.ChatInterface), {
  loading: () => <Skeleton className="h-48 w-full" />
});
const RevealContainer = dynamic(() => import('@/components/reading/RevealContainer').then(mod => mod.RevealContainer), {
  loading: () => <div className="animate-pulse w-full h-96 bg-white/5 rounded-2xl" />
});
const ShareCardModal = dynamic(() => import('@/components/share/ShareCardModal').then(mod => mod.ShareCardModal));

function CosmicPathContent() {
  const [step, setStep] = useState<'input' | 'mirror' | 'tarot' | 'reveal' | 'result'>('input');
  const [readingData, setReadingData] = useState<ReadingData | null>(null);
  const [selectedCards, setSelectedCards] = useState<{ name: string; isReversed: boolean }[]>([]);

  // 결과 상태
  const [reportData, setReportData] = useState<any>(null); // TODO: 구체적인 타입 정의 필요 (CosmicReport 또는 PremiumReportData)
  const [streamContent, setStreamContent] = useState(''); // Fallback용
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<{ phase: number; label: string }>({ phase: 0, label: '' });
  const [metadata, setMetadata] = useState<{
    tarot?: { name: string; isReversed: boolean }[];
    radarScores?: { saju: number; astrology: number; tarot: number };
  } | undefined>(undefined);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  // Convergence Animation State
  const [isConverging, setIsConverging] = useState(false);

  // Decision Guard State
  const [isDecisionAccepted, setIsDecisionAccepted] = useState(false);

  // Follow-up Chat Session State
  const [session, setSession] = useState<ReadingSession | null>(null);

  // Share URL State
  const [shareUrl, setShareUrl] = useState<string | undefined>(undefined);

  // Payment State
  const [isPremium, setIsPremium] = useState(false); // Paywall Enabled
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTrackingSource, setPaymentTrackingSource] = useState('start_result_unlock');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // Share Card Modal

  const searchParams = useSearchParams();
  const autoReferralCode =
    searchParams.get('referralCode') ||
    searchParams.get('ref') ||
    searchParams.get('promo') ||
    undefined;
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



  // Fetch dynamic price on mount
  // --- Persistence Helper ---
  const saveToSessionAndBackup = (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
      localStorage.setItem(key, value);
      localStorage.setItem('backup_timestamp', Date.now().toString());
    } catch (e) {
      console.error('Storage quota exceeded or error:', e);
    }
  };

  const clearSessionAndBackup = () => {
    const keys = [
      'pending_reading_data', 'pending_report_data', 'pending_metadata',
      'pending_reading_id', 'payment_completed', 'decision_accepted',
      'is_session_active'
    ];
    keys.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    localStorage.removeItem('backup_timestamp');
  };

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/payment/price');
        const data = await response.json();
        if (data.formattedPrice) {
          setDynamicPrice(data.formattedPrice);
        }
      } catch (error) {
        console.error('Failed to fetch dynamic price:', error);
      }
    };
    fetchPrice();

    // P3-3: Language Persistence
    const savedLang = localStorage.getItem('user_language');
    if (savedLang === 'ko' || savedLang === 'en') {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    if (hasTrackedLandingView.current) return;

    hasTrackedLandingView.current = true;
    void trackClientGrowthEvent({
      event: 'landing_view',
      source: searchParams.get('invite') ? 'start_page_invite' : 'start_page',
      step: step,
      language,
      invitationMode: Boolean(searchParams.get('invite')),
      referralCode: autoReferralCode,
      price: dynamicPrice || undefined,
    });
  }, [autoReferralCode, dynamicPrice, language, searchParams, step]);

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
      event: 'free_result_shown',
      source: 'start_result',
      step,
      language,
      context: readingData?.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
      readingId: sessionStorage.getItem('pending_reading_id') || undefined,
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

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [hasDismissedReview, setHasDismissedReview] = useState(false); // 🚀 Prevent reopening

  // Review Modal Trigger - Scroll-based
  const hasReportSummary = !!reportData?.summary;
  useEffect(() => {
    const isPaidSession = searchParams.get('paid') === 'true' || sessionStorage.getItem('payment_completed') === 'true';
    const hasReviewed = localStorage.getItem('review_submitted') === 'true';
    const isPromoUser = sessionStorage.getItem('promo_user') === 'true';
    const isPremiumStatus = sessionStorage.getItem('is_premium_user') === 'true';

    if (!hasReportSummary) return;

    const trustScore = reportData?.summary?.trust_score ?? 3;
    const isGuardPassed = trustScore > 2 || isDecisionAccepted;

    const shouldShow =
      (isPaidSession || isPromoUser || isPremiumStatus) &&
      !hasReviewed &&
      !hasDismissedReview && // 🚀 Check dismissal
      step === 'result' &&
      !isLoading &&
      isGuardPassed;

    if (shouldShow) {
      const handleScroll = () => {
        const { scrollY, innerHeight } = window;
        const { scrollHeight } = document.documentElement;

        // Prevent triggering on short pages (e.g. initial loading phase)
        if (scrollHeight < innerHeight * 1.5) return;

        const scrollPercent = (scrollY + innerHeight) / scrollHeight;

        if (scrollPercent >= 0.7) {
          setIsReviewOpen(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };

      // Removed immediate handleScroll() call to prevent instant popup on mount
      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [step, isLoading, isDecisionAccepted, hasReportSummary, hasDismissedReview]);

  // Resume Reading after Payment
  const isProcessingResume = useRef(false);

  useEffect(() => {
    const checkResume = async () => {
      // Prevent double-execution (React Strict Mode or rapid updates)
      if (isProcessingResume.current) {
        console.log('[Resume] Already processing, skipping...');
        return;
      }
      // Lock immediately to prevent any duplicate calls
      isProcessingResume.current = true;

      const paid = searchParams.get('paid');
      const canceled = searchParams.get('canceled');
      const readingIdFromUrl = searchParams.get('reading_id');

      console.log('[Resume] Starting checkResume...', { paid, canceled, readingIdFromUrl });

      // Small delay ONLY if we don't have explicit URL flags (relying on sessionStorage only)
      if (!paid && !canceled && !readingIdFromUrl) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const reset = searchParams.get('reset') === 'true';
      const isSessionActive = sessionStorage.getItem('is_session_active') === 'true';

      if (reset) {
        console.log('[Resume] Reset flag detected. Clearing session and backup.');
        sessionStorage.clear();
        // Also clear localStorage backup to prevent restoration
        localStorage.removeItem('backup_reading_data');
        localStorage.removeItem('backup_report_data');
        localStorage.removeItem('backup_metadata');
        localStorage.removeItem('backup_reading_id');
        localStorage.removeItem('backup_timestamp');
        setHasCheckedResume(true);
        return;
      }

      const readingId = readingIdFromUrl || sessionStorage.getItem('pending_reading_id');
      const hasPendingReport = sessionStorage.getItem('pending_report_data') && sessionStorage.getItem('pending_report_data') !== 'null';

      // Only enter restore mode if:
      // 1. There's a readingId in URL, OR
      // 2. Payment just completed, OR
      // 3. Payment was canceled, OR
      // 4. Session is active AND there's actual pending report (not just form input)
      if (readingId || paid === 'true' || canceled === 'true' || (isSessionActive && hasPendingReport)) {
        console.log('[Resume] Entering restore mode...', { readingId, paid, canceled, isSessionActive, hasPendingReport });
        if (readingId && !sessionStorage.getItem('pending_reading_id')) {
          sessionStorage.setItem('pending_reading_id', readingId);
        }

        // 2. Check SessionStorage (Active session)
        let pendingData = sessionStorage.getItem('pending_reading_data');
        let pendingReportJson = sessionStorage.getItem('pending_report_data');
        let pendingMetadataJson = sessionStorage.getItem('pending_metadata');
        // isSessionActive already declared at line 175
        let pendingReadingId = sessionStorage.getItem('pending_reading_id');

        // 3. Fallback to LocalStorage (Backup for accidental close/refresh)
        // Only use if sessionStorage is empty
        if (!pendingData) {
          const localTimestamp = localStorage.getItem('backup_timestamp');
          const now = Date.now();
          const ONE_DAY = 24 * 60 * 60 * 1000;

          if (localTimestamp && (now - parseInt(localTimestamp) < ONE_DAY)) {
            console.log('[Resume] Recovering session from LocalStorage backup...');
            pendingData = localStorage.getItem('pending_reading_data');
            pendingReportJson = localStorage.getItem('pending_report_data');
            pendingMetadataJson = localStorage.getItem('pending_metadata');
            // isSessionActive is already determined at line 175, no need to override

            if (!pendingReadingId) {
              const backupId = localStorage.getItem('pending_reading_id');
              if (backupId) {
                pendingReadingId = backupId;
                sessionStorage.setItem('pending_reading_id', backupId);
              }
            }

            // Restore to sessionStorage to keep them in sync
            if (pendingData) sessionStorage.setItem('pending_reading_data', pendingData);
            if (pendingReportJson) sessionStorage.setItem('pending_report_data', pendingReportJson);
            if (pendingMetadataJson) sessionStorage.setItem('pending_metadata', pendingMetadataJson);
            if (isSessionActive) sessionStorage.setItem('is_session_active', 'true');
          } else {
            // Clear expired backup
            clearSessionAndBackup();
          }
        }

        if (readingId && (!pendingData || pendingData === 'null')) {
          try {
            console.log('[Resume] Fetching reading from DB:', readingId);
            const response = await fetch(`/api/reading/save?id=${readingId}`);
            if (response.ok) {
              const saved = await response.json();
              if (saved.success) {
                const rData = saved.metadata?.readingData || null;
                const rReport = saved.data || null;
                const rMeta = saved.metadata || null;

                pendingData = JSON.stringify(rData);
                pendingReportJson = JSON.stringify(rReport);
                pendingMetadataJson = JSON.stringify(rMeta);

                // Persist back to sessionStorage for future refreshes
                if (rData) sessionStorage.setItem('pending_reading_data', pendingData);
                if (rReport) sessionStorage.setItem('pending_report_data', pendingReportJson);
                if (rMeta) sessionStorage.setItem('pending_metadata', pendingMetadataJson);
                sessionStorage.setItem('backup_timestamp', Date.now().toString()); // Update timestamp
              }
            }
          } catch (err) {
            console.error('[Resume] DB fetch failed:', err);
          }
        }

        if (pendingData && pendingData !== 'null') {
          try {
            console.log('[Resume] Restoring session state...', { paid, canceled, isSessionActive });
            const data = JSON.parse(pendingData);
            setReadingData(data);
            setLanguage(data.language as 'ko' | 'en');

            if (data.tarotCards) {
              setSelectedCards(data.tarotCards);
            }

            if (pendingReportJson && pendingReportJson !== 'null') {
              setReportData(JSON.parse(pendingReportJson));
            }
            if (pendingMetadataJson && pendingMetadataJson !== 'null') {
              const meta = JSON.parse(pendingMetadataJson);
              setMetadata(meta);
              if (meta.language) setLanguage(meta.language as 'ko' | 'en');
              if (meta.isPremium) setIsPremium(true);
            }
            if (sessionStorage.getItem('decision_accepted') === 'true') {
              setIsDecisionAccepted(true);
            }
            if (sessionStorage.getItem('is_premium_user') === 'true') {
              setIsPremium(true);
            }

            // Persistence: Always go to result if we have data
            setStep('result');

            // If we have a saved ID, sync the URL
            const pendingId = sessionStorage.getItem('pending_reading_id');
            if (pendingId) {
              const origin = window.location.origin;
              const appUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;
              setShareUrl(`${appUrl}/share/${pendingId}`);

              const currentUrl = new URL(window.location.href);
              currentUrl.searchParams.set('reading_id', pendingId);
              // Note: invite param should already be there from initial load if present
              window.history.replaceState({ readingId: pendingId }, '', currentUrl.toString());
            }

            // Success Flow: If explicitly paid OR previously marked as paid, trigger premium logic
            const isPaymentCompleted = sessionStorage.getItem('payment_completed') === 'true';
            if (paid === 'true' || isPaymentCompleted) {
              setIsPremium(true);
              if (paid === 'true') {
                saveToSessionAndBackup('payment_completed', 'true'); // Ensure it's saved
              }

              const report = pendingReportJson ? JSON.parse(pendingReportJson) : null;

              // Only resume if not currently loading (to avoid double trigger on refresh)
              if (!isLoading) {
                const nextPhase = determineNextPremiumPhase(report);
                if (nextPhase <= TOTAL_PREMIUM_PHASES) {
                  console.log(`[Resume] Resuming analysis from phase ${nextPhase}`);
                  // Ensure we pass the data properly
                  startReading(data.tarotCards || [], true, data, report || undefined, nextPhase);
                } else {
                  console.log('[Resume] Analysis already complete. Skipping resumption.');
                }
              }
            }

            // Cleanup query params ONLY, keeping sessionStorage for refresh-resilience
            if (paid === 'true' || canceled === 'true') {
              window.history.replaceState({}, '', window.location.pathname);
            }
          } catch (e) {
            console.error("[Resume] Failure during restoration:", e);
          }
        }
      }

      setHasCheckedResume(true);
    };

    checkResume();
  }, []);


  // Step 1: Birthdate Submission -> Go to Tarot
  const handleInputSubmit = (data: ReadingData) => {
    clearSessionAndBackup(); // Clear previous session data
    saveToSessionAndBackup('is_session_active', 'false'); // Explicitly false until results are ready

    hasTrackedFreeResult.current = false;
    hasTrackedReportComplete.current = false;

    setReadingData(data);
    setReadingData(data);
    setLanguage(data.language);
    localStorage.setItem('user_language', data.language);
    void trackClientGrowthEvent({
      event: 'analysis_start',
      source: 'reading_input',
      step: 'input',
      language: data.language,
      context: data.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
    });
    setStep('tarot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Tarot Completion -> Start Reveal Ritual
  const handleTarotComplete = async (cards: { name: string; isReversed: boolean }[]) => {
    setSelectedCards(cards);
    saveToSessionAndBackup('is_session_active', 'true');
    if (readingData) {
      saveToSessionAndBackup('pending_reading_data', JSON.stringify({ ...readingData, tarotCards: cards }));
    }

    // Go to Reveal Step instead of direct Result
    setStep('reveal');
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

    // Start Data Fetching in Background (So it's ready when they unseal)
    // We don't await here, we let it run. The Result step handles 'isLoading' check.
    startReading(cards);
  };

  const handleRevealComplete = () => {
    // Transition to full result dashboard after the visual payoff
    setTimeout(() => {
      setStep('result');
    }, 1500); // Let them admire the revealed card for a moment
  };

  const handleUpgrade = async () => {
    // Open payment modal instead of direct unlock, unless already premium
    if (isPremium) return;
    setPaymentTrackingSource('start_result_unlock');
    setIsPaymentModalOpen(true);
  };

  const TOTAL_PREMIUM_PHASES = 7;

  const determineNextPremiumPhase = (report: any) => {
    if (!report?.summary || !report?.traits || !report?.core_analysis) return 1;
    if (!report?.astro_deep || !report?.tarot_details || !report?.numerology) return 2;
    if (!report?.saju_sections) return 3;
    if (!report?.fortune_flow) return 4;
    if (!report?.life_areas) return 5;
    if (!report?.special_analysis || !report?.action_plan || !report?.date_selection) return 6;
    if (!report?.past_life || !report?.glossary || !report?.final_verdict) return 7;
    return TOTAL_PREMIUM_PHASES + 1;
  };


  const startReading = async (
    cards: any[],
    isPremiumOverride = false,
    readingDataOverride?: ReadingData,
    initialReport?: any,
    startPhaseOverride?: number
  ) => {
    const dataToUse = readingDataOverride || readingData;
    if (!dataToUse) return;

    try {
      setIsLoading(true);

      // If resuming, use existing report, otherwise start empty
      let accumulatedReport: any = initialReport || {};
      let accumulatedMetadata: any = metadata || {};
      const totalPhases = TOTAL_PREMIUM_PHASES;

      const labelsKo = [
        "",
        "핵심 요약 분석 중... (1/7)",
        "점성술·타로 심층 분석 중... (2/7)",
        "사주 기본 분석 중... (3/7)",
        "운의 흐름 분석 중... (4/7)",
        "영역별 상세 분석 중... (5/7)",
        "특수 분석 & 액션 플랜 생성 중... (6/7)",
        "최종 결론 도출 중... (7/7)"
      ];
      // ... (labelsEn omitted for brevity, assuming existing code structure)
      const labelsEn = [
        "",
        "Analyzing core summary... (1/7)",
        "Deep Astro & Tarot Dive... (2/7)",
        "Analyzing Saju fundamentals... (3/7)",
        "Analyzing fortune flow... (4/7)",
        "Detailed area analysis... (5/7)",
        "Generating action plan... (6/7)",
        "Final verdict construction... (7/7)"
      ];
      const labels = language === 'en' ? labelsEn : labelsKo;

      const startPhase = startPhaseOverride || 1;
      // If we are not premium, only show Phase 1 (Summary + Traits + Core) - 비용 절감
      const maxPhase = (isPremium || isPremiumOverride) ? totalPhases : 1;

      // If we are just starting fresh free reading, phase 1 only.
      // If we upgraded, resume from the first missing premium phase.

      for (let phase = startPhase; phase <= maxPhase; phase++) {
        setLoadingPhase({ phase, label: labels[phase] });

        const response = await fetch('/api/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...dataToUse,
            tarotCards: cards,
            tier: 'premium',
            phase, // Execute specific phase
            previousReport: accumulatedReport, // Pass context
            isPaid: isPremium || isPremiumOverride, // 🔒 결제 여부 전달
            readingId: sessionStorage.getItem('pending_reading_id') || undefined, // 🔑 검증용 ID 전달
          }),
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null);
          const errorMessage =
            errorPayload?.fallbackMessage ||
            errorPayload?.error?.message ||
            errorPayload?.error ||
            `Phase ${phase} failed: ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.fallbackMessage || result.error || `Phase ${phase} validation failed`);
        }

        console.log(`Phase ${phase} complete:`, result.report);

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
        }

        // [New] Intermediate Save for Premium Users after Phase 1
        // This ensures a ReadingResult record exists in DB for payment verification in Phase 2+
        if ((isPremium || isPremiumOverride) && phase === 1) {
          try {
            const saveRes = await fetch('/api/reading/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: sessionStorage.getItem('pending_reading_id') || undefined,
                data: accumulatedReport,
                metadata: {
                  ...accumulatedMetadata,
                  isPremium: false, // Will be set to true by webhook/sync
                  paymentSource: isPremiumOverride ? 'override' : 'pending'
                }
              })
            });
            if (saveRes.ok) {
              const saved = await saveRes.json();
              if (saved.id && !sessionStorage.getItem('pending_reading_id')) {
                sessionStorage.setItem('pending_reading_id', saved.id);
              }
            }
          } catch (e) {
            console.error('[Intermediate Save] Failed:', e);
          }
        }

        // 🚀 CRITICAL: Unblock UI after Phase 1 (Summary)
        if ((!isPremium && !isPremiumOverride) && (phase === 1 || phase === startPhase)) {
          setIsLoading(false);
        }
      }

      // Save result to DB for sharing (Async) - Final save
      const isComplete = maxPhase === 7;
      if (isComplete) {
        setIsPremium(true);
        saveToSessionAndBackup('is_premium_user', 'true');
      }
      (async () => {
        try {
          const existingId = sessionStorage.getItem('pending_reading_id');

          // Prepare Email Metadata
          const userEmail = localStorage.getItem('user_email');
          const birthInfoStr = `${dataToUse.birthDate} ${dataToUse.birthTime}생`;
          const sajuStr = (accumulatedMetadata as any)?.saju?.fullSaju || '';
          const contextMap: Record<string, string> = {
            career: '커리어/직업',
            love: '연애/결혼',
            money: '금전/재물',
            health: '건강/웰빙',
            general: '종합 운세'
          };
          const contextStr = dataToUse.question || contextMap[dataToUse.context] || '운세 리딩';

          const response = await fetch('/api/reading/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: existingId || undefined,
              data: accumulatedReport,

              metadata: {
                ...accumulatedMetadata,
                isPremium: isComplete,
                readingData: dataToUse,
                tarotCards: cards,
                language,
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

          const { id } = await response.json();
          if (id) {
            saveToSessionAndBackup('pending_reading_id', id);
            const origin = window.location.origin;
            const appUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;
            const shareUrlPath = `/share/${id}`;
            setShareUrl(`${appUrl}${shareUrlPath}`);

            // 브라우저 주소창 동기화 (새로고침 시 결과 유지 - /share로 이동하지 않음)
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('reading_id', id);
            // inviteCode가 있다면 유지하여 리프레시 시에도 초대 모드 유지
            if (inviteCode) {
              currentUrl.searchParams.set('invite', inviteCode);
            }
            if (autoReferralCode) {
              currentUrl.searchParams.set('referralCode', autoReferralCode);
            }
            window.history.replaceState({ readingId: id }, '', currentUrl.toString());

            // Client-side email trigger REMOVED (Moved to Server-side in /api/reading/save)
          }
        } catch (err) {
          console.error('Failed to save result:', err);
        }
      })();

      // Create session for follow-up chat (바이럴 모드: 기본 0회, 공유 시 추가)
      const newSession = createSession('free_session', accumulatedReport, 0);
      setSession(newSession);

    } catch (error) {
      console.error('Reading failed:', error);
      setStreamContent(language === 'en' ? "Failed to connect to the server. Please try again." : "서버 연결에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Integration: Helper to map Korean text tags to CosmicTagEnum ---
  const mapTagToEnum = (tag: string): any => { // Returns CosmicTagEnum or undefined
    const map: Record<string, string> = {
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
  const getUnifiedResult = () => {
    if (!reportData || !metadata) return null;

    // 1. Map Tags from keyThemes (passed from API)
    const rawTags = (metadata as any).keyThemes || [];
    const mappedTags = rawTags.map((t: any) => mapTagToEnum(t.tag || t));
    const uniqueTags: any[] = Array.from(new Set(mappedTags)); // Deduplicate

    // 2. Build Source Results (Simulated from Metadata)
    const sources = [];
    if ((metadata as any).sajuResult) {
      sources.push({
        source: 'SAJU',
        originalText: (metadata as any).sajuResult?.summary || "사주 원국 분석",
        detectedTags: uniqueTags.slice(0, 2),
        confidence: ((metadata.radarScores?.saju || 80) / 100)
      });
    }
    if ((metadata as any).astrology) {
      sources.push({
        source: 'ASTROLOGY',
        originalText: (metadata as any).astrology?.summary || "천체 배치 분석",
        detectedTags: uniqueTags.slice(1, 3),
        confidence: ((metadata.radarScores?.astrology || 75) / 100)
      });
    }
    if ((metadata as any).tarot) {
      sources.push({
        source: 'TAROT',
        originalText: (metadata as any).tarot?.summary || "타로 카드 리딩",
        detectedTags: uniqueTags.slice(2, 4),
        confidence: ((metadata.radarScores?.tarot || 85) / 100)
      });
    }

    return {
      summary: reportData.summary?.title || "운명의 통합 분석",
      detailedContent: reportData.summary?.content || "사주와 점성술, 타로가 공통적으로 가리키는 당신의 운명입니다.",
      primaryTags: uniqueTags.slice(0, 5), // Top 5
      totalConfidenceScore: reportData.summary?.trust_score ? reportData.summary.trust_score * 20 : 85, // Scale 1-5 to 100
      matchLevel: (reportData.summary?.trust_score || 0) >= 4.5 ? 'PERFECT' : (reportData.summary?.trust_score || 0) >= 3 ? 'PARTIAL' : 'CONFLICT',
      sources: sources
    };
  };

  return (
    <main className="min-h-screen relative overflow-hidden text-foreground selection:bg-accent-gold selection:text-bg-void font-outfit">
      {/* Conversion-Focused Background */}
      <div className="aurora-bg fixed inset-0 z-0" />
      <div className="noise-overlay" />

      {/* Step 0: Initial Loading/Resume Check */}
      {!hasCheckedResume && (
        <div className="flex flex-col items-center justify-center min-h-screen relative z-20">
          <div className="w-12 h-12 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/60 text-sm animate-pulse tracking-widest font-cinzel">
            {searchParams.get('paid') === 'true'
              ? (language === 'en' ? 'PAYMENT VERIFIED! PREPARING PREMIUM REPORT...' : '결제 확인 완료! 프리미엄 리포트를 준비 중입니다...')
              : 'CALIBRATING...'}
          </p>
        </div>
      )}

      <GlobalHeader language={language} showBackButton={step === 'input' || step === 'result'} />

      {/* Main Container */}
      <div className="container-cosmic relative z-10 safe-area-top">
        <AnimatePresence mode="wait">
          {/* Step 1: Input (The Ritual) */}
          {hasCheckedResume && step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-4xl mx-auto py-20 px-6"
            >
              <div className="text-center mb-20">
                <h1 className="font-cinzel text-4xl md:text-5xl text-starlight mb-4">
                  BEGIN SEQUENCE
                </h1>
                <p className="text-dim text-sm tracking-[0.2em] uppercase">
                  Enter your coordinates
                </p>
              </div>

              <ReadingInput
                onSubmit={(data) => {
                  handleInputSubmit({
                    ...data,
                    birthTime: data.birthTime || '12:00',
                    calendarType: data.calendarType || 'solar',
                    unknownTime: data.unknownTime || false
                  });
                }}
                isLoading={isLoading}
                inviterName={inviterName}
                inviteCode={inviteCode}
              />
            </motion.div>
          )}


          {/* Step 3: Tarot Selection */}
          {step === 'tarot' && (
            <motion.div
              key="tarot"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full max-w-5xl mx-auto py-20"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 font-cinzel text-glow-purple tracking-wide">
                  {language === 'en' ? 'Select Your Sacred Major Arcana' : '운명의 대아르카나를 선택하세요'}
                </h2>
                <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-tarot-purple/50 to-transparent mx-auto mb-6" />
                <p className="text-white/70 text-lg font-light tracking-wide italic">
                  {language === 'en'
                    ? "Close your eyes, breathe, and let your spirit guide your hand."
                    : "숨을 가다듬고, 당신의 영혼이 손을 이끌게 하세요."
                  }
                </p>
              </div>

              <div className="relative px-4">
                <TarotPicker
                  onSelect={handleTarotComplete}
                  maxCards={3}
                  language={language}
                />
              </div>
            </motion.div>
          )}

          {/* New Step: Visual Reveal (The Seal) */}
          {step === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full min-h-[60vh] flex flex-col items-center justify-center py-20"
            >
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-cinzel text-starlight mb-4">
                  {language === 'en' ? 'The Stars Are Aligned' : '별들의 배치가 끝났습니다'}
                </h2>
                <p className="text-acc-gold/80 text-sm tracking-widest uppercase">
                  {language === 'en' ? 'Your destiny is sealed within' : '당신의 운명이 봉인되어 있습니다'}
                </p>
              </div>

              <RevealContainer onReveal={handleRevealComplete}>
                {/* Back of the card (Visual Result Summary) */}
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0A0A0C]">
                  <div className="w-16 h-16 rounded-full bg-acc-gold/10 flex items-center justify-center mb-6">
                    <span className="text-3xl">✨</span>
                  </div>
                  <h3 className="font-cinzel text-xl text-white mb-2">
                    {language === 'en' ? 'Destiny Unsealed' : '봉인 해제 완료'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-8 max-w-[200px]">
                    {language === 'en' ? 'Your cosmic blueprint is ready.' : '당신의 우주 설계도가 준비되었습니다.'}
                  </p>
                  <div className="text-xs text-acc-gold animate-pulse tracking-widest uppercase">
                    {language === 'en' ? 'Entering Dashboard...' : '대시보드로 진입 중...'}
                  </div>
                </div>
              </RevealContainer>
            </motion.div>
          )}

          {/* Step 4: Result (Deep Dive) */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: isConverging ? 1.5 : 0 }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-400">
                  <div className="relative w-24 h-24 mb-10">
                    <div className="absolute inset-0 border-t-2 border-accent-gold rounded-full animate-[spin_1.5s_linear_infinite]" />
                    <div className="absolute inset-2 border-r-2 border-saju-blue rounded-full animate-[spin_2s_linear_infinite]" />
                    <div className="absolute inset-4 border-l-2 border-tarot-purple rounded-full animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-0 bg-white/5 blur-xl rounded-full animate-pulse" />
                  </div>

                  <div className="text-center space-y-4 max-w-sm px-6">
                    <p className="text-2xl font-cinzel text-white tracking-[0.15em] animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                      {loadingPhase.label || (language === 'en' ? "weaving tapestry..." : "운명의 실타래를 엮는 중...")}
                    </p>

                    {loadingPhase.phase > 0 && (
                      <div className="space-y-2">
                        <div className="w-64 h-[1px] bg-white/10 rounded-full overflow-hidden mx-auto">
                          <motion.div
                            className="h-full bg-gradient-to-r from-saju-blue via-accent-gold to-tarot-purple"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(loadingPhase.phase / 5) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                          {language === 'en' ? `Phase ${loadingPhase.phase} of 5` : `심층 분석 ${loadingPhase.phase}단계`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : reportData && reportData.summary ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 py-12 pt-32">
                  <DecisionGuard
                    isOpen={reportData.summary.trust_score <= 2 && !isDecisionAccepted}
                    onAccept={() => {
                      setIsDecisionAccepted(true);
                      sessionStorage.setItem('decision_accepted', 'true');
                    }}
                    language={language}
                  />
                  {(reportData.summary.trust_score > 2 || isDecisionAccepted) && (
                    <ErrorBoundary>
                      {/* Integrated Unified Display (Cross-Validation UI) */}
                      <div className="mb-8 px-4 md:px-0">
                        <UnifiedReadingDisplay result={getUnifiedResult() as any} />

                        {/* Viral Loop Actions */}
                        <div className="flex flex-col items-center gap-4 mt-8">
                          {/* CASE A: Premium Owner -> Invite Friend */}
                          {(isPremium || searchParams.get('paid') === 'true') && !isInvitationMode && (
                            <button
                              onClick={async () => {
                                // Ensure we have an ID to share
                                const rId = shareUrl?.split('/').pop() || sessionStorage.getItem('pending_reading_id');
                                if (!rId) {
                                  alert('결과를 저장 중입니다. 잠시 후 다시 시도해주세요.');
                                  return;
                                }

                                try {
                                  const res = await fetch('/api/invite/create', {
                                    method: 'POST',
                                    body: JSON.stringify({ readingId: rId })
                                  });
                                  const data = await res.json();
                                  if (data.code) {
                                    void trackClientGrowthEvent({
                                      event: 'invite_created',
                                      source: 'start_result_cta',
                                      step: 'result',
                                      language,
                                      context: readingData?.context,
                                      invitationMode: isInvitationMode,
                                      price: dynamicPrice || undefined,
                                      readingId: rId || undefined,
                                      referralCode: data.code,
                                    });

                                    // Referral tracking: CTA and copy actions
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
                                    navigator.clipboard.writeText(link);

                                    void trackClientGrowthEvent({
                                      event: 'invite_copied',
                                      source: 'start_result_cta',
                                      step: 'result',
                                      language,
                                      context: readingData?.context,
                                      invitationMode: isInvitationMode,
                                      price: dynamicPrice || undefined,
                                      readingId: rId || undefined,
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

                                    alert(language === 'en' ? 'Invitation link copied!' : '골든 티켓(초대 링크)이 복사되었습니다!\n친구에게 공유하여 무료 궁합을 확인해보세요.');
                                  }
                                } catch (e) {
                                  console.error(e);
                                  alert('Error creating invite link');
                                }
                              }}
                              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-acc-gold to-[#F59E0B] px-8 py-4 font-bold text-bg-void shadow-[0_14px_32px_rgba(212,175,55,0.14)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(212,175,55,0.28)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70"
                            >
                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                              <div className="relative flex items-center gap-2">
                                <span className="text-xl">🎟️</span>
                                <span className="font-cinzel tracking-wider">
                                  {language === 'en' ? 'SEND GOLDEN TICKET' : '친구 초대하고 궁합 무료로 보기'}
                                </span>
                              </div>
                            </button>
                          )}

                          {/* CASE B: Invited Guest -> Upsell */}
                          {isInvitationMode && (
                            <div className="w-full max-w-md bg-white/5 border border-acc-gold/30 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                              <div className="text-acc-gold text-xs font-bold tracking-widest uppercase mb-2">
                                🎁 Special Offer
                              </div>
                              <h3 className="text-white text-lg font-cinzel mb-4 leading-relaxed">
                                {language === 'en'
                                  ? `Curious about your 2026 Fortune?`
                                  : `${inviterName || '친구'}님과의 궁합은 어떠셨나요?\n나의 2026년 운세도 확인해보세요.`}
                              </h3>
                              <button
                            onClick={() => {
                              setPaymentTrackingSource('invite_upsell');
                              setIsPaymentModalOpen(true);
                            }}
                            className="w-full rounded-lg border border-white/20 bg-white/10 py-3 font-bold text-starlight transition-[transform,background-color,border-color,color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-acc-gold hover:text-bg-void hover:shadow-[0_16px_32px_rgba(212,175,55,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70"
                          >
                                {language === 'en' ? 'Unlock My Fortune (30% OFF)' : '내 신년운세 확인하기 (30% 할인)'}
                              </button>
                            </div>
                          )}

                          {/* Secondary share-card action */}
                          <button
                            onClick={() => {
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
                              setIsShareModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-6 py-3 text-dim transition-[transform,color] duration-300 hover:-translate-y-0.5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm border-b border-transparent hover:border-white/50 transition-colors">
                              {language === 'en' ? 'Save Result Card' : '결과 카드 저장하기'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <PremiumReport
                        report={reportData}
                        metadata={metadata}
                        language={language}
                        shareUrl={shareUrl}
                        onUnlock={handleUpgrade}
                        isPremium={isPremium}
                        price={dynamicPrice}
                        isLoading={isLoading}
                        onRetry={() => {
                          const nextPhase = determineNextPremiumPhase(reportData);
                          console.log('[Retry] Resuming from phase:', nextPhase);
                          if (nextPhase <= TOTAL_PREMIUM_PHASES) {
                            startReading(selectedCards, true, readingData!, reportData, nextPhase);
                          }
                        }}
                      />
                      {/* Oracle Chat Integration - Only show if readingId exists (saved) */}
                      {shareUrl && (
                        <div className="container mx-auto px-4 mt-12 mb-20 relative z-10">
                          <ChatInterface readingId={shareUrl.split('/').pop()!} />
                        </div>
                      )}
                    </ErrorBoundary>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-12 glass-card border-red-500/20 max-w-lg mx-auto my-20"
                >
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-red-400 text-3xl italic font-cinzel">!</span>
                  </div>
                  <h3 className="text-xl font-cinzel mb-4 text-red-200">Analysis Interrupted</h3>
                  <p className="text-sm text-gray-400 mb-6 font-light leading-relaxed">
                    {streamContent || (language === 'en'
                      ? "The cosmic alignment was too complex to process at this moment."
                      : "우주의 기운이 너무 복잡하여 현재 처리할 수 없습니다.")}
                  </p>
                  <div className="flex flex-col gap-3 justify-center items-center">
                    {(isPremium || searchParams.get('paid') === 'true') ? (
                      <button
                        onClick={() => {
                          // In-place retry logic
                          setIsLoading(true);
                          setStreamContent('');
                          // Determine phase to resume from
                          const nextPhase = determineNextPremiumPhase(reportData);
                          if (nextPhase <= TOTAL_PREMIUM_PHASES) {
                            startReading(selectedCards, true, readingData!, reportData, nextPhase);
                            return;
                          }
                          setIsLoading(false);
                        }}
                        className="btn-primary px-8 py-3 text-sm font-medium tracking-widest uppercase hover:brightness-110 transition-all flex items-center gap-2"
                      >
                        <RefreshCw size={16} />
                        {language === 'en' ? 'Retry Analysis' : '분석 이어서 진행하기'}
                      </button>
                    ) : (
                      <button
                        onClick={() => window.location.href = '/start?reset=true'}
                        className="btn-secondary px-8 py-3 text-sm font-medium tracking-widest uppercase hover:bg-white/5 transition-all"
                      >
                        {language === 'en' ? 'Start New Journey' : '처음부터 다시하기'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient Footer */}
      <Footer />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentStart={() => {
          console.log('Payment started');
        }}
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
        onClose={() => {
          setIsReviewOpen(false);
          setHasDismissedReview(true);
        }}
        readingId={shareUrl?.split('/').pop()}
      />

      {/* Share Card Modal */}
      {reportData && (
        <ShareCardModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={reportData.summary?.title || "나의 우주적 운명"}
          trustScore={reportData.summary?.trust_score ? Math.round(reportData.summary.trust_score * 20) : 85}
          matchLevel={
            (reportData.summary?.trust_score || 0) >= 4.5 ? 'PERFECT' :
              (reportData.summary?.trust_score || 0) >= 3 ? 'PARTIAL' : 'CONFLICT'
          }
          keywords={reportData.summary?.keywords?.slice(0, 4) || ['운명', '변화', '성장']}
          userName={readingData?.name}
        />
      )}

    </main >

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
