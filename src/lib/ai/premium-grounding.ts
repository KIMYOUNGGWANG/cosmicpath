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

const STEM_DATA_BY_KO: Record<string, { en: string; hanja: string; element: string }> = {
  갑: { en: 'Jia', hanja: '甲', element: 'Wood' },
  을: { en: 'Yi', hanja: '乙', element: 'Wood' },
  병: { en: 'Bing', hanja: '丙', element: 'Fire' },
  정: { en: 'Ding', hanja: '丁', element: 'Fire' },
  무: { en: 'Wu', hanja: '戊', element: 'Earth' },
  기: { en: 'Ji', hanja: '己', element: 'Earth' },
  경: { en: 'Geng', hanja: '庚', element: 'Metal' },
  신: { en: 'Xin', hanja: '辛', element: 'Metal' },
  임: { en: 'Ren', hanja: '壬', element: 'Water' },
  계: { en: 'Gui', hanja: '癸', element: 'Water' },
};

const BRANCH_DATA_BY_KO: Record<string, { en: string; hanja: string; animal: string }> = {
  자: { en: 'Zi', hanja: '子', animal: 'Rat' },
  축: { en: 'Chou', hanja: '丑', animal: 'Ox' },
  인: { en: 'Yin', hanja: '寅', animal: 'Tiger' },
  묘: { en: 'Mao', hanja: '卯', animal: 'Rabbit' },
  진: { en: 'Chen', hanja: '辰', animal: 'Dragon' },
  사: { en: 'Si', hanja: '巳', animal: 'Snake' },
  오: { en: 'Wu', hanja: '午', animal: 'Horse' },
  미: { en: 'Wei', hanja: '未', animal: 'Goat' },
  신: { en: 'Shen', hanja: '申', animal: 'Monkey' },
  유: { en: 'You', hanja: '酉', animal: 'Rooster' },
  술: { en: 'Xu', hanja: '戌', animal: 'Dog' },
  해: { en: 'Hai', hanja: '亥', animal: 'Pig' },
};

const ZODIAC_KO_TO_EN: Record<string, string> = {
  양자리: 'Aries',
  황소자리: 'Taurus',
  쌍둥이자리: 'Gemini',
  게자리: 'Cancer',
  사자자리: 'Leo',
  처녀자리: 'Virgo',
  천칭자리: 'Libra',
  전갈자리: 'Scorpio',
  궁수자리: 'Sagittarius',
  사수자리: 'Sagittarius',
  염소자리: 'Capricorn',
  물병자리: 'Aquarius',
  물고기자리: 'Pisces',
};

const ZODIAC_EN_TO_KO: Record<string, string> = {
  Aries: '양자리',
  Taurus: '황소자리',
  Gemini: '쌍둥이자리',
  Cancer: '게자리',
  Leo: '사자자리',
  Virgo: '처녀자리',
  Libra: '천칭자리',
  Scorpio: '전갈자리',
  Sagittarius: '궁수자리',
  Capricorn: '염소자리',
  Aquarius: '물병자리',
  Pisces: '물고기자리',
};

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSajuAnchors(userData: UserData): readonly PremiumGroundingAnchor[] {
  const saju = userData.sajuData;
  if (!saju) return [];
  const isEn = userData.language === 'en';

  return compactAnchors([
    buildDayMasterAnchor(saju.dayMaster, isEn),
    buildPillarAnchor('yearPillar', '연주', 'Year Pillar', saju.yeonPillar, isEn),
    buildPillarAnchor('monthPillar', '월주', 'Month Pillar', saju.monthPillar, isEn),
    buildPillarAnchor('dayPillar', '일주', 'Day Pillar', saju.dayPillar, isEn),
    buildPillarAnchor('hourPillar', '시주', 'Hour Pillar', saju.hourPillar, isEn),
  ]);
}

function buildDayMasterAnchor(dayMaster: string | undefined, isEn: boolean): PremiumGroundingAnchor | null {
  if (!dayMaster) return null;
  const meta = STEM_DATA_BY_KO[dayMaster];
  const stemEn = meta?.en ?? '';
  const hanja = meta?.hanja ?? '';
  const element = meta?.element ?? '';

  const pattern = new RegExp(
    `(?:일간\\s*${escapeRegex(dayMaster)}|(?:day\\s*master)[^.\\n]*(?:${escapeRegex(dayMaster)}|${hanja}|${stemEn}|${element})|(?:${escapeRegex(dayMaster)}|${hanja}|${stemEn})\\s*(?:${element}\\s*)?(?:day\\s*master))`,
    'iu'
  );

  const text = isEn && stemEn
    ? `Day Master ${stemEn}${element ? ` (${element})` : ''} [${dayMaster}]`
    : `일간 ${dayMaster}`;

  return anchor('saju', 'dayMaster', text, pattern);
}

function buildPillarAnchor(
  label: string,
  koreanPillarName: string,
  englishPillarName: string,
  pillar: { readonly stem?: string; readonly branch?: string } | undefined,
  isEn: boolean
): PremiumGroundingAnchor | null {
  if (!pillar?.stem || !pillar?.branch) return null;
  const s = pillar.stem;
  const b = pillar.branch;
  const sMeta = STEM_DATA_BY_KO[s];
  const bMeta = BRANCH_DATA_BY_KO[b];
  const sEn = sMeta?.en ?? '';
  const bEn = bMeta?.en ?? '';
  const sHanja = sMeta?.hanja ?? '';
  const bHanja = bMeta?.hanja ?? '';

  const pattern = new RegExp(
    `(?:${koreanPillarName}\\s*(?:${s}${b}|${sHanja}${bHanja})|(?:${englishPillarName}|four\\s*pillars?)[^.\\n]*(?:${s}${b}|${sHanja}${bHanja}|${sEn}[\\s-]*${bEn}))`,
    'iu'
  );

  const text = isEn && sEn && bEn
    ? `${englishPillarName} ${sEn}-${bEn} (${s}${b})`
    : `${koreanPillarName} ${s}${b}`;

  return anchor('saju', label, text, pattern);
}

function buildAstrologyAnchors(userData: UserData): readonly PremiumGroundingAnchor[] {
  const astro = userData.astroData;
  if (!astro) return [];
  const isEn = userData.language === 'en';

  return compactAnchors([
    buildAstroSignAnchor('sunSign', '태양', 'Sun', astro.sunSign, isEn),
    buildAstroSignAnchor('moonSign', '달', 'Moon', astro.moonSign, isEn),
    buildAstroSignAnchor('ascendant', '상승궁', 'Ascendant', astro.ascendant, isEn),
  ]);
}

function buildAstroSignAnchor(
  label: 'sunSign' | 'moonSign' | 'ascendant',
  koreanPrefix: string,
  englishLabel: string,
  rawSign: string | undefined,
  isEn: boolean
): PremiumGroundingAnchor | null {
  if (!rawSign) return null;
  const koreanSign = ZODIAC_EN_TO_KO[rawSign] ?? rawSign;
  const englishSign = ZODIAC_KO_TO_EN[rawSign] ?? rawSign;

  const labelPrefix = label === 'ascendant' ? '(?:ascendant|rising)' : englishLabel.toLowerCase();
  const pattern = new RegExp(
    `(?:${koreanPrefix}\\s*${escapeRegex(koreanSign)}|(?:${labelPrefix})[^.\\n]*(?:${escapeRegex(englishSign)}|${escapeRegex(koreanSign)})|(?:${escapeRegex(englishSign)}|${escapeRegex(koreanSign)})\\s*${labelPrefix})`,
    'iu'
  );

  const text = isEn
    ? `${englishLabel} in ${englishSign}`
    : `${koreanPrefix} ${koreanSign}`;

  return anchor('astrology', label, text, pattern);
}

function buildTarotAnchors(userData: UserData): readonly PremiumGroundingAnchor[] {
  const isEn = userData.language === 'en';
  return compactAnchors(
    (userData.tarotCards as Array<{ name?: string; isReversed?: boolean }> ?? []).map((card) =>
      buildTarotAnchor(card, isEn)
    )
  );
}

function buildTarotAnchor(
  card: { name?: string; isReversed?: boolean },
  isEn: boolean
): PremiumGroundingAnchor | null {
  const cardName = card.name?.trim();
  if (!cardName) return null;
  const isReversed = Boolean(card.isReversed);

  const directionKo = isReversed ? '역방향' : '정방향';
  const directionEn = isReversed ? 'reversed' : 'upright';
  const escaped = escapeRegex(cardName);

  const pattern = new RegExp(
    `(?:${escaped}[^.\\n]*(?:${directionKo}|${directionEn})|(?:${directionKo}|${directionEn})[^.\\n]*${escaped})`,
    'iu'
  );

  const text = isEn
    ? `${cardName} ${isReversed ? 'Reversed' : 'Upright'}`
    : `${cardName} ${directionKo}`;

  return anchor('tarot', cardName, text, pattern);
}

function buildUnknownTimeAnchors(userData: UserData): readonly PremiumGroundingAnchor[] {
  if (userData.unknownTime !== true) return [];
  const isEn = userData.language === 'en';
  return [
    anchor(
      'unknownTimeCaveat',
      'unknownTime',
      isEn ? 'Birth time unknown' : '시간 미상',
      /시간\s*미상|unknown\s*time|time\s*unknown|birth\s*time\s*(?:is\s*)?unknown/iu
    ),
  ];
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

function anchor(family: GroundingFamily, label: string, text: string, pattern?: RegExp): PremiumGroundingAnchor {
  return pattern ? { family, label, text, pattern } : { family, label, text };
}

function compactAnchors(values: readonly (PremiumGroundingAnchor | null)[]): readonly PremiumGroundingAnchor[] {
  return values.filter((value): value is PremiumGroundingAnchor => Boolean(value && value.text.trim().length > 0));
}
