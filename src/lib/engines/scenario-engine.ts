/**
 * A vs B 의사결정 시나리오 및 12개월 실행 타임라인 연산 엔진
 * 
 * 사주 월운/용신 및 주간 히트맵 데이터를 기반으로
 * Option A(변화/공격)와 Option B(안정/수성)의 12개월 실행 적합도(Action Score: 0~100)와
 * 리스크 지수(Risk Score: 0~100), 그리고 종합 권고 시나리오를 0.1초 내에 결정론적으로 산출합니다.
 */

import type { MonthlyHeatmapSummary, YearHeatmapResult, WeeklyActionPhase } from './timing-heatmap';

export type BestOptionType = 'OPTION_A' | 'OPTION_B' | 'HOLD';

export interface MonthTimelinePoint {
  month: number;
  monthName: string;
  actionScore: number;
  riskScore: number;
  phase: WeeklyActionPhase;
  bestOption: 'A' | 'B' | 'EQUAL';
  keyActionKo: string;
  keyActionEn: string;
}

export interface ScenarioVerdictResult {
  hasCustomScenarios: boolean;
  scenarioA: string;
  scenarioB: string;
  recommendedOption: BestOptionType;
  confidenceScore: number;
  verdictHeadlineKo: string;
  verdictHeadlineEn: string;
  verdictDetailKo: string;
  verdictDetailEn: string;
  goldenMonths: number[];
  defenseMonths: number[];
  timeline: MonthTimelinePoint[];
}

interface CalculateScenarioParams {
  scenarioA?: string;
  scenarioB?: string;
  question?: string;
  weeklyHeatmap?: YearHeatmapResult | null;
  targetYear?: number;
  language?: 'ko' | 'en';
}

export function calculateScenarioDecision(params: CalculateScenarioParams): ScenarioVerdictResult {
  const isEn = params.language === 'en';
  const rawA = params.scenarioA?.trim() || '';
  const rawB = params.scenarioB?.trim() || '';
  const hasCustom = Boolean(rawA && rawB);

  const scenarioA = rawA || (isEn ? 'Execute Option A (Change / Action)' : 'A안 (변화 / 적극 실행)');
  const scenarioB = rawB || (isEn ? 'Maintain Option B (Stability / Hold)' : 'B안 (안정 / 현 상태 유지)');

  const monthsData: MonthlyHeatmapSummary[] = params.weeklyHeatmap?.months || [];

  const timeline: MonthTimelinePoint[] = [];
  let scoreSumA = 0;
  let scoreSumB = 0;
  const goldenMonths: number[] = [];
  const defenseMonths: number[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthSummary = monthsData.find((item) => item.month === m);
    const avgScore = monthSummary ? Math.round(monthSummary.averageScore) : 55;
    const phase: WeeklyActionPhase = monthSummary ? monthSummary.dominantPhase : (avgScore >= 65 ? 'ATTACK' : avgScore <= 45 ? 'DEFEND' : 'NEGOTIATE');

    let actionScore = avgScore;
    let riskScore = 100 - avgScore;

    if (phase === 'ATTACK') {
      actionScore = Math.min(100, avgScore + 8);
      riskScore = Math.max(10, 100 - avgScore - 5);
      goldenMonths.push(m);
    } else if (phase === 'DEFEND') {
      actionScore = Math.max(15, avgScore - 12);
      riskScore = Math.min(95, 100 - avgScore + 10);
      defenseMonths.push(m);
    }

    const bestOption: 'A' | 'B' | 'EQUAL' = actionScore > 65 ? 'A' : actionScore < 45 ? 'B' : 'EQUAL';

    if (bestOption === 'A') scoreSumA += actionScore;
    else if (bestOption === 'B') scoreSumB += (100 - actionScore);
    else {
      scoreSumA += 50;
      scoreSumB += 50;
    }

    const keyActionKo =
      phase === 'ATTACK'
        ? 'A안 추진의 골든타임. 행동력을 극대화하여 결단을 내릴 시점'
        : phase === 'HARVEST'
        ? '계약 체결 및 성과 수확에 유리. 조건 협상 적기'
        : phase === 'NEGOTIATE'
        ? '섣부른 결정을 피하고 A안과 B안의 조건을 미세 조정할 시기'
        : '자본과 에너지를 수성할 시기. B안(안정/보류) 우선 권장';

    const keyActionEn =
      phase === 'ATTACK'
        ? 'Golden window for Option A. Decisive execution recommended.'
        : phase === 'HARVEST'
        ? 'Favorable for deal closing and harvesting results.'
        : phase === 'NEGOTIATE'
        ? 'Review fine print and negotiate terms carefully.'
        : 'Defensive period. Option B (holding position) strongly recommended.';

    timeline.push({
      month: m,
      monthName: monthSummary ? (isEn ? monthSummary.monthNameEn : monthSummary.monthNameKo) : `${m}월`,
      actionScore,
      riskScore,
      phase,
      bestOption,
      keyActionKo,
      keyActionEn,
    });
  }

  let recommendedOption: BestOptionType = 'HOLD';
  let confidenceScore = 75;

  if (scoreSumA > scoreSumB + 60) {
    recommendedOption = 'OPTION_A';
    confidenceScore = Math.min(94, Math.round(55 + (scoreSumA / (scoreSumA + scoreSumB)) * 40));
  } else if (scoreSumB > scoreSumA + 60) {
    recommendedOption = 'OPTION_B';
    confidenceScore = Math.min(92, Math.round(55 + (scoreSumB / (scoreSumA + scoreSumB)) * 40));
  } else {
    recommendedOption = 'HOLD';
    confidenceScore = 68;
  }

  const bestQuarter = params.weeklyHeatmap?.peakQuarter || '하반기';
  const goldenStr = goldenMonths.length > 0 ? goldenMonths.slice(0, 3).map((m) => `${m}월`).join(', ') : '하반기';

  const verdictHeadlineKo =
    recommendedOption === 'OPTION_A'
      ? `[${scenarioA}] 실행 권고 — ${goldenStr}이 최고의 골든타임`
      : recommendedOption === 'OPTION_B'
      ? `[${scenarioB}] 수성 권고 — 충동적 변화보다 방어가 유리한 국면`
      : `조건부 보류 권고 — 즉각적 이동보다 ${bestQuarter}까지 실탄 비축`;

  const verdictHeadlineEn =
    recommendedOption === 'OPTION_A'
      ? `Option A Execution Recommended — Peak window: ${goldenMonths.slice(0, 3).join(', ')}`
      : recommendedOption === 'OPTION_B'
      ? `Option B Preservation Recommended — Stability holds higher value`
      : `Conditional Hold — Conserve capital until ${bestQuarter}`;

  const verdictDetailKo =
    recommendedOption === 'OPTION_A'
      ? `5대 엔진 교차 분석 결과, 상반기보다 ${goldenStr} 구간에서 행동 운기와 자본 흐름이 급상승합니다. [${scenarioA}]을(를) 목표로 지금부터 사전 준비에 착수하십시오.`
      : recommendedOption === 'OPTION_B'
      ? `현재 흐름에서는 섣부른 환경 변화 시 관재수와 자본 누수가 발생할 수 있습니다. [${scenarioB}]을(를) 유지하며 내실을 다지는 것이 리스크를 최소화합니다.`
      : `A안과 B안의 득실이 팽팽하게 맞서고 있습니다. 최소 3개월간 시장 상황과 상대의 조건을 관망한 뒤 재평가할 것을 권고합니다.`;

  const verdictDetailEn =
    recommendedOption === 'OPTION_A'
      ? `Cross-verified analysis indicates action momentum peaks during month ${goldenMonths.slice(0, 3).join(', ')}. Begin preparation now to execute [${scenarioA}].`
      : recommendedOption === 'OPTION_B'
      ? `Premature moves introduce hidden capital risk. Maintaining [${scenarioB}] preserves key advantages and minimizes volatility.`
      : `Both paths carry balanced tradeoffs. A 3-month observation window is strongly advised before final commitment.`;

  return {
    hasCustomScenarios: hasCustom,
    scenarioA,
    scenarioB,
    recommendedOption,
    confidenceScore,
    verdictHeadlineKo,
    verdictHeadlineEn,
    verdictDetailKo,
    verdictDetailEn,
    goldenMonths,
    defenseMonths,
    timeline,
  };
}
