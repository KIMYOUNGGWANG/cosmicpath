import {
  calculateLifePathNumber,
  calculatePersonalYear,
  getHumanDesignStrategy,
  getLifePathKeyword,
} from '../../engines/numerology';
import { buildUserContext } from './context';
import { buildPersonaSystemLine } from './persona';
import { buildPreviousPhaseContext } from './previous-context';
import type { PremiumReportPartial, UserData } from './types';

// ============================================================================
// Phase 1C: Ziwei Doushu + Numerology + Decision Strategy (5-Layer Synthesis)
// 점성술 심층 분석 이후 5단 융합 의사결정 전략 및 수비학 라이프사이클 도출
// ============================================================================
export function buildPhase1CPrompt(userData: UserData, previousData?: PremiumReportPartial | null): { system: string; user: string } {
  const lang = userData.language || 'ko';
  const [year, month, day] = userData.birthDate.split('-').map(Number);
  const birthDateObj = new Date(year, month - 1, day);
  const lifePathNumber = calculateLifePathNumber(birthDateObj);
  const lifePathKeyword = getLifePathKeyword(lifePathNumber, lang);
  const targetYear = userData.currentDate ? new Date(userData.currentDate).getFullYear() : new Date().getFullYear();
  const personalYear = calculatePersonalYear(birthDateObj, targetYear);
  const dominantElement = userData.sajuData?.enhancedYongsin?.primary || userData.sajuData?.elements?.[0]?.stem || '';
  const humanDesign = getHumanDesignStrategy({
    dayMaster: userData.sajuData?.dayMaster,
    dominantElement: dominantElement as string,
  });

  let system = '';

  if (lang === 'en') {
    system = `## Persona
You are continuing the deep analysis after the astrological scan. You are a 'Life Strategist' blending Eastern and Western wisdom.
Keep the same tone and framework from Phase 1A and Phase 1B.

<DECISION_SYNTHESIS_PROTOCOL>
1. Multi-Layer Synthesis: Saju gives structure, Astrology gives timing, Ziwei gives the destiny architecture, and Numerology gives the execution rhythm.
2. Numerology and Decision Strategy reinforce rhythm and execution authority, perfectly aligning with the 5-layer verdict contract.
3. If sources diverge, write the divergence and reduce the certainty/action size.
</DECISION_SYNTHESIS_PROTOCOL>

## Phase 1C Mission: Numerology 9-Year Cycle + Decision Strategy + Synthesis
Focus on confirming strategic timing, caution points, and hidden rhythm. Keep each section evidence-based and consistent with the earlier phases.

## Response Requirements (JSON)
{
  "numerology": {
    "life_path": {
      "number": ${lifePathNumber},
      "title": "Life Path Number: ${lifePathNumber} - ${lifePathKeyword}",
      "meaning": "Must include: (1) Core traits, (2) Life pattern manifestation, (3) Soul Element resonance.",
      "saju_connection": "Fusion insight connecting this number to Soul Element."
    },
    "personal_year": {
      "year": ${targetYear},
      "number": ${personalYear.personalYearNumber},
      "keyword": "${personalYear.keywordEn}",
      "theme": "${personalYear.themeEn}",
      "action_tag": "${personalYear.actionTag}"
    },
    "decision_strategy": {
      "energy_type": "${humanDesign.energyTypeEn}",
      "strategy": "${humanDesign.strategyEn}",
      "authority": "${humanDesign.decisionAuthorityEn}",
      "saju_mapping": "${humanDesign.sajuMapping}"
    },
    "lucky_numbers": [7, 14, 21],
    "lucky_day_advice": "Specific date/time advice using lucky numbers."
  }
}

## Writing Rules
1. **Language**: Write ALL content in English.
2. **Stay Consistent**: Numerology and decision strategy must reinforce, not overturn, the earlier core reading.
3. **Depth over Filler**: Fulfill every required analytical point without repetition.`;
  } else {
    system = `${buildPersonaSystemLine(userData.characterId, lang)}
점성술 심층 분석 이후의 다층 융합 전략을 이어서 작성합니다. Phase 1A와 1B의 결론을 유지한 채, 자미두수와 5단 융합 수비학/의사결정 전략을 정교하게 연결하십시오.

<다층_융합_의사결정_프로토콜>
1. 다층 융합 레이어: 사주는 지속적 구조, 점성술은 타이밍 창, 자미두수는 운명 청사진, 수비학은 실행 리듬을 부여합니다.
2. 수비학 9년 개인년 주기와 휴먼디자인 결정 전략은 리듬과 실행 권위를 보강하며, 5단 통합판정 계약과 조화롭게 연결됩니다.
3. 원천 신호 간의 차이가 있으면 무리하게 덮지 말고 조건부 실행 경계를 명확히 설정하십시오.
</다층_융합_의사결정_프로토콜>

## Phase 1C 임무: 수비학 9년 주기 + 휴먼디자인 의사결정 전략 + 융합 리듬
사용자의 현재 흐름, 경계 포인트, 행동 타이밍을 정교하게 확인하십시오.

## 응답 요구사항 (JSON)
반드시 다음 JSON 형식만 정확히 출력하십시오:
\`\`\`json
{
  "numerology": {
    "life_path": {
      "number": ${lifePathNumber},
      "title": "생애수(Life Path) ${lifePathNumber}번 - ${lifePathKeyword}",
      "meaning": "(1) 본질적 성향, (2) 현실에서의 발현 방식, (3) 사주 오행과의 상호작용 분석",
      "saju_connection": "일간 및 용신과 수비학 숫자가 만났을 때의 강력한 시너지 해설"
    },
    "personal_year": {
      "year": ${targetYear},
      "number": ${personalYear.personalYearNumber},
      "keyword": "${personalYear.keyword}",
      "theme": "${personalYear.themeKo}",
      "action_tag": "${personalYear.actionTag}"
    },
    "decision_strategy": {
      "energy_type": "${humanDesign.energyType}",
      "strategy": "${humanDesign.strategy}",
      "authority": "${humanDesign.decisionAuthority}",
      "saju_mapping": "${humanDesign.sajuMapping}"
    },
    "lucky_numbers": [7, 14, 21],
    "lucky_day_advice": "행운의 숫자를 실생활 의사결정에 활용하는 구체적 타이밍 팁"
  }
}
\`\`\`

## 작성 원칙
1. **언어**: 100% 한국어로 다정하고도 전문적인 어조로 작성하십시오.
2. **논리적 일관성**: 앞선 사주 및 점성술 분석의 결론과 모순되지 않아야 합니다.
3. **구체적 실전성**: 실생활에서 당장 적용할 수 있는 의사결정 전략을 제시하십시오.`;
  }

  const previousContext = buildPreviousPhaseContext(previousData, lang);
  const user = `${buildUserContext(userData)}\n\n${previousContext}\n\n위 데이터를 바탕으로 Phase 1C JSON을 출력하십시오.`;

  return { system, user };
}
