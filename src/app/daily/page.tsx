import type { Metadata } from 'next';
import Link from 'next/link';

import { ProductShell } from '@/components/common/ProductShell';
import { DailySealedWidget } from '@/components/daily/DailySealedWidget';
import { StructuredData } from '@/components/seo/StructuredData';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    getOracleChatDailyHook,
    getOracleChatHistoryForUser,
    type OracleChatDomain,
} from '@/lib/oracle-chat';
import {
    getDailyLinkedLabel,
    parseDailyLinkedOracleContext,
} from '@/lib/daily/daily-linked-context';

export const metadata: Metadata = {
    title: '오늘의 운세 & 타로 | CosmicPath',
    description: '생년월일 기반 오늘의 운세와 데일리 타로를 확인하고 오늘의 흐름과 행동 가이드를 받아보세요.',
    keywords: ['오늘의 운세', '데일리 타로', '무료 타로', '생년월일 운세', '오늘의 타로', '사주 운세'],
    alternates: {
        canonical: '/daily',
    },
    openGraph: {
        title: '오늘의 운세 & 타로 | CosmicPath',
        description: '생년월일 기반 오늘의 운세와 데일리 타로를 확인하고 오늘의 흐름과 행동 가이드를 받아보세요.',
        url: 'https://www.cosmicpath.app/daily',
        type: 'website',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: '오늘의 운세 & 타로 | CosmicPath',
        description: '매일 자정 갱신되는 오늘의 운세와 타로 리추얼.',
        images: ['/og-image.png'],
    },
};

export default async function DailyPage() {
    const session = await auth();
    const userId = session?.user?.id;
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
    const oracleChatHistory = userId
        ? await getOracleChatHistoryForUser({
            userId,
            limit: 1,
        })
        : null;
    const oracleChatHook =
        userId && oracleChatHistory?.roomId
            ? await getOracleChatDailyHook({
                userId,
                roomId: oracleChatHistory.roomId,
            })
            : null;
    const oracleChatDomainLabel: Record<OracleChatDomain, string> = {
        career: '커리어',
        love: '관계',
        wealth: '재물',
        general: '일상',
    };
    const oracleChatLabel = oracleChatHistory?.domain
        ? oracleChatDomainLabel[oracleChatHistory.domain]
        : '결정';

    const structuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: '오늘의 운세 & 타로',
            url: 'https://www.cosmicpath.app/daily',
            description: '생년월일 기반 오늘의 운세와 데일리 타로를 확인하는 페이지.',
            inLanguage: 'ko-KR',
            about: ['오늘의 운세', '데일리 타로', '사주 운세'],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: '오늘의 운세는 어떻게 계산되나요?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: '생년월일을 기준으로 당일 에너지 흐름과 고정 시드를 결합해 자정까지 유지되는 운세와 타로 결과를 제공합니다.',
                    },
                },
                {
                    '@type': 'Question',
                    name: '데일리 타로는 매일 바뀌나요?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: '네. 결과는 날짜 기준으로 매일 갱신되며 같은 날에는 동일한 생년월일에 대해 일관된 결과를 보여줍니다.',
                    },
                },
            ],
        },
    ];

    return (
        <ProductShell>
            <StructuredData data={structuredData} />

            <div className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
                <div className="absolute inset-0 cosmic-dust opacity-30 pointer-events-none" />
                <div className="absolute left-[8%] top-16 h-56 w-56 rounded-full bg-acc-gold/10 blur-[110px] pointer-events-none" />
                <div className="absolute right-[8%] top-24 h-48 w-48 rounded-full bg-cyan-300/10 blur-[120px] pointer-events-none" />

                <div className="relative mx-auto w-full max-w-5xl">
                    <header className="mb-10 rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.1),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 text-center shadow-[0_24px_70px_rgba(2,6,23,0.24)] backdrop-blur-xl sm:px-8 sm:py-9">
                        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-acc-gold">
                                Daily Ritual
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-starlight/60">
                                Midnight Reset
                            </span>
                            {linkedLabel ? (
                                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-100">
                                    Linked to {linkedLabel}
                                </span>
                            ) : null}
                        </div>

                        <h1 className="mb-3 font-cinzel text-3xl text-transparent bg-clip-text bg-gradient-to-b from-acc-gold via-white to-white/55 sm:text-4xl md:text-5xl">
                            오늘의 운세 & 타로
                        </h1>
                        <p className="mx-auto max-w-2xl text-sm leading-7 text-starlight/62 sm:text-base">
                            {linkedOracleContext?.question
                                ? `최근 오라클 질문 "${linkedOracleContext.question}"과 이어서, 오늘의 흐름과 한 장의 타로 메시지를 다시 읽어보세요.`
                                : '생년월일을 기준으로 오늘의 흐름과 한 장의 타로 메시지를 확인하세요.'}
                        </p>
                        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href="/daily/tarot"
                                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                            >
                                오늘의 타로 전용 페이지
                            </Link>
                            <Link
                                href="/start?reset=true"
                                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D479] px-5 py-2 text-sm font-semibold text-[#0A0D16] transition-colors hover:bg-[#E7C867]"
                            >
                                결정 질문 다시 열기
                            </Link>
                        </div>
                    </header>

                    <DailySealedWidget linkedOracleContext={linkedOracleContext} />

                    {oracleChatHistory?.roomId && oracleChatHook ? (
                        <section className="mt-8 rounded-[30px] border border-cyan-300/15 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-6 shadow-[0_22px_70px_rgba(8,47,73,0.24)] backdrop-blur-xl sm:px-7">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                <div className="max-w-2xl">
                                    <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                                        Grand Oracle Chat
                                    </div>
                                    <h2 className="mt-3 font-cinzel text-2xl text-white sm:text-3xl">
                                        오늘은 {oracleChatLabel} 질문을 다시 이어볼 타이밍입니다
                                    </h2>
                                    <p className="mt-3 text-sm leading-7 text-starlight/72 sm:text-base">
                                        {oracleChatHook.hookMessage}
                                    </p>
                                    {oracleChatHook.basedOn.lastMessageSummary ? (
                                        <p className="mt-3 text-xs leading-6 text-cyan-100/70">
                                            최근 질문 요약: {oracleChatHook.basedOn.lastMessageSummary}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                                    <Link
                                        href="/oracle-chat"
                                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-sky-300 px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01]"
                                    >
                                        오라클 챗 다시 열기
                                    </Link>
                                    <p className="text-xs text-starlight/55">
                                        최신 대화 thread와 daily hook 문맥으로 이어집니다.
                                    </p>
                                </div>
                            </div>
                        </section>
                    ) : null}
                </div>
            </div>
        </ProductShell>
    );
}
