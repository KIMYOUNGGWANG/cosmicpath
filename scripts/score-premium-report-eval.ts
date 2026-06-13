import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { readBaselineEvalArtifacts } from './premium-report-eval/artifacts.ts';
import { readGeneratedReportArtifacts } from './premium-report-eval/generated-reports.ts';
import {
  buildScorecardFromBaselineArtifacts,
  buildScorecardFromGeneratedReports,
  formatScorecardMarkdown,
} from './premium-report-eval/scorecard.ts';
import { writeBaselineArtifacts } from './report-baseline/writer.ts';
import { OUTPUT_PATH } from './report-test-data/cases.ts';

type ScoreCliOptions = {
  readonly inputPath: string | null;
  readonly outputPath: string;
  readonly markdownPath: string;
};

const DEFAULT_OUTPUT_PATH = join(process.cwd(), '.tmp', 'premium-report-eval-scorecard.json');
const DEFAULT_MARKDOWN_PATH = join(process.cwd(), '.tmp', 'premium-report-eval-scorecard.md');

function parseOptions(argv: readonly string[]): ScoreCliOptions {
  return {
    inputPath: flagValue(argv, '--input'),
    outputPath: flagValue(argv, '--output') ?? DEFAULT_OUTPUT_PATH,
    markdownPath: flagValue(argv, '--markdown') ?? DEFAULT_MARKDOWN_PATH,
  };
}

function flagValue(argv: readonly string[], flag: string): string | null {
  const index = argv.findIndex((value) => value === flag);
  return index === -1 ? null : argv[index + 1] ?? null;
}

function writeTextFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

function main(): void {
  const options = parseOptions(process.argv.slice(2));
  const scorecard = options.inputPath
    ? buildScorecardFromGeneratedReports(readGeneratedReportArtifacts(options.inputPath))
    : (() => {
      writeBaselineArtifacts(OUTPUT_PATH);
      return buildScorecardFromBaselineArtifacts(readBaselineEvalArtifacts());
    })();

  writeTextFile(options.outputPath, `${JSON.stringify(scorecard, null, 2)}\n`);
  writeTextFile(options.markdownPath, formatScorecardMarkdown(scorecard));
  console.log(`scorecard=${options.outputPath}`);
  console.log(`markdown=${options.markdownPath}`);
  console.log(`average=${scorecard.averageScore} passed=${scorecard.passCount}/${scorecard.totalCount}`);
}

main();
