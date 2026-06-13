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

  // 타로 카드 3장 스프레드 의미 부여
  let tarotContext = '';
  if (userData.tarotCards && userData.tarotCards.length > 0) {
    if (userData.tarotCards.length >= 3) {
      if (isEn) {
        tarotContext = `
<TAROT_SPREAD_GUIDE>
Card 1 (${userData.tarotCards[0].nameEn}): [Current Situation/Essence/Past Cause] - Why did this card appear now?
Card 2 (${userData.tarotCards[1].nameEn}): [Immediate Challenge/Obstacle/Current Process] - What is blocking you?
Card 3 (${userData.tarotCards[2].nameEn}): [Solution/Advice/Future Outcome] - Where is this heading?
* Connect the flow of these 3 cards into a narrative like a novel. (e.g., "Reviewing past regrets (Card 1) led to current conflicts (Card 2), but will eventually lead to victory (Card 3).")
</TAROT_SPREAD_GUIDE>`;
      } else {
        tarotContext = `
<타로_스프레드_해석_지침>
카드 1 (${userData.tarotCards[0].name}): [현재 상황/본질/과거의 원인] - 이 카드가 왜 지금 나왔을까요?
카드 2 (${userData.tarotCards[1].name}): [당면한 과제/장애물/현재의 진행] - 무엇이 당신을 가로막고 있나요?
카드 3 (${userData.tarotCards[2].name}): [해결책/조언/미래의 결과] - 결국 어디로 흘러가나요?
* 이 3장의 흐름(Narrative)을 하나의 소설처럼 연결하십시오. (예: "과거의 미련(카드1)이 발목을 잡아 현재의 갈등(카드2)을 만들었지만, 결국 승리(카드3)할 것입니다.")
</타로_스프레드_해석_지침>`;
      }
    } else {
      tarotContext = isEn
        ? `<TAROT_SINGLE_CARD>\n${JSON.stringify(userData.tarotCards, null, 2)}\n</TAROT_SINGLE_CARD>`
        : `<타로_단일_카드>\n${JSON.stringify(userData.tarotCards, null, 2)}\n</타로_단일_카드>`;
    }
  }

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

${sharedPrelude}

${calculationSourceContract}

${groundedEvidenceContract}

${premiumRules}

${userData.sajuData ? `<SAJU_DATA>\n${JSON.stringify(userData.sajuData, null, 2)}\n</SAJU_DATA>${userData.sajuData.oraclePromptBlock ? `\n\n<SAJU_PRECISION_DATA>\n${userData.sajuData.oraclePromptBlock}\n</SAJU_PRECISION_DATA>` : ''}` : ''}
${userData.astroData ? `<ASTRO_DATA>\n${JSON.stringify(userData.astroData, null, 2)}\n</ASTRO_DATA>` : ''}
${tarotContext ? tarotContext : (userData.tarotCards ? `<TAROT_CARDS>\n${JSON.stringify(userData.tarotCards, null, 2)}\n</TAROT_CARDS>` : '')}
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
${tarotContext ? tarotContext : (userData.tarotCards ? `<타로_카드>\n${JSON.stringify(userData.tarotCards, null, 2)}\n</타로_카드>` : '')}
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
