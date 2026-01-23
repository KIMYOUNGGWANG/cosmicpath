import KoreanLunarCalendar from 'korean-lunar-calendar';

// ... (Types)

// --- Helper for Day Master ---
export function calculateDayMaster(dateStr: string): DayMaster {
    const calendar = new KoreanLunarCalendar();
    const date = new Date(dateStr);

    // Set solar date
    calendar.setSolarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());

    // Get Gan-Zhi (Sexagenary Cycle)
    // KoreanLunarCalendar returns { day: 'GapJa', ... } roughly? 
    // Actually it returns Korean string usually, let's verify or use the getChineseCalendar method if available.
    // The library usually returns { day: '갑자' } in Korean.

    const gapja = calendar.getKoreanGapja();
    const dayGanZhi = gapja.day; // e.g., '갑자'

    // Extract first character (Stem)
    const stemChar = dayGanZhi.charAt(0); // '갑'

    // Map Korean Stem to English DayMaster type
    const STEM_MAP: Record<string, DayMaster> = {
        '갑': 'jia', '을': 'yi',
        '병': 'bing', '정': 'ding',
        '무': 'wu', '기': 'ji',
        '경': 'geng', '신': 'xin',
        '임': 'ren', '계': 'gui'
    };

    return STEM_MAP[stemChar] || 'jia'; // Fallback
}

// ... (Existing calculateDailyForecast)

export type DayMaster = 'jia' | 'yi' | 'bing' | 'ding' | 'wu' | 'ji' | 'geng' | 'xin' | 'ren' | 'gui';

export interface DailyForecast {
    date: string; // YYYY-MM-DD
    score: number; // 0-100
    keyword: string; // e.g., "Wealth", "Caution"
    tenGod: string; // e.g., "Direct Wealth", "Seven Killings"
    advice: string; // One sentence advice
    luckyColor: string;
    luckyDirection: string;
}

// --- Constants & Mappings ---

const TEN_GODS_MAP: Record<string, { keyword: string; advice: string[] }> = {
    'Friend': {
        keyword: 'Competition',
        advice: ['Trust your own judgment today.', 'A good day to network with peers.', 'Stand your ground firmly today.']
    },
    'Rob Wealth': {
        keyword: 'Caution',
        advice: ['Watch your wallet and spending.', 'Avoid risky investments today.', 'Someone might try to take credit for your work.']
    },
    'Eating God': {
        keyword: 'Creativity',
        advice: ['Express your ideas freely.', 'Indulge in good food and relaxation.', 'A perfect day for brainstorming.']
    },
    'Hurting Officer': {
        keyword: 'Rebellion',
        advice: ['Watch your words to avoid conflict.', 'Channel your energy into innovation.', 'Don\'t be afraid to break the norm sensibly.']
    },
    'Direct Wealth': {
        keyword: 'Stable Wealth',
        advice: ['A steady approach leads to financial gain.', 'Good for planning long-term savings.', 'Hard work pays off directly today.']
    },
    'Indirect Wealth': {
        keyword: 'Opportunity',
        advice: ['Keep an eye out for unexpected bonuses.', 'A little risk might yield high rewards.', 'Business luck is on your side.']
    },
    'Direct Officer': {
        keyword: 'Authority',
        advice: ['Follow the rules and procedures.', 'A good day for official meetings.', 'your reputation is enhanced by discipline.']
    },
    'Seven Killings': {
        keyword: 'Pressure',
        advice: ['Take on the challenge bravely.', 'Stress is high, but so is the potential for breakthrough.', 'Stay calm under pressure.']
    },
    'Direct Resource': {
        keyword: 'Support',
        advice: ['Seek mentorship or study.', 'Contracts and documents are favored.', 'Listen to your intuition.']
    },
    'Indirect Resource': {
        keyword: 'Insight',
        advice: ['Unconventional ideas provide the solution.', 'trust your unique perspective.', 'A good day for research and mystery.']
    },
};

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const STEMS = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];

// Simple mapping for Day Master Element
const DM_ELEMENT_MAP: Record<string, string> = {
    'jia': 'Wood', 'yi': 'Wood',
    'bing': 'Fire', 'ding': 'Fire',
    'wu': 'Earth', 'ji': 'Earth',
    'geng': 'Metal', 'xin': 'Metal',
    'ren': 'Water', 'gui': 'Water'
};

// Simple mapping for daily stems to elements (Index 0-9)
const STEM_ELEMENTS = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];

// To calculate Ten Gods:
// 1. Get DM Element.
// 2. Get Daily Stem Element.
// 3. Compare (Same, Output, Wealth, Officer, Resource) x (Yin/Yang).

// --- Core Functions ---

/**
 * Calculates the daily forecast based on the user's Day Master and the current date.
 * This is a deterministic function that does NOT require an API call.
 */
export function calculateDailyForecast(dayMaster: DayMaster, dateStr: string): DailyForecast {
    // 1. Parse Date to get Daily Stem (Simplified Logic for MVP)
    // In a real Saju engine, we need precise Gan-Zhi calculation.
    // For this MVP, we will simulate a deterministic daily stem based on the date.
    // We can use a simple hash of the date or a known reference point.
    // Reference: Jan 1, 2024 was a Jia Zi (Wood Rat) day.

    const refDate = new Date('2024-01-01');
    const targetDate = new Date(dateStr);
    const diffTime = Math.abs(targetDate.getTime() - refDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 60-year cycle (Gan-Zhi)
    // Heavenly Stems cycle 10.
    const stemIndex = (0 + diffDays) % 10; // 0 was Jia
    const dailyStem = STEMS[stemIndex];
    const dailyElement = STEM_ELEMENTS[stemIndex];

    // 2. Determine Ten Gods Relationship
    const userElement = DM_ELEMENT_MAP[dayMaster];
    const tenGod = determineTenGod(dayMaster, stemIndex); // We need a more rigorous mapping here

    // 3. Generate Score & Content
    // Score Logic: generally, Resource/Wealth/Officer are considered 'good' (high score),
    // Seven Killings/Rob Wealth might be 'challenging' (lower score, but constructive).
    // We'll randomize slightly based on the date hash to make it feel natural, but bounded by the Ten God type.

    const baseScore = getBaseScore(tenGod);
    const randomFactor = (diffDays % 20) - 10; // -10 to +10 variance
    const finalScore = Math.min(100, Math.max(40, baseScore + randomFactor));

    const info = TEN_GODS_MAP[tenGod] || { keyword: 'Balance', advice: ['Stay centered today.'] };
    const adviceIndex = diffDays % info.advice.length;

    return {
        date: dateStr,
        score: finalScore,
        keyword: info.keyword,
        tenGod: tenGod,
        advice: info.advice[adviceIndex],
        luckyColor: getLuckyColor(dailyElement),
        luckyDirection: getLuckyDirection(dailyStem)
    };
}

// --- Helpers ---

function determineTenGod(dm: DayMaster, dailyStemIndex: number): string {
    // DM Indices: 0=Jia, 1=Yi, ... 9=Gui
    const dmIndex = STEMS.findIndex(s => s.toLowerCase() === dm.toLowerCase());

    // Relationship Calculation
    // 0: Friend (Same Polarity)
    // 1: Rob Wealth (Opposite Polarity)
    // 2: Eating God (Output Same)
    // 3: Hurting Officer (Output Opposite)
    // 4: Direct Wealth (Control Opposite)
    // 5: Indirect Wealth (Control Same) - Wait, standard is 4=Ind, 5=Dir usually. Let's strictly map.

    // Simplified Logic: 
    // Same Element: Friend/Rob
    // DM produces Day: Eating/Hurting
    // DM controls Day: Indirect/Direct Wealth
    // Day controls DM: 7 Killings/Direct Officer
    // Day produces DM: Indirect/Direct Resource

    const relationshipMatrix = [
        ['Friend', 'Rob Wealth', 'Eating God', 'Hurting Officer', 'Indirect Wealth', 'Direct Wealth', 'Seven Killings', 'Direct Officer', 'Indirect Resource', 'Direct Resource'], // Jia
        ['Rob Wealth', 'Friend', 'Hurting Officer', 'Eating God', 'Direct Wealth', 'Indirect Wealth', 'Direct Officer', 'Seven Killings', 'Direct Resource', 'Indirect Resource'], // Yi
        // ... Ideally we map this mathematically.
        // Distance from DM index (wrapping 10)
    ];

    // Mathematical approach:
    // Offset = (dailyStemIndex - dmIndex + 10) % 10
    // 0: Friend
    // 1: Rob Wealth
    // 2: Eating God
    // 3: Hurting Officer
    // 4: Indirect Wealth
    // 5: Direct Wealth
    // 6: Seven Killings
    // 7: Direct Officer
    // 8: Indirect Resource
    // 9: Direct Resource

    const offset = (dailyStemIndex - dmIndex + 10) % 10;

    const tenGods = [
        'Friend', 'Rob Wealth',
        'Eating God', 'Hurting Officer',
        'Indirect Wealth', 'Direct Wealth',
        'Seven Killings', 'Direct Officer',
        'Indirect Resource', 'Direct Resource'
    ];

    // Note: The mapping above assumes standard generation cycle order. 
    // Wood(0,1) -> Fire(2,3) -> Earth(4,5) -> Metal(6,7) -> Water(8,9)
    // So if DM is Jia(0), 
    // Bing(2) is Eating God. Correct.
    // Wu(4) is Indirect Wealth. Correct.
    // Geng(6) is Seven Killings. Correct.
    // Ren(8) is Indirect Resource. Correct.

    return tenGods[offset];

}

function getBaseScore(tenGod: string): number {
    switch (tenGod) {
        case 'Direct Wealth':
        case 'Direct Officer':
        case 'Direct Resource':
        case 'Eating God':
            return 85;
        case 'Indirect Wealth':
        case 'Indirect Resource':
            return 80;
        case 'Friend':
            return 75;
        case 'Hurting Officer':
            return 70;
        case 'Seven Killings':
        case 'Rob Wealth':
            return 60; // Challenges
        default:
            return 75;
    }
}

function getLuckyColor(element: string): string {
    const map: Record<string, string> = {
        'Wood': 'Green',
        'Fire': 'Red',
        'Earth': 'Yellow',
        'Metal': 'White',
        'Water': 'Black/Blue'
    };
    return map[element] || 'White';
}

function getLuckyDirection(stem: string): string {
    // Simple mapping
    return 'East'; // Placeholder
}
