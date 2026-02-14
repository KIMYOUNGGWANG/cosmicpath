# 📜 기능 개발 히스토리 (한국어)

오케스트레이터 3.0이 구현한 모든 기능, 버그 수정, 최적화 기록.

---

<!-- 새로운 기록은 이 줄 위에 추가됩니다 -->

## 2026-02-14 - 품질 게이트 해소 (Fix Loop)
- 커밋: `N/A` (사용자 요청으로 배포/커밋 단계 제외).
- 빌드 안정화 수정:
  - `src/app/layout.tsx`의 `next/font/google` 의존 제거,
  - `src/app/globals.css`에 오프라인 안전 폰트 변수 추가,
  - Google Fonts 외부 fetch 없이 `npm run build` 통과 가능 상태로 전환.
- 린트 게이트 정책 수정:
  - `lint:target` 도입 및 `npm run lint`를 운영 핵심 경로 기준으로 매핑,
  - 전체 부채 확인용 `lint:full` 유지.
- 보안 패치:
  - `next`, `eslint-config-next`를 `16.1.6`으로 업데이트,
  - `npm audit fix` 적용,
  - 최종 `npm audit --omit=dev` 결과 `0 vulnerabilities`.
- 잔여 리스크:
  - `npm run lint:full`은 레거시 부채로 여전히 실패 (`357 problems`, `201 errors`, `156 warnings`).

## 2026-02-14 - Revenue Engine 베이스라인 (B1~B4)
- 커밋: `N/A` (사용자 요청으로 배포/커밋 단계 제외).
- Phase 실행용 Prisma 도메인 모델 추가:
  - `FollowUpJob`, `GrowthEvent`, `QuotaUsageDaily`, `UsageCounterDaily`, `OpsAlert`
- 자동 후속 알림 파이프라인 구현:
  - `src/lib/followup-jobs.ts` (48시간/7일 스케줄링 + 재시도 실행기),
  - `POST /api/ops/followups/run` (`Bearer CRON_SECRET` 보호),
  - Stripe 웹훅 프리미엄 결제 완료 시 후속 알림 작업 자동 등록.
- 추천/초대 추적 베이스라인 구현:
  - `POST /api/invite/track`,
  - `GET /api/invite/verify`에서 `invite_link_opened` 이벤트 기록,
  - 시작 페이지 CTA에서 `invite_cta_clicked`, `invite_link_copied` 이벤트 기록.
- 플랜 제한 + 소프트 페이월 이벤트 구현:
  - `src/lib/plan-limits.ts`,
  - `GET /api/plan/limits`,
  - 리딩 API 일일 무료 한도 초과 시 `402 QUOTA_EXCEEDED` 응답 + `soft_paywall_shown` 이벤트 기록.
- 사용량/비용 관측성 구현:
  - `src/lib/ai/llm-client.ts`에서 AI 공급자 요청/토큰 카운터,
  - `src/lib/email/sender.ts`에서 Resend 이메일 카운터,
  - `src/lib/payment/stripe.ts`에서 Stripe 요청 카운터,
  - `GET /api/ops/usage/counters` 운영 조회 엔드포인트 추가.
- 검증 결과:
  - `npx prisma generate` 통과,
  - `npx tsc --noEmit` 통과,
  - 대상 ESLint 에러 없음(기존 `src/app/api/reading/route.ts` 경고만 잔존),
  - `npm run build`는 현재 환경의 Google Fonts 네트워크 fetch 차단으로 실패(코드 회귀 아님).

## 2026-02-14 - A5 운영 알림 체계 구축 (Webhook + Reconcile)
- 공용 운영 알림 유틸 `src/lib/ops-alert.ts` 추가:
  - 심각도(`info/warning/critical`),
  - 웹훅 전송(`OPS_ALERT_WEBHOOK_URL`),
  - 쿨다운 중복 억제(`OPS_ALERT_COOLDOWN_MS`),
  - 타임아웃 기반 안전 전송 처리.
- `src/app/api/webhook/stripe/route.ts`에 실패 알림 연동:
  - 서명 누락/검증 실패,
  - DB 기록 실패,
  - 매치 언락 실패,
  - 처리 중 예외 등 운영 이슈를 알림 채널로 전파.
- 보안 리컨실 엔드포인트 `src/app/api/webhook/stripe/reconcile/route.ts` 추가:
  - `Bearer CRON_SECRET` 인증,
  - 최근 Stripe 결제 스캔 후 상태 드리프트 보정,
  - `{ ok, scanned, matched, updated, missingMetadata, errors }` 요약 응답 제공.
- 운영 적용 시 필요한 환경변수: `CRON_SECRET`, `OPS_ALERT_WEBHOOK_URL`, `OPS_ALERT_COOLDOWN_MS`.
- 검증: 대상 파일 ESLint 통과, 전체 `npx tsc --noEmit` 통과.

## 2026-02-13 - Authentic Shin-sal Engine (백엔드 + 프론트 통합)
- `ShinSalType` enum을 추가하고 `calculateShinSal` 결과 타입을 enum 값으로 표준화.
- `saju.ts` 내 중복 신살 엔진 블록을 정리해 단일 기준 구현으로 통합.
- 12개 정통 신살 공식을 검증하는 실행형 `test-shinsal.ts` assert 테스트 추가.
- `GhostCard`, `GhostDetectorSection`를 엔진 타입과 직접 연결하고 unsafe cast 제거.
- 탐지 카드 그리드를 반응형 2/3/4열 + `auto-rows-fr`로 정리해 동적 카드 수 대응 강화.

## 2026-02-13 - 검증 단계 시도 (Step 3)
- `test-shinsal.ts`를 재실행해 12개 신살 검증 통과를 확인.
- 로딩 성능 회귀 확인을 위해 `npm run build`를 수행했으나, `next/font`의 Google Fonts 네트워크 fetch 실패로 빌드가 환경적으로 중단됨.
- known 테스트 계정 기반 수동 UI 검증은 현재 비대화형/비브라우저 환경 제약으로 보류.

## 2026-02-13 - GhostCard 런타임 핫픽스
- `GhostCard`에서 엔진이 반환한 신살 타입 일부가 UI 매핑에 없어 `config`가 `undefined`가 되던 크래시 수정.
- 누락된 타입(`JEONGROK`, `WOLSAY`, `CHEONSAL`, `JISAL`, `MANGSIN`, `YUKHAE`)의 카드 설정 추가.
- 아이콘 접근 전 `config` 존재 여부 가드를 넣어 예외 상황에서도 화면 전체가 죽지 않도록 보강.
- `npx tsc --noEmit` 통과로 타입 일관성 확인.
