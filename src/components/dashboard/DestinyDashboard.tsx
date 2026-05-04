'use client';

import { motion } from 'framer-motion';
import { EnergyGauge } from './EnergyGauge';
import { CosmicBadge } from './CosmicBadge';
import type { EnhancedElementReport, ElementScores } from '@/lib/engines/element-calculator';
import type { AstrologyScoreReport } from '@/lib/engines/astrology-scorer';
import { useState, useEffect } from 'react';

type EnergyViewMode = 'surface' | 'precision';

interface DestinyDashboardProps {
    sajuReport: EnhancedElementReport;
    surfaceScores: ElementScores;
    precisionShifts: Array<{
        element: keyof ElementScores;
        surfaceScore: number;
        precisionScore: number;
        sources: string[];
    }>;
    astroReport: AstrologyScoreReport;
}

const ELEMENT_ORDER: Array<keyof ElementScores> = ['wood', 'fire', 'earth', 'metal', 'water'];

const ELEMENT_LABELS: Record<keyof ElementScores, string> = {
    wood: '목',
    fire: '화',
    earth: '토',
    metal: '금',
    water: '수',
};

const VIEW_COPY: Record<EnergyViewMode, {
    badge: string;
    title: string;
    description: string;
}> = {
    surface: {
        badge: 'Surface 8',
        title: '겉으로 드러난 8글자 기준',
        description: '천간 4개와 지지 4개만 반영합니다. 처음 보는 오행 분포를 직관적으로 확인할 때 가장 덜 헷갈리는 기준입니다.',
    },
    precision: {
        badge: 'Precision + Hidden',
        title: '지장간까지 포함한 정밀 오행',
        description: '지지 안에 숨은 기운까지 합산합니다. 겉글자에 없는 화나 수가 소량 잡히는 이유도 이 보기에서 바로 확인할 수 있습니다.',
    },
};

function formatElementList(elements: Array<keyof ElementScores>) {
    if (!elements.length) {
        return '없음';
    }

    return elements.map((element) => ELEMENT_LABELS[element]).join(', ');
}

function describePrecisionShift(shift: DestinyDashboardProps['precisionShifts'][number]) {
    const sources = shift.sources.slice(0, 2).join(', ');
    const sourceText = sources ? ` ${sources} 같은 숨은 기운이 반영됩니다.` : '';

    if (shift.surfaceScore === 0) {
        return `${ELEMENT_LABELS[shift.element]}는 표면 8자에선 0%지만 정밀 오행에서는 ${shift.precisionScore}%로 잡혀요.${sourceText}`;
    }

    return `${ELEMENT_LABELS[shift.element]}는 표면 ${shift.surfaceScore}%에서 정밀 ${shift.precisionScore}%로 조정돼요.${sourceText}`;
}

export function DestinyDashboard({
    sajuReport,
    surfaceScores,
    precisionShifts,
    astroReport,
}: DestinyDashboardProps) {
    // Cross-validation score calculation (Simple mock logic for now based on harmony)
    // In real implementation, this comes from intelligence-bridge or is calculated here
    const [crossValScore, setCrossValScore] = useState(0);
    const [energyViewMode, setEnergyViewMode] = useState<EnergyViewMode>('surface');

    useEffect(() => {
        // Calculate a compatibility/certainty score based on data quality
        // Example: Average of Saju Balance & Astro Harmony
        const score = Math.round((sajuReport.balanceScore + astroReport.harmonyScore) / 2);
        setCrossValScore(score);
    }, [sajuReport, astroReport]);

    const currentScores = energyViewMode === 'surface' ? surfaceScores : sajuReport.scores;
    const currentView = VIEW_COPY[energyViewMode];
    const surfaceMissingElements = ELEMENT_ORDER.filter((element) => surfaceScores[element] === 0);
    const hiddenOnlyElements = precisionShifts
        .filter((shift) => shift.surfaceScore === 0 && shift.precisionScore > 0)
        .map((shift) => shift.element);

    return (
        <section className="w-full max-w-4xl mx-auto my-12 p-6 md:p-8 rounded-3xl bg-[#0a0a0f] border border-white/5 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 text-center mb-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-3xl font-cinzel font-bold text-starlight mb-2"
                >
                    운명 대시보드
                </motion.h2>
                <p className="text-sm text-dim uppercase tracking-widest">실시간 에너지 분석</p>
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Saju Elemental Balance */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="col-span-1 lg:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/5 backdrop-blur-sm"
                >
                    <h3 className="text-lg font-cinzel text-starlight mb-6 flex items-center justify-between">
                        <span>Elemental Energy</span>
                        <span className="text-xs font-sans text-dim bg-white/5 px-2 py-1 rounded">{currentView.badge}</span>
                    </h3>

                    <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setEnergyViewMode('surface')}
                            className={`rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                                energyViewMode === 'surface'
                                    ? 'border-acc-gold/40 bg-[#1a1230] text-white shadow-[0_0_24px_rgba(251,191,36,0.08)]'
                                    : 'border-white/10 bg-black/20 text-dim hover:border-white/20 hover:text-starlight'
                            }`}
                        >
                            <p className="text-xs uppercase tracking-[0.24em]">Surface 8</p>
                            <p className="mt-1 text-sm">겉으로 보이는 8글자</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setEnergyViewMode('precision')}
                            className={`rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                                energyViewMode === 'precision'
                                    ? 'border-acc-gold/40 bg-[#1a1230] text-white shadow-[0_0_24px_rgba(251,191,36,0.08)]'
                                    : 'border-white/10 bg-black/20 text-dim hover:border-white/20 hover:text-starlight'
                            }`}
                        >
                            <p className="text-xs uppercase tracking-[0.24em]">Precision</p>
                            <p className="mt-1 text-sm">지장간까지 반영한 정밀 오행</p>
                        </button>
                    </div>

                    <div className="mb-6 rounded-2xl border border-white/8 bg-black/20 p-4">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-acc-gold/80">{currentView.badge}</p>
                        <p className="mt-2 text-sm text-starlight">{currentView.title}</p>
                        <p className="mt-2 text-xs leading-relaxed text-dim">{currentView.description}</p>

                        {precisionShifts.length > 0 && (
                            <div className="mt-4 rounded-xl border border-acc-gold/15 bg-[#120d1f] p-3">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-acc-gold/80">
                                    Why the numbers change
                                </p>
                                <div className="mt-2 space-y-2">
                                    {precisionShifts.slice(0, 2).map((shift) => (
                                        <p key={shift.element} className="text-xs leading-relaxed text-moonlight">
                                            {describePrecisionShift(shift)}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <EnergyGauge element="wood" score={currentScores.wood} label="Wood" />
                        <EnergyGauge element="fire" score={currentScores.fire} label="Fire" />
                        <EnergyGauge element="earth" score={currentScores.earth} label="Earth" />
                        <EnergyGauge element="metal" score={currentScores.metal} label="Metal" />
                        <EnergyGauge element="water" score={currentScores.water} label="Water" />
                    </div>

                    <div className="mt-6 grid gap-3 border-t border-white/5 pt-4 md:grid-cols-2">
                        <div className="rounded-xl bg-black/20 p-3">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-dim">Current View</p>
                            <p className="mt-2 text-xs leading-relaxed text-moonlight">
                                {energyViewMode === 'surface'
                                    ? `표면 8자 기준으로 비어 보이는 기운: ${formatElementList(surfaceMissingElements)}`
                                    : hiddenOnlyElements.length > 0
                                        ? `${formatElementList(hiddenOnlyElements)}는 겉글자엔 없지만 지장간에서 포착되는 숨은 기운입니다.`
                                        : '이 차트는 표면 8자와 정밀 오행의 차이가 크지 않은 편입니다.'}
                            </p>
                        </div>
                        <div className="rounded-xl bg-black/20 p-3">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-dim">Precision Metrics</p>
                            <div className="mt-2 space-y-2 text-xs text-dim">
                                <div className="flex items-center justify-between gap-3">
                                    <span>Vital Element</span>
                                    <span className="font-bold text-acc-gold">{sajuReport.vitalElement?.ko || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span>Balance Score</span>
                                    <span className="font-bold text-white">{sajuReport.balanceScore}/100</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Astrology & Cross Validation */}
                <div className="col-span-1 flex flex-col gap-6">

                    {/* Astro Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex-1 bg-white/5 rounded-2xl p-6 border border-white/5 backdrop-blur-sm flex flex-col justify-center items-center text-center"
                    >
                        <h3 className="text-lg font-cinzel text-starlight mb-1">Cosmic Harmony</h3>
                        <div className="text-4xl font-bold text-white mb-2">{astroReport.harmonyScore}</div>
                        <p className="text-xs text-dim mb-4">Astrological Aspect Score</p>

                        <div className="w-full space-y-2">
                            {astroReport.topAspects.slice(0, 2).map((aspect, i) => (
                                <div key={i} className="text-xs bg-black/20 rounded px-2 py-1.5 text-starlight truncate">
                                    {aspect.label} <span className="text-acc-gold opacity-75">{aspect.precision}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Cross Validation Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                    >
                        <CosmicBadge
                            score={crossValScore}
                            description="High resonance between Eastern & Western charts detected."
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
