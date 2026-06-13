import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const growthAnalyticsPath = '../src/lib/growth-analytics.ts';
const { getCanonicalGrowthEvent } = await import(growthAnalyticsPath) as {
  getCanonicalGrowthEvent: (event: string) => string;
};
const growthMetadataPath = '../src/lib/growth-metadata.ts';
const { sanitizeGrowthMetadata } = await import(growthMetadataPath) as {
  sanitizeGrowthMetadata: (metadata: Record<string, unknown> | undefined) => Record<string, unknown>;
};

const SUPPORTED_SCENARIOS = ['canonical', 'source', 'followup', 'all'] as const;
type Scenario = (typeof SUPPORTED_SCENARIOS)[number];

class UnsupportedScenarioError extends Error {
  constructor(scenario: string) {
    super(`Unsupported growth funnel scenario: ${scenario}`);
    this.name = 'UnsupportedScenarioError';
  }
}

function readProjectFile(path: string): string {
  return readFileSync(path, 'utf8');
}

function parseScenario(argv: readonly string[]): Scenario {
  const scenarioFlagIndex = argv.findIndex((value) => value === '--scenario');
  const scenario = scenarioFlagIndex === -1 ? 'all' : argv[scenarioFlagIndex + 1];
  if (!scenario || !isScenario(scenario)) throw new UnsupportedScenarioError(scenario ?? '<missing>');
  return scenario;
}

function isScenario(value: string): value is Scenario {
  return SUPPORTED_SCENARIOS.some((scenario) => scenario === value);
}

function assertPaywallCanonicalContract(): void {
  assert.equal(getCanonicalGrowthEvent('paywall_view'), 'paywall_view');
  assert.equal(getCanonicalGrowthEvent('paywall_open'), 'paywall_view');
  assert.equal(getCanonicalGrowthEvent('first_result_view'), 'first_result_view');
  assert.equal(getCanonicalGrowthEvent('checkout_success'), 'paid_conversion');
  console.log('paywall_view_canonical_contract');
}

function assertCheckoutIntentSourceContract(): void {
  const startTracking = readProjectFile('src/app/start/use-start-growth-tracking.ts');
  const checkout = readProjectFile('src/components/payment/use-reading-checkout.ts');
  assert.ok(startTracking.includes("event: 'paywall_view'"));
  assert.ok(startTracking.includes("funnelStep: 'free_result_pay_cta_exposed'"));
  assert.ok(startTracking.includes("conversionSource: 'free_result'"));
  assert.ok(checkout.includes('checkoutIntentId'));
  assert.ok(checkout.includes('conversionSource: input.trackingSource'));
  console.log('checkout_intent_source_contract');
}

function assertFollowupFeedbackStageContract(): void {
  const metrics = readProjectFile('src/lib/growth-metrics.ts');
  assert.equal(getCanonicalGrowthEvent('followup_start'), 'followup_start');
  assert.ok(metrics.includes('followupSeeds'));
  assert.ok(metrics.includes('followupStarts'));
  assert.ok(metrics.includes('resultToFollowupSeedRate'));
  console.log('followup_feedback_stage_contract');
}

function assertGrowthMetadataPrivacyContract(): void {
  const growthMetadata = readProjectFile('src/lib/growth-metadata.ts');
  const heroSection = readProjectFile('src/components/landing/HeroSection.tsx');
  const rawQuestionMetadataPattern = 'question: ' + 'item.question';
  assert.ok(growthMetadata.includes('sanitizeGrowthMetadata'));
  assert.ok(growthMetadata.includes('SENSITIVE_METADATA_KEY_PARTS'));
  assert.ok(growthMetadata.includes('ALLOWED_QUESTION_METADATA_KEYS'));
  assert.ok(!heroSection.includes(rawQuestionMetadataPattern));
  assert.deepEqual(
    sanitizeGrowthMetadata({
      birthDate: '1999-01-01',
      contactName: 'Alex',
      email: 'alex@example.com',
      handle: '@alex',
      hasPrefilledQuestion: true,
      landingVariant: 'home',
      nested: {
        partnerBirthTime: '03:00',
        promptId: 'primary',
        question: 'raw private question',
        safeBucket: 'decision-home',
      },
      promptId: 'sample-love',
      questionLength: 42,
      rawQuestionText: 'private text',
      readingData: { name: 'Reader' },
      safeArray: [
        { phone: '555-0100', promptId: 'array-prompt' },
        { questionLength: 9, userName: 'reader' },
      ],
    }),
    {
      hasPrefilledQuestion: true,
      landingVariant: 'home',
      nested: {
        promptId: 'primary',
        safeBucket: 'decision-home',
      },
      promptId: 'sample-love',
      questionLength: 42,
      safeArray: [
        { promptId: 'array-prompt' },
        { questionLength: 9 },
      ],
    }
  );
  console.log('growth_metadata_privacy_contract');
}

function runScenario(scenario: Scenario): void {
  if (scenario === 'canonical' || scenario === 'all') assertPaywallCanonicalContract();
  if (scenario === 'source' || scenario === 'all') assertCheckoutIntentSourceContract();
  if (scenario === 'followup' || scenario === 'all') assertFollowupFeedbackStageContract();
  if (scenario === 'all') assertGrowthMetadataPrivacyContract();
}

try {
  runScenario(parseScenario(process.argv.slice(2)));
  console.log('Growth funnel verification passed');
} catch (error) {
  if (error instanceof UnsupportedScenarioError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
