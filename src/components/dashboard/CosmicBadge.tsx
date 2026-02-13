'use client';

import { motion } from 'framer-motion';

interface CosmicBadgeProps {
    score: number; // 0-100 (Certainty Score)
    label?: string;
    description?: string;
}

export function CosmicBadge({ score, label = "Cosmic Certainty", description }: CosmicBadgeProps) {
    // Only show high certainty
    if (score < 70) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
            className="relative group p-4 rounded-xl bg-gradient-to-br from-[#1a1230] to-[#0a0a0f] border border-white/10 hover:border-acc-gold/50 transition-colors"
        >
            {/* Glowing Border Effect */}
            <div className="absolute inset-0 rounded-xl bg-acc-gold/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex items-center gap-4">
                {/* Icon: Intersecting Orbits */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-2 border-acc-gold/30 rounded-full border-t-transparent"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 border-2 border-blue-400/30 rounded-full border-b-transparent"
                    />
                    <span className="text-acc-gold text-lg font-bold drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">
                        {score}%
                    </span>
                </div>

                {/* Text Content */}
                <div>
                    <h4 className="text-acc-gold font-cinzel font-bold text-sm tracking-widest uppercase mb-1 flex items-center gap-2">
                        {label}
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </h4>
                    <p className="text-xs text-dim leading-relaxed max-w-[200px]">
                        {description || "Saju and Astrology both point to this conclusion."}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
