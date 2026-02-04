import { CosmicEngine } from '../lib/cosmic/engine';
import { SingleReadingResult } from '../lib/cosmic/schema';

async function testEngine() {
    console.log('🧪 Testing Cosmic Engine Logic...');

    // Mock Inputs
    const mockSaju: SingleReadingResult = {
        source: 'SAJU',
        originalText: 'Year of wealth.',
        detectedTags: ['WEALTH_WINDFALL', 'CAREER_PROMOTION'],
        confidence: 0.9
    };

    const mockAstro: SingleReadingResult = {
        source: 'ASTROLOGY',
        originalText: 'Jupiter entering 2nd house.',
        detectedTags: ['WEALTH_WINDFALL', 'NEW_START'],
        confidence: 0.85
    };

    const mockTarot: SingleReadingResult = {
        source: 'TAROT',
        originalText: 'Ace of Pentacles.',
        detectedTags: ['WEALTH_WINDFALL'], // 3rd overlap!
        confidence: 0.8
    };

    // 1. Test Perfect Match
    console.log('\n--- Case 1: Perfect Match ---');
    const result1 = CosmicEngine.unifyReadings([mockSaju, mockAstro, mockTarot]);

    console.log('Primary Tags:', result1.primaryTags);
    console.log('Score:', result1.totalConfidenceScore);
    console.log('Level:', result1.matchLevel);

    if (!result1.primaryTags.includes('WEALTH_WINDFALL')) {
        console.error('❌ Failed to detect WEALTH_WINDFALL as primary tag');
        process.exit(1);
    }

    if (result1.matchLevel !== 'PERFECT') {
        console.error('❌ Match level should be PERFECT');
        process.exit(1);
    }

    // 2. Test Partial Match / Conflict
    console.log('\n--- Case 2: Divergence ---');
    const mockDivergent: SingleReadingResult = {
        source: 'TAROT',
        originalText: 'The Tower',
        detectedTags: ['WEALTH_LOSS'],
        confidence: 0.9
    };

    const result2 = CosmicEngine.unifyReadings([mockSaju, mockDivergent]);
    console.log('Primary Tags:', result2.primaryTags);
    console.log('Score:', result2.totalConfidenceScore);
    console.log('Level:', result2.matchLevel);

    // Expect lower score and PARTIAL or CONFLICT
    if (result2.totalConfidenceScore >= result1.totalConfidenceScore) {
        console.error('❌ Divergent reading should have lower score');
        process.exit(1);
    }

    console.log('🎉 All Engine Tests Passed!');
}

testEngine();
