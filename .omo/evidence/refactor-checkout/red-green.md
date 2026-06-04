# PaymentModal Checkout Refactor RED/GREEN Evidence

Session: `payment-modal-checkout-refactor-20260603`

## RED

- Command: `npm run verify:stability`
- Result: failed before implementation.
- Expected failure: `ENOENT: no such file or directory ... src/components/payment/use-reading-checkout.ts`
- Meaning: the stability guard required a typed checkout boundary that did not exist yet.

## Characterization Baseline

- Command: `npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium`
- Result before extraction after test locator/env expectation fixes: `2 passed`
- Coverage:
  - Paid checkout posts `/api/payment` with saved `readingId`, `accessKey`, source, language, and a Next Move product id.
  - Free 100 percent promo validates email, posts `/api/promo/redeem`, keeps `/api/payment` request count at zero, sets premium session flags, and redirects to `/start?paid=true&reading_id=qa-next-move-reading`.

## GREEN

- Command: `npm run verify:stability`
- Result: `verify:stability passed`
- Command: `npx eslint src/components/payment/PaymentModal.tsx src/components/payment/use-reading-price.ts src/components/payment/use-reading-checkout.ts tests/e2e/next-move-report-paywall-checkout.spec.ts tests/e2e/next-move-report.spec.ts`
- Result: passed with zero output.

## Boundary Receipt

- `PaymentModal.tsx` delegates checkout work through `useReadingCheckout`.
- `PaymentModal.tsx` no longer directly calls `fetch('/api/reading/save')`, `fetch('/api/promo/redeem')`, or `fetch('/api/payment')`.
- `use-reading-checkout.ts` owns `/api/reading/save`, `/api/promo/redeem`, and `/api/payment`.
- `ReadingCheckoutResult` has typed outcomes for paid redirect and free promo redirect.
