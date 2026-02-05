import { z } from 'zod';

// 1. Universal Tags (Top 20 for MVP)
export const CosmicTagEnum = z.enum([
    // Fortune / Wealth
    'WEALTH_WINDFALL', // 횡재수
    'WEALTH_LOSS',     // 손재수
    'WEALTH_STEADY',   // 정재 (안정적 수입)

    // Career / Business
    'CAREER_PROMOTION',// 승진/합격
    'CAREER_CHANGE',   // 이직/변동
    'CAREER_PRESSURE', // 압박감/스트레스
    'NEW_START',       // 새로운 시작

    // Relationship
    'LOVE_NEW',        // 새로운 인연
    'LOVE_CONFLICT',   // 갈등/다툼
    'LOVE_DEEPENING',  // 관계 심화
    'LOVE_BREAKUP',    // 이별수

    // General / Health / Psyche
    'HEALTH_CAUTION',  // 건강 주의
    'MENTAL_STRESS',   // 정신적 피로
    'PEACE_STABILITY', // 평온/안정
    'CAUTION',         // 망신/구설수

    // Cosmic Specific
    'KARMA_CYCLE',     // 업보/인과
    'DESTINY_MOMENT',  // 운명적 순간
]);

export type CosmicTag = z.infer<typeof CosmicTagEnum>;

// 2. Source- Specific Result (The Input)
export const SingleReadingResultSchema = z.object({
    source: z.enum(['SAJU', 'ASTROLOGY', 'TAROT']),
    originalText: z.string(), // Raw text from the engine/LLM
    detectedTags: z.array(CosmicTagEnum), // Tags identified in this specific reading
    confidence: z.number().min(0).max(1), // Internal confidence of this single reading
});

export type SingleReadingResult = z.infer<typeof SingleReadingResultSchema>;

// 3. Unified Result (The Output)
export const UnifiedReadingResultSchema = z.object({
    // The synthesis
    summary: z.string(), // One-liner summary
    detailedContent: z.string(), // Full unified interpretation

    // The "Evidence"
    primaryTags: z.array(CosmicTagEnum), // The tags that appeared most frequently/strongly
    conflictingTags: z.array(CosmicTagEnum).optional(), // Tags that clashed

    // Metrics
    totalConfidenceScore: z.number().min(0).max(100), // 0-100 Score
    matchLevel: z.enum(['PERFECT', 'PARTIAL', 'CONFLICT']), // For Badge UI

    // Source Breakdown (for Tooltips)
    sources: z.array(SingleReadingResultSchema),
});

export type UnifiedReadingResult = z.infer<typeof UnifiedReadingResultSchema>;
