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

async function relayToMarketingWebhook(
  input: GrowthEventInput,
  metadata: Record<string, unknown>
): Promise<void> {
  const webhookUrl = process.env.THREADS_UPLOADER_WEBHOOK_URL;
  if (!webhookUrl) return;

  const pid = (metadata.pid as string) || (metadata.postId as string);
  if (!pid) return;

  const secret = process.env.THREADS_UPLOADER_SECRET || process.env.CONVERSION_WEBHOOK_SECRET;
  const event = (metadata.canonicalEvent as string) || input.event;
  const sessionId = (metadata.sessionId as string) || undefined;
  const amount =
    typeof metadata.price === 'number'
      ? metadata.price
      : typeof metadata.amount === 'number'
      ? metadata.amount
      : undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${webhookUrl.replace(/\/+$/, '')}/api/webhooks/conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret ? { 'x-webhook-secret': secret } : {}),
      },
      body: JSON.stringify({
        postId: pid,
        pid,
        eventType: event,
        sessionId,
        amount,
        secret,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      devLog.warn?.('[GrowthWebhook] Relay responded with non-200', {
        status: response.status,
        pid,
        event,
      });
    }
  } catch (relayError) {
    // Non-blocking: failure to relay must never affect cosmicpath core operations
    devLog.warn?.('[GrowthWebhook] Relay network error', {
      error: relayError instanceof Error ? relayError.message : relayError,
    });
  }
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

    // Relay to threads-uploader webhook safely before serverless execution context freezes
    await relayToMarketingWebhook(input, metadata);
  } catch (error) {
    devLog.error('[GrowthEvent] Failed to persist event', {
      event: input.event,
      readingId: input.readingId,
      referralCode: input.referralCode,
      error,
    });
  }
}
