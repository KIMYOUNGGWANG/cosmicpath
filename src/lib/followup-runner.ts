import { devLog } from '@/lib/dev-logger';
import { sendFollowUpNudgeEmail } from '@/lib/email/sender';
import { trackGrowthEvent } from '@/lib/growth-events';
import { prisma } from '@/lib/prisma';
import { extractReadingAccessKey } from '@/lib/reading-access';
import { stampRuntimeMetadata } from '@/lib/runtime-environment';
import { getCosmicWindowContent } from '@/lib/followup-cosmic-window';
import { DISCOUNT_STAGE_ALIASES, ensureDiscountOffer } from '@/lib/followup-discount-offer';
import { getReadingLanguage, parseJobMetadata } from '@/lib/followup-job-metadata';
import { appendAccessKeyFragment, getAppUrl } from '@/lib/followup-url';
import type { FollowUpStage } from '@/lib/followup-schedule';

const MAX_ATTEMPTS = Number(process.env.FOLLOWUP_MAX_ATTEMPTS ?? '3');

export interface FollowUpRunSummary {
  readonly ok: boolean;
  readonly scanned: number;
  readonly sent: number;
  readonly failed: number;
  readonly skipped: number;
}

interface RunDueFollowUpsInput {
  readonly limit?: number;
  readonly dryRun?: boolean;
}

function resolveStage(stage: string): FollowUpStage | null {
  switch (stage) {
    case 'D2_DISCOUNT':
    case 'D5_COSMIC_WINDOW':
    case 'H48':
    case 'D7':
      return stage;
    default:
      return null;
  }
}

function getSubjectHint(stage: {
  readonly isDiscount: boolean;
  readonly isCosmicWindow: boolean;
  readonly isArchive: boolean;
}): string {
  if (stage.isDiscount) return 'D+2 discount offer';
  if (stage.isCosmicWindow) return 'D+5 cosmic window reminder';
  if (stage.isArchive) return 'D+7 archive notice';
  return '7-day reminder';
}

export async function runDueFollowUps({
  limit = 100,
  dryRun = false,
}: RunDueFollowUpsInput = {}): Promise<FollowUpRunSummary> {
  const now = new Date();
  const appUrl = getAppUrl();
  const summary = { ok: true, scanned: 0, sent: 0, failed: 0, skipped: 0 };

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
          data: { status: 'FAILED', attempts: { increment: 1 }, lastError: 'Reading not found' },
        });
        summary.failed += 1;
        continue;
      }

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

      const accessKey = extractReadingAccessKey(reading.metadata);
      const readingUrl = appendAccessKeyFragment(`${appUrl}/share/${job.readingId}?view=full`, accessKey);
      const isDiscountStage = DISCOUNT_STAGE_ALIASES.has(stage);
      const isCosmicWindowStage = stage === 'D5_COSMIC_WINDOW';
      const isArchiveStage = stage === 'D7';
      const offer = isDiscountStage ? await ensureDiscountOffer(job) : null;
      const cosmicWindow = isCosmicWindowStage ? getCosmicWindowContent(job.scheduledFor) : null;
      const readingLanguage = getReadingLanguage(reading.metadata);
      const phase4Url = isCosmicWindowStage
        ? appendAccessKeyFragment(`${appUrl}/start?reading_id=${encodeURIComponent(job.readingId)}`, accessKey)
        : undefined;
      const dailyUrl = readingLanguage === 'ko' ? `${appUrl}/daily` : undefined;
      const subjectHint = getSubjectHint({
        isDiscount: isDiscountStage,
        isCosmicWindow: isCosmicWindowStage,
        isArchive: isArchiveStage,
      });

      await sendFollowUpNudgeEmail({
        email: job.email,
        readingId: job.readingId,
        stage,
        language: readingLanguage,
        readingUrl,
        promoCode: offer?.promoCode,
        discount: offer?.discount,
        offerUrl: offer?.offerUrl,
        expiresAt: offer?.expiresAt,
        cosmicWindow: cosmicWindow ?? undefined,
        phase4Url,
        dailyUrl,
      });

      await prisma.followUpJob.update({
        where: { id: job.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          attempts: { increment: 1 },
          lastError: null,
          metadata: JSON.stringify(stampRuntimeMetadata({
            ...parseJobMetadata(job.metadata),
            ...(offer ?? {}),
            ...(cosmicWindow ? {
              cosmicWindowTitle: cosmicWindow.title,
              cosmicWindowLabel: cosmicWindow.seasonLabel,
              phase4Url,
            } : {}),
            subjectHint,
            sentAt: new Date().toISOString(),
          })),
        },
      });

      await trackGrowthEvent({
        event: 'followup_email_sent',
        readingId: job.readingId,
        channel: 'email',
        metadata: {
          stage: isDiscountStage ? 'D2_DISCOUNT' : stage,
          sourceStage: stage,
          language: readingLanguage,
          discount: offer?.discount,
          cosmicWindow: cosmicWindow?.seasonLabel,
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
