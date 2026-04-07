import { devLog } from '@/lib/dev-logger';
import { prisma } from '@/lib/prisma';
import { sendOpsAlertEmail } from '@/lib/email/sender';
import { stampRuntimeMetadata } from '@/lib/runtime-environment';

export type OpsAlertSeverity = 'info' | 'warning' | 'critical';

interface OpsAlertInput {
  source: string;
  title: string;
  message: string;
  severity?: OpsAlertSeverity;
  details?: Record<string, unknown>;
  dedupeKey?: string;
}

const lastAlertByKey = new Map<string, number>();

function stringifyDetails(details?: Record<string, unknown>): string {
  if (!details) return '';
  try {
    const serialized = JSON.stringify(stampRuntimeMetadata(details));
    return serialized.length > 1200 ? `${serialized.slice(0, 1200)}...` : serialized;
  } catch {
    return '[unserializable details]';
  }
}

function shouldSuppressAlert(key: string, cooldownMs: number): boolean {
  const now = Date.now();
  const previous = lastAlertByKey.get(key);
  if (previous && now - previous < cooldownMs) {
    return true;
  }
  lastAlertByKey.set(key, now);
  return false;
}

export async function sendOpsAlert(input: OpsAlertInput): Promise<void> {
  const severity = input.severity ?? 'warning';
  const webhookUrl = process.env.OPS_ALERT_WEBHOOK_URL?.trim();
  const cooldownMs = Number(process.env.OPS_ALERT_COOLDOWN_MS ?? '300000');
  const dedupeKey = input.dedupeKey ?? `${input.source}:${input.title}:${severity}`;
  const details = input.details ? stampRuntimeMetadata(input.details) : undefined;

  let isFirstSeen = false;
  try {
    const existing = await prisma.opsAlert.findUnique({
      where: {
        source_alertKey: {
          source: input.source,
          alertKey: dedupeKey,
        },
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.opsAlert.update({
        where: { id: existing.id },
        data: {
          occurrenceCount: { increment: 1 },
          lastSeenAt: new Date(),
          severity,
          title: input.title,
          message: input.message,
          details: details ? JSON.stringify(details) : null,
          status: 'OPEN',
        },
      });
    } else {
      isFirstSeen = true;
      await prisma.opsAlert.create({
        data: {
          source: input.source,
          alertKey: dedupeKey,
          severity,
          title: input.title,
          message: input.message,
          details: details ? JSON.stringify(details) : null,
          status: 'OPEN',
        },
      });
    }
  } catch (error) {
    devLog.error('[OpsAlert] Failed to persist operational alert:', error);
  }

  if (shouldSuppressAlert(dedupeKey, cooldownMs)) {
    return;
  }

  const detailsText = stringifyDetails(details);
  const textLines = [
    `[${severity.toUpperCase()}] ${input.source}`,
    input.title,
    input.message,
    detailsText ? `details: ${detailsText}` : '',
  ].filter(Boolean);
  const text = textLines.join('\n');

  if (severity === 'critical') {
    devLog.error('[OpsAlert]', text);
  } else {
    devLog.warn('[OpsAlert]', text);
  }

  if (isFirstSeen && process.env.OPS_ALERT_EMAIL) {
    try {
      await sendOpsAlertEmail({
        email: process.env.OPS_ALERT_EMAIL,
        source: input.source,
        severity,
        title: input.title,
        message: input.message,
        details,
      });
    } catch (error) {
      devLog.error('[OpsAlert] Failed to send ops alert email:', error);
    }
  }

  if (!webhookUrl) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source: input.source,
        severity,
        title: input.title,
        message: input.message,
        details,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const snippet = body ? `: ${body.slice(0, 200)}` : '';
      throw new Error(`Ops alert webhook failed (${response.status})${snippet}`);
    }
  } catch (error) {
    devLog.error('[OpsAlert] Failed to send operational alert:', error);
  } finally {
    clearTimeout(timeout);
  }
}
