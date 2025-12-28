/**
 * 사주(四柱) 계산 엔진
 * 만세력 알고리즘 기반 60갑자 산출
 */

// 천간 (天干) - 10개
export const HEAVENLY_STEMS = [
  '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'
] as const;

// 지지 (地支) - 12개
export const EARTHLY_BRANCHES = [
  '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'
] as const;

// 오행 (五行)
export const FIVE_ELEMENTS = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
} as const;

// 천간별 오행
const STEM_ELEMENTS: Record<string, keyof typeof FIVE_ELEMENTS> = {
  '갑': 'wood', '을': 'wood',
  '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth',
  '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water',
};

// 지지별 오행
const BRANCH_ELEMENTS: Record<string, keyof typeof FIVE_ELEMENTS> = {
  '인': 'wood', '묘': 'wood',
  '사': 'fire', '오': 'fire',
  '진': 'earth', '술': 'earth', '축': 'earth', '미': 'earth',
  '신': 'metal', '유': 'metal',
  '해': 'water', '자': 'water',
};

// 십신 (十神) 정의
export const TEN_GODS = {
  bijian: '비견',     // 比肩 - 같은 오행, 같은 음양
  gepcae: '겁재',     // 劫財 - 같은 오행, 다른 음양
  sikshin: '식신',    // 食神 - 내가 생하는 오행, 같은 음양
  sanggwan: '상관',   // 傷官 - 내가 생하는 오행, 다른 음양
  pyeonjae: '편재',   // 偏財 - 내가 극하는 오행, 같은 음양
  jeongjae: '정재',   // 正財 - 내가 극하는 오행, 다른 음양
  pyeongwan: '편관',  // 偏官 (七殺) - 나를 극하는 오행, 같은 음양
  jeonggwan: '정관',  // 正官 - 나를 극하는 오행, 다른 음양
  pyeonin: '편인',    // 偏印 - 나를 생하는 오행, 같은 음양
  jeongin: '정인',    // 正印 - 나를 생하는 오행, 다른 음양
} as const;

// 사주 결과 타입
export interface SajuResult {
  yearPillar: { stem: string; branch: string; };
  monthPillar: { stem: string; branch: string; };
  dayPillar: { stem: string; branch: string; };
  hourPillar: { stem: string; branch: string; };
  dayMaster: string;  // 일간 (日干) - 자신을 나타냄
  elements: {
    stem: keyof typeof FIVE_ELEMENTS;
    branch: keyof typeof FIVE_ELEMENTS;
  }[];
  tenGods: Record<string, string>;
}

/**
 * 년주(年柱) 계산
 * 기준: 갑자년 = 서기 4년
 */
function calculateYearPillar(year: number): { stem: string; branch: string } {
  // 4년을 기준으로 갑자년
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;

  return {
    stem: HEAVENLY_STEMS[(stemIndex + 10) % 10],
    branch: EARTHLY_BRANCHES[(branchIndex + 12) % 12],
  };
}

/**
 * 월주(月柱) 계산
 * 절기 기준으로 월을 결정하고, 년간에 따라 월간을 산출
 */
function calculateMonthPillar(
  year: number,
  month: number,
  day: number,
  yearStem: string
): { stem: string; branch: string } {
  // 절기 기준 월 (간략화된 버전 - 실제로는 절기 정확히 계산 필요)
  // 1월: 축, 2월: 인, 3월: 묘 ...
  const monthBranchMap = [
    '축', '인', '묘', '진', '사', '오',
    '미', '신', '유', '술', '해', '자'
  ];

  // 절기 기준으로 월 조정 (간략화)
  const adjustedMonth = month - 1;

  // 년간에 따른 월간 산출 (년상기월법)
  // 갑/기년: 병인월부터, 을/경년: 무인월부터, 병/신년: 경인월부터
  // 정/임년: 임인월부터, 무/계년: 갑인월부터
  const yearStemIndex = (HEAVENLY_STEMS as readonly string[]).indexOf(yearStem);
  const monthStemStartMap: Record<number, number> = {
    0: 2, 5: 2,  // 갑/기 -> 병(2)
    1: 4, 6: 4,  // 을/경 -> 무(4)
    2: 6, 7: 6,  // 병/신 -> 경(6)
    3: 8, 8: 8,  // 정/임 -> 임(8)
    4: 0, 9: 0,  // 무/계 -> 갑(0)
  };

  const startStem = monthStemStartMap[yearStemIndex] || 0;
  const monthStemIndex = (startStem + adjustedMonth) % 10;

  return {
    stem: HEAVENLY_STEMS[monthStemIndex],
    branch: monthBranchMap[adjustedMonth],
  };
}

/**
 * 일주(日柱) 계산
 * 1900년 1월 1일 = 갑자일 기준
 */
function calculateDayPillar(year: number, month: number, day: number): { stem: string; branch: string } {
  // 율리우스일 계산 (간략화)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  const julianDay = day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) +
    Math.floor(y / 400) - 32045;

  // 1900년 1월 1일 (율리우스일 2415021) = 갑자일
  const baseJulianDay = 2415021;
  const dayDiff = julianDay - baseJulianDay;

  const stemIndex = ((dayDiff % 10) + 10) % 10;
  const branchIndex = ((dayDiff % 12) + 12) % 12;

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
  };
}

/**
 * 시주(時柱) 계산
 * 일간에 따라 시간의 천간이 결정됨
 */
function calculateHourPillar(
  hour: number,
  dayStem: string
): { stem: string; branch: string } {
  // 시지 결정 (2시간 단위)
  // 23-01시: 자, 01-03시: 축, ...
  const hourBranchIndex = Math.floor(((hour + 1) % 24) / 2);

  // 일간에 따른 시간 천간 결정 (일상기시법)
  const dayStemIndex = (HEAVENLY_STEMS as readonly string[]).indexOf(dayStem);
  const hourStemStartMap: Record<number, number> = {
    0: 0, 5: 0,  // 갑/기일 -> 갑자시부터
    1: 2, 6: 2,  // 을/경일 -> 병자시부터
    2: 4, 7: 4,  // 병/신일 -> 무자시부터
    3: 6, 8: 6,  // 정/임일 -> 경자시부터
    4: 8, 9: 8,  // 무/계일 -> 임자시부터
  };

  const startStem = hourStemStartMap[dayStemIndex] || 0;
  const hourStemIndex = (startStem + hourBranchIndex) % 10;

  return {
    stem: HEAVENLY_STEMS[hourStemIndex],
    branch: EARTHLY_BRANCHES[hourBranchIndex],
  };
}

/**
 * 십신 계산
 * 일간(日干)을 기준으로 다른 천간과의 관계를 분석
 */
function calculateTenGods(dayMaster: string, stems: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  const dayElement = STEM_ELEMENTS[dayMaster];
  const dayYinYang = (HEAVENLY_STEMS as readonly string[]).indexOf(dayMaster) % 2; // 0: 양, 1: 음

  const elementCycle = ['wood', 'fire', 'earth', 'metal', 'water'] as const;

  stems.forEach((stem, index) => {
    const stemElement = STEM_ELEMENTS[stem];
    const stemYinYang = (HEAVENLY_STEMS as readonly string[]).indexOf(stem) % 2;
    const sameYinYang = dayYinYang === stemYinYang;

    const dayIdx = elementCycle.indexOf(dayElement);
    const stemIdx = elementCycle.indexOf(stemElement);
    const diff = ((stemIdx - dayIdx) + 5) % 5;

    let godName: string;

    if (diff === 0) {
      // 같은 오행
      godName = sameYinYang ? TEN_GODS.bijian : TEN_GODS.gepcae;
    } else if (diff === 1) {
      // 내가 생하는 오행
      godName = sameYinYang ? TEN_GODS.sikshin : TEN_GODS.sanggwan;
    } else if (diff === 2) {
      // 내가 극하는 오행
      godName = sameYinYang ? TEN_GODS.pyeonjae : TEN_GODS.jeongjae;
    } else if (diff === 3) {
      // 나를 극하는 오행
      godName = sameYinYang ? TEN_GODS.pyeongwan : TEN_GODS.jeonggwan;
    } else {
      // 나를 생하는 오행
      godName = sameYinYang ? TEN_GODS.pyeonin : TEN_GODS.jeongin;
    }

    const pillarNames = ['year', 'month', 'day', 'hour'];
    result[pillarNames[index]] = godName;
  });

  return result;
}

/**
 * 메인 사주 계산 함수
 */
export function calculateSaju(
  birthDate: Date,
  birthHour: number = 12
): SajuResult {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  // 4주 계산
  const yearPillar = calculateYearPillar(year);
  const monthPillar = calculateMonthPillar(year, month, day, yearPillar.stem);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(birthHour, dayPillar.stem);

  // 일간 (Day Master)
  const dayMaster = dayPillar.stem;

  // 각 주의 오행
  const elements = [
    yearPillar, monthPillar, dayPillar, hourPillar
  ].map(pillar => ({
    stem: STEM_ELEMENTS[pillar.stem],
    branch: BRANCH_ELEMENTS[pillar.branch],
  }));

  // 십신 계산
  const stems = [yearPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem];
  const tenGods = calculateTenGods(dayMaster, stems);

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    elements,
    tenGods,
  };
}

/**
 * 사주를 읽기 쉬운 문자열로 변환
 */
export function formatSaju(saju: SajuResult): string {
  const { yearPillar, monthPillar, dayPillar, hourPillar } = saju;
  return `${yearPillar.stem}${yearPillar.branch}년 ${monthPillar.stem}${monthPillar.branch}월 ${dayPillar.stem}${dayPillar.branch}일 ${hourPillar.stem}${hourPillar.branch}시`;
}
