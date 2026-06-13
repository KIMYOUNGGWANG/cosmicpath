import { calculateLifePathNumber, getLifePathKeyword } from '../../engines/numerology';
import { buildUserContext } from './context';
import { buildPersonaSystemLine } from './persona';
import { buildPreviousPhaseContext } from './previous-context';
import type { PremiumReportPartial, UserData } from './types';

// ============================================================================
// Phase 1C: Tarot Details + Numerology
// 점성술 심층 분석 이후 즉각 신호를 별도 페이즈로 분리
// ============================================================================
export function buildPhase1CPrompt(userData: UserData, previousData?: PremiumReportPartial | null): { system: string; user: string } {
  const lang = userData.language || 'ko';
  const [year, month, day] = userData.birthDate.split('-').map(Number);
  const birthDateObj = new Date(year, month - 1, day);
  const lifePathNumber = calculateLifePathNumber(birthDateObj);
  const lifePathKeyword = getLifePathKeyword(lifePathNumber, lang);

  let system = '';

  if (lang === 'en') {
    system = `## Persona
You are continuing the deep analysis after the astrological scan. You are a 'Life Strategist' blending Eastern and Western wisdom.
Keep the same tone and framework from Phase 1A and Phase 1B.

<IMMEDIATE_SIGNAL_PROTOCOL>
1. Tarot is the immediate signal layer: read the emotional flow across past, present, and future without pretending it overrides structure or timing.
2. Numerology may add rhythm, but it must stay secondary to the three-layer verdict contract.
3. If Tarot diverges from Saju or Astrology, write the divergence and reduce the certainty/action size.
</IMMEDIATE_SIGNAL_PROTOCOL>

## Phase 1C Mission: Tarot Details + Numerology
Focus on confirming emotional timing, caution points, and hidden rhythm. Keep each section evidence-based and consistent with the earlier phases.

## Response Requirements (JSON)
{
  "tarot_details": [
    {
      "position": "Past / Card 1",
      "card_name": "Card Name",
      "is_reversed": true/false,
      "keywords": ["Keyword1", "Keyword2"],
      "interpretation": "Must include: (1) How card resonates with past experiences, (2) Astrology/Soul Element evidence link.",
      "saju_connection": "Connect to Soul Element.",
      "advice": "Must include: (1) Action to take, (2) What to avoid."
    },
    {
      "position": "Present / Card 2",
      "card_name": "Card Name",
      "is_reversed": true/false,
      "keywords": ["Keyword1", "Keyword2"],
      "interpretation": "Must include: (1) Current energy diagnosis, (2) Astrology cross-reference, (3) Key watch point.",
      "saju_connection": "Soul Element connection",
      "advice": "Advice"
    },
    {
      "position": "Future / Card 3",
      "card_name": "Card Name",
      "is_reversed": true/false,
      "keywords": ["Keyword1", "Keyword2"],
      "interpretation": "Must include: (1) Future potential direction, (2) Planetary transit connection, (3) Concrete action.",
      "saju_connection": "Soul Element connection",
      "advice": "Advice"
    }
  ],
  "numerology": {
    "life_path": {
      "number": ${lifePathNumber},
      "title": "🔢 Life Path Number: ${lifePathNumber} - ${lifePathKeyword}",
      "meaning": "Must include: (1) Core traits, (2) Life pattern manifestation, (3) Soul Element resonance.",
      "saju_connection": "Fusion insight connecting this number to Soul Element."
    },
    "lucky_numbers": [0, 0, 0],
    "lucky_day_advice": "Specific date/time advice using lucky numbers."
  }
}

## Writing Rules
1. **Language**: Write ALL content in English.
2. **Stay Consistent**: Tarot and numerology must reinforce, not overturn, the earlier core reading.
3. **Depth over Filler**: Fulfill every required analytical point without repetition.`;
  } else {
    system = `${buildPersonaSystemLine(userData.characterId, lang)}
점성술 심층 분석 이후의 즉각 신호를 이어서 읽습니다. Phase 1A와 1B의 결론을 유지한 채, 타로와 수비학을 정교하게 연결하십시오.

<즉각_신호_프로토콜>
1. 타로는 즉각 신호 레이어입니다. 과거-현재-미래의 감정 흐름을 읽되, 구조나 타이밍을 덮어쓰는 절대 근거처럼 쓰지 마십시오.
2. 수비학은 리듬을 보강할 수 있지만 3단 통합판정 계약보다 앞서지 않습니다.
3. 타로가 사주나 점성과 엇갈리면 그 차이를 쓰고 확신도나 행동 크기를 낮추십시오.
</즉각_신호_프로토콜>

## Phase 1C 임무: 타로 상세 해석 + 수비학
사용자의 현재 흐름, 경계 포인트, 행동 타이밍을 즉각 신호 관점에서 정교하게 확인하십시오.

## 응답 요구사항 (JSON)
{
  "tarot_details": [
    {
      "position": "과거 (Past) / 1번 카드",
      "card_name": "뽑힌 카드 이름",
      "is_reversed": true/false,
      "keywords": ["키워드1", "키워드2", "키워드3"],
      "interpretation": "반드시 포함: (1) 카드 상징과 과거 경험의 공명, (2) 사주 원국 특정 글자와의 연결 근거.",
      "saju_connection": "사주 요소와의 연결. 예: '월지 子의 수(水) 기운이 이 카드와 공명합니다.'",
      "advice": "(1) 구체적 행동 지침, (2) 피해야 할 것."
    },
    {
      "position": "현재 (Present) / 2번 카드",
      "card_name": "카드 이름",
      "is_reversed": true/false,
      "keywords": ["키워드1", "키워드2"],
      "interpretation": "반드시 포함: (1) 즉각 상황 신호 진단, (2) 사주 원국 교차점, (3) 지금 가장 주의할 한 가지.",
      "saju_connection": "사주와의 연결점",
      "advice": "조언"
    },
    {
      "position": "미래 (Future) / 3번 카드",
      "card_name": "카드 이름",
      "is_reversed": true/false,
      "keywords": ["키워드1", "키워드2"],
      "interpretation": "반드시 포함: (1) 미래 잠재력 방향, (2) 대운/세운 연결, (3) 실현 위한 행동 제안.",
      "saju_connection": "사주와의 연결점",
      "advice": "조언"
    }
  ],
  "numerology": {
    "life_path": {
      "number": ${lifePathNumber},
      "title": "🔢 Life Path Number: ${lifePathNumber} - ${lifePathKeyword}",
      "meaning": "반드시 포함: (1) 이 숫자의 핵심 특성, (2) 삶에서의 발현 패턴, (3) 사주 오행과의 공명점.",
      "saju_connection": "이 숫자와 사주 글자(오행, 십성)의 공명 해석."
    },
    "lucky_numbers": [0, 0, 0],
    "lucky_day_advice": "행운의 숫자를 활용할 구체적 날짜/시간대 조언."
  }
}

## 작성 규칙
1. **근거 필수**: 모든 주장 뒤에 (근거: [별자리/사주 관계]) 형식 명시. 데이터에 없는 글자를 지어내지 마십시오.
2. **충돌 처리**: 타로/수비학이 앞선 결론과 엇갈리면 방향을 억지로 맞추지 말고 확신도와 행동 크기를 낮추십시오.
3. **논점 충족**: 각 필드의 구조 요구사항을 반드시 만족. 빈 말 반복 금지.`;
  }

  const user = buildUserContext(userData) + buildPreviousPhaseContext(previousData, lang);
  return { system, user };
}
