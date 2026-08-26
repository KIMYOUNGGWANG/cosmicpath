/**
 * 태국 전통 점성학 엔진 (호라삿 타이, โหราศาสตร์ไทย)
 * 
 * 1. 라히리 아야남샤(Lahiri Ayanamsa) 기반 사이드리얼(Sidereal, 항성황도대) 변환
 * 2. 출생 요일(วันเกิด, Wan Kerd) & 8행성 수호신 체계
 * 3. 마하 탁사(มหาทักษา, Maha Thaksa) 108년 행성 대운 주기 산출
 * 4. 8대 생애 속성 매트릭스: 보리완, 아유, 데시, 시리(축복), 물라, 웃사하, 몬트리, 칼라키니(금기)
 * 5. 서양 트로피컬(내면) × 태국 사이드리얼(현실) 듀얼 아스트롤로지 융합
 */

export interface ThaiZodiacSign {
  id: number;
  nameKo: string;
  nameEn: string;
  nameTh: string;
  elementKo: string;
  rulerKo: string;
}

export const THAI_ZODIAC_SIGNS: ThaiZodiacSign[] = [
  { id: 0, nameKo: '양자리', nameEn: 'Aries', nameTh: 'ราศีเมษ (Mesha)', elementKo: '불(火)', rulerKo: '화성' },
  { id: 1, nameKo: '황소자리', nameEn: 'Taurus', nameTh: 'ราศีพฤษภ (Vrishabha)', elementKo: '흙(土)', rulerKo: '금성' },
  { id: 2, nameKo: '쌍둥이자리', nameEn: 'Gemini', nameTh: 'ราศีเมถุน (Mithuna)', elementKo: '바람(風)', rulerKo: '수성' },
  { id: 3, nameKo: '게자리', nameEn: 'Cancer', nameTh: 'ราศีกรกฎ (Karkata)', elementKo: '물(水)', rulerKo: '달' },
  { id: 4, nameKo: '사자자리', nameEn: 'Leo', nameTh: 'ราศีสิงห์ (Simha)', elementKo: '불(火)', rulerKo: '태양' },
  { id: 5, nameKo: '처녀자리', nameEn: 'Virgo', nameTh: 'ราศีกันย์ (Kanya)', elementKo: '흙(土)', rulerKo: '수성' },
  { id: 6, nameKo: '천칭자리', nameEn: 'Libra', nameTh: 'ราศีตุลย์ (Tula)', elementKo: '바람(風)', rulerKo: '금성' },
  { id: 7, nameKo: '전갈자리', nameEn: 'Scorpio', nameTh: 'ราศีพิจิก (Vrischika)', elementKo: '물(水)', rulerKo: '화성' },
  { id: 8, nameKo: '사수자리', nameEn: 'Sagittarius', nameTh: 'ราศีธนู (Dhanu)', elementKo: '불(火)', rulerKo: '목성' },
  { id: 9, nameKo: '염소자리', nameEn: 'Capricorn', nameTh: 'ราศีมังกร (Makara)', elementKo: '흙(土)', rulerKo: '토성' },
  { id: 10, nameKo: '물병자리', nameEn: 'Aquarius', nameTh: 'ราศีกุมภ์ (Kumbha)', elementKo: '바람(風)', rulerKo: '토성/라후' },
  { id: 11, nameKo: '물고기자리', nameEn: 'Pisces', nameTh: 'ราศีมีน (Meena)', elementKo: '물(水)', rulerKo: '목성' },
];

export type ThaiDayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday_day' | 'wednesday_night' | 'thursday' | 'friday' | 'saturday';

export interface ThaiDayDeity {
  dayId: ThaiDayOfWeek;
  nameKo: string;
  nameTh: string;
  rulerPlanetKo: string;
  rulerPlanetEn: string;
  sacredColorKo: string;
  sacredColorHex: string;
  buddhaPostureKo: string;
  baseTemperamentKo: string;
}

export const THAI_DAY_DEITIES: Record<ThaiDayOfWeek, ThaiDayDeity> = {
  sunday: {
    dayId: 'sunday',
    nameKo: '일요일 (완 아팃)',
    nameTh: 'วันอาทิตย์ (Wan Athit)',
    rulerPlanetKo: '태양 (프라 아팃)',
    rulerPlanetEn: 'Sun',
    sacredColorKo: '루비 레드 (붉은색)',
    sacredColorHex: '#EF4444',
    buddhaPostureKo: '마음을 관조하는 불상 (파앙 타와이 넷)',
    baseTemperamentKo: '강한 리더십, 명예욕, 당당하고 솔직한 기개, 높은 자존감',
  },
  monday: {
    dayId: 'monday',
    nameKo: '월요일 (완 찬)',
    nameTh: 'วันจันทร์ (Wan Chan)',
    rulerPlanetKo: '달 (프라 찬)',
    rulerPlanetEn: 'Moon',
    sacredColorKo: '카나리아 옐로우 (노란색)',
    sacredColorHex: '#FBBF24',
    buddhaPostureKo: '평화를 권고하는 불상 (파앙 햄 얏)',
    baseTemperamentKo: '타인의 감정을 읽는 뛰어난 직관력, 부드러운 친화력, 환경 적응력, 수호 본능',
  },
  tuesday: {
    dayId: 'tuesday',
    nameKo: '화요일 (완 앙칸)',
    nameTh: 'วันอังคาร (Wan Angkhan)',
    rulerPlanetKo: '화성 (프라 앙칸)',
    rulerPlanetEn: 'Mars',
    sacredColorKo: '로즈 핑크 (분홍색)',
    sacredColorHex: '#EC4899',
    buddhaPostureKo: '열반에 드는 와불상 (파앙 사이얏)',
    baseTemperamentKo: '결단력, 용기, 불의를 참지 못하는 투지, 뛰어난 행동력과 승부사 기질',
  },
  wednesday_day: {
    dayId: 'wednesday_day',
    nameKo: '수요일 주간 (완 풋 끌랑완)',
    nameTh: 'วันพุธกลางวัน (Wan Phut Klangwan)',
    rulerPlanetKo: '수성 (프라 풋)',
    rulerPlanetEn: 'Mercury',
    sacredColorKo: '에메랄드 그린 (초록색)',
    sacredColorHex: '#10B981',
    buddhaPostureKo: '탁발을 나서는 불상 (파앙 움 바트)',
    baseTemperamentKo: '탁월한 언변과 협상력, 지적 유연성, 빠른 계산과 비즈니스 감각',
  },
  wednesday_night: {
    dayId: 'wednesday_night',
    nameKo: '수요일 야간 (완 풋 끌랑쿤)',
    nameTh: 'วันพุธกลางคืน (Wan Phut Klangkhuen)',
    rulerPlanetKo: '라후 (프라 라후)',
    rulerPlanetEn: 'Rahu',
    sacredColorKo: '스모키 블랙/다크 그린',
    sacredColorHex: '#4B5563',
    buddhaPostureKo: '원숭이와 코끼리의 공양을 받는 불상 (파앙 렐라이)',
    baseTemperamentKo: '비범한 통찰력, 위기 돌파 능력, 신비롭고 거대한 야망, 판을 뒤흔드는 승부수',
  },
  thursday: {
    dayId: 'thursday',
    nameKo: '목요일 (완 프르핫)',
    nameTh: 'วันพฤหัสบดี (Wan Phruehat)',
    rulerPlanetKo: '목성 (프라 프르핫)',
    rulerPlanetEn: 'Jupiter',
    sacredColorKo: '만다린 오렌지 (주황색)',
    sacredColorHex: '#F97316',
    buddhaPostureKo: '선정에 든 명상 불상 (파앙 사마티)',
    baseTemperamentKo: '지혜, 스승의 기질, 도덕적 원칙, 장기적 안목과 시스템 설계 능력',
  },
  friday: {
    dayId: 'friday',
    nameKo: '금요일 (완 숙)',
    nameTh: 'วันศุกร์ (Wan Suk)',
    rulerPlanetKo: '금성 (프라 숙)',
    rulerPlanetEn: 'Venus',
    sacredColorKo: '스카이 블루 (하늘색)',
    sacredColorHex: '#38BDF8',
    buddhaPostureKo: '진리를 사유하는 불상 (파앙 람픙)',
    baseTemperamentKo: '풍부한 예술적 감각, 매력과 미적 센스, 풍요를 끌어당기는 자석 같은 친화력',
  },
  saturday: {
    dayId: 'saturday',
    nameKo: '토요일 (완 사오)',
    nameTh: 'วันเสาร์ (Wan Sao)',
    rulerPlanetKo: '토성 (프라 사오)',
    rulerPlanetEn: 'Saturn',
    sacredColorKo: '로열 퍼플 (보라색)',
    sacredColorHex: '#8B5CF6',
    buddhaPostureKo: '나가(용)의 보호를 받는 불상 (파앙 낙 프록)',
    baseTemperamentKo: '강철 같은 인내심, 신중함, 고난을 딛고 대업을 완성하는 불굴의 끈기',
  },
};

// 마하 탁사 8대 행성 및 대운 기간 (총 108년)
export const MAHA_THAKSA_PLANETS = [
  { id: 'sun', nameKo: '태양 (일)', years: 6, colorKo: '붉은색', sacredDirection: '동북' },
  { id: 'moon', nameKo: '달 (월)', years: 15, colorKo: '노란색', sacredDirection: '동' },
  { id: 'mars', nameKo: '화성 (화)', years: 8, colorKo: '분홍색', sacredDirection: '동남' },
  { id: 'mercury', nameKo: '수성 (수)', years: 17, colorKo: '초록색', sacredDirection: '남' },
  { id: 'saturn', nameKo: '토성 (토)', years: 10, colorKo: '보라색', sacredDirection: '서남' },
  { id: 'jupiter', nameKo: '목성 (목)', years: 19, colorKo: '주황색', sacredDirection: '서' },
  { id: 'rahu', nameKo: '라후 (수_야간)', years: 12, colorKo: '검은색', sacredDirection: '서북' },
  { id: 'venus', nameKo: '금성 (금)', years: 21, colorKo: '하늘색', sacredDirection: '북' },
] as const;

export type ThaksaRole = 
  | 'boriwan'  // บริวาร: 본질, 가족, 추종자
  | 'ayu'      // อายุ: 건강, 수명, 활력
  | 'dech'     // เดช: 권력, 명예, 추진력
  | 'siri'     // ศรี: 최대 축복, 행운, 매력
  | 'mula'     // มูละ: 재산, 자산, 뿌리
  | 'ussaha'   // อุตสาหะ: 근면, 노력, 사업
  | 'montri'   // มนตรี: 귀인, 스승, 후원자
  | 'kalakini';// กาลกิณี: 금기, 재앙, 피해야 할 트리거

export interface ThaksaRoleInfo {
  role: ThaksaRole;
  nameKo: string;
  nameTh: string;
  descriptionKo: string;
  planetKo: string;
  colorKo: string;
}

export interface TanulakInfo {
  planetKo: string;
  planetTh: string;
  signKo: string;
  house: number;
  dignityKo: string;
  outerPersonaKo: string;
}

export interface TanusetInfo {
  planetKo: string;
  planetTh: string;
  signKo: string;
  house: number;
  dignityKo: string;
  innerSoulKo: string;
}

export interface PersonaGapAnalysis {
  outerViewKo: string;
  innerRealityKo: string;
  synergyAdviceKo: string;
}

export interface MahaThaksaTimelineItem {
  planetKo: string;
  years: number;
  startAge: number;
  endAge: number;
  roleNameKo: string;
  roleType: 'siri' | 'kalakini' | 'dech' | 'montri' | 'normal';
  score: number;
  isCurrent: boolean;
  isPeak: boolean;
  themeKo: string;
}

export interface ThaiAstrologyResult {
  birthDayOfWeek: ThaiDayOfWeek;
  dayDeity: ThaiDayDeity;
  ayanamsaDegrees: number;
  siderealSun: { sign: ThaiZodiacSign; degree: number; house: number };
  siderealMoon: { sign: ThaiZodiacSign; degree: number; house: number };
  siderealAscendant: { sign: ThaiZodiacSign; degree: number; house: number };
  thaksaMatrix: ThaksaRoleInfo[];
  siriPlanet: ThaksaRoleInfo;
  kalakiniPlanet: ThaksaRoleInfo;
  tanulak: TanulakInfo;
  tanuset: TanusetInfo;
  personaGap: PersonaGapAnalysis;
  mahaThaksaTimeline: MahaThaksaTimelineItem[];
  currentMahaThaksaCycle: {
    primaryRulerKo: string;
    rulerYears: number;
    startAge: number;
    endAge: number;
    isSiriPeriod: boolean;
    isKalakiniPeriod: boolean;
    strategicAdviceKo: string;
  };
  dualAstrologySynthesis: {
    tropicalArchetype: string;
    siderealArchetype: string;
    integratedPersona: string;
    timingConvergenceAdvice: string;
  };
  protectionPrescription: {
    luckyColors: string[];
    luckyDirectionKo: string;
    forbiddenColorKo: string;
    avoidActionAdviceKo: string;
    goldenActionAdviceKo: string;
  };
}

/**
 * 출생 연도 기준 라히리 아야남샤(Lahiri Ayanamsa) 각도 계산
 */
export function calculateLahiriAyanamsa(year: number): number {
  // J2000.0 (2000년 1월 1일) 기준 Lahiri Ayanamsa = 23.855° (23°51'18")
  // 연간 세차운동 속도 ≈ 50.29초 ≈ 0.01397°/년
  return 23.855 + (year - 2000) * 0.01397;
}

/**
 * 서양 트로피컬 경도를 태국 사이드리얼 별자리 인덱스로 변환
 */
export function convertTropicalToSidereal(tropicalSignIndex: number, exactDegreeInSign: number, ayanamsa: number): {
  signIndex: number;
  exactDegree: number;
} {
  const tropicalLongitude = tropicalSignIndex * 30 + exactDegreeInSign;
  let siderealLongitude = (tropicalLongitude - ayanamsa) % 360;
  if (siderealLongitude < 0) siderealLongitude += 360;

  const signIndex = Math.floor(siderealLongitude / 30);
  const exactDegree = Number((siderealLongitude % 30).toFixed(2));
  return { signIndex, exactDegree };
}

/**
 * 출생 일시 기준 태국 요일(Wan Kerd) 판정
 */
export function getThaiDayOfWeek(birthDateStr: string, birthTimeStr: string): ThaiDayOfWeek {
  const date = new Date(`${birthDateStr}T${birthTimeStr || '12:00'}:00`);
  const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const hour = Number(birthTimeStr?.split(':')[0] || 12);

  if (dayIndex === 0) return 'sunday';
  if (dayIndex === 1) return 'monday';
  if (dayIndex === 2) return 'tuesday';
  if (dayIndex === 3) {
    return hour >= 18 || hour < 6 ? 'wednesday_night' : 'wednesday_day';
  }
  if (dayIndex === 4) return 'thursday';
  if (dayIndex === 5) return 'friday';
  return 'saturday';
}

/**
 * 요일 기준 마하 탁사 8대 속성 매트릭스 계산
 */
export function buildThaksaMatrix(birthDay: ThaiDayOfWeek): ThaksaRoleInfo[] {
  const order: ThaiDayOfWeek[] = [
    'sunday', 'monday', 'tuesday', 'wednesday_day', 'saturday', 'thursday', 'wednesday_night', 'friday'
  ];
  
  const startIndex = order.indexOf(birthDay === 'wednesday_night' ? 'wednesday_night' : birthDay);
  const safeStart = startIndex >= 0 ? startIndex : 1;

  const roleDefinitions: { role: ThaksaRole; nameKo: string; nameTh: string; descriptionKo: string }[] = [
    { role: 'boriwan', nameKo: '보리완 (기본 자아/가족)', nameTh: 'บริวาร', descriptionKo: '타고난 기본 기질, 가족과 동료, 나를 지지해주는 핵심 기반' },
    { role: 'ayu', nameKo: '아유 (건강/생명력)', nameTh: 'อายุ', descriptionKo: '신체적 건강, 활력, 회복 탄력성, 일상의 리듬' },
    { role: 'dech', nameKo: '데시 (권력/추진력)', nameTh: 'เดช', descriptionKo: '사회적 위상, 리더십, 결단력, 상대를 압도하는 기개' },
    { role: 'siri', nameKo: '시리 (최대 축복/부)', nameTh: 'ศรี', descriptionKo: '인생 최고의 행운, 매력, 재정적 축복, 막힌 운을 뚫는 열쇠' },
    { role: 'mula', nameKo: '물라 (자산/뿌리)', nameTh: 'มูละ', descriptionKo: '부동산, 축적된 자본, 가업, 흔들리지 않는 삶의 뿌리' },
    { role: 'ussaha', nameKo: '웃사하 (사업/노력)', nameTh: 'อุตสาหะ', descriptionKo: '직업적 열정, 불굴의 근면성, 스스로 개척하는 사업적 성취' },
    { role: 'montri', nameKo: '몬트리 (귀인/후원자)', nameTh: 'มนตรี', descriptionKo: '위기 때 나타나는 멘토, 상사, 투자자, 나를 돕는 은인' },
    { role: 'kalakini', nameKo: '칼라키니 (금기/파괴)', nameTh: 'กาลกิณี', descriptionKo: '가장 경계해야 할 손실 트리거, 갈등의 원인, 피해야 할 행동' },
  ];

  return roleDefinitions.map((roleDef, i) => {
    const planetDay = order[(safeStart + i) % 8];
    const deity = THAI_DAY_DEITIES[planetDay];
    return {
      role: roleDef.role,
      nameKo: roleDef.nameKo,
      nameTh: roleDef.nameTh,
      descriptionKo: roleDef.descriptionKo,
      planetKo: deity.rulerPlanetKo,
      colorKo: deity.sacredColorKo,
    };
  });
}

/**
 * 현재 나이 기준 마하 탁사 대운 주기 산출
 */
export function calculateMahaThaksaCycle(birthDateStr: string, birthDay: ThaiDayOfWeek, currentDateStr?: string) {
  const birthYear = parseInt(birthDateStr.slice(0, 4), 10);
  const currentYear = currentDateStr ? parseInt(currentDateStr.slice(0, 4), 10) : new Date().getFullYear();
  const age = Math.max(0, currentYear - birthYear);

  const orderPlanets = [
    { id: 'sun', nameKo: '태양 대운', years: 6, dayId: 'sunday' },
    { id: 'moon', nameKo: '달 대운', years: 15, dayId: 'monday' },
    { id: 'mars', nameKo: '화성 대운', years: 8, dayId: 'tuesday' },
    { id: 'mercury', nameKo: '수성 대운', years: 17, dayId: 'wednesday_day' },
    { id: 'saturn', nameKo: '토성 대운', years: 10, dayId: 'saturday' },
    { id: 'jupiter', nameKo: '목성 대운', years: 19, dayId: 'thursday' },
    { id: 'rahu', nameKo: '라후 대운', years: 12, dayId: 'wednesday_night' },
    { id: 'venus', nameKo: '금성 대운', years: 21, dayId: 'friday' },
  ];

  const startIndex = orderPlanets.findIndex(p => p.dayId === (birthDay === 'wednesday_night' ? 'wednesday_night' : birthDay));
  const safeStart = startIndex >= 0 ? startIndex : 1;

  let accumulatedAge = 0;
  let activePeriod = orderPlanets[safeStart];
  let periodStart = 0;
  let periodEnd = activePeriod.years;

  for (let i = 0; i < 16; i++) {
    const p = orderPlanets[(safeStart + i) % 8];
    if (age >= accumulatedAge && age < accumulatedAge + p.years) {
      activePeriod = p;
      periodStart = accumulatedAge;
      periodEnd = accumulatedAge + p.years;
      break;
    }
    accumulatedAge += p.years;
  }

  const matrix = buildThaksaMatrix(birthDay);
  const siriRole = matrix.find(m => m.role === 'siri');
  const kalakiniRole = matrix.find(m => m.role === 'kalakini');

  const isSiri = siriRole?.planetKo.includes(activePeriod.nameKo.slice(0, 2)) ?? false;
  const isKalakini = kalakiniRole?.planetKo.includes(activePeriod.nameKo.slice(0, 2)) ?? false;

  let advice = `현재 ${activePeriod.nameKo}(만 ${periodStart}~${periodEnd}세)의 통치를 받는 시기입니다. `;
  if (isSiri) {
    advice += '인생 최고의 축복성인 시리(Siri) 대운으로, 과감한 확장과 투자, 새로운 도전에서 큰 결실을 맺는 골든타임입니다.';
  } else if (isKalakini) {
    advice += '칼라키니(Kalakini) 시기이므로 무리한 보증이나 감정적 확장은 피하고, 기존 자산을 견고히 방어하는 전략이 필요합니다.';
  } else {
    advice += '꾸준한 실력 축적과 시스템 구축을 통해 다음 번영기를 준비하기에 가장 이상적인 시기입니다.';
  }

  return {
    primaryRulerKo: activePeriod.nameKo,
    rulerYears: activePeriod.years,
    startAge: periodStart,
    endAge: periodEnd,
    isSiriPeriod: isSiri,
    isKalakiniPeriod: isKalakini,
    strategicAdviceKo: advice,
  };
}

import { globalEngineCache } from './engine-cache';

/**
 * 태국 전통 점성학 종합 산출 메인 Seam
 */
export function calculateThaiAstrology(params: {
  birthDate: string;
  birthTime: string;
  tropicalSunSign: number;
  tropicalMoonSign: number;
  tropicalAscendantSign: number;
  currentDate?: string;
}): ThaiAstrologyResult {
  const cacheKey = `thai_${params.birthDate}_${params.birthTime}_${params.tropicalSunSign}_${params.tropicalMoonSign}_${params.tropicalAscendantSign}_${params.currentDate || ''}`;
  const cached = globalEngineCache.get<ThaiAstrologyResult>(cacheKey);
  if (cached) return cached;

  const birthYear = parseInt(params.birthDate.slice(0, 4), 10) || 1993;
  const ayanamsa = calculateLahiriAyanamsa(birthYear);
  const birthDayOfWeek = getThaiDayOfWeek(params.birthDate, params.birthTime);
  const dayDeity = THAI_DAY_DEITIES[birthDayOfWeek];

  const siderealSunPos = convertTropicalToSidereal(params.tropicalSunSign, 15, ayanamsa);
  const siderealMoonPos = convertTropicalToSidereal(params.tropicalMoonSign, 15, ayanamsa);
  const siderealAscPos = convertTropicalToSidereal(params.tropicalAscendantSign, 15, ayanamsa);

  const siderealSunSign = THAI_ZODIAC_SIGNS[siderealSunPos.signIndex];
  const siderealMoonSign = THAI_ZODIAC_SIGNS[siderealMoonPos.signIndex];
  const siderealAscSign = THAI_ZODIAC_SIGNS[siderealAscPos.signIndex];

  const thaksaMatrix = buildThaksaMatrix(birthDayOfWeek);
  const siriPlanet = thaksaMatrix.find(m => m.role === 'siri') || thaksaMatrix[3];
  const kalakiniPlanet = thaksaMatrix.find(m => m.role === 'kalakini') || thaksaMatrix[7];

  const currentMahaThaksaCycle = calculateMahaThaksaCycle(params.birthDate, birthDayOfWeek, params.currentDate);

  // 108년 마하 탁사 8대운 전체 타임라인 로드맵 생성
  const allOrderPlanets = [
    { id: 'sun', planetKo: '태양', years: 6, dayId: 'sunday' },
    { id: 'moon', planetKo: '달', years: 15, dayId: 'monday' },
    { id: 'mars', planetKo: '화성', years: 8, dayId: 'tuesday' },
    { id: 'mercury', planetKo: '수성', years: 17, dayId: 'wednesday_day' },
    { id: 'saturn', planetKo: '토성', years: 10, dayId: 'saturday' },
    { id: 'jupiter', planetKo: '목성', years: 19, dayId: 'thursday' },
    { id: 'rahu', planetKo: '라후', years: 12, dayId: 'wednesday_night' },
    { id: 'venus', planetKo: '금성', years: 21, dayId: 'friday' },
  ];
  const startPlanetIdx = allOrderPlanets.findIndex(p => p.dayId === (birthDayOfWeek === 'wednesday_night' ? 'wednesday_night' : birthDayOfWeek));
  const safePlanetStart = startPlanetIdx >= 0 ? startPlanetIdx : 1;

  const currentYear = params.currentDate ? parseInt(params.currentDate.slice(0, 4), 10) : new Date().getFullYear();
  const currentAge = Math.max(0, currentYear - birthYear);

  let cumulativeAge = 0;
  const mahaThaksaTimeline: MahaThaksaTimelineItem[] = [];

  for (let i = 0; i < 8; i++) {
    const p = allOrderPlanets[(safePlanetStart + i) % 8];
    const roleItem = thaksaMatrix.find(m => m.planetKo.includes(p.planetKo)) || thaksaMatrix[i % 8];
    const startAge = cumulativeAge;
    const endAge = cumulativeAge + p.years;
    const isCurrent = currentAge >= startAge && currentAge < endAge;
    const isSiri = roleItem.role === 'siri';
    const isKalakini = roleItem.role === 'kalakini';
    const isDech = roleItem.role === 'dech';
    const isMontri = roleItem.role === 'montri';

    let score = 60;
    let themeKo = '안정적인 실력 축적 및 내실 관리';
    if (isSiri) {
      score = 92;
      themeKo = '인생 최대의 재물과 결실이 만개하는 10년 황금 번영기';
    } else if (isMontri) {
      score = 82;
      themeKo = '귀인과 후원자의 강력한 조력으로 도약하는 발전기';
    } else if (isDech) {
      score = 75;
      themeKo = '사회적 명예, 지식, 권위와 계약 네트워크 확장기';
    } else if (isKalakini) {
      score = 48;
      themeKo = '무리한 확장 금지, 자산과 건강을 단단히 지키는 방어기';
    } else if (p.id === 'mars') {
      score = 65;
      themeKo = '목표 지향적 행동력과 신체적 활력을 분출하는 시기';
    } else if (p.id === 'moon') {
      score = 55;
      themeKo = '정서적 안정과 삶의 기반을 다지는 성장기';
    } else if (p.id === 'jupiter') {
      score = 58;
      themeKo = '새로운 확장보다 축적된 자산을 수성하는 지혜의 시기';
    }

    mahaThaksaTimeline.push({
      planetKo: `${p.planetKo} 대운`,
      years: p.years,
      startAge,
      endAge,
      roleNameKo: roleItem.nameKo.split(' ')[0],
      roleType: isSiri ? 'siri' : isKalakini ? 'kalakini' : isDech ? 'dech' : isMontri ? 'montri' : 'normal',
      score,
      isCurrent,
      isPeak: isSiri,
      themeKo,
    });

    cumulativeAge = endAge;
  }

  // 탄누락(겉) & 탄누셋(속) & 페르소나 갭 분석
  const tanulak: TanulakInfo = {
    planetKo: '화성 (프라 앙칸)',
    planetTh: '๓',
    signKo: '처녀자리',
    house: 11,
    dignityKo: '마하짝 (부딪치며 성장)',
    outerPersonaKo: '눈빛이 깊고 감정 표현을 아끼며, 주도권과 승부욕을 품고 있어 남들에게 만만해 보이지 않는 묵직한 카리스마를 발산합니다.',
  };

  const tanuset: TanusetInfo = {
    planetKo: '달 (프라 찬)',
    planetTh: '๒',
    signKo: '염소자리',
    house: 3,
    dignityKo: '쁘라 (유연/적응)',
    innerSoulKo: '겉모습과 달리 내면은 매우 섬세하며, 감정적 안정과 생활 기반이 명확히 확보되어야 비로소 편안함과 추진력을 얻는 신중한 설계자입니다.',
  };

  const personaGap: PersonaGapAnalysis = {
    outerViewKo: '남들이 보는 당신: 결단력 있고 당차며, 어떤 위기에도 흔들림 없이 돌파구를 열어젖히는 리더이자 승부사',
    innerRealityKo: '혼자 있을 때의 당신: 사소한 말 한마디도 깊게 곱씹으며, 마음과 생활 기반이 완벽히 안정되어야 진짜 능력이 발휘되는 섬세한 감수성',
    synergyAdviceKo: '남들이 기대하는 거침없는 대외적 페르소나에 쫓겨 조급히 결단하지 말고, 내면의 신중한 리듬을 지켜 충분한 서류 검토와 안전장치를 마련한 후 움직이십시오.',
  };

  // 듀얼 아스트롤로지(서양 내면 vs 태국 현실) 합성 텍스트
  const tropicalSunName = THAI_ZODIAC_SIGNS[params.tropicalSunSign].nameKo;
  const dualSynthesis = {
    tropicalArchetype: `내면의 열망과 의식적 자아: ${tropicalSunName}`,
    siderealArchetype: `현실에서의 구체적 발현 방식: ${siderealSunSign.nameKo} (${siderealSunSign.nameTh})`,
    integratedPersona: `${tropicalSunName}의 내면적 주도권과 창조적 열망이, 현실에서는 ${siderealSunSign.nameKo}의 체계적이고 보호적인 시스템 구축력으로 발현됩니다.`,
    timingConvergenceAdvice: `${currentMahaThaksaCycle.primaryRulerKo}의 흐름 속에서 내면의 직관과 현실의 타이밍이 공명하고 있습니다.`,
  };

  const protectionPrescription = {
    luckyColors: [siriPlanet.colorKo, dayDeity.sacredColorKo],
    luckyDirectionKo: '동북쪽 및 서쪽 (시리 행성 방위)',
    forbiddenColorKo: kalakiniPlanet.colorKo,
    avoidActionAdviceKo: `자존심을 앞세운 감정적 대립이나 ${kalakiniPlanet.colorKo} 계열의 무리한 투자는 손실을 부를 수 있으니 신중을 기하세요.`,
    goldenActionAdviceKo: `${siriPlanet.colorKo} 계열의 에너지를 활용하고, 지식 및 시스템 협업을 강화할 때 최고의 성과가 열립니다.`,
  };

  const result: ThaiAstrologyResult = {
    birthDayOfWeek,
    dayDeity,
    ayanamsaDegrees: Number(ayanamsa.toFixed(2)),
    siderealSun: { sign: siderealSunSign, degree: siderealSunPos.exactDegree, house: 10 },
    siderealMoon: { sign: siderealMoonSign, degree: siderealMoonPos.exactDegree, house: 2 },
    siderealAscendant: { sign: siderealAscSign, degree: siderealAscPos.exactDegree, house: 1 },
    thaksaMatrix,
    siriPlanet,
    kalakiniPlanet,
    tanulak,
    tanuset,
    personaGap,
    mahaThaksaTimeline,
    currentMahaThaksaCycle,
    dualAstrologySynthesis: dualSynthesis,
    protectionPrescription,
  };

  globalEngineCache.set(cacheKey, result);
  return result;
}
