import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';
import { sendFollowUpNudgeEmail } from '@/lib/email/sender';
import { trackGrowthEvent } from '@/lib/growth-events';
import { createSingleUsePromotionCode } from '@/lib/promo-codes';

export type FollowUpStage = 'D1_RETENTION';

export const DEFAULT_FOLLOW_UP_STAGES: FollowUpStage[] = ['D1_RETENTION'];

const DISCOUNT_STAGE_DISCOUNT = 20;
const DISCOUNT_STAGE_LIFETIME_MS = 3 * 24 * 60 * 60 * 1000; // D+1 email, valid for 3 days
const DISCOUNT_STAGE_ALIASES = new Set<FollowUpStage>(['D1_RETENTION']);

const MAX_ATTEMPTS = Number(process.env.FOLLOWUP_MAX_ATTEMPTS ?? '3');

interface FollowUpJobMetadata {
  subjectHint?: string;
  sentAt?: string;
  promoCodeId?: string;
  promoCode?: string;
  discount?: number;
  offerUrl?: string;
  expiresAt?: string;
  cosmicWindowTitle?: string;
  cosmicWindowLabel?: string;
  phase4Url?: string;
}


function parseJobMetadata(raw: string | null | undefined): FollowUpJobMetadata {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as FollowUpJobMetadata;
    }
  } catch {
    // Ignore malformed metadata and fall back to empty object.
  }

  return {};
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
}

function resolveStage(stage: string): FollowUpStage | null {
  if (stage === 'D1_RETENTION') {
    return stage;
  }
  return null;
}

async function ensureDiscountOffer(job: {
  id: string;
  readingId: string;
  metadata: string | null;
}) {
  const existingMetadata = parseJobMetadata(job.metadata);
  const hasValidExpiry =
    typeof existingMetadata.expiresAt === 'string' &&
    new Date(existingMetadata.expiresAt).getTime() > Date.now();

  if (
    existingMetadata.promoCodeId &&
    existingMetadata.promoCode &&
    existingMetadata.offerUrl &&
    typeof existingMetadata.discount === 'number' &&
    hasValidExpiry
  ) {
    return existingMetadata;
  }

  const expiresAt = new Date(Date.now() + DISCOUNT_STAGE_LIFETIME_MS);
  const promoCode = await createSingleUsePromotionCode({
    prefix: 'D2',
    description: `D+2 reading discount for ${job.readingId}`,
    discount: DISCOUNT_STAGE_DISCOUNT,
    expiresAt,
  });

  const nextMetadata: FollowUpJobMetadata = {
    ...existingMetadata,
    promoCodeId: promoCode.id,
    promoCode: promoCode.code,
    discount: promoCode.discount,
    offerUrl: `${getAppUrl()}/start?promo=${encodeURIComponent(promoCode.code)}`,
    expiresAt: expiresAt.toISOString(),
  };

  await prisma.followUpJob.update({
    where: { id: job.id },
    data: {
      metadata: JSON.stringify(nextMetadata),
    },
  });

  return nextMetadata;
}

interface ScheduleFollowUpsInput {
  readingId: string;
  email: string;
  fromDate?: Date;
}

export interface FollowUpRunSummary {
  ok: boolean;
  scanned: number;
  sent: number;
  failed: number;
  skipped: number;
}

export async function scheduleDefaultFollowUps({
  readingId,
  email,
  fromDate = new Date(),
}: ScheduleFollowUpsInput): Promise<void> {
  const stages: Array<{ stage: FollowUpStage; offsetMs: number }> = [
    { stage: 'D1_RETENTION', offsetMs: 24 * 60 * 60 * 1000 },
  ];

  const existingJobs = await prisma.followUpJob.findMany({
    where: {
      readingId,
      stage: { in: stages.map((item) => item.stage) },
    },
  });
  const existingJobMap = new Map(existingJobs.map((job) => [job.stage, job]));

  for (const item of stages) {
    const scheduledFor = new Date(fromDate.getTime() + item.offsetMs);
    const existingJob = existingJobMap.get(item.stage);

    if (!existingJob) {
      await prisma.followUpJob.create({
        data: {
          readingId,
          email,
          stage: item.stage,
          scheduledFor,
          status: 'PENDING',
        },
      });
      continue;
    }

    if (existingJob.status === 'SENT' || existingJob.status === 'CANCELED') {
      if (existingJob.email !== email) {
        await prisma.followUpJob.update({
          where: { id: existingJob.id },
          data: { email },
        });
      }
      continue;
    }

    await prisma.followUpJob.update({
      where: { id: existingJob.id },
      data: {
        email,
        scheduledFor,
        status: existingJob.status === 'FAILED' ? 'PENDING' : existingJob.status,
        lastError: null,
      },
    });
  }
}

interface RunDueFollowUpsInput {
  limit?: number;
  dryRun?: boolean;
}

export async function runDueFollowUps({
  limit = 100,
  dryRun = false,
}: RunDueFollowUpsInput = {}): Promise<FollowUpRunSummary> {
  const now = new Date();
  const appUrl = getAppUrl();
  const summary: FollowUpRunSummary = {
    ok: true,
    scanned: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  const jobs = await prisma.followUpJob.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: now },
    },
    orderBy: { scheduledFor: 'asc' },
    take: limit,
  });

  summary.scanned = jobs.length;

  for (const job of jobs) {
    if (dryRun) {
      summary.skipped += 1;
      continue;
    }

    try {
      const reading = await prisma.readingResult.findUnique({
        where: { id: job.readingId },
      });

      if (!reading) {
        await prisma.followUpJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            attempts: { increment: 1 },
            lastError: 'Reading not found',
          },
        });

        summary.failed += 1;
        continue;
      }

      const readingUrl = `${appUrl}/share/${job.readingId}?view=full`;
      const stage = resolveStage(job.stage);
      if (!stage) {
        await prisma.followUpJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            attempts: { increment: 1 },
            lastError: `Invalid stage: ${job.stage}`,
          },
        });
        summary.failed += 1;
        continue;
      }
      const isDiscountStage = DISCOUNT_STAGE_ALIASES.has(stage);
      const offer = isDiscountStage ? await ensureDiscountOffer(job) : null;
      const subjectHint = 'D+1 retention reminder';

      await sendFollowUpNudgeEmail({
        email: job.email,
        readingId: job.readingId,
        stage,
        readingUrl,
        promoCode: offer?.promoCode,
        discount: offer?.discount,
        offerUrl: offer?.offerUrl,
        expiresAt: offer?.expiresAt,
      });

      const existingMetadata = parseJobMetadata(job.metadata);
      await prisma.followUpJob.update({
        where: { id: job.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          attempts: { increment: 1 },
          lastError: null,
        metadata: JSON.stringify({
          ...existingMetadata,
          ...(offer ?? {}),
          subjectHint,
          sentAt: new Date().toISOString(),
        }),
        },
      });

      await trackGrowthEvent({
        event: 'followup_email_sent',
        readingId: job.readingId,
        channel: 'email',
        metadata: {
          stage: 'D1_RETENTION',
          sourceStage: stage,
          discount: offer?.discount,
        },
      });

      summary.sent += 1;
    } catch (error) {
      const nextAttempts = job.attempts + 1;
      const status = nextAttempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING';

      await prisma.followUpJob.update({
        where: { id: job.id },
        data: {
          attempts: { increment: 1 },
          status,
          lastError: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
        },
      });

      summary.failed += 1;
      devLog.error('[FollowUpJob] Failed to process job', { jobId: job.id, error });
    }
  }

  summary.ok = summary.failed === 0;
  return summary;
}
