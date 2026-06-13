'use client';

import { useState, useEffect, type UIEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, Briefcase, Calendar, ChevronDown, Coins, Droplets, Flame, Heart, Shield, Sparkles, Star, Target, TrendingUp, type LucideIcon, ScrollText, Zap } from 'lucide-react';
import { EvidenceTooltip } from '../ui/confidence-badge';
import { InsightCard, InsightHighlight } from './ui/InsightCard';
import { DraftProposal } from './draft-proposal';
import { ActionChecklist } from './ActionChecklist';
import type { PremiumReportData } from './premium-report';
import { ElementHarmony } from './ElementHarmony';
import { cn } from '@/lib/utils';
import { FortuneTimelineChart } from './FortuneTimelineChart';
import type { SajuResult } from '@/lib/engines/saju';

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
            sources={['tarot']}
            explanation={isEn ? 'Reads the current intuitive energy.' : '현재의 직관적 에너지를 읽습니다.'}
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

export function ContentCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
      <h3 className="mb-3 text-sm font-bold text-white md:text-base">{title}</h3>
      <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">{content}</p>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

          <p className="mb-6 leading-relaxed text-blue-100/80">{data.lacking_elements.description}</p>

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

          <p className="mb-6 leading-relaxed text-amber-100/80">{data.abundant_elements.description}</p>

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
            tag={source === 'saju' ? '📜' : source === 'tarot' ? '🔮' : '🌌'}
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
  const { life_path, lucky_numbers, lucky_day_advice } = data;

  return (
    <section className="mt-6 px-4 md:px-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <span className="text-xl">🔢</span>
        {isEn ? 'Numerology Insight' : '수비학(Numerology) 분석'}
        <span className="ml-2 rounded-full border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
          NEW
        </span>
      </h2>

      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-5">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="flex flex-col items-center gap-6 md:flex-row">
          <div className="flex flex-shrink-0 flex-col items-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <span className="bg-gradient-to-br from-white to-indigo-300 bg-clip-text text-5xl font-bold text-transparent">
                {life_path.number}
              </span>
              <div className="absolute -bottom-3 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                Life Path
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 text-center md:text-left">
            <div>
              <h3 className="mb-1 text-lg font-bold text-white">{life_path.title}</h3>
              <p className="text-sm leading-relaxed text-indigo-100">{life_path.meaning}</p>
            </div>

            <div className="rounded-lg border border-white/5 bg-black/30 p-3">
              <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
                <span className="text-xs font-bold text-gold">🔗 {isEn ? 'Saju Connection' : '사주 연결 고리'}</span>
              </div>
              <p className="text-xs text-gray-300">{life_path.saju_connection}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-400">
              <span>🍀</span> {isEn ? 'Lucky Numbers' : '행운의 숫자'}
            </div>
            <div className="flex gap-2">
              {lucky_numbers.map((num, index) => (
                <div
                  key={index}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-sm font-bold text-white"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-400">
              <span>💡</span> {isEn ? 'Action Tip' : '활용 팁'}
            </div>
            <p className="text-xs leading-relaxed text-gray-300">{lucky_day_advice}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <span>📐</span>
          {isEn ? 'Calculated via Pythagorean Numerology' : '피타고라스 수비학 기반 계산'}
        </span>
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
          ✅ {isEn ? 'Lucky Days' : '길일'} ({auspiciousDates.length})
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
          ⚠️ {isEn ? 'Avoid' : '흉일'} ({inauspiciousDates.length})
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

  const sections = [
    { id: 'sun_moon_dynamic', data: data.sun_moon_dynamic, icon: '☀️🌙' },
    { id: 'ascendant_influence', data: data.ascendant_influence, icon: '⬆️' },
    { id: 'dominant_element', data: data.dominant_element, icon: '🔥' },
    { id: 'planetary_warning', data: data.planetary_warning, icon: '⚠️' },
  ].filter((section) => section.data);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 px-4 md:px-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <span className="text-2xl">🌌</span>
        {isEn ? 'Astro Deep Dive' : '점성술 심층 분석'}
        <span className="ml-2 rounded-full border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
          NEW
        </span>
      </h2>

      <div className="space-y-3">
        {sections.map(({ id, data: sectionData, icon }) => {
          if (!sectionData) {
            return null;
          }
          const isOpen = openItems.includes(id);

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
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-medium text-white md:text-base">{sectionData.title}</span>
                </div>
                <ChevronDown
                  size={20}
                  className={cn('text-gray-400 transition-transform duration-300', isOpen && 'rotate-180')}
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
                      <div className="pl-9">
                        <p className="whitespace-pre-line text-[15px] leading-loose text-white/80">
                          {sectionData.content}
                        </p>
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

export function CompatibleDeepDiveSection({
  data,
  language,
}: {
  data: NonNullable<PremiumReportData['deep_dive']>;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState<'saju' | 'astro' | 'tarot'>('saju');

  return (
    <section className="mt-6 px-4 md:mt-8 md:px-6">
      <div className="mb-6 flex gap-2 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
        {(['saju', 'astro', 'tarot'] as const).map((tab) => (
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
            {tab === 'tarot' && (isEn ? '🔮 Tarot' : '🔮 타로')}
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
        {activeTab === 'tarot' && data.tarot && (
          <div className="space-y-4">
            <ContentCard title={isEn ? 'Spread' : '스프레드'} content={data.tarot.spread_analysis} />
            <ContentCard title={isEn ? 'Card Detail' : '카드 상세'} content={data.tarot.card_details} />
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
            <span className="text-gold">🗓️</span>
            {isEn ? '12-Month Fortune Map' : '12개월 월운 지도'}
            <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
              NEW
            </span>
          </h3>

          <div className="mb-4 grid grid-cols-4 gap-2 md:grid-cols-6">
            {monthlyData.map((month, index) => {
              const score = month.score || 50;
              const isCurrentMonth = index === currentMonth;
              const isSelected = selectedMonth === index;

              const getScoreColor = (value: number) => {
                if (value >= 70) {
                  return 'from-emerald-500/30 to-emerald-600/20 border-emerald-500/40';
                }
                if (value >= 50) {
                  return 'from-amber-500/30 to-amber-600/20 border-amber-500/40';
                }
                return 'from-red-500/30 to-red-600/20 border-red-500/40';
              };

              return (
                <button
                  key={index}
                  onClick={() => setSelectedMonth(isSelected ? null : index)}
                  className={cn(
                    'relative rounded-xl border p-3 text-center transition-all duration-300',
                    isSelected
                      ? `bg-gradient-to-br ${getScoreColor(score)} scale-105 shadow-lg`
                      : isCurrentMonth
                        ? 'border-gold/50 bg-gradient-to-br from-gold/20 to-gold/10'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                  )}
                >
                  {isCurrentMonth && (
                    <span className="absolute -right-1.5 -top-1.5 h-3 w-3 animate-pulse rounded-full bg-gold" />
                  )}
                  <p className="text-xs text-gray-400">{month.month}</p>
                  <p className="mt-1 text-sm font-bold text-white">{month.theme}</p>
                  {month.score != null && (
                    <div className="mt-2 text-xs">
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5',
                          score >= 70
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : score >= 50
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-red-500/20 text-red-300'
                        )}
                      >
                        {score}점
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedMonth !== null && monthlyData[selectedMonth] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">{monthlyData[selectedMonth].element || '🌟'}</span>
                <h4 className="font-bold text-white">
                  {monthlyData[selectedMonth].month} - {monthlyData[selectedMonth].theme}
                </h4>
              </div>

              <div className="space-y-3 text-sm">
                {monthlyData[selectedMonth].opportunity && (
                  <div className="flex gap-2">
                    <span className="text-emerald-400">✅</span>
                    <div>
                      <p className="font-medium text-emerald-300">{isEn ? 'Opportunity' : '기회'}</p>
                      <p className="text-gray-300">{monthlyData[selectedMonth].opportunity}</p>
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

export function TarotSpreadSection({
  cards,
  onCardClick,
  language,
}: {
  cards: { name: string; isReversed: boolean; image?: string }[];
  onCardClick: (idx: number) => void;
  language: 'ko' | 'en';
}) {
  const isEn = language === 'en';
  const roles = isEn
    ? ['Current Situation', 'Challenge/Obstacle', 'Solution/Outcome']
    : ['현재 상황', '장애물/과제', '해결책/결과'];

  const [flipped, setFlipped] = useState<boolean[]>(cards.map(() => false));

  useEffect(() => {
    // PRD F-04: 3초 후 첫 번째 카드만 자동 공개, 나머지는 수동 클릭
    const timer = setTimeout(() => {
      setFlipped((prev) => prev.map((v, i) => (i === 0 ? true : v)));
    }, 3000);
    return () => clearTimeout(timer);
  }, [cards]);

  const handleCardClick = (idx: number) => {
    if (!flipped[idx]) {
      setFlipped((prev) => prev.map((v, i) => (i === idx ? true : v)));
    } else {
      onCardClick(idx);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-6 px-4 md:px-6"
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <EvidenceTooltip
          tag="🔮"
          sources={['tarot']}
          explanation={isEn
            ? 'Reads the current intuition and psychological state through Tarot cards.'
            : '타로 카드를 통해 현재의 직관과 심리 상태를 읽어냅니다.'}
        />
        {isEn ? 'Tarot Reading' : '타로 리딩'}
      </h2>
      <div className="grid grid-cols-3 gap-2 md:gap-4 relative perspective-[1000px]">
        {cards.map((card, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <motion.div
              onClick={() => handleCardClick(idx)}
              className="group relative aspect-[2/3] w-full cursor-pointer rounded-lg transition-all"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped[idx] ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
            >
              {/* Back of Card */}
              <div
                className="absolute inset-0 backface-hidden rounded-lg border border-[#D4AF37]/30 bg-[#0a0a0c] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="w-full h-full border border-white/5 m-1 rounded-md flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                  {/* Glow pulse — 클릭 유도 힌트 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <span className="relative flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-50" />
                      <Star size={20} className="relative text-[#D4AF37]/80" />
                    </span>
                    <span className="text-[9px] md:text-[10px] text-[#D4AF37]/60 tracking-widest uppercase font-medium px-2 text-center">
                      {isEn ? 'Tap to reveal' : '터치하여 확인'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Front of Card */}
              <div 
                className="absolute inset-0 backface-hidden rounded-lg border border-white/10 hover:border-tarot-purple/50 overflow-hidden"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.name}
                      className={cn('h-full w-full object-cover', card.isReversed && 'rotate-180')}
                      onError={(event) => {
                        (event.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className={cn(
                        'h-full w-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20',
                        card.isReversed && 'rotate-180'
                      )}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-2 text-center transition-all group-hover:bg-black/20">
                    <span
                      className={cn(
                        'notranslate text-[10px] font-bold text-white/90 md:text-sm shadow-black drop-shadow-md',
                        card.isReversed && 'text-red-300'
                      )}
                      translate="no"
                    >
                      {card.name}
                      {card.isReversed && (isEn ? ' (Rev)' : ' (역)')}
                    </span>
                  </div>
              </div>
            </motion.div>
            <span className="mt-2 text-[10px] font-medium text-gold md:text-xs">
              {roles[idx] || (isEn ? `Card ${idx + 1}` : `카드 ${idx + 1}`)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-[10px] text-gray-500">
        {isEn
          ? 'Click each card to see detailed integrated interpretation.'
          : '각 카드를 클릭하면 상세한 융합 해석을 볼 수 있습니다.'}
      </p>
    </motion.section>
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
      case 'tarot':
        return '🔮';
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
      case 'tarot':
        return isEn ? 'Tarot' : '타로';
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
