export type ReceptionLanguage = 'ko' | 'en';

export const START_RECEPTION_COPY = {
  ko: {
    badge: 'CosmicPath 접수실',
    title: 'CosmicPath 3단분석 접수실',
    subtitle:
      '질문 하나를 접수하면 사주, 점성술, 타로를 각각 다른 근거층으로 분리해 지금 필요한 판단과 다음 행동을 정리합니다.',
    sideTitle: '3단 분석 접수 기준',
    sideSubtitle: '질문을 먼저 받고, 생년 정보는 근거 보정으로만 씁니다.',
    sideNote:
      '결과는 미래를 단정하지 않고 사주 흐름, 점성 타이밍, 타로 상징을 나란히 놓아 지금 선택할 수 있는 범위를 좁힙니다.',
    writingTitle: '접수 메모',
    writingItems: [
      '지금 가장 풀고 싶은 질문을 한 문장으로 적습니다.',
      '생년월일과 출생지는 사주·점성 보정이 필요할 때 더합니다.',
      '타로는 마지막에 뽑거나 건너뛰어도 흐름이 끊기지 않습니다.',
    ],
  },
  en: {
    badge: 'CosmicPath intake',
    title: 'CosmicPath 3-Layer Reading Intake',
    subtitle:
      'Submit one real question first. Saju, astrology, and tarot stay as separate evidence layers so the result can narrow the next useful move.',
    sideTitle: '3-layer intake standard',
    sideSubtitle: 'Question first; birth data only calibrates the evidence.',
    sideNote:
      'The report does not promise an outcome. It compares saju rhythm, astrological timing, and tarot symbols to narrow what you can choose now.',
    writingTitle: 'Intake memo',
    writingItems: [
      'Write the one question you most need to settle.',
      'Add birth date and city when you want sharper saju and astrology calibration.',
      'Pick tarot at the final step, or skip it without breaking the flow.',
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
    sequenceLabel: '3단 접수 순서',
    sequenceSummary: '질문 / 사주·점성 / 타로',
    questionLabel: '01 질문 접수',
    questionEyebrow: '질문 중심 진입',
    birthLabel: '02 사주·점성 기본정보',
    birthEyebrow: '선택 보정 정보',
    tarotLabel: '03 타로 준비',
    tarotSummary: '입력 후 타로를 뽑거나 건너뛰어 첫 판정을 열 수 있습니다.',
  },
  en: {
    sequenceLabel: '3-layer intake order',
    sequenceSummary: 'Question / Saju & astrology / Tarot',
    questionLabel: '01 Question Intake',
    questionEyebrow: 'Question-first entry',
    birthLabel: '02 Saju & Astrology Basics',
    birthEyebrow: 'Optional calibration',
    tarotLabel: '03 Tarot Prep',
    tarotSummary: 'After intake, choose tarot or skip it to open the first verdict.',
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
