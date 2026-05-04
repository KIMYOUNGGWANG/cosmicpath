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
            <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                {/* Left Column: Hero Message */}
                <div className="flex-1 flex flex-col items-start text-left z-10 w-full">
                    <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-xl">
                        <span className="text-[11px] text-white/62">
                            {isKo
                                ? '사주 · 점성술 · 타로 통합 분석'
                                : 'Saju · Astrology · Tarot — Cross Analysis'}
                        </span>
                    </div>

                    <h1 className="mb-6 max-w-3xl break-keep font-cinzel text-4xl font-bold leading-tight tracking-tight text-starlight sm:text-5xl md:text-6xl lg:text-[64px]">
                        {isKo ? (
                            <>
                                운세를 읽는 서비스가 아니라 <br className="hidden md:block" />
                                <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">결정을 받는 인터페이스</span>
                            </>
                        ) : (
                            <>
                                Not a fortune reading, but a <br className="hidden md:block" />
                                <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">Decision Interface</span>
                            </>
                        )}
                    </h1>

                    <p className="mb-10 max-w-2xl break-keep text-base font-light leading-relaxed text-moonlight sm:text-lg md:text-xl">
                        {isKo ? (
                            <>
                                지금 가장 망설이는 질문을 던져보세요. 사주, 타로, 점성술의 방대한 데이터를 분석하여 단 하나의 명확한 행동 지침을 제시합니다.
                            </>
                        ) : (
                            <>
                                Ask your most hesitant question. We analyze vast data from Saju, Tarot, and Astrology to provide a single, clear course of action.
                            </>
                        )}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
                        <Link
                            href="/start?reset=true"
                            className="group relative inline-flex w-full sm:w-auto min-h-[56px] items-center justify-center rounded-full bg-gradient-to-r from-acc-gold via-amber-300 to-acc-gold bg-[length:200%_auto] px-8 py-4 text-lg font-bold tracking-tight text-deep-navy shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isKo ? '지금 질문 시작하기' : 'Start Your Oracle Reading'}
                                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Live Preview & Guide (Hidden on Mobile/Tablet) */}
                <div className="hidden lg:flex flex-1 relative z-10 w-full items-center justify-center">
                    <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface-2/80 p-8 shadow-2xl backdrop-blur-xl">
                        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-acc-gold/20 blur-3xl"></div>
                        <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-saju-blue/20 blur-3xl"></div>
                        
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10">
                                    <span className="font-cinzel text-acc-gold text-lg">결</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-starlight">Oracle Guide</h3>
                                    <p className="text-xs text-moonlight">Analytic & Neutral</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-sm italic text-moonlight">
                                    "이번 제안은 기다리기보다 먼저 움직이는 편이 유리합니다."
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 rounded-lg bg-black/40 p-3">
                                        <div className="h-2 w-2 rounded-full bg-acc-gold"></div>
                                        <span className="text-xs font-medium text-starlight">Verdict: Proceed</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-black/40 p-3">
                                        <div className="h-2 w-2 rounded-full bg-saju-blue"></div>
                                        <span className="text-xs font-medium text-starlight">Action: Accept the offer</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HeroScene>
    );
}
