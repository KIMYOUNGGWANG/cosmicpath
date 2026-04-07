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
    isSuppressed?: boolean;
}

export function StickyCTA({ price, originalPrice, onUnlock, language, isSuppressed = false }: StickyCTAProps) {
    const [isVisible, setIsVisible] = useState(false);
    const isEn = language === 'en';
    const headline = isEn ? 'See the full reading' : '전체 해석 보기';
    const supportingCopy = isEn
        ? 'See the reasons, timing, and next steps behind your free result.'
        : '무료 결과 뒤에 있는 이유, 타이밍, 다음 행동까지 이어서 봅니다.';
    const buttonLabel = isEn ? 'See Full Reading' : '전체 해석 보기';

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
            {isVisible && !isSuppressed && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="safe-area-bottom fixed bottom-3 left-3 right-3 z-50 md:bottom-5 md:left-1/2 md:w-auto md:min-w-[520px] md:-translate-x-1/2"
                >
                    <div className="overflow-hidden rounded-[30px] border border-[#f0d487]/16 bg-[radial-gradient(circle_at_top_left,rgba(244,216,138,0.18),transparent_32%),linear-gradient(180deg,rgba(8,12,24,0.94),rgba(5,8,22,0.98))] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-4 md:px-5">
                            <div className="flex items-start gap-3">
                                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-acc-gold/18 bg-acc-gold/10 text-acc-gold md:h-11 md:w-11">
                                    <Lock className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[10px] uppercase tracking-[0.24em] text-acc-gold/80">
                                                    {isEn ? 'Full Reading' : '전체 해석'}
                                                </span>
                                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/45">
                                                    {isEn ? 'Premium Path' : '프리미엄 경로'}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm font-semibold leading-5 text-white md:text-base">
                                                {headline}
                                            </p>
                                            <p className="mt-1 hidden text-sm leading-6 text-white/62 md:block">
                                                {supportingCopy}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-[11px] font-serif text-white/28 line-through md:text-xs">{originalPrice}</div>
                                            <div className="font-cinzel text-2xl font-bold leading-none text-acc-gold md:text-[1.75rem]">
                                                {price}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <ScarcityTimer language={language} compact />
                                        <div className="text-xs text-white/42 md:hidden">
                                            {isEn ? 'Full Reading' : '전체 해석'}
                                        </div>
                                    </div>

                                    <button
                                        onClick={onUnlock}
                                        className="mt-3 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-acc-gold via-[#F3C96C] to-[#D98300] px-5 py-3 text-sm font-bold text-black shadow-[0_18px_40px_rgba(217,131,0,0.28)] transition-all duration-300 hover:brightness-105 md:min-h-[52px]"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        <span>{buttonLabel}</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
