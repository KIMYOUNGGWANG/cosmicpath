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
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

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
              className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e8c86d] to-[#c8a84d] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-black shadow-[0_0_24px_rgba(200,168,77,0.35)] transition-all hover:scale-[1.03] hover:brightness-110"
            >
              <Lock size={14} />
              {isEn ? `Unlock Full Dossier (${priceLabel})` : `전체 심층 리포트 열기 (${priceLabel})`}
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
      <div className="px-6 sm:px-8">
        <DecisionConsensusGauge
          language={props.language}
          reportData={props.reportData}
          readingData={props.readingData}
          unifiedResult={props.unifiedResult}
        />
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

          {/* Big Golden CTA */}
          <div className="mt-8 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => { void props.onUnlock(); }}
              className="group relative w-full max-w-md overflow-hidden rounded-full bg-gradient-to-r from-[#f0d588] via-[#e8c86d] to-[#c8a84d] p-4 text-center font-cinzel text-base font-extrabold uppercase tracking-wider text-stone-950 shadow-[0_0_35px_rgba(200,168,77,0.45)] transition-all duration-300 hover:scale-[1.02] hover:brightness-110"
            >
              <div className="flex items-center justify-center gap-2.5">
                <Lock size={16} className="text-stone-950" />
                <span>
                  {isEn
                    ? `Unlock Full 8-Phase Report (${priceLabel})`
                    : `내 전체 심층 리포트 즉시 열기 (${priceLabel})`}
                </span>
              </div>
            </button>
            <p className="mt-3 text-center text-xs text-stone-500">
              {isEn
                ? 'One-time secure unlock · Instant full access · Includes 12-Month Fortune Flow'
                : '1회성 안전 결제 · 즉시 전체 열람 가능 · 12개월 운세 장부 & 귀인 분석 포함'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
