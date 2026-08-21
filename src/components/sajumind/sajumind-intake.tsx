'use client';

import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import type { SajuChartProfile } from '@/lib/sajumind/types';

interface SajuMindIntakeProps {
  onComplete: (profile: SajuChartProfile) => void;
  onCancel?: () => void;
}

const POPULAR_CITIES = [
  { name: 'Seoul', tz: 'Asia/Seoul' },
  { name: 'New York', tz: 'America/New_York' },
  { name: 'Los Angeles', tz: 'America/Los_Angeles' },
  { name: 'London', tz: 'Europe/London' },
  { name: 'Toronto', tz: 'America/Toronto' },
  { name: 'Sydney', tz: 'Australia/Sydney' },
  { name: 'Singapore', tz: 'Asia/Singapore' },
  { name: 'Tokyo', tz: 'Asia/Tokyo' },
];

export function SajuMindIntake({ onComplete, onCancel }: SajuMindIntakeProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('1994-06-15');
  const [birthTime, setBirthTime] = useState('14:30');
  const [unknownTime, setUnknownTime] = useState(false);
  const [city, setCity] = useState('Seoul');
  const [timezone, setTimezone] = useState('Asia/Seoul');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) {
      setError('Please select your birth date.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sajumind/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Seeker',
          birthDate,
          birthTime: unknownTime ? undefined : birthTime,
          birthCity: city,
          timezone,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to calculate chart');
      }

      onComplete(data.profile);
    } catch (err: unknown) {
      console.error('Chart creation error:', err);
      setError(err instanceof Error ? err.message : 'Error calculating chart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-stone-100">
            Map Your Saju Archetype
          </h2>
          <p className="mt-1.5 text-xs text-stone-400">
            Enter your birth details to calculate your Day Master and elemental balance.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Your Name or Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full rounded-xl border border-stone-800 bg-stone-950/80 px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Birth Date (Solar) *</span>
            </label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-xl border border-stone-800 bg-stone-950/80 px-3.5 py-2.5 text-sm text-stone-100 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition"
            />
          </div>

          {/* Birth Time */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-stone-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>Birth Time</span>
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unknownTime}
                  onChange={(e) => setUnknownTime(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-900 text-amber-400 focus:ring-amber-400"
                />
                <span>Time unknown (Noon used)</span>
              </label>
            </div>
            {!unknownTime && (
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full rounded-xl border border-stone-800 bg-stone-950/80 px-3.5 py-2.5 text-sm text-stone-100 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition"
              />
            )}
          </div>

          {/* Birth City */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>Birth City</span>
            </label>
            <select
              value={city}
              onChange={(e) => {
                const found = POPULAR_CITIES.find((c) => c.name === e.target.value);
                setCity(e.target.value);
                if (found) setTimezone(found.tz);
              }}
              className="w-full rounded-xl border border-stone-800 bg-stone-950/80 px-3.5 py-2.5 text-sm text-stone-100 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.tz})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-1/3 rounded-xl border border-stone-800 bg-stone-900 py-3 text-xs font-medium text-stone-400 hover:text-stone-200 transition"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-semibold text-stone-950 shadow-md shadow-amber-500/20 transition hover:brightness-105 active:scale-98 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-stone-950" />
                  <span>Calculating Chart...</span>
                </>
              ) : (
                <>
                  <span>Reveal My Archetype</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
