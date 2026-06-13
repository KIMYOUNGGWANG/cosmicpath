import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import {
  filterPremiumEvalFixtures,
  readPremiumEvalFixtures,
  type PremiumEvalFixture,
} from './premium-report-eval/fixture-file.ts';
import { registerTypeScriptLoader } from './report-test-data/ts-loader.ts';

type GenerateMode = 'dry_run' | 'live_phase' | 'live_full';

type GenerateCliOptions = {
  readonly fixturePath: string | null;
  readonly outputDir: string;
  readonly caseId: string | null;
  readonly phase: number;
  readonly full: boolean;
  readonly dryRun: boolean;
};

type PremiumGenerationApi = {
  readonly generateSinglePhase: (
    phaseNumber: number,
    userData: Record<string, unknown>,
    previousData: Record<string, unknown> | null,
    apiKey: string,
  ) => Promise<{ readonly success: boolean; readonly data: unknown; readonly error?: string }>;
  readonly generatePremiumReport: (
    userData: Record<string, unknown>,
    apiKey: string,
  ) => Promise<{ readonly success: boolean; readonly report: unknown; readonly error?: string }>;
};

const localRequire = createRequire(import.meta.url);
const DEFAULT_OUTPUT_DIR = join(process.cwd(), '.tmp', 'generated-premium-reports');

function parseOptions(argv: readonly string[]): GenerateCliOptions {
  return {
    fixturePath: flagValue(argv, '--fixture'),
    outputDir: flagValue(argv, '--output') ?? DEFAULT_OUTPUT_DIR,
    caseId: flagValue(argv, '--case'),
    phase: parsePhase(flagValue(argv, '--phase')),
    full: argv.includes('--full'),
    dryRun: argv.includes('--dry-run'),
  };
}

async function generateArtifact(
  fixture: PremiumEvalFixture,
  options: GenerateCliOptions,
  api: PremiumGenerationApi | null,
): Promise<unknown> {
  if (options.dryRun) return dryRunArtifact(fixture, options.phase);
  if (api === null) throw new TypeError('premium generation API is required for live generation');

  const apiKey = apiKeyFromEnv();
  if (options.full) {
    const result = await api.generatePremiumReport(fixture.premiumUserData, apiKey);
    return resultArtifact(fixture, 'live_full', null, result.success, result.report, result.error);
  }

  const result = await api.generateSinglePhase(options.phase, fixture.premiumUserData, null, apiKey);
  return resultArtifact(fixture, 'live_phase', options.phase, result.success, result.data, result.error);
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const restoreLoader = registerTypeScriptLoader();
  try {
    const api = options.dryRun ? null : loadPremiumGenerationApi();
    const fixtures = filterPremiumEvalFixtures(readPremiumEvalFixtures(options.fixturePath ?? undefined), options.caseId);
    if (fixtures.length === 0) throw new Error(`No premium eval fixtures matched case: ${options.caseId ?? '<all>'}`);
    mkdirSync(options.outputDir, { recursive: true });
    for (const fixture of fixtures) {
      const artifact = await generateArtifact(fixture, options, api);
      const outputPath = join(options.outputDir, `${fixture.id}.json`);
      writeFileSync(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
      console.log(`wrote ${outputPath}`);
    }
  } finally {
    restoreLoader();
  }
}

function dryRunArtifact(fixture: PremiumEvalFixture, phase: number): unknown {
  return resultArtifact(fixture, 'dry_run', phase, true, {
    dryRun: true,
    input: fixture.premiumUserData,
    note: 'Dry run only verifies eval-output persistence. Use live mode to generate model report text.',
  });
}

function resultArtifact(
  fixture: PremiumEvalFixture,
  mode: GenerateMode,
  phase: number | null,
  success: boolean,
  report: unknown,
  error?: string,
): unknown {
  return {
    caseId: fixture.id,
    label: fixture.label,
    generatedAt: new Date().toISOString(),
    mode,
    phase,
    success,
    error,
    premiumUserData: fixture.premiumUserData,
    report,
  };
}

function loadPremiumGenerationApi(): PremiumGenerationApi {
  const loaded: unknown = localRequire('../src/lib/ai/premium-reading-service.ts');
  if (isPremiumGenerationApi(loaded)) return loaded;
  throw new TypeError('premium generation API unavailable');
}

function isPremiumGenerationApi(value: unknown): value is PremiumGenerationApi {
  return isRecord(value) &&
    typeof value.generateSinglePhase === 'function' &&
    typeof value.generatePremiumReport === 'function';
}

function apiKeyFromEnv(): string {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY is required unless --dry-run is used');
  return apiKey;
}

function parsePhase(value: string | null): number {
  const phase = value === null ? 1 : Number(value);
  if (!Number.isInteger(phase) || phase < 1 || phase > 8) throw new Error(`Invalid --phase value: ${value ?? '<missing>'}`);
  return phase;
}

function flagValue(argv: readonly string[], flag: string): string | null {
  const index = argv.findIndex((value) => value === flag);
  return index === -1 ? null : argv[index + 1] ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
