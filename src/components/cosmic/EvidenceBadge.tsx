'use client';

import { CosmicTag } from '@/lib/cosmic/schema';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, Info } from 'lucide-react';

interface EvidenceBadgeProps {
    tag: CosmicTag;
    sources: string[]; // e.g., ['SAJU', 'ASTROLOGY']
    score: number; // 0-100
    isConflict?: boolean;
}

export function EvidenceBadge({ tag, sources, score, isConflict }: EvidenceBadgeProps) {
    // Format tag text (e.g., WEALTH_WINDFALL -> Wealth Windfall)
    const formatTag = (t: string) => t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border
        ${isConflict
                    ? 'bg-red-500/10 text-red-200 border-red-500/30'
                    : 'bg-indigo-500/10 text-indigo-200 border-indigo-500/30'}
      `}
        >
            {isConflict ? <AlertTriangle size={14} /> : <Sparkles size={14} />}

            <span>#{formatTag(tag)}</span>

            {/* Evidence Tooltip Trigger (simplified for MVP) */}
            <div className="flex -space-x-1 ml-1 tool-tip" title={`Backed by ${sources.join(', ')} (Confidence: ${score}%)`}>
                {sources.includes('SAJU') && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                {sources.includes('ASTROLOGY') && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                {sources.includes('TAROT') && <div className="w-2 h-2 rounded-full bg-pink-500" />}
            </div>
        </motion.div>
    );
}
