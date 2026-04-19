import Link from 'next/link';

import { GrowthTrackedLink } from '@/components/common/GrowthTracking';
import { HeroScene } from '@/components/landing/HeroScene';
import { getLandingVariant } from '@/lib/language-preference';

interface HeroSectionProps {
    language: 'ko' | 'en';
}

export function HeroSection({ language }: HeroSectionProps) {
    const isKo = language === 'ko';
    const landingVariant = getLandingVariant(language);
    const decisionSignals = isKo
        ? ['관계', '커리어', '재물', '타이밍']
        : ['Relationship', 'Career', 'Wealth', 'Timing'];

    return (
        <HeroScene language={language}>
            <div className="mx-auto flex max-w-5xl flex-col items-center">
                <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-xl">
                    <span className="text-[11px] text-white/62">
                        {isKo
                            ? '사주 · 점성술 · 타로 통합 분석'
                            : 'Saju · Astrology · Tarot — Cross Analysis'}
                    </span>
                </div>

                <h1 className="mb-6 max-w-5xl break-keep font-sans text-3xl font-bold leading-tight tracking-tight text-starlight sm:text-5xl md:text-6xl lg:text-7xl">
                    {isKo ? (
                        <>
                            퇴사해도 될까, 고백해도 될까 — <br className="md:hidden" />
                            <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">태어난 시간으로 분석합니다.</span>
                        </>
                    ) : (
                        <>
                            Should I quit? Should I go for it? <br className="md:hidden" />
                            <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">We read the timing.</span>
                        </>
                    )}
                </h1>

                <p className="mb-8 max-w-3xl break-keep text-base font-light leading-relaxed text-moonlight sm:text-lg md:text-2xl">
                    {isKo ? (
                        <>
                            세 가지가 같은 답을 가리킬 때만 —{' '}
                            <span className="font-medium text-white">지금 움직여도 된다고 알려드립니다.</span>
                        </>
                    ) : (
                        <>
                            When Saju, Astrology, and Tarot all agree —{' '}
                            <span className="font-medium text-white">that&apos;s when we tell you to move.</span>
                        </>
                    )}
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                    {decisionSignals.map((signal) => (
                        <div
                            key={signal}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
                        >
                            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-acc-gold md:text-xs">
                                {signal}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <Link
                            href="/start?reset=true"
                            className="group relative inline-flex min-h-[52px] items-center justify-center rounded-full bg-gradient-to-r from-acc-gold via-amber-300 to-acc-gold bg-[length:200%_auto] px-8 py-4 text-lg font-bold tracking-tight text-deep-navy shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isKo ? '내 타이밍 알아보기' : 'Start Your Oracle Reading'}
                                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </Link>

                        <Link
                            href="/daily"
                            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-medium uppercase tracking-[0.22em] text-white/82 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
                        >
                            {isKo ? '오늘 흐름 보기' : 'Explore Daily Signals'}
                        </Link>
                    </div>

                    {isKo ? (
                        <GrowthTrackedLink
                            href="/career/uncertainty"
                            trackingEvent={{
                                event: 'career_uncertainty_entry_clicked',
                                source: 'landing_hero',
                                step: 'secondary_entry',
                                language,
                                context: 'career',
                                metadata: {
                                    landingVariant,
                                },
                            }}
                            className="hidden sm:inline-flex min-h-11 items-center justify-center rounded-full border border-acc-gold/20 bg-acc-gold/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-acc-gold transition-colors hover:border-acc-gold/40 hover:bg-acc-gold/16 hover:text-[#ffe39d]"
                        >
                            이직 고민이라면 커리어 리딩부터 보기
                        </GrowthTrackedLink>
                    ) : null}

                    {!isKo ? (
                        <GrowthTrackedLink
                            href="/guides"
                            trackingEvent={{
                                event: 'guide_cta_clicked',
                                source: 'landing_hero',
                                step: 'cta',
                                language,
                                context: 'guide',
                                metadata: {
                                    landingVariant,
                                    ctaLocation: 'hero_footer',
                                    ctaTarget: 'guides_hub',
                                },
                            }}
                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70 transition-colors hover:border-white/24 hover:bg-white/[0.06] hover:text-white"
                        >
                            New to Korean Saju? Read the Starter Guides
                        </GrowthTrackedLink>
                    ) : null}
                </div>
            </div>
        </HeroScene>
    );
}
