import type { Metadata } from 'next';
import Link from 'next/link';

const compatibilityOgImage =
    '/api/og/aura?variant=match&name=Cosmic%20Compatibility&colors=%23F59E0B%2C%23EC4899&keywords=chemistry%2Ctiming%2Cresonance&catchphrase=Share%20a%20compatibility%20reading%20built%20for%20relationship%20discovery.';

export const metadata: Metadata = {
    title: 'Cosmic Compatibility Readings | CosmicPath',
    description: 'Discover CosmicPath compatibility readings powered by Saju, astrology, and tarot.',
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: '/match/new',
    },
    openGraph: {
        title: 'Cosmic Compatibility Readings | CosmicPath',
        description: 'Explore relationship chemistry through Saju, astrology, and tarot on CosmicPath.',
        url: 'https://www.cosmicpath.app/match/new',
        type: 'website',
        images: [compatibilityOgImage],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cosmic Compatibility Readings | CosmicPath',
        description: 'Explore CosmicPath compatibility readings powered by Saju, astrology, and tarot.',
        images: [compatibilityOgImage],
    },
};

export default function MatchNewPage() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#04060d] px-4 py-20 text-starlight">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(64,96,196,0.12)_0%,transparent_70%)]" />
            <div className="relative z-10 w-full max-w-2xl space-y-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_32px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-12">
                <div className="space-y-4">
                    <p className="text-[11px] uppercase tracking-[0.34em] text-[#F4D88A]">
                        Match Lab Archive
                    </p>
                    <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                        궁합 실험실은
                        <br />
                        지금 보관 중입니다
                    </h1>
                    <p className="mx-auto max-w-xl text-base leading-8 text-white/70">
                        현재 CosmicPath의 메인 경험은 오라클 리딩과 데일리 루틴입니다.
                        궁합 생성 진입은 신규 확장 대신 보관 모드로 유지하고, 기존 공유 링크 흐름만 안정적으로 관리합니다.
                    </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 text-left">
                    <p className="text-sm leading-7 text-white/68">
                        새로운 궁합 링크 생성 대신, 지금은 결정과 타이밍 질문에 더 직접적인
                        <span className="text-white"> 메인 오라클 리딩</span>과
                        <span className="text-white"> 데일리 루틴</span>에 집중하는 것이 가장 빠른 경로입니다.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/start?reset=true"
                        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D479] px-6 py-3 text-sm font-semibold text-[#0A0D16] transition-colors hover:bg-[#E7C867]"
                    >
                        오라클 리딩 시작하기
                    </Link>
                    <Link
                        href="/daily"
                        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                    >
                        오늘의 운세 보기
                    </Link>
                </div>
            </div>
        </main>
    );
}
