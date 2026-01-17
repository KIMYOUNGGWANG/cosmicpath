/**
 * Match Calculator - Calculates compatibility score between two people
 * Based on Saju (40%), Astrology (40%), and Numerology (20%)
 * 
 * v2.0 - Uses real Saju engine for accurate Day Master analysis
 */

import { calculateSaju, SajuResult, FIVE_ELEMENTS } from '../engines/saju';
import { calculateAstrology } from '../engines/astrology';

// Five Elements compatibility matrix: [source][target] = bonus/penalty
// 상생: 목→화→토→금→수→목 (+15)
// 비겁: 같은 오행 (0)
// 상극: 목↔토, 화↔수, 토↔수, 금↔목, 화↔금 (-10)
const ELEMENT_HARMONY: Record<string, Record<string, number>> = {
    목: { 화: 15, 토: -10, 금: -10, 수: 10, 목: 0 },
    화: { 토: 15, 금: -10, 수: -15, 목: 10, 화: 0 },
    토: { 금: 15, 수: -10, 목: -10, 화: 10, 토: 0 },
    금: { 수: 15, 목: -15, 화: -10, 토: 10, 금: 0 },
    수: { 목: 15, 화: -10, 토: -10, 금: 10, 수: 0 },
};

// 천간합 (天干合) - 일간끼리 합이 되면 보너스
const TIANGAN_HE: Record<string, string> = {
    '甲': '己', '己': '甲', // 갑기합
    '乙': '庚', '庚': '乙', // 을경합
    '丙': '辛', '辛': '丙', // 병신합
    '丁': '壬', '壬': '丁', // 정임합
    '戊': '癸', '癸': '戊', // 무계합
};

// 지지충 (地支冲) - 일지끼리 충이 되면 페널티
const DIZHI_CHONG: Record<string, string> = {
    '子': '午', '午': '子',
    '丑': '未', '未': '丑',
    '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰',
    '巳': '亥', '亥': '巳',
};

// Zodiac Sign element mapping
const SIGN_ELEMENTS: Record<string, string> = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

// Compatible zodiac pairs (bonus)
const ZODIAC_COMPATIBILITY: [string, string][] = [
    ['Aries', 'Leo'], ['Aries', 'Sagittarius'], ['Leo', 'Sagittarius'],
    ['Taurus', 'Virgo'], ['Taurus', 'Capricorn'], ['Virgo', 'Capricorn'],
    ['Gemini', 'Libra'], ['Gemini', 'Aquarius'], ['Libra', 'Aquarius'],
    ['Cancer', 'Scorpio'], ['Cancer', 'Pisces'], ['Scorpio', 'Pisces'],
];

export interface PersonData {
    name: string;
    birthDate: Date;
    birthTime?: string; // HH:mm format
    timezone: string;
    gender?: 'male' | 'female';
}

export interface MatchResult {
    overallScore: number;
    sajuScore: number;
    astroScore: number;
    numScore: number;
    hostElement: string;
    guestElement: string;
    hostSign: string;
    guestSign: string;
    summary: string;
    // Premium content
    strengths: string[];
    challenges: string[];
    advice: string;
    // Saju details
    hostDayMaster?: string;
    guestDayMaster?: string;
    tianganHe?: boolean;  // 천간합 여부
    dizhiChong?: boolean; // 지지충 여부
}

/**
 * Calculate detailed Saju compatibility score using real engine
 */
function calculateSajuCompatibility(
    hostSaju: SajuResult,
    guestSaju: SajuResult
): { score: number; tianganHe: boolean; dizhiChong: boolean; details: string[] } {
    let score = 50; // 기본 점수
    const details: string[] = [];

    // 1. 일간 오행 상생/상극 (-15 ~ +15)
    const hostElement = FIVE_ELEMENTS[hostSaju.elements[2].stem];
    const guestElement = FIVE_ELEMENTS[guestSaju.elements[2].stem];
    const elementBonus = ELEMENT_HARMONY[hostElement]?.[guestElement] ?? 0;
    score += elementBonus;
    details.push(`일간 오행: ${hostElement} ↔ ${guestElement} (${elementBonus > 0 ? '+' : ''}${elementBonus})`);

    // 2. 천간합 체크 (+20)
    const hostDayMaster = hostSaju.dayMaster;
    const guestDayMaster = guestSaju.dayMaster;
    const tianganHe = TIANGAN_HE[hostDayMaster] === guestDayMaster;
    if (tianganHe) {
        score += 20;
        details.push(`천간합 발견: ${hostDayMaster}${guestDayMaster}합 (+20)`);
    }

    // 3. 지지충 체크 (-15)
    const hostDayBranch = hostSaju.dayPillar.branch;
    const guestDayBranch = guestSaju.dayPillar.branch;
    const dizhiChong = DIZHI_CHONG[hostDayBranch] === guestDayBranch;
    if (dizhiChong) {
        score -= 15;
        details.push(`지지충 발견: ${hostDayBranch}${guestDayBranch}충 (-15)`);
    }

    // 4. 십신 조합 분석 (+/-10)
    // 비겁이 많으면 경쟁, 식상과 재성이 맞으면 상호보완
    const hostTenGods = Object.values(hostSaju.tenGods);
    const guestTenGods = Object.values(guestSaju.tenGods);

    // 상호 보완 체크 (식신/상관 + 정재/편재는 좋은 조합)
    const hostHasFood = hostTenGods.includes('식신') || hostTenGods.includes('상관');
    const guestHasWealth = guestTenGods.includes('정재') || guestTenGods.includes('편재');
    if (hostHasFood && guestHasWealth) {
        score += 5;
        details.push('식상-재성 보완 (+5)');
    }

    // 점수 범위 제한
    score = Math.min(100, Math.max(0, score));

    return { score, tianganHe, dizhiChong, details };
}

/**
 * Get zodiac sign from birth date
 */
function getZodiacSign(birthDate: Date): string {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
    return 'Pisces';
}

/**
 * Calculate life path number for numerology
 */
function getLifePathNumber(birthDate: Date): number {
    const dateStr = birthDate.toISOString().slice(0, 10).replace(/-/g, '');
    let sum = dateStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    while (sum > 9 && sum !== 11 && sum !== 22) {
        sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    }
    return sum;
}

/**
 * Generate premium content based on compatibility analysis
 */
function generatePremiumContent(
    hostElement: string,
    guestElement: string,
    hostSign: string,
    guestSign: string,
    overallScore: number
): { strengths: string[]; challenges: string[]; advice: string } {
    const strengths: string[] = [];
    const challenges: string[] = [];

    // Element-based strengths/challenges
    const harmony = ELEMENT_HARMONY[hostElement]?.[guestElement] ?? 0;
    if (harmony > 0) {
        strengths.push(`${hostElement}과 ${guestElement}의 상생 관계로 서로의 에너지를 키워줍니다.`);
    } else if (harmony < 0) {
        challenges.push(`${hostElement}과 ${guestElement}의 상극 관계로 갈등이 생길 수 있습니다.`);
    }

    // Zodiac-based strengths/challenges
    const hostAstroElement = SIGN_ELEMENTS[hostSign];
    const guestAstroElement = SIGN_ELEMENTS[guestSign];
    if (hostAstroElement === guestAstroElement) {
        strengths.push(`같은 ${hostAstroElement} 원소의 별자리로 깊은 공감대를 형성합니다.`);
    }

    const isCompatible = ZODIAC_COMPATIBILITY.some(([a, b]) =>
        (hostSign === a && guestSign === b) || (hostSign === b && guestSign === a)
    );
    if (isCompatible) {
        strengths.push(`${hostSign}과 ${guestSign}은 전통적으로 최고의 궁합 조합입니다.`);
    }

    // Additional generic insights
    if (overallScore >= 70) {
        strengths.push('두 분의 에너지 파장이 자연스럽게 조화를 이룹니다.');
        strengths.push('함께할수록 서로의 장점이 부각되는 관계입니다.');
    } else if (overallScore < 50) {
        challenges.push('서로 다른 리듬으로 인해 오해가 생길 수 있습니다.');
        challenges.push('상대방의 관점을 이해하려는 노력이 필요합니다.');
    }

    // Generate advice based on overall score
    let advice = '';
    if (overallScore >= 85) {
        advice = '천생연분의 조합입니다. 서로를 믿고 함께 성장해 나가세요. 큰 결정도 함께라면 좋은 결과를 만들어낼 수 있습니다.';
    } else if (overallScore >= 70) {
        advice = '좋은 관계의 기초가 있습니다. 작은 갈등은 대화로 해결하고, 서로의 다른 점을 존중하면 더욱 깊은 관계로 발전할 수 있습니다.';
    } else if (overallScore >= 55) {
        advice = '노력이 필요한 관계입니다. 서로의 차이점을 인정하고 공통 관심사를 찾아보세요. 정기적인 소통 시간을 갖는 것이 중요합니다.';
    } else if (overallScore >= 40) {
        advice = '도전적인 조합이지만 불가능하진 않습니다. 상대방의 입장에서 생각하는 연습이 필요하며, 제3자의 중재가 도움이 될 수 있습니다.';
    } else {
        advice = '극과 극의 만남입니다. 서로에게 배울 점이 많지만, 인내심과 이해가 필수입니다. 각자의 공간을 존중하면서 천천히 다가가세요.';
    }

    return { strengths, challenges, advice };
}

/**
 * Main function: Calculate compatibility between two people
 */
/**
 * Main function: Calculate compatibility between two people
 * v2.0 - Uses real Saju engine for accurate scoring
 */
export function calculateCompatibility(host: PersonData, guest: PersonData): MatchResult {
    // Parse birth times
    const [hostHour, hostMin] = (host.birthTime || '12:00').split(':').map(Number);
    const [guestHour, guestMin] = (guest.birthTime || '12:00').split(':').map(Number);

    // 1. Calculate Saju for both people using REAL engine
    const hostSaju = calculateSaju(
        host.birthDate,
        hostHour,
        hostMin,
        false, // assume solar calendar
        host.gender || 'male'
    );
    const guestSaju = calculateSaju(
        guest.birthDate,
        guestHour,
        guestMin,
        false,
        guest.gender || 'female'
    );

    // 2. Saju Score (40%) - using real engine
    const sajuResult = calculateSajuCompatibility(hostSaju, guestSaju);
    const sajuScore = sajuResult.score;
    const hostElement = FIVE_ELEMENTS[hostSaju.elements[2].stem];
    const guestElement = FIVE_ELEMENTS[guestSaju.elements[2].stem];

    // 3. Astrology Score (40%)
    const hostSign = getZodiacSign(host.birthDate);
    const guestSign = getZodiacSign(guest.birthDate);
    const hostAstroElement = SIGN_ELEMENTS[hostSign];
    const guestAstroElement = SIGN_ELEMENTS[guestSign];

    let astroBase = 50;
    if (hostAstroElement === guestAstroElement) astroBase += 10;
    if ((hostAstroElement === 'Fire' && guestAstroElement === 'Air') ||
        (hostAstroElement === 'Air' && guestAstroElement === 'Fire') ||
        (hostAstroElement === 'Earth' && guestAstroElement === 'Water') ||
        (hostAstroElement === 'Water' && guestAstroElement === 'Earth')) {
        astroBase += 15;
    }
    const isCompatible = ZODIAC_COMPATIBILITY.some(([a, b]) =>
        (hostSign === a && guestSign === b) || (hostSign === b && guestSign === a)
    );
    if (isCompatible) astroBase += 20;
    const astroScore = Math.min(100, Math.max(0, astroBase));

    // 4. Numerology Score (20%)
    const hostLifePath = getLifePathNumber(host.birthDate);
    const guestLifePath = getLifePathNumber(guest.birthDate);
    const numDiff = Math.abs(hostLifePath - guestLifePath);
    const numScore = numDiff === 0 ? 100 : Math.max(0, 80 - numDiff * 10);

    // Overall weighted score
    const overallScore = Math.round(
        sajuScore * 0.4 + astroScore * 0.4 + numScore * 0.2
    );

    // Generate summary
    let summary = '';
    if (overallScore >= 85) {
        summary = '천생연분! 두 분은 우주적 조화 속에서 만난 운명입니다. ✨';
    } else if (overallScore >= 70) {
        summary = '좋은 궁합입니다. 서로의 부족함을 채워줄 수 있는 관계예요. 💫';
    } else if (overallScore >= 55) {
        summary = '적당한 궁합입니다. 노력으로 더 좋아질 수 있어요. 🌙';
    } else if (overallScore >= 40) {
        summary = '도전적인 관계입니다. 서로를 이해하려면 노력이 필요해요. 🌊';
    } else {
        summary = '상극의 기운이 느껴집니다. 하지만 극과 극은 통하기도 해요. 🔥';
    }

    // Generate premium content
    const { strengths, challenges, advice } = generatePremiumContent(
        hostElement, guestElement, hostSign, guestSign, overallScore
    );

    return {
        overallScore,
        sajuScore,
        astroScore,
        numScore,
        hostElement,
        guestElement,
        hostSign,
        guestSign,
        summary,
        strengths,
        challenges,
        advice,
        // v2.0 - Real Saju details
        hostDayMaster: hostSaju.dayMaster,
        guestDayMaster: guestSaju.dayMaster,
        tianganHe: sajuResult.tianganHe,
        dizhiChong: sajuResult.dizhiChong,
    };
}
