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
  // NEW: 통합된 타로 조언 카드
  dailyTarot?: {
    cardIndex: number;
    cardName: string;
    cardNameKo: string;
    isReversed: boolean;
    meaning: string;
  };
  cachedUntil: string;     // ISO 8601
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
  status: 'free' | 'pro';
  plan: 'pro_monthly' | 'pro_yearly' | null;
  expiresAt: string | null;
  stripeCustomerId: string | null;
}
```

---

### 4. 구독 세션 생성 (Checkout Create) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/subscription/create` | ✅ |

**Request**
```typescript
interface SubscriptionCreateRequest {
  planType: 'MONTHLY' | 'ANNUAL';
}
```

**Response**: `{ checkoutUrl: string }`

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

### 8. 오라클 챗 (Oracle Chat) ✅ 구현됨

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/chat/message` | ✅ |

**Logic**: 구독자 → 무제한 | 무료 → Credit 소진 시 차단

---

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
| `ChatSession` | `credits`, `shareRewardClaimed` | Credit 지급 대상 |
| `FollowUpJob` | `stage`, `status`, `scheduledFor` | 드립 이메일 관리 |
| `GrowthEvent` | `event`, `channel`, `metadata`, `createdAt` | 퍼널/리텐션/바이럴 계측 |

---

## Task-to-Endpoint Mapping

| Task (task.md) | Endpoint |
|:---------------------|:---------|
| 구독 해지 버튼 | `POST /api/subscription/cancel` |
| 오늘의 운세 + 타로 통합 | `GET /api/daily/fortune` |
| 친구 초대 보상 | `POST /api/referral/reward` |

---

## 11. Career Oracle (Teaser & Unlock) 🆕

커리어 오라클 기능을 위한 티저 및 잠금 해제 엔드포인트.

### 11.1 커리어 티저 (Career Teaser)
사용자의 고민형태와 기본 사주/점성술 데이터를 바탕으로 강렬한 후킹 1줄을 생성합니다.

| Method | Path | Auth | Runtime |
|:-------|:-----|:-----|:--------|
| `POST` | `/api/reading/career/teaser` | ❌ | Edge |

**Request**
```typescript
interface CareerTeaserRequest {
  birthday: string;    // YYYY-MM-DD
  birthtime: string;   // HH:mm
  gender: 'M' | 'F';
  worryType: 'transition' | 'first_job' | 'promotion' | 'burnout';
}
```

**Response**
```typescript
interface CareerTeaserResponse {
  hook: string; // LLM이 생성한 1~2줄 문구
}
```

### 11.2 커리어 리포트 잠금 해제 (Career Unlock)
Stripe 결제 완료 후 프리미엄 리포트를 생성하고 접근 권한을 부여합니다.

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/reading/career/unlock` | ✅ |

**Request**
```typescript
interface CareerUnlockRequest {
  sessionId: string;   // Stripe Checkout Session ID
  birthday: string;
  birthtime: string;
  gender: 'M' | 'F';
  worryType: 'transition' | 'first_job' | 'promotion' | 'burnout';
  tarotCards?: number[];
}
```

**Response**
```typescript
interface CareerUnlockResponse {
  unlocked: true;
  report: CareerPremiumReport; // 상세 분석 데이터
  metadata: any;
}
```

### 11.3 커리어 상세 분석 (Career Premium Report)
PRO 구독자 또는 잠금 해제된 사용자를 위한 전체 데이터 생성.

| Method | Path | Auth |
|:-------|:-----|:-----|
| `POST` | `/api/reading/career` | ✅ (PRO/Payment) |

**Response**
```typescript
interface CareerPremiumReport {
  readingId: string;
  sajuTiming: string;
  astrologyTalent: string;
  tarotAdvice: string;
  actionPlan: string[];
  snapshot: string; // Threads 공유용 문구
  phase1_pastAnalysis: string;
  phase2_timing: string;
  phase3_keywords: string[];
}
```

- [x] **[Frontend]** 카카오톡/스레드 공유 모듈 및 Snapshot 기능 연동

## 🚀 [NEW] Sprint 1.5: Frontend Funnel Integration [진행 예정]
*목표: 티저 -> 결제 -> 결과 확인으로 이어지는 사용자 경험 완성*
- [ ] **[Frontend]** `/career` 랜딩 페이지 개편 (Teaser 애니메이션 추가)
- [ ] **[Frontend]** `TeaserView` -> `PaymentModal` 전환 로직 고도화
- [ ] **[Frontend]** `ResultView` 내 "봉인 해제" Glassmorphism UI 구현
- [ ] **[Integration]** `/api/reading/career/unlock` 실제 연동 및 에러 핸들링
```
