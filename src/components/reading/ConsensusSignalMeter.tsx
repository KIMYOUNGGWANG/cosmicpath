'use client';

import { cn } from '@/lib/utils';
import { computeConsensus, type ConsensusResult, type SignalDirection } from '@/lib/consensus-signal-utils';

interface ConsensusSignalMeterProps {
  sajuScore: number;
  astroScore: number;
  tarotScore: number;
  convergenceScore?: number;
  language?: 'ko' | 'en';
  className?: string;
}

const DIRECTION_CONFIG: Record<SignalDirection, { icon: string; color: string; bg: string }> = {
  agree:    { icon: '✓', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  neutral:  { icon: '〜', color: 'text-zinc-400',   bg: 'bg-zinc-400/10 border-zinc-400/20' },
  disagree: { icon: '✗', color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20' },
};

const LEVEL_CONFIG: Record<ConsensusResult['level'], { label: { ko: string; en: string }; badge: string }> = {
  strong:    { label: { ko: '강신호', en: 'Strong' },    badge: 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30' },
  moderate:  { label: { ko: '중간신호', en: 'Moderate' }, badge: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  weak:      { label: { ko: '약신호', en: 'Weak' },      badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  conflicted:{ label: { ko: '혼선', en: 'Conflicted' },  badge: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

export function ConsensusSignalMeter({
  sajuScore,
  astroScore,
  tarotScore,
  convergenceScore,
  language = 'ko',
  className,
}: ConsensusSignalMeterProps) {
  const result = computeConsensus(sajuScore, astroScore, tarotScore, convergenceScore);
  const levelCfg = LEVEL_CONFIG[result.level];
  const isEn = language === 'en';

  return (
    <div className={cn('rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          {isEn ? 'Consensus Signal' : '합의 신호'}
        </p>
        <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em]', levelCfg.badge)}>
          {isEn ? levelCfg.label.en : levelCfg.label.ko}
        </span>
      </div>

      <div className="mb-3 flex gap-2">
        {result.sources.map((src) => {
          const cfg = DIRECTION_CONFIG[src.direction];
          return (
            <div
              key={src.source}
              className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium', cfg.bg)}
            >
              <span className={cn('text-sm font-bold leading-none', cfg.color)}>{cfg.icon}</span>
              <span className="text-white/70">{isEn ? src.label.en : src.label.ko}</span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] leading-relaxed text-white/40">
        {isEn ? result.summary.en : result.summary.ko}
      </p>
    </div>
  );
}
