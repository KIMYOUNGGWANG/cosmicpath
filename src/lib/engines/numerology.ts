/**
 * Numerology Engine
 * Basic calculations for Life Path Number and Lucky Numbers
 */

/**
 * Calculate Life Path Number
 * Sum of all digits in the birth date until reduced to a single digit (1-9) or Master Number (11, 22, 33)
 */
export function calculateLifePathNumber(birthDate: Date): number {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    // Helper to sum digits of a number
    const sumDigits = (num: number): number => {
        return num.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
    };

    // Helper to reduce a number to a single digit or Master Number
    const reduceToLifePath = (num: number): number => {
        let current = num;
        while (current > 9 && current !== 11 && current !== 22 && current !== 33) {
            current = sumDigits(current);
        }
        return current;
    };

    // Strategy: Sum year, month, day separately first, then sum the results
    // This is one of the common methods.
    // Example: 1990-01-01
    // Year: 1+9+9+0 = 19 -> 1+9 = 10 -> 1
    // Month: 1
    // Day: 1
    // Total: 1+1+1 = 3

    const reducedYear = reduceToLifePath(year);
    const reducedMonth = reduceToLifePath(month);
    const reducedDay = reduceToLifePath(day);

    const total = reducedYear + reducedMonth + reducedDay;
    return reduceToLifePath(total);
}

/**
 * Get Meaning of Life Path Number (Simple Keyword)
 */
export function getLifePathKeyword(lifePathNumber: number, language: 'ko' | 'en' = 'ko'): string {
    const keywords: Record<number, { ko: string; en: string }> = {
        1: { ko: "개척자 (The Pioneer)", en: "The Pioneer" },
        2: { ko: "중재자 (The Peacemaker)", en: "The Peacemaker" },
        3: { ko: "예술가 (The Creative)", en: "The Creative" },
        4: { ko: "건축가 (The Builder)", en: "The Builder" },
        5: { ko: "모험가 (The Adventurer)", en: "The Adventurer" },
        6: { ko: "양육자 (The Nurturer)", en: "The Nurturer" },
        7: { ko: "탐구자 (The Seeker)", en: "The Seeker" },
        8: { ko: "경영자 (The Powerhouse)", en: "The Powerhouse" },
        9: { ko: "인도주의자 (The Humanitarian)", en: "The Humanitarian" },
        11: { ko: "직관의 마스터 (The Intuitive)", en: "The Intuitive (Master)" },
        22: { ko: "실현의 마스터 (The Master Builder)", en: "The Master Builder" },
        33: { ko: "치유의 마스터 (The Master Teacher)", en: "The Master Teacher" },
    };

    return keywords[lifePathNumber]?.[language] || (language === 'en' ? "Unknown" : "알 수 없음");
}

/**
 * Get Lucky Numbers based on Life Path Number
 * This is a simplified derivation for entertainment purposes.
 */
export function getLuckyNumbers(lifePathNumber: number): number[] {
    const base = lifePathNumber > 9 ? sumDigits(lifePathNumber) : lifePathNumber;

    // Generate 3 lucky numbers closely related to the base number
    // 1. The base number itself
    // 2. A number that sums to the base (e.g., base + 9)
    // 3. Another harmonic number
    return [base, base + 9, base * 3].filter(n => n < 100);
}

// Helper needed inside getLuckyNumbers for the simplified logic above
function sumDigits(num: number): number {
    return num.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
}
