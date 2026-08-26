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

export interface PersonalYearResult {
    year: number;
    personalYearNumber: number;
    keyword: string;
    keywordEn: string;
    themeKo: string;
    themeEn: string;
    actionTag: 'PUSH' | 'PIVOT' | 'HARVEST' | 'DEFEND';
}

/**
 * Calculate 9-Year Personal Year Cycle (Numerology)
 * Personal Year = (Reduced Birth Month + Reduced Birth Day + Reduced Target Year) % 9
 */
export function calculatePersonalYear(birthDate: Date, targetYear: number = new Date().getFullYear()): PersonalYearResult {
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();

    const reduceToSingleDigit = (num: number): number => {
        let current = num;
        while (current > 9) {
            current = sumDigits(current);
        }
        return current;
    };

    const reducedMonth = reduceToSingleDigit(month);
    const reducedDay = reduceToSingleDigit(day);
    const reducedTargetYear = reduceToSingleDigit(targetYear);

    let personalYearNumber = reduceToSingleDigit(reducedMonth + reducedDay + reducedTargetYear);
    if (personalYearNumber === 0) personalYearNumber = 9;

    const PERSONAL_YEAR_DATA: Record<number, { ko: string; en: string; themeKo: string; themeEn: string; actionTag: 'PUSH' | 'PIVOT' | 'HARVEST' | 'DEFEND' }> = {
        1: {
            ko: '새로운 씨앗과 독립 (New Beginnings)',
            en: 'New Beginnings & Initiation',
            themeKo: '새로운 9년 주기의 시작점으로, 과거의 잔재를 털고 새로운 프로젝트나 방향을 개척할 최적의 해입니다.',
            themeEn: 'The start of a fresh 9-year cycle. Time to plant new seeds and pioneer new initiatives.',
            actionTag: 'PUSH',
        },
        2: {
            ko: '협력과 인내 (Patience & Alignment)',
            en: 'Cooperation & Alignment',
            themeKo: '조급하게 서두르기보다 파트너십을 다지고 디테일을 조율하며 내실을 다지는 해입니다.',
            themeEn: 'Focus on cooperation, patience, and aligning key details rather than forcing rapid expansion.',
            actionTag: 'DEFEND',
        },
        3: {
            ko: '자기표현과 확장 (Creative Expansion)',
            en: 'Creative Expansion & Expression',
            themeKo: '창의성과 네트워킹, 마케팅과 대외 활동이 활발해지는 시기로, 나만의 색깔을 세상에 알릴 때입니다.',
            themeEn: 'A social, expressive year ideal for networking, creative output, and expanding your reach.',
            actionTag: 'PUSH',
        },
        4: {
            ko: '기반 구축과 시스템 (Foundation & Order)',
            en: 'Foundation Building & Discipline',
            themeKo: '체계와 규율, 법적·재무적 기초를 단단히 다지는 해로, 꼼수보다 원칙이 결실을 낳습니다.',
            themeEn: 'A practical, disciplined year to build rock-solid foundations, systems, and routines.',
            actionTag: 'PIVOT',
        },
        5: {
            ko: '자유와 대전환 (Dynamic Transition)',
            en: 'Freedom & Dynamic Shift',
            themeKo: '예상치 못한 변화와 이동, 환경의 대전환이 일어나는 해로, 유연하게 기회를 포착해야 합니다.',
            themeEn: 'A year of rapid change, travel, unpredictability, and pivoting into new opportunities.',
            actionTag: 'PIVOT',
        },
        6: {
            ko: '책임과 조화 (Harmony & Stewardship)',
            en: 'Responsibility & Family/Home',
            themeKo: '가정, 팀, 핵심 인간관계에 대한 책임과 헌신이 요구되며, 안정과 신뢰가 자산이 되는 해입니다.',
            themeEn: 'A year centered on personal responsibilities, relationships, community, and service.',
            actionTag: 'DEFEND',
        },
        7: {
            ko: '내면 성찰과 전문성 (Deep Mastery)',
            en: 'Introspection & Mastery',
            themeKo: '외형 확장보다 전문 지식 습득, 전략 연구, 내면적 성장이 폭발하는 지혜의 해입니다.',
            themeEn: 'A year for deep research, skill mastery, inner growth, and strategic planning.',
            actionTag: 'DEFEND',
        },
        8: {
            ko: '물질적 대수확 (Harvest & Power)',
            en: 'Harvest, Power & Abundance',
            themeKo: '9년 주기 중 가장 큰 금전적 보상과 사회적 영향력이 주어지는 해로, 과감하게 결실을 쟁취할 때입니다.',
            themeEn: 'The major power and harvest year of the 9-year cycle. Optimal for wealth and leadership moves.',
            actionTag: 'HARVEST',
        },
        9: {
            ko: '완결과 정리 (Completion & Release)',
            en: 'Completion, Wisdom & Release',
            themeKo: '낡은 프로젝트와 불필요한 관계를 정리하고, 다음 9년의 새 판을 위해 여백을 마련하는 해입니다.',
            themeEn: 'The culmination and closure year. Clear out stale commitments to prepare for the next cycle.',
            actionTag: 'PIVOT',
        },
    };

    const data = PERSONAL_YEAR_DATA[personalYearNumber] || PERSONAL_YEAR_DATA[1];
    return {
        year: targetYear,
        personalYearNumber,
        keyword: data.ko,
        keywordEn: data.en,
        themeKo: data.themeKo,
        themeEn: data.themeEn,
        actionTag: data.actionTag,
    };
}

export interface HumanDesignStrategyResult {
    energyType: string;
    energyTypeEn: string;
    strategy: string;
    strategyEn: string;
    decisionAuthority: string;
    decisionAuthorityEn: string;
    sajuMapping: string;
}

/**
 * Derive Human Design Decision Strategy from Saju & Elemental Profile
 */
export function getHumanDesignStrategy(sajuProfile?: { dayMaster?: string; dominantElement?: string }): HumanDesignStrategyResult {
    const dayMaster = sajuProfile?.dayMaster || '';
    const dominant = sajuProfile?.dominantElement || '';

    if (['갑', '병', '무', '경', '임', 'Yang Wood', 'Yang Fire', 'Yang Earth', 'Yang Metal', 'Yang Water'].some(stem => dayMaster.includes(stem)) && dominant === 'fire') {
        return {
            energyType: '매니페스터 (선도 개척형 / Manifestor)',
            energyTypeEn: 'Manifestor (Initiator)',
            strategy: '먼저 주도권을 잡되, 주변에 실행 계획을 사전 공유하고 돌격',
            strategyEn: 'Initiate directly and inform affected parties before acting.',
            decisionAuthority: '직관적 충동 통제 (Emotional/Splenic Clarity)',
            decisionAuthorityEn: 'Splenic / Emotional Clarity',
            sajuMapping: '양간(陽干)의 강한 추진력과 화(火) 기운의 직관 발현',
        };
    }

    if (dominant === 'water' || ['계', '임', 'Yin Water', 'Yang Water'].some(stem => dayMaster.includes(stem))) {
        return {
            energyType: '프로젝터 (가이드 조율형 / Projector)',
            energyTypeEn: 'Projector (Guide & Strategist)',
            strategy: '억지로 먼저 밀지 말고, 명확한 인정과 공식 제안(초대)이 왔을 때 수락',
            strategyEn: 'Wait for recognition and formal invitations before committing energy.',
            decisionAuthority: '환경 관찰 및 1:1 심층 조율 (Self-Projected / Splenic)',
            decisionAuthorityEn: 'Recognition & Guidance',
            sajuMapping: '수(水) 기운의 깊은 통찰력과 흐름을 관망하는 지혜',
        };
    }

    if (dominant === 'metal' || dominant === 'earth') {
        return {
            energyType: '매니페스팅 제너레이터 (초고속 실행형 / Manifesting Generator)',
            energyTypeEn: 'Manifesting Generator (Multi-Passionate)',
            strategy: '외부 기회가 들어왔을 때 본능적 반응을 확인하고 초고속으로 병렬 실행',
            strategyEn: 'Respond to gut resonance and pivot rapidly while eliminating bottlenecks.',
            decisionAuthority: '순간적 장기 반응 (Sacral / Emotional Authority)',
            decisionAuthorityEn: 'Sacral Response with Quick Pivots',
            sajuMapping: '금(金)의 결단력과 토(土)의 실용적 구축력 결합',
        };
    }

    return {
        energyType: '제너레이터 (장인 축적형 / Generator)',
        energyTypeEn: 'Generator (Builder & Master)',
        strategy: '억지로 판을 벌리지 말고, 눈앞에 들어온 일에 온몸으로 몰입하여 장인급 완성도 달성',
        strategyEn: 'Wait to respond to real opportunities and master one craft deeply.',
        decisionAuthority: '천골 직관 반응 (Sacral Gut Feeling)',
        decisionAuthorityEn: 'Sacral Gut Clarity',
        sajuMapping: '목(木)의 생명력과 사주 원국의 꾸준한 축적력 발현',
    };
}
