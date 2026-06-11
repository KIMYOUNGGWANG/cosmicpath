const { assertMatch, assertNoMatch } = require('./guard-assertions.cjs');

function runBrandPriceGuards() {
  assertMatch(
    'src/lib/payment/payment-config.ts',
    /prod_TgwKnGfpJBusty[\s\S]*prod_ThdoB65NmPU37y[\s\S]*Detailed Decision Note/s,
    'Reading product should reuse the existing Stripe reading products with the rebranded fallback label'
  );
  assertMatch(
    'src/lib/payment/payment-config.ts',
    /name:\s*'Detailed Decision Note'[\s\S]*price:\s*399/s,
    'Reading product should keep the Detailed Decision Note fallback amount at $3.99'
  );
  assertNoMatch(
    'src/lib/payment/stripe.ts',
    /READING_PRICE_CONTRACT_MISMATCH|assertReadingProductPriceContract/,
    'Stripe reading lookup should use the existing product price instead of enforcing a Next Move-only price contract'
  );
  assertMatch(
    'src/app/relationship/contact-timing/page.tsx',
    /연락 결정 정리/,
    'Relationship MVP route should use the public decision-note brand'
  );
  assertNoMatch(
    'src/app/relationship/contact-timing/page.tsx',
    /\$3\.99/,
    'Relationship MVP route should not show the old $3.99 offer'
  );
  assertMatch(
    'src/app/terms/page.tsx',
    /one-off Detailed Decision Note[\s\S]*\$3\.99 USD[\s\S]*Stripe checkout/s,
    'Terms should disclose the Detailed Decision Note one-off $3.99 Stripe checkout boundary'
  );
  assertMatch(
    'src/app/terms/page.tsx',
    /자세한 기록[\s\S]*\$3\.99 USD[\s\S]*단건 디지털 노트/s,
    'Korean terms should disclose the Detailed Decision Note $3.99 one-off digital note boundary'
  );
  assertMatch(
    'src/app/terms/page.tsx',
    /refund request may be limited once the note is generated or opened/,
    'Terms should disclose the generated/opened detailed-note refund boundary'
  );
  assertMatch(
    'src/components/seo/json-ld.tsx',
    /'@type':\s*'Organization'[\s\S]*name:\s*'CosmicPath'[\s\S]*legalName:\s*"Tony's Company"/,
    'Global JSON-LD should retain CosmicPath as the organization brand with the legal operator separated'
  );
  assertMatch(
    'src/components/seo/json-ld.tsx',
    /'@type':\s*'WebSite'[\s\S]*name:\s*'CosmicPath'/,
    'Global JSON-LD should retain CosmicPath as the website brand'
  );
  assertMatch(
    'src/components/seo/json-ld.tsx',
    /'@type':\s*'Service'[\s\S]*name:\s*'Decision Note'[\s\S]*alternateName:\s*'Detailed Decision Note'/,
    'Global JSON-LD should expose Decision Note as the product/service name'
  );
  assertMatch(
    'src/components/seo/json-ld.tsx',
    /name:\s*'Detailed Decision Note',\s*price:\s*'3\.99'/,
    'Global JSON-LD should expose the Detailed Decision Note paid offer at $3.99'
  );
  assertNoMatch(
    'src/components/seo/json-ld.tsx',
    /name:\s*'Detailed Decision Note'[\s\S]{0,140}9\.99/,
    'Global JSON-LD should not retain the stale $9.99 Detailed Decision Note offer'
  );
  assertMatch(
    'src/app/payment/success/page.tsx',
    /Your Detailed Decision Note is opening now\./,
    'Payment success should use the Detailed Decision Note product name for Next Move checkout'
  );
  assertNoMatch(
    'src/app/payment/success/page.tsx',
    /Detailed Decision Note[\s\S]{0,180}(?:\$9\.99|9\.99)|(?:\$9\.99|9\.99)[\s\S]{0,180}Detailed Decision Note/,
    'Payment success should not retain stale $9.99 Detailed Decision Note copy'
  );
  assertNoMatch(
    'src/app/billing/success/page.tsx',
    /Detailed Decision Note[\s\S]{0,180}(?:\$9\.99|9\.99)|(?:\$9\.99|9\.99)[\s\S]{0,180}Detailed Decision Note/,
    'Billing success should not introduce stale Detailed Decision Note pricing copy'
  );
}

module.exports = { runBrandPriceGuards };
