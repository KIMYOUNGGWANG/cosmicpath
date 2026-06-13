import {
  DomainKnowledgeFixtureError,
  REQUIRED_FIXTURE_KINDS,
  REJECTED_FIXTURE_KIND,
  type KnowledgeFixtureFile,
  type KnowledgeFixtureRecord,
} from './domain-knowledge-fixture-schema.ts';
import { readFixtureFiles } from './domain-knowledge-fixture-loader.ts';
import { findSourceRegistryRecord } from '../src/lib/domain/source-registry.ts';

const MODEL_AUTHORED_ID_PREFIXES = ['model_', 'gemini_', 'llm_'] as const;
const REQUIRED_REJECTED_ISSUES = [
  'unknown_source_id',
  'missing_citation',
  'unsupported_source_role',
  'unsupported_claim_family',
  'unsupported_approved_use',
  'model_invented_source_claim_id',
  'model_invented_evidence_id',
  'raw_copyrighted_text',
] as const;

export function verifyHappyFixtureLayout(): void {
  for (const fixtureKind of REQUIRED_FIXTURE_KINDS) {
    const files = readFixtureFiles(fixtureKind);
    const recordCount = files.reduce((count, file) => count + file.records.length, 0);
    if (recordCount === 0) throw new DomainKnowledgeFixtureError([`empty_corpus:${fixtureKind}`]);
    collectFixtureIssues(files);
  }
}

export function verifyRejectedFixtures(): void {
  const files = readFixtureFiles(REJECTED_FIXTURE_KIND);
  const coveredIssues = new Set<string>();
  for (const file of files) {
    const issues = collectFixtureIssues([file]);
    const expectedIssue = file.expectedIssue;
    if (!expectedIssue) throw new DomainKnowledgeFixtureError([`missing_expected_issue:${file.fixtureId}`]);
    if (!issues.some((issue) => issue.includes(expectedIssue))) {
      throw new DomainKnowledgeFixtureError([`rejected_fixture_uncovered:${file.fixtureId}:${expectedIssue}:${issues.join(',')}`]);
    }
    collectCoveredRejectedIssues(issues, coveredIssues);
  }
  const missingIssues = REQUIRED_REJECTED_ISSUES.filter((issue) => !coveredIssues.has(issue));
  if (missingIssues.length > 0) {
    throw new DomainKnowledgeFixtureError(missingIssues.map((issue) => `missing_rejected_issue:${issue}`));
  }
}

export function verifyExplicitEmptyFixtureRejection(): void {
  const issues = collectFixtureIssues([
    {
      fixtureKind: 'myeongli-rules',
      fixtureId: 'empty_myeongli_rules_probe',
      records: [],
    },
  ], false);
  if (!issues.includes('empty_corpus:myeongli-rules')) {
    throw new DomainKnowledgeFixtureError([`empty_corpus_probe_not_rejected:${issues.join(',')}`]);
  }
}

function collectFixtureIssues(files: readonly KnowledgeFixtureFile[], throwOnRequiredFailure = true): readonly string[] {
  const issues: string[] = [];
  for (const file of files) {
    if (file.records.length === 0) issues.push(`empty_corpus:${file.fixtureKind}`);
    for (const record of file.records) collectRecordIssues(file.fixtureId, record, issues);
  }
  if (throwOnRequiredFailure && issues.length > 0 && files.every((file) => file.fixtureKind !== REJECTED_FIXTURE_KIND)) {
    throw new DomainKnowledgeFixtureError(issues);
  }
  return issues;
}

function collectRecordIssues(fixtureId: string, record: KnowledgeFixtureRecord, issues: string[]): void {
  const sourceRecord = findSourceRegistryRecord(record.sourceId);
  if (!sourceRecord) {
    issues.push(`unknown_source_id:${fixtureId}:${record.sourceId}`);
    return;
  }
  if (sourceRecord.sourceRole !== record.sourceRole) {
    issues.push(`unsupported_source_role:${fixtureId}:${record.sourceRole}`);
  }
  if (!sourceRecord.allowedClaimFamilies.includes(record.claimFamily)) {
    issues.push(`unsupported_claim_family:${fixtureId}:${record.claimFamily}`);
  }
  for (const approvedUse of record.approvedUse) {
    if (!sourceRecord.allowedSurfaces.includes(approvedUse)) {
      issues.push(`unsupported_approved_use:${fixtureId}:${approvedUse}`);
    }
  }
  if (record.citation.sourceId !== record.sourceId) {
    issues.push(`missing_citation:${fixtureId}:source_mismatch`);
  }
  if (record.rawSourceText || record.includesRawSourceText === true) {
    issues.push(`raw_copyrighted_text:${fixtureId}`);
  }
  collectModelAuthoredIssue(record.sourceClaimId, fixtureId, 'source_claim_id', issues);
  collectModelAuthoredIssue(record.evidenceId, fixtureId, 'evidence_id', issues);
}

function collectModelAuthoredIssue(id: string, fixtureId: string, field: string, issues: string[]): void {
  if (MODEL_AUTHORED_ID_PREFIXES.some((prefix) => id.startsWith(prefix))) {
    issues.push(`model_invented_${field}:${fixtureId}:${id}`);
  }
}

function collectCoveredRejectedIssues(issues: readonly string[], coveredIssues: Set<string>): void {
  for (const requiredIssue of REQUIRED_REJECTED_ISSUES) {
    if (issues.some((issue) => issue.includes(requiredIssue))) coveredIssues.add(requiredIssue);
  }
}
