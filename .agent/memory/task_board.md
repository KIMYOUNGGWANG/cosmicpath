# 🎯 CosmicPath v2.0 — Task Board (리서치 기반 전략 로드맵)

> 기준일: 2026-03-19 | 리서치: `RESEARCH/CosmicPath_Analysis_20260318`
> 목표: **3개월 내 MAU 3,000 / 월 수익 500만원 / k-factor 1.5**

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

## 🚀 [NEW] Sprint 0: Oracle Pivot Execution
*목표: 포지셔닝 변경(1:1 오라클)을 반영한 홈 개편 및 데일리 챗 전환 퍼널 구축*
- [ ] 홈 히어로 개편 (`src/components/landing/HeroSection.tsx`)
- [ ] 데일리 리딩 확인 후 오라클 챗 유도 CTA 연동 (`src/components/daily/DailySealedWidget.tsx`)
- [ ] 스레즈 기반 텍스트 공유 최적화 (`src/components/share/SharePanel.tsx`)

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

- [ ] **Sprint 5: Daily Routine (Fortune & Tarot)**
    - [x] 오늘의 운세(Daily Fortune) 위젯 및 봉인(Seal) 해제 애니메이션
    - [x] `GET /api/daily/tarot` 계약 스펙 구현
    - [x] Daily Tarot 카드/위젯 UI 추가
    - [x] 무료 `meaning` / 구독자 `advice` 분기 연결
    - [x] 자정 캐시 및 birthday seed 재현성 검증
    - [x] 프리미엄 사용자를 위한 상세 Advice(Premium Insight) 노출
- [ ] **Sprint 6: Sharing & Viral Loop**
    - [x] 쓰레드(Threads) / X 공유 전용 카드 UI
    - [x] 링크 복사 기반 친구 초대 UI
    - [x] `POST /api/referral/reward` 구현
    - [x] 친구 가입 완료 시 초대자 Credit +1 지급
    - [x] 공유 시 보상 크레딧(1 Credit) 지급 백엔드 로직
    - [x] 기존 invite / redeem / track 로직과 중복 방지 정합화
- [ ] **Sprint 7: Growth Optimization**
    - [x] 리서치 기반 K-Destiny 소셜 카드(성격/성향) OG 이미지 고도화
    - [x] 궁합 결과 OG 이미지 카드 고도화
    - [x] Kakao 공유 루프와 OG 카드 연결 검증
    - [x] MAU/매출 핵심 지표 트래킹 (PostHog/Mixpanel)
    - [x] share / invite / paid conversion KPI 대시보드 정의

## ⚪️ Phase C: 브랜드 강화 및 플랫폼 확장 (Scale)
- [ ] **Sprint 8: Local UX (Kakao)**
    - [ ] 카카오톡 로그인 QA 및 사용자 플로우 마감
    - [ ] 알림톡/친구톡 기반 리마인드 채널 확장
- [ ] **Sprint 9: Content & SEO**
    - [ ] 리서치 제안 '운세 활용법' 블로그 포스팅 10건 발행
    - [ ] 주요 검색 키워드(사주, 타로, 궁합) SEO 최적화
- [ ] **Sprint 10: Final Polish & Launch**
    - [ ] 전 채널 버그 픽스 및 성능 최적화
    - [ ] 정식 버전 v2.0 배포 및 마케팅 캠페인 시작

## 🟡 Revenue Experiments Backlog
*리서치 P0/P1 수익화 항목 별도 추적*

- [x] 주간 플랜 (`₩3,990/주`) 상품 구조 / Stripe price / 카피 설계
- [x] 페이월 애니메이션화
- [x] post-close 24시간 특가 배너
- [x] 연간 플랜 월 환산 프레이밍 강화
- [x] 사용자 이름 개인화 페이월
- [x] 세그먼트 기반 다이나믹 페이월
