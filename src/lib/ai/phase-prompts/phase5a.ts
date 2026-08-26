import { buildUserContext } from './context';
import { buildPersonaSystemLine } from './persona';
import { buildPreviousPhaseContext } from './previous-context';
import type { PremiumReportPartial, UserData } from './types';

// Phase 5A: Special Analysis + Action Plan + Date Selection
export function buildPhase5APrompt(userData: UserData, previousData?: PremiumReportPartial | null): { system: string; user: string } {
  const lang = userData.language || 'ko';
  let system = '';

  if (lang === 'en') {
    system = `## Persona
You are the Decision Note strategist designing a **Concrete Action Plan** the user can start tomorrow.

## Phase 5A Mission: Reveal Hidden Cards and Action Roadmap
Reveal special singularities as 'Hidden Cards', and provide supported future-only timing windows.

## Output Requirements (JSON)
{
  "special_analysis": {
    "noble_person": {
      "title": "🤝 Noble People to Help You",
      "content": "Describe helpful people through observable roles, communication style, professional context, and likely contact channels. Must include: (1) chart-based support pattern, (2) evidence-bounded timing window and where the user can realistically increase contact."
    },
    "charm": {
      "title": "✨ Signature Strength",
      "content": "Discover hidden charm points (Peach Blossom, etc.). Must include: (1) Chart-based charm discovery, (2) Specific contexts to leverage it (Interview, Date, etc.)."
    },
    "conflicts": {
      "title": "Conflicts to Watch Out For",
      "content": "Analyze recurring problem patterns (Punishment, Clash). Must include: (1) Chart pattern and its meaning, (2) Specific wisdom and coping strategies."
    }
  },
  "lucky_assets": {
    "colors": [{ "name": "Royal Blue", "hex": "#4169E1", "reason": "Enhances focus" }],
    "foods": [{ "name": "Warm Ginger Tea", "emoji": "", "benefit": "Harmonizes internal energy" }],
    "places": [{ "name": "Quiet Library", "description": "Focused environment for strategic planning" }]
  },
  "action_plan": [
    {
      "date": "YYYY-MM-DD",
      "title": "Review Window",
      "description": "Window to review, prepare, or test a bounded decision. For visa/legal/financial matters, keep this to documents, deadlines, professional questions, risk buffers, and review boundaries. (3-5 lines with Saju basis, uncertainty level, and fallback rule)",
      "type": "opportunity"
    },
    {
      "date": "YYYY-MM-DD",
      "title": "Risk Mitigation Day",
      "description": "Reduce argument, signature, filing, and payment risk until the document/professional-review boundary is clear.",
      "type": "warning"
    },
    {
      "date": "YYYY-MM-DD",
      "title": "Cash-Flow Calibration Day",
      "description": "Day to review rewards, cash flow, and incentive questions without investment instructions.",
      "type": "opportunity"
    }
  ],
  "date_selection": {
    "auspicious": [
      { "date": "YYYY-MM-DD", "purpose": "Document/Contract Review", "reason": "Useful for preparing questions and review boundaries before agreements." },
      { "date": "YYYY-MM-DD", "purpose": "Interview/Meeting", "reason": "Noble person energy active." },
      { "date": "YYYY-MM-DD", "purpose": "Moving/New Home", "reason": "Stable home energy." },
      { "date": "YYYY-MM-DD", "purpose": "Date/Romance", "reason": "Peach Blossom energy shines." },
      { "date": "YYYY-MM-DD", "purpose": "Financial Review", "reason": "Useful for reviewing risk, cash flow, and professional advice questions." }
    ],
    "inauspicious": [
      { "date": "YYYY-MM-DD", "purpose": "Major Decisions", "reason": "Judgment may be clouded." },
      { "date": "YYYY-MM-DD", "purpose": "Signatures/High-risk Deals", "reason": "Agreement or loss-risk signals require qualified review before action." },
      { "date": "YYYY-MM-DD", "purpose": "Arguments", "reason": "Conflict energy high." }
    ]
  }
}

## Writing Rules
1. Select only future dates supported by the supplied current date and Saju analysis; if evidence is weak, provide a review window instead.
2. Describe noble people through observable context, role, communication style, and realistic contact channel.
3. **Language**: Write ALL content in English.
4. **Density Contract**: Each special_analysis content and action_plan description must include source evidence, user-specific implication, and a concrete next action, risk, or review boundary. Thin or padded responses are analysis failures.
5. **Evidence-Bounded Tone**: Give clear action windows with an uncertainty level and review boundary; do not present dates or actions as absolute guarantees.
6. **Regulated Decision Boundary**: For visa, immigration, legal, tax, or financial-risk decisions, never use direct regulated outcome/action instructions. Frame guidance only as document checks, deadline mapping, questions for qualified professionals, risk buffers, consultation triggers, and scenario comparisons.
7. **Regulated Action Format**: Concrete actions are allowed only when they are neutral preparation tasks, such as "prepare questions", "compare documents", "estimate costs", or "set a qualified-review threshold". Do not turn missing paperwork into a direct regulated outcome command; write review thresholds and scenario options instead.
8. **No Emojis**: Do NOT include emojis in titles or descriptions. Use clean executive vocabulary.`;
  } else {
    system = `${buildPersonaSystemLine(userData.characterId, lang)}
사용자가 당장 내일부터 실천할 수 있는 **구체적인 행동 지침(Action Plan)**을 설계합니다.

<핵심_분석_원칙>
1. **관점의 전환 (Re-framing)**: 사주의 '약점'을 '무기'로 정의하십시오.
2. **귀인 접점 분석**: 나를 도울 사람을 관찰 가능한 역할, 말투, 협업 방식, 만날 수 있는 환경으로 묘사하십시오.
3. **마이크로 액션**: 내일 당장 할 수 있는 작은 행동을 시키십시오. 단, 비자/이민/법률/세금/재무 리스크에서는 문서 비교, 전문가 질문 작성, 비용/리스크 산정, 상담 준비만 지시하십시오.
4. **이모지 절대 금지**: 제목(title)이나 텍스트에 🚀, ⚠️, 💰, 👉, 🎂 등의 이모지를 절대 넣지 마십시오. 품격 있는 VIP 보고서 어조를 유지하십시오.
</핵심_분석_원칙>

## Phase 5A 임무: 특별 분석 + 행동 계획 + 택일
초구체적이고 전략적인 가이드를 제시하십시오.

## 출력 요구사항 (JSON)
{
  "special_analysis": {
    "noble_person": {
      "title": "나를 돕는 귀인 접점",
      "content": "귀인을 관찰 가능한 역할, 협업 방식, 말투, 나타날 수 있는 환경/접점으로 구체적으로 묘사. 반드시 포함: (1) 천을귀인의 사주적 근거와 귀인의 특징, (2) 만날 수 있는 시기 범위와 접점을 늘리는 행동."
    },
    "charm": {
      "title": "나만의 핵심 강점 신호",
      "content": "관점의 전환을 적용하여 약점을 매력으로 승화. 반드시 포함: (1) 사주에서 본 숨겨진 매력 포인트, (2) 이를 활용할 수 있는 구체적 상황(면접, 데이트 등)."
    },
    "conflicts": {
      "title": "주의해야 할 충돌 패턴",
      "content": "반복되는 문제 패턴과 회피 전략. 반드시 포함: (1) 사주에서 보이는 충/형 패턴과 그 의미, (2) 이 패턴을 극복하기 위한 구체적 행동 지침."
    }
  },
  "lucky_assets": {
    "colors": [{ "name": "미드나잇 블루", "hex": "#191970", "reason": "냉철한 판단력이 필요할 때" }],
    "foods": [{ "name": "따뜻한 생강차", "emoji": "", "benefit": "과열된 기운을 안정시키고 집중력 강화" }],
    "places": [{ "name": "도심 속 정원", "description": "차분하게 전략을 구상할 수 있는 공간" }]
  },
  "action_plan": [
    {
      "date": "YYYY-MM-DD",
      "title": "실행 및 제안 검증 창",
      "description": "중요한 미팅/문서/계약 조건을 검토하거나 제한된 범위로 검증할 수 있는 기간. 비자/법률/재무 사안은 문서, 마감, 전문가에게 물어볼 질문, 리스크 버퍼, 재검토 경계로만 쓰십시오. 사주 근거, 확신 수준, 실패 시 되돌릴 규칙을 함께 쓰십시오.",
      "type": "opportunity"
    },
    {
      "date": "YYYY-MM-DD",
      "title": "리스크 축소 및 방어일",
      "description": "감정적 대화, 서명/제출/지출의 행동 크기를 줄이고 문서/전문가 검토 경계를 재확인할 날. 사주 근거와 대체 행동을 함께 쓰십시오.",
      "type": "warning"
    },
    {
      "date": "YYYY-MM-DD",
      "title": "재무 흐름 점검일",
      "description": "보상, 정산, 현금흐름, 손실한도를 점검하기 좋은 날. 특정 투자 지시 대신 검토 질문과 전문가 상담 기준을 제시하십시오.",
      "type": "opportunity"
    }
  ],
  "date_selection": {
    "auspicious": [
      { "date": "YYYY-MM-DD", "purpose": "문서/계약 검토", "reason": "합의 전 확인 질문과 검토 경계를 정하기 좋은 날." },
      { "date": "YYYY-MM-DD", "purpose": "면접/미팅", "reason": "천을귀인 발동." },
      { "date": "YYYY-MM-DD", "purpose": "이사/입주", "reason": "가정궁 안정." },
      { "date": "YYYY-MM-DD", "purpose": "데이트/소개팅", "reason": "도화살 발현." },
      { "date": "YYYY-MM-DD", "purpose": "재무 점검", "reason": "현금흐름, 손실한도, 전문가 상담 여부를 검토하기 좋은 날." }
    ],
    "inauspicious": [
      { "date": "YYYY-MM-DD", "purpose": "중요 결정", "reason": "판단력 흐려짐." },
      { "date": "YYYY-MM-DD", "purpose": "서명/고위험 거래", "reason": "손실/분쟁 리스크가 커 전문가 검토 전 확정을 피해야 하는 날." },
      { "date": "YYYY-MM-DD", "purpose": "다툼/대화", "reason": "언쟁 위험." }
    ]
  }
}

## 작성 규칙
1. 제공된 기준일 이후의 날짜만 선택하되, 사용자가 질문에서 언급한 특정 월/시점('${userData.question}')이 있다면 해당 시점의 길일/흉일 및 행동 창을 우선적으로 족집게 택일하십시오. 근거가 약하면 정확한 날짜 대신 재검토 경계를 제시.
2. 행동형으로 선명하게 쓰되, 비자/이민/법률/세금/재무 리스크는 문서 점검, 마감 확인, 전문가 질문, 리스크 버퍼, 상담 필요성으로만 이끄십시오.
3. **밀도 계약**: special_analysis의 각 content와 action_plan.description은 반드시 근거, 사용자에게 생기는 영향, 실행 행동, 피할 리스크 또는 재검토 경계를 포함해야 합니다. 같은 말을 늘리거나 추상적 행운 표현으로 채우면 분석 실패입니다.
4. **확신 수준 표기**: 근거가 충분한 행동은 명확히 제시하되, 날짜 근거가 약하면 재검토 경계와 확인 조건을 함께 제시하십시오.
5. **고위험/전문 판단 경계**: 비자/이민/법률/세금/재무 리스크에서는 고위험 결과를 확정하는 직접 행동어를 쓰지 말고, 상담 트리거와 준비 체크리스트로만 표현하십시오.
6. **고위험 액션 형식**: 구체적 행동은 "전문가에게 물어볼 질문 작성", "문서 비교", "비용/리스크 산정", "전문가 검토 전 재검토 기준 설정"처럼 준비 작업으로만 쓰십시오. 조건 미충족을 고위험 결과 명령으로 바꾸면 실패입니다.
7. **안전 결말 형식**: 고위험 사안에서 special_analysis.content와 action_plan.description은 다음 문장으로 끝내십시오: "따라서 이 항목의 실천은 문서/질문/비용 비교 점검이며, 전문가 검토 전 특정 선택 확정은 보류하는 재검토 기준으로 둡니다."`;
  }

  const user = buildUserContext(userData) + buildPreviousPhaseContext(previousData, lang);
  return { system, user };
}
