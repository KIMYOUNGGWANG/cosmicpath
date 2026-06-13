type CommercialToneRule = {
  readonly label: string;
  readonly pattern: RegExp;
};

const COMMERCIAL_TONE_RULES = [
  { label: 'deterministic_final_verdict', pattern: /운명의\s*최종\s*판결|final\s+fate\s+verdict/iu },
  { label: 'destiny_turning_point', pattern: /운명의\s*터닝\s*포인트|turning\s+point\s*\(D-?Day\)|\bD-?Day\b/iu },
  { label: 'cosmic_guarantee', pattern: /우주가\s*문을\s*열어주는\s*날|the\s+universe\s+(?:opens|will\s+open|is\s+opening)\s+(?:the\s+)?door/iu },
  { label: 'absolute_stop_day', pattern: /절대\s*멈춰야\s*할\s*날|absolute\s+(?:stop|avoidance)\s+day/iu },
  { label: 'financial_harvest_promise', pattern: /수확의\s*날|financial\s+harvest\s+day/iu },
  { label: 'fatal_charm', pattern: /치명적\s*매력|fatal\s+charm/iu },
  { label: 'fated_attraction', pattern: /운명적\s*이끌림|fated\s+attraction/iu },
  { label: 'literal_past_life_theme', pattern: /전생\s*(?:분석|테마|의\s*테마|원형)|past\s+life\s+(?:theme|themes|archetype|analysis)/iu },
  { label: 'karmic_certainty', pattern: /해소해야\s*할\s*카르마|카르마가\s*.*확정|karma\s+to\s+resolve|karmic\s+patterns/iu },
  { label: 'soul_mission_certainty', pattern: /영혼\s*미션|soul\s+mission/iu },
] as const satisfies readonly CommercialToneRule[];

export function commercialToneReasons(text: string): readonly string[] {
  return COMMERCIAL_TONE_RULES
    .filter((rule) => rule.pattern.test(text))
    .map((rule) => `commercial_tone:${rule.label}`);
}
