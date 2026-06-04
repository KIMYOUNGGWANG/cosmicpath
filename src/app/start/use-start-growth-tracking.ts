'use client';

import { useEffect, useRef } from 'react';
import type { ReadingData } from '@/components/reading/reading-input';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import type { PremiumReportState, ReadingStep } from './start-page-helpers';

type UseStartGrowthTrackingOptions = {
  activeLandingVariant: string;
  autoReferralCode?: string;
  dynamicPrice: string;
  entry: string | null;
  hasInvite: boolean;
  initialContext?: string;
  initialQuestion?: string;
  isInvitationMode: boolean;
  isPremium: boolean;
  landingSource: string;
  language: 'ko' | 'en';
  readingData: ReadingData | null;
  reportData: PremiumReportState | null;
  step: ReadingStep;
  paidFromSearchParams: boolean;
};

export function useStartGrowthTracking(options: UseStartGrowthTrackingOptions) {
  const {
    activeLandingVariant,
    autoReferralCode,
    dynamicPrice,
    entry,
    hasInvite,
    initialContext,
    initialQuestion,
    isInvitationMode,
    isPremium,
    landingSource,
    language,
    paidFromSearchParams,
    readingData,
    reportData,
    step,
  } = options;
  const hasTrackedLandingView = useRef(false);
  const hasTrackedFreeResult = useRef(false);
  const hasTrackedReportComplete = useRef(false);

  useEffect(() => {
    if (hasTrackedLandingView.current) return;

    hasTrackedLandingView.current = true;
    void trackClientGrowthEvent({
      event: 'landing_view',
      source: landingSource,
      step,
      language,
      invitationMode: hasInvite,
      referralCode: autoReferralCode,
      price: dynamicPrice || undefined,
      metadata: {
        landingVariant: activeLandingVariant,
        entry: entry || undefined,
        initialContext: initialContext || undefined,
        hasPrefilledQuestion: Boolean(initialQuestion),
      },
    });
  }, [activeLandingVariant, autoReferralCode, dynamicPrice, entry, hasInvite, initialContext, initialQuestion, landingSource, language, step]);

  useEffect(() => {
    if (step !== 'result' || !reportData?.summary || isPremium) return;
    if (hasTrackedFreeResult.current) return;

    hasTrackedFreeResult.current = true;
    void trackClientGrowthEvent({
      event: 'first_result_view',
      source: landingSource,
      step,
      language,
      context: readingData?.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
      readingId: sessionStorage.getItem('pending_reading_id') || undefined,
      metadata: {
        landingVariant: activeLandingVariant,
        entry: entry || undefined,
      },
    });
  }, [activeLandingVariant, dynamicPrice, entry, isInvitationMode, isPremium, landingSource, language, readingData, reportData, step]);

  useEffect(() => {
    const isPaidSession =
      isPremium ||
      paidFromSearchParams ||
      sessionStorage.getItem('payment_completed') === 'true';

    if (step !== 'result' || !reportData?.final_verdict || !isPaidSession) return;
    if (hasTrackedReportComplete.current) return;

    hasTrackedReportComplete.current = true;
    void trackClientGrowthEvent({
      event: 'report_complete',
      source: landingSource,
      step,
      language,
      context: readingData?.context,
      invitationMode: isInvitationMode,
      price: dynamicPrice || undefined,
      readingId: sessionStorage.getItem('pending_reading_id') || undefined,
      plan: 'premium_reading',
      metadata: {
        entry: entry || undefined,
      },
    });
  }, [dynamicPrice, entry, isInvitationMode, isPremium, landingSource, language, paidFromSearchParams, readingData, reportData, step]);

  return {
    resetResultTracking: () => {
      hasTrackedFreeResult.current = false;
      hasTrackedReportComplete.current = false;
    },
  };
}
