import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { z } from 'zod';

export type PhaseResult = {
  readonly success: boolean;
  readonly data: Record<string, unknown> | null;
  readonly error?: string;
};

export type PremiumGenerationApi = {
  readonly generateSinglePhase: (
    phaseNumber: number,
    userData: Record<string, unknown>,
    previousData: Record<string, unknown> | null,
    apiKey: string,
  ) => Promise<PhaseResult>;
};

export type ResumeRecoveryKind = 'gemini_spend_cap' | 'gemini_quota' | 'phase_generation_failed';

export type ResumeRecovery = {
  readonly kind: ResumeRecoveryKind;
  readonly phase: number;
  readonly message: string;
  readonly action: string;
  readonly sourceError: string;
};

export type ResumeResult =
  | {
    readonly status: 'complete';
    readonly outputPath: string;
    readonly progressOutputPath: string;
    readonly completedPhases: readonly number[];
    readonly reportKeys: readonly string[];
  }
  | {
    readonly status: 'blocked';
    readonly progressOutputPath: string;
    readonly completedPhases: readonly number[];
    readonly failedPhase: number;
    readonly recovery: ResumeRecovery;
    readonly reportKeys: readonly string[];
  };

export type ResumeOptions = {
  readonly api: PremiumGenerationApi;
  readonly apiKey: string;
  readonly inputPath: string;
  readonly outputPath: string;
  readonly progressOutputPath: string;
  readonly phases: readonly number[];
  readonly finalizeReport?: (
    report: Record<string, unknown>,
    premiumUserData: Record<string, unknown>,
  ) => Record<string, unknown>;
};

const resumableArtifactSchema = z.object({
  caseId: z.string().trim().min(1),
  label: z.string().trim().min(1),
  generatedAt: z.string().optional(),
  mode: z.string().optional(),
  phase: z.number().int().nullable().optional(),
  success: z.boolean().optional(),
  error: z.string().optional(),
  premiumUserData: z.record(z.string(), z.unknown()),
  report: z.record(z.string(), z.unknown()),
}).passthrough();

type ResumableArtifact = z.infer<typeof resumableArtifactSchema>;

export async function resumePremiumReportArtifact(options: ResumeOptions): Promise<ResumeResult> {
  const sourceArtifact = readResumableArtifact(options.inputPath);
  let report: Record<string, unknown> = { ...sourceArtifact.report };
  const completedPhases: number[] = [];

  for (const phaseNumber of options.phases) {
    const result = await options.api.generateSinglePhase(
      phaseNumber,
      sourceArtifact.premiumUserData,
      report,
      options.apiKey,
    );

    if (!result.success || result.data === null) {
      const recovery = classifyResumeRecovery(phaseNumber, result.error ?? 'Phase returned no data');
      writeResumeArtifact({
        path: options.progressOutputPath,
        sourceArtifact,
        report,
        status: 'blocked',
        completedPhases,
        failedPhase: phaseNumber,
        recovery,
      });
      return {
        status: 'blocked',
        progressOutputPath: options.progressOutputPath,
        completedPhases,
        failedPhase: phaseNumber,
        recovery,
        reportKeys: Object.keys(report),
      };
    }

    report = { ...report, ...result.data };
    completedPhases.push(phaseNumber);
    writeResumeArtifact({
      path: options.progressOutputPath,
      sourceArtifact,
      report,
      status: 'in_progress',
      completedPhases,
    });
  }

  const finalReport = options.finalizeReport
    ? options.finalizeReport(report, sourceArtifact.premiumUserData)
    : report;

  writeResumeArtifact({
    path: options.outputPath,
    sourceArtifact,
    report: finalReport,
    status: 'complete',
    completedPhases,
  });
  writeResumeArtifact({
    path: options.progressOutputPath,
    sourceArtifact,
    report: finalReport,
    status: 'complete',
    completedPhases,
  });

  return {
    status: 'complete',
    outputPath: options.outputPath,
    progressOutputPath: options.progressOutputPath,
    completedPhases,
    reportKeys: Object.keys(finalReport),
  };
}

export function classifyResumeRecovery(phase: number, sourceError: string): ResumeRecovery {
  if (/monthly spending cap|project spend cap|ai\.studio\/spend/iu.test(sourceError)) {
    return {
      kind: 'gemini_spend_cap',
      phase,
      message: `Phase ${phase} is blocked by the Gemini project monthly spending cap.`,
      action: 'Open https://ai.studio/spend, raise or remove the project monthly spend cap, then rerun the resume command. The progress artifact preserves any completed phases.',
      sourceError,
    };
  }

  if (/429|RESOURCE_EXHAUSTED|quota|rate limited/iu.test(sourceError)) {
    return {
      kind: 'gemini_quota',
      phase,
      message: `Phase ${phase} is blocked by a Gemini quota or rate-limit response.`,
      action: 'Wait for quota reset or adjust the Gemini project quota, then rerun the resume command. The progress artifact preserves any completed phases.',
      sourceError,
    };
  }

  return {
    kind: 'phase_generation_failed',
    phase,
    message: `Phase ${phase} generation failed before the resume could finish.`,
    action: 'Inspect the phase error, prompt/schema guard, and progress artifact, then rerun the resume command after fixing the blocker.',
    sourceError,
  };
}

export function formatResumeRecovery(recovery: ResumeRecovery): string {
  return [
    recovery.message,
    `Action: ${recovery.action}`,
    `Source: ${recovery.sourceError}`,
  ].join('\n');
}

function readResumableArtifact(path: string): ResumableArtifact {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  return resumableArtifactSchema.parse(parsed);
}

type WriteResumeArtifactInput = {
  readonly path: string;
  readonly sourceArtifact: ResumableArtifact;
  readonly report: Record<string, unknown>;
  readonly status: 'in_progress' | 'blocked' | 'complete';
  readonly completedPhases: readonly number[];
  readonly failedPhase?: number;
  readonly recovery?: ResumeRecovery;
};

function writeResumeArtifact(input: WriteResumeArtifactInput): void {
  mkdirSync(dirname(input.path), { recursive: true });
  writeFileSync(input.path, `${JSON.stringify({
    ...input.sourceArtifact,
    generatedAt: new Date().toISOString(),
    mode: input.status === 'complete' ? 'live_full_resume_complete' : 'live_full_resume_progress',
    phase: input.status === 'complete' ? null : lastCompletedPhase(input.completedPhases),
    success: input.status === 'complete',
    error: input.recovery?.message,
    report: input.report,
    resume: {
      status: input.status,
      completedPhases: input.completedPhases,
      failedPhase: input.failedPhase,
      recovery: input.recovery,
    },
  }, null, 2)}\n`, 'utf8');
}

function lastCompletedPhase(completedPhases: readonly number[]): number | null {
  return completedPhases.at(-1) ?? null;
}
