import type { Metadata } from 'next';

import { Navigation } from '@/components/landing/Navigation';
import { DailySealedWidget } from '@/components/daily/DailySealedWidget';
import { StructuredData } from '@/components/seo/StructuredData';

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
        url: 'https://cosmicpath.app/daily',
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

export default function DailyPage() {
    const structuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: '오늘의 운세 & 타로',
            url: 'https://cosmicpath.app/daily',
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
        <main className="w-full min-h-screen bg-void text-starlight selection:bg-acc-gold selection:text-bg-void flex flex-col">
            <StructuredData data={structuredData} />
            <Navigation />

            <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 cosmic-dust opacity-30 pointer-events-none" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-acc-gold/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute right-[10%] top-[18%] h-72 w-72 rounded-full bg-cyan-400/5 blur-[120px] pointer-events-none" />

                <div className="z-10 w-full max-w-4xl">
                    <header className="text-center mb-12">
                        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
                            <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-acc-gold">
                                Daily Ritual
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-starlight/60">
                                Midnight Reset
                            </span>
                            <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                                Fortune + Tarot
                            </span>
                        </div>

                        <h1 className="mb-4 font-cinzel text-4xl text-transparent bg-clip-text bg-gradient-to-b from-acc-gold via-white to-white/50 md:text-6xl">
                            오늘의 운세 & 타로
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg leading-8 text-starlight/60">
                            생년월일 기반으로 오늘의 에너지와 한 장의 타로 메시지를 확인하세요.
                        </p>
                    </header>

                    <DailySealedWidget />
                </div>
            </div>
        </main>
    );
}
