# PaymentModal Checkout Refactor ULW Brief

## Objective

Continue the Next Move Report refactor in small verified slices. The next slice extracts checkout/session creation responsibilities from `src/components/payment/PaymentModal.tsx` into typed payment modules without changing paywall behavior, price mismatch blocking, promo redemption, analytics, or redirects.

## Current Context

- The Next Move Report MVP pivot has already been implemented and reviewed in a prior ULW loop.
- The first refactor slice extracted live reading-price lookup into `src/components/payment/use-reading-price.ts`.
- `PaymentModal.tsx` is still above the 250 pure LOC ceiling and owns too many responsibilities.
- The worktree is dirty with existing MVP changes; do not revert unrelated files.
- This slice should reduce `PaymentModal.tsx` responsibility and leave user-facing behavior unchanged.

## Skill Survey

- `omo:ulw-loop`: required for durable goals, criteria, evidence, checkpoints, manual QA, and final reviewer gating.
- `omo:refactor`: required for safe extraction, codemap-first changes, and continuous verification.
- `omo:programming`: required because the touched files are TypeScript/TSX; new code must use strict types, `unknown` narrowing, readonly data, and typed outcomes.
- `testing-strategy`: relevant for characterization, regression, E2E, and edge-case coverage.
- `lint-and-validate`: relevant for final static validation receipts.
- `omo:review-work`: relevant for post-implementation review before declaring done.
- Browser or Playwright channel: required for real observable QA of paywall checkout behavior.
- `stripe-integration`: deferred because this slice should not change Stripe server routes or checkout contract.

## Target Surfaces

- `src/components/payment/PaymentModal.tsx`
- New checkout/session module under `src/components/payment/`
- `src/components/payment/use-reading-price.ts` only if integration requires it
- `tests/e2e/next-move-report.spec.ts`
- `scripts/verify-stability-guards.cjs`

## Success Criteria

### C001 - Paid Checkout Characterization

Given a Next Move paywall with live USD 9 price and a generated free report, when the user opens the paywall and starts paid checkout, then the app saves pending reading context, posts `/api/payment` with `READING_PRODUCT.productId`, saved `readingId`, saved `accessKey`, language, source, and referral fields, and navigates to the checkout URL returned by the mocked API.

Evidence required:
- Automated Playwright test covering the browser surface.
- Real browser/HTTP channel artifact showing the same scenario.
- Cleanup receipt showing no lingering dev server on the test port.

### C002 - Free Promo Characterization

Given a 100 percent promo unlock, when the user supplies a valid email and starts checkout, then the app redeems `/api/promo/redeem`, does not call `/api/payment`, sets premium/promo session flags, tracks success, and returns to `/start?paid=true` with the reading id when available.

Evidence required:
- Automated Playwright test or component-level characterization that observes requests and resulting browser/session state.
- Real browser/HTTP channel artifact showing the promo path.
- Cleanup receipt showing no lingering dev server on the test port.

### C003 - Price Mismatch Guard

Given the live Stripe price endpoint returns `READING_PRICE_CONTRACT_MISMATCH`, when the user opens the paywall, then paid checkout remains blocked and `/api/payment` is not called.

Evidence required:
- Existing or updated automated Playwright test remains green.
- Real browser/HTTP channel artifact or Playwright trace proving the disabled paywall button.
- Stability guard confirms the extracted checkout boundary still preserves mismatch blocking.

### C004 - Refactor Boundary

Given the checkout/session logic has been extracted, when static verification runs, then `PaymentModal.tsx` no longer directly owns checkout persistence, promo redeem, and Stripe session creation implementation details; those live in a typed payment module with no `any`, no unchecked catch swallowing, and no behavior-only string matching as the primary implementation.

Evidence required:
- RED then GREEN stability guard or targeted test proving the boundary.
- ESLint/build receipts for touched files.
- LOC receipt before and after the slice.

## Verification Commands

- `npm run verify:stability`
- `npx eslint src/components/payment/PaymentModal.tsx src/components/payment/use-reading-price.ts src/components/payment/use-reading-checkout.ts tests/e2e/next-move-report.spec.ts`
- `npm run build`
- `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "paywall"`
- `git diff --check`

## Stop Conditions

- If behavior changes are required beyond extraction, stop and record a blocked criterion.
- If Playwright cannot run because of environment limits, record the exact failure and use HTTP artifacts as fallback, but do not mark browser criteria complete without an observable UI/channel artifact.
- Do not commit unless explicitly requested.
