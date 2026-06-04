# PaymentModal Checkout Refactor Notepad

## Loop

- Session id: `payment-modal-checkout-refactor-20260603`
- Goal: extract checkout/session creation logic from `PaymentModal.tsx` in behavior-preserving slices.
- Existing completed slice: `use-reading-price.ts` extracted live price lookup and price mismatch state.

## Working Rules

- Keep existing dirty MVP work intact.
- Use characterization tests before behavioral refactor.
- Use a structural RED/GREEN guard for the new checkout boundary.
- Use browser or HTTP-visible artifacts before recording criterion pass evidence.
- Close spawned agents after integrating their results.

## Running Findings

- `PaymentModal.tsx` currently owns session persistence, `/api/reading/save`, `/api/promo/redeem`, `/api/payment`, checkout analytics, redirects, and UI rendering.
- First target boundary: typed checkout orchestration hook/module, leaving UI state and copy in the modal.
