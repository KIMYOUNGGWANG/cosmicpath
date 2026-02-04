import { CosmicTag, CosmicTagEnum, SingleReadingResult, UnifiedReadingResult } from './schema';

export class CosmicEngine {
    /**
     * Synthesize multiple readings into one unified result.
     */
    static unifyReadings(readings: SingleReadingResult[]): UnifiedReadingResult {
        if (readings.length === 0) {
            throw new Error("No readings provided");
        }

        // 1. Tag Aggregation & Scoring
        const tagScores = new Map<CosmicTag, number>();
        const tagCounts = new Map<CosmicTag, number>();

        readings.forEach(reading => {
            reading.detectedTags.forEach(tag => {
                const currentScore = tagScores.get(tag) || 0;
                tagScores.set(tag, currentScore + reading.confidence);

                const currentCount = tagCounts.get(tag) || 0;
                tagCounts.set(tag, currentCount + 1);
            });
        });

        // 2. Identify Primary Tags (Agreement >= 2 or High Confidence)
        const primaryTags: CosmicTag[] = [];

        tagCounts.forEach((count, tag) => {
            if (count >= 2) {
                primaryTags.push(tag);
            } else {
                // If single source but high confidence
                const score = tagScores.get(tag) || 0;
                if (score >= 0.8) {
                    primaryTags.push(tag);
                }
            }
        });

        // 3. Calculate Global Confidence
        // Improved Logic:
        // - Base: Average Source Confidence (0-50)
        // - Bonus: ONLY for Overlapping Tags (Count >= 2)

        const avgSourceConfidence = readings.reduce((sum, r) => sum + r.confidence, 0) / readings.length;

        // Count how many tags have overlap
        const overlappingTagsCount = Array.from(tagCounts.entries()).filter(([_, count]) => count >= 2).length;

        const overlapBonus = overlappingTagsCount * 20; // 20 points per overlapping tag (Harder to get)

        let totalScore = (avgSourceConfidence * 50) + overlapBonus;
        totalScore = Math.min(100, Math.round(totalScore));

        // 4. Determine Match Level
        let matchLevel: UnifiedReadingResult['matchLevel'] = 'PARTIAL';

        // PERFECT requires at least one overlap AND high score
        if (totalScore >= 80 && overlappingTagsCount >= 1) {
            matchLevel = 'PERFECT';
        } else if (overlappingTagsCount === 0 && totalScore < 60) {
            // If no overlap and mediocre score, it's conflicting or weak
            matchLevel = 'CONFLICT';
        }

        // 5. Generate Summary (Placeholder for LLM)
        const summary = `Synthesized ${readings.length} sources with match level: ${matchLevel}`;
        const detailedContent = `Detected primary themes: ${primaryTags.join(', ')}. Confidence Score: ${totalScore}/100.`;

        return {
            summary,
            detailedContent,
            primaryTags,
            conflictingTags: [], // TODO: Implement conflict logic defined in PRD
            totalConfidenceScore: totalScore,
            matchLevel,
            sources: readings
        };
    }
}
