import { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock3,
  Compass,
  Lock,
  MessageCircle,
  ScrollText,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
} from 'lucide-react';
import type { UnifiedReadingResult } from '@/lib/cosmic/schema';
import type { ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportState } from './start-page-helpers';
import {
  compactText,
  getRelationshipVerdictLabel,
  isRelationshipContactTimingSource,
} from './start-result-relationship';
import { cleanActionVerdictText } from '@/app/api/reading/free-focus-contract';
import { BlindSpotTeaser } from '@/components/reading/blind-spot-teaser';
import { DecisionConsensusGauge } from '@/components/reading/DecisionConsensusGauge';
import { ScenarioTimelineChart } from '@/components/reading/ScenarioTimelineChart';
import { calculateScenarioDecision, type ScenarioVerdictResult } from '@/lib/engines/scenario-engine';

function getDecisionVerdictLabel(
  value: string | undefined,
  isRelationshipContactTiming: boolean,
  isEn: boolean
) {
  if (isRelationshipContactTiming) {
    if (value === 'move_now') return isEn ? 'Contact Recommended' : '적극적 소통 추천';
    if (value === 'wait_with_deadline') return isEn ? 'Timing Wait' : '전략적 타이밍 대기';
    if (value === 'narrow_first') return isEn ? 'Narrow Focus' : '조건 정비 후 접근';
    if (value === 'hold_or_stop') return isEn ? 'Boundary Hold' : '거리두기 및 관망';
  }

  if (value === 'move_now') return isEn ? 'Optimal Move' : '적극적 추진 권장';
  if (value === 'wait_with_deadline') return isEn ? 'Timing Window' : '골든타임 대기';
  if (value === 'narrow_first') return isEn ? 'Strategic Focus' : '전략 기준 재정비';
  if (value === 'hold_or_stop') return isEn ? 'Risk Defense' : '리스크 방어 및 보류';

  return isEn ? 'Cosmic Verdict' : '운명 판정';
}

type DecisionBriefCardProps = {
  language: 'ko' | 'en';
  reportData: PremiumReportState;
  readingData: ReadingData | null;
  unifiedResult: UnifiedReadingResult | null;
  isPremium: boolean;
  dynamicPrice: string;
  landingSource: string;
  onUnlock: () => Promise<void>;
};

export function DecisionBriefCard(props: DecisionBriefCardProps) {
  const isEn = props.language === 'en';
  const [isInviteCopied, setIsInviteCopied] = useState(false);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  const handleNobleAllyInvite = async () => {
    try {
      setIsCreatingInvite(true);
      const hostName = props.readingData?.name || (isEn ? 'Someone' : '나의 귀인');
      const birthDate = props.readingData?.birthDate || '1995-01-01';

      const res = await fetch('/api/match/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostName,
          hostBirth: birthDate,
          hostTimezone: 'Asia/Seoul',
        }),
      });

      if (!res.ok) throw new Error('Failed to create match invite');
      const data = await res.json();

      const inviteLink = data.inviteUrl || `${window.location.origin}/match/${data.sessionId}/join`;
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteLink);
        setIsInviteCopied(true);
        setTimeout(() => setIsInviteCopied(false), 4000);
      }
    } catch (e) {
      console.error(e);
      if (typeof window !== 'undefined') {
        const fallbackUrl = `${window.location.origin}/match/new?inviter=${encodeURIComponent(props.readingData?.name || '귀인')}`;
        await navigator.clipboard.writeText(fallbackUrl);
        setIsInviteCopied(true);
        setTimeout(() => setIsInviteCopied(false), 4000);
      }
    } finally {
      setIsCreatingInvite(false);
    }
  };
  const isRelationshipContactTiming = isRelationshipContactTimingSource(props.landingSource);
  const freeFocus = props.reportData.free_focus;
  const decisionLabel = getDecisionVerdictLabel(
    freeFocus?.decision_label,
    isRelationshipContactTiming,
    isEn
  );

  const rawVerdict = cleanActionVerdictText(
    freeFocus?.action_conclusion || props.reportData.summary?.title || ''
  );
  const verdict = isRelationshipContactTiming
    ? getRelationshipVerdictLabel(rawVerdict, isEn)
    : rawVerdict || (isEn ? 'The dual-engine fortune analysis is complete.' : '사주와 점성술을 융합한 핵심 판정이 정리되었습니다.');

  const evidence = cleanActionVerdictText(
    freeFocus?.evidence_summary || props.reportData.summary?.trust_reason || props.reportData.summary?.content || ''
  ) || (isEn
    ? 'Grounded in your Saju Day Master, Ten Gods, and Astrology planetary transits.'
    : '사주 일간(Day Master), 십성 격국, 그리고 점성술 행성 트랜짓의 교차 분석 결과입니다.');

  const coreInsight = cleanActionVerdictText(
    props.reportData.summary?.content || ''
  );

  const timingBoundary = cleanActionVerdictText(
    freeFocus?.timing_boundary || ''
  ) || (isEn ? 'Detailed timing window available in the VIP Dossier.' : '상세 리포트에서 월별 골든타임을 확인하세요.');

  const strategicAction = cleanActionVerdictText(
    freeFocus?.first_action || ''
  );

  const riskAvoidance = cleanActionVerdictText(
    freeFocus?.avoid || ''
  );

  const priceLabel = props.dynamicPrice || (isEn ? '$3.99' : '₩4,900');
  const originalPrice = isEn ? '$14.99' : '₩19,800';
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const scenarioDecision: ScenarioVerdictResult =
    (props.reportData as Record<string, unknown>)?.metadata &&
    typeof (props.reportData as Record<string, unknown>).metadata === 'object' &&
    ((props.reportData as Record<string, unknown>).metadata as Record<string, unknown>)?.scenarioDecision
      ? (((props.reportData as Record<string, unknown>).metadata as Record<string, unknown>).scenarioDecision as ScenarioVerdictResult)
      : calculateScenarioDecision({
          scenarioA: props.readingData?.scenarioA,
          scenarioB: props.readingData?.scenarioB,
          question: props.readingData?.question,
          language: props.language,
        });

  const vipTeasers = isEn ? [
    {
      title: `${currentYear}-${nextYear} Monthly Luck Ledger & Golden Timing Windows`,
      desc: 'Pinpointed best and worst months for job change, contracts, and travel.',
      icon: Calendar,
    },
    {
      title: 'Noble Helper (천을귀인) Zodiac & Career Archetype',
      desc: 'Exact characteristics of key allies who will open your doors.',
      icon: Users,
    },
    {
      title: 'High-Risk Loss & Conflict Dates Calendar',
      desc: 'Specific planetary clash dates to avoid major financial and visa commitments.',
      icon: AlertTriangle,
    },
    {
      title: 'If/Then Decision Scenario Simulation',
      desc: 'Custom outcome branches for each path you are considering.',
      icon: Compass,
    },
  ] : [
    {
      title: `${currentYear}~${nextYear} 12개월 월별 운세 장부 & 골든타임`,
      desc: '비자, 이직, 시험, 계약 승인 확률이 극대화되는 정확한 월/주차 분석',
      icon: Calendar,
    },
    {
      title: '나를 도와줄 천을귀인(天乙貴人)의 띠와 직업적 특징',
      desc: '막힌 운을 뚫어주고 귀인이 되어줄 핵심 인물의 성향과 만남의 방향',
      icon: Users,
    },
    {
      title: '반드시 피해야 할 손실·충돌 위험 일진 캘린더',
      desc: '사주 충/형과 점성술 흉각이 겹쳐 사기/손실 위험이 높은 날짜 사전 방어',
      icon: AlertTriangle,
    },
    {
      title: 'If/Then 맞춤형 의사결정 시나리오 시뮬레이션',
      desc: 'A선택(이동) vs B선택(잔류) 시 6개월 뒤 펼쳐질 운의 인과관계 예측',
      icon: Compass,
    },
  ];

  return (
    <section className="mx-auto mb-10 max-w-3xl overflow-hidden rounded-[32px] border border-[#c8a84d]/30 bg-[radial-gradient(ellipse_at_top,rgba(200,168,77,0.12),transparent_50%),linear-gradient(180deg,rgba(18,17,14,0.95),rgba(10,9,8,0.98))] shadow-[0_32px_96px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
      {/* Header Badge & Title */}
      <div className="border-b border-white/10 px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c8a84d]/40 bg-[#c8a84d]/15 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#e8c86d] shadow-[0_0_18px_rgba(200,168,77,0.25)]">
              <Sparkles className="h-3.5 w-3.5 text-[#e8c86d]" />
              {isEn ? '5-Layer Synthesis Brief' : '5단 융합 운명 의사결정 브리프'}
            </div>
            <h2 className="mt-3.5 font-cinzel text-2xl font-bold leading-tight text-stone-50 sm:text-3xl">
              {props.readingData?.question ? (
                <span>&ldquo;{props.readingData.question}&rdquo;</span>
              ) : (
                <span>{isEn ? 'Your Destiny Timing & Strategic Verdict' : '당신의 운명 타이밍 & 핵심 전략 판정'}</span>
              )}
            </h2>
            <p className="mt-2 text-xs uppercase tracking-widest text-[#c8a84d]/80">
              {isEn ? 'Saju · Astrology · Ziwei · Numerology Synthesis' : '사주(구조) · 점성술(타이밍) · 자미두수(명반) · 수비학(주기) 융합'}
            </p>
          </div>

          {!props.isPremium && (
            <button
              type="button"
              onClick={() => { void props.onUnlock(); }}
              className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f0d588] via-[#e8c86d] to-[#c8a84d] px-5 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-stone-950 shadow-[0_0_24px_rgba(200,168,77,0.35)] transition-all hover:scale-[1.03] hover:brightness-110 active:scale-95"
            >
              <Lock size={14} className="text-stone-950" />
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-rose-600/25 px-1 py-0.2 text-[9px] font-extrabold text-rose-950 border border-rose-600/40">75% OFF</span>
                <span className="line-through text-[10px] text-stone-800 opacity-75">{originalPrice}</span>
                <span>{priceLabel}</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Hero Verdict Box */}
      <div className="mx-6 my-6 rounded-[24px] border border-[#c8a84d]/40 bg-[linear-gradient(135deg,rgba(200,168,77,0.14),rgba(25,22,18,0.85))] p-6 sm:mx-8 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.4)]">
        <div className="mb-3 flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c8a84d]/50 bg-[#c8a84d]/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#fae19c]">
            <Target className="h-3.5 w-3.5" />
            <span>{isEn ? 'Core Verdict' : '최종 직답 판정'}</span>
          </div>
          <span className="text-sm font-semibold text-[#e8c86d]">{decisionLabel}</span>
        </div>
        <p className="text-base font-semibold leading-relaxed text-stone-100 sm:text-lg">
          {verdict}
        </p>
      </div>

      {/* 5-Engine Consensus & Raw Coordinates Gauge */}
      <div className="px-6 sm:px-8 space-y-4">
        <DecisionConsensusGauge
          language={props.language}
          reportData={props.reportData}
          readingData={props.readingData}
          unifiedResult={props.unifiedResult}
        />

        {/* A vs B 의사결정 시나리오 & 12개월 타임라인 대시보드 */}
        <ScenarioTimelineChart
          scenarioDecision={scenarioDecision}
          isPremium={props.isPremium}
          language={props.language}
          onUnlock={props.onUnlock}
        />

        {/* Noble Ally 1:1 Match Viral Card */}
        <div className="rounded-[24px] border border-emerald-500/35 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%),linear-gradient(180deg,rgba(18,24,20,0.9),rgba(10,14,12,0.95))] p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                <Users className="h-3 w-3 text-emerald-400" />
                <span>{isEn ? 'Noble Ally Discovery' : '나의 천을귀인(天乙貴人) 찾기'}</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {isEn ? 'Invite a Friend to Check 1:1 Cosmic Chemistry' : '내 사주와 100% 찰떡인 귀인 친구 초대하기'}
              </h4>
              <p className="text-xs text-stone-400">
                {isEn
                  ? 'Send a 1:1 invite to cross-match your 5-engine synastry and synergy.'
                  : '초대 링크를 보내 친구의 생년월일시와 나의 사주를 대조해 0초 만에 융합 궁합을 확인하세요.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNobleAllyInvite}
              disabled={isCreatingInvite}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-3 text-xs font-black uppercase tracking-wider text-stone-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.03] hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {isInviteCopied ? (
                <>
                  <CheckCircle2 size={14} className="text-stone-950" />
                  <span>{isEn ? 'Invite Link Copied!' : '초대 링크 복사 완료!'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-stone-950" />
                  <span>{isEn ? 'Copy 1:1 Match Link' : '친구 소환 링크 복사'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Psychological & Past Pivot Section */}
      <div className="space-y-4 px-6 pb-6 sm:px-8">
        <div className="rounded-[24px] border border-white/10 bg-black/40 p-6">
          <div className="mb-3 flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-[#c8a84d]" />
            <h3 className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#e8c86d]">
              {isEn ? 'Psychological Diagnostic & Past Pivot' : '심리 투시 & 과거 변곡점 진단'}
            </h3>
          </div>
          <p className="text-sm leading-7 text-stone-300 sm:text-base sm:leading-8">
            {coreInsight || evidence}
          </p>
        </div>

        {/* 2-Column: Timing & Risk Defense */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {timingBoundary && (
            <div className="rounded-[22px] border border-amber-500/20 bg-amber-950/15 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                  {isEn ? 'Timing Window' : '운의 타이밍 창'}
                </span>
              </div>
              <p className="text-sm leading-6 text-stone-300">
                {timingBoundary}
              </p>
            </div>
          )}

          {riskAvoidance && (
            <div className="rounded-[22px] border border-rose-500/25 bg-rose-950/20 p-5">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                  {isEn ? 'Critical Risk Trap' : '사전 방어 리스크'}
                </span>
              </div>
              <p className="text-sm leading-6 text-stone-300">
                {riskAvoidance}
              </p>
            </div>
          )}
        </div>

        {/* 1-Click Context-Aware Consultation Prompts */}
        <div className="rounded-[22px] border border-[#c8a84d]/30 bg-gradient-to-r from-[#c8a84d]/10 via-black/40 to-[#c8a84d]/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#e8c86d]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#fae19c]">
                {isEn ? 'Personalized Follow-Up Prompts' : '사주·점성 기반 맞춤 1:1 추가 질문'}
              </span>
            </div>
            <span className="text-[10px] text-stone-400">
              {isEn ? '1-Click Consultation' : '클릭 시 즉시 1:1 대화'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {(isEn
              ? (props.readingData?.context === 'love'
                ? [
                    'When is the optimal golden window to initiate contact?',
                    'What hidden friction or emotional blind spot should I avoid?',
                    'Will this relationship reach a definitive milestone this year?',
                  ]
                : props.readingData?.context === 'general'
                ? [
                    'Which month has the highest risk of financial or contract loss?',
                    'What are the exact zodiac & career traits of my Noble Allies?',
                    'Is this the right timing to expand or make a major commitment?',
                  ]
                : [
                    'Which specific month gives me the highest salary negotiation leverage?',
                    'How can I preemptively prevent conflicts with managers or teammates?',
                    'Between moving vs staying, which path minimizes 1-year regret?',
                  ])
              : (props.readingData?.context === 'love'
                ? [
                    '상대방에게 먼저 연락하기 가장 좋은 골든타임은 언제인가요?',
                    '이 관계에서 제가 반드시 피해야 할 사주적 결핍과 충돌은 무엇인가요?',
                    '올해 안에 관계의 확실한 진전이나 결실이 있을까요?',
                  ]
                : props.readingData?.context === 'general'
                ? [
                    '올해 가장 조심해야 할 금전·자산 손실 시기는 언제인가요?',
                    '나에게 큰 기회를 열어줄 천을귀인의 띠와 직업적 특징은 무엇인가요?',
                    '지금 투자나 새로운 사업 확장을 시작해도 안전한 운인가요?',
                  ]
                : [
                    '이번 이직에서 연봉 협상을 가장 유리하게 끌고 갈 달은 언제인가요?',
                    '상사/팀원과의 불화 리스크를 사전에 완벽히 피하려면 어떻게 해야 하나요?',
                    '이직(이동) vs 잔류 중 1년 뒤 후회가 덜한 승부수는 무엇인가요?',
                  ])
            ).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const chatEl = document.getElementById('oracle-chat') || document.querySelector('[data-chat-interface]');
                  if (chatEl) {
                    chatEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="group flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs font-medium text-stone-200 hover:border-[#c8a84d]/60 hover:bg-[#c8a84d]/15 hover:text-white transition-all shadow-sm active:scale-[0.99]"
              >
                <span className="truncate">{q}</span>
                <Sparkles className="h-3.5 w-3.5 text-[#e8c86d] shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* High-Impact Blind Spot Risk Teaser */}
        {!props.isPremium && (
          <BlindSpotTeaser
            title={isEn ? "5-Engine Blind Spot Risk" : "5대 엔진이 감지한 숨은 사각지대 리스크"}
            previewText={riskAvoidance || (isEn ? "A hidden planetary and cycle clash threatens your next move..." : "선택 직후 발생할 수 있는 치명적 손실과 관계/계약 충돌의 씨앗이 감지되었습니다.")}
            hiddenText={coreInsight || (isEn ? "Planetary transit clash indicates high vulnerability in contracts and impulsive communication before the golden window. Detailed defensive roadmap is in your VIP Dossier." : "사주 형충살과 점성술 흉각이 겹치는 시기에는 충동적인 연락이나 계약 시 70% 이상의 손실 리스크가 발생합니다. 상세 대처법과 골든타임은 VIP 리포트에서 확인하세요.")}
            language={props.language}
            isLocked={true}
            onUnlock={() => { void props.onUnlock(); }}
          />
        )}
      </div>

      {/* High-Converting Blurred VIP Teaser Area */}
      {!props.isPremium && (
        <div className="border-t border-[#c8a84d]/25 bg-gradient-to-b from-[#161410] to-[#0d0c0a] px-6 py-8 sm:px-8">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86d]">
              <Lock className="h-3.5 w-3.5" />
              {isEn ? 'Confidential VIP Dossier (Locked)' : 'VIP 심층 리포트에 잠겨 있는 4대 분석'}
            </div>
            <h3 className="mt-2 font-cinzel text-xl font-bold text-stone-100 sm:text-2xl">
              {isEn ? 'Unlock the Complete Strategic Dossier' : '당신의 인생을 바꿀 정밀 치트키를 잠금 해제하세요'}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {vipTeasers.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black/40 p-5 backdrop-blur-md"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c8a84d]/15 text-[#e8c86d]">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Lock size={12} className="text-[#c8a84d]" />
                        <h4 className="text-sm font-semibold text-stone-200">
                          {item.title}
                        </h4>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-stone-400 filter blur-[1.5px] select-none">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Big Golden CTA with 75% Anchoring */}
          <div className="mt-8 flex flex-col items-center justify-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/15 px-3.5 py-1 text-[11px] font-bold text-rose-300 shadow-sm animate-pulse">
              <span>🔥 {isEn ? 'First Reading Special 75% Support' : '오늘 첫 분석 한정 75% 특가 지원'}</span>
            </div>
            <button
              type="button"
              onClick={() => { void props.onUnlock(); }}
              className="group relative w-full max-w-md overflow-hidden rounded-full bg-gradient-to-r from-[#f0d588] via-[#e8c86d] to-[#c8a84d] p-4 text-center font-cinzel text-base font-extrabold uppercase tracking-wider text-stone-950 shadow-[0_0_35px_rgba(200,168,77,0.45)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-95"
            >
              <div className="flex items-center justify-center gap-2.5">
                <Lock size={16} className="text-stone-950" />
                <span>
                  {isEn
                    ? `Unlock Full 8-Phase Report (${priceLabel})`
                    : `내 전체 심층 리포트 즉시 열기 (${priceLabel})`}
                </span>
                <span className="text-xs font-semibold text-stone-800 line-through opacity-80">
                  {originalPrice}
                </span>
              </div>
            </button>
            <p className="mt-3 text-center text-xs text-stone-400">
              {isEn
                ? 'One-time secure unlock · Instant full access · Includes 12-Month Fortune Flow & High-Risk Clash Dates'
                : '1회성 안전 결제 · 🚨 4분기 위험 일진 캘린더 & 천을귀인 직업/방향 즉시 포함'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
