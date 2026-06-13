import { EVAL_CONTEXTS, type EvalContext, type PremiumReportEvalCase } from './fixtures.ts';
import type { EvalBaselineArtifact } from './artifacts.ts';

const REQUIRED_SIGNALS = [
  'saju_structure',
  'astrology_timing',
  'tarot_immediate',
  'decision_action',
  'uncertainty_boundary',
  'source_boundary',
] as const;

export function buildEvalCaseFromBaselineArtifact(artifact: EvalBaselineArtifact): PremiumReportEvalCase {
  const premiumUserData = artifact.premiumUserData;
  return {
    id: artifact.sourceFixtureId,
    marketNeed: artifact.label,
    name: stringField(premiumUserData, 'name', '사용자'),
    birthDate: stringField(premiumUserData, 'birthDate', '1900-01-01'),
    birthTime: stringField(premiumUserData, 'birthTime', '12:00'),
    unknownTime: premiumUserData.unknownTime === true,
    context: contextField(premiumUserData.context),
    question: stringField(premiumUserData, 'question', '종합 질문'),
    language: premiumUserData.language === 'en' ? 'en' : 'ko',
    expected: {
      dominantLayer: 'saju',
      requiredSignals: REQUIRED_SIGNALS,
      mustMention: [
        stringField(premiumUserData, 'question', '종합 질문'),
        ...artifact.qualityAnchors.mustMention.slice(0, 3),
      ],
      downgradeRules: [...artifact.qualityAnchors.caveats, ...artifact.qualityAnchors.sourceBoundaries],
      commercialValue: 'Baseline artifacts must preserve user intake, source roles, and a bounded next action.',
    },
  };
}

export function buildCommercialReportFromBaselineArtifact(artifact: EvalBaselineArtifact): unknown {
  return {
    intake: {
      name: stringField(artifact.premiumUserData, 'name', '사용자'),
      birthDate: stringField(artifact.premiumUserData, 'birthDate', '1900-01-01'),
      question: stringField(artifact.premiumUserData, 'question', '종합 질문'),
    },
    report: artifact.report,
    qualityAnchors: artifact.qualityAnchors,
  };
}

function stringField(record: Record<string, unknown>, key: string, fallback: string): string {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function contextField(value: unknown): EvalContext {
  return typeof value === 'string' && isEvalContext(value) ? value : 'general';
}

function isEvalContext(value: string): value is EvalContext {
  return EVAL_CONTEXTS.some((context) => context === value);
}
