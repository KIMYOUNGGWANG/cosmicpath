import { strict as assert } from 'node:assert';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { z } from 'zod';

import {
  resumePremiumReportArtifact,
  type PremiumGenerationApi,
} from './premium-report-eval/resume-artifact.ts';

const resumedArtifactSchema = z.object({
  success: z.boolean(),
  report: z.record(z.string(), z.unknown()),
  resume: z.object({
    status: z.string(),
    completedPhases: z.array(z.number().int()),
    failedPhase: z.number().int().optional(),
    recovery: z.object({ kind: z.string() }).optional(),
  }).strict(),
}).passthrough();

function writePartialArtifact(path: string): void {
  writeFileSync(path, `${JSON.stringify({
    caseId: 'resume-case',
    label: 'Resume Case',
    generatedAt: '2026-06-13T00:00:00.000Z',
    mode: 'live_full',
    phase: null,
    success: false,
    premiumUserData: { name: '김영광', question: '밴쿠버 vs 한국' },
    report: { summary: { title: 'partial' } },
  }, null, 2)}\n`, 'utf8');
}

function readResumedArtifact(path: string): z.infer<typeof resumedArtifactSchema> {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  return resumedArtifactSchema.parse(parsed);
}

async function assertProgressIsSavedWhenLaterPhaseIsBlocked(): Promise<void> {
  const directory = mkdtempSync(join(tmpdir(), 'premium-report-resume-blocked-'));
  try {
    const inputPath = join(directory, 'partial.json');
    const outputPath = join(directory, 'complete.json');
    const progressOutputPath = join(directory, 'progress.json');
    writePartialArtifact(inputPath);

    const api: PremiumGenerationApi = {
      generateSinglePhase: async (phaseNumber) => {
        if (phaseNumber === 7) return { success: true, data: { special_analysis: { title: 'phase 7' } } };
        return {
          success: false,
          data: null,
          error: 'API Error: 429 RESOURCE_EXHAUSTED Your project has exceeded its monthly spending cap. https://ai.studio/spend',
        };
      },
    };

    const result = await resumePremiumReportArtifact({
      api,
      apiKey: 'test-key',
      inputPath,
      outputPath,
      progressOutputPath,
      phases: [7, 8],
      finalizeReport: (report) => ({ ...report, qualityEnvelope: true }),
    });

    assert.equal(result.status, 'blocked');
    assert.equal(existsSync(outputPath), false);
    const progress = readResumedArtifact(progressOutputPath);
    assert.equal(progress.success, false);
    assert.equal(progress.resume.status, 'blocked');
    assert.deepEqual(progress.resume.completedPhases, [7]);
    assert.equal(progress.resume.failedPhase, 8);
    assert.equal(progress.resume.recovery?.kind, 'gemini_spend_cap');
    assert.ok('special_analysis' in progress.report);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

async function assertCompleteArtifactIsWrittenWhenAllPhasesPass(): Promise<void> {
  const directory = mkdtempSync(join(tmpdir(), 'premium-report-resume-complete-'));
  try {
    const inputPath = join(directory, 'partial.json');
    const outputPath = join(directory, 'complete.json');
    const progressOutputPath = join(directory, 'progress.json');
    writePartialArtifact(inputPath);

    const api: PremiumGenerationApi = {
      generateSinglePhase: async (phaseNumber) => ({
        success: true,
        data: phaseNumber === 7
          ? { special_analysis: { title: 'phase 7' } }
          : { final_verdict: { title: 'phase 8' } },
      }),
    };

    const result = await resumePremiumReportArtifact({
      api,
      apiKey: 'test-key',
      inputPath,
      outputPath,
      progressOutputPath,
      phases: [7, 8],
      finalizeReport: (report) => ({ ...report, qualityEnvelope: true }),
    });

    assert.equal(result.status, 'complete');
    const complete = readResumedArtifact(outputPath);
    assert.equal(complete.success, true);
    assert.deepEqual(complete.resume.completedPhases, [7, 8]);
    assert.ok('special_analysis' in complete.report);
    assert.ok('final_verdict' in complete.report);
    assert.equal(complete.report.qualityEnvelope, true);
    assert.ok(result.reportKeys.includes('qualityEnvelope'));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

await assertProgressIsSavedWhenLaterPhaseIsBlocked();
await assertCompleteArtifactIsWrittenWhenAllPhasesPass();
console.log('premium_report_resume_persists_progress_and_recovery_guidance');
