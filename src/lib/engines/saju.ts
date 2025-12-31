/**
 * 사주(四柱) 계산 엔진
 * korean-lunar-calendar 라이브러리 기반 정확한 만세력 산출 (KARI 표준)
 */

import KoreanLunarCalendar from 'korean-lunar-calendar';

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
  // 추가: 원본 간지 문자열 (검증용)
  rawGapja?: {
    year: string;
    month: string;
    day: string;
  };
}

/**
 * 간지 문자열에서 천간/지지 분리
 * 예: "정유년" -> { stem: "정", branch: "유" }
 */
function parseGapja(gapjaStr: string): { stem: string; branch: string } {
  // "정유년", "병오월", "임오일" 형태에서 앞 2글자만 추출
  const stem = gapjaStr.charAt(0);
  const branch = gapjaStr.charAt(1);
  return { stem, branch };
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
 * korean-lunar-calendar 라이브러리를 사용하여 KARI 표준 기반 정확한 간지 계산
 */
export function calculateSaju(
  birthDate: Date,
  birthHour: number = 12,
  isLunar: boolean = false
): SajuResult {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  // korean-lunar-calendar 인스턴스 생성
  const calendar = new KoreanLunarCalendar();

  let isValid = false;

  if (isLunar) {
    // 음력 -> 양력 변환 (윤달 여부는 false로 가정 - UI에서 입력받지 않음)
    isValid = calendar.setLunarDate(year, month, day, false);
  } else {
    // 양력 날짜 설정
    isValid = calendar.setSolarDate(year, month, day);
  }

  if (!isValid) {
    // 범위를 벗어난 경우 폴백 처리
    console.warn(`Date ${year}-${month}-${day} is out of calendar range, using fallback`);
    return calculateSajuFallback(birthDate, birthHour);
  }

  // 한국식 간지(GapJa) 가져오기
  const koreanGapja = calendar.getKoreanGapja();

  // 간지 문자열 파싱
  const yearPillar = parseGapja(koreanGapja.year);
  const monthPillar = parseGapja(koreanGapja.month);
  const dayPillar = parseGapja(koreanGapja.day);

  // 시주는 일간 기반으로 계산 (라이브러리에서 제공하지 않음)
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
    rawGapja: {
      year: koreanGapja.year,
      month: koreanGapja.month,
      day: koreanGapja.day,
    }
  };
}

/**
 * 폴백 계산 (라이브러리 범위 밖의 날짜용)
 * 기존 알고리즘 사용
 */
function calculateSajuFallback(
  birthDate: Date,
  birthHour: number
): SajuResult {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  // 년주 (기존 알고리즘)
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  const yearPillar = {
    stem: HEAVENLY_STEMS[(stemIndex + 10) % 10],
    branch: EARTHLY_BRANCHES[(branchIndex + 12) % 12],
  };

  // 월주 (간략화)
  const monthBranchMap = [
    '축', '인', '묘', '진', '사', '오',
    '미', '신', '유', '술', '해', '자'
  ];
  const adjustedMonth = month - 1;
  const yearStemIndex = (HEAVENLY_STEMS as readonly string[]).indexOf(yearPillar.stem);
  const monthStemStartMap: Record<number, number> = {
    0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0,
  };
  const startStem = monthStemStartMap[yearStemIndex] || 0;
  const monthStemIndex = (startStem + adjustedMonth) % 10;
  const monthPillar = {
    stem: HEAVENLY_STEMS[monthStemIndex],
    branch: monthBranchMap[adjustedMonth],
  };

  // 일주 (율리우스일 기반)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const julianDay = day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) +
    Math.floor(y / 400) - 32045;
  const baseJulianDay = 2415021;
  const dayDiff = julianDay - baseJulianDay;
  const dayStemIdx = ((dayDiff % 10) + 10) % 10;
  const dayBranchIdx = ((dayDiff % 12) + 12) % 12;
  const dayPillar = {
    stem: HEAVENLY_STEMS[dayStemIdx],
    branch: EARTHLY_BRANCHES[dayBranchIdx],
  };

  const hourPillar = calculateHourPillar(birthHour, dayPillar.stem);
  const dayMaster = dayPillar.stem;

  const elements = [
    yearPillar, monthPillar, dayPillar, hourPillar
  ].map(pillar => ({
    stem: STEM_ELEMENTS[pillar.stem],
    branch: BRANCH_ELEMENTS[pillar.branch],
  }));

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
