# API 명세서: CosmicPath v2.0 🌌

> **Project**: CosmicPath | **Version**: v2.0 | **Generated**: 2026-03-19
> **Base URL**: `/api` | **Auth Method**: Next-Auth Session (서버사이드)
> **Status**: **LOCKED** — 변경 시 사유 기재 필수
> **근거**: `docs/prd-v2.md` (친구 가입 완료 시 Credit +1 정책 확정)

---

## Authentication

- **공개 엔드포인트**: Auth 불필요 (`/api/daily/fortune`, `/api/reading/*`, `/api/growth/track`)
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

### 2. 오늘의 타로 (Daily Tarot) 🆕 구현 필요

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

### 5. 구독 해지 (Subscription Cancel) 🆕 구현 필요

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

### 7. 친구 초대 가입 보상 (Referral Reward) 🆕 구현 필요

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

### 8. 오라클 챗 (Oracle Chat) ✅ 구현됨 (v2.0 업데이트 예정)

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/chat/message` | ✅ |

**Request (추가 파라미터)**
```typescript
interface OracleChatMessageRequest {
  message: string;
  birthDate?: string;
  birthTime?: string;
  cityName?: string;     // 진태양시 보정용 추가 (e.g. '서울')
  longitude?: number;    // 진태양시 보정용 추가 (e.g. 127.0)
  characterId?: string;  // v3.1 전문 상담가 ID (e.g. 'general_orion', 'compatibility_cassio', 'wealth_midas', 'timing_selene', 'reunion_nova', 'career_lyra', 'business_draco')
  questionIntent?: 'general' | 'compatibility' | 'reunion' | 'wealth' | 'timing' | 'career' | 'business';
  selectionMode?: 'auto' | 'manual';
}
```

**Logic**: 
- 구독자 → 무제한 | 무료 → Credit 소진 시 차단
- (New) `saju-engine.ts` 호출 → 진태양시 보정된 4주 8자, 십신 데이터 도출 후 프롬프트 주입

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

### 10. 성장 KPI 요약 (Growth Summary) 🆕 구현 필요

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
  };
  series: Array<{
    date: string;
    installs: number;
    activeUsers: number;
    shares: number;
    invites: number;
    inviteConversions: number;
    paidConversions: number;
  }>;
  topSources: Array<{ source: string; count: number }>;
}
```

**Error**
- `401` 로그인 필요
- `403` 관리자 권한 필요

---

## Database Tables (관련 테이블)

| Table | 핵심 컬럼 | 비고 |
|:------|:---------|:-----|
| `User` | `referralCode`, `stripeSubscriptionId`, `subscriptionStatus` | 초대 코드 관리 |
| `Referral` | `referralCode`, `inviterUserId`, `inviteeUserId` | 중복 방지 `@@unique` |
| `ChatSession` | `credits`, `shareRewardClaimed`, `characterId` | 전문 상담가/선택 상태 유지 (`characterId` wire key 유지) |
| `FollowUpJob` | `stage`, `status`, `scheduledFor` | 드립 이메일 관리 |
| `GrowthEvent` | `event`, `channel`, `metadata`, `createdAt` | 퍼널/리텐션/바이럴 계측 |

---

## Task-to-Endpoint Mapping

| Task (task_board.md) | Endpoint |
|:---------------------|:---------|
| 구독 해지 버튼 | `POST /api/subscription/cancel` |
| 데일리 타로 UI | `GET /api/daily/tarot` |
| 친구 초대 보상 | `POST /api/referral/reward` |
| KPI 대시보드 | `GET /api/growth/summary` |
