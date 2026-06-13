import { z } from 'zod';
import type { PremiumReportPartial } from './phase-prompts';
import { premiumDateSafetyReasons } from './premium-date-safety';
import { CONVERGENCE_DIAGNOSIS_LEVELS } from './three-layer-synthesis';

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
const convergenceDiagnosisSchema = z.object({
  level: z.enum(CONVERGENCE_DIAGNOSIS_LEVELS),
  shared_signal: nonEmptyString,
  conflict_note: nonEmptyString,
  decision_rule: nonEmptyString,
  verdict_modifier: nonEmptyString,
}).strict();

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
    convergence_diagnosis: convergenceDiagnosisSchema,
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

const unsafeAdvicePatterns = [
  /(의료\s*진단|투약|약물|처방|수술|치료\s*중단|치료\s*중지|medical\s+diagnosis|stop\s+(?:your\s+)?(?:medication|medicine|treatment)|quit\s+(?:your\s+)?(?:medication|medicine|treatment)|schedule\s+surgery|surgery|medication)/i,
  /(특정\s*주식|주식\s*(?:매수|매도|추천)|코인\s*(?:매수|매도|추천)|암호화폐|레버리지|풀매수|몰빵|specific\s+stock|buy\s+(?:bitcoin|ethereum|crypto|cryptocurrency|stock|stocks?|coin|coins?)|sell\s+(?:bitcoin|ethereum|crypto|cryptocurrency|stock|stocks?|coin|coins?)|bitcoin|ethereum|crypto(?:currency)?|leverage|go\s+all\s+in|all-?in|portfolio\s+allocation|position\s+size|recover\s+investments?)/i,
  /(비자(?:를|을)?\s*(?:신청|연장|갱신|변경|전환|취득|포기)(?:\s*신청)?(?:을|를)?\s*(?:바로\s*|지금\s*)?(?:하세요|하십시오|해라|해야(?:\s*합니다)?)|(?:체류|귀국|출국|입국)(?:을|를)?\s*(?:바로\s*|지금\s*)?(?:하세요|하십시오|해라|해야(?:\s*합니다)?|결정하세요)|(?:서명|소송|고소|서류\s*제출)(?:을|를)?\s*(?:바로\s*|지금\s*)?(?:하세요|하십시오|해라|해야(?:\s*합니다)?)|(?:투자|매수|매도)(?:를|을)?\s*(?:바로\s*|지금\s*)?(?:하세요|하십시오|해라|해야(?:\s*합니다)?)|전문가\s*(?:상담|검토|조언)\s*(?:없이|생략)|변호사\s*(?:없이|생략))/i,
  /((?:비자|체류|영주권|워크\s*퍼밋|스폰서십|LMIA|PNP|AOR|서류|신청서)[^.\n]{0,60}(?:접수|제출|신청|연장|갱신|변경|전환|취득)[^.\n]{0,30}(?:해야|해야만|하십시오|하세요|하라|진행|완료|개시|접수해야))/i,
  /((?:귀국|한국\s*복귀|출국|입국|체류)[^.\n]{0,60}(?:준비|전환|확정|결정|실행|개시|예매|예약)[^.\n]{0,30}(?:하세요|하십시오|하라|해야|해야만|할\s*것|하는\s*것|전환|확정|개시))/i,
  /((?:비행기\s*표|항공권|티켓)[^.\n]{0,30}(?:예매|구매|예약|발권)[^.\n]{0,30}(?:하세요|하십시오|하라|해야|할\s*것|개시))/i,
  /((?:apply\s+for|extend|renew|change)\s+(?:your\s+|a\s+)?(?:visa|status|work\s+permit|study\s+permit|permit|permanent\s+residence|PR)\b|(?:stay|remain)\s+in\s+(?:Canada|Korea|the\s+US|the\s+UK|the\s+United\s+States|the\s+United\s+Kingdom)\b|return\s+to\s+(?:Canada|Korea|the\s+US|the\s+UK|the\s+United\s+States|the\s+United\s+Kingdom|your\s+country|home)\b|invest\s+in\s+(?!yourself|skills|training|education|relationships|health|rest|routine)(?:[A-Z][A-Za-z0-9&.-]+|[A-Z]{2,5}\b|bitcoin|ethereum|crypto|stocks?)|(?:sign|sue|file)\s+(?:the\s+)?(?:contract|lawsuit|claim|papers?|application)|without\s+(?:a\s+)?(?:lawyer|qualified\s+professional|immigration\s+consultant|legal\s+advice|professional\s+advice)|skip\s+qualified\s+advice)/i,
] as const;

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

  if (unsafeAdvicePatterns.some((pattern) => pattern.test(serialized))) {
    throw new PremiumPhaseValidationError(
      phaseNumber,
      'Forbidden medical, legal, immigration, or financial instruction marker found.'
    );
  }
}

function assertNoPastDates(phaseNumber: number, serialized: string, currentDate: string): void {
  const reason = premiumDateSafetyReasons(serialized, currentDate)[0];
  if (reason) throw new PremiumPhaseValidationError(phaseNumber, reason);
}
