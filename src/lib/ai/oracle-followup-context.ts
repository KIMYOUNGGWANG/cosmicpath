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
} from '@/lib/saju/saju-engine';

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

  if (!birthDate) {
    return {
      advisorEvidenceSummary: getString(input.metadata, 'advisorEvidenceSummary'),
      advisorProfile,
      characterId,
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
  return {
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
    followUpMetadata: {
      advisorProfile: context.advisorProfile,
      advisorEvidenceSummary: context.advisorEvidenceSummary,
      characterId: context.characterId,
      questionIntent: context.questionIntent,
      selectionMode: context.selectionMode,
      updatedAt: new Date().toISOString(),
    },
  };
}
