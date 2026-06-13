import type { PremiumReportPartial, UserData } from './phase-prompts';
import { commercialToneReasons } from './premium-commercial-tone';
import { buildSourceBoundaryAnchors, sourceBoundaryReasons } from './premium-source-boundaries';

export type GroundingFamily = 'saju' | 'astrology' | 'tarot' | 'sourceBoundary' | 'unknownTimeCaveat';

export type PremiumGroundingAnchor = {
  readonly family: GroundingFamily;
  readonly label: string;
  readonly text: string;
  readonly pattern?: RegExp;
};

export type PremiumGroundingResult = {
  readonly passed: boolean;
  readonly matchedAnchors: readonly PremiumGroundingAnchor[];
  readonly missingAnchors: readonly PremiumGroundingAnchor[];
  readonly reasons: readonly string[];
  readonly totalTextLength: number;
};

type FamilyMinimums = Partial<Record<GroundingFamily, number>>;

const COMMON_PHASE_MINIMUMS = { sourceBoundary: 4, unknownTimeCaveat: 1 } satisfies FamilyMinimums;

const PHASE_FAMILY_MINIMUMS: Record<number, FamilyMinimums> = {
  1: { ...COMMON_PHASE_MINIMUMS, saju: 1, astrology: 1, tarot: 1 },
  2: { ...COMMON_PHASE_MINIMUMS, astrology: 2 },
  3: { ...COMMON_PHASE_MINIMUMS, tarot: 2 },
  4: { ...COMMON_PHASE_MINIMUMS, saju: 3 },
  5: { ...COMMON_PHASE_MINIMUMS, saju: 1 },
  6: { ...COMMON_PHASE_MINIMUMS, saju: 1, astrology: 1 },
  7: { ...COMMON_PHASE_MINIMUMS, saju: 1 },
  8: { ...COMMON_PHASE_MINIMUMS, saju: 1, astrology: 1, tarot: 1 },
};

const PHASE_TOTAL_MINIMUMS: Record<number, number> = {
  1: 3,
  2: 2,
  3: 2,
  4: 3,
  5: 2,
  6: 2,
  7: 2,
  8: 3,
};

const GENERIC_PATTERNS = [
  /trust your intuition/i,
  /everything happens for a reason/i,
  /우주의 흐름/,
  /긍정적인 마음/,
  /좋은 흐름/,
] as const;

export function buildPremiumGroundingAnchors(userData: UserData): readonly PremiumGroundingAnchor[] {
  return [
    ...buildSajuAnchors(userData),
    ...buildAstrologyAnchors(userData),
    ...buildTarotAnchors(userData),
    ...buildUnknownTimeAnchors(userData),
    ...buildSourceBoundaryAnchors(),
  ];
}

export function scorePremiumGrounding(
  value: PremiumReportPartial | unknown,
  userData: UserData,
  phaseNumber?: number
): PremiumGroundingResult {
  const strings = collectStrings(value);
  const joined = strings.join('\n');
  const anchors = buildPremiumGroundingAnchors(userData);
  const matchedAnchors = anchors.filter((anchor) => containsAnchor(joined, anchor));
  const reasons = [
    ...commercialToneReasons(joined),
    ...genericReasons(joined),
    ...sourceBoundaryReasons(joined),
    ...minimumReasons(anchors, matchedAnchors, phaseNumber),
  ];

  return {
    passed: reasons.length === 0,
    matchedAnchors,
    missingAnchors: anchors.filter((anchor) => !matchedAnchors.includes(anchor)),
    reasons,
    totalTextLength: strings.reduce((sum, text) => sum + text.length, 0),
  };
}

export function assertPremiumGrounding(
  phaseNumber: number,
  value: PremiumReportPartial,
  userData: UserData
): void {
  const result = scorePremiumGrounding(value, userData, phaseNumber);
  if (!result.passed) {
    throw new Error(`PREMIUM_QUALITY_GATE_FAILED: ${result.reasons.join('; ')}`);
  }
}

function buildSajuAnchors(userData: UserData): readonly PremiumGroundingAnchor[] {
  const saju = userData.sajuData;
  if (!saju) return [];
  return compactAnchors([
    anchor('saju', 'dayMaster', saju.dayMaster ? `일간 ${saju.dayMaster}` : ''),
    anchor('saju', 'yearPillar', pillarText('연주', saju.yeonPillar)),
    anchor('saju', 'monthPillar', pillarText('월주', saju.monthPillar)),
    anchor('saju', 'dayPillar', pillarText('일주', saju.dayPillar)),
    anchor('saju', 'hourPillar', pillarText('시주', saju.hourPillar)),
  ]);
}

function buildAstrologyAnchors(userData: UserData): readonly PremiumGroundingAnchor[] {
  const astro = userData.astroData;
  if (!astro) return [];
  return compactAnchors([
    anchor('astrology', 'sunSign', astro.sunSign ? `태양 ${astro.sunSign}` : ''),
    anchor('astrology', 'moonSign', astro.moonSign ? `달 ${astro.moonSign}` : ''),
    anchor('astrology', 'ascendant', astro.ascendant ? `상승궁 ${astro.ascendant}` : ''),
  ]);
}

function buildTarotAnchors(userData: UserData): readonly PremiumGroundingAnchor[] {
  return (userData.tarotCards ?? []).map((card) => anchor(
    'tarot',
    card.name,
    `${card.name} ${card.isReversed ? '역방향' : '정방향'}`
  ));
}

function buildUnknownTimeAnchors(userData: UserData): readonly PremiumGroundingAnchor[] {
  if (userData.unknownTime !== true) return [];
  return [anchor('unknownTimeCaveat', 'unknownTime', '시간 미상')];
}

function minimumReasons(
  anchors: readonly PremiumGroundingAnchor[],
  matched: readonly PremiumGroundingAnchor[],
  phaseNumber?: number
): readonly string[] {
  const minimums = phaseNumber ? PHASE_FAMILY_MINIMUMS[phaseNumber] ?? {} : baselineMinimums();
  const reasons = familyMinimumReasons(anchors, matched, minimums);
  const totalMinimum = phaseNumber ? PHASE_TOTAL_MINIMUMS[phaseNumber] ?? 2 : 8;
  return matched.length < totalMinimum
    ? [...reasons, `missing_total_grounding_anchors:${matched.length}/${totalMinimum}`]
    : reasons;
}

function familyMinimumReasons(
  anchors: readonly PremiumGroundingAnchor[],
  matched: readonly PremiumGroundingAnchor[],
  minimums: FamilyMinimums
): readonly string[] {
  return Object.entries(minimums).flatMap(([family, minimum]) => {
    const available = anchors.filter((anchorItem) => anchorItem.family === family).length;
    const required = Math.min(minimum ?? 0, available);
    const count = matched.filter((anchorItem) => anchorItem.family === family).length;
    return count < required ? [`missing_${family}_anchors:${count}/${required}`] : [];
  });
}

function baselineMinimums(): FamilyMinimums {
  return { saju: 3, astrology: 3, tarot: 2, sourceBoundary: 3, unknownTimeCaveat: 1 };
}

function genericReasons(joined: string): readonly string[] {
  return GENERIC_PATTERNS
    .filter((pattern) => pattern.test(joined))
    .map((pattern) => `generic_wording:${pattern.source}`);
}

function collectStrings(value: unknown): readonly string[] {
  if (typeof value === 'string') return [value.trim()].filter(Boolean);
  if (Array.isArray(value)) return value.flatMap((item) => collectStrings(item));
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap((item) => collectStrings(item));
}

function containsAnchor(joined: string, anchorItem: PremiumGroundingAnchor): boolean {
  return anchorItem.pattern?.test(joined) ?? normalizeText(joined).includes(normalizeText(anchorItem.text));
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

function pillarText(label: string, pillar: { readonly stem?: string; readonly branch?: string } | undefined): string {
  return pillar?.stem && pillar.branch ? `${label} ${pillar.stem}${pillar.branch}` : '';
}

function anchor(family: GroundingFamily, label: string, text: string): PremiumGroundingAnchor {
  return { family, label, text };
}

function compactAnchors(values: readonly PremiumGroundingAnchor[]): readonly PremiumGroundingAnchor[] {
  return values.filter((value) => value.text.trim().length > 0);
}
