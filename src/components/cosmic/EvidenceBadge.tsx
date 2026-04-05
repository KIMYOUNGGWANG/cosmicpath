'use client';

import { CosmicTag } from '@/lib/cosmic/schema';
import { motion } from 'framer-motion';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface EvidenceBadgeProps {
    tag: CosmicTag;
    sources: string[]; // e.g., ['SAJU', 'ASTROLOGY']
    score: number; // 0-100
    isConflict?: boolean;
}

export function EvidenceBadge({ tag, sources, score, isConflict }: EvidenceBadgeProps) {
    // Format tag text (e.g., WEALTH_WINDFALL -> Wealth Windfall)
    const formatTag = (value: string) =>
        value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
        inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium tracking-[0.08em]
        ${isConflict
                    ? 'border-red-400/30 bg-red-500/10 text-red-100'
                    : 'border-white/10 bg-white/[0.06] text-indigo-100 backdrop-blur-sm'}
      `}
        >
            {isConflict ? (
                <AlertTriangle size={14} className="text-red-300" />
            ) : (
                <Sparkles size={14} className="text-acc-gold" />
            )}

            <span className="leading-none">#{formatTag(tag)}</span>

            {/* Evidence Tooltip Trigger (simplified for MVP) */}
            <div className="ml-1 flex -space-x-1 tool-tip" title={`Backed by ${sources.join(', ')} (Confidence: ${score}%)`}>
                {sources.includes('SAJU') && <div className="h-2 w-2 rounded-full border border-[#18181b] bg-amber-300" />}
                {sources.includes('ASTROLOGY') && <div className="h-2 w-2 rounded-full border border-[#18181b] bg-violet-300" />}
                {sources.includes('TAROT') && <div className="h-2 w-2 rounded-full border border-[#18181b] bg-fuchsia-300" />}
            </div>
        </motion.div>
    );
}
