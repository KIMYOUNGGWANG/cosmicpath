'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import type { SajuChartProfile } from '@/lib/sajumind/types';

interface SajuMindTalkViewProps {
  profile: SajuChartProfile;
}

export function SajuMindTalkView({ profile }: SajuMindTalkViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-300 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Deep Human Guidance & Plus Membership</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-100">
          Take Your Self-Understanding Deeper
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-stone-400">
          Upgrade to unlock continuous pattern analysis, or schedule a confidential 1:1 session with an experienced bilingual Saju counselor.
        </p>
      </div>

      {/* Subscription Pricing Cards */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-800/80 pb-6">
          <div>
            <h3 className="text-lg font-bold text-stone-100">SajuMind Plus Membership</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Continuous emotional tracking, weekly synthesis, and full pattern intelligence.
            </p>
          </div>

          {/* Toggle */}
          <div className="flex items-center rounded-full border border-stone-800 bg-stone-950 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSelectedPlan('monthly')}
              className={`rounded-full px-3 py-1 transition ${
                selectedPlan === 'monthly'
                  ? 'bg-amber-400 text-stone-950 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Monthly ($12.9)
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlan('annual')}
              className={`rounded-full px-3 py-1 transition ${
                selectedPlan === 'annual'
                  ? 'bg-amber-400 text-stone-950 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Annual ($99/yr • Save 36%)
            </button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Unlimited daily check-ins with tailored 80-word AI guides</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Full 7-day and 30-day emotional pattern trend synthesis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Unlimited Decision Retrospective Journal archives</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Priority access and 20% discount on 1:1 human sessions</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              window.open('https://buy.stripe.com', '_blank');
            }}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-xs sm:text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-95 transition"
          >
            <span>Upgrade to Plus ({selectedPlan === 'monthly' ? '$12.9/mo' : '$99/year'})</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 1:1 Human Sessions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 30 Min */}
        <div className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>30 Minutes</span>
              </span>
              <span className="text-xl font-bold text-stone-100">$69</span>
            </div>
            <h4 className="mt-3 text-base font-bold text-stone-100">Focused Breakthrough Session</h4>
            <p className="mt-1 text-xs text-stone-400 leading-relaxed">
              Target one specific dilemma (career pivot, relationship crossroad, or anxiety spike) through the lens of your Four Pillars and current timing.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-800/80">
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-800/90 py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 transition"
            >
              <span>Book 30-Min Session</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* 60 Min */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-stone-900 to-stone-950 p-6 backdrop-blur-xl flex flex-col justify-between ring-1 ring-amber-500/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>60 Minutes (Recommended)</span>
              </span>
              <span className="text-xl font-bold text-amber-300">$119</span>
            </div>
            <h4 className="mt-3 text-base font-bold text-stone-100">Full Life Alignment & Timing Audit</h4>
            <p className="mt-1 text-xs text-stone-400 leading-relaxed">
              Comprehensive deep dive into your Natal Four Pillars, 10-year Daeun cycle, recurring emotional blocks, and optimal 12-month decision roadmap.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-800/80">
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 text-xs font-semibold text-stone-950 hover:brightness-105 transition"
            >
              <span>Book 60-Min Deep Dive</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
