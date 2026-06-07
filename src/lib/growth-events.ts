import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';
import { getCanonicalGrowthEvent, mirrorGrowthEvent } from '@/lib/growth-analytics';
import { isExternalEffectsDisabled, stampRuntimeMetadata } from '@/lib/runtime-environment';

export interface GrowthEventInput {
  event: string;
  readingId?: string;
  referralCode?: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}

export async function trackGrowthEvent(input: GrowthEventInput): Promise<void> {
  if (isExternalEffectsDisabled()) return;

  try {
    const canonicalEvent = getCanonicalGrowthEvent(input.event);
    const metadata = stampRuntimeMetadata({
      canonicalEvent,
      originalEvent: input.event,
      ...input.metadata,
    });

    await prisma.growthEvent.create({
      data: {
        event: input.event,
        readingId: input.readingId,
        referralCode: input.referralCode,
        channel: input.channel,
        metadata: JSON.stringify(metadata),
      },
    });

    await mirrorGrowthEvent({
      originalEvent: input.event,
      readingId: input.readingId,
      referralCode: input.referralCode,
      channel: input.channel,
      metadata,
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
