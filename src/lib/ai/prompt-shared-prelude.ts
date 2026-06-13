import {
  buildOraclePersonaBlock,
  type OracleQuestionIntent,
} from './oracle-personas';
import {
  buildDecisionTimingCoreRule,
  buildEvidenceFirstNarrativeRule,
  buildPromptDepthRule,
  buildRelationshipDecisionSafetyRule,
  buildTraditionalTermRule,
  getPromptRuleJoiner,
} from './prompt-core-rules';
import type { PromptSharedPreludeOptions } from './prompt-rule-types';
import { buildThreeLayerSynthesisPromptRule } from './three-layer-synthesis';

const RELATIONSHIP_SAFETY_INTENTS = new Set<OracleQuestionIntent>([
  'compatibility',
  'reunion',
  'timing',
]);

export function buildPromptSharedPrelude(options: PromptSharedPreludeOptions) {
  const detailLevel = options.detailLevel ?? 'compact';
  const format = options.format ?? 'markdown';
  const blocks = [
    buildDecisionTimingCoreRule(options.language, format),
    buildThreeLayerSynthesisPromptRule(options.language, format),
    options.questionIntent && RELATIONSHIP_SAFETY_INTENTS.has(options.questionIntent)
      ? buildRelationshipDecisionSafetyRule(options.language, format)
      : '',
    buildEvidenceFirstNarrativeRule(options.language, format),
    buildOraclePersonaBlock(options.characterId, options.language, {
      questionIntent: options.questionIntent,
      selectionMode: options.selectionMode,
      detailLevel,
    }),
    options.advisorEvidenceSummary?.trim() || '',
    options.depthMode ? buildPromptDepthRule(options.language, options.depthMode, format) : '',
    detailLevel === 'compact' ? buildTraditionalTermRule(options.language, format) : '',
  ].filter(Boolean);

  return blocks.join(getPromptRuleJoiner(format));
}
