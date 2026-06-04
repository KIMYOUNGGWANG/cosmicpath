import type { ReadingData } from '@/components/reading/reading-input';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { normalizeStoredTarotCards, type PremiumReportState, type ReadingMetadata, type TarotSelection } from './start-page-helpers';
import { reverifyPremiumCheckout, waitForPremiumVerification } from './start-page-persistence';
import { clearTransientPremiumResumeFlags, getStoredReadingAccessKey, saveToSessionAndBackup, sleep } from './start-page-storage';
import {
  getHoursUntilDailyReset,
  type PhaseRetryState,
  type ReadingApiResult,
  type ReadingTier,
} from './start-reading-generation';

export type ReadingErrorRecovery =
  | { readonly kind: 'retry'; readonly retryState: PhaseRetryState }
  | {
      readonly kind: 'premium-verified';
      readonly report: PremiumReportState;
      readonly metadata: ReadingMetadata;
      readonly readingData?: ReadingData;
      readonly tarotCards: TarotSelection[];
      readonly retryState: PhaseRetryState;
    }
  | { readonly kind: 'stop'; readonly retryState: PhaseRetryState }
  | {
      readonly kind: 'throw';
      readonly message: string;
      readonly retryState: PhaseRetryState;
    };

type ResolveReadingErrorOptions = {
  readonly response: Response;
  readonly result: ReadingApiResult;
  readonly phase: number;
  readonly requestTier: ReadingTier;
  readonly activeLanguage: 'ko' | 'en';
  readonly dataToUse: ReadingData;
  readonly landingSource: string;
  readonly dynamicPrice: string;
  readonly resumeReadingId?: string | null;
  readonly resumeAccessKey?: string | null;
  readonly accumulatedReport: PremiumReportState;
  readonly accumulatedMetadata: ReadingMetadata;
  readonly retryState: PhaseRetryState;
  readonly setLoadingPhase: (value: { phase: number; label: string }) => void;
  readonly setStreamContent: (value: string) => void;
  readonly setReportData: (value: PremiumReportState | null) => void;
  readonly setMetadata: (value: ReadingMetadata | undefined) => void;
  readonly setReadingData: (value: ReadingData | null) => void;
  readonly setSelectedCards: (value: TarotSelection[]) => void;
  readonly setIsPremium: (value: boolean) => void;
};

export async function resolveReadingError(
  options: ResolveReadingErrorOptions
): Promise<ReadingErrorRecovery> {
  if (isPaymentVerificationPending(options)) {
    return resolvePaymentVerification(options);
  }

  if (isTemporaryOraclePressure(options) && options.retryState.providerPressureRetryCount < 2) {
    const nextCount = options.retryState.providerPressureRetryCount + 1;
    options.setLoadingPhase({
      phase: options.phase,
      label: options.activeLanguage === 'en'
        ? `The oracle is crowded. Holding your place and retrying... (${nextCount}/2)`
        : `오라클이 혼잡해 자리를 유지한 채 다시 시도하는 중입니다... (${nextCount}/2)`,
    });
    await sleep(4000 * nextCount);
    return {
      kind: 'retry',
      retryState: { ...options.retryState, providerPressureRetryCount: nextCount },
    };
  }

  if (isTemporaryOraclePressure(options)) {
    options.setStreamContent(
      options.activeLanguage === 'en'
        ? 'The oracle is crowded right now. Please wait a moment and try again.'
        : '지금 오라클 리딩이 혼잡합니다. 잠시 후 다시 시도해주세요.'
    );
    return { kind: 'stop', retryState: options.retryState };
  }

  if (isAiGenerationFailure(options) && options.retryState.aiGenerationRetryCount < 1) {
    options.setLoadingPhase({
      phase: options.phase,
      label: options.activeLanguage === 'en'
        ? 'The oracle is reorganizing the reading. Retrying once more...'
        : '오라클이 리딩 구조를 다시 정리하는 중입니다. 한 번 더 시도할게요...',
    });
    await sleep(2500);
    return {
      kind: 'retry',
      retryState: {
        ...options.retryState,
        aiGenerationRetryCount: options.retryState.aiGenerationRetryCount + 1,
      },
    };
  }

  if (isAiGenerationFailure(options)) {
    options.setStreamContent(
      typeof options.result.error === 'string'
        ? options.result.error
        : options.activeLanguage === 'en'
          ? 'We could not complete your reading right now. Please try again.'
          : '지금은 리딩을 끝까지 생성하지 못했습니다. 다시 시도해주세요.'
    );
    return { kind: 'stop', retryState: options.retryState };
  }

  if (isPremiumPhaseTimeout(options) && options.retryState.premiumPhaseTimeoutRetryCount < 1) {
    options.setLoadingPhase({
      phase: options.phase,
      label: options.activeLanguage === 'en'
        ? 'The oracle phase is taking longer than usual. Holding your progress and retrying...'
        : '오라클 단계가 평소보다 오래 걸리고 있어, 진행 상태를 유지한 채 다시 시도하는 중입니다...',
    });
    await sleep(3500);
    return {
      kind: 'retry',
      retryState: {
        ...options.retryState,
        premiumPhaseTimeoutRetryCount: options.retryState.premiumPhaseTimeoutRetryCount + 1,
      },
    };
  }

  if (isPremiumPhaseTimeout(options)) {
    options.setStreamContent(
      options.activeLanguage === 'en'
        ? 'This oracle phase is taking longer than usual. Please wait a moment and try again.'
        : '이 오라클 단계가 평소보다 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.'
    );
    return { kind: 'stop', retryState: options.retryState };
  }

  if (options.response.status === 402 && options.result.code === 'QUOTA_EXCEEDED') {
    handleQuotaExceeded(options);
    return { kind: 'stop', retryState: options.retryState };
  }

  if (options.response.status === 402) {
    clearTransientPremiumResumeFlags();
    options.setIsPremium(false);
  }

  return {
    kind: 'throw',
    message: typeof options.result.error === 'string' && options.result.error
      ? options.result.error
      : `Phase ${options.phase} failed: ${options.response.statusText}`,
    retryState: options.retryState,
  };
}

function isTemporaryOraclePressure(options: ResolveReadingErrorOptions) {
  return (
    (options.response.status === 503 || options.response.status === 429) &&
    options.result.code === 'AI_TEMPORARILY_UNAVAILABLE'
  );
}

function isAiGenerationFailure(options: ResolveReadingErrorOptions) {
  return options.response.status >= 500 && options.result.code === 'AI_GENERATION_FAILED';
}

function isPremiumPhaseTimeout(options: ResolveReadingErrorOptions) {
  return (
    options.requestTier === 'premium' &&
    options.response.status >= 500 &&
    typeof options.result.error === 'string' &&
    options.result.error.includes('timed out after')
  );
}

function isPaymentVerificationPending(options: ResolveReadingErrorOptions) {
  return (
    options.response.status === 402 &&
    options.result.code === 'PAYMENT_REQUIRED' &&
    options.requestTier === 'premium' &&
    Boolean(options.resumeReadingId) &&
    !options.retryState.hasRetriedPremiumVerification
  );
}

async function resolvePaymentVerification(
  options: ResolveReadingErrorOptions
): Promise<ReadingErrorRecovery> {
  const retryState = {
    ...options.retryState,
    hasRetriedPremiumVerification: true,
  };
  const readingId = options.resumeReadingId;
  if (!readingId) return { kind: 'stop', retryState };

  options.setLoadingPhase({
    phase: options.phase,
    label: options.activeLanguage === 'en'
      ? 'Confirming payment and reopening your premium report...'
      : '결제를 다시 확인하고 프리미엄 리포트를 이어가는 중...',
  });

  await reverifyPremiumCheckout(readingId);
  const verifiedSnapshot = await waitForPremiumVerification(
    readingId,
    options.resumeAccessKey || getStoredReadingAccessKey()
  );

  if (verifiedSnapshot?.metadata?.isPremium !== true) {
    options.setStreamContent(
      options.activeLanguage === 'en'
        ? 'Your payment went through, but premium access is still syncing. Please wait a moment and tap retry again.'
        : '결제는 완료되었지만 프리미엄 권한 반영이 조금 지연되고 있습니다. 잠시 후 다시 한 번 이어서 진행해 주세요.'
    );
    return { kind: 'stop', retryState };
  }

  const report = verifiedSnapshot.data && typeof verifiedSnapshot.data === 'object'
    ? { ...options.accumulatedReport, ...verifiedSnapshot.data }
    : options.accumulatedReport;
  const metadata = verifiedSnapshot.metadata && typeof verifiedSnapshot.metadata === 'object'
    ? { ...options.accumulatedMetadata, ...verifiedSnapshot.metadata }
    : options.accumulatedMetadata;
  const readingData = verifiedSnapshot.metadata.readingData;
  const tarotCards = normalizeStoredTarotCards(
    (verifiedSnapshot.metadata.readingData as ReadingData & { tarotCards?: unknown } | undefined)?.tarotCards
      ?? verifiedSnapshot.metadata.tarotCards
  );

  options.setReportData({ ...report });
  options.setMetadata({ ...metadata });
  if (readingData) options.setReadingData(readingData);
  if (tarotCards.length > 0) options.setSelectedCards(tarotCards);
  options.setIsPremium(true);
  saveToSessionAndBackup('pending_report_data', JSON.stringify(report));
  saveToSessionAndBackup('pending_metadata', JSON.stringify(metadata));

  return {
    kind: 'premium-verified',
    report,
    metadata,
    readingData,
    tarotCards,
    retryState,
  };
}

function handleQuotaExceeded(options: ResolveReadingErrorOptions) {
  const hoursUntilReset = getHoursUntilDailyReset();

  void trackClientGrowthEvent({
    event: 'quota_exceeded',
    source: options.landingSource,
    step: 'reading',
    language: options.activeLanguage,
    context: options.dataToUse.context,
    price: options.dynamicPrice || undefined,
  });

  options.setStreamContent(
    options.activeLanguage === 'en'
      ? `__QUOTA_EXCEEDED__|You've used your free reading for today. Your next free reading refreshes in about ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''}. Unlock your full premium report now to see all 5 locked sections.|${hoursUntilReset}`
      : `__QUOTA_EXCEEDED__|오늘의 무료 사주를 이미 사용했습니다. 다음 무료 리딩은 약 ${hoursUntilReset}시간 후에 갱신됩니다. 지금 프리미엄 리포트를 잠금 해제하면 5개 섹션을 모두 볼 수 있습니다.|${hoursUntilReset}`
  );
}
