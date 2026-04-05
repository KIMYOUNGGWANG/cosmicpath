import Link from 'next/link';

import { HeroScene } from '@/components/landing/HeroScene';

interface HeroSectionProps {
    language: 'ko' | 'en';
}

export function HeroSection({ language }: HeroSectionProps) {
    const isKo = language === 'ko';
    const trustBadges = isKo
        ? ['결정과 타이밍 리딩', '전문 오라클 가이드', '첫 리딩 무료']
        : ['Decision Timing Reading', 'Specialist Oracle Guide', 'Free First Reading'];
    const decisionSignals = isKo
        ? ['관계', '커리어', '재물', '타이밍']
        : ['Relationship', 'Career', 'Wealth', 'Timing'];

    return (
        <HeroScene language={language}>
            <div className="mx-auto flex max-w-5xl flex-col items-center">
                <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-xl">
                    <span className="text-[10px] uppercase tracking-[0.34em] text-acc-gold">
                        Oracle Path
                    </span>
                    <span className="hidden h-3 w-px bg-white/10 sm:block" />
                    <span className="text-[11px] text-white/62">
                        {isKo
                            ? '관계 · 커리어 · 재물 · 타이밍 오라클'
                            : 'Relationship · Career · Wealth · Timing Oracle'}
                    </span>
                </div>

                <h1 className="mb-6 max-w-5xl break-keep font-sans text-3xl font-bold leading-tight tracking-tight text-starlight sm:text-5xl md:text-6xl lg:text-7xl">
                    {isKo ? (
                        <>
                            지금 움직여도 될까? <br className="md:hidden" />
                            무엇을 먼저 <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">선택해야 할까?</span>
                        </>
                    ) : (
                        <>
                            SHOULD YOU MOVE NOW, <br className="md:hidden" />
                            OR WAIT FOR A <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">BETTER WINDOW?</span>
                        </>
                    )}
                </h1>

                <p className="mb-8 max-w-3xl break-keep text-lg font-light leading-relaxed text-moonlight md:text-2xl">
                    {isKo ? (
                        <>
                            관계, 커리어, 재물, 일상의 흐름까지. <br className="hidden md:block" />
                            사주와 타로, 점성 데이터를 교차해 읽는 1:1 오라클이 <br className="md:hidden" />
                            지금 가장 중요한 선택의 <span className="font-medium text-white">타이밍과 다음 행동의 창</span>을 제안합니다.
                        </>
                    ) : (
                        <>
                            A 1:1 oracle grounded in saju, tarot, and astrology cross-checks <br className="hidden md:block" />
                            helps you read the timing, risk, and next move behind the decision in front of you.
                        </>
                    )}
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                    {trustBadges.map((badge) => (
                        <div
                            key={badge}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
                        >
                            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-acc-gold md:text-xs">
                                {badge}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {decisionSignals.map((signal) => (
                        <div
                            key={signal}
                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/62 backdrop-blur-md"
                        >
                            {signal}
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
                                {isKo ? '오라클 리딩 시작하기' : 'Start Your Oracle Reading'}
                                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </Link>

                        <Link
                            href="/daily"
                            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-medium uppercase tracking-[0.22em] text-white/82 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
                        >
                            {isKo ? '오늘의 행동 창 보기' : 'Explore Daily Signals'}
                        </Link>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur-xl">
                        <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">
                            {isKo ? 'First Session' : 'First Session'}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/72">
                            {isKo
                                ? '무료 리딩은 바로 열리고, 고민 영역을 고른 뒤 더 깊은 결정 리딩으로 자연스럽게 이어집니다.'
                                : 'Your first reading opens right away, then extends into a deeper decision path if you want more clarity.'}
                        </p>
                    </div>
                </div>
            </div>
        </HeroScene>
    );
}
