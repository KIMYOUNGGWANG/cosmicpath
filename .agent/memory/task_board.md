# 🎯 CosmicPath v2.0 — Task Board (리서치 기반 전략 로드맵)

> 기준일: 2026-03-19 | 리서치: `RESEARCH/CosmicPath_Analysis_20260318`
> 목표: **3개월 내 MAU 3,000 / 월 수익 500만원 / k-factor 1.5**

## 🛠 Refactor Block (2026-04-16)
*원칙: 제품 계약과 리딩 품질은 유지하고, 내부 구조와 프롬프트 경계를 다시 세운다.*

- **Mission** — `/start` 무료 리딩 → 결과 → follow-up → 결제 루프의 신뢰도와 속도를 유지한 채, 리딩 생성 파이프라인을 분리 가능한 구조로 재구성한다.

### Scope Now
- `/start`를 `입력 / 복구 / 결과 / 결제 / 공유 / follow-up 진입` 책임으로 분리한다.
- `/api/reading`을 `요청 검증 / 리딩 런타임 구성 / free generation / premium phase orchestration / 저장 및 resume` 경계로 분리한다.
- `premium-report`를 section 컴포넌트와 render schema 기반 구조로 나눈다.
- 리포트 생성 프롬프트를 `공통 시스템 규칙층 + free/premium 모드층 + phase 전용 지시층`으로 재정렬한다.
- 계산 엔진 결과와 metadata를 한 번 만든 뒤 재사용하는 `reading runtime` source-of-truth를 고정한다.

### Scope Later
- `src/lib/engines/saju.ts`를 계산기, formatter, glossary, derived insight 레이어로 추가 분리한다.
- follow-up chat과 `/daily`가 공유하는 oracle context builder를 별도 모듈로 승격한다.
- LLM provider/model budget 정책을 통합된 orchestration 레이어로 정리한다.

### Explicitly Out
- 새 consumer-facing 기능 추가
- `/api/reading*`, `/api/payment*`, `/api/growth*`의 응답 shape 변경
- paywall merchandising 실험 재확장
- `/match`, `/viral`, 블로그 surface 재투자

### Implementation Steps
- [x] **Step 1: Start Flow Boundary Split** — `src/app/start/page.tsx`에서 상태 저장, resume/reset, payment/share/review modal, follow-up 진입 로직을 훅/섹션 단위로 분리한다.
- [x] **Step 2: Reading Route Service Split** — `src/app/api/reading/route.ts`를 orchestration 중심으로 남기고, runtime assembly / free reading / premium phase / persistence helpers를 서비스로 분리한다.
- [x] **Step 3: Prompt Stack Refactor** — `prompt-builder.ts`와 `phase-prompts.ts`의 중복 규칙을 줄이고, 공통 시스템 프롬프트와 phase overlay 조립 구조를 만든다.
- [x] **Step 4: Premium Report Decomposition** — `premium-report.tsx`를 section registry, section components, shared cards/utilities로 분리해 결과 렌더링을 데이터 중심으로 바꾼다.
- [x] **Step 5: Engine & Runtime Stabilization** — `saju-engine.ts`/`engines/saju.ts`의 derived formatter와 evidence summary builder를 정리하고, premium resume 시 재계산을 최소화한다.
- [x] **Step 6: Regression Harness** — free outline, premium phase resume, payment verification, restore/accessKey, follow-up continuity를 중심으로 빌드/테스트/수동 smoke 경로를 고정한다.

### Progress Note
- 2026-04-16 PM: Step 1 started. `/start`의 storage/url helper, resume hook, payment/share/review modal state를 별도 모듈로 추출했고 `npm run build` 통과. 입력/result section 분해와 follow-up entry 경계 정리는 계속 진행한다.
- 2026-04-16 PM (2): `/start` 결과 렌더를 `start-result-stage.tsx`로 추출해 CTA, premium report, chat entry, error state를 page 바깥으로 이동했고 `npm run build` 재통과. 다음은 input/tarot/reveal section 분리 또는 follow-up/payment CTA handler 추가 정리다.
- 2026-04-16 PM (3): `/start`의 input/tarot/reveal stage를 각각 `start-input-stage.tsx`, `start-tarot-stage.tsx`, `start-reveal-stage.tsx`로 분리했고 `page.tsx`를 orchestration 중심으로 축소했다. `npm run build` 재통과 기준으로 Step 1을 완료 처리하고, 다음 사이클은 `/api/reading` service split으로 넘어간다.
- 2026-04-16 PM (4): Step 2 started. `/api/reading`의 runtime assembly를 `reading-runtime-service.ts`, free/premium generation orchestration을 `reading-generation-service.ts`로 분리해 `route.ts`를 access/validation/orchestration 중심으로 축소했다. `npm run build` 통과 기준으로 generation 경계는 정리됐고, 다음은 premium access/persistence helper까지 route 바깥으로 빼는 작업이다.
- 2026-04-16 PM (5): `/api/reading`의 invite 처리와 premium access/payment sync를 `reading-request-service.ts`로 분리했고, `route.ts`는 quota/auth/response orchestration 위주로 정리했다. `route.ts`는 `222`줄까지 줄었고 `npm run build` 재통과 기준으로 Step 2를 완료 처리한다.
- 2026-04-16 PM (6): Step 3 started. `prompt-shared-rules.ts`를 추가해 free/premium 공통 규칙층(깊이 규칙, 한자 규칙, persona/evidence prelude)을 모듈화했고, `prompt-builder.ts`와 `phase-prompts.ts`가 이 shared prelude를 사용하도록 연결했다. `npm run build` 통과 기준으로 중복 규칙 정리는 시작됐고, 다음은 schema/validation prompt와 chat prompt 쪽의 중복 문구를 더 줄이는 작업이다.
- 2026-04-16 PM (7): `prompt-shared-rules.ts`에 structured JSON schema, validation rules, free summary plain-text validation, chat response protocol helper를 추가해 `prompt-builder.ts`의 큰 문자열 블록을 공통 조립 구조로 이동했다. `phase-prompts.ts`는 shared prelude를 유지하고, `npm run build` 재통과 기준으로 Step 3를 완료 처리한다.
- 2026-04-16 PM (8): Step 4 started. `premium-report.tsx`에서 순수 프레젠테이션 섹션(`HeaderSection`, `FreeFocusSection`, `PremiumSectionInterruptionCard`, `ContentCard`)만 `premium-report-sections.tsx`로 분리했고, 상태/계산 로직은 그대로 유지했다. `npm run build` 재통과 기준으로 이번 변화는 동작 변경 없는 저위험 분리이며, 다음은 나머지 섹션을 같은 방식으로 점진 분해한다.
- 2026-04-16 PM (9): `premium-report-sections.tsx`에 상태 없는 순수 섹션(`ActionPlanSection`, `NumerologySection`, `PastLifeSection`)을 추가로 이동했고, `premium-report.tsx`는 import 조립만 하도록 정리했다. `npm run build` 재통과 기준으로 Step 4는 안전한 presentation 분해를 계속 진행 중이며, 다음은 stateful 섹션 전까지 더 옮길 수 있는 조각을 선별한다.
- 2026-04-16 PM (10): `CoreAnalysisSection`과 `AccordionSection`도 `premium-report-sections.tsx`로 이동해, `premium-report.tsx`에서 무상태 렌더 조각을 더 걷어냈다. `npm run build` 재통과 기준으로 이번 배치도 동작 변경 없는 저위험 분리이며, 남은 Step 4 범위는 주로 `FortuneFlow`, `SpecialAnalysis`, `Compatibility`, `DateSelection`, `AstroDeep` 같은 stateful 섹션 정리다.
- 2026-04-16 PM (11): stateful 섹션 첫 배치로 `SpecialAnalysisSection`을 `premium-report-sections.tsx`로 이동했다. 중간에 `Zap` import 누락으로 타입 에러가 한 번 있었지만 즉시 복구했고, 최종적으로 `npm run build` 재통과 기준으로 동작/계약 변화 없이 안정 상태를 확인했다.
- 2026-04-16 PM (12): 다음 stateful 배치로 `DateSelectionSection`을 `premium-report-sections.tsx`로 이동했고, 탭 상태/애니메이션/날짜 포맷 로직은 그대로 유지했다. `npm run build` 재통과 기준으로 Step 4는 여전히 안전한 단위 분해를 유지 중이며, 남은 큰 stateful 후보는 `CompatibilitySection`, `AstroDeepSection`, `FortuneFlowSection`이다.
- 2026-04-16 PM (13): `CompatibilitySection`도 `premium-report-sections.tsx`로 이동해, 사회적 궁합 탭 상태와 transition을 섹션 단위로 분리했다. `npm run build` 재통과 기준으로 현재 Step 4의 주요 남은 stateful 후보는 `AstroDeepSection`과 `FortuneFlowSection`이며, 특히 `FortuneFlowSection`은 내부 상태와 UI 밀도가 높아 가장 마지막에 다루는 것이 안전하다.
- 2026-04-16 PM (14): `AstroDeepSection`도 `premium-report-sections.tsx`로 이동했고, accordion 상태와 열림 애니메이션은 그대로 유지했다. `npm run build` 재통과 기준으로 이제 Step 4의 큰 남은 덩어리는 `FortuneFlowSection`과 legacy `CompatibleDeepDiveSection` 정도이며, 전자는 마지막에 다루는 것이 가장 안전하다.
- 2026-04-16 PM (15): legacy `CompatibleDeepDiveSection`도 `premium-report-sections.tsx`로 이동해, fallback 탭 렌더까지 섹션 파일로 모았다. `npm run build` 재통과 기준으로 Step 4의 주된 남은 대형 섹션은 사실상 `FortuneFlowSection` 하나이며, 이 부분은 내부 상태와 월간 맵 UI가 결합돼 있어 마지막에 단독으로 다루는 것이 맞다.
- 2026-04-16 PM (16): `FortuneFlowSection`, `LifeAreasSection`, `TarotSpreadSection`, `TraitsSection`까지 `premium-report-sections.tsx`로 이동해 `premium-report.tsx`를 조립 중심으로 정리했다. `npm run build` 재통과 기준으로 Step 4를 완료 처리한다.
- 2026-04-16 PM (17): `oracle-followup-context.ts`가 저장된 `sajuResult.raw`, `oraclePromptBlock`, `followUpMetadata`를 우선 재사용하도록 정리해 follow-up 질문 시 사주 런타임 재계산을 줄였다. 새 질문으로 intent가 바뀌어도 저장된 raw profile이 있으면 evidence summary만 다시 조립하고, `npm run build` 재통과 기준으로 Step 5를 완료 처리한다.
- 2026-04-16 PM (18): `scripts/test-refactor-regression.sh`와 `docs/refactor-regression-checklist.md`를 추가하고 `package.json`에 `npm test`를 연결해 리팩터링 경계 회귀 검사를 고정했다. `npm test`, `npm run build`, `bash .agent/scripts/audit-status.sh` 기준으로 Step 6를 완료 처리한다.

### Validation
- `npm run build`
- `npm test`
- `/start` 무료 1단계 → 2단계 요약 확장 → 결과 복구 수동 검증
- 유료 resume 경로에서 phase 재개 및 결제 검증 수동 점검
- `POST /api/reading`, `POST|GET /api/reading/followup`, `POST|GET /api/payment` 응답 shape 회귀 확인

### Risks / Open Questions
- 프롬프트 리팩터링 중 free/premium tone drift가 생기지 않도록 golden sample 비교가 필요하다.
- `characterId`, `questionIntent`, `selectionMode`, `free_focus`는 wire contract로 유지해야 한다.
- premium phase 저장 포맷을 바꾸면 기존 resume 데이터와 충돌할 수 있으므로 migration 없는 호환 레이어가 먼저 필요하다.
- `/start`는 URL sync와 sessionStorage, 서버 restore가 모두 얽혀 있어 상태 ownership을 먼저 고정하지 않으면 재회귀 가능성이 높다.

## 🧠 Prompt & Advisor Quality Block (2026-04-16 Night)
*원칙: 외부 계약은 유지하고, 시스템 프롬프트와 상담가 레이어를 더 짧고 더 선명하며 더 전문적으로 만든다.*

- **Mission** — 무료 결과, premium report, follow-up chat이 모두 “결정과 타이밍 오라클”답게 읽히도록 만들되, generic한 라이프 코치 톤과 phase별 프롬프트 중복을 줄이고 상담가의 도메인 전문성을 실제 판단 구조로 승격한다.

### Scope Now
- `phase-prompts.ts`의 중복된 `Life Strategist` 시스템 프롬프트를 걷어내고, free 첫 결과와 follow-up에 가장 직접 연결되는 공통 규칙층을 우선 정리한다.
- `oracle-personas.ts`의 `framework`, `styleRules`, `caution`, `evidencePriority`를 “설명문”이 아니라 “판단 계약”으로 강화해 상담가 차이를 실제 출력 구조에서 체감되게 만든다.
- `evidencePriority`가 실제 답변 구조에서 첫 근거/보조 근거 순서로 반영되게 하되, 우선 가장 사용 빈도가 높은 질문 흐름에 집중한다.
- generic한 라이프 코치 톤을 줄이고, 사용자가 첫 결과와 follow-up에서 바로 느낄 수 있는 “결정과 타이밍 오라클” 차별성을 우선 확보한다.

### Scope Later
- 한국어 기본 프레임과 영어권 onboarding 프레임의 전면 재정렬
- `primaryIntent + secondaryIntent` 라우팅을 본격 도입해 복합 질문 분류를 고도화한다.
- follow-up continuity를 위한 `advisor thesis` / summary state의 저장 전략 확장
- provider별 토큰 budget 및 locale별 few-shot 압축 정책을 별도 orchestration 레이어로 승격한다.

### Explicitly Out
- 새 consumer-facing surface 추가
- `characterId`, `questionIntent`, `selectionMode`, `free_focus`, `summary`, `metadata`의 wire contract 변경
- 상담가 ID 추가/삭제 또는 브랜딩 명칭 변경
- DB migration이 필요한 저장 구조 개편
- premium multi-phase 전체를 한 번에 완성도 높게 재작성하는 작업

### Implementation Steps
- [x] **Step 1: Core Prompt Contract Unification** — `phase-prompts.ts`와 `prompt-builder.ts`에서 free 첫 결과 / follow-up에 직접 영향을 주는 중복 시스템 프롬프트를 걷어내고, `prompt-shared-rules.ts` 기반 공통 규칙층과 phase overlay만 남긴다.
- [x] **Step 2: Advisor Decision Contract** — 각 상담가의 `framework/styleRules/caution`를 실제 분석 순서, 금지 패턴, 출력 골격으로 승격하되, 가장 사용 빈도가 높은 질문 흐름부터 적용한다.
- [x] **Step 3: Evidence Ordering** — `evidencePriority`를 실제 답변 구조에 반영해 generic 문장보다 근거 순서가 먼저 드러나게 한다.
- [x] **Step 4: Prompt Regression & Golden Samples** — free 첫 결과, premium 핵심 phase, follow-up용 golden sample과 regression check를 추가해 generic drift와 advisor drift를 감시한다.

### Progress Note
- 2026-04-16 Night (2): Step 1 completed. `prompt-shared-rules.ts`에 결정/타이밍 오라클 base rule과 evidence-first 서술 규칙을 추가했고, `prompt-builder.ts`의 free/follow-up system prompt가 이 공통 규칙층을 직접 재사용하도록 정리했다. `phase-prompts.ts`는 Phase 1/1B의 중복 `Life Strategist` 머리말을 shared guide contract 기준의 얇은 phase overlay로 축소했다. `npm test`, `npm run build` 통과. `node scripts/verify-oracle-prompt-refactor.ts`는 현재 plain Node ESM import resolution 때문에 실행 실패하므로 Step 4에서 runnable verifier 경로를 함께 정리한다.
- 2026-04-16 Night (3): Step 2-4 completed. `oracle-personas.ts`에 상담가별 분석 순서, 금지 패턴, 답변 골격, 근거 순서를 internal decision contract helper로 추가했고, 이 정보가 free structured prompt와 follow-up prompt의 shared guide block에 직접 노출되도록 연결했다. `prompt-shared-rules.ts`의 chat protocol도 guide contract를 실제 답변 구조에 반영하도록 강화했다. `scripts/oracle-prompt-golden-samples.json`과 runnable `node scripts/verify-oracle-prompt-refactor.ts`를 추가해 structured/free/follow-up/phase1 drift를 검증 가능하게 만들었고, `node scripts/verify-oracle-prompt-refactor.ts`, `npm test`, `npm run build` 모두 통과했다. 현재 남은 경고는 verifier 실행 시 Node의 `MODULE_TYPELESS_PACKAGE_JSON` warning뿐이며, 기능상 blocker는 아니다.

### Validation
- `npm run build`
- `npm test`
- `node scripts/verify-oracle-prompt-refactor.ts`
- 상담가별 샘플 질문 수동 비교
- `free result`, `premium phase`, `follow-up` 출력에서 tone/evidence/order 수동 spot check

### Risks / Open Questions
- 상담가 전문성을 너무 강하게 밀면 free/premium tone 차이가 과장되거나 과도한 페르소나 연기가 생길 수 있다.
- 영어권 `astro-first` onboarding을 지금 크게 건드리면 진입 이해도가 흔들릴 수 있다.
- provider별 출력 예측성이 달라 golden sample을 어떻게 관리할지 기준을 먼저 정해야 한다.

## 💬 Grand Oracle Chat Trust Hardening Block (2026-04-17)
*원칙: 새 소비자 surface를 늘리지 않고, `Grand Oracle Chat`을 계속 써도 되는 코어 경험으로 고정한다.*

- **Mission** — `Grand Oracle Chat`이 최근 리딩 맥락, birth context, membership/quota 경계를 더 일관되게 복원하고, `council_briefing` 응답은 깊이를 유지하면서도 지연/실패 시 예측 가능한 fallback을 제공하도록 만든다.

### Scope Now
- `/api/oracle-chat/message`가 room ownership, membership entitlement, free quota 차감, context restore를 모두 서버 truth 기준으로 처리하도록 잠근다.
- `buildOracleChatPromptContext`가 최근 리딩 metadata와 최신 채팅 요약을 우선 재사용하도록 정리한다.
- `council_briefing` 생성 경로에서 latency budget과 fallback shape를 명시해, 실패해도 `casual` 이하의 빈약한 응답으로 무너지지 않게 한다.
- `/oracle-chat`, `/daily`, `SubscriptionModal`, `/billing`의 `oracle_chat` source branching을 유지하되, 한 surface용 카피가 다른 surface를 덮어쓰지 않게 정리한다.
- `GET /api/oracle-chat/history`, `POST /api/oracle-chat/message`, `GET /api/oracle-chat/daily-hook`의 regression 확인 경로를 고정한다.

### Scope Later
- `Grand Oracle Chat` 전용 summary memory 또는 vector recall 전략
- `career/love/wealth/general`별 전문 브리핑 템플릿 세분화
- Oracle Chat 전용 유료 플랜 또는 add-on packaging 검토
- SMS Daily Signal과 Oracle Chat thread를 더 촘촘히 연결하는 cross-channel orchestration

### Explicitly Out
- 새 Stripe SKU, 새 `planType`, 새 `subscriptionStatus` 추가
- `POST /api/oracle-chat/message`의 public request/response shape 변경
- Oracle Chat 신규 surface 추가 또는 대규모 UI 리디자인
- voice/image/multi-user chat

### Implementation Steps
- [x] **Step 1: Server Context Recovery Lock** — 최근 reading metadata, birth context, latest room summary를 서버 우선순위로 복원하도록 `oracle-chat` context builder 경계를 잠근다.
- [x] **Step 2: Quota & Entitlement Hardening** — free quota 차감과 membership entitlement 판정을 atomic/server-owned 흐름으로 정리하고 `402 ORACLE_CHAT_DAILY_LIMIT` 계약을 회귀 검사한다.
- [x] **Step 3: Council Briefing Reliability** — `council_briefing`의 latency budget, fallback shape, partial failure 처리 규칙을 정리해 답변 깊이와 안정성을 같이 고정한다.
- [x] **Step 4: Surface Copy Isolation** — `/oracle-chat`, `/daily`, paywall source별 messaging를 분리해 한 entry surface의 merchandising이 다른 surface를 덮어쓰지 않게 한다.
- [x] **Step 5: Regression Harness** — `history/message/daily-hook`, membership paywall 진입, reading-linked context continuity를 최소 smoke 경로로 고정한다.

### Validation
- `npm run build`
- `npm test`
- `GET /api/oracle-chat/history`
- `POST /api/oracle-chat/message`
- `GET /api/oracle-chat/daily-hook`
- 비구독자 1일 3회 초과 시 `402 ORACLE_CHAT_DAILY_LIMIT` 수동 확인
- 최근 reading이 있는 사용자 기준으로 `/oracle-chat` 첫 응답 continuity 수동 점검

### Risks / Open Questions
- recent reading metadata를 너무 강하게 우선하면 현재 질문보다 과거 맥락을 과적합할 수 있다.
- `council_briefing` depth를 유지하면 latency budget이 다시 흔들릴 수 있으므로, fallback이 실제로 “얕지만 일관된 답변”인지 검증이 필요하다.
- paywall source isolation을 잘못 적용하면 `/daily`와 `/oracle-chat`의 카피가 또 충돌할 수 있다.

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
