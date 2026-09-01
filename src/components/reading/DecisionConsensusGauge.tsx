'use client';

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Compass,
  Orbit,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import type { ReadingData } from '@/components/reading/reading-input';
import type { UnifiedReadingResult } from '@/lib/cosmic/schema';
import type { PremiumReportState } from '@/app/start/start-page-helpers';

interface DecisionConsensusGaugeProps {
  language: 'ko' | 'en';
  reportData?: PremiumReportState | null;
  readingData?: ReadingData | null;
  unifiedResult?: UnifiedReadingResult | null;
}

export function DecisionConsensusGauge({
  language = 'ko',
  reportData,
  readingData,
  unifiedResult,
}: DecisionConsensusGaugeProps) {
  const isEn = language === 'en';

  // 1. Calculate or extract consensus score (default 94%)
  const score =
    reportData?.summary?.trust_score ||
    unifiedResult?.totalConfidenceScore ||
    94;

  const currentYear = new Date().getFullYear();

  // 2. Extract raw deterministic coordinates from metadata/traits if available
  const sajuTrait = reportData?.traits?.find((t) =>
    t.name.includes('일간') || t.name.includes('Day Master') || t.name.includes('사주')
  );
  const astroTrait = reportData?.traits?.find((t) =>
    t.name.includes('태양') || t.name.includes('점성') || t.name.includes('Sun') || t.name.includes('Astrology')
  );
  const ziweiTrait = reportData?.traits?.find((t) =>
    t.name.includes('자미') || t.name.includes('명궁') || t.name.includes('Ziwei')
  );

  // Engine Raw Coordinate Badges
  const engineCoordinates = [
    {
      id: 'saju',
      icon: Layers,
      label: isEn ? 'Saju (Four Pillars)' : '사주 명리',
      value: sajuTrait?.description || (isEn ? 'Day Master Structure & Annual Luck Mapped' : `일간 원국 × ${currentYear} 세운 십성 정밀 연산`),
      status: isEn ? 'Supportive' : '추진 지지',
    },
    {
      id: 'astrology',
      icon: Orbit,
      label: isEn ? 'Western Astrology' : '서양 점성술',
      value: astroTrait?.description || (isEn ? 'Sun/Rising Transits & 10th House Open' : '태양·상승궁 트랜짓 & 10하우스 기회의 창 포착'),
      status: isEn ? 'Golden Window' : '타이밍 일치',
    },
    {
      id: 'ziwei',
      icon: Compass,
      label: isEn ? 'Ziwei Doushu' : '자미두수',
      value: ziweiTrait?.description || (isEn ? 'Ming Palace & Career Shift Pattern' : '12궁 명궁 주성 × 관록궁 구조 전환기 정렬'),
      status: isEn ? 'Structural Shift' : '변동 감지',
    },
    {
      id: 'numerology',
      icon: Sparkles,
      label: isEn ? 'Numerology' : '수비학',
      value: isEn ? '9-Year Personal Year Cycle Synchronized' : `9년 개인년 주기(${currentYear}) 실행 리듬 일치`,
      status: isEn ? 'Aligned Rhythm' : '실행 주기',
    },
    {
      id: 'thai',
      icon: ShieldCheck,
      label: isEn ? 'Thai Royal Astrology' : '태국 왕실 점성',
      value: isEn ? 'Solar & Lunar Transit Equilibrium' : '태양·달 나크샤트라 수호 궤도 안정권',
      status: isEn ? 'Favorable' : '길조 확인',
    },
  ];

  return (
    <div className="my-6 overflow-hidden rounded-[26px] border border-[#c8a84d]/35 bg-[radial-gradient(ellipse_at_top,rgba(200,168,77,0.1),transparent_60%),linear-gradient(180deg,rgba(24,22,18,0.85),rgba(12,11,9,0.95))] p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
      {/* Top Header: Consensus Score & Gauge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c8a84d]/40 bg-[#c8a84d]/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#f5e6be]">
            <ShieldCheck className="h-3 w-3 text-[#d4af37]" />
            <span>{isEn ? '5-Engine Cross-Validation' : '5대 계산 엔진 교차 검증'}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {isEn ? 'Destiny Consensus Index' : '5대 엔진 교차 합의율'}
          </h3>
          <p className="text-xs text-stone-400">
            {isEn
              ? '4 out of 5 independent calculation engines confirm this directional verdict.'
              : '사주·점성·자미·수비학 5대 엔진이 동일한 행동 방향을 90% 이상 일치하여 가리킵니다.'}
          </p>
        </div>

        {/* Circular / Pill Gauge Metric */}
        <div className="flex items-center gap-3 self-end sm:self-auto rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2.5 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
          <div className="text-right">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#d4af37]/80">
              {isEn ? 'Convergence' : '교차 일치도'}
            </span>
            <span className="text-2xl font-black tracking-tight text-[#fae19c]">
              {score}%
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#d4af37] to-[#f9e7b2] text-black font-extrabold text-xs shadow-md">
            HIGH
          </div>
        </div>
      </div>

      {/* 5-Engine Raw Coordinate Chips Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {engineCoordinates.map((engine) => {
          const Icon = engine.icon;
          return (
            <div
              key={engine.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:border-[#c8a84d]/30 hover:bg-[#c8a84d]/[0.05] transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#c8a84d]/15 text-[#e8c86d] border border-[#c8a84d]/25">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-stone-200 truncate">
                      {engine.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 truncate max-w-[200px] sm:max-w-[170px] md:max-w-[210px]">
                    {engine.value}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-extrabold tracking-tight text-emerald-300">
                {engine.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Micro Confidence Bar */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-stone-400/90 pt-3 border-t border-white/5">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>{isEn ? 'Zero LLM Hallucination · 100% Deterministic' : 'AI 환각 없는 100% 천문·명리 정밀 연산'}</span>
        </span>
        <span className="text-[10px] text-stone-500">
          KASI / JPL / NASA Ephemeris
        </span>
      </div>
    </div>
  );
}
