import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  attachReadingAccessKey,
  extractReadingAccessKey,
  normalizeReadingMetadata,
} from '@/lib/reading-access';
import { stampRuntimeMetadata } from '@/lib/runtime-environment';

const MAX_CREATE_ATTEMPTS = 6;

function isExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return expiresAt.getTime() <= now.getTime();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function stringifyMetadata(metadata: Record<string, unknown>): string {
  return JSON.stringify(stampRuntimeMetadata(metadata));
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

function buildPromotionCode(prefix: string): string {
  const safePrefix = prefix.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8) || 'CP';
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `${safePrefix}-${suffix}`;
}

export async function createSingleUsePromotionCode(params: {
  prefix: string;
  description: string;
  discount: number;
  expiresAt: Date;
  maxUses?: number;
}) {
  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
    try {
      return await prisma.promotionCode.create({
        data: {
          code: buildPromotionCode(params.prefix),
          description: params.description,
          discount: params.discount,
          expiresAt: params.expiresAt,
          maxUses: params.maxUses ?? 1,
          isActive: true,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error) && attempt < MAX_CREATE_ATTEMPTS - 1) {
        continue;
      }
      throw error;
    }
  }

  throw new Error('프로모션 코드 생성에 실패했습니다.');
}

export async function isPromoExemptAccount(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  if (normalized === 'rladudrhkd1095@gmail.com') return true;

  const envAdmins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (envAdmins.includes(normalized)) return true;

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { role: true },
    });
    return user?.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function validatePromotionCodeForCheckout(params: {
  codeId: string;
  expectedDiscount?: number;
  email?: string;
}) {
  const promoCode = await prisma.promotionCode.findUnique({
    where: { id: params.codeId },
  });

  if (!promoCode || !promoCode.isActive) {
    throw new Error('유효하지 않은 코드입니다.');
  }

  if (isExpired(promoCode.expiresAt)) {
    throw new Error('만료된 코드입니다.');
  }

  const isExempt = await isPromoExemptAccount(params.email);

  if (promoCode.usedCount >= promoCode.maxUses && !isExempt) {
    throw new Error('선착순 마감된 코드입니다.');
  }

  if (
    typeof params.expectedDiscount === 'number' &&
    promoCode.discount !== params.expectedDiscount
  ) {
    throw new Error('프로모션 할인 정보가 일치하지 않습니다.');
  }

  if (params.email && !isExempt) {
    const normalizedEmail = normalizeEmail(params.email);
    const existingRedemption = await prisma.promoRedemption.findUnique({
      where: {
        promoCodeId_email: {
          promoCodeId: promoCode.id,
          email: normalizedEmail,
        },
      },
    });

    if (existingRedemption) {
      throw new Error('이미 이 프로모션 코드를 사용하셨습니다.');
    }
  }

  return promoCode;
}

export async function redeemPromotionCode(params: {
  codeId: string;
  email: string;
  readingId?: string;
  userAgent?: string;
}) {
  const normalizedEmail = normalizeEmail(params.email);
  const isExempt = await isPromoExemptAccount(normalizedEmail);

  return prisma.$transaction(async (tx) => {
    const promoCode = await tx.promotionCode.findUnique({
      where: { id: params.codeId },
    });

    if (!promoCode || !promoCode.isActive) {
      throw new Error('유효하지 않은 코드입니다.');
    }

    if (isExpired(promoCode.expiresAt)) {
      throw new Error('만료된 코드입니다.');
    }

    const existingRedemption = await tx.promoRedemption.findUnique({
      where: {
        promoCodeId_email: {
          promoCodeId: params.codeId,
          email: normalizedEmail,
        },
      },
    });

    if (existingRedemption && !isExempt) {
      throw new Error('이미 이 프로모션 코드를 사용하셨습니다.');
    }

    if (promoCode.usedCount >= promoCode.maxUses && !isExempt) {
      throw new Error('선착순 마감된 코드입니다.');
    }

    let redemption;
    if (existingRedemption) {
      redemption = await tx.promoRedemption.update({
        where: { id: existingRedemption.id },
        data: {
          readingId: params.readingId,
          userAgent: params.userAgent,
        },
      });
    } else {
      await tx.promotionCode.update({
        where: { id: params.codeId },
        data: { usedCount: { increment: 1 } },
      });

      redemption = await tx.promoRedemption.create({
        data: {
          promoCodeId: params.codeId,
          email: normalizedEmail,
          readingId: params.readingId,
          userAgent: params.userAgent,
        },
      });
    }

    if (params.readingId) {
      const [user, reading] = await Promise.all([
        tx.user.findUnique({ where: { email: normalizedEmail } }),
        tx.readingResult.findUnique({
          where: { id: params.readingId },
          select: { id: true, userId: true, metadata: true },
        }),
      ]);

      if (reading) {
        const existingMetadata = normalizeReadingMetadata(reading.metadata);
        const accessKey = reading.userId ? null : extractReadingAccessKey(existingMetadata);
        const premiumMetadata = {
          ...existingMetadata,
          isPremium: true,
          paymentVerifiedAt: new Date().toISOString(),
          paymentSource: 'promo_redemption',
          email: normalizedEmail,
        };
        const nextMetadata = accessKey
          ? attachReadingAccessKey(premiumMetadata, accessKey)
          : premiumMetadata;

        await tx.readingResult.update({
          where: { id: reading.id },
          data: {
            metadata: stringifyMetadata(nextMetadata),
            ...(user && !reading.userId ? { userId: user.id } : {}),
          },
        });
      }
    }

    return {
      redemptionId: redemption.id,
      alreadyRedeemed: false,
      code: promoCode.code,
      discount: promoCode.discount,
    };
  });
}
