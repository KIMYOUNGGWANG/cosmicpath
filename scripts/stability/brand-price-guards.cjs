const { assertMatch, assertNoMatch } = require('./guard-assertions.cjs');

function runBrandPriceGuards() {
  assertMatch(
    'src/lib/product-positioning.ts',
    /PUBLIC_DECISION_NOTE_NAME = 'CosmicPath Decision Note'[\s\S]*PAID_DECISION_REPORT_NAME_EN = '7-Day Decision Packet'[\s\S]*PAID_DECISION_REPORT_NAME_KO = '7일 결정 패킷'[\s\S]*READING_PRODUCT_PRICE_CENTS = 399/s,
    'Product positioning should declare the public umbrella, paid report names, and 399-cent contract'
  );
  assertMatch(
    'src/lib/payment/payment-config.ts',
    /prod_TgwKnGfpJBusty[\s\S]*prod_ThdoB65NmPU37y[\s\S]*PAID_DECISION_REPORT_NAME_EN/s,
    'Reading product should reuse the existing Stripe reading products with the paid report fallback label'
  );
  assertMatch(
    'src/lib/payment/payment-config.ts',
    /name:\s*PAID_DECISION_REPORT_NAME_EN[\s\S]*price:\s*READING_PRODUCT_PRICE_CENTS/s,
    'Reading product should keep the paid report fallback amount at $3.99'
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
    /one-time 7-Day Decision Packet[\s\S]*7일 결정 패킷[\s\S]*\$3\.99 USD[\s\S]*Stripe checkout/s,
    'Terms should disclose the one-time $3.99 Stripe checkout boundary for the paid report'
  );
  assertMatch(
    'src/app/terms/page.tsx',
    /7일 결정 패킷[\s\S]*\$3\.99 USD[\s\S]*단건 디지털 리포트/s,
    'Korean terms should disclose the paid report $3.99 one-time digital report boundary'
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
    /'@type':\s*'Service'[\s\S]*name:\s*'CosmicPath Decision Note'[\s\S]*alternateName:\s*'7-Day Decision Packet'/,
    'Global JSON-LD should expose the public umbrella and paid report names'
  );
  assertMatch(
    'src/components/seo/json-ld.tsx',
    /name:\s*'7-Day Decision Packet',\s*price:\s*'3\.99'/,
    'Global JSON-LD should expose the paid report offer at $3.99'
  );
  assertNoMatch(
    'src/components/seo/json-ld.tsx',
    /name:\s*'Detailed\s+Decision\s+Note'[\s\S]{0,140}9\.99/,
    'Global JSON-LD should not retain the stale $9.99 legacy paid offer'
  );
  assertMatch(
    'src/app/payment/success/page.tsx',
    /Your one-time \$3\.99 7-Day Decision Packet is opening now\./,
    'Payment success should use the paid report product name and one-time $3.99 price'
  );
  assertNoMatch(
    'src/app/payment/success/page.tsx',
    /Detailed\s+Decision\s+Note[\s\S]{0,180}(?:\$9\.99|9\.99)|(?:\$9\.99|9\.99)[\s\S]{0,180}Detailed\s+Decision\s+Note/,
    'Payment success should not retain stale $9.99 legacy paid copy'
  );
  assertNoMatch(
    'src/app/billing/success/page.tsx',
    /Detailed\s+Decision\s+Note[\s\S]{0,180}(?:\$9\.99|9\.99)|(?:\$9\.99|9\.99)[\s\S]{0,180}Detailed\s+Decision\s+Note/,
    'Billing success should not introduce stale legacy paid pricing copy'
  );
}

module.exports = { runBrandPriceGuards };
