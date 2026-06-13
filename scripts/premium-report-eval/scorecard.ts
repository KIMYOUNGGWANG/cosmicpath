import type { EvalBaselineArtifact } from './artifacts.ts';
import {
  buildCommercialReportFromBaselineArtifact,
  buildEvalCaseFromBaselineArtifact,
} from './baseline-adapter.ts';
import { PREMIUM_REPORT_EVAL_CASES, type PremiumReportEvalCase } from './fixtures.ts';
import type { GeneratedReportArtifact } from './generated-reports.ts';
import {
  scoreCommercialReport,
  type CommercialReportDimension,
} from './rubric.ts';

export type ScorecardSource = 'baseline' | 'generated';

export type PremiumReportScorecardItem = {
  readonly id: string;
  readonly caseId: string;
  readonly label: string;
  readonly score: number;
  readonly passed: boolean;
  readonly missingDimensions: readonly CommercialReportDimension[];
  readonly failureReasons: readonly string[];
};

export type PremiumReportScorecard = {
  readonly generatedAt: string;
  readonly source: ScorecardSource;
  readonly totalCount: number;
  readonly passCount: number;
  readonly averageScore: number;
  readonly items: readonly PremiumReportScorecardItem[];
};

type ReportForScoring = {
  readonly id: string;
  readonly caseId: string;
  readonly label: string;
  readonly report: unknown;
  readonly evalCase: PremiumReportEvalCase;
};

export class EvalCaseNotFoundError extends Error {
  readonly caseId: string;

  constructor(caseId: string) {
    super(`No premium report eval case found for generated caseId: ${caseId}`);
    this.name = 'EvalCaseNotFoundError';
    this.caseId = caseId;
  }
}

export function buildScorecardFromBaselineArtifacts(
  artifacts: readonly EvalBaselineArtifact[],
): PremiumReportScorecard {
  return buildScorecard('baseline', artifacts.map((artifact) => ({
    id: artifact.id,
    caseId: artifact.sourceFixtureId,
    label: artifact.label,
    report: buildCommercialReportFromBaselineArtifact(artifact),
    evalCase: buildEvalCaseFromBaselineArtifact(artifact),
  })));
}

export function buildScorecardFromGeneratedReports(
  artifacts: readonly GeneratedReportArtifact[],
): PremiumReportScorecard {
  return buildScorecard('generated', artifacts.map((artifact) => ({
    id: artifact.id,
    caseId: artifact.caseId,
    label: artifact.label,
    report: artifact.report,
    evalCase: evalCaseForGeneratedArtifact(artifact),
  })));
}

export function formatScorecardMarkdown(scorecard: PremiumReportScorecard): string {
  const lines = [
    '# Premium Report Eval Scorecard',
    '',
    `- Source: ${scorecard.source}`,
    `- Average score: ${scorecard.averageScore}`,
    `- Passed: ${scorecard.passCount}/${scorecard.totalCount}`,
    '',
    '| Case | Score | Result | Failures |',
    '|---|---:|---|---|',
    ...scorecard.items.map((item) => [
      item.label,
      String(item.score),
      item.passed ? 'PASS' : 'FAIL',
      item.failureReasons.join('<br>') || '-',
    ].join(' | ')).map((row) => `| ${row} |`),
    '',
  ];
  return `${lines.join('\n')}\n`;
}

function buildScorecard(
  source: ScorecardSource,
  reports: readonly ReportForScoring[],
): PremiumReportScorecard {
  const items = reports.map((report) => {
    const result = scoreCommercialReport(report.report, report.evalCase);
    return {
      id: report.id,
      caseId: report.caseId,
      label: report.label,
      score: result.score,
      passed: result.passed,
      missingDimensions: result.missingDimensions,
      failureReasons: result.failureReasons,
    };
  });
  const totalScore = items.reduce((sum, item) => sum + item.score, 0);
  return {
    generatedAt: new Date().toISOString(),
    source,
    totalCount: items.length,
    passCount: items.filter((item) => item.passed).length,
    averageScore: items.length > 0 ? Math.round((totalScore / items.length) * 10) / 10 : 0,
    items,
  };
}

function evalCaseForGeneratedArtifact(artifact: GeneratedReportArtifact): PremiumReportEvalCase {
  const evalCase = PREMIUM_REPORT_EVAL_CASES.find((item) => item.id === artifact.caseId);
  if (evalCase) return evalCase;
  if (artifact.premiumUserData) return evalCaseFromPremiumUserData(artifact);
  throw new EvalCaseNotFoundError(artifact.caseId);
}

function evalCaseFromPremiumUserData(artifact: GeneratedReportArtifact): PremiumReportEvalCase {
  const data = artifact.premiumUserData ?? {};
  const question = stringField(data, 'question', '종합 질문');
  const name = stringField(data, 'name', '사용자');
  const birthDate = stringField(data, 'birthDate', '1900-01-01');
  return {
    id: artifact.caseId,
    marketNeed: artifact.label,
    name,
    birthDate,
    birthTime: stringField(data, 'birthTime', '12:00'),
    unknownTime: data.unknownTime === true,
    context: contextField(data.context),
    question,
    language: data.language === 'en' ? 'en' : 'ko',
    expected: {
      dominantLayer: 'saju',
      requiredSignals: ['saju_structure', 'astrology_timing', 'tarot_immediate', 'decision_action', 'uncertainty_boundary', 'source_boundary'],
      mustMention: [question, name, birthDate],
      downgradeRules: ['Generated report must preserve source boundaries and unknown-time downgrades when applicable.'],
      commercialValue: 'Generated premium outputs should preserve intake facts and end in a bounded next action.',
    },
  };
}

function contextField(value: unknown): PremiumReportEvalCase['context'] {
  if (value === 'love' || value === 'career' || value === 'money' || value === 'health' || value === 'general') return value;
  return 'general';
}

function stringField(record: Record<string, unknown>, key: string, fallback: string): string {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}
