# API 명세서: CosmicPath v2.0 🌌

> 기준일: 2026-03-19 | 상태: **LOCKED** (변경 시 사유 기재 필수)
> 근거: `RESEARCH/CosmicPath_Analysis_20260318` + 기존 코드베이스 분석

---

## 🔮 운세 및 엔진 (Reading & Engine)

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| POST | `/api/reading` | 생년월일 기반 AI 리포트 생성 (Stream) | Optional |
| GET | `/api/reading/save` | 운세 세션 DB 저장 | Optional |
| POST | `/api/reading/claim-share-reward` | 공유 보상 무료 질문 수령 | Required |
| POST | `/api/reading/followup` | 후속 질문 (Oracle Chat) | Required |
| POST | `/api/reading/followup/stream` | 후속 질문 스트림 | Required |

---

## 🌅 일일 운세 (Daily Fortune) — **NEW**

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| GET | `/api/daily/fortune` | 오늘의 사주 기반 일일 운세 조회 | Optional |
| **GET** | **`/api/daily/tarot`** | **오늘의 타로 한 장 뽑기** | **Optional** |

### `GET /api/daily/tarot` (NEW)

```typescript
// Request: Query params
interface DailyTarotRequest {
  birthDate?: string; // YYYY-MM-DD (개인화용, optional)
}

// Response: 200 OK
interface DailyTarotResponse {
  card: {
    name: string;          // "The Star"
    nameKo: string;        // "별"
    number: number;        // 17
    isReversed: boolean;
    imageUrl: string;
  };
  interpretation: string;  // AI 해석 1-2문장
  luckyColor: string;
  luckyNumber: number;
  shareCardUrl: string;    // 소셜공유용 이미지 URL
}
```

---

## 💳 결제 및 주문 (Payment & Orders)

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| POST | `/api/payment` | Stripe Checkout 세션 생성 | Optional |
| GET | `/api/payment/price` | 지역화 가격 반환 | Public |
| POST | `/api/payment/chat-credit` | Oracle Chat 크레딧 구매 | Required |
| POST | `/api/webhook/stripe` | Stripe 비동기 이벤트 처리 | Stripe Sig |
| POST | `/api/webhook/stripe/reconcile` | 미처리 결제 복구 | Internal |
| GET | `/api/orders` | 주문 내역 조회 | Required |
| GET | `/api/orders/public` | 공개 주문 통계 (사회적 증명) | Public |

---

## 🔄 구독 (Subscription) — **Frontend 연결 필요**

> 변경 사유 (2026-03-19): 사용자 결정에 따라 구독 가격 통화는 KRW가 아니라 USD 기준을 유지함.

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| POST | `/api/subscription/create` | 구독 세션 생성 | Required |
| GET | `/api/subscription/status` | 구독 상태 확인 | Required |
| **POST** | **`/api/subscription/cancel`** | **구독 해지** | **Required** |
| **POST** | **`/api/subscription/change-plan`** | **플랜 변경 (월→연)** | **Required** |

### `POST /api/subscription/create` (기존 + 확장)

```typescript
// Request
interface CreateSubscriptionRequest {
  planType: "MONTHLY" | "ANNUAL";
  // MONTHLY: $9.99/month (price_pro_monthly)
  // ANNUAL: $49.99/year (price_pro_yearly)
}

// Response: 303 Redirect to Stripe Checkout
interface CreateSubscriptionResponse {
  checkoutUrl: string;
}
```

### Subscription Tiers (가격 정책)

| Tier | 가격 | Stripe Price ID | 혜택 |
|------|------|-----------------|------|
| Free | $0 | - | Phase 1-2 무료, 일일 타로 1회 |
| One-time | $5.99 | `price_onetime_4500` | Phase 3-5 잠금 해제 |
| Monthly | $9.99/month | `price_pro_monthly` | 무제한 Chat + 월간 리포트 |
| Annual | $49.99/year | `price_pro_yearly` | 최대 할인 + 월간 혜택 유지 |

---

## 💬 오라클 채팅 (Oracle Chat)

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| POST | `/api/chat/message` | AI 후속 질문 전송 | Required |
| GET | `/api/chat/session/[id]` | 채팅 기록 + 잔여 크레딧 | Required |

---

## 📈 성장 및 바이럴 (Growth & Viral)

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| POST | `/api/growth/track` | 바이럴 이벤트 기록 | Optional |
| GET | `/api/invite/code` | 내 초대 코드 조회 | Required |
| POST | `/api/invite/create` | 초대 링크 생성 | Required |
| POST | `/api/invite/redeem` | 초대 보상 수령 | Required |
| POST | `/api/invite/track` | 초대 클릭 추적 | Public |
| GET | `/api/invite/verify` | 초대 코드 검증 | Public |

---

## 💕 궁합 매칭 (Match/Compatibility)

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| POST | `/api/match/create` | 궁합 세션 생성 | Required |
| POST | `/api/match/join` | 궁합 참여 (상대방) | Public |
| GET | `/api/match/[id]` | 궁합 상태 조회 | Public |
| POST | `/api/match/[id]/analyze` | 궁합 AI 분석 실행 | Required |
| POST | `/api/match/[id]/pay` | 궁합 결제 | Required |
| POST | `/api/match/[id]/unlock` | 궁합 결과 잠금 해제 | Required |

---

## 🖼️ OG 이미지 (Social Share) — **확장 필요**

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| GET | `/api/og` | 기본 OG 이미지 | Public |
| GET | `/api/og/reading/[id]` | 개인화 리딩 OG 이미지 | Public |
| GET | `/api/og/aura` | 오라 OG 이미지 | Public |
| **GET** | **`/api/og/social-card/[id]`** | **1080×1920 세로 소셜 카드** | **Public** |
| **GET** | **`/api/og/match/[id]`** | **궁합 결과 공유 카드** | **Public** |

### `GET /api/og/social-card/[id]` (NEW)

```typescript
// 1080×1920 세로형 소셜 카드 이미지
// 포함: 별자리 시각화, 핵심 결과 1-2문장, 워터마크, QR코드
// 용도: 인스타 스토리, TikTok, Threads 공유
```

---

## 📧 이메일 (Email) — **드립 시퀀스 확장**

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| POST | `/api/email/send-result` | 결과 이메일 발송 (D+0) | Internal |
| **POST** | **`/api/email/drip/schedule`** | **드립 시퀀스 등록** | **Internal** |
| **POST** | **`/api/email/drip/send`** | **드립 이메일 발송 (Cron)** | **Internal** |

### Drip Sequence Schedule

| Day | 제목 | 트리거 |
|-----|------|--------|
| D+0 | 운명 리딩 결과 (현재 ✅) | 리딩 완료 |
| D+2 | "리딩 어떠셨어요?" + 20% 단일 사용 코드 | Cron |
| D+5 | 천체 이벤트 + Phase 4 CTA | Cron |
| D+7 | "분석 보관 처리 예정" | Cron |
| D+14 | 미니 주간 운세 + 구독 제안 | Cron |
| D+30 | 구독 LTV 비교 | Cron |

### `POST /api/email/drip/schedule`

```typescript
interface ScheduleDripRequest {
  readingId: string;
  email: string;
  fromDate?: string; // ISO datetime, optional
}

interface ScheduleDripResponse {
  ok: true;
  readingId: string;
  email: string;
  scheduledStages: Array<"D2_DISCOUNT" | "D5_COSMIC_WINDOW" | "D7">;
}
```

### `POST /api/email/drip/send`

```typescript
interface SendDripRequest {
  limit?: number;
  dryRun?: boolean;
}

interface SendDripResponse {
  ok: boolean;
  scanned: number;
  sent: number;
  failed: number;
  skipped: number;
}
```

---

## 🔐 인증 (Auth)

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| * | `/api/auth/[...nextauth]` | NextAuth 핸들러 | Public |
| POST | `/api/auth/otp/send` | OTP 발송 | Public |
| POST | `/api/auth/otp/verify` | OTP 검증 | Public |
| **POST** | **`/api/auth/kakao`** | **카카오 소셜 로그인** | **Public** |

---

## 🛠️ 운영 (Ops)

| Method | Path | 설명 | Auth |
|--------|------|------|------|
| POST | `/api/ops/followups/run` | 후속 알림 Cron 실행 | Internal |
| GET | `/api/ops/usage/counters` | 사용량 카운터 | Internal |
| GET | `/api/promo/validate` | 프로모코드 검증 | Public |
| POST | `/api/promo/redeem` | 프로모코드 적용 | Required |

---

## Error Codes (공통)

| Code | 설명 |
|------|------|
| 400 | Invalid request body / Missing required field |
| 401 | Unauthorized — 로그인 필요 |
| 403 | Forbidden — 구독/결제 필요 |
| 404 | Resource not found |
| 429 | Rate limited — 일일 한도 초과 |
| 500 | Internal server error |

---

> ⚠️ **NEW 표시 항목**: 리서치 분석 결과 추가가 필요한 신규 엔드포인트.
> 기존 API는 코드베이스에서 직접 확인하여 명세함.
