# API 명세서: CosmicPath v2.0 🌌

> **Project**: CosmicPath | **Version**: v2.0 | **Generated**: 2026-03-19
> **Base URL**: `/api` | **Auth Method**: Next-Auth Session (서버사이드)
> **Status**: **LOCKED** — 변경 시 사유 기재 필수
> **근거**: `docs/prd-v2.md` (친구 가입 완료 시 Credit +1 정책 확정)

> **Refactor Contract Lock (2026-04-16)**:
> - 이번 리팩터링 사이클의 목적은 외부 API 계약 변경이 아니라 내부 리딩 파이프라인 재구성이다.
> - `/api/reading`, `/api/reading/followup*`, `/api/payment*`, `/api/growth*`의 request/response shape는 유지한다.
> - `characterId`, `questionIntent`, `selectionMode`, `free_focus`, `summary`, `metadata`는 active wire contract로 간주한다.
> - 프롬프트 시스템 재구성은 internal-only change로 다루며, free/premium 결과의 계약 키와 access ownership 규칙은 바꾸지 않는다.
>
> **Prompt & Advisor Quality Lock (2026-04-16)**:
> - 다음 prompt 품질 사이클의 목적은 시스템 프롬프트와 상담가 레이어의 중복/충돌을 줄이고, 상담가의 전문성을 실제 판단 구조로 승격하는 것이다.
> - `phase-prompts.ts` 재구성, `oracle-personas.ts` 강화, `evidencePriority` 반영, locale별 base framing 정리는 모두 internal-only change로 다룬다.
> - 이번 사이클의 immediate wedge는 `free 첫 결과 + follow-up chat`의 generic drift를 줄이고 상담가 차이를 체감시키는 것이다. premium multi-phase 전체 재정렬과 locale 전면 재설계는 후순위로 둔다.
> - `questionIntent`는 당분간 single wire key를 유지한다. `primary/secondary intent` 같은 복합 intent 실험이 생겨도 우선 internal metadata 또는 derived state로만 다룬다.
> - follow-up continuity를 위한 advisor thesis / summary state는 기존 `metadata` 호환 범위 안에서만 추가할 수 있으며, DB migration이나 public response shape 변경은 이번 범위 밖이다.
>
> **Grand Oracle Chat Trust Hardening Lock (2026-04-17)**:
> - 이번 사이클의 immediate wedge는 `Grand Oracle Chat`의 context continuity, quota/entitlement trust boundary, `council_briefing` reliability를 고정하는 것이다.
> - `GET /api/oracle-chat/history`, `POST /api/oracle-chat/message`, `GET /api/oracle-chat/daily-hook`의 public request/response shape는 유지한다.
> - 최근 reading metadata, birth context, latest room summary 복원은 모두 서버 truth 기준으로만 강화할 수 있다. 클라이언트가 보낸 membership flag, quota state, room ownership 힌트는 신뢰하지 않는다.
> - free quota 초과는 계속 `402` + `details: 'ORACLE_CHAT_DAILY_LIMIT'` 계약을 유지하고, one-time reading paywall이 아니라 기존 membership paywall surface로 연결해야 한다.
> - Oracle Chat trust hardening은 internal-only change로 다루며, 새 Stripe SKU, 새 `planType`, 새 `subscriptionStatus`, 새 public endpoint 추가는 이번 범위 밖이다.
>
> **Planned UI/UX Delta (2026-04-25) — Verdict-First Result Page**:
> - Result Page(결과 리포트)를 'Verdict-First' 계층 구조로 개편하여 UI 렌더링 순서와 컴포넌트 레이아웃을 변경한다 (`CosmicPath_ResultPage_PRD_v1.0.md` 기준).
> - 이 작업은 순수 프론트엔드 UI/UX 개편(히어로 섹션, Progressive Disclosure, 애니메이션)이며, 기존 `/api/reading` 결과 스키마는 **변경 없이 100% 재사용**한다.
> - 행동 체크리스트(Action Checklist) 저장 기능(F-05)은 Sprint 2로 연기하며, 당분간 클라이언트 `localStorage`로 처리하므로 신규 API는 추가하지 않는다.
>
> **Planned Paywall Conversion Surgery (2026-05-04)**:
> - 이 사이클은 결제 전환율 개선을 위한 **프론트엔드 전용 수술**이며, `/api/reading`, `/api/payment` 등의 request/response shape는 변경하지 않는다.
> - `PaymentModal.tsx`의 카피와 가치 불렛 리스트, `premium-report.tsx`의 블러 영역 앞에 잠긴 섹션 제목 노출은 모두 presentation-layer 변경이다.
> - `402 QUOTA_EXCEEDED` 응답은 이미 `/api/reading` route에 구현되어 있으며 (`plan-limits.ts`), 프론트엔드에서 이를 전용 UX로 처리하는 컴포넌트만 추가한다.
> - `FREE_READING_DAILY_LIMIT` 환경변수를 `3`에서 `1`로 조정하는 것은 비즈니스 설정 변경이며, API 계약 변경이 아니다.
>
> **Revenue Recovery Experiment (2026-05-14) — $3.99 Career Timing Wedge**:
> - 첫 달 약 $300 매출 이후 반복 매출이 끊긴 상태를 해결하기 위해, 신규 기능이 아니라 offer/landing/channel 실험을 우선한다.
> - 원타임 리딩 가격은 $3.99 실험 가격으로 다루며, API request/response shape는 변경하지 않는다. Stripe price/product 설정 또는 fallback label만 비즈니스 설정으로 조정한다.
> - 1차 wedge는 `/career/uncertainty -> /start?context=career&question=...&entry=career_timing_wedge_399 -> free result -> paywall -> checkout` 흐름이다.
> - Growth attribution source는 `career_timing_wedge_399`로 고정한다.
> - 기존 `/api/growth/track` canonical events로 `landing_view`, prompt CTA click, `first_result_view`, `paywall_open`, `checkout_success`를 읽고, 신규 분석 API는 추가하지 않는다.
> - 이 실험은 관계/재물/글로벌 메시지를 잠시 후순위로 두며, "버틸지 옮길지" 커리어 결정 타이밍 메시지를 우선 검증한다.
>
> **Product Rebuild Contract (2026-05-15) — Decision Timing App v1**:
> - CosmicPath의 전면 경험은 "사주·타로·점성술 메뉴"가 아니라 `Decision Timing Reading`으로 재구성한다.
> - 1차 리빌드는 presentation-layer + prompt/runtime framing 변경으로 제한하며, `/api/reading`, `/api/payment`, `/api/growth/track` public response shape는 유지한다.
> - 소비자-facing 핵심 promise는 "지금 움직일지 기다릴지, 무엇부터 해야 할지"다.
> - Attribution source는 `decision_timing_rebuild_v1`로 고정한다.
> - 사주·타로·점성술은 상품 전면 문구가 아니라 `why this verdict` 근거 레이어로 노출한다.
> - 무료 결과 첫 fold는 `decision verdict`, `evidence summary`, `next action` 3요소를 기존 `free_focus`, `summary`, `metadata`에서 파생해 렌더링한다.
> - 신규 DB migration, 새 Stripe SKU, 새 public reading schema는 이번 리빌드 범위 밖이다.

---

## Primary Product Flow — Decision Timing App v1

**Actors**

- Anonymous visitor: 로그인 없이 질문을 시작하고 무료 decision brief를 본다.
- Paid reader: $3.99 결제 후 근거·타이밍·행동 순서를 연다.
- Returning reader: `/daily` 또는 최근 리딩 연결을 통해 다음날 다시 들어온다.
- Admin/operator: `/ops/growth`에서 source별 funnel을 확인한다.

**Primary flow**

```text
/ landing
  -> /start?entry=decision_timing_rebuild_v1
  -> /api/reading free
  -> free decision brief
  -> /api/payment checkout
  -> /api/reading premium resume
  -> next-day /daily check-in
```

**Decision entry query contract**

```typescript
interface DecisionTimingEntryQuery {
  entry?: "decision_timing_rebuild_v1" | "career_timing_wedge_399" | string;
  context?: "career" | "love" | "money" | "health" | "general";
  question?: string;
  reset?: "true";
}
```

**Decision brief display contract**

This is a UI projection over the existing `/api/reading` response. It must not require a new response schema in v1.

```typescript
interface DecisionBriefViewModel {
  verdict: string;
  evidenceSummary: string;
  nextAction: string;
  evidenceSources: Array<"saju" | "tarot" | "astrology">;
  unlockCopy: "근거·타이밍·행동 순서 잠금해제";
}
```

**Growth event contract**

```typescript
type DecisionTimingGrowthEvent =
  | "landing_view"
  | "decision_question_submit"
  | "first_result_view"
  | "paywall_open"
  | "checkout_success"
  | "next_day_return";

interface DecisionTimingGrowthMetadata {
  source: "decision_timing_rebuild_v1";
  context?: string;
  entry?: string;
  hasPrefilledQuestion?: boolean;
  verdictVisible?: boolean;
  unlockSurface?: "payment_modal" | "blurred_preview" | "result_cta";
}
```

**Auth, Error, Empty-State Behavior**

- `/`, `/start`, `/api/reading`, `/api/payment*`, `/api/growth/track` remain public where they are already public.
- If `question` query is empty, `/start` shows the default decision prompt, not an empty canvas.
- If birth data is missing, the intake explains it as "근거 정밀화" rather than a separate astrology form.
- If `/api/reading` fails, show a centered retry state with the original question preserved.
- If quota is exceeded, keep existing `402 QUOTA_EXCEEDED` handling and route the user to unlock, not a generic error.
- If payment verification is delayed, keep the existing premium resume path and show a syncing state.

**Non-Goals**

- No new divination engines.
- No human advisor marketplace.
- No new subscription plan.
- No native push/SMS automation in v1.
- No major public API shape change.

---

## Campaign Contract — Relationship Contact Timing v1

**Purpose**

This is a campaign layer on top of the existing Decision Timing Reading product. It does not replace the core identity: CosmicPath remains an integrated saju + astrology + tarot analysis service.

**Attribution source**

```typescript
type RelationshipContactTimingSource = "relationship_contact_timing_v1";
```

**Actors**

- Anonymous visitor: enters from Threads/organic and asks whether to contact now or wait.
- Free reader: sees a first decision brief without logging in.
- Paid reader: unlocks why this verdict, contact timing, and risky message patterns.
- Returning reader: optionally records whether they contacted, waited, or still feel unsure.
- Admin/operator: reads the source-specific funnel in `/ops/growth`.

**Primary flow**

```text
/relationship/contact-timing
  -> prompt card click
  -> /start?reset=true&context=love&entry=relationship_contact_timing_v1&question=...
  -> /api/reading free
  -> free decision brief
  -> /api/payment checkout
  -> /api/reading premium resume
  -> follow-up opt-in / outcome seed
```

**Route query contract**

```typescript
interface RelationshipContactTimingEntryQuery {
  reset?: "true";
  context: "love";
  entry: "relationship_contact_timing_v1";
  question?: string;
}
```

Recommended prompt card questions:

```typescript
const relationshipContactTimingPrompts = [
  "지금 먼저 연락하는 게 맞을까, 조금 더 기다리는 게 맞을까?",
  "상대가 다시 반응할 가능성이 있다면 내가 먼저 움직여야 할 타이밍일까?",
  "이 관계에서 지금 보내면 안 되는 메시지와 해도 되는 행동은 뭐야?"
] as const;
```

**Decision brief projection**

This campaign reuses the existing `/api/reading` response. No public schema change is required in v1.

```typescript
interface RelationshipContactDecisionBrief {
  verdict: "contact_now" | "wait" | "narrow" | "do_not_proceed_yet" | string;
  verdictLabel: "연락" | "대기" | "축소" | "보류" | string;
  evidenceSummary: string;
  nextAction: string;
  unlockCopy: "왜 이 판정인지 · 연락 타이밍 · 피해야 할 메시지";
}
```

Mapping guidance:

- `free_focus.action_conclusion` supplies the verdict copy.
- `free_focus.evidence_summary` supplies the evidence summary.
- `free_focus.next_question` or first premium `action_plan` item supplies the next action.
- If the model does not produce a contact-specific label, the UI may use the generic decision labels already defined in Decision Timing v1.

**Growth event contract**

No new growth endpoint is required. Use existing `/api/growth/track`.

```typescript
type RelationshipContactGrowthEvent =
  | "landing_view"
  | "relationship_contact_prompt_clicked"
  | "decision_question_submit"
  | "first_result_view"
  | "paywall_open"
  | "checkout_start"
  | "checkout_success"
  | "relationship_contact_followup_seeded"
  | "relationship_outcome_recorded";

interface RelationshipContactGrowthMetadata {
  source: "relationship_contact_timing_v1";
  context: "love";
  promptId?: "primary" | "contact_or_wait" | "response_timing" | "message_risk";
  hasPrefilledQuestion?: boolean;
  utmSource?: string;
  utmCampaign?: string;
  utmContent?: string;
  readingId?: string;
  intendedAction?: "contact_now" | "wait" | "unsure";
  outcome?: "positive_response" | "no_response" | "worse" | "relief" | "still_unsure";
}
```

Legacy dashboard compatibility: existing `relationship_followup_opt_in` and `english_contact_followup_opt_in` events must continue to count as follow-up seed events in `/ops/growth`, but newly emitted relationship contact events use `relationship_contact_followup_seeded` and `en_relationship_contact_followup_seeded`.

**Outcome seed contract**

V1 should not introduce a statistical model or accuracy claim. If implemented, the first outcome seed may use existing growth tracking and local/session storage.

```typescript
interface RelationshipOutcomeSeed {
  source: "relationship_contact_timing_v1";
  readingId?: string;
  question: string;
  intendedAction?: "contact_now" | "wait" | "unsure";
  followUpDueAt: string; // ISO date, usually now + 7 days
  storage: "localStorage_v1" | "growth_event_only";
}
```

Future DB-backed outcome cases are deferred until opt-in evidence exists.

**Auth, Error, Empty-State Behavior**

- Landing, `/start`, free reading, and `/api/growth/track` remain public.
- If `question` is missing, `/start` should use the first relationship prompt as the actual starting question or show contact timing prompt chips.
- If the user question implies danger, harassment, stalking, self-harm, legal conflict, medical risk, or financial risk, the UI should avoid action-command language and route to a safety/seek-help style response.
- Payment verification and quota errors reuse existing Decision Timing behavior.
- Empty recent-reading state should route back to `/relationship/contact-timing`, not a broad fortune menu.

**Non-Goals**

- No statistical prediction model in v1.
- No claims of guaranteed relationship outcome accuracy.
- No new payment product.
- No new divination engine.
- No automated email/SMS reminder until follow-up opt-in is proven.
- No human advisor marketplace.

---

## Campaign Contract — English Contact Timing Probe v1

**Purpose**

This is the first overseas validation layer. It reuses the Relationship Contact Timing campaign, but narrows the English-language promise to a concrete decision: "Should I text them or wait?" It must not become a broad global relaunch.

**Attribution source**

```typescript
type EnglishContactTimingSource = "en_relationship_contact_timing_v1";
```

**Actors**

- English-speaking anonymous visitor: enters from TikTok, Threads, guide content, or shared links.
- Free reader: sees a first contact-timing decision brief without logging in.
- Paid reader: unlocks why this verdict, timing window, and message patterns to avoid.
- Returning reader: optionally records whether they contacted, waited, or stayed unsure.
- Admin/operator: compares `en_relationship_contact_timing_v1` with Korean `relationship_contact_timing_v1`.

**Primary flow**

```text
/en/contact-timing or /relationship/contact-timing?lang=en
  -> prompt card click
  -> /start?reset=true&context=love&entry=en_relationship_contact_timing_v1&question=...
  -> /api/reading free
  -> free English contact decision brief
  -> /api/payment checkout
  -> /api/reading premium resume
  -> 7-day follow-up opt-in / outcome seed
```

**Route query contract**

```typescript
interface EnglishContactTimingEntryQuery {
  reset?: "true";
  context: "love";
  entry: "en_relationship_contact_timing_v1";
  question?: string;
  language?: "en";
}
```

Recommended English prompt card questions:

```typescript
const englishContactTimingPrompts = [
  "Should I text them now, or wait a little longer?",
  "If there is still a chance, is this the right moment to move first?",
  "What message should I avoid sending right now?"
] as const;
```

**Decision brief projection**

This probe reuses the existing `/api/reading` response. No public schema change is required.

```typescript
interface EnglishContactDecisionBrief {
  verdict: "contact_now" | "wait" | "narrow" | "do_not_proceed_yet" | string;
  verdictLabel: "Contact" | "Wait" | "Narrow" | "Hold" | string;
  evidenceSummary: string;
  nextAction: string;
  unlockCopy: "Unlock why this verdict, the timing window, and messages to avoid";
}
```

**Growth event contract**

Use existing `/api/growth/track`; do not add a new growth endpoint.

```typescript
type EnglishContactGrowthEvent =
  | "landing_view"
  | "english_contact_prompt_clicked"
  | "decision_question_submit"
  | "first_result_view"
  | "paywall_open"
  | "checkout_start"
  | "checkout_success"
  | "en_relationship_contact_followup_seeded"
  | "english_contact_outcome_recorded";

interface EnglishContactGrowthMetadata {
  source: "en_relationship_contact_timing_v1";
  context: "love";
  language: "en";
  landingVariant?: "en_contact_timing_v1";
  promptId?: "text_now_or_wait" | "right_moment_to_move" | "message_to_avoid";
  hasPrefilledQuestion?: boolean;
  readingId?: string;
  intendedAction?: "contact_now" | "wait" | "unsure";
  outcome?: "positive_response" | "no_response" | "worse" | "relief" | "still_unsure";
}
```

**Auth, Error, Empty-State Behavior**

- Landing, `/start`, free reading, and `/api/growth/track` remain public.
- English users should see Google-first auth when login is required; Kakao may remain secondary.
- English paywall, refund, and disclaimer copy must explain that the reading is decision support, not guaranteed relationship prediction.
- If `question` is missing, use the first English prompt question as the actual starting question or show English prompt chips.
- Dangerous, stalking, harassment, self-harm, legal, medical, or financial-risk questions must weaken action-command language and route to safety-oriented copy.
- Payment verification, quota, and premium resume behavior reuse the existing Decision Timing behavior.

**Non-Goals**

- No full global relaunch.
- No new public API, reading response schema, Stripe SKU, or subscription plan.
- No statistical prediction model or accuracy claim.
- No broad English SEO expansion until the contact timing probe has activation data.

---

## Authentication

- **공개 엔드포인트**: Auth 불필요 (`/api/daily/fortune`, `/api/reading/*`, `/api/payment*`, `/api/growth/track`)
- **보호 엔드포인트**: `next-auth` 세션 필수. `auth()` 서버 액션으로 검증.
- **관리자 엔드포인트**: 세션 + `session.user.role === 'ADMIN'` 필요 (`/api/growth/summary`)

---

## Error Codes 공통

```typescript
interface ErrorResponse {
  error: {
    code: number;
    message: string;  // 사용자 노출용 (한국어)
    details?: string; // 개발자용
  }
}
```

| Code | Meaning |
|:-----|:--------|
| `400` | Bad Request — 유효하지 않은 입력 |
| `401` | Unauthorized — 로그인 필요 |
| `403` | Forbidden — 관리자 권한 필요 |
| `404` | Not Found — 리소스 없음 |
| `409` | Conflict — 중복 (이미 처리됨) |
| `500` | Server Error |

---

## Endpoints

> **Spec Update Note (2026-03-20)**: `Sprint 7: Growth Metrics` 구현을 위해 내부 운영용 분석 엔드포인트 2종을 추가함.
> 제품 기능 계약(`Daily Tarot`, `Referral Reward`)은 유지하고, 계측/운영 목적의 endpoint만 확장함.
>
> **Planned Contract Delta (2026-04-04)**: 오라클 캐릭터를 단순 말투 페르소나에서 분야 특화 상담가 체계로 전환한다.
> 하위 호환성을 위해 wire key는 당분간 `characterId`를 유지하되, 의미는 `전문 상담가 ID`로 확장한다.
>
> **MVP Focus Reset (2026-04-04)**:
> - 활성 소비자 제품 표면은 `/start` 오라클 리딩, `/daily`, Stripe 구독, `/ops/growth` 운영 대시보드에 집중한다.
> - `Sprint 8.5 Specialist Oracle Advisors`는 핵심 투자 영역으로 유지한다.
> - 세그먼트형 paywall 카피/추천 순서/리턴 오퍼 실험은 당분간 신규 확장을 중단한다.
> - `/api/match/*`, `/api/viral/*`, 블로그/SEO 확장 관련 신규 계약 증설은 현재 MVP 범위 밖으로 둔다.
> - 소비자-facing 메시지의 1순위 JTBD는 `지금 어떻게 움직이는 게 맞는가`에 대한 결정/타이밍 질문이며, 관계/커리어/재물/일상 흐름을 모두 다루되 브랜드는 하나의 오라클 경험으로 유지한다.
> - 신규 다단계 드립/복잡한 lifecycle automation 계약은 추가하지 않고, 현재 `POST /api/email/drip/schedule` 범위만 유지한다.
>
> **Implementation Note (2026-04-04)**:
> - `Sprint 8.5 Specialist Oracle Advisors v1`가 `/api/reading` 및 follow-up metadata 흐름에 반영되었다.
> - `questionIntent`는 질문 기준으로 추론되고, `selectionMode === 'auto'`일 때는 follow-up에서도 상담가 재추천이 가능하다.
> - `characterId` wire key는 유지하되, 실제 의미는 분야 특화 상담가 ID로 동작한다.
> - display layer는 CosmicPath 세계관 기준 `Orion / Cassio / Nova / Midas / Selene / Lyra / Draco` 가이드로 브랜딩되며, 이전 ID 값은 legacy mapping으로 흡수한다.
> - 무료 결과 experience는 점차 `행동 결론 + 근거 요약 + follow-up 확장` 구조를 기본 형태로 고도화한다.
> - `/start` 및 결과 layer는 특정 연애 use case에만 고정되지 않고, 질문 영역 선택과 intent routing을 통해 multi-domain decision support 경험으로 확장될 수 있어야 한다.
> - `/start` intake UI는 이제 birth form보다 `고민 영역 선택 + 질문 입력`을 먼저 노출해, 동일 contract를 유지한 채 intent-led first reading 흐름으로 진입한다.
> - `/api/reading`의 무료 결과는 이제 `free_focus` 블록을 항상 정규화해, 화면 첫 구간에서 `행동 결론 1개 + 근거 요약 1개 + 다음 질문 1개`를 안정적으로 노출한다.
> - `/daily` surface는 독립 위젯이 아니라 최근 `/api/reading` metadata를 읽어 `질문 영역 -> 오늘의 연결 영역 -> 다시 돌아갈 오라클 thread`를 보여주는 retention loop로 동작한다.
> - Growth activation instrumentation은 이제 `first_result_view`, `followup_start`, `daily_return_after_reading`를 별도 canonical event로 수집해, `/ops/growth`에서 trust/activation loop를 직접 읽을 수 있게 한다.
>
> **Planned Stability Delta (2026-04-04 Night)**:
> - 다음 사이클은 신규 consumer surface 확장보다 `paywall price reliability`, `review integrity`, `growth summary performance`를 우선한다.
> - `POST|GET /api/payment`, `GET /api/payment/price`, `GET|POST /api/review`, `GET|PATCH|DELETE /api/review/admin`를 명시적 계약으로 승격한다.
> - 리뷰 보상 루프는 API-level check뿐 아니라 DB-level uniqueness로 강화해 `readingId`당 1회 제출/1회 보상을 보장한다.
> - `/api/growth/summary`는 response shape를 유지하되, 저장소 인덱스와 query shape만 조정하는 non-breaking hardening으로 다룬다.
>
> **Implementation Note (2026-04-05) — Global Validation Foundation**:
> - 이번 사이클의 목표는 `광범위한 글로벌 확장`이 아니라 `Korea-first PMF + English-speaking niche validation`이다.
> - 첫 글로벌 검증 단계에서는 **새 public API를 추가하지 않는다**. 기존 `/api/reading`, `/api/reading/followup*`, `/api/payment`, `/api/payment/price`, `/api/growth/track`, `/api/growth/summary` 계약을 재사용한다.
> - 영문 실험에서 핵심 분기 값은 `language`이며, 퍼널 비교를 위해 `source`, `path`, `metadata.landingVariant` 같은 attribution 필드를 기존 growth contract 안에서 함께 보낸다.
> - 영문 약관/정책 요약, 로그인 제공자 우선순위, 공유 surface 재배치는 presentation-layer 변경으로 다루고 API response shape는 유지한다.
> - 로그인 및 auth error display layer는 `Accept-Language` 기준으로 영문 카피를 우선 보여줄 수 있으며, 영어권에서는 Google을 기본 경로로 먼저 제안한다.
> - 영어권 acquisition readiness는 `/guides`, `/guides/[slug]`, `/start` onboarding explainer 같은 presentation-layer surface로 제공되며, onward flow는 기존 `/api/reading` 및 `/api/growth/track` 계약을 그대로 사용한다.
> - 운영 화면의 방문 규모 이해를 위해 `/api/growth/summary`는 기존 totals/series 외에 `visits.today`, `visits.last7Days`, `visits.last30Days`, `visits.dauMauRate`를 함께 제공할 수 있다. 이 값들은 모두 세션 기준 방문 신호이며 로그인 사용자 수와는 다르다.
>
> **Implementation Note (2026-04-16) — Reading Refactor Boundary**:
> - `/api/reading` 내부 구현은 `request validation -> runtime assembly -> free generation -> premium orchestration -> persistence/resume` 순서의 서비스 경계로 재구성할 수 있다.
> - free generation은 `free_focus`와 compact summary contract를 유지한 채 prompt/runtime 경계만 정리한다.
> - premium generation은 multi-phase contract를 유지한 채 공통 시스템 규칙층과 phase overlay 조합 구조로 이동할 수 있다.
> - reading runtime metadata는 later premium resume와 follow-up에서 재사용 가능한 source-of-truth로 취급한다.
> - anonymous owner proof (`accessKey`)와 server-verified premium entitlement 규칙은 리팩터링 중에도 동일하게 유지해야 한다.
>
> **Planned Grand Oracle Chat Billing Delta (2026-04-12 PM)**:
> - `Grand Oracle Chat` MVP는 **새 Stripe membership SKU, 새 `planType`, 새 `subscriptionStatus` enum을 추가하지 않는다.**
> - 기존 `GET /api/subscription/status`, `POST /api/subscription/create`, `POST /api/subscription/cancel`, `/billing`, `SubscriptionModal`을 그대로 재사용한다.
> - 새로 바뀌는 것은 `billing packaging`과 `entitlement naming`이다. 즉, 서버는 기존 활성 유료 membership을 `Oracle Chat access` 의미 계층으로 해석하고, UI는 같은 결제 레일을 `Grand Oracle Chat 무제한` 가치 제안 중심으로 다시 설명한다.
> - Oracle Chat quota 초과(`402`)는 one-time reading paywall이 아니라 기존 membership paywall surface로 연결되어야 한다.
>
> **Planned SMS Daily Signal Delta (2026-04-15)**:
> - SMS는 별도 주력 상품이 아니라 **기존 유료 membership의 보조 retention perk**로 다룬다.
> - launch scope는 `구독자 + 인증된 전화번호` 대상 **하루 1회 one-way daily signal** 이다.
> - reply형 문자 상담, 일일 3회 quota, SMS 전용 SKU는 현재 계약 범위 밖으로 둔다.
>
> **Implementation Note (2026-04-17) — Grand Oracle Chat Trust Hardening**:
> - `Grand Oracle Chat`은 `최근 reading metadata -> latest room summary -> request payload userContext` 순서로 context source-of-truth를 우선 탐색할 수 있다.
> - room ownership, membership entitlement, free quota는 모두 서버가 판정해야 하며, quota 차감은 동시 요청 경쟁 조건을 고려한 atomic path로 다룬다.
> - `council_briefing` 생성 실패 시에도 public response shape는 유지하고, empty response 대신 예측 가능한 fallback answer를 반환해야 한다.
> - `/oracle-chat`, `/daily`, `/billing`, `SubscriptionModal`의 `oracle_chat` merchandising은 source-aware copy를 유지하되, 한 entry surface의 문구가 다른 entry surface를 덮어쓰지 않게 해야 가 한다.
>
> **Planned Contract Delta (2026-04-19) — Iceberg Model Foundation**:
> - 오라클 리딩의 지불 가치와 가독성을 동시 충족시키기 위해 `Verdict-First + Deep Dive Archive` 형태의 빙산 모델을 채택한다.
> - `/api/reading` 프리미엄 결과의 각 Phase별 JSON 스키마를 하드닝(인라인 텍스트 길이 강제, 근거 필수 표기)하여 데이터 볼륨을 대폭 확장하되 구조적 파손은 방지한다.
> - 백엔드 병렬 호출은 타임아웃 위험을 고려해, 기존 8-Phase 체계를 유지하면서 각 Phase의 단일 프롬프트에서 도출하는 토큰 양을 극대화하는 방식을 우선한다.
> - 결과 대기 UX 개선을 위해 `Time-Delayed Loading UX` 상태 전송은 클라이언트 사이드 mock-up이나 Server Sent Events(존재 시) 단계를 고도화하여 처리한다.

### 1. 오늘의 운세 (Daily Fortune) ✅ 구현됨

| Method | Path | Auth | Cache |
|:-------|:-----|:-----|:------|
| `GET` | `/api/daily/fortune` | ❌ | 자정까지 |

**Query**
```
birthday: string  // YYYY-MM-DD (Required)
birthtime: string // HH:mm (Optional)
```

**Response**
```typescript
interface DailyFortuneResponse {
  date: string;
  dayMaster: string;
  overallLuck: number;     // 0-100
  summary: string;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  areas: { love: number; money: number; career: number; health: number; };
  advice: string;          // 프리미엄 시 추가 인사이트 포함
  cachedUntil: string;     // ISO 8601
  isPremium: boolean;
  precisionMetadata?: {    // 진태양시 정밀 보정 데이터 (v3.0)
    tstOffset: number;     // 보정된 분 (e.g. -32)
    correctedTime: string; // 보정 후 시간 (HH:mm)
    lon: number;           // 사용된 경도
  };
  oracleCouncil?: {        // 3중 오라클 합일 데이터 (v3.0)
    convergenceScore: number; // 0-100
    ziweiSummary: string;
    natalSummary: string;
  };
}
```

---

### 2. 오늘의 타로 (Daily Tarot) ✅ 구현됨

| Method | Path | Auth | Cache |
|:-------|:-----|:-----|:------|
| `GET` | `/api/daily/tarot` | ❌ | 자정까지 |

**Query**
```
birthday: string  // YYYY-MM-DD (Required) — Seed 생성에 사용
```

**Response**
```typescript
interface DailyTarotResponse {
  date: string;
  cardIndex: number;       // 0-77 (Major 22 / Minor 56)
  cardName: string;        // e.g. "The Star"
  cardNameKo: string;      // e.g. "별"
  isReversed: boolean;
  keywordKo: string;       // e.g. "희망, 영감, 평온"
  meaning: string;         // 기본 해석 (무료)
  advice: string;          // 구독자 전용 행동 가이드
  isPremium: boolean;
}
```

---

### 3. 구독 상태 조회 (Subscription Status) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `GET` | `/api/subscription/status` | ✅ |

**Response**
```typescript
interface SubscriptionStatusResponse {
  status: 'free' | 'pro' | 'couple';
  plan: 'pro_weekly' | 'pro_monthly' | 'pro_yearly' | 'couple_monthly' | null;
  expiresAt: string | null;
  stripeCustomerId: string | null;
}
```

**Implementation Note (2026-04-04)**:
- `pro_weekly`, `couple_monthly`는 레거시/실험 값으로 남아 있을 수 있다.
- 현재 소비자 paywall UI는 `pro_monthly`, `pro_yearly`를 기본 merchandising 경로로 사용한다.
- `Grand Oracle Chat` MVP는 새로운 plan 값을 추가하지 않는다. 서버는 기존 활성 유료 membership 상태를 `Oracle Chat access` entitlement로 해석한다.

---

### 4. 구독 세션 생성 (Checkout Create) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/subscription/create` | ✅ |

**Request**
```typescript
interface SubscriptionCreateRequest {
  planType: 'WEEKLY' | 'MONTHLY' | 'ANNUAL';
}
```

**Response**: `{ checkoutUrl: string }`

**Implementation Note (2026-04-04)**:
- `MONTHLY`, `ANNUAL`은 현재 기본 CTA 경로다.
- `WEEKLY`는 레거시 실험 플랜으로 유지 가능하지만, 기본 paywall surface에서는 숨김 처리한다.
- `Grand Oracle Chat` paywall은 이 endpoint를 그대로 재사용하며, 신규 전용 `planType`을 추가하지 않는다.
- 결제 진입 surface(`SubscriptionModal`, `/billing`)는 오라클 챗 무제한 상담과 daily retention 가치를 더 앞세우는 카피로 리패키징할 수 있다.

---

### 5. 구독 해지 (Subscription Cancel) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/subscription/cancel` | ✅ |

**Response**
```typescript
interface SubscriptionCancelResponse {
  ok: boolean;
  subscriptionId: string;
  cancelAtPeriodEnd: boolean;  // 항상 true
  currentPeriodEnd: string;    // ISO 8601 — 이 날짜까지 서비스 유지
}
```

**Error**: `404` — 활성 구독 없음

---

### 6. 드립 이메일 스케줄링 (Drip Schedule) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/email/drip/schedule` | CRON_SECRET |

**Request**: `{ readingId: string; email: string; fromDate?: string }`

**Action**: D+2(할인), D+5(Cosmic Window), D+7(아카이브) 자동 예약

---

### 7. 친구 초대 가입 보상 (Referral Reward) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/referral/reward` | ✅ (신규 가입 유저) |

**비즈니스 로직 (LOCKED)**:
- 친구가 초대 링크(`?ref=<referralCode>`)를 통해 **가입 완료** 시 자동 호출.
- `Referral` 테이블에 기록 → 초대자(`inviterUserId`)의 ChatSession에 Credit +1 지급.
- 동일 `inviteeUserId`에 대한 중복 지급 방지 (`@@unique([referralCode, inviteeUserId])`).

**Request**
```typescript
interface ReferralRewardRequest {
  referralCode: string;   // 초대한 기존 유저의 코드
  inviteeUserId: string;  // 가입 완료한 신규 유저 ID
}
```

**Response**
```typescript
interface ReferralRewardResponse {
  ok: boolean;
  inviterUserId: string;
  creditsAdded: number;       // 항상 1
}
```

**Error**: `409` — 이미 이 초대 코드로 보상이 지급됨

---

### 8. 오라클 Follow-up Chat ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/reading/followup` | ❌ |
| `GET` | `/api/reading/followup` | ❌ |
| `POST` | `/api/reading/followup/stream` | ❌ |

**POST Request**
```typescript
interface ReadingFollowUpRequest {
  readingId: string;
  accessKey?: string;    // anonymous reading owner proof
  question: string;
}
```

**POST Response**
```typescript
interface ReadingFollowUpResponse {
  answer: string;
  creditsLeft: number;
  isUnlimited: boolean;
  success: true;
}
```

**GET Query**
```
readingId: string   // required
accessKey?: string  // anonymous reading owner proof
```

**GET Response**
```typescript
interface ReadingFollowUpStatusResponse {
  creditsLeft: number;
  isUnlimited: boolean;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
  }>;
}
```

**Logic**:
- reading owner 또는 server-issued `accessKey` 보유자만 follow-up chat에 접근할 수 있다.
- 구독자 → 무제한, 무료/프로모션 사용자 → `ChatSession.credits` 차감 방식으로 처리한다.
- 첫 follow-up 시작 시 `followup_start` canonical event를 기록한다.
- stream route는 같은 access/credit contract를 유지하고, 응답 전송 후 메시지 저장과 메타데이터 갱신을 이어간다.

**Shared Oracle Advisor Contract (v3.1 Active)**:
```typescript
interface OracleAdvisorProfile {
  id: string;
  name: string;                // e.g. 'Orion'
  title: string;               // e.g. '궤도의 해석자'
  specialty: 'general' | 'compatibility' | 'reunion' | 'wealth' | 'timing' | 'career' | 'business';
  description: string;         // 사용자가 고를 때 읽는 1문장 설명
  recommendedContexts: Array<'general' | 'love' | 'money' | 'career' | 'health'>;
  evidencePriority: Array<'saju' | 'ziwei' | 'natal' | 'tarot'>;
  selectionMode: 'auto' | 'manual';
}
```

**Prompting Rules (v3.1 Active)**:
- 시스템 프롬프트는 `안전/근거 규칙` + `분야별 전문 프레임워크` + `상담가 어조` 3층 구조로 조합한다.
- 상담가는 말투보다 `분석 도메인`이 우선이며, 질문 의도가 바뀌면 follow-up에서도 상담가 재추천이 가능해야 한다.
- 한자/전통 용어를 쓸 때는 반드시 `한자(독음, 쉬운 뜻)`으로 풀어서 설명한다.
- 전문 상담가 체계는 active investment 범위이며, 세그먼트형 paywall 실험보다 높은 우선순위를 가진다.

**Prompt Quality Direction (2026-04-16 Planned)**:
- premium phase system prompt는 반복적인 `Life Strategist` 페르소나 문구보다 `shared rules + advisor contract + phase overlay` 조합을 우선한다.
- 상담가별 `framework`, `styleRules`, `caution`, `evidencePriority`는 단순 설명이 아니라 실제 분석 순서와 출력 골격으로 반영되어야 한다.
- locale(`ko/en`)별 기본 framing은 유지하되, 한국어 메인 제품의 `decision timing oracle` 포지션과 영어권 onboarding frame이 충돌하지 않도록 정리한다.
- immediate execution scope는 free 첫 결과와 follow-up의 차별화 강화에 두고, locale 전면 재설계나 복합 intent 도입은 후속 사이클로 미룬다.
- 이 변화는 internal-only prompt/runtime change이며, `characterId`, `questionIntent`, `selectionMode`, `advisorProfile`, `advisorEvidenceSummary` wire contract는 그대로 유지한다.

### 9. 성장 이벤트 수집 (Growth Track) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/growth/track` | ❌ |

**Request**
```typescript
interface GrowthTrackRequest {
  event: string;              // raw event name (e.g. share_clicked, checkout_success)
  sessionId?: string;
  readingId?: string;
  referralCode?: string;
  source?: string;
  step?: string;
  language?: 'ko' | 'en';
  context?: string;
  invitationMode?: boolean;
  price?: string;
  plan?: string;
  path?: string;
  metadata?: Record<string, unknown>;
}
```

**Logic**
- 내부 `GrowthEvent` 테이블에 저장
- `canonicalEvent`를 metadata에 함께 기록
- 환경변수 설정 시 PostHog / Mixpanel로 미러 전송

**Implementation Note (2026-04-05)**
- 영어권 검증 사이클에서는 `language`, `source`, `path`를 가능한 한 항상 채우고, 실험 카피 구분은 `metadata.landingVariant`에 기록한다.
- 필요 시 `metadata.entryLocale`, `metadata.icp`, `metadata.shareSurface` 같은 추가 attribution을 넣을 수 있지만, 기존 request shape를 깨지 않도록 모두 optional metadata로 유지한다.

**Canonical KPI Events**
- `install`
- `daily_active` → retention 계산용
- `first_result_view`
- `followup_start`
- `daily_return_after_reading`
- `share`
- `invite`
- `invite_conversion`
- `paid_conversion`

---

### 10. 성장 KPI 요약 (Growth Summary) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `GET` | `/api/growth/summary` | ✅ ADMIN |

**Query**
```
days?: number // default 30, max 90
```

**Response**
```typescript
interface GrowthSummaryResponse {
  dateRange: { from: string; to: string; days: number };
  totals: {
    installs: number;
    activeUsers: number;
    shares: number;
    invites: number;
    inviteConversions: number;
    paidConversions: number;
    checkoutStarts: number;
    paywallViews: number;
    landingViews: number;
    returningUsers: number;
  };
  rates: {
    retentionRate: number;
    landingToCheckoutRate: number;
    checkoutConversionRate: number;
    viralCoefficientProxy: number;
  };
  activation: {
    firstResultViews: number;
    followupStarts: number;
    dailyReturnsAfterReading: number;
    resultToFollowupRate: number;
    resultToDailyReturnRate: number;
    resultToPaidConversionRate: number;
  };
  visits: {
    today: number;
    last7Days: number;
    last30Days: number;
    dauMauRate: number;
  };
  series: Array<{
    date: string;
    installs: number;
    activeUsers: number;
    shares: number;
    invites: number;
    inviteConversions: number;
    firstResultViews: number;
    followupStarts: number;
    dailyReturnsAfterReading: number;
    paidConversions: number;
  }>;
  topSources: Array<{ source: string; count: number }>;
}
```

**Error**
- `401` 로그인 필요
- `403` 관리자 권한 필요

**Implementation Note (2026-04-04)**
- `/api/growth/summary`는 response shape를 유지한 채 `GrowthEvent.createdAt` 중심 인덱스와 narrow column select를 사용하도록 hardening되었다.
- 대시보드 display layer는 now-default로 `firstResultViews`, `followupStarts`, `dailyReturnsAfterReading`, `paidConversions`를 코어 루프 신호로 우선 노출하고, `installs`, `activeUsers`, `shares`는 보조 운영 신호로 해석한다.

---

### 11. 원타임 리딩 결제 생성 & 검증 (Payment Checkout & Verify) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/payment` | ❌ |
| `GET` | `/api/payment` | ❌ |

**POST Request**
```typescript
interface PaymentCheckoutRequest {
  productId?: string;       // optional, 기본값은 oracle reading product
  email?: string;           // optional, Stripe metadata 저장용
  readingId?: string;       // optional, 연결된 리딩 ID
  accessKey?: string;       // anonymous reading owner proof
  referralCode?: string;    // optional
  promoCodeId?: string;     // optional
  discount?: number;        // optional, promo 검증용 기대 할인율
  language?: 'ko' | 'en';    // optional, checkout attribution
  source?: string;           // optional, campaign attribution source
}
```

**POST Response**
```typescript
interface PaymentCheckoutResponse {
  url: string;              // Stripe Checkout URL
}
```

**GET Query**
```
session_id: string   // required
```

**GET Response**
```typescript
interface PaymentVerifyResponse {
  status: 'paid' | 'unpaid';
  customer_email: string | null;
  payment_type: string;     // e.g. 'premium_reading' | 'chat_credit'
  reading_id: string | null;
  source: string | null;     // checkout metadata source for growth attribution
  language: 'ko' | 'en' | null;
  credits_applied: boolean;
  credits_total: number | null;
}
```

**Implementation Notes**
- `POST /api/payment`는 one-time oracle reading checkout을 생성한다.
- `readingId`가 포함되면 현재 로그인 사용자 또는 해당 reading의 `accessKey` 보유자만 checkout을 시작할 수 있다.
- `GET /api/payment?session_id=...`는 Stripe checkout 결과를 검증하고, 결제 레코드 upsert 및 리딩 premium/chat credit 동기화를 함께 수행한다.
- `/payment/success`는 `GET /api/payment`의 `source`를 `checkout_success` growth event source로 사용해 캠페인 funnel의 checkout success가 landing/paywall/checkout start와 같은 source에 묶이게 한다.
- 이 endpoint는 `/payment/success`와 결과 복구 흐름에서 webhook race condition 완화를 위해 사용된다.

**Error**
- `400` 잘못된 promo code 요청 또는 `session_id` 누락
- `403` reading ownership 또는 accessKey 불일치
- `404` reading 없음
- `500` Stripe checkout 생성/검증 실패

---

### 12. 결제 가격 조회 (Payment Price Lookup) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `GET` | `/api/payment/price` | ❌ |

**Query**
```
productId?: string // optional, 기본값은 oracle reading product
priceId?: string   // optional, recurring subscription price lookup용 Stripe price ID
```

**Response**
```typescript
interface PaymentPriceResponse {
  productId: string;
  priceId: string;
  amount: number;
  currency: string;
  formattedPrice: string;
  metadata: Record<string, string>;
}
```

**Implementation Notes**
- paywall surface는 이 endpoint를 primary source로 사용하되, fetch 실패 시에도 placeholder(`...`)에 머무르지 않는 fallback label을 가져야 한다.
- one-time reading paywall은 `productId`, subscription paywall은 `priceId` 기반 live lookup을 사용할 수 있다.
- `PaymentModal`과 result paywall surface는 fallback label을 먼저 보여주고, live lookup 중에는 loading skeleton, 실패 시에는 graceful fallback copy를 함께 노출한다.

**Error**
- `400` product ID 누락 또는 잘못된 요청
- `500` Stripe 가격 조회 실패

---

### 13. 공개 리뷰 목록 & 리뷰 등록 (Review Public) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `GET` | `/api/review` | ❌ |
| `POST` | `/api/review` | Optional |

**GET Response**
```typescript
interface PublicReviewItem {
  id: string;
  nickname: string;   // 공개 응답에서는 mask 처리
  rating: number;
  content: string;
  createdAt: string;
}

interface PublicReviewListResponse {
  reviews: PublicReviewItem[];
}
```

**POST Request**
```typescript
interface ReviewCreateRequest {
  readingId?: string;
  accessKey?: string;   // anonymous reading일 때 owner proof
  nickname: string;
  rating: number;       // 1-5
  content: string;      // 10-500 chars
  isPromoUser?: boolean;
}
```

**POST Response**
```typescript
interface ReviewCreateResponse {
  success: true;
  review: {
    id: string;
    readingId?: string | null;
    nickname: string;
    rating: number;
    content: string;
    isPromoUser: boolean;
    isApproved: boolean; // false=승인 대기, true=승인됨
    createdAt: string;
  };
  rewardGranted: boolean;
}
```

**Business Rules**
- `readingId`가 포함되면 현재 로그인 사용자 또는 해당 reading의 `accessKey` 보유자만 리뷰를 남길 수 있다.
- `readingId`당 리뷰는 최대 1회만 허용하며, API precheck와 DB-level unique constraint가 함께 이를 보장한다.
- reward credit은 review 생성과 같은 트랜잭션에서 1회만 지급되어야 한다.
- 리뷰 등록 직후 기본 상태는 `isApproved === false`이며, 운영 화면에서는 이를 `승인 대기`로 표시한다.

**Error**
- `400` 잘못된 payload
- `403` reading ownership 또는 accessKey 불일치
- `404` reading 없음
- `409` 이미 해당 reading에 대한 리뷰가 존재함

---

### 14. 리뷰 운영 (Review Admin) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `GET` | `/api/review/admin` | ✅ ADMIN |
| `PATCH` | `/api/review/admin` | ✅ ADMIN |
| `DELETE` | `/api/review/admin` | ✅ ADMIN |

**GET Response**
```typescript
interface ReviewAdminListResponse {
  reviews: Array<{
    id: string;
    readingId?: string | null;
    nickname: string;
    rating: number;
    content: string;
    isApproved: boolean; // false=승인 대기, true=승인됨
    isPromoUser: boolean;
    createdAt: string;
  }>;
}
```

**PATCH Request**
```typescript
interface ReviewAdminUpdateRequest {
  id: string;
  isApproved: boolean;
}
```

**DELETE Request**
```typescript
interface ReviewAdminDeleteRequest {
  id: string;
}
```

**Response**
```typescript
interface ReviewAdminMutationResponse {
  success: true;
}
```

**Error**
- `401` 로그인 필요
- `403` 관리자 권한 필요
- `404` 리뷰 없음
- `400` 잘못된 payload 또는 처리 실패

---

### 15. Grand Oracle Chat 히스토리 조회 ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `GET` | `/api/oracle-chat/history` | ✅ |

**Query**
```
roomId?: string  // optional. 없으면 최근 활성 room
limit?: number   // default 30, max 50
cursor?: string  // optional. 페이지네이션용 message id
```

**Response**
```typescript
interface OracleChatHistoryResponse {
  roomId: string | null;
  domain: 'career' | 'love' | 'wealth' | 'general';
  messages: Array<{
    id: string;
    role: 'user' | 'oracle';
    content: string;
    mode: 'casual' | 'council_briefing';
    councilData?: {
      sajuSummary?: string;
      tarotCard?: string;
      tarotIsReversed?: boolean;
      natalSummary?: string;
      finalVerdict?: string;
    };
    createdAt: string;
  }>;
  hasMore: boolean;
  nextCursor: string | null;
}
```

**Logic**
- 로그인 사용자 본인의 room만 조회할 수 있다.
- `roomId`가 없으면 가장 최근 활성 room 기준으로 반환한다.
- 빈 히스토리일 때도 `domain`, `messages`, `hasMore`, `nextCursor` shape는 유지한다.

**Error**
- `401` 로그인 필요
- `404` 존재하지 않거나 본인 소유가 아닌 room

---

### 16. Grand Oracle Chat 메시지 전송 ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/oracle-chat/message` | ✅ |

**Request**
```typescript
interface OracleChatMessageRequest {
  roomId?: string;
  domain?: 'career' | 'love' | 'wealth' | 'general';
  content: string; // 1-1000 chars
  userContext?: {
    birthDate: string;      // YYYY-MM-DD
    birthTime?: string;     // HH:mm
    birthPlace?: string;    // optional
  };
}
```

**Response**
```typescript
// text/event-stream
// chunk: data: { delta: string, done: false }
// final: data: { delta: '', done: true, messageId: string, mode: 'casual' | 'council_briefing' }
```

**Logic**
- 서버는 질문 의도를 `casual` 또는 `council_briefing`으로 분류한다.
- `council_briefing`에서는 사주, 타로, 점성술 근거를 결합한 최종 브리핑을 생성한다.
- **활성 유료 membership 사용자**는 무제한 메시지다.
- **비구독자**는 `OracleChatQuota` 기준 1일 3회까지만 보낼 수 있다.
- quota 초과 시에는 one-time reading 결제가 아니라 기존 membership paywall (`SubscriptionModal` / `/billing`)로 유도한다.
- Oracle Chat access는 클라이언트 flag가 아니라 서버의 활성 membership 상태에서만 도출해야 한다.

**Implementation Note (2026-04-17)**
- 메시지 생성 시 context 우선순위는 `최근 reading metadata -> latest room summary -> request payload userContext` 순서를 따른다.
- room ownership, membership entitlement, quota state는 모두 서버에서 판정한다.
- `council_briefing` 생성이 부분 실패해도 public stream shape는 유지해야 하며, empty completion으로 끝나서는 안 된다.

**Error**
- `400` 잘못된 payload
- `401` 로그인 필요
- `402` 일일 무료 quota 초과
- `404` 존재하지 않거나 본인 소유가 아닌 room

**402 Error Shape**
```typescript
interface OracleChatQuotaErrorResponse {
  error: {
    code: 402;
    message: string;
    details?: 'ORACLE_CHAT_DAILY_LIMIT';
  };
}
```

---

### 17. Grand Oracle Chat 데일리 훅 ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `GET` | `/api/oracle-chat/daily-hook` | ✅ |

**Query**
```
roomId?: string  // optional. 없으면 최근 room 기준
```

**Response**
```typescript
interface OracleChatDailyHookResponse {
  hookMessage: string;
  generatedAt: string;
  basedOn: {
    lastMessageSummary: string;
    todayFortuneSummary: string;
  };
}
```

**Logic**
- 최근 오라클 질문 요약과 오늘의 흐름을 연결해 재방문 훅을 만든다.
- room 지정 시에도 본인 소유 room만 사용할 수 있다.
- `/daily` 또는 홈 surface에서 `Grand Oracle Chat` 진입 카드로 재사용할 수 있다.

**Implementation Note (2026-04-17)**
- daily hook은 최근 room이 있으면 이를 우선 사용하되, recent reading-linked context가 있으면 함께 참고할 수 있다.
- hook 생성 실패는 fatal error보다 ordinary chat welcome fallback으로 다루는 편이 우선이다.

**Error**
- `401` 로그인 필요
- `404` 존재하지 않거나 본인 소유가 아닌 room

---

### 18. SMS Daily Signal 번호 등록 ✅ 계획 잠금

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/sms-oracle/register` | ✅ |

**Request**
```typescript
interface SmsOracleRegisterRequest {
  phoneNumber: string;
}
```

**Response**
```typescript
interface SmsOracleRegisterResponse {
  success: boolean;
  verificationSent: boolean;
}
```

**Logic**
- 로그인 사용자가 Daily Signal 수신용 번호를 등록한다.
- OTP 검증 전까지 실제 발송 대상이 되지 않는다.
- 현재 이 flow는 paid perk 온보딩의 일부이며, free 체험용 문자 funnel로 쓰지 않는다.

---

### 19. SMS Daily Signal 번호 인증 ✅ 계획 잠금

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/sms-oracle/verify` | ✅ |

**Request**
```typescript
interface SmsOracleVerifyRequest {
  phoneNumber: string;
  code: string;
}
```

**Response**
```typescript
interface SmsOracleVerifyResponse {
  verified: boolean;
}
```

**Logic**
- OTP가 일치하면 해당 번호를 `verified` 상태로 전환한다.
- 이후 활성 paid membership이 존재하면 daily signal 발송 대상이 된다.

---

### 20. SMS Daily Signal 발송 Cron ✅ 계획 잠금

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/sms-oracle/daily-hook` | `CRON_SECRET` |
| `GET` | `/api/sms-oracle/daily-hook` | `CRON_SECRET` |

**Request**
```typescript
interface SmsOracleDailyHookRequest {
  targetDate?: string;
}
```

**Response**
```typescript
interface SmsOracleDailyHookResponse {
  dispatched: number;
  failed: number;
  skipped: number;
}
```

**Logic**
- `isVerified`인 subscriber 중 **활성 paid membership 사용자만** 대상으로 한다.
- 최근 `/daily`, 최근 리딩, 최근 `Grand Oracle Chat` 문맥에서 한 줄짜리 signal을 만든다.
- 이 endpoint는 one-way retention signal만 다루며, inbound 상담 계약은 현재 범위 밖이다.

---

## Database Tables (관련 테이블)

| Table | 핵심 컬럼 | 비고 |
|:------|:---------|:-----|
| `User` | `referralCode`, `stripeSubscriptionId`, `subscriptionStatus` | 초대 코드 관리 |
| `Referral` | `referralCode`, `inviterUserId`, `inviteeUserId` | 중복 방지 `@@unique` |
| `ChatSession` | `credits`, `shareRewardClaimed`, `characterId` | 전문 상담가/선택 상태 유지 (`characterId` wire key 유지) |
| `OracleChatRoom` | `userId`, `domain`, `title`, `updatedAt` | Grand Oracle Chat thread 보관 |
| `OracleChatMessage` | `roomId`, `role`, `mode`, `councilData`, `createdAt` | council briefing 근거와 최종 결론 포함 |
| `OracleChatQuota` | `userId`, `date`, `messageCount` | 비구독자 1일 3회 quota 관리 |
| `SmsOracleSubscriber` | `userId`, `phoneNumber`, `isVerified`, `isActive` | Daily Signal 수신 대상 관리 |
| `SmsOracleMessage` | `subscriberId`, `direction`, `content`, `createdAt` | launch scope에서는 outbound 로그 중심 |
| `SmsOracleQuota` | `subscriberId`, `date`, `dailyHookSentAt` | 하루 1회 signal 중복 방지 |
| `Review` | `readingId`, `rating`, `isApproved`, `isPromoUser` | `readingId` 단위 1회 제출/1회 보상을 partial unique index로 고정 |
| `FollowUpJob` | `stage`, `status`, `scheduledFor` | 드립 이메일 관리 |
| `GrowthEvent` | `event`, `channel`, `metadata`, `createdAt` | 퍼널/리텐션/바이럴 계측, `createdAt` 중심 조회 성능 하드닝 적용 |

---

## Task-to-Endpoint Mapping

| Task (task_board.md) | Endpoint |
|:---------------------|:---------|
| Oracle reading checkout & payment sync | `POST|GET /api/payment` |
| 구독 해지 버튼 | `POST /api/subscription/cancel` |
| 데일리 타로 UI | `GET /api/daily/tarot` |
| 친구 초대 보상 | `POST /api/referral/reward` |
| KPI 대시보드 | `GET /api/growth/summary` |
| Paywall price reliability | `GET /api/payment/price` |
| Grand Oracle Chat history | `GET /api/oracle-chat/history` |
| Grand Oracle Chat message + quota gate | `POST /api/oracle-chat/message`, `GET /api/subscription/status`, `POST /api/subscription/create` |
| Grand Oracle Chat daily entry | `GET /api/oracle-chat/daily-hook` |
| SMS Daily Signal enrollment | `POST /api/sms-oracle/register`, `POST /api/sms-oracle/verify` |
| SMS Daily Signal dispatch | `POST|GET /api/sms-oracle/daily-hook` |
| Review integrity & moderation | `GET|POST /api/review`, `GET|PATCH|DELETE /api/review/admin` |
| English-ready reading path | `POST /api/reading`, `POST|GET /api/reading/followup`, `POST /api/reading/followup/stream` |
| Language-split funnel instrumentation | `POST /api/growth/track`, `GET /api/growth/summary` |
| English paywall pricing parity | `GET /api/payment/price` |
| English acquisition guides & onboarding explainer | Presentation layer only, onward flow via `POST /api/reading` and `POST /api/growth/track` |
