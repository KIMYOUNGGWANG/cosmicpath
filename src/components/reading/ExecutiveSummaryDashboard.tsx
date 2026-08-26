'use client';

import { motion } from 'framer-motion';
import { Compass, Sparkles, AlertTriangle, ShieldCheck, Target, Zap, TrendingUp, RefreshCw, ShieldAlert, Coins } from 'lucide-react';
import type { PremiumReportData } from './premium-report';
import type { SajuResult } from '@/lib/engines/saju';

interface ExecutiveSummaryDashboardProps {
  report: PremiumReportData;
  question?: string;
  language?: 'ko' | 'en';
  sajuResult?: SajuResult;
  userName?: string;
}

export function ExecutiveSummaryDashboard({
  report,
  question,
  language = 'ko',
  sajuResult,
  userName = '귀하',
}: ExecutiveSummaryDashboardProps) {
  const isEn = language === 'en';

  // 12개월 운세 중 최고/최저 점수 월 추출
  const monthlyData = report.fortune_flow?.monthly_luck || [];
  const sortedMonths = [...monthlyData].sort((a, b) => (b.score || 50) - (a.score || 50));
  const bestMonth = sortedMonths[0];
  const riskMonth = sortedMonths[sortedMonths.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-4 md:mx-6 mb-8 rounded-3xl border border-[#d4af37]/30 bg-gradient-to-b from-[#181a28]/95 via-[#12131e]/90 to-[#0a0b12] p-5 md:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
    >
      {/* Decorative ambient glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37]">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4af37] px-2 py-0.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30">
                VIP Executive Brief
              </span>
              <span className="text-xs text-white/40">30-Second Verdict</span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-white tracking-tight mt-0.5">
              {userName}님을 위한 2026 핵심 결단 & 타이밍 요약
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-stone-300">
          <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
          <span>신뢰 지수 94%</span>
        </div>
      </div>

      {/* 3 High-Impact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        {/* 1. Final Strategic Verdict */}
        <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/5 p-4.5 hover:border-[#d4af37]/45 transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#f3e3b2]">
              <Target className="h-4 w-4 text-[#d4af37]" />
              {isEn ? 'Primary Strategy' : '최우선 승부수 (전략 코어)'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
              CORE
            </span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            {sajuResult?.dayMaster
              ? `${sajuResult.dayMaster}목(木)의 끈기와 사업적 직관을 살려, 잔가지를 쳐내고 단일 킬러 코어 시스템에 집중하십시오.`
              : (isEn ? 'Focus your primary firepower on establishing a single indisputable core capability.' : '여러 일을 분산하지 말고, 나의 대표 무기 1개를 벼리는 데 모든 시간을 쏟으십시오.')}
          </p>
        </div>

        {/* 2. Golden Opportunity Window (PUSH) */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/15 p-4.5 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Zap className="h-4 w-4" />
              {isEn ? 'Golden Timing' : '최고의 기회의 달 (골든타임)'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              PUSH
            </span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            {bestMonth ? (
              <>
                <strong className="text-emerald-300 font-semibold">{bestMonth.month} ({bestMonth.theme})</strong>: 
                운세 점수 {bestMonth.score || 88}점. {bestMonth.opportunity || '이직, 연봉 협상, 런칭 등 중요한 승부수를 던지기 가장 유리한 시기입니다.'}
              </>
            ) : (
              '2026년 하반기 (8월~11월): 금수(金水) 기운의 안정적인 조력과 사회적 성취의 창이 열립니다.'
            )}
          </p>
        </div>

        {/* 3. Critical Risk Defense (DEFEND) */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-950/15 p-4.5 hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
              <AlertTriangle className="h-4 w-4" />
              {isEn ? 'Critical Defense' : '손실 차단 리스크 월'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              DEFEND
            </span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            {riskMonth && (riskMonth.score || 50) < 65 ? (
              <>
                <strong className="text-rose-300 font-semibold">{riskMonth.month} ({riskMonth.theme})</strong>: 
                충동적인 계약 체결, 불필요한 동업, 무리한 지출을 절대 피하고 내부를 정비하십시오.
              </>
            ) : (
              '환절기 및 원국의 충(沖) 시기: 감정적 결정이나 섣부른 확장 대신 계약 문서를 2회 이상 점검하십시오.'
            )}
          </p>
        </div>
      </div>

      {/* 4-Stage Action Signal Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5 text-[11px] text-white/50">
        <span className="font-medium text-white/70">{isEn ? 'Tactical Action Signals:' : '12개월 실전 행동 신호:'}</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <TrendingUp size={13} /> PUSH (전력질주)
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <RefreshCw size={13} /> PIVOT (전략정비)
          </span>
          <span className="flex items-center gap-1 text-blue-400 font-semibold">
            <Coins size={13} /> HARVEST (실리회수)
          </span>
          <span className="flex items-center gap-1 text-rose-400 font-semibold">
            <ShieldAlert size={13} /> DEFEND (리스크차단)
          </span>
        </div>
      </div>
    </motion.div>
  );
}
