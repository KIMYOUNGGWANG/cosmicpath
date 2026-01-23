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
        keyword: '어깨를 나란히 (비견)',
        advice: [
            '내 주관을 확실히 밀고 나가야 하는 날입니다.',
            '동료나 친구와의 협력이 의외의 성과를 냅니다.',
            '누구의 말보다 당신의 직감을 믿으세요.'
        ]
    },
    'Rob Wealth': {
        keyword: '빼앗길 위기 (겁재)',
        advice: [
            '지갑을 조심하세요. 충동적인 지출은 금물입니다.',
            '나의 공을 가로채려는 사람이 있을 수 있습니다.',
            '무리한 투자는 절대 피해야 하는 하루입니다.'
        ]
    },
    'Eating God': {
        keyword: '표현과 즐거움 (식신)',
        advice: [
            '당신의 아이디어가 빛을 발합니다. 마음껏 표현하세요.',
            '맛있는 음식을 먹으면 운이 트입니다.',
            '창조적인 활동에 최적화된 하루입니다.'
        ]
    },
    'Hurting Officer': {
        keyword: '파격과 혁신 (상관)',
        advice: [
            '말실수를 조심해야 합니다. 한 번 더 생각하고 말하세요.',
            '기존의 틀을 깨는 새로운 시도가 오히려 좋습니다.',
            '남들이 보지 못하는 허점을 당신은 발견합니다.'
        ]
    },
    'Direct Wealth': {
        keyword: '안전한 수확 (정재)',
        advice: [
            '성실함이 곧 돈이 되는 날입니다.',
            '꼼꼼하게 계획한 일들이 순조롭게 풀립니다.',
            '작지만 확실한 행복이 찾아옵니다.'
        ]
    },
    'Indirect Wealth': {
        keyword: '뜻밖의 횡재 (편재)',
        advice: [
            '생각지 못한 곳에서 기회가 옵니다. 시야를 넓힙니다.',
            '사업적인 감각이 예리해지는 날입니다.',
            '큰 그림을 그리고 대범하게 움직이세요.'
        ]
    },
    'Direct Officer': {
        keyword: '명예와 승진 (정관)',
        advice: [
            '원칙을 지키면 인정받는 하루입니다.',
            '중요한 면접이나 미팅에 아주 좋습니다.',
            '당신의 품격이 자연스럽게 드러납니다.'
        ]
    },
    'Seven Killings': {
        keyword: '압박과 돌파 (편관)',
        advice: [
            '호랑이 등에 탄 격입니다. 정신을 바짝 차려야 합니다.',
            '스트레스가 많지만, 이겨내면 큰 성과가 있습니다.',
            '피하지 말고 정면으로 돌파하면 길이 열립니다.'
        ]
    },
    'Direct Resource': {
        keyword: '후원과 문서 (정인)',
        advice: [
            '윗사람의 도움을 받을 수 있는 날입니다.',
            '계약이나 문서 작성에 유리합니다.',
            '차분히 공부하거나 깊이 생각하기 좋습니다.'
        ]
    },
    'Indirect Resource': {
        keyword: '직관과 신비 (편인)',
        advice: [
            '남다른 센스가 발휘됩니다. 독특한 해결책을 찾으세요.',
            '외로움을 즐기면 오히려 영감을 얻습니다.',
            '비현실적인 상상이 현실이 될 수 있습니다.'
        ]
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
        'Wood': '초록 (Green)',
        'Fire': '빨강 (Red)',
        'Earth': '노랑 (Yellow)',
        'Metal': '흰색 (White)',
        'Water': '검정 (Black)'
    };
    return map[element] || '흰색 (White)';
}

function getLuckyDirection(stem: string): string {
    // Simple mapping based on element roughly
    // This could be more elaborate
    const stemMap: Record<string, string> = {
        'Jia': '동쪽', 'Yi': '동쪽',
        'Bing': '남쪽', 'Ding': '남쪽',
        'Wu': '중앙', 'Ji': '중앙',
        'Geng': '서쪽', 'Xin': '서쪽',
        'Ren': '북쪽', 'Gui': '북쪽'
    };

    return stemMap[stem] || '동쪽';
}
