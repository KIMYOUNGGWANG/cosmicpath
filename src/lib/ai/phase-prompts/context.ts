import { buildPremiumDateRules, buildPremiumSafetyRules } from '../premium-prompt-rules';
import { buildPromptSharedPrelude } from '../prompt-shared-rules';
import {
  buildCalculationSourceContract,
  buildGroundedEvidenceContract,
} from './evidence-contracts';
import type { UserData } from './types';

// 공통 컨텍스트 빌더
export function buildUserContext(userData: UserData): string {
  const lang = userData.language || 'ko';
  const isEn = lang === 'en';
  const sharedPrelude = buildPromptSharedPrelude({
    language: lang,
    characterId: userData.characterId,
    questionIntent: userData.questionIntent,
    selectionMode: userData.selectionMode,
    advisorEvidenceSummary: userData.advisorEvidenceSummary,
    detailLevel: 'full',
    depthMode: 'premium',
    format: 'inline',
  });
  const currentDate = userData.currentDate || new Date().toISOString().split('T')[0];
  const premiumRules = `${buildPremiumSafetyRules(lang, currentDate)}\n\n${buildPremiumDateRules(lang, currentDate)}`;
  const calculationSourceContract = buildCalculationSourceContract(lang);
  const groundedEvidenceContract = buildGroundedEvidenceContract(userData, lang);

  const nameStr = userData.name ? (isEn ? `${userData.name}` : `${userData.name}님`) : (isEn ? 'User' : '사용자님');
  const genderStr = userData.gender === 'male' ? (isEn ? 'Male' : '남성(乾命)') : (isEn ? 'Female' : '여성(坤命)');

  if (isEn) {
    return `
<USER_INFO>
Name: ${userData.name || 'Anonymous'} (Address as "${nameStr}" in the report)
Gender: ${genderStr}
Birth Date: ${userData.birthDate}
Birth Time: ${userData.unknownTime ? `${userData.birthTime} (unknown time fallback)` : userData.birthTime}
Context: ${userData.context}
Question: ${userData.question || 'General Reading'}
Today's Date: ${currentDate}
</USER_INFO>

<QUESTION_INTENT_PRECISION_ANCHOR>
1. Specific Dilemma: "${userData.question || 'General Guidance'}" (Context: ${userData.context})
2. Precision Requirement: You must answer this exact dilemma directly. Map the user's pain points, decision fork (Option A vs Option B), and requested timeline directly to the Saju Day Master/Month Pillar/Major Luck and Planetary Transits.
3. Anti-Vagueness: Do not provide generic horoscope platitudes. Provide concrete timing windows, causal diagnostic roots, and exact next moves.
</QUESTION_INTENT_PRECISION_ANCHOR>
${userData.scenarioA || userData.scenarioB ? `
<A_VS_B_SCENARIO_SIMULATION_AUDIT>
1. Path A (Option A): "${userData.scenarioA || 'Action / Change Path'}"
2. Path B (Option B): "${userData.scenarioB || 'Hold / Preserve Path'}"
3. Engine Verdict: ${userData.scenarioDecision?.verdictHeadlineKo || 'Strategic timing analysis required'} (Recommended: ${userData.scenarioDecision?.recommendedOption || 'A'})
4. Mandatory Directive: You MUST explicitly contrast Path A vs Path B throughout the report. Do not speak generally. Map Path A's risks/rewards and Path B's risks/rewards directly to the Saju 10 Gods (Ten Deities) and Planetary Transits. Clearly state which path wins and why.
</A_VS_B_SCENARIO_SIMULATION_AUDIT>
` : ''}

${sharedPrelude}

${calculationSourceContract}

${groundedEvidenceContract}

${premiumRules}

${userData.sajuData ? `<SAJU_DATA>\n${JSON.stringify(userData.sajuData, null, 2)}\n</SAJU_DATA>${userData.sajuData.oraclePromptBlock ? `\n\n<SAJU_PRECISION_DATA>\n${userData.sajuData.oraclePromptBlock}\n</SAJU_PRECISION_DATA>` : ''}` : ''}
${userData.astroData ? `<ASTRO_DATA>\n${JSON.stringify(userData.astroData, null, 2)}\n</ASTRO_DATA>` : ''}
${userData.thaiAstrology ? `
<THAI_ASTROLOGY_COORDINATES>
- Birth Day Deity: ${userData.thaiAstrology.dayDeity.nameKo} (${userData.thaiAstrology.dayDeity.nameTh}, Ruler: ${userData.thaiAstrology.dayDeity.rulerPlanetKo})
- Sidereal Sun Sign: ${userData.thaiAstrology.siderealSun.sign.nameKo} (${userData.thaiAstrology.siderealSun.sign.nameTh}, Lahiri Ayanamsa: ${userData.thaiAstrology.ayanamsaDegrees}°)
- Supreme Blessing (Siri): ${userData.thaiAstrology.siriPlanet.planetKo} (${userData.thaiAstrology.siriPlanet.nameKo})
- Critical Taboo (Kalakini): ${userData.thaiAstrology.kalakiniPlanet.planetKo} (${userData.thaiAstrology.kalakiniPlanet.nameKo})
- Current Maha Thaksa Cycle: ${userData.thaiAstrology.currentMahaThaksaCycle.primaryRulerKo} (Age ${userData.thaiAstrology.currentMahaThaksaCycle.startAge}~${userData.thaiAstrology.currentMahaThaksaCycle.endAge})
- Strategic Advice: ${userData.thaiAstrology.currentMahaThaksaCycle.strategicAdviceKo}
- Dual Astrology Lens: ${userData.thaiAstrology.dualAstrologySynthesis.integratedPersona}
</THAI_ASTROLOGY_COORDINATES>` : ''}
${userData.ziweiChart ? `
<ZIWEI_DOUSHU_COORDINATES>
- Ming Palace Branch: ${userData.ziweiChart.mingGongBranch} (Five Elements Pattern: ${userData.ziweiChart.wuxingJu.name})
- Shen Palace Branch: ${userData.ziweiChart.shenGongBranch}
- Key Palaces: ${userData.ziweiChart.palaceList.slice(0, 4).map(p => `${p.name}: ${p.stars.map(s => s.name).join(', ') || '보좌'}`).join(' | ')}
- SiHua Energy: ${JSON.stringify(userData.ziweiChart.siHuaSummary)}
</ZIWEI_DOUSHU_COORDINATES>` : ''}
${userData.weeklyHeatmap ? `
<TIMING_HEATMAP_COORDINATES>
- Year: ${userData.weeklyHeatmap.year} (Peak Quarter: ${userData.weeklyHeatmap.peakQuarter})
- Highest Week: Month ${userData.weeklyHeatmap.highestScoringWeek.month}, Week ${userData.weeklyHeatmap.highestScoringWeek.weekOfMonth} (Score ${userData.weeklyHeatmap.highestScoringWeek.score})
</TIMING_HEATMAP_COORDINATES>` : ''}
`;
  }

  return `
<사용자_정보>
이름/호칭: ${userData.name || '익명'} (리포트 작성 시 "${nameStr}"이라고 다정하게 부를 것)
성별: ${genderStr} (대운의 순행/역행 및 남녀의 사회적 역할론을 현대적으로 재해석할 것)
생년월일: ${userData.birthDate}
생시: ${userData.unknownTime ? `${userData.birthTime} (시간 미상 기준값)` : userData.birthTime}
관심 영역(Context): ${userData.context}
질문(Query): ${userData.question || '종합 운세'}
오늘의 날짜: ${currentDate} (현재 시점 기준의 운세를 정확히 판단할 것)
</사용자_정보>

<질문_정밀_해체_및_족집게_직답_앵커>
1. 사용자의 실제 질문: "${userData.question || '종합 운세'}" (영역: ${userData.context})
2. 직답 의무: 사용자가 물어본 고민의 본질(심리적 고통/불안 트리거, 선택 갈림길 A vs B, 특정 목표 시점)에 대해 반드시 1:1로 정확하게 짚어 직답하십시오. 질문과 무관한 뻔한 운세 텍스트를 늘어놓는 것은 실패입니다.
3. 원국-고민 인과 사슬: 사주 일간, 월지 격국, 충/형/합/파, 현재 대운, 당해 연도 세운(${userData.sajuData?.sewoon?.stem && userData.sajuData?.sewoon?.branch ? `${userData.sajuData.sewoon.year}년 ${userData.sajuData.sewoon.stem}${userData.sajuData.sewoon.branch}년` : `${currentDate.split('-')[0]}년`})과 월운의 상호작용이 "왜 지금 이 질문과 갈등을 일으켰는지"를 명확한 인과관계로 밝히십시오.
4. 모호한 양다리 표현 금지: "~할 수도 있고 아닐 수도 있습니다" 같은 회피성 문장을 금지하고, [결론 직답] + [실제 사주/점성 데이터 근거] + [골든타임/위험 시점] + [실전 행동 수칙]으로 선명하게 제시하십시오.
</질문_정밀_해체_및_족집게_직답_앵커>
${userData.scenarioA || userData.scenarioB ? `
<A_VS_B_시나리오_심층_대조_판정_규격>
1. 선택지 A (Option A - 변화/실행 경로): "${userData.scenarioA || '적극적 실행/변화 시도'}"
2. 선택지 B (Option B - 수성/보류 경로): "${userData.scenarioB || '현상 유지/내실 다지기'}"
3. 결정론적 엔진 권고 판정: ${userData.scenarioDecision?.verdictHeadlineKo || '신중한 타이밍 조율 필요'} (추천 경로: ${userData.scenarioDecision?.recommendedOption || 'A'})
4. 필수 분석 지침:
   - 리포트 전반에 걸쳐 반드시 [선택지 A]와 [선택지 B]의 현실적 득실을 1:1로 직접 대조하십시오.
   - 두루뭉술한 사주 해설을 금지하고, "A안을 택했을 때 겪게 될 3개월 내 최대 리스크와 6개월 후 기대 결실" vs "B안을 택했을 때의 기회비용과 안전도"를 사주 십신(재성/관성/식상/인성/비겁) 및 대운/세운 흐름과 직접 결합하여 명시하십시오.
   - 결론에서 어느 쪽이 사주 원국과 현재 운기상 우세한지 단호하고 명확하게 판정하십시오.
</A_VS_B_시나리오_심층_대조_판정_규격>
` : ''}

<명리학_점성술_현실언어_번역지침>
1. 어려운 한자어나 전문 용어는 단독으로 쓰지 말고, 반드시 현대인의 일상 현실 언어로 100% 직관 번역하십시오:
   - 편관(七殺) ➔ "외부 조직, 비자, 상사, 규제로부터 오는 강한 압박과 통제"
   - 식상(食傷) ➔ "기존 틀을 깨고 새로운 판을 주도적으로 시작하려는 실행력과 표현 갈망"
   - 역마살(驛馬) ➔ "한곳에 갇히면 에너지가 마르고, 환경을 이동해야 운이 풀리는 승부사 기질"
   - 천을귀인(天乙貴人) ➔ "결정적 고비에서 비자나 일자리, 핵심 기회를 열어줄 조력자"
   - 인성(印星) ➔ "문서, 자격증, 학위, 공인된 인정과 보호막"
   - 재성(財星) ➔ "현금 흐름, 실질적 결과물, 사업적 결실"
2. 사주 4주 8자의 글자 상호작용(충/합)을 설명할 때는 반드시 유저의 실제 심리와 현실 행동 패턴(돈, 이직, 인간관계, 불안)으로 풀어서 서술하십시오.
</명리학_점성술_현실언어_번역지침>

${sharedPrelude}

${calculationSourceContract}

${groundedEvidenceContract}

${premiumRules}

${userData.sajuData ? `<사주_핵심_좌표>
- 일간(Day Master): ${userData.sajuData.dayPillar?.stem ?? '?'}${userData.sajuData.dayPillar?.branch ?? '?'}
- 월지: ${userData.sajuData.monthPillar?.stem ?? '?'}${userData.sajuData.monthPillar?.branch ?? '?'}
- 현재 대운: ${userData.sajuData.daeun?.currentDaeun ? `${userData.sajuData.daeun.currentDaeun.stem}${userData.sajuData.daeun.currentDaeun.branch}` : '미산출'}
- 올해 세운: ${userData.sajuData.sewoon ? `${userData.sajuData.sewoon.year}년 ${userData.sajuData.sewoon.stem}${userData.sajuData.sewoon.branch}` : '미산출'}
인용 규칙: core_message 작성 시 위 값 중 최소 3개를 글자 그대로 직접 인용할 것. 인용 없이 사주를 언급하는 것은 금지.
</사주_핵심_좌표>

<사주_원국>\n${JSON.stringify(userData.sajuData, null, 2)}\n</사주_원국>${userData.sajuData.oraclePromptBlock ? `\n\n<사주_정밀_데이터>\n${userData.sajuData.oraclePromptBlock}\n</사주_정밀_데이터>` : ''}` : ''}
${userData.astroData ? `<점성술_데이터>\n${JSON.stringify(userData.astroData, null, 2)}\n</점성술_데이터>` : ''}
${userData.thaiAstrology ? `
<태국왕실점성_마하탁사_좌표>
- 출생 요일 수호신: ${userData.thaiAstrology.dayDeity.nameKo} (${userData.thaiAstrology.dayDeity.nameTh}, 지배 행성: ${userData.thaiAstrology.dayDeity.rulerPlanetKo})
- 실제 항성 태양궁(라히리 아야남샤 ${userData.thaiAstrology.ayanamsaDegrees}°): ${userData.thaiAstrology.siderealSun.sign.nameKo} (${userData.thaiAstrology.siderealSun.sign.nameTh})
- 인생 최대 축복성(시리, Siri): ${userData.thaiAstrology.siriPlanet.planetKo} (${userData.thaiAstrology.siriPlanet.nameKo})
- 절대 경계성(칼라키니, Kalakini): ${userData.thaiAstrology.kalakiniPlanet.planetKo} (${userData.thaiAstrology.kalakiniPlanet.nameKo})
- 현재 마하탁사 대운 주기: ${userData.thaiAstrology.currentMahaThaksaCycle.primaryRulerKo} (만 ${userData.thaiAstrology.currentMahaThaksaCycle.startAge}세 ~ ${userData.thaiAstrology.currentMahaThaksaCycle.endAge}세)
- 대운 전략: ${userData.thaiAstrology.currentMahaThaksaCycle.strategicAdviceKo}
- 듀얼 렌즈(내면 vs 현실) 종합: ${userData.thaiAstrology.dualAstrologySynthesis.integratedPersona}
</태국왕실점성_마하탁사_좌표>` : ''}
${userData.ziweiChart ? `
<자미두수_명반_좌표>
- 명궁(命宮) 지지: ${userData.ziweiChart.mingGongBranch} (국: ${userData.ziweiChart.wuxingJu.name})
- 신궁(身宮) 지지: ${userData.ziweiChart.shenGongBranch}
- 주요 궁 배치: ${userData.ziweiChart.palaceList.slice(0, 4).map(p => `${p.name}: ${p.stars.map(s => s.name).join(', ') || '보좌'}`).join(' | ')}
- 사화(四化) 요약: ${JSON.stringify(userData.ziweiChart.siHuaSummary)}
</자미두수_명반_좌표>` : ''}
${userData.weeklyHeatmap ? `
<48주_타이밍_히트맵_좌표>
- 연도: ${userData.weeklyHeatmap.year}년 (최고 분기: ${userData.weeklyHeatmap.peakQuarter})
- 골든 위크: ${userData.weeklyHeatmap.highestScoringWeek.month}월 ${userData.weeklyHeatmap.highestScoringWeek.weekOfMonth}주차 (${userData.weeklyHeatmap.highestScoringWeek.score}점)
</48주_타이밍_히트맵_좌표>` : ''}
${userData.partnerSajuData ? `
<상대방_정보>
이름: ${userData.partnerName || '상대방'}
생년월일: ${userData.partnerBirthDate}
생시: ${userData.partnerBirthTime || '미상'}
</상대방_정보>
<상대방_사주_원국>
${JSON.stringify(userData.partnerSajuData, null, 2)}
</상대방_사주_원국>

**중요**: 위의 상대방 사주 데이터는 서버에서 정확히 계산된 것입니다. 이 데이터를 기준으로 궁합/재회 분석을 진행하십시오.
질문 텍스트에 적힌 상대방 생년월일은 무시하고, 위 <상대방_사주_원국> 데이터만 사용하십시오.
` : ''}
`;
}
