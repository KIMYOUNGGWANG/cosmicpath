import { CareerKeywordsReport } from '../../../types/career';

/**
 * Career Oracle AI Prompt (Phase 1: Keywords)
 * 
 * 사주/점성술 데이터를 기반으로 유저에게 가장 잘 어울리는 직업 키워드 3개를 도출합니다.
 */
export function buildCareerPhase1Prompt(language: 'ko' | 'en' = 'ko'): string {
    const isEn = language === 'en';

    if (isEn) {
        return `
# Career Oracle: Phase 1 (Professional Keywords)

## Your Task
Analyze the provided Saju and Astrology data to identify the Top 3 professional keywords for the user.

## Instructions
1. **Identify Top 3 Keywords**: Select 3 distinct professional fields or roles (e.g., "Creative Content Director", "Financial Analyst", "Independent Artisan").
2. **Assign Rank & Reason**: For each keyword, provide a rank (1-3) and a 1-sentence logical reason citing Saju (Ten Gods/Structure) or Astrology (House/Planet).
3. **Calculate Compatibility**: Provide a compatibility score (0-100) reflecting how well their innate energy matches this role.
4. **Timing Insight**: Provide a 1-2 sentence summary of their professional timing for this year (Saju Luck).
5. **Talent Insight**: Provide a 1-2 sentence summary of their innate professional talents (Astrological Houses/Signs).
6. **Catchphrase**: Create a catchy 1-line headline summarizing their professional aura.
7. **Aura Color**: Select a color that represents their professional energy: 'violet', 'gold', 'emerald', 'crimson', 'azure'.

## Output Format (Strict JSON)
{
  "keywords": [
    { "rank": 1, "keyword": "...", "reason": "...", "compatibility": 95 },
    ...
  ],
  "timingInsight": "...",
  "talentInsight": "...",
  "catchphrase": "...",
  "auraColor": "..."
}
`;
    }

    return `
# Career Oracle: Phase 1 (직업 키워드 도출)

## 당신의 임무
제공된 사주 및 점성술 데이터를 분석하여 사용자에게 가장 잘 어울리는 직업 키워드 Top 3를 도출하세요.

## 지시 사항
1. **키워드 Top 3 선정**: 3개의 구체적인 직업군이나 역할(예: "콘텐츠 크리에이터", "전략 금융 분석가", "독립 예술가")을 선정하세요.
2. **순위 및 근거 제시**: 각 키워드에 대해 순위(1~3순위)와 사주(십성/격국) 또는 점성술(하우스/행성)을 인용한 1문장 근거를 작성하세요.
3. **적합도 계산**: 사용자의 선천적 기운이 해당 역할과 얼마나 잘 맞는지 나타내는 적합도 점수(0~100)를 부여하세요.
4. **시기적 인사이트 (Timing)**: 올해 사용자의 직업 운세(세운/대운)에 대한 1~2문장 요약을 제공하세요.
5. **재능적 인사이트 (Talent)**: 사용자의 타고난 직업적 재능(점성술 하우스/사인 등)에 대한 1~2문장 요약을 제공하세요.
6. **캐치프레이즈**: 사용자의 직업적 아우라를 한 줄로 요약하는 위트 있는 제목을 만드세요.
7. **아우라 컬러**: 사용자의 직업적 에너지를 상징하는 색상을 선택하세요: 'violet', 'gold', 'emerald', 'crimson', 'azure'.

## 출력 형식 (Strict JSON)
{
  "keywords": [
    { "rank": 1, "keyword": "...", "reason": "...", "compatibility": 95 },
    ...
  ],
  "timingInsight": "...",
  "talentInsight": "...",
  "catchphrase": "...",
  "auraColor": "..."
}
`;
}
