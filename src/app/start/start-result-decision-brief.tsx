import { AlertTriangle, Clock3, ListChecks, Lock, MessageCircle, Shield, Target } from 'lucide-react';
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
  const priceLabel = props.dynamicPrice || (isEn ? 'checkout price' : '결제 단계 가격');
  const blocks = [
    {
      label: isRelationshipContactTiming ? (isEn ? 'Contact Verdict' : '연락 판정') : (isEn ? 'Decision' : '판정'),
      value: `${decisionLabel}: ${verdict}`,
      Icon: isRelationshipContactTiming ? MessageCircle : Target,
    },
    { label: isEn ? 'Delayed Choice' : '미룬 선택', value: delayedChoice, Icon: Shield },
    { label: isEn ? 'Timing Boundary' : '타이밍 경계', value: timingBoundary, Icon: Clock3 },
    {
      label: isRelationshipContactTiming
        ? (isEn ? 'First Safer Move' : '첫 안전 행동')
        : (isEn ? 'First Action' : '첫 행동'),
      value: firstAction,
      Icon: ListChecks,
    },
    {
      label: isEn ? 'Avoid' : '피할 것',
      value: avoid,
      Icon: AlertTriangle,
    },
  ];

  return (
    <section className="mx-auto mb-6 max-w-3xl overflow-hidden rounded-[30px] border border-acc-gold/18 bg-[linear-gradient(180deg,rgba(244,216,138,0.08),rgba(255,255,255,0.025))] shadow-[0_28px_80px_rgba(7,10,20,0.42)] backdrop-blur-2xl">
      <div className="border-b border-white/8 px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-acc-gold">
              {isEn ? 'First Decision Brief' : '첫 결정 브리프'}
            </div>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white md:text-3xl">
              {isRelationshipContactTiming
                ? (isEn ? 'Read this before you text them.' : '연락하기 전 이 세 가지만 먼저 보세요.')
                : (isEn ? 'Move now, wait, narrow, or stop?' : '움직일지, 기다릴지, 좁힐지, 멈출지 먼저 보세요.')}
            </h2>
            {props.readingData?.question ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
                &ldquo;{props.readingData.question}&rdquo;
              </p>
            ) : null}
          </div>
          {!props.isPremium ? (
            <button
              type="button"
              onClick={() => { void props.onUnlock(); }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-acc-gold/25 bg-acc-gold/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-acc-gold transition-all hover:border-acc-gold/50 hover:bg-acc-gold hover:text-black"
            >
              <Lock size={14} />
              {isRelationshipContactTiming
                ? (isEn ? `Open contact timing ${priceLabel}` : `연락 타이밍 열기 ${priceLabel}`)
                : (isEn ? `Unlock timing ${priceLabel}` : `타이밍 열기 ${priceLabel}`)}
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid gap-3 px-5 py-5 sm:px-7 md:grid-cols-2 xl:grid-cols-4">
        {blocks.map(({ label, value, Icon }) => (
          <article key={label} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/42">
              <Icon className="h-3.5 w-3.5 text-acc-gold" />
              {label}
            </div>
            <p className="text-sm leading-7 text-white/78">{value}</p>
          </article>
        ))}
      </div>
      {!props.isPremium ? (
        <div className="border-t border-white/8 px-5 py-4 sm:px-7">
          {freeFocus?.copy_ready_message ? (
            <p className="mb-3 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/72">
              &ldquo;{freeFocus.copy_ready_message}&rdquo;
            </p>
          ) : null}
          <p className="mb-2 flex items-start gap-2 text-xs leading-5 text-white/55">
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
        </div>
      ) : null}
    </section>
  );
}
