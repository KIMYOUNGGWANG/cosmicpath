import { createRequire } from 'node:module';

import {
  formatResumeRecovery,
  resumePremiumReportArtifact,
  type PremiumGenerationApi,
} from './premium-report-eval/resume-artifact.ts';
import { registerTypeScriptLoader } from './report-test-data/ts-loader.ts';

type ResumeCliOptions = {
  readonly inputPath: string;
  readonly outputPath: string;
  readonly progressOutputPath: string;
  readonly phases: readonly number[];
};

type PremiumQualityFinalizer = (
  report: Record<string, unknown>,
  premiumUserData: Record<string, unknown>,
) => Record<string, unknown>;

type PremiumQualityEnvelopeApi = {
  readonly attachPremiumQualityEnvelope: PremiumQualityFinalizer;
};

class ResumeCliInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResumeCliInputError';
  }
}

const localRequire = createRequire(import.meta.url);

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const apiKey = apiKeyFromEnv();
  const restoreLoader = registerTypeScriptLoader();
  try {
    const result = await resumePremiumReportArtifact({
      api: loadPremiumGenerationApi(),
      apiKey,
      inputPath: options.inputPath,
      outputPath: options.outputPath,
      progressOutputPath: options.progressOutputPath,
      phases: options.phases,
      finalizeReport: loadPremiumQualityFinalizer(),
    });

    if (result.status === 'complete') {
      console.log(`complete=${result.outputPath}`);
      console.log(`progress=${result.progressOutputPath}`);
      console.log(`completedPhases=${result.completedPhases.join(',')}`);
      console.log(`keys=${result.reportKeys.join(',')}`);
      return;
    }

    console.error(formatResumeRecovery(result.recovery));
    console.log(`progress=${result.progressOutputPath}`);
    console.log(`completedPhases=${result.completedPhases.join(',') || '<none>'}`);
    console.log(`failedPhase=${result.failedPhase}`);
    console.log(`keys=${result.reportKeys.join(',')}`);
    process.exitCode = 2;
  } finally {
    restoreLoader();
  }
}

function parseOptions(argv: readonly string[]): ResumeCliOptions {
  const inputPath = requiredFlagValue(argv, '--input');
  const outputPath = requiredFlagValue(argv, '--output');
  return {
    inputPath,
    outputPath,
    progressOutputPath: flagValue(argv, '--progress-output') ?? defaultProgressOutputPath(outputPath),
    phases: parsePhases(flagValue(argv, '--phases') ?? '7,8'),
  };
}

function parsePhases(value: string): readonly number[] {
  const phases = value.split(',').map((item) => Number(item.trim()));
  if (
    phases.length === 0 ||
    phases.some((phaseNumber) => !Number.isInteger(phaseNumber) || phaseNumber < 1 || phaseNumber > 8)
  ) {
    throw new ResumeCliInputError(`Invalid --phases value: ${value}`);
  }
  return phases;
}

function requiredFlagValue(argv: readonly string[], flag: string): string {
  const value = flagValue(argv, flag);
  if (!value) throw new ResumeCliInputError(`${flag} is required`);
  return value;
}

function flagValue(argv: readonly string[], flag: string): string | null {
  const index = argv.findIndex((value) => value === flag);
  return index === -1 ? null : argv[index + 1] ?? null;
}

function defaultProgressOutputPath(outputPath: string): string {
  return /\.json$/u.test(outputPath)
    ? outputPath.replace(/\.json$/u, '.progress.json')
    : `${outputPath}.progress.json`;
}

function apiKeyFromEnv(): string {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new ResumeCliInputError('GOOGLE_AI_API_KEY is required');
  return apiKey;
}

function loadPremiumGenerationApi(): PremiumGenerationApi {
  const loaded: unknown = localRequire('../src/lib/ai/premium-reading-service.ts');
  if (isPremiumGenerationApi(loaded)) return loaded;
  throw new ResumeCliInputError('premium generation API unavailable');
}

function loadPremiumQualityFinalizer(): PremiumQualityFinalizer {
  const loaded: unknown = localRequire('../src/lib/ai/premium-quality-envelope.ts');
  if (isPremiumQualityEnvelopeApi(loaded)) return loaded.attachPremiumQualityEnvelope;
  throw new ResumeCliInputError('premium quality envelope API unavailable');
}

function isPremiumGenerationApi(value: unknown): value is PremiumGenerationApi {
  return isRecord(value) && typeof value.generateSinglePhase === 'function';
}

function isPremiumQualityEnvelopeApi(value: unknown): value is PremiumQualityEnvelopeApi {
  return isRecord(value) && typeof value.attachPremiumQualityEnvelope === 'function';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown resume failure');
  }
  process.exit(1);
});
