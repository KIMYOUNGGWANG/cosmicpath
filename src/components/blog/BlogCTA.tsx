import Link from 'next/link';

interface BlogCTAProps {
    compact?: boolean;
}

export function BlogCTA({ compact = false }: BlogCTAProps) {
    return (
        <section
            className={`rounded-[32px] border border-[#D4AF37]/20 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_38%),linear-gradient(145deg,rgba(11,14,24,0.96),rgba(16,21,37,0.96))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] ${compact ? '' : 'md:p-10'}`}
        >
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="max-w-2xl space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F4D88A]">
                        CosmicPath Signal
                    </p>
                    <h2 className="text-2xl font-semibold leading-tight text-white md:text-3xl">
                        읽고 끝내지 말고, 지금 바로 내 사주 무료 분석으로 이어가세요.
                    </h2>
                    <p className="text-sm leading-7 text-white/70 md:text-base">
                        블로그에서 이해한 이론을 실제 내 데이터에 적용하면 해석의 깊이가 완전히 달라집니다.
                        CosmicPath는 사주, 점성술, 타로를 한 흐름으로 연결해 바로 결과를 보여줍니다.
                    </p>
                </div>

                <Link
                    href="/start?reset=true"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0A0D16] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#E7C867]"
                >
                    무료 사주 분석 받기 →
                </Link>
            </div>
        </section>
    );
}
