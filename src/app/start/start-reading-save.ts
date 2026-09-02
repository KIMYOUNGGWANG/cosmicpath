import type { ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportState, ReadingMetadata, TarotSelection } from './start-page-helpers';
import {
  buildReadingShareUrl,
  getStoredReadingAccessKey,
  saveToSessionAndBackup,
  syncReadingAccessKey,
} from './start-page-storage';

type IntermediatePremiumSaveInput = {
  readonly report: PremiumReportState;
  readonly metadata: ReadingMetadata;
  readonly readingData: ReadingData;
  readonly tarotCards: readonly TarotSelection[];
  readonly activeLanguage: 'ko' | 'en';
  readonly paymentSource: string;
};

type FinalReadingSaveInput = {
  readonly report: PremiumReportState;
  readonly metadata: ReadingMetadata;
  readonly readingData: ReadingData;
  readonly tarotCards: readonly TarotSelection[];
  readonly activeLanguage: 'ko' | 'en';
  readonly isComplete: boolean;
  readonly setShareUrl: (value: string | undefined) => void;
  readonly syncResultUrl: (readingId?: string | null) => void;
};

export async function saveIntermediatePremiumResult(input: IntermediatePremiumSaveInput) {
  try {
    const response = await fetch('/api/reading/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: sessionStorage.getItem('pending_reading_id') || undefined,
        accessKey: getStoredReadingAccessKey() || undefined,
        data: input.report,
        metadata: {
          ...input.metadata,
          isPremium: true,
          readingData: input.readingData,
          tarotCards: input.tarotCards,
          language: input.activeLanguage,
          paymentSource: input.paymentSource,
        },
      }),
    });

    if (response.ok) {
      const saved = await response.json();
      syncReadingAccessKey(saved.accessKey);
      if (saved.id && !sessionStorage.getItem('pending_reading_id')) {
        saveToSessionAndBackup('pending_reading_id', saved.id);
      }
    }
  } catch (error) {
    console.warn('[Intermediate Save] Network or server error (local fallback active):', error);
  }
}

export async function saveFinalReadingResult(input: FinalReadingSaveInput) {
  try {
    const response = await fetch('/api/reading/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: sessionStorage.getItem('pending_reading_id') || undefined,
        accessKey: getStoredReadingAccessKey() || undefined,
        data: input.report,
        metadata: {
          ...input.metadata,
          isPremium: input.isComplete,
          readingData: input.readingData,
          tarotCards: input.tarotCards,
          language: input.activeLanguage,
          email: localStorage.getItem('user_email'),
          birthInfo: getBirthInfo(input.readingData, input.activeLanguage),
          sajuSummary: input.metadata.saju?.fullSaju || '',
          userContext: getReadingContextLabel(input.readingData, input.activeLanguage),
          paymentSource: sessionStorage.getItem('promo_user') === 'true' ? 'promo' : 'stripe',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('[Database Save] Server save failed (local fallback active):', response.status, errorData);
      return;
    }

    const savedPayload = await response.json().catch(() => null);
    syncReadingAccessKey(savedPayload?.accessKey);
    const savedId = savedPayload?.id;
    if (savedId) {
      saveToSessionAndBackup('pending_reading_id', savedId);
      input.setShareUrl(buildReadingShareUrl(savedId));
      input.syncResultUrl(savedId);
    }
  } catch (error) {
    console.warn('[Database Save] Network or server error (local fallback active):', error);
  }
}

function getBirthInfo(data: ReadingData, language: 'ko' | 'en') {
  const hasBirthTime = !data.unknownTime && Boolean(data.birthTime);
  if (language === 'en') {
    return hasBirthTime
      ? `Born on ${data.birthDate} at ${data.birthTime}`
      : `Born on ${data.birthDate} (time unknown)`;
  }

  return hasBirthTime
    ? `${data.birthDate} ${data.birthTime}생`
    : `${data.birthDate}생 (시간 모름)`;
}

function getReadingContextLabel(data: ReadingData, language: 'ko' | 'en') {
  const contextMap: Record<'ko' | 'en', Record<string, string>> = {
    ko: {
      career: '커리어 / 직업',
      love: '연애 / 관계',
      money: '금전 / 재물',
      health: '건강 / 웰빙',
      general: '종합 리딩',
    },
    en: {
      career: 'Career / Job',
      love: 'Love / Relationship',
      money: 'Money / Wealth',
      health: 'Health / Wellness',
      general: 'General reading',
    },
  };

  return data.question || contextMap[language][data.context] || (language === 'en' ? 'Your reading' : '운세 리딩');
}
