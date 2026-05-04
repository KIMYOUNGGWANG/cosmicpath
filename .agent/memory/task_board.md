# 🎯 CosmicPath v2.0 — Task Board (리서치 기반 전략 로드맵)

> 기준일: 2026-03-19 | 리서치: `RESEARCH/CosmicPath_Analysis_20260318`
> 목표: **3개월 내 MAU 3,000 / 월 수익 500만원 / k-factor 1.5**

## 💰 Paywall Conversion Surgery + 무료 제한 Block (2026-05-04)
*원칙: 무료 결과의 "페이월 가치 전달"을 먼저 수술하고, 그 후에 무료 횟수를 제한한다. 순서가 바뀌면 유저만 이탈하고 전환은 0.*

- **Mission** — 결제 모달까지 도달하지만 이탈하는 유저의 전환율을 개선한다. 유저가 "$5.99로 정확히 무엇을 받는지" 알 수 있도록 UI를 수술하고, 동시에 무료 어뷰징과 LLM 비용을 통제한다.

### Root Cause
1. BlindSpotTeaser/BlurredPreviewSection: "Premium" 마케팅 문구만 있고, 잠긴 섹션의 **구체적 제목**(직업 타이밍, 연애 운, 재물 대운 등)이 안 보임.
2. PaymentModal: "전체 해석 보기"라는 추상적 카피. **구체적으로 무엇이 들어있는지** 불렛 리스트가 없음.
3. `402 QUOTA_EXCEEDED`: API는 반환하지만 프론트엔드에서 **아무 UX 처리 없이 generic 에러로 빠짐**.

### Scope Now
- PaymentModal의 `unlockBenefits` 배열 + 상단 카피를 **실제 프리미엄 섹션 이름 + 유저 맥락**으로 교체.
- premium-report의 `!isPremium` 블록에 **잠긴 섹션 제목 리스트** UI를 블러 영역 위에 추가.
- `/start` 결과 화면에서 `402 QUOTA_EXCEEDED` 에러를 감지해 **전용 UX**(결과 대신 "오늘 무료 한도 소진" + PaymentModal CTA)를 표시.
- `FREE_READING_DAILY_LIMIT=1` 환경변수 변경 (Step 3 완료 후 배포).

### Explicitly Out
- API response shape 변경 (프론트엔드 전용 수술)
- 이메일 기반 평생 제한 (이번 사이클 이후 검토)
- 디바이스 핑거프린트 / 구독 플랜 신설
- 프롬프트/백엔드 로직 변경

### Implementation Steps
- [x] **Step 1: PaymentModal Value Rewrite** ✅ — `unlockBenefits` 5개 구체적 섹션(Fortune Timing, Career·Wealth·Love, Blind Spot, Action Plan, Evidence)으로 교체. 상단 카피 "잠긴 5개 섹션" 으로 변경. 아이콘+리스트 레이아웃으로 전환.
  - 현재 추상적 3줄("전체 해석", "나중에 다시 보기", "Stripe 안전 결제") → 구체적 5~6줄 불렛:
    - 🔮 대운/세운 타이밍 분석 (Fortune Flow)
    - 💼 직업·재물·연애 심층 해석 (Life Areas)
    - ⚠️ 치명적 사각지대 경고 (Blind Spot)
    - 📊 Action Plan TOP 3
    - 🔒 사주/점성/타로 교차 검증 근거 (Evidence Tabs)
  - 파일: `src/components/payment/PaymentModal.tsx` (L449~L483, L604~L611)
- [x] **Step 2: Locked Section Teaser in Report** ✅ — `premium-report.tsx`에 `!isPremium` 블록 내 잠긴 섹션 5개 리스트 + 골드 CTA 버튼 추가. BlindSpotTeaser와 분리.
  - 컴포넌트: 새 `LockedSectionList` 인라인 또는 별도 파일
  - 위치: `BlindSpotTeaser` 직전 (L617~L628)
  - 각 항목 클릭 시 `handleUnlock()` 호출 (기존 PaymentModal 연결)
- [x] **Step 3: Quota Exceeded UX** ✅ — `start/page.tsx`에서 `402 QUOTA_EXCEEDED` 전용 분기 추가. `start-result-stage.tsx`에 전용 화면(카운트다운 + PaymentModal CTA + 섹션 요약) 구현.
  - 파일: `src/app/start/start-result-stage.tsx` 또는 해당 에러 핸들링 위치
  - 표시 내용: "오늘의 무료 사주를 이미 사용했습니다" + 남은 시간 카운트다운 + PaymentModal CTA
  - `402` + `code: 'QUOTA_EXCEEDED'` 일 때만 전용 분기
- [ ] **Step 4: Env Var Limit Apply** — `FREE_READING_DAILY_LIMIT=1`로 변경하여 IP당 하루 1회 무료 제한 적용.
  - Vercel 환경변수 대시보드 또는 `.env.production`에서 변경
  - **Step 3 배포 후에만** 적용 (UX 없이 제한만 걸면 유저 이탈만 발생)

### Validation
- `npm run build`
- `npm test`
- 수동 테스트: 무료 결과 → 블러 영역에서 잠긴 섹션 제목 확인 → PaymentModal 열기 → 구체적 불렛 리스트 확인
- 수동 테스트: `FREE_READING_DAILY_LIMIT=1` 적용 후 2번째 무료 요청 → "오늘 한도 소진" UX 표시 확인
- Growth event 확인: `paywall_open`, `paywall_item_clicked` 이벤트에 새 컨텍스트 반영 확인

### Risks / Open Questions
- PaymentModal 가치 불렛이 너무 길면 스크롤 피로 → 5~6줄 이하로 제한
- `QUOTA_EXCEEDED` UX에서 "내일 다시 오세요" vs "지금 결제하세요" 균형 → A/B 테스트 후보
- 무료 제한을 `1`로 하면 신규 유저 첫 경험이 한 번뿐 → 첫 결과 퀄리티가 더 중요해짐
- 동일 IP 다중 유저(공유 와이파이) 오탐 → 현재 단계에서는 수용

## 🇺🇸 US Saju OBT Validation Block (2026-04-19)
*원칙: 기존 글로벌 인프라(Stripe/Growth)를 재사용하면서 서양 젠지 타겟의 "단호한 Saju 리딩"을 가장 작고 빠르게 검증한다.*

- **Mission** — K-오컬트 트렌드에 관심 있는 서양 젠지를 타겟으로, 기존 서양 점성술의 모호함을 깨는 'Saju Verdict-first' 영문 전용 OBT 랜딩 및 결과를 배포하여 유료 전환율(WTP)를 검증한다.

### Scope Now
- `app/en/saju/page.tsx` 전용 독립 영문 랜딩 구축 (다크 모드, 프리미엄 K-Occult 에스테틱 적용).
- `POST /api/payment` 결제 시 `metadata: { language: 'en', source: 'us_obt' }` 주입 및 OBT 로직 연결.
- 리딩 결과 도출 시 서양인용 용어 현지화(Localization) 및 단호한 체(Verdict) 명시 로직(프롬프트 오버레이) 적용.

### Explicitly Out
- 다국어 i18n 패키지 전면 도입 및 전역 라우팅 개편.
- 영미권 맞춤 하드코어 구독 플랜 신설 (당장은 $15 일회성 결제로 WTP 검증).

### Implementation Steps
- [ ] **Step 1: OBT Landing UI** — `app/en/saju/page.tsx` 다크 모드 젠지 타겟 신규 랜딩 제작.
- [ ] **Step 2: English Result UI Sandbox** — 영문 전용 결과 화면 인프라 구축 및 기존 API 응답 연결.
- [ ] **Step 3: English Prompt Overlay** — 영어권 Verdict-first 전용 사주 용어 번역 & 오버레이 시스템 프롬프트 추가.
- [ ] **Step 4: Payment & Analytics Sync** — Checkout Button 재활용 및 Growth Event 메타데이터 검수.

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

<<<<<<< HEAD
- **Mission** — 무료 결과, premium report, follow-up chat이 모두 “결정과 타이밍 오라클”답게 읽히도록 만들되, generic한 라이프 코치 톤과 phase별 프롬프트 중복을 줄이고 상담가의 도메인 전문성을 실제 판단 구조로 승격한다. 추가로 페이월 전환율 최적화를 위해 "Blind Spot (손실 회피)" 컴포넌트를 설계한다.

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
- [x] **Step 5: Paywall Blind Spot Hook** — 결제 전환율(Conversion) 극대화를 위해 손실 회피(Fear/Risk)를 자극하는 `BlindSpotTeaser`를 `PremiumReport` 컴포넌트의 유료 섹션 최상단에 전진 배치한다.

## 📱 Oracle Story Swiper UX Renewal Block (2026-04-18)
*원칙: 기존 고품질 분석 데이터 구조를 유지하되 프론트엔드의 세로 스크롤을 가로 스와이프 카드로 개편.*

- **Mission** — 긴 텍스트로 인한 가독성 하락을 막고 모바일 앱처럼 쾌감 있는 UX를 주기 위해 페이월 이후의 리포트를 'Oracle Story Swiper' 방식으로 갈아엎는다. 상세 텍스트는 서랍 인터페이스 속에 분리 배치한다.

### Implementation Steps
- [x] **Step 1: Story Swiper Framework** — `story-swiper.tsx`와 `deep-dive-drawer.tsx`의 뼈대를 Framer Motion 드래그 이벤트를 기반으로 구축한다. 모바일 터치 대응과 데스크탑 Fallback 내비게이션을 포함한다.
- [x] **Step 2: Premium Data Parsing** — `premium-report.tsx`에 인입된 기존 텍스트 위주의 `report` 객체에서 리딩 슬라이드별(코어, 타로, 점성) 핵심 '한 줄 훅'을 추출하는 유틸 기능 작성.
- [x] **Step 3: Component Integration** — 기존 렌더링되던 Linear Layout을 걷어내고, Story Swiper에 슬라이드를 마운트하여 스크린 테스트 진행.

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
=======
## 🛠 Refactor Block (2026-04-16)
*원칙: 제품 계약과 리딩 품질은 유지하고, 내부 구조와 프롬프트 경계를 다시 세운다.*
- [x] Step 1: Start Flow Boundary Split
- [x] Step 2: Reading Route Service Split
- [x] Step 3: Prompt Stack Refactor
- [x] Step 4: Premium Report Decomposition
- [x] Step 5: Engine & Runtime Stabilization
- [x] Step 6: Regression Harness
>>>>>>> feat/improve-system-prompts

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

## 💻 Responsive Web UI/UX Pivot Block (2026-04-25)
*원칙: 모바일 앱 흉내가 아니라 데스크톱의 넓은 시야와 앱의 집중력을 동시에 잡는 프리미엄 웹 인터페이스 구축.*

- **Mission** — "결정을 받는 인터페이스"라는 컨셉에 맞추어 랜딩, 입력, 결과(한눈 요약), 개인 허브 화면을 2단 반응형 레이아웃으로 전면 개편한다.

### Scope Now
- **Global Theme**: `globals.css`와 Tailwind 설정을 통해 HSL 기반 Dark 테마 및 Iowan Old Style(또는 대체 세리프) 타이포그래피 전면 적용.
- **Start Flow**: `app/start/page.tsx`를 데스크톱 최적화 2단 레이아웃(좌: 캔버스, 우: 가이드)으로 개편.
- **Glanceable Result**: Premium Report를 3단(Verdict, Score Grid, Evidence Tabs) 가시성 중심 뷰로 재작성.
- **My Oracle Hub**: `/my` 대시보드를 사이드바 + 컨텐츠 피드 구조로 개편.
- **Guide Character**: '결' 캐릭터 요소를 랜딩과 주요 흐름의 안내자로 배치.

### Explicitly Out
- 기존 `/api/reading`, `/api/payment` 등 백엔드 로직 수정 및 데이터 스키마 변경 (프론트 뷰 재배치에만 집중).
- 라이트 모드(Light Mode) 전환 기능 (다크 테마 고정).

### Implementation Steps
- [ ] **Step 1: Design System & Root Layout** — Tailwind Config 및 `globals.css` 변수(Void, Panel 등) 수정, Root Layout의 Max-width(1820px) 컨테이너 설정.
- [ ] **Step 2: Responsive Start Flow** — 홈 랜딩 페이지와 시작 입력 흐름을 2단 캔버스로 리디자인.
- [ ] **Step 3: Glanceable Premium Report** — 한눈 요약과 탭 구조를 가진 새로운 Result Layout으로 교체.
- [ ] **Step 4: My Oracle Hub** — 사이드바 내비게이션 기반의 대시보드 구조 완성.

## 📜 Result Page Verdict-First UX Block (Sprint 1: 2026-04-25)
*원칙: 정보 나열형 문서가 아니라, 30초 내에 핵심 결정을 돕는 결정 지원 오라클로 UI/UX를 개편한다.*
> 기반 문서: `CosmicPath_ResultPage_PRD_v1.0.md`

- **Mission** — 스크롤 이탈을 막고 바이럴 루프를 만들기 위해 Destiny Moment를 최상단 히어로로 격상하고, Progressive Disclosure를 적용해 "행동" 중심의 레이아웃으로 변경한다.

### Scope Now
- **F-01 Hero Section**: Destiny Moment 카피 + 공유 버튼 + Trust Score 배지로 최상단 구성.
- **F-02 Action TOP 3**: 히어로 직하단에 "지금 당장 할 일" 3가지 압축 노출.
- **F-03 Progressive Disclosure**: 나머지 전체 상세 리포트 접기/펼치기.
- **F-04 Tarot UX**: 3초 후 시각적 힌트(Glow pulse) 제공 및 수동 클릭 플립 애니메이션.
- **F-06 Label Localization**: `ORACLE SYNTHESIS` 등 모호한 영문 레이블을 직관적 한글로 변경.

### Explicitly Out
- F-05 행동 체크리스트 서버 상태 동기화 (Sprint 2 계획)
- 신규 섹션 추가, AI 프롬프트 및 로직 변경 (UI 재배치에 집중)

### Implementation Steps
- [x] **Step 1: F-01 & F-06 Hero & Labels** — Destiny Moment를 최상단으로 격상하고 한글 레이블(통합 분석 등) 적용. ✅ 2026-04-26
- [x] **Step 2: F-02 Action TOP 3** — 행동의 창을 컴팩트 카드로 축약하여 히어로 하단에 배치. ✅ 2026-04-26 (DraftProposal ~96px, slice(0,3))
- [x] **Step 3: F-03 Progressive Disclosure** — 상세 리포트 영역을 접기/펼치기 아코디언 컴포넌트로 래핑하고 `localStorage` 상태 유지 적용. ✅ 2026-04-26
- [x] **Step 4: F-04 Tarot Flip Interaction** — 타로 카드 플립 애니메이션 구현 및 Glow pulse 시각적 힌트 적용. ✅ 2026-04-26 (3s 후 첫 카드만 자동, 나머지 수동)

