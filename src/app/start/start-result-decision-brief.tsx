import { Lock, MessageCircle, ScrollText, Shield, Target } from 'lucide-react';
import type { UnifiedReadingResult } from '@/lib/cosmic/schema';
import type { ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportState } from './start-page-helpers';
import {
  compactText,
  getRelationshipVerdictLabel,
  isRelationshipContactTimingSource,
} from './start-result-relationship';

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
  const actionPlanItem = props.reportData.action_plan?.[0];
  const rawVerdict = compactText(
    freeFocus?.action_conclusion || props.reportData.summary?.title,
    isEn ? 'The first verdict is ready.' : '첫 판정이 준비되었습니다.',
    260
  );
  const verdict = isRelationshipContactTiming
    ? getRelationshipVerdictLabel(rawVerdict, isEn)
    : rawVerdict;
  const evidence = compactText(
    freeFocus?.evidence_summary || props.reportData.summary?.trust_reason || props.unifiedResult?.detailedContent,
    isEn
      ? 'CosmicPath cross-checked the question with Saju, Astrology, and Tarot before showing this result.'
      : '사주, 점성술, 타로를 교차해서 이 결론으로 수렴하는 근거를 먼저 확인했습니다.',
    260
  );
  const nextMove = compactText(
    actionPlanItem
      ? `${actionPlanItem.title}: ${actionPlanItem.description}`
      : freeFocus?.next_question,
    isRelationshipContactTiming
      ? (isEn
          ? 'Before sending a long message, open the timing window and the message risk pattern.'
          : '장문으로 밀어붙이기 전에 연락 타이밍과 피해야 할 메시지를 먼저 확인하세요.')
      : (isEn
          ? 'Use the full report to open the exact timing window and action order.'
          : '전체 리포트에서 정확한 행동 시점과 실행 순서를 이어서 확인하세요.'),
    220
  );
  const priceLabel = props.dynamicPrice || (isEn ? 'checkout price' : '결제 단계 가격');
  const blocks = [
    {
      label: isRelationshipContactTiming ? (isEn ? 'Contact Verdict' : '연락 판정') : (isEn ? 'Verdict' : '판정'),
      value: verdict,
      Icon: isRelationshipContactTiming ? MessageCircle : Target,
    },
    { label: isEn ? 'Evidence' : '근거 요약', value: evidence, Icon: Shield },
    {
      label: isRelationshipContactTiming
        ? (isEn ? 'Next Message Move' : '다음 연락 행동')
        : (isEn ? (actionPlanItem ? 'Next Action' : 'Next Prompt') : (actionPlanItem ? '다음 행동' : '다음 확인 질문')),
      value: nextMove,
      Icon: ScrollText,
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
                : (isEn ? 'Read this before the long report.' : '긴 리포트 전에 이 세 가지만 먼저 보세요.')}
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
      <div className="grid gap-3 px-5 py-5 sm:px-7 md:grid-cols-3">
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
          <p className="text-xs leading-5 text-white/45">
            {isEn
              ? (isRelationshipContactTiming
                  ? 'The free brief gives the verdict. The paid report opens why this verdict was chosen, the contact timing, and the message pattern to avoid.'
                  : 'The free brief gives the verdict. The paid report opens why this verdict was chosen, when to act, what to avoid, and the action order.')
              : (isRelationshipContactTiming
                  ? '무료 브리프는 판정을 먼저 줍니다. 유료 리포트는 왜 이 판정인지, 연락 타이밍, 피해야 할 메시지를 엽니다.'
                  : '무료 브리프는 판정을 먼저 줍니다. 유료 리포트는 왜 이 판정인지, 언제 움직일지, 무엇을 피할지, 어떤 순서로 실행할지를 엽니다.')}
          </p>
        </div>
      ) : null}
    </section>
  );
}
