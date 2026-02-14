import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';
import { sendFollowUpNudgeEmail } from '@/lib/email/sender';
import { trackGrowthEvent } from '@/lib/growth-events';

type FollowUpStage = 'H48' | 'D7';

const MAX_ATTEMPTS = Number(process.env.FOLLOWUP_MAX_ATTEMPTS ?? '3');

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
    { stage: 'H48', offsetMs: 48 * 60 * 60 * 1000 },
    { stage: 'D7', offsetMs: 7 * 24 * 60 * 60 * 1000 },
  ];

  for (const item of stages) {
    const scheduledFor = new Date(fromDate.getTime() + item.offsetMs);

    await prisma.followUpJob.upsert({
      where: {
        readingId_stage: {
          readingId,
          stage: item.stage,
        },
      },
      create: {
        readingId,
        email,
        stage: item.stage,
        scheduledFor,
        status: 'PENDING',
      },
      update: {
        email,
        scheduledFor,
        status: 'PENDING',
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

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      const readingUrl = `${appUrl}/share/${job.readingId}?view=full`;
      const stage: FollowUpStage | null = job.stage === 'H48' || job.stage === 'D7' ? job.stage : null;
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
      const subjectHint = stage === 'H48' ? '48-hour reminder' : '7-day reminder';

      await sendFollowUpNudgeEmail({
        email: job.email,
        readingId: job.readingId,
        stage,
        readingUrl,
      });

      await prisma.followUpJob.update({
        where: { id: job.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          attempts: { increment: 1 },
          lastError: null,
          metadata: JSON.stringify({
            subjectHint,
            sentAt: new Date().toISOString(),
          }),
        },
      });

      await trackGrowthEvent({
        event: 'followup_email_sent',
        readingId: job.readingId,
        channel: 'email',
        metadata: { stage },
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
