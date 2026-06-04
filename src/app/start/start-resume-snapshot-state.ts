import {
  fetchSavedReadingSnapshot,
  persistSavedReadingSnapshot,
  reverifyPremiumCheckout,
  waitForPremiumVerification,
} from './start-page-persistence';
import type { ReadingMetadata, SavedReadingSnapshot } from './start-page-helpers';
import {
  getStoredReadingAccessKey,
  hasStoredPayload,
  stripAccessKeyFromLocation,
  syncReadingAccessKey,
} from './start-page-storage';

const BACKUP_TTL_MS = 24 * 60 * 60 * 1000;

type ResumeSnapshotStorageValues = {
  readonly pendingData: string | null;
  readonly pendingMetadataJson: string | null;
  readonly pendingReadingAccessKey: string | null;
  readonly pendingReadingId: string | null;
  readonly pendingReportJson: string | null;
};

export type PreparedResumeSnapshot = ResumeSnapshotStorageValues & {
  readonly accessKeyFromUrl: string | null;
  readonly hasBackupResume: boolean;
  readonly hasSessionResume: boolean;
  readonly isSessionActive: boolean;
  readonly parsedMetadata: Record<string, unknown> | null;
  readonly readingId: string | null;
  readonly storedReadingStep: string | null;
};

type PrepareResumeSnapshotOptions = {
  readonly accessKeyFromUrl: string | null;
  readonly isSessionActive: boolean;
  readonly readingIdFromUrl: string | null;
};

type HydrateResumeSnapshotOptions = {
  readonly hasClientPremiumResumeFlag: boolean;
  readonly snapshot: PreparedResumeSnapshot;
};

export function prepareResumeSnapshot(options: PrepareResumeSnapshotOptions): PreparedResumeSnapshot {
  const sessionValues = readResumeStorageValues(sessionStorage);
  const backupValues = readBackupResumeStorageValues();
  const hasSessionResume = hasResumeStorageValues(sessionValues);
  const hasBackupResume = hasResumeStorageValues(backupValues);
  const readingId = options.readingIdFromUrl || sessionValues.pendingReadingId || backupValues.pendingReadingId;
  const storedReadingStep = sessionStorage.getItem('reading_step') || localStorage.getItem('reading_step');

  const mergedValues = mergeResumeStorageValues(
    {
      ...sessionValues,
      pendingReadingAccessKey: options.accessKeyFromUrl || sessionValues.pendingReadingAccessKey,
    },
    hasBackupResume ? backupValues : null
  );

  persistPreparedResumeValues(mergedValues, options.isSessionActive);
  const parsedMetadata = parseResumeMetadata(mergedValues.pendingMetadataJson);
  const pendingData = restorePendingDataFromMetadata(mergedValues.pendingData, parsedMetadata);

  return {
    accessKeyFromUrl: options.accessKeyFromUrl,
    hasBackupResume,
    hasSessionResume,
    isSessionActive: options.isSessionActive,
    parsedMetadata,
    pendingData,
    pendingMetadataJson: mergedValues.pendingMetadataJson,
    pendingReadingAccessKey: mergedValues.pendingReadingAccessKey,
    pendingReadingId: mergedValues.pendingReadingId,
    pendingReportJson: mergedValues.pendingReportJson,
    readingId,
    storedReadingStep,
  };
}

export function activatePreparedResumeSnapshot(snapshot: PreparedResumeSnapshot) {
  if (hasStoredPayload(snapshot.readingId) && !hasStoredPayload(sessionStorage.getItem('pending_reading_id'))) {
    sessionStorage.setItem('pending_reading_id', snapshot.readingId as string);
  }

  if (hasStoredPayload(snapshot.accessKeyFromUrl)) {
    syncReadingAccessKey(snapshot.accessKeyFromUrl);
    stripAccessKeyFromLocation();
  }

  persistPreparedResumeValues(snapshot, snapshot.isSessionActive);
}

export async function hydrateResumeSnapshotFromServer(
  options: HydrateResumeSnapshotOptions
): Promise<PreparedResumeSnapshot> {
  let snapshot = options.snapshot;

  if (snapshot.readingId && (!hasStoredPayload(snapshot.pendingData) || options.hasClientPremiumResumeFlag)) {
    try {
      const saved = await fetchSavedReadingSnapshot(
        snapshot.readingId,
        snapshot.pendingReadingAccessKey || getStoredReadingAccessKey()
      );
      if (saved) {
        persistSavedReadingSnapshot(saved);
        localStorage.setItem('backup_timestamp', Date.now().toString());
        snapshot = applySavedSnapshot(saved, snapshot);
      }
    } catch (error) {
      console.error('[Resume] DB fetch failed:', error);
    }
  }

  if (snapshot.readingId && options.hasClientPremiumResumeFlag && snapshot.parsedMetadata?.isPremium !== true) {
    await reverifyPremiumCheckout(snapshot.readingId);

    const verifiedSnapshot = await waitForPremiumVerification(
      snapshot.readingId,
      snapshot.pendingReadingAccessKey || getStoredReadingAccessKey()
    );
    if (verifiedSnapshot) {
      snapshot = applySavedSnapshot(verifiedSnapshot, snapshot);
    }
  }

  return snapshot;
}

function readResumeStorageValues(storage: Storage): ResumeSnapshotStorageValues {
  return {
    pendingData: storage.getItem('pending_reading_data'),
    pendingMetadataJson: storage.getItem('pending_metadata'),
    pendingReadingAccessKey: storage.getItem('pending_reading_access_key'),
    pendingReadingId: storage.getItem('pending_reading_id'),
    pendingReportJson: storage.getItem('pending_report_data'),
  };
}

function readBackupResumeStorageValues(): ResumeSnapshotStorageValues {
  const localTimestamp = Number(localStorage.getItem('backup_timestamp'));
  const hasFreshBackup = Number.isFinite(localTimestamp) && Date.now() - localTimestamp < BACKUP_TTL_MS;

  if (!hasFreshBackup) {
    return emptyResumeStorageValues();
  }

  return readResumeStorageValues(localStorage);
}

function hasResumeStorageValues(values: ResumeSnapshotStorageValues) {
  return Object.values(values).some((value) => hasStoredPayload(value));
}

function emptyResumeStorageValues(): ResumeSnapshotStorageValues {
  return {
    pendingData: null,
    pendingMetadataJson: null,
    pendingReadingAccessKey: null,
    pendingReadingId: null,
    pendingReportJson: null,
  };
}

function mergeResumeStorageValues(
  sessionValues: ResumeSnapshotStorageValues,
  backupValues: ResumeSnapshotStorageValues | null
): ResumeSnapshotStorageValues {
  if (!backupValues) {
    return sessionValues;
  }

  return {
    pendingData: sessionValues.pendingData || backupValues.pendingData,
    pendingMetadataJson: sessionValues.pendingMetadataJson || backupValues.pendingMetadataJson,
    pendingReadingAccessKey: sessionValues.pendingReadingAccessKey || backupValues.pendingReadingAccessKey,
    pendingReadingId: sessionValues.pendingReadingId || backupValues.pendingReadingId,
    pendingReportJson: sessionValues.pendingReportJson || backupValues.pendingReportJson,
  };
}

function persistPreparedResumeValues(values: ResumeSnapshotStorageValues, isSessionActive: boolean) {
  if (hasStoredPayload(values.pendingReadingId)) {
    sessionStorage.setItem('pending_reading_id', values.pendingReadingId as string);
  }
  if (hasStoredPayload(values.pendingReadingAccessKey)) {
    sessionStorage.setItem('pending_reading_access_key', values.pendingReadingAccessKey as string);
  }
  if (hasStoredPayload(values.pendingData)) {
    sessionStorage.setItem('pending_reading_data', values.pendingData as string);
  }
  if (hasStoredPayload(values.pendingReportJson)) {
    sessionStorage.setItem('pending_report_data', values.pendingReportJson as string);
  }
  if (hasStoredPayload(values.pendingMetadataJson)) {
    sessionStorage.setItem('pending_metadata', values.pendingMetadataJson as string);
  }
  if (isSessionActive) {
    sessionStorage.setItem('is_session_active', 'true');
  }
}

function parseResumeMetadata(pendingMetadataJson: string | null) {
  if (!hasStoredPayload(pendingMetadataJson)) {
    return null;
  }

  try {
    return JSON.parse(pendingMetadataJson as string) as ReadingMetadata;
  } catch (error) {
    console.error('[Resume] Failed to parse metadata backup:', error);
    return null;
  }
}

function restorePendingDataFromMetadata(
  pendingData: string | null,
  parsedMetadata: Record<string, unknown> | null
) {
  if (hasStoredPayload(pendingData) || !parsedMetadata?.readingData) {
    return pendingData;
  }

  const restoredPendingData = JSON.stringify(parsedMetadata.readingData);
  sessionStorage.setItem('pending_reading_data', restoredPendingData);
  return restoredPendingData;
}

function applySavedSnapshot(
  saved: SavedReadingSnapshot,
  snapshot: PreparedResumeSnapshot
): PreparedResumeSnapshot {
  const pendingMetadataJson = saved.metadata ? JSON.stringify(saved.metadata) : snapshot.pendingMetadataJson;
  const parsedMetadata = saved.metadata || snapshot.parsedMetadata;
  const pendingData =
    saved.metadata?.readingData ? JSON.stringify(saved.metadata.readingData) : snapshot.pendingData;
  const pendingReportJson = saved.data ? JSON.stringify(saved.data) : snapshot.pendingReportJson;

  if (hasStoredPayload(pendingMetadataJson) && pendingMetadataJson !== snapshot.pendingMetadataJson) {
    sessionStorage.setItem('pending_metadata', pendingMetadataJson as string);
  }
  if (pendingData !== snapshot.pendingData && hasStoredPayload(pendingData)) {
    sessionStorage.setItem('pending_reading_data', pendingData as string);
  }
  if (pendingReportJson !== snapshot.pendingReportJson && hasStoredPayload(pendingReportJson)) {
    sessionStorage.setItem('pending_report_data', pendingReportJson as string);
  }

  return {
    ...snapshot,
    parsedMetadata,
    pendingData,
    pendingMetadataJson,
    pendingReportJson,
  };
}
