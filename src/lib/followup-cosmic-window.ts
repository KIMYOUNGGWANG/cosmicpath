type CosmicSeasonKey =
  | 'CAPRICORN'
  | 'AQUARIUS'
  | 'PISCES'
  | 'ARIES'
  | 'TAURUS'
  | 'GEMINI'
  | 'CANCER'
  | 'LEO'
  | 'VIRGO'
  | 'LIBRA'
  | 'SCORPIO'
  | 'SAGITTARIUS';

export interface CosmicWindowContent {
  readonly seasonLabel: string;
  readonly title: string;
  readonly summary: string;
  readonly highlight: string;
}

const COSMIC_WINDOW_COPY: Record<CosmicSeasonKey, CosmicWindowContent> = {
  CAPRICORN: {
    seasonLabel: '염소자리 시즌',
    title: '이번 주 하늘의 포인트: 염소자리 시즌',
    summary: '현실적인 선택과 장기 계획을 다시 세우기 좋은 흐름입니다.',
    highlight: 'Phase 4에서 일, 돈, 연애 중 무엇을 먼저 구조화해야 하는지 확인해보세요.',
  },
  AQUARIUS: {
    seasonLabel: '물병자리 시즌',
    title: '이번 주 하늘의 포인트: 물병자리 시즌',
    summary: '고정관념에서 한 발 벗어나 새로운 선택지를 열어보기 좋은 구간입니다.',
    highlight: 'Phase 4에서 지금 삶의 흐름을 바꿀 핵심 변수를 확인해보세요.',
  },
  PISCES: {
    seasonLabel: '물고기자리 시즌',
    title: '이번 주 하늘의 포인트: 물고기자리 시즌',
    summary: '감정과 직감이 예민해지는 주간이라 관계와 선택의 결이 더 선명해집니다.',
    highlight: 'Phase 4에서 연애, 커리어, 재정 중 어디에 에너지를 써야 할지 정밀하게 보세요.',
  },
  ARIES: {
    seasonLabel: '양자리 시즌',
    title: '이번 주 하늘의 포인트: 양자리 시즌',
    summary: '미루던 결정을 밀어붙이기보다 우선순위를 선명하게 정리하기 좋은 타이밍입니다.',
    highlight: 'Phase 4에서 지금 바로 실행해야 할 영역과 멈춰야 할 영역을 확인해보세요.',
  },
  TAURUS: {
    seasonLabel: '황소자리 시즌',
    title: '이번 주 하늘의 포인트: 황소자리 시즌',
    summary: '돈, 안정감, 관계의 지속 가능성을 점검하기 좋은 흐름입니다.',
    highlight: 'Phase 4에서 재물운과 관계 패턴을 함께 보는 구간이 특히 유효합니다.',
  },
  GEMINI: {
    seasonLabel: '쌍둥이자리 시즌',
    title: '이번 주 하늘의 포인트: 쌍둥이자리 시즌',
    summary: '대화와 선택지가 많아지는 시기라 방향을 좁히는 기준이 더 중요해집니다.',
    highlight: 'Phase 4에서 일과 연애의 우선순위를 어떤 기준으로 나눌지 보세요.',
  },
  CANCER: {
    seasonLabel: '게자리 시즌',
    title: '이번 주 하늘의 포인트: 게자리 시즌',
    summary: '안정감, 가족, 감정 회복이 중요한 테마로 떠오르는 구간입니다.',
    highlight: 'Phase 4에서 감정 소모가 큰 영역과 회복이 필요한 지점을 확인해보세요.',
  },
  LEO: {
    seasonLabel: '사자자리 시즌',
    title: '이번 주 하늘의 포인트: 사자자리 시즌',
    summary: '자기 표현과 존재감이 커지는 흐름이라 선택의 무게도 더 커집니다.',
    highlight: 'Phase 4에서 커리어와 관계에서 어떻게 존재감을 써야 하는지 확인해보세요.',
  },
  VIRGO: {
    seasonLabel: '처녀자리 시즌',
    title: '이번 주 하늘의 포인트: 처녀자리 시즌',
    summary: '디테일과 루틴을 다시 정비하면 결과 차이가 커지는 구간입니다.',
    highlight: 'Phase 4에서 건강, 일, 재정 루틴을 어떤 순서로 손봐야 하는지 보세요.',
  },
  LIBRA: {
    seasonLabel: '천칭자리 시즌',
    title: '이번 주 하늘의 포인트: 천칭자리 시즌',
    summary: '관계의 균형과 거래의 조건을 다시 살피기 좋은 흐름입니다.',
    highlight: 'Phase 4에서 연애와 재정의 밸런스를 동시에 점검해보세요.',
  },
  SCORPIO: {
    seasonLabel: '전갈자리 시즌',
    title: '이번 주 하늘의 포인트: 전갈자리 시즌',
    summary: '숨겨진 감정, 집착, 진짜 욕망이 드러나기 쉬운 구간입니다.',
    highlight: 'Phase 4에서 내가 집착하는 영역과 놓아야 할 영역을 명확히 보세요.',
  },
  SAGITTARIUS: {
    seasonLabel: '사수자리 시즌',
    title: '이번 주 하늘의 포인트: 사수자리 시즌',
    summary: '시야를 넓히고 더 큰 방향을 다시 잡기 좋은 시기입니다.',
    highlight: 'Phase 4에서 내년까지 이어질 확장 포인트를 먼저 확인해보세요.',
  },
};

function getCosmicSeasonKey(referenceDate: Date): CosmicSeasonKey {
  const month = referenceDate.getUTCMonth() + 1;
  const day = referenceDate.getUTCDate();
  const monthDay = month * 100 + day;

  if (monthDay >= 120 && monthDay <= 218) return 'AQUARIUS';
  if (monthDay >= 219 && monthDay <= 320) return 'PISCES';
  if (monthDay >= 321 && monthDay <= 419) return 'ARIES';
  if (monthDay >= 420 && monthDay <= 520) return 'TAURUS';
  if (monthDay >= 521 && monthDay <= 620) return 'GEMINI';
  if (monthDay >= 621 && monthDay <= 722) return 'CANCER';
  if (monthDay >= 723 && monthDay <= 822) return 'LEO';
  if (monthDay >= 823 && monthDay <= 922) return 'VIRGO';
  if (monthDay >= 923 && monthDay <= 1022) return 'LIBRA';
  if (monthDay >= 1023 && monthDay <= 1121) return 'SCORPIO';
  if (monthDay >= 1122 && monthDay <= 1221) return 'SAGITTARIUS';
  if (monthDay >= 1222 || monthDay <= 119) return 'CAPRICORN';

  return 'PISCES';
}

export function getCosmicWindowContent(referenceDate: Date): CosmicWindowContent {
  return COSMIC_WINDOW_COPY[getCosmicSeasonKey(referenceDate)];
}
