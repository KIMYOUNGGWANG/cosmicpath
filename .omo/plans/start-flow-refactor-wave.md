# Start Flow Refactor Wave

## TL;DR
> **Summary**: Refactor the `/start` flow after the PaymentModal cleanup by extracting orchestration, payment preparation, tracking, resume restore, reading generation, and result-action responsibilities from oversized start modules without changing product behavior.
> **Deliverables**:
> - `src/app/start/page.tsx` reduced below 250 pure LOC.
> - `src/app/start/use-start-resume.ts` reduced below 250 pure LOC.
> - `src/app/start/start-result-stage.tsx` split enough that every edited/new start-flow file stays below 250 pure LOC.
> - Characterization tests and real browser/HTTP QA evidence for prefill, free verdict, paywall, paid resume, and result actions.
> **Effort**: Large
> **Parallel**: YES - 5 waves
> **Critical Path**: Task 1 -> Task 2 -> Task 5 -> Task 8 -> Final Verification

## Context
### Original Request
The current verified Next Move Report / PaymentModal changes were committed first. The next requested step is a plan for the next refactor wave.

### Interview Summary
- No new product feature is requested.
- Default decision: conservative refactor only, preserving `/start` behavior.
- The next bottleneck is start-flow orchestration, not payment modal UI.

### Metis Review (gaps addressed)
Metis subagent was requested but did not return after follow-up; gap analysis was completed directly from repo evidence.
- Risk: `src/app/start/page.tsx` currently owns too many side effects. Plan splits by responsibility, not by line count.
- Risk: resume/payment flows are fragile. Plan requires characterization tests before extraction.
- Risk: `start-result-stage.tsx` is adjacent to conversion behavior. Plan isolates low-risk presentational/action panels first.
- Risk: `.omo` evidence is local and uncommitted. Plan requires fresh evidence paths under `.omo/evidence/start-flow-refactor-*`.

## Work Objectives
### Core Objective
Make `/start` maintainable by turning the current monolithic page into a thin coordinator while preserving Next Move Report acquisition, free verdict, premium checkout, resume, share/review, and growth tracking behavior.

### Deliverables
- New hooks/modules:
  - `src/app/start/use-start-payment-prep.ts`
  - `src/app/start/use-start-growth-tracking.ts`
  - `src/app/start/use-start-step-transitions.ts`
  - `src/app/start/use-start-reading-generation.ts`
  - `src/app/start/start-reading-generation.ts`
  - `src/app/start/start-unified-result.ts`
  - `src/app/start/use-start-result-actions.ts`
  - `src/app/start/start-resume-snapshot.ts`
  - `src/app/start/start-resume-premium.ts`
  - `src/app/start/start-result-actions-panel.tsx`
  - `src/app/start/start-result-followup-panel.tsx`
- Stability guard updates in `scripts/verify-stability-guards.cjs`.
- E2E and shell regression tests updated under `tests/e2e/next-move-report.spec.ts`, `tests/e2e/next-move-report-paywall-checkout.spec.ts`, and `scripts/test-refactor-regression.sh`.

### Definition of Done (verifiable conditions with commands)
- `npm run verify:stability`
- `npm test`
- `npm run build`
- `npx eslint src/app/start/page.tsx src/app/start/use-start-resume.ts src/app/start/start-result-stage.tsx src/app/start/use-start-payment-prep.ts src/app/start/use-start-growth-tracking.ts src/app/start/use-start-step-transitions.ts src/app/start/use-start-reading-generation.ts src/app/start/start-reading-generation.ts src/app/start/start-unified-result.ts src/app/start/use-start-result-actions.ts src/app/start/start-resume-snapshot.ts src/app/start/start-resume-premium.ts src/app/start/start-result-actions-panel.tsx src/app/start/start-result-followup-panel.tsx tests/e2e/next-move-report.spec.ts tests/e2e/next-move-report-paywall-checkout.spec.ts`
- `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "start keeps Next Move source and prefilled question|paywall shows USD 9 Next Move offer|paywall pauses checkout when Stripe price contract mismatches"`
- `npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium`
- `git diff --check`
- `lsof -nP -iTCP:3100 -sTCP:LISTEN` returns no listener after browser QA.

### Must Have
- Every edited/new start-flow source file must stay below 250 pure LOC.
- `page.tsx` must remain the only default route component and should only compose hooks/stages/modals.
- All tracking event names and source values must remain unchanged.
- All `/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=...` behavior must remain unchanged.
- Premium resume and free promo checkout behavior must remain unchanged.

### Must NOT Have
- No UI redesign.
- No API contract changes.
- No payment price/product contract changes.
- No new dependency.
- No deletion or weakening of existing tests.
- No committing `.omo` evidence unless explicitly requested.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: TDD / characterization-first. Each refactor task must add or extend a failing characterization or guard before production extraction.
- QA policy: Every task has agent-executed scenarios.
- Evidence: `.omo/evidence/start-flow-refactor-task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. This refactor has hard dependencies, so foundation and final waves are narrower by design.

Wave 1: Task 1
Wave 2: Tasks 2, 3, 4
Wave 3: Tasks 5, 6, 7
Wave 4: Task 8
Wave 5: Final Verification Wave

### Dependency Matrix

| Task | Depends on | Blocks | Can Parallelize With |
| --- | --- | --- | --- |
| 1. Start-flow guards and characterization tests | none | 2, 3, 4, 5, 6, 7, 8 | none |
| 2. Extract payment preparation hook | 1 | 5, 8 | 3, 4 |
| 3. Extract landing/invitation/growth tracking hook | 1 | 8 | 2, 4 |
| 4. Extract input/tarot transition hook | 1 | 5, 8 | 2, 3 |
| 5. Extract reading generation orchestration | 1, 2, 4 | 8 | 6, 7 |
| 6. Split resume restore logic | 1 | 8 | 5, 7 |
| 7. Extract result helpers/actions | 1 | 8 | 5, 6 |
| 8. Slim page/result stage and update guards | 2, 3, 4, 5, 6, 7 | Final Verification | none |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: References + Acceptance Criteria + QA Scenarios.

- [ ] 1. Add Start-Flow Size Guards And Characterization Anchors

  **What to do**: Extend `scripts/verify-stability-guards.cjs` and `scripts/test-refactor-regression.sh` before extraction. Add RED guards that fail on current oversized files, then later make them pass through subsequent tasks. Add source anchors proving `page.tsx` still imports start hooks/stages and does not directly own extracted responsibilities after refactor.
  **Must NOT do**: Do not change source behavior in this task beyond guard/test additions.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: Tasks 2-8 | Blocked By: none

  **References**:
  - Pattern: `scripts/verify-stability-guards.cjs:22` - existing `pureLoc` / `assertPureLocAtMost` guard style.
  - Pattern: `scripts/test-refactor-regression.sh:25` - shell source-pattern regression style.
  - Current smell: `src/app/start/page.tsx:1` - 1213 pure LOC.
  - Current smell: `src/app/start/use-start-resume.ts:1` - 427 pure LOC.
  - Current smell: `src/app/start/start-result-stage.tsx:1` - 709 pure LOC.

  **Acceptance Criteria**:
  - [ ] RED evidence exists showing at least one new LOC guard fails before extraction.
  - [ ] GREEN evidence exists after later tasks with `page.tsx`, `use-start-resume.ts`, `start-result-stage.tsx`, and all new start-flow files <=250 pure LOC.
  - [ ] `npm test` passes.

  **QA Scenarios**:
  ```
  Scenario: RED guard catches oversized start page
    Tool: bash
    Steps: run `npm run verify:stability` immediately after adding the new <=250 guard for src/app/start/page.tsx.
    Expected: command fails with a message naming src/app/start/page.tsx and its current pure LOC count.
    Evidence: .omo/evidence/start-flow-refactor-task-1-red.txt

  Scenario: Existing source anchors still pass
    Tool: bash
    Steps: run `npm test`.
    Expected: "Refactor regression checks passed".
    Evidence: .omo/evidence/start-flow-refactor-task-1-green.txt
  ```

  **Commit**: YES | Message: `test(start): guard start flow refactor boundaries` | Files: `scripts/verify-stability-guards.cjs`, `scripts/test-refactor-regression.sh`

- [ ] 2. Extract Payment Preparation From Start Page

  **What to do**: Move `ensureReadingReadyForPayment` from `src/app/start/page.tsx:166` into `src/app/start/use-start-payment-prep.ts`. The hook must accept the exact dependencies it needs: `reportData`, `readingData`, `metadata`, `selectedCards`, `language`, `inviteCode`, `autoReferralCode`, `router.replace`, `setShareUrl`, and `syncResultUrl`. Keep `syncStartResultUrl`, `waitForPendingReadingId`, `getStoredReadingAccessKey`, `syncReadingAccessKey`, `saveToSessionAndBackup`, and `buildReadingShareUrl` calls inside the hook.
  **Must NOT do**: Do not change `/api/reading/save` payload shape, session/localStorage keys, or payment modal props.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: Tasks 5, 8 | Blocked By: Task 1

  **References**:
  - Source: `src/app/start/page.tsx:166` - current `ensureReadingReadyForPayment` behavior to preserve.
  - Storage API: `src/app/start/start-page-storage.ts:147` - `syncResultUrl` pattern.
  - Payment consumer: `src/app/start/page.tsx:460` - `handleUpgrade` calls payment prep before `openPaymentModal`.
  - E2E: `tests/e2e/next-move-report-paywall-checkout.spec.ts:96` - paid checkout must keep saved reading context.

  **Acceptance Criteria**:
  - [ ] `page.tsx` imports `useStartPaymentPrep` and no longer contains `async () => { ... /api/reading/save ... }` payment-prep body.
  - [ ] `use-start-payment-prep.ts` is <=250 pure LOC.
  - [ ] Paid checkout E2E still proves saved reading context.

  **QA Scenarios**:
  ```
  Scenario: Paid checkout still saves reading before payment
    Tool: playwright
    Steps: run `npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium --grep "paywall starts paid checkout with saved reading context"`.
    Expected: test passes and sees saved reading id/access key before checkout.
    Evidence: .omo/evidence/start-flow-refactor-task-2-paid-checkout.txt

  Scenario: Missing report/data still keeps result URL safe
    Tool: bash
    Steps: run `npm test` and confirm a source guard that page delegates payment prep to `useStartPaymentPrep`.
    Expected: source guard passes; no direct payment-prep fetch remains in `page.tsx`.
    Evidence: .omo/evidence/start-flow-refactor-task-2-source.txt
  ```

  **Commit**: YES | Message: `refactor(start): extract payment preparation hook` | Files: `src/app/start/page.tsx`, `src/app/start/use-start-payment-prep.ts`, tests/guards

- [ ] 3. Extract Landing, Invitation, And Result Tracking Effects

  **What to do**: Create `src/app/start/use-start-growth-tracking.ts`. Move these effects and refs from `page.tsx`: `hasTrackedLandingView`, `hasTrackedFreeResult`, `hasTrackedReportComplete`, landing view effect at `page.tsx:255`, first result view effect at `page.tsx:294`, and report complete effect at `page.tsx:315`. Keep invite verification separate unless needed by dependencies; if moved, name that hook `useStartInvitation`.
  **Must NOT do**: Do not rename event names, sources, metadata keys, or referral fields.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: Task 8 | Blocked By: Task 1

  **References**:
  - Tracking API: `src/lib/client-growth-events.ts` - use existing client tracker.
  - Source: `src/app/start/page.tsx:255` - `landing_view` payload.
  - Source: `src/app/start/page.tsx:294` - `first_result_view` payload.
  - Source: `src/app/start/page.tsx:315` - `report_complete` payload.
  - E2E/source guard: `tests/e2e/next-move-report.spec.ts:36` - source/prefill test anchors Next Move route state.

  **Acceptance Criteria**:
  - [ ] `use-start-growth-tracking.ts` is <=250 pure LOC.
  - [ ] `page.tsx` no longer directly calls `trackClientGrowthEvent` for landing/free/report-complete effects.
  - [ ] Existing event names and payload keys remain visible in the hook and guarded by `verify:stability`.

  **QA Scenarios**:
  ```
  Scenario: Next Move source remains stable on /start
    Tool: playwright
    Steps: run `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "start keeps Next Move source and prefilled question"`.
    Expected: URL retains `entry=next_move_report_mvp_v1`, textarea is prefilled, source anchors remain in result stage.
    Evidence: .omo/evidence/start-flow-refactor-task-3-source-browser.txt

  Scenario: Tracking event names unchanged
    Tool: bash
    Steps: run `npm run verify:stability`.
    Expected: guard finds `landing_view`, `first_result_view`, `report_complete`, and `next_move_report_mvp_v1` in the new hook/source surface.
    Evidence: .omo/evidence/start-flow-refactor-task-3-stability.txt
  ```

  **Commit**: YES | Message: `refactor(start): extract growth tracking hook` | Files: `src/app/start/page.tsx`, `src/app/start/use-start-growth-tracking.ts`, guards/tests

- [ ] 4. Extract Input And Tarot Transition Handlers

  **What to do**: Create `src/app/start/use-start-step-transitions.ts`. Move `debugStartFlow`, `transitionToStep`, `handleInputSubmit`, `handleTarotComplete`, and `handleRevealComplete` from `page.tsx:138`, `page.tsx:147`, `page.tsx:369`, `page.tsx:424`, and `page.tsx:452`. The hook must receive state setters and context values explicitly, and return the three handlers plus `transitionToStep`.
  **Must NOT do**: Do not change storage keys, scroll behavior, tracking event names, or tarot skip behavior.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: Tasks 5, 8 | Blocked By: Task 1

  **References**:
  - Source: `src/app/start/page.tsx:369` - `handleInputSubmit`.
  - Source: `src/app/start/page.tsx:424` - `handleTarotComplete`.
  - Tarot UI: `src/app/start/start-tarot-stage.tsx:51` - skip tarot button text used by E2E.
  - E2E: `tests/e2e/next-move-report.spec.ts:60` - paywall test drives input -> tarot skip -> result.

  **Acceptance Criteria**:
  - [ ] `use-start-step-transitions.ts` is <=250 pure LOC.
  - [ ] `page.tsx` delegates input/tarot/reveal transitions to the hook.
  - [ ] Free verdict flow still reaches result after tarot skip.

  **QA Scenarios**:
  ```
  Scenario: Free verdict still starts after tarot skip
    Tool: playwright
    Steps: run `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "paywall shows USD 9 Next Move offer"`.
    Expected: test reaches "연락 판정" after "무료 판정 먼저 보기" and "타로 없이 무료 판정 보기".
    Evidence: .omo/evidence/start-flow-refactor-task-4-free-verdict.txt

  Scenario: Empty Next Move question remains safe
    Tool: playwright
    Steps: run `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "start handles empty Next Move question safely"`.
    Expected: page shows textarea and relationship timing copy with no app error.
    Evidence: .omo/evidence/start-flow-refactor-task-4-empty-question.txt
  ```

  **Commit**: YES | Message: `refactor(start): extract step transition handlers` | Files: `src/app/start/page.tsx`, `src/app/start/use-start-step-transitions.ts`, tests/guards

- [ ] 5. Extract Reading Generation Orchestration

  **What to do**: Split the current `startReading` body from `page.tsx:510` into `src/app/start/use-start-reading-generation.ts` and pure helpers in `src/app/start/start-reading-generation.ts`. The hook owns mutable React state coordination; the pure module owns phase constants, retry classification, next-phase detection, and save-payload construction. Keep `startReadingRef.current = startReading` in `page.tsx` or the hook return, but do not create circular imports.
  **Must NOT do**: Do not change `/api/reading` payloads, retry limits, loading labels, fallback messages, quota behavior, premium phase save payload, or final `/api/reading/save` payload.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: Task 8 | Blocked By: Tasks 1, 2, 4

  **References**:
  - Source: `src/app/start/page.tsx:510` - `startReading` signature and behavior.
  - Source: `src/app/start/page.tsx:552` - `/api/reading` request payload.
  - Source: `src/app/start/page.tsx:590` - payment verification retry.
  - Source: `src/app/start/page.tsx:698` - quota exceeded branch.
  - Source: `src/app/start/page.tsx:823` - premium intermediate save.
  - Source: `src/app/start/page.tsx:900` - final save payload.

  **Acceptance Criteria**:
  - [ ] `page.tsx` no longer contains the reading-generation phase loop.
  - [ ] New hook/helper files are each <=250 pure LOC.
  - [ ] Existing free verdict, paywall, price mismatch, and paid checkout E2E tests pass.

  **QA Scenarios**:
  ```
  Scenario: Free reading generation still reaches result and paywall
    Tool: playwright
    Steps: run `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "paywall shows USD 9 Next Move offer"`.
    Expected: free result appears and payment modal shows Next Move Full Report at $9.
    Evidence: .omo/evidence/start-flow-refactor-task-5-free-generation.txt

  Scenario: Stripe mismatch still blocks paid checkout after generation refactor
    Tool: playwright
    Steps: run `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "paywall pauses checkout when Stripe price contract mismatches"`.
    Expected: price mismatch copy appears and checkout button is disabled.
    Evidence: .omo/evidence/start-flow-refactor-task-5-price-mismatch.txt
  ```

  **Commit**: YES | Message: `refactor(start): extract reading generation hook` | Files: `src/app/start/page.tsx`, `src/app/start/use-start-reading-generation.ts`, `src/app/start/start-reading-generation.ts`, tests/guards

- [ ] 6. Split Resume Restore Logic

  **What to do**: Split `src/app/start/use-start-resume.ts` into `use-start-resume.ts` as the thin hook plus `start-resume-snapshot.ts` and `start-resume-premium.ts`. Move storage snapshot selection/parsing into `start-resume-snapshot.ts`. Move paid/premium verification and resume continuation into `start-resume-premium.ts`. Keep public hook signature stable unless Task 5 explicitly updates `StartReadingFn`.
  **Must NOT do**: Do not change URL params, session/localStorage keys, failsafe timeout, `payment_completed`, `is_premium_user`, or access-key stripping behavior.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: Task 8 | Blocked By: Task 1

  **References**:
  - Source: `src/app/start/use-start-resume.ts:67` - failsafe and initial resume effect.
  - Source: `src/app/start/use-start-resume.ts:114` - session/backup payload selection.
  - Source: `src/app/start/use-start-resume.ts:260` - restore state application.
  - Source: `src/app/start/use-start-resume.ts:362` - paid resume continuation.
  - Persistence helpers: `src/app/start/start-page-persistence.ts:1`.
  - Storage helpers: `src/app/start/start-page-storage.ts:1`.

  **Acceptance Criteria**:
  - [ ] `use-start-resume.ts`, `start-resume-snapshot.ts`, and `start-resume-premium.ts` are each <=250 pure LOC.
  - [ ] The hook still exposes the same `useStartResume(options)` call site.
  - [ ] Paid resume E2E still passes.

  **QA Scenarios**:
  ```
  Scenario: Paid resume after free promo still restores premium session flags
    Tool: playwright
    Steps: run `npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium --grep "paywall redeems free promo with email and no Stripe checkout request"`.
    Expected: URL contains `paid=true&reading_id=qa-next-move-reading`, session storage has payment flags, and no Stripe checkout request is created.
    Evidence: .omo/evidence/start-flow-refactor-task-6-paid-resume.txt

  Scenario: Reset query still returns clean input state
    Tool: playwright
    Steps: open `/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=reset-check` and assert textarea value is `reset-check`.
    Expected: input stage is visible, no old result/resume state is shown.
    Evidence: .omo/evidence/start-flow-refactor-task-6-reset-browser.txt
  ```

  **Commit**: YES | Message: `refactor(start): split resume restore logic` | Files: `src/app/start/use-start-resume.ts`, `src/app/start/start-resume-snapshot.ts`, `src/app/start/start-resume-premium.ts`, tests/guards

- [ ] 7. Extract Unified Result And Result Action Handlers

  **What to do**: Create `src/app/start/start-unified-result.ts` for `mapTagToEnum` and `getUnifiedResult` logic currently at `page.tsx:998` and `page.tsx:1022`. Create `src/app/start/use-start-result-actions.ts` for `returnToInputWithDraft`, `handleOwnerInvite`, `handleInvitationUpsell`, `handleShareCardOpen`, `handleRetryPremiumResult`, `handleRetryFreeResult`, and `handleRematchGuide` currently at `page.tsx:1094` through `page.tsx:1239`.
  **Must NOT do**: Do not change invite API payloads, clipboard behavior, share event names, retry behavior, guide rematch behavior, or premium gating.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: Task 8 | Blocked By: Task 1

  **References**:
  - Source: `src/app/start/page.tsx:998` - tag mapping.
  - Source: `src/app/start/page.tsx:1022` - unified result construction.
  - Source: `src/app/start/page.tsx:1111` - owner invite action.
  - Source: `src/app/start/page.tsx:1188` - share card tracking.
  - Source: `src/app/start/page.tsx:1221` - rematch guide action.
  - Result consumer: `src/app/start/page.tsx:1304` - props passed to `StartResultStage`.

  **Acceptance Criteria**:
  - [ ] `start-unified-result.ts` and `use-start-result-actions.ts` are each <=250 pure LOC.
  - [ ] `page.tsx` imports these helpers/hooks and no longer declares tag mapping/result action functions inline.
  - [ ] Share/retry/rematch callbacks keep the same prop names passed to `StartResultStage`.

  **QA Scenarios**:
  ```
  Scenario: Result stage still receives unlock/share/retry callbacks
    Tool: bash
    Steps: run `npm test`.
    Expected: source guards confirm `page.tsx` still imports `StartResultStage` and passes expected callback props.
    Evidence: .omo/evidence/start-flow-refactor-task-7-source.txt

  Scenario: Paywall unlock button still opens modal from result
    Tool: playwright
    Steps: run `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "paywall shows USD 9 Next Move offer"`.
    Expected: clicking result unlock opens the payment modal with Next Move offer copy.
    Evidence: .omo/evidence/start-flow-refactor-task-7-unlock-browser.txt
  ```

  **Commit**: YES | Message: `refactor(start): extract result helpers and actions` | Files: `src/app/start/page.tsx`, `src/app/start/start-unified-result.ts`, `src/app/start/use-start-result-actions.ts`, tests/guards

- [ ] 8. Slim Start Page And Result Stage To Final Boundaries

  **What to do**: After Tasks 2-7, make `page.tsx` a thin coordinator under 250 pure LOC. If `start-result-stage.tsx` remains above 250 pure LOC, split only presentational subpanels into `start-result-actions-panel.tsx` and `start-result-followup-panel.tsx`; keep `StartResultStage` prop contract stable. Update stability guards to enforce every edited/new start-flow source file <=250 pure LOC.
  **Must NOT do**: Do not redesign result UI, rename props, or alter premium/free branching.

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: Final Verification | Blocked By: Tasks 2-7

  **References**:
  - Composition target: `src/app/start/page.tsx:1242` - render tree should stay here.
  - Result stage target: `src/app/start/start-result-stage.tsx:1` - split if still oversized.
  - Guard pattern: `scripts/verify-stability-guards.cjs:40` - LOC guard block.
  - Regression script: `scripts/test-refactor-regression.sh:25` - start import guards.

  **Acceptance Criteria**:
  - [ ] `page.tsx` pure LOC <=250.
  - [ ] `use-start-resume.ts` pure LOC <=250.
  - [ ] `start-result-stage.tsx` pure LOC <=250 or split into named subpanels with all edited/new files <=250.
  - [ ] `npm run verify:stability`, `npm test`, targeted eslint, and build all pass.

  **QA Scenarios**:
  ```
  Scenario: Full happy path still reaches paywall
    Tool: playwright
    Steps: run `npx playwright test tests/e2e/next-move-report.spec.ts --project=chromium --grep "paywall shows USD 9 Next Move offer"`.
    Expected: free verdict appears and paywall shows Next Move Full Report at $9.
    Evidence: .omo/evidence/start-flow-refactor-task-8-full-happy.txt

  Scenario: Adjacent checkout regression still passes
    Tool: playwright
    Steps: run `npx playwright test tests/e2e/next-move-report-paywall-checkout.spec.ts --project=chromium`.
    Expected: paid checkout and free promo checkout tests both pass.
    Evidence: .omo/evidence/start-flow-refactor-task-8-checkout-regression.txt
  ```

  **Commit**: YES | Message: `refactor(start): slim start flow coordinator` | Files: start-flow source files, guards/tests

## Final Verification Wave (MANDATORY - after ALL implementation tasks)
> ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
- [ ] F1. Plan Compliance Audit
  - Verify every task was completed or explicitly marked superseded with evidence.
  - Command: `git diff --stat HEAD~8..HEAD` or equivalent commit range after execution.
  - Evidence: `.omo/evidence/start-flow-refactor-final-plan-compliance.txt`
- [ ] F2. Code Quality Review
  - Run `npm run verify:stability`, `npm test`, targeted eslint, `npm run build`, and `git diff --check`.
  - Evidence: `.omo/evidence/start-flow-refactor-final-quality.txt`
- [ ] F3. Real Manual QA
  - Run Chromium browser scenarios for prefill, free verdict/paywall, mismatch pause, and paid/free checkout.
  - Capture Playwright output and cleanup receipt from `lsof -nP -iTCP:3100 -sTCP:LISTEN`.
  - Evidence: `.omo/evidence/start-flow-refactor-final-browser.txt`
- [ ] F4. Scope Fidelity Check
  - Confirm no new product feature, route, payment contract, event name, or API payload was introduced.
  - Evidence: `.omo/evidence/start-flow-refactor-final-scope.txt`
- [ ] F5. Reviewer Gate
  - Spawn `codex-ultrawork-reviewer` with the final diff, plan path, and evidence index.
  - Required result: unconditional `APPROVE` and `CLEAR`.
  - Evidence: `.omo/evidence/start-flow-refactor-final-review.txt`

## Commit Strategy
- Commit after each task if all task-specific tests/QA pass.
- Conventional commits only.
- Suggested sequence:
  1. `test(start): guard start flow refactor boundaries`
  2. `refactor(start): extract payment preparation hook`
  3. `refactor(start): extract growth tracking hook`
  4. `refactor(start): extract step transition handlers`
  5. `refactor(start): extract reading generation hook`
  6. `refactor(start): split resume restore logic`
  7. `refactor(start): extract result helpers and actions`
  8. `refactor(start): slim start flow coordinator`
- Final commit footer for any squashed release commit: `Plan: .omo/plans/start-flow-refactor-wave.md`

## Success Criteria
- `src/app/start/page.tsx` <=250 pure LOC.
- `src/app/start/use-start-resume.ts` <=250 pure LOC.
- `src/app/start/start-result-stage.tsx` <=250 pure LOC or split into named subcomponents with all edited/new files <=250.
- Next Move source/prefill path still works.
- Free verdict + tarot skip still works.
- Paywall opens with $9 Next Move offer.
- Stripe price mismatch still pauses checkout.
- Paid checkout preserves saved reading context.
- Free promo redemption still avoids Stripe checkout.
- `npm run verify:stability`, `npm test`, `npm run build`, targeted eslint, `git diff --check`, and browser QA all pass.
