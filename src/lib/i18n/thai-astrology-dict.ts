/**
 * 태국 전통 점성학(โหราศาสตร์ไทย) 글로벌 i18n 사전
 * 한국어, 영어, 태국어 완전 매핑
 */

export interface ThaiDayTranslation {
  id: string;
  nameTh: string;
  nameEn: string;
  nameKo: string;
  deityTh: string;
  deityEn: string;
  deityKo: string;
  colorTh: string;
  colorEn: string;
  colorKo: string;
  colorHex: string;
  rulerPlanetEn: string;
  rulerPlanetKo: string;
}

export const THAI_DAYS_I18N: Record<string, ThaiDayTranslation> = {
  sunday: {
    id: 'sunday',
    nameTh: 'วันอาทิตย์ (Wan Athit)',
    nameEn: 'Sunday',
    nameKo: '일요일 (완 아팃)',
    deityTh: 'พระอาทิตย์ (Phra Athit)',
    deityEn: 'Phra Athit (Solar Deity)',
    deityKo: '프라 아팃 (태양의 신)',
    colorTh: 'สีแดง (Daeng)',
    colorEn: 'Royal Red',
    colorKo: '루비 레드 (붉은색)',
    colorHex: '#EF4444',
    rulerPlanetEn: 'Sun',
    rulerPlanetKo: '태양 (일)',
  },
  monday: {
    id: 'monday',
    nameTh: 'วันจันทร์ (Wan Chan)',
    nameEn: 'Monday',
    nameKo: '월요일 (완 찬)',
    deityTh: 'พระจันทร์ (Phra Chan)',
    deityEn: 'Phra Chan (Lunar Deity)',
    deityKo: '프라 찬 (달의 신)',
    colorTh: 'สีเหลือง (Lueang)',
    colorEn: 'Sacred Gold / Yellow',
    colorKo: '카나리아 옐로우 (황금색)',
    colorHex: '#FBBF24',
    rulerPlanetEn: 'Moon',
    rulerPlanetKo: '달 (월)',
  },
  tuesday: {
    id: 'tuesday',
    nameTh: 'วันอังคาร (Wan Angkhan)',
    nameEn: 'Tuesday',
    nameKo: '화요일 (완 앙칸)',
    deityTh: 'พระอังคาร (Phra Angkhan)',
    deityEn: 'Phra Angkhan (Martian Deity)',
    deityKo: '프라 앙칸 (화성의 신)',
    colorTh: 'สีชมพู (Chomphu)',
    colorEn: 'Rose Pink',
    colorKo: '로즈 핑크 (분홍색)',
    colorHex: '#EC4899',
    rulerPlanetEn: 'Mars',
    rulerPlanetKo: '화성 (화)',
  },
  wednesday_day: {
    id: 'wednesday_day',
    nameTh: 'วันพุธ กลางวัน (Wan Phut Klang Wan)',
    nameEn: 'Wednesday Day (06:00-18:00)',
    nameKo: '수요일 주간 (완 풋)',
    deityTh: 'พระพุธ (Phra Phut)',
    deityEn: 'Phra Phut (Mercurial Deity)',
    deityKo: '프라 풋 (수성의 신)',
    colorTh: 'สีเขียว (Khiao)',
    colorEn: 'Emerald Green',
    colorKo: '에메랄드 그린 (초록색)',
    colorHex: '#10B981',
    rulerPlanetEn: 'Mercury',
    rulerPlanetKo: '수성 (수)',
  },
  wednesday_night: {
    id: 'wednesday_night',
    nameTh: 'วันพุธ กลางคืน (Wan Phut Klang Khuen / Rahu)',
    nameEn: 'Wednesday Night (18:00-06:00 / Rahu)',
    nameKo: '수요일 야간 (라후 완 풋)',
    deityTh: 'พระราหู (Phra Rahu)',
    deityEn: 'Phra Rahu (Shadow Planet / Eclipse Deity)',
    deityKo: '프라 라후 (암흑과 변혁의 신)',
    colorTh: 'สีเทา / สีดำ (Thao / Dam)',
    colorEn: 'Smoky Shadow / Black',
    colorKo: '스모키 흑요석 (검은색/회색)',
    colorHex: '#6B7280',
    rulerPlanetEn: 'North Node (Rahu)',
    rulerPlanetKo: '라후 (달의 승교점)',
  },
  thursday: {
    id: 'thursday',
    nameTh: 'วันพฤหัสบดี (Wan Phruehatsabodi)',
    nameEn: 'Thursday (Guru Day)',
    nameKo: '목요일 (완 프르핫)',
    deityTh: 'พระพฤหัสบดี (Phra Phruehat)',
    deityEn: 'Phra Phruehat (Guru / Jupiter Deity)',
    deityKo: '프라 프르핫 (지혜와 목성의 신)',
    colorTh: 'สีส้ม (Som)',
    colorEn: 'Sacred Orange',
    colorKo: '선셋 오렌지 (주황색)',
    colorHex: '#F97316',
    rulerPlanetEn: 'Jupiter',
    rulerPlanetKo: '목성 (목)',
  },
  friday: {
    id: 'friday',
    nameTh: 'วันศุกร์ (Wan Suk)',
    nameEn: 'Friday (Venus Day)',
    nameKo: '금요일 (완 숙)',
    deityTh: 'พระศุกร์ (Phra Suk)',
    deityEn: 'Phra Suk (Venusian Deity)',
    deityKo: '프라 숙 (풍요와 금성의 신)',
    colorTh: 'สีฟ้า (Fa)',
    colorEn: 'Sky Blue / Cyan',
    colorKo: '스카이 블루 (청색)',
    colorHex: '#38BDF8',
    rulerPlanetEn: 'Venus',
    rulerPlanetKo: '금성 (금)',
  },
  saturday: {
    id: 'saturday',
    nameTh: 'วันเสาร์ (Wan Sao)',
    nameEn: 'Saturday (Saturn Day)',
    nameKo: '토요일 (완 사오)',
    deityTh: 'พระเสาร์ (Phra Sao)',
    deityEn: 'Phra Sao (Saturnian Deity)',
    deityKo: '프라 사오 (인내와 토성의 신)',
    colorTh: 'สีม่วง (Muang)',
    colorEn: 'Royal Purple',
    colorKo: '로열 퍼플 (보라색)',
    colorHex: '#8B5CF6',
    rulerPlanetEn: 'Saturn',
    rulerPlanetKo: '토성 (토)',
  },
};

export const THAKSA_ROLES_I18N: Record<string, { nameTh: string; nameEn: string; nameKo: string; meaningKo: string; meaningEn: string }> = {
  boriwan: {
    nameTh: 'บริวาร (Boriwan)',
    nameEn: 'Entourage / Followers',
    nameKo: '보리완 (인덕·가족·팀원)',
    meaningKo: '나를 따르는 지지자, 부하 직원, 동료 및 가정의 화합력',
    meaningEn: 'Subordinates, team alignment, family support, and loyal followers.',
  },
  ayu: {
    nameTh: 'อายุ (Ayu)',
    nameEn: 'Longevity / Vitality',
    nameKo: '아유 (생명력·멘탈)',
    meaningKo: '신체적 건강 수명, 지구력, 장기전에서 버티는 멘탈 에너지',
    meaningEn: 'Physical vitality, mental resilience, stamina, and life longevity.',
  },
  dej: {
    nameTh: 'เดช (Dej)',
    nameEn: 'Authority / Charisma',
    nameKo: '데시 (권위·승부욕)',
    meaningKo: '사회적 영향력, 명예, 조직을 휘어잡는 결단력과 카리스마',
    meaningEn: 'Command, executive authority, charisma, and reputation.',
  },
  siri: {
    nameTh: 'ศรี (Siri)',
    nameEn: 'Supreme Blessing / Fortune',
    nameKo: '시리 (대발복·매력·재물)',
    meaningKo: '인생 최고의 축복성으로, 뜻밖의 행운과 재물, 사람을 끌어당기는 매력',
    meaningEn: 'Supreme auspicious fortune, windfall prosperity, charm, and divine favor.',
  },
  mula: {
    nameTh: 'มูละ (Mula)',
    nameEn: 'Root Assets / Real Estate',
    nameKo: '물라 (기초자산·부동산)',
    meaningKo: '부동산, 상속, 흔들리지 않는 근본 자산 및 시스템 기반',
    meaningEn: 'Foundational wealth, real estate, inheritance, and core equity.',
  },
  utsaha: {
    nameTh: 'อุตสาหะ (Utsaha)',
    nameEn: 'Enterprise / Drive',
    nameKo: '웃사하 (실행력·추진력)',
    meaningKo: '목표를 향해 끊임없이 파고드는 집념과 전문성 돌파력',
    meaningEn: 'Diligence, professional mastery, execution grit, and persistence.',
  },
  montri: {
    nameTh: 'มนตรี (Montri)',
    nameEn: 'Mentors / Patronage',
    nameKo: '몬트리 (귀인·스폰서)',
    meaningKo: '상사, 투자자, 결정적 순간에 문을 열어주는 귀인의 후원',
    meaningEn: 'VIP patrons, high-level sponsors, mentors, and government approval.',
  },
  kalakini: {
    nameTh: 'กาลกิณี (Kalakini)',
    nameEn: 'Taboo / Loss Trigger',
    nameKo: '칼라키니 (절대 경계·손실 트리거)',
    meaningKo: '방심할 때 큰 손실을 부르는 행성으로, 절대 피해야 할 색상과 행동 수칙',
    meaningEn: 'Critical vulnerability trigger, obstacle planet, and taboo risk vector.',
  },
};
