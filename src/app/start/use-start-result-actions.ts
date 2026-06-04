'use client';

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { ReadingData } from '@/components/reading/reading-input';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { ORACLE_CHARACTER_IDS, type OracleCharacterId } from '@/lib/ai/oracle-personas';
import type {
  PremiumReportState,
  ReadingStep,
  StartReadingFn,
  TarotSelection,
} from './start-page-helpers';
import { saveToSessionAndBackup } from './start-page-storage';

type GuideOverride = {
  readonly characterId?: OracleCharacterId;
  readonly selectionMode?: 'auto' | 'manual';
};

type UseStartResultActionsOptions = {
  readonly readingData: ReadingData | null;
  readonly selectedCards: readonly TarotSelection[];
  readonly reportData: PremiumReportState | null;
  readonly shareUrl?: string;
  readonly language: 'ko' | 'en';
  readonly isInvitationMode: boolean;
  readonly dynamicPrice: string;
  readonly isPremium: boolean;
  readonly landingSource: string;
  readonly totalPremiumPhases: number;
  readonly determineNextPremiumPhase: (report: PremiumReportState | null | undefined) => number;
  readonly ensureReadingReadyForPayment: () => Promise<string | null>;
  readonly openPaymentModal: (source: string) => void;
  readonly openShareModal: () => void;
  readonly startReading: StartReadingFn;
  readonly hasRetriedLowConfidenceFree: MutableRefObject<boolean>;
  readonly setIsLoading: (value: boolean) => void;
  readonly setStreamContent: (value: string) => void;
  readonly setLoadingPhase: (value: { phase: number; label: string }) => void;
  readonly setStep: (value: ReadingStep) => void;
  readonly setReadingData: Dispatch<SetStateAction<ReadingData | null>>;
};

export function useStartResultActions(options: UseStartResultActionsOptions) {
  const returnToInputWithDraft = (guideOverride?: GuideOverride) => {
    const characterId = guideOverride?.characterId;
    if (characterId) {
      options.setReadingData((current) =>
        current
          ? {
              ...current,
              characterId,
              selectionMode: guideOverride.selectionMode ?? 'manual',
            }
          : current
      );
    }
    options.setIsLoading(false);
    options.setLoadingPhase({ phase: 0, label: '' });
    options.setStep('input');
    options.hasRetriedLowConfidenceFree.current = false;
    saveToSessionAndBackup('reading_step', 'input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOwnerInvite = async () => {
    const readingId = options.shareUrl?.split('/').pop() || sessionStorage.getItem('pending_reading_id');
    if (!readingId) {
      alert(options.language === 'en' ? 'Your result is still being saved. Please try again in a moment.' : '결과를 저장 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/invite/create', {
        method: 'POST',
        body: JSON.stringify({ readingId }),
      });
      const data = await response.json();
      if (!data.code) return;

      trackInviteCreated(options, readingId, data.code);
      await trackInviteAction(data.code, 'invite_cta_clicked', 'start_result_cta');
      const link = `${window.location.origin}/start?invite=${data.code}`;
      await navigator.clipboard.writeText(link);
      trackInviteCopied(options, readingId, data.code);
      await trackInviteAction(data.code, 'invite_link_copied', 'clipboard');
      alert(options.language === 'en' ? 'Invitation link copied!' : '초대 링크를 복사했어요.\n친구에게 보내면 궁합 결과를 무료로 볼 수 있어요.');
    } catch (error) {
      console.error(error);
      alert(options.language === 'en' ? 'Failed to create invite link.' : '초대 링크 생성 중 오류가 발생했어요.');
    }
  };

  const handleInvitationUpsell = async () => {
    await options.ensureReadingReadyForPayment();
    options.openPaymentModal('invite_upsell');
  };

  const handleShareCardOpen = () => {
    void trackClientGrowthEvent({
      event: 'share_clicked',
      source: 'result_share_button',
      step: 'result',
      language: options.language,
      context: options.readingData?.context,
      invitationMode: options.isInvitationMode,
      price: options.dynamicPrice || undefined,
      readingId: options.shareUrl?.split('/').pop() || sessionStorage.getItem('pending_reading_id') || undefined,
    });
    options.openShareModal();
  };

  const handleRetryPremiumResult = () => {
    options.setIsLoading(true);
    options.setStreamContent('');
    const nextPhase = options.determineNextPremiumPhase(options.reportData);
    if (nextPhase <= options.totalPremiumPhases && options.readingData) {
      void options.startReading(
        [...options.selectedCards],
        true,
        options.readingData,
        options.reportData ?? undefined,
        nextPhase
      );
      return;
    }
    options.setIsLoading(false);
  };

  const handleRetryFreeResult = () => {
    if (!options.readingData) return;
    options.hasRetriedLowConfidenceFree.current = false;
    options.setIsLoading(true);
    options.setStreamContent('');
    void options.startReading([...options.selectedCards], false, options.readingData, undefined, 1);
  };

  const handleRematchGuide = async (targetGuideId: string) => {
    const targetCharacterId = getOracleCharacterId(targetGuideId);
    if (!targetCharacterId) return;

    void trackClientGrowthEvent({
      event: 'guide_rematch_clicked',
      source: 'guide_rematch_cta',
      step: 'result',
      language: options.language,
      context: options.readingData?.context,
      metadata: {
        currentGuide: options.readingData?.characterId,
        targetGuide: targetCharacterId,
        isPremium: options.isPremium,
      },
    });

    if (!options.isPremium) {
      await options.ensureReadingReadyForPayment();
      options.openPaymentModal('guide_rematch_cta');
      return;
    }

    returnToInputWithDraft({ characterId: targetCharacterId, selectionMode: 'manual' });
  };

  return {
    handleInvitationUpsell,
    handleOwnerInvite,
    handleRematchGuide,
    handleRetryFreeResult,
    handleRetryPremiumResult,
    handleShareCardOpen,
    returnToInputWithDraft,
  };
}

function trackInviteCreated(
  options: UseStartResultActionsOptions,
  readingId: string,
  referralCode: string
) {
  void trackClientGrowthEvent({
    event: 'invite_created',
    source: 'start_result_cta',
    step: 'result',
    language: options.language,
    context: options.readingData?.context,
    invitationMode: options.isInvitationMode,
    price: options.dynamicPrice || undefined,
    readingId,
    referralCode,
  });
}

function trackInviteCopied(
  options: UseStartResultActionsOptions,
  readingId: string,
  referralCode: string
) {
  void trackClientGrowthEvent({
    event: 'invite_copied',
    source: 'start_result_cta',
    step: 'result',
    language: options.language,
    context: options.readingData?.context,
    invitationMode: options.isInvitationMode,
    price: options.dynamicPrice || undefined,
    readingId,
    referralCode,
  });
}

async function trackInviteAction(code: string, action: string, channel: string) {
  await fetch('/api/invite/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, action, channel }),
  }).catch(() => null);
}

function getOracleCharacterId(value: string): OracleCharacterId | null {
  return ORACLE_CHARACTER_IDS.find((id) => id === value) || null;
}
