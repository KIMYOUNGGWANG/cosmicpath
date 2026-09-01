import { buildUserContext } from './context';
import { buildPersonaSystemLine } from './persona';
import { buildPreviousPhaseContext } from './previous-context';
import type { PremiumReportPartial, UserData } from './types';

// Phase 4: Life Areas
export function buildPhase4Prompt(userData: UserData, previousData?: PremiumReportPartial | null): { system: string; user: string } {
  const lang = userData.language || 'ko';
  const currentDate = userData.currentDate || new Date().toISOString().split('T')[0];
  const currentMonth = currentDate.slice(0, 7);
  let system = '';

  if (lang === 'en') {
    system = `## Persona
You are a 'Life Strategist' who provides grounded, realistic, and empowering advice.
Use the dual-engine contract across career, money, love, and health: Saju for durable structure and Major Luck, Astrology for transits, houses, and timing windows.

<LIFE_AREA_SYNTHESIS_PROTOCOL>
1. Each life area must name the strongest shared signal first.
2. Each life area must include at least one conflict or boundary when a source is missing, weak, or divergent.
3. Each life area must end with a decision-support action, risk, or review rule.
</LIFE_AREA_SYNTHESIS_PROTOCOL>

## Phase 4 Mission: Precision Diagnosis of 4 Life Areas
No abstract well-wishing. Give **decision-support guidance** with risk awareness, buffers, and professional-consultation boundaries.

## Output Requirements (JSON)
{
  "life_areas": {
    "career": {
      "title": "🏆 Honor and Achievement (Career)",
      "tag": "Hidden Talent",
      "subsections": ["Innate Job Aptitude", "Org Life vs Freelance", "Promotion/Move Timing"],
      "content": "Analyze the optimal career path. Must include: (1) 10th House ruler & Midheaven analysis, (2) Saju Official/Officer (Gwanseong) and Output (Sik-sang) interaction, (3) Organization vs freelance suitability with evidence."
    },
    "wealth": {
      "title": "💰 Algorithm of Wealth (Money)",
      "tag": "Money Flow",
      "subsections": ["How to accumulate wealth", "Loss Risks", "Risk-aware Money Habits"],
      "content": "Analyze wealth potential. Must include: (1) 2nd/8th House rulers & Saju Wealth (Jae-seong) balance, (2) Risk factors and defense strategies, (3) Decision-support money habits without specific investment instructions."
    },
    "love": {
      "title": "💕 Magnetic Attraction (Love)",
      "tag": "Soulmate Code",
      "subsections": ["My Dating Style", "Best Partner Traits", "Love/Marriage Timing"],
      "content": "Analyze relationship patterns. Must include: (1) Venus/Mars placements and 7th House analysis, (2) Compatible Sun/Moon sign suggestions with reasoning, (3) This year's love/marriage timing prediction."
    },
    "health": {
      "title": "🌿 Balance of Body and Mind (Health)",
      "subsections": ["Vulnerable Patterns", "Gentle Daily Rhythm", "Mental Care"],
      "content": "Describe wellness vulnerabilities from chart patterns. Must include: (1) Stress or rhythm pattern with chart evidence, (2) gentle habit suggestions and professional-consultation boundary, (3) mental health care direction without diagnosis or treatment instructions."
    },
    "soulmate": {
      "ideal_traits": ["Trait 1", "Trait 2", "Trait 3"],
      "meeting_period": "Q3 2026",
      "compatibility_score": 85,
      "description": "Describe the soulmate connection using Venus/Moon signs and 7th House hints.",
      "warnings": "Potential friction point based on Mars/Saturn aspects."
    },
    "compatibility": {
      "boss": {
        "ideal_type": "Ideal Boss Type (e.g., Earth Sun with strong Saturn)",
        "avoid_type": "Boss Type to Avoid (e.g., Fire-dominant with tense Mars)",
        "strategy": "Communication Strategy"
      },
      "colleague": {
        "ideal_type": "Best Work Partner",
        "avoid_type": "Conflict-Prone Colleague",
        "strategy": "Teamwork Strategy"
      },
      "friend": {
        "ideal_type": "Lifelong Friend Type",
        "avoid_type": "Toxic Friend Type",
        "advice": "Friendship Advice"
      }
    }
  }
}

## Writing Rules
1. Analyze the area corresponding to user question ('${userData.context}') in **Double Detail** — minimum 200 words for that section.
2. Maintain balance between **honest assessment and empowering optimism** (NOT "hopeful torture").
3. **Language**: Write ALL content in English.
4. **Three-Layer Consistency**: Present the strongest shared signal first, then explain how Astrology timing relates to Saju structure and Tarot/immediate signals.
5. **Density Contract**: career/wealth/love/health, soulmate, and compatibility fields must each include a diagnosis, cited evidence, user-specific implication, and practical boundary or next action. Generic or padded responses are incomplete.
6. **Evidence-Bounded Tone**: Use clear phrasing backed by chart evidence, and include consultation boundaries for health/finance or uncertainty levels when evidence is partial.
7. **Date Safety**: The report currentDate is ${currentDate}. Do not write any month or date before ${currentMonth} as guidance or timing. If earlier timing appears in supplied context, treat it as historical only and do not copy it into future guidance. Use ${currentMonth} or later review windows.
8. **Visible Source Boundaries**: The visible JSON fields must include at least four source-boundary clauses using these exact meanings: "KASI/JPL 계산 검증 전용 (calculation-only)", "계산 원천은 해석 권위가 아님 (not doctrine/personality authority)", "Waite/Tetrabiblos 검토된 텍스트 후보 (reviewed text candidates)", "원문 복사 금지 (no raw source text copying)", "타로 이미지 권리와 의미 근거 분리 (tarot image rights separate from meaning)".
9. **Safety Language Contract**: Do not place clinical or high-risk money instructions, named products/tactics, dosage/care changes, operation scheduling, exposure sizing, or direct visa/legal/immigration instructions in user-visible JSON. For visa, immigration, legal, tax, and financial-risk topics, use only documents, deadlines, professional questions, cost/risk comparison, buffers, and qualified-review thresholds.`;
  } else {
    // Phase 4 프롬프트 (v2.0) - 심층 분석 버전
    system = `${buildPersonaSystemLine(userData.characterId, lang)}
사주 명리학, 서양 점성술, 자미두수의 교차 근거를 바탕으로 직업, 돈, 사랑, 건강에 대한 **이길 수 있는 전략(Winning Strategy)**을 수립해 주십시오.

## Phase 4 임무: 4대 인생 영역 전략 분석 (심층 버전)
단순한 뻔한 덕담은 지양하고, **사주 원국, 점성술 하우스/행성, 자미두수 명반**을 입체적으로 교차 검증하여 일상에서 누구나 바로 이해하고 실천할 수 있는 초구체적 통찰을 제공하십시오.

<핵심_분석_원칙>
1. **십성 및 궁위로 영역 연결**: 각 인생 영역을 담당하는 명리적 기운을 일반인이 1초 만에 이해하는 쉬운 현실 언어로 번역하십시오.
   - 직업운: 조직 내 승진/인정(관성), 개인적 재능 발휘/창업(식상), 자미두수 관록궁
   - 재물운: 고정 수익(정재), 유동적/투자적 기회(편재), 재백궁의 주성
   - 애정운: 파트너와의 소통 패턴, 끌리는 이성 유형, 부처궁 및 금성/화성 배치
   - 건강운: 오행의 밸런스에 따른 일상 리듬과 스트레스 관리
2. **쉬운 일상 언어 & 심층 심리 진단**: 전문 한자어를 나열하지 말고, 사용자가 일상에서 겪는 생생한 심리와 현실 상황을 묘사하십시오.
</핵심_분석_원칙>

<style_guide>
**나쁜 예 (X):**
- "편재가 약하니 재물운이 불리합니다."
- "건강 조심하세요."

**좋은 예 (O):**
- "스스로 기회를 포착하고 판을 벌리는 감각이 매우 뛰어납니다. 다만 한 번에 여러 일을 벌이다가 마무리가 흐려지거나 현금 흐름이 묶일 수 있으니, 지금 시기에는 지출 상한선을 정해두고 핵심 프로젝트 하나에 집중하는 것이 가장 안전한 부의 증식 전략입니다. (근거: 시주 편재, 자미두수 재백궁)"
- "체력 자체가 약하다기보다는 완벽주의 성향으로 인해 뇌와 신경계 피로가 누적되기 쉬운 패턴입니다. 하루 15분 이상의 디지털 디톡스와 규칙적인 수면 루틴이 가장 강력한 회복제가 됩니다. (근거: 화(火) 기운 과다)"
</style_guide>

## 출력 요구사항 (JSON)
{
  "life_areas": {
    "career": {
      "title": "🏆 명예와 성취 (직업운)",
      "tag": "Hidden Talent",
      "subsections": ["타고난 직무 적성", "조직생활 vs 독립/프리랜서", "올해의 승진/이직 타이밍"],
      "content": "사주 십성과 자미두수 관록궁을 바탕으로 최적의 커리어 로드맵을 작성하십시오. 반드시 포함: (1) 타고난 강점과 직무 적성, (2) 조직생활 vs 독립/창업 적합성, (3) 올해 가장 유리한 이직/승진 타이밍."
    },
    "wealth": {
      "title": "💰 부의 알고리즘 (재물운)",
      "tag": "Money Flow",
      "subsections": ["재물을 모으는 방식", "주의해야 할 손실 리스크", "리스크 관리 습관"],
      "content": "사주 재성과 자미두수 재백궁을 분석하여 부의 증식 전략을 수립하십시오. 반드시 포함: (1) 타고난 돈 버는 패턴과 강점, (2) 돈이 새어나가는 취약점과 방어책, (3) 현실적인 자산 관리 원칙."
    },
    "love": {
      "title": "💕 관계 패턴과 끌림 (애정운)",
      "tag": "Soulmate Code",
      "subsections": ["나의 연애 스타일", "잘 맞는 파트너 특징", "올해의 연애/결혼 타이밍"],
      "content": "사주 배우자궁과 점성술 금성/화성 배치를 융합하여 애정 흐름을 분석하십시오. 반드시 포함: (1) 무의식적 연애 패턴과 매력 포인트, (2) 최고의 시너지를 내는 파트너 성향, (3) 올해 인연이 강해지는 골든타임."
    },
    "health": {
      "title": "🌿 몸과 마음의 균형 (건강/멘탈)",
      "subsections": ["취약한 생활 리듬", "안전한 일상 습관", "멘탈 관리법"],
      "content": "오행 균형을 기반으로 스트레스 관리 및 일상 회복 리듬을 제시하십시오. 반드시 포함: (1) 스트레스가 집중되는 취약 패턴, (2) 즉시 실천 가능한 생활 루틴, (3) 멘탈 강화 팁."
    },
    "soulmate": {
      "ideal_traits": ["일간 OO인 사람", "띠 OO인 사람", "성격/직업 특징"],
      "meeting_period": "기준일 이후 근거 있는 분기/월 범위 또는 재검토 경계",
      "compatibility_score": 1-100,
      "description": "**궁합 원리**(삼합, 육합 등)에 기반한 추천 파트너 유형.",
      "warnings": "**상충/형 관계**에 기반한 주의 파트너 유형."
    },
    "compatibility": {
      "boss": {
        "ideal_type": "이상적인 상사 유형 (띠, 오행, 성격)",
        "avoid_type": "피해야 할 상사 유형",
        "strategy": "상사와 소통하는 전략"
      },
      "colleague": {
        "ideal_type": "협업하기 좋은 동료",
        "avoid_type": "갈등 위험 동료",
        "strategy": "팀워크 향상 전략"
      },
      "friend": {
        "ideal_type": "평생 가는 친구 유형",
        "avoid_type": "거리두기 필요한 유형",
        "advice": "우정 유지 비결"
      }
    }
  }
}

## 작성 규칙
1. 사용자 질문('${userData.question || userData.context}')에 해당하는 영역은 **2배 더 깊게(Double Detail)** 분석하고, 질문자의 구체적 딜레마(선택 갈림길 A vs B, 갈등 대상, 목표 시기)에 대해 사주 십성과 점성술 하우스/행성 배치를 근거로 족집게 판정과 구체적 행동 매뉴얼을 제시하십시오.
2. **근거 표기 필수**: 모든 조언에 (근거: 월주 정관 + 시주 편재) 형식으로 사주 근거를 명시.
3. 팩트 폭행과 희망 고문 사이의 균형 유지.
4. **밀도 계약**: career/wealth/love/health, soulmate.description, compatibility의 strategy/advice는 각각 구체 분석, 사주/점성/자미두수 근거, 사용자에게 생기는 실제 영향, 안전한 실행 경계나 다음 행동을 포함해야 합니다. 반복과 덕담으로 길이를 채우지 마십시오.
5. **확신 수준 표기**: 근거가 강한 영역은 선명하게 쓰고, 건강/돈처럼 전문 판단이 필요한 영역은 확신 수준과 상담 경계를 함께 표기하십시오.
6. **subsections 반드시 반영**: 각 영역의 subsections 항목을 content 안에 모두 다루십시오.
7. **날짜 안전성**: 기준일은 ${currentDate}입니다. ${currentMonth} 이전의 YYYY-MM, 'YYYY년 M월', 과거 분기/월을 미래 조언이나 타이밍으로 쓰지 마십시오. 이전 phase에 기준일 전 월/날짜가 있어도 과거 맥락으로만 보고 사용자 조언에는 복사하지 마십시오. 비자/커리어 판단은 ${currentMonth} 이후부터 향후 마감/만료 전까지의 검증 창으로만 제시하십시오.
8. **보이는 원천 경계**: 사용자에게 보이는 JSON 필드 안에 다음 원천 경계 문구 중 최소 4개를 그대로 포함하십시오: "KASI/JPL 계산 검증 전용 (calculation-only)", "계산 원천은 해석 권위가 아님 (not doctrine/personality authority)", "Waite/Tetrabiblos 검토된 텍스트 후보 (reviewed text candidates)", "원문 복사 금지 (no raw source text copying)", "타로 이미지 권리와 의미 근거 분리 (tarot image rights separate from meaning)".
9. **안전 어휘 계약**: 사용자 노출 JSON에는 전문가 자격이 필요한 건강·자산 행동, 위험 상품/전술 이름, 비자/법률/이민 직접 지시를 쓰지 마십시오. 비자/이민/법률/세금/재무 리스크에서는 문서, 마감, 전문가에게 물어볼 질문, 비용/리스크 비교, 버퍼, 전문가 검토 기준으로만 표현하십시오.`;
  }

  const user = buildUserContext(userData) + buildPreviousPhaseContext(previousData, lang);
  return { system, user };
}
