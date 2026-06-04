# PaymentModal Checkout Browser/HTTP QA Evidence

## Paid Checkout

- Command: `npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium`
- Result: `2 passed`
- Relevant test: `paywall starts paid checkout with saved reading context`
- Browser/HTTP observations:
  - Browser opens the Next Move paywall through the real `/start` flow.
  - Route mock captures `/api/reading/save`.
  - Route mock captures `/api/payment`.
  - `/api/payment` body includes `readingId: qa-next-move-reading`, `accessKey: qa-access-key`, `language: ko`, and `source: next_move_report_mvp_v1`.
  - Browser navigates to the checkout URL returned by the mocked payment API.

## Free Promo

- Command: `npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium`
- Result: `2 passed`
- Relevant test: `paywall redeems free promo with email and no Stripe checkout request`
- Browser/HTTP observations:
  - Blank email shows the required-email error.
  - Invalid email shows the email-format error.
  - Valid email posts `/api/promo/redeem`.
  - `/api/payment` request count remains `0`.
  - Browser redirects to `/start?paid=true&reading_id=qa-next-move-reading`.
  - Browser session storage contains `payment_completed=true`, `promo_user=true`, and `is_premium_user=true`.

## Price Mismatch Regression

- Command: `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "paywall"`
- Result: `2 passed`
- Relevant test: `paywall pauses checkout when Stripe price contract mismatches`
- Observation: mismatch state renders `Stripe 가격 설정 불일치`, disables the checkout button, and the mocked `/api/payment` route is not called.
