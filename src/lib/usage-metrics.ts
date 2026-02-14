import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';

interface IncrementUsageInput {
  provider: string;
  metric: string;
  count?: number;
  amount?: number;
  metadata?: Record<string, unknown>;
}

function getUtcDayStart(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function incrementUsageCounter({
  provider,
  metric,
  count = 1,
  amount = 0,
  metadata,
}: IncrementUsageInput): Promise<void> {
  const day = getUtcDayStart();

  await prisma.usageCounterDaily.upsert({
    where: {
      day_provider_metric: {
        day,
        provider,
        metric,
      },
    },
    create: {
      day,
      provider,
      metric,
      count,
      amount,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
    update: {
      count: { increment: count },
      amount: { increment: amount },
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    },
  });
}

export async function safeIncrementUsageCounter(input: IncrementUsageInput): Promise<void> {
  try {
    await incrementUsageCounter(input);
  } catch (error) {
    devLog.error('[UsageCounter] Failed to increment usage counter', {
      provider: input.provider,
      metric: input.metric,
      error,
    });
  }
}
