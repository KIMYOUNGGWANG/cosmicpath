'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';

import { trackClientGrowthEvent } from '@/lib/client-growth-events';

interface HeroSceneProps {
    language: 'ko' | 'en';
    children: ReactNode;
}

export function HeroScene({ language, children }: HeroSceneProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasTrackedLandingView = useRef(false);
    const [isMobile, setIsMobile] = useState(true);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

    useEffect(() => {
        if (!hasTrackedLandingView.current) {
            hasTrackedLandingView.current = true;
            void trackClientGrowthEvent({
                event: 'landing_view',
                source: 'landing_page_hero',
                language,
            });
        }

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [language]);

    return (
        <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-void">
            <div className="absolute inset-0 z-0 opacity-40">
                {isMobile ? (
                    <div className="absolute inset-0 bg-gradient-to-b from-void via-[#1a1230] to-void">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,14,14,0.3)_0%,transparent_70%)]" />
                        <div className="absolute right-0 top-0 h-full w-full bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.15)_0%,transparent_60%)]" />
                    </div>
                ) : (
                    <ShaderGradientCanvas pixelDensity={0.6} fov={45}>
                        <ShaderGradient
                            control="props"
                            color1="#1a1230"
                            color2="#4A0E0E"
                            color3="#D4AF37"
                            animate="on"
                            uSpeed={0.3}
                            uStrength={2}
                            uDensity={1.5}
                        />
                    </ShaderGradientCanvas>
                )}
            </div>

            <motion.div
                style={{ opacity, scale, y }}
                className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-16 pt-28 text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="w-full"
                >
                    {children}
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4"
            >
                <span className="text-[10px] uppercase tracking-[0.3em] text-moonlight">
                    {language === 'ko' ? '아래로 내려 보기' : 'Scroll to Enter'}
                </span>
                <div className="h-12 w-[1px] animate-pulse bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
            </motion.div>
        </section>
    );
}
