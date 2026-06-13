export type ReceptionLanguage = 'ko' | 'en';

export const START_RECEPTION_COPY = {
  ko: {
    badge: 'CosmicPath Decision Note',
    title: 'CosmicPath Decision Note 접수실',
    subtitle:
      '사주 구조, 점성 타이밍, 타로 즉시 신호로 미뤄둔 선택을 정리합니다. 첫 판정은 무료이고 생년월일은 필수입니다.',
    sideTitle: 'Decision Note 접수 기준',
    sideSubtitle: '선택 질문과 생년월일을 먼저 받고, 나머지는 정밀도 보정 입력으로만 씁니다.',
    sideNote:
      '이름, 생시, 출생지, 성별, 상대 정보, 타로는 상품명이 아니라 판정의 정밀도를 맞추는 입력입니다.',
    writingTitle: '접수 메모',
    writingItems: [
      '지금 미루고 있는 선택 질문을 한 문장으로 적습니다.',
      '생년월일은 필수 기준으로 적고, 이름·생시·출생지·성별은 정밀도가 필요할 때 더합니다.',
      '상대 정보와 타로는 관계 보정과 즉시 신호가 필요할 때만 더합니다.',
    ],
  },
  en: {
    badge: 'CosmicPath Decision Note',
    title: 'CosmicPath Decision Note Intake',
    subtitle:
      'Use Saju structure, astrology timing, and a tarot immediate signal to settle one delayed decision. The first verdict is free, and birth date is required.',
    sideTitle: 'Decision Note intake standard',
    sideSubtitle: 'Decision question and birth date first; other details calibrate precision.',
    sideNote:
      'Name, birth time, city, gender, partner details, and tarot are precision inputs, not the product identity.',
    writingTitle: 'Intake memo',
    writingItems: [
      'Write the one delayed choice you most need to settle.',
      'Add birth date as the required baseline; add name, time, city, and gender when you want sharper calibration.',
      'Add partner details and tarot only when relationship calibration or an immediate signal helps.',
    ],
  },
} as const satisfies Record<ReceptionLanguage, {
  readonly badge: string;
  readonly title: string;
  readonly subtitle: string;
  readonly sideTitle: string;
  readonly sideSubtitle: string;
  readonly sideNote: string;
  readonly writingTitle: string;
  readonly writingItems: readonly string[];
}>;

export const INTAKE_SECTION_COPY = {
  ko: {
    sequenceLabel: 'Decision Note 접수 순서',
    sequenceSummary: '선택 질문 / 생년월일 필수 / 타로 신호',
    questionLabel: '01 선택 질문',
    questionEyebrow: '선택 중심 진입',
    birthLabel: '02 생년월일 기준',
    birthEyebrow: '필수 판정 기준',
    tarotLabel: '03 타로 즉시 신호',
    tarotSummary: '입력 후 타로 신호를 뽑거나 건너뛰어 첫 판정을 열 수 있습니다.',
  },
  en: {
    sequenceLabel: 'Decision Note intake order',
    sequenceSummary: 'Decision Question / Required Birth Date / Tarot Signal',
    questionLabel: '01 Decision Question',
    questionEyebrow: 'Decision-first entry',
    birthLabel: '02 Birth Date Baseline',
    birthEyebrow: 'Required baseline',
    tarotLabel: '03 Tarot Signal',
    tarotSummary: 'After intake, choose a tarot signal or skip it to open the first verdict.',
  },
} as const satisfies Record<ReceptionLanguage, {
  readonly sequenceLabel: string;
  readonly sequenceSummary: string;
  readonly questionLabel: string;
  readonly questionEyebrow: string;
  readonly birthLabel: string;
  readonly birthEyebrow: string;
  readonly tarotLabel: string;
  readonly tarotSummary: string;
}>;
