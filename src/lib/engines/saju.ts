/**
 * 사주(四柱) 계산 엔진
 * korean-lunar-calendar 라이브러리 기반 정확한 만세력 산출 (KARI 표준)
 * 
 * 📚 데이터 기준: 사주명리학 시스템 지침 v1.0.3
 */

import KoreanLunarCalendar from 'korean-lunar-calendar';

// =====================================
// 천간 (天干) - 10개 완전 정규화 테이블
// =====================================
export interface StemData {
  index: number;
  hanja: string;
  hangul: string;
  english: string;
  element: keyof typeof FIVE_ELEMENTS;
  yinYang: '양' | '음';
}

export const HEAVENLY_STEMS_DATA: StemData[] = [
  { index: 0, hanja: '甲', hangul: '갑', english: 'Jia', element: 'wood', yinYang: '양' },
  { index: 1, hanja: '乙', hangul: '을', english: 'Yi', element: 'wood', yinYang: '음' },
  { index: 2, hanja: '丙', hangul: '병', english: 'Bing', element: 'fire', yinYang: '양' },
  { index: 3, hanja: '丁', hangul: '정', english: 'Ding', element: 'fire', yinYang: '음' },
  { index: 4, hanja: '戊', hangul: '무', english: 'Wu', element: 'earth', yinYang: '양' },
  { index: 5, hanja: '己', hangul: '기', english: 'Ji', element: 'earth', yinYang: '음' },
  { index: 6, hanja: '庚', hangul: '경', english: 'Geng', element: 'metal', yinYang: '양' },
  { index: 7, hanja: '辛', hangul: '신', english: 'Xin', element: 'metal', yinYang: '음' },
  { index: 8, hanja: '壬', hangul: '임', english: 'Ren', element: 'water', yinYang: '양' },
  { index: 9, hanja: '癸', hangul: '계', english: 'Gui', element: 'water', yinYang: '음' },
];

// 기존 호환성 유지
export const HEAVENLY_STEMS = HEAVENLY_STEMS_DATA.map(s => s.hangul) as unknown as readonly ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];

// =====================================
// 지지 (地支) - 12개 완전 정규화 테이블
// =====================================
export interface BranchData {
  index: number;
  hanja: string;
  hangul: string;
  english: string;
  element: keyof typeof FIVE_ELEMENTS;
  animal: string;
  animalEn: string;
}

export const EARTHLY_BRANCHES_DATA: BranchData[] = [
  { index: 0, hanja: '子', hangul: '자', english: 'Zi', element: 'water', animal: '쥐', animalEn: 'Rat' },
  { index: 1, hanja: '丑', hangul: '축', english: 'Chou', element: 'earth', animal: '소', animalEn: 'Ox' },
  { index: 2, hanja: '寅', hangul: '인', english: 'Yin', element: 'wood', animal: '호랑이', animalEn: 'Tiger' },
  { index: 3, hanja: '卯', hangul: '묘', english: 'Mao', element: 'wood', animal: '토끼', animalEn: 'Rabbit' },
  { index: 4, hanja: '辰', hangul: '진', english: 'Chen', element: 'earth', animal: '용', animalEn: 'Dragon' },
  { index: 5, hanja: '巳', hangul: '사', english: 'Si', element: 'fire', animal: '뱀', animalEn: 'Snake' },
  { index: 6, hanja: '午', hangul: '오', english: 'Wu', element: 'fire', animal: '말', animalEn: 'Horse' },
  { index: 7, hanja: '未', hangul: '미', english: 'Wei', element: 'earth', animal: '양', animalEn: 'Goat' },
  { index: 8, hanja: '申', hangul: '신', english: 'Shen', element: 'metal', animal: '원숭이', animalEn: 'Monkey' },
  { index: 9, hanja: '酉', hangul: '유', english: 'You', element: 'metal', animal: '닭', animalEn: 'Rooster' },
  { index: 10, hanja: '戌', hangul: '술', english: 'Xu', element: 'earth', animal: '개', animalEn: 'Dog' },
  { index: 11, hanja: '亥', hangul: '해', english: 'Hai', element: 'water', animal: '돼지', animalEn: 'Pig' },
];

// 기존 호환성 유지
export const EARTHLY_BRANCHES = EARTHLY_BRANCHES_DATA.map(b => b.hangul) as unknown as readonly ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// =====================================
// 오행 (五行) 확장
// =====================================
export const FIVE_ELEMENTS = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
} as const;

export const FIVE_ELEMENTS_HANJA: Record<keyof typeof FIVE_ELEMENTS, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

// 상생/상극 관계
export const ELEMENT_RELATIONS = {
  generates: { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' },
  overcomes: { wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire' },
} as const;

// 천간별 오행 (기존 호환성)
const STEM_ELEMENTS: Record<string, keyof typeof FIVE_ELEMENTS> = {
  '갑': 'wood', '을': 'wood',
  '병': 'fire', '정': 'fire',
  '무': 'earth', '기': 'earth',
  '경': 'metal', '신': 'metal',
  '임': 'water', '계': 'water',
};

// 지지별 오행 (기존 호환성)
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
  yeonPillar: { stem: string; branch: string; };
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
 * 율리우스 날짜 및 태양 황경 계산 (Saju용)
 */
function getSunLongitude(birthDate: Date): number {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate() + (birthDate.getHours() + birthDate.getMinutes() / 60) / 24;

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
      godName = sameYinYang ? TEN_GODS.bijian : TEN_GODS.gepcae;
    } else if (diff === 1) {
      godName = sameYinYang ? TEN_GODS.sikshin : TEN_GODS.sanggwan;
    } else if (diff === 2) {
      godName = sameYinYang ? TEN_GODS.pyeonjae : TEN_GODS.jeongjae;
    } else if (diff === 3) {
      godName = sameYinYang ? TEN_GODS.pyeongwan : TEN_GODS.jeonggwan;
    } else {
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
  birthMinute: number = 0,
  isLunar: boolean = false
): SajuResult {
  // 1. 한국 표준시(KST) 30분 보정 (동경 135도 -> 127.5도)
  // 실제 태양시 기준으로 만세력을 산출하기 위함
  const adjDate = new Date(birthDate);
  adjDate.setHours(birthHour, birthMinute);
  adjDate.setMinutes(adjDate.getMinutes() - 30);

  const year = adjDate.getFullYear();
  const month = adjDate.getMonth() + 1;
  const day = adjDate.getDate();
  const hour = adjDate.getHours();

  // 2. 조자시(朝子時) 처리: 밤 23시(보정 전 23:30)부터는 다음 날의 일진을 사용
  const isAfterZi = hour >= 23;
  const calendarDate = new Date(adjDate);
  if (isAfterZi) {
    calendarDate.setDate(calendarDate.getDate() + 1);
  }

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth() + 1;
  const calDay = calendarDate.getDate();

  // korean-lunar-calendar 인스턴스 생성
  const calendar = new KoreanLunarCalendar();

  let isValid = false;

  if (isLunar) {
    // 음력 -> 양력 변환
    isValid = calendar.setLunarDate(calYear, calMonth, calDay, false);
  } else {
    // 양력 날짜 설정
    isValid = calendar.setSolarDate(calYear, calMonth, calDay);
  }

  if (!isValid) {
    // 범위를 벗어난 경우 폴백 처리
    console.warn(`Date ${year}-${month}-${day} is out of calendar range, using fallback`);
    return calculateSajuFallback(birthDate, birthHour);
  }

  // 한국식 간지(GapJa) 가져오기 - 일주 계산용으로 주로 사용
  const koreanGapja = calendar.getKoreanGapja();

  // 태양 황경 기반 연주/월주 계산 (절기력 반영)
  const sunLong = getSunLongitude(adjDate);

  // 1. 연주 계산 (입춘 기준)
  let sajuYear = year;
  // 1월이나 2월인데 태양이 아직 입춘(315도)에 도달하지 않았으면 작년으로 침
  if (month <= 2 && sunLong < 315 && sunLong > 200) {
    sajuYear = year - 1;
  }
  const yearStemIdx = (sajuYear - 4) % 10;
  const yearBranchIdx = (sajuYear - 4) % 12;
  const yeonPillar = {
    stem: HEAVENLY_STEMS[(yearStemIdx + 10) % 10],
    branch: EARTHLY_BRANCHES[(yearBranchIdx + 12) % 12],
  };

  // 2. 월주 계산 (절기 기준)
  // 315도(입춘)부터가 인(寅)월
  const monthBranchMap = ['인', '묘', '진', '사', '오', '미', '신', '유', '술', '해', '자', '축'];
  const shiftedLong = (sunLong - 315 + 360) % 360;
  const monthIdx = Math.floor(shiftedLong / 30);
  const monthBranch = monthBranchMap[monthIdx];

  // 월간 계산 (연주 천간 기반)
  const yStemIdx = (HEAVENLY_STEMS as readonly string[]).indexOf(yeonPillar.stem);
  const monthStemIdx = (yStemIdx * 2 + 2 + monthIdx) % 10;
  const monthPillar = {
    stem: HEAVENLY_STEMS[monthStemIdx],
    branch: monthBranch,
  };

  // 3. 일주 계산 (라이브러리 결과 사용 + 조자시 반영됨)
  const dayPillar = parseGapja(koreanGapja.day);

  // 시주는 보정된 시간(adjDate) 기반으로 계산
  const hourPillar = calculateHourPillar(hour, dayPillar.stem);

  // 일간 (Day Master)
  const dayMaster = dayPillar.stem;

  // 각 주의 오행
  const elements = [
    yeonPillar, monthPillar, dayPillar, hourPillar
  ].map(pillar => ({
    stem: STEM_ELEMENTS[pillar.stem],
    branch: BRANCH_ELEMENTS[pillar.branch],
  }));

  // 십신 계산
  const stems = [yeonPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem];
  const tenGods = calculateTenGods(dayMaster, stems);

  return {
    yeonPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    elements,
    tenGods,
    rawGapja: {
      year: `${yeonPillar.stem}${yeonPillar.branch}년`,
      month: `${monthPillar.stem}${monthPillar.branch}월`,
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
  birthHour: number = 12,
  birthMinute: number = 0
): SajuResult {
  // 1. 한국 표준시(KST) 30분 보정
  const adjDate = new Date(birthDate);
  adjDate.setHours(birthHour, birthMinute);
  adjDate.setMinutes(adjDate.getMinutes() - 30);

  const year = adjDate.getFullYear();
  const month = adjDate.getMonth() + 1;
  const day = adjDate.getDate();
  const hour = adjDate.getHours();

  // 2. 조자시 처리
  const isAfterZi = hour >= 23;
  const targetDate = new Date(adjDate);
  if (isAfterZi) targetDate.setDate(targetDate.getDate() + 1);

  const sajuYear = targetDate.getFullYear();
  const sajuMonth = targetDate.getMonth() + 1;
  const sajuDay = targetDate.getDate();

  // 년주
  const yearStemIdx = (sajuYear - 4) % 10;
  const yearBranchIdx = (sajuYear - 4) % 12;
  const yeonPillar = {
    stem: HEAVENLY_STEMS[(yearStemIdx + 10) % 10],
    branch: EARTHLY_BRANCHES[(yearBranchIdx + 12) % 12],
  };

  // 월주 (간략화)
  const monthBranchMap = [
    '축', '인', '묘', '진', '사', '오',
    '미', '신', '유', '술', '해', '자'
  ];
  const adjustedMonth = month - 1;
  const yeonStemIndex = (HEAVENLY_STEMS as readonly string[]).indexOf(yeonPillar.stem);
  const monthStemStartMap: Record<number, number> = {
    0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0,
  };
  const startStem = monthStemStartMap[yeonStemIndex] || 0;
  const monthStemIndex = (startStem + adjustedMonth) % 10;
  const monthPillar = {
    stem: HEAVENLY_STEMS[monthStemIndex],
    branch: monthBranchMap[adjustedMonth],
  };

  // 3. 일주 (율리우스일 기반 - 보정된 날짜 사용)
  const a = Math.floor((14 - sajuMonth) / 12);
  const y = sajuYear + 4800 - a;
  const m = sajuMonth + 12 * a - 3;
  const julianDay = sajuDay + Math.floor((153 * m + 2) / 5) + 365 * y +
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

  const hourPillar = calculateHourPillar(hour, dayPillar.stem);
  const dayMaster = dayPillar.stem;

  const elements = [
    yeonPillar, monthPillar, dayPillar, hourPillar
  ].map(pillar => ({
    stem: STEM_ELEMENTS[pillar.stem],
    branch: BRANCH_ELEMENTS[pillar.branch],
  }));

  const stems = [yeonPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem];
  const tenGods = calculateTenGods(dayMaster, stems);

  return {
    yeonPillar,
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
export function formatSaju(saju: SajuResult | string | null | undefined): string {
  if (!saju) return '사주 정보 없음';
  if (typeof saju === 'string') return saju;

  const { yeonPillar, monthPillar, dayPillar, hourPillar } = saju;

  if (!yeonPillar || !monthPillar || !dayPillar || !hourPillar) {
    return '사주 데이터 불완전';
  }

  return `${yeonPillar.stem}${yeonPillar.branch}년 ${monthPillar.stem}${monthPillar.branch}월 ${dayPillar.stem}${dayPillar.branch}일 ${hourPillar.stem}${hourPillar.branch}시`;
}

// =====================================
// 용신 (用神) 추천 로직 - 기본판
// =====================================

/**
 * 일간(일주의 천간)을 기준으로 기본 용신을 추천
 * 실제 명리학에서는 월령, 전체 오행 분포 등을 종합하지만
 * 이 버전은 간략화된 "조후용신" 개념에 기반합니다.
 */
export function getYongsinRecommendation(dayMaster: string, birthMonth: number): {
  yongsin: keyof typeof FIVE_ELEMENTS;
  reason: string;
  reasonEn: string;
} {
  const dayElement = STEM_ELEMENTS[dayMaster];

  // 조후용신: 계절에 따른 필요 오행
  // 겨울(11,12,1월): 火 필요 (추위 조절)
  // 여름(5,6,7월): 水 필요 (더위 조절)
  // 봄/가을: 일간에 따라 다름

  const isWinter = birthMonth >= 11 || birthMonth <= 1;
  const isSummer = birthMonth >= 5 && birthMonth <= 7;

  if (isWinter) {
    return {
      yongsin: 'fire',
      reason: `겨울에 태어나 조후(調候)상 火(화)가 필요합니다. 따뜻함이 삶에 활력을 줍니다.`,
      reasonEn: `Born in winter, Fire is needed for warmth and vitality.`,
    };
  }

  if (isSummer) {
    return {
      yongsin: 'water',
      reason: `여름에 태어나 조후(調候)상 水(수)가 필요합니다. 시원함이 마음을 안정시킵니다.`,
      reasonEn: `Born in summer, Water is needed for cooling and calmness.`,
    };
  }

  // 기본: 일간을 생해주는 오행이 용신
  const generatingElement = Object.entries(ELEMENT_RELATIONS.generates)
    .find(([_, generated]) => generated === dayElement)?.[0] as keyof typeof FIVE_ELEMENTS | undefined;

  return {
    yongsin: generatingElement || 'wood',
    reason: `일간 ${dayMaster}(${FIVE_ELEMENTS[dayElement]})을 생해주는 ${generatingElement ? FIVE_ELEMENTS[generatingElement] : '목'}이 용신입니다.`,
    reasonEn: `The element that generates your Day Master is your Yongsin.`,
  };
}

/**
 * 오행 분포 분석
 */
export function analyzeElementDistribution(saju: SajuResult): Record<keyof typeof FIVE_ELEMENTS, number> {
  const distribution: Record<keyof typeof FIVE_ELEMENTS, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };

  // 천간 4개
  [saju.yeonPillar.stem, saju.monthPillar.stem, saju.dayPillar.stem, saju.hourPillar.stem]
    .forEach(stem => {
      const element = STEM_ELEMENTS[stem];
      if (element) distribution[element]++;
    });

  // 지지 4개
  [saju.yeonPillar.branch, saju.monthPillar.branch, saju.dayPillar.branch, saju.hourPillar.branch]
    .forEach(branch => {
      const element = BRANCH_ELEMENTS[branch];
      if (element) distribution[element]++;
    });

  return distribution;
}

/**
 * 오행 과다/부족 진단
 */
export function diagnoseElementBalance(saju: SajuResult): {
  excessive: (keyof typeof FIVE_ELEMENTS)[];
  lacking: (keyof typeof FIVE_ELEMENTS)[];
  balanced: boolean;
} {
  const distribution = analyzeElementDistribution(saju);
  const values = Object.values(distribution);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const excessive = (Object.entries(distribution) as [keyof typeof FIVE_ELEMENTS, number][])
    .filter(([_, count]) => count >= 3)
    .map(([element]) => element);

  const lacking = (Object.entries(distribution) as [keyof typeof FIVE_ELEMENTS, number][])
    .filter(([_, count]) => count === 0)
    .map(([element]) => element);

  return {
    excessive,
    lacking,
    balanced: excessive.length === 0 && lacking.length === 0,
  };
}
