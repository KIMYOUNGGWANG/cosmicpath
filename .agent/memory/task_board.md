# 🎯 CosmicPath v2.0 — Task Board (리서치 기반 전략 로드맵)

> 기준일: 2026-03-19 | 리서치: `RESEARCH/CosmicPath_Analysis_20260318`
> 목표: **3개월 내 MAU 3,000 / 월 수익 500만원 / k-factor 1.5**

## 🧊 Iceberg Model Block (2026-04-19)
*원칙: 결정은 맨 위에 선명하게(Verdict), 증거는 아래에 방대하게(Archive) 배치한다.*

- **Mission** — 50페이지 분량의 심층 백서(Archive)를 제공해 3~5만원의 프리미엄 지불 가치를 증명하면서도, 가장 중요한 "결정적 행동 지침(Verdict)"은 제일 위에 배치해 인지적 피로도를 낮춘다.

### Scope Now
- **Verdict-First UI 고정**: 기존 `/start` 결과 및 Premium Report 상단에 "단정적 행동 지침" 노출.
- **Deep Dive Archive 탭 신설**: Premium Report 하단에 아코디언/탭 형태의 방대한 백서(사주 뼈대, 운세 흐름 등) 공간 조성.
- **Phase 2~5 Prompt Hardening (Volumize)**: 기존 8단계 마이크로 프롬프트(Phase 2, 3, 4, 5)의 JSON 스키마에 인라인 가이드를 적용 (예: 500자 이상 작성 강제, 절대적 단정 표현 강제)하여 데이터 볼륨과 퀄리티를 폭증시킴.
- **Time-Delayed 오라클 Loading UX**: 프리미엄 리딩 분석 대기 중 "명반 대조 중...", "행성 정렬 분석 중..." 등이 순차적으로 바뀌는 고도화된 연출 UI 적용.

### Explicitly Out
- 10개 이상의 병렬 API 동시 호출 (Vercel Timeout 위험으로 인해 현재의 8단계 Phase 직렬/부분 병렬 파이프라인 유지).
- PDF 렌더링 및 다운로드 기능 (당장은 압도적인 웹 UI 스크롤에 집중).

### Implementation Steps
- [ ] **Step 1: Loading UX 고도화** — `Time-Delayed` 상태 메시지를 순환하는 프리미엄 로딩 컴포넌트(명반 대조 중 -> 점성술 교차 분석 중 등) 구현.
- [ ] **Step 2: Phase 2~3 프롬프트 하드닝** — 사주의 뼈대(Phase 2), 대운/세운 흐름(Phase 3) JSON 스키마에 분량 강제 및 환각 방지 적용.
- [ ] **Step 3: Phase 4~5 프롬프트 하드닝** — 직업/재물/연애 딥다이브 및 과거/미래 최종 결론 프롬프트에 동일 원칙 적용.
- [ ] **Step 4: Deep Dive Archive UI** — 폭증한 데이터를 담아낼 아코디언/탭 뷰 (모바일 최적화) 설계 반영.

## 🧠 Prompt & Advisor Quality Block (2026-04-16 Night)
*원칙: 외부 계약은 유지하고, 시스템 프롬프트와 상담가 레이어를 더 짧고 더 선명하며 더 전문적으로 만든다.*
- [x] Step 1: Core Prompt Contract Unification
- [x] Step 2: Advisor Decision Contract
- [x] Step 3: Evidence Ordering
- [x] Step 4: Prompt Regression & Golden Samples

## 🛠 Refactor Block (2026-04-16)
*원칙: 제품 계약과 리딩 품질은 유지하고, 내부 구조와 프롬프트 경계를 다시 세운다.*
- [x] Step 1: Start Flow Boundary Split
- [x] Step 2: Reading Route Service Split
- [x] Step 3: Prompt Stack Refactor
- [x] Step 4: Premium Report Decomposition
- [x] Step 5: Engine & Runtime Stabilization
- [x] Step 6: Regression Harness

## 🧭 Focus Reset (2026-04-04)
- [x] Keep 1: Oracle Reading Core
- [x] Keep 2: Daily Retention
- [x] Keep 3: Specialist Advisors
- [x] Keep 4: KPI Dashboard
- [x] Freeze 1: Segmented Paywall Expansion
- [x] Freeze 2: Side Product Expansion
- [x] Freeze 3: Heavy Lifecycle Automation

## 🚧 Next Planning Block (2026-04-04)
- [x] Step A: Paywall Simplification
- [x] Step B: Specialist Advisors v1
- [x] Step C: Evidence-First Prompting
- [x] Step D: Core KPI Dashboard Trim
- [x] Step E: Side Surface De-emphasis

## 🎯 Product Direction Lock (2026-04-04 PM)
- [x] Lock 1: Core Promise
- [x] Lock 2: Primary JTBD
- [x] Lock 3: Domain Framing
- [x] Lock 4: ICP Narrowing
- [x] Lock 5: Paid Value Framing
- [x] Lock 6: Growth Order

## 🚦 Next Execution Block (2026-04-04 PM)
- [x] Step F: Decision Timing Messaging
- [x] Step G: Intent-Led First Reading
- [x] Step H: Free Result Aha Moment
- [x] Step I: Question-Linked Daily Loop
- [x] Step J: Trust & Activation Instrumentation

## 🧱 Post-Ship Stability Block (2026-04-04 Night)
- [x] Step K: Paywall Price Reliability
- [x] Step L: Review Integrity at DB Layer
- [x] Step M: Review Contract & Moderation States
- [x] Step N: Growth Summary Performance Guard
- [x] Step O: Regression Verification
- [x] Step O.1: Start Flow Session Persistence Hardening
- [x] Step O.2: Payment Contract Sync

## 🌍 Global Validation Block (2026-04-05)
- [x] Step P: English Positioning Lock
- [x] Step Q: Trust & Policy Parity
- [x] Step R: Overseas-Friendly Entry Paths
- [x] Step S: Language-Split Funnel Instrumentation
- [x] Step T: Narrow English Acquisition Readiness

## 🔥 Rebased Execution Queue (2026-03-20)
- [x] Now 1: Daily Tarot 완성
- [x] Now 2: Referral Reward + Share Credit 정합화
- [x] Now 3: Viral OG 카드 고도화
- [x] Now 4: Growth Metrics 계측
- [x] Next 5: Monetization Experiments

## 🚀 [NEW] Sprint 0.5: Saju Engine Core Integration
- [x] `manseryeok` 패키지 연동 완료
- [x] 진태양시 보정 로직(`true-solar-time.ts`) 포팅 완료
- [x] Precision Guardrail Hotfix (2026-04-04) 완료

## 🟢 Phase A: 수익화 기반 및 리텐션 엔진
- [x] Sprint 1: Premium Paywall (Lock/Blur)
- [x] Sprint 2: Subscription System (Stripe)
- [x] Sprint 3: Subscription Management
- [x] Sprint 4: Drip Email (Retention)

## 🔴 Phase B: 데일리 루틴 및 바이럴 루프
- [x] Sprint 5: Daily Routine (Fortune & Tarot)
- [x] Sprint 6: Sharing & Viral Loop
- [x] Sprint 8: Precision & Personality (v3.0)
- [x] Sprint 8.1: Oracle Trust Hotfix
- [x] Sprint 8.5: Specialist Oracle Advisors (v3.1)
