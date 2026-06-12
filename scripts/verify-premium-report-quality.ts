import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const SUPPORTED_SCENARIOS = ['happy', 'edge', 'regression', 'all'] as const;
type Scenario = (typeof SUPPORTED_SCENARIOS)[number];

type QualityScore = {
  readonly score: number;
  readonly sectionHits: number;
  readonly specificityHits: number;
  readonly evidenceBlockCount: number;
  readonly totalTextLength: number;
  readonly genericHits: readonly string[];
  readonly missingSections: readonly string[];
  readonly missingEvidenceFamilies: readonly string[];
  readonly failureReasons: readonly string[];
  readonly passed: boolean;
};

type SectionRule = {
  readonly label: string;
  readonly minimumTextLength: number;
  readonly minimumEvidenceBlocks: number;
  readonly evidenceFamilies: readonly EvidenceFamily[];
  readonly has: (report: unknown) => boolean;
};

type EvidenceFamily =
  | 'calculation'
  | 'myeongli_doctrine'
  | 'astrology_doctrine'
  | 'tarot_rws'
  | 'safety_boundary'
  | 'provider_recovery'
  | 'product_synthesis';

type ReportMode = 'full_premium' | 'degraded_premium' | 'fallback_static';

type EvidenceBlock = {
  readonly id: string;
  readonly sectionId: string;
  readonly family: EvidenceFamily;
  readonly sourceClaimId: string;
  readonly userImplication: string;
  readonly actionOrBoundary: string;
};

type SectionSnapshot = {
  readonly sectionId: string;
  readonly title: string;
  readonly content: string;
  readonly evidenceBlockIds: readonly string[];
};

type PremiumQualityFixture = {
  readonly reportMode: ReportMode;
  readonly providerRecovery?: {
    readonly attempted: boolean;
    readonly visibleToCustomer: boolean;
    readonly reason: string;
  };
  readonly sections?: readonly SectionSnapshot[];
  readonly evidenceBlocks?: readonly EvidenceBlock[];
  readonly summary?: Record<string, unknown>;
  readonly final_verdict?: Record<string, unknown>;
  readonly action_plan?: readonly unknown[];
  readonly saju_sections?: readonly unknown[];
  readonly astro_deep?: unknown;
  readonly tarot_details?: readonly unknown[];
  readonly provenance_appendix?: unknown;
};

class UnsupportedScenarioError extends Error {
  readonly scenario: string;

  constructor(scenario: string) {
    super(`Unsupported premium report quality scenario: ${scenario}`);
    this.name = 'UnsupportedScenarioError';
    this.scenario = scenario;
  }
}

class FixtureCliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FixtureCliError';
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
  {
    label: 'summary',
    minimumTextLength: 180,
    minimumEvidenceBlocks: 2,
    evidenceFamilies: ['calculation', 'safety_boundary'],
    has: hasSummary,
  },
  {
    label: 'method_and_source_roles',
    minimumTextLength: 220,
    minimumEvidenceBlocks: 2,
    evidenceFamilies: ['calculation', 'myeongli_doctrine', 'product_synthesis'],
    has: hasMethodAndSourceRoles,
  },
  {
    label: 'saju_doctrine',
    minimumTextLength: 420,
    minimumEvidenceBlocks: 4,
    evidenceFamilies: ['calculation', 'myeongli_doctrine', 'safety_boundary'],
    has: hasSajuDoctrine,
  },
  {
    label: 'astrology_doctrine',
    minimumTextLength: 280,
    minimumEvidenceBlocks: 3,
    evidenceFamilies: ['calculation', 'astrology_doctrine'],
    has: hasAstrologyDoctrine,
  },
  {
    label: 'tarot_spread',
    minimumTextLength: 260,
    minimumEvidenceBlocks: 3,
    evidenceFamilies: ['tarot_rws', 'safety_boundary'],
    has: hasTarotSpread,
  },
  {
    label: 'action_plan',
    minimumTextLength: 220,
    minimumEvidenceBlocks: 2,
    evidenceFamilies: ['calculation', 'safety_boundary'],
    has: hasActionPlan,
  },
  {
    label: 'provenance_appendix',
    minimumTextLength: 220,
    minimumEvidenceBlocks: 2,
    evidenceFamilies: ['provider_recovery', 'product_synthesis'],
    has: hasProvenanceAppendix,
  },
  {
    label: 'final_verdict',
    minimumTextLength: 240,
    minimumEvidenceBlocks: 3,
    evidenceFamilies: ['calculation', 'myeongli_doctrine', 'safety_boundary'],
    has: hasFinalVerdict,
  },
] as const satisfies readonly SectionRule[];

const PREMIUM_REPORT_FIXTURE: PremiumQualityFixture = {
  reportMode: 'full_premium',
  providerRecovery: {
    attempted: false,
    visibleToCustomer: true,
    reason: 'primary_provider_completed',
  },
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
  tarot_details: [
    {
      cardId: 'major-chariot',
      position: 'advice',
      orientation: 'upright',
      sourceClaimId: 'tarot.rws.major-chariot.upright',
      interpretation: 'The Tarot spread supports one visible decision, one constraint, and one review boundary.',
    },
  ],
  provenance_appendix: {
    content: 'Source roles are visible: KASI-style calculation references are calculation-only, Myeongli doctrine claims require approved rule IDs, RWS Tarot uses card-level source claim IDs, and provider recovery is shown when used.',
  },
  sections: [
    buildSection('summary', 'Verdict snapshot', 'The 2026-06-20 review date anchors the reading. The Saju day master, current timing flow, and Tarot advice all point to one testable outreach before any larger decision. The result should be measured by reply quality, not emotional intensity.', ['calc.birth-context', 'safety.boundary']),
    buildSection('method_and_source_roles', 'Method and source roles', 'Calculation records are used only for chart facts; doctrine records explain meaning; product synthesis turns those signals into advice. KASI-like calendar facts are never treated as Myeongli interpretation, and Tarot image rights remain separate from Waite text. This keeps the premium report from sounding certain where the source role is only computational.', ['calc.source-role', 'myeongli.role', 'synthesis.role']),
    buildSection('saju_doctrine', 'Saju doctrine deep reading', 'The day master and month branch create a decision pattern: enough structure to judge risk, but enough pressure to delay action when the criteria keep expanding. The report links that pattern to the user question by asking for a written boundary before outreach. It avoids claiming guaranteed fate; the boundary is a review condition that protects the user from over-reading one signal. A premium section must then explain how the same pattern appears in work, relationship, and money decisions, because otherwise the user only receives an abstract label. This section therefore turns the Myeongli claim into one decision rule: define the evidence threshold first, act once, and review only after the agreed window.', ['calc.day-master', 'myeongli.month-command', 'safety.no-fate', 'myeongli.action']),
    buildSection('astrology_doctrine', 'Astrology doctrine', 'The Moon, ascendant, and transit layer are supporting evidence, not a replacement for the computed chart. They frame timing as a review window rather than a guaranteed event. If a birth time were missing, houses and ascendant claims would be downgraded instead of presented as exact.', ['astro.moon', 'astro.ascendant', 'calc.unknown-time']),
    buildSection('tarot_spread', 'Tarot spread', 'The RWS card record cites major-chariot with upright orientation and a card-level claim ID. The spread position is advice, so it can shape the action boundary but cannot invent a new card meaning. Image provenance is not assumed from a Commons category; text-only fallback remains acceptable for paid PDF until file audits pass.', ['tarot.rws.major-chariot.upright', 'safety.tarot-boundary', 'tarot.image-fallback']),
    buildSection('action_plan', 'Action plan', 'First, write the decision boundary on 2026-06-20. Second, send one note with one ask. Third, compare replies after 7 days and stop if the metric is weak. This turns the reading into a controlled test and reduces the risk of acting from a single emotional spike.', ['calc.review-date', 'safety.action-boundary']),
    buildSection('provenance_appendix', 'Provenance appendix', 'The appendix lists calculation, doctrine, Tarot, synthesis, safety, and provider state separately. It states that the primary provider completed the report and that no hidden fallback was used. If recovery were used, the customer-visible report mode would become degraded_premium.', ['provider.primary-completed', 'synthesis.boundary']),
    buildSection('final_verdict', 'Final verdict', 'The conclusion repeats only claims already supported by evidence blocks: test one outreach, measure the reply quality, and avoid changing the offer mid-test. The Saju foundation supplies the decision pattern, astrology supplies timing caution, Tarot supplies the advice posture, and the safety boundary prevents a guaranteed outcome claim.', ['calc.final', 'myeongli.final', 'safety.final']),
  ],
  evidenceBlocks: [
    block('calc.birth-context', 'summary', 'calculation'),
    block('safety.boundary', 'summary', 'safety_boundary'),
    block('calc.source-role', 'method_and_source_roles', 'calculation'),
    block('myeongli.role', 'method_and_source_roles', 'myeongli_doctrine'),
    block('synthesis.role', 'method_and_source_roles', 'product_synthesis'),
    block('calc.day-master', 'saju_doctrine', 'calculation'),
    block('myeongli.month-command', 'saju_doctrine', 'myeongli_doctrine'),
    block('safety.no-fate', 'saju_doctrine', 'safety_boundary'),
    block('myeongli.action', 'saju_doctrine', 'myeongli_doctrine'),
    block('astro.moon', 'astrology_doctrine', 'astrology_doctrine'),
    block('astro.ascendant', 'astrology_doctrine', 'astrology_doctrine'),
    block('calc.unknown-time', 'astrology_doctrine', 'calculation'),
    block('tarot.rws.major-chariot.upright', 'tarot_spread', 'tarot_rws'),
    block('safety.tarot-boundary', 'tarot_spread', 'safety_boundary'),
    block('tarot.image-fallback', 'tarot_spread', 'tarot_rws'),
    block('calc.review-date', 'action_plan', 'calculation'),
    block('safety.action-boundary', 'action_plan', 'safety_boundary'),
    block('provider.primary-completed', 'provenance_appendix', 'provider_recovery'),
    block('synthesis.boundary', 'provenance_appendix', 'product_synthesis'),
    block('calc.final', 'final_verdict', 'calculation'),
    block('myeongli.final', 'final_verdict', 'myeongli_doctrine'),
    block('safety.final', 'final_verdict', 'safety_boundary'),
  ],
} as const;

const GENERIC_REPORT_FIXTURE: PremiumQualityFixture = {
  reportMode: 'full_premium',
  summary: {
    title: 'A nice path',
    content: 'Trust your intuition. Everything happens for a reason. Stay positive and just be patient.',
  },
  final_verdict: {
    core_message: 'The universe will guide you. Focus on yourself.',
  },
  action_plan: [{ title: 'Focus', description: 'Focus on yourself.' }],
} as const;

const THIN_REPORT_FIXTURE: PremiumQualityFixture = {
  reportMode: 'full_premium',
  summary: {
    title: 'Short',
    content: 'Try again later.',
  },
} as const;

const LONG_GENERIC_REPORT_FIXTURE: PremiumQualityFixture = {
  reportMode: 'full_premium',
  sections: REQUIRED_SECTIONS.map((section) => buildSection(
    section.label,
    section.label,
    Array.from({ length: 12 }, () => 'The current energy is meaningful and the universe will guide this choice with balance and patience.').join(' '),
    []
  )),
  evidenceBlocks: [],
} as const;

const FALLBACK_MARKED_FULL_PREMIUM_FIXTURE: PremiumQualityFixture = {
  reportMode: 'full_premium',
  providerRecovery: {
    attempted: true,
    visibleToCustomer: false,
    reason: 'gemini_generation_failed',
  },
  sections: [
    buildSection('summary', 'Fallback', 'The paid report could not be fully generated, but here is a short static overview.', []),
  ],
  evidenceBlocks: [],
} as const;

const EVIDENCE_MARKER_ONLY_FIXTURE: PremiumQualityFixture = {
  reportMode: 'full_premium',
  sections: REQUIRED_SECTIONS.map((section) => buildSection(
    section.label,
    section.label,
    `Evidence Claim Source 근거 사주 타로 astrology ${section.label}. `.repeat(18),
    []
  )),
  evidenceBlocks: [],
} as const;

export function scorePremiumReportQuality(report: unknown): QualityScore {
  const text = collectStrings(report).join('\n');
  const evidenceBlocks = collectEvidenceBlocks(report);
  const evidenceBlockCount = evidenceBlocks.length;
  const totalTextLength = text.length;
  const missingSections = REQUIRED_SECTIONS.filter((section) => !section.has(report)).map((section) => section.label);
  const missingEvidenceFamilies = getMissingEvidenceFamilies(evidenceBlocks);
  const sectionEvidenceFailures = getSectionEvidenceFailures(report, evidenceBlocks);
  const modeFailures = getModeFailures(report);
  const sectionHits = REQUIRED_SECTIONS.length - missingSections.length;
  const specificityHits = SPECIFICITY_PATTERNS.filter((pattern) => pattern.test(text)).length;
  const genericHits = GENERIC_PATTERNS.filter((item) => item.pattern.test(text)).map((item) => item.label);
  const failureReasons = [
    ...missingSections.map((section) => `missing_section:${section}`),
    ...missingEvidenceFamilies.map((family) => `missing_evidence_family:${family}`),
    ...sectionEvidenceFailures,
    ...modeFailures,
    ...genericHits.map((hit) => `generic:${hit}`),
    ...(totalTextLength < 2400 ? [`too_short:${totalTextLength}/2400`] : []),
    ...(evidenceBlockCount < 18 ? [`too_few_evidence_blocks:${evidenceBlockCount}/18`] : []),
  ];
  const rawScore =
    sectionHits * 10 +
    Math.min(specificityHits, 8) * 3 +
    Math.min(evidenceBlockCount, 22) * 2 -
    failureReasons.length * 12 -
    genericHits.length * 20;
  const score = Math.max(0, Math.min(100, rawScore));

  return {
    score,
    sectionHits,
    specificityHits,
    evidenceBlockCount,
    totalTextLength,
    genericHits,
    missingSections,
    missingEvidenceFamilies,
    failureReasons,
    passed: score >= 80 &&
      failureReasons.length === 0 &&
      missingSections.length === 0 &&
      genericHits.length === 0 &&
      specificityHits >= 6 &&
      evidenceBlockCount >= 18 &&
      totalTextLength >= 2400,
  };
}

function block(id: string, sectionId: string, family: EvidenceFamily): EvidenceBlock {
  return {
    id,
    sectionId,
    family,
    sourceClaimId: `source.${id}`,
    userImplication: `Implication for ${sectionId}`,
    actionOrBoundary: `Action or boundary for ${sectionId}`,
  };
}

function buildSection(
  sectionId: string,
  title: string,
  content: string,
  evidenceBlockIds: readonly string[]
): SectionSnapshot {
  return { sectionId, title, content, evidenceBlockIds };
}

function collectStrings(value: unknown): readonly string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectStrings(item));
  if (!isRecord(value)) return [];
  return Object.values(value).flatMap((item) => collectStrings(item));
}

function hasSummary(report: unknown): boolean {
  if (hasSection(report, 'summary')) return hasSectionQuality(report, 'summary');
  if (!isRecord(report)) return false;
  const summary = report.summary;
  if (!isRecord(summary)) return false;
  return hasUsefulText(summary, 'title') && hasUsefulText(summary, 'content') && hasUsefulText(summary, 'trust_reason');
}

function hasFinalVerdict(report: unknown): boolean {
  if (hasSection(report, 'final_verdict')) return hasSectionQuality(report, 'final_verdict');
  if (!isRecord(report)) return false;
  const verdict = report.final_verdict;
  if (!isRecord(verdict)) return false;
  return ['core_message', 'saju_foundation', 'astro_support', 'tarot_insight', 'action_priorities'].every((key) => hasUsefulText(verdict, key));
}

function hasActionPlan(report: unknown): boolean {
  if (hasSection(report, 'action_plan')) return hasSectionQuality(report, 'action_plan');
  if (!isRecord(report) || !Array.isArray(report.action_plan)) return false;
  return report.action_plan.filter((item) => isSpecificAction(item)).length >= 3;
}

function hasMethodAndSourceRoles(report: unknown): boolean {
  if (hasSection(report, 'method_and_source_roles')) return hasSectionQuality(report, 'method_and_source_roles');
  if (!isRecord(report)) return false;
  return collectStrings(report.provenance_appendix).join(' ').length >= 180;
}

function hasSajuDoctrine(report: unknown): boolean {
  if (hasSection(report, 'saju_doctrine')) return hasSectionQuality(report, 'saju_doctrine');
  if (!isRecord(report)) return false;
  return collectStrings(report.saju_sections).join(' ').length >= 240;
}

function hasAstrologyDoctrine(report: unknown): boolean {
  if (hasSection(report, 'astrology_doctrine')) return hasSectionQuality(report, 'astrology_doctrine');
  if (!isRecord(report)) return false;
  return collectStrings(report.astro_deep).join(' ').length >= 180;
}

function hasTarotSpread(report: unknown): boolean {
  if (hasSection(report, 'tarot_spread')) return hasSectionQuality(report, 'tarot_spread');
  if (!isRecord(report) || !Array.isArray(report.tarot_details)) return false;
  return report.tarot_details.some((item) => {
    if (!isRecord(item)) return false;
    const text = collectStrings(item).join(' ');
    return /cardId|sourceClaimId|orientation|upright|reversed|major-|minor-/iu.test(text);
  });
}

function hasProvenanceAppendix(report: unknown): boolean {
  if (hasSection(report, 'provenance_appendix')) return hasSectionQuality(report, 'provenance_appendix');
  if (!isRecord(report)) return false;
  return collectStrings(report.provenance_appendix).join(' ').length >= 180;
}

function hasSection(report: unknown, sectionId: string): boolean {
  return getSection(report, sectionId) !== null;
}

function hasSectionQuality(report: unknown, sectionId: string): boolean {
  const section = getSection(report, sectionId);
  const rule = REQUIRED_SECTIONS.find((item) => item.label === sectionId);
  if (!section || !rule) return false;
  return section.content.trim().length >= rule.minimumTextLength &&
    section.evidenceBlockIds.length >= rule.minimumEvidenceBlocks;
}

function getSection(report: unknown, sectionId: string): SectionSnapshot | null {
  if (!isRecord(report) || !Array.isArray(report.sections)) return null;
  for (const item of report.sections) {
    if (!isRecord(item)) continue;
    if (item.sectionId !== sectionId) continue;
    if (typeof item.title !== 'string' || typeof item.content !== 'string') return null;
    if (!Array.isArray(item.evidenceBlockIds)) return null;
    const evidenceBlockIds = item.evidenceBlockIds.filter((value): value is string => typeof value === 'string');
    return { sectionId, title: item.title, content: item.content, evidenceBlockIds };
  }
  return null;
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

function collectEvidenceBlocks(report: unknown): readonly EvidenceBlock[] {
  if (!isRecord(report) || !Array.isArray(report.evidenceBlocks)) return [];
  return report.evidenceBlocks.flatMap((item) => parseEvidenceBlock(item));
}

function parseEvidenceBlock(value: unknown): readonly EvidenceBlock[] {
  if (!isRecord(value)) return [];
  const id = typeof value.id === 'string' ? value.id : '';
  const sectionId = typeof value.sectionId === 'string' ? value.sectionId : '';
  const family = typeof value.family === 'string' && isEvidenceFamily(value.family) ? value.family : null;
  const sourceClaimId = typeof value.sourceClaimId === 'string' ? value.sourceClaimId : '';
  const userImplication = typeof value.userImplication === 'string' ? value.userImplication : '';
  const actionOrBoundary = typeof value.actionOrBoundary === 'string' ? value.actionOrBoundary : '';

  if (!id || !sectionId || !family || !sourceClaimId || !userImplication || !actionOrBoundary) return [];
  return [{ id, sectionId, family, sourceClaimId, userImplication, actionOrBoundary }];
}

function isEvidenceFamily(value: string): value is EvidenceFamily {
  return [
    'calculation',
    'myeongli_doctrine',
    'astrology_doctrine',
    'tarot_rws',
    'safety_boundary',
    'provider_recovery',
    'product_synthesis',
  ].includes(value);
}

function getMissingEvidenceFamilies(evidenceBlocks: readonly EvidenceBlock[]): readonly string[] {
  const families = new Set(evidenceBlocks.map((blockItem) => blockItem.family));
  const requiredFamilies: readonly EvidenceFamily[] = [
    'calculation',
    'myeongli_doctrine',
    'astrology_doctrine',
    'tarot_rws',
    'safety_boundary',
    'provider_recovery',
    'product_synthesis',
  ];
  return requiredFamilies.filter((family) => !families.has(family));
}

function getSectionEvidenceFailures(report: unknown, evidenceBlocks: readonly EvidenceBlock[]): readonly string[] {
  const evidenceById = new Map(evidenceBlocks.map((item) => [item.id, item]));
  const failures: string[] = [];

  for (const rule of REQUIRED_SECTIONS) {
    const section = getSection(report, rule.label);
    if (!section) continue;
    const sectionEvidence = section.evidenceBlockIds
      .map((id) => evidenceById.get(id))
      .filter((item): item is EvidenceBlock => Boolean(item));
    const families = new Set(sectionEvidence.map((item) => item.family));

    if (sectionEvidence.length < rule.minimumEvidenceBlocks) {
      failures.push(`section_evidence_too_low:${rule.label}:${sectionEvidence.length}/${rule.minimumEvidenceBlocks}`);
    }

    for (const family of rule.evidenceFamilies) {
      if (!families.has(family)) {
        failures.push(`section_missing_family:${rule.label}:${family}`);
      }
    }
  }

  return failures;
}

function getModeFailures(report: unknown): readonly string[] {
  if (!isRecord(report)) return ['report_mode_missing'];
  const reportMode = report.reportMode;
  if (reportMode !== 'full_premium' && reportMode !== 'degraded_premium' && reportMode !== 'fallback_static') {
    return ['report_mode_missing'];
  }

  const failures: string[] = [];
  const providerRecovery = report.providerRecovery;
  if (isRecord(providerRecovery)) {
    const attempted = providerRecovery.attempted === true;
    const visibleToCustomer = providerRecovery.visibleToCustomer === true;
    if (attempted && reportMode === 'full_premium') {
      failures.push('provider_recovery_marked_full_premium');
    }
    if (attempted && !visibleToCustomer) {
      failures.push('provider_recovery_hidden');
    }
  }

  if (reportMode === 'fallback_static') {
    failures.push('fallback_static_cannot_pass_premium_gate');
  }

  return failures;
}

function parseScenario(argv: readonly string[]): Scenario {
  const scenarioFlagIndex = argv.findIndex((value) => value === '--scenario');
  const scenario = scenarioFlagIndex === -1 ? 'all' : argv[scenarioFlagIndex + 1];
  if (!scenario || !isScenario(scenario)) throw new UnsupportedScenarioError(scenario ?? '<missing>');
  return scenario;
}

function parseFixturePath(argv: readonly string[]): string | null {
  const fixtureFlagIndex = argv.findIndex((value) => value === '--fixture');
  if (fixtureFlagIndex === -1) return null;
  const fixturePath = argv[fixtureFlagIndex + 1];
  if (!fixturePath) throw new FixtureCliError('Missing --fixture path');
  return fixturePath;
}

function isScenario(value: string): value is Scenario {
  return SUPPORTED_SCENARIOS.some((scenario) => scenario === value);
}

function assertHappyQuality(): QualityScore {
  const result = scorePremiumReportQuality(PREMIUM_REPORT_FIXTURE);
  assert.equal(result.passed, true, JSON.stringify(result));
  assert.equal(result.missingSections.length, 0);
  assert.equal(result.failureReasons.length, 0);
  assert.equal(result.genericHits.length, 0);
  assert.ok(result.specificityHits >= 8, JSON.stringify(result));
  assert.ok(result.evidenceBlockCount >= 18, JSON.stringify(result));
  assert.ok(result.totalTextLength >= 2400, JSON.stringify(result));
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

function assertLongGenericRejected(): void {
  const result = scorePremiumReportQuality(LONG_GENERIC_REPORT_FIXTURE);
  assert.equal(result.passed, false, JSON.stringify(result));
  assert.ok(result.genericHits.includes('universe_will_guide'), JSON.stringify(result));
  assert.ok(result.failureReasons.some((reason) => reason.startsWith('too_few_evidence_blocks')), JSON.stringify(result));
  console.log('premium_report_quality_long_generic_rejected');
}

function assertFallbackFullPremiumRejected(): void {
  const result = scorePremiumReportQuality(FALLBACK_MARKED_FULL_PREMIUM_FIXTURE);
  assert.equal(result.passed, false, JSON.stringify(result));
  assert.ok(result.failureReasons.includes('provider_recovery_marked_full_premium'), JSON.stringify(result));
  assert.ok(result.failureReasons.includes('provider_recovery_hidden'), JSON.stringify(result));
  console.log('premium_report_quality_fallback_full_premium_rejected');
}

function assertEvidenceMarkerOnlyRejected(): void {
  const result = scorePremiumReportQuality(EVIDENCE_MARKER_ONLY_FIXTURE);
  assert.equal(result.passed, false, JSON.stringify(result));
  assert.ok(result.failureReasons.some((reason) => reason.startsWith('too_few_evidence_blocks')), JSON.stringify(result));
  assert.ok(result.missingEvidenceFamilies.includes('calculation'), JSON.stringify(result));
  console.log('premium_report_quality_marker_only_rejected');
}

function assertFixtureCliAccepted(): void {
  const directory = mkdtempSync(join(tmpdir(), 'premium-report-quality-'));
  const fixturePath = join(directory, 'passing-report.json');
  try {
    writeFileSync(fixturePath, JSON.stringify(PREMIUM_REPORT_FIXTURE), 'utf8');

    const output = execFileSync(process.execPath, [process.argv[1] ?? '', '--fixture', fixturePath], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PREMIUM_REPORT_QUALITY_SKIP_FIXTURE_SELF_TEST: '1',
      },
    });

    assert.match(output, /scenario=fixture/u, output);
    assert.match(output, /premium_report_quality_fixture_passed/u, output);
    assert.match(output, /score=\d+/u, output);
    assert.match(output, /evidenceBlocks=\d+/u, output);
    assert.match(output, /failureReasons=\[\]/u, output);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  console.log('premium_report_quality_fixture_cli_contract');
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
  assertLongGenericRejected();
  assertFallbackFullPremiumRejected();
  assertEvidenceMarkerOnlyRejected();
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
    assertLongGenericRejected();
    assertFallbackFullPremiumRejected();
    assertEvidenceMarkerOnlyRejected();
    if (process.env.PREMIUM_REPORT_QUALITY_SKIP_FIXTURE_SELF_TEST !== '1') {
      assertFixtureCliAccepted();
    }
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

function readFixtureJson(fixturePath: string): unknown {
  let fileContents = '';
  try {
    fileContents = readFileSync(fixturePath, 'utf8');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new FixtureCliError(`Unable to read fixture file: ${fixturePath} (${detail})`);
  }

  try {
    const parsedJson: unknown = JSON.parse(fileContents);
    return parsedJson;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new FixtureCliError(`Invalid JSON fixture: ${fixturePath} (${detail})`);
  }
}

function runFixtureScenario(fixturePath: string): boolean {
  const report = readFixtureJson(fixturePath);
  const result = scorePremiumReportQuality(report);
  console.log('scenario=fixture');
  console.log(
    `premium_report_quality_summary score=${result.score} evidenceBlocks=${result.evidenceBlockCount} failureReasons=${JSON.stringify(result.failureReasons)}`
  );

  if (result.passed) {
    console.log('premium_report_quality_fixture_passed');
    return true;
  }

  console.log('premium_report_quality_fixture_failed');
  return false;
}

try {
  const argv = process.argv.slice(2);
  const fixturePath = parseFixturePath(argv);
  if (fixturePath !== null) {
    process.exitCode = runFixtureScenario(fixturePath) ? 0 : 1;
  } else {
    runScenario(parseScenario(argv));
    console.log('Premium report quality verification passed');
  }
} catch (error) {
  if (error instanceof UnsupportedScenarioError) {
    console.error(error.message);
    process.exitCode = 1;
  } else if (error instanceof FixtureCliError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
