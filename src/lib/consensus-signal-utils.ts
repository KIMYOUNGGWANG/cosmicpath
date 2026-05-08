export type SignalDirection = 'agree' | 'neutral' | 'disagree';

export interface SourceSignal {
  source: 'saju' | 'astro' | 'tarot';
  score: number;
  direction: SignalDirection;
  label: { ko: string; en: string };
}

export interface ConsensusResult {
  sources: [SourceSignal, SourceSignal, SourceSignal];
  consensusScore: number;
  agreementCount: number;
  level: 'strong' | 'moderate' | 'weak' | 'conflicted';
  summary: { ko: string; en: string };
}

export function scoreToDirection(score: number): SignalDirection {
  if (score >= 65) return 'agree';
  if (score <= 40) return 'disagree';
  return 'neutral';
}

const SUMMARIES: Record<ConsensusResult['level'], { ko: string; en: string }> = {
  strong:    { ko: '세 원천 모두 같은 방향을 가리킵니다', en: 'All three sources point the same direction' },
  moderate:  { ko: '두 원천이 같은 방향을 가리킵니다', en: 'Two sources agree on the direction' },
  weak:      { ko: '원천들이 엇갈리고 있습니다', en: 'Sources are showing mixed signals' },
  conflicted:{ ko: '세 원천 모두 다른 방향을 가리킵니다', en: 'Sources are in conflict' },
};

export function computeConsensus(
  sajuScore: number,
  astroScore: number,
  tarotScore: number,
  convergenceScore?: number,
): ConsensusResult {
  const sources: [SourceSignal, SourceSignal, SourceSignal] = [
    { source: 'saju',  score: sajuScore,  direction: scoreToDirection(sajuScore),  label: { ko: '사주', en: 'Saju' } },
    { source: 'astro', score: astroScore, direction: scoreToDirection(astroScore), label: { ko: '점성', en: 'Astro' } },
    { source: 'tarot', score: tarotScore, direction: scoreToDirection(tarotScore), label: { ko: '타로', en: 'Tarot' } },
  ];

  const agreementCount = sources.filter(s => s.direction === 'agree').length;
  const consensusScore = convergenceScore ?? Math.round((sajuScore + astroScore + tarotScore) / 3);

  const level: ConsensusResult['level'] =
    agreementCount === 3 ? 'strong' :
    agreementCount === 2 ? 'moderate' :
    agreementCount === 1 ? 'weak' :
    'conflicted';

  return { sources, consensusScore, agreementCount, level, summary: SUMMARIES[level] };
}
