'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import Link from 'next/link';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasTrackedLandingView = useRef(false);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
    const [lang, setLang] = useState<'ko' | 'en'>('en');

    const [isMobile, setIsMobile] = useState(true); // Default to true (safe/fast) to prevent hydration mismatch with mobile-first approach

    useEffect(() => {
        const savedLang = localStorage.getItem('user_language');
        const initialLang = savedLang === 'ko' || savedLang === 'en' ? savedLang : (navigator.language.includes('ko') ? 'ko' : 'en');
        setLang(initialLang);

        if (!hasTrackedLandingView.current) {
            hasTrackedLandingView.current = true;
            void trackClientGrowthEvent({
                event: 'landing_view',
                source: 'landing_page_hero',
                language: initialLang,
            });
        }

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkMobile();

        // Listener
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const trustBadges = lang === 'ko'
        ? ['결정과 타이밍 리딩', '전문 오라클 가이드', '첫 리딩 무료']
        : ['Decision Timing Reading', 'Specialist Oracle Guide', 'Free First Reading'];
    const decisionSignals = lang === 'ko'
        ? ['관계', '커리어', '재물', '타이밍']
        : ['Relationship', 'Career', 'Wealth', 'Timing'];

    return (
        <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-void">
            {/* Background: Hybrid Engine (Video on Mobile, Shader on Desktop) */}
            <div className="absolute inset-0 z-0 opacity-40">
                {isMobile ? (
                    <div className="absolute inset-0 bg-gradient-to-b from-void via-[#1a1230] to-void">
                        {/* Fallback Image/Video can go here. For now, a high-quality CSS gradient that mimics the shader. */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,14,14,0.3)_0%,transparent_70%)]" />
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.15)_0%,transparent_60%)]" />
                    </div>
                ) : (
                    <ShaderGradientCanvas
                        pixelDensity={0.6}
                        fov={45}
                    >
                        <ShaderGradient
                            control='props'
                            color1="#1a1230"  // Deep Cosmic Purple
                            color2="#4A0E0E"  // Deep Mars Red
                            color3="#D4AF37"  // Gold Accent
                            animate="on"
                            uSpeed={0.3}
                            uStrength={2.0}
                            uDensity={1.5}
                        />
                    </ShaderGradientCanvas>
                )}
            </div>

            {/* Content */}
            <motion.div
                style={{ opacity, scale, y }}
                className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-16 pt-28 text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-xl"
                >
                    <span className="text-[10px] uppercase tracking-[0.34em] text-acc-gold">
                        Oracle Path
                    </span>
                    <span className="hidden h-3 w-px bg-white/10 sm:block" />
                    <span className="text-[11px] text-white/62">
                        {lang === 'ko'
                            ? '관계 · 커리어 · 재물 · 타이밍 오라클'
                            : 'Relationship · Career · Wealth · Timing Oracle'}
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    className="mb-6 max-w-5xl break-keep font-sans text-3xl font-bold leading-tight tracking-tight text-starlight sm:text-5xl md:text-6xl lg:text-7xl"
                >
                    {lang === 'ko' ? (
                        <>
                            지금 움직여도 될까? <br className="md:hidden" />
                            무엇을 먼저 <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">선택해야 할까?</span>
                        </>
                    ) : (
                        <>
                            WHAT SHOULD <br className="md:hidden" />
                            YOU MOVE ON <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">NEXT?</span>
                        </>
                    )}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="mb-8 max-w-3xl break-keep text-lg font-light leading-relaxed text-moonlight md:text-2xl"
                >
                    {lang === 'ko' ? (
                        <>
                            관계, 커리어, 재물, 일상의 흐름까지. <br className="hidden md:block" />
                            사주와 타로, 점성 데이터를 교차해 읽는 1:1 오라클이 <br className="md:hidden" />
                            지금 가장 중요한 선택의 <span className="text-white font-medium">타이밍과 다음 행동의 창</span>을 제안합니다.
                        </>
                    ) : (
                        <>
                            &quot;<span className="text-white font-medium">Your next move</span> becomes clearer when timing, context, and signal line up.&quot;<br />
                            <span className="text-sm md:text-base text-dim mt-4 block font-sans">
                                A 1:1 oracle guide grounded in saju, tarot, astrology, and AI calculation <br className="md:hidden" />
                                reveals the timing and direction behind your next decision.
                            </span>
                        </>
                    )}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="flex flex-wrap justify-center gap-3"
                >
                    {trustBadges.map((badge) => (
                        <div key={badge} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
                            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-acc-gold md:text-xs">
                                {badge}
                            </span>
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                    className="mt-5 flex flex-wrap justify-center gap-2"
                >
                    {decisionSignals.map((signal) => (
                        <div
                            key={signal}
                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/62 backdrop-blur-md"
                        >
                            {signal}
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="mt-10 flex flex-col items-center gap-4"
                >
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <Link
                            href="/start?reset=true"
                            className="group relative inline-flex min-h-[52px] items-center justify-center rounded-full bg-gradient-to-r from-acc-gold via-amber-300 to-acc-gold bg-[length:200%_auto] px-8 py-4 text-lg font-bold tracking-tight text-deep-navy shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {lang === 'ko' ? '오라클 리딩 시작하기' : 'Start Your Oracle Reading'}
                                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </span>
                        </Link>

                        <Link
                            href="/daily"
                            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-medium uppercase tracking-[0.22em] text-white/82 transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
                        >
                            {lang === 'ko' ? '오늘의 행동 창 보기' : 'Explore Daily Signals'}
                        </Link>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur-xl">
                        <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">
                            {lang === 'ko' ? 'First Session' : 'First Session'}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/72">
                            {lang === 'ko'
                                ? '무료 리딩은 로그인 없이 바로 열리고, 고민 영역을 고른 뒤 더 깊은 결정 리딩으로 자연스럽게 이어집니다.'
                                : 'Your free reading opens instantly without login, then extends into a deeper decision reading if you want to go further.'}
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* Scroll Trigger */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
            >
                <span className="text-[10px] tracking-[0.3em] text-moonlight uppercase">Scroll to Enter</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0 animate-pulse" />
            </motion.div>
        </section>
    );
}
