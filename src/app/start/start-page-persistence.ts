import type { ReadingData } from '@/components/reading/reading-input';
import {
  normalizeStoredTarotCards,
  type PremiumReportState,
  type ReadingMetadata,
  type ReadingStep,
  type SavedReadingSnapshot,
  type TarotSelection,
} from './start-page-helpers';
import {
  buildReadingShareUrl,
  getStoredPaymentSessionId,
  hasStoredPayload,
  saveToSessionAndBackup,
  sleep,
  syncReadingAccessKey,
} from './start-page-storage';

export async function reverifyPremiumCheckout(readingId?: string | null) {
  const sessionId = getStoredPaymentSessionId();
  if (!hasStoredPayload(sessionId)) {
    return false;
  }

  try {
    const response = await fetch(`/api/payment?session_id=${encodeURIComponent(sessionId as string)}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return false;
    }

    const result = await response.json().catch(() => null) as {
      status?: string;
      reading_id?: string | null;
    } | null;

    if (result?.status !== 'paid') {
      return false;
    }

    const verifiedReadingId =
      typeof result.reading_id === 'string' && result.reading_id
        ? result.reading_id
        : null;

    if (verifiedReadingId && readingId && verifiedReadingId !== readingId) {
      console.warn('[Resume] Payment verified for a different reading', {
        expectedReadingId: readingId,
        verifiedReadingId,
      });
      return false;
    }

    saveToSessionAndBackup('payment_completed', 'true');
    saveToSessionAndBackup('is_premium_user', 'true');

    if (verifiedReadingId) {
      saveToSessionAndBackup('pending_reading_id', verifiedReadingId);
    }

    return Boolean(verifiedReadingId || readingId);
  } catch (error) {
    console.warn('[Resume] Premium checkout re-verification failed:', error);
    return false;
  }
}

export async function fetchSavedReadingSnapshot(
  readingId: string,
  accessKey?: string | null
): Promise<SavedReadingSnapshot | null> {
  const params = new URLSearchParams({ id: readingId });
  if (hasStoredPayload(accessKey)) {
    params.set('accessKey', accessKey as string);
  }

  const response = await fetch(`/api/reading/save?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const saved = await response.json().catch(() => null) as SavedReadingSnapshot | null;
  if (!saved?.success) {
    return null;
  }

  return saved;
}

export function persistSavedReadingSnapshot(snapshot: SavedReadingSnapshot) {
  if (hasStoredPayload(snapshot.id)) {
    saveToSessionAndBackup('pending_reading_id', snapshot.id as string);
  }

  if (snapshot.data && typeof snapshot.data === 'object') {
    saveToSessionAndBackup('pending_report_data', JSON.stringify(snapshot.data));
    if (Object.keys(snapshot.data).length > 0) {
      saveToSessionAndBackup('reading_step', 'result');
    }
  }

  if (snapshot.metadata && typeof snapshot.metadata === 'object') {
    saveToSessionAndBackup('pending_metadata', JSON.stringify(snapshot.metadata));

    if (snapshot.metadata.readingData && typeof snapshot.metadata.readingData === 'object') {
      saveToSessionAndBackup('pending_reading_data', JSON.stringify(snapshot.metadata.readingData));
    }

    if (snapshot.metadata.isPremium === true) {
      saveToSessionAndBackup('payment_completed', 'true');
      saveToSessionAndBackup('is_premium_user', 'true');
    }
  }
}

export async function waitForPremiumVerification(
  readingId: string,
  accessKey?: string | null,
  attempts = 4
) {
  let latestSnapshot: SavedReadingSnapshot | null = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const snapshot = await fetchSavedReadingSnapshot(readingId, accessKey);
      if (snapshot) {
        latestSnapshot = snapshot;
        persistSavedReadingSnapshot(snapshot);

        if (snapshot.metadata?.isPremium === true) {
          return snapshot;
        }
      }
    } catch (error) {
      console.warn('[Resume] Premium verification poll failed:', error);
    }

    if (attempt < attempts - 1) {
      await sleep(700 * (attempt + 1));
    }
  }

  return latestSnapshot;
}

type RestoreClientSnapshotOptions = {
  setReadingData: (value: ReadingData | null) => void;
  setLanguage: (value: 'ko' | 'en') => void;
  setSelectedCards: (value: TarotSelection[]) => void;
  setReportData: (value: PremiumReportState | null) => void;
  setMetadata: (value: ReadingMetadata | undefined) => void;
  setShareUrl: (value: string | undefined) => void;
  setIsPremium: (value: boolean) => void;
  syncResultUrl: (readingId?: string | null) => void;
};

export function restoreClientSnapshotFromStorage(options: RestoreClientSnapshotOptions) {
  if (typeof window === 'undefined') {
    return {
      restoredStep: 'input' as ReadingStep,
      hasSnapshot: false,
    };
  }

  const pendingData =
    sessionStorage.getItem('pending_reading_data') ||
    localStorage.getItem('pending_reading_data');
  const pendingReport =
    sessionStorage.getItem('pending_report_data') ||
    localStorage.getItem('pending_report_data');
  const pendingMetadata =
    sessionStorage.getItem('pending_metadata') ||
    localStorage.getItem('pending_metadata');
  const pendingReadingId =
    sessionStorage.getItem('pending_reading_id') ||
    localStorage.getItem('pending_reading_id');
  const pendingAccessKey =
    sessionStorage.getItem('pending_reading_access_key') ||
    localStorage.getItem('pending_reading_access_key');
  const storedStep =
    sessionStorage.getItem('reading_step') ||
    localStorage.getItem('reading_step');

  let restoredReadingData: ReadingData | null = null;
  let restoredReport: PremiumReportState | null = null;
  let restoredMetadata: ReadingMetadata | null = null;

  if (hasStoredPayload(pendingData)) {
    try {
      restoredReadingData = JSON.parse(pendingData as string) as ReadingData;
    } catch (error) {
      console.error('[Resume] Failed to parse pending reading data:', error);
    }
  }

  if (hasStoredPayload(pendingReport)) {
    try {
      restoredReport = JSON.parse(pendingReport as string) as PremiumReportState;
    } catch (error) {
      console.error('[Resume] Failed to parse pending report data:', error);
    }
  }

  if (hasStoredPayload(pendingMetadata)) {
    try {
      restoredMetadata = JSON.parse(pendingMetadata as string) as ReadingMetadata;
    } catch (error) {
      console.error('[Resume] Failed to parse pending metadata:', error);
    }
  }

  if (!restoredReadingData && restoredMetadata?.readingData && typeof restoredMetadata.readingData === 'object') {
    restoredReadingData = restoredMetadata.readingData as ReadingData;
  }

  if (restoredReadingData) {
    options.setReadingData(restoredReadingData);
    options.setLanguage(restoredReadingData.language as 'ko' | 'en');

    const restoredCards = normalizeStoredTarotCards(
      (restoredReadingData as ReadingData & { tarotCards?: unknown }).tarotCards
    );
    if (restoredCards.length > 0) {
      options.setSelectedCards(restoredCards);
    }
  }

  if (restoredReport) {
    options.setReportData(restoredReport);
  }

  if (restoredMetadata) {
    options.setMetadata(restoredMetadata);
    if (restoredMetadata.language) {
      options.setLanguage(restoredMetadata.language as 'ko' | 'en');
    }
    if (restoredMetadata.isPremium === true) {
      options.setIsPremium(true);
    }

    if ((!restoredReadingData || !Array.isArray((restoredReadingData as { tarotCards?: unknown } | null)?.tarotCards)) && Array.isArray(restoredMetadata.tarotCards)) {
      const restoredCards = normalizeStoredTarotCards(restoredMetadata.tarotCards);
      if (restoredCards.length > 0) {
        options.setSelectedCards(restoredCards);
      }
    }
  }

  if (pendingReadingId) {
    options.setShareUrl(buildReadingShareUrl(pendingReadingId));
    options.syncResultUrl(pendingReadingId);
  }

  if (hasStoredPayload(pendingAccessKey)) {
    syncReadingAccessKey(pendingAccessKey);
  }

  const restoredStep: ReadingStep =
    storedStep === 'result' || (restoredReport && Object.keys(restoredReport).length > 0)
      ? 'result'
      : storedStep === 'reveal'
        ? 'reveal'
        : storedStep === 'tarot'
          ? 'tarot'
          : 'input';

  return {
    restoredStep,
    hasSnapshot: Boolean(restoredReadingData || restoredReport || restoredMetadata || pendingReadingId),
  };
}
