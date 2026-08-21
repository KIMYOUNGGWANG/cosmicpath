'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Sparkles,
  CheckCircle,
  Plus,
  Compass,
  FileText,
  Lightbulb,
  Clock,
  Loader2,
} from 'lucide-react';
import type {
  SajuChartProfile,
  WeeklyPatternSummary,
  DecisionLogEntry,
} from '@/lib/sajumind/types';

interface SajuMindPatternsViewProps {
  profile: SajuChartProfile;
}

export function SajuMindPatternsView({ profile }: SajuMindPatternsViewProps) {
  const [weeklyReport, setWeeklyReport] = useState<WeeklyPatternSummary | null>(null);
  const [decisions, setDecisions] = useState<DecisionLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Decision Modal
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionDesc, setDecisionDesc] = useState('');
  const [isSavingDecision, setIsSavingDecision] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load Weekly Report
        const repRes = await fetch(
          `/api/sajumind/report/weekly?birthDate=${profile.birthDate}&birthTime=${profile.birthTime || '12:00'}&name=${encodeURIComponent(profile.name)}`
        );
        const repData = await repRes.json();
        if (repData.success) {
          setWeeklyReport(repData.report);
        }

        // Load Decisions
        const decRes = await fetch('/api/sajumind/decisions');
        const decData = await decRes.json();
        if (decData.success) {
          setDecisions(decData.decisions || []);
        }
      } catch (e) {
        console.error('Error loading patterns:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [profile]);

  const handleSaveDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTitle.trim()) return;

    setIsSavingDecision(true);
    try {
      const res = await fetch('/api/sajumind/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: decisionTitle.trim(),
          description: decisionDesc.trim() || undefined,
          dayMasterHangul: profile.dayMaster.stem.charAt(0),
        }),
      });
      const data = await res.json();
      if (data.success && data.decision) {
        setDecisions((prev) => [data.decision, ...prev]);
        setDecisionTitle('');
        setDecisionDesc('');
        setIsDecisionModalOpen(false);
      }
    } catch (e) {
      console.error('Error saving decision:', e);
    } finally {
      setIsSavingDecision(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-stone-400">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400 mb-3" />
        <span className="text-xs">Synthesizing your 7-day emotional flow...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Weekly AI Synthesis Card */}
      {weeklyReport && (
        <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900 via-stone-900/90 to-stone-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-100">
                  Weekly Pattern Synthesis
                </h3>
                <span className="text-xs text-stone-400">{weeklyReport.weekRange}</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <Activity className="h-3.5 w-3.5" />
              <span>Primary Trend: {weeklyReport.dominantEmotion}</span>
            </div>
          </div>

          {/* AI Weekly Synthesis Content */}
          <div className="mt-5 space-y-4 text-sm text-stone-300 leading-relaxed">
            <p className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
              {weeklyReport.aiWeeklyInsight.fullReport}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <span className="font-semibold text-amber-300 block mb-1 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Unnoticed Pattern</span>
                </span>
                <p className="text-stone-300">{weeklyReport.aiWeeklyInsight.unnoticedPattern}</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <span className="font-semibold text-emerald-300 block mb-1 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Gentle Pacing Suggestion</span>
                </span>
                <p className="text-stone-300">{weeklyReport.aiWeeklyInsight.gentleSuggestion}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decision Journal Section */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-400" />
              <span>Decision Retrospective Journal</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Record critical dilemmas and anchor them to your cosmic timing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDecisionModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-stone-950 transition hover:brightness-105 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Decision</span>
          </button>
        </div>

        {/* Decisions List */}
        {decisions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-800 p-8 text-center text-xs text-stone-500">
            No decisions logged yet. Click "+ Log Decision" to track your choice timing.
          </div>
        ) : (
          <div className="space-y-2.5">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                className="rounded-2xl border border-stone-800/80 bg-stone-950/60 p-4 transition hover:border-stone-700"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-200">{dec.title}</span>
                  <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    Timing Score: {dec.sajuTimingSnapshot.timingScore}/100
                  </span>
                </div>
                {dec.description && (
                  <p className="mt-1 text-xs text-stone-400">{dec.description}</p>
                )}
                <div className="mt-2 flex items-center justify-between text-[10px] text-stone-500">
                  <span>{dec.sajuTimingSnapshot.elementalInfluence}</span>
                  <span>{dec.createdAt.split('T')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Decision Modal */}
      {isDecisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-6 shadow-2xl">
            <h4 className="text-base font-bold text-stone-100">Log a Critical Decision</h4>
            <p className="text-xs text-stone-400 mt-1">
              Capture what you are choosing today. SajuMind logs today’s cosmic timing snapshot for future retrospective.
            </p>

            <form onSubmit={handleSaveDecision} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Decision Title *
                </label>
                <input
                  type="text"
                  required
                  value={decisionTitle}
                  onChange={(e) => setDecisionTitle(e.target.value)}
                  placeholder="e.g. Accepted Senior Designer Job Offer"
                  className="w-full rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Context / Doubts (optional)
                </label>
                <textarea
                  rows={3}
                  value={decisionDesc}
                  onChange={(e) => setDecisionDesc(e.target.value)}
                  placeholder="Why did you make this call? What were the emotional tensions?"
                  className="w-full rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDecisionModalOpen(false)}
                  className="rounded-xl border border-stone-800 px-3 py-2 text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDecision}
                  className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-stone-950 hover:brightness-105"
                >
                  {isSavingDecision ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
