'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, Orbit, Stars } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { LoginModal, useLoginModal } from '@/components/auth/LoginModal';
import { CareerTeaserInputForm } from '@/components/career/CareerTeaserInputForm';
import { ResultView } from '@/components/career/ResultView';
import { TeaserView } from '@/components/career/TeaserView';
import { SealUnlockAnimation } from '@/components/career/SealUnlockAnimation';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { parseStoredCareerUnlockPayload, toCareerUnlockPayload } from '@/lib/career/funnel';
import {
  CareerInputValues,
  CareerPremiumReport,
  CareerTeaserResponse,
  CareerUnlockResponse,
} from '@/types/career';

type FunnelState = 'IDLE' | 'LOADING_TEASER' | 'TEASER' | 'UNLOCKING' | 'RESULT';

function StarfieldBackground() {
  return (
    <>
      <div className="cosmic-dust opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.12),transparent_34%),radial-gradient(circle_at_bottom,_rgba(251,191,36,0.12),transparent_24%)]" />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-[120px]" />
    </>
  );
}

function HeroCopy() {
  return (
    <div className="space-y-5 text-center lg:text-left">
      <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-100/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100/70">
        <Stars className="h-4 w-4 text-amber-200" />
        Career Oracle
      </span>
      <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">Discover your cosmic career destiny.</h1>
      <p className="max-w-xl text-base text-white/60 md:text-lg">
        Your first screen reveals the strongest career orbit pulled from saju, astrology, and tarot.
      </p>
    </div>
  );
}

function FocusStrip() {
  const items = ['이직 타이밍', '첫 직장 방향', '승진 압박', '번아웃 분기점'];

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs tracking-[0.18em] text-white/56"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
      {message}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
      <Orbit className="h-12 w-12 animate-spin text-cyan-400" />
      <p className="animate-pulse text-sm font-medium text-cyan-200">{label}</p>
    </div>
  );
}

function extractErrorMessage(data: unknown, fallback: string) {
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    const candidate = (data as { error?: unknown }).error;
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
    if (candidate && typeof candidate === 'object') {
      const message = (candidate as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) return message;
    }
  }
  return fallback;
}

function clearPendingCareerState() {
  const keys = [
    'pending_reading_data',
    'pending_metadata',
    'pending_report_data',
    'pending_reading_id',
    'payment_completed',
    'is_session_active',
  ];

  keys.forEach((key) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  });
}

export function CareerLandingExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { openLoginModal } = useLoginModal();
  const processedSessionIdRef = useRef<string | null>(null);

  const [funnelState, setFunnelState] = useState<FunnelState>('IDLE');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [teaserHook, setTeaserHook] = useState('');
  const [premiumReport, setPremiumReport] = useState<CareerPremiumReport | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [lastInputValues, setLastInputValues] = useState<CareerInputValues | null>(null);
  const [isSealAnimationFinished, setIsSealAnimationFinished] = useState(false);
  const [queuedUnlockResult, setQueuedUnlockResult] = useState<{
    report: CareerPremiumReport;
    readingId: string | null;
  } | null>(null);

  const handleReset = useCallback(() => {
    clearPendingCareerState();
    processedSessionIdRef.current = null;
    setErrorMessage(null);
    setTeaserHook('');
    setPremiumReport(null);
    setReadingId(null);
    setIsSealAnimationFinished(false);
    setQueuedUnlockResult(null);
    setIsPaymentModalOpen(false);
    setFunnelState('IDLE');
    router.replace('/career', { scroll: false });
  }, [router]);

  const finalizeUnlock = useCallback(() => {
    if (!queuedUnlockResult) return;

    setPremiumReport(queuedUnlockResult.report);
    setReadingId(queuedUnlockResult.readingId);
    setQueuedUnlockResult(null);
    setIsSealAnimationFinished(false);
    clearPendingCareerState();
    setFunnelState('RESULT');
    router.replace('/career?unlocked=true', { scroll: false });
  }, [queuedUnlockResult, router]);

  const handleUnlockAnimationComplete = useCallback(() => {
    setIsSealAnimationFinished(true);
  }, []);

  const handleInitialSubmit = useCallback(async (values: CareerInputValues) => {
    const payload = toCareerUnlockPayload(values);

    setFunnelState('LOADING_TEASER');
    setErrorMessage(null);
    setPremiumReport(null);
    setReadingId(null);
    setQueuedUnlockResult(null);
    setLastInputValues(values);

    try {
      const response = await fetch('/api/reading/career/teaser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as CareerTeaserResponse | { error?: unknown };

      if (!response.ok) {
        throw new Error(extractErrorMessage(data, '티저를 불러오지 못했습니다.'));
      }

      const teaserData = data as CareerTeaserResponse;
      setTeaserHook(teaserData.hook || '지금의 흔들림은 커리어 축이 이동하기 시작했다는 신호입니다.');
      setFunnelState('TEASER');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '오라클 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.';
      setErrorMessage(message);
      setFunnelState('IDLE');
    }
  }, []);

  const unlockCareerReport = useCallback(
    async (sessionId: string, payloadJson: string | null) => {
      const payload = parseStoredCareerUnlockPayload(payloadJson);

      if (!payload) {
        setErrorMessage('결제 복귀 데이터가 없어 봉인 해제를 이어갈 수 없습니다. 다시 시도해 주세요.');
        setFunnelState(lastInputValues ? 'TEASER' : 'IDLE');
        router.replace('/career', { scroll: false });
        return;
      }

      try {
        setErrorMessage(null);
        setIsPaymentModalOpen(false);
        setIsSealAnimationFinished(false);
        setFunnelState('UNLOCKING');

        const response = await fetch('/api/reading/career/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, sessionId }),
        });
        const data = (await response.json()) as CareerUnlockResponse | { error?: unknown };

        if (!response.ok) {
          throw new Error(extractErrorMessage(data, '봉인 해제에 실패했습니다.'));
        }

        const unlockData = data as CareerUnlockResponse;
        setLastInputValues({
          birthDate: payload.birthday,
          birthTime: payload.birthtime,
          gender: payload.gender === 'M' ? 'male' : 'female',
          worryType: payload.worryType,
        });
        setQueuedUnlockResult({
          report: unlockData.report,
          readingId: unlockData.readingId ?? null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '잠금 해제 중 오류가 발생했습니다. 다시 시도해 주세요.';
        setErrorMessage(message);
        setIsSealAnimationFinished(false);
        setFunnelState(lastInputValues ? 'TEASER' : 'IDLE');
        router.replace('/career', { scroll: false });
      }
    },
    [lastInputValues, router],
  );

  const handleUnlockClick = useCallback(() => {
    if (status !== 'authenticated') {
      setErrorMessage('커리어 오라클 전체 결과는 로그인 후 해제할 수 있습니다.');
      openLoginModal();
      return;
    }

    setErrorMessage(null);
    setIsPaymentModalOpen(true);
  }, [openLoginModal, status]);

  const handlePaymentModalClose = useCallback(() => {
    setIsPaymentModalOpen(false);
  }, []);

  useEffect(() => {
    if (searchParams.get('canceled') !== 'true') return;

    setErrorMessage('결제가 취소되었습니다. 다시 시도하실 수 있습니다.');
    if (!premiumReport && teaserHook) {
      setFunnelState('TEASER');
    }
  }, [premiumReport, searchParams, teaserHook]);

  useEffect(() => {
    const isPaid = searchParams.get('paid') === 'true';
    const sessionId = searchParams.get('session_id');

    if (!isPaid || !sessionId) return;
    if (processedSessionIdRef.current === sessionId) return;

    processedSessionIdRef.current = sessionId;

    const pendingPayload =
      sessionStorage.getItem('pending_reading_data') ||
      localStorage.getItem('pending_reading_data');

    void unlockCareerReport(sessionId, pendingPayload);
  }, [searchParams, unlockCareerReport]);

  useEffect(() => {
    if (funnelState !== 'UNLOCKING' || !isSealAnimationFinished || !queuedUnlockResult) {
      return;
    }

    finalizeUnlock();
  }, [finalizeUnlock, funnelState, isSealAnimationFinished, queuedUnlockResult]);

  const paymentReadingData = lastInputValues
    ? { ...toCareerUnlockPayload(lastInputValues), context: 'career' }
    : undefined;

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#050814] text-white">
      <StarfieldBackground />
      <LoginModal />

      <AnimatePresence>
        {funnelState === 'UNLOCKING' && (
          <SealUnlockAnimation onComplete={handleUnlockAnimationComplete} />
        )}
      </AnimatePresence>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handlePaymentModalClose}
        readingData={paymentReadingData}
        metadata={{
          context: 'career',
          source: 'career_oracle_funnel',
          birthDate: lastInputValues?.birthDate,
          birthTime: lastInputValues?.birthTime,
          gender: lastInputValues?.gender,
          worryType: lastInputValues?.worryType,
        }}
        trackingSource="career_oracle_unlock"
        checkoutConfig={{
          paymentType: 'career_report',
          successPath: '/career?paid=true&session_id={CHECKOUT_SESSION_ID}',
          cancelPath: '/career?canceled=true',
          metadata: {
            context: 'career',
            source: 'career_oracle_funnel',
            worryType: lastInputValues?.worryType || 'transition',
          },
        }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6">
          <HeroCopy />
          <FocusStrip />
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleReset}
              className="text-xs font-semibold uppercase tracking-widest text-white/30 transition hover:text-white"
            >
              Reset Oracle
            </button>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <a href="#career-input" className="inline-flex items-center gap-2 text-sm text-cyan-100/80 transition hover:text-white">
              <span>Jump to {funnelState === 'IDLE' ? 'teaser form' : 'your outcome'}</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section id="career-input" className="rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-[0_30px_120px_rgba(3,7,18,0.65)] backdrop-blur-3xl md:p-8">
          <ErrorBanner message={errorMessage} />

          <AnimatePresence mode="wait">
            {funnelState === 'IDLE' && (
              <CareerTeaserInputForm
                key="idle"
                isSubmitting={false}
                onSubmit={handleInitialSubmit}
              />
            )}

            {funnelState === 'LOADING_TEASER' && (
              <LoadingState key="loading" label="궤적을 분석하는 중..." />
            )}

            {funnelState === 'TEASER' && (
              <TeaserView
                key="teaser"
                hook={teaserHook}
                onUnlock={handleUnlockClick}
                isUnlocking={status === 'loading'}
              />
            )}

            {funnelState === 'UNLOCKING' && (
              <LoadingState key="unlocking" label="결제를 확인하고 봉인을 해제하는 중..." />
            )}

            {funnelState === 'RESULT' && premiumReport && (
              <div key="result" className="animate-in fade-in zoom-in duration-1000">
                <ResultView report={premiumReport} readingId={readingId} onReset={handleReset} />
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
