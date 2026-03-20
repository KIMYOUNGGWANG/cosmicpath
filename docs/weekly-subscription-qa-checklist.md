# Weekly Subscription QA Checklist

> Scope: `WEEKLY` subscription flow for CosmicPath
> Updated: 2026-03-20

## 1. Test Mode Browser QA

- [ ] Open the app in local dev at `http://localhost:3001`
- [ ] Open the paywall from landing and confirm `Monthly` is recommended by default
- [ ] Open the paywall from `/daily` and confirm `Annual` is recommended by default
- [ ] Open the paywall from Oracle Chat and confirm `Monthly` is recommended by default
- [ ] Open the paywall from `/my` and confirm `Annual` is recommended by default
- [ ] Close the paywall once, reopen it, and confirm the `24h return offer` banner appears
- [ ] Confirm the return-offer state prioritizes `Weekly`
- [ ] Select `Weekly` and click checkout
- [ ] Confirm Stripe opens a `test` checkout page
- [ ] Confirm the amount shows `$3.99 / week`
- [ ] Complete checkout with a Stripe test card
- [ ] Confirm redirect reaches `/billing/success`
- [ ] Confirm the page shows `CosmicPath Pro Weekly`
- [ ] Confirm `/billing` shows the connected subscription state
- [ ] Confirm `/my` shows the updated plan label

## 2. Test Mode Backend Verification

- [ ] Confirm `.env.local` includes `NEXT_PUBLIC_STRIPE_PRICE_PRO_WEEKLY_TEST`
- [ ] Confirm `POST /api/subscription/create` returns `200` for `planType: "WEEKLY"`
- [ ] Confirm Stripe webhook receives the subscription event
- [ ] Confirm the user record updates `subscription_status` to `pro`
- [ ] Confirm the user record updates `stripe_subscription_id`
- [ ] Confirm `/api/subscription/status` returns `plan: "pro_weekly"`

## 3. Live Mode Release Checks

- [ ] Confirm `.env` includes `NEXT_PUBLIC_STRIPE_PRICE_PRO_WEEKLY`
- [ ] Confirm production server uses `STRIPE_SECRET_KEY=sk_live_...`
- [ ] Open the paywall in production and select `Weekly`
- [ ] Confirm Stripe opens a `live` checkout page
- [ ] Confirm the amount shows `$3.99 / week`
- [ ] Complete a real checkout with a live payment method
- [ ] Confirm redirect reaches `/billing/success`
- [ ] Confirm `/billing` and `/my` show `Pro Weekly`
- [ ] Confirm webhook delivery succeeded in Stripe Dashboard
- [ ] Confirm subscription cancel flow still works for weekly plan

## 4. Analytics Checks

- [ ] Confirm `paywall_open` is sent when the modal opens
- [ ] Confirm `checkout_start` is sent when `Weekly` checkout starts
- [ ] Confirm both events include `source`
- [ ] Confirm both events include `context`
- [ ] Confirm both events include `plan`
- [ ] Confirm return-offer opens include `hasReturnOffer: true`
- [ ] Confirm `paid_conversion` is recorded after successful checkout

## 5. Manual UX Checks

- [ ] Confirm the paywall closes on backdrop click
- [ ] Confirm the paywall closes on `Esc`
- [ ] Confirm focus states are visible on plan cards and CTA
- [ ] Confirm the modal is usable on mobile viewport
- [ ] Confirm the CTA is disabled while checkout session is being created
- [ ] Confirm error copy is shown if checkout session creation fails
- [ ] Confirm no layout shift occurs when the return-offer banner appears

## 6. Regression Checks

- [ ] Confirm `MONTHLY` checkout still works
- [ ] Confirm `ANNUAL` checkout still works
- [ ] Confirm existing `Couple Monthly` behavior is unchanged
- [ ] Confirm `/api/subscription/status` still returns valid values for old plans
- [ ] Confirm Stripe webhook still maps `pro_monthly` and `pro_yearly` correctly

## 7. Ship Gate

- [ ] Test mode checkout verified
- [ ] Live mode checkout verified
- [ ] Webhook verified
- [ ] Billing UI verified
- [ ] Analytics verified
- [ ] Weekly cancel flow verified
- [ ] No regression on monthly/annual plans
