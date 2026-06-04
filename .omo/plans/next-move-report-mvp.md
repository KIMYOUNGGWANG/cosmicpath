# Next Move Report MVP Pivot Plan

## TL;DR
> **Summary**: Reposition the public acquisition experience from broad CosmicPath fortune reading to `Next Move Report`, with the first MVP focused on the relationship/DM question "contact or wait". Keep legacy CosmicPath routes alive by direct URL, but remove them from primary acquisition during this MVP.
> **Deliverables**:
> - Public brand and MVP route: `Next Move Report`
> - Free first verdict: contact / wait / narrow / hold
> - Paid report offer: USD 9 one-time Stripe unlock
> - Evidence layer: Saju / tarot / astrology as optional supporting rationale
> - Growth readout: 14-day funnel for `next_move_report_mvp_v1`, grouped with existing relationship-contact history
> - Trust boundary: no guaranteed outcome, no pressure tactics, no therapy/medical/diagnostic advice
> - Legacy containment: hide old fortune surfaces from primary nav/home/sitemap priority, do not delete routes
> **Effort**: Large
> **Parallel**: YES - 8 waves
> **Critical Path**: Task 1 -> Task 3 -> Task 5 -> Task 7 -> Task 9 -> Task 12 -> Final Verification

## Context

### Original Request
The user fixed the strategic direction:
- New public brand: `Next Move Report`
- First MVP: relationship/DM decision report for "contact or wait"
- Pricing: free first verdict + USD 9 full report
- Saju/tarot/astrology: optional evidence layer, not the front-facing product name
- Payment: keep USD/Stripe for MVP; Toss/KRW later
- Legacy CosmicPath pages: hide, do not delete
- Execution: 12 tasks, 8 waves, each task with RED->GREEN evidence and QA scenarios
- No production code has been changed yet; plan only

### Interview Summary
No additional user interview is required. The user already made the business decisions that materially affect implementation. Defaults applied:
- Route: keep `/relationship/contact-timing` as the first MVP route.
- Source key: introduce `next_move_report_mvp_v1` for new acquisition, while grouping old `relationship_contact_timing_v1` in the same ops funnel.
- English probe: keep `/en/contact-timing`, but either fully rebrand it or make it non-indexed until QA passes.
- Test strategy: TDD with existing infrastructure only; no Vitest/Jest setup unless a task explicitly adds it.

### Metis Review (gaps addressed)
- Brand architecture must distinguish public `Next Move Report` from legacy/internal `CosmicPath`.
- Source key migration must preserve historical funnel continuity.
- USD 9 must be enforced in fallback price, live price lookup, payment modal, checkout, and success flow.
- Current repo has Playwright plus shell/Node contract checks, not Vitest/Jest.
- Relationship safety must be functional in copy and generated output, not legal text only.
- Legacy containment must include nav, mobile menu, sitemap, English guide entry, subscriptions, and old pages.
- Acceptance metrics need a 14-day decision gate.
- Manual QA artifacts must name exact commands/actions.
- `docs/api-spec.md` is marked LOCKED, so this pivot must amend the documented campaign/payment contract with an explicit reason instead of silently contradicting prior `$3.99` and `CosmicPath remains core identity` wording.
- Global metadata and manifest still say CosmicPath, so public brand work includes `src/app/layout.tsx` and `src/app/manifest.ts`.

### Defaults Applied
- Primary acquisition route: keep `/relationship/contact-timing`; no new `/next-move-report` route in MVP.
- Hidden legacy definition: remove from home/nav/mobile menu/primary sitemap promotion; keep direct URL and route files.
- Stripe decision: use the existing one-time reading product contract and move the MVP reading price to USD 9 in place. If Stripe requires a new immutable `price_...`, set that as the default price for the existing reading product or update the reading product env config; do not add subscription/Toss/KRW.
- Evidence-layer intake decision: question comes first; birth data, time, and tarot are optional precision/evidence layers and must not be branded as the product. If the existing flow technically requires defaults, use non-blocking defaults and copy that frames them as optional precision.

## Work Objectives

### Core Objective
Ship a working MVP pivot where a visitor understands within 5 seconds that `Next Move Report` helps decide whether to contact someone or wait, receives a concrete free verdict, and sees a truthful USD 9 Stripe offer for a fuller report.

### Deliverables
- `Next Move Report` public acquisition copy on home/nav and `/relationship/contact-timing`.
- `/start` recognizes `next_move_report_mvp_v1` as a first-class decision source.
- Free result shows a relationship verdict and next action before paid content.
- Paid unlock copy says exactly what USD 9 opens: verdict evidence, contact timing, message risk.
- Stripe price surfaces align to USD 9, with fallback and live lookup verified.
- `/ops/growth` groups `next_move_report_mvp_v1` and existing relationship-contact source history.
- Terms/privacy include relationship text, optional birth data, refund, USD/Stripe, and safety boundaries.
- Legacy CosmicPath routes remain accessible by direct URL but are absent from primary acquisition.
- Operating loop document defines 14-day and 12-week decisions.

### Definition of Done (verifiable conditions with commands)
- `npm test` exits 0.
- `npm run verify:stability` exits 0.
- `npm run lint` exits 0.
- `npm run build` exits 0.
- `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium` exits 0.
- `npx playwright test tests/e2e/next-move-report.spec.ts --project=mobile-chrome` exits 0.
- `curl -i http://localhost:3100/api/payment/price?productId=<READING_PRODUCT.productId>` returns a USD 9 price or a fallback body with `$9.00`.
- Browser QA screenshots exist under `.omo/evidence/`.
- RED and GREEN outputs for every task are captured under `.omo/evidence/task-{N}-*.txt`.

### Must Have
- Public acquisition says `Next Move Report`, not broad `CosmicPath`.
- The first MVP promise is relationship/DM contact timing only.
- Free result gives a usable verdict before paywall.
- Paid report offer is USD 9 and Stripe-backed.
- Saju/tarot/astrology are described as evidence layers, not the product name.
- Old CosmicPath routes are hidden from primary acquisition but not deleted.
- Safety copy prevents guaranteed reply, pressure tactics, stalking/checking behavior, and medical/therapy framing.

### Must NOT Have
- Do not delete `/daily`, `/daily/tarot`, `/k-destiny`, `/oracle-chat`, `/en/saju`, `/career/uncertainty`, billing, ops, terms, or privacy routes.
- Do not add Toss/KRW.
- Do not add subscriptions or promote `PRO` on primary acquisition.
- Do not claim prediction accuracy or guaranteed relationship outcome.
- Do not add custom consulting, human advisor marketplace, paid ads, or SaaS onboarding.
- Do not create a new public reading API schema unless existing code requires a small internal helper.
- Do not use `any`, `@ts-ignore`, or test skips.

## Verification Strategy
> ZERO HUMAN INTERVENTION for implementation verification. The user may approve shipping after evidence is presented.
- Test decision: TDD using existing repo infrastructure:
  - Playwright E2E in `tests/e2e/`
  - Shell contract checks in `scripts/test-refactor-regression.sh`
  - Node invariant checks in `scripts/verify-stability-guards.cjs`
  - Build/type/lint via existing package scripts
- QA policy: Every task has one automated RED->GREEN proof and one agent-run manual scenario.
- Evidence path: `.omo/evidence/task-{N}-{slug}.{txt,png,json}`
- Manual channels:
  - Browser use: Playwright/browser screenshots for page flows
  - HTTP call: `curl -i` for API/legal/static routes
  - tmux: use only if a long-running process transcript is needed

## Execution Strategy

### Parallel Execution Waves
Wave 1: Task 1, Task 2
Wave 2: Task 3, Task 4
Wave 3: Task 5, Task 6
Wave 4: Task 7, Task 8
Wave 5: Task 9
Wave 6: Task 10
Wave 7: Task 11
Wave 8: Task 12

### Dependency Matrix
| Task | Depends On | Blocks |
| --- | --- | --- |
| 1. Source, Brand, Price Contract Foundation | none | 3, 4, 5, 7, 9 |
| 2. E2E and Regression Evidence Harness | none | 3, 4, 5, 7, 9, 10, 11 |
| 3. MVP Route Rebrand | 1, 2 | 5, 8, 11 |
| 4. Home/Nav Legacy Containment | 1, 2 | 11, 12 |
| 5. Start Flow and Free Verdict | 1, 2, 3 | 6, 8, 9 |
| 6. Relationship Safety and Evidence Layer | 1, 2, 5 | 8, 10 |
| 7. USD 9 Stripe Price Contract | 1, 2 | 8 |
| 8. Paywall and Checkout Success | 3, 5, 6, 7 | 9, 12 |
| 9. Growth Metrics and Ops Readout | 1, 2, 5, 8 | 12 |
| 10. Trust, Privacy, and Legal Boundaries | 2, 6, 7 | 12 |
| 11. English Probe and SEO Containment | 2, 3, 4, 8, 10 | 12 |
| 12. Operating Loop and Launch Evidence Bundle | 4, 8, 9, 10, 11 | Final Verification |

## TODOs
> Implementation + Test = ONE task. Each task must write the failing test/contract first, capture RED output, implement, then capture GREEN output and manual QA evidence.

- [ ] 1. Source, Brand, and Price Contract Foundation

  **What to do**: Introduce the internal constants/contracts needed by later tasks. Create or update a small shared helper module only if it reduces duplication, otherwise keep constants local but synchronized by tests. Required values:
  - Public brand: `Next Move Report`
  - MVP source: `next_move_report_mvp_v1`
  - Legacy source group: `relationship_contact_timing_v1`, `en_relationship_contact_timing_v1`
  - MVP route: `/relationship/contact-timing`
  - Free verdict labels: `연락`, `대기`, `축소`, `보류`
  - English labels: `Contact`, `Wait`, `Narrow`, `Hold`
  - Paid amount fallback: `900` cents, `$9.00`, `USD`
  - Amend `docs/api-spec.md` with a new `Next Move Report MVP Contract (2026-06-03)` section explaining:
    - public acquisition brand changes to `Next Move Report`
    - core public API shapes remain unchanged
    - source key is `next_move_report_mvp_v1`
    - existing relationship source remains historical compatibility
    - existing one-time reading product price changes from `$3.99` experiment to `$9.00` MVP price
    - birth/tarot/astrology/saju inputs are evidence layers, not the public product title

  **Must NOT do**: Do not change UI copy yet except where needed for exported constants. Do not create broad rebrand abstractions for every legacy page. Do not rename database fields.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 3, 5, 7, 9 | Blocked By: none

  **References**:
  - Pattern: `src/app/relationship/contact-timing/page.tsx:7` - current relationship source constant.
  - Pattern: `src/app/en/contact-timing/page.tsx:8` - current English contact source constant.
  - Pattern: `src/app/start/start-page-helpers.ts:89` - allowed decision timing entry sources.
  - Pattern: `src/lib/payment/payment-config.ts:17` - reading product config and fallback cents.
  - Pattern: `scripts/test-refactor-regression.sh:64` - existing source contract checks.
  - Pattern: `docs/api-spec.md:5` - locked spec requires explicit amendment reason.
  - Pattern: `docs/api-spec.md:39` - prior `$3.99` revenue experiment contract.
  - Pattern: `docs/api-spec.md:144` - prior relationship contact timing campaign contract.
  - Pattern: `docs/api-spec.md:276` - prior relationship non-goals.

  **Acceptance Criteria**:
  - [ ] `next_move_report_mvp_v1` is a first-class recognized entry/source.
  - [ ] Existing `relationship_contact_timing_v1` remains recognized for historical links.
  - [ ] USD 9 fallback appears as `900` cents and `$9.00`.
  - [ ] No `work/cosmicpath-full/cosmicpath/src` references exist in new docs/tests.
  - [ ] `docs/api-spec.md` contains a dated Next Move amendment that reconciles prior `$3.99` and CosmicPath wording.

  **RED->GREEN Evidence**:
  ```text
  Automated test: scripts/test-refactor-regression.sh
  RED command: npm test
  RED expected before implementation: output includes missing `next_move_report_mvp_v1` or missing `$9.00` contract.
  GREEN command: npm test
  GREEN expected after implementation: `Refactor regression checks passed`.
  Evidence:
  - .omo/evidence/task-1-contract-red.txt
  - .omo/evidence/task-1-contract-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: Contract values are discoverable from source
    Tool: bash
    Steps: rg -n "Next Move Report|next_move_report_mvp_v1|900|\\$9\\.00" src scripts tests docs
    Expected: matches include source/entry contract, payment fallback, and regression checks; no match under invalid work/cosmicpath-full path.
    Evidence: .omo/evidence/task-1-contract-rg.txt

  Scenario: Legacy source remains recognized
    Tool: bash
    Steps: rg -n "relationship_contact_timing_v1|en_relationship_contact_timing_v1" src/app/start src/lib/growth-metrics.ts scripts/test-refactor-regression.sh
    Expected: both legacy sources still appear in source recognition or funnel grouping.
    Evidence: .omo/evidence/task-1-legacy-source-rg.txt
  ```

  **Commit**: YES | Message: `chore(next-move): define mvp source contracts` | Files: `src/app/start/start-page-helpers.ts`, `src/lib/payment/payment-config.ts`, `docs/api-spec.md`, `scripts/test-refactor-regression.sh`, optional `src/lib/next-move-report.ts`

- [ ] 2. E2E and Regression Evidence Harness

  **What to do**: Add the dedicated test/evidence harness the remaining tasks will grow into:
  - Create `tests/e2e/next-move-report.spec.ts`.
  - Update `tests/e2e/smoke.spec.ts` away from old `daily`/`k-destiny` primary nav expectations.
  - Add source-text guardrails to `scripts/verify-stability-guards.cjs` for USD 9, no legacy primary nav, and safe contact copy.
  - Keep `scripts/test-refactor-regression.sh` as the fast source contract test.

  **Must NOT do**: Do not skip existing tests. Do not add Vitest/Jest unless this task explicitly adds scripts and config, which is not recommended for this MVP.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 3, 4, 5, 7, 9, 10, 11 | Blocked By: none

  **References**:
  - Pattern: `playwright.config.ts:3` - E2E tests live under `tests/e2e`.
  - Pattern: `tests/e2e/smoke.spec.ts:4` - current landing smoke structure.
  - Pattern: `tests/e2e/seo-pages.spec.ts:8` - route-specific title/heading style.
  - Pattern: `scripts/verify-stability-guards.cjs` - Node invariant check entrypoint.
  - Pattern: `package.json:5` - validation scripts.

  **Acceptance Criteria**:
  - [ ] `tests/e2e/next-move-report.spec.ts` exists with desktop and mobile coverage.
  - [ ] Existing smoke tests no longer expect primary `/daily` or `/k-destiny` nav exposure.
  - [ ] `npm run verify:stability` includes Next Move invariants.
  - [ ] Every test is designed to fail before its matching implementation task.

  **RED->GREEN Evidence**:
  ```text
  Automated test: tests/e2e/next-move-report.spec.ts
  RED command: npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium
  RED expected before implementation: first assertion fails because the public page still says CosmicPath or $3.99.
  GREEN command: npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium
  GREEN expected after implementation: all Next Move route assertions pass.
  Evidence:
  - .omo/evidence/task-2-e2e-red.txt
  - .omo/evidence/task-2-e2e-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: E2E harness is wired to the existing Playwright config
    Tool: bash
    Steps: npx playwright test tests/e2e/next-move-report.spec.ts --list
    Expected: lists Next Move Report tests for chromium and mobile-chrome projects.
    Evidence: .omo/evidence/task-2-playwright-list.txt

  Scenario: Stability guard includes Next Move invariants
    Tool: bash
    Steps: npm run verify:stability
    Expected: exits 0 after implementation; RED capture before implementation names the missing invariant.
    Evidence: .omo/evidence/task-2-stability-green.txt
  ```

  **Commit**: YES | Message: `test(next-move): add mvp funnel guards` | Files: `tests/e2e/next-move-report.spec.ts`, `tests/e2e/smoke.spec.ts`, `scripts/verify-stability-guards.cjs`, `scripts/test-refactor-regression.sh`

- [ ] 3. MVP Route Rebrand: `/relationship/contact-timing`

  **What to do**: Reframe the primary MVP route as `Next Move Report`.
  - Metadata title/OG/site name must use `Next Move Report`.
  - Header brand text must be `Next Move Report`.
  - H1 must make the promise clear: `연락할까, 기다릴까`.
  - Copy must say: first verdict free, full report USD 9.
  - The route must use `next_move_report_mvp_v1` for new landing/prompt events and `/start` entry.
  - Prompt cards stay relationship/DM specific.
  - Saju/tarot/astrology appear only as evidence layer copy.

  **Must NOT do**: Do not remove direct access to the route. Do not introduce broad fortune language. Do not say "상대 마음 확정", "응답 보장", or "반드시 답장".

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 5, 8, 11 | Blocked By: 1, 2

  **References**:
  - Pattern: `src/app/relationship/contact-timing/page.tsx:13` - route metadata.
  - Pattern: `src/app/relationship/contact-timing/page.tsx:63` - start href builder.
  - Pattern: `src/app/relationship/contact-timing/page.tsx:106` - landing growth event.
  - Pattern: `src/app/relationship/contact-timing/page.tsx:117` - current header brand and price.
  - Pattern: `src/app/relationship/contact-timing/page.tsx:124` - hero section.

  **Acceptance Criteria**:
  - [ ] `http://localhost:3100/relationship/contact-timing` first viewport includes `Next Move Report`, `연락할까`, `기다릴까`, `첫 판정 무료`, `$9`.
  - [ ] Primary CTA href includes `entry=next_move_report_mvp_v1`, `context=love`, and a prefilled contact/wait question.
  - [ ] Prompt cards do not mention CosmicPath as the product brand.
  - [ ] Evidence copy mentions Saju/tarot/astrology only as support, not the product title.

  **RED->GREEN Evidence**:
  ```text
  Automated test: tests/e2e/next-move-report.spec.ts test id "mvp route is branded and routes to start"
  RED command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "mvp route is branded" --project=chromium
  RED expected before implementation: title/brand/price/source assertion fails.
  GREEN command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "mvp route is branded" --project=chromium
  GREEN expected after implementation: route, copy, and CTA assertions pass.
  Evidence:
  - .omo/evidence/task-3-route-red.txt
  - .omo/evidence/task-3-route-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: Desktop MVP route is visibly Next Move Report
    Tool: browser use
    Steps: open http://localhost:3100/relationship/contact-timing; capture screenshot; inspect primary CTA href.
    Expected: first viewport shows `Next Move Report`, `연락할까`, `기다릴까`, `$9`; CTA contains `entry=next_move_report_mvp_v1`.
    Evidence: .omo/evidence/task-3-route-desktop.png

  Scenario: Route metadata is rebranded
    Tool: HTTP call
    Steps: curl -i http://localhost:3100/relationship/contact-timing
    Expected: HTTP 200 and body contains `Next Move Report`; body does not contain `$3.99`.
    Evidence: .omo/evidence/task-3-route-http.txt
  ```

  **Commit**: YES | Message: `feat(next-move): rebrand contact timing entry` | Files: `src/app/relationship/contact-timing/page.tsx`, `tests/e2e/next-move-report.spec.ts`

- [ ] 4. Home, Navigation, Footer, and Legacy Containment

  **What to do**: Make the public home and navigation point to the MVP route, not broad CosmicPath or legacy fortune surfaces.
  - Home metadata should make `Next Move Report` the public brand.
  - Global metadata should use `Next Move Report` for the default public site title, creator, publisher, OG site name, and Twitter title; legacy/legal copy can still reference the operating company.
  - Web app manifest should use `Next Move Report` name/short_name/description.
  - Hero primary CTA should route to `/relationship/contact-timing`, not generic `/start`.
  - Desktop nav and mobile menu should remove primary `/daily`, `/career/uncertainty`, subscriptions/PRO, and other legacy fortune entry points.
  - Global header start CTA should use the MVP route or `/start?reset=true&context=love&entry=next_move_report_mvp_v1&question=...`.
  - Footer can state `Next Move Report by Tony's Company`; terms/privacy remain linked.
  - Legacy routes remain accessible by direct URL.

  **Must NOT do**: Do not delete legacy route files. Do not hide `/terms`, `/privacy`, order lookup, or ops/admin routes. Do not promote subscriptions during the MVP.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 11, 12 | Blocked By: 1, 2

  **References**:
  - Pattern: `src/app/page.tsx:30` - home metadata.
  - Pattern: `src/app/layout.tsx:11` - global metadata.
  - Pattern: `src/app/manifest.ts:3` - PWA manifest metadata.
  - Pattern: `src/components/landing/HeroSection.tsx:12` - current decision entry source.
  - Pattern: `src/components/landing/HeroSection.tsx:103` - primary CTA.
  - Pattern: `src/components/landing/Navigation.tsx:74` - desktop nav legacy links.
  - Pattern: `src/components/landing/Navigation.tsx:129` - mobile nav CTAs.
  - Pattern: `src/components/common/GlobalHeader.tsx:25` - shared start link.
  - Pattern: `src/components/landing/Footer.tsx:14` - footer brand.

  **Acceptance Criteria**:
  - [ ] Homepage title includes `Next Move Report`.
  - [ ] Root metadata and manifest expose `Next Move Report`, not broad CosmicPath.
  - [ ] Desktop primary nav does not expose `/daily`, `/daily/tarot`, `/k-destiny`, `/oracle-chat`, `/en/saju`, `/career/uncertainty`, subscriptions, or `PRO`.
  - [ ] Mobile menu does not expose legacy fortune routes or `PRO`.
  - [ ] Primary home CTA routes to `/relationship/contact-timing`.
  - [ ] Direct `curl -I` to legacy routes still returns a route response and is not removed.

  **RED->GREEN Evidence**:
  ```text
  Automated test: tests/e2e/next-move-report.spec.ts test id "home and nav contain only MVP acquisition"
  RED command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "home and nav" --project=chromium
  RED expected before implementation: old Daily/PRO/CosmicPath expectations fail.
  GREEN command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "home and nav" --project=chromium
  GREEN expected after implementation: no legacy primary links; MVP CTA visible.
  Evidence:
  - .omo/evidence/task-4-nav-red.txt
  - .omo/evidence/task-4-nav-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: Desktop primary acquisition is contained
    Tool: browser use
    Steps: open http://localhost:3100/ at 1440x1000; inspect links and screenshot.
    Expected: primary CTA links to `/relationship/contact-timing`; legacy fortune/subscription links are absent from primary nav.
    Evidence: .omo/evidence/task-4-home-desktop.png

  Scenario: Legacy routes are hidden but not deleted
    Tool: HTTP call
    Steps: curl -I http://localhost:3100/daily; curl -I http://localhost:3100/k-destiny; curl -I http://localhost:3100/oracle-chat; curl -I http://localhost:3100/career/uncertainty
    Expected: each route returns a non-404 response or intentional auth/redirect response; no file deletion required.
    Evidence: .omo/evidence/task-4-legacy-direct-urls.txt
  ```

  **Commit**: YES | Message: `feat(next-move): focus primary acquisition` | Files: `src/app/layout.tsx`, `src/app/manifest.ts`, `src/app/page.tsx`, `src/components/landing/HeroSection.tsx`, `src/components/landing/Navigation.tsx`, `src/components/common/GlobalHeader.tsx`, `src/components/landing/Footer.tsx`, `tests/e2e/smoke.spec.ts`, `tests/e2e/next-move-report.spec.ts`

- [ ] 5. Start Flow and Free Verdict Contract

  **What to do**: Make `/start` handle `next_move_report_mvp_v1` as the MVP source and ensure the free result is a concrete first verdict.
  - Add `next_move_report_mvp_v1` to decision timing source recognition.
  - Preserve prefilled question and `context=love`.
  - Start input copy should be relationship/DM decision-specific when this entry is active.
  - Question must be the first required step. Birth data/time/tarot must be framed as optional evidence precision; if existing components need values, use default/unknown-time behavior without presenting them as the product promise.
  - Result card should treat `next_move_report_mvp_v1` as relationship contact timing.
  - Free result must expose verdict, evidence summary, and next move before paywall.
  - Follow-up seed should use a Next Move event name while continuing to count legacy relationship events.

  **Must NOT do**: Do not require login before the free verdict. Do not push the user to pay before seeing the first verdict. Do not lose old `relationship_contact_timing_v1` sessions.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 6, 8, 9 | Blocked By: 1, 2, 3

  **References**:
  - Pattern: `src/app/start/start-page-helpers.ts:89` - decision timing source set.
  - Pattern: `src/app/start/page.tsx:110` - entry and language query parsing.
  - Pattern: `src/app/start/page.tsx:367` - input submit tracking.
  - Pattern: `src/app/start/start-input-stage.tsx:34` - start stage label/copy.
  - Pattern: `src/app/start/start-result-stage.tsx:125` - relationship source detection.
  - Pattern: `src/app/start/start-result-stage.tsx:143` - free decision brief.
  - Pattern: `src/app/start/start-result-stage.tsx:284` - 7-day outcome seed.

  **Acceptance Criteria**:
  - [ ] `/start?reset=true&context=love&entry=next_move_report_mvp_v1&question=...` sets source to `next_move_report_mvp_v1`.
  - [ ] The textarea is prefilled with the relationship/DM question.
  - [ ] A user can proceed toward the free verdict without believing birth/tarot is the purchased product; those inputs are labeled as optional evidence precision or have safe defaults.
  - [ ] Free result copy uses contact/wait language, not generic "career/wealth/daily".
  - [ ] Result card labels include `연락 판정`, `근거 요약`, `다음 연락 행동`.
  - [ ] Follow-up seed tracks a Next Move source/event and remains grouped with relationship-contact funnels.

  **RED->GREEN Evidence**:
  ```text
  Automated test: tests/e2e/next-move-report.spec.ts test id "start keeps Next Move source and prefilled question"
  RED command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "start keeps Next Move source" --project=chromium
  RED expected before implementation: source or prefill assertion fails.
  GREEN command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "start keeps Next Move source" --project=chromium
  GREEN expected after implementation: source, prefill, and stage copy pass.
  Evidence:
  - .omo/evidence/task-5-start-red.txt
  - .omo/evidence/task-5-start-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: Start route keeps the MVP question
    Tool: browser use
    Steps: open http://localhost:3100/start?reset=true&context=love&entry=next_move_report_mvp_v1&question=%EC%A7%80%EA%B8%88%20%EB%A8%BC%EC%A0%80%20%EC%97%B0%EB%9D%BD%ED%95%A0%EA%B9%8C%3F; inspect textarea.
    Expected: page shows relationship decision copy and textarea contains `지금 먼저 연락할까?`.
    Evidence: .omo/evidence/task-5-start-prefill.png

  Scenario: Source recognition remains backward compatible
    Tool: bash
    Steps: rg -n "next_move_report_mvp_v1|relationship_contact_timing_v1|en_relationship_contact_timing_v1" src/app/start/start-page-helpers.ts src/app/start/start-result-stage.tsx
    Expected: all three sources are recognized or mapped.
    Evidence: .omo/evidence/task-5-source-compat.txt
  ```

  **Commit**: YES | Message: `feat(next-move): route start flow through mvp source` | Files: `src/app/start/start-page-helpers.ts`, `src/app/start/page.tsx`, `src/app/start/start-input-stage.tsx`, `src/app/start/start-result-stage.tsx`, `tests/e2e/next-move-report.spec.ts`

- [ ] 6. Relationship Safety and Evidence Layer

  **What to do**: Add functional safety and positioning guardrails for relationship/DM decisions.
  - Update prompt/shared rules or generation instructions so the free and paid reports do not guarantee replies/outcomes.
  - Ensure risky/stalking/pressure contexts produce hold/safety guidance.
  - Use Saju/tarot/astrology as `why this verdict` evidence, not front-facing product promise.
  - Add source contract checks for banned language.
  - Make English and Korean copy consistent where the source is relationship/DM.

  **Must NOT do**: Do not turn this into therapy, diagnosis, legal advice, coercive dating advice, or "make them respond" content. Do not add outcome accuracy claims.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 8, 10 | Blocked By: 1, 2, 5

  **References**:
  - Pattern: `src/lib/ai/prompt-shared-rules.ts` - shared output constraints and `free_focus` rules.
  - Pattern: `src/app/api/reading/reading-generation-service.ts` - report generation service.
  - Pattern: `src/app/api/reading/route-helpers.ts` - parsing/fallback helpers.
  - Pattern: `src/app/start/start-result-stage.tsx:174` - evidence summary fallback.
  - Pattern: `src/app/start/start-result-stage.tsx:181` - next move fallback.
  - Pattern: `src/components/payment/PaymentModal.tsx:510` - relationship unlock benefits.

  **Acceptance Criteria**:
  - [ ] Generated/report fallback copy never guarantees a reply, reunion, or relationship outcome.
  - [ ] Banned phrases are absent: `100%`, `무조건 답장`, `반드시 연락`, `make them respond`, `guaranteed reply`.
  - [ ] High-risk language produces `보류`/`Hold` style guidance or a safety boundary.
  - [ ] Saju/tarot/astrology appear as evidence labels, not as the route/product H1.

  **RED->GREEN Evidence**:
  ```text
  Automated test: scripts/verify-stability-guards.cjs
  RED command: npm run verify:stability
  RED expected before implementation: missing Next Move relationship safety invariant or banned phrase guard.
  GREEN command: npm run verify:stability
  GREEN expected after implementation: safety and evidence-layer invariants pass.
  Evidence:
  - .omo/evidence/task-6-safety-red.txt
  - .omo/evidence/task-6-safety-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: Banned relationship pressure claims are absent
    Tool: bash
    Steps: rg -n "100%|무조건 답장|반드시 연락|make them respond|guaranteed reply|stalk|스토킹" src
    Expected: no product/report copy encourages guaranteed reply, pressure tactics, or stalking; any match is in explicit safety/disclaimer context.
    Evidence: .omo/evidence/task-6-banned-claims.txt

  Scenario: Safety boundary appears on MVP surfaces
    Tool: bash
    Steps: rg -n "보장하지|압박|스토킹|안전|Decision support only|No guaranteed" src/app/relationship src/app/start src/lib/ai src/components/payment
    Expected: safety language exists in route, report/generation rules, and paywall/trust copy.
    Evidence: .omo/evidence/task-6-safety-language.txt
  ```

  **Commit**: YES | Message: `feat(next-move): add relationship safety guardrails` | Files: `src/lib/ai/prompt-shared-rules.ts`, `src/app/api/reading/reading-generation-service.ts`, `src/app/start/start-result-stage.tsx`, `src/components/payment/PaymentModal.tsx`, `scripts/verify-stability-guards.cjs`

- [ ] 7. USD 9 Stripe Price Contract

  **What to do**: Make the paid report truthfully price as USD 9.
  - Set `READING_PRODUCT.price` fallback to `900`.
  - Rename product display copy to `Next Move Report Full Report` or Korean equivalent.
  - Ensure `/api/payment/price` fallback returns `$9.00` for reading product.
  - Ensure live Stripe lookup is not allowed to silently display `$3.99`.
  - If current Stripe product default price is still `$3.99`, update the existing reading product default price to a USD 9 one-time Stripe price, or update reading product env config to a USD 9 one-time product and document that business-setting exception in `docs/api-spec.md`. The code must not claim `$9` while Stripe checkout charges `$3.99`.

  **Must NOT do**: Do not add Toss/KRW. Do not add subscriptions. Do not use a weekly recurring price. Do not fake checkout amount in UI only.

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: 8 | Blocked By: 1, 2

  **References**:
  - Pattern: `src/lib/payment/payment-config.ts:17` - reading product config.
  - Pattern: `docs/api-spec.md:39` - prior `$3.99` contract to amend.
  - Pattern: `docs/api-spec.md:397` - prior no-new-Stripe-SKU non-goal to reconcile.
  - Pattern: `src/app/api/payment/price/route.ts:17` - fallback price response.
  - Pattern: `src/lib/payment/stripe.ts:75` - product price lookup.
  - Pattern: `src/lib/payment/stripe.ts:228` - checkout session uses Stripe product default price.
  - Pattern: `src/components/payment/PaymentModal.tsx:75` - fallback price label.

  **Acceptance Criteria**:
  - [ ] Fallback reading price is `$9.00`.
  - [ ] `/api/payment/price?productId=<READING_PRODUCT.productId>` returns `$9.00` in fallback mode.
  - [ ] Live Stripe price, when configured, returns `$9.00` or the release is blocked.
  - [ ] No user-facing `$3.99` remains in Next Move acquisition/paywall surfaces.

  **RED->GREEN Evidence**:
  ```text
  Automated test: scripts/verify-stability-guards.cjs
  RED command: npm run verify:stability
  RED expected before implementation: reading fallback price invariant sees `399` or `$3.99`.
  GREEN command: npm run verify:stability
  GREEN expected after implementation: reading fallback price invariant sees `900` and `$9.00`.
  Evidence:
  - .omo/evidence/task-7-price-red.txt
  - .omo/evidence/task-7-price-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: Price endpoint returns USD 9 fallback
    Tool: HTTP call
    Steps: curl -i "http://localhost:3100/api/payment/price?productId=<READING_PRODUCT.productId>"
    Expected: HTTP 200; JSON contains `"currency":"USD"` and `"formattedPrice":"$9.00"` or a live Stripe `$9.00`; if live returns `$3.99`, mark BLOCKED.
    Evidence: .omo/evidence/task-7-price-endpoint.txt

  Scenario: No old $3.99 offer remains on MVP surfaces
    Tool: bash
    Steps: rg -n "\\$3\\.99|399" src/app/relationship src/components/payment src/lib/payment tests/e2e scripts
    Expected: no `$3.99` in MVP/paywall copy; `399` only allowed in unrelated legacy subscription/chat product constants with explicit context.
    Evidence: .omo/evidence/task-7-old-price-rg.txt
  ```

  **Commit**: YES | Message: `feat(payment): set next move report price` | Files: `src/lib/payment/payment-config.ts`, `src/app/api/payment/price/route.ts`, `scripts/verify-stability-guards.cjs`, optional `.env.example` if present

- [ ] 8. Paywall, Checkout Success, and Paid Report Offer

  **What to do**: Align paid unlock UI and checkout success with the MVP.
  - `PaymentModal` must show `Next Move Report` and USD 9.
  - Relationship benefits must be exactly: why this verdict, contact timing, message to avoid.
  - Checkout start must send `source=next_move_report_mvp_v1`.
  - Payment success must preserve source/language and avoid CosmicPath-only success copy for the MVP.
  - Paid report renderer should not sell broad "50-page fortune" language on this source.

  **Must NOT do**: Do not promote subscription/PRO. Do not show a mismatch between modal price and checkout price. Do not make email mandatory except for 100% promo flow.

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: 9, 12 | Blocked By: 3, 5, 6, 7

  **References**:
  - Pattern: `src/components/payment/PaymentModal.tsx:58` - language and relationship source detection.
  - Pattern: `src/components/payment/PaymentModal.tsx:183` - paywall open tracking.
  - Pattern: `src/components/payment/PaymentModal.tsx:403` - payment API call.
  - Pattern: `src/components/payment/PaymentModal.tsx:510` - relationship benefits.
  - Pattern: `src/components/payment/PaymentModal.tsx:590` - modal headline.
  - Pattern: `src/app/payment/success/page.tsx:52` - payment verification call.
  - Pattern: `src/app/payment/success/page.tsx:61` - resolved source.
  - Pattern: `src/components/reading/premium-report.tsx:797` - payment modal integration.

  **Acceptance Criteria**:
  - [ ] Paywall modal opened from the MVP source displays `Next Move Report`, `$9.00`, and the three relationship unlocks.
  - [ ] Paywall event source is `next_move_report_mvp_v1`.
  - [ ] Checkout POST body contains `source: next_move_report_mvp_v1`.
  - [ ] Payment success page tracks `checkout_success` with the resolved source.
  - [ ] No subscription/PRO CTA appears in MVP acquisition or paywall.

  **RED->GREEN Evidence**:
  ```text
  Automated test: tests/e2e/next-move-report.spec.ts test id "paywall shows USD 9 Next Move offer"
  RED command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "paywall shows USD 9" --project=chromium
  RED expected before implementation: paywall says `$3.99` or generic CosmicPath.
  GREEN command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "paywall shows USD 9" --project=chromium
  GREEN expected after implementation: modal copy, price, and unlock sections pass.
  Evidence:
  - .omo/evidence/task-8-paywall-red.txt
  - .omo/evidence/task-8-paywall-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: Paywall modal presents the correct offer
    Tool: browser use
    Steps: open a seeded/free-result state for `/start?entry=next_move_report_mvp_v1`; click unlock; capture modal screenshot.
    Expected: modal shows `Next Move Report`, `$9.00`, `왜 이 판정인지`, `연락 타이밍`, `피해야 할 메시지`; no `PRO`.
    Evidence: .omo/evidence/task-8-paywall-modal.png

  Scenario: Payment API rejects bad product but accepts configured reading product
    Tool: HTTP call
    Steps: curl -i -X POST http://localhost:3100/api/payment -H "Content-Type: application/json" -d '{"productId":"bad_product","source":"next_move_report_mvp_v1"}'
    Expected: HTTP 400 with unauthorized product error; no checkout URL.
    Evidence: .omo/evidence/task-8-payment-bad-product.txt
  ```

  **Commit**: YES | Message: `feat(payment): align next move checkout offer` | Files: `src/components/payment/PaymentModal.tsx`, `src/app/api/payment/route.ts`, `src/app/payment/success/page.tsx`, `src/components/reading/premium-report.tsx`, `tests/e2e/next-move-report.spec.ts`

- [ ] 9. Growth Metrics and Ops Readout

  **What to do**: Make `/ops/growth` answer whether the MVP is worth continuing after 14 days.
  - Add a `next-move-report` campaign definition.
  - Group sources: `next_move_report_mvp_v1`, `relationship_contact_timing_v1`, optionally `start_page_next_move_report_mvp_v1`.
  - Add prompt events for Next Move CTA/prompt clicks.
  - Add follow-up seed events for Next Move.
  - Add copy/thresholds to the dashboard so 14-day readout is visible.
  - Do not read user relationship text in ops; use event metadata only.

  **Must NOT do**: Do not store or display raw DM/relationship text in `/ops/growth`. Do not break existing career/English campaign funnels.

  **Parallelization**: Can Parallel: NO | Wave 5 | Blocks: 12 | Blocked By: 1, 2, 5, 8

  **References**:
  - Pattern: `src/lib/growth-metrics.ts:125` - campaign funnel definitions.
  - Pattern: `src/lib/growth-metrics.ts:227` - event-to-stage mapping.
  - Pattern: `src/components/ops/GrowthDashboard.tsx:207` - campaign icon selection.
  - Pattern: `src/components/ops/GrowthDashboard.tsx:267` - campaign funnel row.
  - Pattern: `src/components/ops/GrowthDashboard.tsx:472` - campaign funnel section.
  - Pattern: `src/app/api/growth/track/route.ts:7` - growth event schema.

  **Acceptance Criteria**:
  - [ ] `/ops/growth` shows a `Next Move Report` or equivalent MVP campaign row.
  - [ ] The row counts landing, CTA, question submit, free result, paywall, checkout, paid conversion, and follow-up seed.
  - [ ] Existing `relationship_contact_timing_v1` events contribute to historical compatibility where appropriate.
  - [ ] Ops dashboard does not expose raw user question text.
  - [ ] Decision thresholds are included: visits 300 or 14 days, question starts 45, free verdicts 30, paywall opens 8, paid conversions 2, follow-up seeds 8.

  **RED->GREEN Evidence**:
  ```text
  Automated test: scripts/verify-stability-guards.cjs
  RED command: npm run verify:stability
  RED expected before implementation: missing Next Move campaign funnel or threshold invariant.
  GREEN command: npm run verify:stability
  GREEN expected after implementation: campaign source grouping and threshold invariants pass.
  Evidence:
  - .omo/evidence/task-9-growth-red.txt
  - .omo/evidence/task-9-growth-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: Growth API accepts Next Move event
    Tool: HTTP call
    Steps: curl -i -X POST http://localhost:3100/api/growth/track -H "Content-Type: application/json" -d '{"event":"landing_view","source":"next_move_report_mvp_v1","sessionId":"qa-next-move-001","language":"ko","context":"love","metadata":{"landingVariant":"next_move_report_mvp_v1"}}'
    Expected: HTTP 200 with `{"ok":true}`.
    Evidence: .omo/evidence/task-9-growth-track.txt

  Scenario: Ops dashboard exposes campaign row without raw question
    Tool: browser use
    Steps: open http://localhost:3100/ops/growth; capture screenshot; inspect text.
    Expected: visible campaign row for Next Move; no raw relationship question text appears.
    Evidence: .omo/evidence/task-9-ops-growth.png
  ```

  **Commit**: YES | Message: `feat(growth): add next move mvp funnel` | Files: `src/lib/growth-metrics.ts`, `src/components/ops/GrowthDashboard.tsx`, `src/app/api/growth/track/route.ts`, `scripts/verify-stability-guards.cjs`

- [ ] 10. Trust, Privacy, and Legal Boundaries

  **What to do**: Update trust pages for this exact product.
  - Terms must explain decision-support content, no guaranteed relationship outcome, no therapy/medical/diagnostic/legal advice, refund boundary for one-off digital reports, and USD/Stripe checkout.
  - Privacy must explain optional birth data, relationship/DM context entered by the user, report restore/storage, analytics, and "do not paste highly sensitive third-party secrets".
  - Keep Korean governing version and English summary coherent.
  - Footer/legal pages remain reachable from public surfaces.

  **Must NOT do**: Do not hide legal pages. Do not imply therapy or professional advice. Do not over-collect data.

  **Parallelization**: Can Parallel: NO | Wave 6 | Blocks: 12 | Blocked By: 2, 6, 7

  **References**:
  - Pattern: `src/app/terms/page.tsx:23` - English summary area.
  - Pattern: `src/app/terms/page.tsx:121` - payment section.
  - Pattern: `src/app/terms/page.tsx:130` - refund section.
  - Pattern: `src/app/terms/page.tsx:152` - disclaimer section.
  - Pattern: `src/app/privacy/page.tsx:23` - English summary area.
  - Pattern: `src/app/privacy/page.tsx:74` - collected personal information.
  - Pattern: `src/app/privacy/page.tsx:103` - purpose section.
  - Pattern: `src/components/landing/Footer.tsx:24` - legal links.

  **Acceptance Criteria**:
  - [ ] `/terms` includes `Next Move Report`, decision-support, no guaranteed outcome, refund boundary, USD/Stripe.
  - [ ] `/privacy` includes relationship/DM text, optional birth data, report restore, analytics, and sensitive third-party secret warning.
  - [ ] Both pages return HTTP 200.
  - [ ] Footer links to `/terms` and `/privacy` remain visible.

  **RED->GREEN Evidence**:
  ```text
  Automated test: tests/e2e/next-move-report.spec.ts test id "trust pages expose Next Move boundaries"
  RED command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "trust pages" --project=chromium
  RED expected before implementation: missing Next Move/privacy/safety text.
  GREEN command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "trust pages" --project=chromium
  GREEN expected after implementation: terms/privacy assertions pass.
  Evidence:
  - .omo/evidence/task-10-trust-red.txt
  - .omo/evidence/task-10-trust-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: Terms disclose product and refund boundary
    Tool: HTTP call
    Steps: curl -i http://localhost:3100/terms
    Expected: HTTP 200; body contains `Next Move Report`, `decision-support`, `no guaranteed`, `refund`, `Stripe`, `USD`.
    Evidence: .omo/evidence/task-10-terms-http.txt

  Scenario: Privacy discloses relationship and birth data handling
    Tool: HTTP call
    Steps: curl -i http://localhost:3100/privacy
    Expected: HTTP 200; body contains relationship/DM context, optional birth data, report restore/generation, and sensitive third-party warning.
    Evidence: .omo/evidence/task-10-privacy-http.txt
  ```

  **Commit**: YES | Message: `feat(trust): update next move legal boundaries` | Files: `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`, `src/components/landing/Footer.tsx`, `tests/e2e/next-move-report.spec.ts`

- [ ] 11. English Probe and SEO Containment

  **What to do**: Prevent half-rebranded English/SEO leakage.
  - `/en/contact-timing` must either fully say `Next Move Report`, `$9`, and source-compatible contact timing, or set `robots.index=false` until QA is green.
  - `sitemap.ts` should prioritize `/relationship/contact-timing` and not promote legacy `/daily` or `/career/uncertainty` during MVP.
  - `/en/saju` remains direct-access but not primary acquisition unless fully QA-covered.
  - Home English guide section should not distract from the MVP unless retained intentionally below the first viewport.
  - Robots should still point to sitemap and allow legal/public routes.

  **Must NOT do**: Do not delete English routes. Do not run a full global relaunch. Do not make `/en/saju` the main CTA.

  **Parallelization**: Can Parallel: NO | Wave 7 | Blocks: 12 | Blocked By: 2, 3, 4, 8, 10

  **References**:
  - Pattern: `src/app/en/contact-timing/page.tsx:13` - English route metadata.
  - Pattern: `src/app/en/contact-timing/page.tsx:65` - English start href.
  - Pattern: `src/app/en/contact-timing/page.tsx:107` - English header brand/price.
  - Pattern: `src/components/landing/EnglishGuideSection.tsx:61` - English guide CTAs.
  - Pattern: `src/app/sitemap.ts:19` - current legacy sitemap entries.
  - Pattern: `src/app/robots.ts` - robots rules and sitemap pointer.

  **Acceptance Criteria**:
  - [ ] `/en/contact-timing` is either fully rebranded to `Next Move Report` and `$9`, or non-indexed.
  - [ ] Sitemap includes the MVP route and legal pages.
  - [ ] Sitemap does not promote `/daily` or `/career/uncertainty` as high-priority acquisition routes for this MVP.
  - [ ] Direct old English/Saju pages remain accessible if they existed before.
  - [ ] English copy still says decision-support only.

  **RED->GREEN Evidence**:
  ```text
  Automated test: tests/e2e/next-move-report.spec.ts test id "english probe is not half rebranded"
  RED command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "english probe" --project=chromium
  RED expected before implementation: page still says CosmicPath/$3.99 while indexed.
  GREEN command: npx playwright test tests/e2e/next-move-report.spec.ts --grep "english probe" --project=chromium
  GREEN expected after implementation: page is fully rebranded or robots noindex is asserted.
  Evidence:
  - .omo/evidence/task-11-english-red.txt
  - .omo/evidence/task-11-english-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: English probe is not half rebranded
    Tool: browser use
    Steps: open http://localhost:3100/en/contact-timing; capture screenshot; inspect metadata if visible copy is not rebranded.
    Expected: either visible page says `Next Move Report` and `$9`, or page metadata/robots sets noindex.
    Evidence: .omo/evidence/task-11-english-probe.png

  Scenario: Sitemap prioritizes MVP, not legacy acquisition
    Tool: HTTP call
    Steps: curl -i http://localhost:3100/sitemap.xml
    Expected: includes `/relationship/contact-timing`; legacy `/daily` and `/career/uncertainty` are absent or lower priority per implementation decision; legal pages included.
    Evidence: .omo/evidence/task-11-sitemap.txt
  ```

  **Commit**: YES | Message: `feat(seo): contain next move probe surfaces` | Files: `src/app/en/contact-timing/page.tsx`, `src/components/landing/EnglishGuideSection.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `tests/e2e/next-move-report.spec.ts`

- [ ] 12. Operating Loop and Launch Evidence Bundle

  **What to do**: Create the operating documents and final evidence bundle for running the MVP.
  - Create `docs/revenue/next-move-report-mvp-operating-loop.md`.
  - Include weekly operating budget: 2h content creation, 1h copy/report iteration, 1h user evidence review, 1h metrics/readout.
  - Include 14-day decision thresholds:
    - PASS: 300 targeted visits or 14 days, 45 question starts, 30 free verdicts, 8 paywall opens, 2 paid conversions, 8 follow-up seeds.
    - REVISE ENTRY: 300 visits but <25 question starts.
    - REVISE OFFER: 30 free verdicts but 0 paid conversions.
    - HOLD EXPANSION: <8 follow-up seeds.
    - BLOCK LAUNCH: Stripe live price not USD 9 while UI says USD 9.
  - Include 12-week loop:
    - Weeks 1-2: launch and measure.
    - Weeks 3-4: paywall/report copy iteration.
    - Weeks 5-8: English probe or $19 upsell only if paid conversions exist.
    - Weeks 9-12: scale winning content and consider email/Kakao follow-up.
  - Create an evidence index at `.omo/evidence/next-move-report-evidence-index.md`.

  **Must NOT do**: Do not propose custom consulting, paid ads, SaaS onboarding, a subscription, or Toss/KRW in MVP operations.

  **Parallelization**: Can Parallel: NO | Wave 8 | Blocks: Final Verification | Blocked By: 4, 8, 9, 10, 11

  **References**:
  - Pattern: `.agent/memory/task_board.md:89` - previous relationship contact timing plan.
  - Pattern: `.agent/memory/task_board.md:235` - funnel tracking check.
  - Pattern: `docs/revenue/relationship-contact-timing-threads-batch-2026-05-24.json` - prior content batch format.
  - Pattern: `.agent/memory/revenue/experiments/cosmicpath-relationship-contact-timing-v1.json` - prior revenue experiment state.
  - Pattern: `.omo/evidence/` - evidence directory required by this plan.

  **Acceptance Criteria**:
  - [ ] Operating loop document exists and contains all thresholds.
  - [ ] Scope creep exclusions are explicit.
  - [ ] Evidence index lists every task's RED, GREEN, and manual QA artifact path.
  - [ ] No MVP operation step requires paid ads, Toss/KRW, subscription, or custom consulting.

  **RED->GREEN Evidence**:
  ```text
  Automated test: scripts/test-refactor-regression.sh or a new docs contract check inside it
  RED command: npm test
  RED expected before implementation: missing `next-move-report-mvp-operating-loop.md` and threshold text.
  GREEN command: npm test
  GREEN expected after implementation: docs contract checks pass.
  Evidence:
  - .omo/evidence/task-12-operating-loop-red.txt
  - .omo/evidence/task-12-operating-loop-green.txt
  ```

  **QA Scenarios**:
  ```text
  Scenario: Operating loop has sales math and launch gates
    Tool: bash
    Steps: rg -n "300 targeted visits|45 question starts|30 free verdicts|8 paywall opens|2 paid conversions|8 follow-up seeds|Weeks 1-2|Weeks 9-12" docs/revenue/next-move-report-mvp-operating-loop.md
    Expected: all thresholds and weekly decisions are present.
    Evidence: .omo/evidence/task-12-operating-loop.txt

  Scenario: Operating loop avoids scope creep
    Tool: bash
    Steps: rg -n "Toss|KRW|subscription|custom consulting|paid ads|SaaS onboarding" docs/revenue/next-move-report-mvp-operating-loop.md
    Expected: terms appear only in explicit out-of-scope/do-not-do sections.
    Evidence: .omo/evidence/task-12-scope-creep.txt
  ```

  **Commit**: YES | Message: `docs(revenue): define next move operating loop` | Files: `docs/revenue/next-move-report-mvp-operating-loop.md`, `.omo/evidence/next-move-report-evidence-index.md`, `scripts/test-refactor-regression.sh`

## Final Verification Wave (MANDATORY - after ALL implementation tasks)
> ALL must APPROVE before the implementer reports the MVP as complete.

- [ ] F1. Plan Compliance Audit
  - Command: `rg -n "Next Move Report|next_move_report_mvp_v1|\\$9\\.00|relationship_contact_timing_v1|en_relationship_contact_timing_v1" src tests scripts docs`
  - Expected: new MVP source and price are present; legacy sources remain compatible.
  - Evidence: `.omo/evidence/f1-plan-compliance.txt`

- [ ] F2. Full Automated Validation
  - Command: `npm test`
  - Command: `npm run verify:stability`
  - Command: `npm run lint`
  - Command: `npm run build`
  - Command: `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium`
  - Command: `npx playwright test tests/e2e/next-move-report.spec.ts --project=mobile-chrome`
  - Expected: all commands exit 0.
  - Evidence:
    - `.omo/evidence/f2-npm-test.txt`
    - `.omo/evidence/f2-stability.txt`
    - `.omo/evidence/f2-lint.txt`
    - `.omo/evidence/f2-build.txt`
    - `.omo/evidence/f2-playwright-desktop.txt`
    - `.omo/evidence/f2-playwright-mobile.txt`

- [ ] F3. Real Manual QA
  - Browser: `http://localhost:3100/`
    - Expected: first viewport routes to Next Move MVP, no legacy primary nav.
    - Evidence: `.omo/evidence/f3-home-desktop.png`, `.omo/evidence/f3-home-mobile.png`
  - Browser: `http://localhost:3100/relationship/contact-timing`
    - Expected: Next Move route shows free verdict + $9 promise and CTA to source-tagged `/start`.
    - Evidence: `.omo/evidence/f3-mvp-route-desktop.png`, `.omo/evidence/f3-mvp-route-mobile.png`
  - Browser: `/start?reset=true&context=love&entry=next_move_report_mvp_v1&question=...`
    - Expected: prefilled relationship question and Next Move result/paywall flow.
    - Evidence: `.omo/evidence/f3-start-flow.png`
  - HTTP: `curl -i "http://localhost:3100/api/payment/price?productId=<READING_PRODUCT.productId>"`
    - Expected: `$9.00` fallback/live price or explicit launch block.
    - Evidence: `.omo/evidence/f3-price-http.txt`
  - Browser: `http://localhost:3100/ops/growth`
    - Expected: Next Move funnel row visible, no raw question text.
    - Evidence: `.omo/evidence/f3-ops-growth.png`

- [ ] F4. Scope Fidelity Check
  - Command: `rg -n "Toss|KRW|subscription|PRO|custom consulting|paid ads|guaranteed reply|100%|무조건 답장|반드시 연락" src docs tests`
  - Expected: no prohibited MVP copy except explicit out-of-scope/legal safety sections.
  - Evidence: `.omo/evidence/f4-scope-fidelity.txt`

- [ ] F5. Reviewer Gate
  - Spawn `codex-ultrawork-reviewer` with the diff, this plan, evidence index, and all F1-F4 outputs.
  - Expected: UNCONDITIONAL APPROVAL.
  - Evidence: `.omo/evidence/f5-reviewer-approval.txt`

## Commit Strategy
- Do not auto-commit unless the user asks.
- Use atomic conventional commits by task.
- Suggested commits:
  - `chore(next-move): define mvp source contracts`
  - `test(next-move): add mvp funnel guards`
  - `feat(next-move): rebrand contact timing entry`
  - `feat(next-move): focus primary acquisition`
  - `feat(next-move): route start flow through mvp source`
  - `feat(next-move): add relationship safety guardrails`
  - `feat(payment): set next move report price`
  - `feat(payment): align next move checkout offer`
  - `feat(growth): add next move mvp funnel`
  - `feat(trust): update next move legal boundaries`
  - `feat(seo): contain next move probe surfaces`
  - `docs(revenue): define next move operating loop`
- If commits are made, include footer:
  - `Plan: .omo/plans/next-move-report-mvp.md`

## Success Criteria
- Product no longer feels like a broad fortune app on first impression.
- A visitor understands in 5 seconds: "this helps me decide whether to text or wait."
- A free user receives a concrete first verdict.
- A paid user sees a truthful USD 9 Stripe-backed report offer.
- Saju/tarot/astrology are evidence layers, not the product title.
- Funnel metrics can answer whether to continue after 14 days.
- Legacy CosmicPath pages are hidden from acquisition but not deleted.
- The user can operate validation in 5 hours/week.
