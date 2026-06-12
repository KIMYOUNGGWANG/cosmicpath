import type { ApprovedUse, EvidenceFamily } from '../src/lib/domain/domain-rule-schema.ts';

type FixtureClaimArgs = {
  readonly sourceClaimId: string;
  readonly sourceId: string;
  readonly evidenceFamily: EvidenceFamily | string;
  readonly claimFamily: string;
  readonly approvedUse: readonly (ApprovedUse | string)[];
  readonly authorship: string;
};

export function validRegistry(): unknown {
  return { sourceClaims: validSourceClaims(), domainRules: validRules() };
}

export function unknownSourceRegistry(): unknown {
  return {
    sourceClaims: [
      fixtureClaim({
        sourceClaimId: 'claim_unknown_source',
        sourceId: 'invented_source_book',
        evidenceFamily: 'classical_doctrine',
        claimFamily: 'ten_gods',
        approvedUse: ['internal_research'],
        authorship: 'product_curated_summary',
      }),
    ],
    domainRules: [fixtureRule('claim_unknown_source', 'invented_source_book', 'classical_doctrine', ['internal_research'])],
  };
}

export function unknownFamilyRegistry(): unknown {
  return {
    sourceClaims: [
      fixtureClaim({
        sourceClaimId: 'claim_unknown_family',
        sourceId: 'kasi_open_api',
        evidenceFamily: 'mystery_doctrine',
        claimFamily: 'solar_term_fixture',
        approvedUse: ['fixture_verifier'],
        authorship: 'calculation_trace',
      }),
    ],
    domainRules: validRules(),
  };
}

export function unsupportedApprovedUseRegistry(): unknown {
  return {
    sourceClaims: [
      fixtureClaim({
        sourceClaimId: 'claim_bad_use',
        sourceId: 'kasi_open_api',
        evidenceFamily: 'calculation_fact',
        claimFamily: 'solar_term_fixture',
        approvedUse: ['provider_private_context'],
        authorship: 'calculation_trace',
      }),
    ],
    domainRules: [fixtureRule('claim_bad_use', 'kasi_open_api', 'calculation_fact', ['fixture_verifier'])],
  };
}

export function unsupportedRuleReportUseRegistry(): unknown {
  return {
    sourceClaims: [
      fixtureClaim({
        sourceClaimId: 'claim_internal_only_tarot',
        sourceId: 'waite_pictorial_key_public_text',
        evidenceFamily: 'tarot_rws_text',
        claimFamily: 'rws_major_arcana_meaning',
        approvedUse: ['internal_research'],
        authorship: 'public_domain_summary',
      }),
    ],
    domainRules: [fixtureRule('claim_internal_only_tarot', 'waite_pictorial_key_public_text', 'tarot_rws_text', ['customer_report_text'])],
  };
}

export function missingVariantRegistry(): unknown {
  return {
    sourceClaims: validSourceClaims(),
    domainRules: [
      {
        ruleId: 'rule_missing_variant',
        evidenceFamily: 'safety_boundary',
        sourceClaimIds: ['claim_safety_health_boundary'],
        titleKo: '변형 누락 규칙',
        summaryKo: '변형과 신뢰도 메타데이터가 없으면 통과하면 안 된다.',
        reportUse: ['customer_report_text'],
        citations: [fixtureCitation('cosmicpath_divination_safety_policy')],
      },
    ],
  };
}

export function modelAuthoredRegistry(): unknown {
  return {
    sourceClaims: [
      fixtureClaim({
        sourceClaimId: 'model_generated_claim',
        sourceId: 'cosmicpath_report_grounding_contract',
        evidenceFamily: 'product_synthesis',
        claimFamily: 'report_grounding_contract',
        approvedUse: ['prompt_grounding'],
        authorship: 'product_policy',
      }),
    ],
    domainRules: [fixtureRule('model_generated_claim', 'cosmicpath_report_grounding_contract', 'product_synthesis', ['prompt_grounding'])],
  };
}

export function freeFormBlobRegistry(): unknown {
  return {
    sourceClaims: [
      {
        ...fixtureClaim({
          sourceClaimId: 'claim_raw_text_blob',
          sourceId: 'waite_pictorial_key_public_text',
          evidenceFamily: 'tarot_rws_text',
          claimFamily: 'rws_major_arcana_meaning',
          approvedUse: ['internal_research'],
          authorship: 'public_domain_summary',
        }),
        rawSourceText: 'forbidden raw source passage',
      },
    ],
    domainRules: [fixtureRule('claim_raw_text_blob', 'waite_pictorial_key_public_text', 'tarot_rws_text', ['internal_research'])],
  };
}

function fixtureClaim(args: FixtureClaimArgs): Record<string, unknown> {
  return {
    ...args,
    summaryKo: `${args.sourceClaimId} 제품 요약 근거`,
    citations: [fixtureCitation(args.sourceId)],
  };
}

function fixtureCitation(sourceId: string): Record<string, unknown> {
  return {
    sourceId,
    locator: `${sourceId} reviewed locator`,
    citationLabel: `${sourceId} provenance`,
    quotePolicy: sourceId.startsWith('kasi_') ? 'computed_value_only' : 'no_raw_source_text',
  };
}

function fixtureVariant(family: EvidenceFamily): Record<string, unknown> {
  return {
    variantId: `${family}_variant`,
    stance: family === 'calculation_fact' ? 'not_doctrine' : 'product_policy',
    labelKo: `${family} 변형`,
    appliesWhenKo: `${family} 근거가 선택된 경우`,
  };
}

function fixtureRule(
  sourceClaimId: string,
  sourceId: string,
  family: EvidenceFamily,
  reportUse: readonly ApprovedUse[]
): Record<string, unknown> {
  return {
    ruleId: `rule_${family}`,
    evidenceFamily: family,
    sourceClaimIds: [sourceClaimId],
    titleKo: `${family} 규칙`,
    summaryKo: `${family} 규칙은 출처 클레임과 변형/신뢰도를 함께 가진다.`,
    doctrineVariant: fixtureVariant(family),
    confidence: family === 'classical_doctrine' ? 'candidate' : 'high',
    reportUse,
    citations: [fixtureCitation(sourceId)],
  };
}

function validSourceClaims(): readonly unknown[] {
  return [
    fixtureClaim({
      sourceClaimId: 'claim_calculation_solar_term',
      sourceId: 'kasi_open_api',
      evidenceFamily: 'calculation_fact',
      claimFamily: 'solar_term_fixture',
      approvedUse: ['fixture_verifier', 'source_provenance_appendix'],
      authorship: 'calculation_trace',
    }),
    fixtureClaim({
      sourceClaimId: 'claim_classical_lineage_context',
      sourceId: 'yuanhai_ziping_wikisource_candidate',
      evidenceFamily: 'classical_doctrine',
      claimFamily: 'source_lineage_context',
      approvedUse: ['internal_research', 'source_provenance_appendix'],
      authorship: 'public_domain_summary',
    }),
    fixtureClaim({
      sourceClaimId: 'claim_korean_practitioner_discovery',
      sourceId: 'riss_korean_academic_search',
      evidenceFamily: 'korean_practitioner_variant',
      claimFamily: 'source_discovery_only',
      approvedUse: ['internal_research'],
      authorship: 'product_curated_summary',
    }),
    fixtureClaim({
      sourceClaimId: 'claim_astrology_classical_sign',
      sourceId: 'ptolemy_tetrabiblos_public_text',
      evidenceFamily: 'astrology_doctrine',
      claimFamily: 'classical_planet_sign_doctrine',
      approvedUse: ['internal_research'],
      authorship: 'public_domain_summary',
    }),
    fixtureClaim({
      sourceClaimId: 'claim_tarot_rws_major',
      sourceId: 'waite_pictorial_key_public_text',
      evidenceFamily: 'tarot_rws_text',
      claimFamily: 'rws_major_arcana_meaning',
      approvedUse: ['internal_research'],
      authorship: 'public_domain_summary',
    }),
    fixtureClaim({
      sourceClaimId: 'claim_product_grounding_contract',
      sourceId: 'cosmicpath_report_grounding_contract',
      evidenceFamily: 'product_synthesis',
      claimFamily: 'report_grounding_contract',
      approvedUse: ['prompt_grounding', 'customer_report_text'],
      authorship: 'product_policy',
    }),
    fixtureClaim({
      sourceClaimId: 'claim_safety_health_boundary',
      sourceId: 'cosmicpath_divination_safety_policy',
      evidenceFamily: 'safety_boundary',
      claimFamily: 'health_safety_boundary',
      approvedUse: ['customer_report_text'],
      authorship: 'product_policy',
    }),
  ];
}

function validRules(): readonly unknown[] {
  return [
    fixtureRule('claim_calculation_solar_term', 'kasi_open_api', 'calculation_fact', ['fixture_verifier']),
    fixtureRule('claim_classical_lineage_context', 'yuanhai_ziping_wikisource_candidate', 'classical_doctrine', ['internal_research']),
    fixtureRule('claim_korean_practitioner_discovery', 'riss_korean_academic_search', 'korean_practitioner_variant', ['internal_research']),
    fixtureRule('claim_astrology_classical_sign', 'ptolemy_tetrabiblos_public_text', 'astrology_doctrine', ['internal_research']),
    fixtureRule('claim_tarot_rws_major', 'waite_pictorial_key_public_text', 'tarot_rws_text', ['internal_research']),
    fixtureRule('claim_product_grounding_contract', 'cosmicpath_report_grounding_contract', 'product_synthesis', ['prompt_grounding']),
    fixtureRule('claim_safety_health_boundary', 'cosmicpath_divination_safety_policy', 'safety_boundary', ['customer_report_text']),
  ];
}
