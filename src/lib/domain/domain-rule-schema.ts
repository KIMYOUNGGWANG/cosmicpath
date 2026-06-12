import { z } from 'zod';
import { SOURCE_REGISTRY } from './source-registry.ts';
import type { SourceRegistryRecord } from './source-registry-types.ts';

export const EVIDENCE_FAMILIES = [
  'calculation_fact',
  'classical_doctrine',
  'korean_practitioner_variant',
  'astrology_doctrine',
  'tarot_rws_text',
  'product_synthesis',
  'safety_boundary',
] as const;

export const RULE_CONFIDENCES = ['high', 'medium', 'low', 'candidate', 'disputed'] as const;

export const APPROVED_USES = [
  'fixture_verifier',
  'internal_research',
  'prompt_grounding',
  'customer_report_text',
  'paid_pdf_text',
  'source_provenance_appendix',
] as const;

export const DOCTRINE_VARIANT_STANCES = [
  'not_doctrine',
  'classical_consensus',
  'classical_variant',
  'korean_practitioner_variant',
  'modern_variant',
  'product_policy',
] as const;

export const SOURCE_CLAIM_AUTHORSHIPS = [
  'calculation_trace',
  'product_curated_summary',
  'public_domain_summary',
  'licensed_summary',
  'product_policy',
] as const;

const IdentifierSchema = z.string().regex(/^[a-z][a-z0-9_:-]{2,}$/u);
const NonEmptyTextSchema = z.string().trim().min(3);

export const EvidenceFamilySchema = z.enum(EVIDENCE_FAMILIES);
export const RuleConfidenceSchema = z.enum(RULE_CONFIDENCES);
export const ApprovedUseSchema = z.enum(APPROVED_USES);

export const RuleCitationSchema = z
  .object({
    sourceId: IdentifierSchema,
    locator: NonEmptyTextSchema,
    citationLabel: NonEmptyTextSchema,
    quotePolicy: z.enum(['computed_value_only', 'paraphrase_only', 'no_raw_source_text']),
  })
  .strict();

export const DoctrineVariantSchema = z
  .object({
    variantId: IdentifierSchema,
    stance: z.enum(DOCTRINE_VARIANT_STANCES),
    labelKo: NonEmptyTextSchema,
    appliesWhenKo: NonEmptyTextSchema,
    conflictNoteKo: NonEmptyTextSchema.optional(),
  })
  .strict();

export const SourceClaimSchema = z
  .object({
    sourceClaimId: IdentifierSchema,
    sourceId: IdentifierSchema,
    evidenceFamily: EvidenceFamilySchema,
    claimFamily: IdentifierSchema,
    approvedUse: z.array(ApprovedUseSchema).min(1),
    authorship: z.enum(SOURCE_CLAIM_AUTHORSHIPS),
    summaryKo: NonEmptyTextSchema,
    citations: z.array(RuleCitationSchema).min(1),
  })
  .strict();

export const DomainRuleSchema = z
  .object({
    ruleId: IdentifierSchema,
    evidenceFamily: EvidenceFamilySchema,
    sourceClaimIds: z.array(IdentifierSchema).min(1),
    titleKo: NonEmptyTextSchema,
    summaryKo: NonEmptyTextSchema,
    doctrineVariant: DoctrineVariantSchema,
    confidence: RuleConfidenceSchema,
    reportUse: z.array(ApprovedUseSchema).min(1),
    citations: z.array(RuleCitationSchema).min(1),
    safetyBoundaryKo: NonEmptyTextSchema.optional(),
  })
  .strict();

export const DomainRuleRegistrySchema = z
  .object({
    sourceClaims: z.array(SourceClaimSchema).min(1),
    domainRules: z.array(DomainRuleSchema).min(1),
  })
  .strict();

export type EvidenceFamily = z.infer<typeof EvidenceFamilySchema>;
export type RuleConfidence = z.infer<typeof RuleConfidenceSchema>;
export type ApprovedUse = z.infer<typeof ApprovedUseSchema>;
export type RuleCitation = z.infer<typeof RuleCitationSchema>;
export type DoctrineVariant = z.infer<typeof DoctrineVariantSchema>;
export type SourceClaim = z.infer<typeof SourceClaimSchema>;
export type DomainRule = z.infer<typeof DomainRuleSchema>;
export type DomainRuleRegistry = z.infer<typeof DomainRuleRegistrySchema>;

const MODEL_AUTHORED_ID_PREFIXES = ['model_', 'gemini_', 'llm_'] as const;

export class DomainRuleSchemaError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`domain_rule_schema_invalid:${issues.join('|')}`);
    this.name = 'DomainRuleSchemaError';
    this.issues = issues;
  }
}

export function parseDomainRuleRegistry(input: unknown): DomainRuleRegistry {
  const parsed = DomainRuleRegistrySchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainRuleSchemaError(parsed.error.issues.map(formatZodIssue));
  }

  const linkIssues = validateRegistryLinks(parsed.data);
  if (linkIssues.length > 0) throw new DomainRuleSchemaError(linkIssues);
  return parsed.data;
}

export function validateRegistryLinks(registry: DomainRuleRegistry): readonly string[] {
  const sourceById = new Map(SOURCE_REGISTRY.map((record) => [record.sourceId, record]));
  const sourceClaimById = new Map<string, SourceClaim>();
  const ruleIds = new Set<string>();
  const issues: string[] = [];

  for (const sourceClaim of registry.sourceClaims) {
    if (sourceClaimById.has(sourceClaim.sourceClaimId)) {
      issues.push(`duplicate_source_claim_id:${sourceClaim.sourceClaimId}`);
    } else {
      sourceClaimById.set(sourceClaim.sourceClaimId, sourceClaim);
    }
    collectModelAuthoredIdIssue(sourceClaim.sourceClaimId, 'model_authored_source_claim_id', issues);
    collectSourceClaimRegistryIssues(sourceClaim, sourceById.get(sourceClaim.sourceId), issues);
  }

  for (const rule of registry.domainRules) {
    collectSetIdIssue(ruleIds, rule.ruleId, 'duplicate_domain_rule_id', issues);
    collectModelAuthoredIdIssue(rule.ruleId, 'model_authored_domain_rule_id', issues);
    collectRuleClaimIssues(rule, sourceClaimById, issues);
  }

  return issues;
}

function collectSourceClaimRegistryIssues(
  sourceClaim: SourceClaim,
  record: SourceRegistryRecord | undefined,
  issues: string[]
): void {
  if (!record) {
    issues.push(`unknown_source_id:${sourceClaim.sourceClaimId}:${sourceClaim.sourceId}`);
    return;
  }

  if (!record.allowedClaimFamilies.includes(sourceClaim.claimFamily)) {
    issues.push(`unsupported_source_claim_family:${sourceClaim.sourceClaimId}:${sourceClaim.claimFamily}`);
  }

  for (const approvedUse of sourceClaim.approvedUse) {
    if (!record.allowedSurfaces.includes(approvedUse)) {
      issues.push(`source_surface_not_allowed:${sourceClaim.sourceClaimId}:${approvedUse}`);
    }
  }

  for (const citation of sourceClaim.citations) {
    if (citation.sourceId !== sourceClaim.sourceId) {
      issues.push(`citation_source_mismatch:${sourceClaim.sourceClaimId}:${citation.sourceId}`);
    }
  }
}

function collectRuleClaimIssues(rule: DomainRule, sourceClaimById: ReadonlyMap<string, SourceClaim>, issues: string[]): void {
  const sourceIds = new Set<string>();
  const linkedSourceClaims: SourceClaim[] = [];
  for (const sourceClaimId of rule.sourceClaimIds) {
    const sourceClaim = sourceClaimById.get(sourceClaimId);
    if (!sourceClaim) {
      issues.push(`unknown_source_claim_id:${rule.ruleId}:${sourceClaimId}`);
      continue;
    }
    if (sourceClaim.evidenceFamily !== rule.evidenceFamily) {
      issues.push(`evidence_family_mismatch:${rule.ruleId}:${sourceClaimId}`);
    }
    linkedSourceClaims.push(sourceClaim);
    sourceIds.add(sourceClaim.sourceId);
  }

  for (const reportUse of rule.reportUse) {
    if (!linkedSourceClaims.some((sourceClaim) => sourceClaim.approvedUse.includes(reportUse))) {
      issues.push(`rule_report_use_not_supported:${rule.ruleId}:${reportUse}`);
    }
  }

  for (const citation of rule.citations) {
    if (!sourceIds.has(citation.sourceId)) {
      issues.push(`rule_citation_source_mismatch:${rule.ruleId}:${citation.sourceId}`);
    }
  }
}

function collectSetIdIssue(ids: Set<string>, id: string, label: string, issues: string[]): void {
  if (ids.has(id)) {
    issues.push(`${label}:${id}`);
    return;
  }
  ids.add(id);
}

function collectModelAuthoredIdIssue(id: string, label: string, issues: string[]): void {
  if (MODEL_AUTHORED_ID_PREFIXES.some((prefix) => id.startsWith(prefix))) {
    issues.push(`${label}:${id}`);
  }
}

function formatZodIssue(issue: z.core.$ZodIssue): string {
  return `${issue.path.join('.') || '<root>'}:${issue.message}`;
}
