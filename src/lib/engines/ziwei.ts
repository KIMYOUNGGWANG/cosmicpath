/**
 * 정통 자미두수(紫微斗數) 계산 엔진 (Phase 2 Upgrade)
 * 12궁 배치, 오행국, 14주성(7단계 廟旺得利平不得陷 밝기),
 * 6대 길성(보성), 6대 흉성(살성), 사화(四化), 대한(大限), 유년(流年) 산출
 * 순수 TypeScript 독자 구현 (AGPL 라이선스 코드 미사용)
 */

import KoreanLunarCalendar from 'korean-lunar-calendar';

// =====================================
// 기본 상수 및 타입 정의
// =====================================

export const ZIWEI_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const ZIWEI_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

export const ZIWEI_PALACE_NAMES = [
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
] as const;

export type ZiweiPalaceName = (typeof ZIWEI_PALACE_NAMES)[number];
export type ZiweiBrightness = '묘' | '왕' | '득' | '이' | '평' | '불득' | '함';

export interface ZiweiStar {
  name: string;
  nameEn?: string;
  category: 'main' | 'auxiliary' | 'malefic';
  brightness?: ZiweiBrightness;
  siHua?: '화록' | '화권' | '화과' | '화기';
}

export interface ZiweiPalace {
  name: ZiweiPalaceName;
  branch: string; // 지지 (子~亥)
  stem: string; // 천간 (甲~癸)
  ganZhi: string; // 궁간지 (예: 丙寅)
  stars: ZiweiStar[];
  isShenGong: boolean; // 신궁(身宮) 여부
  daxianStartAge: number; // 대한 시작 나이
  daxianEndAge: number; // 대한 종료 나이
}

export interface ZiweiWuxingJu {
  name: '수이국' | '목삼국' | '금사국' | '토오국' | '화육국';
  number: 2 | 3 | 4 | 5 | 6;
}

export interface ZiweiYearlyFortune {
  year: number;
  yearGanZhi: string;
  yearlyMingPalace: ZiweiPalaceName;
  yearlySiHua: Record<'화록' | '화권' | '화과' | '화기', { star: string; palace: ZiweiPalaceName }>;
}

export interface ZiweiChartResult {
  solarDate: string; // YYYY-MM-DD
  lunarDate: string; // YYYY-MM-DD
  isLeapMonth: boolean;
  gender: 'male' | 'female';
  yearGanZhi: string;
  mingGongBranch: string;
  shenGongBranch: string;
  wuxingJu: ZiweiWuxingJu;
  palaces: Record<string, ZiweiPalace>;
  palaceList: ZiweiPalace[];
  siHuaSummary: Record<'화록' | '화권' | '화과' | '화기', { star: string; palace: string }>;
  yearlyFortune?: ZiweiYearlyFortune;
}

// =====================================
// 14주성 12지 7단계 밝기 (廟旺得利平不得陷) 매트릭스
// 지지 순서: 子(0), 丑(1), 寅(2), 卯(3), 辰(4), 巳(5), 午(6), 未(7), 申(8), 酉(9), 戌(10), 亥(11)
// =====================================

const MAIN_STAR_BRIGHTNESS_MAP: Record<string, ZiweiBrightness[]> = {
  자미: ['평', '묘', '묘', '왕', '왕', '왕', '묘', '묘', '득', '왕', '왕', '평'],
  천기: ['묘', '함', '왕', '왕', '이', '평', '묘', '함', '왕', '왕', '이', '평'],
  태양: ['함', '불득', '왕', '묘', '묘', '묘', '묘', '득', '평', '불득', '함', '함'],
  무곡: ['왕', '묘', '득', '이', '묘', '평', '왕', '묘', '득', '이', '묘', '평'],
  천동: ['왕', '함', '이', '묘', '평', '묘', '함', '함', '왕', '평', '묘', '묘'],
  염정: ['평', '이', '묘', '평', '이', '함', '평', '이', '묘', '평', '이', '함'],
  천부: ['묘', '묘', '묘', '왕', '묘', '왕', '왕', '묘', '득', '왕', '묘', '득'],
  태음: ['묘', '묘', '불득', '함', '함', '함', '함', '불득', '이', '왕', '왕', '묘'],
  탐랑: ['왕', '묘', '평', '이', '묘', '함', '왕', '묘', '평', '이', '묘', '함'],
  거문: ['묘', '왕', '묘', '묘', '함', '왕', '왕', '왕', '묘', '묘', '함', '묘'],
  천상: ['묘', '묘', '묘', '함', '왕', '득', '묘', '득', '묘', '함', '왕', '득'],
  천량: ['묘', '묘', '묘', '묘', '왕', '함', '묘', '묘', '함', '득', '왕', '함'],
  칠살: ['왕', '묘', '묘', '왕', '묘', '평', '왕', '묘', '묘', '왕', '묘', '평'],
  파군: ['묘', '왕', '함', '왕', '묘', '평', '묘', '왕', '함', '왕', '묘', '평'],
};

/**
 * 행성 밝기 조회 함수
 */
function getStarBrightness(starName: string, branchIdx: number): ZiweiBrightness | undefined {
  const map = MAIN_STAR_BRIGHTNESS_MAP[starName];
  if (!map) return undefined;
  return map[branchIdx % 12];
}

// =====================================
// 오행국 결정 테이블 (납음오행 기반)
// =====================================
function determineWuxingJu(mingStem: string, mingBranch: string): ZiweiWuxingJu {
  const stemIdx = (ZIWEI_STEMS as readonly string[]).indexOf(mingStem);
  const branchIdx = (ZIWEI_BRANCHES as readonly string[]).indexOf(mingBranch);

  const g = Math.floor(stemIdx / 2) + 1;
  const z = (Math.floor(branchIdx / 2) % 3) + 1;

  let val = (g + z) % 5;
  if (val === 0) val = 5;

  const juMap: Record<number, ZiweiWuxingJu> = {
    1: { name: '목삼국', number: 3 },
    2: { name: '금사국', number: 4 },
    3: { name: '수이국', number: 2 },
    4: { name: '화육국', number: 6 },
    5: { name: '토오국', number: 5 },
  };

  return juMap[val] || { name: '수이국', number: 2 };
}

// =====================================
// 사화(四化) 테이블 (천간 기준)
// =====================================
export const SIHUA_TABLE: Record<string, Record<'화록' | '화권' | '화과' | '화기', string>> = {
  甲: { 화록: '염정', 화권: '파군', 화과: '무곡', 화기: '태양' },
  乙: { 화록: '천기', 화권: '천량', 화과: '자미', 화기: '태음' },
  丙: { 화록: '천동', 화권: '천기', 화과: '문창', 화기: '염정' },
  丁: { 화록: '태음', 화권: '천동', 화과: '천기', 화기: '거문' },
  戊: { 화록: '탐랑', 화권: '태음', 화과: '우필', 화기: '천기' },
  己: { 화록: '무곡', 화권: '탐랑', 화과: '천량', 화기: '문곡' },
  庚: { 화록: '태양', 화권: '무곡', 화과: '태음', 화기: '천동' },
  辛: { 화록: '거문', 화권: '태양', 화과: '문곡', 화기: '문창' },
  壬: { 화록: '천량', 화권: '자미', 화과: '좌보', 화기: '무곡' },
  癸: { 화록: '파군', 화권: '거문', 화과: '태음', 화기: '탐랑' },
};

/**
 * 자미성(紫微星) 지지 위치 계산
 */
function locateZiweiStar(lunarDay: number, juNumber: number): number {
  const rem = lunarDay % juNumber;
  let quotient = Math.floor(lunarDay / juNumber);

  if (rem !== 0) {
    const add = juNumber - rem;
    quotient = Math.floor((lunarDay + add) / juNumber);
    if (add % 2 === 1) {
      quotient -= add;
    } else {
      quotient += add;
    }
  }

  let pos = (quotient + 2) % 12; // 寅宮(2) 기준
  if (pos < 0) pos += 12;
  return pos;
}

// =====================================
// 자미두수 명반 산출 메인 함수
// =====================================
export function calculateZiweiChart(
  birthDate: Date,
  birthHour: number = 12,
  gender: 'male' | 'female' = 'male',
  isLunarInput: boolean = false,
  targetYear?: number
): ZiweiChartResult {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  const calendar = new KoreanLunarCalendar();
  if (isLunarInput) {
    calendar.setLunarDate(year, month, day, false);
  } else {
    calendar.setSolarDate(year, month, day);
  }

  const lunar = calendar.getLunarCalendar();
  const lunarYear = lunar.year;
  const lunarMonth = lunar.month;
  const lunarDay = lunar.day;
  const isLeapMonth = lunar.intercalation ?? false;

  // 1. 시지(時支) 인덱스 산출 (子=0, 丑=1, ..., 亥=11)
  const hourBranchIdx = Math.floor(((birthHour + 1) % 24) / 2);

  // 2. 명궁(命宮) & 신궁(身宮) 위치 산출 (寅宮=2 기준)
  const mingGongIdx = (2 + (lunarMonth - 1) - hourBranchIdx + 120) % 12;
  const shenGongIdx = (2 + (lunarMonth - 1) + hourBranchIdx) % 12;

  // 3. 생년 천간지 산출
  const yearStemIdx = (lunarYear - 4) % 10;
  const yearStem = ZIWEI_STEMS[(yearStemIdx + 10) % 10];
  const yearBranchIdx = ((lunarYear - 4) % 12 + 12) % 12;
  const yearBranch = ZIWEI_BRANCHES[yearBranchIdx];

  // 寅宮 천간 출발점
  const yinStemStartMap: Record<number, number> = {
    0: 2, 5: 2, // 甲/己 -> 丙寅
    1: 4, 6: 4, // 乙/庚 -> 戊寅
    2: 6, 7: 6, // 丙/辛 -> 庚寅
    3: 8, 8: 8, // 丁/壬 -> 壬寅
    4: 0, 9: 0, // 戊/癸 -> 甲寅
  };
  const yinStemStart = yinStemStartMap[yearStemIdx] ?? 2;

  // 12개 지지에 대한 궁간지 생성
  const palaceGanZhi: { stem: string; branch: string; ganZhi: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const stemOffset = (i - 2 + 12) % 12;
    const stem = ZIWEI_STEMS[(yinStemStart + stemOffset) % 10];
    const branch = ZIWEI_BRANCHES[i];
    palaceGanZhi.push({ stem, branch, ganZhi: `${stem}${branch}` });
  }

  // 4. 명궁 오행국 판정
  const mingStem = palaceGanZhi[mingGongIdx].stem;
  const mingBranch = palaceGanZhi[mingGongIdx].branch;
  const wuxingJu = determineWuxingJu(mingStem, mingBranch);

  // 5. 대한(大限) 순행/역행 판정 (陽男陰女 = 순행, 陰男陽女 = 역행)
  const isYangYear = yearStemIdx % 2 === 0;
  const isForward = (gender === 'male' && isYangYear) || (gender === 'female' && !isYangYear);

  // 6. 자미성 및 14주성 위치 산출
  const ziweiIdx = locateZiweiStar(lunarDay, wuxingJu.number);
  const tianfuIdx = (4 - ziweiIdx + 12) % 12;

  const starMap: Record<number, ZiweiStar[]> = {};
  for (let i = 0; i < 12; i++) starMap[i] = [];

  // 14주성 배치 함수
  const addMainStar = (branchIdx: number, name: string) => {
    const idx = (branchIdx + 12) % 12;
    starMap[idx].push({
      name,
      category: 'main',
      brightness: getStarBrightness(name, idx),
    });
  };

  // 자미계열
  addMainStar(ziweiIdx, '자미');
  addMainStar(ziweiIdx - 1, '천기');
  addMainStar(ziweiIdx - 3, '태양');
  addMainStar(ziweiIdx - 4, '무곡');
  addMainStar(ziweiIdx - 5, '천동');
  addMainStar(ziweiIdx - 8, '염정');

  // 천부계열
  addMainStar(tianfuIdx, '천부');
  addMainStar(tianfuIdx + 1, '태음');
  addMainStar(tianfuIdx + 2, '탐랑');
  addMainStar(tianfuIdx + 3, '거문');
  addMainStar(tianfuIdx + 4, '천상');
  addMainStar(tianfuIdx + 5, '천량');
  addMainStar(tianfuIdx + 6, '칠살');
  addMainStar(tianfuIdx + 10, '파군');

  // =====================================
  // 7. 보성(吉星) & 흉성(煞星) 배치
  // =====================================

  // 좌보 & 우필 (월 기준)
  const zuoboIdx = (4 + (lunarMonth - 1)) % 12;
  const youbiIdx = (10 - (lunarMonth - 1) + 120) % 12;
  starMap[zuoboIdx].push({ name: '좌보', category: 'auxiliary' });
  starMap[youbiIdx].push({ name: '우필', category: 'auxiliary' });

  // 문창 & 문곡 (시 기준)
  const wenchangIdx = (10 - hourBranchIdx + 12) % 12;
  const wenguIdx = (4 + hourBranchIdx) % 12;
  starMap[wenchangIdx].push({ name: '문창', category: 'auxiliary' });
  starMap[wenguIdx].push({ name: '문곡', category: 'auxiliary' });

  // 천괴 & 천월 (생년 천간 기준)
  const tiangkuiMap: Record<string, number> = { 甲: 1, 乙: 0, 丙: 11, 丁: 11, 戊: 1, 己: 0, 庚: 1, 辛: 6, 壬: 3, 癸: 3 };
  const tianyueMap: Record<string, number> = { 甲: 7, 乙: 8, 丙: 9, 丁: 9, 戊: 7, 己: 8, 庚: 7, 辛: 2, 壬: 5, 癸: 5 };
  if (tiangkuiMap[yearStem] !== undefined) starMap[tiangkuiMap[yearStem]].push({ name: '천괴', category: 'auxiliary' });
  if (tianyueMap[yearStem] !== undefined) starMap[tianyueMap[yearStem]].push({ name: '천월', category: 'auxiliary' });

  // 록존, 경양, 타라 (생년 천간 록지 기준)
  const luzunMap: Record<string, number> = { 甲: 2, 乙: 3, 丙: 5, 丁: 6, 戊: 5, 己: 6, 庚: 8, 辛: 9, 壬: 11, 癸: 0 };
  const luzunIdx = luzunMap[yearStem] ?? 2;
  starMap[luzunIdx].push({ name: '록존', category: 'auxiliary' });
  starMap[(luzunIdx + 1) % 12].push({ name: '경양', category: 'malefic' });
  starMap[(luzunIdx - 1 + 12) % 12].push({ name: '타라', category: 'malefic' });

  // 천마 (생년 지지 삼합 역마 기준)
  const tianmaMap: Record<number, number> = {
    8: 2, 0: 2, 4: 2,   // 申子辰 -> 寅
    2: 8, 6: 8, 10: 8,  // 寅午戌 -> 申
    5: 11, 9: 11, 1: 11,// 巳酉丑 -> 亥
    11: 5, 3: 5, 7: 5,  // 亥卯未 -> 巳
  };
  const tianmaIdx = tianmaMap[yearBranchIdx] ?? 2;
  starMap[tianmaIdx].push({ name: '천마', category: 'auxiliary' });

  // 지공 & 지겁 (시 기준)
  const jigongIdx = (11 - hourBranchIdx + 12) % 12;
  const jijieIdx = (11 + hourBranchIdx) % 12;
  starMap[jigongIdx].push({ name: '지공', category: 'malefic' });
  starMap[jijieIdx].push({ name: '지겁', category: 'malefic' });

  // 화성 & 영성 (년지 삼합 출발점 + 시지)
  const huaxingStartMap: Record<number, number> = {
    2: 1, 6: 1, 10: 1,  // 寅午戌 -> 丑
    8: 2, 0: 2, 4: 2,   // 申子辰 -> 寅
    5: 3, 9: 3, 1: 3,   // 巳酉丑 -> 卯
    11: 9, 3: 9, 7: 9,  // 亥卯未 -> 酉
  };
  const huaxingStart = huaxingStartMap[yearBranchIdx] ?? 1;
  const huasingIdx = (huaxingStart + hourBranchIdx) % 12;
  const yingsingIdx = (10 + hourBranchIdx) % 12;
  starMap[huasingIdx].push({ name: '화성', category: 'malefic' });
  starMap[yingsingIdx].push({ name: '영성', category: 'malefic' });

  // 사화(四化) 적용
  const yearSiHua = SIHUA_TABLE[yearStem] || SIHUA_TABLE['甲'];
  const siHuaSummary: ZiweiChartResult['siHuaSummary'] = {
    화록: { star: yearSiHua.화록, palace: '' },
    화권: { star: yearSiHua.화권, palace: '' },
    화과: { star: yearSiHua.화과, palace: '' },
    화기: { star: yearSiHua.화기, palace: '' },
  };

  // 12궁 객체 조립
  const palaces: Record<string, ZiweiPalace> = {};
  const palaceList: ZiweiPalace[] = [];

  for (let i = 0; i < 12; i++) {
    const palaceName = ZIWEI_PALACE_NAMES[i];
    const branchIdx = (mingGongIdx - i + 120) % 12;
    const { stem, branch, ganZhi } = palaceGanZhi[branchIdx];

    const step = isForward ? i : (12 - i) % 12;
    const daxianStartAge = wuxingJu.number + step * 10;
    const daxianEndAge = daxianStartAge + 9;

    const starsInPalace = starMap[branchIdx].map((s) => {
      let siHua: ZiweiStar['siHua'] = undefined;
      if (s.name === yearSiHua.화록) siHua = '화록';
      if (s.name === yearSiHua.화권) siHua = '화권';
      if (s.name === yearSiHua.화과) siHua = '화과';
      if (s.name === yearSiHua.화기) siHua = '화기';

      if (siHua) {
        siHuaSummary[siHua] = { star: s.name, palace: palaceName };
      }

      return { ...s, siHua };
    });

    const palaceObj: ZiweiPalace = {
      name: palaceName,
      branch,
      stem,
      ganZhi,
      stars: starsInPalace,
      isShenGong: branchIdx === shenGongIdx,
      daxianStartAge,
      daxianEndAge,
    };

    palaces[palaceName] = palaceObj;
    palaceList.push(palaceObj);
  }

  const solarDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const lunarDateStr = `${lunarYear}-${String(lunarMonth).padStart(2, '0')}-${String(lunarDay).padStart(2, '0')}`;

  // 유년(流年) 운세 옵션 처리
  let yearlyFortune: ZiweiYearlyFortune | undefined = undefined;
  if (targetYear) {
    const targetStemIdx = (targetYear - 4) % 10;
    const targetStem = ZIWEI_STEMS[(targetStemIdx + 10) % 10];
    const targetBranchIdx = ((targetYear - 4) % 12 + 12) % 12;
    const targetBranch = ZIWEI_BRANCHES[targetBranchIdx];

    const yearlyPalaceObj = palaceList.find((p) => p.branch === targetBranch) || palaceList[0];

    const targetSiHuaTable = SIHUA_TABLE[targetStem] || SIHUA_TABLE['甲'];
    const yearlySiHua: ZiweiYearlyFortune['yearlySiHua'] = {
      화록: { star: targetSiHuaTable.화록, palace: (palaceList.find((p) => p.stars.some((s) => s.name === targetSiHuaTable.화록))?.name || '명궁') as ZiweiPalaceName },
      화권: { star: targetSiHuaTable.화권, palace: (palaceList.find((p) => p.stars.some((s) => s.name === targetSiHuaTable.화권))?.name || '명궁') as ZiweiPalaceName },
      화과: { star: targetSiHuaTable.화과, palace: (palaceList.find((p) => p.stars.some((s) => s.name === targetSiHuaTable.화과))?.name || '명궁') as ZiweiPalaceName },
      화기: { star: targetSiHuaTable.화기, palace: (palaceList.find((p) => p.stars.some((s) => s.name === targetSiHuaTable.화기))?.name || '명궁') as ZiweiPalaceName },
    };

    yearlyFortune = {
      year: targetYear,
      yearGanZhi: `${targetStem}${targetBranch}`,
      yearlyMingPalace: yearlyPalaceObj.name,
      yearlySiHua,
    };
  }

  return {
    solarDate: solarDateStr,
    lunarDate: lunarDateStr,
    isLeapMonth,
    gender,
    yearGanZhi: `${yearStem}${yearBranch}`,
    mingGongBranch: ZIWEI_BRANCHES[mingGongIdx],
    shenGongBranch: ZIWEI_BRANCHES[shenGongIdx],
    wuxingJu,
    palaces,
    palaceList,
    siHuaSummary,
    yearlyFortune,
  };
}
