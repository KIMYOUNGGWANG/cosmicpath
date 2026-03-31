'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Clock3, MessageCircleHeart, Sparkles } from 'lucide-react';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';

const HeroShaderBackground = dynamic(
    () => import('@/components/landing/HeroShaderBackground').then((mod) => mod.HeroShaderBackground),
    { ssr: false }
);

function StaticHeroBackground() {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-void via-[#1a1230] to-void">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,14,14,0.3)_0%,transparent_70%)]" />
            <div className="absolute right-0 top-0 h-full w-full bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.15)_0%,transparent_60%)]" />
        </div>
    );
}

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
    const [isMobile, setIsMobile] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        const syncClientPreferences = () => {
            const savedLang = localStorage.getItem('user_language');
            setLang(
                savedLang === 'ko' || savedLang === 'en'
                    ? savedLang
                    : (navigator.language.includes('ko') ? 'ko' : 'en')
            );
            checkMobile();
            setIsHydrated(true);
        };

        const frameId = window.requestAnimationFrame(syncClientPreferences);

        window.addEventListener('resize', checkMobile);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    useEffect(() => {
        if (!isHydrated || hasTrackedLandingView.current) return;

        hasTrackedLandingView.current = true;
        void trackClientGrowthEvent({
            event: 'landing_view',
            source: 'landing_page_hero',
            language: lang,
        });
    }, [isHydrated, lang]);

    const isKorean = lang === 'ko';
    const primaryCopy = isKorean
        ? {
            eyebrow: '1:1 Decision Oracle',
            titleLead: '애매한 순간을',
            titleAccent: '지금 답해야 할 질문',
            titleTail: '으로 바꿔주는 오라클',
            description: '사주, 점성술, 타로를 교차 분석해 오늘 움직여도 되는지, 멈춰야 하는지, 누구에게 어떻게 말해야 하는지까지 바로 제안합니다.',
            primaryCta: '오라클에게 바로 묻기',
            secondaryCta: '오늘의 운세 먼저 보기',
            trustTitle: '지금 많이 묻는 질문',
            trustItems: [
                '"오늘 연락해도 될까?"',
                '"이직 제안, 지금 받아도 될까?"',
                '"관계를 더 밀어붙여도 될까?"',
            ],
            featureCards: [
                {
                    title: 'High-Stakes Timing',
                    body: '망설임이 큰 결정일수록 지금의 타이밍을 정교하게 읽습니다.',
                },
                {
                    title: 'Cross-Validated Reading',
                    body: '사주 · 별자리 · 타로를 한 장의 행동 가이드로 압축합니다.',
                },
                {
                    title: 'Action-First Output',
                    body: '해석으로 끝내지 않고 오늘 바로 할 말을 제안합니다.',
                },
            ],
            microStats: [
                { label: '분석 축', value: '3 Layers' },
                { label: '답변 형식', value: '행동 가이드' },
                { label: '추천 진입', value: '3분 이내' },
            ],
        }
        : {
            eyebrow: '1:1 Decision Oracle',
            titleLead: 'Turn uncertainty into',
            titleAccent: 'a question you can act on',
            titleTail: 'today',
            description: 'CosmicPath cross-checks saju, astrology, and tarot to tell you whether to move, wait, reply, or walk away.',
            primaryCta: 'Ask The Oracle',
            secondaryCta: 'See Today’s Ritual',
            trustTitle: 'Popular prompts right now',
            trustItems: [
                '"Should I text them today?"',
                '"Is this job move worth the risk?"',
                '"Should I push this relationship forward?"',
            ],
            featureCards: [
                {
                    title: 'High-Stakes Timing',
                    body: 'Best for moments when hesitation is expensive.',
                },
                {
                    title: 'Cross-Validated Reading',
                    body: 'Saju, astrology, and tarot compressed into one direction.',
                },
                {
                    title: 'Action-First Output',
                    body: 'You get next moves, not vague comfort.',
                },
            ],
            microStats: [
                { label: 'Signals', value: '3 Systems' },
                { label: 'Output', value: 'Action Plan' },
                { label: 'First Read', value: 'Under 3 Min' },
            ],
        };

    const handlePrimaryClick = () => {
        void trackClientGrowthEvent({
            event: 'hero_primary_cta_clicked',
            source: 'landing_hero',
            language: lang,
        });
    };

    const handleSecondaryClick = () => {
        void trackClientGrowthEvent({
            event: 'hero_secondary_cta_clicked',
            source: 'landing_hero',
            language: lang,
        });
    };

    return (
        <section ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-void">
            <div className="absolute inset-0 z-0 opacity-45">
                {!isHydrated || isMobile ? (
                    <StaticHeroBackground />
                ) : (
                    <HeroShaderBackground />
                )}
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_26%),linear-gradient(180deg,rgba(5,5,5,0.15),rgba(5,5,5,0.82)_72%,rgba(5,5,5,0.96))]" />

            <motion.div
                style={{ opacity, scale, y }}
                className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8"
            >
                <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 backdrop-blur-md"
                        >
                            <Sparkles className="h-4 w-4 text-acc-gold" />
                            <span className="text-[11px] uppercase tracking-[0.28em] text-starlight/76">
                                {primaryCopy.eyebrow}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                            className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] text-starlight sm:text-5xl md:text-6xl xl:text-7xl"
                        >
                            {primaryCopy.titleLead}{' '}
                            <span className="bg-gradient-to-r from-[#fff1ba] via-[#f4d88a] to-[#cfeeff] bg-clip-text text-transparent">
                                {primaryCopy.titleAccent}
                            </span>{' '}
                            {primaryCopy.titleTail}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.35 }}
                            className="mt-6 max-w-2xl text-base leading-8 text-starlight/72 sm:text-lg"
                        >
                            {primaryCopy.description}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.45 }}
                            className="mt-8 flex flex-wrap gap-3"
                        >
                            {primaryCopy.microStats.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-md"
                                >
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-starlight/42">{item.label}</p>
                                    <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.55 }}
                            className="mt-8 flex flex-col gap-3 sm:flex-row"
                        >
                            <Link
                                href="/start?reset=true"
                                onClick={handlePrimaryClick}
                                className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-acc-gold via-[#f2d479] to-acc-gold px-7 py-4 text-sm font-bold tracking-[0.08em] text-black shadow-[0_16px_40px_rgba(212,175,55,0.28)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_22px_48px_rgba(212,175,55,0.34)]"
                            >
                                <MessageCircleHeart className="h-4 w-4" />
                                <span>{primaryCopy.primaryCta}</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/daily"
                                onClick={handleSecondaryClick}
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/14 bg-black/20 px-7 py-4 text-sm font-semibold tracking-[0.08em] text-starlight backdrop-blur-md transition-all duration-300 hover:border-acc-gold/35 hover:bg-white/6"
                            >
                                <Clock3 className="h-4 w-4 text-cyan-200" />
                                <span>{primaryCopy.secondaryCta}</span>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.9, delay: 0.7 }}
                            className="mt-5 text-xs tracking-[0.16em] text-starlight/38 uppercase"
                        >
                            {isKorean ? '첫 분석은 로그인 없이 시작 가능' : 'No login required for the first read'}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.95, ease: 'easeOut', delay: 0.3 }}
                        className="relative"
                    >
                        <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-acc-gold/12 blur-3xl" />
                        <div className="absolute bottom-6 right-0 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />

                        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl md:p-6">
                            <div className="rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_32%),rgba(10,10,12,0.76)] p-5">
                                <p className="text-[11px] uppercase tracking-[0.24em] text-acc-gold">
                                    {primaryCopy.trustTitle}
                                </p>
                                <div className="mt-4 space-y-3">
                                    {primaryCopy.trustItems.map((item) => (
                                        <div
                                            key={item}
                                            className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-starlight/88"
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {primaryCopy.featureCards.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-[24px] border border-white/8 bg-black/18 px-4 py-4"
                                    >
                                        <p className="text-sm font-semibold text-white">{item.title}</p>
                                        <p className="mt-1 text-sm leading-6 text-starlight/60">{item.body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-4"
            >
                <span className="text-[10px] tracking-[0.3em] text-moonlight uppercase">Scroll to Enter</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0 animate-pulse" />
            </motion.div>
        </section>
    );
}
