const { assertPureLocAtMost } = require('./guard-assertions.cjs');

const SIZE_LIMITS = [
  ['src/app/start/page.tsx', 'Start page should stay below the 250 pure LOC ceiling after extracting start-flow orchestration'],
  ['src/app/start/use-start-resume.ts', 'Start resume hook should stay below the 250 pure LOC ceiling after splitting snapshot and premium resume logic'],
  ['src/app/start/start-result-stage.tsx', 'Start result stage should stay below the 250 pure LOC ceiling after extracting result action panels'],
  ['src/components/payment/PaymentModal.tsx', 'PaymentModal should stay below the 250 pure LOC ceiling after extracting checkout, frame, and paywall UI responsibilities'],
  ['src/components/payment/PaymentModalFrame.tsx', 'PaymentModalFrame should stay below the 250 pure LOC ceiling'],
  ['src/components/payment/PaymentModalContent.tsx', 'PaymentModalContent should stay below the 250 pure LOC ceiling'],
  ['src/components/payment/PaymentModalForm.tsx', 'PaymentModalForm should stay below the 250 pure LOC ceiling'],
  ['src/components/payment/PaymentModalPricePanel.tsx', 'PaymentModalPricePanel should stay below the 250 pure LOC ceiling'],
  ['src/components/payment/PaymentModalSections.tsx', 'PaymentModalSections should stay below the 250 pure LOC ceiling'],
  ['src/components/payment/payment-modal-copy.ts', 'Payment modal copy should stay below the 250 pure LOC ceiling'],
  ['scripts/verify-stability-guards.cjs', 'Stability verifier entrypoint should stay below the 250 pure LOC ceiling'],
  ['src/app/api/webhook/stripe/route.ts', 'Stripe webhook route should stay below the 250 pure LOC ceiling'],
  ['src/app/payment/success/page.tsx', 'Payment success page should stay below the 250 pure LOC ceiling'],
  ['src/lib/followup-jobs.ts', 'Follow-up jobs public module should stay below the 250 pure LOC ceiling'],
  ['src/lib/followup-runner.ts', 'Follow-up runner should stay below the 250 pure LOC ceiling'],
  ['src/lib/payment/stripe-checkout-session.ts', 'Stripe checkout session service should stay below the 250 pure LOC ceiling'],
  ['src/lib/payment/stripe-premium-reading.ts', 'Stripe premium reading service should stay below the 250 pure LOC ceiling'],
  ['src/lib/payment/stripe-subscription-sync.ts', 'Stripe subscription sync service should stay below the 250 pure LOC ceiling'],
];

function runSizeGuards() {
  for (const [filePath, message] of SIZE_LIMITS) {
    assertPureLocAtMost(filePath, 250, message);
  }
}

module.exports = { runSizeGuards };
