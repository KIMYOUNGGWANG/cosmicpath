import { createHash } from 'node:crypto';

export type FollowUpStage = 'D2_DISCOUNT' | 'D5_COSMIC_WINDOW' | 'H48' | 'D7';
export type DefaultFollowUpStage = 'D2_DISCOUNT' | 'D5_COSMIC_WINDOW' | 'D7';

export const DEFAULT_FOLLOW_UP_STAGES: DefaultFollowUpStage[] = [
  'D2_DISCOUNT',
  'D5_COSMIC_WINDOW',
  'D7',
];

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_STAGE_DELAY_DAYS: Record<DefaultFollowUpStage, number> = {
  D2_DISCOUNT: 2,
  D5_COSMIC_WINDOW: 5,
  D7: 7,
};

export interface DefaultFollowUpJobMetadata {
  stage: DefaultFollowUpStage;
  source: string;
  delayDays: number;
  idempotencyKey: string;
  emailHash: string;
  contactChannel: 'email';
  feedbackEvent?: 'followup_start';
  feedbackPrompt?: 'seven_day_decision_checkin';
}

export interface DefaultFollowUpJobInput {
  readingId: string;
  email: string;
  stage: DefaultFollowUpStage;
  scheduledFor: Date;
  status: 'PENDING';
  metadata: DefaultFollowUpJobMetadata;
}

export interface BuildDefaultFollowUpJobsInput {
  readingId: string;
  email: string;
  fromDate?: Date;
  source?: string;
}

export function hashFollowUpEmail(email: string): string {
  return createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest('hex');
}

export function buildFollowUpIdempotencyKey(readingId: string, stage: FollowUpStage): string {
  return `followup:${readingId}:${stage}`;
}

function normalizeScheduleSource(source: string | undefined): string {
  const normalized = source?.trim().slice(0, 64);
  return normalized || 'payment_sync';
}

function metadataForStage(input: {
  readingId: string;
  email: string;
  stage: DefaultFollowUpStage;
  source: string;
}): DefaultFollowUpJobMetadata {
  const delayDays = DEFAULT_STAGE_DELAY_DAYS[input.stage];
  const baseMetadata: DefaultFollowUpJobMetadata = {
    stage: input.stage,
    source: input.source,
    delayDays,
    idempotencyKey: buildFollowUpIdempotencyKey(input.readingId, input.stage),
    emailHash: hashFollowUpEmail(input.email),
    contactChannel: 'email',
  };

  if (input.stage !== 'D7') {
    return baseMetadata;
  }

  return {
    ...baseMetadata,
    feedbackEvent: 'followup_start',
    feedbackPrompt: 'seven_day_decision_checkin',
  };
}

export function buildDefaultFollowUpJobs({
  readingId,
  email,
  fromDate = new Date(),
  source,
}: BuildDefaultFollowUpJobsInput): DefaultFollowUpJobInput[] {
  const normalizedSource = normalizeScheduleSource(source);

  return DEFAULT_FOLLOW_UP_STAGES.map((stage) => {
    const delayDays = DEFAULT_STAGE_DELAY_DAYS[stage];

    return {
      readingId,
      email,
      stage,
      scheduledFor: new Date(fromDate.getTime() + delayDays * DAY_MS),
      status: 'PENDING',
      metadata: metadataForStage({
        readingId,
        email,
        stage,
        source: normalizedSource,
      }),
    };
  });
}
