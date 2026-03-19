
import { MODEL_CONFIG } from '../lib/ai/llm-client';

async function verifyModelConfig() {
    console.log('🧪 Verifying Model Configuration...');

    const tiers = ['free', 'basic', 'premium'] as const;
    let allPassed = true;

    for (const tier of tiers) {
        const config = MODEL_CONFIG[tier];
        console.log(`Tier [${tier}]: Provider=${config.provider}, Model=${config.model}`);

        if (config.model !== 'gemini-3-flash-preview') {
            console.error(`❌ Error: Tier ${tier} is NOT using gemini-3-flash-preview! Found: ${config.model}`);
            allPassed = false;
        }
    }

    if (allPassed) {
        console.log('✅ All tiers successfully unified to Gemini 3 Flash!');
    } else {
        process.exit(1);
    }
}

verifyModelConfig();
