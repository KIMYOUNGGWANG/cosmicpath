import { CosmicTagEnum, UnifiedReadingResultSchema } from '../lib/cosmic/schema';

async function testSchema() {
    console.log('🧪 Testing Cosmic Schema...');

    // 1. Test Tag Enum
    try {
        CosmicTagEnum.parse('WEALTH_WINDFALL');
        console.log('✅ Tag Enum Validated');
    } catch (e) {
        console.error('❌ Tag Enum Failed', e);
        process.exit(1);
    }

    // 2. Test Unified Result (Mock Data)
    const mockResult = {
        summary: 'Mock Summary',
        detailedContent: 'Detailed content...',
        primaryTags: ['WEALTH_WINDFALL', 'NEW_START'],
        totalConfidenceScore: 85,
        matchLevel: 'PERFECT',
        sources: [
            {
                source: 'SAJU',
                originalText: 'Original Saju Text',
                detectedTags: ['WEALTH_WINDFALL'],
                confidence: 0.9
            },
            {
                source: 'ASTROLOGY',
                originalText: 'Original Astro Text',
                detectedTags: ['NEW_START'],
                confidence: 0.85
            },
            {
                source: 'TAROT',
                originalText: 'Original Tarot Text',
                detectedTags: ['WEALTH_WINDFALL'],
                confidence: 0.8
            }
        ]
    };

    try {
        UnifiedReadingResultSchema.parse(mockResult);
        console.log('✅ Unified Result Schema Validated');
    } catch (e) {
        console.error('❌ Unified Result Schema Failed', e);
        process.exit(1);
    }

    console.log('🎉 All Schema Tests Passed!');
}

testSchema();
