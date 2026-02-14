import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';

const DEFAULT_FREE_READING_DAILY_LIMIT = Number(process.env.FREE_READING_DAILY_LIMIT ?? '3');

function getUtcDayStart(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

interface ConsumeQuotaInput {
  identifier: string;
  action: string;
  limit?: number;
}

export async function consumeDailyQuota({
  identifier,
  action,
  limit = DEFAULT_FREE_READING_DAILY_LIMIT,
}: ConsumeQuotaInput): Promise<QuotaResult> {
  const day = getUtcDayStart();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.quotaUsageDaily.findUnique({
        where: {
          day_identifier_action: {
            day,
            identifier,
            action,
          },
        },
      });

      if (!existing) {
        await tx.quotaUsageDaily.create({
          data: {
            day,
            identifier,
            action,
            used: 1,
            limit,
          },
        });

        return { used: 1, limit };
      }

      if (existing.used >= existing.limit) {
        return { used: existing.used, limit: existing.limit };
      }

      const updated = await tx.quotaUsageDaily.update({
        where: { id: existing.id },
        data: { used: { increment: 1 } },
      });

      return { used: updated.used, limit: updated.limit };
    });

    const remaining = Math.max(0, result.limit - result.used);
    return {
      allowed: result.used <= result.limit,
      used: result.used,
      limit: result.limit,
      remaining,
    };
  } catch (error) {
    // Fail-open to avoid hard blocking paid path due infra hiccup.
    devLog.error('[PlanLimits] Failed to consume quota', { identifier, action, error });
    return {
      allowed: true,
      used: 0,
      limit,
      remaining: limit,
    };
  }
}

export async function getDailyQuotaStatus(
  identifier: string,
  action: string,
  limit: number = DEFAULT_FREE_READING_DAILY_LIMIT
): Promise<QuotaResult> {
  const day = getUtcDayStart();

  try {
    const existing = await prisma.quotaUsageDaily.findUnique({
      where: {
        day_identifier_action: {
          day,
          identifier,
          action,
        },
      },
    });

    const used = existing?.used ?? 0;
    const activeLimit = existing?.limit ?? limit;
    const remaining = Math.max(0, activeLimit - used);

    return {
      allowed: used < activeLimit,
      used,
      limit: activeLimit,
      remaining,
    };
  } catch (error) {
    devLog.error('[PlanLimits] Failed to read quota', { identifier, action, error });
    return {
      allowed: true,
      used: 0,
      limit,
      remaining: limit,
    };
  }
}
