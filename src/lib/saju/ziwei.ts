import type { DaxianItem, LiuNianInfo, ZiweiChart, ZiweiPalace, ZiweiStar } from './saju-engine';

const PALACE_NAMES = [
  '명궁',
  '형제궁',
  '부처궁',
  '자녀궁',
  '재백궁',
  '질액궁',
  '천이궁',
  '노복궁',
  '관록궁',
  '전택궁',
  '복덕궁',
  '부모궁',
];

const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const MAIN_STARS = ['자미', '천기', '태양', '무곡', '천동', '염정', '천부', '태음', '탐랑', '거문', '천상', '천량'];
const BRIGHTNESS = ['묘', '왕', '득', '평'];
const SIHUA = ['화록', '화권', '화과', '화기'];
const WUXING_JU = [
  { name: '수이국', number: 2 },
  { name: '목삼국', number: 3 },
  { name: '금사국', number: 4 },
  { name: '토오국', number: 5 },
  { name: '화육국', number: 6 },
];

function hourBranchIndex(hour: number): number {
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}

function createStars(seed: number): ZiweiStar[] {
  return Array.from({ length: 2 }, (_, index) => {
    const starIndex = (seed + index * 3) % MAIN_STARS.length;
    return {
      name: MAIN_STARS[starIndex],
      brightness: BRIGHTNESS[(seed + index) % BRIGHTNESS.length],
      siHua: index === 0 ? SIHUA[seed % SIHUA.length] : undefined,
    };
  });
}

function createPalaces(seed: number, shenGongIndex: number): Record<string, ZiweiPalace> {
  return PALACE_NAMES.reduce<Record<string, ZiweiPalace>>((accumulator, palaceName, index) => {
    const branchIndex = (seed + index) % BRANCHES.length;
    accumulator[palaceName] = {
      name: palaceName,
      zhi: BRANCHES[branchIndex],
      ganZhi: `${BRANCHES[(branchIndex + 9) % BRANCHES.length]}${BRANCHES[branchIndex]}`,
      stars: createStars(seed + index),
      isShenGong: index === shenGongIndex,
    };
    return accumulator;
  }, {});
}

export function createChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  _isMale: boolean
): ZiweiChart {
  const hourIndex = hourBranchIndex(hour);
  const seed = (year + month + day + hourIndex + minute) % 12;
  const mingGongIndex = (month + hourIndex + day + 1) % 12;
  const shenGongIndex = (mingGongIndex + 4) % 12;

  return {
    mingGongZhi: BRANCHES[mingGongIndex],
    shenGongZhi: BRANCHES[shenGongIndex],
    wuXingJu: WUXING_JU[(seed + 1) % WUXING_JU.length],
    palaces: createPalaces(seed, shenGongIndex),
  };
}

export function calculateLiunian(chart: ZiweiChart, targetYear: number): LiuNianInfo {
  const palaceNames = Object.keys(chart.palaces);
  const daxianIndex = targetYear % palaceNames.length;
  const daxianPalaceName = palaceNames[daxianIndex];

  return {
    year: targetYear,
    stem: '甲乙丙丁戊己庚辛壬癸'[targetYear % 10] || '甲',
    branch: BRANCHES[targetYear % 12],
    mingGongZhi: chart.mingGongZhi,
    natalPalaceAtMing: chart.palaces['명궁']?.name ?? '명궁',
    siHua: {
      화록: chart.palaces[daxianPalaceName]?.stars[0]?.name ?? '자미',
      화권: chart.palaces[daxianPalaceName]?.stars[1]?.name ?? '천기',
      화과: chart.palaces['관록궁']?.stars[0]?.name ?? '태양',
      화기: chart.palaces['질액궁']?.stars[0]?.name ?? '거문',
    },
    daxianPalaceName,
    daxianAgeStart: daxianIndex * 10,
    daxianAgeEnd: daxianIndex * 10 + 9,
  };
}

export function getDaxianList(chart: ZiweiChart): DaxianItem[] {
  return PALACE_NAMES.map((palaceName, index) => ({
    ageStart: index * 10,
    ageEnd: index * 10 + 9,
    palaceName,
    ganZhi: `${chart.palaces[palaceName]?.ganZhi ?? '甲子'}`,
    mainStars: chart.palaces[palaceName]?.stars.map((star) => star.name) ?? [],
  }));
}
