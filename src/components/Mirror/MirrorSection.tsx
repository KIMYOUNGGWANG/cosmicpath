'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CTAButton } from '../ui/CTAButton';

interface MirrorSectionProps {
    language: 'ko' | 'en';
    onUnlockFullReport: () => void;
    isLoading: boolean;
    teaserContent?: string;
}

export function MirrorSection({ language, onUnlockFullReport, isLoading, teaserContent }: MirrorSectionProps) {
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        if (!isLoading && teaserContent) {
            const timer = setTimeout(() => setShowResult(true), 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, teaserContent]);

    const content = {
        ko: {
            loading: "천체들을 조립하는 중...",
            subloading: "1985년생, 화성이 7하우스에 위치했던 해...",
            cta: "$4.99로 50페이지 분석 보기",
            emailCTA: "이메일로 월별 운세 받기"
        },
        en: {
            loading: "Assembling Constellations...",
            subloading: "Born in 1985, the year Mars was in the 7th House...",
            cta: "Unlock 50-Page Report for $4.99",
            emailCTA: "Get Monthly Fortune via Email"
        }
    };

    const t = content[language];

    return (
        <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 bg-bg-surface/30 backdrop-blur-sm border-y border-white/5">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-8"
                    >
                        {/* SVG Constellation Animation Placeholder */}
                        <div className="relative w-32 h-32 mx-auto">
                            <svg viewBox="0 0 100 100" className="w-full h-full stroke-accent-gold fill-none">
                                <motion.path
                                    d="M20,50 L50,20 L80,50 L50,80 Z M50,20 L50,80 M20,50 L80,50"
                                    strokeWidth="0.5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                                {[20, 50, 80, 50, 50].map((pos, i) => (
                                    <motion.circle
                                        key={i}
                                        cx={i === 0 ? 20 : i === 1 ? 50 : i === 2 ? 80 : i === 3 ? 50 : 50}
                                        cy={i === 0 ? 50 : i === 1 ? 20 : i === 2 ? 50 : i === 3 ? 80 : 50}
                                        r="1"
                                        fill="currentColor"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                    />
                                ))}
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-cinzel tracking-widest animate-pulse">
                                {t.loading}
                            </h2>
                            <p className="text-fg-secondary text-sm italic opacity-60">
                                {t.subloading}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    showResult && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-xl mx-auto text-center space-y-12"
                        >
                            <div className="h-[1px] w-12 bg-accent-gold/30 mx-auto" />

                            <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed tracking-wide italic text-fg-primary/90">
                                {teaserContent?.split('\n').map((line, i) => (
                                    <motion.p
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.4 }}
                                    >
                                        {line}
                                    </motion.p>
                                ))}
                            </div>

                            <div className="h-[1px] w-12 bg-accent-gold/30 mx-auto" />

                            <div className="space-y-6 pt-8">
                                <CTAButton onClick={onUnlockFullReport} className="w-full sm:w-auto">
                                    {t.cta}
                                </CTAButton>

                                <p className="text-sm">
                                    <button className="text-fg-secondary hover:text-fg-primary underline underline-offset-4 transition-colors">
                                        {t.emailCTA}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    )
                )}
            </AnimatePresence>
        </section>
    );
}
