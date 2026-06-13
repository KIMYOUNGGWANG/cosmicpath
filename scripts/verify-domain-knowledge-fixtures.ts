import { strict as assert } from 'node:assert';
import { DomainKnowledgeFixtureError } from './domain-knowledge-fixture-schema.ts';
import {
  verifyExplicitEmptyFixtureRejection,
  verifyHappyFixtureLayout,
  verifyRejectedFixtures,
} from './domain-knowledge-fixture-verifier.ts';

const SUPPORTED_SCENARIOS = ['happy', 'rejects-empty', 'rejected-cases', 'all'] as const;
type Scenario = (typeof SUPPORTED_SCENARIOS)[number];

class UnsupportedScenarioError extends Error {
  constructor(scenario: string) {
    super(`Unsupported domain knowledge fixture scenario: ${scenario}`);
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

function runScenario(scenario: Scenario): void {
  switch (scenario) {
    case 'happy':
      verifyHappyFixtureLayout();
      console.log('domain_knowledge_fixtures_accepts_seed_layout');
      return;
    case 'rejects-empty':
      verifyExplicitEmptyFixtureRejection();
      console.log('domain_knowledge_fixtures_rejects_empty_corpora');
      return;
    case 'rejected-cases':
      verifyRejectedFixtures();
      console.log('domain_knowledge_fixtures_rejects_unknown_source_id');
      console.log('domain_knowledge_fixtures_rejects_missing_citation');
      console.log('domain_knowledge_fixtures_rejects_unsupported_source_role');
      console.log('domain_knowledge_fixtures_rejects_unsupported_claim_family');
      console.log('domain_knowledge_fixtures_rejects_unsupported_approved_use');
      console.log('domain_knowledge_fixtures_rejects_model_invented_source_claim_id');
      console.log('domain_knowledge_fixtures_rejects_model_invented_evidence_id');
      console.log('domain_knowledge_fixtures_rejects_raw_copyrighted_text');
      return;
    case 'all':
      runScenario('happy');
      runScenario('rejects-empty');
      runScenario('rejected-cases');
      console.log('domain_knowledge_fixtures_all_contract');
      return;
    default:
      throw new UnsupportedScenarioError(String(scenario));
  }
}

try {
  const scenario = parseScenario(process.argv.slice(2));
  console.log(`scenario=${scenario}`);
  runScenario(scenario);
  console.log('Domain knowledge fixture verification passed');
} catch (error) {
  if (error instanceof UnsupportedScenarioError || error instanceof DomainKnowledgeFixtureError || error instanceof assert.AssertionError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
