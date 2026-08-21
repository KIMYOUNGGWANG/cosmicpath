'use client';

import React from 'react';
import { Compass, Sparkles, Shield, Flame, Droplets, Trees, Mountain, ShieldAlert, HeartHandshake } from 'lucide-react';
import type { SajuChartProfile, FiveElement } from '@/lib/sajumind/types';

interface SajuMindChartViewProps {
  profile: SajuChartProfile;
}

const ELEMENT_STYLES: Record<
  FiveElement,
  { label: string; icon: React.ReactNode; color: string; barColor: string }
> = {
  wood: {
    label: 'Wood (Growth & Vision)',
    icon: <Trees className="h-4 w-4 text-emerald-400" />,
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    barColor: 'bg-emerald-400',
  },
  fire: {
    label: 'Fire (Passion & Radiance)',
    icon: <Flame className="h-4 w-4 text-rose-400" />,
    color: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    barColor: 'bg-rose-400',
  },
  earth: {
    label: 'Earth (Grounding & Stability)',
    icon: <Mountain className="h-4 w-4 text-amber-400" />,
    color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    barColor: 'bg-amber-400',
  },
  metal: {
    label: 'Metal (Precision & Clarity)',
    icon: <Shield className="h-4 w-4 text-slate-300" />,
    color: 'border-slate-400/30 bg-slate-400/10 text-slate-200',
    barColor: 'bg-slate-300',
  },
  water: {
    label: 'Water (Wisdom & Flow)',
    icon: <Droplets className="h-4 w-4 text-cyan-400" />,
    color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    barColor: 'bg-cyan-400',
  },
};

export function SajuMindChartView({ profile }: SajuMindChartViewProps) {
  const { dayMaster, fourPillars, elementPercentages, dominantElement } = profile;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Day Master Hero Card */}
      <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900 via-stone-900/90 to-stone-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Day Master Archetype</span>
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-stone-100">
              {dayMaster.englishName}
            </h2>
            <p className="mt-1 text-sm text-amber-400/90 font-medium">
              Archetype: {dayMaster.archetype} ({dayMaster.shortTitle})
            </p>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-stone-800 bg-stone-950/80 px-6 py-4 text-center">
            <div>
              <span className="text-3xl font-serif font-bold text-amber-300">
                {dayMaster.stem.split(' ')[0]}
              </span>
              <span className="block text-[10px] text-stone-400 mt-0.5">
                {dayMaster.yinYang.toUpperCase()} {dayMaster.element.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Core Nature & Emotional Tendencies */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-800/80 text-xs">
          <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
            <span className="font-semibold text-stone-300 block mb-1">Core Nature:</span>
            <p className="text-stone-400 leading-relaxed">{dayMaster.coreNature}</p>
          </div>
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
            <span className="font-semibold text-rose-300 block mb-1 flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Emotional Tension:</span>
            </span>
            <p className="text-rose-200/80 leading-relaxed">{dayMaster.emotionalTension}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <span className="font-semibold text-emerald-300 block mb-1 flex items-center gap-1">
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>Grounding Habit:</span>
            </span>
            <p className="text-emerald-200/80 leading-relaxed">{dayMaster.groundingHabit}</p>
          </div>
        </div>
      </div>

      {/* Four Pillars Grid */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-stone-200 mb-4 flex items-center gap-2">
          <Compass className="h-4 w-4 text-indigo-400" />
          <span>Four Pillars of Destiny (四柱)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {/* Year */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
            <span className="text-[11px] font-medium text-stone-400">Year Pillar</span>
            <div className="mt-2 text-sm font-semibold text-stone-200">
              {fourPillars.year.stem} {fourPillars.year.branch}
            </div>
            <span className="mt-1 inline-block text-[10px] text-stone-400">
              {fourPillars.year.animalEn} ({fourPillars.year.element})
            </span>
          </div>

          {/* Month */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
            <span className="text-[11px] font-medium text-stone-400">Month Pillar</span>
            <div className="mt-2 text-sm font-semibold text-stone-200">
              {fourPillars.month.stem} {fourPillars.month.branch}
            </div>
            <span className="mt-1 inline-block text-[10px] text-stone-400">
              {fourPillars.month.animalEn} ({fourPillars.month.element})
            </span>
          </div>

          {/* Day (Core) */}
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 ring-1 ring-amber-500/30">
            <span className="text-[11px] font-medium text-amber-300">Day Pillar (Self)</span>
            <div className="mt-2 text-sm font-bold text-amber-200">
              {fourPillars.day.stem} {fourPillars.day.branch}
            </div>
            <span className="mt-1 inline-block text-[10px] text-amber-300">
              {fourPillars.day.animalEn} ({fourPillars.day.element})
            </span>
          </div>

          {/* Hour */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
            <span className="text-[11px] font-medium text-stone-400">Hour Pillar</span>
            <div className="mt-2 text-sm font-semibold text-stone-200">
              {fourPillars.hour ? `${fourPillars.hour.stem} ${fourPillars.hour.branch}` : 'Estimated'}
            </div>
            <span className="mt-1 inline-block text-[10px] text-stone-400">
              {fourPillars.hour ? `${fourPillars.hour.animalEn} (${fourPillars.hour.element})` : 'Noon Anchor'}
            </span>
          </div>
        </div>
      </div>

      {/* Five Elements Balance */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-stone-200">Five Elements Balance (五行)</h3>
          <span className="text-xs text-amber-400 font-medium">
            Dominant: {dominantElement.toUpperCase()} ({elementPercentages[dominantElement]}%)
          </span>
        </div>

        <div className="space-y-3">
          {(['wood', 'fire', 'earth', 'metal', 'water'] as FiveElement[]).map((el) => {
            const pct = elementPercentages[el] || 0;
            const style = ELEMENT_STYLES[el];
            return (
              <div key={el} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-stone-300">
                    {style.icon}
                    <span>{style.label}</span>
                  </span>
                  <span className="font-semibold text-stone-300">{pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-950 border border-stone-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${style.barColor}`}
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
