'use client';

import React, { useState } from 'react';
import type { IlwoonResult } from '@/lib/engines/saju';

export interface DailyFortuneCalendarProps {
  ilwoonList: IlwoonResult[];
  title?: string;
  subtitle?: string;
}

const GRADE_STYLES: Record<IlwoonResult['grade'], { bg: string; border: string; text: string; badge: string; icon: string }> = {
  대길: {
    bg: 'bg-amber-950/40 hover:bg-amber-900/50',
    border: 'border-amber-500/50',
    text: 'text-amber-300',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: '🌟',
  },
  길: {
    bg: 'bg-emerald-950/40 hover:bg-emerald-900/50',
    border: 'border-emerald-500/50',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: '✨',
  },
  중립: {
    bg: 'bg-slate-900/50 hover:bg-slate-800/60',
    border: 'border-slate-700/60',
    text: 'text-slate-300',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: '○',
  },
  소흉: {
    bg: 'bg-orange-950/40 hover:bg-orange-900/50',
    border: 'border-orange-500/50',
    text: 'text-orange-300',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    icon: '⚡',
  },
  흉: {
    bg: 'bg-rose-950/40 hover:bg-rose-900/50',
    border: 'border-rose-500/50',
    text: 'text-rose-300',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: '⚠️',
  },
};

export function DailyFortuneCalendar({
  ilwoonList,
  title = '📅 향후 30일 일운(日運) 캘린더',
  subtitle = '나의 사주 원국과 매일의 간지가 만드는 기운의 흐름을 확인하세요.',
}: DailyFortuneCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<IlwoonResult | null>(null);

  if (!ilwoonList || ilwoonList.length === 0) {
    return null;
  }

  return (
    <div className="w-full rounded-2xl border border-indigo-500/20 bg-slate-950/80 p-5 backdrop-blur-md md:p-6 shadow-xl">
      <div className="mb-5 text-center md:text-left">
        <h3 className="text-xl font-bold tracking-tight text-slate-100 flex items-center justify-center md:justify-start gap-2">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>

      {/* 범례 (Legend) */}
      <div className="mb-4 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
        <span className="text-slate-400 mr-1">운세 범례:</span>
        {(['대길', '길', '중립', '소흉', '흉'] as const).map((grade) => (
          <span
            key={grade}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium ${GRADE_STYLES[grade].badge}`}
          >
            <span>{GRADE_STYLES[grade].icon}</span>
            <span>{grade}</span>
          </span>
        ))}
      </div>

      {/* 30일 Grid 레이아웃 */}
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-10">
        {ilwoonList.map((item) => {
          const style = GRADE_STYLES[item.grade] || GRADE_STYLES.중립;
          const [, month, day] = item.date.split('-');
          const isSelected = selectedDay?.date === item.date;

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => setSelectedDay(item)}
              className={`group relative flex flex-col items-center justify-between rounded-xl border p-2.5 transition-all duration-200 ${style.bg} ${style.border} ${
                isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-105 z-10' : 'hover:scale-105'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-400">
                {Number(month)}/{Number(day)}
              </div>
              <div className={`my-1 text-sm font-bold ${style.text}`}>
                {item.stem}
                {item.branch}
              </div>
              <div className="text-[11px] font-semibold tracking-wide">
                <span className={style.text}>{item.grade}</span>
              </div>

              {/* 합/충 미니 배지 */}
              {(item.clashWithNatal || item.combineWithNatal) && (
                <div className="mt-1 flex gap-0.5">
                  {item.combineWithNatal && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="원국합" />
                  )}
                  {item.clashWithNatal && (
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" title="원국충" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜 상세 카드 모달 */}
      {selectedDay && (
        <div className="mt-6 rounded-xl border border-indigo-500/30 bg-slate-900/95 p-4 md:p-5 shadow-2xl backdrop-blur-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-100">
                  {selectedDay.date} ({selectedDay.stem}
                  {selectedDay.branch}일)
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-bold ${
                    GRADE_STYLES[selectedDay.grade].badge
                  }`}
                >
                  {GRADE_STYLES[selectedDay.grade].icon} {selectedDay.grade} ({selectedDay.score}점)
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                일간 기준 <span className="font-semibold text-indigo-300">{selectedDay.tenGod}</span>운 · 12운성{' '}
                <span className="font-semibold text-indigo-300">{selectedDay.twelveStage}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {selectedDay.combineWithNatal && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-300">
                ✨ 사주 원국과 합(合)을 형성합니다.
              </span>
            )}
            {selectedDay.clashWithNatal && (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-rose-300">
                ⚠️ 사주 원국과 충(沖)을 이룹니다. 신중한 선택이 필요합니다.
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-300 border-t border-slate-800 pt-3">
            {selectedDay.summary}
          </p>
        </div>
      )}
    </div>
  );
}
