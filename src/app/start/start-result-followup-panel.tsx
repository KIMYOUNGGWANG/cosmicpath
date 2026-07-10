'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import type { ReadingData } from '@/components/reading/reading-input';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { saveDecisionReview, type DecisionIntendedAction } from '@/lib/decision-review';
import {
  getRelationshipFollowupEvent,
  getRelationshipLandingVariant,
} from './start-result-relationship';

type RelationshipOutcomeSeedProps = {
  language: 'ko' | 'en';
  readingData: ReadingData | null;
  landingSource: string;
  shareUrl?: string;
};

export function RelationshipOutcomeSeed(props: RelationshipOutcomeSeedProps) {
  const [intendedAction, setIntendedAction] = useState<DecisionIntendedAction>('unsure');
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const isEn = props.language === 'en';

  if (!props.readingData) {
    return null;
  }

  const readingData = props.readingData;
  const readingId = props.shareUrl?.split('/').pop();
  const isRelationship = readingData.context === 'love';
  const options: readonly { value: DecisionIntendedAction; label: string }[] = isRelationship
    ? [
        { value: 'contact_now', label: isEn ? 'I will contact them' : '연락할게요' },
        { value: 'wait', label: isEn ? 'I will wait' : '기다릴게요' },
        { value: 'unsure', label: isEn ? 'Still unsure' : '아직 모르겠어요' },
      ]
    : [
        { value: 'act_now', label: isEn ? 'Run a small test' : '작게 실행할게요' },
        { value: 'wait', label: isEn ? 'Wait with a deadline' : '기한을 두고 기다릴게요' },
        { value: 'reduce_scope', label: isEn ? 'Narrow the options' : '선택지를 좁힐게요' },
      ];
  const selectedAction = intendedAction === 'unsure' && !isRelationship ? 'act_now' : intendedAction;

  const saveOutcomeSeed = () => {
    const followUpDueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const seed = {
      version: 1 as const,
      source: props.landingSource,
      readingId,
      question: readingData.question,
      intendedAction: selectedAction,
      followUpDueAt,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (!saveDecisionReview(seed)) {
      setSaveError(true);
      setIsSaved(false);
      return;
    }

    try {
      localStorage.setItem(getSeedStorageKey(props.landingSource), JSON.stringify(seed));
    } catch {
    }

    void trackClientGrowthEvent({
      event: getRelationshipFollowupEvent(props.landingSource),
      source: props.landingSource,
      step: 'result',
      language: props.language,
      context: readingData.context,
      readingId,
      metadata: {
        landingVariant: getRelationshipLandingVariant(props.landingSource, isEn),
        intendedAction: selectedAction,
        followUpDueAt,
        followUpDelayDays: 7,
        followUpChannel: 'email_and_local_seed',
        decisionNoteProduct: '7-Day Decision Packet',
        questionLength: readingData.question.length,
      },
    });

    setIsSaved(true);
    setSaveError(false);
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
              ? 'After a 7-Day Decision Packet is unlocked by email, CosmicPath schedules a 7-day check-in. This button also saves a local cue on this device so you can compare what happened.'
              : '이메일로 7일 결정 패킷을 열면 CosmicPath가 7일 뒤 체크인 메일을 예약합니다. 이 버튼은 이 기기에도 결정 씨앗을 저장해 실제 결과와 비교할 수 있게 해요.'}
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
            aria-pressed={selectedAction === option.value}
            onClick={() => { setIntendedAction(option.value); setSaveError(false); }}
            className={`rounded-full border px-4 py-2 text-sm transition-all ${
              selectedAction === option.value
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
      {saveError ? (
        <p role="alert" className="mt-3 break-keep text-sm text-rose-200">
          {isEn ? 'This device could not save the review. Free up storage and try again.' : '이 기기에 리뷰를 저장하지 못했습니다. 저장 공간을 확인한 뒤 다시 시도하세요.'}
        </p>
      ) : null}
      {isSaved ? (
        <Link
          href="/review"
          className="mt-3 inline-flex w-full items-center justify-center rounded-[18px] border border-white/12 px-5 py-3 text-sm font-semibold text-white/72 sm:ml-3 sm:w-auto"
        >
          {isEn ? 'Open Decision Review' : '결정 리뷰 열기'}
        </Link>
      ) : null}
    </section>
  );
}

function getSeedStorageKey(source: string) {
  if (source === 'next_move_report_mvp_v1') return 'next_move_report_decision_seed';
  if (source === 'en_relationship_contact_timing_v1') return 'cosmic_en_relationship_contact_timing_seed';
  return 'cosmic_relationship_contact_timing_seed';
}
