'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Lock, Orbit, Sparkles, Stars } from 'lucide-react';

import { PremiumReport } from '@/components/reading/premium-report';
import { ChatInterface } from '@/components/oracle-chat/ChatInterface';
import { ShareCard } from '@/components/reading/share-card';

interface SharedPageClientProps {
  id: string;
  reportData: any;
  metadata: any;
  shareSummary: {
    title: string;
    description: string;
    trustScore: number;
    mainCardName: string;
    language: 'ko' | 'en';
  };
  isServerOwner?: boolean;
}

const sectionReveal = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

const sectionTransition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function SharedPageClient({
  id,
  reportData,
  metadata,
  shareSummary,
  isServerOwner,
}: SharedPageClientProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if the user is the owner via server-side auth or client-side session storage (fallback for guest buyers)
    const storedId = sessionStorage.getItem('pending_reading_id');
    const paymentCompleted = sessionStorage.getItem('payment_completed') === 'true';
    const isClientOwner = Boolean(storedId && storedId === id && paymentCompleted);
    
    setIsOwner(Boolean(isServerOwner || isClientOwner));
    setIsReady(true);
  }, [id, isServerOwner]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return `${process.env.NEXT_PUBLIC_APP_URL || 'https://cosmicpath.app'}/share/${id}`;
    }
    return `${window.location.origin}/share/${id}`;
  }, [id]);

  const isEn = shareSummary.language === 'en';
  const trustPercent = Math.round((shareSummary.trustScore / 5) * 100);

  if (!isReady) {
    return <div className="min-h-screen bg-[#040612]" />;
  }

  if (isOwner) {
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
            metadata={metadata}
            language={shareSummary.language}
            isPremium={metadata?.isPremium || true}
            shareUrl={shareUrl}
          />
          <div className="container mx-auto px-4 mt-12 mb-20">
            <ChatInterface readingId={id} />
          </div>
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
            CosmicPath
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
                {isEn ? 'Oracle Snapshot' : '오라클 스냅샷'}
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
                  href="/start"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_18px_40px_rgba(245,158,11,0.18)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_48px_rgba(245,158,11,0.28)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80"
                >
                  <Sparkles className="h-5 w-5" />
                  {isEn ? 'Reveal My Destiny' : '내 운명 확인하기'}
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/72 transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.07]">
                  <Lock className="h-4 w-4" />
                  {isEn ? 'Full report remains private to the owner' : '전체 리포트는 소유자에게만 공개됩니다'}
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
                  <strong className="block text-white mb-1">{isEn ? 'Not generic fortune copy' : '클리셰 운세가 아님'}</strong>
                  {isEn ? 'The reading is built from three symbolic systems, not one shallow summary.' : '하나의 얕은 요약이 아니라 세 가지 상징 체계를 교차 해석합니다.'}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm leading-7 text-white/74 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/15">
                  <strong className="block text-white mb-1">{isEn ? 'Action-oriented' : '행동 중심 해석'}</strong>
                  {isEn ? 'It tells you what to watch, what to avoid, and what timing matters next.' : '무엇을 조심하고, 무엇을 밀고, 어느 타이밍을 봐야 하는지까지 연결합니다.'}
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm leading-7 text-white/74 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/15">
                  <strong className="block text-white mb-1">{isEn ? 'Conversation continues' : '대화가 이어짐'}</strong>
                  {isEn ? 'After unlocking, the report flows straight into Oracle Chat.' : '결과를 열면 끝이 아니라 Oracle Chat으로 바로 이어집니다.'}
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
                <li>{isEn ? 'Oracle follow-up conversation for edge cases' : '엣지 케이스까지 이어지는 오라클 후속 질문'}</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
