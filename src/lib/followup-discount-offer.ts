import { prisma } from '@/lib/prisma';
import { createSingleUsePromotionCode } from '@/lib/promo-codes';
import { stampRuntimeMetadata } from '@/lib/runtime-environment';
import { parseJobMetadata, type FollowUpJobMetadata } from '@/lib/followup-job-metadata';
import { getAppUrl } from '@/lib/followup-url';
import type { FollowUpStage } from '@/lib/followup-schedule';

const DISCOUNT_STAGE_DISCOUNT = 20;
const DISCOUNT_STAGE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

export const DISCOUNT_STAGE_ALIASES = new Set<FollowUpStage>(['D2_DISCOUNT', 'H48']);

export async function ensureDiscountOffer(job: {
  readonly id: string;
  readonly readingId: string;
  readonly metadata: string | null;
}): Promise<FollowUpJobMetadata> {
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
      metadata: JSON.stringify(stampRuntimeMetadata(nextMetadata)),
    },
  });

  return nextMetadata;
}
