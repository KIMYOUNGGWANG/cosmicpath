'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Zap, TrendingUp } from 'lucide-react';
import { CareerKeywordsReport } from '@/types/career';
import { cn } from '@/lib/utils';

interface Props {
  report: CareerKeywordsReport;
  userName?: string;
  isProxy?: boolean;
}

const AURA_CONFIG = {
  violet: {
    primary: 'from-violet-400 to-purple-600',
    text: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
  },
  gold: {
    primary: 'from-yellow-300 to-amber-500',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]',
  },
  emerald: {
    primary: 'from-emerald-300 to-teal-500',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
  },
  crimson: {
    primary: 'from-rose-400 to-red-600',
    text: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.3)]',
  },
  azure: {
    primary: 'from-blue-400 to-cyan-600',
    text: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  },
};

export const CareerKeywordsResult: React.FC<Props> = ({ report, userName, isProxy }) => {
  const { keywords, timingInsight, talentInsight, catchphrase, auraColor } = report;
  const config = AURA_CONFIG[auraColor] || AURA_CONFIG.violet;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto space-y-8"
    >
      {/* Header Catchphrase */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium backdrop-blur-md mb-2",
          config.bg, config.border, config.text
        )}>
          <Sparkles className="w-4 h-4" />
          {isProxy ? `${userName}님이 본 친구의 운명` : '당신만을 위한 커리어 오라클'}
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
          {catchphrase}
        </h2>
      </motion.div>

      {/* Keywords List */}
      <div className="space-y-4">
        {keywords.map((kw, idx) => (
          <motion.div
            key={kw.keyword}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className={cn(
              "relative overflow-hidden group rounded-3xl border p-6 backdrop-blur-xl transition-all",
              config.bg, config.border, config.glow
            )}
          >
            {/* Background Glow */}
            <div className={cn(
              "absolute -right-20 -top-20 w-64 h-64 blur-[80px] opacity-20 transition-opacity group-hover:opacity-30 bg-gradient-to-br",
              config.primary
            )} />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold bg-white/10 text-white",
                    idx === 0 && "bg-white/20 ring-1 ring-white/30"
                  )}>
                    #{idx + 1}
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {kw.keyword}
                  </h3>
                </div>
                <p className="text-white/60 text-sm leading-relaxed max-w-md">
                  {kw.reason}
                </p>
              </div>

              {/* Compatibility Gauge */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Compatibility</span>
                  <span className={cn("text-xl font-black", config.text)}>{kw.compatibility}%</span>
                </div>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${kw.compatibility}%` }}
                    transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                    className={cn("h-full bg-gradient-to-right", config.primary)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg space-y-3"
        >
          <div className="flex items-center gap-2 text-rose-400">
            <TrendingUp className="w-5 h-5" />
            <h4 className="font-bold">Career Timing</h4>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {timingInsight}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg space-y-3"
        >
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap className="w-5 h-5" />
            <h4 className="font-bold">Soul Talent</h4>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {talentInsight}
          </p>
        </motion.div>
      </div>

      {/* Small Notice */}
      <motion.div variants={itemVariants} className="flex justify-center gap-4 text-[10px] text-white/30 uppercase tracking-[0.2em]">
        <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Saju interpret</span>
        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Astro logic</span>
      </motion.div>
    </motion.div>
  );
};

export default CareerKeywordsResult;
