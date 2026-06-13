import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  DomainKnowledgeFixtureError,
  FIXTURE_ROOT,
  KnowledgeFixtureFileSchema,
  type FixtureKind,
  type KnowledgeFixtureFile,
} from './domain-knowledge-fixture-schema.ts';

export function readFixtureFiles(kind: FixtureKind): readonly KnowledgeFixtureFile[] {
  const directory = join(FIXTURE_ROOT, kind);
  const fileNames = readdirSync(directory).filter((fileName) => fileName.endsWith('.json')).sort();
  if (fileNames.length === 0) throw new DomainKnowledgeFixtureError([`missing_fixture_files:${kind}`]);
  return fileNames.map((fileName) => readFixtureFile(kind, join(directory, fileName)));
}

function readFixtureFile(kind: FixtureKind, path: string): KnowledgeFixtureFile {
  const parsedJson = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  const parsed = KnowledgeFixtureFileSchema.safeParse(parsedJson);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${path}:${issue.path.join('.') || '<root>'}:${issue.message}`);
    throw new DomainKnowledgeFixtureError(issues);
  }
  if (parsed.data.fixtureKind !== kind) {
    throw new DomainKnowledgeFixtureError([`fixture_kind_mismatch:${path}:${parsed.data.fixtureKind}:${kind}`]);
  }
  return parsed.data;
}
