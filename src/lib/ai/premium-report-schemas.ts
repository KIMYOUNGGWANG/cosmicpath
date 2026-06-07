import { z } from 'zod';
import type { PremiumReportPartial } from './phase-prompts';

export type PremiumPhaseParseOptions = {
  readonly currentDate?: string;
};

export class PremiumPhaseValidationError extends Error {
  readonly phaseNumber: number;

  constructor(phaseNumber: number, message: string) {
    super(`Phase ${phaseNumber} schema validation failed: ${message}`);
    this.name = 'PremiumPhaseValidationError';
    this.phaseNumber = phaseNumber;
  }
}

const scoreSchema = z.number().min(0).max(100);
const nonEmptyString = z.string().trim().min(1);
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format');
const titledContentSchema = z.object({ title: nonEmptyString, content: nonEmptyString }).strict();

const areaSchema = z.object({
  title: nonEmptyString,
  tag: nonEmptyString.optional(),
  subsections: z.array(nonEmptyString).optional(),
  content: nonEmptyString,
}).strict();

export const PremiumPhase1Schema = z.object({
  summary: z.object({
    title: nonEmptyString,
    content: nonEmptyString,
    trust_score: z.number().min(1).max(5),
    trust_reason: nonEmptyString,
  }).strict(),
  traits: z.array(z.object({
    type: nonEmptyString,
    name: nonEmptyString,
    description: nonEmptyString,
    grade: nonEmptyString,
  }).strict()).min(1),
  core_analysis: z.object({
    lacking_elements: z.object({
      elements: nonEmptyString,
      remedy: nonEmptyString,
      description: nonEmptyString,
    }).strict(),
    abundant_elements: z.object({
      elements: nonEmptyString,
      usage: nonEmptyString.optional(),
      description: nonEmptyString,
    }).strict(),
    element_scores: z.object({
      wood: scoreSchema,
      fire: scoreSchema,
      earth: scoreSchema,
      metal: scoreSchema,
      water: scoreSchema,
    }).strict().optional(),
  }).strict(),
}).strict();

export const PremiumPhase2Schema = z.object({
  astro_deep: z.object({
    sun_moon_dynamic: titledContentSchema,
    ascendant_influence: titledContentSchema.optional(),
    dominant_element: titledContentSchema.optional(),
    planetary_warning: titledContentSchema.optional(),
  }).strict(),
}).strict();

export const PremiumPhase3Schema = z.object({
  tarot_details: z.array(z.object({
    position: nonEmptyString,
    card_name: nonEmptyString,
    is_reversed: z.boolean().optional(),
    keywords: z.array(nonEmptyString).optional(),
    interpretation: nonEmptyString,
    saju_connection: nonEmptyString.optional(),
    advice: nonEmptyString.optional(),
  }).strict()).min(1),
  numerology: z.object({
    life_path: z.object({
      number: z.number().int().min(1).max(9),
      title: nonEmptyString,
      meaning: nonEmptyString,
      saju_connection: nonEmptyString,
    }).strict(),
    lucky_numbers: z.array(z.number().int()).min(1),
    lucky_day_advice: nonEmptyString,
  }).strict(),
}).strict();

export const PremiumPhase4Schema = z.object({
  saju_sections: z.array(z.object({
    id: nonEmptyString,
    title: nonEmptyString,
    content: nonEmptyString,
  }).strict()).min(1),
}).strict();

export const PremiumPhase5Schema = z.object({
  fortune_flow: z.object({
    major_luck: titledContentSchema.extend({ period: nonEmptyString.optional() }).strict(),
    yearly_luck: titledContentSchema,
    monthly_luck: z.array(z.object({
      month: nonEmptyString,
      theme: nonEmptyString,
      element: nonEmptyString.optional(),
      opportunity: nonEmptyString.optional(),
      warning: nonEmptyString.optional(),
      advice: nonEmptyString,
      score: scoreSchema.optional(),
    }).strict()).optional(),
    timeline_scores: z.array(z.object({
      year: z.number().int(),
      score: scoreSchema,
      type: z.enum(['opportunity', 'neutral', 'warning']),
      summary: nonEmptyString,
    }).strict()).optional(),
  }).strict(),
}).strict();

export const PremiumPhase6Schema = z.object({
  life_areas: z.object({
    career: areaSchema.optional(),
    wealth: areaSchema.optional(),
    love: areaSchema.optional(),
    health: areaSchema.optional(),
    soulmate: z.record(z.string(), z.unknown()).optional(),
    compatibility: z.object({
      boss: z.object({ ideal_type: nonEmptyString, avoid_type: nonEmptyString, strategy: nonEmptyString }).strict(),
      colleague: z.object({ ideal_type: nonEmptyString, avoid_type: nonEmptyString, strategy: nonEmptyString }).strict(),
      friend: z.object({ ideal_type: nonEmptyString, avoid_type: nonEmptyString, advice: nonEmptyString }).strict(),
    }).strict().optional(),
  }).strict(),
}).strict();

export const PremiumPhase7Schema = z.object({
  special_analysis: z.object({
    noble_person: titledContentSchema.optional(),
    charm: titledContentSchema.optional(),
    conflicts: titledContentSchema.optional(),
  }).strict(),
  lucky_assets: z.object({
    colors: z.array(z.object({ name: nonEmptyString, hex: nonEmptyString, reason: nonEmptyString }).strict()).optional(),
    foods: z.array(z.object({ name: nonEmptyString, emoji: nonEmptyString.optional(), benefit: nonEmptyString }).strict()).optional(),
    places: z.array(z.object({ name: nonEmptyString, description: nonEmptyString }).strict()).optional(),
  }).strict(),
  action_plan: z.array(z.object({
    date: isoDateSchema,
    title: nonEmptyString,
    description: nonEmptyString,
    type: nonEmptyString,
  }).strict()).min(1),
  date_selection: z.object({
    auspicious: z.array(z.object({ date: isoDateSchema, purpose: nonEmptyString, reason: nonEmptyString }).strict()).optional(),
    inauspicious: z.array(z.object({ date: isoDateSchema, purpose: nonEmptyString, reason: nonEmptyString }).strict()).optional(),
  }).strict(),
}).strict();

export const PremiumPhase8Schema = z.object({
  past_life: z.object({
    theme: titledContentSchema,
    sun_moon_dynamic: titledContentSchema.optional(),
    ascendant_influence: titledContentSchema.optional(),
    karma: titledContentSchema,
    soul_mission: titledContentSchema,
  }).strict(),
  glossary: z.array(z.object({
    term: nonEmptyString,
    hanja: nonEmptyString,
    definition: nonEmptyString,
    context: nonEmptyString,
  }).strict()).min(1),
  final_verdict: z.object({
    title: nonEmptyString,
    core_message: nonEmptyString,
    saju_foundation: nonEmptyString,
    astro_support: nonEmptyString,
    tarot_insight: nonEmptyString,
    action_priorities: z.array(nonEmptyString).min(1),
    closing_words: nonEmptyString,
    convergence_diagnosis: z.object({
      level: z.enum(['all_aligned', 'two_aligned', 'divergent']),
      verdict_modifier: nonEmptyString,
    }).strict().optional(),
    behavioral_verdict: nonEmptyString.optional(),
  }).strict(),
}).strict();

const PremiumPhaseSchemas: Readonly<Record<number, z.ZodType<PremiumReportPartial>>> = {
  1: PremiumPhase1Schema,
  2: PremiumPhase2Schema,
  3: PremiumPhase3Schema,
  4: PremiumPhase4Schema,
  5: PremiumPhase5Schema,
  6: PremiumPhase6Schema,
  7: PremiumPhase7Schema,
  8: PremiumPhase8Schema,
};

const isoDateLikePattern = /\b(\d{4}-\d{2}(?:-\d{2})?)\b/g;
const koreanYearMonthPattern = /(\d{4})년\s*(0?[1-9]|1[0-2])월/g;
const koreanMonthOnlyPattern = /(?:^|[^\d])((?:0?[1-9])|(?:1[0-2]))월/g;
const englishMonthYearPattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/g;
const englishYearMonthPattern = /\b(\d{4})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/g;
const englishMonthOnlyPattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g;
const unsafeAdvicePattern = /(의료\s*진단|투약|약물|처방|수술|치료\s*중단|치료\s*중지|특정\s*주식|주식\s*(?:매수|매도|추천)|코인\s*(?:매수|매도|추천)|암호화폐|레버리지|풀매수|몰빵|medical\s+diagnosis|stop\s+(?:your\s+)?(?:medication|medicine|treatment)|quit\s+(?:your\s+)?(?:medication|medicine|treatment)|schedule\s+surgery|surgery|medication|specific\s+stock|buy\s+(?:bitcoin|ethereum|crypto|cryptocurrency|stock|stocks?|coin|coins?)|sell\s+(?:bitcoin|ethereum|crypto|cryptocurrency|stock|stocks?|coin|coins?)|bitcoin|ethereum|crypto(?:currency)?|leverage|go\s+all\s+in|all-?in|portfolio\s+allocation|position\s+size|recover\s+investments?)/i;

export function getPremiumPhaseSchema(phaseNumber: number): z.ZodType<PremiumReportPartial> {
  const schema = PremiumPhaseSchemas[phaseNumber];
  if (!schema) {
    throw new PremiumPhaseValidationError(phaseNumber, 'Invalid premium phase number. Expected 1-8.');
  }
  return schema;
}

export function parsePremiumPhaseResult(
  phaseNumber: number,
  value: unknown,
  options: PremiumPhaseParseOptions = {}
): PremiumReportPartial {
  const schema = getPremiumPhaseSchema(phaseNumber);
  const parsed = schema.parse(value);
  enforcePhaseSafety(phaseNumber, parsed, options);
  return parsed;
}

function enforcePhaseSafety(
  phaseNumber: number,
  value: unknown,
  options: PremiumPhaseParseOptions
): void {
  const serialized = JSON.stringify(value);

  if (options.currentDate) {
    assertNoPastDates(phaseNumber, serialized, options.currentDate);
  }

  if (unsafeAdvicePattern.test(serialized)) {
    throw new PremiumPhaseValidationError(phaseNumber, 'Forbidden medical or financial instruction marker found.');
  }
}

function assertNoPastDates(phaseNumber: number, serialized: string, currentDate: string): void {
  const currentMonth = currentDate.slice(0, 7);
  for (const match of serialized.matchAll(isoDateLikePattern)) {
    const candidate = match[1];
    const isFullDate = candidate.length === 10;
    const boundary = isFullDate ? currentDate : currentMonth;
    if (candidate < boundary) {
      const label = isFullDate ? 'past date' : 'past month';
      throw new PremiumPhaseValidationError(phaseNumber, `${label} is before currentDate.`);
    }
  }

  for (const match of serialized.matchAll(koreanYearMonthPattern)) {
    const candidate = `${match[1]}-${match[2].padStart(2, '0')}`;
    if (candidate < currentMonth) {
      throw new PremiumPhaseValidationError(phaseNumber, 'past month is before currentDate.');
    }
  }

  const withoutKoreanYearMonths = serialized.replace(koreanYearMonthPattern, '');
  for (const match of withoutKoreanYearMonths.matchAll(koreanMonthOnlyPattern)) {
    const candidate = `${currentDate.slice(0, 4)}-${match[1].padStart(2, '0')}`;
    if (candidate < currentMonth) {
      throw new PremiumPhaseValidationError(phaseNumber, 'past month is before currentDate.');
    }
  }

  let withoutEnglishYearMonths = serialized;
  for (const match of serialized.matchAll(englishMonthYearPattern)) {
    const candidate = `${match[2]}-${englishMonthToNumber(match[1])}`;
    if (candidate < currentMonth) {
      throw new PremiumPhaseValidationError(phaseNumber, 'past month is before currentDate.');
    }
  }
  withoutEnglishYearMonths = withoutEnglishYearMonths.replace(englishMonthYearPattern, '');

  for (const match of serialized.matchAll(englishYearMonthPattern)) {
    const candidate = `${match[1]}-${englishMonthToNumber(match[2])}`;
    if (candidate < currentMonth) {
      throw new PremiumPhaseValidationError(phaseNumber, 'past month is before currentDate.');
    }
  }
  withoutEnglishYearMonths = withoutEnglishYearMonths.replace(englishYearMonthPattern, '');

  for (const match of withoutEnglishYearMonths.matchAll(englishMonthOnlyPattern)) {
    const candidate = `${currentDate.slice(0, 4)}-${englishMonthToNumber(match[1])}`;
    if (candidate < currentMonth) {
      throw new PremiumPhaseValidationError(phaseNumber, 'past month is before currentDate.');
    }
  }
}

function englishMonthToNumber(month: string): string {
  const monthNumbers: Record<string, string> = {
    January: '01',
    February: '02',
    March: '03',
    April: '04',
    May: '05',
    June: '06',
    July: '07',
    August: '08',
    September: '09',
    October: '10',
    November: '11',
    December: '12',
  };

  const result = monthNumbers[month];
  if (!result) {
    throw new Error(`Unsupported English month name: ${month}`);
  }
  return result;
}
