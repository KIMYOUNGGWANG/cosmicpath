'use client';

import { motion } from 'framer-motion';

type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

interface EnergyGaugeProps {
    element: ElementType;
    score: number; // 0-100
    label: string;
    showLabel?: boolean;
}

const COLOR_MAP: Record<ElementType, string> = {
    wood: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    fire: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
    earth: 'bg-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)]',
    metal: 'bg-slate-300 shadow-[0_0_10px_rgba(203,213,225,0.5)]',
    water: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
};

const LABEL_KO: Record<ElementType, string> = {
    wood: '목 (Wood)',
    fire: '화 (Fire)',
    earth: '토 (Earth)',
    metal: '금 (Metal)',
    water: '수 (Water)',
};

export function EnergyGauge({ element, score, label, showLabel = true }: EnergyGaugeProps) {
    const isDominant = score >= 40; // Relative dominance threshold

    return (
        <div className="w-full mb-3">
            {showLabel && (
                <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-moonlight font-medium tracking-wide">
                        {LABEL_KO[element]}
                    </span>
                    <span className={`text-xs font-mono ${isDominant ? 'text-white font-bold' : 'text-dim'}`}>
                        {score}%
                    </span>
                </div>
            )}

            {/* Track */}
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                {/* Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full rounded-full ${COLOR_MAP[element]}`}
                >
                    {isDominant && (
                        <motion.div
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-full h-full bg-white/20"
                        />
                    )}
                </motion.div>
            </div>

            {/* Micro-label for distinct traits (optional) */}
            {isDominant && (
                <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="text-[10px] text-accent-gold mt-1 text-right italic"
                >
                    {element === 'wood' && "Growth & Creativity"}
                    {element === 'fire' && "Passion & Action"}
                    {element === 'earth' && "Stability & Trust"}
                    {element === 'metal' && "Logic & decisiveness"}
                    {element === 'water' && "Wisdom & Flow"}
                </motion.p>
            )}
        </div>
    );
}
