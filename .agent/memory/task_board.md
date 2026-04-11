# 🎯 CosmicPath v2.0 — Task Board (리서치 기반 전략 로드맵)

> 기준일: 2026-03-19 | 리서치: `RESEARCH/CosmicPath_Analysis_20260318`
> 목표: **3개월 내 MAU 3,000 / 월 수익 500만원 / k-factor 1.5**

## 🧭 Focus Reset (2026-04-04)
*원칙: 오라클 코어 루프를 강화하고, 운영 복잡도는 줄인다.*

- [x] **Keep 1: Oracle Reading Core** — `/start` 무료 리딩 → 결과 → follow-up chat → 결제 루프를 최우선 제품 경험으로 유지
- [x] **Keep 2: Daily Retention** — `/daily` 데일리 운세/타로를 리텐션 진입점으로 유지
- [x] **Keep 3: Specialist Advisors** — `Sprint 8.5` 전문 상담가 체계는 핵심 차별화 요소로 계속 투자
- [x] **Keep 4: KPI Dashboard** — `/ops/growth`는 운영용 최소 지표 대시보드로 유지
- [x] **Freeze 1: Segmented Paywall Expansion** — 세그먼트별 카피/플랜 순서/리턴 오퍼 실험의 신규 확장은 중단하고, 결제 표면은 단순화
- [x] **Freeze 2: Side Product Expansion** — `/match`, `/viral/career-test`, 블로그 확장은 신규 투자 보류
- [x] **Freeze 3: Heavy Lifecycle Automation** — 신규 다단계 드립/복잡한 실험 퍼널 확장은 중단하고, 현재 D+2/D+5/D+7 리텐션 레이어만 유지

## 🚧 Next Planning Block (2026-04-04)
*현 시점 MVP 재정렬 기준 5단계*

- [x] **Step A: Paywall Simplification** — 월간/연간 기본 구조로 정리하고, 주간/세그먼트 실험은 legacy 또는 숨김 처리
- [x] **Step B: Specialist Advisors v1** — 전문 상담가 카탈로그, 질문 의도 추론, 자동 추천 규칙 설계
- [x] **Step C: Evidence-First Prompting** — `saju-engine.ts` 기반 근거 요약기와 3층 시스템 프롬프트(안전/근거 + 전문 프레임워크 + 상담가 어조) 정리
- [x] **Step D: Core KPI Dashboard Trim** — install, daily_active, share, paid_conversion 중심으로 운영 지표를 축소 정리
- [x] **Step E: Side Surface De-emphasis** — `/match`, `/viral`, 블로그, 복잡한 실험 UI는 비노출/저우선순위 처리

## 🎯 Product Direction Lock (2026-04-04 PM)
*소비자 관점에서 지금 가장 강한 문제 정의를 기준으로 방향 고정*

- [x] **Lock 1: Core Promise** — CosmicPath를 "사주+타로+점성술 AI"보다 "다음 행동과 타이밍을 읽어주는 개인 오라클"로 설명한다
- [x] **Lock 2: Primary JTBD** — 사용자의 핵심 문제를 `지금 움직여도 되는지 / 더 기다려야 하는지 / 무엇을 먼저 선택해야 하는지` 같은 결정·타이밍 질문으로 둔다
- [x] **Lock 3: Domain Framing** — 관계는 강한 use case로 유지하되, 제품 전체는 관계·커리어·재물·일상 흐름을 다루는 multi-domain oracle로 포지셔닝한다
- [x] **Lock 4: ICP Narrowing** — 한국어권 20~35세 성인 중 중요한 선택을 앞두고 불확실성을 줄이고 싶은 사용자를 primary segment로 둔다
- [x] **Lock 5: Paid Value Framing** — 유료는 더 많은 기능이 아니라 더 선명한 근거, 타이밍, 행동 가이드 깊이로 판매한다
- [x] **Lock 6: Growth Order** — 공유/바이럴보다 activation, trust, retention 최적화를 먼저 한다

## 🚦 Next Execution Block (2026-04-04 PM)
*새 기능 확장보다 코어 루프를 더 날카롭게 만드는 실행 블록*

- [x] **Step F: Decision Timing Messaging** — 랜딩, `/start`, 결과, paywall 카피를 `결정과 타이밍 오라클` 톤으로 통일하고 관계/커리어/재물 사례를 함께 노출
- [x] **Step G: Intent-Led First Reading** — `/start`에서 사용자가 먼저 고민 영역을 고르고 질문 중심으로 진입하게 해 초기 입력 마찰을 줄임
- [x] **Step H: Free Result Aha Moment** — 무료 결과에 `행동 결론 1개 + 근거 요약 1개 + 다음 질문 제안 1개`를 영역별로 보장하는 구조 설계
- [x] **Step I: Question-Linked Daily Loop** — `/daily`를 독립 운세가 아니라 최근 오라클 질문 영역과 연결된 리텐션 루프로 재설계
- [x] **Step J: Trust & Activation Instrumentation** — `first_result_view`, `followup_start`, `daily_return_after_reading` 같은 코어 activation 이벤트를 운영 지표에 추가

## 🧱 Post-Ship Stability Block (2026-04-04 Night)
*원칙: ship 직후에는 신규 surface 확장보다 전환 신뢰, 리뷰 무결성, 운영 성능을 먼저 고정한다.*

- [x] **Step K: Paywall Price Reliability** — `PaymentModal`과 관련 결제 surface에서 Stripe price fetch 실패 시 `...`가 남지 않도록 fallback price, loading skeleton, graceful copy를 고정
- [x] **Step L: Review Integrity at DB Layer** — `Review.readingId` 단위 1회 제출/1회 보상을 DB 제약까지 내려서 중복 리뷰/중복 크레딧 가능성을 제거
- [x] **Step M: Review Contract & Moderation States** — `/api/review`, `/api/review/admin`의 accessKey/owner 규칙, 409 conflict, 승인 상태를 `docs/api-spec.md`에 승격하고 운영 화면과 같은 언어로 맞춤
- [x] **Step N: Growth Summary Performance Guard** — `GrowthEvent.createdAt` 중심 인덱스와 요약 query shape를 정리해 `/api/growth/summary`와 `/ops/growth` 응답 시간을 이벤트 증가 후에도 안정화
- [x] **Step O: Regression Verification** — paywall price fallback, duplicate review, review accessKey ownership, growth summary 응답 shape에 대한 테스트/검증 경로를 추가
- [x] **Step O.1: Start Flow Session Persistence Hardening** — `/start`가 URL sync/remount 중에도 `tarot/reveal/result` 단계를 잃지 않도록 현재 단계 저장 순서를 실제 화면 기준으로 고정
- [x] **Step O.2: Payment Contract Sync** — live `POST|GET /api/payment` checkout/verification 흐름을 `docs/api-spec.md`에 승격하고 stale payment verification labels를 정리

## 🌍 Global Validation Block (2026-04-05)
*원칙: 한국 PMF를 흔들지 않고, 영어권 니치 수요를 작은 범위에서 검증한다.*

- Current status:
  - 제품 엔진, Stripe USD 결제, `ko/en` 리딩 경로는 이미 존재한다.
  - 반면 trust/legal copy, 공유 우선순위, 획득 메시지는 아직 한국 중심이다.
  - 따라서 이번 블록은 `글로벌 확장`이 아니라 `영어권 실험 레이어 추가`를 목표로 한다.
- [x] **Step P: English Positioning Lock** — 랜딩, `/start`, paywall, share surface의 영문 메인 카피를 `Korean Saju for decision timing` 축으로 고정한다
- [x] **Step Q: Trust & Policy Parity** — 영문 약관/환불/면책/결제 설명을 추가해 영어권 사용자가 구매와 결과 활용 범위를 이해할 수 있게 한다
- [x] **Step R: Overseas-Friendly Entry Paths** — 영어권 기준 로그인 기본 경로를 Google 중심으로 정리하고, 공유 surface는 `Copy Link / Threads / TikTok` 우선으로 재정렬한다
- [x] **Step S: Language-Split Funnel Instrumentation** — `landing_view -> first_result_view -> paywall_open -> paid_conversion` 퍼널을 `language/source/path/landingVariant` 기준으로 분리 계측한다
- [x] **Step T: Narrow English Acquisition Readiness** — `What is Korean Saju`, `Saju vs BaZi`, `Decision timing reading` 같은 영어 진입 페이지와 온보딩 설명 레이어를 준비한다

---

## 🔥 Rebased Execution Queue (2026-03-20)
*기준: `07_implementation_gap_audit_20260320.md` 감사 결과 반영*

- [x] **Now 1: Daily Tarot 완성**
    - [x] `GET /api/daily/tarot` 엔드포인트 구현
    - [x] `/daily` 또는 관련 위젯에 Daily Tarot UI 연결
    - [x] 무료 해석 / 구독자 advice 노출 규칙 반영
    - [x] 자정 기준 캐시 및 시드 고정 검증
- [x] **Now 2: Referral Reward + Share Credit 정합화**
    - [x] `POST /api/referral/reward` 구현
    - [x] 친구 가입 완료 시 초대자 Credit +1 지급
    - [x] 기존 invite/redeem 흐름과 중복 보상 방지 로직 통합
    - [x] 공유 보상 Credit 정책과 ChatSession 반영 방식 확정
- [x] **Now 3: Viral OG 카드 고도화**
    - [x] 궁합 결과 OG 카드 생성 고도화
    - [x] K-Destiny 소셜 카드 OG 시안/문구/CTA 개선
    - [x] Kakao 공유 경로와 OG 카드 연결 검증
- [x] **Now 4: Growth Metrics 계측**
    - [x] PostHog 또는 Mixpanel 도입
    - [x] `share`, `invite`, `install`, `paid conversion`, `retention` 이벤트 정의
    - [x] KPI 대시보드 초안 구성
- [x] **Next 5: Monetization Experiments**
    - [x] 주간 플랜 도입 검토 및 가격/카피 반영
    - [x] 페이월 애니메이션화
    - [x] post-close 24시간 특가 배너
    - [x] 연간 플랜 월 환산 프레이밍 / 이름 개인화 페이월 실험

---


## 🚀 [NEW] Sprint 0.5: Saju Engine Core Integration (Dr.Saju Benchmarking)
*목표: 환각 방지 및 신뢰도 향상을 위한 로컬 만세력/진태양시 계산 엔진 도입*
- [x] `manseryeok` 패키지 설치 및 유틸리티 설정
- [x] 출생지 경도 기반 진태양시 보정 로직(`true-solar-time.ts`) 포팅
- [x] 사주 원국(4주 8자), 십신, 12운성 계산 래퍼(`saju-engine.ts`) 구현
- [x] 기존 오라클/데일리 챗봇 프롬프트에 계산된 사주 데이터 주입 연동
- [x] **Precision Guardrail Hotfix (2026-04-04)** — 이미 진태양시 보정된 시각이 `calculateSaju`에서 다시 경도 보정되지 않도록 차트 경로를 분리하고, calibration UI에 입력 시각 → 보정 시각 → 최종 시주를 노출

---

## 🟢 Phase A: 수익화 기반 및 리텐션 엔진 (Revenue Engine) [진행중]
*목표: 유료 전환 Funnel 구축 및 자동 리마인드 시스템 완료*

- [x] **Sprint 1: Premium Paywall (Lock/Blur)**
    - [x] SharedPageClient 내 Section 3-5 요약본 노출 및 상세 잠금 로직
    - [x] 결제 유도 모달(SubscriptionModal) UI 구현
- [x] **Sprint 2: Subscription System (Stripe)**
    - [x] $9.99(월) / $49.99(연) 구독 플랜 설정
    - [x] Stripe Checkout 세션 생성 및 결과 반영 (Webhook)
    - [x] /billing 페이지 현황 노출 구현
- [x] **Sprint 3: Subscription Management**
    - [x] /billing 페이지 내 구독 취소(Cancel) 버튼 및 API 연동
    - [x] 플랜 변경(Upgrade/Downgrade) 로직 검토
    - [x] 직접 Checkout 기반 플랜 변경은 중복 구독 위험으로 보류, Billing Portal 또는 전용 update API 필요
- [x] **Sprint 4: Drip Email (Retention)**
    - [x] D+2: 결제 미완료 시 20% 할인 프로모션 코드 발송
    - [x] D+5: Cosmic Window 기반 개인화 리마인드 발송
    - [x] D+7: 데이터 보관 만료 안내 및 최종 전환 유도

## 🔴 Phase B: 데일리 루틴 및 바이럴 루프 (Growth & Daily)
*목표: 매일 접속하는 이유를 만들고 공유를 통한 무료 유입 가속화*

- [x] **Sprint 5: Daily Routine (Fortune & Tarot)**
    - [x] 오늘의 운세(Daily Fortune) 위젯 및 봉인(Seal) 해제 애니메이션
    - [x] `GET /api/daily/tarot` 계약 스펙 구현
    - [x] Daily Tarot 카드/위젯 UI 추가
    - [x] 무료 `meaning` / 구독자 `advice` 분기 연결
    - [x] 자정 캐시 및 birthday seed 재현성 검증
    - [x] 프리미엄 사용자를 위한 상세 Advice(Premium Insight) 노출
- [x] **Sprint 6: Sharing & Viral Loop**
    - [x] 쓰레드(Threads) / X 공유 전용 카드 UI
    - [x] 링크 복사 기반 친구 초대 UI
    - [x] `POST /api/referral/reward` 구현
    - [x] 친구 가입 완료 시 초대자 Credit +1 지급
    - [x] 공유 시 보상 크레딧(1 Credit) 지급 백엔드 로직
    - [x] 기존 invite / redeem / track 로직과 중복 방지 정합화
- [x] **Sprint 8: Precision & Personality (v3.0) — High-Level Plan**
    - [x] **Step 1: Engine Calibration** — `saju-engine.ts` 내 진태양시 보정 고도화 및 자미/점성 요약 추출기(`getTriOracleSummary`) 설계
    - [x] **Step 2: Persona Strategy** — 8종 캐릭터(Orion, Selene 등) 페르소나 정의 및 `prompt-builder.ts` 주입 로직 설계
    - [x] **Step 3: Data Enrichment** — `/api/reading` 결과에 `precisionMetadata` 및 `oracleCouncil` 데이터 주입 (Async 대응)
    - [x] **Step 4: UI/UX Lifecycle** — 결과 로딩 시 '진태양시 보정' 애니메이션 컴포넌트 및 캐릭터 선택 UI 연동
- [x] **Sprint 8.1: Oracle Trust Hotfix**
    - [x] `/start` 무료 리딩 결과 새로고침 시 restore 조건 완화 및 결과 화면 복구
    - [x] 출생지 미입력 상태에서는 '진태양시 보정' 패널을 축소/조건부 노출하고 카피를 정직하게 다운그레이드
    - [x] 현재 8종 캐릭터 선택 UI를 '자동 추천 + 상세 선택' 구조로 축소해 진입 장벽 완화
    - [x] `/start` reset query 재처리로 활성 리딩이 intake form으로 되돌아가지 않도록 live URL 기준 복원 로직으로 하드닝
- [x] **Sprint 8.5: Specialist Oracle Advisors (v3.1)**
    - [x] 톤 중심 `oracle-personas.ts`를 분야 특화 상담가 카탈로그로 재설계 (`general`, `compatibility`, `reunion`, `wealth`, `timing`, `career`, `business`)
    - [x] 질문/컨텍스트 기반 `questionIntent` 추론 및 상담가 자동 매칭 규칙 설계
    - [x] `prompt-builder.ts` / `phase-prompts.ts`에 분야별 분석 프레임워크, 한자 독음+뜻 풀이, free/paid depth 차등 규칙 반영
    - [x] `saju-engine.ts` 기반 분야별 evidence summary builder 추가 (사주/자미/점성 교차 검증 우선순위 포함)
    - [x] `/api/reading` 및 follow-up metadata에 `advisorProfile`, `questionIntent`, `selectionMode(auto|manual)` 저장

## 🟡 Revenue Experiments Backlog
*리서치 P0/P1 수익화 항목 별도 추적*

- [x] 주간 플랜 (`₩3,990/주`) 상품 구조 / Stripe price / 카피 설계
- [x] 페이월 애니메이션화
- [x] post-close 24시간 특가 배너
- [x] 연간 플랜 월 환산 프레이밍 강화
- [x] 사용자 이름 개인화 페이월
- [x] 세그먼트 기반 다이나믹 페이월
