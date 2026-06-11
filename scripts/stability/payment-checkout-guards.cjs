const { assertMatch, assertNoMatch } = require('./guard-assertions.cjs');

function runPaymentCheckoutGuards() {
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
}

module.exports = { runPaymentCheckoutGuards };
