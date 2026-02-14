import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';

export interface GrowthEventInput {
  event: string;
  readingId?: string;
  referralCode?: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}

export async function trackGrowthEvent(input: GrowthEventInput): Promise<void> {
  try {
    await prisma.growthEvent.create({
      data: {
        event: input.event,
        readingId: input.readingId,
        referralCode: input.referralCode,
        channel: input.channel,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (error) {
    devLog.error('[GrowthEvent] Failed to persist event', {
      event: input.event,
      readingId: input.readingId,
      referralCode: input.referralCode,
      error,
    });
  }
}
