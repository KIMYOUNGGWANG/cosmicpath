import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

import { z } from 'zod';

const generatedReportSchema = z.object({
  caseId: z.string().trim().min(1),
  label: z.string().trim().min(1).optional(),
  generatedAt: z.string().optional(),
  mode: z.string().optional(),
  phase: z.number().int().nullable().optional(),
  success: z.boolean().optional(),
  error: z.string().optional(),
  premiumUserData: z.record(z.string(), z.unknown()).optional(),
  report: z.unknown(),
}).strict();

export type GeneratedReportArtifact = {
  readonly id: string;
  readonly caseId: string;
  readonly label: string;
  readonly artifactPath: string;
  readonly success: boolean | null;
  readonly premiumUserData: Record<string, unknown> | null;
  readonly report: unknown;
};

export function readGeneratedReportArtifacts(inputPath: string): readonly GeneratedReportArtifact[] {
  return jsonInputPaths(inputPath).map((artifactPath) => {
    const parsed = generatedReportSchema.parse(readJsonFile(artifactPath));
    return {
      id: basename(artifactPath, extname(artifactPath)),
      caseId: parsed.caseId,
      label: parsed.label ?? parsed.caseId,
      artifactPath,
      success: parsed.success ?? null,
      premiumUserData: parsed.premiumUserData ?? null,
      report: parsed.report,
    };
  });
}

function jsonInputPaths(inputPath: string): readonly string[] {
  const stats = statSync(inputPath);
  if (stats.isFile()) return [inputPath];
  if (!stats.isDirectory()) throw new TypeError(`Unsupported generated report path: ${inputPath}`);
  return readdirSync(inputPath)
    .filter((fileName) => extname(fileName) === '.json')
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => join(inputPath, fileName));
}

function readJsonFile(path: string): unknown {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  return parsed;
}
