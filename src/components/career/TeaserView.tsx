'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

interface TeaserViewProps {
  hook: string;
  onUnlock: () => void;
  isUnlocking?: boolean;
}

export function TeaserView({ hook, onUnlock, isUnlocking }: TeaserViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Hook Section */}
      <div className="relative overflow-hidden rounded-[32px] border border-cyan-400/30 bg-cyan-400/5 p-8 backdrop-blur-xl">
        <div className="absolute -right-4 -top-4 text-cyan-400/20">
          <Sparkles size={80} />
        </div>
        
        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">
          First Oracle Signal
        </h3>
        
        <p className="text-xl font-medium leading-relaxed text-white md:text-2xl">
          "{hook}"
        </p>
      </div>

      {/* Blurred Preview Section */}
      <div className="relative mt-12 overflow-hidden rounded-[24px] border border-white/5 bg-white/2 p-6 grayscale">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md">
          <div className="mb-4 rounded-full bg-amber-400/20 p-4 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <Lock className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-white">상세 운명 리포트가 봉인되어 있습니다.</p>
          <p className="mt-1 text-xs text-white/40">사주/점성술/타로 융합 분석 포함</p>
        </div>

        <div className="space-y-4 opacity-20">
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-20 w-full rounded bg-white/10" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 rounded bg-white/10" />
            <div className="h-12 rounded bg-white/10" />
            <div className="h-12 rounded bg-white/10" />
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="pt-4">
        <button
          onClick={onUnlock}
          disabled={isUnlocking}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-300 px-6 py-5 text-sm font-bold text-slate-950 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] disabled:opacity-70"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          <span className="relative z-10">
            {isUnlocking ? '잠금 해제 중...' : '상세 운명 봉인 해제하기'}
          </span>
          {!isUnlocking && <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>
        <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-white/30">
          One-time purchase OR PRO subscription required
        </p>
      </div>
    </motion.div>
  );
}
