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

  return 'Decision';
}

function buildDefaultDescription(language: 'ko' | 'en'): string {
  return language === 'en'
    ? "CosmicPath Decision Note cross-checks Saju structure, astrology timing, and tarot's immediate signal."
    : '사주로 구조를 보고, 점성으로 타이밍을 보고, 타로로 지금 질문의 즉각 신호를 확인합니다.';
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
      ? 'CosmicPath Decision Note ready'
      : 'CosmicPath Decision Note가 도착했습니다';

  const rawDescription = typeof summary?.content === 'string' && summary.content.trim()
    ? summary.content.trim()
    : buildDefaultDescription(language);

  return {
    title: truncate(title, 70),
    description: truncate(rawDescription, 140),
    trustScore: clampTrustScore(summary?.trust_score),
    mainCardName: pickMainCardName(metadata),
    language,
  };
}
