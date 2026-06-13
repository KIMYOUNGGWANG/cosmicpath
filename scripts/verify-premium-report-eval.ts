import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  INVALID_INTAKE_EVAL_CASES,
  PREMIUM_REPORT_EVAL_CASES,
} from './premium-report-eval/fixtures.ts';
import {
  GENERIC_ASTROLOGY_ONLY_REPORT,
  MISSING_BIRTH_TIME_BOUNDARY_REPORT,
  buildPassingCommercialReport,
} from './premium-report-eval/sample-reports.ts';
import {
  evaluateIntakeReadiness,
  expectedMissingFields,
  scoreCommercialReport,
} from './premium-report-eval/rubric.ts';
import {
  buildCommercialReportFromBaselineArtifact,
  buildEvalCaseFromBaselineArtifact,
} from './premium-report-eval/baseline-adapter.ts';
import { readBaselineEvalArtifacts } from './premium-report-eval/artifacts.ts';
import { readGeneratedReportArtifacts } from './premium-report-eval/generated-reports.ts';
import {
  buildScorecardFromGeneratedReports,
  formatScorecardMarkdown,
} from './premium-report-eval/scorecard.ts';
import { writeBaselineArtifacts } from './report-baseline/writer.ts';
import { OUTPUT_PATH } from './report-test-data/cases.ts';
import { registerTypeScriptLoader } from './report-test-data/ts-loader.ts';

type PromptApi = {
  readonly buildPhase1Prompt: (userData: unknown) => { readonly system: string; readonly user: string };
};

const localRequire = createRequire(import.meta.url);

function assertCasePackCoverage(): void {
  assert.ok(PREMIUM_REPORT_EVAL_CASES.length >= 10, 'eval case pack should cover at least 10 paid-report situations');
  assert.ok(PREMIUM_REPORT_EVAL_CASES.some((item) => item.unknownTime), 'unknown birth time case missing');
  assert.ok(PREMIUM_REPORT_EVAL_CASES.some((item) => item.partner), 'partner compatibility case missing');
  assert.ok(PREMIUM_REPORT_EVAL_CASES.some((item) => item.language === 'en'), 'English report case missing');
  assert.deepEqual(new Set(PREMIUM_REPORT_EVAL_CASES.map((item) => item.context)), new Set(['love', 'career', 'money', 'general', 'health']));

  for (const caseItem of PREMIUM_REPORT_EVAL_CASES) {
    const readiness = evaluateIntakeReadiness(caseItem);
    assert.equal(readiness.ready, true, `${caseItem.id}:${readiness.missingFields.join(',')}`);
  }

  console.log('premium_report_eval_case_pack_covers_core_market_needs');
}

function assertInvalidIntakesRejected(): void {
  for (const caseItem of INVALID_INTAKE_EVAL_CASES) {
    const readiness = evaluateIntakeReadiness(caseItem);
    assert.equal(readiness.ready, false, caseItem.id);
    assert.deepEqual(readiness.missingFields, expectedMissingFields(caseItem));
  }

  console.log('premium_report_eval_rejects_question_only_cta_input');
}

function assertKimVancouverVisaPremiumCase(): void {
  const caseItem = PREMIUM_REPORT_EVAL_CASES.find((item) => item.id === 'kim-vancouver-visa-premium');
  assert.ok(caseItem, 'kim-vancouver-visa-premium case missing');
  assert.equal(caseItem.name, '김영광');
  assert.equal(caseItem.birthDate, '1993-08-02');
  assert.equal(caseItem.birthTime, '15:10');
  assert.equal(caseItem.context, 'career');
  assert.equal(caseItem.language, 'ko');
  assert.equal(caseItem.expected.dominantLayer, 'saju');
  assert.equal(caseItem.unknownTime, false);

  for (const marker of ['밴쿠버', '한국', '11월', '비자'] as const) {
    assert.ok(caseItem.question.includes(marker), `${caseItem.id}:question:${marker}`);
    assert.ok(caseItem.expected.mustMention.includes(marker), `${caseItem.id}:mustMention:${marker}`);
  }

  console.log('premium_report_eval_includes_kim_vancouver_visa_case');
}

function assertRubricScoring(): void {
  for (const caseItem of PREMIUM_REPORT_EVAL_CASES.slice(0, 5)) {
    const result = scoreCommercialReport(buildPassingCommercialReport(caseItem), caseItem);
    assert.equal(result.passed, true, `${caseItem.id}:${JSON.stringify(result)}`);
    assert.equal(result.failureReasons.length, 0, `${caseItem.id}:${result.failureReasons.join(',')}`);
  }

  const genericResult = scoreCommercialReport(GENERIC_ASTROLOGY_ONLY_REPORT, PREMIUM_REPORT_EVAL_CASES[0]);
  assert.equal(genericResult.passed, false, JSON.stringify(genericResult));
  assert.ok(genericResult.missingDimensions.includes('saju_first_structure'), JSON.stringify(genericResult));
  assert.ok(genericResult.genericHits.length >= 1, JSON.stringify(genericResult));

  const unknownTimeCase = PREMIUM_REPORT_EVAL_CASES.find((item) => item.unknownTime);
  assert.ok(unknownTimeCase, 'unknown time case missing');
  const boundaryResult = scoreCommercialReport(MISSING_BIRTH_TIME_BOUNDARY_REPORT, unknownTimeCase);
  assert.equal(boundaryResult.passed, false, JSON.stringify(boundaryResult));
  assert.ok(boundaryResult.missingDimensions.includes('uncertainty_boundary'), JSON.stringify(boundaryResult));

  console.log('premium_report_eval_rubric_accepts_specific_three_layer_reports');
  console.log('premium_report_eval_rubric_rejects_generic_or_missing_boundary_reports');
}

function assertBaselineArtifactsScore(): void {
  const index = writeBaselineArtifacts(OUTPUT_PATH);
  const artifacts = readBaselineEvalArtifacts();
  assert.equal(artifacts.length, index.cases.length, 'baseline artifact count mismatch');

  for (const artifact of artifacts) {
    const result = scoreCommercialReport(
      buildCommercialReportFromBaselineArtifact(artifact),
      buildEvalCaseFromBaselineArtifact(artifact),
    );
    assert.equal(result.passed, true, `${artifact.id}:${JSON.stringify(result)}`);
  }

  console.log('premium_report_eval_scores_real_baseline_artifacts');
}

function assertGeneratedScorecard(): void {
  const directory = mkdtempSync(join(tmpdir(), 'premium-report-eval-'));
  const caseItem = PREMIUM_REPORT_EVAL_CASES[0];
  try {
    writeGeneratedReport(directory, 'passing.json', {
      caseId: caseItem.id,
      label: 'passing generated report',
      report: buildPassingCommercialReport(caseItem),
    });
    writeGeneratedReport(directory, 'generic.json', {
      caseId: caseItem.id,
      label: 'generic generated report',
      report: GENERIC_ASTROLOGY_ONLY_REPORT,
    });
    writeGeneratedReport(directory, 'runtime-fixture.json', {
      caseId: 'runtime-fixture-case',
      label: 'runtime generated report',
      premiumUserData: premiumUserDataForGeneratedArtifact(caseItem),
      report: buildPassingCommercialReport(caseItem),
    });

    const scorecard = buildScorecardFromGeneratedReports(readGeneratedReportArtifacts(directory));
    assert.equal(scorecard.source, 'generated');
    assert.equal(scorecard.totalCount, 3);
    assert.equal(scorecard.passCount, 2);
    assert.ok(scorecard.averageScore > 0 && scorecard.averageScore < 100, JSON.stringify(scorecard));
    const markdown = formatScorecardMarkdown(scorecard);
    assert.match(markdown, /generic generated report/u);
    assert.match(markdown, /runtime generated report/u);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }

  console.log('premium_report_eval_scores_saved_generated_outputs');
}

function assertPromptCoverage(api: PromptApi): void {
  for (const caseItem of PREMIUM_REPORT_EVAL_CASES) {
    const prompt = api.buildPhase1Prompt(buildPromptUserData(caseItem));
    const combined = `${prompt.system}\n${prompt.user}`;
    assert.match(combined, new RegExp(escapeRegExp(caseItem.birthDate), 'u'), caseItem.id);
    assert.match(combined, new RegExp(escapeRegExp(caseItem.question), 'u'), caseItem.id);
    assert.match(combined, /사주는 구조 레이어|Saju is the structure layer/u, caseItem.id);
    assert.match(combined, /점성은 타이밍 레이어|Astrology is the timing layer/u, caseItem.id);
    assert.match(combined, /타로는 즉각 신호 레이어|Tarot is the immediate signal layer/u, caseItem.id);
    assert.match(combined, /근거_계약|GROUNDED_EVIDENCE_CONTRACT/u, caseItem.id);
    assert.match(combined, /KASI\/JPL 계산 검증 전용|KASI\/JPL calculation-only/u, caseItem.id);
    assert.match(combined, /원문 복사 금지|no raw source text copying/u, caseItem.id);
    if (caseItem.unknownTime) assert.match(combined, /시간 미상|unknown time/u, caseItem.id);
  }

  console.log('premium_phase1_prompt_preserves_three_layer_decision_contract_for_eval_cases');
}

function loadPromptApi(): PromptApi {
  const loaded: unknown = localRequire('../src/lib/ai/phase-prompts.ts');
  if (isPromptApi(loaded)) return loaded;
  throw new TypeError('phase prompt API unavailable');
}

function buildPromptUserData(caseItem: (typeof PREMIUM_REPORT_EVAL_CASES)[number]): unknown {
  return {
    name: caseItem.name,
    gender: 'female',
    birthDate: caseItem.birthDate,
    birthTime: caseItem.birthTime,
    unknownTime: caseItem.unknownTime,
    context: caseItem.context,
    question: caseItem.question,
    language: caseItem.language,
    currentDate: '2026-06-12',
    sajuData: {
      dayMaster: '甲',
      yeonPillar: { stem: '癸', branch: '酉' },
      monthPillar: { stem: '己', branch: '未' },
      dayPillar: { stem: '甲', branch: '子' },
      hourPillar: { stem: '壬', branch: '申' },
      daeun: { currentDaeun: { stem: '庚', branch: '戌' } },
      sewoon: { year: 2026, stem: '丙', branch: '午' },
    },
    astroData: { sunSign: 'Leo', moonSign: 'Scorpio', ascendant: caseItem.unknownTime ? undefined : 'Libra' },
    tarotCards: [
      { name: '전차', nameEn: 'The Chariot', isReversed: false },
      { name: '검 2', nameEn: 'Two of Swords', isReversed: true },
      { name: '별', nameEn: 'The Star', isReversed: false },
    ],
    partnerName: caseItem.partner?.name,
    partnerBirthDate: caseItem.partner?.birthDate,
    partnerBirthTime: caseItem.partner?.birthTime,
  };
}

function isPromptApi(value: unknown): value is PromptApi {
  return isRecord(value) && typeof value.buildPhase1Prompt === 'function';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function writeGeneratedReport(directory: string, fileName: string, value: unknown): void {
  writeFileSync(join(directory, fileName), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function premiumUserDataForGeneratedArtifact(caseItem: (typeof PREMIUM_REPORT_EVAL_CASES)[number]): Record<string, unknown> {
  return {
    name: caseItem.name,
    birthDate: caseItem.birthDate,
    birthTime: caseItem.birthTime,
    unknownTime: caseItem.unknownTime,
    context: caseItem.context,
    question: caseItem.question,
    language: caseItem.language,
  };
}

const restoreLoader = registerTypeScriptLoader();
try {
  assertCasePackCoverage();
  assertInvalidIntakesRejected();
  assertKimVancouverVisaPremiumCase();
  assertRubricScoring();
  assertBaselineArtifactsScore();
  assertGeneratedScorecard();
  assertPromptCoverage(loadPromptApi());
  console.log('Premium report eval verification passed');
} finally {
  restoreLoader();
}
