import { strict as assert } from 'node:assert';

const SUPPORTED_SCENARIOS = ['happy', 'edge', 'regression', 'all'] as const;
type Scenario = (typeof SUPPORTED_SCENARIOS)[number];

type QualityScore = {
  readonly score: number;
  readonly sectionHits: number;
  readonly specificityHits: number;
  readonly genericHits: readonly string[];
  readonly missingSections: readonly string[];
  readonly passed: boolean;
};

type SectionRule = {
  readonly label: string;
  readonly has: (report: unknown) => boolean;
};

class UnsupportedScenarioError extends Error {
  readonly scenario: string;

  constructor(scenario: string) {
    super(`Unsupported premium report quality scenario: ${scenario}`);
    this.name = 'UnsupportedScenarioError';
    this.scenario = scenario;
  }
}

const SPECIFICITY_PATTERNS = [
  /\b\d{4}-\d{2}-\d{2}\b/u,
  /\b(?:within|before|after|by)\s+(?:\d+|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/iu,
  /\b\d+\s?(?:minutes|days|weeks|percent|%)\b/iu,
  /\b(?:saju|day master|four pillars)\b/iu,
  /\b(?:moon|ascendant|transit)\b/iu,
  /\b(?:tarot|card|spread)\b/iu,
  /\b(?:schedule|send|write|decide|avoid|measure)\b/iu,
  /\b(?:risk|constraint|boundary)\b/iu,
  /\b(?:metric|track|compare|evidence)\b/iu,
  /\b(?:seoul|1993|15:10)\b/iu,
] as const;

const GENERIC_PATTERNS = [
  { label: 'trust_your_intuition', pattern: /trust your intuition/iu },
  { label: 'everything_happens', pattern: /everything happens for a reason/iu },
  { label: 'stay_positive', pattern: /stay positive/iu },
  { label: 'just_be_patient', pattern: /just be patient/iu },
  { label: 'universe_will_guide', pattern: /the universe (?:will|is going to) guide/iu },
  { label: 'focus_on_yourself', pattern: /focus on yourself/iu },
] as const;

const REQUIRED_SECTIONS = [
  { label: 'summary', has: hasSummary },
  { label: 'final_verdict', has: hasFinalVerdict },
  { label: 'action_plan', has: hasActionPlan },
  { label: 'source_sections', has: hasSourceSections },
] as const satisfies readonly SectionRule[];

const PREMIUM_REPORT_FIXTURE = {
  summary: {
    title: 'Decision window for the June outreach choice',
    content: 'Use 2026-06-20 as the first review date, then compare evidence within 7 days before Friday.',
    trust_reason: 'The Saju day master pattern, Seoul birth context, 1993-08-02 15:10 timestamp, and Moon transit all point to a measured communication test.',
  },
  final_verdict: {
    core_message: 'Choose the option with the clearest response metric, not the loudest emotional signal.',
    saju_foundation: 'Four Pillars emphasis shows a resource-heavy day master that improves when the boundary is written before outreach.',
    astro_support: 'Moon and ascendant timing favor a short scheduled message rather than a long proposal.',
    tarot_insight: 'The card spread supports one visible decision and one deliberate constraint.',
    action_priorities: 'Schedule 30 minutes, send the first note, track reply quality, and avoid changing the offer mid-test.',
  },
  action_plan: [
    { date: '2026-06-20', title: 'Write the boundary', description: 'Define the risk, the metric, and the exact decision rule before sending.' },
    { date: '2026-06-21', title: 'Send the note', description: 'Use one ask, one deadline, and one comparison point so evidence is clean.' },
    { date: '2026-06-27', title: 'Measure the result', description: 'Compare replies against the metric and decide whether to continue or stop.' },
  ],
  saju_sections: [
    { title: 'Saju signal', content: 'Day master pressure needs a practical boundary and a visible timing rule.' },
  ],
  astro_deep: {
    transit_focus: 'The Moon and ascendant combination favors a specific window, not an open-ended wait.',
  },
} as const;

const GENERIC_REPORT_FIXTURE = {
  summary: {
    title: 'A nice path',
    content: 'Trust your intuition. Everything happens for a reason. Stay positive and just be patient.',
  },
  final_verdict: {
    core_message: 'The universe will guide you. Focus on yourself.',
  },
  action_plan: [{ title: 'Focus', description: 'Focus on yourself.' }],
} as const;

const THIN_REPORT_FIXTURE = {
  summary: {
    title: 'Short',
    content: 'Try again later.',
  },
} as const;

export function scorePremiumReportQuality(report: unknown): QualityScore {
  const text = collectStrings(report).join('\n');
  const missingSections = REQUIRED_SECTIONS.filter((section) => !section.has(report)).map((section) => section.label);
  const sectionHits = REQUIRED_SECTIONS.length - missingSections.length;
  const specificityHits = SPECIFICITY_PATTERNS.filter((pattern) => pattern.test(text)).length;
  const genericHits = GENERIC_PATTERNS.filter((item) => item.pattern.test(text)).map((item) => item.label);
  const rawScore = sectionHits * 15 + Math.min(specificityHits, 8) * 5 - missingSections.length * 15 - genericHits.length * 25;
  const score = Math.max(0, Math.min(100, rawScore));

  return {
    score,
    sectionHits,
    specificityHits,
    genericHits,
    missingSections,
    passed: score >= 80 && missingSections.length === 0 && genericHits.length === 0 && specificityHits >= 6,
  };
}

function collectStrings(value: unknown): readonly string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectStrings(item));
  if (!isRecord(value)) return [];
  return Object.values(value).flatMap((item) => collectStrings(item));
}

function hasSummary(report: unknown): boolean {
  if (!isRecord(report)) return false;
  const summary = report.summary;
  if (!isRecord(summary)) return false;
  return hasUsefulText(summary, 'title') && hasUsefulText(summary, 'content') && hasUsefulText(summary, 'trust_reason');
}

function hasFinalVerdict(report: unknown): boolean {
  if (!isRecord(report)) return false;
  const verdict = report.final_verdict;
  if (!isRecord(verdict)) return false;
  return ['core_message', 'saju_foundation', 'astro_support', 'tarot_insight', 'action_priorities'].every((key) => hasUsefulText(verdict, key));
}

function hasActionPlan(report: unknown): boolean {
  if (!isRecord(report) || !Array.isArray(report.action_plan)) return false;
  return report.action_plan.filter((item) => isSpecificAction(item)).length >= 3;
}

function hasSourceSections(report: unknown): boolean {
  if (!isRecord(report)) return false;
  return collectStrings(report.saju_sections).join(' ').length >= 40 && collectStrings(report.astro_deep).join(' ').length >= 40;
}

function isSpecificAction(item: unknown): boolean {
  if (!isRecord(item)) return false;
  return hasUsefulText(item, 'date') && hasUsefulText(item, 'title') && hasUsefulText(item, 'description');
}

function hasUsefulText(record: Record<string, unknown>, key: string): boolean {
  const value = record[key];
  return typeof value === 'string' && value.trim().length >= 5;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseScenario(argv: readonly string[]): Scenario {
  const scenarioFlagIndex = argv.findIndex((value) => value === '--scenario');
  const scenario = scenarioFlagIndex === -1 ? 'all' : argv[scenarioFlagIndex + 1];
  if (!scenario || !isScenario(scenario)) throw new UnsupportedScenarioError(scenario ?? '<missing>');
  return scenario;
}

function isScenario(value: string): value is Scenario {
  return SUPPORTED_SCENARIOS.some((scenario) => scenario === value);
}

function assertHappyQuality(): QualityScore {
  const result = scorePremiumReportQuality(PREMIUM_REPORT_FIXTURE);
  assert.equal(result.passed, true, JSON.stringify(result));
  assert.equal(result.missingSections.length, 0);
  assert.equal(result.genericHits.length, 0);
  assert.ok(result.specificityHits >= 8, JSON.stringify(result));
  return result;
}

function assertGenericRejected(): void {
  const result = scorePremiumReportQuality(GENERIC_REPORT_FIXTURE);
  assert.equal(result.passed, false, JSON.stringify(result));
  assert.ok(result.genericHits.includes('trust_your_intuition'), JSON.stringify(result));
  console.log('premium_report_quality_generic_rejected');
}

function assertThinReportRejected(): void {
  const result = scorePremiumReportQuality(THIN_REPORT_FIXTURE);
  assert.equal(result.passed, false, JSON.stringify(result));
  assert.ok(result.missingSections.includes('final_verdict'), JSON.stringify(result));
  assert.ok(result.missingSections.includes('action_plan'), JSON.stringify(result));
  console.log('premium_report_quality_thin_report_rejected');
}

function runHappyScenario(): void {
  console.log('scenario=happy');
  const result = assertHappyQuality();
  console.log(`premium_report_quality_score=${result.score} specificity=${result.specificityHits} sections=${result.sectionHits}`);
  console.log('premium_report_quality_happy_contract');
}

function runEdgeScenario(): void {
  console.log('scenario=edge');
  assertGenericRejected();
  assertThinReportRejected();
  assert.throws(() => parseScenario(['--scenario', 'unsupported']), UnsupportedScenarioError);
  console.log('unsupported_scenario_rejected');
}

function runRegressionScenario(scenario: 'regression' | 'all'): void {
  console.log(`scenario=${scenario}`);
  const result = assertHappyQuality();
  assert.equal(result.sectionHits, REQUIRED_SECTIONS.length, JSON.stringify(result));
  assert.ok(result.specificityHits >= 8, JSON.stringify(result));
  console.log('premium_report_quality_structure_regression');
  console.log('premium_report_quality_specificity_regression');
  if (scenario === 'all') {
    assertGenericRejected();
    assertThinReportRejected();
    console.log('premium_report_quality_all_contract');
  }
}

function runScenario(scenario: Scenario): void {
  switch (scenario) {
    case 'happy':
      runHappyScenario();
      return;
    case 'edge':
      runEdgeScenario();
      return;
    case 'regression':
      runRegressionScenario('regression');
      return;
    case 'all':
      runRegressionScenario('all');
      return;
    default:
      throw new UnsupportedScenarioError(String(scenario));
  }
}

try {
  runScenario(parseScenario(process.argv.slice(2)));
  console.log('Premium report quality verification passed');
} catch (error) {
  if (error instanceof UnsupportedScenarioError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
