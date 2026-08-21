'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Activity, Compass, Brain, CheckCircle2 } from 'lucide-react';

interface SajuMindLandingProps {
  onStartChart: () => void;
}

export function SajuMindLanding({ onStartChart }: SajuMindLandingProps) {
  return (
    <div className="min-h-screen bg-[#090a0f] text-stone-100 flex flex-col justify-between selection:bg-amber-500/30">
      {/* Top Banner */}
      <div className="border-b border-stone-800/80 bg-stone-950/60 px-4 py-2 text-center text-xs text-stone-400">
        <span className="inline-flex items-center gap-1.5 font-medium text-amber-400">
          <Sparkles className="h-3.5 w-3.5" />
          SajuMind MVP 1.0
        </span>
        <span className="mx-2 text-stone-700">|</span>
        <span>A mindful self-reflection framework based on Korean Four Pillars</span>
      </div>

      {/* Hero Section */}
      <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-300 backdrop-blur-sm">
          <Brain className="h-3.5 w-3.5 text-amber-400" />
          <span>Not Fortune-Telling • Emotional Pattern Tracking</span>
        </div>

        {/* Headline */}
        <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-stone-100 leading-[1.15]">
          Understand your{' '}
          <span className="bg-gradient-to-r from-amber-300 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
            emotional patterns
          </span>{' '}
          through Korean Saju.
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-stone-400 sm:text-lg leading-relaxed">
          Not superstitious predictions. A structured, compassionate way to understand why you feel
          restless, overthink, or hesitate—and how to navigate your daily decision currents with clarity.
        </p>

        {/* Primary CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onStartChart}
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 text-base font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:shadow-amber-500/30 active:scale-95"
          >
            <span>Get My Free Chart & Check In</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Value Pillars (3-Step How It Works) */}
        <div className="mt-20 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 backdrop-blur-sm transition hover:border-amber-500/30 hover:bg-stone-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-stone-200">1. Discover Your Day Master</h3>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">
              Calculate your foundational elemental archetype (Wood, Fire, Earth, Metal, Water) and uncover your core emotional tendencies.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 backdrop-blur-sm transition hover:border-indigo-500/30 hover:bg-stone-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-stone-200">2. 3-Second Daily Check-in</h3>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">
              Log your mood in 3 seconds. Instantly receive an 80-word AI insight connecting your state to today’s cosmic transit weather.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-6 backdrop-blur-sm transition hover:border-emerald-500/30 hover:bg-stone-900/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-stone-200">3. Weekly Pattern Synthesis</h3>
            <p className="mt-2 text-xs text-stone-400 leading-relaxed">
              Track multi-day emotional trends, see what triggers your hesitation, and ground your critical decisions in natural timing.
            </p>
          </div>
        </div>

        {/* Differentiator Callout Box */}
        <div className="mt-16 rounded-3xl border border-stone-800 bg-gradient-to-b from-stone-900/70 to-stone-950 p-8 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Why SajuMind is Different</span>
          </div>
          <p className="mt-3 text-lg font-medium text-stone-200">
            “CosmicPath helps you make one urgent decision. SajuMind helps you understand why your emotions and decisions flow the way they do over time.”
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">✓ 100% English Wellness Metaphors</span>
            <span className="flex items-center gap-1.5">✓ High-precision Astronomical Engine</span>
            <span className="flex items-center gap-1.5">✓ Privacy-safe & Non-dogmatic</span>
          </div>
        </div>
      </main>

      {/* Footer & Disclaimer */}
      <footer className="border-t border-stone-800/80 bg-stone-950/80 px-4 py-8 text-center text-xs text-stone-500">
        <div className="mx-auto max-w-3xl space-y-2">
          <p className="flex items-center justify-center gap-1.5 text-stone-400">
            <ShieldCheck className="h-4 w-4 text-stone-500" />
            <span>Mindful Self-Reflection & Archetype Journaling</span>
          </p>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            SajuMind is a self-reflection tool based on Korean Saju. It is not medical, psychological, legal, or financial advice. Please consult qualified professionals for those matters.
          </p>
          <p className="text-[10px] text-stone-700">© 2026 SajuMind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
