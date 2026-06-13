import type { PremiumReportEvalCase } from './fixtures.ts';

export const GENERIC_ASTROLOGY_ONLY_REPORT = {
  summary: '좋은 흐름이 있으니 긍정적인 마음으로 기다리세요. 점성 타이밍이 좋아질 것입니다.',
  advice: '타로와 사주 구조 없이 지금의 별자리 분위기만 보고 천천히 움직이면 됩니다.',
} as const;

export const MISSING_BIRTH_TIME_BOUNDARY_REPORT = {
  summary: '사주 구조, 점성 타이밍, 타로 현재 신호를 함께 보아 첫 행동을 정합니다.',
  timing: '점성 타이밍은 이번 주 검증 창을 제안하지만 생시 기준값의 한계는 따로 설명하지 않습니다.',
  action: '첫 행동은 기록하고 비교합니다. KASI는 계산 검증 전용입니다.',
} as const;

export function buildPassingCommercialReport(evalCase: PremiumReportEvalCase): unknown {
  const unknownTimeLine = evalCase.unknownTime
    ? '시간 미상 기준이므로 상승궁, 하우스, 시주 판단은 낮춥니다.'
    : '생시가 제공되어도 계산값은 근거이고 결과 보장은 아닙니다.';

  return {
    summary: [
      `${evalCase.name} / ${evalCase.birthDate} / ${evalCase.question}`,
      `사주 구조가 먼저입니다. 이 케이스는 오래 반복된 선택 패턴을 기준으로 ${evalCase.expected.mustMention.join(', ')}을 판단합니다.`,
      '점성 타이밍은 이번 주와 2026-06-20 검증 창을 조정하는 보조 레이어입니다.',
      '타로 즉각 신호는 현재 바로 드러난 감정과 장애물을 읽고, 첫 행동의 크기만 조절합니다.',
      '원천 역할과 source boundary: KASI/JPL은 calculation 검증 전용이고 교리 해석을 대신하지 않습니다.',
      unknownTimeLine,
    ].join('\n'),
    decisionNote: {
      verdict: '결정은 진행/보류 중 하나로 고정하지 말고, 7일 관찰 후 재검토하는 조건부 판단으로 둡니다.',
      nextMove: '첫 행동은 30분 안에 메시지 또는 기준표를 작성하고, 반응 품질을 기록해 비교하는 것입니다.',
      commercialValue: evalCase.expected.commercialValue,
    },
    actionPlan: [
      '2026-06-20: 첫 행동을 실행합니다.',
      '2026-06-27: 결과를 측정하고 다음 결정을 내립니다.',
      '조건이 약하면 행동 크기를 낮추고 중단 기준을 적용합니다.',
    ],
    safety: '의료, 투자, 법률 결정은 전문가 검토를 우선하며 이 리포트는 decision support boundary 안에서만 작동합니다.',
  };
}
