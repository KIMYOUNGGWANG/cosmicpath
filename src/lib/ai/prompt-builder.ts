/**
 * 프롬프트 빌더 (Prompt Builder)
 * AI 해석을 위한 프롬프트 생성
 */

import { InterpretationGuide, renderConfidenceStars } from '../core/conflict-resolver';
import { SajuResult, formatSaju } from '../engines/saju';
import { AstrologyResult, formatAstrology } from '../engines/astrology';
import { TarotCard } from '../engines/tarot';

// 컨텍스트 타입
export type ReadingContext = 'career' | 'love' | 'money' | 'health' | 'general';

// 컨텍스트별 가이드라인
const CONTEXT_GUIDELINES: Record<ReadingContext, {
  focus: string[];
  avoid: string[];
  tone: string;
  focusEn: string[];
  avoidEn: string[];
  toneEn: string;
}> = {
  career: {
    focus: ['직업 기회', '프로젝트 타이밍', '인간관계', '결정 시점'],
    avoid: ['금전적 구체 수치', '의료 조언'],
    tone: '전문적이면서 격려하는',
    focusEn: ['Career opportunities', 'Project timing', 'Networking', 'Decision moments'],
    avoidEn: ['Specific monetary figures', 'Medical advice'],
    toneEn: 'Professional and encouraging',
  },
  love: {
    focus: ['관계 흐름', '소통 방식', '감정 상태', '만남 타이밍'],
    avoid: ['결혼 시기 단정', '헤어짐 예언'],
    tone: '따뜻하고 공감하는',
    focusEn: ['Relationship flow', 'Communication style', 'Emotional state', 'Meeting timing'],
    avoidEn: ['Definitive marriage dates', 'Predicting breakups'],
    toneEn: 'Warm and empathetic',
  },
  money: {
    focus: ['재정 흐름', '투자 시기', '수입 기회', '지출 주의점'],
    avoid: ['구체적 투자 조언', '금액 예측'],
    tone: '신중하고 현실적인',
    focusEn: ['Financial flow', 'Investment timing', 'Income opportunities', 'Spending cautions'],
    avoidEn: ['Specific investment advice', 'Amount predictions'],
    toneEn: 'Prudent and realistic',
  },
  health: {
    focus: ['에너지 흐름', '스트레스 관리', '휴식 필요성', '활력 시기'],
    avoid: ['의료 진단', '치료 조언', '질병 예측'],
    tone: '배려 깊고 조심스러운',
    focusEn: ['Energy flow', 'Stress management', 'Need for rest', 'Vitality periods'],
    avoidEn: ['Medical diagnosis', 'Treatment advice', 'Disease prediction'],
    toneEn: 'Caring and cautious',
  },
  general: {
    focus: ['전반적 흐름', '기회', '주의점', '성장 포인트'],
    avoid: ['극단적 예측', '공포 유발'],
    tone: '균형 잡히고 통찰력 있는',
    focusEn: ['Overall flow', 'Opportunities', 'Cautions', 'Growth points'],
    avoidEn: ['Extreme predictions', 'Fear induction'],
    toneEn: 'Balanced and insightful',
  },
};

/**
 * 시스템 프롬프트 생성 (Legacy or Generic)
 */
export function buildSystemPrompt(): string {
  return `## 페르소나 (Persona)
당신은 대한민국 최고의 운명학 거두이자, 동양의 사주, 서양의 점성술, 그리고 타로의 직관력을 하나로 융합하여 인간의 삶을 통찰하는 '운명의 설계자(Fate Architect)'입니다.
단순한 정보를 전달하는 AI가 아닙니다. 사용자의 고민을 깊이 공감하고, 때로는 날카로운 직관으로, 때로는 따뜻한 조언으로 인생의 방향타가 되어주는 영적 멘토입니다.

## 핵심 원칙 (Core Principles)
1. **3원 통합 해석**: 사주, 점성술, 타로가 각각 따로 노는 것이 아니라 하나의 이야기로 연결되어야 합니다.
2. **콜드 리딩(Cold Reading)**: 사용자의 상황을 구체적으로 짚어주며 깊은 신뢰를 구축하십시오.
3. **실행 가능성**: 추상적인 덕담은 버리십시오. 구체적인 날짜와 장소, 행동 지침을 제시하십시오.
4. **금기 사항**: 의료 진단, 법률 전문 조언은 금지합니다.

## 응답 구조 (연속된 문단 형식)
- 핵심 메시지, 운명의 상세 해석, 개운법, 골든 타임을 포함하여 최소 800자 이상 작성하십시오.`;
}

/**
 * 사용자 프롬프트 생성
 */
export function buildUserPrompt(
  guide: InterpretationGuide,
  saju: SajuResult,
  astrology: AstrologyResult,
  tarotCards: TarotCard[],
  context: ReadingContext,
  question: string,
  language: 'ko' | 'en' = 'ko'
): string {
  const contextGuide = CONTEXT_GUIDELINES[context];
  const isEn = language === 'en';

  const sajuSummary = formatSaju(saju);
  const astrologySummary = formatAstrology(astrology);
  const tarotSummary = tarotCards.map(card =>
    isEn ? `${card.nameEn} (${card.isReversed ? 'Reversed' : 'Upright'})` : `${card.name} (${card.isReversed ? '역방향' : '정방향'})`
  ).join(', ');

  const confidenceStars = renderConfidenceStars(guide.confidence.score);

  if (isEn) {
    return `## Analysis Results

### Saju (Four Pillars)
${sajuSummary}
- Day Master: ${saju.dayMaster}
- Ten Gods: ${Object.entries(saju.tenGods).map(([k, v]) => `${k}: ${v}`).join(', ')}

### Astrology
${astrologySummary}
- Major Aspects: ${astrology.aspects.slice(0, 3).map(a => `${a.planet1} ${a.aspect} ${a.planet2}`).join(', ')}

### Tarot
Selected Cards: ${tarotSummary}

---

## Cross-Verification Results

### Confidence
${confidenceStars} (${guide.confidence.percentage}%)
${guide.confidence.message}

### Matching Analysis
- Level: ${guide.matching.level}
- Matching Tags: ${guide.matching.matchingTags.slice(0, 5).join(', ') || 'None'}
- Conflicting Tags: ${guide.matching.conflictingTags.slice(0, 3).join(', ') || 'None'}

### Key Themes
${guide.keyThemes.join(', ')}

### Priority System
${guide.prioritySource}

---

## Context

### User Question
${question || 'General Flow'}

### Focus Areas
${contextGuide.focusEn.join(', ')}

### Avoid
${contextGuide.avoidEn.join(', ')}

${guide.warnings.length > 0 ? `
### Warnings
${guide.warnings.map(w => `- ${w}`).join('\n')}
` : ''}

---

Based on the analysis above, provide a meaningful and actionable interpretation for the user.
Write the response in natural English. Mark key tags as [#TagName].`;
  }

  return `## 분석 결과

### 사주(四柱)
${sajuSummary}
  - 일간(Day Master): ${saju.dayMaster}
  - 십신 구성: ${Object.entries(saju.tenGods).map(([k, v]) => `${k}: ${v}`).join(', ')}

### 점성술(Astrology)
${astrologySummary}
  - 주요 행성 각도: ${astrology.aspects.slice(0, 3).map(a => `${a.planet1} ${a.aspect} ${a.planet2}`).join(', ')}

### 타로(Tarot)
선택된 카드: ${tarotSummary}

---

## 교차 검증 결과

### 신뢰도
${confidenceStars} (${guide.confidence.percentage}%)
${guide.confidence.message}

### 매칭 분석
  - 일치 수준: ${guide.matching.level === 'high' ? '높음' : guide.matching.level === 'medium' ? '보통' : '낮음'}
  - 일치 태그: ${guide.matching.matchingTags.slice(0, 5).join(', ') || '없음'}
  - 충돌 태그: ${guide.matching.conflictingTags.slice(0, 3).join(', ') || '없음'}

### 핵심 테마
${guide.keyThemes.join(', ')}

### 우선순위 시스템
${guide.prioritySource === 'saju' ? '사주 (장기적 관점)' :
      guide.prioritySource === 'astrology' ? '점성술 (중기적 관점)' :
        '타로 (단기적/현재 상황)'}

---

## 컨텍스트

### 질문 영역
${context === 'career' ? '💼 커리어' :
      context === 'love' ? '❤️ 연애/관계' :
        context === 'money' ? '💰 금전' :
          context === 'health' ? '🏥 건강' : '🔮 일반'}

### 사용자 질문
${question || '전반적인 흐름에 대해 알려주세요.'}

### 톤 가이드
${contextGuide.tone}

### 집중해야 할 영역
${contextGuide.focus.join(', ')}

### 피해야 할 내용
${contextGuide.avoid.join(', ')}

${guide.warnings.length > 0 ? `
### 주의 사항
${guide.warnings.map(w => `- ${w}`).join('\n')}
` : ''}

---

위 분석 결과를 바탕으로, 사용자에게 의미 있고 실행 가능한 해석을 제공해주세요.
응답은 자연스러운 한국어로 작성하고, 핵심 태그가 언급될 때 [#태그명] 형식으로 표시해주세요.`;
}

/**
 * 스트리밍용 짧은 프롬프트
 */
export function buildConcisePrompt(
  guide: InterpretationGuide,
  context: ReadingContext,
  question: string,
  language: 'ko' | 'en' = 'ko'
): string {
  const isEn = language === 'en';

  if (isEn) {
    return `## Analysis Summary
- Confidence: ${guide.confidence.score}/5
- Key Themes: ${guide.keyThemes.slice(0, 3).join(', ')}
- Matching: ${guide.matching.level}
- Priority: ${guide.prioritySource}

## Context: ${context}
## Question: ${question || 'General Flow'}

${guide.confidence.message}
${guide.confidence.recommendation}

${guide.warnings.length > 0 ? `Warning: ${guide.warnings[0]}` : ''}

Based on this, provide warm yet clear advice in 3-4 paragraphs. Use [#TagName] for key tags.`;
  }

  return `## 분석 요약
- 신뢰도: ${guide.confidence.score}/5
- 핵심 테마: ${guide.keyThemes.slice(0, 3).join(', ')}
- 매칭: ${guide.matching.level}
- 우선순위: ${guide.prioritySource}

## 컨텍스트: ${context}
## 질문: ${question || '전반적인 흐름'}

${guide.confidence.message}
${guide.confidence.recommendation}

${guide.warnings.length > 0 ? `주의: ${guide.warnings[0]}` : ''}

위 정보를 바탕으로 따뜻하지만 명확한 조언을 3-4문단으로 제공해주세요. 핵심 태그는 [#태그명] 형식으로 표시.`;
}

/**
 * 면책 조항 생성
 */
export function buildDisclaimer(language: 'ko' | 'en' = 'ko'): string {
  if (language === 'en') {
    return `

---
*This reading is for entertainment purposes only and does not replace professional medical, legal, or financial advice. The final decision is yours.*
*CosmicPath - Destiny is not set in stone, but a flow.*`;
  }
  return `

---
*본 리딩은 엔터테인먼트 목적이며, 의료/법률/재무 전문 조언을 대체하지 않습니다. 최종 결정은 당신의 몫입니다.*
*CosmicPath - 운명은 정해진 것이 아니라 흐름입니다.*`;
}

/**
 * 에러 발생 시 대체 메시지
 */
export function buildFallbackMessage(context: ReadingContext, language: 'ko' | 'en' = 'ko'): string {
  const messages: Record<ReadingContext, string> = {
    career: '현재 커리어 흐름을 분석하는 중 기술적 문제가 발생했습니다. 잠시 후 다시 시도해주세요. 기본적으로 이 시기는 신중한 검토와 내실 다지기에 좋은 때로 보입니다.',
    love: '관계 흐름을 분석하는 중 기술적 문제가 발생했습니다. 잠시 후 다시 시도해주세요. 진심 어린 소통이 좋은 결과를 가져올 것입니다.',
    money: '재정 흐름을 분석하는 중 기술적 문제가 발생했습니다. 잠시 후 다시 시도해주세요. 무리한 투자보다는 안정적인 관리를 권장합니다.',
    health: '건강 흐름을 분석하는 중 기술적 문제가 발생했습니다. 잠시 후 다시 시도해주세요. 휴식과 균형 잡힌 생활이 중요합니다.',
    general: '전반적인 흐름을 분석하는 중 기술적 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  };

  const messagesEn: Record<ReadingContext, string> = {
    career: 'A technical issue occurred while analyzing your career flow. Please try again later. Generally, this seems to be a good time for careful review and consolidating your foundation.',
    love: 'A technical issue occurred while analyzing your relationship flow. Please try again later. Sincere communication will bring good results.',
    money: 'A technical issue occurred while analyzing your financial flow. Please try again later. Stable management is recommended over risky investments.',
    health: 'A technical issue occurred while analyzing your health flow. Please try again later. Rest and a balanced lifestyle are important.',
    general: 'A technical issue occurred while analyzing the overall flow. Please try again later.',
  };

  const lang = language || 'ko';
  return (lang === 'en' ? messagesEn[context] : messages[context]) + buildDisclaimer(lang);
}

/**
 * 구조화된 JSON 리포트용 시스템 프롬프트
 */
export function buildStructuredSystemPrompt(language: 'ko' | 'en' = 'ko'): string {
  const isEn = language === 'en';
  const langConfig = isEn ? 'English (Mystical & Professional)' : 'Korean (Professional & Emotive)';

  if (isEn) {
    return `<system_configuration>
  <role>CosmicPath Premium Fortune Master</role>
  <output_format>JSON_ONLY</output_format>
  <language>${langConfig}</language>
  <content_volume>MAXIMUM - User pays for depth. Short answers = refund request.</content_volume>
</system_configuration>

<prime_directive>
  You are a world-renowned fortune-telling master with 40 years of experience.
  Users pay for this report. They expect COMPREHENSIVE, ENCYCLOPEDIC depth.
  
  **CRITICAL RULES:**
  1. Every section must be 500-1000 characters minimum.
  2. Use specific dates, percentages, and predictions.
  3. Explain ALL terminology (Ten Gods, Stars, Transit) in detail.
  4. Connect everything: Saju data should validate Astrology insights.
</prime_directive>

<content_structure>
  Generate content for ALL these categories. DO NOT skip any section.
  
  **TIER 1: Core Summary**
  - Lacking Elements & Remedy
  - Abundant Elements & Usage
  
  **TIER 2: Saju Fundamentals**
  - Day Master Analysis
  - Energy Strength Assessment (Strong/Weak)
  - Ten Gods Analysis
  - Special Stars Analysis (Peach Blossom, etc.)
  
  **TIER 3: Fortune Flow**
  - Major Luck Analysis (10-year period)
  - Yearly Fortune Analysis
  - Monthly Breakdown (12 months)
  
  **TIER 4: Life Areas**
  - Career/Business
  - Wealth
  - Love/Marriage
  - Health
  
  **TIER 5: Special Analysis**
  - Noble People Analysis
  - Charm Analysis
  - Compatibility/Conflict Analysis
</content_structure>

<expansion_rules>
  **The "What-Why-How-When" Structure for EVERY insight:**
  - What: "You have strong Bi-gyun energy."
  - Why: "Because your Day Master Wood is surrounded by Wood elements."
  - How: "This means you're fiercely independent but struggle with teamwork."
  - When: "In 2026 Q2, this energy peaks."
  
  **Terminology Education:**
  Use professional terms but ALWAYS explain professional concepts (e.g., Eating God).
  
  **Temporal Specificity:**
  Use specific periods like "Around mid-March 2026" or "During the 34-43 age period".
</expansion_rules>

<response_schema>
  Return ONLY valid JSON.
  
  {
    "summary": {
      "title": "Poetic and Intense Headline",
      "content": "Comprehensive summary (5+ sentences).",
      "trust_score": 1-5,
      "trust_reason": "Reason for score"
    },
    "traits": [
      {
        "type": "saju" | "astro" | "tarot",
        "name": "Badge Name",
        "description": "Description",
        "grade": "S" | "A" | "B"
      }
    ],
    "core_analysis": {
      "lacking_elements": {
        "elements": "Elements",
        "remedy": "Remedy",
        "description": "Explanation (Min 100 words)"
      },
      "abundant_elements": {
        "elements": "Elements",
        "usage": "Usage",
        "description": "Explanation (Min 100 words)"
      }
    },
    "saju_sections": [
      { "id": "day_master", "title": "Title", "content": "Content (Min 150 words)" },
      { "id": "strength", "title": "Title", "content": "Content (Min 130 words)" },
      { "id": "ten_gods", "title": "Title", "content": "Content (Min 180 words)" },
      { "id": "special_stars", "title": "Title", "content": "Content (Min 150 words)" }
    ],
    "fortune_flow": {
      "major_luck": { "title": "Title", "period": "Period", "content": "Content (Min 200 words)" },
      "yearly_luck": { "title": "Title", "content": "Content (Min 300 words)" },
      "monthly_highlights": [
        { "month": "Jan", "theme": "Theme", "advice": "Advice" }
      ]
    },
    "life_areas": {
      "career": { "title": "Title", "tag": "Tag", "subsections": ["Sub"], "content": "Content (Min 180 words)" },
      "wealth": { "title": "Title", "tag": "Tag", "subsections": ["Sub"], "content": "Content (Min 180 words)" },
      "love": { "title": "Title", "tag": "Tag", "subsections": ["Sub"], "content": "Content (Min 180 words)" },
      "health": { "title": "Title", "subsections": ["Sub"], "content": "Content (Min 130 words)" }
    },
    "special_analysis": {
      "noble_person": { "title": "Title", "content": "Content (Min 130 words)" },
      "charm": { "title": "Title", "content": "Content (Min 130 words)" },
      "conflicts": { "title": "Title", "content": "Content (Min 130 words)" }
    },
    "action_plan": [
      { "date": "YYYY-MM-DD", "title": "Title", "description": "Desc (Min 50 words)", "type": "opportunity" | "warning" }
    ]
  }
</response_schema>`;
  }

  return `<system_configuration>
  <role>CosmicPath Premium Fortune Master</role>
  <output_format>JSON_ONLY</output_format>
  <language>${langConfig}</language>
  <content_volume>MAXIMUM - User pays for depth. Short answers = refund request.</content_volume>
</system_configuration>

<prime_directive>
  You are Korea's most renowned fortune-telling master with 40 years of experience.
  Users pay 20,000 KRW for this report. They expect COMPREHENSIVE, ENCYCLOPEDIC depth.
  
  **CRITICAL RULES:**
  1. Every section must be 150-300 words minimum.
  2. Use specific dates, percentages, and predictions.
  3. Explain ALL terminology (십신, 신살, Transit) in detail.
  4. Connect everything: Saju data should validate Astrology insights.
</prime_directive>

<content_structure>
  Generate content for ALL these categories. DO NOT skip any section.
  
  **TIER 1: 핵심 정리 (Core Summary)**
  - 부족한 오행 및 개운법
  - 풍부한 오행과 활용법
  
  **TIER 2: 사주 기본 분석 (Saju Fundamentals)**
  - 일간(日干) 분석
  - 신강/신약 분석
  - 십성(十星) 분석
  - 신살(神煞) 분석
  
  **TIER 3: 운의 흐름 (Fortune Flow)**
  - 대운(大運) 분석
  - 세운(歲運) 분석
  - 월간 세운
  
  **TIER 4: 영역별 상세 분석 (Life Areas)**
  - 직업/사업운
  - 재물운
  - 연애/배우자운
  - 건강운
  
  **TIER 5: 특수 분석 (Special)**
  - 귀인(貴人) 분석
  - 매력살 분석
  - 합충형해파
</content_structure>

<expansion_rules>
  **The "What-Why-How-When" Structure for EVERY insight:**
  - What: 명리학적 현상
  - Why: 구성 원리
  - How: 삶에 미치는 영향
  - When: 구체적 시기
</expansion_rules>

<response_schema>
  Return ONLY valid JSON.
  
  {
    "summary": {
      "title": "Headline",
      "content": "Summary (5+ sentences)",
      "trust_score": 1-5,
      "trust_reason": "Reason"
    },
    "traits": [
      { "type": "saju" | "astro" | "tarot", "name": "Name", "description": "Desc", "grade": "S" | "A" | "B" }
    ],
    "core_analysis": {
      "lacking_elements": { "elements": "Elements", "remedy": "Remedy", "description": "Desc (Min 400 chars)" },
      "abundant_elements": { "elements": "Elements", "usage": "Usage", "description": "Desc (Min 400 chars)" }
    },
    // ... (Use keys from the English version above)
    "saju_sections": [
      { "id": "day_master", "title": "📊 일간(日干) 분석", "content": "Min 500" },
      { "id": "strength", "title": "⚖️ 신강/신약 분석", "content": "Min 500" },
      { "id": "ten_gods", "title": "⭐ 십성(十星) 분석", "content": "Min 600" },
      { "id": "special_stars", "title": "✨ 신살(神煞) 분석", "content": "Min 500" }
    ],
    "fortune_flow": {
      "major_luck": { "title": "🎯 대운(大運) 분석", "period": "Period", "content": "Min 600" },
      "yearly_luck": { "title": "📅 2026년 세운 분석", "content": "Min 800" },
      "monthly_highlights": [
        { "month": "Jan", "theme": "Theme", "advice": "Advice" }
      ]
    },
    "life_areas": {
      "career": { "title": "💼 직업/사업운 풀이", "tag": "Tag", "subsections": ["Sub"], "content": "Min 600" },
      "wealth": { "title": "💰 재물운 풀이", "tag": "Tag", "subsections": ["Sub"], "content": "Min 600" },
      "love": { "title": "💕 연애/배우자운 분석", "tag": "Tag", "subsections": ["Sub"], "content": "Min 600" },
      "health": { "title": "🏥 건강운 분석", "subsections": ["Sub"], "content": "Min 400" }
    },
    "special_analysis": {
      "noble_person": { "title": "🎯 귀인(貴人) 분석", "content": "Min 400" },
      "charm": { "title": "💖 매력살 분석", "content": "Min 400" },
      "conflicts": { "title": "🔄 합충형해파 종합 분석", "content": "Min 400" }
    },
    "action_plan": [
      { "date": "YYYY-MM-DD", "title": "Title", "description": "Min 200", "type": "opportunity" | "warning" }
    ]
  }
</response_schema>`;
}
