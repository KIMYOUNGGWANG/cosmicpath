'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, Compass, MessageSquare, ShieldCheck, Sun, Moon, ArrowRight } from 'lucide-react';
import { SajuMindNav, type SajuMindTab } from '@/components/sajumind/sajumind-nav';
import { SajuMindLanding } from '@/components/sajumind/sajumind-landing';
import { SajuMindIntake } from '@/components/sajumind/sajumind-intake';
import { SajuMindCheckInWidget } from '@/components/sajumind/sajumind-checkin';
import { SajuMindChartView } from '@/components/sajumind/sajumind-chart-view';
import { SajuMindPatternsView } from '@/components/sajumind/sajumind-patterns-view';
import { SajuMindTalkView } from '@/components/sajumind/sajumind-talk-view';
import { calculateDailyTransit, calculateSajuMindProfile } from '@/lib/sajumind/engine';
import type { SajuChartProfile, DailyTransitInfo, CheckInResult } from '@/lib/sajumind/types';

const STORAGE_KEY = 'sajumind_profile_v1';

export default function SajuMindPage() {
  const [profile, setProfile] = useState<SajuChartProfile | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SajuMindTab>('home');
  const [dailyTransit, setDailyTransit] = useState<DailyTransitInfo | null>(null);
  const [recentCheckIn, setRecentCheckIn] = useState<CheckInResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore saved profile on mount (or auto-bridge from /start reading data)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
      } else {
        const pendingRaw = localStorage.getItem('pending_reading_data') || sessionStorage.getItem('pending_reading_data');
        if (pendingRaw) {
          const parsed = JSON.parse(pendingRaw);
          if (parsed?.name && parsed?.birthDate) {
            const bridgedProfile = calculateSajuMindProfile(
              parsed.name,
              parsed.birthDate,
              parsed.birthTime || undefined,
              parsed.cityName || 'Seoul'
            );
            setProfile(bridgedProfile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bridgedProfile));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load SajuMind profile from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Compute daily transit when profile exists
  useEffect(() => {
    if (profile?.dayMaster?.stem) {
      const stemHanja = profile.dayMaster.stem.charAt(0);
      const hanjaToHangul: Record<string, string> = {
        '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
        '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계'
      };
      const hangul = hanjaToHangul[stemHanja] || '갑';
      const transit = calculateDailyTransit(hangul, new Date());
      setDailyTransit(transit);
    }
  }, [profile]);

  const handleProfileComplete = (newProfile: SajuChartProfile) => {
    setProfile(newProfile);
    setIsIntakeOpen(false);
    setActiveTab('home');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.warn('Failed to save SajuMind profile:', e);
    }
  };

  const handleResetProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(null);
    setIsIntakeOpen(false);
    setActiveTab('home');
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#090a0f]" />;
  }

  // 1. Landing View
  if (!profile && !isIntakeOpen) {
    return <SajuMindLanding onStartChart={() => setIsIntakeOpen(true)} />;
  }

  // 2. Intake Flow
  if (!profile && isIntakeOpen) {
    return (
      <SajuMindIntake
        onComplete={handleProfileComplete}
        onCancel={() => setIsIntakeOpen(false)}
      />
    );
  }

  if (!profile) return null;

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#090a0f] text-stone-100 flex flex-col justify-between selection:bg-amber-500/30">
      {/* Navigation Header */}
      <SajuMindNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        dayMasterTitle={profile.dayMaster.shortTitle}
        userName={profile.name}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 flex-1">
        {/* Tab: Home / Today */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-100">
                  {greeting}, {profile.name}
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                  Your Day Master archetype is{' '}
                  <span className="font-semibold text-amber-400">
                    {profile.dayMaster.englishName}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetProfile}
                className="self-start sm:self-auto rounded-full border border-stone-800 bg-stone-900/60 px-3 py-1 text-[11px] text-stone-500 hover:text-stone-300 transition"
              >
                Reset Chart
              </button>
            </div>

            {/* Today's Cosmic Weather Banner */}
            {dailyTransit && (
              <div className="rounded-3xl border border-stone-800 bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 p-5 sm:p-6 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <Sun className="h-4 w-4 text-amber-400" />
                    <span>Today’s Cosmic Energy Atmosphere ({dailyTransit.date})</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-stone-100">
                    {dailyTransit.relationToDayMaster.labelEn}
                  </h3>
                  <p className="mt-1 text-xs text-stone-300 max-w-xl leading-relaxed">
                    {dailyTransit.relationToDayMaster.weatherMetaphor}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-stone-950/80 px-4 py-3 text-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">
                    Energy Intensity
                  </span>
                  <span className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                    {dailyTransit.relationToDayMaster.energyIntensity}
                  </span>
                </div>
              </div>
            )}

            {/* 3-Second Check-In Widget */}
            <SajuMindCheckInWidget
              profile={profile}
              dailyTransit={dailyTransit || undefined}
              onCheckInComplete={(res) => setRecentCheckIn(res)}
              recentCheckIn={recentCheckIn}
            />

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setActiveTab('patterns')}
                className="cursor-pointer rounded-2xl border border-stone-800 bg-stone-900/40 p-5 transition hover:border-indigo-500/30 hover:bg-stone-900/70"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-200">
                    <Activity className="h-4 w-4 text-indigo-400" />
                    <span>View Weekly Pattern Trends</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-500" />
                </div>
                <p className="mt-2 text-xs text-stone-400">
                  Review your 7-day emotional flow and log critical decision checkpoints.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('chart')}
                className="cursor-pointer rounded-2xl border border-stone-800 bg-stone-900/40 p-5 transition hover:border-emerald-500/30 hover:bg-stone-900/70"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-200">
                    <Compass className="h-4 w-4 text-emerald-400" />
                    <span>Explore Four Pillars & Elements</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-500" />
                </div>
                <p className="mt-2 text-xs text-stone-400">
                  Deep-dive into your Five Elements breakdown and emotional grounding habits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Patterns */}
        {activeTab === 'patterns' && <SajuMindPatternsView profile={profile} />}

        {/* Tab: Chart */}
        {activeTab === 'chart' && <SajuMindChartView profile={profile} />}

        {/* Tab: Talk */}
        {activeTab === 'talk' && <SajuMindTalkView profile={profile} />}
      </main>

      {/* Persistent Legal Disclaimer */}
      <footer className="border-t border-stone-800/80 bg-stone-950/90 px-4 py-6 text-center text-xs text-stone-500 mb-12 md:mb-0">
        <div className="mx-auto max-w-3xl space-y-1.5">
          <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>SajuMind Emotional Pattern Management • Global MVP 1.0</span>
          </p>
          <p className="text-[10px] text-stone-600 leading-relaxed">
            SajuMind is a self-reflection tool based on Korean Saju. It is not medical, psychological, legal, or financial advice. Please consult qualified professionals for those matters.
          </p>
        </div>
      </footer>
    </div>
  );
}
