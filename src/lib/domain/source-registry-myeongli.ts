import {
  CALCULATION_CLAIMS,
  INTERNAL_SURFACES,
  PRODUCT_OUTPUT_SURFACES,
  REPORT_AUTHORITY_CLAIMS,
  source,
  type SourceRegistryRecord,
} from './source-registry-types.ts';

function discoverySource(sourceId: string, sourceUrlOrLocator: string, knownBadFixtureIds: readonly string[]): SourceRegistryRecord {
  return source({
    sourceId,
    domain: 'myeongli_saju',
    sourceRole: 'korean_source_discovery',
    promotionState: 'observed_for_discovery',
    sourceStatus: 'orientation_only',
    licenseStatus: 'unknown',
    runtimeUse: 'discovery_only',
    rightsRuntimeUseStates: ['internal_research_only'],
    allowedSurfaces: INTERNAL_SURFACES,
    forbiddenSurfaces: PRODUCT_OUTPUT_SURFACES,
    allowedClaimFamilies: ['source_discovery_only'],
    forbiddenClaimFamilies: REPORT_AUTHORITY_CLAIMS,
    caveat: 'Search/catalog presence is not doctrine, rights, or report authority.',
    sourceUrlOrLocator,
    captureStatus: 'orientation_only',
    reviewStatus: 'needs_expert_review',
    knownBadFixtureIds,
  });
}

function classicCandidate(
  sourceId: string,
  sourceStatus: string,
  licenseStatus: string,
  sourceUrlOrLocator: string,
  knownBadFixtureIds: readonly string[]
): SourceRegistryRecord {
  return source({
    sourceId,
    domain: 'myeongli_saju',
    sourceRole: 'classical_myeongli_doctrine',
    promotionState: 'candidate_captured',
    sourceStatus,
    licenseStatus,
    runtimeUse: 'blocked_pending_acquisition',
    rightsRuntimeUseStates: ['citation_only'],
    allowedSurfaces: INTERNAL_SURFACES,
    forbiddenSurfaces: PRODUCT_OUTPUT_SURFACES,
    allowedClaimFamilies: ['source_lineage_context'],
    forbiddenClaimFamilies: [...CALCULATION_CLAIMS, ...REPORT_AUTHORITY_CLAIMS],
    caveat: 'Edition, collation, commentary lineage, Korean terminology, rights, and domain review required before report use.',
    sourceUrlOrLocator,
    captureStatus: sourceStatus.includes('public') ? 'candidate' : 'pending_acquisition',
    reviewStatus: 'needs_expert_review',
    knownBadFixtureIds,
  });
}

const CLASSIC_MYEONGLI_SOURCES = [
  ['yuanhai_ziping_wikisource_candidate', 'verified_public_text_with_caveat', 'public_domain_candidate', 'https://zh.wikisource.org/wiki/%E6%B7%B5%E6%B5%B7%E5%AD%90%E5%B9%B3', ['reject_classical_text_without_edition_caveat']],
  ['sanming_tonghui_wikisource_candidate', 'verified_public_text_with_caveat', 'public_domain_candidate', 'https://zh.wikisource.org/wiki/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83', ['reject_partial_text_as_complete_authority']],
  ['ditian_sui_wikisource_candidate', 'verified_public_text_with_caveat', 'public_domain_candidate', 'https://zh.wikisource.org/wiki/%E6%BB%B4%E5%A4%A9%E9%AB%93', ['reject_commentary_flattened_as_single_rule']],
  ['ziping_zhenquan_candidate', 'blocked_pending_acquisition', 'unknown', 'Candidate title locator: Ziping Zhenquan', ['reject_wikipedia_as_final_myeongli']],
  ['qiong_tong_bao_jian_candidate', 'blocked_pending_acquisition', 'unknown', 'Candidate title locator: Qiong Tong Bao Jian', ['reject_wikipedia_as_tiaohou_yongsin_source']],
] as const;

const KOREAN_DISCOVERY_SOURCES = [
  ['riss_korean_academic_search', 'https://www.riss.kr/', ['reject_riss_search_result_as_doctrine']],
  ['kci_korean_journal_search', 'https://www.kci.go.kr/', ['reject_kci_search_result_as_approved']],
  ['nlk_catalog_search', 'https://www.nl.go.kr/', ['reject_nlk_catalog_as_full_authority']],
  ['oak_repository_search', 'https://oak.go.kr/', ['reject_repository_hit_as_reviewed_doctrine']],
] as const;

export const MYEONGLI_SOURCE_REGISTRY = [
  ...CLASSIC_MYEONGLI_SOURCES.map(([sourceId, status, license, locator, fixtures]) => classicCandidate(sourceId, status, license, locator, fixtures)),
  ...KOREAN_DISCOVERY_SOURCES.map(([sourceId, locator, fixtures]) => discoverySource(sourceId, locator, fixtures)),
] satisfies readonly SourceRegistryRecord[];
