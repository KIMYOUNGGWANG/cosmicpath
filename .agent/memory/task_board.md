# 🗂️ CosmicPath v2.0 — 통합 태스크 보드

**Sprint**: 2026-03 | **목표**: 프리미엄 내실 강화 + 바이럴 루프 활성화 + 수익화 안정성
**상태**: `/plan` (기획 정교화 완료) → `/develop` 대기 중

---

## 🏗️ Phase 1: 내실 다지기 (Refinement & Stability)
- [x] 초기 코드베이스 및 API 아키텍처 감사 (Audit)
- [/] **UI/UX 폴리싱 (Design DNA)**
    - [/] 모든 모달 및 카드에 Glassmorphism (`backdrop-blur-md`) 적용
    - [x] 섹션 전환 및 버튼 호버 마이크로 애니메이션 추가
- [/] **코드베이스 클린업**
    - [x] 주석 처리된 토스 페이먼츠(`TossPaymentWidget`) 제거 및 정리
    - [/] 구형 스키마(`Legacy support`) 조작 정리 및 최적화
- [/] **결제 웹훅 안정화**
    - [x] Stripe 웹훅 예외 처리 강화 및 결제 실패 알림(OpsAlert) 연동

---

## 📈 Phase 2: 바이럴 성장 가속화 (Viral Growth)
- [x] **동적 OG 이미지 시스템 구축**
    - [x] `/api/og/reading/[id]` 엔드포인트를 통한 개인화된 운세 결과 이미지 생성
- [x] **바이럴 공유 페이지 (`/share/[id]`) 고도화**
    - [x] 시각적으로 매력적인 공유 전용 UI 레이아웃 구현
- [x] **참여형 리워드 로직 구현**
    - [x] 리포트 공유 완료 시 +1 채팅 크레딧 즉시 부여 로직 연동
    - [x] 인플루언서/추천인 연동 할인 코드(`referralCode`) 자동 적용

---

## 💰 Phase 3: 운영 자동화 및 확장 (Ops & Scaling)
- [ ] **이메일 후속 조치 자동화 (`FollowUpJob`)**
    - [ ] 결제 48시간 후 후속 질문 유도 이메일 발송 로직 활성화
- [ ] **운영 대시보드 (Admin) 기초 구축**
    - [ ] `UsageCounterDaily` 기반 API 비용 및 트래픽 시각화
    - [ ] 시스템 이상 징후 발생 시 관리자 알림 연동
- [ ] **Cosmic Circle (소셜 관계망 궁합) — 잔여 작업**
    - [ ] 다자간 궁합 분석 API (`/api/circle/match`) 완성 및 UI 연동

---

## ✅ 진행률 (Progress)
- **전체 태스크**: 20개 (새로 정의된 우선순위 기준)
- **완료**: 6/20
- **상태**: Phase 1 진행 중, Phase 2 핵심 바이럴 루프 구현 완료

---

## 💡 Kaizen & Learnings
- *Learning*: 현재 텍스트 위주의 마케팅 채널이 병목임. 비주얼 카드 및 참여형 베이트 도입이 즉각적인 해답.
- *Strategy*: 무분별한 기능 추가보다는 기존 기능의 '프리미엄화'와 '바이럴 장치' 장착에 집중.
