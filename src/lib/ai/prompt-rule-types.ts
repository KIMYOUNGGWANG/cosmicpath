import type {
  OracleCharacterId,
  OracleQuestionIntent,
  OracleSelectionMode,
} from './oracle-personas';

export type PromptRuleLanguage = 'ko' | 'en';
export type PromptRuleFormat = 'markdown' | 'inline';
export type PromptDepthMode = 'premium' | 'free-core' | 'free-full' | 'free-phase2';
export type StructuredPromptMode = 'premium' | 'free-core' | 'free-full';

export type PromptSharedPreludeOptions = {
  readonly language: PromptRuleLanguage;
  readonly characterId?: OracleCharacterId;
  readonly questionIntent?: OracleQuestionIntent;
  readonly selectionMode?: OracleSelectionMode;
  readonly advisorEvidenceSummary?: string;
  readonly detailLevel?: 'full' | 'compact';
  readonly depthMode?: PromptDepthMode;
  readonly format?: PromptRuleFormat;
};
