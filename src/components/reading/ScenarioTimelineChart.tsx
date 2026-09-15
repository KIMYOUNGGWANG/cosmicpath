'use client';

import { useState } from 'react';
import { Calendar, CheckCircle2, Lock } from 'lucide-react';
import type { ScenarioVerdictResult } from '@/lib/engines/scenario-engine';

interface ScenarioTimelineChartProps {
  scenarioDecision: ScenarioVerdictResult;
  isPremium: boolean;
  language: 'ko' | 'en';
  onUnlock?: () => Promise<void> | void;
}

export function ScenarioTimelineChart({
  scenarioDecision,
  isPremium,
  language,
  onUnlock,
}: ScenarioTimelineChartProps) {
  const isEn = language === 'en';

  const defaultPoint =
    scenarioDecision.timeline.find((t) =>
      scenarioDecision.goldenWindows?.[0]
        ? t.year === scenarioDecision.goldenWindows[0].year && t.month === scenarioDecision.goldenWindows[0].month
        : scenarioDecision.goldenMonths.includes(t.month)
    ) || scenarioDecision.timeline[0];

  const [selectedKey, setSelectedKey] = useState<string>(
    defaultPoint ? `${defaultPoint.year || ''}-${defaultPoint.month}` : 'default'
  );

  const selectedPoint =
    scenarioDecision.timeline.find((t) => `${t.year || ''}-${t.month}` === selectedKey) ||
    scenarioDecision.timeline[0] || {
      year: new Date().getFullYear(),
      month: 1,
      monthName: '1월',
      formattedLabelKo: '1월',
      formattedLabelEn: 'Jan',
      isNextYear: false,
      actionScore: 50,
      riskScore: 50,
      phase: 'NEGOTIATE' as const,
      bestOption: 'EQUAL' as const,
      keyActionKo: '',
      keyActionEn: '',
    };

  const headline = isEn ? scenarioDecision.verdictHeadlineEn : scenarioDecision.verdictHeadlineKo;
  const detail = isEn ? scenarioDecision.verdictDetailEn : scenarioDecision.verdictDetailKo;

  const timeRangeLabel = scenarioDecision.startYear && scenarioDecision.endYear
    ? isEn
      ? `${scenarioDecision.startYear}.${String(scenarioDecision.startMonth).padStart(2, '0')} ~ ${scenarioDecision.endYear}.${String(scenarioDecision.endMonth).padStart(2, '0')}`
      : `${scenarioDecision.startYear}.${scenarioDecision.startMonth} ~ ${scenarioDecision.endYear}.${scenarioDecision.endMonth}`
    : '';

  return (
    <div className="rounded-[24px] border border-[#c8a84d]/40 bg-[linear-gradient(180deg,rgba(25,22,18,0.95),rgba(15,13,10,0.98))] p-5 sm:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
      {/* Upper Status Badge & Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-acc-gold/40 bg-acc-gold/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-acc-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-acc-gold animate-ping" />
            <span>{isEn ? 'Scenario Intelligence' : 'A vs B 의사결정 시뮬레이터'}</span>
          </div>
          <h3 className="mt-2 text-lg sm:text-xl font-bold text-starlight tracking-tight">
            {headline}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-center">
            <span className="block text-[10px] text-white/50">{isEn ? 'Consensus' : '엔진 합의도'}</span>
            <span className="font-cinzel text-base font-bold text-acc-gold">
              {scenarioDecision.confidenceScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Option A vs Option B Comparison Card */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className={`rounded-2xl border p-3.5 transition-all ${
            scenarioDecision.recommendedOption === 'OPTION_A'
              ? 'border-acc-gold/60 bg-acc-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
              : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-acc-gold">
              {isEn ? 'Option A' : 'A안'}
            </span>
            {scenarioDecision.recommendedOption === 'OPTION_A' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-acc-gold/20 px-2 py-0.5 text-[10px] font-extrabold text-acc-gold">
                <CheckCircle2 size={11} />
                {isEn ? 'Recommended' : '최적 권고'}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-semibold text-white truncate">
            {scenarioDecision.scenarioA}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-3.5 transition-all ${
            scenarioDecision.recommendedOption === 'OPTION_B'
              ? 'border-sky-400/60 bg-sky-400/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
              : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
              {isEn ? 'Option B' : 'B안'}
            </span>
            {scenarioDecision.recommendedOption === 'OPTION_B' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-extrabold text-sky-400">
                <CheckCircle2 size={11} />
                {isEn ? 'Recommended' : '최적 권고'}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-semibold text-white truncate">
            {scenarioDecision.scenarioB}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-stone-300">
        {detail}
      </p>

      {/* 12-Month Interactive Timeline Bar Chart */}
      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-acc-gold" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              {isEn
                ? `12-Month Action vs Risk Flow ${timeRangeLabel ? `(${timeRangeLabel})` : ''}`
                : `향후 12개월 행동 지수 & 리스크 타임라인 ${timeRangeLabel ? `(${timeRangeLabel})` : ''}`}
            </h4>
          </div>
          <span className="text-[10px] text-stone-400">
            {isEn ? 'Click a month to view action guide' : '월을 클릭하여 상세 지침 확인'}
          </span>
        </div>

        {/* 12-Month Grid Bars */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2">
          {scenarioDecision.timeline.map((point, index) => {
            const pointKey = `${point.year || ''}-${point.month}`;
            const isSelected = pointKey === selectedKey;
            const isGolden = scenarioDecision.goldenWindows
              ? scenarioDecision.goldenWindows.some((gw) => gw.year === point.year && gw.month === point.month)
              : scenarioDecision.goldenMonths.includes(point.month);
            const isDefense = scenarioDecision.defenseMonths.includes(point.month);
            const isLockedForFree = !isPremium && index >= 6;

            return (
              <button
                key={pointKey}
                type="button"
                onClick={() => {
                  if (isLockedForFree) {
                    void onUnlock?.();
                  } else {
                    setSelectedKey(pointKey);
                  }
                }}
                className={`relative flex flex-col items-center justify-between rounded-xl border p-2 text-center transition-all ${
                  isSelected
                    ? 'border-acc-gold bg-acc-gold/20 scale-105 shadow-[0_0_15px_rgba(212,175,55,0.25)] z-10'
                    : isGolden
                    ? 'border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-400'
                    : isDefense
                    ? 'border-rose-500/40 bg-rose-500/10 hover:border-rose-400'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                }`}
              >
                {/* Month Label & Year Subtitle */}
                <div className="flex flex-col items-center leading-none">
                  {point.isNextYear && (
                    <span className="text-[8px] font-extrabold text-acc-gold/90 mb-0.5 tracking-tighter">
                      &apos;{String(point.year).slice(2)}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-stone-300">
                    {point.month}월
                  </span>
                </div>

                {/* Score Visual Height Indicator */}
                <div className="my-1.5 h-12 w-full flex items-end justify-center">
                  {isLockedForFree ? (
                    <Lock size={12} className="text-stone-500 my-auto" />
                  ) : (
                    <div
                      style={{ height: `${Math.max(15, point.actionScore)}%` }}
                      className={`w-3.5 rounded-t-sm transition-all ${
                        isGolden
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : isDefense
                          ? 'bg-gradient-to-t from-rose-600 to-rose-400'
                          : 'bg-gradient-to-t from-amber-600 to-amber-400'
                      }`}
                    />
                  )}
                </div>

                {/* Score Number */}
                <span className="text-[9px] font-mono font-semibold text-stone-400">
                  {isLockedForFree ? '🔒' : point.actionScore}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Month Action Drilldown */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-acc-gold/20 px-2.5 py-1 font-cinzel text-xs font-bold text-acc-gold">
                {selectedPoint.year ? `${selectedPoint.year}년 ` : ''}{selectedPoint.month}월 세부 지침
              </span>
              <span className="text-xs font-semibold text-stone-300">
                {selectedPoint.phase === 'ATTACK'
                  ? (isEn ? '⚡ Action Golden Window' : '⚡ 결단 및 추진 골든타임')
                  : selectedPoint.phase === 'HARVEST'
                  ? (isEn ? '🌾 Harvest & Closing Window' : '🌾 계약 체결 및 수확 적기')
                  : selectedPoint.phase === 'DEFEND'
                  ? (isEn ? '🛡️ Capital Defense Period' : '🛡️ 자본 및 에너지 수성 시기')
                  : (isEn ? '⚖️ Strategic Adjustment' : '⚖️ 조건 미세 조정기')}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-stone-400">
              <span>행동 지수: <strong className="text-acc-gold">{selectedPoint.actionScore}점</strong></span>
              <span>리스크: <strong className="text-rose-400">{selectedPoint.riskScore}점</strong></span>
            </div>
          </div>

          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-200">
            {isEn ? selectedPoint.keyActionEn : selectedPoint.keyActionKo}
          </p>
        </div>
      </div>
    </div>
  );
}
