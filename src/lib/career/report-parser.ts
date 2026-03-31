import {
  CareerAuraColor,
  CAREER_AURA_COLORS,
  CareerKeywordsReport,
  CareerReadingMetadata,
  CAREER_WORRY_TYPES,
  CareerWorryType,
} from '@/types/career';

function parseJsonValue(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCareerAuraColor(value: unknown): value is CareerAuraColor {
  return typeof value === 'string' && CAREER_AURA_COLORS.includes(value as CareerAuraColor);
}

function isCareerWorryType(value: unknown): value is CareerWorryType {
  return typeof value === 'string' && CAREER_WORRY_TYPES.includes(value as CareerWorryType);
}

function isCareerKeyword(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.rank === 'number' &&
    typeof value.keyword === 'string' &&
    typeof value.reason === 'string' &&
    typeof value.compatibility === 'number'
  );
}

function isKeywordList(value: unknown): boolean {
  return Array.isArray(value) && value.every(isCareerKeyword);
}

function isCareerKeywordsReport(value: unknown): value is CareerKeywordsReport {
  if (!isRecord(value)) return false;
  return (
    isKeywordList(value.keywords) &&
    typeof value.timingInsight === 'string' &&
    typeof value.talentInsight === 'string' &&
    typeof value.catchphrase === 'string' &&
    isCareerAuraColor(value.auraColor)
  );
}

function readStoredReport(value: unknown): CareerKeywordsReport | null {
  if (isCareerKeywordsReport(value)) return value;
  if (!isRecord(value)) return null;
  return isCareerKeywordsReport(value.careerKeywords) ? value.careerKeywords : null;
}

function readGender(value: unknown): 'male' | 'female' {
  if (value === 'female' || value === 'F') return 'female';
  return 'male';
}

function readText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readWorryType(value: unknown): CareerWorryType {
  return isCareerWorryType(value) ? value : 'transition';
}

export function parseCareerReadingReport(json: string): CareerKeywordsReport | null {
  return readStoredReport(parseJsonValue(json));
}

export function parseCareerReadingMetadata(json: string | null): CareerReadingMetadata {
  const parsed = parseJsonValue(json);
  const record = isRecord(parsed) ? parsed : {};

  return {
    ...record,
    context: 'career',
    isPremium: Boolean(record.isPremium),
    source: readText(record.source) ?? 'career-landing',
    birthDate: readText(record.birthDate) ?? readText(record.birthday),
    birthTime: readText(record.birthTime) ?? readText(record.birthtime),
    gender: readGender(record.gender),
    worryType: readWorryType(record.worryType),
  };
}
