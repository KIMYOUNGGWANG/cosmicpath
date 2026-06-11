export interface FollowUpJobMetadata extends Record<string, unknown> {
  readonly subjectHint?: string;
  readonly sentAt?: string;
  readonly promoCodeId?: string;
  readonly promoCode?: string;
  readonly discount?: number;
  readonly offerUrl?: string;
  readonly expiresAt?: string;
  readonly cosmicWindowTitle?: string;
  readonly cosmicWindowLabel?: string;
  readonly phase4Url?: string;
  readonly runtimeEnvironment?: string;
  readonly stage?: string;
  readonly source?: string;
  readonly delayDays?: number;
  readonly idempotencyKey?: string;
  readonly emailHash?: string;
  readonly contactChannel?: string;
  readonly feedbackEvent?: string;
  readonly feedbackPrompt?: string;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return Object.fromEntries(Object.entries(value));
}

export function parseJobMetadata(raw: string | null | undefined): FollowUpJobMetadata {
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    return asRecord(parsed) ?? {};
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {};
    }
    throw error;
  }
}

export function getReadingLanguage(raw: string | null | undefined): 'ko' | 'en' {
  if (!raw) return 'ko';

  try {
    const parsed: unknown = JSON.parse(raw);
    const record = asRecord(parsed);
    return record?.language === 'en' ? 'en' : 'ko';
  } catch (error) {
    if (error instanceof SyntaxError) {
      return 'ko';
    }
    throw error;
  }
}
