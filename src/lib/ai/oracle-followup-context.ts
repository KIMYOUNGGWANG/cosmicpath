import {
  buildOracleAdvisorProfile,
  getRecommendedOracleCharacterId,
  inferQuestionIntent,
  resolveOracleCharacterId,
  type OracleAdvisorProfile,
  type OracleCharacterId,
  type OracleQuestionIntent,
  type OracleSelectionMode,
} from './oracle-personas';
import {
  buildOracleAdvisorEvidenceSummary,
  buildOracleSajuPromptBlock,
  calculateOracleSajuProfile,
  type Gender,
  type OracleSajuProfile,
} from '@/lib/saju/saju-engine';
import { stampRuntimeMetadata } from '@/lib/runtime-environment';

type JsonRecord = Record<string, unknown>;
type FollowUpLanguage = 'ko' | 'en';
type OracleRecommendationContext = 'career' | 'love' | 'money' | 'health' | 'general';

export interface OracleFollowUpContext {
  advisorEvidenceSummary?: string;
  advisorProfile: OracleAdvisorProfile;
  characterId: OracleCharacterId;
  localSajuPromptBlock?: string;
  questionIntent: OracleQuestionIntent;
  selectionMode: OracleSelectionMode;
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function getString(record: JsonRecord | null, key: string): string | undefined {
  const value = record?.[key];
  return typeof value === 'string' ? value : undefined;
}

function getNumber(record: JsonRecord | null, key: string): number | undefined {
  const value = record?.[key];
  return typeof value === 'number' ? value : undefined;
}

function getBoolean(record: JsonRecord | null, key: string): boolean | undefined {
  const value = record?.[key];
  return typeof value === 'boolean' ? value : undefined;
}

function isRecommendationContext(value?: string): value is OracleRecommendationContext {
  return value === 'career'
    || value === 'love'
    || value === 'money'
    || value === 'health'
    || value === 'general';
}

function isQuestionIntent(value?: string): value is OracleQuestionIntent {
  return value === 'general'
    || value === 'compatibility'
    || value === 'reunion'
    || value === 'wealth'
    || value === 'timing'
    || value === 'career'
    || value === 'business';
}

function getSelectionMode(value?: string): OracleSelectionMode {
  return value === 'manual' ? 'manual' : 'auto';
}

function getReadingData(metadata: JsonRecord | null): JsonRecord | null {
  return asRecord(metadata?.readingData);
}

function getFollowUpMetadata(metadata: JsonRecord | null): JsonRecord | null {
  return asRecord(metadata?.followUpMetadata);
}

function getStoredSajuResult(metadata: JsonRecord | null): JsonRecord | null {
  return asRecord(metadata?.sajuResult);
}

function getStoredOracleProfile(metadata: JsonRecord | null): OracleSajuProfile | null {
  const storedSajuResult = getStoredSajuResult(metadata);
  const rawProfile = asRecord(storedSajuResult?.raw);
  return rawProfile ? rawProfile as unknown as OracleSajuProfile : null;
}

function getStoredPromptBlock(metadata: JsonRecord | null): string | undefined {
  const followUpMetadata = getFollowUpMetadata(metadata);
  const storedSajuResult = getStoredSajuResult(metadata);

  return getString(followUpMetadata, 'localSajuPromptBlock')
    ?? getString(metadata, 'localSajuPromptBlock')
    ?? getString(storedSajuResult, 'oraclePromptBlock');
}

function getReusableAdvisorEvidenceSummary(
  metadata: JsonRecord | null,
  params: {
    advisorProfile: OracleAdvisorProfile;
    characterId: OracleCharacterId;
    questionIntent: OracleQuestionIntent;
    language: FollowUpLanguage;
  }
): { advisorEvidenceSummary?: string; localSajuPromptBlock?: string } {
  const storedProfile = getStoredOracleProfile(metadata);
  const storedPromptBlock = getStoredPromptBlock(metadata);

  if (storedProfile) {
    return {
      advisorEvidenceSummary: buildOracleAdvisorEvidenceSummary({
        profile: storedProfile,
        questionIntent: params.questionIntent,
        evidencePriority: params.advisorProfile.evidencePriority,
        language: params.language,
      }),
      localSajuPromptBlock: storedPromptBlock || buildOracleSajuPromptBlock(storedProfile),
    };
  }

  const followUpMetadata = getFollowUpMetadata(metadata);
  const savedAdvisorEvidenceSummary = getString(followUpMetadata, 'advisorEvidenceSummary')
    ?? getString(metadata, 'advisorEvidenceSummary');
  const savedQuestionIntent = getString(followUpMetadata, 'questionIntent')
    ?? getString(metadata, 'questionIntent');
  const savedCharacterId = resolveOracleCharacterId(
    getString(followUpMetadata, 'characterId')
      ?? getString(metadata, 'characterId')
  );

  if (
    savedAdvisorEvidenceSummary &&
    savedQuestionIntent === params.questionIntent &&
    savedCharacterId === params.characterId
  ) {
    return {
      advisorEvidenceSummary: savedAdvisorEvidenceSummary,
      localSajuPromptBlock: storedPromptBlock,
    };
  }

  return {
    localSajuPromptBlock: storedPromptBlock,
  };
}

export function resolveFollowUpAdvisorContext(input: {
  metadata: JsonRecord | null;
  question: string;
  language?: FollowUpLanguage;
}): OracleFollowUpContext {
  const language = input.language ?? 'ko';
  const readingData = getReadingData(input.metadata);
  const savedAdvisorProfile = asRecord(input.metadata?.advisorProfile);
  const context = getString(readingData, 'context');
  const partnerBirthDate = getString(readingData, 'partnerBirthDate');
  const partnerName = getString(readingData, 'partnerName');
  const selectionMode = getSelectionMode(
    getString(input.metadata, 'selectionMode') ?? getString(readingData, 'selectionMode')
  );
  const savedQuestionIntent = getString(input.metadata, 'questionIntent')
    ?? getString(readingData, 'questionIntent');
  const inferredQuestionIntent = inferQuestionIntent({
    context: isRecommendationContext(context) ? context : undefined,
    question: input.question,
    partnerBirthDate,
    partnerName,
  });
  const questionIntent = input.question.trim()
    ? inferredQuestionIntent
    : isQuestionIntent(savedQuestionIntent)
      ? savedQuestionIntent
      : inferredQuestionIntent;
  const savedCharacterId = getString(input.metadata, 'characterId')
    ?? getString(savedAdvisorProfile, 'id')
    ?? getString(readingData, 'characterId');
  const characterId = selectionMode === 'manual'
    ? resolveOracleCharacterId(savedCharacterId)
    : getRecommendedOracleCharacterId({
        context: isRecommendationContext(context) ? context : undefined,
        question: input.question,
        partnerBirthDate,
        partnerName,
        questionIntent,
      });
  const advisorProfile = buildOracleAdvisorProfile(characterId, selectionMode);
  const birthDate = getString(readingData, 'birthDate');
  const reusableAdvisorContext = getReusableAdvisorEvidenceSummary(input.metadata, {
    advisorProfile,
    characterId,
    questionIntent,
    language,
  });

  if (!birthDate) {
    return {
      advisorEvidenceSummary: reusableAdvisorContext.advisorEvidenceSummary
        ?? getString(input.metadata, 'advisorEvidenceSummary'),
      advisorProfile,
      characterId,
      localSajuPromptBlock: reusableAdvisorContext.localSajuPromptBlock,
      questionIntent,
      selectionMode,
    };
  }

  if (reusableAdvisorContext.advisorEvidenceSummary && reusableAdvisorContext.localSajuPromptBlock) {
    return {
      advisorEvidenceSummary: reusableAdvisorContext.advisorEvidenceSummary,
      advisorProfile,
      characterId,
      localSajuPromptBlock: reusableAdvisorContext.localSajuPromptBlock,
      questionIntent,
      selectionMode,
    };
  }

  const sajuProfile = calculateOracleSajuProfile({
    birthDate,
    birthTime: getString(readingData, 'birthTime'),
    gender: (getString(readingData, 'gender') === 'female' ? 'female' : 'male') as Gender,
    cityName: getString(readingData, 'cityName'),
    longitude: getNumber(readingData, 'longitude'),
    latitude: getNumber(readingData, 'latitude'),
    isLunar: getString(readingData, 'calendarType') === 'lunar',
    unknownTime: getBoolean(readingData, 'unknownTime'),
  });

  return {
    advisorEvidenceSummary: buildOracleAdvisorEvidenceSummary({
      profile: sajuProfile,
      questionIntent,
      evidencePriority: advisorProfile.evidencePriority,
      language,
    }),
    advisorProfile,
    characterId,
    localSajuPromptBlock: buildOracleSajuPromptBlock(sajuProfile),
    questionIntent,
    selectionMode,
  };
}

export function mergeFollowUpMetadata(
  metadata: JsonRecord | null,
  context: OracleFollowUpContext
): JsonRecord {
  return stampRuntimeMetadata({
    ...(metadata ?? {}),
    characterId: context.characterId,
    questionIntent: context.questionIntent,
    selectionMode: context.selectionMode,
    advisorProfile: context.advisorProfile,
    advisorEvidenceSummary: context.advisorEvidenceSummary,
    oraclePersona: {
      id: context.advisorProfile.id,
      name: context.advisorProfile.name,
      title: context.advisorProfile.title,
    },
    localSajuPromptBlock: context.localSajuPromptBlock,
    followUpMetadata: {
      advisorProfile: context.advisorProfile,
      advisorEvidenceSummary: context.advisorEvidenceSummary,
      characterId: context.characterId,
      localSajuPromptBlock: context.localSajuPromptBlock,
      questionIntent: context.questionIntent,
      selectionMode: context.selectionMode,
      updatedAt: new Date().toISOString(),
    },
  });
}
