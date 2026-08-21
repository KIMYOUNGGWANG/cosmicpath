'use client';

import React from 'react';
import { Sparkles, Activity, Compass, MessageSquare, Shield } from 'lucide-react';

export type SajuMindTab = 'home' | 'patterns' | 'chart' | 'talk';

interface SajuMindNavProps {
  activeTab: SajuMindTab;
  onSelectTab: (tab: SajuMindTab) => void;
  dayMasterTitle?: string;
  userName?: string;
}

export function SajuMindNav({
  activeTab,
  onSelectTab,
  dayMasterTitle,
  userName = 'Seeker',
}: SajuMindNavProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-[#0c0d12]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('home')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border border-amber-500/30">
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-stone-100">
              Saju<span className="text-amber-400">Mind</span>
            </span>
            <span className="ml-2 rounded-full border border-stone-700 bg-stone-900/80 px-2 py-0.5 text-[10px] font-medium text-stone-400">
              MVP 1.0
            </span>
          </div>
        </div>

        {/* Tab Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-stone-800 bg-stone-900/60 p-1">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'home'
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Today</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('patterns')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'patterns'
                ? 'bg-indigo-400/15 text-indigo-300 border border-indigo-400/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Patterns</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('chart')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'chart'
                ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>My Chart</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('talk')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'talk'
                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>1:1 Session</span>
          </button>
        </nav>

        {/* User / Archetype Badge */}
        <div className="flex items-center gap-2">
          {dayMasterTitle ? (
            <div className="flex items-center gap-1.5 rounded-full border border-stone-800 bg-stone-900/90 px-3 py-1 text-xs text-stone-300">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-stone-200">{dayMasterTitle}</span>
            </div>
          ) : (
            <div className="text-xs text-stone-500 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Self-Reflection</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-stone-800 bg-[#0c0d12]/95 px-2 py-2.5 backdrop-blur-lg md:hidden">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition ${
            activeTab === 'home' ? 'text-amber-400' : 'text-stone-400'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Today</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('patterns')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition ${
            activeTab === 'patterns' ? 'text-indigo-400' : 'text-stone-400'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Patterns</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('chart')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition ${
            activeTab === 'chart' ? 'text-emerald-400' : 'text-stone-400'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>Chart</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('talk')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-medium transition ${
            activeTab === 'talk' ? 'text-amber-400' : 'text-stone-400'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Session</span>
        </button>
      </div>
    </header>
  );
}
