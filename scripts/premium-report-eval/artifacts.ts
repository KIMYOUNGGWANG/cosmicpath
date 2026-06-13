import { readFileSync } from 'node:fs';

import { z } from 'zod';

import { BASELINE_INDEX_PATH } from '../report-baseline/writer.ts';

const qualityAnchorsSchema = z.object({
  mustMention: z.array(z.string()),
  caveats: z.array(z.string()),
  sourceBoundaries: z.array(z.string()),
}).strict();

const baselineArtifactSchema = z.object({
  id: z.string(),
  label: z.string(),
  sourceFixtureId: z.string(),
  generatedAt: z.string(),
  premiumUserData: z.record(z.string(), z.unknown()),
  qualityAnchors: qualityAnchorsSchema,
  report: z.object({
    summary: z.object({ title: z.string(), content: z.string() }).strict(),
    sections: z.array(z.object({
      family: z.enum(['saju', 'astrology', 'tarot', 'sourceBoundary']),
      title: z.string(),
      content: z.string(),
    }).strict()),
    phaseOnePayload: z.record(z.string(), z.unknown()),
  }).strict(),
}).strict();

const baselineIndexSchema = z.object({
  cases: z.array(z.object({
    id: z.string(),
    label: z.string(),
    artifactPath: z.string(),
  }).strict()),
}).passthrough();

export type EvalBaselineArtifact = z.infer<typeof baselineArtifactSchema>;

export function readBaselineEvalArtifacts(indexPath: string = BASELINE_INDEX_PATH): readonly EvalBaselineArtifact[] {
  const index = baselineIndexSchema.parse(readJsonFile(indexPath));
  return index.cases.map((caseItem) => baselineArtifactSchema.parse(readJsonFile(caseItem.artifactPath)));
}

function readJsonFile(path: string): unknown {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  return parsed;
}
