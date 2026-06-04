# Next Move Report MVP Operating Loop

Date: 2026-06-03
Scope: relationship/DM decision report for contact-or-wait questions.
Offer: free first verdict, then one-off digital report through the existing Stripe reading checkout.

## Weekly Operating Budget

Use five focused hours per week:

| Budget | Work |
| --- | --- |
| 2h | Content creation for relationship/DM hooks pointing to `/relationship/contact-timing` |
| 1h | Copy/report iteration based on free verdict and paywall friction |
| 1h | User evidence review from questions, follow-up seeds, and support notes |
| 1h | Metrics/readout in `/ops/growth` and manual evidence updates |

## 14-Day Decision Gate

Run the first gate at 300 targeted visits or 14 days, whichever comes first.

PASS requires:

| Metric | Threshold |
| --- | --- |
| Targeted visits | 300 targeted visits |
| Question starts | 45 question starts |
| Free verdicts | 30 free verdicts |
| Paywall opens | 8 paywall opens |
| Paid conversions | 2 paid conversions |
| Follow-up seeds | 8 follow-up seeds |

Decision rules:

| Outcome | Rule |
| --- | --- |
| PASS | 300 targeted visits or 14 days, 45 question starts, 30 free verdicts, 8 paywall opens, 2 paid conversions, and 8 follow-up seeds |
| REVISE ENTRY | 300 visits but fewer than 25 question starts |
| REVISE OFFER | 30 free verdicts but 0 paid conversions |
| HOLD EXPANSION | Fewer than 8 follow-up seeds |
| BLOCK LAUNCH | UI price copy does not match the existing Stripe checkout price |

## 12-Week Loop

| Window | Focus |
| --- | --- |
| Weeks 1-2 | Launch and measure the first wedge without adding new products |
| Weeks 3-4 | Iterate paywall and report copy from the first free verdict and checkout evidence |
| Weeks 5-8 | Consider English probe or a $19 upsell only if paid conversions exist |
| Weeks 9-12 | Scale winning content and consider email/Kakao follow-up after follow-up seeds prove intent |

## Evidence Review

Each weekly review should answer:

| Question | Source |
| --- | --- |
| Are visitors starting questions? | landing views and question starts |
| Are free verdicts useful enough? | free verdicts, support notes, and follow-up seeds |
| Is the paid offer clear? | paywall opens, checkout starts, paid conversions |
| Is relationship safety intact? | banned-claim checks, trust page checks, and high-risk prompt reviews |
| Is legacy containment intact? | sitemap/nav guards and direct legacy route checks |

## Out of scope

Do not add paid ads, Toss/KRW checkout, subscriptions, custom consulting, SaaS onboarding, human advisor marketplace, native apps, or a broad CosmicPath relaunch during this MVP. These terms are out-of-scope constraints, not operating steps.

## Launch Blocks

Do not launch or scale if:

| Block | Reason |
| --- | --- |
| UI price copy does not match the existing Stripe checkout price | Payment trust risk |
| The free verdict cannot render before paywall | MVP promise broken |
| Legal pages do not mention relationship/DM context and optional birth data | Trust boundary missing |
| Generated copy guarantees a reply, reunion, or relationship outcome | Safety boundary broken |
| Primary nav promotes Daily, Career, PRO, or subscriptions | Legacy containment broken |
