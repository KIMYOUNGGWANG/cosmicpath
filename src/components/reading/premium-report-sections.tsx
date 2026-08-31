'use client';

import { useState, useEffect, type UIEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, Briefcase, Calendar, ChevronDown, Coins, Droplets, Flame, Heart, Shield, Sparkles, Star, Target, TrendingUp, type LucideIcon, ScrollText, Zap, CheckCircle2, ShieldAlert, Lightbulb, Compass, Orbit } from 'lucide-react';
import { EvidenceTooltip } from '../ui/confidence-badge';
import { InsightCard, InsightHighlight } from './ui/InsightCard';
import { DraftProposal } from './draft-proposal';
import { ActionChecklist } from './ActionChecklist';
import { FormattedNarrative } from './ui/FormattedNarrative';
import type { PremiumReportData } from './premium-report';
import { ElementHarmony } from './ElementHarmony';
import { cn } from '@/lib/utils';
import { FortuneTimelineChart } from './FortuneTimelineChart';
import type { SajuResult } from '@/lib/engines/saju';
import type { ShadowTransformationResult } from '@/lib/engines/saju-transformation';
import type { YearHeatmapResult } from '@/lib/engines/timing-heatmap';
import type { Compatibility4DResult } from '@/lib/engines/compatibility-matrix';

export function PremiumSectionInterruptionCard({
  language,
  onRetry,
}: {
  language: 'ko' | 'en';
  onRetry?: () => void;
}) {
  const isEn = language === 'en';

  return (
    <div className="mx-4 rounded-3xl border border-red-500/20 bg-red-500/5 p-12 text-center md:px-6">
      <p className="mb-3 font-medium text-red-300">
        {isEn ? 'We could not finish loading the deeper result.' : '심층 결과를 끝까지 불러오지 못했어요.'}
      </p>
      <p className="mb-5 text-sm leading-6 text-white/48">
        {isEn
          ? 'Pick up from the last completed step and continue loading the remaining sections.'
          : '중간까지 불러온 지점부터 이어서 남은 섹션을 다시 불러올게요.'}
      </p>
      <button
        onClick={onRetry}
        className="rounded-full border border-red-500/30 bg-red-500/20 px-6 py-2 text-sm text-red-100 transition-colors hover:bg-red-500/30"
      >
        {isEn ? 'Continue Loading' : '결과 이어서 불러오기'}
      </button>
    </div>
  );
}

export function HeaderSection({
  summary,
  language,
}: {
  summary: PremiumReportData['summary'];
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const trustScore = summary.trust_score || 3;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pt-4 md:px-6 md:pt-6"
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex text-gold">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              size={16}
              fill={index < trustScore ? 'currentColor' : 'none'}
              className={index < trustScore ? 'text-gold' : 'text-gray-700'}
            />
          ))}
        </div>
        <span className="rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold/80">
          {isEn ? 'Confidence' : '신뢰도'} {trustScore}/5
        </span>
      </div>

      <h1 className="mb-3 text-xl font-bold leading-tight text-white md:text-2xl">
        {summary.title}
      </h1>

      <div className="rounded-2xl border border-white/10 bg-deep-navy/50 p-4 backdrop-blur-md md:p-5">
        <div className="mb-2 flex gap-2">
          <EvidenceTooltip
            tag="📜"
            sources={['saju']}
            explanation={isEn ? 'Analyzes the energy of the birth time.' : '태어난 시각의 기운을 분석합니다.'}
          />
          <EvidenceTooltip
            tag="🌌"
            sources={['astrology']}
            explanation={isEn ? 'Analyzes the movements of the planets.' : '행성의 움직임을 분석합니다.'}
          />
          <EvidenceTooltip
            tag="🔮"
            sources={['ziwei']}
            explanation={isEn ? 'Analyzes the 12-palace destiny architecture.' : '자미두수 12궁 명반을 정밀 분석합니다.'}
          />
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-200">
          {summary.content}
        </p>
        {summary.trust_reason && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-start gap-2">
              <Shield size={14} className="mt-0.5 shrink-0 text-gold/60" />
              <p className="text-xs italic text-gray-400">{summary.trust_reason}</p>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

type FreeFocusDecisionLabel = NonNullable<PremiumReportData['free_focus']>['decision_label'];

function getFreeFocusVerdictLabel(decisionLabel: FreeFocusDecisionLabel, isEn: boolean) {
  if (decisionLabel === 'move_now') return isEn ? 'Move now' : '지금 움직이기';
  if (decisionLabel === 'wait_with_deadline') return isEn ? 'Wait with a deadline' : '기한을 두고 기다리기';
  if (decisionLabel === 'narrow_first') return isEn ? 'Narrow first' : '선택지 먼저 좁히기';
  if (decisionLabel === 'hold_or_stop') return isEn ? 'Hold or stop' : '보류 또는 중단';

  return isEn ? 'First direction' : '첫 방향';
}

export function FreeFocusSection({
  freeFocus,
  language,
  isPremium,
  userQuestion,
}: {
  freeFocus?: PremiumReportData['free_focus'];
  language: 'ko' | 'en';
  isPremium: boolean;
  userQuestion?: string;
}) {
  const isEn = language === 'en';

  if (!freeFocus) {
    return null;
  }

  const verdictLabel = getFreeFocusVerdictLabel(freeFocus.decision_label, isEn);
  const delayedChoice = freeFocus.delayed_choice || userQuestion || freeFocus.next_question;
  const timingBoundary = freeFocus.timing_boundary || freeFocus.next_question;
  const firstAction = freeFocus.first_action || freeFocus.action_conclusion;
  const avoid = freeFocus.avoid || (isEn ? 'Do not rush the part that can backfire.' : '역효과가 날 수 있는 움직임은 먼저 피하세요.');
  const confidenceNote = freeFocus.confidence_note || freeFocus.evidence_summary;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.45, ease: 'easeOut' }}
      className="mt-6 px-4 md:px-6"
    >
      {!isPremium && userQuestion && (
        <div className="mb-4 rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-sm">
          <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/38">
            {isEn ? 'Your Question' : '당신의 질문'}
          </div>
          <p className="text-sm font-medium leading-relaxed text-white/80">
            &ldquo;{userQuestion}&rdquo;
          </p>
        </div>
      )}
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(10,12,24,0.55))] p-5 shadow-[0_24px_80px_rgba(8,12,28,0.35)] backdrop-blur-xl md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-gold/80">
              <Sparkles size={12} />
              {verdictLabel}
            </div>
            <h2 className="mt-3 text-lg font-semibold text-white md:text-2xl">
              {isEn
                ? 'Read the decision brief before you dive deeper.'
                : '더 깊이 들어가기 전에, 결정 브리프부터 읽어보세요.'}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            {isPremium
              ? isEn
                ? 'This is the current high-signal reading distilled into a decision note, timing boundary, first action, and risk.'
                : '지금 흐름에서 가장 신호가 강한 내용을 결정 노트, 타이밍 경계, 첫 행동, 리스크로 압축한 블록입니다.'
              : isEn
                ? 'Free users see the delayed choice, the timing boundary, and the first useful action immediately.'
                : '무료 결과에서도 미룬 선택, 타이밍 경계, 첫 행동을 바로 볼 수 있게 만들었습니다.'}
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InsightCard title={isEn ? 'Delayed Choice' : '미룬 선택'} icon={ScrollText} delay={0}>
            <p>{delayedChoice}</p>
          </InsightCard>
          <InsightCard title={isEn ? 'Timing Boundary' : '타이밍 경계'} icon={Calendar} delay={0.08}>
            <p>{timingBoundary}</p>
          </InsightCard>
          <InsightCard title={isEn ? 'First Action' : '첫 행동'} icon={Target} delay={0.16}>
            <p>{firstAction}</p>
          </InsightCard>
          <InsightCard title={isEn ? 'Avoid' : '피할 것'} icon={AlertTriangle} delay={0.24}>
            <p>{avoid}</p>
          </InsightCard>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <InsightCard title={isEn ? 'Decision Note' : '결정 노트'} icon={Shield} delay={0.28}>
            <p>{freeFocus.action_conclusion}</p>
          </InsightCard>
          <InsightCard title={isEn ? 'Evidence' : '근거'} icon={Shield} delay={0.32}>
            <p>{confidenceNote}</p>
            <p className="mt-3 text-white/58">{freeFocus.evidence_summary}</p>
          </InsightCard>
        </div>
        {freeFocus.copy_ready_message ? (
          <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-6 text-white/72">
            &ldquo;{freeFocus.copy_ready_message}&rdquo;
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}

export function ContentCard({ title, content, isEn = false }: { title: string; content: string; isEn?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 transition-all duration-300 hover:border-[#d4af37]/30 hover:bg-white/[0.07]">
      <div className="flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-white/10">
        <h3 className="text-sm font-bold text-white md:text-base flex items-center gap-2">
          <span className="w-1.5 h-3.5 rounded-full bg-[#d4af37] inline-block" />
          {title}
        </h3>
      </div>
      <FormattedNarrative content={content} isEn={isEn} />
    </div>
  );
}

export function CoreAnalysisSection({
  data,
  sajuData,
  language,
}: {
  data: NonNullable<PremiumReportData['core_analysis']>;
  sajuData?: SajuResult;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';

  return (
    <section className="mt-6 px-4 md:px-6">
      <h2 className="mb-6 flex items-center gap-3 text-xl font-cinzel text-white">
        <Sparkles size={24} className="text-acc-gold" />
        {isEn ? 'Elemental Blueprint' : '내 사주 핵심 정리'}
      </h2>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="mb-4">
          <h3 className="mb-1 text-lg font-bold text-white">
            {isEn ? 'Five Elements Harmony' : '오행 균형도'}
          </h3>
          <p className="text-sm text-white/50">
            {isEn ? 'Your energy distribution based on birth chart' : '내 사주 원국의 오행 분포율'}
          </p>
        </div>
        <ElementHarmony sajuData={sajuData} scores={data.element_scores} language={language} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <InsightCard
          title={isEn ? 'Lacking Elements' : '부족한 오행'}
          tag={isEn ? 'Custom Remedy' : '맞춤 개운법'}
          icon={Droplets}
          className="border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <span className="text-lg font-bold text-blue-200">{data.lacking_elements.elements}</span>
          </div>

          <p className="mb-6 leading-relaxed text-blue-100/80 break-keep">{data.lacking_elements.description}</p>

          <InsightHighlight type="tip">
            <span className="mr-2 font-bold">{isEn ? 'Remedy:' : '개운법:'}</span>
            {data.lacking_elements.remedy}
          </InsightHighlight>
        </InsightCard>

        <InsightCard
          title={isEn ? 'Dominant Elements' : '발달한 오행'}
          tag={isEn ? 'Hidden Talent' : '재능 활용'}
          icon={Flame}
          className="border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-lg font-bold text-amber-200">{data.abundant_elements.elements}</span>
          </div>

          <p className="mb-6 leading-relaxed text-amber-100/80 break-keep">{data.abundant_elements.description}</p>

          <InsightHighlight type="default">
            <span className="mr-2 font-bold">{isEn ? 'Strategy:' : '활용법:'}</span>
            {data.abundant_elements.usage}
          </InsightHighlight>
        </InsightCard>
      </div>
    </section>
  );
}

export function AccordionSection({
  title,
  items,
  source,
  language,
}: {
  title: string;
  items: { id: string; title: string; content: string }[];
  source?: string;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';

  return (
    <section className="mt-8 px-4 md:px-6">
      <h2 className="mb-6 flex items-center gap-3 text-xl font-cinzel text-white">
        {source && (
          <EvidenceTooltip
            tag={source === 'saju' ? '📜' : '🌌'}
            sources={[source]}
            explanation={isEn ? 'Analysis based on this scholarly system.' : '이 섹션의 분석은 해당 학문 체계를 근거로 합니다.'}
          />
        )}
        {title}
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {items.map((item, index) => (
          <InsightCard
            key={item.id}
            title={item.title}
            delay={index * 0.1}
            className="border-white/10 bg-white/5 transition-colors hover:border-acc-gold/30"
          >
            <p className="whitespace-pre-line leading-relaxed text-secondary-100">{item.content}</p>
          </InsightCard>
        ))}
      </div>
    </section>
  );
}

export function ActionPlanSection({
  actionPlan,
  trustScore,
  language,
}: {
  actionPlan: NonNullable<PremiumReportData['action_plan']>;
  trustScore: number;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';

  return (
    <section className="mt-8 px-4 md:mt-10 md:px-6">
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-white md:mb-4 md:text-lg">
        <Calendar size={18} className="text-gold" />
        {isEn ? 'Action Window (Super Days)' : '행동의 창 (Super Days)'}
      </h2>

      <div className="grid gap-3">
        {actionPlan.map((item, index) => (
          <DraftProposal
            key={index}
            title={item.title}
            date={item.date}
            time={item.date.includes(' ') ? item.date.split(' ')[1] : '12:00'}
            description={item.description}
            confidence={trustScore * 20}
            language={language}
            onConfirm={() => {}}
            onCancel={() => {}}
          />
        ))}
      </div>

      <ActionChecklist items={actionPlan} language={language} />
    </section>
  );
}

export function NumerologySection({
  data,
  language,
}: {
  data: NonNullable<PremiumReportData['numerology']>;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const { life_path, personal_year, decision_strategy, lucky_numbers, lucky_day_advice } = data;

  const actionBadgeColors: Record<string, string> = {
    PUSH: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    HARVEST: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    PIVOT: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    DEFEND: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  return (
    <section className="mt-6 px-4 md:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#f5d77f] border border-[#c8a84d]/40 bg-[#c8a84d]/15 px-2.5 py-0.5 rounded-full">
            {isEn ? '5-Layer Synthesis' : '5대 엔진 융합'}
          </span>
          <span>{isEn ? 'Numerology & Life Cycle Strategy' : '수비학 9년 인생 주기 & 행동 전략'}</span>
        </h2>
      </div>

      <div className="space-y-4">
        {/* 1. Life Path Number Card */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-[#0e0d0a] p-5 shadow-lg">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex flex-shrink-0 flex-col items-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-indigo-400/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 shadow-[0_0_24px_rgba(99,102,241,0.25)]">
                <span className="bg-gradient-to-br from-white via-indigo-200 to-indigo-400 bg-clip-text text-5xl font-bold text-transparent">
                  {life_path.number}
                </span>
                <div className="absolute -bottom-3 rounded-full border border-indigo-400/50 bg-indigo-900/90 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-200 shadow-md">
                  Life Path
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left">
              <div>
                <h3 className="mb-1 text-base font-bold text-white md:text-lg">{life_path.title}</h3>
                <p className="text-sm leading-relaxed text-indigo-100/90">{life_path.meaning}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
                  <span className="text-xs font-bold text-[#e8c86d]">
                    {isEn ? '[Saju Connection]' : '[사주 오행 연결 고리]'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-stone-300">{life_path.saju_connection}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column: Personal Year (2026) & Decision Strategy */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 2. 9-Year Personal Year Cycle */}
          {personal_year && (
            <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/20 to-black/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {isEn ? '2026-2027 Personal Year Cycle' : '2026년 개인년 9년 주기'}
                </span>
                {personal_year.action_tag && (
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider ${actionBadgeColors[personal_year.action_tag] || 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                    {personal_year.action_tag}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-stone-100 mb-1.5">
                {personal_year.keyword} (Year {personal_year.number})
              </h4>
              <p className="text-xs leading-relaxed text-stone-300 mb-3">
                {personal_year.theme}
              </p>
              <div className="rounded-lg border border-amber-500/20 bg-black/30 p-2.5 text-[11px] text-amber-200/90">
                {isEn
                  ? `Cycle Signal: Year ${personal_year.number} aligns with your current major luck timing.`
                  : `주기 판정: 올해는 9년 주기 중 ${personal_year.number}번째 해로, 사주 세운과 조화를 이룹니다.`}
              </div>
            </div>
          )}

          {/* 3. Human Design Decision Strategy */}
          {decision_strategy && (
            <div className="rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-950/20 to-black/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  {isEn ? 'Human Design Strategy' : '휴먼디자인 의사결정 전략'}
                </span>
                <span className="rounded-full border border-sky-500/40 bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-sky-300">
                  AUTHORITY
                </span>
              </div>
              <h4 className="text-sm font-bold text-stone-100 mb-1.5">
                {decision_strategy.energy_type}
              </h4>
              <p className="text-xs leading-relaxed text-stone-300 mb-2">
                <strong className="text-sky-200">{isEn ? 'Execution Rule: ' : '행동 전략: '}</strong>
                {decision_strategy.strategy}
              </p>
              <p className="text-xs leading-relaxed text-stone-300">
                <strong className="text-sky-200">{isEn ? 'Internal Authority: ' : '내부 권위: '}</strong>
                {decision_strategy.authority}
              </p>
            </div>
          )}
        </div>

        {/* 4. Lucky Numbers & Timing Advice */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-medium text-stone-400">
                {isEn ? 'Resonant Harmonic Numbers' : '공명 조화 숫자'}
              </div>
              <div className="flex gap-2">
                {lucky_numbers.map((num, index) => (
                  <div
                    key={index}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-sm font-bold text-stone-200 shadow-sm"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-stone-400">
                {isEn ? 'Timing Action Tip' : '타이밍 실행 팁'}
              </div>
              <p className="text-xs leading-relaxed text-stone-300">{lucky_day_advice}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PastLifeSection({
  data,
  language,
}: {
  data: NonNullable<PremiumReportData['past_life']>;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const { theme, karma, soul_mission } = data;

  return (
    <div className="mt-8 px-4 md:px-0">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-300">
        <span className="text-lg">🌀</span>
        {isEn ? 'Symbolic Pattern & Cycle' : '반복 패턴과 과제'}
      </h3>

      <div className="space-y-4">
        <div className="rounded-xl border border-purple-500/20 bg-purple-900/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-lg">
              🕰️
            </div>
            <div>
              <h4 className="mb-1 text-sm font-bold text-white">{theme.title}</h4>
              <p className="text-sm leading-relaxed text-purple-100 opacity-90">{theme.content}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-purple-500/20 bg-purple-900/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-lg">
              ⚖️
            </div>
            <div>
              <h4 className="mb-1 text-sm font-bold text-white">{karma.title}</h4>
              <p className="text-sm leading-relaxed text-purple-100 opacity-90">{karma.content}</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-2xl" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-lg">
              ✨
            </div>
            <div>
              <h4 className="mb-1 text-sm font-bold text-purple-200">{soul_mission.title}</h4>
              <p className="text-sm leading-relaxed text-purple-100">{soul_mission.content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SpecialAnalysisSection({
  data,
  language,
}: {
  data: NonNullable<PremiumReportData['special_analysis']>;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const specials = [
    data.noble_person && { id: 'noble_person', icon: '🎯', ...data.noble_person },
    data.charm && { id: 'charm', icon: '💖', ...data.charm },
    data.conflicts && { id: 'conflicts', icon: '🔄', ...data.conflicts },
  ].filter(Boolean) as { id: string; icon: string; title: string; content: string }[];

  return (
    <section className="mt-6 px-4 md:px-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <Zap size={18} className="text-gold" />
        {isEn ? 'Oracle Edge Insight' : '오라클 심화 인사이트'}
      </h2>
      <div className="space-y-3">
        {specials.map((item) => {
          const isOpen = openItems.has(item.id);
          return (
            <div key={item.id} className={cn('accordion-item', isOpen && 'open')}>
              <div className="accordion-header flex cursor-pointer items-center justify-between p-4" onClick={() => toggleItem(item.id)}>
                <h3 className="flex items-center gap-2 text-sm font-medium md:text-base text-white">
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.title}</span>
                </h3>
                <ChevronDown
                  size={20}
                  className={cn('accordion-icon text-gray-400 transition-transform duration-300', isOpen && 'rotate-180')}
                />
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1">
                      <p className="whitespace-pre-line leading-loose text-white/80">{item.content}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function DateSelectionSection({
  data,
  language,
}: {
  data: NonNullable<PremiumReportData['date_selection']>;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState<'auspicious' | 'inauspicious'>('auspicious');

  const auspiciousDates = data.auspicious || [];
  const inauspiciousDates = data.inauspicious || [];

  if (auspiciousDates.length === 0 && inauspiciousDates.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekday = isEn
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
        : ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
      return isEn ? `${month}/${day} (${weekday})` : `${month}월 ${day}일 (${weekday})`;
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="mt-8 px-4 md:px-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <span className="text-2xl">📅</span>
        {isEn ? 'Date Selection Guide' : '택일 가이드'}
        <span className="ml-2 rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
          NEW
        </span>
      </h2>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab('auspicious')}
          className={cn(
            'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            activeTab === 'auspicious'
              ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
              : 'border border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
          )}
        >
          <span className="flex items-center justify-center gap-1.5">
            <CheckCircle2 size={15} />
            <span>{isEn ? 'Auspicious Windows' : '도약 길일'} ({auspiciousDates.length})</span>
          </span>
        </button>
        <button
          onClick={() => setActiveTab('inauspicious')}
          className={cn(
            'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            activeTab === 'inauspicious'
              ? 'border border-red-500/40 bg-red-500/20 text-red-300'
              : 'border border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
          )}
        >
          <span className="flex items-center justify-center gap-1.5">
            <ShieldAlert size={15} />
            <span>{isEn ? 'Defend Windows' : '방어 흉일'} ({inauspiciousDates.length})</span>
          </span>
        </button>
      </div>

      <div className="space-y-3">
        {(activeTab === 'auspicious' ? auspiciousDates : inauspiciousDates).map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'rounded-xl border p-4',
              activeTab === 'auspicious'
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-red-500/30 bg-red-500/10'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'text-lg font-bold',
                      activeTab === 'auspicious' ? 'text-emerald-300' : 'text-red-300'
                    )}
                  >
                    {formatDate(item.date)}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs',
                      activeTab === 'auspicious'
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : 'bg-red-500/20 text-red-200'
                    )}
                  >
                    {item.purpose}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{item.reason}</p>
              </div>
              <span className="text-2xl">{activeTab === 'auspicious' ? '🍀' : '🚫'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <span>📜</span>
          {isEn ? 'Based on Saju date analysis' : '사주 기반 택일 분석'}
        </span>
      </div>
    </section>
  );
}

export function AstroDeepSection({
  data,
  language,
}: {
  data: NonNullable<PremiumReportData['astro_deep']>;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const sectionMetaMap: Record<string, { ko: string; en: string; subtitleKo: string; subtitleEn: string }> = {
    sun_moon_dynamic: {
      ko: '내면과 외면의 조화 (태양 · 달 별자리)',
      en: 'Inner vs Outer Self (Sun & Moon Harmony)',
      subtitleKo: '의식적 목표와 무의식적 감정 욕구의 균형',
      subtitleEn: 'Conscious ambitions vs emotional needs',
    },
    ascendant_influence: {
      ko: '사회적 페르소나와 첫인상 (상승궁 · 어센던트)',
      en: 'Social Persona & Impression (Rising Sign)',
      subtitleKo: '세상이 나를 인식하는 프레임과 본래 내면의 갭',
      subtitleEn: 'How the world perceives you vs your inner truth',
    },
    dominant_element: {
      ko: '기질적 핵심 원소와 에너지 분포 (원소 밸런스)',
      en: 'Core Elements & Energy Balance',
      subtitleKo: '나를 주도하는 원소와 보완이 필요한 기운',
      subtitleEn: 'Your primary elemental drive and balancing qualities',
    },
    planetary_warning: {
      ko: '주의해야 할 행성 주기와 타이밍 (리스크 관리)',
      en: 'Planetary Cycles & Strategic Timing',
      subtitleKo: '불필요한 충돌을 피하고 안정을 유지해야 할 시기',
      subtitleEn: 'Timing windows requiring patience and strategic caution',
    },
  };

  const sections = [
    { id: 'sun_moon_dynamic', data: data.sun_moon_dynamic, icon: <Sparkles className="text-amber-300" size={18} /> },
    { id: 'ascendant_influence', data: data.ascendant_influence, icon: <Compass className="text-indigo-300" size={18} /> },
    { id: 'dominant_element', data: data.dominant_element, icon: <Flame className="text-rose-400" size={18} /> },
    { id: 'planetary_warning', data: data.planetary_warning, icon: <ShieldAlert className="text-amber-400" size={18} /> },
  ].filter((section) => section.data);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 px-4 md:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Orbit size={20} className="text-[#d4af37]" />
          <span>{isEn ? 'Astrological Deep Dive' : '서양 점성술 천체 심층 분석'}</span>
          <span className="ml-2 rounded-full border border-purple-500/30 bg-purple-500/15 px-2.5 py-0.5 text-xs text-purple-300">
            {isEn ? 'CELESTIAL MAP' : '천체 기상도'}
          </span>
        </h2>
      </div>

      <div className="space-y-3">
        {sections.map(({ id, data: sectionData, icon }) => {
          if (!sectionData) {
            return null;
          }
          const isOpen = openItems.includes(id);
          const meta = sectionMetaMap[id];
          const displayTitle = meta ? (isEn ? meta.en : meta.ko) : (sectionData.title || '').replace(/[☀️🌙⬆️🔥💧⚠️]/g, '').trim();
          const displaySubtitle = meta ? (isEn ? meta.subtitleEn : meta.subtitleKo) : '';

          return (
            <div
              key={id}
              className={cn(
                'overflow-hidden rounded-2xl border transition-all duration-300',
                isOpen
                  ? 'border-purple-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <button
                onClick={() => toggleItem(id)}
                className="flex w-full cursor-pointer items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white md:text-base block">{displayTitle}</span>
                    {displaySubtitle && (
                      <span className="text-xs text-white/50 block mt-0.5">{displaySubtitle}</span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={cn('text-gray-400 transition-transform duration-300 shrink-0 ml-2', isOpen && 'rotate-180')}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="pl-11">
                        <FormattedNarrative content={sectionData.content} isEn={isEn} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <span>✨</span>
          {isEn ? 'Based on birth chart analysis' : '출생 차트 기반 분석'}
        </span>
      </div>
    </section>
  );
}

export function DeepDiveSection({
  data,
  language,
}: {
  data: NonNullable<PremiumReportData['deep_dive']>;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState<'saju' | 'astro' | 'ziwei'>('saju');

  return (
    <section className="mt-6 px-4 md:mt-8 md:px-6">
      <div className="mb-6 flex gap-2 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
        {(['saju', 'astro', 'ziwei'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-300 md:py-3 md:text-sm',
              activeTab === tab
                ? 'border border-gold/20 bg-white/10 text-gold shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            )}
          >
            {tab === 'saju' && (isEn ? '📜 Saju' : '📜 사주명리')}
            {tab === 'astro' && (isEn ? '🌌 Astrology' : '🌌 점성술')}
            {tab === 'ziwei' && (isEn ? '🔮 Ziwei Doushu' : '🔮 자미두수 명반')}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {activeTab === 'saju' && data.saju && (
          <div className="space-y-4">
            <ContentCard title={isEn ? 'Elemental Analysis' : '오행 분석'} content={data.saju.balance} />
            <ContentCard title={isEn ? 'Major Luck Analysis' : '대운 분석'} content={data.saju.flow_10yr} />
            <ContentCard title={isEn ? 'Yearly Luck Analysis' : '세운 분석'} content={data.saju.flow_yearly} />
          </div>
        )}
        {activeTab === 'astro' && data.astro && (
          <div className="space-y-4">
            <ContentCard title={isEn ? 'Natal Chart' : '출생 차트'} content={data.astro.natal} />
            <ContentCard title={isEn ? 'Transit' : '트랜짓'} content={data.astro.transit} />
          </div>
        )}
        {activeTab === 'ziwei' && data.tarot && (
          <div className="space-y-4">
            <ContentCard title={isEn ? '12-Palace Blueprint' : '12궁 명반 구조'} content={data.tarot.spread_analysis} />
            <ContentCard title={isEn ? 'Vocation & Destiny Turning Point' : '관록·재백궁 심층 변곡점'} content={data.tarot.card_details} />
          </div>
        )}
      </div>
    </section>
  );
}

type LifeAreaCard = {
  id: string;
  icon: LucideIcon;
  title: string;
  tag?: string;
  content: string;
  subsections?: string[];
};

export function FortuneFlowSection({
  data,
  language,
}: {
  data: NonNullable<PremiumReportData['fortune_flow']>;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const items = [
    { id: 'major_luck', ...data.major_luck },
    { id: 'yearly_luck', ...data.yearly_luck },
  ];

  const currentMonth = new Date().getMonth();
  const monthlyData =
    data.monthly_luck ||
    data.monthly_highlights?.map((month) => ({
      ...month,
      element: undefined,
      opportunity: undefined,
      warning: undefined,
      score: 50,
    }));

  return (
    <section className="mt-6 px-4 md:px-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <TrendingUp size={18} className="text-gold" />
        {isEn ? 'Fortune Flow' : '운의 흐름'}
      </h2>

      {data.timeline_scores && data.timeline_scores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
            <span className="text-gold">📈</span>
            {isEn ? '10-Year Major Luck Timeline' : '10년 대운 타임라인'}
          </h3>
          <FortuneTimelineChart scores={data.timeline_scores} language={language} />
        </motion.div>
      )}

      {monthlyData && monthlyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
            <Calendar size={16} className="text-[#d4af37]" />
            {isEn ? '12-Month Execution Matrix' : '12개월 타이밍 매트릭스'}
            <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
              MATRIX
            </span>
          </h3>

          <div className="mb-4 grid grid-cols-4 gap-2 md:grid-cols-6">
            {monthlyData.map((month, index) => {
              const score = month.score || 50;
              const isCurrentMonth = index === currentMonth;
              const isSelected = selectedMonth === index;

              const getActionTag = (val: number) => {
                if (val >= 75) return { label: 'PUSH', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
                if (val >= 65) return { label: 'PIVOT', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
                if (val >= 55) return { label: 'HARVEST', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
                return { label: 'DEFEND', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
              };
              const actionTag = getActionTag(score);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedMonth(isSelected ? null : index)}
                  className={cn(
                    'relative flex flex-col items-center rounded-xl p-2.5 transition-all text-center border',
                    isSelected
                      ? 'border-[#d4af37] bg-[#d4af37]/15 shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                      : isCurrentMonth
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                  )}
                >
                  {isCurrentMonth && (
                    <span className="absolute -top-1.5 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                  )}
                  <span className="text-xs text-gray-400 mb-1">{month.month}</span>
                  <span className={cn(
                    'text-sm font-bold',
                    score >= 70 ? 'text-emerald-400' :
                    score >= 50 ? 'text-amber-400' : 'text-rose-400'
                  )}>
                    {score}
                  </span>
                  <span className={cn(
                    'mt-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded border',
                    actionTag.cls
                  )}>
                    {actionTag.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedMonth !== null && monthlyData[selectedMonth] && (
            <motion.div
              key={selectedMonth}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                <div>
                  <span className="text-xs text-[#d4af37] font-semibold">{isEn ? 'Selected Month' : '선택된 월'}</span>
                  <h4 className="text-base font-bold text-white">
                    {monthlyData[selectedMonth].month} - {monthlyData[selectedMonth].theme}
                  </h4>
                </div>
                {monthlyData[selectedMonth].score != null && (
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full border',
                      monthlyData[selectedMonth].score! >= 75 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      monthlyData[selectedMonth].score! >= 65 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      monthlyData[selectedMonth].score! >= 55 ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                      'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    )}>
                      {monthlyData[selectedMonth].score! >= 75 ? 'PUSH' :
                       monthlyData[selectedMonth].score! >= 65 ? 'PIVOT' :
                       monthlyData[selectedMonth].score! >= 55 ? 'HARVEST' : 'DEFEND'}
                    </span>
                    <span className="text-xs font-semibold text-gold">
                      {monthlyData[selectedMonth].score}점
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                {monthlyData[selectedMonth].opportunity && (
                  <div className="flex gap-2.5 items-start">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-emerald-300 mb-0.5">{isEn ? 'Opportunity' : '기회 영역'}</p>
                      <p className="text-xs text-stone-300 leading-relaxed">{monthlyData[selectedMonth].opportunity}</p>
                    </div>
                  </div>
                )}
                {monthlyData[selectedMonth].warning && (
                  <div className="flex gap-2">
                    <span className="text-red-400">⚠️</span>
                    <div>
                      <p className="font-medium text-red-300">{isEn ? 'Warning' : '주의'}</p>
                      <p className="text-gray-300">{monthlyData[selectedMonth].warning}</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-blue-400">💡</span>
                  <div>
                    <p className="font-medium text-blue-300">{isEn ? 'Advice' : '조언'}</p>
                    <p className="text-gray-300">{monthlyData[selectedMonth].advice}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const isOpen = openItems.has(item.id);
          return (
            <div key={item.id} className={cn('accordion-item', isOpen && 'open')}>
              <div className="accordion-header flex cursor-pointer items-center justify-between p-4" onClick={() => toggleItem(item.id)}>
                <h3 className="text-sm font-medium md:text-base text-white">{item.title}</h3>
                <ChevronDown
                  size={20}
                  className={cn('accordion-icon text-gray-400 transition-transform duration-300', isOpen && 'rotate-180')}
                />
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1">
                      <p className="whitespace-pre-line text-[15px] leading-loose text-white/80">{item.content}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function LifeAreasSection({
  data,
  language,
}: {
  data: NonNullable<PremiumReportData['life_areas']>;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const areas = [
    data.career && { id: 'career', icon: Briefcase, ...data.career },
    data.wealth && { id: 'wealth', icon: Coins, ...data.wealth },
    data.love && { id: 'love', icon: Heart, ...data.love },
    data.health && { id: 'health', icon: Activity, ...data.health },
  ].filter(Boolean) as LifeAreaCard[];

  return (
    <section className="mt-6 px-4 md:px-6">
      <h2 className="mb-6 flex items-center gap-3 text-xl font-cinzel text-white">
        <Target size={24} className="text-acc-gold" />
        {isEn ? 'Detailed Life Analysis' : '영역별 상세 분석'}
      </h2>

      <div className="space-y-3">
        {areas.map((area) => {
          const isOpen = openItems.has(area.id);
          const Icon = area.icon;
          return (
            <div key={area.id} className={cn('accordion-item rounded-2xl border transition-colors', isOpen ? 'border-acc-gold/30 bg-acc-gold/5' : 'border-white/10 bg-white/5')}>
              <button
                onClick={() => toggleItem(area.id)}
                className="flex w-full cursor-pointer items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-deep-navy shadow-inner">
                    <Icon size={18} className="text-acc-gold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold md:text-base">{area.title}</h3>
                    {area.tag && <p className="text-xs text-acc-gold/80">{area.tag}</p>}
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={cn('text-gray-400 transition-transform duration-300', isOpen && 'rotate-180')}
                />
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-2">
                      {area.subsections && (
                        <div className="mb-6 flex flex-wrap gap-2">
                          {area.subsections.map((subsection, subsectionIndex) => (
                            <span
                              key={subsectionIndex}
                              className="rounded-md border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/70"
                            >
                              {subsection}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <p className="whitespace-pre-line text-[15px] leading-loose text-white/80">{area.content}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {data.compatibility && <CompatibilitySection data={data.compatibility} language={language} />}
    </section>
  );
}

export function CompatibilitySection({
  data,
  language,
}: {
  data: NonNullable<NonNullable<PremiumReportData['life_areas']>['compatibility']>;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState<'boss' | 'colleague' | 'friend'>('boss');

  const content = data[activeTab];

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-pink-300">
        <span className="text-lg">🤝</span>
        {isEn ? 'Social Compatibility' : '사회적 궁합 분석'}
        <span className="ml-2 rounded-full border border-pink-500/30 bg-pink-500/20 px-2 py-0.5 text-xs text-pink-300">
          NEW
        </span>
      </h3>

      <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('boss')}
          className={cn(
            'min-w-[100px] flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all',
            activeTab === 'boss'
              ? 'border border-pink-500/40 bg-pink-500/20 text-pink-300'
              : 'border border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
          )}
        >
          {isEn ? 'Boss/Leader' : '상사/리더'}
        </button>
        <button
          onClick={() => setActiveTab('colleague')}
          className={cn(
            'min-w-[100px] flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all',
            activeTab === 'colleague'
              ? 'border border-pink-500/40 bg-pink-500/20 text-pink-300'
              : 'border border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
          )}
        >
          {isEn ? 'Colleague' : '동료/파트너'}
        </button>
        <button
          onClick={() => setActiveTab('friend')}
          className={cn(
            'min-w-[100px] flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all',
            activeTab === 'friend'
              ? 'border border-pink-500/40 bg-pink-500/20 text-pink-300'
              : 'border border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
          )}
        >
          {isEn ? 'Friend' : '친구/지인'}
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border border-pink-500/20 bg-pink-900/10 p-5"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-pink-200">
              <span>👍</span> {isEn ? 'Ideal Type' : '잘 맞는 유형'}
            </div>
            <p className="rounded-lg border border-white/5 bg-black/20 p-3 text-sm leading-relaxed text-gray-300">
              {content.ideal_type}
            </p>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-red-200">
              <span>👎</span> {isEn ? 'Avoid Type' : '주의할 유형'}
            </div>
            <p className="rounded-lg border border-white/5 bg-black/20 p-3 text-sm leading-relaxed text-gray-300">
              {content.avoid_type}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gold">
            <span>💡</span> {isEn ? 'Winning Strategy' : activeTab === 'friend' ? '우정 관리 팁' : '처세술/전략'}
          </div>
          <p className="text-sm leading-relaxed text-gray-300">
            {'strategy' in content ? content.strategy : content.advice}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function TraitsSection({
  traits,
  language,
}: {
  traits: PremiumReportData['traits'];
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const [scrollProgress, setScrollProgress] = useState(0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'saju':
        return '📜';
      case 'astrology':
      case 'astro':
        return '🌌';
      case 'ziwei':
        return '宮';
      default:
        return '✨';
    }
  };

  const getSourceLabel = (type: string) => {
    switch (type) {
      case 'saju':
        return isEn ? 'Saju Luck' : '사주명리';
      case 'astro':
      case 'astrology':
        return isEn ? 'Astrology' : '점성술';
      case 'ziwei':
        return isEn ? 'Ziwei' : '자미두수';
      default:
        return isEn ? 'Analysis' : '분석';
    }
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = event.currentTarget;
    const totalScroll = scrollWidth - clientWidth;
    setScrollProgress(totalScroll > 0 ? scrollLeft / totalScroll : 0);
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6 pl-4 md:mt-8 md:pl-6"
    >
      <div
        className="snap-x scrollbar-hide flex gap-4 overflow-x-auto pb-8 pr-4 md:pr-6"
        onScroll={handleScroll}
      >
        {traits.map((trait, idx) => (
          <div
            key={idx}
            className="group relative w-[78vw] shrink-0 snap-center rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-lg transition-colors hover:border-gold/30 md:w-[320px] md:p-6"
          >
            <div className="flex items-start justify-between">
              <EvidenceTooltip
                tag={getTypeIcon(trait.type)}
                sources={[trait.type]}
                explanation={`${getSourceLabel(trait.type)} 기반 분석 데이터입니다.`}
              />
              <span
                className={cn(
                  'rounded border px-2 py-1 text-xs font-bold',
                  trait.grade === 'S'
                    ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                    : trait.grade === 'A'
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                      : 'border-gray-600 bg-gray-600/10 text-gray-400'
                )}
              >
                Grade {trait.grade}
              </span>
            </div>
            <div className="mt-3">
              <h3 className="mb-2 text-lg font-bold text-white">{trait.name}</h3>
              <div className="my-2 h-px w-full bg-white/10" />
              <p className="break-keep whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                {trait.description}
              </p>
            </div>
            {idx === 0 && (
              <div className="absolute bottom-3 right-3 flex animate-pulse items-center gap-1 text-[10px] text-gray-500 md:hidden">
                <span>Swipe</span>
                <span>→</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mb-6 mt-[-1rem] flex justify-center gap-1.5 md:hidden">
        {traits.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              Math.round(scrollProgress * (traits.length - 1)) === idx
                ? 'w-6 bg-gold'
                : 'w-1 bg-white/20'
            )}
          />
        ))}
      </div>
    </motion.section>
  );
}

/**
 * ⚡ 1. 전화위복(轉禍爲福) 살의 프로페셔널 승화 섹션
 */
export function ShadowTransformationSection({
  data,
  language,
}: {
  data: ShadowTransformationResult;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const detectedTransformations = data.transformations.filter(t => t.isDetected);

  return (
    <section className="mt-8 px-4 md:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-widest text-[#f5d77f]">
            TRANSFORMATION
          </span>
          <span>{isEn ? 'Transformation of Shadows' : '전화위복(轉禍爲福): 살의 프로페셔널 승화'}</span>
        </h2>
      </div>

      {/* Synthesis Banner */}
      <div className="mb-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-black to-stone-900/60 p-5 shadow-lg">
        <div className="flex items-start gap-3.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-500/20 text-xs font-bold text-amber-300">
            ★
          </span>
          <div>
            <h3 className="text-sm font-bold text-stone-100 mb-1">
              {isEn ? `Primary Superpower: ${data.primarySuperpower}` : `핵심 승화 무기: ${data.primarySuperpower}`}
            </h3>
            <p className="text-xs leading-relaxed text-amber-200/90">
              {isEn ? data.overallSynthesisEn : data.overallSynthesisKo}
            </p>
          </div>
        </div>
      </div>

      {/* Detected Sal Transformation Cards */}
      <div className="space-y-4">
        {detectedTransformations.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-stone-800 bg-gradient-to-b from-[#141210] to-[#0c0a09] p-5 shadow-md"
          >
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-base font-bold text-amber-300">
                  {isEn ? item.salNameEn : `${item.salNameKo} (${item.salNameHanja})`}
                </span>
              </div>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                {item.category}
              </span>
            </div>

            {/* 2-Column: Shadow vs Transformed Superpower */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
              {/* Shadow Risk */}
              <div className="rounded-xl border border-rose-500/20 bg-rose-950/15 p-3.5">
                <div className="text-[11px] font-bold text-rose-300 mb-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  {isEn ? 'Unconscious Shadow Pattern' : '의식하지 않을 때의 그림자(위험)'}
                </div>
                <p className="text-xs leading-relaxed text-rose-200/80 break-keep">
                  {isEn ? item.shadowPattern.en : item.shadowPattern.ko}
                </p>
              </div>

              {/* Transformed Superpower */}
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-3.5">
                <div className="text-[11px] font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {isEn ? item.transformedSuperpower.titleEn : item.transformedSuperpower.titleKo}
                </div>
                <p className="text-xs leading-relaxed text-emerald-200/80 break-keep">
                  {isEn ? item.transformedSuperpower.descEn : item.transformedSuperpower.descKo}
                </p>
              </div>
            </div>

            {/* Archetypes & Action Strategy */}
            <div className="rounded-xl border border-white/5 bg-black/40 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-stone-400">
                  {isEn ? 'Optimal High-Value Domains:' : '최적화 고수익 도메인:'}
                </span>
                {item.recommendedArchetypes.map((arch, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-stone-300 font-medium"
                  >
                    {arch}
                  </span>
                ))}
              </div>
              <div className="text-xs leading-relaxed text-amber-200/90 border-t border-white/5 pt-2 break-keep">
                <strong className="text-amber-300">{isEn ? 'Execution Directive: ' : '실전 무기 활용법: '}</strong>
                {isEn ? item.actionStrategy.en : item.actionStrategy.ko}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 📈 2. 12개월 48주차 주간 골든타임 히트맵 섹션
 */
export function WeeklyHeatmapSection({
  data,
  language,
}: {
  data: YearHeatmapResult;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(1);

  const quarterMonths = data.months.slice((selectedQuarter - 1) * 3, selectedQuarter * 3);

  const phaseColors: Record<string, { bg: string; text: string; border: string }> = {
    ATTACK: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    HARVEST: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    NEGOTIATE: { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/40' },
    DEFEND: { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
  };

  return (
    <section className="mt-8 px-4 md:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="rounded-full border border-sky-500/40 bg-sky-500/15 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-widest text-sky-300">
            TIMING HEATMAP
          </span>
          <span>{isEn ? '12-Month 48-Week Action Heatmap' : '12개월 48주차 주간 골든타임 히트맵'}</span>
        </h2>
      </div>

      {/* Peak Quarter Highlight */}
      <div className="mb-4 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 to-black/80 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-300">
            {isEn ? 'Peak Annual Momentum' : '연간 최고 전성기 분기'}
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            {data.peakQuarter}
          </h3>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-stone-300">
          <span className="text-[#f5d77f] font-bold">
            {isEn ? `Highest Week: Week ${data.highestScoringWeek.weekOfYear} (${data.highestScoringWeek.score} pts)` : `최고조 주차: ${data.highestScoringWeek.month}월 ${data.highestScoringWeek.weekOfMonth}주차 (${data.highestScoringWeek.score}점)`}
          </span>
          <div className="text-[11px] text-stone-400 mt-0.5">
            {isEn ? 'Golden Execution Days: ' : '최고 황금일: '}
            <strong className="text-white">{data.highestScoringWeek.dates.join(', ')}</strong>
          </div>
        </div>
      </div>

      {/* Quarter Tab Selector */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {([1, 2, 3, 4] as const).map((q) => (
          <button
            key={q}
            onClick={() => setSelectedQuarter(q)}
            className={cn(
              'py-2 rounded-xl text-xs font-bold transition-all border text-center',
              selectedQuarter === q
                ? 'border-sky-400 bg-sky-500/25 text-sky-200 shadow-md'
                : 'border-white/10 bg-black/30 text-stone-400 hover:text-stone-200 hover:bg-white/5'
            )}
          >
            {isEn ? `Q${q}` : `${q}분기 (${(q - 1) * 3 + 1}~${q * 3}월)`}
          </button>
        ))}
      </div>

      {/* Monthly Breakdown in Quarter */}
      <div className="space-y-4">
        {quarterMonths.map((m) => (
          <div
            key={m.month}
            className="rounded-2xl border border-stone-800 bg-[#0e0d0b] p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-sm font-bold text-white">
                  {isEn ? m.monthNameEn : m.monthNameKo}
                </span>
                <span className="text-[11px] text-stone-400">
                  {isEn ? `Avg ${m.averageScore} pts` : `평균 ${m.averageScore}점`}
                </span>
              </div>
              <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase', phaseColors[m.dominantPhase]?.border, phaseColors[m.dominantPhase]?.bg, phaseColors[m.dominantPhase]?.text)}>
                {m.dominantPhase}
              </span>
            </div>

            {/* Weeks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {m.weeks.map((w) => {
                const cfg = phaseColors[w.phase] || phaseColors.NEGOTIATE;
                return (
                  <div
                    key={w.weekOfYear}
                    className="rounded-xl border border-white/5 bg-black/40 p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-stone-300">
                          {isEn ? `Week ${w.weekOfMonth}` : `${w.weekOfMonth}주차`}
                        </span>
                        <span className={cn('text-[10px] font-extrabold px-1.5 py-0.2 rounded border', cfg.border, cfg.bg, cfg.text)}>
                          {w.score}점
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-stone-400 mb-2">
                        {isEn ? w.themeEn : w.themeKo}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-1.5 text-[10px] text-stone-500">
                      {w.goldenDates.length > 0 && (
                        <div className="text-amber-300/90 font-medium">
                          {isEn ? 'Golden: ' : '황금일: '}
                          {w.goldenDates.map(d => d.slice(5)).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 🎯 3. 4차원 입체 궁합 & 갈등 3초 화해 매뉴얼 섹션
 */
export function Compatibility4DSection({
  data,
  language,
}: {
  data: Compatibility4DResult;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';

  return (
    <section className="mt-8 px-4 md:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="rounded-full border border-pink-500/40 bg-pink-500/15 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-widest text-pink-300">
            4D SYNERGY
          </span>
          <span>{isEn ? '4D Compatibility & Conflict Manual' : '4차원 입체 궁합 & 갈등 3초 화해 매뉴얼'}</span>
        </h2>
      </div>

      <div className="space-y-4">
        {/* Score & Grade Header Card */}
        <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/30 via-black to-stone-900/60 p-5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-pink-300">
              {isEn ? 'Overall Dynamic Score' : '4차원 종합 시너지 점수'}
            </span>
            <h3 className="text-2xl font-bold font-cinzel text-white mt-1">
              {data.overallScore} <span className="text-sm font-sans font-normal text-stone-400">/ 100</span>
            </h3>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-pink-400/40 bg-gradient-to-br from-pink-500/20 to-purple-500/10 text-2xl font-bold font-cinzel text-pink-200 shadow-md">
            {data.grade}
          </div>
        </div>

        {/* 2-Column: Spiritual Sync vs Material Sync */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 1. Spiritual Sync */}
          <div className="rounded-2xl border border-purple-500/25 bg-black/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-300">
                {isEn ? '1. Spiritual & Value Alignment' : '1. 영혼 & 가치관 궁합'}
              </span>
              <span className="text-xs font-extrabold text-purple-300">{data.spiritualSync.score}점</span>
            </div>
            <h4 className="text-sm font-bold text-stone-200 mb-1">
              {isEn ? data.spiritualSync.titleEn : data.spiritualSync.titleKo}
            </h4>
            <p className="text-xs leading-relaxed text-stone-400">
              {isEn ? data.spiritualSync.descEn : data.spiritualSync.descKo}
            </p>
          </div>

          {/* 2. Material Sync */}
          <div className="rounded-2xl border border-emerald-500/25 bg-black/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-300">
                {isEn ? '2. Material & Lifestyle Sync' : '2. 현실 & 생활방식 궁합'}
              </span>
              <span className="text-xs font-extrabold text-emerald-300">{data.materialSync.score}점</span>
            </div>
            <h4 className="text-sm font-bold text-stone-200 mb-1">
              {isEn ? data.materialSync.titleEn : data.materialSync.titleKo}
            </h4>
            <p className="text-xs leading-relaxed text-stone-400">
              {isEn ? data.materialSync.descEn : data.materialSync.descKo}
            </p>
          </div>
        </div>

        {/* 3. Conflict Danger Trigger */}
        <div className="rounded-2xl border border-rose-500/25 bg-rose-950/15 p-4">
          <div className="text-xs font-bold text-rose-300 mb-1">
            {isEn ? '3. High-Stress Conflict Danger Point' : '3. 충돌 위기 트리거 & 금기 표현'}
          </div>
          <p className="text-xs text-rose-200/90 mb-2">
            {isEn ? data.conflictTrigger.dangerPointEn : data.conflictTrigger.dangerPointKo}
          </p>
          <div className="rounded-xl border border-rose-500/30 bg-black/50 p-2.5 text-xs text-rose-300">
            <strong>{isEn ? 'Worst Phrase to Avoid: ' : '절대 하지 말아야 할 최악의 반응: '}</strong>
            {isEn ? data.conflictTrigger.worstResponseToAvoidEn : data.conflictTrigger.worstResponseToAvoidKo}
          </div>
        </div>

        {/* 4. 3-Second Conflict Resolution Manual */}
        <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-950/20 via-black to-[#110e08] p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-300">
              ⚡
            </span>
            <h4 className="text-sm font-bold text-amber-200">
              {isEn ? '3-Second Instant De-Escalation Magic Manual' : '싸웠을 때 3초 만에 상대를 녹이는 마법의 대화법'}
            </h4>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-amber-400/30 bg-black/60 p-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block mb-1">
                {isEn ? 'Magic Opening Sentence (Verbatim):' : '상대의 방어벽을 즉시 해제하는 마법의 오프닝 문장:'}
              </span>
              <p className="text-sm font-semibold text-stone-100 italic leading-relaxed">
                {isEn ? data.threeSecondResolution.magicOpeningPhraseEn : data.threeSecondResolution.magicOpeningPhraseKo}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-white/10 bg-black/30 p-2.5 text-stone-300">
                <strong className="text-amber-300">{isEn ? 'Core Rule: ' : '핵심 원칙: '}</strong>
                {isEn ? data.threeSecondResolution.coreDeEscalationRuleEn : data.threeSecondResolution.coreDeEscalationRuleKo}
              </div>
              <div className="rounded-lg border border-white/10 bg-black/30 p-2.5 text-stone-300">
                <strong className="text-amber-300">{isEn ? 'Best Timing: ' : '대화 타이밍: '}</strong>
                {isEn ? data.threeSecondResolution.bestTimeToTalkEn : data.threeSecondResolution.bestTimeToTalkKo}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
