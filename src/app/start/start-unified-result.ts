import type { ReadingData } from '@/components/reading/reading-input';
import type { CosmicTag, UnifiedReadingResult } from '@/lib/cosmic/schema';
import {
  getSourceSummary,
  type PremiumReportState,
  type PremiumReportViewMetadata,
  type ReadingMetadata,
} from './start-page-helpers';

export function buildStartUnifiedResult(
  reportData: PremiumReportState | null,
  metadata?: ReadingMetadata
): UnifiedReadingResult | null {
  if (!reportData || !metadata) return null;

  const mappedTags = (metadata.keyThemes || []).map((theme) => {
    const rawTag = typeof theme === 'string' ? theme : theme.tag || '';
    return mapTagToEnum(rawTag);
  });
  const uniqueTags = Array.from(new Set(mappedTags));
  const sources: UnifiedReadingResult['sources'] = [];

  if (metadata.sajuResult) {
    sources.push({
      source: 'SAJU',
      originalText: getSourceSummary(metadata.sajuResult, '사주 원국 분석'),
      detectedTags: uniqueTags.slice(0, 2),
      confidence: (metadata.radarScores?.saju || 80) / 100,
    });
  }
  if (metadata.astrology) {
    sources.push({
      source: 'ASTROLOGY',
      originalText: getSourceSummary(metadata.astrology, '천체 배치 분석'),
      detectedTags: uniqueTags.slice(1, 3),
      confidence: (metadata.radarScores?.astrology || 75) / 100,
    });
  }
  if (metadata.tarot) {
    sources.push({
      source: 'TAROT',
      originalText: getSourceSummary(metadata.tarot, '타로 카드 리딩'),
      detectedTags: uniqueTags.slice(2, 4),
      confidence: (metadata.radarScores?.tarot || 85) / 100,
    });
  }

  return {
    summary: reportData.summary?.title || '핵심 리딩 요약',
    detailedContent: reportData.summary?.content || '사주, 별자리, 타로를 함께 읽어 정리한 현재 결론입니다.',
    primaryTags: uniqueTags.slice(0, 5),
    totalConfidenceScore: reportData.summary?.trust_score ? reportData.summary.trust_score * 20 : 85,
    matchLevel: getMatchLevel(reportData.summary?.trust_score || 0),
    sources,
  };
}

export function buildPremiumReportMetadata(
  metadata?: ReadingMetadata
): PremiumReportViewMetadata | undefined {
  if (!metadata) return undefined;

  return {
    readingData: metadata.readingData ? toPremiumReadingData(metadata.readingData) : undefined,
    tarot: Array.isArray(metadata.tarot) ? metadata.tarot : undefined,
    tarotCards: Array.isArray(metadata.tarotCards) ? metadata.tarotCards : undefined,
    radarScores: metadata.radarScores,
    sajuResult: metadata.sajuResult,
    astrologyResult: metadata.astrologyResult,
    precisionMetadata: metadata.precisionMetadata,
    oracleCouncil: metadata.oracleCouncil,
    characterId: metadata.characterId,
    oraclePersona: metadata.oraclePersona,
    language: metadata.language,
    isPremium: metadata.isPremium,
  };
}

function mapTagToEnum(tag: string): CosmicTag {
  const map: Record<string, CosmicTag> = {
    '#재물운': 'WEALTH_WINDFALL',
    '#횡재': 'WEALTH_WINDFALL',
    '#투자': 'WEALTH_WINDFALL',
    '#손재': 'WEALTH_LOSS',
    '#절약': 'WEALTH_STEADY',
    '#안정': 'WEALTH_STEADY',
    '#승진': 'CAREER_PROMOTION',
    '#취업': 'CAREER_PROMOTION',
    '#명예': 'CAREER_PROMOTION',
    '#이직': 'CAREER_CHANGE',
    '#변동': 'CAREER_CHANGE',
    '#창업': 'CAREER_CHANGE',
    '#압박': 'CAREER_PRESSURE',
    '#책임': 'CAREER_PRESSURE',
    '#과로': 'CAREER_PRESSURE',
    '#연애': 'LOVE_NEW',
    '#만남': 'LOVE_NEW',
    '#사랑': 'LOVE_DEEPENING',
    '#이별': 'LOVE_BREAKUP',
    '#갈등': 'LOVE_CONFLICT',
    '#결혼': 'LOVE_DEEPENING',
    '#새로운_시작': 'NEW_START',
    '#이동': 'NEW_START',
    '#독립': 'NEW_START',
    '#건강': 'HEALTH_CAUTION',
    '#스트레스': 'MENTAL_STRESS',
    '#휴식': 'PEACE_STABILITY',
    '#평화': 'PEACE_STABILITY',
    '#귀인': 'DESTINY_MOMENT',
    '#기회': 'DESTINY_MOMENT',
    '#변화': 'KARMA_CYCLE',
    '#운명': 'KARMA_CYCLE',
    '#경고': 'CAUTION',
  };
  const key = tag.startsWith('#') ? tag : `#${tag}`;

  return map[key] || 'DESTINY_MOMENT';
}

function getMatchLevel(trustScore: number) {
  if (trustScore >= 4.5) return 'PERFECT';
  if (trustScore >= 3) return 'PARTIAL';

  return 'CONFLICT';
}

function toPremiumReadingData(readingData: ReadingData) {
  return { ...readingData } as Record<string, unknown> & { name?: string };
}
