'use client';

import { useCallback, useState } from 'react';

export function useStartResultModals() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTrackingSource, setPaymentTrackingSource] = useState('start_result_unlock');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [hasDismissedReview, setHasDismissedReview] = useState(false);

  const openPaymentModal = useCallback((trackingSource = 'start_result_unlock') => {
    setPaymentTrackingSource(trackingSource);
    setIsPaymentModalOpen(true);
  }, []);

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
  }, []);

  const openShareModal = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setIsShareModalOpen(false);
  }, []);

  const openReviewModal = useCallback(() => {
    setIsReviewOpen(true);
  }, []);

  const dismissReviewModal = useCallback(() => {
    setIsReviewOpen(false);
    setHasDismissedReview(true);
  }, []);

  return {
    hasDismissedReview,
    isPaymentModalOpen,
    isReviewOpen,
    isShareModalOpen,
    paymentTrackingSource,
    closePaymentModal,
    closeShareModal,
    dismissReviewModal,
    openPaymentModal,
    openShareModal,
    openReviewModal,
  };
}
