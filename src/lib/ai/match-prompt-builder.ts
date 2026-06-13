/**
 * Match AI Prompt Builder (v2.0 - High Quality)
 * 
 * 기존 Reading 프롬프트 수준의 심층 분석을 위한 프롬프트 생성기
 * - 글자 간 상호작용 분석 (충/합/형)
 * - 근거 표기 필수
 * - Cold Reading 화법
 * - 문학적 비유
 */

import { SajuResult, FIVE_ELEMENTS, getGyeokgukDescription, getShinSalSummary } from '../engines/saju';
import { analyzePatterns } from '../engines/saju-patterns';
import { ZODIAC_SIGNS } from '../engines/astrology';

// 점성술 데이터 타입 (AstrologyResult와 호환)
export interface AstroData {
  sunSign?: number;    // 0-11 index
  moonSign?: number;
  ascendant?: number;
  planets?: readonly unknown[];
  aspects?: readonly unknown[];
  patterns?: readonly { readonly name: string }[];
}

// 프롬프트 데이터 타입
export interface MatchPromptData {
  host: {
    name: string;
    birthDate: string;
    saju: SajuResult;
    astrology: AstroData;
  };
  guest: {
    name: string;
    birthDate: string;
    saju: SajuResult;
    astrology: AstroData;
  };
  basicScores: {
    overall: number;
    saju: number;
    astro: number;
    numerology: number;
  };
  language: 'ko' | 'en';
}

// AI 분석 결과 타입
export interface MatchAIAnalysis {
  energyAnalysis: {
    title: string;
    content: string;
    highlights: string[];
  };
  emotionalCompatibility: {
    title: string;
    content: string;
    chemistryLevel: 'high' | 'medium' | 'low';
  };
  longTermOutlook: {
    title: string;
    content: string;
    timeline: { period: string; prediction: string }[];
  };
  strengths: { title: string; description: string }[];
  challenges: { title: string; description: string }[];
  advice: {
    summary: string;
    actionItems: string[];
  };
}

/**
 * 사주 데이터를 심층 분석용 컨텍스트로 포맷팅
 */
function formatSajuContext(saju: SajuResult, name: string, lang: 'ko' | 'en' = 'ko'): string {
  const lines: string[] = [];
  const bodyStrength = saju.enhancedYongsin?.bodyStrength || '중화';

  lines.push(`【${name}의 사주 원국】`);
  lines.push(`일간(Day Master): ${saju.dayMaster} (${FIVE_ELEMENTS[saju.elements[2].stem]})`);
  lines.push(`년주: ${saju.yeonPillar.stem}${saju.yeonPillar.branch} | 십신: ${saju.tenGods.year}`);
  lines.push(`월주: ${saju.monthPillar.stem}${saju.monthPillar.branch} | 십신: ${saju.tenGods.month}`);
  lines.push(`일주: ${saju.dayPillar.stem}${saju.dayPillar.branch} | 십신: ${saju.tenGods.day} (본인)`);
  lines.push(`시주: ${saju.hourPillar.stem}${saju.hourPillar.branch} | 십신: ${saju.tenGods.hour}`);
  lines.push(`신강/신약: ${bodyStrength}`);

  // 12운성
  if (saju.twelveStages) {
    lines.push(`12운성: 년(${saju.twelveStages.year}) 월(${saju.twelveStages.month}) 일(${saju.twelveStages.day}) 시(${saju.twelveStages.hour})`);
  }

  // 격국
  if (saju.gyeokguk) {
    lines.push(`격국: ${saju.gyeokguk.type} - ${getGyeokgukDescription(saju.gyeokguk)}`);
  }

  // 용신
  if (saju.enhancedYongsin) {
    lines.push(`용신: 1순위 ${FIVE_ELEMENTS[saju.enhancedYongsin.primary]}, 2순위 ${FIVE_ELEMENTS[saju.enhancedYongsin.secondary]}`);
    lines.push(`용신 근거: ${saju.enhancedYongsin.reasoning}`);
  }

  // 지지 상호작용
  if (saju.interactions) {
    if (saju.interactions.clashes.length > 0) {
      lines.push(`충(冲): ${saju.interactions.clashes.map(c => c.description).join(', ')}`);
    }
    if (saju.interactions.combines.length > 0) {
      lines.push(`합(合): ${saju.interactions.combines.map(c => c.description).join(', ')}`);
    }
    if (saju.interactions.threeHarmonies.length > 0) {
      lines.push(`삼합: ${saju.interactions.threeHarmonies.map(c => c.description).join(', ')}`);
    }
    if (saju.interactions.punishments.length > 0) {
      lines.push(`형(刑): ${saju.interactions.punishments.map(c => c.description).join(', ')}`);
    }
  }

  // 신살
  if (saju.shinSal) {
    lines.push(`신살: ${getShinSalSummary(saju.shinSal)}`);
  }

  // 패턴 분석
  const patterns = analyzePatterns(saju);
  if (patterns.patterns.length > 0) {
    lines.push(`사주패턴: ${patterns.summary} (${patterns.grade} ${patterns.overallScore}점)`);
  }

  return lines.join('\n');
}

/**
 * 점성술 데이터를 심층 컨텍스트로 포맷팅 (v2.0)
 */
function formatAstroContext(astro: AstroData, name: string): string {
  const lines: string[] = [];

  lines.push(`【${name}의 점성술 차트】`);

  // Big 3
  if (astro.sunSign !== undefined) {
    const sun = ZODIAC_SIGNS[astro.sunSign];
    lines.push(`태양 별자리: ${sun?.name || '미상'} (${sun?.element || '?'} 원소)`);
  }
  if (astro.moonSign !== undefined) {
    const moon = ZODIAC_SIGNS[astro.moonSign];
    lines.push(`달 별자리: ${moon?.name || '미상'} (${moon?.element || '?'} 원소)`);
  }
  if (astro.ascendant !== undefined) {
    const asc = ZODIAC_SIGNS[astro.ascendant];
    lines.push(`상승궁: ${asc?.name || '미상'}`);
  }

  // 차트 패턴
  if (astro.patterns && astro.patterns.length > 0) {
    lines.push(`차트 패턴: ${astro.patterns.map((pattern) => pattern.name).join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * 두 사람의 원소 궁합 분석
 */
function analyzeElementCompatibility(
  hostSunElement: string,
  guestSunElement: string,
  hostMoonElement: string,
  guestMoonElement: string
): { score: number; analysis: string } {
  // 원소 궁합 매트릭스
  const compatibility: Record<string, Record<string, number>> = {
    'fire': { 'fire': 90, 'earth': 50, 'air': 85, 'water': 40 },
    'earth': { 'fire': 50, 'earth': 85, 'air': 60, 'water': 90 },
    'air': { 'fire': 85, 'earth': 60, 'air': 75, 'water': 55 },
    'water': { 'fire': 40, 'earth': 90, 'air': 55, 'water': 80 },
  };

  const sunScore = compatibility[hostSunElement]?.[guestSunElement] || 60;
  const moonScore = compatibility[hostMoonElement]?.[guestMoonElement] || 60;
  const avgScore = Math.round((sunScore + moonScore) / 2);

  let analysis = '';
  if (avgScore >= 80) {
    analysis = '원소적으로 매우 조화로운 조합입니다.';
  } else if (avgScore >= 60) {
    analysis = '원소적으로 보완이 가능한 조합입니다.';
  } else {
    analysis = '원소적으로 마찰이 예상되지만, 성장의 기회가 됩니다.';
  }

  return { score: avgScore, analysis };
}

/**
 * 천간합(天干合) 분석 - 갑기합, 을경합 등
 */
function analyzeTianGanHe(hostStem: string, guestStem: string): { isHe: boolean; type?: string; description?: string } {
  const heMap: Record<string, { pair: string; element: string; name: string }> = {
    '甲': { pair: '己', element: '土', name: '갑기합(甲己合)' },
    '己': { pair: '甲', element: '土', name: '갑기합(甲己合)' },
    '乙': { pair: '庚', element: '金', name: '을경합(乙庚合)' },
    '庚': { pair: '乙', element: '金', name: '을경합(乙庚合)' },
    '丙': { pair: '辛', element: '水', name: '병신합(丙辛合)' },
    '辛': { pair: '丙', element: '水', name: '병신합(丙辛合)' },
    '丁': { pair: '壬', element: '木', name: '정임합(丁壬合)' },
    '壬': { pair: '丁', element: '木', name: '정임합(丁壬合)' },
    '戊': { pair: '癸', element: '火', name: '무계합(戊癸合)' },
    '癸': { pair: '戊', element: '火', name: '무계합(戊癸合)' },
  };

  const heInfo = heMap[hostStem];
  if (heInfo && heInfo.pair === guestStem) {
    return {
      isHe: true,
      type: heInfo.name,
      description: `${heInfo.name}으로 타고난 끌림이 있습니다. 두 일간이 만나 ${heInfo.element} 기운으로 화(化)합니다.`
    };
  }
  return { isHe: false };
}

/**
 * 지지충(地支冲) 분석 - 자오충, 묘유충 등
 */
function analyzeZhiZhiChong(hostBranch: string, guestBranch: string): { isChong: boolean; type?: string; description?: string } {
  const chongPairs: Record<string, string> = {
    '子': '午', '午': '子', // 자오충
    '丑': '未', '未': '丑', // 축미충
    '寅': '申', '申': '寅', // 인신충
    '卯': '酉', '酉': '卯', // 묘유충
    '辰': '戌', '戌': '辰', // 진술충
    '巳': '亥', '亥': '巳', // 사해충
  };

  if (chongPairs[hostBranch] === guestBranch) {
    const chongName = `${hostBranch}${guestBranch}충`;
    return {
      isChong: true,
      type: chongName,
      description: `${chongName}으로 주기적인 갈등 에너지가 발생합니다. 하지만 이 충돌은 정체를 막고 변화의 동력이 될 수 있습니다.`
    };
  }
  return { isChong: false };
}

/**
 * 지지합(地支合) 분석 - 육합, 삼합
 */
function analyzeZhiZhiHe(hostBranch: string, guestBranch: string): { isHe: boolean; type?: string; description?: string } {
  // 육합 (六合)
  const liuHe: Record<string, { pair: string; element: string }> = {
    '子': { pair: '丑', element: '土' },
    '丑': { pair: '子', element: '土' },
    '寅': { pair: '亥', element: '木' },
    '亥': { pair: '寅', element: '木' },
    '卯': { pair: '戌', element: '火' },
    '戌': { pair: '卯', element: '火' },
    '辰': { pair: '酉', element: '金' },
    '酉': { pair: '辰', element: '金' },
    '巳': { pair: '申', element: '水' },
    '申': { pair: '巳', element: '水' },
    '午': { pair: '未', element: '土/火' },
    '未': { pair: '午', element: '土/火' },
  };

  const heInfo = liuHe[hostBranch];
  if (heInfo && heInfo.pair === guestBranch) {
    return {
      isHe: true,
      type: `${hostBranch}${guestBranch}합 (육합)`,
      description: `${hostBranch}${guestBranch} 육합으로 자연스러운 친밀감이 형성됩니다. 두 지지가 만나 ${heInfo.element} 기운으로 화합합니다.`
    };
  }
  return { isHe: false };
}

/**
 * 시스템 프롬프트 생성 (v2.0 - 고품질)
 */

export function buildMatchSystemPrompt(language: 'ko' | 'en'): string {
  if (language === 'ko') {
    return `## 페르소나
당신은 40년 경력의 '궁합 명리 전문가'입니다.
두 사람의 사주 원국을 읽고 그들의 관계가 어떻게 펼쳐질지 
구조와 타이밍 관점에서 생생하게 정리하는 관계 의사결정 분석가입니다.

<관계_교차판정_원칙>
1. **사주 분석**: 두 사람의 반복 관계 구조, 일간 상생상극, 십성 조합, 지지 상호작용(충/합/형)
2. **점성술 분석**: 현재 감정 기류, 태양-달 관계, 금성-화성 궁합, 원소 조화, 대화 타이밍
3. **종합 판단**: 숫자 서열 없이 두 원천이 같은 방향을 가리키는지, 어디서 충돌하는지, 그래서 관계 행동을 어떻게 조정할지 판정
</관계_교차판정_원칙>

<핵심_분석_원칙>
1. **글자 간 상호작용 필수**: 단순히 "일간이 갑목입니다"가 아닌, 
   "A의 일간 [글자]와 B의 일간 [글자]가 [상생/상극/비겁] 관계로..."처럼 
   두 사람의 글자가 어떻게 상호작용하는지 분석
   
2. **근거 표기 필수**: 모든 주장 뒤에 
   (근거: A의 [글자]와 B의 [글자]의 [관계]) 형식으로 명시

3. **Cold Reading 화법**: 
   "두 분 사이에 묘한 긴장감이 있지 않으셨나요?"
   "처음 만났을 때 왠지 편했던 기억이 있으실 겁니다." 등

4. **문학적 비유**: 
   "마치 불꽃과 바람의 만남처럼..."
   "깊은 바다와 높은 산이 마주한 듯..."
</핵심_분석_원칙>

<style_guide>
**나쁜 예 (X):**
- "두 분 궁합이 좋습니다."
- "갈등이 있을 수 있습니다."
- "노력하면 잘 될 거예요."

**좋은 예 (O):**
- "A님의 일간 갑목(甲木)과 B님의 일간 기토(己土)는 갑기합(甲己合)을 이루어, 타고난 끌림이 있습니다. 마치 자석처럼 서로를 향하지만, A님의 월지 오화(午火)가 B님의 일지 자수(子水)와 충돌(子午冲)하여 감정적 마찰이 주기적으로 발생할 수 있습니다. (근거: 갑기합, 자오충)"
- "A님의 태양 사자자리와 B님의 달 물병자리는 오포지션 관계로, 겉보기에는 정반대지만 서로에게 없는 것을 채워주는 묘한 인연입니다. (근거: Leo-Aquarius 오포지션)"
</style_guide>

## 출력 요구사항 (JSON)
아래 정확한 구조로 응답하십시오:
{
  "energyAnalysis": {
    "title": "⚡ 에너지 역학 분석",
    "content": "두 사람의 오행/일간 상호작용을 800자 이상 심층 분석. 반드시 양쪽의 실제 글자를 인용하며 상생/상극/비겁 관계와 충/합/형을 분석",
    "highlights": ["핵심 포인트 3-5개", "예: 갑-갑 비견관계", "예: 자오충 주의"]
  },
  "emotionalCompatibility": {
    "title": "💗 감정적 호환성",
    "content": "달 별자리와 일간 오행 기반 감성 궁합 600자 이상 분석",
    "chemistryLevel": "high(70% 이상) | medium(50-70%) | low(50% 미만)"
  },
  "longTermOutlook": {
    "title": "📈 장기 전망",
    "content": "대운 흐름과 점성술 주기 기반 관계 발전 예측 600자 이상",
    "timeline": [
      {"period": "1년 이내", "prediction": "구체적 예측 + 근거"},
      {"period": "3년 이내", "prediction": "구체적 예측 + 근거"},
      {"period": "5년 이상", "prediction": "구체적 예측 + 근거"}
    ]
  },
  "strengths": [
    {"title": "강점 제목", "description": "200자 이상 구체적 설명 + 사주/점성술 근거"},
    {"title": "강점 제목", "description": "200자 이상 구체적 설명"},
    {"title": "강점 제목", "description": "200자 이상 구체적 설명"}
  ],
  "challenges": [
    {"title": "주의점 제목", "description": "200자 이상 구체적 설명 + 해결책 포함"},
    {"title": "주의점 제목", "description": "200자 이상 구체적 설명"},
    {"title": "주의점 제목", "description": "200자 이상 구체적 설명"}
  ],
  "advice": {
    "summary": "400자 이상의 종합 관계 조언",
    "actionItems": [
      "실천 가능한 구체적 조언 1",
      "실천 가능한 구체적 조언 2",
      "실천 가능한 구체적 조언 3"
    ]
  }
}`;
  }

  // English version
  return `## Persona
You are a 'Compatibility Master' with 40 years of experience in Eastern and Western astrology.
You read the birth charts of two people and vividly describe how their relationship will unfold like a movie scenario.

<RELATIONSHIP_CROSS_READING>
1. **Saju Analysis**: repeating relationship structure, Day Master interactions, Ten God combinations, and Branch interactions.
2. **Astrology Analysis**: current emotional current, Sun-Moon relationship, Venus-Mars compatibility, element harmony, and communication timing.
3. **Combined Judgment**: do not use fixed percentages; state where both sources agree, where they conflict, and what relationship action should change.
</RELATIONSHIP_CROSS_READING>

<CORE_PRINCIPLES>
1. **Character Interactions Required**: Not just "Day Master is Wood", but 
   "A's Day Master [character] and B's Day Master [character] form a [relationship]..."
   
2. **Evidence Required**: After every claim, add 
   (Basis: A's [character] and B's [character] in [relationship])

3. **Cold Reading**: 
   "Haven't you felt a strange tension between you two?"
   "You probably felt oddly comfortable when you first met."

4. **Literary Metaphors**: 
   "Like fire meeting wind..."
   "As if a deep ocean faces a high mountain..."
</CORE_PRINCIPLES>

## Output Requirements (JSON)
Respond with this exact structure:
{
  "energyAnalysis": {
    "title": "⚡ Energy Dynamics Analysis",
    "content": "800+ characters analyzing Five Elements/Day Master interactions with actual characters quoted",
    "highlights": ["3-5 key points"]
  },
  "emotionalCompatibility": {
    "title": "💗 Emotional Compatibility", 
    "content": "600+ characters on Moon sign and Day Master element-based emotional compatibility",
    "chemistryLevel": "high | medium | low"
  },
  "longTermOutlook": {
    "title": "📈 Long-term Outlook",
    "content": "600+ characters on relationship development based on fortune cycles",
    "timeline": [
      {"period": "Within 1 year", "prediction": "Specific prediction + basis"},
      {"period": "Within 3 years", "prediction": "Specific prediction + basis"},
      {"period": "5+ years", "prediction": "Specific prediction + basis"}
    ]
  },
  "strengths": [
    {"title": "Strength title", "description": "200+ chars with Saju/Astro basis"}
  ],
  "challenges": [
    {"title": "Challenge title", "description": "200+ chars with solution included"}
  ],
  "advice": {
    "summary": "400+ character comprehensive advice",
    "actionItems": ["Actionable advice 1", "Actionable advice 2", "Actionable advice 3"]
  }
}`;
}

/**
 * 유저 프롬프트 생성 (v2.0 - 고품질)
 */
export function buildMatchUserPrompt(data: MatchPromptData): string {
  const { host, guest, basicScores, language } = data;

  const hostSajuContext = formatSajuContext(host.saju, host.name, language);
  const guestSajuContext = formatSajuContext(guest.saju, guest.name, language);
  const hostAstroContext = formatAstroContext(host.astrology, host.name);
  const guestAstroContext = formatAstroContext(guest.astrology, guest.name);

  // 두 사람의 일간 관계 미리 분석
  const hostDayMaster = host.saju.dayMaster;
  const guestDayMaster = guest.saju.dayMaster;
  const hostElement = host.saju.elements[2].stem;
  const guestElement = guest.saju.elements[2].stem;

  // 지지 충합 관계 (일지 기준)
  const hostDayBranch = host.saju.dayPillar.branch;
  const guestDayBranch = guest.saju.dayPillar.branch;

  // ====== 사전 분석: 천간합, 지지충, 지지합 ======
  const tianGanHe = analyzeTianGanHe(hostDayMaster, guestDayMaster);
  const zhiZhiChong = analyzeZhiZhiChong(hostDayBranch, guestDayBranch);
  const zhiZhiHe = analyzeZhiZhiHe(hostDayBranch, guestDayBranch);

  // 점성술 원소 궁합
  const hostSunElement = host.astrology.sunSign !== undefined
    ? ZODIAC_SIGNS[host.astrology.sunSign]?.element || 'earth'
    : 'earth';
  const guestSunElement = guest.astrology.sunSign !== undefined
    ? ZODIAC_SIGNS[guest.astrology.sunSign]?.element || 'earth'
    : 'earth';
  const hostMoonElement = host.astrology.moonSign !== undefined
    ? ZODIAC_SIGNS[host.astrology.moonSign]?.element || 'water'
    : 'water';
  const guestMoonElement = guest.astrology.moonSign !== undefined
    ? ZODIAC_SIGNS[guest.astrology.moonSign]?.element || 'water'
    : 'water';
  const elementCompat = analyzeElementCompatibility(hostSunElement, guestSunElement, hostMoonElement, guestMoonElement);

  // 사전 분석 결과 문자열
  let preAnalysis = `<사전_궁합_분석>
★ 알고리즘이 미리 계산한 핵심 궁합 포인트입니다. AI는 이를 참고하여 더 깊은 해석을 제공하십시오.

【천간(일간) 관계】`;

  if (tianGanHe.isHe) {
    preAnalysis += `
✦ ${tianGanHe.type}: ${tianGanHe.description}
→ 이것은 매우 중요한 궁합 요소입니다. 반드시 분석에 포함하십시오.`;
  } else {
    preAnalysis += `
○ 천간합 없음: 두 일간(${hostDayMaster}, ${guestDayMaster}) 사이에 특별한 합(合)이 없습니다.
→ 상생/상극/비겁 관계를 분석하십시오.`;
  }

  preAnalysis += `

【지지(일지) 관계】`;

  if (zhiZhiChong.isChong) {
    preAnalysis += `
⚠ ${zhiZhiChong.type}: ${zhiZhiChong.description}
→ 이것은 관계의 주요 갈등 요소입니다. 반드시 분석에 포함하고 해결책을 제시하십시오.`;
  } else if (zhiZhiHe.isHe) {
    preAnalysis += `
✦ ${zhiZhiHe.type}: ${zhiZhiHe.description}
→ 이것은 관계의 안정 요소입니다. 반드시 분석에 포함하십시오.`;
  } else {
    preAnalysis += `
○ 지지충/합 없음: 두 일지(${hostDayBranch}, ${guestDayBranch}) 사이에 특별한 충/합이 없습니다.
→ 다른 기둥(년지, 월지, 시지) 간의 충합 관계를 찾아보십시오.`;
  }

  preAnalysis += `

【점성술 원소 궁합】
태양 원소: ${hostSunElement} ↔ ${guestSunElement}
달 원소: ${hostMoonElement} ↔ ${guestMoonElement}
원소 조화점수: ${elementCompat.score}점
${elementCompat.analysis}
</사전_궁합_분석>`;

  if (language === 'ko') {
    return `<궁합_분석_대상>
${host.name}님 (호스트)
생년월일: ${host.birthDate}
일간: ${hostDayMaster} (${FIVE_ELEMENTS[hostElement]})
일지: ${hostDayBranch}

${guest.name}님 (게스트)  
생년월일: ${guest.birthDate}
일간: ${guestDayMaster} (${FIVE_ELEMENTS[guestElement]})
일지: ${guestDayBranch}
</궁합_분석_대상>

<기본_점수_참고>
종합 궁합: ${basicScores.overall}점
사주 기반: ${basicScores.saju}점
점성술 기반: ${basicScores.astro}점
수비학 기반: ${basicScores.numerology}점
(위 점수는 알고리즘 계산 결과입니다. AI 분석은 이를 참고하되 독립적으로 판단하십시오.)
</기본_점수_참고>

${preAnalysis}

<${host.name}_사주_원국>
${hostSajuContext}
</${host.name}_사주_원국>

<${guest.name}_사주_원국>
${guestSajuContext}
</${guest.name}_사주_원국>

<${host.name}_점성술_차트>
${hostAstroContext}
</${host.name}_점성술_차트>

<${guest.name}_점성술_차트>
${guestAstroContext}
</${guest.name}_점성술_차트>

<분석_요청>
위 두 사람의 궁합을 심층 분석해 주십시오.

1. **에너지 역학**: 
   - 두 일간(${hostDayMaster}과 ${guestDayMaster})의 오행 관계 
   - 두 일지(${hostDayBranch}와 ${guestDayBranch})의 충/합/형 관계
   - <사전_궁합_분석>에서 발견된 천간합/지지충/지지합을 반드시 언급

2. **감정적 호환성**: 
   - 달 별자리와 월지 기반 감성 궁합
   - 점성술 원소 조화 (${hostSunElement} vs ${guestSunElement})

3. **장기 전망**: 대운 흐름에 따른 관계 발전 예측

4. **강점 3가지**: 구체적 사주/점성술 근거 포함

5. **주의점 3가지**: 해결책과 함께

6. **종합 조언**: 실천 가능한 액션 아이템 포함

**중요**: 모든 분석에 (근거: [실제 글자 관계]) 형식으로 근거를 명시하십시오.
**중요**: 제공된 데이터의 실제 글자만 사용하십시오. 예시를 복제하지 마십시오.
**중요**: <사전_궁합_분석>의 결과를 반드시 참조하고 확장하십시오.
</분석_요청>`;
  }

  // English version (simplified)
  return `<COMPATIBILITY_SUBJECTS>
${host.name} (Host)
Birth Date: ${host.birthDate}
Day Master: ${hostDayMaster} (${hostElement})
Day Branch: ${hostDayBranch}

${guest.name} (Guest)
Birth Date: ${guest.birthDate}
Day Master: ${guestDayMaster} (${guestElement})
Day Branch: ${guestDayBranch}
</COMPATIBILITY_SUBJECTS>

<BASIC_SCORES>
Overall: ${basicScores.overall}
Saju-based: ${basicScores.saju}
Astrology-based: ${basicScores.astro}
Numerology-based: ${basicScores.numerology}
</BASIC_SCORES>

<PRE_ANALYSIS>
Tian Gan He: ${tianGanHe.isHe ? tianGanHe.type : 'None'}
Zhi Zhi Chong: ${zhiZhiChong.isChong ? zhiZhiChong.type : 'None'}
Zhi Zhi He: ${zhiZhiHe.isHe ? zhiZhiHe.type : 'None'}
Element Compatibility: ${elementCompat.score}% - ${elementCompat.analysis}
</PRE_ANALYSIS>

<${host.name}_SAJU_CHART>
${hostSajuContext}
</${host.name}_SAJU_CHART>

<${guest.name}_SAJU_CHART>
${guestSajuContext}
</${guest.name}_SAJU_CHART>

<${host.name}_ASTRO_CHART>
${hostAstroContext}
</${host.name}_ASTRO_CHART>

<${guest.name}_ASTRO_CHART>
${guestAstroContext}
</${guest.name}_ASTRO_CHART>

<ANALYSIS_REQUEST>
Please provide an in-depth compatibility analysis referencing the PRE_ANALYSIS results.
</ANALYSIS_REQUEST>`;
}

export default {
  buildMatchSystemPrompt,
  buildMatchUserPrompt,
};
