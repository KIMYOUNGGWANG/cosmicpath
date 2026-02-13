'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DestinyDashboard } from './DestinyDashboard';
import { calculateEnhancedElementScores } from '@/lib/engines/element-calculator';
import { calculateAstrologyScores } from '@/lib/engines/astrology-scorer';
import type { SajuResult } from '@/lib/engines/saju';
import type { AstrologyResult } from '@/lib/engines/astrology';

interface DestinyDashboardSectionProps {
    details: any; // Raw metadata from API
    hasGuest: boolean;
    hostName: string;
    guestName?: string;
}

export function DestinyDashboardSection({ details, hasGuest, hostName, guestName }: DestinyDashboardSectionProps) {
    const [activeTab, setActiveTab] = useState<'host' | 'guest'>('host');

    // Memoize the calculated reports to avoid re-calculation on render
    const hostData = useMemo(() => {
        if (!details?.hostSaju || !details?.hostAstrology) return null;
        try {
            return {
                saju: calculateEnhancedElementScores(details.hostSaju as SajuResult),
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
            return {
                saju: calculateEnhancedElementScores(details.guestSaju as SajuResult),
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
                    <DestinyDashboard sajuReport={hostData.saju} astroReport={hostData.astro} />
                ) : (
                    guestData && <DestinyDashboard sajuReport={guestData.saju} astroReport={guestData.astro} />
                )}
            </motion.div>
        </section>
    );
}
