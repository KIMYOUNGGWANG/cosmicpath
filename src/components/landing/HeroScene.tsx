'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { getLandingVariant } from '@/lib/language-preference';

interface HeroSceneProps {
    language: 'ko' | 'en';
    children: ReactNode;
}

export function HeroScene({ language, children }: HeroSceneProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasTrackedLandingView = useRef(false);
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
                metadata: {
                    landingVariant: getLandingVariant(language),
                },
            });
        }

    }, [language]);

    return (
        <section ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-void">
            <div className="absolute inset-0 z-0 opacity-70">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,238,226,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(245,238,226,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />
                <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,transparent_52%,rgba(215,178,93,0.08)_52%,rgba(215,178,93,0.08)_52.35%,transparent_52.35%,transparent_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-32 border-t border-white/6 bg-[#11100d]/80" />
            </div>

            <motion.div
                style={{ opacity, scale, y }}
                className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-28 text-center"
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
                    {language === 'ko' ? '더 살펴보기' : 'Keep reading'}
                </span>
                <div className="h-12 w-[1px] animate-pulse bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
            </motion.div>
        </section>
    );
}
