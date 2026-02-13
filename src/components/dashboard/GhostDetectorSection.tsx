'use client';

import { motion } from 'framer-motion';
import { GhostCard, GhostType } from './GhostCard';
import { calculateShinSal, type AuthenticShinSalResult, type SajuResult } from '@/lib/engines/saju';

interface GhostDetectorSectionProps {
    sajuResult: SajuResult;
    userName: string;
}

export function GhostDetectorSection({ sajuResult, userName }: GhostDetectorSectionProps) {
    // 1. Calculate detections using the authentic engine
    const detections: AuthenticShinSalResult[] = calculateShinSal(sajuResult);

    // 2. Map Key Ghosts (Always show detected ones)
    const ghosts: { type: GhostType; level: number }[] = detections.map(d => ({
        type: d.type,
        level: d.level
    }));

    if (ghosts.length === 0) {
        // Fallback or empty state
        return (
            <section className="w-full max-w-6xl mx-auto px-4 py-8 mb-12">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-starlight mb-3">
                        Cosmic Forces & Hidden Talents
                    </h2>
                    <p className="text-dim">
                        특별한 신살이 감지되지 않았거나, 평온한 사주입니다.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full max-w-6xl mx-auto px-4 py-8 mb-12">
            <div className="text-center mb-12">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-3xl font-cinzel font-bold text-starlight mb-3"
                >
                    Cosmic Forces & Hidden Talents
                </motion.h2>
                <p className="text-sm text-dim uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
                    Unveiling the {ghosts.length} powerful forces (Shin-sal) shaping {userName}'s destiny.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-6">
                {ghosts.map((ghost, i) => (
                    <motion.div
                        key={ghost.type}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                        <GhostCard type={ghost.type} level={ghost.level} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
