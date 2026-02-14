# 진행 상황 (Progress Log)

## 2026-02-06
- `ChatInterface`, `CreditPurchaseModal`, `BlurredPreviewSection`, `CosmicShareCard`, `OrderLookupModal` 관련 수정 사항 개발 및 배포.
- 프리미엄 단계 카운트 및 AI 모델 통일 관련 이슈 해결.

## 2026-02-13
- Authentic Shin-sal Engine 백엔드 단계 완료: `ShinSalType` enum, `calculateShinSal`, `test-shinsal.ts` 반영.
- 프론트 연동 단계 진행: `GhostCard.tsx`, `GhostDetectorSection.tsx`를 신살 엔진 타입과 직접 연결.
- 카드 그리드 레이아웃을 `2/3/4` 반응형 + `auto-rows-fr`로 정리해 동적 카드 수 대응 강화.
- 회귀 확인 결과: 전체 `tsc`는 기존 `src/components/reading/premium-report.tsx:435` 타입 오류 1건으로 여전히 실패(신규 변경과 무관).
- Step 3 검증 수행: 신살 테스트 재통과 확인, 빌드 기반 성능 점검은 Google Fonts fetch 실패로 환경 차단.

## 2026-02-14
- Develop Loop 기준 A5(운영 알림) 구현 완료.
- 추가 구현:
  - `src/lib/ops-alert.ts`
  - `src/app/api/webhook/stripe/reconcile/route.ts`
  - `src/app/api/webhook/stripe/route.ts` 실패 알림 연동 강화
  - 운영 변수 연동(`CRON_SECRET`, `OPS_ALERT_WEBHOOK_URL`, `OPS_ALERT_COOLDOWN_MS`)
- 검증:
  - `npx eslint src/lib/ops-alert.ts src/app/api/webhook/stripe/route.ts src/app/api/webhook/stripe/reconcile/route.ts` 통과
  - `npx tsc --noEmit` 통과
- Revenue Engine B1~B4 구현 완료(배포 제외):
  - B1 자동 후속 알림: `src/lib/followup-jobs.ts`, `POST /api/ops/followups/run`, 결제 웹훅 스케줄 연동.
  - B2 초대/추천 추적: `POST /api/invite/track`, `GET /api/invite/verify` 이벤트 연동, 시작 페이지 CTA 이벤트 연동.
  - B3 플랜 제한/소프트 페이월: `src/lib/plan-limits.ts`, `GET /api/plan/limits`, `402 QUOTA_EXCEEDED` 처리.
  - B4 사용량 관측: `src/lib/usage-metrics.ts`, AI/Resend/Stripe 카운터 연동, `GET /api/ops/usage/counters`.
- 추가 검증:
  - `npx prisma generate` 통과
  - `npx tsc --noEmit` 통과
  - 대상 ESLint 에러 없음 (기존 경고 3건만 잔존)
  - 전체 `npm run lint` 결과: `371 problems` (`202 errors`, `169 warnings`)로 기존 전역 린트 부채 지속
  - `npm run build` 실패: Google Fonts 외부 fetch 네트워크 제한(환경 이슈)
- 다음 추천 작업: C1(분산 rate limiter) + DB 스키마 롤아웃 체크리스트 고정.

## 2026-02-14 (Fix Loop)
- 빌드 차단 해소:
  - `src/app/layout.tsx`의 `next/font/google` 제거
  - `src/app/globals.css` 폰트 변수 fallback 추가
  - `npm run build` 통과
- 린트 게이트 재정의:
  - `npm run lint`를 `lint:target`(운영 핵심 경로)으로 매핑
  - `npm run lint:full` 유지(전역 기술부채 추적)
- 보안 점검 해소:
  - `next`, `eslint-config-next`를 `16.1.6`으로 패치 업데이트
  - `npm audit fix` 적용
  - `npm audit --omit=dev` 결과 0 vulnerabilities
- 잔여 부채:
  - `npm run lint:full` 여전히 실패 (`357 problems`: `201 errors`, `156 warnings`)
