'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import Link from 'next/link';
import { useLoginModal } from '@/components/auth/LoginModal';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';

export function HeroSection() {
    const { openLoginModal } = useLoginModal();
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
                className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    className="font-sans text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-starlight mb-6 leading-tight break-keep"
                >
                    {lang === 'ko' ? (
                        <>
                            오늘 연락해도 될까? <br className="md:hidden" />
                            이번 주에 <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">결정해도 될까?</span>
                        </>
                    ) : (
                        <>
                            WRITTEN <br className="md:hidden" />
                            IN THE <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">STARS</span>
                        </>
                    )}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="text-lg md:text-2xl text-moonlight font-light max-w-2xl leading-relaxed mb-10 break-keep"
                >
                    {lang === 'ko' ? (
                        <>
                            애매한 선택을 앞둔 순간, <br className="hidden md:block" /> 사주와 타로 데이터 기반의 1:1 오라클이 <br className="md:hidden" />
                            가장 정확한 타이밍과 <span className="text-white font-medium">행동(Action)</span>을 제안합니다.
                        </>
                    ) : (
                        <>
                            &quot;<span className="text-white font-medium">운명의 궤적</span>은 침묵하지 않습니다. <br className="hidden md:block" /> 단지 우리가 듣기를 기다릴 뿐.&quot;<br />
                            <span className="text-sm md:text-base text-dim mt-4 block font-sans">
                                고대의 지혜와 AI의 연산으로 <br className="md:hidden" />
                                <span className="text-acc-logic font-semibold">당신의 내면(Inner Universe)</span>을 봉인 해제합니다.
                            </span>
                        </>
                    )}
                </motion.p>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="flex flex-wrap justify-center gap-4 md:gap-8"
                >
                    {(lang === 'ko' ? ['사주·별자리·타로 교차 검증', '실전형 1:1 한국형 오라클'] : ['Hyper-Personalized AI', 'Integrated Cosmic Analysis']).map((badge, i) => (
                        <div key={i} className="px-4 py-2 border border-white/10 rounded-full bg-white/5 backdrop-blur-md">
                            <span className="text-xs md:text-sm text-acc-gold tracking-widest font-medium uppercase">{badge}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Main CTA Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="mt-12"
                >
                    <Link
                        href="/start?reset=true"
                        className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-acc-gold via-amber-300 to-acc-gold bg-[length:200%_auto] animate-pulse-slow text-deep-navy font-bold text-lg tracking-tight rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] hover:scale-105 transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {lang === 'ko' ? '오늘의 타이밍 물어보기' : 'UNSEAL YOUR DESTINY'}
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </span>
                    </Link>
                    <p className="text-dim text-xs mt-4 tracking-wider">
                        * No Login Required for Free Analysis
                    </p>
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
