'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Bell, RefreshCw, ChevronRight, Lock, MessageCircle, ScrollText, Shield, Target } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import type { UnifiedReadingResult } from '@/lib/cosmic/schema';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportData } from '@/components/reading/premium-report';
import { DailyRetentionBanner } from '@/components/reading/DailyRetentionBanner';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import {
  ORACLE_CHARACTER_IDS,
  getOraclePersona,
  getRecommendedOracleCharacterId,
  inferQuestionIntent,
  getOracleIntentLabel,
  type OracleCharacterId,
  type OracleRecommendationContext,
} from '@/lib/ai/oracle-personas';
import type {
  PremiumReportState,
  PremiumReportViewMetadata,
  ReadingMetadata,
} from './start-page-helpers';

const PremiumReport = dynamic(() => import('@/components/reading/premium-report').then((mod) => mod.PremiumReport), {
  loading: () => <div className="flex justify-center py-20"><Skeleton className="h-96 w-full" /></div>,
});
const ChatInterface = dynamic(() => import('@/components/oracle-chat/ChatInterface').then((mod) => mod.ChatInterface), {
  loading: () => <Skeleton className="h-48 w-full" />,
});
const OracleCalibrationPanel = dynamic(
  () => import('@/components/reading/OracleCalibrationPanel').then((mod) => mod.OracleCalibrationPanel),
  {
    loading: () => (
      <div className="flex w-full max-w-3xl justify-center py-8">
        <Skeleton className="h-[320px] w-full rounded-[28px]" />
      </div>
    ),
  }
);
const UnifiedReadingDisplay = dynamic(
  () => import('@/components/cosmic/UnifiedReadingDisplay').then((mod) => mod.UnifiedReadingDisplay),
  {
    loading: () => <Skeleton className="h-[420px] w-full rounded-[32px]" />,
  }
);

type StartResultStageProps = {
  language: 'ko' | 'en';
  isLoading: boolean;
  loadingPhase: { phase: number; label: string };
  metadata?: ReadingMetadata;
  reportData: PremiumReportState | null;
  readingData: ReadingData | null;
  hasPreciseBirthLocation: boolean;
  unifiedResult: UnifiedReadingResult | null;
  premiumReportData: PremiumReportData | null;
  premiumReportMetadata?: PremiumReportViewMetadata;
  shareUrl?: string;
  isPremium: boolean;
  hasPaidQuery: boolean;
  isInvitationMode: boolean;
  dynamicPrice: string;
  landingSource: string;
  streamContent: string;
  onInviteOwner: () => Promise<void>;
  onInviteUpsell: () => Promise<void>;
  onShareCard: () => void;
  onUnlock: () => Promise<void>;
  onRetryPremium: () => void;
  onRetryFree: () => void;
  onReturnToInput: () => void;
  onRematchGuide: (targetGuideId: string) => void;
};

function compactText(value: string | undefined, fallback: string, maxLength = 220) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  if (!normalized) return fallback;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function getRelationshipVerdictLabel(value: string, isEn: boolean) {
  const normalized = value.toLowerCase();

  if (normalized.includes('기다') || normalized.includes('wait')) {
    return isEn ? 'Wait' : '대기';
  }

  if (
    normalized.includes('보류') ||
    normalized.includes('금지') ||
    normalized.includes('하지') ||
    normalized.includes('hold') ||
    normalized.includes('avoid')
  ) {
    return isEn ? 'Hold' : '보류';
  }

  if (
    normalized.includes('축소') ||
    normalized.includes('짧') ||
    normalized.includes('narrow') ||
    normalized.includes('short')
  ) {
    return isEn ? 'Narrow' : '축소';
  }

  if (
    normalized.includes('연락') ||
    normalized.includes('움직') ||
    normalized.includes('contact') ||
    normalized.includes('move')
  ) {
    return isEn ? 'Contact' : '연락';
  }

  return value;
}

function isRelationshipContactTimingSource(source: string) {
  return source === 'relationship_contact_timing_v1' || source === 'en_relationship_contact_timing_v1';
}

function getRelationshipFollowupEvent(source: string) {
  return source === 'en_relationship_contact_timing_v1'
    ? 'en_relationship_contact_followup_seeded'
    : 'relationship_contact_followup_seeded';
}

function getRelationshipLandingVariant(source: string, isEn: boolean) {
  if (source === 'en_relationship_contact_timing_v1') {
    return 'en_contact_timing_v1';
  }

  return isEn ? 'en_korean_saju_decision_timing_v1' : 'ko_decision_timing_oracle_v1';
}

function DecisionBriefCard({
  language,
  reportData,
  readingData,
  unifiedResult,
  isPremium,
  dynamicPrice,
  landingSource,
  onUnlock,
}: {
  language: 'ko' | 'en';
  reportData: PremiumReportState;
  readingData: ReadingData | null;
  unifiedResult: UnifiedReadingResult | null;
  isPremium: boolean;
  dynamicPrice: string;
  landingSource: string;
  onUnlock: () => Promise<void>;
}) {
  const isEn = language === 'en';
  const isRelationshipContactTiming = isRelationshipContactTimingSource(landingSource);
  const freeFocus = reportData.free_focus;
  const actionPlanItem = reportData.action_plan?.[0];
  const rawVerdict = compactText(
    freeFocus?.action_conclusion || reportData.summary?.title,
    isEn ? 'The first verdict is ready.' : '첫 판정이 준비되었습니다.',
    260
  );
  const verdict = isRelationshipContactTiming
    ? getRelationshipVerdictLabel(rawVerdict, isEn)
    : rawVerdict;
  const evidence = compactText(
    freeFocus?.evidence_summary || reportData.summary?.trust_reason || unifiedResult?.detailedContent,
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
  const priceLabel = dynamicPrice || (isEn ? 'checkout price' : '결제 단계 가격');

  const blocks = [
      {
      label: isRelationshipContactTiming ? (isEn ? 'Contact Verdict' : '연락 판정') : (isEn ? 'Verdict' : '판정'),
      value: verdict,
      Icon: isRelationshipContactTiming ? MessageCircle : Target,
    },
    {
      label: isEn ? 'Evidence' : '근거 요약',
      value: evidence,
      Icon: Shield,
    },
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
            {readingData?.question ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
                &ldquo;{readingData.question}&rdquo;
              </p>
            ) : null}
          </div>
          {!isPremium ? (
            <button
              type="button"
              onClick={() => {
                void onUnlock();
              }}
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
          <article
            key={label}
            className="rounded-[22px] border border-white/10 bg-black/20 p-4"
          >
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/42">
              <Icon className="h-3.5 w-3.5 text-acc-gold" />
              {label}
            </div>
            <p className="text-sm leading-7 text-white/78">{value}</p>
          </article>
        ))}
      </div>

      {!isPremium ? (
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

function RelationshipOutcomeSeed({
  language,
  readingData,
  landingSource,
  shareUrl,
}: {
  language: 'ko' | 'en';
  readingData: ReadingData | null;
  landingSource: string;
  shareUrl?: string;
}) {
  const [intendedAction, setIntendedAction] = useState<'contact_now' | 'wait' | 'unsure'>('unsure');
  const [isSaved, setIsSaved] = useState(false);
  const isEn = language === 'en';

  if (!isRelationshipContactTimingSource(landingSource) || !readingData) {
    return null;
  }

  const readingId = shareUrl?.split('/').pop();
  const options = [
    { value: 'contact_now' as const, label: isEn ? 'I will contact them' : '연락할게요' },
    { value: 'wait' as const, label: isEn ? 'I will wait' : '기다릴게요' },
    { value: 'unsure' as const, label: isEn ? 'Still unsure' : '아직 모르겠어요' },
  ];

  const saveOutcomeSeed = () => {
    const followUpDueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const seed = {
      source: landingSource,
      readingId,
      question: readingData.question,
      intendedAction,
      followUpDueAt,
      createdAt: new Date().toISOString(),
    };

    try {
      const storageKey =
        landingSource === 'en_relationship_contact_timing_v1'
          ? 'cosmic_en_relationship_contact_timing_seed'
          : 'cosmic_relationship_contact_timing_seed';
      localStorage.setItem(storageKey, JSON.stringify(seed));
    } catch {
      // Local storage is optional. The growth event still captures the opt-in signal.
    }

    void trackClientGrowthEvent({
      event: getRelationshipFollowupEvent(landingSource),
      source: landingSource,
      step: 'result',
      language,
      context: readingData.context,
      readingId,
      metadata: {
        landingVariant: getRelationshipLandingVariant(landingSource, isEn),
        intendedAction,
        followUpDueAt,
        questionLength: readingData.question.length,
      },
    });

    setIsSaved(true);
  };

  return (
    <section className="mx-auto mb-6 max-w-3xl rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_48px_rgba(7,10,20,0.28)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-acc-gold/18 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-acc-gold">
            <Bell className="h-3.5 w-3.5" />
            {isEn ? '7-day check-in seed' : '7일 뒤 결정 확인'}
          </div>
          <h3 className="mt-3 text-xl font-semibold text-white">
            {isEn ? 'Save this decision and compare it later.' : '이 결정을 저장하고 나중에 다시 확인하세요.'}
          </h3>
          <p className="mt-2 break-keep text-sm leading-6 text-white/58">
            {isEn
              ? 'This only stores the follow-up cue on this device for now. No SMS or email automation is enabled.'
              : '지금은 이 기기에 확인 씨앗만 저장합니다. 문자나 이메일 자동 발송은 아직 켜지지 않습니다.'}
          </p>
        </div>
        {isSaved ? (
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            {isEn ? 'Saved' : '저장됨'}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setIntendedAction(option.value)}
            className={`rounded-full border px-4 py-2 text-sm transition-all ${
              intendedAction === option.value
                ? 'border-acc-gold/45 bg-acc-gold/14 text-acc-gold'
                : 'border-white/12 bg-white/[0.03] text-white/62 hover:border-white/25 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={saveOutcomeSeed}
        disabled={isSaved}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-acc-gold/24 bg-acc-gold/12 px-5 py-3 text-sm font-semibold text-acc-gold transition-all hover:bg-acc-gold hover:text-black disabled:cursor-default disabled:border-white/10 disabled:bg-white/6 disabled:text-white/42 sm:w-auto"
      >
        {isSaved
          ? (isEn ? 'Saved for later check-in' : '7일 뒤 확인 씨앗 저장됨')
          : (isEn ? 'Save 7-day check-in' : '7일 뒤 이 결정 확인하기')}
      </button>
    </section>
  );
}

function GuideRematchCard({
  readingData,
  isPremium,
  language,
  onRematchGuide,
}: {
  readingData: ReadingData;
  isPremium: boolean;
  language: 'ko' | 'en';
  onRematchGuide: (id: string) => void;
}) {
  const isEn = language === 'en';
  const [selectedGuideId, setSelectedGuideId] = useState<OracleCharacterId | null>(null);

  const questionIntent = inferQuestionIntent({
    context: readingData.context as OracleRecommendationContext | null | undefined,
    question: readingData.question,
    partnerBirthDate: readingData.partnerBirthDate,
    partnerName: readingData.partnerName,
  });
  const currentGuideId = readingData.characterId as OracleCharacterId;
  const recommendedId = getRecommendedOracleCharacterId({
    context: readingData.context as OracleRecommendationContext | null | undefined,
    question: readingData.question,
    questionIntent,
  });

  const alternatives = ORACLE_CHARACTER_IDS
    .filter((id) => id !== currentGuideId)
    .map((id) => {
      const persona = getOraclePersona(id);
      let score = 0;
      if (id === recommendedId) score += 6;
      if (persona.specialty === questionIntent) score += 4;
      return { id, persona, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (alternatives.length === 0) return null;

  const targetId = selectedGuideId ?? alternatives[0].id;
  const targetPersona = getOraclePersona(targetId);

  return (
    <div className="mt-6 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.05),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.26em] text-white/38">
        {isEn ? 'Another perspective' : '다른 관점으로도 읽어드릴 수 있어요'}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/65">
        {isEn
          ? 'The same question can reveal different angles with a different guide.'
          : '같은 질문도 가이드에 따라 다른 면이 보입니다.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {alternatives.map(({ id, persona }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedGuideId(id as OracleCharacterId)}
            className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-all duration-200 ${
              targetId === id
                ? 'border-acc-gold/40 bg-acc-gold/10 text-acc-gold'
                : 'border-white/12 bg-white/[0.03] text-white/55 hover:border-white/25 hover:text-white'
            }`}
          >
            {persona.name}
            <span className="ml-1.5 text-[10px] opacity-60">
              {isEn ? getOracleIntentLabel(persona.specialty, 'en') : getOracleIntentLabel(persona.specialty, 'ko')}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
          {isEn ? targetPersona.titleEn : targetPersona.titleKo}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/68">
          {isEn ? targetPersona.strengthsEn[0] : targetPersona.strengthsKo[0]}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRematchGuide(targetId)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/15 bg-white/[0.04] px-5 py-3 text-[12px] uppercase tracking-[0.22em] text-white/78 transition-all duration-300 hover:border-acc-gold/30 hover:bg-acc-gold/5 hover:text-acc-gold"
      >
        <span>
          {isPremium
            ? (isEn ? `Re-read with ${targetPersona.name}` : `${targetPersona.name}(으)로 다시 보기`)
            : (isEn ? `See full reading with ${targetPersona.name}` : `${targetPersona.name} 관점으로 전체 읽기`)}
        </span>
        <ChevronRight size={14} />
      </button>

      {!isPremium && (
        <p className="mt-2 text-center text-[10px] text-white/30">
          {isEn ? 'Premium required · Unlock once to read all guides' : '프리미엄 필요 · 한 번 결제로 전체 가이드 관점 열림'}
        </p>
      )}
    </div>
  );
}

export function StartResultStage(props: StartResultStageProps) {
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {props.isLoading ? (
        <div className="flex min-h-[420px] items-center justify-center px-4 py-12 md:min-h-[500px] md:py-16">
          <OracleCalibrationPanel
            language={props.language}
            loadingLabel={props.loadingPhase.label || (props.language === 'en' ? 'Preparing your reading...' : '리딩을 정리하는 중...')}
            loadingPhase={props.loadingPhase.phase}
            isPremium={props.isPremium}
            characterId={props.metadata?.characterId ?? props.readingData?.characterId}
            precisionMetadata={props.metadata?.precisionMetadata ?? props.reportData?.precisionMetadata}
            oracleCouncil={props.metadata?.oracleCouncil ?? props.reportData?.oracleCouncil}
            hasPreciseBirthLocation={props.hasPreciseBirthLocation}
          />
        </div>
      ) : props.reportData && props.reportData.summary ? (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 py-10 pt-24 md:py-12 md:pt-32">
          <ErrorBoundary>
            <div className="mb-8 px-4 md:px-0">
              <DecisionBriefCard
                language={props.language}
                reportData={props.reportData}
                readingData={props.readingData}
                unifiedResult={props.unifiedResult}
                isPremium={props.isPremium}
                dynamicPrice={props.dynamicPrice}
                landingSource={props.landingSource}
                onUnlock={props.onUnlock}
              />

              <RelationshipOutcomeSeed
                language={props.language}
                readingData={props.readingData}
                landingSource={props.landingSource}
                shareUrl={props.shareUrl}
              />

              {props.unifiedResult ? <UnifiedReadingDisplay result={props.unifiedResult} /> : null}

              {props.readingData && !props.isLoading && props.reportData?.summary && (
                <GuideRematchCard
                  readingData={props.readingData}
                  isPremium={props.isPremium}
                  language={props.language}
                  onRematchGuide={props.onRematchGuide}
                />
              )}

              <div className="mt-8 flex flex-col items-center gap-4">
                {(props.isPremium || props.hasPaidQuery) && !props.isInvitationMode && (
                  <button
                    onClick={() => {
                      void props.onInviteOwner();
                    }}
                    className="group relative overflow-hidden rounded-[20px] bg-gradient-to-r from-acc-gold to-[#F59E0B] px-8 py-4 font-bold text-bg-void shadow-[0_14px_32px_rgba(212,175,55,0.14)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(212,175,55,0.28)] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70"
                  >
                    <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-500 group-hover:translate-y-0" />
                    <div className="relative flex items-center gap-2">
                      <span className="font-cinzel tracking-wider">
                        {props.language === 'en' ? 'Send Reading Invite' : '친구 초대 링크 복사하기'}
                      </span>
                    </div>
                  </button>
                )}

                {props.isInvitationMode && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-md rounded-[26px] border border-acc-gold/30 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 text-center backdrop-blur-xl">
                    <div className="mb-2 text-xs font-bold uppercase tracking-widest text-acc-gold">
                      {props.language === 'en' ? 'Reading Invitation' : '리딩 초대'}
                    </div>
                    <h3 className="mb-4 text-lg leading-relaxed text-white font-cinzel">
                      {props.language === 'en'
                        ? 'Ready to open your own oracle path?'
                        : `방금 본 결과, 꽤 잘 맞았나요?\n이제 내 질문도 직접 읽어보세요.`}
                    </h3>
                    <button
                      onClick={() => {
                        void props.onInviteUpsell();
                      }}
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 font-bold text-starlight transition-[transform,background-color,border-color,color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-acc-gold hover:text-bg-void hover:shadow-[0_16px_32px_rgba(212,175,55,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acc-gold/70"
                    >
                      {props.language === 'en' ? 'Open My Decision Reading (30% OFF)' : '내 질문도 직접 보기 (30% 할인)'}
                    </button>
                  </div>
                )}

                <button
                  onClick={props.onShareCard}
                  className="flex items-center gap-2 px-6 py-3 text-dim transition-[transform,color] duration-300 hover:-translate-y-0.5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="border-b border-transparent text-sm transition-colors hover:border-white/50">
                    {props.language === 'en' ? 'Save Result Card' : '결과 카드 저장하기'}
                  </span>
                </button>
              </div>
            </div>

            {props.premiumReportData ? (
              <PremiumReport
                report={props.premiumReportData}
                metadata={props.premiumReportMetadata}
                language={props.language}
                shareUrl={props.shareUrl}
                onUnlock={() => {
                  void props.onUnlock();
                }}
                isPremium={props.isPremium}
                price={props.dynamicPrice}
                isLoading={props.isLoading}
                onRetry={props.onRetryPremium}
                userQuestion={props.readingData?.question}
              />
            ) : null}

            {props.shareUrl ? (
              <div className="container relative z-10 mx-auto mt-12 mb-20 px-4">
                <ChatInterface readingId={props.shareUrl.split('/').pop()!} />
              </div>
            ) : null}

            <div className="pb-12">
              <DailyRetentionBanner language={props.language} />
            </div>
          </ErrorBoundary>
        </div>
      ) : props.streamContent.startsWith('__QUOTA_EXCEEDED__') ? (
        /* ── Quota Exceeded Dedicated UX ── */
        (() => {
          const parts = props.streamContent.split('|');
          const message = parts[1] || '';
          const hoursLeft = parseInt(parts[2] || '0', 10);
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto my-20 max-w-lg rounded-[28px] border border-[#D4AF37]/20 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_50%)] p-8 md:p-12 text-center backdrop-blur-md shadow-[0_28px_60px_rgba(0,0,0,0.4)]"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white font-cinzel">
                {props.language === 'en' ? "Today's Free Reading Used" : '오늘의 무료 사주를 이미 사용했습니다'}
              </h3>
              <p className="mb-6 text-sm font-light leading-relaxed text-white/60">
                {message}
              </p>

              {/* Countdown Badge */}
              {hoursLeft > 0 && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37]/60 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
                  </span>
                  {props.language === 'en'
                    ? `Next free reading in ~${hoursLeft}h`
                    : `다음 무료 리딩까지 약 ${hoursLeft}시간`}
                </div>
              )}

              {/* Premium CTA */}
              <button
                onClick={() => { void props.onUnlock(); }}
                className="w-full rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#f0c35c] to-[#d88b16] py-4 font-bold text-black shadow-lg shadow-[#D4AF37]/20 transition-all hover:shadow-[#D4AF37]/40 hover:-translate-y-0.5 cursor-pointer"
              >
                {props.language === 'en' ? 'Unlock Full Premium Report' : '프리미엄 리포트 잠금 해제'}
              </button>
              <p className="mt-3 text-xs text-white/30">
                {props.language === 'en'
                  ? '5 locked sections · Fortune timing · Career · Love · Blind spot · Action plan'
                  : '잠긴 5개 섹션 · 대운 타이밍 · 직업 · 연애 · 사각지대 · 행동 가이드'}
              </p>

              {/* Back to input */}
              <button
                onClick={props.onReturnToInput}
                className="mt-6 text-xs text-white/35 underline decoration-white/15 underline-offset-4 transition-colors hover:text-white/60 cursor-pointer"
              >
                {props.language === 'en' ? 'Back to my inputs' : '작성한 내용으로 돌아가기'}
              </button>
            </motion.div>
          );
        })()
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card mx-auto my-20 max-w-lg border-red-500/20 p-12 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <span className="text-3xl italic text-red-400 font-cinzel">!</span>
          </div>
          <h3 className="mb-4 text-xl text-red-200 font-cinzel">
            {props.language === 'en' ? 'Analysis Interrupted' : '결과를 불러오지 못했어요'}
          </h3>
          <p className="mb-6 text-sm font-light leading-relaxed text-gray-400">
            {props.streamContent || (props.language === 'en'
              ? 'The cosmic alignment was too complex to process at this moment.'
              : '지금은 결과를 끝까지 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')}
          </p>
          <div className="flex flex-col items-center justify-center gap-3">
            {(props.isPremium || props.hasPaidQuery) ? (
              <button
                onClick={props.onRetryPremium}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all hover:brightness-110"
              >
                <RefreshCw size={16} />
                {props.language === 'en' ? 'Retry Analysis' : '분석 이어서 진행하기'}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={props.onRetryFree}
                  className="btn-primary flex items-center justify-center gap-2 px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all hover:brightness-110"
                >
                  <RefreshCw size={16} />
                  {props.language === 'en' ? 'Retry Reading' : '리딩 다시 시도하기'}
                </button>
                <button
                  onClick={props.onReturnToInput}
                  className="btn-secondary px-8 py-3 text-sm font-medium uppercase tracking-widest transition-all hover:bg-white/5"
                >
                  {props.language === 'en' ? 'Back To My Inputs' : '작성한 내용 다시 보기'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
