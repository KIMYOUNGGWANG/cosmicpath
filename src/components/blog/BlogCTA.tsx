'use client';

import Link from 'next/link';

import { GrowthTrackedLink } from '@/components/common/GrowthTracking';

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
                        이론은 충분해요. 이제 내 사주로 직접 확인해볼까요?
                    </h2>
                    <p className="text-sm leading-7 text-white/70 md:text-base">
                        생년월일만 넣으면, 사주 · 별자리 · 타로를 한번에 읽어드려요.
                        내 데이터로 보면 해석이 완전히 달라져요.
                    </p>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                    <Link
                        href="/start?reset=true"
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0A0D16] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#E7C867]"
                    >
                        무료 사주 분석 받기 →
                    </Link>

                    <GrowthTrackedLink
                        href="/career/uncertainty"
                        trackingEvent={{
                            event: 'career_uncertainty_entry_clicked',
                            source: compact ? 'blog_cta_compact' : 'blog_cta',
                            step: compact ? 'sidebar_cta' : 'footer_cta',
                            language: 'ko',
                            context: 'career',
                        }}
                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition-colors duration-200 hover:border-[#D4AF37]/35 hover:text-[#F4D88A]"
                    >
                        커리어가 막막하다면? 리딩 먼저 해봐요
                    </GrowthTrackedLink>
                </div>
            </div>
        </section>
    );
}
