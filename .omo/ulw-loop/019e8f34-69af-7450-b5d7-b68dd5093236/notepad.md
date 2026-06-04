# Next Move Report MVP ULW Notepad

## Objective
Ship the Momus-approved `.omo/plans/next-move-report-mvp.md` implementation end to end: 12 tasks, 8 waves, TDD RED->GREEN evidence for every production change, and real Browser/HTTP/CLI QA artifacts before completion.

## Skill Survey
Inventory source: loaded session skill list plus local `SKILL.md` reads. Relevant descriptions read before implementation:

- `omo:ulw-loop` - required by user; governs durable goal state, criteria, evidence, cleanup, delegation, and final gate.
- `omo:programming` - mandatory for TypeScript/TSX edits; enforces strict types, TDD, no `any`, no unsafe assertions, and reference loading.
- `omo:programming/references/typescript/README.md` - TypeScript-specific hard rules for tests, types, Zod boundaries, and Next.js exceptions.
- `omo:frontend-ui-ux` - acquisition and route rebrand touches user-facing UI; use for layout/copy coherence while staying within existing design.
- `testing-strategy` - required for new Playwright/regression coverage and test pyramid choices.
- `stripe-integration` - required for USD 9 Stripe/Checkout price contract and fallback/live price verification.
- `build-web-apps:react-best-practices` - required for React/Next.js component edits and avoiding avoidable client/server performance regressions.
- `build-web-apps:frontend-testing-debugging` - required for rendered frontend validation, Browser/Playwright screenshots, console health, and interaction proof.

Available but not primary for this run:

- `supabase:*` - only use if database schema/query changes become necessary; current plan does not require DB migration.
- `github:*`, `google-calendar:*`, `twilio-*`, `expo:*`, `build-ios-apps:*`, `test-android-apps:*`, `documents/presentations/spreadsheets` - not applicable to this web MVP implementation.
- `brand-engine`, `threads-engine`, revenue strategy skills - strategic decisions already fixed and Momus-approved; implementation plan is authoritative.

## Scope Size
- Distinct product surfaces: public route, home/nav/mobile/header/footer, `/start`, reading/free verdict, prompt/safety, payment/Stripe price, checkout/paywall/success, ops growth, terms/privacy/docs, English probe/SEO/sitemap.
- Distinct task count: 12 planned tasks in 8 waves.
- Expected changed areas: `src/app`, `src/components`, `src/lib`, `scripts`, `tests/e2e`, `docs`.
- Non-trivial: yes. Plan agent required; explorer workers spawned before planning.

## ULW Goal State
- CLI: `node /Users/kim-young-gwang/.codex/plugins/cache/sisyphuslabs/omo/0.1.0/components/ulw-loop/dist/cli.js`
- Goal id: `G001-ship-the-momus-approved-next-move-re`
- Criteria:
  - `C001` happy Browser flow from `/relationship/contact-timing` to `/start` to free verdict.
  - `C002` edge HTTP/browser flow for malformed price and empty Next Move question.
  - `C003` regression HTTP/browser/CLI flow for hidden-but-alive legacy routes, ops grouping, legal/trust, build/test stability.

## Active Explorers
- `surface_public_acquisition` - maps home/nav/legacy/SEO/public route surfaces.
- `surface_start_reading` - maps `/start`, free verdict, reading generation, safety surfaces.
- `surface_payment_ops_legal` - maps payment, ops growth, docs, legal, stability scripts.

## Planning Agent Outcome
- `execution_wave_planner` was spawned with the full execution-planning request; after two waits and a targeted follow-up it remained silent, so it was closed as inconclusive.
- `execution_wave_planner_small` was spawned for Wave 1-2 only; after two waits and a targeted follow-up it also remained silent, so it was closed as inconclusive.
- Fallback: execute the already Momus-approved `.omo/plans/next-move-report-mvp.md` wave order exactly:
  - Wave 1: Task 1 + Task 2
  - Wave 2: Task 3 + Task 4
  - Wave 3: Task 5 + Task 6
  - Wave 4: Task 7 + Task 8
  - Wave 5: Task 9
  - Wave 6: Task 10
  - Wave 7: Task 11
  - Wave 8: Task 12

## Wave 1 Progress

### Task 1 Source, Brand, Price Contract Foundation
- RED captured: `.omo/evidence/task-1-contract-red.txt`
- GREEN captured: `.omo/evidence/task-1-contract-green.txt`
- Manual QA captured:
  - `.omo/evidence/task-1-contract-rg.txt`
  - `.omo/evidence/task-1-legacy-source-rg.txt`
- Root recheck:
  - `npm test > .omo/evidence/task-1-contract-green.txt 2>&1` exited 0.
  - `git diff --check` exited 0.
- Files changed:
  - `scripts/test-refactor-regression.sh`
  - `src/app/start/start-page-helpers.ts`
  - `src/lib/payment/payment-config.ts`
  - `docs/api-spec.md`

### Task 2 E2E and Regression Evidence Harness
- Attempt 1: `wave1_task2_harness` worker was spawned; after two waits and targeted follow-up it remained silent and left no harness files.
- Attempt 2: `wave1_task2_harness_small` worker was spawned; after two waits and targeted follow-up it remained silent and left no harness files.
- Continuation turn provided the go-ahead to keep working; root took over Task 2 manually because repeated worker delegation had not produced files.
- Files changed:
  - `tests/e2e/next-move-report.spec.ts`
  - `tests/e2e/smoke.spec.ts`
  - `scripts/verify-stability-guards.cjs`
- RED captured:
  - `.omo/evidence/task-2-e2e-red.txt`
    - Initial sandbox run failed on port bind; escalated rerun reached the real app and failed for the expected reason: route title still says CosmicPath instead of Next Move Report.
  - `.omo/evidence/task-2-stability-red.txt`
    - Fails for expected missing Next Move route brand invariant.
- Harness/list evidence:
  - `.omo/evidence/task-2-playwright-list.txt`
    - Lists 6 tests across chromium and mobile-chrome.
- GREEN captured after reviewer blocker fix:
  - `.omo/evidence/task-2-e2e-green.txt`
    - `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium` exited 0 with 10 passing tests.
  - `.omo/evidence/task-2-stability-green.txt`
    - `npm run verify:stability` exited 0.
- Cleanup:
  - `.omo/evidence/task-2-cleanup.txt`
  - `lsof -nP -iTCP:3100 -sTCP:LISTEN` returned no listener after the Playwright RED run.
- Wave 1 quick verification:
  - `.omo/evidence/wave-1-npm-test.txt` exited 0.
  - `.omo/evidence/wave-1-diff-check.txt` exited 0.

## Wave 2 Progress

### Task 3 MVP Route Rebrand
- Files changed:
  - `src/app/relationship/contact-timing/page.tsx`
- RED captured:
  - `.omo/evidence/task-3-route-red.txt`
    - Failed before implementation because the route title/brand still exposed CosmicPath.
- GREEN captured:
  - `.omo/evidence/task-3-route-green.txt`
    - `tests/e2e/next-move-report.spec.ts --grep "mvp route is branded" --project=chromium` exited 0.
- Manual QA captured:
  - `.omo/evidence/task-3-route-desktop.png`
  - `.omo/evidence/task-3-route-http.txt`

### Task 4 Home, Navigation, Footer, and Legacy Containment
- Files changed:
  - `src/app/layout.tsx`
  - `src/app/manifest.ts`
  - `src/app/page.tsx`
  - `src/app/sitemap.ts`
  - `src/components/common/GlobalHeader.tsx`
  - `src/components/common/MobileMenu.tsx`
  - `src/components/landing/Footer.tsx`
  - `src/components/landing/HeroSection.tsx`
  - `src/components/landing/Navigation.tsx`
  - `src/components/layout/MobileBottomNav.tsx`
  - `tests/e2e/smoke.spec.ts`
- RED captured:
  - `.omo/evidence/task-4-nav-red.txt`
    - Failed before implementation because home metadata/navigation still reflected the legacy acquisition posture.
- GREEN captured:
  - `.omo/evidence/task-4-nav-green.txt`
    - `tests/e2e/next-move-report.spec.ts --grep "home and nav" --project=chromium` exited 0.
- Manual QA captured:
  - `.omo/evidence/task-4-home-desktop.png`
  - `.omo/evidence/task-4-legacy-direct-urls.txt`
- Cleanup:
  - `.omo/evidence/wave-2-cleanup.txt`
  - Dev server on port 3100 was stopped; `lsof -nP -iTCP:3100 -sTCP:LISTEN` returned no listener.
- Wave 2 quick verification:
  - `.omo/evidence/wave-2-npm-test.txt` exited 0.
  - `.omo/evidence/wave-2-lint.txt` exited 0.
  - `.omo/evidence/wave-2-diff-check.txt` exited 0.

## Wave 3 Progress

### Task 5 Start Flow and Free Verdict Contract
- Files changed:
  - `tests/e2e/next-move-report.spec.ts`
  - `src/app/start/page.tsx`
  - `src/app/start/start-input-stage.tsx`
  - `src/app/start/start-tarot-stage.tsx`
  - `src/app/start/start-result-stage.tsx`
  - `src/components/reading/reading-input.tsx`
- RED captured:
  - `.omo/evidence/task-5-start-red.txt`
    - Failed before implementation because the `/start` page did not show Next Move specific Korean contact-timing intake copy.
- GREEN captured:
  - `.omo/evidence/task-5-start-green.txt`
    - `tests/e2e/next-move-report.spec.ts --grep "start keeps Next Move source" --project=chromium` exited 0.
- Manual QA captured:
  - `.omo/evidence/task-5-start-prefill.png`
  - `.omo/evidence/task-5-source-compat.txt`
- Behavior notes:
  - `next_move_report_mvp_v1` now maps to relationship result labels and Next Move follow-up seed events.
  - Next Move intake treats the question as the only required user-facing input; birth/time/tarot are optional evidence layers with safe defaults or skip.

### Task 6 Relationship Safety and Evidence Layer
- Files changed:
  - `scripts/verify-stability-guards.cjs`
  - `src/lib/ai/prompt-shared-rules.ts`
  - `src/app/api/reading/route-helpers.ts`
  - `src/app/api/reading/reading-generation-service.ts`
  - `src/components/payment/PaymentModal.tsx`
  - `src/lib/growth-metrics.ts`
- RED captured:
  - `.omo/evidence/task-6-safety-red.txt`
    - Failed before implementation because explicit relationship reply-guarantee/stalking safety rules were missing.
- GREEN captured:
  - `.omo/evidence/task-6-safety-green.txt`
    - `npm run verify:stability` exited 0.
- Manual QA captured:
  - `.omo/evidence/task-6-banned-claims.txt`
  - `.omo/evidence/task-6-safety-language.txt`
- Related early unblock:
  - `.omo/evidence/task-9-growth-red.txt` captures the pre-fix growth grouping failure that blocked `verify:stability`.
  - `src/lib/growth-metrics.ts` was minimally updated early so `next_move_report_mvp_v1`, `relationship_contact_timing_v1`, and `en_relationship_contact_timing_v1` share the `relationship-contact` funnel. Task 9 still needs its planned ops/readout QA later.
- Cleanup:
  - `.omo/evidence/wave-3-cleanup.txt`
  - Dev server on port 3100 was stopped; `lsof -nP -iTCP:3100 -sTCP:LISTEN` had no listener output.
- Wave 3 quick verification:
  - `.omo/evidence/wave-3-npm-test.txt` exited 0.
  - `.omo/evidence/wave-3-lint.txt` exited 0.
  - `.omo/evidence/wave-3-diff-check.txt` exited 0.

## Wave 4 Progress

### Task 7 USD 9 Stripe Price Contract
- Files changed:
  - `scripts/verify-stability-guards.cjs`
  - `src/lib/payment/payment-config.ts`
  - `src/lib/payment/stripe.ts`
  - `src/app/api/payment/price/route.ts`
  - `.env`
  - `.env.example`
  - `docs/api-spec.md`
- RED captured:
  - `.omo/evidence/task-7-price-red.txt`
    - Failed before implementation because live Stripe reading product lookup had no `$9` contract mismatch guard.
- GREEN captured:
  - `.omo/evidence/task-7-price-green.txt`
    - `npm run verify:stability` exited 0.
  - `.omo/evidence/task-7-price-mismatch-paywall-green.txt`
    - Paywall E2E exited 0 proving `READING_PRICE_CONTRACT_MISMATCH` surfaces a Stripe price mismatch and disables checkout instead of showing fallback `$9.00`.
- Manual QA captured:
  - `.omo/evidence/task-7-price-endpoint.txt`
    - `GET /api/payment/price?productId=prod_next_move_report_live_TBD` returned HTTP 200 fallback `$9.00`.
  - `.omo/evidence/task-7-old-price-rg.txt`
    - `$3.99`/`399` matches are limited to unrelated legacy subscription/chat scripts or products, not MVP/paywall copy.
- Behavior notes:
  - Configured live Stripe reading products now throw `READING_PRICE_CONTRACT_MISMATCH` unless they return `900` cents `USD`.
  - `/api/payment/price` returns HTTP 409 for that mismatch instead of silently displaying `$9.00`.
  - Default reading product IDs are now `TBD` placeholders so local/dev without a valid USD 9 product uses fallback instead of an old real SKU.

### Task 8 Paywall, Checkout Success, and Paid Report Offer
- Files changed:
  - `tests/e2e/next-move-report.spec.ts`
  - `src/components/payment/PaymentModal.tsx`
  - `src/app/payment/success/page.tsx`
- RED captured:
  - `.omo/evidence/task-8-paywall-red.txt`
    - Failed before implementation because the paywall did not show `Next Move Report Full Report` as the actual offer.
- GREEN captured:
  - `.omo/evidence/task-8-paywall-green.txt`
    - `tests/e2e/next-move-report.spec.ts --grep "paywall shows USD 9" --project=chromium` exited 0.
- Manual QA captured:
  - `.omo/evidence/task-8-paywall-modal.png`
  - `.omo/evidence/task-8-payment-bad-product.txt`
- Behavior notes:
  - Paywall opened from `next_move_report_mvp_v1` shows `Next Move Report Full Report`, `$9.00`, verdict evidence, contact timing, and message-to-avoid benefits.
  - Checkout POST body continues to send `source: next_move_report_mvp_v1`.
  - Payment success now preserves Next Move source/language when redirecting back to `/start`.
- Cleanup:
  - `.omo/evidence/wave-4-cleanup.txt`
  - Dev server on port 3100 was stopped; `lsof -nP -iTCP:3100 -sTCP:LISTEN` had no listener output.
- Wave 4 quick verification:
  - `.omo/evidence/wave-4-npm-test.txt` exited 0.
  - `.omo/evidence/wave-4-lint.txt` exited 0.
  - `.omo/evidence/wave-4-diff-check.txt` exited 0.

## Wave 5 Progress

### Task 9 Growth Metrics and Ops Readout
- Files changed:
  - `scripts/verify-stability-guards.cjs`
  - `src/lib/growth-metrics.ts`
  - `src/components/ops/GrowthDashboard.tsx`
- RED captured:
  - `.omo/evidence/task-9-growth-red.txt`
    - Failed before implementation because the Next Move Report decision threshold invariant was missing.
- GREEN captured:
  - `.omo/evidence/task-9-growth-green.txt`
    - `npm run verify:stability` exited 0 after adding threshold and dashboard invariants.
- Manual QA captured:
  - `.omo/evidence/task-9-growth-track.txt`
    - `POST /api/growth/track` accepted `source: next_move_report_mvp_v1` and returned HTTP 200.
  - `.omo/evidence/task-9-ops-growth.png`
    - Browser visit to `/ops/growth`; this route is ADMIN-gated in the local session, so the screenshot proves access containment rather than the dashboard row.
  - `.omo/evidence/task-9-ops-growth-source-proof.txt`
    - Source proof confirms the dashboard renders `Next Move Report 14-day decision gate` with thresholds for ADMIN sessions.
- Behavior notes:
  - `nextMoveDecisionGate` is now part of the growth summary.
  - Thresholds are fixed at visits 300, days 14, question starts 45, free verdicts 30, paywall opens 8, paid conversions 2, and follow-up seeds 8.
  - No dev auth bypass was added for ops QA.
- Cleanup:
  - `.omo/evidence/wave-5-cleanup.txt`
  - Dev server on port 3100 was stopped; `lsof -nP -iTCP:3100 -sTCP:LISTEN` had no listener output.
- Wave 5 quick verification:
  - `.omo/evidence/wave-5-npm-test.txt` exited 0.
  - `.omo/evidence/wave-5-lint.txt` exited 0.
  - `.omo/evidence/wave-5-diff-check.txt` exited 0.

## Wave 6 Progress

### Task 10 Trust, Privacy, and Legal Boundaries
- Files changed:
  - `tests/e2e/next-move-report.spec.ts`
  - `src/app/relationship/contact-timing/page.tsx`
  - `src/app/terms/page.tsx`
  - `src/app/privacy/page.tsx`
  - `scripts/verify-stability-guards.cjs`
- RED captured:
  - `.omo/evidence/task-10-trust-red.txt`
    - Failed before implementation because `/relationship/contact-timing` did not expose footer links to `/terms` and `/privacy`.
- GREEN/source captured:
  - `.omo/evidence/task-10-trust-source-green.txt`
    - `npm run verify:stability` exited 0 after adding Terms/Privacy and public route legal-link invariants.
- Browser GREEN and HTTP QA status:
  - `.omo/evidence/task-10-trust-green.txt` currently records a sandbox-only failure: `listen EPERM: operation not permitted 0.0.0.0:3100`.
  - The first escalated retry was denied by the approval system due usage limit, so the server-backed Playwright/HTTP evidence is explicitly queued for the final localhost verification replay.
- Behavior notes:
  - Public MVP route footer now links to `/terms` and `/privacy`.
  - Terms now disclose Next Move decision-support content, no guaranteed relationship outcome, no therapy/medical/diagnostic/legal/financial advice, USD 9 one-off digital report, Stripe checkout, and digital-report refund boundary.
  - Privacy now discloses relationship/DM context, optional birth data, report restore/storage, analytics, and "do not paste highly sensitive third-party secrets" guidance.
- Cleanup:
  - `.omo/evidence/wave-6-cleanup.txt`
  - No listener remained on port 3100 after Wave 6 sandboxed verification attempts.
- Wave 6 quick verification:
  - `.omo/evidence/wave-6-npm-test.txt` exited 0.
  - `.omo/evidence/wave-6-lint.txt` exited 0.
  - `.omo/evidence/wave-6-diff-check.txt` exited 0.

## Wave 7 Progress

### Task 11 English Probe and SEO Containment
- Files changed:
  - `tests/e2e/next-move-report.spec.ts`
  - `scripts/verify-stability-guards.cjs`
  - `src/app/en/contact-timing/page.tsx`
  - `src/components/landing/EnglishGuideSection.tsx`
- RED captured:
  - `.omo/evidence/task-11-english-red.txt`
    - Failed before implementation because `/en/contact-timing` was indexed while still exposing half-rebranded `CosmicPath` and `$3.99` acquisition copy.
- GREEN/source captured:
  - `.omo/evidence/task-11-english-green.txt`
    - `npm run verify:stability` exited 0 after adding English route, English guide, and sitemap containment invariants.
- Manual/source QA captured:
  - `.omo/evidence/task-11-english-source-proof.txt`
    - Confirms `/en/contact-timing` metadata, visible brand, price, and footer boundary use `Next Move Report`, `Full report $9`, and decision-support language.
  - `.omo/evidence/task-11-sitemap-source-proof.txt`
    - Confirms sitemap/robots source keeps MVP/legal route exposure and avoids legacy Daily/Career promotion.
- Browser/HTTP QA status:
  - `.omo/evidence/task-11-english-probe.png` and `.omo/evidence/task-11-sitemap.txt` are queued for the final localhost replay because sandboxed server binding is currently blocked.
- Behavior notes:
  - `/en/contact-timing` remains indexed, but is now fully rebranded to Next Move Report and USD 9.
  - English home guide section now points primary English users toward `/en/contact-timing`; guides remain secondary.
  - `/en/saju` and other legacy routes remain direct-accessible.
- Cleanup:
  - `.omo/evidence/wave-7-cleanup.txt`
  - No listener remained on port 3100 after Wave 7 source verification.
- Wave 7 quick verification:
  - `.omo/evidence/wave-7-npm-test.txt` exited 0.
  - `.omo/evidence/wave-7-lint.txt` exited 0.
  - `.omo/evidence/wave-7-diff-check.txt` exited 0.

## Wave 8 Progress

### Task 12 Operating Loop and Launch Evidence Bundle
- Files changed:
  - `scripts/test-refactor-regression.sh`
  - `docs/revenue/next-move-report-mvp-operating-loop.md`
  - `.omo/evidence/next-move-report-evidence-index.md`
- RED captured:
  - `.omo/evidence/task-12-operating-loop-red.txt`
    - Failed before implementation because `docs/revenue/next-move-report-mvp-operating-loop.md` did not exist.
- GREEN captured:
  - `.omo/evidence/task-12-operating-loop-green.txt`
    - `npm test` exited 0 after adding the operating-loop and evidence-index contract checks.
- Manual QA captured:
  - `.omo/evidence/task-12-operating-loop.txt`
    - Confirms 300 targeted visits, 45 question starts, 30 free verdicts, 8 paywall opens, 2 paid conversions, 8 follow-up seeds, Weeks 1-2, and Weeks 9-12 are present.
  - `.omo/evidence/task-12-scope-creep.txt`
    - Confirms Toss/KRW, subscriptions, custom consulting, paid ads, and SaaS onboarding appear only as out-of-scope constraints.
- Behavior notes:
  - Operating loop defines 5h/week budget, 14-day gate, 12-week loop, scope exclusions, and launch blocks.
  - Evidence index lists RED, GREEN, and Manual QA artifact paths for Tasks 1-12 plus final verification slots.
- Cleanup:
  - `.omo/evidence/wave-8-cleanup.txt`
  - No listener remained on port 3100 after Wave 8 document verification.
- Wave 8 quick verification:
  - `.omo/evidence/wave-8-npm-test.txt` exited 0.
  - `.omo/evidence/wave-8-lint.txt` exited 0.
  - `.omo/evidence/wave-8-diff-check.txt` exited 0.

## Final Verification Status

- Implemented scope:
  - All 12 planned tasks across 8 waves have code/docs changes and task-level RED evidence.
  - Final reviewer blocker fixes were added for Task 2 runnable GREEN evidence, operating-loop whitespace, and Stripe price-mismatch paywall blocking.
- Passed final checks after latest blocker fixes:
  - `.omo/evidence/f1-plan-compliance.txt` generated.
  - `.omo/evidence/final-diff-check.txt` exited 0.
  - `.omo/evidence/f2-npm-test.txt` exited 0.
  - `.omo/evidence/f2-stability.txt` exited 0.
  - `.omo/evidence/f2-lint.txt` exited 0.
  - `.omo/evidence/f2-targeted-eslint.txt` exited 0 for `PaymentModal.tsx` and `next-move-report.spec.ts`.
  - `.omo/evidence/f2-build.txt` exited 0.
  - `.omo/evidence/f2-playwright-desktop.txt` exited 0 with 10 passing Chromium tests.
  - `.omo/evidence/f2-playwright-mobile.txt` exited 0 with 10 passing mobile-chrome tests.
  - `.omo/evidence/task-2-e2e-green.txt` exited 0 with 10 passing Chromium tests.
  - `.omo/evidence/task-2-stability-green.txt` exited 0.
  - `.omo/evidence/task-7-price-mismatch-paywall-green.txt` exited 0 proving price-contract mismatch disables checkout.
  - `.omo/evidence/f3-real-reading-api.txt` proves the unmocked `/api/reading` free verdict returns `free_focus` and high-risk relationship pressure returns hold guidance.
  - `.omo/evidence/f4-scope-fidelity.txt` generated.
  - `.omo/evidence/final-cleanup.txt` confirms no listener on port 3100.
- ULW ledger:
  - Criteria C001, C002, and C003 are recorded as `pass`.
  - C002 was refreshed with `.omo/evidence/task-7-price-mismatch-paywall-green.txt` after the reviewer blocker fix.
  - Aggregate checkpoint is recorded as `complete` with `.omo/evidence/final-quality-gate.json`.
- Reviewer status:
  - `/root/next_move_final_reviewer_fourth` returned UNCONDITIONAL APPROVAL.
  - Approval evidence recorded at `.omo/evidence/f5-reviewer-approval.txt`.
