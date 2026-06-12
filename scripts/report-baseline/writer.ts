import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { buildBaselineReport } from './build-report.ts';
import type { BaselineIndex, ReportQualityFixtureFile } from './types.ts';

export const BASELINE_DIR = join(process.cwd(), '.tmp', 'report-quality-baseline');
export const BASELINE_INDEX_PATH = join(BASELINE_DIR, 'index.json');

export function writeBaselineArtifacts(sourcePath: string): BaselineIndex {
  const source = readFixtureFile(sourcePath);
  mkdirSync(BASELINE_DIR, { recursive: true });

  const cases = source.cases.map((fixture) => {
    const artifact = buildBaselineReport(fixture);
    const artifactPath = join(BASELINE_DIR, `${fixture.id}.json`);
    writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
    return { id: fixture.id, label: fixture.label, artifactPath };
  });

  const index = {
    generatedAt: new Date().toISOString(),
    sourcePath,
    artifactDir: BASELINE_DIR,
    cases,
  };
  writeFileSync(BASELINE_INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);
  return index;
}

function readFixtureFile(sourcePath: string): ReportQualityFixtureFile {
  const parsed: unknown = JSON.parse(readFileSync(sourcePath, 'utf8'));
  if (!isFixtureFile(parsed)) {
    throw new Error(`Invalid report quality fixture file: ${basename(sourcePath)}`);
  }
  return parsed;
}

function isFixtureFile(value: unknown): value is ReportQualityFixtureFile {
  if (!value || typeof value !== 'object') return false;
  if (!('cases' in value)) return false;
  return Array.isArray(value.cases);
}

export function baselineArtifactPath(fileName: string): string {
  return join(dirname(BASELINE_INDEX_PATH), fileName);
}
