'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { ReadingInput, ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportData } from '@/components/reading/premium-report';
import type { ReadingContext } from '@/lib/ai/prompt-builder';
import { createSession } from '@/lib/session/reading-session';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { OracleCalibrationPanel } from '@/components/reading/OracleCalibrationPanel';
import { ProductShell } from '@/components/common/ProductShell';
import { getLandingVariant, readPreferredClientLanguage, USER_LANGUAGE_STORAGE_KEY } from '@/lib/language-preference';

import { Footer } from '@/components/landing/Footer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UnifiedReadingDisplay } from '@/components/cosmic/UnifiedReadingDisplay'; // Integration
import type { CosmicTag, UnifiedReadingResult } from '@/lib/cosmic/schema';
import { Skeleton } from '@/components/ui/skeleton';

// 🚀 Dynamic Imports - 초기 번들 크기 최적화
// 이 컴포넌트들은 사용자가 해당 단계에 도달할 때만 로드됩니다
const PremiumReport = dynamic(() => import('@/components/reading/premium-report').then(mod => mod.PremiumReport), {
  loading: () => <div className="flex justify-center py-20"><Skeleton className="h-96 w-full" /></div>
});
const DecisionGuard = dynamic(() => import('@/components/reading/decision-guard').then(mod => mod.DecisionGuard));
const PaymentModal = dynamic(() => import('@/components/payment/PaymentModal').then(mod => mod.PaymentModal));
const ReviewModal = dynamic(() => import('@/components/review/ReviewModal').then(mod => mod.ReviewModal));
const ChatInterface = dynamic(() => import('@/components/oracle-chat/ChatInterface').then(mod => mod.ChatInterface), {
  loading: () => <Skeleton className="h-48 w-full" />
});
const ShareCardModal = dynamic(() => import('@/components/share/ShareCardModal').then(mod => mod.ShareCardModal));

type TarotSelection = { name: string; isReversed: boolean };
type PremiumReportState = Partial<PremiumReportData> & {
  summary?: PremiumReportData['summary'] & { keywords?: string[] };
};
type StartReadingFn = (
  cards: TarotSelection[],
  isPremiumOverride?: boolean,
  readingDataOverride?: ReadingData,
  initialReport?: PremiumReportState,
  startPhaseOverride?: number
) => Promise<void>;
type KeyTheme = string | { tag?: string };
type SourceSummaryRecord = Record<string, unknown> & { summary?: string };
type ReadingMetadata = {
  tarot?: TarotSelection[] | SourceSummaryRecord;
  tarotCards?: TarotSelection[];
  radarScores?: { saju: number; astrology: number; tarot: number };
  precisionMetadata?: {
    inputDate: string;
    inputTime: string;
    tstOffset: number;
    correctedDate: string;
    correctedTime: string;
    lon: number;
    hourPillar: string;
  };
  oracleCouncil?: { convergenceScore: number; ziweiSummary: string; natalSummary: string };
  characterId?: string;
  oraclePersona?: { id: string; name: string; title: string };
  language?: 'ko' | 'en';
  isPremium?: boolean;
  keyThemes?: KeyTheme[];
  saju?: { fullSaju?: string };
  sajuResult?: SourceSummaryRecord;
  astrology?: SourceSummaryRecord;
  [key: string]: unknown;
};

const SUPPORTED_READING_CONTEXTS: ReadonlySet<ReadingContext> = new Set([
  'career',
  'love',
  'money',
  'health',
  'general',
]);

function getPrefilledReadingContext(value: string | null): ReadingContext | undefined {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();
  if (SUPPORTED_READING_CONTEXTS.has(normalized as ReadingContext)) {
    return normalized as ReadingContext;
  }

  return undefined;
}

function getPrefilledQuestion(value: string | null): string | undefined {
  if (!value) return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  return normalized.slice(0, 240);
}

function getStartPageSource(hasInvite: boolean, entry: string | null): string {
  if (hasInvite) {
    return 'start_page_invite';
  }

  if (!entry) {
    return 'start_page';
  }

  return `start_page_${entry.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_')}`.slice(0, 64);
}

function getSourceSummary(value: unknown, fallback: string) {
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const summary = (value as SourceSummaryRecord).summary;
  return typeof summary === 'string' && summary.trim() ? summary : fallback;
}

function hasPremiumReportContent(report: PremiumReportState | null): report is PremiumReportData {
  return Boolean(report?.summary && report?.traits);
}

function getReadingPhaseLabels(language: 'ko' | 'en') {
  const labelsKo = [
    "",
    "질문에 맞는 가이드를 정리 중... (1/7)",
    "보조 신호를 같이 확인 중... (2/7)",
    "사주 원국을 계산 중... (3/7)",
    "변곡점과 흐름을 읽는 중... (4/7)",
    "분야별 포인트를 정리 중... (5/7)",
    "언제 움직일지 정리 중... (6/7)",
    "첫 결론을 마무리 중... (7/7)"
  ];
  const labelsEn = [
    "",
    "Aligning your oracle guide... (1/7)",
    "Cross-checking the supporting signals... (2/7)",
    "Calculating your saju foundation... (3/7)",
    "Mapping the flow and turning points... (4/7)",
    "Weaving signals across life areas... (5/7)",
    "Opening your action window and timing map... (6/7)",
    "Unsealing the final oracle verdict... (7/7)"
  ];

  return language === 'en' ? labelsEn : labelsKo;
}

function CosmicPathContent() {
  const [step, setStep] = useState<'input' | 'result'>('input');
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTrackingSource, setPaymentTrackingSource] = useState('start_result_unlock');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // Share Card Modal

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
  const initialSearchParamsKeyRef = useRef(searchParams.toString());
  const isLoadingRef = useRef(isLoading);
  const startReadingRef = useRef<StartReadingFn | null>(null);
  isLoadingRef.current = isLoading;



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

  const hasStoredPayload = (value: string | null | undefined) => {
    return Boolean(value && value !== 'null' && value !== 'undefined');
  };

  const getStoredReadingAccessKey = () => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem('pending_reading_access_key') ||
      localStorage.getItem('pending_reading_access_key')
    );
  };

  const getAccessKeyFromLocation = () => {
    if (typeof window === 'undefined') return null;

    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

    return hashParams.get('accessKey') || url.searchParams.get('accessKey');
  };

  const stripAccessKeyFromLocation = () => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
    const hadSearchAccessKey = url.searchParams.has('accessKey');
    const hadHashAccessKey = hashParams.has('accessKey');

    if (!hadSearchAccessKey && !hadHashAccessKey) {
      return;
    }

    url.searchParams.delete('accessKey');
    hashParams.delete('accessKey');
    url.hash = hashParams.toString();

    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`
    );
  };

  const syncReadingAccessKey = (accessKey?: string | null) => {
    if (!accessKey) return;
    saveToSessionAndBackup('pending_reading_access_key', accessKey);
  };

  const clearSessionAndBackup = () => {
    const keys = [
      'pending_reading_data', 'pending_report_data', 'pending_metadata',
      'pending_reading_id', 'pending_reading_access_key', 'payment_completed', 'decision_accepted',
      'is_session_active'
    ];
    keys.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    });
    localStorage.removeItem('backup_timestamp');
  };

  const syncResultUrl = (readingId?: string | null) => {
    if (typeof window === 'undefined') return;

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('reset');
    currentUrl.searchParams.delete('paid');
    currentUrl.searchParams.delete('canceled');
    currentUrl.searchParams.delete('accessKey');

    if (readingId) {
      currentUrl.searchParams.set('reading_id', readingId);
    } else {
      currentUrl.searchParams.delete('reading_id');
    }

    if (inviteCode) {
      currentUrl.searchParams.set('invite', inviteCode);
    }
    if (autoReferralCode) {
      currentUrl.searchParams.set('referralCode', autoReferralCode);
    }

    window.history.replaceState(
      readingId ? { readingId } : window.history.state,
      '',
      currentUrl.toString()
    );
  };

  const waitForPendingReadingId = async (timeoutMs = 1200) => {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const pendingId =
        sessionStorage.getItem('pending_reading_id') ||
        localStorage.getItem('pending_reading_id');

      if (pendingId) {
        return pendingId;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return null;
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

      const origin = window.location.origin;
      const appUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      setShareUrl(`${appUrl}/share/${savedId}`);
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

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [hasDismissedReview, setHasDismissedReview] = useState(false); // 🚀 Prevent reopening

  // Review Modal Trigger - Scroll-based
  const hasReportSummary = !!reportData?.summary;
  const reviewTrustScore = reportData?.summary?.trust_score ?? 3;
  const paidFromSearchParams = searchParams.get('paid') === 'true';
  useEffect(() => {
    const isPaidSession = paidFromSearchParams || sessionStorage.getItem('payment_completed') === 'true';
    const hasReviewed = localStorage.getItem('review_submitted') === 'true';
    const isPromoUser = sessionStorage.getItem('promo_user') === 'true';
    const isPremiumStatus = sessionStorage.getItem('is_premium_user') === 'true';

    if (!hasReportSummary) return;

    const isGuardPassed = reviewTrustScore > 2 || isDecisionAccepted;

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
  }, [step, isLoading, isDecisionAccepted, hasReportSummary, hasDismissedReview, paidFromSearchParams, reviewTrustScore]);

  // Resume Reading after Payment
  const isProcessingResume = useRef(false);

  useEffect(() => {
    const checkResume = async () => {
      // Prevent double-execution (React Strict Mode or rapid updates)
      if (isProcessingResume.current) {
        return;
      }
      // Lock immediately to prevent any duplicate calls
      isProcessingResume.current = true;

      const params = new URLSearchParams(initialSearchParamsKeyRef.current);
      const paid = params.get('paid');
      const canceled = params.get('canceled');
      const readingIdFromUrl = params.get('reading_id');
      const accessKeyFromUrl = getAccessKeyFromLocation() || params.get('accessKey');

      // Small delay ONLY if we don't have explicit URL flags (relying on sessionStorage only)
      if (!paid && !canceled && !readingIdFromUrl) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const reset = params.get('reset') === 'true';
      const isSessionActive = sessionStorage.getItem('is_session_active') === 'true';

      if (reset) {
        clearSessionAndBackup();
        setHasCheckedResume(true);
        return;
      }

      const sessionReadingId = sessionStorage.getItem('pending_reading_id');
      const sessionReadingAccessKey = sessionStorage.getItem('pending_reading_access_key');
      const sessionPendingData = sessionStorage.getItem('pending_reading_data');
      const sessionPendingReport = sessionStorage.getItem('pending_report_data');
      const sessionPendingMetadata = sessionStorage.getItem('pending_metadata');

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
        setHasCheckedResume(true);
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

      if (readingId && !hasStoredPayload(pendingData)) {
        try {
          const params = new URLSearchParams({ id: readingId });
          const accessKey = pendingReadingAccessKey || getStoredReadingAccessKey();
          if (accessKey) {
            params.set('accessKey', accessKey);
          }
          const response = await fetch(`/api/reading/save?${params.toString()}`);
          if (response.ok) {
            const saved = await response.json();
            if (saved.success) {
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
          }
        } catch (err) {
          console.error('[Resume] DB fetch failed:', err);
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
            setReadingData(restoredReadingData);
            setLanguage(restoredReadingData.language as 'ko' | 'en');

            if ((restoredReadingData as ReadingData & { tarotCards?: { name: string; isReversed: boolean }[] }).tarotCards) {
              setSelectedCards((restoredReadingData as ReadingData & { tarotCards?: { name: string; isReversed: boolean }[] }).tarotCards || []);
            }
          }

          if (restoredReport) {
            setReportData(restoredReport);
          }

          if (parsedMetadata) {
            setMetadata(parsedMetadata);
            if (parsedMetadata.language) {
              setLanguage(parsedMetadata.language as 'ko' | 'en');
            }
            if (parsedMetadata.isPremium) {
              setIsPremium(true);
            }
          }

          if (sessionStorage.getItem('decision_accepted') === 'true') {
            setIsDecisionAccepted(true);
          }
          if (sessionStorage.getItem('is_premium_user') === 'true') {
            setIsPremium(true);
          }

          setStep(
            hasRestoredReportPayload ||
            paid === 'true' ||
            canceled === 'true' ||
            sessionStorage.getItem('payment_completed') === 'true'
              ? 'result'
              : 'input'
          );

          const pendingId = sessionStorage.getItem('pending_reading_id');
          if (pendingId) {
            const origin = window.location.origin;
            const appUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;
            setShareUrl(`${appUrl}/share/${pendingId}`);
            syncResultUrl(pendingId);
          }

          const isPaymentCompleted = sessionStorage.getItem('payment_completed') === 'true';
          if ((paid === 'true' || isPaymentCompleted) && restoredReadingData) {
            setIsPremium(true);
            if (paid === 'true') {
              saveToSessionAndBackup('payment_completed', 'true');
            }

            if (!isLoadingRef.current) {
              const nextPhase = determineNextPremiumPhase(restoredReport);
              if (nextPhase <= TOTAL_PREMIUM_PHASES) {
                const resumeLanguage =
                  (restoredReadingData.language as 'ko' | 'en') ||
                  (parsedMetadata?.language as 'ko' | 'en') ||
                  'ko';
                const labels = getReadingPhaseLabels(resumeLanguage);
                setLoadingPhase({
                  phase: nextPhase,
                  label: labels[nextPhase] || (resumeLanguage === 'en' ? 'Preparing your reading...' : '리딩을 정리하는 중...'),
                });
                setHasCheckedResume(true);
                await startReadingRef.current?.(
                  (restoredReadingData as ReadingData & { tarotCards?: { name: string; isReversed: boolean }[] }).tarotCards || [],
                  true,
                  restoredReadingData,
                  restoredReport || undefined,
                  nextPhase
                );
              }
            }
          }

          if (paid === 'true' || canceled === 'true') {
            window.history.replaceState({}, '', window.location.pathname);
          }
        } catch (error) {
          console.error('[Resume] Failure during restoration:', error);
        }
      }

      setHasCheckedResume(true);
    };

    checkResume();
    // This restore flow must run only once on mount to avoid duplicate premium resumes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Step 1: Input Submission -> Go Directly to Result
  const handleInputSubmit = (data: ReadingData) => {
    clearSessionAndBackup(); // Clear previous session data
    saveToSessionAndBackup('is_session_active', 'true');
    syncResultUrl(null);

    hasTrackedFreeResult.current = false;
    hasTrackedReportComplete.current = false;

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
    void trackClientGrowthEvent({
      event: 'analysis_start',
      source: 'reading_input',
      step: 'input',
      language: data.language,
      context: data.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
    });
    setIsLoading(true);
    setStep('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void startReading([], false, data);
  };

  const handleUpgrade = async () => {
    // Open payment modal instead of direct unlock, unless already premium
    if (isPremium) return;
    await ensureReadingReadyForPayment();
    setPaymentTrackingSource('start_result_unlock');
    setIsPaymentModalOpen(true);
  };

  const TOTAL_PREMIUM_PHASES = 7;

  const determineNextPremiumPhase = (report: PremiumReportState | null | undefined) => {
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
    cards: TarotSelection[],
    isPremiumOverride = false,
    readingDataOverride?: ReadingData,
    initialReport?: PremiumReportState,
    startPhaseOverride?: number
  ) => {
    const dataToUse = readingDataOverride || readingData;
    if (!dataToUse) return;

    try {
      setIsLoading(true);
      setStreamContent('');

      // If resuming, use existing report, otherwise start empty
      let accumulatedReport: PremiumReportState = initialReport || {};
      let accumulatedMetadata: ReadingMetadata = metadata || {};
      const totalPhases = TOTAL_PREMIUM_PHASES;
      const labels = getReadingPhaseLabels(language);

      const startPhase = startPhaseOverride || 1;
      // If we are not premium, only show Phase 1 (Summary + Traits + Core) - 비용 절감
      const maxPhase = (isPremium || isPremiumOverride) ? totalPhases : 1;

      // If we are just starting fresh free reading, phase 1 only.
      // If we upgraded, resume from the first missing premium phase.

      for (let phase = startPhase; phase <= maxPhase; phase++) {
        setLoadingPhase({ phase, label: labels[phase] });

        const requestTier = (isPremium || isPremiumOverride) ? 'premium' : 'free';
        const response = await fetch('/api/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...dataToUse,
            tarotCards: cards,
            tier: requestTier,
            ...(requestTier === 'premium'
              ? {
                  phase,
                  previousReport: accumulatedReport,
                  isPaid: isPremium || isPremiumOverride,
                  readingId: sessionStorage.getItem('pending_reading_id') || undefined,
                  accessKey: getStoredReadingAccessKey() || undefined,
                }
              : {}),
          }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
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
                title: language === 'en' ? 'Your reading summary' : '첫 리딩 요약',
                content: result.fallbackMessage,
                trust_score: 3,
                trust_reason: language === 'en'
                  ? 'A simplified fallback summary was prepared because the full AI response was unstable.'
                  : '전체 AI 응답이 불안정해서 요약형 fallback 결과를 먼저 준비했습니다.',
              },
              traits: [],
            };

            accumulatedReport = { ...accumulatedReport, ...fallbackReport };
            setReportData({ ...accumulatedReport });
            setStreamContent(result.fallbackMessage);
            saveToSessionAndBackup('pending_report_data', JSON.stringify(accumulatedReport));
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
            const autoCards = (result.metadata.tarotCards as TarotSelection[]).map((card: TarotSelection) => ({
              name: card.name,
              isReversed: card.isReversed,
            }));
            setSelectedCards(autoCards);
            saveToSessionAndBackup('pending_reading_data', JSON.stringify({ ...dataToUse, tarotCards: autoCards }));
          }
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
            const saveRes = await fetch('/api/reading/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: sessionStorage.getItem('pending_reading_id') || undefined,
                accessKey: getStoredReadingAccessKey() || undefined,
                data: accumulatedReport,
                metadata: {
                  ...accumulatedMetadata,
                  isPremium: false, // Will be set to true by webhook/sync
                  readingData: dataToUse,
                  tarotCards: phaseTarotCardsForSave,
                  language,
                  paymentSource: isPremiumOverride ? 'override' : 'pending'
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
          const birthInfoStr = language === 'en'
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
            contextMap[language][dataToUse.context] ||
            (language === 'en' ? 'Your reading' : '운세 리딩');

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

          const savedPayload = await response.json().catch(() => null);
          syncReadingAccessKey(savedPayload?.accessKey);
          const savedId = savedPayload?.id;
          if (savedId) {
            saveToSessionAndBackup('pending_reading_id', savedId);
            const origin = window.location.origin;
            const appUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;
            const shareUrlPath = `/share/${savedId}`;
            setShareUrl(`${appUrl}${shareUrlPath}`);
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
      console.error('Reading failed:', error);
      const message = error instanceof Error && error.message
        ? error.message
        : (language === 'en' ? "Failed to connect to the server. Please try again." : "서버 연결에 실패했습니다. 다시 시도해주세요.");
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
  const premiumReportMetadata = metadata
    ? {
        tarot: Array.isArray(metadata.tarot) ? metadata.tarot : undefined,
        radarScores: metadata.radarScores,
        precisionMetadata: metadata.precisionMetadata,
        oracleCouncil: metadata.oracleCouncil,
        characterId: metadata.characterId,
        oraclePersona: metadata.oraclePersona,
        language: metadata.language,
        isPremium: metadata.isPremium,
      }
    : undefined;
  const shouldHideProductHeader = !hasCheckedResume || (step === 'result' && isLoading);
  const returnToInputWithDraft = () => {
    setIsLoading(false);
    setStep('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ProductShell
      language={language}
      showBackButton={step === 'input' || step === 'result'}
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
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto w-full max-w-4xl px-4 pt-24 pb-12 md:px-6 md:pt-32 md:pb-20"
            >
              <div className="mb-8 text-center md:mb-16">
                <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-6 shadow-[0_24px_70px_rgba(2,6,23,0.24)] backdrop-blur-xl md:rounded-[32px] md:px-10 md:py-8">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-acc-gold">
                      {language === 'en' ? 'Decision Timing Reading' : '결정 타이밍 리딩'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                      {language === 'en' ? 'Free First Reading' : '첫 리딩 무료'}
                    </span>
                  </div>
                  <h1 className="mb-3 mt-4 font-cinzel text-[2rem] text-starlight md:mb-4 md:mt-5 md:text-5xl">
                    {language === 'en' ? 'Start With The Question' : '지금 고민되는 질문부터 적어보세요'}
                  </h1>
                  <p className="mx-auto max-w-2xl text-sm leading-6 text-white/60 md:leading-7">
                    {language === 'en'
                      ? 'The free result now opens right after one question and your core saju inputs. Extra steps stay out of the way.'
                      : '질문 하나와 핵심 정보만 넣으면 첫 결과가 바로 열립니다. 정확도와 상관없는 단계는 앞에서 최대한 뺐습니다.'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45 md:mt-5">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {language === 'en' ? 'Pick Domain' : '영역 고르기'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {language === 'en' ? 'Write Question' : '질문 적기'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {language === 'en' ? 'Core Saju Inputs' : '생년월일 입력'}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      {language === 'en' ? 'See Free Result' : '무료 결과 보기'}
                    </span>
                  </div>
                </div>
              </div>

              <ReadingInput
                initialData={readingData ?? undefined}
                initialLanguage={language}
                onLanguageChange={setLanguage}
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
                initialContext={initialContext}
                initialQuestion={initialQuestion}
              />
            </motion.div>
          )}

          {/* Step 4: Result (Deep Dive) */}
          {step === 'result' && (
          <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              {isLoading ? (
                <div className="flex min-h-[420px] items-center justify-center px-4 py-12 md:min-h-[500px] md:py-16">
                  <OracleCalibrationPanel
                    language={language}
                    loadingLabel={loadingPhase.label || (language === 'en' ? 'Preparing your reading...' : '리딩을 정리하는 중...')}
                    loadingPhase={loadingPhase.phase}
                    characterId={metadata?.characterId ?? readingData?.characterId}
                    precisionMetadata={metadata?.precisionMetadata ?? reportData?.precisionMetadata}
                    oracleCouncil={metadata?.oracleCouncil ?? reportData?.oracleCouncil}
                    hasPreciseBirthLocation={hasPreciseBirthLocation}
                  />
                </div>
              ) : reportData && reportData.summary ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 py-10 pt-24 md:py-12 md:pt-32">
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
                        {unifiedResult ? <UnifiedReadingDisplay result={unifiedResult} /> : null}

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

                                    alert(language === 'en' ? 'Invitation link copied!' : '초대 링크를 복사했어요.\n친구에게 보내면 궁합 결과를 무료로 볼 수 있어요.');
                                  }
                                } catch (e) {
                                  console.error(e);
                                  alert('Error creating invite link');
                                }
                              }}
                            className="group relative overflow-hidden rounded-[20px] bg-gradient-to-r from-acc-gold to-[#F59E0B] px-8 py-4 font-bold text-bg-void shadow-[0_14px_32px_rgba(212,175,55,0.14)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(212,175,55,0.28)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70"
                            >
                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                              <div className="relative flex items-center gap-2">
                                <span className="font-cinzel tracking-wider">
                                  {language === 'en' ? 'Send Reading Invite' : '친구 초대 링크 복사하기'}
                                </span>
                              </div>
                            </button>
                          )}

                          {/* CASE B: Invited Guest -> Upsell */}
                          {isInvitationMode && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-md rounded-[26px] border border-acc-gold/30 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 text-center backdrop-blur-xl">
                              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-acc-gold">
                                {language === 'en' ? 'Reading Invitation' : '리딩 초대'}
                              </div>
                              <h3 className="text-white text-lg font-cinzel mb-4 leading-relaxed">
                                {language === 'en'
                                  ? 'Ready to open your own oracle path?'
                                  : `방금 본 결과, 꽤 잘 맞았나요?\n이제 내 질문도 직접 읽어보세요.`}
                              </h3>
                              <button
                            onClick={async () => {
                              await ensureReadingReadyForPayment();
                              setPaymentTrackingSource('invite_upsell');
                              setIsPaymentModalOpen(true);
                            }}
                            className="w-full rounded-xl border border-white/20 bg-white/10 py-3 font-bold text-starlight transition-[transform,background-color,border-color,color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-acc-gold hover:text-bg-void hover:shadow-[0_16px_32px_rgba(212,175,55,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70"
                          >
                                {language === 'en' ? 'Open My Decision Reading (30% OFF)' : '내 질문도 직접 보기 (30% 할인)'}
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

                      {premiumReportData ? (
                        <PremiumReport
                          report={premiumReportData}
                          metadata={premiumReportMetadata}
                          language={language}
                          shareUrl={shareUrl}
                          onUnlock={handleUpgrade}
                          isPremium={isPremium}
                          price={dynamicPrice}
                          isLoading={isLoading}
                          onRetry={() => {
                            const nextPhase = determineNextPremiumPhase(reportData);
                            if (nextPhase <= TOTAL_PREMIUM_PHASES) {
                              startReading(selectedCards, true, readingData!, reportData ?? undefined, nextPhase);
                            }
                          }}
                        />
                      ) : null}
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
                  <h3 className="text-xl font-cinzel mb-4 text-red-200">
                    {language === 'en' ? 'Analysis Interrupted' : '결과를 불러오지 못했어요'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6 font-light leading-relaxed">
                    {streamContent || (language === 'en'
                      ? "The cosmic alignment was too complex to process at this moment."
                      : "지금은 결과를 끝까지 불러오지 못했습니다. 잠시 후 다시 시도해주세요.")}
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
                            startReading(selectedCards, true, readingData!, reportData ?? undefined, nextPhase);
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
                        onClick={returnToInputWithDraft}
                        className="btn-secondary px-8 py-3 text-sm font-medium tracking-widest uppercase hover:bg-white/5 transition-all"
                      >
                        {language === 'en' ? 'Back To My Inputs' : '작성한 내용 다시 보기'}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      {/* Ambient Footer */}
      <Footer language={language} />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
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
