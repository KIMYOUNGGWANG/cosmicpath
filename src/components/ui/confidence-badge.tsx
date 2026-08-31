'use client';

/**
 * 신뢰도 뱃지 컴포넌트
 */

import { motion } from 'framer-motion';

interface ConfidenceBadgeProps {
    score: number;  // 1-5
    percentage: number;
    message: string;
    showDetails?: boolean;
}

export function ConfidenceBadge({
    score,
    percentage,
    message,
    showDetails = true
}: ConfidenceBadgeProps) {
    const renderStars = () => {
        return Array.from({ length: 5 }).map((_, index) => (
            <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={index < score ? 'text-yellow-400' : 'text-gray-600'}
            >
                {index < score ? '⭐' : '☆'}
            </motion.span>
        ));
    };

    const getLevel = () => {
        if (score >= 4) return { class: 'confidence-high', label: '높음' };
        if (score >= 3) return { class: 'confidence-medium', label: '보통' };
        return { class: 'confidence-low', label: '낮음' };
    };

    const level = getLevel();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
        >
            <div className={`confidence-badge ${level.class}`}>
                <span className="flex">{renderStars()}</span>
                <span className="ml-2">{percentage}%</span>
                <span className="ml-2">신뢰도 {level.label}</span>
            </div>

            {showDetails && (
                <p className="text-sm text-gray-400">{message}</p>
            )}
        </motion.div>
    );
}

/**
 * 근거 툴팁 컴포넌트
 */

interface EvidenceTooltipProps {
    tag: string;
    sources: string[];
    explanation?: string;
}

export function EvidenceTooltip({ tag, sources, explanation }: EvidenceTooltipProps) {
    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'saju': return '☯️';
            case 'astrology': return '✨';
            case 'ziwei': return '🏛️';
            case 'numerology': return '🔢';
            case 'thai': return '👑';
            case 'tarot': return '🃏';
            default: return '📌';
        }
    };

    const getSourceName = (source: string) => {
        switch (source) {
            case 'saju': return '사주';
            case 'astrology': return '점성술';
            case 'ziwei': return '자미두수';
            case 'numerology': return '수비학';
            case 'thai': return '태국 점성술';
            case 'tarot': return '타로';
            default: return source;
        }
    };

    return (
        <div className="group relative inline-block">
            <span className="evidence-tag">
                {tag}
            </span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="glass-card p-3 min-w-[200px] text-sm">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {sources.map(source => (
                            <span key={source} className="text-xs px-2 py-1 rounded bg-white/5">
                                {getSourceIcon(source)} {getSourceName(source)}
                            </span>
                        ))}
                    </div>
                    {explanation && (
                        <p className="text-gray-400 text-xs">{explanation}</p>
                    )}
                </div>
                {/* Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-white/5 rotate-45 border-r border-b border-white/10" />
            </div>
        </div>
    );
}

/**
 * 로딩 스타 애니메이션
 */

export function LoadingStars() {
    return (
        <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map(index => (
                <motion.span
                    key={index}
                    className="text-2xl"
                    animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.2,
                    }}
                >
                    ⭐
                </motion.span>
            ))}
        </div>
    );
}

/**
 * 분석 단계 표시 컴포넌트
 */

interface AnalysisStepProps {
    steps: string[];
    currentStep: number;
}

export function AnalysisSteps({ steps, currentStep }: AnalysisStepProps) {
    return (
        <div className="space-y-3">
            {steps.map((step, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                        opacity: index <= currentStep ? 1 : 0.4,
                        x: 0
                    }}
                    transition={{ delay: index * 0.3 }}
                    className="flex items-center gap-3"
                >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm
            ${index < currentStep ? 'bg-green-500' :
                            index === currentStep ? 'bg-gold animate-pulse' :
                                'bg-gray-700'}`}
                    >
                        {index < currentStep ? '✓' : index + 1}
                    </div>
                    <span className={index === currentStep ? 'text-gold' : ''}>
                        {step}
                        {index === currentStep && (
                            <span className="ml-2 inline-block animate-pulse">...</span>
                        )}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}
