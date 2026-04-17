'use client';

import { useEffect } from 'react';
import type { ReadingStep } from './start-page-helpers';

type UseStartReviewGateOptions = {
  step: ReadingStep;
  isLoading: boolean;
  hasReportSummary: boolean;
  hasDismissedReview: boolean;
  paidFromSearchParams: boolean;
  openReviewModal: () => void;
};

export function useStartReviewGate(options: UseStartReviewGateOptions) {
  useEffect(() => {
    const isPaidSession = options.paidFromSearchParams || sessionStorage.getItem('payment_completed') === 'true';
    const hasReviewed = localStorage.getItem('review_submitted') === 'true';
    const isPromoUser = sessionStorage.getItem('promo_user') === 'true';
    const isPremiumStatus = sessionStorage.getItem('is_premium_user') === 'true';

    if (!options.hasReportSummary) return;

    const shouldShow =
      (isPaidSession || isPromoUser || isPremiumStatus) &&
      !hasReviewed &&
      !options.hasDismissedReview &&
      options.step === 'result' &&
      !options.isLoading;

    if (!shouldShow) {
      return;
    }

    const handleScroll = () => {
      const { scrollY, innerHeight } = window;
      const { scrollHeight } = document.documentElement;

      if (scrollHeight < innerHeight * 1.5) return;

      const scrollPercent = (scrollY + innerHeight) / scrollHeight;
      if (scrollPercent >= 0.7) {
        options.openReviewModal();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    options.hasDismissedReview,
    options.hasReportSummary,
    options.isLoading,
    options.openReviewModal,
    options.paidFromSearchParams,
    options.step,
  ]);
}
