import { AlertTriangle, Clock3, ListChecks, Lock, MessageCircle, Shield, Sparkles, Target } from 'lucide-react';
import type { UnifiedReadingResult } from '@/lib/cosmic/schema';
import type { ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportState } from './start-page-helpers';
import {
  compactText,
  getRelationshipVerdictLabel,
  isRelationshipContactTimingSource,
} from './start-result-relationship';

function getDecisionVerdictLabel(
  value: string | undefined,
  isRelationshipContactTiming: boolean,
  isEn: boolean
) {
  if (isRelationshipContactTiming) {
    if (value === 'move_now') return isEn ? 'Contact' : '연락';
    if (value === 'wait_with_deadline') return isEn ? 'Wait' : '대기';
    if (value === 'narrow_first') return isEn ? 'Narrow' : '축소';
    if (value === 'hold_or_stop') return isEn ? 'Hold' : '보류';
  }

  if (value === 'move_now') return isEn ? 'Move now' : '지금 움직이기';
  if (value === 'wait_with_deadline') return isEn ? 'Wait with a deadline' : '기한을 두고 기다리기';
  if (value === 'narrow_first') return isEn ? 'Narrow first' : '선택지 먼저 좁히기';
  if (value === 'hold_or_stop') return isEn ? 'Hold or stop' : '보류 또는 중단';

  return isEn ? 'First direction' : '첫 방향';
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
  const rawVerdict = compactText(
    freeFocus?.action_conclusion || props.reportData.summary?.title,
    isEn ? 'The first note is ready.' : '첫 정리가 준비되었습니다.',
    260
  );
  const verdict = isRelationshipContactTiming
    ? getRelationshipVerdictLabel(rawVerdict, isEn)
    : rawVerdict;
  const evidence = compactText(
    freeFocus?.evidence_summary || props.reportData.summary?.trust_reason || props.unifiedResult?.detailedContent,
    isEn
      ? 'The note cross-checked the question with Saju, Astrology, and Tarot before showing this result.'
      : '사주, 점성술, 타로를 교차해서 이 결론으로 수렴하는 근거를 먼저 확인했습니다.',
    260
  );
  const delayedChoice = compactText(
    freeFocus?.delayed_choice || props.readingData?.question,
    isEn ? 'The delayed choice you brought into this note.' : '이번 정리에 가져온 미뤄둔 선택입니다.',
    180
  );
  const timingBoundary = compactText(
    freeFocus?.timing_boundary,
    isEn ? 'Open the detailed note to refine the action window.' : '자세한 기록에서 행동 시점을 더 세밀하게 확인하세요.',
    220
  );
  const firstAction = compactText(
    freeFocus?.first_action,
    isRelationshipContactTiming
      ? (isEn
          ? 'Choose one safer relationship move before sending a long message.'
          : '장문을 보내기 전에 더 안전한 첫 행동 하나를 정하세요.')
      : (isEn
          ? 'Use the detailed note to turn this direction into an exact action order.'
          : '자세한 기록에서 이 판정을 정확한 실행 순서로 이어가세요.'),
    220
  );
  const gaeunAction = compactText(
    freeFocus?.gaeun_action || freeFocus?.first_action,
    isRelationshipContactTiming
      ? (isEn
          ? 'Gaeun action: pause, choose one safe boundary, then avoid pressure.'
          : '가은 액션: 먼저 멈추고 안전한 경계 하나를 정한 뒤 압박은 피하세요.')
      : (isEn
          ? 'Gaeun action: write today\'s smallest next step, then avoid forcing the outcome.'
          : '가은 액션: 오늘 가장 작은 다음 행동 하나를 적고, 결과를 억지로 만들려는 움직임은 피하세요.'),
    220
  );
  const avoid = compactText(
    freeFocus?.avoid,
    isEn ? 'Do not rush the part that can backfire.' : '역효과가 날 수 있는 움직임은 먼저 피하세요.',
    220
  );
  const confidenceNote = compactText(
    freeFocus?.confidence_note || evidence,
    evidence,
    260
  );
  const priceLabel = props.dynamicPrice;
  const unlockTrustCopy = isEn
    ? `This is a one-time${priceLabel ? ` ${priceLabel}` : ''} 7-Day Decision Packet. Locked sections include why this verdict was chosen, timing, and message/action variants.`
    : `one-time${priceLabel ? ` ${priceLabel}` : ''} 7일 결정 패킷으로 잠긴 섹션을 엽니다. 왜 이 판정인지, 타이밍, message/action variants를 확인합니다.`;

  const subBlocks = [
    {
      label: isEn ? 'Delayed Choice' : '미룬 선택',
      value: delayedChoice,
      Icon: Shield,
      accent: 'border-white/10 bg-black/25 text-white/90',
      badgeColor: 'text-acc-gold/90 bg-acc-gold/10 border-acc-gold/20',
    },
    {
      label: isEn ? 'Timing Boundary' : '타이밍 경계',
      value: timingBoundary,
      Icon: Clock3,
      accent: 'border-white/10 bg-black/25 text-white/90',
      badgeColor: 'text-amber-300/90 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: isRelationshipContactTiming
        ? (isEn ? 'First Safer Move' : '첫 안전 행동')
        : (isEn ? 'First Action' : '첫 행동'),
      value: firstAction,
      Icon: ListChecks,
      accent: 'border-white/10 bg-black/25 text-white/90',
      badgeColor: 'text-emerald-300/90 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: isEn ? 'Gaeun Action' : '가은 액션',
      value: gaeunAction,
      Icon: Sparkles,
      accent: 'border-white/10 bg-black/25 text-white/90',
      badgeColor: 'text-purple-300/90 bg-purple-500/10 border-purple-500/20',
    },
    {
      label: isEn ? 'Avoid' : '피할 것 (주의)',
      value: avoid,
      Icon: AlertTriangle,
      accent: 'border-rose-500/25 bg-rose-950/20 text-rose-100/90',
      badgeColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    },
  ];

  return (
    <section className="mx-auto mb-8 max-w-3xl overflow-hidden rounded-[32px] border border-acc-gold/25 bg-[linear-gradient(180deg,rgba(244,216,138,0.09),rgba(15,18,28,0.85))] shadow-[0_32px_96px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-acc-gold/30 bg-acc-gold/15 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-acc-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Target className="h-3.5 w-3.5 text-acc-gold" />
              {isEn ? 'First Decision Brief' : '첫 결정 브리프'}
            </div>
            <h2 className="mt-3.5 text-2xl font-bold leading-tight text-white md:text-3xl">
              {isRelationshipContactTiming
                ? (isEn ? 'Read this before you text them.' : '연락하기 전 이 세 가지만 먼저 보세요.')
                : (isEn ? 'Move now, wait, narrow, or stop?' : '움직일지, 기다릴지, 좁힐지, 멈출지 먼저 보세요.')}
            </h2>
            {props.readingData?.question ? (
              <p className="mt-2.5 max-w-2xl text-sm leading-6 text-white/60">
                &ldquo;{props.readingData.question}&rdquo;
              </p>
            ) : null}
          </div>
          {!props.isPremium ? (
            <button
              type="button"
              onClick={() => { void props.onUnlock(); }}
              className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-full border border-acc-gold/40 bg-acc-gold/15 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-acc-gold shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all hover:scale-[1.02] hover:border-acc-gold hover:bg-acc-gold hover:text-black"
            >
              <Lock size={14} />
              {isRelationshipContactTiming
                ? (isEn ? `Open contact timing${priceLabel ? ` ${priceLabel}` : ''}` : `연락 타이밍 열기${priceLabel ? ` ${priceLabel}` : ''}`)
                : (isEn ? `Unlock timing${priceLabel ? ` ${priceLabel}` : ''}` : `타이밍 열기${priceLabel ? ` ${priceLabel}` : ''}`)}
            </button>
          ) : null}
        </div>
      </div>

      {/* Hero Verdict Banner */}
      <div className="mx-6 my-6 rounded-[26px] border border-acc-gold/30 bg-[linear-gradient(135deg,rgba(212,175,55,0.12),rgba(20,24,38,0.7))] p-6 sm:mx-8 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        <div className="mb-3 flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-acc-gold/40 bg-acc-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-acc-gold shadow-[0_0_12px_rgba(212,175,55,0.3)]">
            {isRelationshipContactTiming ? <MessageCircle className="h-3.5 w-3.5" /> : <Target className="h-3.5 w-3.5" />}
            <span>{isRelationshipContactTiming ? (isEn ? 'Verdict' : '연락 판정') : (isEn ? 'Verdict' : '핵심 판정')}</span>
          </div>
          <span className="text-sm font-semibold text-acc-gold/90">{decisionLabel}</span>
        </div>
        <p className="text-base font-medium leading-relaxed text-white/95 sm:text-lg">
          {verdict}
        </p>
      </div>

      {/* Spacious 2-Column Grid for Sub-Blocks */}
      <div className="grid grid-cols-1 gap-4 px-6 pb-6 sm:px-8 md:grid-cols-2">
        {subBlocks.map(({ label, value, Icon, accent, badgeColor }, idx) => (
          <article
            key={label}
            className={`rounded-[24px] border ${accent} p-5 sm:p-6 transition-all duration-300 hover:border-white/20 hover:bg-black/35 ${
              idx === subBlocks.length - 1 && subBlocks.length % 2 !== 0 ? 'md:col-span-2' : ''
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider ${badgeColor}`}>
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            </div>
            <p className="text-sm font-normal leading-7 text-white/85 sm:text-base sm:leading-7">
              {value}
            </p>
          </article>
        ))}
      </div>

      {!props.isPremium ? (
        <div className="border-t border-white/10 px-6 py-5 sm:px-8">
          {freeFocus?.copy_ready_message ? (
            <p className="mb-4 rounded-[20px] border border-acc-gold/20 bg-acc-gold/[0.06] px-5 py-4 text-sm leading-6 text-white/80">
              &ldquo;{freeFocus.copy_ready_message}&rdquo;
            </p>
          ) : null}
          <p className="mb-2.5 flex items-start gap-2 text-xs leading-5 text-white/60">
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-acc-gold" />
            <span>{confidenceNote}</span>
          </p>
          <p className="text-xs leading-5 text-white/45">
            {isEn
              ? (isRelationshipContactTiming
                  ? 'The free brief gives the verdict. The detailed note opens why this verdict was chosen, the contact timing, and the message pattern to avoid.'
                  : 'The free brief gives the verdict. The detailed note opens why this verdict was chosen, when to act, what to avoid, and the action order.')
              : (isRelationshipContactTiming
                  ? '무료 브리프는 판정을 먼저 줍니다. 자세한 노트는 왜 이 판정인지, 연락 타이밍, 피해야 할 메시지를 엽니다.'
                  : '무료 브리프는 판정을 먼저 줍니다. 자세한 노트는 왜 이 판정인지, 언제 움직일지, 무엇을 피할지, 어떤 순서로 실행할지를 엽니다.')}
          </p>
          <p className="mt-2 text-xs leading-5 text-white/45">
            {unlockTrustCopy}
          </p>
        </div>
      ) : null}
    </section>
  );
}
