'use client';

import { UnifiedReadingResult } from '@/lib/cosmic/schema';
import { ScrollText, Shield, Sparkles, Star } from 'lucide-react';
import { EvidenceBadge } from './EvidenceBadge';

interface UnifiedReadingDisplayProps {
    result: UnifiedReadingResult;
}

const MATCH_STYLES: Record<UnifiedReadingResult['matchLevel'], string> = {
    PERFECT: 'border-emerald-300/30 bg-emerald-400/12 text-emerald-100',
    PARTIAL: 'border-acc-gold/25 bg-acc-gold/12 text-acc-gold',
    CONFLICT: 'border-rose-300/30 bg-rose-400/12 text-rose-100',
};

const SOURCE_META: Record<string, {
    label: string;
    description: string;
    icon: typeof ScrollText;
    accentClassName: string;
    chipClassName: string;
    barClassName: string;
}> = {
    SAJU: {
        label: '사주 원국',
        description: '타고난 기질과 10년 대운의 구조를 읽는 핵심 축',
        icon: ScrollText,
        accentClassName: 'text-amber-100',
        chipClassName: 'border-amber-300/20 bg-amber-400/10 text-amber-100',
        barClassName: 'from-amber-300 via-amber-200 to-amber-100',
    },
    ASTROLOGY: {
        label: '점성 트랜짓',
        description: '행성 정렬과 시기의 압력 및 기회의 창을 확인하는 축',
        icon: Star,
        accentClassName: 'text-violet-100',
        chipClassName: 'border-violet-300/20 bg-violet-400/10 text-violet-100',
        barClassName: 'from-violet-300 via-fuchsia-200 to-indigo-100',
    },
    ZIWEI: {
        label: '자미두수 명반',
        description: '12궁 배치를 통해 타고난 그릇과 기회의 방향성을 정밀 진단하는 축',
        icon: Sparkles,
        accentClassName: 'text-fuchsia-100',
        chipClassName: 'border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100',
        barClassName: 'from-fuchsia-300 via-pink-200 to-rose-100',
    },
    THAI: {
        label: '태국 왕실 점성',
        description: '출생 요일 수호신과 108년 마하탁사 생애 대운을 추적하는 축',
        icon: Sparkles,
        accentClassName: 'text-emerald-100',
        chipClassName: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100',
        barClassName: 'from-emerald-300 via-teal-200 to-cyan-100',
    },
} as const;

function formatTagLabel(tag: string) {
    return tag
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function UnifiedReadingDisplay({ result }: UnifiedReadingDisplayProps) {
    return (
        <section className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(161,132,255,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_30px_90px_rgba(7,10,20,0.48)] backdrop-blur-2xl">
            <div className="border-b border-white/8 px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/55">
                                Oracle Synthesis
                            </span>
                            <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${MATCH_STYLES[result.matchLevel]}`}>
                                {result.matchLevel} MATCH
                            </span>
                        </div>

                        <h2 className="mt-4 bg-gradient-to-r from-white via-[#CDB8FF] to-[#8A6FFF] bg-clip-text font-cinzel text-2xl text-transparent sm:text-3xl">
                            Cosmic Synthesis
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58 sm:text-base">
                            사주, 서양 점성, 태국 점성, 자미두수가 가리킨 행동 신호를 한 장의 결정 리딩으로 정리했습니다.
                        </p>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-[#0A0D18]/70 px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:min-w-[170px] lg:text-right">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/42 lg:justify-end">
                            <Shield className="h-3.5 w-3.5 text-acc-gold" />
                            Trust Score
                        </div>
                        <div className="mt-2 font-cinzel text-3xl leading-none text-white sm:text-[2.35rem]">
                            {result.totalConfidenceScore}
                            <span className="ml-1 text-base text-white/38">%</span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-white/42">
                            세 개의 해석 축이 같은 결론으로 수렴한 정도입니다.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 px-5 py-5 sm:px-7 sm:py-7">
                <div className="flex flex-wrap gap-2">
                    {result.primaryTags.map((tag) => {
                        const sources = result.sources
                            .filter((source) => source.detectedTags.includes(tag))
                            .map((source) => source.source);

                        return (
                            <EvidenceBadge
                                key={tag}
                                tag={tag}
                                sources={sources}
                                score={result.totalConfidenceScore}
                            />
                        );
                    })}
                </div>

                {result.conflictingTags?.length ? (
                    <div className="rounded-[24px] border border-rose-300/15 bg-rose-500/6 px-4 py-4">
                        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-rose-100/72">
                            <Sparkles className="h-3.5 w-3.5" />
                            Tension Signals
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {result.conflictingTags.map((tag) => (
                                <EvidenceBadge
                                    key={tag}
                                    tag={tag}
                                    sources={[]}
                                    score={result.totalConfidenceScore}
                                    isConflict
                                />
                            ))}
                        </div>
                    </div>
                ) : null}

                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,19,35,0.88),rgba(10,12,24,0.98))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#CDB8FF]">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] uppercase tracking-[0.24em] text-white/42">
                                Destiny Moment
                            </div>
                            <p className="mt-3 font-cinzel text-xl leading-9 text-white sm:text-[1.8rem] sm:leading-[2.8rem]">
                                &quot;{result.summary}&quot;
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
                    <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/45">
                        <ScrollText className="h-3.5 w-3.5 text-acc-gold" />
                        Unified Interpretation
                    </div>
                    <div className="prose prose-invert max-w-none break-words">
                        <p className="text-sm leading-8 text-white/72 sm:text-[15px]">{result.detailedContent}</p>
                    </div>
                </div>

                <div className="border-t border-white/8 pt-1">
                    <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/45">
                        <Shield className="h-3.5 w-3.5 text-acc-gold" />
                        Evidence Breakdown
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        {result.sources.map((source) => {
                            const meta = SOURCE_META[source.source];
                            const Icon = meta.icon;
                            const confidence = Math.round(source.confidence * 100);

                            return (
                                <article
                                    key={source.source}
                                    className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${meta.accentClassName}`}>
                                                <Icon className="h-[18px] w-[18px]" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                                                    {source.source}
                                                </div>
                                                <h3 className={`mt-1 font-semibold ${meta.accentClassName}`}>
                                                    {meta.label}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-cinzel text-xl leading-none text-white">
                                                {confidence}
                                                <span className="ml-0.5 text-xs text-white/34">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-3 text-sm leading-6 text-white/52">
                                        {meta.description}
                                    </p>

                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/6">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${meta.barClassName}`}
                                            style={{ width: `${confidence}%` }}
                                        />
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {source.detectedTags.map((tag) => (
                                            <span
                                                key={`${source.source}-${tag}`}
                                                className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${meta.chipClassName}`}
                                            >
                                                {formatTagLabel(tag)}
                                            </span>
                                        ))}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
