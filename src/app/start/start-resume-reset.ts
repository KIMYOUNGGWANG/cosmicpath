import type { ReadingData } from '@/components/reading/reading-input';
import type { PremiumReportState, ReadingMetadata, ReadingStep, TarotSelection } from './start-page-helpers';
import { clearSessionAndBackup, clearTransientPremiumResumeFlags } from './start-page-storage';

type ResetStartResumeOptions = {
  syncResultUrl: (readingId?: string | null) => void;
  setHasCheckedResume: (value: boolean) => void;
  setStep: (value: ReadingStep) => void;
  setReadingData: (value: ReadingData | null) => void;
  setSelectedCards: (value: TarotSelection[]) => void;
  setReportData: (value: PremiumReportState | null) => void;
  setStreamContent: (value: string) => void;
  setMetadata: (value: ReadingMetadata | undefined) => void;
  setShareUrl: (value: string | undefined) => void;
  setIsPremium: (value: boolean) => void;
  setIsDecisionAccepted: (value: boolean) => void;
  setLoadingPhase: (value: { phase: number; label: string }) => void;
};

export function resetStartResume(options: ResetStartResumeOptions) {
  clearSessionAndBackup();
  clearTransientPremiumResumeFlags();
  options.setStep('input');
  options.setReadingData(null);
  options.setSelectedCards([]);
  options.setReportData(null);
  options.setStreamContent('');
  options.setMetadata(undefined);
  options.setShareUrl(undefined);
  options.setIsPremium(false);
  options.setIsDecisionAccepted(false);
  options.setLoadingPhase({ phase: 0, label: '' });
  options.syncResultUrl(null);
  options.setHasCheckedResume(true);
}
