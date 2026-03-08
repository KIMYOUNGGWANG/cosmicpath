# 🗂️ CosmicPath v2.0 — Task Board

**Sprint**: 2026-03 | **목표**: MRR 구조 + SEO 복구 + 재방문 훅  
**워크플로우**: `/ideate` (전략 검증 완료 ✅) → `/launch` (스펙 잠금 중)

---

## 🔴 Priority 1 — 구독 모델 (MRR)

| ID | 태스크 | 파일 | 상태 |
|----|--------|------|------|
| SUB-01 | `payment-config.ts`에 Pro/Couple 구독 Price ID 추가 | `src/lib/payment/payment-config.ts` | `[x]` |
| SUB-02 | Stripe 구독 Checkout 세션 생성 API | `src/app/api/subscription/create/route.ts` | `[x]` |
| SUB-03 | 구독 상태 조회 API | `src/app/api/subscription/status/route.ts` | `[x]` |
| SUB-04 | Webhook에 subscription 이벤트 핸들러 추가 | `src/app/api/webhooks/route.ts` | `[x]` |
| SUB-05 | `SubscriptionModal.tsx` UI 컴포넌트 | `src/components/payment/SubscriptionModal.tsx` | `[x]` |
| SUB-06 | Supabase `users` 테이블에 구독 컬럼 마이그레이션 | DB Migration SQL | `[x]` |

---

## 🔴 Priority 2 — SEO 복구

| ID | 태스크 | 파일 | 상태 |
|----|--------|------|------|
| SEO-01 | `page.tsx`에서 `'use client'` 제거, Server Component 전환 | `src/app/page.tsx` | `[x]` |
| SEO-02 | `LenisProvider.tsx` Client Component 분리 | `src/components/providers/LenisProvider.tsx` | `[x]` |
| SEO-03 | `layout.tsx`에 LenisProvider + JSON-LD 추가 | `src/app/layout.tsx` | `[x]` |
| SEO-04 | Static `metadata` export (title/description/og:image) | `src/app/page.tsx` | `[x]` |

---

## 🟡 Priority 3 — Daily Fortune 재방문 훅

| ID | 태스크 | 파일 | 상태 |
|----|--------|------|------|
| DAY-01 | Daily Fortune API (캐싱 1일) | `src/app/api/daily/fortune/route.ts` | `[x]` |
| DAY-02 | `/daily` 페이지 구현 | `src/app/daily/page.tsx` | `[x]` |
| DAY-03 | Navigation에 "오늘의 운세" 링크 추가 | `src/components/landing/Navigation.tsx` | `[x]` |

---

## 🟡 Priority 4 — 리퍼럴 프로그램

| ID | 태스크 | 파일 | 상태 |
|----|--------|------|------|
| REF-01 | 리퍼럴 코드 생성 / 검증 로직 | `src/app/api/invite/` 기존 파일 수정 | `[x]` |
| REF-02 | 초대 성공 시 Pro 7일 부여 로직 | `src/app/api/invite/redeem/route.ts` | `[x]` |
| REF-03 | `ReferralPanel.tsx` UI 컴포넌트 | `src/components/share/ReferralPanel.tsx` | `[x]` |

---

## 🟢 Priority 5 — Threads 공유 확장

| ID | 태스크 | 파일 | 상태 |
|----|--------|------|------|
| TH-01 | `SharePanel.tsx`에 Threads 버튼 추가 | `src/components/share/SharePanel.tsx` | `[x]` |
| TH-02 | TikTok 최적화 공유 텍스트 템플릿 추가 | `src/components/share/SharePanel.tsx` | `[x]` |

## � Priority 6 — 구독 상품 혜택 로직 연동 (Premium Features)

| ID | 태스크 | 파일 | 상태 |
|----|--------|------|------|
| BEN-01 | Oracle Chat: 구독자 판별 로직 및 크레딧 무제한 처리 (Stream) | `src/app/api/reading/followup/stream/route.ts` | `[x]` |
| BEN-02 | Oracle Chat: 비동기 메시지 저장 및 DB 트랜잭션 예외 처리 | `src/app/api/reading/followup/stream/route.ts` | `[x]` |
| BEN-03 | Daily Fortune: 구독자 프리미엄 인사이트 제공 여부 로직 구성 | `src/app/api/daily/fortune/route.ts` | `[x]` |
| BEN-04 | Daily Fortune UI: 구독자에게만 노출되는 프리미엄 UI 블록 | `src/components/daily/DailySealedWidget.tsx` | `[x]` |

## 🌐 Priority 7 — K-Astrology Aura Cards (Global Viral)

| ID | 태스크 | 파일 | 상태 |
|----|--------|------|------|
| GLB-01 | 타임존 기반 사주/점성 데이터 변환 유틸리티 | `src/lib/utils/timezone.ts` | `[x]` |
| GLB-02 | K-Aura 점수 생성기 (사주 기반 색상/키워드 로직) | `src/lib/engines/aura.ts` | `[x]` |
| GLB-03 | `/api/aura/generate` API (LLM 기반 영문 요약) | `src/app/api/aura/generate/route.ts` | `[x]` |
| GLB-04 | Vercel OG Image Generation (TikTok/IG 공유용) | `src/app/api/og/aura/route.tsx` | `[x]` |
| GLB-05 | `/k-destiny` 글로벌 전용 랜딩 & 폼 UI | `src/app/k-destiny/page.tsx` | `[x]` |

---

## 💍 Priority 8 — Cosmic Circle (소셜 관계망 궁합)

| ID | 태스크 | 파일 | 상태 |
|----|--------|------|------|
| CIR-01 | Supabase `Relations` 테이블 설계 및 셋업 | DB Migration SQL | `[ ]` |
| CIR-02 | `/api/circle/add`, `/api/circle/list` CRUD 로직 | `src/app/api/circle/route.ts` | `[ ]` |
| CIR-03 | `/api/circle/match` 다자간 궁합 분석 API | `src/app/api/circle/match/route.ts` | `[ ]` |
| CIR-04 | Cosmic Circle 대시보드 UI | `src/app/circle/page.tsx` | `[ ]` |

---

## 📊 Progress
- **Total**: 33 tasks
- **Done**: 24/33
- **In Progress**: 0/33

## ✅ Kaizen Gate
- `/launch` 완료 후 회고: _글로벌 타겟팅(Timezone, English default)으로 구조적 확장 고려 필수._
