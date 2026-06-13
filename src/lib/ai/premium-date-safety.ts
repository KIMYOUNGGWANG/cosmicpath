const isoDateLikePattern = /\b(\d{4}-\d{2}(?:-\d{2})?)\b/g;
const koreanYearMonthPattern = /(\d{4})년\s*(0?[1-9]|1[0-2])월/g;
const koreanMonthOnlyPattern = /(?:^|[^\d])((?:0?[1-9])|(?:1[0-2]))월/g;
const englishMonthYearPattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/g;
const englishYearMonthPattern = /\b(\d{4})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/g;
const englishMonthOnlyPattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g;
const birthDateContextPattern = /생년월일|birth\s*date|birthDate|출생|born|出生|님\s*\(|\([12]\d{3}-\d{2}-\d{2}/iu;

export function premiumDateSafetyReasons(serialized: string, currentDate: string): readonly string[] {
  const currentMonth = currentDate.slice(0, 7);
  const reasons: string[] = [];

  for (const match of serialized.matchAll(isoDateLikePattern)) {
    const candidate = match[1];
    const index = match.index ?? 0;
    const isFullDate = candidate.length === 10;
    const boundary = isFullDate ? currentDate : currentMonth;
    if (candidate < boundary && !isBirthDateContext(serialized, index)) {
      reasons.push(isFullDate ? 'past date is before currentDate.' : 'past month is before currentDate.');
    }
  }

  reasons.push(...yearMonthReasons(serialized, currentMonth));
  return reasons;
}

function yearMonthReasons(serialized: string, currentMonth: string): readonly string[] {
  const reasons: string[] = [];
  for (const match of serialized.matchAll(koreanYearMonthPattern)) {
    const candidate = `${match[1]}-${match[2].padStart(2, '0')}`;
    if (candidate < currentMonth) reasons.push('past month is before currentDate.');
  }

  const withoutKoreanYearMonths = serialized.replace(koreanYearMonthPattern, '');
  for (const match of withoutKoreanYearMonths.matchAll(koreanMonthOnlyPattern)) {
    const candidate = `${currentMonth.slice(0, 4)}-${match[1].padStart(2, '0')}`;
    if (candidate < currentMonth) reasons.push('past month is before currentDate.');
  }

  reasons.push(...englishMonthReasons(serialized, currentMonth));
  return reasons;
}

function englishMonthReasons(serialized: string, currentMonth: string): readonly string[] {
  const reasons: string[] = [];
  let withoutEnglishYearMonths = serialized;
  for (const match of serialized.matchAll(englishMonthYearPattern)) {
    const candidate = `${match[2]}-${englishMonthToNumber(match[1])}`;
    if (candidate < currentMonth) reasons.push('past month is before currentDate.');
  }
  withoutEnglishYearMonths = withoutEnglishYearMonths.replace(englishMonthYearPattern, '');

  for (const match of serialized.matchAll(englishYearMonthPattern)) {
    const candidate = `${match[1]}-${englishMonthToNumber(match[2])}`;
    if (candidate < currentMonth) reasons.push('past month is before currentDate.');
  }
  withoutEnglishYearMonths = withoutEnglishYearMonths.replace(englishYearMonthPattern, '');

  for (const match of withoutEnglishYearMonths.matchAll(englishMonthOnlyPattern)) {
    const candidate = `${currentMonth.slice(0, 4)}-${englishMonthToNumber(match[1])}`;
    if (candidate < currentMonth) reasons.push('past month is before currentDate.');
  }
  return reasons;
}

function isBirthDateContext(serialized: string, index: number): boolean {
  const context = serialized.slice(Math.max(0, index - 80), index + 40);
  return birthDateContextPattern.test(context);
}

function englishMonthToNumber(month: string): string {
  const monthNumbers: Record<string, string> = {
    January: '01',
    February: '02',
    March: '03',
    April: '04',
    May: '05',
    June: '06',
    July: '07',
    August: '08',
    September: '09',
    October: '10',
    November: '11',
    December: '12',
  };
  const result = monthNumbers[month];
  if (!result) throw new TypeError(`Unsupported English month name: ${month}`);
  return result;
}
