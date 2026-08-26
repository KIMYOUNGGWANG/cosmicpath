import { buildUserContext } from './context';
import { buildPreviousPhaseContext } from './previous-context';
import type { PremiumReportPartial, UserData } from './types';

// ============================================================================
// Phase 1B: Astro Deep (분할된 심층 분석)
// Phase 1A에서 분리하여 "Lost in the Middle" 방지
// ============================================================================
export function buildPhase1BPrompt(userData: UserData, previousData?: PremiumReportPartial | null): { system: string; user: string } {
  const lang = userData.language || 'ko';

  let system = '';

  if (lang === 'en') {
    system = `## Core Role
Continue the deep analysis started in Phase 1A using the shared oracle guide profile and evidence rules from the prompt context.
Keep the same guide voice and analytical frame from Phase 1A instead of resetting into a generic mentor tone.

<ASTROLOGY_ROLE_PROTOCOL>
1. This phase deepens the timing layer while preserving the three-layer verdict contract.
2. Cross-reference each astrology claim with Phase 1A's Saju structure and the question context.
3. If astrology conflicts with Saju or Tarot, name the conflict and turn it into a review boundary.
</ASTROLOGY_ROLE_PROTOCOL>

## Phase 1B Mission: Deep Astrological Dive
Focus on delivering deep, personalized astrological analysis. Each section must be rich with specific evidence.

## Response Requirements (JSON)
{
  "astro_deep": {
    "sun_moon_dynamic": {
      "title": "☀️🌙 Sun-Moon Dynamic",
      "content": "Analyze Sun (Outer Self) vs Moon (Inner Emotion). Structure in 3 parts: (1) Element relationship diagnosis, (2) Daily behavior manifestation, (3) Cross-reference with Soul Element. For regulated topics, end with a document/question/cost comparison review task only."
    },
    "ascendant_influence": {
      "title": "⬆️ Rising Sign (Your Social Mask)",
      "content": "Must include: (1) The 'mask vs. core' gap, (2) Specific work/relationship context examples. For regulated topics, end with a qualified-review threshold only."
    },
    "dominant_element": {
      "title": "Dominant Element Analysis",
      "content": "Must include: (1) Core personality traits, (2) Risks of excess, (3) Balance strategy. For regulated topics, the strategy must be document review, professional questions, or cost/risk comparison only."
    },
    "planetary_warning": {
      "title": "Planetary Cycle Alert",
      "content": "Must include: (1) Affected life areas, (2) Specific timing and coping strategies. For regulated topics, coping strategies must be neutral preparation tasks only."
    }
  }
}

## Writing Rules
1. **Language**: Write ALL content in English.
2. **Depth over Length**: Fulfill all required analytical points. No filler.
3. Reference Phase 1A's core analysis conclusions for consistency.
4. **Regulated Decision Boundary**: For visa, immigration, legal, tax, or financial-risk decisions, astrology may explain timing pressure and review windows, but must not instruct the user to apply, extend, renew, change status, stay, return, file, submit, book travel, start return logistics, stop/switch an immigration path, choose between stay/return outcomes, or skip professional advice. Keep guidance to documents, deadlines, professional questions, cost/risk comparison, buffers, and qualified-review thresholds.
5. **Safe Ending Requirement**: In regulated topics, each astro_deep.content field must end with a sentence shaped like: "따라서 이 항목의 실천은 문서/질문/비용 비교 점검이며, 전문가 검토 전 특정 선택 확정은 보류하는 재검토 기준으로 둡니다." Do not mention stay, return, apply, extend, file, submit, stop, or switch in the ending sentence.
6. **No Emojis**: Do NOT insert emojis in titles or headers. Keep clean executive copy.`;
  } else {
    system = `## 핵심 역할
Phase 1A에서 시작한 심층 분석을, 프롬프트 컨텍스트의 오라클 가이드 프로필과 근거 규칙을 바탕으로 이어가십시오.
새로운 generic 멘토 톤으로 리셋하지 말고, Phase 1A와 동일한 가이드의 어조와 분석 프레임워크를 유지하십시오.

<점성_역할_프로토콜>
1. 이 Phase는 타이밍 레이어를 깊게 보되, 전체 리포트의 3단 판정 계약을 유지합니다.
2. 모든 점성 주장에는 Phase 1A의 사주 구조와 사용자 질문 맥락을 교차 참조하십시오.
3. 점성이 사주나 타로와 충돌하면 그 충돌을 숨기지 말고 재검토 경계로 바꾸십시오.
4. **이모지 금지**: 제목(title)에 ☀️🌙, ⬆️, 🔥💧, ⚠️ 등의 이모지를 일절 사용하지 마십시오.
</점성_역할_프로토콜>

## Phase 1B 임무: 점성술 심층 분석
Phase 1A에서 도출한 핵심 요약과 오행 균형을 바탕으로, 점성술 심층 분석을 수행하십시오.

<style_guide>
**나쁜 예 (X):**
- "태양이 물병자리라서 창의적입니다."
- "타로에서 좋은 카드가 나왔습니다."

**좋은 예 (O):**
- "태양(물병자리)은 혁신을 갈구하지만, 달(게자리)은 안전을 원합니다. 이 내면의 줄다리기가 커리어에서 '아이디어는 넘치지만 실행이 늦어지는' 패턴으로 나타납니다. (근거: 태양-달 스퀘어 각도)"
- "과거 카드 'The Tower'가 원국의 子午冲과 정확히 겹칩니다. 2024년경 예상치 못한 급변이 있었을 것이며, 이는 성장의 발판이 됩니다. (근거: 자오충 + Tower 상징 일치)"
</style_guide>

## 응답 요구사항 (JSON)
{
  "astro_deep": {
    "sun_moon_dynamic": {
      "title": "내면과 외면의 조화 (태양 · 달 별자리)",
      "content": "반드시 3단락 구조로 작성: (1) <점성술_데이터>의 두 별자리 원소 관계와 핵심 긴장/조화를 (근거: [태양별자리]-[달별자리] 관계) 형식으로 서술, (2) 일상 행동 패턴으로의 구체적 발현 예시, (3) <사주_원국>의 일간과의 교차 비교, 사용자 질문에 대한 행동/리스크/재검토 경계. 고위험 사안에서는 마지막 문장을 문서/질문/비용 비교 점검으로만 쓰십시오. 근거가 약한 대목은 조건과 재검토 경계로 표현."
    },
    "ascendant_influence": {
      "title": "사회적 페르소나와 첫인상 (상승궁 · 어센던트)",
      "content": "반드시 포함: (1) 태양별자리와 상승궁의 '겉과 속의 갭' — 남들에게 보이는 모습 vs. 실제 내면의 차이를 (근거: [상승궁] 특성) 형식으로 확정 서술, (2) 직장/연애 등 특정 상황에서의 발현 예시, (3) 사용자 질문에서 이 갭이 만드는 리스크와 대응. 고위험 사안에서는 대응을 전문가 검토 기준으로만 쓰십시오. 데이터에 없는 내용을 추측하지 마십시오."
    },
    "dominant_element": {
      "title": "기질적 핵심 원소와 에너지 분포 (원소 밸런스)",
      "content": "반드시 포함: (1) <사주_원국> 기반 핵심 성격 특성을 (근거: [지배 오행] 비율) 형식으로 인용, (2) 과잉 시 나타나는 구체적 부작용 진단, (3) 부족 원소로 균형 잡는 전략, (4) 사용자 질문에서 당장 바꿀 행동. 고위험 사안의 행동은 문서 검토, 전문가 질문, 비용/리스크 비교로만 쓰십시오. '~할 수도 있습니다' 표현 금지."
    },
    "planetary_warning": {
      "title": "주의해야 할 행성 주기와 타이밍 (리스크 관리)",
      "content": "반드시 포함: (1) 현재 행성 위치 기준 영향 영역(커리어/연애/건강) 확정 진단, (2) 구체적 시기(YYYY-MM 범위)와 대처법, (3) 근거가 약할 때의 재검토 조건. 고위험 사안의 대처법은 중립적 준비 작업으로만 쓰십시오. 근거 없는 날짜를 창작하지 마십시오."
    }
  }
}

## 작성 규칙
1. **근거 필수**: 모든 주장 뒤에 (근거: [별자리/사주 관계]) 형식 명시. **제공된 데이터에 없는 글자를 절대 창작하지 마십시오.**
2. **불확실성 처리**: 근거가 충분한 대목은 선명하게 쓰고, 근거가 약한 대목은 조건과 재검토 경계로 표현하십시오.
3. **논점 충족**: 각 필드의 구조 요구사항을 반드시 만족. 빈 말 반복 금지.
4. Phase 1A의 핵심 분석 결론(오행 균형, 신뢰 점수 등)을 참조하여 일관성을 유지하십시오.
5. **고위험/전문 판단 경계**: 비자/이민/법률/세금/재무 리스크에서는 점성 타이밍을 압박과 재검토 창으로만 설명하고, 비자 신청/연장/갱신/변경, 체류/귀국 결정, 서류 접수/제출, 항공권/비행기 표 예매, 귀국 준비 개시, 체류 경로 중단/전환, 잔류/귀국 선택 확정, 전문가 조언 생략을 직접 지시하지 마십시오. 문서, 마감, 전문가에게 물어볼 질문, 비용/리스크 비교, 버퍼, 전문가 검토 기준으로만 안내하십시오.
6. **안전 결말 형식**: 고위험 사안에서 astro_deep.content 각 필드의 마지막 문장은 다음 형식으로 끝내십시오: "따라서 이 항목의 실천은 문서/질문/비용 비교 점검이며, 전문가 검토 전 특정 선택 확정은 보류하는 재검토 기준으로 둡니다." 마지막 문장에 체류, 귀국, 신청, 연장, 접수, 제출, 중단, 전환을 넣지 마십시오.
7. **이모지 금지**: 제목(title) 및 내용에 이모지를 넣지 마십시오.`;
  }

  const user = buildUserContext(userData) + buildPreviousPhaseContext(previousData, lang);
  return { system, user };
}
