'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DestinyDashboard } from './DestinyDashboard';
import {
    calculateElementScores,
    calculateEnhancedElementScores,
    type ElementScores,
} from '@/lib/engines/element-calculator';
import { calculateAstrologyScores } from '@/lib/engines/astrology-scorer';
import {
    FIVE_ELEMENTS,
    HIDDEN_STEMS,
    STEM_ELEMENTS,
    type SajuResult,
} from '@/lib/engines/saju';
import type { AstrologyResult } from '@/lib/engines/astrology';

interface DestinyDashboardSectionProps {
    details: any; // Raw metadata from API
    hasGuest: boolean;
    hostName: string;
    guestName?: string;
}

const PILLAR_SOURCE_LABELS = [
    { key: 'yeonPillar', label: '연지' },
    { key: 'monthPillar', label: '월지' },
    { key: 'dayPillar', label: '일지' },
    { key: 'hourPillar', label: '시지' },
] as const;

function createEmptyElementSources() {
    return {
        wood: [] as string[],
        fire: [] as string[],
        earth: [] as string[],
        metal: [] as string[],
        water: [] as string[],
    };
}

function buildHiddenStemSources(saju: SajuResult) {
    const sources = createEmptyElementSources();

    PILLAR_SOURCE_LABELS.forEach(({ key, label }) => {
        const branch = saju[key].branch;
        const hidden = HIDDEN_STEMS[branch];
        if (!hidden) return;

        [hidden.jeonggi, hidden.junggi, hidden.yeogi]
            .filter((stem): stem is string => Boolean(stem))
            .forEach((stem) => {
                const element = STEM_ELEMENTS[stem];
                if (!element) return;
                sources[element].push(`${label} ${branch}의 ${stem}${FIVE_ELEMENTS[element]}`);
            });
    });

    return sources;
}

function buildPrecisionShifts(
    saju: SajuResult,
    surfaceScores: ElementScores,
    precisionScores: ElementScores
) {
    const hiddenSources = buildHiddenStemSources(saju);

    return (Object.keys(surfaceScores) as Array<keyof ElementScores>)
        .filter((element) => precisionScores[element] !== surfaceScores[element])
        .map((element) => ({
            element,
            surfaceScore: surfaceScores[element],
            precisionScore: precisionScores[element],
            sources: [...new Set(hiddenSources[element])],
        }))
        .sort((left, right) => {
            const leftStartsHidden = left.surfaceScore === 0 ? 1 : 0;
            const rightStartsHidden = right.surfaceScore === 0 ? 1 : 0;
            if (leftStartsHidden !== rightStartsHidden) {
                return rightStartsHidden - leftStartsHidden;
            }

            return Math.abs(right.precisionScore - right.surfaceScore)
                - Math.abs(left.precisionScore - left.surfaceScore);
        });
}

export function DestinyDashboardSection({ details, hasGuest, hostName, guestName }: DestinyDashboardSectionProps) {
    const [activeTab, setActiveTab] = useState<'host' | 'guest'>('host');

    // Memoize the calculated reports to avoid re-calculation on render
    const hostData = useMemo(() => {
        if (!details?.hostSaju || !details?.hostAstrology) return null;
        try {
            const hostSaju = details.hostSaju as SajuResult;
            const surfaceSaju = calculateElementScores(hostSaju);
            const precisionSaju = calculateEnhancedElementScores(hostSaju);

            return {
                saju: precisionSaju,
                surfaceSaju,
                precisionShifts: buildPrecisionShifts(hostSaju, surfaceSaju, precisionSaju.scores),
                astro: calculateAstrologyScores(details.hostAstrology as AstrologyResult)
            };
        } catch (e) {
            console.error("Failed to calculate host scores", e);
            return null;
        }
    }, [details]);

    const guestData = useMemo(() => {
        if (!hasGuest || !details?.guestSaju || !details?.guestAstrology) return null;
        try {
            const guestSaju = details.guestSaju as SajuResult;
            const surfaceSaju = calculateElementScores(guestSaju);
            const precisionSaju = calculateEnhancedElementScores(guestSaju);

            return {
                saju: precisionSaju,
                surfaceSaju,
                precisionShifts: buildPrecisionShifts(guestSaju, surfaceSaju, precisionSaju.scores),
                astro: calculateAstrologyScores(details.guestAstrology as AstrologyResult)
            };
        } catch (e) {
            console.error("Failed to calculate guest scores", e);
            return null;
        }
    }, [details, hasGuest]);

    if (!hostData) return null;

    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-12">
            {/* Tabs (only if guest exists) */}
            {hasGuest && guestData && (
                <div className="flex justify-center mb-8">
                    <div className="bg-white/5 p-1 rounded-full backdrop-blur-md border border-white/10 flex">
                        <button
                            onClick={() => setActiveTab('host')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'host'
                                    ? 'bg-[#1a1230] text-acc-gold shadow-lg ring-1 ring-white/10'
                                    : 'text-dim hover:text-white'
                                }`}
                        >
                            {hostName}'s Energy
                        </button>
                        <button
                            onClick={() => setActiveTab('guest')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'guest'
                                    ? 'bg-[#1a1230] text-acc-gold shadow-lg ring-1 ring-white/10'
                                    : 'text-dim hover:text-white'
                                }`}
                        >
                            {guestName}'s Energy
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {activeTab === 'host' ? (
                    <DestinyDashboard
                        sajuReport={hostData.saju}
                        surfaceScores={hostData.surfaceSaju}
                        precisionShifts={hostData.precisionShifts}
                        astroReport={hostData.astro}
                    />
                ) : (
                    guestData && (
                        <DestinyDashboard
                            sajuReport={guestData.saju}
                            surfaceScores={guestData.surfaceSaju}
                            precisionShifts={guestData.precisionShifts}
                            astroReport={guestData.astro}
                        />
                    )
                )}
            </motion.div>
        </section>
    );
}
