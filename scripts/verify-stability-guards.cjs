const fs = require('fs');
const path = require('path');

function read(filePath) {
  return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
}

function assertMatch(filePath, pattern, message) {
  const content = read(filePath);
  if (!pattern.test(content)) {
    throw new Error(`${message} [${filePath}]`);
  }
}

function assertNoMatch(filePath, pattern, message) {
  const content = read(filePath);
  if (pattern.test(content)) {
    throw new Error(`${message} [${filePath}]`);
  }
}

function pureLoc(filePath) {
  return read(filePath)
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed !== '' && !trimmed.startsWith('//') && !trimmed.startsWith('#');
    })
    .length;
}

function assertPureLocAtMost(filePath, maxLoc, message) {
  const count = pureLoc(filePath);
  if (count > maxLoc) {
    throw new Error(`${message}: ${count} > ${maxLoc} [${filePath}]`);
  }
}

function run() {
  assertPureLocAtMost(
    'src/app/start/page.tsx',
    250,
    'Start page should stay below the 250 pure LOC ceiling after extracting start-flow orchestration'
  );
  assertPureLocAtMost(
    'src/app/start/use-start-resume.ts',
    250,
    'Start resume hook should stay below the 250 pure LOC ceiling after splitting snapshot and premium resume logic'
  );
  assertPureLocAtMost(
    'src/app/start/start-result-stage.tsx',
    250,
    'Start result stage should stay below the 250 pure LOC ceiling after extracting result action panels'
  );

  assertPureLocAtMost(
    'src/components/payment/PaymentModal.tsx',
    250,
    'PaymentModal should stay below the 250 pure LOC ceiling after extracting checkout, frame, and paywall UI responsibilities'
  );
  assertPureLocAtMost(
    'src/components/payment/PaymentModalFrame.tsx',
    250,
    'PaymentModalFrame should stay below the 250 pure LOC ceiling'
  );
  assertPureLocAtMost(
    'src/components/payment/PaymentModalContent.tsx',
    250,
    'PaymentModalContent should stay below the 250 pure LOC ceiling'
  );
  assertPureLocAtMost(
    'src/components/payment/PaymentModalForm.tsx',
    250,
    'PaymentModalForm should stay below the 250 pure LOC ceiling'
  );
  assertPureLocAtMost(
    'src/components/payment/PaymentModalPricePanel.tsx',
    250,
    'PaymentModalPricePanel should stay below the 250 pure LOC ceiling'
  );
  assertPureLocAtMost(
    'src/components/payment/PaymentModalSections.tsx',
    250,
    'PaymentModalSections should stay below the 250 pure LOC ceiling'
  );
  assertPureLocAtMost(
    'src/components/payment/payment-modal-copy.ts',
    250,
    'Payment modal copy should stay below the 250 pure LOC ceiling'
  );

  assertMatch(
    'src/app/start/start-page-helpers.ts',
    /next_move_report_mvp_v1/,
    'Start flow should recognize the Next Move Report MVP source'
  );
  assertMatch(
    'src/lib/payment/payment-config.ts',
    /prod_TgwKnGfpJBusty[\s\S]*prod_ThdoB65NmPU37y[\s\S]*Detailed Decision Note/s,
    'Reading product should reuse the existing Stripe reading products with the rebranded fallback label'
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
  assertNoMatch(
    'src/components/landing/Navigation.tsx',
    /href="\/daily"|href="\/career\/uncertainty"|>\s*PRO\s*</,
    'Primary landing navigation should not expose legacy Daily/Career/PRO acquisition'
  );
  assertMatch(
    'src/lib/ai/prompt-shared-rules.ts',
    /buildRelationshipDecisionSafetyRule[\s\S]*guaranteed reply[\s\S]*무조건 답장[\s\S]*stalking[\s\S]*스토킹/i,
    'Shared prompt rules should include explicit relationship reply-guarantee and stalking boundaries'
  );
  assertMatch(
    'src/app/api/reading/route-helpers.ts',
    /계속 확인/,
    'Free reading high-risk terms should include repeated checking'
  );
  assertMatch(
    'src/app/api/reading/route-helpers.ts',
    /찾아가/,
    'Free reading high-risk terms should include showing-up behavior'
  );
  assertMatch(
    'src/app/api/reading/route-helpers.ts',
    /buildRelationshipSafetyFreeFocus[\s\S]*보류[\s\S]*Hold[\s\S]*스토킹[\s\S]*pressure/i,
    'Free reading fallback should convert high-risk relationship pressure into hold guidance'
  );
  assertMatch(
    'src/components/payment/PaymentModal.tsx',
    /const isRelationshipContactTiming[\s\S]*trackingSource === 'next_move_report_mvp_v1'/,
    'PaymentModal should treat Next Move as relationship contact timing'
  );
  assertMatch(
    'src/components/payment/payment-modal-copy.ts',
    /message pressure or surveillance[\s\S]*감시성 확인/i,
    'Payment modal copy should preserve relationship contact timing safety copy'
  );
  assertMatch(
    'src/lib/growth-metrics.ts',
    /key:\s*'relationship-contact'[\s\S]*next_move_report_mvp_v1[\s\S]*relationship_contact_timing_v1/,
    'Growth readout should group Next Move with relationship contact history'
  );
  assertMatch(
    'src/lib/growth-metrics.ts',
    /NEXT_MOVE_REPORT_DECISION_THRESHOLDS[\s\S]*visits:\s*300[\s\S]*days:\s*14[\s\S]*questionStarts:\s*45[\s\S]*freeVerdicts:\s*30[\s\S]*paywallOpens:\s*8[\s\S]*paidConversions:\s*2[\s\S]*followupSeeds:\s*8/,
    'Growth readout should encode the 14-day Next Move decision thresholds'
  );
  assertMatch(
    'src/components/ops/GrowthDashboard.tsx',
    /Decision Timing 14-day decision gate[\s\S]*visits 300 or 14 days[\s\S]*question starts 45[\s\S]*paid conversions 2/,
    'Ops dashboard should render the Decision Timing continuation thresholds'
  );
  assertMatch(
    'src/app/relationship/contact-timing/page.tsx',
    /href="\/terms"[\s\S]*href="\/privacy"/,
    'Next Move public route should keep terms and privacy links visible'
  );
  assertMatch(
    'src/app/terms/page.tsx',
    /decision-support notes/,
    'Terms should disclose Next Move decision-support content'
  );
  assertMatch(
    'src/app/terms/page.tsx',
    /no guaranteed relationship, career, money, health, or life outcome[\s\S]*not therapy, medical, diagnostic, legal, or financial advice/s,
    'Terms should disclose Next Move relationship outcome and professional-advice boundaries'
  );
  assertMatch(
    'src/app/terms/page.tsx',
    /one-off detailed note[\s\S]*Stripe checkout/s,
    'Terms should disclose the Decision Note one-off Stripe checkout boundary'
  );
  assertMatch(
    'src/app/terms/page.tsx',
    /refund request may be limited once the note is generated or opened/,
    'Terms should disclose the generated/opened detailed-note refund boundary'
  );
  assertMatch(
    'src/app/privacy/page.tsx',
    /decision context[\s\S]*optional birth data[\s\S]*note restore and storage[\s\S]*analytics[\s\S]*do not paste highly sensitive third-party secrets/s,
    'Privacy policy should disclose Next Move relationship input, optional birth data, restore, analytics, and sensitive third-party secret boundaries'
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
    'src/app/en/contact-timing/page.tsx',
    /title:\s*'Contact Decision Note'[\s\S]*siteName:\s*'CosmicPath'[\s\S]*First Decision Note free · Detailed Decision Note via Stripe[\s\S]*Decision support only/s,
    'English contact timing route should keep CosmicPath as site brand and Decision Note as product name'
  );
  assertNoMatch(
    'src/app/en/contact-timing/page.tsx',
    /\$3\.99|COSMICPATH|siteName:\s*'Decision Note'/,
    'English contact timing route should not leak half-rebranded Decision Note site brand or $3.99 acquisition copy'
  );
  assertMatch(
    'src/components/landing/EnglishGuideSection.tsx',
    /Open Decision Note/,
    'English landing guide section should expose the Decision Note entry path'
  );
  assertMatch(
    'src/app/sitemap.ts',
    /\/relationship\/contact-timing[\s\S]*\/terms[\s\S]*\/privacy/s,
    'Sitemap should include the MVP route and legal pages'
  );
  assertNoMatch(
    'src/app/sitemap.ts',
    /\/daily|\/career\/uncertainty/,
    'Sitemap should not promote legacy Daily or Career acquisition routes during the Next Move MVP'
  );

  assertMatch(
    'src/components/payment/use-reading-price.ts',
    /getReadingFallbackPriceLabel/,
    'Reading price hook should use a fallback price label'
  );
  assertMatch(
    'src/components/payment/PaymentModalPricePanel.tsx',
    /Syncing live Stripe price|Stripe 실시간 가격을 확인하는 중입니다/,
    'PaymentModal should expose a loading state for price lookup'
  );
  assertMatch(
    'src/components/payment/use-reading-price.ts',
    /PRICE_LOOKUP_FALLBACK_CODE[\s\S]*READING_PRICE_LOOKUP_FALLBACK[\s\S]*hasBlockingPriceIssue/s,
    'Reading price hook should track fallback price lookup as a blocking checkout state'
  );
  assertMatch(
    'src/components/payment/PaymentModalPricePanel.tsx',
    /showPriceConfirmationBlocked[\s\S]*Stripe 가격 확인 보류/s,
    'Payment modal price panel should surface blocked Stripe price confirmation'
  );
  assertMatch(
    'src/components/payment/PaymentModalForm.tsx',
    /isCheckoutPausedForPriceIssue[\s\S]*결제 일시 중지/s,
    'Payment modal form should show paid checkout as paused when price confirmation is blocked'
  );
  assertMatch(
    'src/components/payment/PaymentModal.tsx',
    /const isCheckoutPausedForPriceIssue = priceState\.hasBlockingPriceIssue && !isFreePromo/,
    'PaymentModal should pause paid checkout when Stripe price confirmation is blocked'
  );
  assertMatch(
    'tests/e2e/next-move-report-paywall-price.spec.ts',
    /paywall pauses checkout when live Stripe price is unavailable[\s\S]*결제 일시 중지/,
    'Next Move E2E should prove unavailable Stripe price lookup blocks the paywall checkout button'
  );
  assertMatch(
    'tests/e2e/next-move-report-paywall-price.spec.ts',
    /metadata:\s*\{\s*fallback:\s*'true'\s*\}[\s\S]*paywall pauses checkout when live Stripe price falls back[\s\S]*결제 일시 중지/,
    'Next Move E2E should prove fallback Stripe price lookup blocks the paywall checkout button'
  );
  assertNoMatch(
    'src/components/payment/PaymentModal.tsx',
    /price \|\| fetchedPrice \|\| '\.\.\.'/,
    'PaymentModal should not fall back to an ellipsis price placeholder'
  );
  assertMatch(
    'src/components/payment/use-reading-checkout.ts',
    /startReadingCheckout[\s\S]*ReadingCheckoutResult/,
    'Reading checkout module should expose a typed checkout orchestration boundary'
  );
  assertMatch(
    'src/components/payment/use-reading-checkout.ts',
    /\/api\/reading\/save[\s\S]*\/api\/promo\/redeem[\s\S]*\/api\/payment/,
    'Reading checkout module should own reading save, promo redemption, and Stripe checkout creation'
  );
  assertMatch(
    'src/components/payment/use-reading-checkout.ts',
    /ReadingCheckoutResult[\s\S]*kind:\s*'redirect'[\s\S]*kind:\s*'free_promo'/,
    'Reading checkout module should return typed checkout outcomes for paid redirects and free promo unlocks'
  );
  assertMatch(
    'src/components/payment/PaymentModal.tsx',
    /useReadingCheckout/,
    'PaymentModal should delegate checkout orchestration to useReadingCheckout'
  );
  assertMatch(
    'src/components/payment/PaymentModalFrame.tsx',
    /createPortal[\s\S]*AnimatePresence[\s\S]*Close payment modal/,
    'PaymentModalFrame should own the portal, animation shell, and close control'
  );
  assertNoMatch(
    'src/components/payment/PaymentModal.tsx',
    /fetch\('\/api\/reading\/save'|fetch\('\/api\/promo\/redeem'|fetch\('\/api\/payment'/,
    'PaymentModal should not directly implement reading save, promo redeem, or Stripe checkout fetch calls'
  );
  assertMatch(
    'tests/e2e/next-move-report-paywall-checkout.spec.ts',
    /paywall starts paid checkout with saved reading context[\s\S]*expect\.stringMatching\(\s*\/\^prod_\/\s*\)[\s\S]*qa-access-key/,
    'Next Move checkout E2E should prove paid checkout keeps the saved reading context'
  );
  assertMatch(
    'tests/e2e/next-move-report-paywall-checkout.spec.ts',
    /paywall redeems free promo with email and no Stripe checkout request[\s\S]*promo-free-qa[\s\S]*paymentRequestCount\)\.toBe\(0\)/,
    'Next Move checkout E2E should prove free promo redemption does not create a Stripe checkout request'
  );

  assertMatch(
    'prisma/schema.prisma',
    /model Review[\s\S]*readingId\s+String\?\s+@unique/,
    'Review model should enforce one review per reading'
  );
  assertMatch(
    'src/app/api/review/route.ts',
    /hasReadingAccess/,
    'Review route should verify reading ownership or access key'
  );
  assertMatch(
    'src/app/api/review/route.ts',
    /status:\s*409/,
    'Review route should return 409 for duplicate review attempts'
  );

  assertMatch(
    'prisma/schema.prisma',
    /model GrowthEvent[\s\S]*@@index\(\[createdAt\]\)/,
    'GrowthEvent should have a createdAt index for range scans'
  );
  assertMatch(
    'src/lib/growth-metrics.ts',
    /select:\s*\{[\s\S]*createdAt:\s*true[\s\S]*event:\s*true[\s\S]*channel:\s*true[\s\S]*metadata:\s*true/,
    'Growth summary should use a narrow column select'
  );
  assertMatch(
    'src/app/api/growth/summary/route.ts',
    /NextResponse\.json\(summary\)/,
    'Growth summary route should keep the existing response shape contract'
  );

  console.log('verify:stability passed');
}

run();
