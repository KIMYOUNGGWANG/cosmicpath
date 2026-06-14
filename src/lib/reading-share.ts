type ShareSummary = {
  readonly title: string;
  readonly description: string;
  readonly language: 'ko' | 'en';
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseRecord(raw: string | null): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw ?? '{}');
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function buildSafeTitle(language: 'ko' | 'en'): string {
  return language === 'en'
    ? 'CosmicPath Decision Note ready'
    : 'CosmicPath Decision Note가 도착했습니다';
}

function buildSafeDescription(language: 'ko' | 'en'): string {
  return language === 'en'
    ? 'A public-safe Decision Note snapshot for one delayed choice, with private details kept locked.'
    : '미뤄둔 선택 하나를 공개용 Decision Note 스냅샷으로 안전하게 정리했습니다.';
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

export function getReadingShareSummary(input: {
  data: string;
  metadata: string | null;
}): ShareSummary {
  const metadata = parseRecord(input.metadata);
  const language = metadata.language === 'en' ? 'en' : 'ko';

  return {
    title: truncate(buildSafeTitle(language), 70),
    description: truncate(buildSafeDescription(language), 140),
    language,
  };
}
