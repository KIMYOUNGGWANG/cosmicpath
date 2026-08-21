'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  Activity,
  Lightbulb,
  X,
  Compass,
} from 'lucide-react';
import type {
  SajuChartProfile,
  SajuMindEmotion,
  CheckInResult,
  DailyTransitInfo,
} from '@/lib/sajumind/types';

interface SajuMindCheckInWidgetProps {
  profile: SajuChartProfile;
  dailyTransit?: DailyTransitInfo;
  onCheckInComplete?: (result: CheckInResult) => void;
  recentCheckIn?: CheckInResult | null;
}

const EMOTION_OPTIONS: Array<{
  id: SajuMindEmotion;
  label: string;
  emoji: string;
  color: string;
}> = [
  { id: 'Peaceful', label: 'Peaceful', emoji: '🌿', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  { id: 'Motivated', label: 'Motivated', emoji: '⚡', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { id: 'Clear', label: 'Clear', emoji: '🌊', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
  { id: 'Neutral', label: 'Neutral', emoji: '⚖️', color: 'border-stone-500/40 bg-stone-500/10 text-stone-300' },
  { id: 'Overthinking', label: 'Overthinking', emoji: '🌀', color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' },
  { id: 'Anxious', label: 'Anxious', emoji: '🌫️', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
  { id: 'Heavy', label: 'Heavy', emoji: '🪨', color: 'border-stone-600/40 bg-stone-700/10 text-stone-400' },
  { id: 'Frustrated', label: 'Frustrated', emoji: '🔥', color: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
];

const SUGGESTED_TAGS = [
  '#work',
  '#relationship',
  '#decision',
  '#sleep',
  '#uncertainty',
  '#momentum',
  '#boundary',
  '#recharge',
];

export function SajuMindCheckInWidget({
  profile,
  dailyTransit,
  onCheckInComplete,
  recentCheckIn,
}: SajuMindCheckInWidgetProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<SajuMindEmotion | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeResult, setActiveResult] = useState<CheckInResult | null>(recentCheckIn || null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCheckIn = async () => {
    if (!selectedEmotion) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/sajumind/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotion: selectedEmotion,
          tags: selectedTags,
          note: note.trim() || undefined,
          userProfile: {
            name: profile.name,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime,
            birthCity: profile.birthCity,
            timezone: profile.timezone,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save check-in');
      }

      setActiveResult(data.checkIn);
      if (onCheckInComplete) {
        onCheckInComplete(data.checkIn);
      }
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-stone-800 bg-gradient-to-b from-stone-900/90 to-stone-950/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-100">
              Daily Emotional Check-in
            </h3>
            <p className="text-xs text-stone-400">
              {dailyTransit ? `Today: ${dailyTransit.pillar.stem} ${dailyTransit.pillar.branch} (${dailyTransit.pillar.element.toUpperCase()})` : 'Connect your state to today’s cosmic weather'}
            </p>
          </div>
        </div>
        {activeResult && (
          <button
            type="button"
            onClick={() => {
              setActiveResult(null);
              setSelectedEmotion(null);
              setSelectedTags([]);
              setNote('');
            }}
            className="rounded-full border border-stone-700 bg-stone-800/80 px-2.5 py-1 text-[11px] font-medium text-stone-300 hover:text-stone-100 transition"
          >
            + New Check-in
          </button>
        )}
      </div>

      {/* When check-in is complete: Show Instant AI Feedback */}
      {activeResult ? (
        <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Immediate SajuMind Insight ({activeResult.emotion})</span>
              </span>
              <span className="text-stone-400">{activeResult.date}</span>
            </div>

            <div className="mt-3 space-y-3 text-sm text-stone-200 leading-relaxed">
              <p className="text-stone-300">
                <span className="font-semibold text-amber-300 mr-1.5">Observation:</span>
                {activeResult.aiFeedback.observation}
              </p>
              <p className="text-stone-300">
                <span className="font-semibold text-indigo-300 mr-1.5">Pattern Connection:</span>
                {activeResult.aiFeedback.patternConnection}
              </p>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5 text-emerald-200">Small Action (Next 24h):</span>
                  <span>{activeResult.aiFeedback.smallAction}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Input Mode */
        <div className="mt-5 space-y-5">
          {/* Emotion Grid */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-2.5">
              How are you feeling right now? (Select 1)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EMOTION_OPTIONS.map((emo) => {
                const isSelected = selectedEmotion === emo.id;
                return (
                  <button
                    key={emo.id}
                    type="button"
                    onClick={() => setSelectedEmotion(emo.id)}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-medium transition ${
                      isSelected
                        ? `${emo.color} ring-1 ring-amber-400 shadow-md`
                        : 'border-stone-800 bg-stone-950/60 text-stone-300 hover:border-stone-700 hover:bg-stone-900'
                    }`}
                  >
                    <span className="text-base">{emo.emoji}</span>
                    <span>{emo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {selectedEmotion && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-stone-400 mb-2">
                Context tags (optional):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                        isChecked
                          ? 'border border-amber-400/40 bg-amber-400/20 text-amber-200'
                          : 'border border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Note */}
          {selectedEmotion && (
            <div className="animate-in fade-in duration-200">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a short note (e.g. hesitating over job offer, feel drained)..."
                className="w-full rounded-xl border border-stone-800 bg-stone-950/80 px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:border-amber-400/50 focus:outline-none transition"
              />
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="button"
            disabled={!selectedEmotion || isSubmitting}
            onClick={handleCheckIn}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs sm:text-sm font-semibold text-stone-950 shadow-md shadow-amber-500/20 transition ${
              !selectedEmotion || isSubmitting
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:brightness-105 active:scale-98'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-stone-950" />
                <span>Connecting with Saju Energy...</span>
              </>
            ) : (
              <>
                <span>Save Check-in & Get Instant Insight</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
