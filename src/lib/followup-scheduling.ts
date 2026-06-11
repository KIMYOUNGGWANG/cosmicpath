import { prisma } from '@/lib/prisma';
import { stampRuntimeMetadata } from '@/lib/runtime-environment';
import { buildDefaultFollowUpJobs } from '@/lib/followup-schedule';
import { parseJobMetadata } from '@/lib/followup-job-metadata';

interface ScheduleFollowUpsInput {
  readonly readingId: string;
  readonly email: string;
  readonly fromDate?: Date;
  readonly source?: string;
}

export async function scheduleDefaultFollowUps({
  readingId,
  email,
  fromDate = new Date(),
  source,
}: ScheduleFollowUpsInput): Promise<void> {
  const jobs = buildDefaultFollowUpJobs({ readingId, email, fromDate, source });

  const existingJobs = await prisma.followUpJob.findMany({
    where: {
      readingId,
      stage: { in: jobs.map((job) => job.stage) },
    },
  });
  const existingJobMap = new Map(existingJobs.map((job) => [job.stage, job]));

  for (const job of jobs) {
    const existingJob = existingJobMap.get(job.stage);

    if (!existingJob) {
      await prisma.followUpJob.create({
        data: {
          readingId: job.readingId,
          email: job.email,
          stage: job.stage,
          scheduledFor: job.scheduledFor,
          status: job.status,
          metadata: JSON.stringify(stampRuntimeMetadata(job.metadata)),
        },
      });
      continue;
    }

    const nextMetadata = JSON.stringify(stampRuntimeMetadata({
      ...parseJobMetadata(existingJob.metadata),
      ...job.metadata,
    }));

    if (existingJob.status === 'SENT' || existingJob.status === 'CANCELED') {
      if (existingJob.email !== email) {
        await prisma.followUpJob.update({
          where: { id: existingJob.id },
          data: { email, metadata: nextMetadata },
        });
      }
      continue;
    }

    await prisma.followUpJob.update({
      where: { id: existingJob.id },
      data: {
        email,
        scheduledFor: job.scheduledFor,
        status: existingJob.status === 'FAILED' ? 'PENDING' : existingJob.status,
        lastError: null,
        metadata: nextMetadata,
      },
    });
  }
}
