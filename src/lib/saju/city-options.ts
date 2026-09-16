export const BIRTH_CITY_OPTIONS = [
  { value: '서울', labelKo: '서울', labelEn: 'Seoul' },
  { value: '부산', labelKo: '부산', labelEn: 'Busan' },
  { value: '인천', labelKo: '인천', labelEn: 'Incheon' },
  { value: '대구', labelKo: '대구', labelEn: 'Daegu' },
  { value: '대전', labelKo: '대전', labelEn: 'Daejeon' },
  { value: '광주', labelKo: '광주', labelEn: 'Gwangju' },
  { value: '울산', labelKo: '울산', labelEn: 'Ulsan' },
  { value: '수원', labelKo: '수원', labelEn: 'Suwon' },
  { value: '제주', labelKo: '제주', labelEn: 'Jeju' },
] as const;

export const GLOBAL_BIRTH_CITY_OPTIONS = [
  { value: 'New York', labelKo: '뉴욕', labelEn: 'New York' },
  { value: 'Los Angeles', labelKo: '로스앤젤레스', labelEn: 'Los Angeles' },
  { value: 'Chicago', labelKo: '시카고', labelEn: 'Chicago' },
  { value: 'San Francisco', labelKo: '샌프란시스코', labelEn: 'San Francisco' },
  { value: 'Toronto', labelKo: '토론토', labelEn: 'Toronto' },
  { value: 'Vancouver', labelKo: '밴쿠버', labelEn: 'Vancouver' },
  { value: 'London', labelKo: '런던', labelEn: 'London' },
  { value: 'Paris', labelKo: '파리', labelEn: 'Paris' },
  { value: 'Berlin', labelKo: '베를린', labelEn: 'Berlin' },
  { value: 'Amsterdam', labelKo: '암스테르담', labelEn: 'Amsterdam' },
] as const;

export function getBirthCityOptions(language: 'ko' | 'en') {
  return language === 'en' ? GLOBAL_BIRTH_CITY_OPTIONS : BIRTH_CITY_OPTIONS;
}

