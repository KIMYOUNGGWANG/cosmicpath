'use client';

import { motion } from 'framer-motion';
import { Heart, Users, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SoulmateData {
    ideal_traits: string[];
    meeting_period: string;
    compatibility_score: number;
    description: string;
    warnings?: string;
}

interface SoulmateSectionProps {
    data: SoulmateData;
    language?: 'ko' | 'en';
}

export function SoulmateSection({ data, language = 'ko' }: SoulmateSectionProps) {
    const isEn = language === 'en';

    if (!data) return null;

    // Compatibility color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-gold';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return isEn ? 'Excellent Match' : '최상의 궁합';
        if (score >= 60) return isEn ? 'Good Match' : '좋은 궁합';
        if (score >= 40) return isEn ? 'Fair Match' : '보통 궁합';
        return isEn ? 'Challenging' : '도전적 궁합';
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 px-4 md:px-6"
        >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Heart size={18} className="text-pink-400" />
                {isEn ? 'Soulmate Analysis' : '운명의 상대 분석'}
            </h2>

            <div className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20 rounded-2xl p-5 space-y-5">
                {/* Compatibility Score */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                            <Sparkles className="text-pink-400" size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">{isEn ? 'Compatibility Score' : '궁합 점수'}</p>
                            <p className={cn("text-2xl font-bold", getScoreColor(data.compatibility_score))}>
                                {data.compatibility_score}%
                            </p>
                        </div>
                    </div>
                    <span className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-full border",
                        data.compatibility_score >= 60
                            ? "bg-green-500/10 border-green-500/30 text-green-300"
                            : "bg-orange-500/10 border-orange-500/30 text-orange-300"
                    )}>
                        {getScoreLabel(data.compatibility_score)}
                    </span>
                </div>

                {/* Meeting Period */}
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                    <Calendar className="text-gold mt-0.5" size={18} />
                    <div>
                        <p className="text-xs text-gray-400 mb-1">{isEn ? 'Predicted Meeting Period' : '만남 예상 시기'}</p>
                        <p className="text-sm text-white font-medium">{data.meeting_period}</p>
                    </div>
                </div>

                {/* Ideal Traits */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="text-purple-400" size={16} />
                        <p className="text-sm font-medium text-gray-300">{isEn ? 'Ideal Partner Traits' : '이상적 파트너 특성'}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.ideal_traits.map((trait, idx) => (
                            <span
                                key={idx}
                                className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200"
                            >
                                ✨ {trait}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {data.description}
                    </p>
                </div>

                {/* Warnings */}
                {data.warnings && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-300 flex items-start gap-2">
                            <span className="mt-0.5">⚠️</span>
                            <span>{data.warnings}</span>
                        </p>
                    </div>
                )}
            </div>
        </motion.section>
    );
}
