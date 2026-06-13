import { buildFreeStructuredJsonSchema } from './prompt-free-schema';
import { buildPremiumStructuredJsonSchema } from './prompt-premium-schema';
import type {
  PromptRuleLanguage,
  StructuredPromptMode,
} from './prompt-rule-types';

type StructuredJsonSchemaOptions = {
  readonly mode: StructuredPromptMode;
  readonly year: string;
};

export function buildStructuredJsonSchema(
  language: PromptRuleLanguage,
  options: StructuredJsonSchemaOptions
) {
  if (options.mode === 'premium') {
    return buildPremiumStructuredJsonSchema(language, options.year);
  }

  return buildFreeStructuredJsonSchema(language, options.mode);
}
