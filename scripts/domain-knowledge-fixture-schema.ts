import { z } from 'zod';
import { ApprovedUseSchema, EvidenceFamilySchema } from '../src/lib/domain/domain-rule-schema.ts';

export const FIXTURE_ROOT = 'scripts/fixtures/domain-knowledge';

export const REQUIRED_FIXTURE_KINDS = [
  'source-registry',
  'myeongli-rules',
  'astrology-rules',
  'tarot-corpus',
  'retrieval-inputs',
  'grounding-payloads',
] as const;

export const REJECTED_FIXTURE_KIND = 'rejected-hallucination-cases' as const;

export const ALL_FIXTURE_KINDS = [...REQUIRED_FIXTURE_KINDS, REJECTED_FIXTURE_KIND] as const;

const IdentifierSchema = z.string().regex(/^[a-z][a-z0-9_:-]{2,}$/u);
const NonEmptyTextSchema = z.string().trim().min(3);

export const KnowledgeFixtureRecordSchema = z
  .object({
    id: IdentifierSchema,
    sourceId: IdentifierSchema,
    sourceRole: NonEmptyTextSchema,
    sourceClaimId: IdentifierSchema,
    evidenceId: IdentifierSchema,
    evidenceFamily: EvidenceFamilySchema,
    claimFamily: IdentifierSchema,
    approvedUse: z.array(ApprovedUseSchema).min(1),
    citation: z
      .object({
        sourceId: IdentifierSchema,
        locator: NonEmptyTextSchema,
        citationLabel: NonEmptyTextSchema,
        quotePolicy: z.enum(['computed_value_only', 'paraphrase_only', 'no_raw_source_text']),
      })
      .strict(),
    summaryKo: NonEmptyTextSchema,
    rawSourceText: z.string().optional(),
    includesRawSourceText: z.boolean().optional(),
  })
  .strict();

export const KnowledgeFixtureFileSchema = z
  .object({
    fixtureKind: z.enum(ALL_FIXTURE_KINDS),
    fixtureId: IdentifierSchema,
    records: z.array(KnowledgeFixtureRecordSchema),
    expectedIssue: z.string().optional(),
  })
  .strict();

export type FixtureKind = (typeof ALL_FIXTURE_KINDS)[number];
export type RequiredFixtureKind = (typeof REQUIRED_FIXTURE_KINDS)[number];
export type KnowledgeFixtureRecord = z.infer<typeof KnowledgeFixtureRecordSchema>;
export type KnowledgeFixtureFile = z.infer<typeof KnowledgeFixtureFileSchema>;

export class DomainKnowledgeFixtureError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`domain_knowledge_fixtures_invalid:${issues.join('|')}`);
    this.name = 'DomainKnowledgeFixtureError';
    this.issues = issues;
  }
}
