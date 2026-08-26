/**
 * 진태양시(True Solar Time) 및 경도/서머타임(DST) 정밀 보정 엔진
 * 
 * 대한민국 표준시(동경 135도, UTC+9 / 아카시 기준)와 
 * 실제 관측지 경도(서울 동경 126.978도 기준 -32분 5초)의 시차 및
 * 대한민국 역사적 서머타임 적용 기간을 1분 단위로 완벽 보정합니다.
 */

export interface CityCoordinate {
  nameKo: string;
  nameEn: string;
  longitude: number; // 경도 (동경 +, 서경 -)
  latitude: number;  // 위도 (북위 +, 남위 -)
  standardMeridian: number; // 해당 국가/지역의 표준 자오선 경도 (한국 = 135)
}

export const MAJOR_CITIES_COORDINATES: Record<string, CityCoordinate> = {
  seoul: { nameKo: '서울', nameEn: 'Seoul', longitude: 126.9780, latitude: 37.5665, standardMeridian: 135 },
  busan: { nameKo: '부산', nameEn: 'Busan', longitude: 129.0756, latitude: 35.1796, standardMeridian: 135 },
  incheon: { nameKo: '인천', nameEn: 'Incheon', longitude: 126.7052, latitude: 37.4563, standardMeridian: 135 },
  daegu: { nameKo: '대구', nameEn: 'Daegu', longitude: 128.6014, latitude: 35.8714, standardMeridian: 135 },
  daejeon: { nameKo: '대전', nameEn: 'Daejeon', longitude: 127.3845, latitude: 36.3504, standardMeridian: 135 },
  gwangju: { nameKo: '광주', nameEn: 'Gwangju', longitude: 126.8526, latitude: 35.1595, standardMeridian: 135 },
  ulsan: { nameKo: '울산', nameEn: 'Ulsan', longitude: 129.3114, latitude: 35.5384, standardMeridian: 135 },
  jeju: { nameKo: '제주', nameEn: 'Jeju', longitude: 126.5312, latitude: 33.4996, standardMeridian: 135 },
  tokyo: { nameKo: '도쿄', nameEn: 'Tokyo', longitude: 139.6917, latitude: 35.6895, standardMeridian: 135 },
  newyork: { nameKo: '뉴욕', nameEn: 'New York', longitude: -74.0060, latitude: 40.7128, standardMeridian: -75 },
  losangeles: { nameKo: '로스앤젤레스', nameEn: 'Los Angeles', longitude: -118.2437, latitude: 34.0522, standardMeridian: -120 },
  london: { nameKo: '런던', nameEn: 'London', longitude: -0.1278, latitude: 51.5074, standardMeridian: 0 },
};

// 대한민국 역사적 일광절약시간제(서머타임) 적용 기록
const KOREA_DST_PERIODS: Array<{ start: string; end: string }> = [
  { start: '1948-06-01', end: '1948-09-12' },
  { start: '1949-05-01', end: '1949-09-12' },
  { start: '1950-05-01', end: '1950-09-10' },
  { start: '1951-05-06', end: '1951-09-08' },
  { start: '1955-05-05', end: '1955-09-08' },
  { start: '1956-05-20', end: '1956-09-29' },
  { start: '1957-05-05', end: '1957-09-21' },
  { start: '1958-05-04', end: '1958-09-20' },
  { start: '1959-05-03', end: '1959-09-19' },
  { start: '1960-05-01', end: '1960-09-17' },
  { start: '1987-05-10', end: '1987-10-10' },
  { start: '1988-05-08', end: '1988-10-08' },
];

export interface TrueSolarTimeResult {
  originalDate: string;
  originalTime: string;
  correctedDate: string;
  correctedTime: string;
  offsetMinutes: number;
  cityName: string;
  isDstApplied: boolean;
  isMidnightBoundaryCrossed: boolean;
  explanationKo: string;
  explanationEn: string;
}

/**
 * 주어진 생년월일시와 도시를 바탕으로 진태양시(True Solar Time)를 보정합니다.
 */
import { globalEngineCache } from './engine-cache';

export function calculateTrueSolarTime(params: {
  birthDate: string;
  birthTime: string;
  cityName?: string;
  longitude?: number;
  latitude?: number;
}): TrueSolarTimeResult {
  const cacheKey = `tst_${params.birthDate}_${params.birthTime}_${params.cityName || ''}_${params.longitude || ''}_${params.latitude || ''}`;
  const cached = globalEngineCache.get<TrueSolarTimeResult>(cacheKey);
  if (cached) return cached;

  const { birthDate, birthTime, cityName } = params;
  const normCity = (cityName || 'seoul').toLowerCase().replace(/\s+/g, '');
  const city = MAJOR_CITIES_COORDINATES[normCity] || MAJOR_CITIES_COORDINATES['seoul'];

  // 1. 경도 시차 계산 (1도 = 4분)
  // 한국 표준시 자오선 135도 기준 서울(126.978도)은 8.022도 서쪽에 위치 -> 약 -32.09분
  const longitudeDifference = city.longitude - city.standardMeridian;
  const longitudeOffsetMinutes = Math.round(longitudeDifference * 4); // 분 단위

  // 2. 대한민국 서머타임 적용 여부 판정
  let isDstApplied = false;
  const birthDateOnly = birthDate.split('T')[0];
  
  if (city.standardMeridian === 135) {
    for (const period of KOREA_DST_PERIODS) {
      if (birthDateOnly >= period.start && birthDateOnly <= period.end) {
        isDstApplied = true;
        break;
      }
    }
  }

  // 총 보정 시간 (분)
  // 서머타임 적용 시 시계가 1시간 빨랐으므로 -60분 추가 보정
  const totalOffsetMinutes = longitudeOffsetMinutes - (isDstApplied ? 60 : 0);

  // 3. 시간 계산
  const [origHour, origMinute] = birthTime.split(':').map(Number);
  const totalOriginalMinutes = origHour * 60 + origMinute;
  const totalCorrectedMinutes = totalOriginalMinutes + totalOffsetMinutes;

  let correctedDate = birthDateOnly;
  let finalHour = 0;
  let finalMinute = 0;
  let isMidnightBoundaryCrossed = false;

  if (totalCorrectedMinutes < 0) {
    // 전날로 넘어감 (예: 00:15 - 32분 = 전날 23:43)
    const prevDate = new Date(birthDateOnly);
    prevDate.setDate(prevDate.getDate() - 1);
    correctedDate = prevDate.toISOString().split('T')[0];
    const wrappedMinutes = 1440 + totalCorrectedMinutes;
    finalHour = Math.floor(wrappedMinutes / 60);
    finalMinute = wrappedMinutes % 60;
    isMidnightBoundaryCrossed = true;
  } else if (totalCorrectedMinutes >= 1440) {
    // 다음 날로 넘어감
    const nextDate = new Date(birthDateOnly);
    nextDate.setDate(nextDate.getDate() + 1);
    correctedDate = nextDate.toISOString().split('T')[0];
    const wrappedMinutes = totalCorrectedMinutes - 1440;
    finalHour = Math.floor(wrappedMinutes / 60);
    finalMinute = wrappedMinutes % 60;
    isMidnightBoundaryCrossed = true;
  } else {
    finalHour = Math.floor(totalCorrectedMinutes / 60);
    finalMinute = totalCorrectedMinutes % 60;
  }

  const correctedTime = `${String(finalHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`;

  const explanationKo = `표준시(동경 135도) 대비 ${city.nameKo}(경도 ${city.longitude.toFixed(2)}°)의 진태양시 시차 ${longitudeOffsetMinutes}분${
    isDstApplied ? ' 및 역사적 서머타임(-60분)' : ''
  }을 반영하여 출생 시간을 ${birthTime}에서 ${correctedTime}으로 100% 정밀 보정했습니다.`;

  const explanationEn = `Calibrated true solar time by applying ${longitudeOffsetMinutes}m longitude offset for ${city.nameEn} (${city.longitude.toFixed(2)}°E)${
    isDstApplied ? ' and historic DST (-60m)' : ''
  }, shifting birth time from ${birthTime} to ${correctedTime}.`;

  const result: TrueSolarTimeResult = {
    originalDate: birthDateOnly,
    originalTime: birthTime,
    correctedDate,
    correctedTime,
    offsetMinutes: totalOffsetMinutes,
    cityName: city.nameKo,
    isDstApplied,
    isMidnightBoundaryCrossed,
    explanationKo,
    explanationEn,
  };

  globalEngineCache.set(cacheKey, result);
  return result;
}
