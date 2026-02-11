
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '../engines/saju';

/**
 * Calculates Solar Longitude for a given date
 * (Copied from saju.ts to avoid circular deps or heavy imports if not exported)
 */
function getSunLongitude(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate() + (date.getHours() + date.getMinutes() / 60) / 24;

    let y = year;
    let m = month;
    if (m <= 2) { y -= 1; m += 12; }

    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;

    const T = (jd - 2451545.0) / 36525;
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    L0 = L0 % 360;
    if (L0 < 0) L0 += 360;

    let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    M = M * Math.PI / 180;
    const C = (1.914602 - 0.004817 * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);

    let sunLongitude = L0 + C;
    sunLongitude = sunLongitude % 360;
    if (sunLongitude < 0) sunLongitude += 360;
    return sunLongitude;
}

/**
 * Calculates the Month Pillar (Wol-Ju) for a specific year and month.
 * Uses the 15th day of the month to represent the month's energy (safe middle ground).
 */
export function getMonthlyPillar(year: number, month: number): { stem: string; branch: string; yearStem: string; yearBranch: string; } {
    const midMonthDate = new Date(year, month - 1, 15, 12, 0, 0); // 15th day around noon
    const sunLong = getSunLongitude(midMonthDate);

    // 1. Year Pillar Calculation (Ipchun based)
    let sajuYear = year;
    // If Jan/Feb and before Ipchun (315deg), count as previous year
    // Note: This is an approximation. For exact boundary, day-level check is needed. 
    // But for "Monthly Forecast context", using the 15th represents the month well.
    // Ipchun is roughly Feb 4. So Feb 15 is definitely new year. Jan 15 is old year.
    // 315 deg is start of Tiger month (Feb). 
    // If sunLong < 315 and sunLong > 270 (Winter), it's still old year logic for Year Pillar?
    // Actually, Saju year changes at Ipchun.
    // Let's use the logic from saju.ts:
    if (month <= 2 && sunLong < 315 && sunLong > 200) {
        sajuYear = year - 1;
    }

    const yearStemIdx = (sajuYear - 4) % 10;
    const yearBranchIdx = (sajuYear - 4) % 12;
    const yearStem = HEAVENLY_STEMS[(yearStemIdx + 10) % 10];
    const yearBranch = EARTHLY_BRANCHES[(yearBranchIdx + 12) % 12];


    // 2. Month Pillar Calculation
    const monthBranchMap = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
    // Ind (Tiger) starts at 315
    const shiftedLong = (sunLong - 315 + 360) % 360;
    const monthIdx = Math.floor(shiftedLong / 30);
    const monthBranch = monthBranchMap[monthIdx];

    // Month Stem depends on Year Stem
    // Formula: (YearStemIdx * 2 + 2 + MonthIdx) % 10
    // But verify: 甲(0) Year -> 寅 Month is 丙(2)寅. (0*2 + 2 + 0) = 2 (丙). Correct.
    // 己(5) Year -> 寅 Month is 丙(2)寅. (5*2 + 2 + 0) = 12%10 = 2. Correct.
    const yStemIdx = (HEAVENLY_STEMS as readonly string[]).indexOf(yearStem);
    const monthStemIdx = (yStemIdx * 2 + 2 + monthIdx) % 10;
    const monthStem = HEAVENLY_STEMS[monthStemIdx];

    return {
        stem: monthStem,
        branch: monthBranch,
        yearStem,
        yearBranch
    };
}

/**
 * Generates a context string for the next 12 months with Ganji info.
 */
export function getUpcomingMonthsContext(): string {
    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth() + 1;

    const lines: string[] = [];

    for (let i = 0; i < 12; i++) {
        // Calculate pillars
        const pillars = getMonthlyPillar(currentYear, currentMonth);

        // Format: "2026-03: 辛卯월 (신묘)"
        lines.push(`- ${currentYear}-${String(currentMonth).padStart(2, '0')}: ${pillars.stem}${pillars.branch}월 (${pillars.yearStem}${pillars.yearBranch}년)`);

        // Increment month
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
    }

    return `
## 📅 Next 12 Months Calendar (Ganji Reference)
Use this reference for "Timeline Forecasts" to ensure accurate elemental dates.
${lines.join('\n')}
`;
}
