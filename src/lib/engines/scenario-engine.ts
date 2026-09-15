/**
 * A vs B 의사결정 시나리오 및 12개월 실행 타임라인 연산 엔진
 * 
 * 사주 월운/용신 및 주간 히트맵 데이터를 기반으로
 * Option A(변화/공격)와 Option B(안정/수성)의 12개월 실행 적합도(Action Score: 0~100)와
 * 리스크 지수(Risk Score: 0~100), 그리고 종합 권고 시나리오를 0.1초 내에 결정론적으로 산출합니다.
 */

import type { MonthlyHeatmapSummary, YearHeatmapResult, WeeklyActionPhase } from './timing-heatmap';
import { calculateRollingTimingHeatmap } from './timing-heatmap';
import type { SajuResult } from './saju';

export type BestOptionType = 'OPTION_A' | 'OPTION_B' | 'HOLD';

export interface MonthTimelinePoint {
  year: number;
  month: number;
  monthName: string;
  formattedLabelKo: string;
  formattedLabelEn: string;
  isNextYear: boolean;
  actionScore: number;
  riskScore: number;
  phase: WeeklyActionPhase;
  bestOption: 'A' | 'B' | 'EQUAL';
  keyActionKo: string;
  keyActionEn: string;
}

export interface GoldenWindowPoint {
  year: number;
  month: number;
  labelKo: string;
  labelEn: string;
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
  goldenWindows: GoldenWindowPoint[];
  defenseMonths: number[];
  timeline: MonthTimelinePoint[];
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
}

interface CalculateScenarioParams {
  scenarioA?: string;
  scenarioB?: string;
  question?: string;
  weeklyHeatmap?: YearHeatmapResult | null;
  saju?: SajuResult | null;
  targetYear?: number;
  startMonth?: number;
  language?: 'ko' | 'en';
}

export function calculateScenarioDecision(params: CalculateScenarioParams): ScenarioVerdictResult {
  const isEn = params.language === 'en';
  const rawA = params.scenarioA?.trim() || '';
  const rawB = params.scenarioB?.trim() || '';
  const hasCustom = Boolean(rawA && rawB);

  const scenarioA = rawA || (isEn ? 'Execute Option A (Change / Action)' : 'A안 (변화 / 적극 실행)');
  const scenarioB = rawB || (isEn ? 'Maintain Option B (Stability / Hold)' : 'B안 (안정 / 현 상태 유지)');

  const now = new Date();
  const currentYear = params.targetYear || now.getFullYear();
  const startMonth = params.startMonth || (now.getMonth() + 1);

  let weeklyHeatmap = params.weeklyHeatmap;
  if (params.saju) {
    try {
      weeklyHeatmap = calculateRollingTimingHeatmap(params.saju, currentYear, startMonth);
    } catch (e) {
      console.error('Failed to compute rolling heatmap in scenario engine:', e);
    }
  } else if (!weeklyHeatmap) {
    try {
      // fallback without saju
      weeklyHeatmap = null;
    } catch (e) {
      console.error('Fallback error:', e);
    }
  }

  const monthsData: MonthlyHeatmapSummary[] = weeklyHeatmap?.months || [];

  const timeline: MonthTimelinePoint[] = [];
  let scoreSumA = 0;
  let scoreSumB = 0;
  const goldenMonths: number[] = [];
  const goldenWindows: GoldenWindowPoint[] = [];
  const defenseMonths: number[] = [];

  const FALLBACK_SEASONAL_SCORES = [58, 66, 75, 82, 86, 78, 68, 63, 72, 76, 54, 48];

  for (let i = 0; i < 12; i++) {
    const m = ((startMonth - 1 + i) % 12) + 1;
    const y = (startMonth - 1 + i) >= 12 ? currentYear + 1 : currentYear;
    const isNextYear = y > currentYear;

    const monthSummary = monthsData.find((item) => (item.year ? item.year === y && item.month === m : item.month === m));
    const avgScore = monthSummary
      ? Math.round(monthSummary.averageScore)
      : FALLBACK_SEASONAL_SCORES[m - 1];
    const phase: WeeklyActionPhase = monthSummary
      ? monthSummary.dominantPhase
      : (avgScore >= 80 ? 'ATTACK' : avgScore >= 70 ? 'HARVEST' : avgScore >= 58 ? 'NEGOTIATE' : 'DEFEND');

    let actionScore = avgScore;
    let riskScore = 100 - avgScore;

    const labelKo = isNextYear ? `내년 ${m}월` : `${m}월`;
    const labelEn = isNextYear ? `Next ${monthSummary ? monthSummary.monthNameEn : m + 'M'}` : (monthSummary ? monthSummary.monthNameEn : `${m}M`);

    if (phase === 'ATTACK') {
      actionScore = Math.min(100, avgScore + 8);
      riskScore = Math.max(10, 100 - avgScore - 5);
      goldenMonths.push(m);
      goldenWindows.push({
        year: y,
        month: m,
        labelKo,
        labelEn,
      });
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
        ? `${labelKo}은 A안 추진의 골든타임. 행동력을 극대화하여 결단을 내릴 시점`
        : phase === 'HARVEST'
        ? `${labelKo}은 계약 체결 및 성과 수확에 유리. 조건 협상 적기`
        : phase === 'NEGOTIATE'
        ? `${labelKo}은 섣부른 결정을 피하고 A안과 B안의 조건을 미세 조정할 시기`
        : `${labelKo}은 자본과 에너지를 수성할 시기. B안(안정/보류) 우선 권장`;

    const keyActionEn =
      phase === 'ATTACK'
        ? `Golden window for Option A during ${labelEn}. Decisive execution recommended.`
        : phase === 'HARVEST'
        ? `Favorable for deal closing and harvesting results in ${labelEn}.`
        : phase === 'NEGOTIATE'
        ? `Review fine print and negotiate terms carefully in ${labelEn}.`
        : `Defensive period in ${labelEn}. Option B (holding position) strongly recommended.`;

    const formattedLabelKo = isNextYear ? `${m}월 ('${String(y).slice(2)})` : `${m}월`;
    const formattedLabelEn = isNextYear ? `${monthSummary ? monthSummary.monthNameEn.slice(0, 3) : m} '${String(y).slice(2)}` : (monthSummary ? monthSummary.monthNameEn.slice(0, 3) : `${m}M`);

    timeline.push({
      year: y,
      month: m,
      monthName: monthSummary ? (isEn ? monthSummary.monthNameEn : monthSummary.monthNameKo) : `${m}월`,
      formattedLabelKo,
      formattedLabelEn,
      isNextYear,
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

  const bestQuarter = weeklyHeatmap?.peakQuarter || (isEn ? 'the upcoming months' : '향후 분기');

  let goldenStrKo = '향후 6개월 이내';
  let goldenStrEn = 'next 6 months';

  if (goldenWindows.length > 0) {
    const topWindows = goldenWindows.slice(0, 3);
    const allNext = topWindows.every((w) => w.year > currentYear);
    const allCurrent = topWindows.every((w) => w.year === currentYear);

    if (allNext) {
      goldenStrKo = `내년 ${topWindows.map((w) => `${w.month}월`).join(', ')}`;
      goldenStrEn = `Next year ${topWindows.map((w) => `${w.month}M`).join(', ')}`;
    } else if (allCurrent) {
      goldenStrKo = topWindows.map((w) => `${w.month}월`).join(', ');
      goldenStrEn = topWindows.map((w) => `${w.month}M`).join(', ');
    } else {
      goldenStrKo = topWindows.map((w) => w.labelKo).join(', ');
      goldenStrEn = topWindows.map((w) => w.labelEn).join(', ');
    }
  }

  const verdictHeadlineKo =
    recommendedOption === 'OPTION_A'
      ? `[${scenarioA}] 실행 권고 — ${goldenStrKo}이 최고의 골든타임`
      : recommendedOption === 'OPTION_B'
      ? `[${scenarioB}] 수성 권고 — 충동적 변화보다 방어가 유리한 국면`
      : `조건부 보류 권고 — 즉각적 이동보다 ${bestQuarter}까지 실탄 비축`;

  const verdictHeadlineEn =
    recommendedOption === 'OPTION_A'
      ? `Option A Execution Recommended — Peak window: ${goldenStrEn}`
      : recommendedOption === 'OPTION_B'
      ? `Option B Preservation Recommended — Stability holds higher value`
      : `Conditional Hold — Conserve capital until ${bestQuarter}`;

  const verdictDetailKo =
    recommendedOption === 'OPTION_A'
      ? `5대 엔진 교차 분석 결과, ${goldenStrKo} 구간에서 행동 운기와 자본 흐름이 급상승합니다. [${scenarioA}]을(를) 목표로 지금부터 사전 준비에 착수하십시오.`
      : recommendedOption === 'OPTION_B'
      ? `현재 흐름에서는 섣부른 환경 변화 시 관재수와 자본 누수가 발생할 수 있습니다. [${scenarioB}]을(를) 유지하며 내실을 다지는 것이 리스크를 최소화합니다.`
      : `A안과 B안의 득실이 팽팽하게 맞서고 있습니다. 최소 3개월간 시장 상황과 상대의 조건을 관망한 뒤 재평가할 것을 권고합니다.`;

  const verdictDetailEn =
    recommendedOption === 'OPTION_A'
      ? `Cross-verified analysis indicates action momentum peaks during ${goldenStrEn}. Begin preparation now to execute [${scenarioA}].`
      : recommendedOption === 'OPTION_B'
      ? `Premature moves introduce hidden capital risk. Maintaining [${scenarioB}] preserves key advantages and minimizes volatility.`
      : `Both paths carry balanced tradeoffs. A 3-month observation window is strongly advised before final commitment.`;

  const endMonth = ((startMonth - 1 + 11) % 12) + 1;
  const endYear = (startMonth - 1 + 11) >= 12 ? currentYear + 1 : currentYear;

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
    goldenWindows,
    defenseMonths,
    timeline,
    startYear: currentYear,
    startMonth,
    endYear,
    endMonth,
  };
}
