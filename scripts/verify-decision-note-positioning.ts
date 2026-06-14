import { strict as assert } from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';

type DeclaredSurface = {
  readonly filePath: string;
  readonly description: string;
};

type BannedPhrase = {
  readonly label: string;
  readonly pattern: RegExp;
};

const PUBLIC_PRODUCT_NAME = 'CosmicPath Decision Note';
const CAMPAIGN_EXPERIENCE_NAME = 'Next Move Ritual';
const HISTORICAL_REPORT_NAME = 'Next Move Report';
const PAID_PRODUCT_NAME_EN = 'Detailed 3-Layer Decision Report';
const PAID_PRODUCT_NAME_KO = '상세 3단 판정 리포트';
const ROLE_EXPLANATION_EN = 'Saju = structure, astrology = timing, tarot = immediate signal';
const OPTIONAL_GAEUN_ACTION_CONTRACT =
  '`free_focus.gaeun_action` is a backward-compatible public optional field, not a breaking wire replacement.';
const NEXT_MOVE_REPORT_PUBLIC_BRAND_PATTERN = new RegExp(
  '`?Next Move Report`?\\s+is\\s+the\\s+' +
    'public acquisition brand',
  'i'
);
const COSMICPATH_LEGACY_INTERNAL_PATTERN = new RegExp(
  'CosmicPath\\s+remains\\s+only\\s+' +
    'legacy/internal',
  'i'
);

const DECLARED_SURFACES = [
  { filePath: 'src/lib/product-positioning.ts', description: 'shared product-positioning contract' },
  { filePath: 'src/lib/payment/payment-config.ts', description: 'Stripe reading product fallback contract' },
  { filePath: 'src/app/terms/page.tsx', description: 'legal terms paid-product disclosure' },
  { filePath: 'src/app/payment/success/page.tsx', description: 'checkout success paid-product copy' },
  { filePath: 'src/components/seo/json-ld.tsx', description: 'global structured data' },
  { filePath: 'src/components/payment/PaymentModalPricePanel.tsx', description: 'checkout price panel copy' },
  { filePath: 'src/components/reading/FinalVerdictCard.tsx', description: 'final verdict three-layer role copy' },
  { filePath: 'src/app/start/start-result-decision-brief.tsx', description: 'locked report offer copy' },
  { filePath: 'src/app/start/start-result-followup-panel.tsx', description: 'follow-up loop product metadata and copy' },
  { filePath: 'src/app/en/contact-timing/page.tsx', description: 'English contact timing positioning surface' },
  { filePath: 'src/components/Pricing/PricingSection.tsx', description: 'pricing section paid report copy' },
  { filePath: 'docs/api-spec.md', description: 'truthful active API and offer contract docs' },
  { filePath: 'docs/revenue/next-move-report-mvp-operating-loop.md', description: 'Next Move Ritual operating loop docs' },
  { filePath: 'scripts/stability/brand-price-guards.cjs', description: 'brand and price stability guard' },
  { filePath: 'scripts/stability/english-sitemap-guards.cjs', description: 'English sitemap stability guard' },
  { filePath: 'tests/e2e/payment-price-consistency.spec.ts', description: 'payment price E2E contract' },
  { filePath: 'tests/e2e/followup-loop.spec.ts', description: 'follow-up E2E contract' },
  { filePath: 'scripts/verify-followup-loop.ts', description: 'follow-up contract verifier' },
  { filePath: 'scripts/test-refactor-regression.sh', description: 'legacy regression contract script' },
] as const satisfies readonly DeclaredSurface[];

const BANNED_PHRASES = [
  { label: 'Saju-first', pattern: /\bSaju-first\b/i },
  { label: '사주-first', pattern: /사주-first/i },
  { label: 'AI astrology app', pattern: /\bAI astrology app\b/i },
  { label: 'daily horoscope', pattern: /\bdaily horoscope\b/i },
  { label: '선택적 근거 레이어', pattern: /선택적 근거 레이어/ },
  { label: 'standalone public CosmicPath 3단분석', pattern: /CosmicPath 3단분석/ },
  { label: 'optional evidence', pattern: /\boptional evidence\b/i },
  { label: '50-page paid report claim', pattern: /\b50-page\b/i },
  { label: 'one report all answers claim', pattern: /\bOne Report, All Answers\b/i },
  { label: 'Full Reading', pattern: /\bFull Reading\b/ },
  { label: '전체 해석', pattern: /전체 해석/ },
  { label: 'active paid-copy legacy name', pattern: /\bDetailed Decision Note\b/i },
  { label: 'legacy Saju percentage copy', pattern: /\bSaju 50%\b/i },
  { label: 'legacy astrology percentage copy', pattern: /\bAstro 30%\b/i },
  { label: 'legacy tarot percentage copy', pattern: /\bTarot 20%\b/i },
  { label: 'report as acquisition brand', pattern: NEXT_MOVE_REPORT_PUBLIC_BRAND_PATTERN },
  { label: 'standalone legacy containment', pattern: COSMICPATH_LEGACY_INTERNAL_PATTERN },
] as const satisfies readonly BannedPhrase[];

function readSurface(surface: DeclaredSurface): string {
  assert.ok(
    existsSync(surface.filePath),
    `Missing declared decision-positioning surface: ${surface.filePath} (${surface.description})`
  );
  return readFileSync(surface.filePath, 'utf8');
}

function readSurfaceIfPresent(surface: DeclaredSurface): string | undefined {
  if (!existsSync(surface.filePath)) {
    return undefined;
  }
  return readFileSync(surface.filePath, 'utf8');
}

function assertSurfaceHas(surfaceText: string, needle: string, message: string): void {
  assert.ok(surfaceText.includes(needle), message);
}

function assertSurfaceHasPattern(surfaceText: string, pattern: RegExp, message: string): void {
  assert.match(surfaceText, pattern, message);
}

const surfaceEntries = DECLARED_SURFACES.map((surface) => ({
  surface,
  text: readSurface(surface),
}));

function getDeclaredSurfaceText(filePath: string): string {
  const entry = surfaceEntries.find((candidate) => candidate.surface.filePath === filePath);
  assert.ok(entry, `Missing loaded decision-positioning surface: ${filePath}`);
  return entry.text;
}

const combinedSurfaceText = surfaceEntries.map((entry) => entry.text).join('\n');

for (const entry of surfaceEntries) {
  for (const bannedPhrase of BANNED_PHRASES) {
    assert.equal(
      bannedPhrase.pattern.test(entry.text),
      false,
      `${entry.surface.filePath} must not contain banned positioning phrase: ${bannedPhrase.label}`
    );
  }
}

assertSurfaceHas(
  combinedSurfaceText,
  PUBLIC_PRODUCT_NAME,
  `Declared surfaces should keep the public umbrella name ${PUBLIC_PRODUCT_NAME}.`
);
assertSurfaceHas(
  combinedSurfaceText,
  CAMPAIGN_EXPERIENCE_NAME,
  `Declared surfaces should keep ${CAMPAIGN_EXPERIENCE_NAME} as the bounded campaign experience name.`
);
assertSurfaceHas(
  combinedSurfaceText,
  `\`${HISTORICAL_REPORT_NAME}\` is historical/campaign-only`,
  `${HISTORICAL_REPORT_NAME} must be constrained to historical/campaign-only usage.`
);
assertSurfaceHas(
  combinedSurfaceText,
  PAID_PRODUCT_NAME_EN,
  `Declared surfaces should expose the paid product name ${PAID_PRODUCT_NAME_EN}.`
);
assertSurfaceHas(
  combinedSurfaceText,
  PAID_PRODUCT_NAME_KO,
  `Declared surfaces should expose the Korean paid product name ${PAID_PRODUCT_NAME_KO}.`
);
assertSurfaceHas(
  combinedSurfaceText,
  ROLE_EXPLANATION_EN,
  'Declared surfaces should explain the three-layer roles as Saju = structure, astrology = timing, tarot = immediate signal.'
);
assertSurfaceHas(
  combinedSurfaceText,
  OPTIONAL_GAEUN_ACTION_CONTRACT,
  'Declared surfaces should pin gaeun_action as an optional backward-compatible field.'
);

const apiSpec = getDeclaredSurfaceText('docs/api-spec.md');
const nextMoveRitualLoop = getDeclaredSurfaceText('docs/revenue/next-move-report-mvp-operating-loop.md');
const strategyCanvas = readSurfaceIfPresent({
  filePath: 'docs/strategy/product-strategy-canvas.md',
  description: 'optional local strategy canvas naming reconciliation',
});
assertSurfaceHas(apiSpec, 'type NextMoveRitualSource = "next_move_report_mvp_v1";', 'API spec must preserve the existing source key under the ritual naming layer.');
assertSurfaceHas(apiSpec, 'gaeun_action?: string;', 'API spec must document gaeun_action as an optional additive field.');
assertSurfaceHas(nextMoveRitualLoop, '`Next Move Ritual` is a bounded campaign/experience layer.', 'Operating loop must scope Next Move Ritual to campaign/experience usage.');
if (strategyCanvas !== undefined) {
  assertSurfaceHas(strategyCanvas, 'This canvas remains legacy strategy context', 'Strategy canvas must declare that older product language is historical context.');
}

const paymentConfig = readSurface({ filePath: 'src/lib/payment/payment-config.ts', description: 'payment config' });
assertSurfaceHas(paymentConfig, 'prod_TgwKnGfpJBusty', 'Reading product must preserve the test fallback Stripe product ID.');
assertSurfaceHas(paymentConfig, 'prod_ThdoB65NmPU37y', 'Reading product must preserve the live fallback Stripe product ID.');
assertSurfaceHasPattern(paymentConfig, /productId:\s*readingProductId/, 'READING_PRODUCT.productId must still resolve from readingProductId.');
assertSurfaceHasPattern(paymentConfig, /price:\s*READING_PRODUCT_PRICE_CENTS|price:\s*399/, 'Reading product must preserve the 399-cent fallback price.');

const termsPage = readSurface({ filePath: 'src/app/terms/page.tsx', description: 'terms page' });
assertSurfaceHasPattern(termsPage, /\$3\.99 USD[\s\S]*Stripe checkout|Stripe checkout[\s\S]*\$3\.99 USD/, 'Terms must disclose one-time $3.99 USD Stripe checkout.');

const jsonLd = readSurface({ filePath: 'src/components/seo/json-ld.tsx', description: 'JSON-LD' });
assertSurfaceHasPattern(jsonLd, /price:\s*'3\.99'/, 'JSON-LD paid offer must expose the $3.99 price.');

const systemCorePrompt = readSurface({ filePath: 'src/lib/ai/prompts/system-core.ts', description: 'system prompt core' });
const threeLayerSynthesis = readSurface({ filePath: 'src/lib/ai/three-layer-synthesis.ts', description: 'three-layer synthesis prompt contract' });
assertSurfaceHas(
  threeLayerSynthesis,
  'Claim -> Evidence -> User implication -> Action boundary',
  'Three-layer synthesis must define a premium verdict paragraph contract.'
);
assertSurfaceHas(
  threeLayerSynthesis,
  'A missing layer is not silently replaced',
  'Three-layer synthesis must forbid fabricating or silently replacing missing source evidence.'
);
assertSurfaceHas(
  systemCorePrompt,
  'buildThreeLayerVerdictQualityContract',
  'System prompt core must import and include the shared three-layer verdict quality contract.'
);
assertSurfaceHasPattern(
  systemCorePrompt,
  /const\s+verdictQualityContract\s*=\s*buildThreeLayerVerdictQualityContract\(language\)/,
  'System prompt core must build the shared three-layer verdict quality contract for the active language.'
);
assertSurfaceHas(
  systemCorePrompt,
  '${verdictQualityContract}',
  'System prompt core must inject the three-layer verdict quality contract block into the runtime prompt.'
);

console.log('decision_positioning_contract public=CosmicPath Decision Note paid=Detailed 3-Layer Decision Report price=$3.99');
console.log('three_layer_roles Saju=structure astrology=timing tarot=immediate_signal');
console.log('Decision Note positioning verification passed');
