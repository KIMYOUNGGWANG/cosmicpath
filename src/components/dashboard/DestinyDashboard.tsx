'use client';

import { motion } from 'framer-motion';
import { EnergyGauge } from './EnergyGauge';
import { CosmicBadge } from './CosmicBadge';
import type { EnhancedElementReport } from '@/lib/engines/element-calculator';
import type { AstrologyScoreReport } from '@/lib/engines/astrology-scorer';
import { useState, useEffect } from 'react';

interface DestinyDashboardProps {
    sajuReport: EnhancedElementReport;
    astroReport: AstrologyScoreReport;
}

export function DestinyDashboard({ sajuReport, astroReport }: DestinyDashboardProps) {
    // Cross-validation score calculation (Simple mock logic for now based on harmony)
    // In real implementation, this comes from intelligence-bridge or is calculated here
    const [crossValScore, setCrossValScore] = useState(0);

    useEffect(() => {
        // Calculate a compatibility/certainty score based on data quality
        // Example: Average of Saju Balance & Astro Harmony
        const score = Math.round((sajuReport.balanceScore + astroReport.harmonyScore) / 2);
        setCrossValScore(score);
    }, [sajuReport, astroReport]);

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
                    Destiny Dashboard
                </motion.h2>
                <p className="text-sm text-dim uppercase tracking-widest">Real-Time Energy Analysis</p>
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
                        <span className="text-xs font-sans text-dim bg-white/5 px-2 py-1 rounded">Saju (Root)</span>
                    </h3>

                    <div className="space-y-4">
                        <EnergyGauge element="wood" score={sajuReport.scores.wood} label="Wood" />
                        <EnergyGauge element="fire" score={sajuReport.scores.fire} label="Fire" />
                        <EnergyGauge element="earth" score={sajuReport.scores.earth} label="Earth" />
                        <EnergyGauge element="metal" score={sajuReport.scores.metal} label="Metal" />
                        <EnergyGauge element="water" score={sajuReport.scores.water} label="Water" />
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                        <div className="text-xs text-dim">
                            Vital Element: <span className="text-acc-gold font-bold">{sajuReport.vitalElement?.ko || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-dim">
                            Balance Score: <span className="text-white font-bold">{sajuReport.balanceScore}/100</span>
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
