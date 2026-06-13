import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

import { BASELINE_INDEX_PATH } from './report-baseline/writer.ts';
import { registerTypeScriptLoader } from './report-test-data/ts-loader.ts';
import {
  forbiddenSourcePayload,
  googleResponse,
  noBoundaryPayload,
  noUnknownCaveatPayload,
  sourceNameOnlyBoundaryPayload,
  unsafeEnglishSourcePayload,
  ungroundedPayload,
} from './t2-report-quality-payloads.ts';
import type { BaselineIndex, BaselineReportArtifact } from './report-baseline/types.ts';

const localRequire = createRequire(import.meta.url);
const SCENARIOS = ['baseline', 'grounding', 'prompt', 'runtime', 'corpus', 'all'] as const;
type Scenario = (typeof SCENARIOS)[number];

type GroundingApi = {
  readonly scorePremiumGrounding: (value: unknown, userData: unknown, phaseNumber?: number) => { readonly passed: boolean; readonly reasons: readonly string[] };
};

type PromptApi = {
  readonly buildPhase1Prompt: (userData: unknown) => { readonly system: string; readonly user: string };
};

type PremiumApi = {
  readonly generateSinglePhase: (phase: number, userData: unknown, previousData: unknown, apiKey: string) => Promise<{ readonly success: boolean; readonly error?: string }>;
};

type RegistryApi = {
  readonly SOURCE_REGISTRY: readonly { readonly sourceId: string; readonly sourceUrlOrLocator: string; readonly forbiddenClaimFamilies: readonly string[]; readonly forbiddenSurfaces: readonly string[] }[];
};

function parseScenario(): Scenario {
  const index = process.argv.findIndex((value) => value === '--scenario');
  const value = index === -1 ? 'all' : process.argv[index + 1];
  if (!value || !isScenario(value)) {
    throw new Error(`Unsupported T2 scenario: ${value ?? '<missing>'}`);
  }
  return value;
}

function isScenario(value: string): value is Scenario {
  return SCENARIOS.some((scenario) => scenario === value);
}

function readIndex(): BaselineIndex {
  return parseJsonFile(BASELINE_INDEX_PATH, isBaselineIndex);
}

function readArtifact(path: string): BaselineReportArtifact {
  return parseJsonFile(path, isBaselineArtifact);
}

function parseJsonFile<T>(path: string, guard: (value: unknown) => value is T): T {
  const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (!guard(parsed)) throw new Error(`Invalid JSON artifact: ${path}`);
  return parsed;
}

function firstArtifact(): BaselineReportArtifact {
  const index = readIndex();
  assert.equal(index.cases.length, 3, 'baseline_index_requires_three_cases');
  return readArtifact(index.cases[0]?.artifactPath ?? '');
}

function allArtifacts(): readonly BaselineReportArtifact[] {
  return readIndex().cases.map((item) => readArtifact(item.artifactPath));
}

function assertBaseline(): void {
  const artifacts = allArtifacts();
  assert.deepEqual(artifacts.map((item) => item.sourceFixtureId), [
    'kim-seoul-career-premium',
    'unknown-time-love-boundary',
    'hour-boundary-business',
  ]);
  for (const artifact of artifacts) {
    assert.ok(artifact.qualityAnchors.mustMention.length >= 8, `anchor_count:${artifact.id}`);
    assert.ok(artifact.report.sections.length >= 4, `section_count:${artifact.id}`);
  }
  console.log('baseline_fixture_artifacts_emit_case_artifacts');
}

function assertGrounding(api: GroundingApi): void {
  for (const artifact of allArtifacts()) {
    const result = api.scorePremiumGrounding(artifact.report.phaseOnePayload, artifact.premiumUserData);
    assert.equal(result.passed, true, `${artifact.id}:${result.reasons.join(',')}`);
  }
  const unknownArtifact = unknownTimeArtifact();
  const missing = api.scorePremiumGrounding(ungroundedPayload(), firstArtifact().premiumUserData, 1);
  assert.equal(missing.passed, false);
  assert.match(missing.reasons.join(','), /missing_(saju|astrology|tarot)_anchors/);
  const noBoundary = api.scorePremiumGrounding(noBoundaryPayload(unknownArtifact), unknownArtifact.premiumUserData, 1);
  assert.equal(noBoundary.passed, false);
  assert.match(noBoundary.reasons.join(','), /missing_sourceBoundary_anchors/);
  const noUnknownCaveat = api.scorePremiumGrounding(noUnknownCaveatPayload(unknownArtifact), unknownArtifact.premiumUserData, 1);
  assert.equal(noUnknownCaveat.passed, false);
  assert.match(noUnknownCaveat.reasons.join(','), /missing_unknownTimeCaveat_anchors/);
  const forbidden = api.scorePremiumGrounding(forbiddenSourcePayload(), firstArtifact().premiumUserData, 1);
  assert.equal(forbidden.passed, false);
  assert.match(forbidden.reasons.join(','), /forbidden_source_boundary/);
  const nameOnlyBoundary = api.scorePremiumGrounding(sourceNameOnlyBoundaryPayload(firstArtifact()), firstArtifact().premiumUserData, 1);
  assert.equal(nameOnlyBoundary.passed, false);
  assert.match(nameOnlyBoundary.reasons.join(','), /missing_sourceBoundary_anchors/);
  const unsafeEnglish = api.scorePremiumGrounding(unsafeEnglishSourcePayload(firstArtifact()), firstArtifact().premiumUserData, 1);
  assert.equal(unsafeEnglish.passed, false);
  assert.match(unsafeEnglish.reasons.join(','), /forbidden_source_boundary/);
  console.log('quality_scorer_rejects_missing_baseline_anchor_mentions');
}

function assertPrompt(api: PromptApi): void {
  const prompt = api.buildPhase1Prompt(firstArtifact().premiumUserData);
  const combined = `${prompt.system}\n${prompt.user}`;
  assert.match(combined, /근거_계약|GROUNDED_EVIDENCE_CONTRACT/);
  assert.match(combined, /KASI\/JPL|KASI[\s\S]*JPL/u);
  assert.match(combined, /Waite[\s\S]*Tetrabiblos/u);
  assert.match(combined, /타로 이미지 권리|tarot image rights/iu);
  assert.doesNotMatch(combined, /Pictorial Key to the Tarot[\s\S]{0,80}The Veil and its Symbols/u);
  console.log('premium_prompt_includes_grounded_evidence_contract_for_all_phases');
}

async function assertRuntime(api: PremiumApi): Promise<void> {
  const artifact = firstArtifact();
  const originalFetch = globalThis.fetch;
  const bodies: string[] = [];
  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
    bodies.push(typeof init?.body === 'string' ? init.body : '');
    return googleResponse(bodies.length === 1 ? ungroundedPayload() : artifact.report.phaseOnePayload);
  };
  try {
    const result = await api.generateSinglePhase(1, artifact.premiumUserData, null, 'test-key');
    assert.equal(result.success, true);
    assert.match(bodies[1] ?? '', /QUALITY_RETRY/);
  } finally {
    globalThis.fetch = originalFetch;
  }
  await assertRuntimeFailure(api, artifact);
  await assertRuntimeFailure(api, unknownTimeArtifact(), noBoundaryPayload(unknownTimeArtifact()));
  console.log('premium_generation_retries_quality_failure_then_succeeds_on_grounded_retry');
}

async function assertRuntimeFailure(api: PremiumApi, artifact: BaselineReportArtifact, payload: unknown = ungroundedPayload()): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => googleResponse(payload);
  try {
    const result = await api.generateSinglePhase(1, artifact.premiumUserData, null, 'test-key');
    assert.equal(result.success, false);
    assert.match(result.error ?? '', /PREMIUM_QUALITY_GATE_FAILED/);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function assertCorpus(api: RegistryApi): void {
  const registry = api.SOURCE_REGISTRY;
  assert.ok(registry.some((item) => item.sourceUrlOrLocator.includes('gutenberg.org/ebooks/43548')));
  assert.ok(registry.some((item) => item.sourceUrlOrLocator.includes('Ptolemy/Tetrabiblos')));
  assert.ok(registry.some((item) => item.sourceId === 'sanming_tonghui_wikisource_candidate'));
  assert.ok(registry.some((item) => item.sourceId.includes('sacred_texts') || item.sourceUrlOrLocator.includes('sacred-texts.com/tarot/pkt')));
  console.log('corpus_path_rights_safe_slice_contract');
}

function unknownTimeArtifact(): BaselineReportArtifact {
  const artifact = allArtifacts().find((item) => item.sourceFixtureId === 'unknown-time-love-boundary');
  if (!artifact) throw new Error('unknown-time baseline artifact missing');
  return artifact;
}

async function runScenario(scenario: Scenario): Promise<void> {
  const restoreLoader = registerTypeScriptLoader();
  try {
    const grounding = loadGroundingApi();
    if (scenario === 'baseline' || scenario === 'all') assertBaseline();
    if (scenario === 'grounding' || scenario === 'all') assertGrounding(grounding);
    if (scenario === 'prompt' || scenario === 'all') assertPrompt(loadPromptApi());
    if (scenario === 'runtime' || scenario === 'all') await assertRuntime(loadPremiumApi());
    if (scenario === 'corpus' || scenario === 'all') assertCorpus(loadRegistryApi());
  } finally {
    restoreLoader();
  }
}

function loadGroundingApi(): GroundingApi {
  const loaded: unknown = localRequire('../src/lib/ai/premium-grounding.ts');
  if (isGroundingApi(loaded)) return loaded;
  throw new Error('premium-grounding API unavailable');
}

function loadPromptApi(): PromptApi {
  const loaded: unknown = localRequire('../src/lib/ai/phase-prompts.ts');
  if (isPromptApi(loaded)) return loaded;
  throw new Error('phase-prompts API unavailable');
}

function loadPremiumApi(): PremiumApi {
  const loaded: unknown = localRequire('../src/lib/ai/premium-reading-service.ts');
  if (isPremiumApi(loaded)) return loaded;
  throw new Error('premium-reading-service API unavailable');
}

function loadRegistryApi(): RegistryApi {
  const loaded: unknown = localRequire('../src/lib/domain/source-registry.ts');
  if (isRegistryApi(loaded)) return loaded;
  throw new Error('source registry API unavailable');
}

function isBaselineIndex(value: unknown): value is BaselineIndex {
  return hasObjectKey(value, 'cases') && Array.isArray(value.cases);
}

function isBaselineArtifact(value: unknown): value is BaselineReportArtifact {
  return hasObjectKey(value, 'report') && hasObjectKey(value, 'premiumUserData') && hasObjectKey(value, 'qualityAnchors');
}

function isGroundingApi(value: unknown): value is GroundingApi {
  return hasFunction(value, 'scorePremiumGrounding');
}

function isPromptApi(value: unknown): value is PromptApi {
  return hasFunction(value, 'buildPhase1Prompt');
}

function isPremiumApi(value: unknown): value is PremiumApi {
  return hasFunction(value, 'generateSinglePhase');
}

function isRegistryApi(value: unknown): value is RegistryApi {
  return hasObjectKey(value, 'SOURCE_REGISTRY') && Array.isArray(value.SOURCE_REGISTRY);
}

function hasFunction(value: unknown, key: string): boolean {
  return hasObjectKey(value, key) && typeof value[key] === 'function';
}

function hasObjectKey(value: unknown, key: string): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && key in value;
}

runScenario(parseScenario()).then(() => {
  console.log('T2 report quality system verification passed');
}).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
