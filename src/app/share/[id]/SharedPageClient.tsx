'use client';

import { type ComponentProps, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Lock, Orbit, Sparkles, Stars } from 'lucide-react';

import { PremiumReport } from '@/components/reading/premium-report';
import { ChatInterface } from '@/components/oracle-chat/ChatInterface';
import { ShareCard } from '@/components/reading/share-card';

const subscribeToClient = () => () => {};

type SharedReportData = ComponentProps<typeof PremiumReport>['report'];
type SharedReportMetadata = (ComponentProps<typeof PremiumReport>['metadata'] & {
  isPremium?: boolean;
}) | null;

interface SharedPageClientProps {
  id: string;
  initialReportData: SharedReportData | null;
  initialMetadata: SharedReportMetadata;
  shareSummary: {
    title: string;
    description: string;
    trustScore: number;
    mainCardName: string;
    language: 'ko' | 'en';
  };
  readingOwnerUserId: string | null;
}

const sectionReveal = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

const sectionTransition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1] as const,
};

function readAccessKeyFromUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

  return hashParams.get('accessKey') || url.searchParams.get('accessKey');
}

function stripAccessKeyFromUrl(): void {
  if (typeof window === 'undefined') {
    return;
  }

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
}

export function SharedPageClient({
  id,
  initialReportData,
  initialMetadata,
  shareSummary,
  readingOwnerUserId,
}: SharedPageClientProps) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const requestedView = searchParams.get('view');
  const [reportData, setReportData] = useState<SharedReportData | null>(initialReportData);
  const [metadata, setMetadata] = useState<SharedReportMetadata>(initialMetadata);
  const [runtimeAccessKey, setRuntimeAccessKey] = useState<string | null>(null);
  const [isResolvingFullReport, setIsResolvingFullReport] = useState(false);
  const [ownerResolutionState, setOwnerResolutionState] = useState<'idle' | 'denied' | 'error'>('idle');
  const hasStoredOwnerSession = useMemo(() => {
    if (!isClient) {
      return false;
    }

    const storedId = sessionStorage.getItem('pending_reading_id');
    const storedAccessKey =
      sessionStorage.getItem('pending_reading_access_key') ||
      localStorage.getItem('pending_reading_access_key');
    const paymentCompleted = sessionStorage.getItem('payment_completed') === 'true';

    return Boolean(
      storedId &&
      storedId === id &&
      (paymentCompleted || Boolean(storedAccessKey))
    );
  }, [id, isClient]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return `${process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.app'}/share/${id}`;
    }
    return `${window.location.origin}/share/${id}`;
  }, [id]);
  const startHref = useMemo(() => {
    const params = new URLSearchParams({ reading_id: id });
    const hash = runtimeAccessKey
      ? `#accessKey=${encodeURIComponent(runtimeAccessKey)}`
      : '';
    return `/start?${params.toString()}${hash}`;
  }, [id, runtimeAccessKey]);

  const isEn = shareSummary.language === 'en';
  const trustPercent = Math.round((shareSummary.trustScore / 5) * 100);
  const hasAccountOwnerAccess = Boolean(
    readingOwnerUserId &&
    session?.user?.id &&
    session.user.id === readingOwnerUserId
  );

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const storedAccessKey =
      sessionStorage.getItem('pending_reading_access_key') ||
      localStorage.getItem('pending_reading_access_key');
    const locationAccessKey = readAccessKeyFromUrl();
    const resolvedAccessKey = locationAccessKey || storedAccessKey;

    if (locationAccessKey) {
      sessionStorage.setItem('pending_reading_access_key', locationAccessKey);
      localStorage.setItem('pending_reading_access_key', locationAccessKey);
      localStorage.setItem('backup_timestamp', Date.now().toString());
      stripAccessKeyFromUrl();
    }

    if (initialReportData || locationAccessKey || resolvedAccessKey) {
      sessionStorage.setItem('pending_reading_id', id);
      localStorage.setItem('pending_reading_id', id);
      localStorage.setItem('backup_timestamp', Date.now().toString());
    }

    setRuntimeAccessKey(resolvedAccessKey);
  }, [id, initialReportData, isClient]);

  useEffect(() => {
    if (!isClient || reportData || isResolvingFullReport) {
      return;
    }

    const shouldResolveFullReport =
      requestedView === 'full' ||
      hasAccountOwnerAccess ||
      Boolean(runtimeAccessKey);

    if (!shouldResolveFullReport) {
      return;
    }

    let cancelled = false;

    const resolveFullReport = async () => {
      setIsResolvingFullReport(true);
      setOwnerResolutionState('idle');

      try {
        const params = new URLSearchParams({ id });
        if (runtimeAccessKey) {
          params.set('accessKey', runtimeAccessKey);
        }

        const response = await fetch(`/api/reading/save?${params.toString()}`);
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.success) {
          if (!cancelled) {
            setOwnerResolutionState(response.status === 403 ? 'denied' : 'error');

            if (response.status === 403 && runtimeAccessKey && !hasAccountOwnerAccess) {
              sessionStorage.removeItem('pending_reading_access_key');
              localStorage.removeItem('pending_reading_access_key');
            }
          }
          return;
        }

        if (cancelled) {
          return;
        }

        setReportData(payload.data);
        setMetadata(payload.metadata ?? null);
        sessionStorage.setItem('pending_reading_id', id);
        localStorage.setItem('pending_reading_id', id);
        localStorage.setItem('backup_timestamp', Date.now().toString());
      } catch {
        if (!cancelled) {
          setOwnerResolutionState('error');
        }
      } finally {
        if (!cancelled) {
          setIsResolvingFullReport(false);
        }
      }
    };

    void resolveFullReport();

    return () => {
      cancelled = true;
    };
  }, [
    hasAccountOwnerAccess,
    id,
    isClient,
    isResolvingFullReport,
    reportData,
    requestedView,
    runtimeAccessKey,
  ]);

  const canViewFullReport = Boolean(reportData);
  const canOpenChat = canViewFullReport && (hasStoredOwnerSession || hasAccountOwnerAccess);
  const ownerLockMessage =
    ownerResolutionState === 'denied'
      ? isEn
          ? 'This note is now linked to the owner account. Sign in with that account to open the private note again.'
        : '이 정리는 이제 소유자 계정에 연결되어 있어요. 같은 계정으로 로그인해야 비공개 기록을 다시 열 수 있습니다.'
      : ownerResolutionState === 'error'
        ? isEn
          ? 'We could not restore the private report right now. Try again from the original device or reopen the email link once more.'
          : '지금은 비공개 리포트를 복구하지 못했어요. 원래 보던 기기에서 다시 열거나 메일 링크를 한 번 더 눌러주세요.'
        : isEn
          ? 'The detailed note remains private to the owner. Open it from the original device or sign in with the owner account.'
          : '자세한 기록은 소유자에게만 공개됩니다. 원래 보던 기기에서 열거나 소유자 계정으로 로그인해 주세요.';

  if (!isClient) {
    return <div className="min-h-screen bg-[#040612]" />;
  }

  if (isResolvingFullReport && !reportData) {
    return (
      <main className="min-h-screen relative overflow-hidden bg-[#040612] text-white font-outfit">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_28%),linear-gradient(180deg,#040612_0%,#070b19_44%,#0b0f1f_100%)]" />
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-20">
          <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
            <div className="text-[11px] uppercase tracking-[0.24em] text-violet-200/80">
              {isEn ? 'Restoring private reading' : '비공개 리딩 복구 중'}
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
              {isEn ? 'Opening your detailed note...' : '자세한 기록을 불러오는 중이에요'}
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/68">
              {isEn
                ? 'We are checking the original owner session before showing the report.'
                : '원래 보던 기기 또는 소유자 계정인지 확인한 뒤 리포트를 보여드릴게요.'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (canViewFullReport && reportData) {
    return (
      <main className="min-h-screen relative overflow-hidden text-foreground selection:bg-star-yellow selection:text-deep-navy font-outfit">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_26%),linear-gradient(180deg,#040612_0%,#070b19_44%,#0b0f1f_100%)]" />

        <div className="fixed top-0 left-0 right-0 z-40 px-4 py-4 md:px-8 md:py-6 flex items-center justify-between pointer-events-none">
          <Link href="/" className="pointer-events-auto flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </div>
          </Link>
        </div>

        <div className="pt-24 pb-20">
          <PremiumReport
            report={reportData}
            metadata={metadata ?? undefined}
            language={shareSummary.language}
            isPremium={metadata?.isPremium || true}
            shareUrl={shareUrl}
          />
          {canOpenChat ? (
            <div className="container mx-auto px-4 mt-12 mb-20">
              <ChatInterface readingId={id} />
            </div>
          ) : (
            <div className="container mx-auto px-4 mt-12 mb-20">
              <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-white/72 backdrop-blur-xl md:p-8">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                  {isEn ? 'Private follow-up' : '후속 질문 안내'}
                </div>
                <p className="mt-3">
                  {isEn
                    ? 'This link opens the detailed note, but follow-up chat remains available only in the original session or the owner account.'
                    : '이 링크에서는 자세한 기록까지 볼 수 있지만, 후속 질문은 원래 보던 기기나 소유자 계정에서만 이어집니다.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#040612] text-white font-outfit">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_28%),linear-gradient(180deg,#040612_0%,#070b19_44%,#0b0f1f_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:36px_36px]" />

      <section className="relative mx-auto max-w-6xl px-4 pt-8 pb-14 md:px-8 md:pt-12 md:pb-20">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-[background-color,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
          >
            <ChevronLeft className="h-4 w-4" />
            Decision Note
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-amber-200">
            <Stars className="h-4 w-4" />
            Shared Reading
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <motion.div
              initial={sectionReveal.initial}
              animate={sectionReveal.animate}
              transition={sectionTransition}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-[0_30px_120px_rgba(15,23,42,0.35)] md:p-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-violet-200">
                <Orbit className="h-4 w-4" />
                {isEn ? 'Decision Snapshot' : '결정 스냅샷'}
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-0.04em] text-white md:text-6xl">
                {shareSummary.title}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
                {shareSummary.description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <motion.div
                  initial={sectionReveal.initial}
                  animate={sectionReveal.animate}
                  transition={{ ...sectionTransition, delay: 0.05 }}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-amber-300/25 hover:bg-black/30"
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                    {isEn ? 'Trust Score' : '신뢰도'}
                  </div>
                  <div className="mt-3 text-3xl font-black text-amber-300">{trustPercent}</div>
                </motion.div>

                <motion.div
                  initial={sectionReveal.initial}
                  animate={sectionReveal.animate}
                  transition={{ ...sectionTransition, delay: 0.1 }}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-violet-300/25 hover:bg-black/30"
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                    {isEn ? 'Signature Card' : '핵심 카드'}
                  </div>
                  <div className="mt-3 text-xl font-bold text-white">{shareSummary.mainCardName}</div>
                </motion.div>

                <motion.div
                  initial={sectionReveal.initial}
                  animate={sectionReveal.animate}
                  transition={{ ...sectionTransition, delay: 0.15 }}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-black/30"
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                    {isEn ? 'Reading Stack' : '해석 스택'}
                  </div>
                  <div className="mt-3 text-sm font-semibold text-white/80">
                    Saju + Astrology + Tarot
                  </div>
                </motion.div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={startHref}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_18px_40px_rgba(245,158,11,0.18)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_48px_rgba(245,158,11,0.28)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80"
                >
                  <Sparkles className="h-5 w-5" />
                  {isEn ? 'Start My Note' : '내 선택 정리하기'}
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/72 transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.07]">
                  <Lock className="h-4 w-4" />
                  {ownerLockMessage}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={sectionReveal.initial}
              animate={sectionReveal.animate}
              transition={{ ...sectionTransition, delay: 0.12 }}
              className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-6 backdrop-blur-xl md:p-8"
            >
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                {isEn ? 'Why it converts' : '왜 전환되는가'}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm leading-7 text-white/74 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/15">
                  <strong className="block text-white mb-1">{isEn ? 'Not generic advice copy' : '클리셰 조언이 아님'}</strong>
                  {isEn ? 'The reading is built from three symbolic systems, not one shallow summary.' : '하나의 얕은 요약이 아니라 세 가지 상징 체계를 교차 해석합니다.'}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm leading-7 text-white/74 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/15">
                  <strong className="block text-white mb-1">{isEn ? 'Action-oriented' : '행동 중심 해석'}</strong>
                  {isEn ? 'It tells you what to watch, what to avoid, and what timing matters next.' : '무엇을 조심하고, 무엇을 밀고, 어느 타이밍을 봐야 하는지까지 연결합니다.'}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm leading-7 text-white/74 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/15">
                  <strong className="block text-white mb-1">{isEn ? 'Conversation continues' : '대화가 이어짐'}</strong>
                  {isEn ? 'After unlocking, the note flows straight into follow-up chat.' : '결과를 열면 끝이 아니라 후속 질문으로 바로 이어집니다.'}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={sectionReveal.initial}
            animate={sectionReveal.animate}
            transition={{ ...sectionTransition, delay: 0.18 }}
            className="space-y-6 lg:sticky lg:top-8"
          >
            <ShareCard
              shareUrl={shareUrl}
              readingId={id}
              trustScore={shareSummary.trustScore}
              mainCardName={shareSummary.mainCardName}
              className="p-6 md:p-7"
            />

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/15">
              <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                {isEn ? 'What opens after payment' : '결제 후 열리는 내용'}
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-white/72">
                <li>{isEn ? 'Deep energy analysis across love, work, and money' : '연애, 일, 재물 전반의 심층 에너지 분석'}</li>
                <li>{isEn ? 'Detailed Saju and astrology breakdown' : '사주와 점성술의 상세 해석'}</li>
                <li>{isEn ? 'Follow-up conversation for edge cases' : '엣지 케이스까지 이어지는 후속 질문'}</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
