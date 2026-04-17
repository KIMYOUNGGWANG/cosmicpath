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
> - `/api/reading` 내부 구현은 `request validation -> runtime assembly -> free generation -> premium phase orchestration -> persistence/resume` 순서의 서비스 경계로 재구성할 수 있다.
> - free generation은 `free_focus`와 compact summary contract를 유지한 채 prompt/runtime 경계만 정리한다.
> - premium generation은 multi-phase contract를 유지한 채 공통 시스템 규칙층과 phase overlay 조합 구조로 이동할 수 있다.
> - reading runtime metadata는 later premium resume와 follow-up에서 재사용 가능한 source-of-truth로 취급한다.
> - anonymous owner proof (`accessKey`)와 server-verified premium entitlement 규칙은 리팩터링 중에도 동일하게 유지해야 한다.

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
  credits_applied: boolean;
  credits_total: number | null;
}
```

**Implementation Notes**
- `POST /api/payment`는 one-time oracle reading checkout을 생성한다.
- `readingId`가 포함되면 현재 로그인 사용자 또는 해당 reading의 `accessKey` 보유자만 checkout을 시작할 수 있다.
- `GET /api/payment?session_id=...`는 Stripe checkout 결과를 검증하고, 결제 레코드 upsert 및 리딩 premium/chat credit 동기화를 함께 수행한다.
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

## Database Tables (관련 테이블)

| Table | 핵심 컬럼 | 비고 |
|:------|:---------|:-----|
| `User` | `referralCode`, `stripeSubscriptionId`, `subscriptionStatus` | 초대 코드 관리 |
| `Referral` | `referralCode`, `inviterUserId`, `inviteeUserId` | 중복 방지 `@@unique` |
| `ChatSession` | `credits`, `shareRewardClaimed`, `characterId` | 전문 상담가/선택 상태 유지 (`characterId` wire key 유지) |
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
| Review integrity & moderation | `GET|POST /api/review`, `GET|PATCH|DELETE /api/review/admin` |
| English-ready reading path | `POST /api/reading`, `POST|GET /api/reading/followup`, `POST /api/reading/followup/stream` |
| Language-split funnel instrumentation | `POST /api/growth/track`, `GET /api/growth/summary` |
| English paywall pricing parity | `GET /api/payment/price` |
| English acquisition guides & onboarding explainer | Presentation layer only, onward flow via `POST /api/reading` and `POST /api/growth/track` |
