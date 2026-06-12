import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { SOURCE_REGISTRY } from '../src/lib/domain/source-registry.ts';

const SUPPORTED_SCENARIOS = ['happy', 'rejects-kasi-doctrine', 'license-policy', 'all'] as const;
type Scenario = (typeof SUPPORTED_SCENARIOS)[number];

const REQUIRED_SOURCE_IDS = [
  'kasi_lunisolar_conversion',
  'kasi_open_api',
  'kasi_almanac',
  'jpl_horizons',
  'jpl_horizons_api',
  'swiss_ephemeris',
  'ptolemy_tetrabiblos_public_text',
  'waite_pictorial_key_public_text',
  'rws_tarot_baseline',
  'rws_card_images_commons_candidate',
  'yuanhai_ziping_wikisource_candidate',
  'sanming_tonghui_wikisource_candidate',
  'ditian_sui_wikisource_candidate',
  'ziping_zhenquan_candidate',
  'qiong_tong_bao_jian_candidate',
  'riss_korean_academic_search',
  'kci_korean_journal_search',
  'nlk_catalog_search',
  'oak_repository_search',
  'cosmicpath_divination_safety_policy',
  'cosmicpath_report_grounding_contract',
] as const;

const DOCTRINE_CLAIM_FAMILIES = [
  'ten_gods',
  'hidden_stems',
  'gyeokguk',
  'yongsin_body_strength',
  'yongsin_month_command',
  'yongsin_tiaohou',
  'korean_applied_wording',
  'modern_psychological_astrology',
  'rws_major_arcana_meaning',
] as const;

const REPORT_SURFACES = ['prompt_grounding', 'customer_report_text', 'paid_pdf_text'] as const;

type RegistryRecord = {
  readonly sourceId: string;
  readonly domain: string;
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

type UseRequest = {
  readonly sourceId: string;
  readonly claimFamily: string;
  readonly surface: string;
  readonly includesRawSourceText?: boolean;
};

class UnsupportedScenarioError extends Error {
  constructor(scenario: string) {
    super(`Unsupported source registry scenario: ${scenario}`);
    this.name = 'UnsupportedScenarioError';
  }
}

function parseScenario(argv: readonly string[]): Scenario {
  const scenarioFlagIndex = argv.findIndex((value) => value === '--scenario');
  const scenario = scenarioFlagIndex === -1 ? 'all' : argv[scenarioFlagIndex + 1];
  if (!scenario || !isScenario(scenario)) throw new UnsupportedScenarioError(scenario ?? '<missing>');
  return scenario;
}

function isScenario(value: string): value is Scenario {
  return SUPPORTED_SCENARIOS.some((scenario) => scenario === value);
}

function registryRecords(): readonly RegistryRecord[] {
  return SOURCE_REGISTRY;
}

function assertRegistryShape(): void {
  const records = registryRecords();
  const ids = new Set<string>();
  assert.ok(records.length >= REQUIRED_SOURCE_IDS.length, `too_few_sources:${records.length}`);

  for (const record of records) {
    assertUsefulString(record.sourceId, 'sourceId');
    assert.equal(ids.has(record.sourceId), false, `duplicate_source_id:${record.sourceId}`);
    ids.add(record.sourceId);
    assertUsefulString(record.domain, `${record.sourceId}.domain`);
    assertUsefulString(record.sourceRole, `${record.sourceId}.sourceRole`);
    assertUsefulString(record.promotionState, `${record.sourceId}.promotionState`);
    assertUsefulString(record.sourceStatus, `${record.sourceId}.sourceStatus`);
    assertUsefulString(record.licenseStatus, `${record.sourceId}.licenseStatus`);
    assertUsefulString(record.runtimeUse, `${record.sourceId}.runtimeUse`);
    assertUsefulString(record.sourceUrlOrLocator, `${record.sourceId}.sourceUrlOrLocator`);
    assertUsefulString(record.captureStatus, `${record.sourceId}.captureStatus`);
    assertUsefulString(record.reviewStatus, `${record.sourceId}.reviewStatus`);
    assertNonEmpty(record.rightsRuntimeUseStates, `${record.sourceId}.rightsRuntimeUseStates`);
    assertNonEmpty(record.allowedSurfaces, `${record.sourceId}.allowedSurfaces`);
    assertNonEmpty(record.forbiddenSurfaces, `${record.sourceId}.forbiddenSurfaces`);
    assertNonEmpty(record.forbiddenClaimFamilies, `${record.sourceId}.forbiddenClaimFamilies`);
    assertNonEmpty(record.requiredCaveats, `${record.sourceId}.requiredCaveats`);
    assertNonEmpty(record.knownBadFixtureIds, `${record.sourceId}.knownBadFixtureIds`);
  }

  for (const sourceId of REQUIRED_SOURCE_IDS) {
    assert.equal(ids.has(sourceId), true, `missing_required_source:${sourceId}`);
  }
}

function assertHappyBoundaries(): void {
  assertRegistryShape();
  assertDocsContract();
  for (const record of registryRecords()) {
    assertNotAllowedAndForbiddenOverlap(record);
    assertRuntimeUseMatchesSurface(record);
  }
  console.log('domain_source_registry_shape_contract');
  console.log('domain_source_registry_boundary_contract');
}

function assertDocsContract(): void {
  const docText = readFileSync('docs/domain/source-registry.md', 'utf8');
  assert.match(docText, /KASI.*calculation/su);
  assert.match(docText, /Raw copyrighted source text must not enter prompt grounding/u);
  assert.match(docText, /customer prose.*paid-PDF visuals/su);
}

function assertKasiDoctrineRejected(): void {
  const fixtures = [
    { sourceId: 'kasi_lunisolar_conversion', claimFamily: 'ten_gods', surface: 'customer_report_text' },
    { sourceId: 'kasi_open_api', claimFamily: 'yongsin_body_strength', surface: 'prompt_grounding' },
    { sourceId: 'kasi_almanac', claimFamily: 'gyeokguk', surface: 'paid_pdf_text' },
    { sourceId: 'kasi_lunisolar_conversion', claimFamily: 'relationship_safety_boundary', surface: 'customer_report_text' },
  ] as const satisfies readonly UseRequest[];

  for (const fixture of fixtures) {
    assertRejected(fixture, 'calendar_source_not_doctrine');
  }
  console.log('domain_source_registry_kasi_doctrine_rejected');
}

function assertLicensePolicyRejected(): void {
  const fixtures = [
    { sourceId: 'swiss_ephemeris', claimFamily: 'planetary_longitude_fixture', surface: 'server_runtime' },
    { sourceId: 'waite_pictorial_key_public_text', claimFamily: 'tarot_image_provenance', surface: 'paid_pdf_visual' },
    { sourceId: 'rws_card_images_commons_candidate', claimFamily: 'rws_major_arcana_meaning', surface: 'paid_pdf_visual' },
    { sourceId: 'rws_card_images_commons_candidate', claimFamily: 'tarot_image_provenance', surface: 'paid_pdf_visual' },
    { sourceId: 'cosmicpath_divination_safety_policy', claimFamily: 'ten_gods', surface: 'customer_report_text' },
    { sourceId: 'cosmicpath_report_grounding_contract', claimFamily: 'modern_psychological_astrology', surface: 'prompt_grounding' },
    {
      sourceId: 'modern_astrology_sources_pending',
      claimFamily: 'modern_psychological_astrology',
      surface: 'prompt_grounding',
      includesRawSourceText: true,
    },
  ] as const satisfies readonly UseRequest[];

  for (const fixture of fixtures) {
    assertRejected(fixture, 'rights_or_authority_boundary');
  }
  console.log('domain_source_registry_license_policy_rejected');
}

function assertNotAllowedAndForbiddenOverlap(record: RegistryRecord): void {
  for (const claimFamily of record.allowedClaimFamilies) {
    assert.equal(
      record.forbiddenClaimFamilies.includes(claimFamily),
      false,
      `claim_family_overlap:${record.sourceId}:${claimFamily}`
    );
  }
}

function assertRuntimeUseMatchesSurface(record: RegistryRecord): void {
  if (record.runtimeUse.startsWith('blocked') || record.runtimeUse === 'discovery_only') {
    for (const surface of REPORT_SURFACES) {
      assert.equal(record.allowedSurfaces.includes(surface), false, `blocked_surface_allowed:${record.sourceId}:${surface}`);
    }
  }

  if (record.sourceRole.includes('calendar') || record.sourceRole.includes('ephemeris')) {
    for (const family of DOCTRINE_CLAIM_FAMILIES) {
      assert.equal(record.allowedClaimFamilies.includes(family), false, `calculation_source_allows_doctrine:${record.sourceId}:${family}`);
    }
  }
}

function assertRejected(request: UseRequest, expectedReason: string): void {
  const result = evaluateUse(request);
  assert.equal(result.allowed, false, `${request.sourceId} unexpectedly allowed ${request.claimFamily} on ${request.surface}`);
  assert.ok(result.reason.includes(expectedReason), JSON.stringify(result));
}

function evaluateUse(request: UseRequest): { readonly allowed: boolean; readonly reason: string } {
  const record = registryRecords().find((candidate) => candidate.sourceId === request.sourceId);
  if (!record) return { allowed: false, reason: 'rights_or_authority_boundary:unknown_source' };
  if (request.includesRawSourceText === true) return { allowed: false, reason: 'rights_or_authority_boundary:raw_source_text' };
  if (record.forbiddenClaimFamilies.includes(request.claimFamily)) return { allowed: false, reason: reasonFor(record) };
  if (!record.allowedClaimFamilies.includes(request.claimFamily)) return { allowed: false, reason: reasonFor(record) };
  if (!record.allowedSurfaces.includes(request.surface)) return { allowed: false, reason: reasonFor(record) };
  if (record.runtimeUse.startsWith('blocked') || record.runtimeUse === 'discovery_only') return { allowed: false, reason: reasonFor(record) };
  return { allowed: true, reason: 'allowed' };
}

function reasonFor(record: RegistryRecord): string {
  if (record.sourceRole.includes('calendar')) return 'calendar_source_not_doctrine';
  return 'rights_or_authority_boundary';
}

function assertUsefulString(value: string, field: string): void {
  assert.equal(typeof value, 'string', `missing_${field}`);
  assert.ok(value.trim().length >= 3, `empty_${field}`);
}

function assertNonEmpty(values: readonly string[], field: string): void {
  assert.ok(Array.isArray(values), `missing_array:${field}`);
  assert.ok(values.length > 0, `empty_array:${field}`);
  for (const value of values) {
    assertUsefulString(value, field);
  }
}

function runScenario(scenario: Scenario): void {
  switch (scenario) {
    case 'happy':
      assertHappyBoundaries();
      return;
    case 'rejects-kasi-doctrine':
      assertHappyBoundaries();
      assertKasiDoctrineRejected();
      return;
    case 'license-policy':
      assertHappyBoundaries();
      assertLicensePolicyRejected();
      return;
    case 'all':
      assertHappyBoundaries();
      assertKasiDoctrineRejected();
      assertLicensePolicyRejected();
      console.log('domain_source_registry_all_contract');
      return;
    default:
      throw new UnsupportedScenarioError(String(scenario));
  }
}

try {
  const scenario = parseScenario(process.argv.slice(2));
  console.log(`scenario=${scenario}`);
  runScenario(scenario);
  console.log('Domain source registry verification passed');
} catch (error) {
  if (error instanceof UnsupportedScenarioError || error instanceof assert.AssertionError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
