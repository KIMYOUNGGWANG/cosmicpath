'use client';

import { UnifiedReadingResult } from '@/lib/cosmic/schema';
import { EvidenceBadge } from './EvidenceBadge';
import { motion } from 'framer-motion';

interface UnifiedReadingDisplayProps {
    result: UnifiedReadingResult;
}

export function UnifiedReadingDisplay({ result }: UnifiedReadingDisplayProps) {
    return (
        <div className="max-w-2xl mx-auto p-6 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl space-y-6">
            {/* Header: Match Level & Score */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Cosmic Synthesis
                    </h2>
                    <span className={`px-2 py-0.5 text-xs rounded border ${result.matchLevel === 'PERFECT' ? 'border-green-500/50 text-green-400' :
                            result.matchLevel === 'CONFLICT' ? 'border-red-500/50 text-red-400' :
                                'border-yellow-500/50 text-yellow-400'
                        }`}>
                        {result.matchLevel} MATCH
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-white">{result.totalConfidenceScore}%</div>
                    <div className="text-xs text-slate-400">Trust Score</div>
                </div>
            </div>

            {/* Primary Tags (Evidence) */}
            <div className="flex flex-wrap gap-2">
                {result.primaryTags.map((tag) => {
                    // Find which sources detected this tag
                    const sources = result.sources
                        .filter(s => s.detectedTags.includes(tag))
                        .map(s => s.source);

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

            {/* Summary */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-lg text-slate-200 leading-relaxed font-serif">
                    "{result.summary}"
                </p>
            </div>

            {/* Detailed Content */}
            <div className="space-y-4 text-slate-300 text-sm">
                <div className="prose prose-invert max-w-none">
                    <p>{result.detailedContent}</p>
                </div>
            </div>

            {/* Source Breakdown (Mini Cards) */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                {result.sources.map((source) => (
                    <div key={source.source} className="p-2 rounded bg-black/20 text-xs">
                        <div className="font-bold text-slate-400 mb-1">{source.source}</div>
                        <div className="text-slate-500 truncate">{source.detectedTags.join(', ')}</div>
                        <div className="text-[10px] text-slate-600 mt-1">
                            {(source.confidence * 100).toFixed(0)}% Conf.
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
