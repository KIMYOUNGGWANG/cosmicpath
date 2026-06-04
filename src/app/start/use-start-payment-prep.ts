'use client';

import { useCallback } from 'react';
import type { ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportState, ReadingMetadata, TarotSelection } from './start-page-helpers';
import {
  buildReadingShareUrl,
  getStoredReadingAccessKey,
  saveToSessionAndBackup,
  syncReadingAccessKey,
  syncResultUrl as syncStartResultUrl,
  waitForPendingReadingId,
} from './start-page-storage';

type UseStartPaymentPrepOptions = {
  reportData: PremiumReportState | null;
  readingData: ReadingData | null;
  metadata?: ReadingMetadata;
  selectedCards: TarotSelection[];
  language: 'ko' | 'en';
  inviteCode?: string;
  autoReferralCode?: string;
  replaceUrl: (url: string) => void;
  setShareUrl: (value: string | undefined) => void;
  onDebug?: (event: string, details?: Record<string, unknown>) => void;
};

export function useStartPaymentPrep(options: UseStartPaymentPrepOptions) {
  const {
    reportData,
    readingData,
    metadata,
    selectedCards,
    language,
    inviteCode,
    autoReferralCode,
    replaceUrl,
    setShareUrl,
    onDebug,
  } = options;

  const syncResultUrl = useCallback((readingId?: string | null) => {
    syncStartResultUrl({
      readingId,
      inviteCode,
      autoReferralCode,
      onDebug,
      updateUrl: replaceUrl,
    });
  }, [autoReferralCode, inviteCode, onDebug, replaceUrl]);

  const ensureReadingReadyForPayment = useCallback(async () => {
    const existingId =
      sessionStorage.getItem('pending_reading_id') ||
      localStorage.getItem('pending_reading_id');

    if (existingId) {
      syncResultUrl(existingId);
      return existingId;
    }

    const waitedId = await waitForPendingReadingId();
    if (waitedId) {
      syncResultUrl(waitedId);
      return waitedId;
    }

    if (!reportData || !readingData) {
      syncResultUrl(null);
      return null;
    }

    try {
      const response = await fetch('/api/reading/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessKey: getStoredReadingAccessKey() || undefined,
          data: reportData,
          metadata: {
            ...(metadata || {}),
            isPremium: false,
            readingData,
            tarotCards: selectedCards,
            language,
            paymentSource: 'stripe_pending',
          },
        }),
      });

      if (!response.ok) {
        syncResultUrl(null);
        return null;
      }

      const savedPayload = await response.json().catch(() => null);
      syncReadingAccessKey(savedPayload?.accessKey);

      const savedId = typeof savedPayload?.id === 'string' ? savedPayload.id : null;
      if (!savedId) {
        syncResultUrl(null);
        return null;
      }

      saveToSessionAndBackup('pending_reading_id', savedId);
      setShareUrl(buildReadingShareUrl(savedId));
      syncResultUrl(savedId);
      return savedId;
    } catch (error) {
      console.error('Failed to prepare reading for payment modal:', error);
      syncResultUrl(null);
      return null;
    }
  }, [language, metadata, readingData, reportData, selectedCards, setShareUrl, syncResultUrl]);

  return { ensureReadingReadyForPayment, syncResultUrl };
}
