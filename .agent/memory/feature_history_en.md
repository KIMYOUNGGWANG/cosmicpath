# 📜 Feature History (English)

All features, fixes, and optimizations implemented by Orchestrator 3.0.

---

<!-- New entries will be appended above this line -->

## 2026-02-13 - Authentic Shin-sal Engine (Backend + Frontend Integration)
- Added `ShinSalType` enum and standardized `calculateShinSal` outputs to enum values.
- Consolidated duplicate Shin-sal engine blocks into one canonical implementation.
- Added `test-shinsal.ts` executable assertions covering all 12 authentic Shin-sal formulas.
- Integrated dashboard components with engine types (`GhostCard`, `GhostDetectorSection`) and removed unsafe casts.
- Updated detector grid to responsive 2/3/4 columns with stable equal-height rows via `auto-rows-fr`.

## 2026-02-13 - Verification Attempt (Step 3)
- Re-validated Shin-sal logic by executing `test-shinsal.ts` (all assertions passed).
- Attempted full production build for regression review; blocked by offline Google Fonts fetch errors (`next/font`).
- Manual UI checks with known test accounts remain pending due non-interactive environment constraints.

## 2026-02-13 - GhostCard Runtime Hotfix
- Fixed crash in `GhostCard` where `config` could be undefined for engine-emitted Shin-sal types.
- Added missing UI mappings for `JEONGROK`, `WOLSAY`, `CHEONSAL`, `JISAL`, `MANGSIN`, and `YUKHAE`.
- Added a defensive null guard before icon resolution to prevent UI hard-fail.
- Verified with `npx tsc --noEmit`.
