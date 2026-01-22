/**
 * Daily Forecast Engine
 * Combines Astrology transits + Saju daily elements to generate
 * a personalized "Daily Strategy" for the user.
 * 
 * @version 1.0.0
 */

import { AstrologyResult, ZODIAC_SIGNS, HOUSES } from './astrology';
import { SajuResult, FIVE_ELEMENTS, STEM_ELEMENTS, yearToGanji, HEAVENLY_STEMS, EARTHLY_BRANCHES } from './saju';

// ============================================================================
// Types
// ============================================================================

export type StrategyKeyword = 'ATTACK' | 'DEFEND' | 'FOCUS' | 'REST' | 'CONNECT' | 'CREATE';

export interface DailyForecast {
    date: string;                    // YYYY-MM-DD
    strategyKeyword: StrategyKeyword;
    strategyScore: number;           // -100 to +100
    headline: string;                // 한글/영어 헤드라인
    headlineEn: string;
    moonTransit: {
        sign: number;
        signName: string;
        house: number;               // 사용자 상승궁 기준 하우스
        houseMeaning: string;
    };
    dailyElement: {
        stem: string;
        branch: string;
        element: keyof typeof FIVE_ELEMENTS;
        userElementRelation: 'support' | 'clash' | 'drain' | 'neutral';
    };
    advice: string;                  // 구체적 조언
    adviceEn: string;
    luckyTime: string;               // "오전 10시-12시"
    luckyTimeEn: string;
    cautionTime?: string;            // "오후 2시-4시"
}

// ============================================================================
// Core Logic
// ============================================================================

/**
 * Calculate today's Gan-Ji (天干地支)
 * Based on the 60-day Sexagenary cycle
 */
function getTodayGanJi(date: Date): { stem: string; branch: string } {
    // Epoch: 1984-02-02 was 甲子日 (Gap-Ja Day)
    const epochDate = new Date(Date.UTC(1984, 1, 2)); // Feb 2, 1984
    const today = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    const diffDays = Math.floor((today.getTime() - epochDate.getTime()) / (1000 * 60 * 60 * 24));

    const stemIdx = ((diffDays % 10) + 10) % 10;
    const branchIdx = ((diffDays % 12) + 12) % 12;

    return {
        stem: HEAVENLY_STEMS[stemIdx],
        branch: EARTHLY_BRANCHES[branchIdx]
    };
}

/**
 * Get today's Moon position (simplified)
 * Moon moves ~13 degrees per day, cycling through zodiac in ~27.3 days
 */
function getTodayMoonSign(date: Date): { sign: number; degree: number } {
    // Moon's average motion: 13.176° per day
    // Epoch: 2000-01-01 12:00 UTC, Moon was at approximately 280° (Capricorn)
    const epochDate = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const today = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));

    const diffDays = (today.getTime() - epochDate.getTime()) / (1000 * 60 * 60 * 24);
    const moonLongitude = (280 + diffDays * 13.176) % 360;

    return {
        sign: Math.floor(moonLongitude / 30),
        degree: moonLongitude % 30
    };
}

/**
 * Calculate which house the Moon is transiting (relative to user's Ascendant)
 */
function getMoonHouse(moonSign: number, userAscendant: number): number {
    let house = ((moonSign - userAscendant + 12) % 12) + 1;
    if (house > 12) house -= 12;
    return house;
}

/**
 * Determine how today's element relates to user's Day Master element
 */
function getElementRelation(
    todayElement: keyof typeof FIVE_ELEMENTS,
    userElement: keyof typeof FIVE_ELEMENTS
): 'support' | 'clash' | 'drain' | 'neutral' {
    const generateCycle: Record<string, string> = {
        wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood'
    };
    const controlCycle: Record<string, string> = {
        wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood'
    };

    // 오늘의 기운이 나를 생해주면 support
    if (generateCycle[todayElement] === userElement) return 'support';
    // 내가 오늘 기운을 생해주면 drain
    if (generateCycle[userElement] === todayElement) return 'drain';
    // 오늘 기운이 나를 극하면 clash
    if (controlCycle[todayElement] === userElement) return 'clash';
    // 같은 오행이거나 기타
    return 'neutral';
}

/**
 * Determine strategy keyword based on Moon house + Element relation
 */
function determineStrategy(
    moonHouse: number,
    elementRelation: 'support' | 'clash' | 'drain' | 'neutral'
): { keyword: StrategyKeyword; score: number } {
    // House-based base strategy
    const houseStrategy: Record<number, StrategyKeyword> = {
        1: 'ATTACK',   // Self/Identity - Go for it
        2: 'FOCUS',    // Resources - Build
        3: 'CONNECT',  // Communication
        4: 'REST',     // Home - Recharge
        5: 'CREATE',   // Creativity
        6: 'FOCUS',    // Work/Health
        7: 'CONNECT',  // Partnerships
        8: 'REST',     // Transformation - Reflect
        9: 'ATTACK',   // Adventure
        10: 'ATTACK',  // Career - Perform
        11: 'CONNECT', // Community
        12: 'REST',    // Spirituality - Retreat
    };

    let baseKeyword = houseStrategy[moonHouse] || 'FOCUS';
    let score = 50;

    // Modify based on element relation
    switch (elementRelation) {
        case 'support':
            score += 30;
            // Upgrade defensive to offensive
            if (baseKeyword === 'REST') baseKeyword = 'FOCUS';
            if (baseKeyword === 'DEFEND') baseKeyword = 'ATTACK';
            break;
        case 'clash':
            score -= 40;
            // Downgrade offensive to defensive
            if (baseKeyword === 'ATTACK') baseKeyword = 'DEFEND';
            if (baseKeyword === 'CREATE') baseKeyword = 'FOCUS';
            break;
        case 'drain':
            score -= 15;
            if (baseKeyword === 'ATTACK') baseKeyword = 'FOCUS';
            break;
        case 'neutral':
            // No change
            break;
    }

    return { keyword: baseKeyword, score: Math.max(-100, Math.min(100, score)) };
}

/**
 * Generate headline text based on strategy
 */
function generateHeadline(
    keyword: StrategyKeyword,
    elementRelation: 'support' | 'clash' | 'drain' | 'neutral'
): { ko: string; en: string } {
    const headlines: Record<StrategyKeyword, { ko: string; en: string }[]> = {
        ATTACK: [
            { ko: '오늘은 적극적으로 밀고 나가세요!', en: 'Push forward boldly today!' },
            { ko: '승부사의 본능을 발휘할 때입니다.', en: 'Time to unleash your competitive edge.' }
        ],
        DEFEND: [
            { ko: '오늘은 수비가 답입니다.', en: 'Defense is the answer today.' },
            { ko: '신중하게, 단단하게 버티세요.', en: 'Hold your ground carefully.' }
        ],
        FOCUS: [
            { ko: '디테일에 집중하면 빛이 납니다.', en: "Focus on details — you'll shine." },
            { ko: '오늘 쌓은 것이 내일을 만듭니다.', en: 'What you build today shapes tomorrow.' }
        ],
        REST: [
            { ko: '멈춤도 전략입니다.', en: 'Pausing is also a strategy.' },
            { ko: '재충전이 필요한 날이에요.', en: 'A day to recharge.' }
        ],
        CONNECT: [
            { ko: '사람이 답입니다.', en: 'People are the answer.' },
            { ko: '중요한 인연이 다가올 수 있어요.', en: 'A meaningful connection may arrive.' }
        ],
        CREATE: [
            { ko: '창작 에너지가 폭발합니다!', en: 'Your creative energy is on fire!' },
            { ko: '새로운 시도가 행운을 부릅니다.', en: 'New experiments invite luck.' }
        ]
    };

    const options = headlines[keyword] || headlines.FOCUS;
    // Pick based on element relation for variety
    const idx = elementRelation === 'support' ? 0 : 1;
    return { ko: options[idx % options.length].ko, en: options[idx % options.length].en };
}

/**
 * Generate specific advice based on Moon house
 */
function generateAdvice(moonHouse: number): { ko: string; en: string } {
    const adviceMap: Record<number, { ko: string; en: string }> = {
        1: { ko: '자기 어필에 적극적으로 나서세요.', en: 'Put yourself out there.' },
        2: { ko: '재무/투자 결정은 신중하게.', en: 'Be careful with financial decisions.' },
        3: { ko: '중요한 메시지를 전달하기 좋은 날.', en: 'Great day for important communications.' },
        4: { ko: '가족과의 시간을 우선시하세요.', en: 'Prioritize family time.' },
        5: { ko: '취미나 연애에 시간을 투자하세요.', en: 'Invest in hobbies or romance.' },
        6: { ko: '작은 디테일을 놓치지 마세요.', en: "Don't miss small details." },
        7: { ko: '파트너/협력자와 대화하세요.', en: 'Communicate with partners.' },
        8: { ko: '깊은 성찰과 정리가 필요한 날.', en: 'A day for deep reflection.' },
        9: { ko: '새로운 아이디어나 학습에 열려있으세요.', en: 'Stay open to new ideas.' },
        10: { ko: '커리어 목표를 밀어붙이세요.', en: 'Push for your career goals.' },
        11: { ko: '네트워킹이 좋은 결과를 가져옵니다.', en: 'Networking brings good results.' },
        12: { ko: '혼자만의 시간이 필요합니다.', en: 'You need alone time.' },
    };
    return adviceMap[moonHouse] || adviceMap[6];
}

/**
 * Calculate lucky/caution times based on 12 earthly branches (시간대)
 */
function getLuckyTime(keyword: StrategyKeyword): { lucky: { ko: string; en: string }; caution?: { ko: string; en: string } } {
    // Simplified time slots
    const timeSlots: Record<StrategyKeyword, { lucky: string; caution?: string }> = {
        ATTACK: { lucky: '09:00-11:00', caution: '15:00-17:00' },
        DEFEND: { lucky: '21:00-23:00' },
        FOCUS: { lucky: '10:00-12:00', caution: '14:00-16:00' },
        REST: { lucky: '12:00-14:00' },
        CONNECT: { lucky: '18:00-20:00' },
        CREATE: { lucky: '08:00-10:00', caution: '13:00-15:00' },
    };

    const slot = timeSlots[keyword] || timeSlots.FOCUS;
    return {
        lucky: { ko: slot.lucky, en: slot.lucky },
        caution: slot.caution ? { ko: slot.caution, en: slot.caution } : undefined
    };
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Generate Daily Forecast
 * @param userAstro - User's natal Astrology chart
 * @param userSaju - User's natal Saju chart
 * @param date - Target date (defaults to today)
 */
export function generateDailyForecast(
    userAstro: AstrologyResult,
    userSaju: SajuResult,
    date: Date = new Date()
): DailyForecast {
    const dateStr = date.toISOString().split('T')[0];

    // 1. Calculate today's Moon position
    const todayMoon = getTodayMoonSign(date);
    const moonHouse = getMoonHouse(todayMoon.sign, userAstro.ascendant);
    const moonSignName = ZODIAC_SIGNS[todayMoon.sign]?.name || '알 수 없음';
    const houseMeaning = HOUSES[moonHouse - 1]?.meaning || '';

    // 2. Calculate today's Gan-Ji (Day pillar)
    const todayGanji = getTodayGanJi(date);
    const todayElement = STEM_ELEMENTS[todayGanji.stem] as keyof typeof FIVE_ELEMENTS;

    // 3. Get user's Day Master element
    const userDayMaster = userSaju.dayMaster;
    const userElement = STEM_ELEMENTS[userDayMaster] as keyof typeof FIVE_ELEMENTS || 'earth';

    // 4. Calculate element relation
    const elementRelation = getElementRelation(todayElement, userElement);

    // 5. Determine strategy
    const { keyword, score } = determineStrategy(moonHouse, elementRelation);

    // 6. Generate texts
    const headline = generateHeadline(keyword, elementRelation);
    const advice = generateAdvice(moonHouse);
    const times = getLuckyTime(keyword);

    return {
        date: dateStr,
        strategyKeyword: keyword,
        strategyScore: score,
        headline: headline.ko,
        headlineEn: headline.en,
        moonTransit: {
            sign: todayMoon.sign,
            signName: moonSignName,
            house: moonHouse,
            houseMeaning
        },
        dailyElement: {
            stem: todayGanji.stem,
            branch: todayGanji.branch,
            element: todayElement,
            userElementRelation: elementRelation
        },
        advice: advice.ko,
        adviceEn: advice.en,
        luckyTime: times.lucky.ko,
        luckyTimeEn: times.lucky.en,
        cautionTime: times.caution?.ko
    };
}

/**
 * Get strategy keyword display text
 */
export function getStrategyDisplay(keyword: StrategyKeyword, lang: 'ko' | 'en' = 'ko'): { label: string; emoji: string; color: string } {
    const displays: Record<StrategyKeyword, { ko: string; en: string; emoji: string; color: string }> = {
        ATTACK: { ko: '공격', en: 'Attack', emoji: '⚔️', color: '#EF4444' },
        DEFEND: { ko: '수비', en: 'Defend', emoji: '🛡️', color: '#3B82F6' },
        FOCUS: { ko: '집중', en: 'Focus', emoji: '🎯', color: '#8B5CF6' },
        REST: { ko: '휴식', en: 'Rest', emoji: '🌙', color: '#6366F1' },
        CONNECT: { ko: '연결', en: 'Connect', emoji: '🤝', color: '#10B981' },
        CREATE: { ko: '창조', en: 'Create', emoji: '✨', color: '#F59E0B' },
    };

    const display = displays[keyword];
    return {
        label: lang === 'ko' ? display.ko : display.en,
        emoji: display.emoji,
        color: display.color
    };
}
