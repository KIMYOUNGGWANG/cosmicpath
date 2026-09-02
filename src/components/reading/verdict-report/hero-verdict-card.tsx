'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import type { PremiumReportData } from '../premium-report';
import type { VerdictReportLanguage } from './types';

import { EvidenceXRayBadge } from '../EvidenceXRayBadge';

type HeroVerdictCardProps = {
    readonly finalVerdict?: PremiumReportData['final_verdict'];
    readonly trustScore: number;
    readonly isLoading?: boolean;
    readonly language: VerdictReportLanguage;
    readonly actionSummary?: string;
};

export function HeroVerdictCard({
    finalVerdict,
    trustScore,
    isLoading,
    language,
    actionSummary,
}: HeroVerdictCardProps) {
    const isEn = language === 'en';

    if (isLoading && !finalVerdict) {
        return (
            <div className="relative flex min-h-[360px] w-full flex-col justify-between overflow-hidden rounded-[28px] border border-white/5 bg-[#0a0a0c] p-8 md:p-12">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    }}
                />
                <div className="z-10 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <RefreshCw className="h-4 w-4 animate-spin text-[#D4AF37]/50" />
                        <p className="text-sm font-medium uppercase tracking-widest text-[#D4AF37]/60">
                            {isEn ? 'Oracle is analyzing three sources...' : '오라클이 세 가지 원천을 교차 분석하고 있습니다...'}
                        </p>
                    </div>
                    <div className="space-y-4 animate-pulse">
                        <div className="h-8 w-3/4 rounded-md bg-white/5" />
                        <div className="h-8 w-full rounded-md bg-white/5" />
                        <div className="h-8 w-5/6 rounded-md bg-white/5" />
                    </div>
                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/5" />
                </div>
            </div>
        );
    }

    if (!finalVerdict) return null;

    const crossVerificationPercent = Math.round(trustScore * 20);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: isEn ? 'My CosmicPath Verdict' : '나의 코스믹패스 결론',
                    text: finalVerdict.core_message,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Share failed', error instanceof Error ? error.message : error);
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert(isEn ? 'Link copied to clipboard!' : '링크가 복사되었습니다!');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative flex min-h-[360px] w-full flex-col justify-between overflow-hidden rounded-[28px] border border-[#D4AF37]/20 bg-[#070708] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)]"
            style={{ wordBreak: 'keep-all' }}
        >
            <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[200%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/5 blur-[100px]" />
            <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/5" />
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
            />

            <div className="relative z-10 flex h-full flex-col gap-8 p-8 md:p-12">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-sm border border-red-900/50 bg-[#2A0808]/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400/90 backdrop-blur-md">
                        <Sparkles size={12} className="opacity-80" />
                        {isEn ? 'Decision Moment' : '통합 결정 노트'}
                    </span>
                    <EvidenceXRayBadge language={language} />
                </div>

                {actionSummary ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]/60">
                            {isEn ? 'What to do now' : '지금 할 것'}
                        </p>
                        <p className="text-xl font-semibold leading-snug text-[#D4AF37] md:text-2xl">
                            {actionSummary}
                        </p>
                        <div className="h-px w-12 bg-[#D4AF37]/30" />
                    </div>
                ) : null}

                <div className="flex flex-1 flex-col justify-center gap-6">
                    <div className="border-l-2 border-[#D4AF37]/30 py-2 pl-6">
                        <h2 className="font-cinzel text-3xl font-bold leading-tight text-stone-100 md:text-4xl lg:text-5xl">
                            &ldquo;{finalVerdict.core_message}&rdquo;
                        </h2>
                    </div>
                    {finalVerdict.closing_words ? (
                        <p className="max-w-2xl pl-6 text-base font-light leading-relaxed text-stone-400/80 md:text-lg">
                            {finalVerdict.closing_words}
                        </p>
                    ) : null}
                </div>

                <div className="mt-4 flex flex-col justify-between gap-4 border-t border-white/5 pt-6 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-[#D4AF37]/80" />
                            <span className="text-xs tracking-wide text-stone-400">
                                {isEn ? '3-Layer Evidence Alignment' : '3대 원천 근거 일치도'} &nbsp;
                            </span>
                            <span className="font-serif text-xs italic text-[#D4AF37]">
                                {crossVerificationPercent}%
                            </span>
                        </div>
                        <div className="hidden h-[2px] min-w-[100px] max-w-[200px] flex-1 overflow-hidden bg-stone-800 md:block">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${crossVerificationPercent}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                                className="h-full bg-[#D4AF37]/80"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleShare}
                        className="z-20 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        {isEn ? 'Share Verdict' : '결론 공유하기'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
