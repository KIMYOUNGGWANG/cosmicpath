interface ShareSummary {
  title: string;
  description: string;
  trustScore: number;
  mainCardName: string;
  language: 'ko' | 'en';
}

function clampTrustScore(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 3.5;
  return Math.max(1, Math.min(5, value));
}

function pickMainCardName(metadata: Record<string, unknown>): string {
  const tarotCards = Array.isArray(metadata.tarotCards)
    ? metadata.tarotCards
    : Array.isArray(metadata.tarot)
      ? metadata.tarot
      : [];

  const firstCard = tarotCards[0];
  if (firstCard && typeof firstCard === 'object' && firstCard !== null) {
    const name = (firstCard as { name?: unknown }).name;
    if (typeof name === 'string' && name.trim()) {
      return name.trim();
    }
  }

  return 'Destiny';
}

function buildFallbackDescription(language: 'ko' | 'en'): string {
  return language === 'en'
    ? 'An AI oracle reading woven from Saju, astrology, and tarot.'
    : '사주, 점성술, 타로를 엮어 완성한 AI 오라클 리딩입니다.';
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

export function getReadingShareSummary(input: {
  data: string;
  metadata: string | null;
}): ShareSummary {
  let reportData: Record<string, unknown> = {};
  let metadata: Record<string, unknown> = {};

  try {
    reportData = JSON.parse(input.data) as Record<string, unknown>;
  } catch {
    reportData = {};
  }

  try {
    metadata = input.metadata ? (JSON.parse(input.metadata) as Record<string, unknown>) : {};
  } catch {
    metadata = {};
  }

  const language = metadata.language === 'en' ? 'en' : 'ko';
  const summary = reportData.summary as
    | { title?: unknown; content?: unknown; trust_score?: unknown }
    | undefined;

  const title = typeof summary?.title === 'string' && summary.title.trim()
    ? summary.title.trim()
    : language === 'en'
      ? 'Destiny Revealed'
      : '운명의 리딩이 도착했습니다';

  const rawDescription = typeof summary?.content === 'string' && summary.content.trim()
    ? summary.content.trim()
    : buildFallbackDescription(language);

  return {
    title: truncate(title, 70),
    description: truncate(rawDescription, 140),
    trustScore: clampTrustScore(summary?.trust_score),
    mainCardName: pickMainCardName(metadata),
    language,
  };
}
