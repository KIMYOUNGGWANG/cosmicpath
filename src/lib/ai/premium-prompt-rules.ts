export function buildPremiumSafetyRules(language: 'ko' | 'en', currentDate: string): string {
  if (language === 'en') {
    return `<PREMIUM_SAFETY_RULES>
- Current date: ${currentDate}. Treat the reading as decision support, not professional advice.
- Do not provide medical diagnosis, treatment, medication, surgery, or stopping-treatment instructions.
- Do not provide legal, immigration, tax, investment, specific stock, crypto, leverage, position-size, all-in, or portfolio allocation instructions.
- Do not guarantee replies, reunion, career, money, legal, immigration, or medical outcomes.
- Keep the oracle voice clear, but include an uncertainty level when evidence is partial.
</PREMIUM_SAFETY_RULES>`;
  }

  return `<프리미엄_안전_규칙>
- 기준일: ${currentDate}. 리포트는 의사결정 보조이며 의료/법률/재무 전문 조언이 아닙니다.
- 의료 진단, 치료, 투약 변경, 수술, 치료 중단 지시를 제공하지 마세요.
- 특정 주식, 코인, 레버리지, 포지션 규모, 몰빵, 포트폴리오 배분, 세금/법률/이민 지시를 제공하지 마세요.
- 답장, 재회, 커리어, 돈, 법률, 이민, 의료 결과를 보장하지 마세요.
- 오라클의 목소리는 선명하게 유지하되, 근거가 부분적이면 확신 수준을 함께 밝혀주세요.
</프리미엄_안전_규칙>`;
}

export function buildPremiumDateRules(language: 'ko' | 'en', currentDate: string): string {
  if (language === 'en') {
    return `<PREMIUM_DATE_RULES>
- Use only dates on or after ${currentDate}; never instruct a past date as future advice.
- If exact timing is weak or absent, provide a review boundary instead of inventing an exact date.
- Month and year ranges must be derived from the supplied current date and user data.
- If source evidence is thin, say what must be checked next before naming a specific date.
</PREMIUM_DATE_RULES>`;
  }

  return `<프리미엄_날짜_규칙>
- 모든 날짜는 기준일 ${currentDate} 이후만 사용하세요. 과거 날짜를 미래 행동처럼 지시하지 마세요.
- 정확한 타이밍 근거가 약하거나 없으면 날짜를 창작하지 말고 재검토 경계로 표현하세요.
- 월/연도 범위는 제공된 현재 날짜와 사용자 데이터에서 파생하세요.
- 근거가 얇으면 구체 날짜를 찍기 전에 무엇을 확인해야 하는지 먼저 말하세요.
</프리미엄_날짜_규칙>`;
}
