# PaymentModal Checkout Refactor

## TL;DR
> Summary:      Extract checkout persistence, reading save, promo redemption, and Stripe session creation out of `PaymentModal.tsx` into typed payment modules while preserving the current Next Move paywall behavior.
> Deliverables:
> - Typed checkout result/input contracts under `src/components/payment/`
> - Extracted browser storage and checkout API helpers
> - `useReadingCheckout` / `startReadingCheckout` orchestration module
> - PaymentModal integration with no direct checkout fetch calls and lower pure LOC than the 726 baseline
> - RED/GREEN stability, Playwright, lint/build, browser/HTTP evidence, cleanup receipts, and final reviewer approval
> Effort:       Medium
> Risk:         Medium - checkout behavior spans browser storage, redirects, promo redemption, mocked e2e routes, and existing dirty-tree MVP changes

## Scope
### Must have
- Preserve C001 from `.omo/ulw-loop/payment-modal-checkout-refactor-20260603/goals.json:17`: paid checkout saves pending reading context, posts `/api/payment` with `productId`, saved `readingId`, saved `accessKey`, `source`, `language`, and referral data, then navigates to the mocked checkout URL.
- Preserve C002 from `.omo/ulw-loop/payment-modal-checkout-refactor-20260603/goals.json:25`: 100 percent promo requires a valid email, redeems `/api/promo/redeem`, makes zero `/api/payment` requests, sets premium/promo flags, tracks success, and redirects to `/start?paid=true`.
- Preserve C003 from `.omo/ulw-loop/payment-modal-checkout-refactor-20260603/goals.json:33`: Stripe price mismatch keeps paid checkout paused, `PaymentModal` delegates checkout orchestration, and `PaymentModal` pure LOC decreases from 726.
- Keep visual paywall copy/layout behavior in `src/components/payment/PaymentModal.tsx:409` through `src/components/payment/PaymentModal.tsx:780` unless a minimal prop/callback adjustment is needed for integration.
- Keep `useReadingPrice` as the price lookup owner from `src/components/payment/use-reading-price.ts:45`; this slice must not move price lookup.
- Keep all new TypeScript modules strict: `readonly` input/result shapes, no `any`, no `@ts-ignore`, no unchecked catch swallowing, and no untyped JSON assumptions.
- Work with the existing dirty tree; stage only the task files listed in each commit.

### Must NOT have (guardrails, anti-slop, scope boundaries)
- Do not change Stripe server routes, product pricing, promo validation semantics, or database schema.
- Do not introduce Toss/KRW, subscriptions, account gating, new public routes, or new package scripts.
- Do not rewrite the modal UI body, benefits copy, animations, or pricing display beyond removing checkout handler responsibility.
- Do not remove existing Next Move MVP tests or weaken price mismatch, legal, growth, or legacy-route guards.
- Do not revert unrelated dirty worktree changes.
- Do not declare completion from tests alone; each criterion needs browser/HTTP or source-contract evidence plus cleanup.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: TDD + characterization-first using Playwright, `scripts/verify-stability-guards.cjs`, `scripts/test-refactor-regression.sh`, targeted ESLint, `tsc --noEmit`, and `npm run build`
- QA policy: every task has agent-executed scenarios
- Evidence: `.omo/evidence/task-<N>-<slug>.<ext>`

## Execution strategy
### Parallel execution waves
> Target 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks to maximize parallelism.

Wave 1 (no dependencies):
- Task 1: Add checkout boundary guards and capture the 726 LOC baseline
- Task 2: Pin paid checkout and payment-failure browser characterization
- Task 3: Pin free promo and price-mismatch browser characterization
- Task 4: Define typed checkout contracts

Wave 2 (after Wave 1):
- Task 5: depends [4] - extract checkout storage helpers
- Task 6: depends [4] - extract checkout API helpers
- Task 7: depends [4, 5, 6] - implement `startReadingCheckout` / `useReadingCheckout`

Wave 3 (after Wave 2):
- Task 8: depends [1, 2, 3, 7] - integrate `PaymentModal` and pass full checkout gates

Critical path: Task 4 -> Task 5 + Task 6 -> Task 7 -> Task 8

### Dependency matrix
| Task | Depends on | Blocks | Can parallelize with |
|------|------------|--------|----------------------|
| 1    | none       | 8      | 2, 3, 4              |
| 2    | none       | 8      | 1, 3, 4              |
| 3    | none       | 8      | 1, 2, 4              |
| 4    | none       | 5, 6, 7 | 1, 2, 3             |
| 5    | 4          | 7      | 6                    |
| 6    | 4          | 7      | 5                    |
| 7    | 4, 5, 6    | 8      | none                 |
| 8    | 1, 2, 3, 7 | Final  | none                 |

## Todos
> Implementation + Test = ONE task. Never separate.
> Every task MUST have: References + Acceptance Criteria + QA Scenarios + Commit.

- [ ] 1. Add checkout boundary guards and baseline receipts

  What to do: Update `scripts/verify-stability-guards.cjs` so the checkout extraction is enforced by source contracts, not reviewer memory. Keep the existing `use-reading-checkout.ts` expectations, adjust them if helper modules are introduced, add a pure LOC assertion that requires `src/components/payment/PaymentModal.tsx` to be below the 726 baseline after integration, and add explicit absence checks for direct checkout fetch calls and checkout persistence writes in `PaymentModal`.
  Must NOT do: Do not make the guard pass by relaxing the checkout-module ownership check. Do not touch product code in this task.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [8] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `scripts/verify-stability-guards.cjs:8` - `assertMatch` contract-check pattern to extend.
  - Pattern:  `scripts/verify-stability-guards.cjs:15` - `assertNoMatch` absence-check pattern to extend.
  - Pattern:  `scripts/verify-stability-guards.cjs:194` - existing checkout-module guard start.
  - Pattern:  `scripts/verify-stability-guards.cjs:204` - existing `PaymentModal` must use `useReadingCheckout` assertion.
  - Pattern:  `scripts/verify-stability-guards.cjs:209` - existing direct fetch absence assertion.
  - Pattern:  `src/components/payment/PaymentModal.tsx:208` - current `handlePayment` starts the checkout responsibility to extract.
  - Pattern:  `src/components/payment/PaymentModal.tsx:242` - current direct checkout persistence writes.
  - Pattern:  `src/components/payment/PaymentModal.tsx:282` - current direct `/api/reading/save` call.
  - Pattern:  `src/components/payment/PaymentModal.tsx:317` - current direct `/api/promo/redeem` call.
  - Pattern:  `src/components/payment/PaymentModal.tsx:359` - current direct `/api/payment` call.
  - Test:     `package.json:9` - `npm test` is the existing refactor regression command.
  - Test:     `package.json:10` - `npm run verify:stability` is the existing stability guard command.
  - External: `https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage` - browser session persistence behavior.

  Acceptance criteria (agent-executable only):
  - [ ] `mkdir -p .omo/evidence && awk '!/^[[:space:]]*$/ && !/^[[:space:]]*\\/\\//' src/components/payment/PaymentModal.tsx | wc -l > .omo/evidence/task-1-paymentmodal-loc-baseline.txt` writes `726` before integration.
  - [ ] `npm run verify:stability > .omo/evidence/task-1-stability-red.txt 2>&1; test $? -ne 0` fails for the right reason before Task 8: missing checkout module, direct checkout fetches, or LOC still at baseline.
  - [ ] `node -e "const fs=require('fs'); const s=fs.readFileSync('scripts/verify-stability-guards.cjs','utf8'); if(!/PaymentModal pure LOC/.test(s) || !/use-reading-checkout/.test(s)) process.exit(1)"` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  > Name the exact tool AND its exact invocation - not "verify it works". Browser use: use Chrome to drive the page; if Chrome is not available, download and use agent-browser (https://github.com/vercel-labs/agent-browser). Computer use: OS-level GUI automation for a non-browser desktop app.
  ```
  Scenario: Baseline LOC is recorded
    Tool:     bash
    Steps:    mkdir -p .omo/evidence && awk '!/^[[:space:]]*$/ && !/^[[:space:]]*\/\//' src/components/payment/PaymentModal.tsx | wc -l > .omo/evidence/task-1-paymentmodal-loc-baseline.txt
    Expected: .omo/evidence/task-1-paymentmodal-loc-baseline.txt contains 726.
    Evidence: .omo/evidence/task-1-paymentmodal-loc-baseline.txt

  Scenario: Boundary guard is RED before extraction
    Tool:     bash
    Steps:    npm run verify:stability > .omo/evidence/task-1-stability-red.txt 2>&1; test $? -ne 0
    Expected: Command exits 0 because `verify:stability` failed before extraction, and the artifact mentions `use-reading-checkout`, direct checkout fetch ownership, or PaymentModal LOC.
    Evidence: .omo/evidence/task-1-stability-red.txt
  ```

  Commit: YES | Message: `test(payment): guard checkout extraction boundary` | Files: [`scripts/verify-stability-guards.cjs`]

- [ ] 2. Pin paid checkout and payment-failure browser characterization

  What to do: Strengthen `tests/e2e/next-move-report-paywall-checkout.spec.ts` so paid checkout proves saved reading context, `READING_PRODUCT.productId`, saved `readingId`, saved `accessKey`, `source`, `language`, and referral propagation. Add a payment-session failure case that returns an error from `/api/payment`, verifies the user does not navigate to checkout, and verifies `checkout_failure` is tracked. Capture request JSON and a redirect/failure screenshot under `.omo/evidence/`.
  Must NOT do: Do not couple the test to private implementation names in `use-reading-checkout`; assert only browser-visible requests, storage, events, and URL outcomes.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [8] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `tests/e2e/next-move-report-paywall-checkout.spec.ts:7` - `parseJsonRecord` request-body parser pattern.
  - Pattern:  `tests/e2e/next-move-report-paywall-checkout.spec.ts:13` - growth tracking mock pattern.
  - Pattern:  `tests/e2e/next-move-report-paywall-checkout.spec.ts:69` - `/api/reading/save` mock and captured request pattern.
  - Pattern:  `tests/e2e/next-move-report-paywall-checkout.spec.ts:83` - `openNextMovePaywall` user-flow helper.
  - Pattern:  `tests/e2e/next-move-report-paywall-checkout.spec.ts:93` - paid checkout test to strengthen.
  - API/Type: `src/lib/payment/payment-config.ts:17` - `READING_PRODUCT.productId` source.
  - API/Type: `src/app/api/payment/route.ts:16` - server expects `productId`, `email`, `readingId`, `accessKey`, `referralCode`, `promoCodeId`, `discount`, `language`, and `source`.
  - API/Type: `src/app/api/payment/route.ts:96` - server creates Stripe checkout session and returns `url`.
  - Pattern:  `src/components/payment/PaymentModal.tsx:263` - current `checkout_start` tracking.
  - Pattern:  `src/components/payment/PaymentModal.tsx:385` - current `checkout_failure` tracking.
  - External: `https://playwright.dev/docs/mock` - route mocking pattern.
  - External: `https://playwright.dev/docs/test-assertions` - URL and UI assertion pattern.

  Acceptance criteria (agent-executable only):
  - [ ] `mkdir -p .omo/evidence && npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium --grep "paid checkout" --reporter=list > .omo/evidence/task-2-paid-checkout-green.txt 2>&1` exits 0.
  - [ ] `.omo/evidence/task-2-paid-checkout-requests.json` contains exactly one `/api/reading/save` request and one `/api/payment` request.
  - [ ] `.omo/evidence/task-2-paid-checkout-requests.json` shows `productId`, `readingId: "qa-next-move-reading"`, `accessKey: "qa-access-key"`, `language: "ko"`, `source: "next_move_report_mvp_v1"`, and a referral field.
  - [ ] `.omo/evidence/task-2-payment-failure-green.txt` shows the failure-path test passed and `checkout_failure` was captured.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: Paid checkout keeps saved reading context
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence && npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium --grep "paywall starts paid checkout with saved reading context" --reporter=list > .omo/evidence/task-2-paid-checkout-green.txt 2>&1
    Expected: Test passes; request artifact contains productId, readingId, accessKey, language, source, referral; screenshot shows mocked checkout URL.
    Evidence: .omo/evidence/task-2-paid-checkout-green.txt

  Scenario: Payment API failure does not navigate
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence && npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium --grep "payment session failure" --reporter=list > .omo/evidence/task-2-payment-failure-green.txt 2>&1
    Expected: Test passes; URL does not include checkout_session_mock; growth events include checkout_failure; screenshot shows the modal or alert-handled state.
    Evidence: .omo/evidence/task-2-payment-failure-green.txt
  ```

  Commit: YES | Message: `test(payment): pin paid checkout session behavior` | Files: [`tests/e2e/next-move-report-paywall-checkout.spec.ts`]

- [ ] 3. Pin free promo and price-mismatch browser characterization

  What to do: Keep the free-promo path in `tests/e2e/next-move-report-paywall-checkout.spec.ts` and the price-mismatch path in `tests/e2e/next-move-report.spec.ts` strong enough to catch refactor drift. Free promo must cover missing email, invalid email, successful `/api/promo/redeem`, zero `/api/payment` requests, premium/promo session flags, `checkout_success`, and `/start?paid=true&reading_id=qa-next-move-reading`. Price mismatch must keep `/api/payment` as a sentinel that fails if paid checkout is attempted.
  Must NOT do: Do not remove the existing mismatch test from `next-move-report.spec.ts`; it protects the price hook and modal disabled state.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [8] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `tests/e2e/next-move-report-paywall-checkout.spec.ts:127` - free promo test to preserve and strengthen.
  - Pattern:  `tests/e2e/next-move-report-paywall-checkout.spec.ts:135` - promo validate route mock.
  - Pattern:  `tests/e2e/next-move-report-paywall-checkout.spec.ts:142` - promo redeem route mock.
  - Pattern:  `tests/e2e/next-move-report-paywall-checkout.spec.ts:150` - `/api/payment` zero-request sentinel.
  - Pattern:  `tests/e2e/next-move-report-paywall-checkout.spec.ts:185` - session flag polling assertions.
  - Pattern:  `tests/e2e/next-move-report.spec.ts:137` - price-contract mismatch test.
  - Pattern:  `tests/e2e/next-move-report.spec.ts:145` - 409 `READING_PRICE_CONTRACT_MISMATCH` mock.
  - Pattern:  `tests/e2e/next-move-report.spec.ts:194` - `/api/payment` should stay blocked sentinel.
  - API/Type: `src/app/api/promo/redeem/route.ts:7` - promo redeem request schema.
  - Pattern:  `src/components/payment/PaymentModal.tsx:221` - price mismatch blocks paid checkout unless free promo.
  - Pattern:  `src/components/payment/PaymentModal.tsx:334` - free promo premium/session flags.
  - External: `https://playwright.dev/docs/mock` - route mocking pattern.
  - External: `https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage` - session flag behavior.

  Acceptance criteria (agent-executable only):
  - [ ] `mkdir -p .omo/evidence && npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium --grep "free promo" --reporter=list > .omo/evidence/task-3-free-promo-green.txt 2>&1` exits 0.
  - [ ] `mkdir -p .omo/evidence && npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "price contract mismatches" --reporter=list > .omo/evidence/task-3-price-mismatch-green.txt 2>&1` exits 0.
  - [ ] `.omo/evidence/task-3-free-promo-state.json` records `paymentRequestCount: 0`, `isPremiumUser: "true"`, `paymentCompleted: "true"`, and `promoUser: "true"`.
  - [ ] `.omo/evidence/task-3-price-mismatch-green.txt` shows the mismatch test passed with the checkout button disabled.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: Free promo redeems without Stripe checkout
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence && npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium --grep "paywall redeems free promo with email and no Stripe checkout request" --reporter=list > .omo/evidence/task-3-free-promo-green.txt 2>&1
    Expected: Test passes; state artifact proves one promo redeem request, zero payment requests, premium flags, and paid redirect.
    Evidence: .omo/evidence/task-3-free-promo-green.txt

  Scenario: Stripe price mismatch still blocks paid checkout
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence && npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "paywall pauses checkout when Stripe price contract mismatches" --reporter=list > .omo/evidence/task-3-price-mismatch-green.txt 2>&1
    Expected: Test passes; `/api/payment` sentinel is not called; button text is `결제 일시 중지` and disabled.
    Evidence: .omo/evidence/task-3-price-mismatch-green.txt
  ```

  Commit: YES | Message: `test(payment): pin promo and mismatch checkout behavior` | Files: [`tests/e2e/next-move-report-paywall-checkout.spec.ts`, `tests/e2e/next-move-report.spec.ts`]

- [ ] 4. Define typed checkout contracts

  What to do: Add the typed checkout contracts under `src/components/payment/`. Prefer `src/components/payment/reading-checkout-types.ts` if helper modules are used, or place them at the top of `src/components/payment/use-reading-checkout.ts` if the implementation stays single-file. Required contracts: readonly input shape for reading data/current report/metadata/email/promo/referral/language/source/decisionAccepted, saved reading context shape, paid session payload shape, free promo payload shape, and `ReadingCheckoutResult` discriminated union with `kind: 'redirect'` and `kind: 'free_promo'`.
  Must NOT do: Do not use `any`, type assertions to force JSON shape, or default exports.

  Parallelization: Can parallel: YES | Wave 1 | Blocks: [5, 6, 7] | Blocked by: []

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `src/components/payment/PaymentModal.tsx:15` - existing modal prop shape and metadata fields to model.
  - Pattern:  `src/components/payment/use-reading-price.ts:8` - local hook input interface style.
  - Pattern:  `src/components/payment/use-reading-price.ts:15` - local hook result interface style.
  - API/Type: `src/lib/payment/payment-config.ts:17` - `READING_PRODUCT` is the paid product source.
  - API/Type: `src/lib/client-growth-events.ts:3` - growth event payload shape if callbacks carry event context.
  - Pattern:  `tsconfig.json:7` - project has TypeScript strict mode enabled.
  - External: `https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch` - API payload body behavior.

  Acceptance criteria (agent-executable only):
  - [ ] `npx tsc --noEmit --pretty false > .omo/evidence/task-4-types-tsc.txt 2>&1` exits 0.
  - [ ] `npx eslint src/components/payment/reading-checkout-types.ts > .omo/evidence/task-4-types-eslint.txt 2>&1` exits 0 if a separate type file is created; otherwise run the same command against `src/components/payment/use-reading-checkout.ts`.
  - [ ] `rg -n "ReadingCheckoutResult|kind: 'redirect'|kind: 'free_promo'|readonly" src/components/payment > .omo/evidence/task-4-types-rg.txt` finds the contracts.
  - [ ] `rg -n "\\bany\\b|@ts-ignore|@ts-expect-error" src/components/payment/reading-checkout-types.ts src/components/payment/use-reading-checkout.ts > .omo/evidence/task-4-types-no-escape.txt; test $? -ne 0` confirms no escape hatches.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: Checkout contracts are strict and discoverable
    Tool:     bash
    Steps:    mkdir -p .omo/evidence && rg -n "ReadingCheckoutResult|kind: 'redirect'|kind: 'free_promo'|readonly" src/components/payment > .omo/evidence/task-4-types-rg.txt
    Expected: Output includes the checkout result union and readonly input/result shapes.
    Evidence: .omo/evidence/task-4-types-rg.txt

  Scenario: Type contracts have no escape hatches
    Tool:     bash
    Steps:    rg -n "\bany\b|@ts-ignore|@ts-expect-error" src/components/payment/reading-checkout-types.ts src/components/payment/use-reading-checkout.ts > .omo/evidence/task-4-types-no-escape.txt; test $? -ne 0
    Expected: Command exits 0 because no forbidden TypeScript escape hatches are found.
    Evidence: .omo/evidence/task-4-types-no-escape.txt
  ```

  Commit: YES | Message: `refactor(payment): define reading checkout contracts` | Files: [`src/components/payment/reading-checkout-types.ts`, `src/components/payment/use-reading-checkout.ts`]

- [ ] 5. Extract checkout storage helpers

  What to do: Move checkout-specific browser storage operations out of `PaymentModal` into typed helper functions under `src/components/payment/`. Required behavior: persist `pending_reading_data`, `pending_report_data`, `pending_metadata`, `decision_accepted`, `is_session_active`, optional `user_email`, saved `pending_reading_id`, saved `pending_reading_access_key`, and free-promo flags `payment_completed`, `promo_user`, `is_premium_user`. Storage helpers must guard `typeof window === 'undefined'`, use session storage plus local storage where current behavior does, and preserve the current backup behavior for reading id/access key.
  Must NOT do: Do not clear storage keys, rename storage keys, or move unrelated `/start` persistence helpers in this slice.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [7] | Blocked by: [4]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `src/components/payment/PaymentModal.tsx:242` - current pending reading data persistence.
  - Pattern:  `src/components/payment/PaymentModal.tsx:245` - current pending report persistence.
  - Pattern:  `src/components/payment/PaymentModal.tsx:248` - current pending metadata persistence.
  - Pattern:  `src/components/payment/PaymentModal.tsx:251` - current decision accepted flag.
  - Pattern:  `src/components/payment/PaymentModal.tsx:254` - current active session flag.
  - Pattern:  `src/components/payment/PaymentModal.tsx:255` - current `user_email` local storage behavior.
  - Pattern:  `src/components/payment/PaymentModal.tsx:302` - current access key persistence after save.
  - Pattern:  `src/components/payment/PaymentModal.tsx:306` - current reading id persistence after save.
  - Pattern:  `src/components/payment/PaymentModal.tsx:334` - current free-promo premium flags.
  - Pattern:  `src/app/start/start-page-storage.ts:3` - existing session/local storage backup helper.
  - Pattern:  `src/app/start/start-page-storage.ts:21` - existing stored reading id getter.
  - Pattern:  `src/app/start/start-page-storage.ts:30` - existing stored reading access key getter.
  - Pattern:  `src/app/start/start-page-storage.ts:86` - existing list of storage keys used by start resume.
  - External: `https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage` - tab-scoped persistence.
  - External: `https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage` - cross-session persistence.

  Acceptance criteria (agent-executable only):
  - [ ] `npx tsc --noEmit --pretty false > .omo/evidence/task-5-storage-tsc.txt 2>&1` exits 0.
  - [ ] `npx eslint src/components/payment/use-reading-checkout.ts src/components/payment/reading-checkout-storage.ts > .omo/evidence/task-5-storage-eslint.txt 2>&1` exits 0, adjusting paths if helpers are single-file.
  - [ ] `rg -n "pending_reading_data|pending_report_data|pending_metadata|pending_reading_id|pending_reading_access_key|payment_completed|promo_user|is_premium_user" src/components/payment > .omo/evidence/task-5-storage-keys.txt` shows the keys live in checkout helper code, not only in `PaymentModal`.
  - [ ] `rg -n "typeof window === 'undefined'" src/components/payment/use-reading-checkout.ts src/components/payment/reading-checkout-storage.ts > .omo/evidence/task-5-storage-ssr.txt` shows SSR guards.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: Storage key contract is preserved
    Tool:     bash
    Steps:    mkdir -p .omo/evidence && rg -n "pending_reading_data|pending_report_data|pending_metadata|pending_reading_id|pending_reading_access_key|payment_completed|promo_user|is_premium_user" src/components/payment > .omo/evidence/task-5-storage-keys.txt
    Expected: Output includes checkout helper code for every existing key.
    Evidence: .omo/evidence/task-5-storage-keys.txt

  Scenario: Storage helpers are browser-safe
    Tool:     bash
    Steps:    rg -n "typeof window === 'undefined'" src/components/payment/use-reading-checkout.ts src/components/payment/reading-checkout-storage.ts > .omo/evidence/task-5-storage-ssr.txt
    Expected: Output shows browser guards around storage helpers.
    Evidence: .omo/evidence/task-5-storage-ssr.txt
  ```

  Commit: YES | Message: `refactor(payment): extract reading checkout storage` | Files: [`src/components/payment/use-reading-checkout.ts`, `src/components/payment/reading-checkout-storage.ts`, `src/components/payment/reading-checkout-types.ts`]

- [ ] 6. Extract checkout API helpers

  What to do: Move checkout API calls out of `PaymentModal` into typed helper functions under `src/components/payment/`. Required helpers: save current report to `/api/reading/save`, redeem 100 percent promo through `/api/promo/redeem`, create Stripe checkout session through `/api/payment`, parse unknown JSON responses into typed results, and throw typed `Error` objects with the same user-facing fallback messages where current behavior throws.
  Must NOT do: Do not change endpoint URLs, request field names, method names, content-type headers, or server routes.

  Parallelization: Can parallel: YES | Wave 2 | Blocks: [7] | Blocked by: [4]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `src/components/payment/PaymentModal.tsx:282` - current `/api/reading/save` POST.
  - Pattern:  `src/components/payment/PaymentModal.tsx:287` - current save request body shape.
  - Pattern:  `src/components/payment/PaymentModal.tsx:300` - current saved response parsing.
  - Pattern:  `src/components/payment/PaymentModal.tsx:317` - current `/api/promo/redeem` POST.
  - Pattern:  `src/components/payment/PaymentModal.tsx:321` - current promo redeem body shape.
  - Pattern:  `src/components/payment/PaymentModal.tsx:359` - current `/api/payment` POST.
  - Pattern:  `src/components/payment/PaymentModal.tsx:362` - current payment request body shape.
  - API/Type: `src/app/api/reading/save/route.ts:71` - save route accepts `data`, `metadata`, `id`, `accessKey`.
  - API/Type: `src/app/api/promo/redeem/route.ts:7` - promo redeem schema accepts `codeId`, `email`, `readingId`, `userAgent`.
  - API/Type: `src/app/api/payment/route.ts:16` - payment route request fields.
  - API/Type: `src/app/api/payment/route.ts:118` - payment route returns `{ url }`.
  - External: `https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch` - POST body and JSON request behavior.

  Acceptance criteria (agent-executable only):
  - [ ] `npx tsc --noEmit --pretty false > .omo/evidence/task-6-api-tsc.txt 2>&1` exits 0.
  - [ ] `npx eslint src/components/payment/use-reading-checkout.ts src/components/payment/reading-checkout-api.ts > .omo/evidence/task-6-api-eslint.txt 2>&1` exits 0, adjusting paths if helpers are single-file.
  - [ ] `rg -n "/api/reading/save|/api/promo/redeem|/api/payment" src/components/payment > .omo/evidence/task-6-api-endpoints.txt` shows the endpoint strings in checkout helper code and not in `PaymentModal`.
  - [ ] `rg -n "response\\.ok|await response\\.json\\(\\)|unknown|instanceof Error" src/components/payment/use-reading-checkout.ts src/components/payment/reading-checkout-api.ts > .omo/evidence/task-6-api-parsing.txt` shows typed response/error handling.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: API endpoint ownership moved to checkout helpers
    Tool:     bash
    Steps:    mkdir -p .omo/evidence && rg -n "/api/reading/save|/api/promo/redeem|/api/payment" src/components/payment > .omo/evidence/task-6-api-endpoints.txt
    Expected: Output shows endpoint strings in checkout helper/module files and no direct endpoint strings in `PaymentModal.tsx`.
    Evidence: .omo/evidence/task-6-api-endpoints.txt

  Scenario: API helpers parse unknown responses defensively
    Tool:     bash
    Steps:    rg -n "response\\.ok|await response\\.json\\(\\)|unknown|instanceof Error" src/components/payment/use-reading-checkout.ts src/components/payment/reading-checkout-api.ts > .omo/evidence/task-6-api-parsing.txt
    Expected: Output shows explicit response status checks, unknown JSON narrowing, and Error narrowing.
    Evidence: .omo/evidence/task-6-api-parsing.txt
  ```

  Commit: YES | Message: `refactor(payment): extract reading checkout api calls` | Files: [`src/components/payment/use-reading-checkout.ts`, `src/components/payment/reading-checkout-api.ts`, `src/components/payment/reading-checkout-types.ts`]

- [ ] 7. Implement checkout orchestration hook/module

  What to do: Implement `startReadingCheckout` and `useReadingCheckout` in `src/components/payment/use-reading-checkout.ts`. The orchestration must persist current context, call `onPaymentStart` only through a caller-provided callback or keep it in the modal before the module call, save missing reading context when `currentReport` exists, branch free promo versus paid checkout, return `ReadingCheckoutResult` with `kind: 'free_promo'` or `kind: 'redirect'`, and leave analytics event emission in `PaymentModal` unless callbacks make it strictly smaller without changing payloads.
  Must NOT do: Do not perform UI alerting in the checkout module. Do not navigate directly inside helpers except by returning the exact redirect URL for the modal to apply.

  Parallelization: Can parallel: NO | Wave 2 | Blocks: [8] | Blocked by: [4, 5, 6]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `src/components/payment/use-reading-price.ts:45` - hook export naming and return-object style.
  - Pattern:  `src/components/payment/SubscriptionModal.tsx:381` - payment-adjacent helper function pattern with typed input.
  - Pattern:  `src/components/payment/PaymentModal.tsx:259` - current `onPaymentStart` timing before checkout API work.
  - Pattern:  `src/components/payment/PaymentModal.tsx:261` - current existing reading id lookup before tracking and save.
  - Pattern:  `src/components/payment/PaymentModal.tsx:282` - current save-if-missing behavior.
  - Pattern:  `src/components/payment/PaymentModal.tsx:317` - current free promo branch.
  - Pattern:  `src/components/payment/PaymentModal.tsx:359` - current paid checkout branch.
  - Pattern:  `scripts/verify-stability-guards.cjs:194` - stability guard must see `startReadingCheckout` ownership.
  - Pattern:  `scripts/verify-stability-guards.cjs:199` - stability guard must see `ReadingCheckoutResult` variants.
  - External: `https://nextjs.org/docs/app/api-reference/functions/use-router` - client navigation reference if executor chooses router-based navigation; preserving `window.location.href` is also acceptable because current behavior uses it.

  Acceptance criteria (agent-executable only):
  - [ ] `npx tsc --noEmit --pretty false > .omo/evidence/task-7-orchestrator-tsc.txt 2>&1` exits 0.
  - [ ] `npx eslint src/components/payment/use-reading-checkout.ts > .omo/evidence/task-7-orchestrator-eslint.txt 2>&1` exits 0.
  - [ ] `rg -n "startReadingCheckout|useReadingCheckout|ReadingCheckoutResult|kind: 'redirect'|kind: 'free_promo'" src/components/payment/use-reading-checkout.ts > .omo/evidence/task-7-orchestrator-rg.txt` finds the exported orchestration contract.
  - [ ] `npm run verify:stability > .omo/evidence/task-7-stability-still-red.txt 2>&1; test $? -ne 0` still fails only because `PaymentModal` has not yet delegated or LOC/direct-fetch guards remain, not because the new checkout module contract is missing.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: Checkout module exposes the required orchestration contract
    Tool:     bash
    Steps:    mkdir -p .omo/evidence && rg -n "startReadingCheckout|useReadingCheckout|ReadingCheckoutResult|kind: 'redirect'|kind: 'free_promo'" src/components/payment/use-reading-checkout.ts > .omo/evidence/task-7-orchestrator-rg.txt
    Expected: Output includes the start function, hook, and both result variants.
    Evidence: .omo/evidence/task-7-orchestrator-rg.txt

  Scenario: Guard failure narrows to modal integration only
    Tool:     bash
    Steps:    npm run verify:stability > .omo/evidence/task-7-stability-still-red.txt 2>&1; test $? -ne 0
    Expected: Artifact no longer reports missing checkout module/result variants; remaining failures are PaymentModal delegation, direct fetch, or LOC.
    Evidence: .omo/evidence/task-7-stability-still-red.txt
  ```

  Commit: YES | Message: `refactor(payment): orchestrate reading checkout flow` | Files: [`src/components/payment/use-reading-checkout.ts`, `src/components/payment/reading-checkout-storage.ts`, `src/components/payment/reading-checkout-api.ts`, `src/components/payment/reading-checkout-types.ts`]

- [ ] 8. Integrate PaymentModal and pass checkout gates

  What to do: Replace the direct checkout implementation in `PaymentModal` with `useReadingCheckout`. Keep email validation, price mismatch blocking, loading state, `checkout_start`, `checkout_success`, `checkout_failure`, `onClose`, and redirect timing equivalent. Handle `ReadingCheckoutResult` with an exhaustive `switch`. After integration, `PaymentModal` must have no direct `fetch('/api/reading/save')`, `fetch('/api/promo/redeem')`, or `fetch('/api/payment')` calls, and pure LOC must be below 726.
  Must NOT do: Do not rewrite the modal visual body, remove the price mismatch disabled button, remove the free-promo email validation messages, or change the checkout URLs.

  Parallelization: Can parallel: NO | Wave 3 | Blocks: [Final] | Blocked by: [1, 2, 3, 7]

  References (executor has NO interview context - be exhaustive):
  - Pattern:  `src/components/payment/PaymentModal.tsx:208` - current handler to shrink.
  - Pattern:  `src/components/payment/PaymentModal.tsx:221` - price mismatch must still return before paid checkout.
  - Pattern:  `src/components/payment/PaymentModal.tsx:226` - free promo email validation must remain.
  - Pattern:  `src/components/payment/PaymentModal.tsx:263` - `checkout_start` payload to preserve.
  - Pattern:  `src/components/payment/PaymentModal.tsx:338` - `checkout_success` payload to preserve for free promo.
  - Pattern:  `src/components/payment/PaymentModal.tsx:385` - `checkout_failure` payload to preserve.
  - Pattern:  `src/components/payment/PaymentModal.tsx:407` - free promo derived state and mismatch block interaction.
  - Pattern:  `src/components/payment/PaymentModal.tsx:746` - checkout button disabled state and label.
  - Pattern:  `scripts/verify-stability-guards.cjs:204` - `PaymentModal` must delegate to `useReadingCheckout`.
  - Pattern:  `scripts/verify-stability-guards.cjs:209` - direct checkout fetches must be absent.
  - Test:     `tests/e2e/next-move-report-paywall-checkout.spec.ts:93` - paid checkout e2e.
  - Test:     `tests/e2e/next-move-report-paywall-checkout.spec.ts:127` - free promo e2e.
  - Test:     `tests/e2e/next-move-report.spec.ts:137` - price mismatch e2e.
  - External: `https://playwright.dev/docs/test-assertions` - final browser assertions.
  - External: `https://nextjs.org/docs/app/building-your-application/routing/redirecting` - client/server redirect context.

  Acceptance criteria (agent-executable only):
  - [ ] `mkdir -p .omo/evidence && awk '!/^[[:space:]]*$/ && !/^[[:space:]]*\\/\\//' src/components/payment/PaymentModal.tsx | wc -l > .omo/evidence/task-8-paymentmodal-loc-after.txt` writes a number lower than 726.
  - [ ] `npm run verify:stability > .omo/evidence/task-8-stability-green.txt 2>&1` exits 0.
  - [ ] `npm test > .omo/evidence/task-8-npm-test-green.txt 2>&1` exits 0.
  - [ ] `npx eslint src/components/payment/PaymentModal.tsx src/components/payment/use-reading-checkout.ts src/components/payment/reading-checkout-types.ts tests/e2e/next-move-report-paywall-checkout.spec.ts tests/e2e/next-move-report.spec.ts > .omo/evidence/task-8-targeted-eslint.txt 2>&1` exits 0, adjusting helper paths if implementation used a single file.
  - [ ] `npx tsc --noEmit --pretty false > .omo/evidence/task-8-tsc.txt 2>&1` exits 0.
  - [ ] `npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium --reporter=list > .omo/evidence/task-8-checkout-e2e-green.txt 2>&1` exits 0.
  - [ ] `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "price contract mismatches" --reporter=list > .omo/evidence/task-8-mismatch-e2e-green.txt 2>&1` exits 0.
  - [ ] `git diff --check > .omo/evidence/task-8-diff-check.txt 2>&1` exits 0.

  QA scenarios (MANDATORY - task incomplete without these):
  ```
  Scenario: Paid and free checkout pass through the real browser surface
    Tool:     playwright(real Chrome)
    Steps:    mkdir -p .omo/evidence && npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium --reporter=list > .omo/evidence/task-8-checkout-e2e-green.txt 2>&1
    Expected: Paid checkout navigates to mocked checkout URL with saved reading context; free promo validates email, redeems promo, makes zero payment requests, sets premium flags, and redirects paid=true.
    Evidence: .omo/evidence/task-8-checkout-e2e-green.txt

  Scenario: Checkout remains paused on price mismatch
    Tool:     playwright(real Chrome)
    Steps:    npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "paywall pauses checkout when Stripe price contract mismatches" --reporter=list > .omo/evidence/task-8-mismatch-e2e-green.txt 2>&1
    Expected: Mismatch UI is visible; checkout button is disabled; `/api/payment` sentinel is not called.
    Evidence: .omo/evidence/task-8-mismatch-e2e-green.txt
  ```

  Commit: YES | Message: `refactor(payment): delegate modal checkout flow` | Files: [`src/components/payment/PaymentModal.tsx`, `src/components/payment/use-reading-checkout.ts`, `src/components/payment/reading-checkout-storage.ts`, `src/components/payment/reading-checkout-api.ts`, `src/components/payment/reading-checkout-types.ts`, `tests/e2e/next-move-report-paywall-checkout.spec.ts`, `tests/e2e/next-move-report.spec.ts`, `scripts/verify-stability-guards.cjs`]

## Final verification wave (MANDATORY - after all implementation tasks)
> Runs in PARALLEL. ALL must APPROVE. Surface results to the caller and wait for an explicit "okay" before declaring complete.
- [ ] F1. Plan compliance audit - every task done, every acceptance criterion met
- [ ] F2. Code quality review - diagnostics clean, idioms match, no dead code
- [ ] F3. Real manual QA - every QA scenario executed with evidence captured
- [ ] F4. Scope fidelity - nothing extra shipped beyond Must-Have, nothing Must-NOT-Have introduced

## Commit strategy
- One logical change per commit. Conventional Commits (`<type>(<scope>): <subject>` body + footer).
- Atomic: every commit builds and passes tests on its own.
- No "WIP" / "fix typo squash later" commits on the final branch - clean up before merge.
- Stage only files listed in the task commit instruction; the dirty tree contains unrelated MVP changes.
- Reference the plan file path in the final commit footer: `Plan: .omo/plans/payment-modal-checkout-refactor.md`.

## Success criteria
- All Must-Have shipped; all QA scenarios pass with captured evidence; F1-F4 approved; commit history clean.
