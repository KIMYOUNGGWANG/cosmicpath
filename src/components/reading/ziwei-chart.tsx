'use client';

import React from 'react';
import type { ZiweiChartResult, ZiweiPalace, ZiweiStar } from '@/lib/engines/ziwei';

export interface ZiweiChartProps {
  chart: ZiweiChartResult;
  title?: string;
}

// 12지지의 격자(Grid) 위치 매핑 (전통 4x4 사각형 명반 레이아웃)
// 巳(4) 午(5) 未(6) 申(7)  <- Top
// 辰(3)             酉(8)  <- Mid
// 卯(2)             戌(9)  <- Mid
// 寅(1) 丑(0) 子(11) 亥(10) <- Bottom
const BRANCH_GRID_POSITIONS: Record<string, { row: number; col: number }> = {
  巳: { row: 1, col: 1 },
  午: { row: 1, col: 2 },
  未: { row: 1, col: 3 },
  申: { row: 1, col: 4 },
  酉: { row: 2, col: 4 },
  戌: { row: 3, col: 4 },
  亥: { row: 4, col: 4 },
  子: { row: 4, col: 3 },
  丑: { row: 4, col: 2 },
  寅: { row: 4, col: 1 },
  卯: { row: 3, col: 1 },
  辰: { row: 2, col: 1 },
};

const SIHUA_BADGE_STYLE: Record<string, string> = {
  화록: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
  화권: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  화과: 'bg-sky-500/20 border-sky-500/50 text-sky-300',
  화기: 'bg-rose-500/20 border-rose-500/50 text-rose-300',
};

const BRIGHTNESS_STYLE: Record<string, string> = {
  묘: 'text-amber-300 font-bold',
  왕: 'text-emerald-400 font-bold',
  득: 'text-cyan-300',
  이: 'text-blue-300',
  평: 'text-slate-400',
  불득: 'text-orange-400',
  함: 'text-rose-400 font-bold',
};

export function ZiweiChartComponent({ chart, title = '🔮 정통 자미두수(紫微斗數) 명반' }: ZiweiChartProps) {
  if (!chart || !chart.palaceList) return null;

  const palaceByBranch: Record<string, ZiweiPalace> = {};
  chart.palaceList.forEach((p) => {
    palaceByBranch[p.branch] = p;
  });

  return (
    <div className="w-full rounded-2xl border border-purple-500/20 bg-slate-950/90 p-3 md:p-6 shadow-2xl backdrop-blur-md">
      {/* 명반 헤더 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-3">
        <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 font-semibold text-purple-300">
            {chart.wuxingJu.name} ({chart.wuxingJu.number}국)
          </span>
          <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-slate-300">
            {chart.gender === 'male' ? '남성 (乾命)' : '여성 (坤命)'}
          </span>
        </div>
      </div>

      {/* 전통 4x4 사각형 명반 Grid */}
      <div className="grid grid-cols-4 grid-rows-4 gap-1.5 md:gap-2.5 aspect-square max-w-2xl mx-auto text-xs">
        {/* 중앙 프로필 & 통합 정보 안내판 (Row 2-3, Col 2-3) */}
        <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col justify-center items-center rounded-xl border border-purple-500/30 bg-purple-950/20 p-2 md:p-4 text-center overflow-hidden">
          <div className="text-xs md:text-sm font-extrabold text-purple-200">{chart.yearGanZhi}년생 자미명반</div>
          <div className="mt-0.5 text-[10px] md:text-[11px] text-slate-400">
            음력 {chart.lunarDate} {chart.isLeapMonth ? '(윤달)' : ''}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1 md:gap-1.5 text-[10px] md:text-[11px] text-slate-300 w-full max-w-[210px]">
            <div className="rounded bg-slate-900/80 p-1 border border-slate-800">
              명궁: <span className="font-bold text-amber-300">{chart.mingGongBranch}宮</span>
            </div>
            <div className="rounded bg-slate-900/80 p-1 border border-slate-800">
              신궁: <span className="font-bold text-indigo-300">{chart.shenGongBranch}宮</span>
            </div>
          </div>

          {/* 생년 사화 요약 */}
          <div className="mt-2 grid grid-cols-2 gap-1 text-[9px] md:text-[10px] w-full max-w-[210px]">
            {Object.entries(chart.siHuaSummary).map(([siHua, info]) => (
              <div key={siHua} className="flex justify-between px-1.5 py-0.5 rounded bg-black/40 border border-slate-800">
                <span className="text-slate-400">{siHua}</span>
                <span className="font-bold text-purple-300">{info.star}</span>
              </div>
            ))}
          </div>

          {/* 유년 운세 표시 (선택) */}
          {chart.yearlyFortune && (
            <div className="mt-2 w-full max-w-[210px] rounded bg-purple-900/30 border border-purple-500/40 p-1 text-[9px] text-purple-200">
              <span className="font-bold text-amber-300">{chart.yearlyFortune.year}년({chart.yearlyFortune.yearGanZhi})</span> 유년명궁: {chart.yearlyFortune.yearlyMingPalace}
            </div>
          )}
        </div>

        {/* 12궁 셀 렌더링 */}
        {Object.entries(BRANCH_GRID_POSITIONS).map(([branch, pos]) => {
          const palace = palaceByBranch[branch];
          if (!palace) return null;

          const isMingGong = palace.name === '명궁';
          const isYearlyMing = chart.yearlyFortune?.yearlyMingPalace === palace.name;

          const gridStyle = {
            gridRowStart: pos.row,
            gridColumnStart: pos.col,
          };

          return (
            <div
              key={branch}
              style={gridStyle}
              className={`flex flex-col justify-between rounded-xl border p-1.5 md:p-2.5 transition-colors overflow-hidden ${
                isMingGong
                  ? 'border-amber-500/70 bg-amber-950/30 text-amber-200 shadow-amber-500/10 shadow-lg'
                  : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
              }`}
            >
              {/* 궁 상단: 宮干支 & 대한 나이 */}
              <div className="flex items-center justify-between text-[9px] md:text-[10px] text-slate-400 border-b border-slate-800/60 pb-0.5">
                <span className="font-bold text-slate-200">{palace.ganZhi}</span>
                <span className="text-[8px] md:text-[9px]">
                  {palace.daxianStartAge}~{palace.daxianEndAge}세
                </span>
              </div>

              {/* 궁 중단: 주성 / 보성 / 흉성 */}
              <div className="my-1 flex flex-col gap-0.5 overflow-y-auto max-h-[85px] scrollbar-none">
                {palace.stars.length === 0 ? (
                  <span className="text-[9px] italic text-slate-600">공궁 (空宮)</span>
                ) : (
                  palace.stars.map((star) => {
                    let starColor = 'text-slate-300';
                    if (star.category === 'main') starColor = 'text-amber-300 font-bold';
                    else if (star.category === 'auxiliary') starColor = 'text-emerald-300 font-semibold';
                    else if (star.category === 'malefic') starColor = 'text-rose-400 font-semibold';

                    return (
                      <div key={star.name} className="flex items-center justify-between text-[10px] md:text-[11px] leading-tight">
                        <span className={`truncate ${starColor}`}>
                          {star.name}
                          {star.brightness && (
                            <span className={`ml-0.5 text-[8px] md:text-[9px] ${BRIGHTNESS_STYLE[star.brightness] || 'text-slate-400'}`}>
                              ({star.brightness})
                            </span>
                          )}
                        </span>
                        {star.siHua && (
                          <span
                            className={`shrink-0 rounded border px-1 py-0.1 text-[8px] md:text-[9px] font-bold ${
                              SIHUA_BADGE_STYLE[star.siHua] || ''
                            }`}
                          >
                            {star.siHua}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* 궁 하단: 宮名 & 신궁 / 유년 배지 */}
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-0.5 text-[10px] md:text-[11px]">
                <span className={`font-extrabold ${isMingGong ? 'text-amber-400 text-xs' : 'text-slate-200'}`}>
                  {palace.name}
                </span>
                <div className="flex items-center gap-0.5">
                  {isYearlyMing && (
                    <span className="rounded bg-purple-500/20 px-1 text-[8px] font-bold text-purple-300 border border-purple-500/40">
                      유년
                    </span>
                  )}
                  {palace.isShenGong && (
                    <span className="rounded bg-indigo-500/20 px-1 text-[8px] font-bold text-indigo-300 border border-indigo-500/40">
                      신궁
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
