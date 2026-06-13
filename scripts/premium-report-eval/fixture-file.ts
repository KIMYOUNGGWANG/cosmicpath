import { readFileSync } from 'node:fs';

import { z } from 'zod';

import { OUTPUT_PATH } from '../report-test-data/cases.ts';

const qualityFixtureSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  premiumUserData: z.record(z.string(), z.unknown()),
}).passthrough();

const qualityFixtureFileSchema = z.object({
  cases: z.array(qualityFixtureSchema),
}).passthrough();

export type PremiumEvalFixture = z.infer<typeof qualityFixtureSchema>;

export function readPremiumEvalFixtures(path: string = OUTPUT_PATH): readonly PremiumEvalFixture[] {
  const parsed = qualityFixtureFileSchema.parse(readJsonFile(path));
  return parsed.cases;
}

export function filterPremiumEvalFixtures(
  fixtures: readonly PremiumEvalFixture[],
  caseId: string | null,
): readonly PremiumEvalFixture[] {
  return caseId === null ? fixtures : fixtures.filter((fixture) => fixture.id === caseId);
}

function readJsonFile(path: string): unknown {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  return parsed;
}
