# 🌍 CosmicPath Overseas Direction Plan — English Contact Timing Probe

> 기준일: 2026-05-15 | 모드: landing-test + offer-design + viral-content | 목표: 풀 글로벌 리런칭이 아니라 영어권에서 "Should I text them or wait?" 결정 타이밍 wedge를 작게 검증

## Mission

CosmicPath의 해외 방향은 **generic AI fortune app**이 아니다.
첫 영어권 실험은 `Korean Saju for decision timing`을 관계/연락 타이밍 하나로 좁혀, 사용자가 "지금 연락할지 기다릴지"에 돈을 내는지 확인한다.

사주·점성술·타로는 전면 상품명이 아니라 `why this verdict` 근거 레이어로 둔다.
해외 확장은 한국어 PMF를 버리는 리브랜딩이 아니라, 기존 Decision Timing Reading을 영어권 niche에 맞게 포장하는 검증이다.

## Scope Now

- [ ] **Step 1: Korean Baseline Readout** — 기존 `relationship_contact_timing_v1` funnel에서 landing → prompt → free result → paywall → checkout → follow-up opt-in이 읽히는지 먼저 확인한다.
- [x] **Step 2: English Offer Lock** — 영어권 첫 promise를 `Should I text them or wait?` + `Korean Saju decision timing reading`으로 고정한다.
- [x] **Step 3: English Entry Surface** — `/en/contact-timing` 또는 language-aware `/relationship/contact-timing` 변형으로 영어 방문자가 한국어 trust break 없이 진입하게 한다.
- [x] **Step 4: Route Attribution** — prompt CTA를 `/start?reset=true&context=love&entry=en_relationship_contact_timing_v1&question=...`로 연결하고 `language=en`/source metadata를 기록한다.
- [x] **Step 5: English Paywall + Trust QA** — $3.99 unlock copy, refund/disclaimer, Google-first auth, Copy Link/Threads/TikTok share order를 영어권 기준으로 확인한다.
- [x] **Step 6: Overseas Content Batch** — TikTok/Threads용 영어 훅 30개를 만들고 모두 영어 contact timing entry로 연결한다.
- [ ] **Step 7: 300-Visit Readout** — 영어권 300 targeted visits 또는 14일 중 먼저 도달한 시점에 계속/수정/보류를 판정한다.

## Scope Later

- `/en/saju` SEO 콘텐츠 확장
- Day Master visual share card
- 영어권 relationship outcome email reminder
- 국가별 가격/통화 최적화
- 영어권 creator partnership
- broader career/money decision timing pages

## Explicitly Out

- full global relaunch
- 다국어 로컬라이제이션
- 새 public API 또는 새 reading schema
- 새 Stripe SKU/구독 플랜
- 통계 예측모델 또는 정확도 claim
- 고액 paid acquisition
- 의료/법률/투자/위험 관계 조언

## Success Criteria

- 판정 기준: 영어권 targeted visits 300명 또는 14일 중 먼저 도달한 시점
- PASS: question start 45명 이상, free result 30명 이상, paywall open 8명 이상, paid conversion 2건 이상
- REVISE OFFER: free result 30명 이상인데 paid conversion 0건이면 paywall/무료 결과 가치 문제
- REVISE ENTRY: visits 300명에서 question start 25명 미만이면 영어 headline 또는 contact timing promise 문제
- HOLD GLOBAL: follow-up opt-in 8명 미만이면 outcome data/retention 투자는 보류

## Validation

```bash
npm run lint
npm run build
```

수동 검증:
- 영어 entry의 첫 화면은 `Korean Saju`보다 `Should I text them or wait?`가 먼저 보인다.
- CTA는 love context, prefilled question, `en_relationship_contact_timing_v1` attribution을 유지한 채 `/start`로 이동한다.
- 영어 `/start`/결과/paywall에 한국어-only 문구, Kakao-first auth, 한국어 환불/정책 trust break가 없다.
- `/ops/growth`에서 `en_relationship_contact_timing_v1`과 `relationship_contact_timing_v1`을 분리해 볼 수 있다.
- 위험 관계/스토킹성 질문은 행동을 부추기는 카피 대신 보류/안전 안내로 약화된다.

구현 메모(2026-05-15):
- 완료: `/en/contact-timing` 랜딩, `en_relationship_contact_timing_v1` source 등록, `/start` `lang=en` 처리, 결과 브리프/7일 follow-up seed/paywall copy source-aware 분기, sitemap, 30개 영어 Threads/TikTok 훅.
- 검증: targeted ESLint PASS, `npm run lint` PASS, `npm test` PASS, `npm run build` PASS, desktop/mobile Playwright smoke PASS.
- 남은 운영 확인: 실제 유입 후 `/ops/growth`에서 한국어/영어 source별 funnel readout을 비교해야 한다.

## Risks / Open Questions

1. 영어권에서 `Saju`는 아직 설명이 필요한 단어다. 첫 fold에서는 decision pain을 먼저 팔고, Saju는 근거 레이어로 설명해야 한다.
2. 한국어 관계 wedge 데이터가 아직 0이면 영어권 실험이 너무 빠를 수 있다. 단, entry/paywall/trust QA는 먼저 준비 가능하다.
3. $3.99 one-time offer가 해외에서는 싸게 보일 수 있다. 초기에는 결제 재발생 검증이 우선이고 가격 최적화는 후순위다.
4. 영어권 유입은 TikTok/Threads 훅 품질에 크게 좌우된다. SEO 확장은 paid/free activation 신호 뒤에 둔다.
5. outcome claim을 성급히 하면 신뢰 리스크가 커진다. follow-up은 "결과 확인"이지 "예측 정확도 증명"이 아니다.

# 🎯 CosmicPath Relationship Contact Timing Plan

> 기준일: 2026-05-15 | 모드: landing-test + mvp-build + viral-content | 목표: 사주+점성술+타로 통합분석 정체성을 유지하면서 첫 캠페인을 "지금 연락할까, 기다릴까"로 좁혀 검증

## Mission

CosmicPath는 **사주·점성술·타로 통합분석 서비스**로 남는다.
다만 첫 매출 회복 캠페인은 넓은 운세가 아니라 **관계/연락 타이밍**으로 좁힌다.
사용자가 사는 것은 "상대 마음을 100% 맞히는 예언"이 아니라, 지금 연락/대기/축소 중 어디에 가까운지에 대한 판정, 근거, 다음 행동이다.

## Scope Now

- [x] **Step 1: Relationship Landing** — `/relationship/contact-timing` 랜딩을 만들고 H1을 "지금 연락할까, 기다릴까"로 고정한다.
- [x] **Step 2: Prompt Cards** — 랜딩 CTA 3개를 `/start?reset=true&context=love&entry=relationship_contact_timing_v1&question=...`로 연결한다.
- [x] **Step 3: Contact Timing Result Framing** — 무료 결과 첫 fold에서 `연락/대기/축소/보류` 판정 라벨이 보이게 카피와 fallback을 조정한다.
- [x] **Step 4: Evidence-Led Paywall** — 유료 가치를 "상대 속마음 확정"이 아니라 `왜 이 판정인지 · 연락 타이밍 · 피해야 할 메시지`로 설명한다.
- [x] **Step 5: Outcome Seed** — 결과 하단에 "7일 뒤 이 결정 확인하기" opt-in/CTA를 추가하고 growth event로 follow-up 의사를 기록한다.
- [x] **Step 6: Threads Batch** — 14일치 관계/연락 타이밍 훅 28개를 작성하고 모든 링크를 `/relationship/contact-timing`로 고정한다.
- [ ] **Step 7: Readout** — `/ops/growth`에서 `relationship_contact_timing_v1` source 기준 landing → prompt → free result → paywall → checkout → follow-up opt-in을 확인한다.

## Scope Later

- 7일 후 이메일/SMS 자동 리마인더
- 실제 outcome 전용 DB 모델과 관리자 outcome dashboard
- "비슷한 결정의 실제 결과" 통계 표시
- 재회 전용, 궁합 전용, 커리어 전용 랜딩 복제
- 구독형 Decision Companion

## Explicitly Out

- 통계 예측모델 전면 포지셔닝
- 정확도/미래 예측 보장 문구
- 새 사주·타로·점성술 엔진
- 의료/법률/투자/이혼/스토킹성 질문 처리
- 새 Stripe SKU 또는 새 구독 플랜
- 네이티브 앱

## Success Criteria

- 14일 또는 타겟 방문 300명 중 먼저 도달한 시점에 판정
- PASS: 질문 시작 50명 이상, 무료 결과 35명 이상, paywall open 10명 이상, 결제 2건 이상, follow-up opt-in 10명 이상
- REVISE: 무료 결과 35명 이상인데 결제 0건이면 paywall/무료 결과 가치 문제
- CHANGE WEDGE: 방문 300명에서 질문 시작 25명 미만이면 관계 캠페인 메시지 문제
- HOLD DATA MODEL: follow-up opt-in 10명 미만이면 outcome DB/통계 모델 개발 보류

## Validation

```bash
npm run lint
npm test
npm run build
```

수동 검증:
- `/relationship/contact-timing` 첫 화면에서 "사주+점성술+타로 통합분석" 정체성이 보이되, primary promise는 "연락할까 기다릴까"다.
- prompt card 클릭 시 `/start?reset=true&context=love&entry=relationship_contact_timing_v1&question=...`로 이동한다.
- `/start` textarea에 관계 질문이 실제 prefill된다.
- 무료 결과 첫 fold에서 판정/근거/다음 행동이 보인다.
- PaymentModal이 "왜 이 판정인지 · 연락 타이밍 · 피해야 할 메시지" 가치를 설명한다.
- `/ops/growth`에서 `relationship_contact_timing_v1` source가 분리되어 보인다.

구현 메모(2026-05-15):
- 완료: 랜딩 route, prompt CTA, start attribution source, contact-specific decision brief, relationship paywall copy, localStorage follow-up seed, sitemap.
- 검증: targeted ESLint PASS, `npm run lint` PASS, `git diff --check` PASS, `npm run build` PASS.
- 수동 확인: `/relationship/contact-timing` desktop/mobile 렌더링 PASS. `/start`는 dev 서버의 Turbopack `CPU doesn't support the bmi2 instructions` panic 영향으로 브라우저 확인이 불안정했으나 production build route/type check는 PASS.

구현 메모(2026-05-24):
- 완료: follow-up seed 이벤트명을 `relationship_contact_followup_seeded` / `en_relationship_contact_followup_seeded`로 정합화하고 legacy opt-in 이벤트도 `/ops/growth` seed로 집계.
- 완료: English contact CTA 이벤트를 English Contact Timing funnel prompt click으로 집계.
- 완료: Stripe success verification이 checkout metadata `source`를 반환하고 `/payment/success`의 `checkout_success` 이벤트가 같은 campaign source로 기록되도록 정리.
- 완료: `/relationship/contact-timing` landing/prompt 이벤트에 `utm_source`, `utm_campaign`, `utm_content` metadata 기록.
- 완료: 한국어 Threads 14일치 28개 훅을 `docs/revenue/relationship-contact-timing-threads-batch-2026-05-24.json`에 작성하고 모든 링크를 `relationship_contact_timing_v1` UTM으로 고정.

## Risks / Open Questions

1. 관계/연락 카피가 싸게 보이면 브랜드 신뢰를 깎는다. "상대 속마음 100%" 같은 문구는 금지한다.
2. 감정이 강한 질문이라 책임 경계가 필요하다. 스토킹성/위험 관계/법적 문제는 보류 가드가 필요하다.
3. 결과가 너무 신비주의면 결정 보조 가치가 약해지고, 너무 실용적이면 CosmicPath 정체성이 약해진다.
4. follow-up opt-in이 낮으면 통계 예측모델 방향은 아직 이르다.

# 🎯 CosmicPath Product Rebuild Plan — Decision Timing App

> 기준일: 2026-05-15 | 모드: mvp-build + landing-test | 목표: CosmicPath를 "운세 메뉴 앱"이 아니라 "지금 움직일지 기다릴지 결정하는 타이밍 리딩"으로 재구성

## Mission

CosmicPath의 전면 경험을 **Decision Timing App**으로 리빌드한다.
사주·타로·점성술은 상품명이 아니라 판정의 근거 레이어로 내리고, 사용자가 사는 것은 "내가 지금 뭘 해야 하는지"에 대한 판정·근거·다음 행동이다.

## Scope Now

- [x] **Step 1: Home Repositioning** — `/` 첫 화면을 기능 소개가 아니라 "지금 움직일지 기다릴지" 질문 진입면으로 바꾼다.
- [x] **Step 2: Decision Intake Tightening** — `/start`에서 질문/선택지를 먼저 받고, 생년월일/타로는 근거 정밀화 단계로 느껴지게 재정렬한다.
- [x] **Step 3: Decision Brief Result** — 무료 결과 첫 화면을 `판정 / 근거 요약 / 다음 행동` 3층 구조로 고정한다.
- [x] **Step 4: Evidence-Led Paywall** — $3.99 유료 가치를 "전체 리포트"가 아니라 `타이밍 근거·행동 순서·주의할 선택지` 잠금해제로 설명한다.
- [x] **Step 5: Rebuild Growth Tracking** — `decision_timing_rebuild_v1` source로 landing, question_submit, first_result, paywall, checkout, next_day_return을 읽는다.
- [x] **Step 6: Next-Day Check-In Seed** — 결제/무료 결과 후 다음날 돌아올 수 있는 `/daily` 연결 문구와 CTA를 붙인다. 푸시/문자 자동화는 제외한다.

## Scope Later

- 관계/재회 전용 `연락할지 기다릴지` wedge 복제
- 결제 후 7일 Decision Companion 루프
- 영어권 Korean Saju education + decision reading
- 유료 사용자의 결정 히스토리와 follow-up 질문 묶음
- 사람 상담가 handoff/waitlist 테스트

## Explicitly Out

- 새 사주·타로·점성술 엔진 추가
- 사람 상담가 마켓플레이스
- 네이티브 앱
- 새 구독 플랜
- 글로벌 영어 리런칭
- 커뮤니티/소셜 피드
- API response shape 대규모 변경

## Success Criteria

- 14일 또는 타겟 방문 300명 중 먼저 도달한 시점에 판정
- PASS: 질문 시작 45명 이상, 무료 결과 35명 이상, paywall open 10명 이상, 결제 2건 이상
- REVISE: 무료 결과는 35명 이상인데 결제 0건이면 paywall/결과 가치 문제
- KILL/CHANGE WEDGE: 방문 300명에서 질문 시작 25명 미만이면 홈/메시지 문제

## Validation

```bash
npm run lint
npm test
npm run build
```

수동 검증:
- `/`의 primary CTA가 `/start?entry=decision_timing_rebuild_v1`로 이동한다.
- `/start`에서 질문 prefill과 context가 유지된다.
- 무료 결과 첫 fold에 판정, 근거 요약, 다음 행동이 보인다.
- PaymentModal이 $3.99로 열리며 "근거·타이밍·행동 순서" 가치를 설명한다.
- `/ops/growth`에서 `decision_timing_rebuild_v1` source가 분리되어 보인다.

## Risks / Open Questions

1. 너무 실용적으로 바꾸면 운세 특유의 재미가 약해질 수 있다. 카피는 "판정은 현실적, 근거는 신비감" 균형이 필요하다.
2. 기존 긴 프리미엄 리포트가 가치처럼 보이지 않을 수 있다. 유료 첫 화면은 길이보다 unlock된 판단 구조를 먼저 보여줘야 한다.
3. 관계/재회가 커리어보다 더 잘 팔릴 수 있다. 300방문 기준으로 빠르게 갈아탈 준비가 필요하다.
4. 기존 API contract를 유지하는 동안 UI derive 로직이 복잡해질 수 있다. 새 public schema는 1차 리빌드에서 금지한다.

# 🎯 CosmicPath $3.99 Revenue Recovery Plan — Career Timing Wedge

> 기준일: 2026-05-14 | 모드: landing-test + offer-design | 목표: 첫 달 $300 이후 끊긴 매출을 반복 가능한 유입/전환 실험으로 복구

## Mission

CosmicPath를 당분간 "AI 오라클/통합 운세"가 아니라 **"버틸지 옮길지, 지금 타이밍부터 보는 커리어 결정 리딩"**으로 좁힌다.
$3.99 가격 인하는 전환율을 살리는 보조 장치로만 쓰고, 핵심 검증은 커리어 wedge에서 유료 결제가 다시 발생하는지 확인하는 것이다.

## Scope Now

- [x] **Step 1: Career Landing Activate** — `/career/uncertainty`를 메인 실험 랜딩으로 사용하고, noindex 여부와 sitemap 포함 여부를 결정한다.
- [x] **Step 2: Offer Copy Lock** — CTA를 "버틸지 옮길지 먼저 보기"로 통일하고, $3.99가 여는 유료 가치(근거·타이밍·행동 순서)를 paywall에 명확히 연결한다.
- [ ] **Step 3: Funnel Tracking Check** — `landing_view -> prompt_card click -> first_result_view -> paywall_open -> checkout_success`가 `/ops/growth`에서 읽히는지 확인한다.
- [x] **Step 4: 14-Day Threads Batch** — 커리어 타이밍 훅 28개를 작성하고 모든 링크를 `/career/uncertainty`로 고정한다.
- [ ] **Step 5: 300-Visit Readout** — 타겟 방문 300명 기준 무료 결과 40명, paywall open 8명, 결제 2명 이상이면 계속한다.

## Scope Later

- "재회/연락할까 말까" 관계 wedge를 2번째 실험으로 복제
- 영어권 `/en/saju`는 한국어 wedge에서 전환 신호 확인 후 번역
- SEO 페이지 3종: 이직운, 퇴사 타이밍, 버텨야 할지 이직해야 할지

## Explicitly Out

- 새 분석 엔진 추가
- 구독 플랜 신설
- 네이티브 앱
- 전체 글로벌 리런칭
- 커뮤니티/소셜 피드

## Success Criteria

- 14일 또는 타겟 방문 300명 중 먼저 도달한 시점에 판정
- PASS: 결제 2건 이상 또는 paywall open 대비 checkout 20% 이상
- REVISE: 무료 결과 40명 이상인데 결제 0건이면 paywall/무료 결과 문제
- KILL/CHANGE WEDGE: 방문 300명에서 무료 결과 20명 미만이면 랜딩/입력 마찰 문제

## Validation

```bash
npm run lint
npm run build
```

수동 검증:
- `/career/uncertainty` CTA가 `/start?context=career&question=...`로 진입하는지 확인
- 무료 결과 화면에서 커리어 질문 맥락이 유지되는지 확인
- `PaymentModal`이 $3.99 가격 또는 fallback copy를 명확히 보여주는지 확인
- `/ops/growth`에서 실험 source별 landing/free/paywall/paid 흐름 확인

## Risks / Open Questions

1. $3.99가 너무 낮아 리포트 가치가 싸구려처럼 보일 수 있음. 단, 지금은 LTV보다 결제 재발생 검증이 우선이다.
2. 커리어 wedge가 실제 구매 intent가 약하면 관계/재회 wedge로 빠르게 전환해야 한다.
3. Threads 유입이 충분하지 않으면 SEO보다 먼저 콘텐츠 배포량이 병목이 된다.

# 🎯 프롬프트 톤 리부트: "운세 앱" → "인생 전략가"

> 기준일: 2026-05-08 | 목표: "이건 소름 돋게 내 얘기다" 체감 극대화
> 원칙: API contract 변경 없음 (internal-only). 타입 변경 최소화. 기존 10점화 Block 성과 유지.

## Mission

CosmicPath 리딩 결과물의 톤을 "따뜻한 운세 앱"에서 **"냉정하되 정확한 인생 전략가"**로 전환한다.
- **명리 해설 70% → 30%** / **행동 패턴 묘사 30% → 70%** 비율 역전
- "재물운이 좋습니다" → "돈 자체보다 통제 가능한 시스템에 집착하는 타입이다" 스타일 변환
- Phase 5B에 **킬러 섹션** 추가: "이 사람이 가장 먼저 고쳐야 하는 행동 패턴"
- 기존 10점화 Block(추상 명사구 블랙리스트, 4슬롯 구조, 핀포인트 블록 등) 성과는 그대로 보존

## 이전 작업과의 관계

이전 task_board(프롬프트 품질 10점화 Block)의 Step 1~5는 이미 구현 완료된 것으로 간주하고,
이번 작업은 **톤(Tone)과 서술 비율**에 집중하는 후속 업그레이드다.

## Scope Now

- [x] **Step 1**: 코어 톤 전환 — "판정형 전략가" 디렉티브 주입 → `prompt-shared-rules.ts`
- [x] **Step 2**: 행동 패턴 묘사 비율 역전 — Phase 1 스타일 가이드 개편 → `phase-prompts.ts` Phase 1
- [x] **Step 3**: Phase 2 사주 분석 톤 전환 — 명리 해설 축소, 삶의 패턴 묘사 확대 → `phase-prompts.ts` Phase 2
- [x] **Step 4**: 킬러 섹션 `behavioral_verdict` 추가 → `phase-prompts.ts` Phase 5B
- [x] **Step 5**: Chat 모드 + Few-shot 예시 톤 동기화 → `prompt-builder.ts`

## Scope Later

- 영문(EN) 프롬프트 동일 톤 적용 (현재는 KO만 우선)
- Phase 3(대운/세운), Phase 4(인생 영역) 톤 동기화
- A/B 테스트 인프라 구축 (기존 톤 vs 새 톤 전환율 비교)

## Explicitly Out

- API request/response shape 변경 없음
- UI 컴포넌트 변경 없음 (`behavioral_verdict`는 optional, 기존 UI에 영향 없음)
- DB migration 없음
- 사주 엔진, 점성술 엔진, 타로 엔진 로직 변경 없음
- `system-core.ts` 가중치(50/30/20) 변경 없음

## Implementation Steps

### Step 1: 코어 톤 전환 — `src/lib/ai/prompt-shared-rules.ts`

**변경 대상**: `buildDecisionTimingCoreRule()` (line 43~56)

현재:
```
"따뜻한 어조는 가능하지만, 판단·근거·구체성을 대신해서는 안 됩니다."
```

변경:
```
"당신은 이 사람을 10년 관찰해 온 인생 전략가다.
위로하려 하지 말고, 패턴을 해석해라.
듣기 좋은 말보다 실제 성향을 우선해서 설명해라.
누구에게나 적용될 수 있는 뻔한 조언은 금지한다.
단정적 판정 화법: '~일 수 있다', '~같다' 최소화. 확정 판단 우선.
콜드리딩 화법 필수: '쉬는 날에도 머리가 안 쉬지 않으셨나요?' 등"
```

추가: **행동 패턴 묘사 우선 규칙**
```
"명리 용어 해설보다 인간 행동 패턴 묘사를 우선해라.
'편관이 있다' 대신 → '결국 의사결정권을 가져야 만족하는 타입이다'
'재물운이 좋다' 대신 → '돈을 버는 능력보다 계속 일을 키우는 성향이 강한 사람'
명리 용어는 근거 인용에만 사용하고, 본문은 현실의 언어로 번역해서 쓸 것"
```

### Step 2: Phase 1 스타일 가이드 개편 — `src/lib/ai/phase-prompts.ts` (line 352~439)

**변경 대상**: Phase 1 KO 프롬프트의 `<style_guide>` 섹션

기존 나쁜/좋은 예시 교체:

```
<style_guide>
**서술 비율 강제**: 행동 패턴 묘사 70% / 명리 근거 인용 30%

**금지 (X):**
- "당신은 화(火) 기운이 강합니다."
- "편관이 있어서 리더십이 있습니다."
- "재물운이 좋아 돈을 벌 수 있습니다."

**필수 (O):**
- "이 사람은 쉬는 날에도 머리가 안 쉰다. 판을 설계하고, 규칙을 만들고, 통제할 수 있는 영역을 넓히는 것이 이 사람의 본능이다. (근거: 일간 [글자]가 [글자]들로부터 강한 생조)"
- "돈 자체를 좇기보다 '내 영역의 크기'에 집착한다. 차곡차곡 저축하는 성향이 아니라, 자기만의 시스템을 구축해 한 번에 파이를 가져가려는 타입이다. (근거: [글자A]-[글자B]의 상호작용)"
- "인간관계가 좁아지는 이유는 까다로워서가 아니라, 시간이 갈수록 사람을 책임감으로 보기 시작하기 때문이다. (근거: 일지 [글자]의 특성)"

**톤 규칙:**
- 자기계발 강사처럼 말하지 말 것
- 애매한 표현 대신 성향을 명확히 단정할 것
- 실제 사람을 관찰한 듯 현실적으로 묘사할 것
- 설명보다 판정에 가깝게 작성할 것
</style_guide>
```

**summary.content 지시 변경**:
```
"content": "7-9문장의 압도적인 종합 요약 (500~900자). 
명리 용어 해설 비중 30% 이하.
나머지 70%는 이 사람의 행동 패턴, 반복되는 실패 구조, 심리적 약점, 
돈과 인간관계에서의 습관을 냉정하게 묘사.
'이 사람은 ~하는 타입이다' 형태의 확정 판정 최소 3개 포함."
```

### Step 3: Phase 2 사주 분석 톤 전환 — `src/lib/ai/phase-prompts.ts` (line 738~792)

**변경 대상**: Phase 2 KO 프롬프트의 `<style_guide>` + 각 saju_sections content 지시

스타일 가이드 교체:
```
<style_guide>
**서술 비율 강제**: 삶의 패턴 묘사 60% / 명리 구조 분석 40%

**금지 (X):**
- "비견이 있어서 경쟁심이 있습니다."
- "역마살이 있어서 이동수가 있습니다."
- 사전적 정의 나열

**필수 (O):**
- "이 사람은 혼자 일할 때보다 경쟁자가 옆에 있을 때 오히려 집중력이 올라간다. 
   경쟁 자체를 즐기는 게 아니라, '지면 안 된다'는 본능이 작동하기 때문이다. 
   (근거: 월주 비견 + 연지 [글자]와의 상호작용)"
- "직장을 다녀도 결국 사직서는 이 사람의 주머니 안에 늘 들어있다. 
   독립은 선택이 아니라 시간문제다. 
   (근거: 시주 역마 + 편재 조합)"

**핵심 원칙:**
- 각 십성/신살을 설명할 때, '이것은 ~입니다'가 아니라 
  '이 사람은 ~하는 패턴을 보인다'로 서술할 것
- 사주 구조를 설명하되, 그것이 실제 삶에서 어떤 행동으로 드러나는지를 
  최소 2가지 구체적 상황 예시로 보여줄 것
</style_guide>
```

### Step 4: 킬러 섹션 `behavioral_verdict` — `src/lib/ai/phase-prompts.ts` Phase 5B (line 1387~1397)

**변경 대상**: Phase 5B의 `final_verdict` JSON 스키마에 optional 필드 추가

```json
"final_verdict": {
    ... (기존 필드 유지),
    "behavioral_verdict": "이 사람이 인생에서 가장 먼저 고쳐야 하는 행동 패턴을 한 문단(200-300자)으로 정리.
      형식: '[패턴 진단] + [이것이 돈/관계/건강에 미치는 구체적 영향] + [대안 행동 1가지]'
      예: '머릿속으로 완벽한 결과물이 그려질 때까지 실행을 미루는 습관이 가장 큰 적이다. 
      이 패턴은 사업에서는 출시 지연으로, 인간관계에서는 연락 두절로, 
      건강에서는 운동 시작 실패로 반복된다. 
      오늘 당장 70% 완성도에서 출발하는 연습을 시작해라.'"
}
```

**타입 변경**: `PremiumReportData.final_verdict`에 `behavioral_verdict?: string` 추가 (optional이므로 기존 UI 무영향)

### Step 5: Chat 모드 + Few-shot 톤 동기화 — `src/lib/ai/prompt-builder.ts`

**5-A: Chat 모드 톤 변경** (line 443~472)

`buildChatModeProtocol()` 수정:
```
기존: "톤: 따뜻하지만 권위 있는"
변경: "톤: 단정적이고 꿰뚫어 보는 듯한. 
       위로보다 패턴 해석을 우선. 
       '~일 수 있어요' 대신 '~하는 타입입니다'로 서술."
```

Layer 1 지시 변경:
```
기존: "전문 용어 없이 비유와 일상어로 핵심 통찰 전달"
변경: "명리 용어 없이, 이 사람의 행동 패턴을 냉정하게 묘사. 
       '이 사람은 ~하는 경향이 있다'가 아니라 '~하는 타입이다'로 단정"
```

**5-B: Few-shot 예시 교체** (line 135~203)

기존 예시 톤:
```
"지금은 당신의 창의적 에너지가 최고조에 달한 시기입니다."
```

변경 예시 톤:
```
"이직을 고민 중이라면, 이미 마음은 떠난 상태다. 
당신은 현 직장에서 의사결정권이 없다는 것에 질려 있다. 
3월 중순이 행동으로 옮기기에 가장 유리한 타이밍이다.

📊 분석 근거
- 사주: 편관(偏官) 월주 배치 → 조직 내 통제권 욕구 강함
- 점성: Mars 10하우스 → 커리어 추진력 최고조
- 균형: 금(Metal) 과다 → 분석-실행 병행형"
```

## Validation

```bash
pnpm tsc --noEmit        # 타입 에러 없음
pnpm build               # 빌드 성공
```

수동 검증:
- 새 무료 리딩 → summary가 "~타입이다" 확정 판정 최소 2개 포함 확인
- 새 유료 리딩 → Phase 1 content에서 행동 패턴 묘사 비율 > 명리 해설 비율 확인
- 새 유료 리딩 → Phase 5B에 `behavioral_verdict` 필드 존재 확인
- 채팅 모드 → 첫 응답이 "~타입입니다" 톤으로 나오는지 확인
- 다른 캐릭터 선택 시 톤은 유지되되 페르소나 스타일만 달라지는지 확인

## Risks / Open Questions

1. **톤 과격화 리스크**: 너무 냉정하면 유저가 불쾌할 수 있음 → "냉정하되 존중하는" 톤 밸런스 필요. 최초 배포 후 이탈률 모니터링 필수.
2. **LLM 프롬프트 준수율**: 톤 지시를 넣어도 LLM이 "착한 모드"로 회귀하는 경향 존재 → Few-shot 예시 + 반복 강조로 보완.
3. **영문(EN) 미적용**: KO 프롬프트만 우선 변경. EN은 Scope Later.
4. **`behavioral_verdict` 타입 추가**: optional이지만, `premium-report-sections.tsx`에서 렌더링하려면 UI 작업 필요 → 현재 scope out, 데이터만 생성.
5. **기존 10점화 Block과의 충돌**: 추상 명사구 블랙리스트, 4슬롯 구조 등 기존 규칙과 새 톤 규칙이 중복/충돌하지 않는지 검증 필요.
