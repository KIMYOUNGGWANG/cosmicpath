'use client';

import { UnifiedReadingDisplay } from '@/components/cosmic/UnifiedReadingDisplay';
import { UnifiedReadingResult } from '@/lib/cosmic/schema';

export default function CosmicTestPage() {
    const mockUnifiedResult: UnifiedReadingResult = {
        summary: "Your career is poised for a major breakthrough, but financial caution is advised.",
        detailedContent: `
      The convergence of your Saju's Wealth Star and Jupiter's transit indicates a strong period for career advancement. 
      However, the Tarot's 'Tower' warning suggests specific risks in speculative investments. 
      The 'New Start' energy is dominant, supported by 2 sources.
    `,
        primaryTags: ['CAREER_PROMOTION', 'NEW_START', 'WEALTH_LOSS'],
        conflictingTags: [],
        totalConfidenceScore: 88,
        matchLevel: 'PERFECT',
        sources: [
            {
                source: 'SAJU',
                originalText: '...',
                detectedTags: ['CAREER_PROMOTION', 'WEALTH_WINDFALL'],
                confidence: 0.9
            },
            {
                source: 'ASTROLOGY',
                originalText: '...',
                detectedTags: ['CAREER_PROMOTION', 'NEW_START'],
                confidence: 0.85
            },
            {
                source: 'TAROT',
                originalText: '...',
                detectedTags: ['WEALTH_LOSS', 'NEW_START'],
                confidence: 0.8
            }
        ]
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                Cosmic Engine Prototype
            </h1>

            <div className="flex flex-col gap-8 md:flex-row max-w-6xl mx-auto">
                {/* Left: Control / Input (Mock) */}
                <div className="w-full md:w-1/3 bg-white/5 p-6 rounded-xl border border-white/10">
                    <h2 className="text-lg font-semibold mb-4 text-slate-300">Input Simulation</h2>
                    <div className="space-y-4 text-sm text-slate-400">
                        <div className="p-3 bg-black/30 rounded">
                            <span className="block text-yellow-500 font-bold">SAJU</span>
                            Sign of Career Promotion.
                        </div>
                        <div className="p-3 bg-black/30 rounded">
                            <span className="block text-purple-500 font-bold">ASTROLOGY</span>
                            Jupiter Trine Sun (New Start).
                        </div>
                        <div className="p-3 bg-black/30 rounded">
                            <span className="block text-pink-500 font-bold">TAROT</span>
                            The Tower (Wealth Loss).
                        </div>
                    </div>
                </div>

                {/* Right: The Output */}
                <div className="w-full md:w-2/3">
                    <UnifiedReadingDisplay result={mockUnifiedResult} />
                </div>
            </div>
        </div>
    );
}
