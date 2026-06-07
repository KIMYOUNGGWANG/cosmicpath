import type { Metadata } from 'next';
import Link from 'next/link';

import { ProductShell } from '@/components/common/ProductShell';
import { DailyTarotExperience } from '@/components/daily/DailyTarotExperience';
import { StructuredData } from '@/components/seo/StructuredData';
import { auth } from '@/lib/auth';
import {
    getDailyLinkedLabel,
    parseDailyLinkedOracleContext,
} from '@/lib/daily/daily-linked-context';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
    title: '오늘의 타로 | CosmicPath',
    description: '생년월일 기반으로 오늘의 타로 카드를 확인하고, Pro에서는 카드별 행동 가이드까지 확인하세요.',
    keywords: ['오늘의 타로', '데일리 타로', '무료 타로', '타로 리딩', '타로 카드'],
    alternates: {
        canonical: '/daily/tarot',
    },
    openGraph: {
        title: '오늘의 타로 | CosmicPath',
        description: '생년월일 기반으로 오늘의 타로 카드를 확인하고 오늘의 메시지를 읽어보세요.',
        url: 'https://www.cosmicpath.app/daily/tarot',
        type: 'website',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: '오늘의 타로 | CosmicPath',
        description: '자정까지 고정되는 오늘의 데일리 타로 카드.',
        images: ['/og-image.png'],
    },
};

export default async function DailyTarotPage() {
    const session = await auth();
    const latestReading = session?.user?.id
        ? await prisma.readingResult.findFirst({
              where: { userId: session.user.id },
              orderBy: { createdAt: 'desc' },
              select: {
                  id: true,
                  createdAt: true,
                  metadata: true,
                  data: true,
              },
          })
        : null;

    const linkedOracleContext = latestReading
        ? parseDailyLinkedOracleContext({
              readingId: latestReading.id,
              createdAt: latestReading.createdAt,
              metadata: latestReading.metadata,
              data: latestReading.data,
          })
        : null;
    const linkedLabel = linkedOracleContext ? getDailyLinkedLabel(linkedOracleContext, 'ko') : null;

    const structuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: '오늘의 타로',
            url: 'https://www.cosmicpath.app/daily/tarot',
            description: '생년월일 기반으로 오늘의 타로 카드를 확인하는 페이지.',
            inLanguage: 'ko-KR',
            about: ['오늘의 타로', '데일리 타로', '무료 타로'],
        },
    ];

    return (
        <ProductShell>
            <StructuredData data={structuredData} />

            <div className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
                <div className="absolute inset-0 cosmic-dust opacity-30 pointer-events-none" />
                <div className="absolute left-[10%] top-16 h-56 w-56 rounded-full bg-acc-gold/10 blur-[110px] pointer-events-none" />
                <div className="absolute right-[8%] top-28 h-48 w-48 rounded-full bg-fuchsia-300/10 blur-[120px] pointer-events-none" />

                <div className="relative mx-auto w-full max-w-5xl">
                    <header className="mb-10 rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.1),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 text-center shadow-[0_24px_70px_rgba(2,6,23,0.24)] backdrop-blur-xl sm:px-8 sm:py-9">
                        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-acc-gold">
                                Daily Tarot
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-starlight/60">
                                One Card Ritual
                            </span>
                            {linkedLabel ? (
                                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-100">
                                    Linked to {linkedLabel}
                                </span>
                            ) : null}
                        </div>

                        <h1 className="mb-3 font-cinzel text-3xl text-transparent bg-clip-text bg-gradient-to-b from-acc-gold via-white to-white/55 sm:text-4xl md:text-5xl">
                            오늘의 타로
                        </h1>
                        <p className="mx-auto max-w-2xl text-sm leading-7 text-starlight/62 sm:text-base">
                            {linkedOracleContext?.question
                                ? `최근 오라클 질문 "${linkedOracleContext.question}"과 이어서, 오늘의 카드가 지금의 흐름을 어떻게 압축하는지 확인해보세요.`
                                : '생년월일을 기준으로 오늘의 타로 카드 한 장을 고정해 읽고, 오늘의 흐름을 짧고 선명하게 확인하세요.'}
                        </p>

                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href="/daily"
                                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                            >
                                운세 + 타로 전체 리추얼 보기
                            </Link>
                            <Link
                                href="/start?reset=true"
                                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D479] px-5 py-2 text-sm font-semibold text-[#0A0D16] transition-colors hover:bg-[#E7C867]"
                            >
                                결정 질문 다시 열기
                            </Link>
                        </div>
                    </header>

                    <DailyTarotExperience linkedOracleContext={linkedOracleContext} />
                </div>
            </div>
        </ProductShell>
    );
}
