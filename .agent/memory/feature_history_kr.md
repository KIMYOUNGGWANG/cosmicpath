# 📜 기능 개발 히스토리 (한국어)

오케스트레이터 3.0이 구현한 모든 기능, 버그 수정, 최적화 기록.

---

<!-- 새로운 기록은 이 줄 위에 추가됩니다 -->

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
