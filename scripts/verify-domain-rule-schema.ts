import { strict as assert } from 'node:assert';
import {
  freeFormBlobRegistry,
  missingVariantRegistry,
  modelAuthoredRegistry,
  unknownFamilyRegistry,
  unknownSourceRegistry,
  unsupportedApprovedUseRegistry,
  unsupportedRuleReportUseRegistry,
  validRegistry,
} from './domain-rule-schema-fixtures.ts';
import {
  DomainRuleSchemaError,
  EVIDENCE_FAMILIES,
  parseDomainRuleRegistry,
} from '../src/lib/domain/domain-rule-schema.ts';

const SUPPORTED_SCENARIOS = [
  'happy',
  'rejects-missing-source',
  'rejects-unknown-family',
  'rejects-approved-use',
  'rejects-rule-report-use',
  'rejects-missing-variant',
  'rejects-model-authored-id',
  'rejects-free-form',
  'all',
] as const;

type Scenario = (typeof SUPPORTED_SCENARIOS)[number];

class UnsupportedScenarioError extends Error {
  constructor(scenario: string) {
    super(`Unsupported domain rule schema scenario: ${scenario}`);
    this.name = 'UnsupportedScenarioError';
  }
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

function assertHappySchema(): void {
  const registry = parseDomainRuleRegistry(validRegistry());
  const families = new Set(registry.domainRules.map((rule) => rule.evidenceFamily));
  for (const evidenceFamily of EVIDENCE_FAMILIES) {
    assert.equal(families.has(evidenceFamily), true, `missing_evidence_family_fixture:${evidenceFamily}`);
  }
  console.log('domain_rule_schema_accepts_registry_backed_claims');
}

function assertRejects(input: unknown, issueFragment: string, logLabel: string): void {
  try {
    parseDomainRuleRegistry(input);
    assert.fail(`expected_rejection:${issueFragment}`);
  } catch (error) {
    if (error instanceof DomainRuleSchemaError) {
      assert.ok(error.issues.some((issue) => issue.includes(issueFragment)), JSON.stringify(error.issues));
      console.log(logLabel);
      return;
    }
    throw error;
  }
}

function runScenario(scenario: Scenario): void {
  switch (scenario) {
    case 'happy':
      assertHappySchema();
      return;
    case 'rejects-missing-source':
      assertRejects(unknownSourceRegistry(), 'unknown_source_id', 'domain_rule_schema_rejects_missing_source_ids');
      return;
    case 'rejects-unknown-family':
      assertRejects(unknownFamilyRegistry(), 'evidenceFamily', 'domain_rule_schema_rejects_unknown_evidence_family');
      return;
    case 'rejects-approved-use':
      assertRejects(unsupportedApprovedUseRegistry(), 'approvedUse', 'domain_rule_schema_rejects_unsupported_approved_use');
      return;
    case 'rejects-rule-report-use':
      assertRejects(unsupportedRuleReportUseRegistry(), 'rule_report_use_not_supported', 'domain_rule_schema_rejects_rule_report_use_without_claim_approval');
      return;
    case 'rejects-missing-variant':
      assertRejects(missingVariantRegistry(), 'doctrineVariant', 'domain_rule_schema_rejects_missing_variant_confidence');
      return;
    case 'rejects-model-authored-id':
      assertRejects(modelAuthoredRegistry(), 'model_authored_source_claim_id', 'domain_rule_schema_rejects_model_authored_source_ids');
      return;
    case 'rejects-free-form':
      assertRejects(freeFormBlobRegistry(), 'rawSourceText', 'domain_rule_schema_rejects_free_form_rule_blobs');
      return;
    case 'all':
      assertHappySchema();
      runScenario('rejects-missing-source');
      runScenario('rejects-unknown-family');
      runScenario('rejects-approved-use');
      runScenario('rejects-rule-report-use');
      runScenario('rejects-missing-variant');
      runScenario('rejects-model-authored-id');
      runScenario('rejects-free-form');
      console.log('domain_rule_schema_all_contract');
      return;
    default:
      throw new UnsupportedScenarioError(String(scenario));
  }
}

try {
  const scenario = parseScenario(process.argv.slice(2));
  console.log(`scenario=${scenario}`);
  runScenario(scenario);
  console.log('Domain rule schema verification passed');
} catch (error) {
  if (error instanceof UnsupportedScenarioError || error instanceof DomainRuleSchemaError || error instanceof assert.AssertionError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
