'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import { ScarcityTimer } from '@/components/sales/ScarcityTimer';

interface StickyCTAProps {
    price: string;
    originalPrice: string;
    onUnlock: () => void;
    language: 'ko' | 'en';
}

export function StickyCTA({ price, originalPrice, onUnlock, language }: StickyCTAProps) {
    const [isVisible, setIsVisible] = useState(false);
    const isEn = language === 'en';

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling down 300px
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="safe-area-bottom fixed bottom-5 left-4 right-4 z-50 md:left-1/2 md:w-auto md:min-w-[460px] md:-translate-x-1/2"
                >
                    <div className="overflow-hidden rounded-[28px] border border-acc-gold/22 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_28%),linear-gradient(180deg,rgba(8,12,24,0.92),rgba(5,8,22,0.96))] p-2 shadow-[0_16px_50px_rgba(0,0,0,0.46)] backdrop-blur-2xl">
                        <div className="flex flex-col gap-3 rounded-[22px] border border-white/8 bg-black/20 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-5 md:px-5">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-acc-gold/20 bg-acc-gold/10 text-acc-gold">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] uppercase tracking-[0.24em] text-acc-gold/80">
                                            {isEn ? 'Next Move Unlock' : '다음 행동 열기'}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/45">
                                            {isEn ? 'Premium Path' : '프리미엄 경로'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-white/78">
                                        {isEn
                                            ? 'Open the full reading and sharpen the next move across relationship, career, wealth, and timing.'
                                            : '전체 리딩을 열고, 관계·커리어·재물·타이밍 중 지금 필요한 다음 행동의 창을 더 선명하게 확인하세요.'}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <ScarcityTimer language={language} />
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xs font-serif text-gray-500 line-through">{originalPrice}</span>
                                            <span className="font-cinzel text-lg font-bold text-acc-gold">{price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onUnlock}
                            className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-acc-gold to-amber-600 px-6 py-3 text-sm font-bold text-black shadow-lg transition-all duration-300 hover:scale-[1.02]"
                        >
                            <Sparkles className="h-4 w-4" />
                            <span>{isEn ? "Open My Decision Reading" : "내 결정 리딩 열기"}</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
