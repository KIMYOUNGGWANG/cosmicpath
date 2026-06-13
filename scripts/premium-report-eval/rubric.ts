import type {
  InvalidIntakeEvalCase,
  PremiumReportEvalCase,
  ReportSignal,
} from './fixtures.ts';

export type CommercialReportDimension =
  | 'intake_fidelity'
  | 'saju_first_structure'
  | 'three_layer_roles'
  | 'source_boundaries'
  | 'decision_specificity'
  | 'action_plan'
  | 'uncertainty_boundary'
  | 'scenario_fit'
  | 'safety_boundary';

export type CommercialReportScore = {
  readonly score: number;
  readonly passed: boolean;
  readonly dimensionHits: readonly CommercialReportDimension[];
  readonly missingDimensions: readonly CommercialReportDimension[];
  readonly signalHits: readonly ReportSignal[];
  readonly failureReasons: readonly string[];
  readonly genericHits: readonly string[];
};

export type IntakeReadiness = {
  readonly ready: boolean;
  readonly missingFields: readonly string[];
};

type DimensionRule = {
  readonly id: CommercialReportDimension;
  readonly weight: number;
  readonly passes: (text: string, evalCase: PremiumReportEvalCase) => boolean;
};

const GENERIC_PATTERNS = [
  /좋은\s*흐름/u,
  /긍정적인\s*마음/u,
  /우주가\s*도와/u,
  /trust your intuition/iu,
  /everything happens for a reason/iu,
] as const;

const FORBIDDEN_PATTERNS = [
  /무조건\s*(?:성공|됩니다|된다|해야|하세요|하십시오|하라|맞다|좋다|나쁘다|가능)/u,
  /반드시\s*성공/u,
  /운명이\s*정해/u,
  /치료\s*중단/u,
  /특정\s*주식\s*(?:매수|매도|추천)/u,
  /guaranteed/iu,
] as const;

const DIMENSION_RULES = [
  rule('intake_fidelity', 10, (text, evalCase) => hasNeedles(text, [evalCase.name, evalCase.birthDate])),
  rule('saju_first_structure', 14, (text) => hasSajuBeforeSecondaryLayers(text)),
  rule('three_layer_roles', 14, (text) => hasAllSignals(text, ['saju_structure', 'astrology_timing', 'tarot_immediate'])),
  rule('source_boundaries', 10, (text) => /KASI|JPL|원천 역할|source role|계산 검증|source boundary/iu.test(text)),
  rule('decision_specificity', 12, (text) => /\d{4}-\d{2}-\d{2}|이번 주|이번 달|3개월|7일|review window|검증 창/u.test(text)),
  rule('action_plan', 12, (text) => /첫 행동|보류|진행|중단|비교|측정|기록|send|schedule|measure|decide/iu.test(text)),
  rule('uncertainty_boundary', 12, (text, evalCase) => hasUncertaintyBoundary(text, evalCase)),
  rule('scenario_fit', 10, (text, evalCase) => countNeedles(text, evalCase.expected.mustMention) >= 2),
  rule('safety_boundary', 6, (text) => !FORBIDDEN_PATTERNS.some((pattern) => pattern.test(text))),
] as const satisfies readonly DimensionRule[];

export function evaluateIntakeReadiness(value: unknown): IntakeReadiness {
  const missingFields = ['name', 'birthDate', 'question'].filter((field) => !hasNonEmptyString(value, field));
  return { ready: missingFields.length === 0, missingFields };
}

export function scoreCommercialReport(
  report: unknown,
  evalCase: PremiumReportEvalCase,
): CommercialReportScore {
  const text = collectStrings(report).join('\n');
  const dimensionHits = DIMENSION_RULES.filter((item) => item.passes(text, evalCase)).map((item) => item.id);
  const missingDimensions = DIMENSION_RULES.filter((item) => !dimensionHits.includes(item.id)).map((item) => item.id);
  const signalHits = evalCase.expected.requiredSignals.filter((signal) => hasAllSignals(text, [signal]));
  const genericHits = GENERIC_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
  const rawScore = DIMENSION_RULES
    .filter((item) => dimensionHits.includes(item.id))
    .reduce((sum, item) => sum + item.weight, 0) - genericHits.length * 15;
  const score = Math.max(0, Math.min(100, rawScore));
  const failureReasons = [
    ...missingDimensions.map((dimension) => `missing_dimension:${dimension}`),
    ...missingSignals(evalCase, signalHits).map((signal) => `missing_signal:${signal}`),
    ...genericHits.map((hit) => `generic:${hit}`),
  ];

  return {
    score,
    passed: score >= 85 && failureReasons.length === 0,
    dimensionHits,
    missingDimensions,
    signalHits,
    failureReasons,
    genericHits,
  };
}

export function expectedMissingFields(caseItem: InvalidIntakeEvalCase): readonly string[] {
  return caseItem.expectedMissingFields;
}

function rule(
  id: CommercialReportDimension,
  weight: number,
  passes: (text: string, evalCase: PremiumReportEvalCase) => boolean,
): DimensionRule {
  return { id, weight, passes };
}

function hasAllSignals(text: string, signals: readonly ReportSignal[]): boolean {
  return signals.every((signal) => {
    switch (signal) {
      case 'saju_structure':
        return /사주|명리|Saju/iu.test(text) && /구조|패턴|structure|pattern/iu.test(text);
      case 'astrology_timing':
        return /점성|Astrology|transit|달|Moon|상승궁|ascendant/iu.test(text) && /타이밍|시기|window|검증 창/iu.test(text);
      case 'tarot_immediate':
        return /타로|Tarot|카드|card/iu.test(text) && /즉각|현재|바로|immediate|right now/iu.test(text);
      case 'decision_action':
        return /결정|판단|첫 행동|decision|next move|action/iu.test(text);
      case 'uncertainty_boundary':
        return /경계|조건|불확실|낮춥|downgrade|boundary|conditional/iu.test(text);
      case 'source_boundary':
        return /원천|근거|source|KASI|JPL|calculation/iu.test(text);
      default:
        return assertNever(signal);
    }
  });
}

function hasSajuBeforeSecondaryLayers(text: string): boolean {
  const sajuIndex = firstIndex(text, [/사주/u, /명리/u, /Saju/iu]);
  const astrologyIndex = firstIndex(text, [/점성/u, /Astrology/iu, /transit/iu]);
  const tarotIndex = firstIndex(text, [/타로/u, /Tarot/iu]);
  if (sajuIndex === -1) return false;
  const secondaryIndexes = [astrologyIndex, tarotIndex].filter((index) => index >= 0);
  return secondaryIndexes.length === 0 || secondaryIndexes.every((index) => sajuIndex <= index);
}

function hasUncertaintyBoundary(text: string, evalCase: PremiumReportEvalCase): boolean {
  const baseBoundary = /경계|조건|불확실|재검토|downgrade|boundary|conditional/iu.test(text);
  if (!evalCase.unknownTime) return baseBoundary;
  return baseBoundary && /시간\s*미상|unknown birth time|unknown time/iu.test(text);
}

function hasNeedles(text: string, needles: readonly string[]): boolean {
  return needles.every((needle) => normalize(text).includes(normalize(needle)));
}

function countNeedles(text: string, needles: readonly string[]): number {
  return needles.filter((needle) => normalize(text).includes(normalize(needle))).length;
}

function firstIndex(text: string, patterns: readonly RegExp[]): number {
  const indexes = patterns.map((pattern) => text.search(pattern)).filter((index) => index >= 0);
  return indexes.length > 0 ? Math.min(...indexes) : -1;
}

function missingSignals(
  evalCase: PremiumReportEvalCase,
  signalHits: readonly ReportSignal[],
): readonly ReportSignal[] {
  return evalCase.expected.requiredSignals.filter((signal) => !signalHits.includes(signal));
}

function collectStrings(value: unknown): readonly string[] {
  if (typeof value === 'string') return [value.trim()].filter(Boolean);
  if (Array.isArray(value)) return value.flatMap((item) => collectStrings(item));
  if (!isRecord(value)) return [];
  return Object.values(value).flatMap((item) => collectStrings(item));
}

function hasNonEmptyString(value: unknown, field: string): boolean {
  return isRecord(value) && typeof value[field] === 'string' && value[field].trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

function assertNever(value: never): never {
  throw new TypeError(`Unexpected report signal: ${String(value)}`);
}
