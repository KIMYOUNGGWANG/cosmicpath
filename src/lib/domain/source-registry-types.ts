export const SOURCE_DOMAINS = [
  'calendar_astronomy',
  'western_astrology',
  'myeongli_saju',
  'tarot',
  'product_safety',
  'cross_domain',
] as const;

export type SourceDomain = (typeof SOURCE_DOMAINS)[number];

export type SourceRegistryRecord = {
  readonly sourceId: string;
  readonly domain: SourceDomain;
  readonly sourceRole: string;
  readonly promotionState: string;
  readonly sourceStatus: string;
  readonly licenseStatus: string;
  readonly runtimeUse: string;
  readonly rightsRuntimeUseStates: readonly string[];
  readonly allowedSurfaces: readonly string[];
  readonly forbiddenSurfaces: readonly string[];
  readonly allowedClaimFamilies: readonly string[];
  readonly forbiddenClaimFamilies: readonly string[];
  readonly requiredCaveats: readonly string[];
  readonly sourceUrlOrLocator: string;
  readonly captureStatus: string;
  readonly reviewStatus: string;
  readonly knownBadFixtureIds: readonly string[];
};

type SourceArgs = Omit<SourceRegistryRecord, 'requiredCaveats'> & {
  readonly caveat: string;
};

export const REPORT_SURFACES = ['prompt_grounding', 'customer_report_text', 'paid_pdf_text'] as const;
export const OUTPUT_SURFACES = ['paid_pdf_visual', 'server_runtime'] as const;
export const FIXTURE_SURFACES = ['fixture_verifier', 'source_provenance_appendix'] as const;
export const INTERNAL_SURFACES = ['internal_research', 'source_provenance_appendix'] as const;
export const PRODUCT_OUTPUT_SURFACES = [...REPORT_SURFACES, ...OUTPUT_SURFACES] as const;

export const CALCULATION_CLAIMS = [
  'solar_lunar_conversion',
  'julian_gregorian_policy',
  'korean_calendar_almanac',
  'solar_term_fixture',
] as const;
export const EPHEMERIS_CLAIMS = ['planetary_longitude_fixture', 'moon_position_fixture', 'house_ascendant_fixture'] as const;
export const MYEONGLI_CLAIMS = [
  'yin_yang_five_phases',
  'stems_branches',
  'hidden_stems',
  'ten_gods',
  'twelve_growth_stages',
  'branch_interactions',
  'gyeokguk',
  'yongsin_body_strength',
  'yongsin_month_command',
  'yongsin_tiaohou',
  'daeun_sewoon_policy',
  'korean_applied_wording',
] as const;
export const ASTROLOGY_CLAIMS = [
  'classical_planet_sign_doctrine',
  'classical_house_topic_doctrine',
  'traditional_dignity_doctrine',
  'modern_outer_planet_doctrine',
  'modern_psychological_astrology',
] as const;
export const TAROT_CLAIMS = [
  'rws_major_arcana_meaning',
  'rws_minor_arcana_meaning',
  'rws_reversed_meaning',
  'rws_spread_position_semantics',
  'tarot_image_provenance',
] as const;
export const SAFETY_CLAIMS = [
  'health_safety_boundary',
  'finance_safety_boundary',
  'legal_safety_boundary',
  'relationship_safety_boundary',
  'career_safety_boundary',
  'timing_safety_boundary',
  'danger_safety_boundary',
] as const;
export const PRODUCT_CONTRACT_CLAIMS = ['provider_recovery_provenance', 'report_grounding_contract'] as const;
export const DOCTRINE_CLAIMS = [...MYEONGLI_CLAIMS, ...ASTROLOGY_CLAIMS, ...TAROT_CLAIMS] as const;
export const REPORT_AUTHORITY_CLAIMS = [...DOCTRINE_CLAIMS, ...SAFETY_CLAIMS, ...PRODUCT_CONTRACT_CLAIMS] as const;

export function source(args: SourceArgs): SourceRegistryRecord {
  return { ...args, requiredCaveats: [args.caveat] };
}
