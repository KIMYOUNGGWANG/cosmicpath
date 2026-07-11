# Oracle-Shaped Decision Timing Evidence

Date: 2026-06-04
Canonical source: `decision_timing_rebuild_v1`

## Sample Window

- Source table: recent stored `ReadingResult` questions.
- Sample size: 200 questions.
- Window: `2026-04-16` to `2026-06-01`.
- Newest row observed: `2026-06-01T06:58:23.631Z`.
- Oldest row observed: `2026-04-16T13:46:01.707Z`.

## Question Mix

Context mix:

- `general`: 89
- `career`: 52
- `love`: 46
- `money`: 11
- `health`: 2

Question job mix:

- `broad_reading`: 55
- `choose_or_time_action`: 54
- `wants_outcome_prediction`: 40
- `wants_timing_prediction`: 40
- `needs_next_action`: 11

Decision-like questions: `145/200`, grouping choice/action timing, outcome prediction, and timing prediction.

## Interpretation

Users enter through prediction-shaped language: "will it happen", "when", "is this right", "should I wait", and "what do they feel". The durable product should keep the oracle-shaped entry point, but the output must convert that input into a decision timing brief.

The product contract is:

- Input truth: users may ask prediction-style questions.
- Output truth: CosmicPath returns a verdict, timing boundary, first action, and risk.
- Core promise: `지금 움직일까, 기다릴까?`
- Action verdicts: `move_now`, `wait_with_deadline`, `narrow_first`, `hold_or_stop`.
- Optional module: `copy_ready_message` when a message or first line is contextually useful.

## Product Boundary

Relationship/contact timing remains a campaign wedge, not the product definition. It is one strong acquisition angle inside the broader delayed-choice product family.

This evidence does not prove product-market fit or paid conversion. It only supports the repositioning hypothesis: people ask oracle questions, but many are really trying to finish a delayed decision today.

## Privacy Note

This artifact stores only aggregate counts and short anonymized pattern descriptions. It does not include raw private questions, emails, phone numbers, birth dates, or identifying details.
