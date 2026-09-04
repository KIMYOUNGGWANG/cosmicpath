import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackGrowthEvent } from '@/lib/growth-events';
import { extractReadingAccessKey, hasReadingAccess } from '@/lib/reading-access';
import type { ReadingContext } from '@/lib/ai/prompt-builder';
import { parseJsonRecord } from './route-helpers';

type ReadingTier = 'free' | 'basic' | 'premium';
type ReadingGender = 'male' | 'female';

type InvitationRequestParams = {
  inviteCode?: string;
  phase?: number;
  name?: string;
  tier: ReadingTier;
  context: ReadingContext;
  partnerName?: string;
  partnerBirthDate?: string;
  partnerBirthTime?: string;
  partnerGender?: ReadingGender;
};

type InvitationResolution = {
  tier: ReadingTier;
  context: ReadingContext;
  partnerName?: string;
  partnerBirthDate?: string;
  partnerBirthTime?: string;
  partnerGender?: ReadingGender;
  isInvitePremiumAccess: boolean;
};

type PremiumAccessParams = {
  isPremiumRequest: boolean;
  readingId?: string;
  accessKey?: string;
  sessionUserId: string | null;
  isInvitePremiumAccess: boolean;
  phase?: number;
};

type PremiumAccessResolution =
  | {
      ok: true;
      storedReadingMetadata: Record<string, unknown>;
      hasVerifiedPremiumAccess: boolean;
    }
  | {
      ok: false;
      response: NextResponse;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readGenderValue(value: unknown): ReadingGender | undefined {
  return value === 'male' || value === 'female' ? value : undefined;
}

function readStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export async function resolveInvitationReadingRequest(
  params: InvitationRequestParams
): Promise<InvitationResolution> {
  const baseResolution: InvitationResolution = {
    tier: params.tier,
    context: params.context,
    partnerName: params.partnerName,
    partnerBirthDate: params.partnerBirthDate,
    partnerBirthTime: params.partnerBirthTime,
    partnerGender: params.partnerGender,
    isInvitePremiumAccess: false,
  };

  if (!params.inviteCode) {
    return baseResolution;
  }

  const inviterReading = await prisma.readingResult.findUnique({
    where: { invitationCode: params.inviteCode },
    select: { id: true, data: true },
  });

  if (!inviterReading) {
    return baseResolution;
  }

  try {
    const parsedData = parseJsonRecord(inviterReading.data);
    const personal = isRecord(parsedData.personal) ? parsedData.personal : {};
    const resolvedPartnerName =
      readStringValue(personal.name) ||
      readStringValue(parsedData.name) ||
      'Inviter';
    const resolvedPartnerBirthDate =
      readStringValue(personal.birthDate) ||
      readStringValue(parsedData.birthDate) ||
      params.partnerBirthDate;
    const resolvedPartnerBirthTime =
      readStringValue(personal.birthTime) ||
      readStringValue(parsedData.birthTime) ||
      params.partnerBirthTime;
    const resolvedPartnerGender =
      readGenderValue(personal.gender) ||
      readGenderValue(parsedData.gender) ||
      params.partnerGender ||
      'male';

    console.log(`[Viral] Link activated. Inviter: ${resolvedPartnerName}, Invitee: ${params.name}`);

    if (!params.phase || params.phase === 1) {
      try {
        await prisma.readingResult.update({
          where: { id: inviterReading.id },
          data: { invitationCount: { increment: 1 } },
        });

        await trackGrowthEvent({
          event: 'invite_converted',
          readingId: inviterReading.id,
          referralCode: params.inviteCode,
          channel: 'reading_api',
          metadata: { inviteeName: params.name || 'unknown' },
        });
      } catch (error) {
        console.error('[Viral] Failed to increment count:', error);
      }
    }

    return {
      tier: 'premium',
      context: 'love',
      partnerName: resolvedPartnerName,
      partnerBirthDate: resolvedPartnerBirthDate,
      partnerBirthTime: resolvedPartnerBirthTime,
      partnerGender: resolvedPartnerGender,
      isInvitePremiumAccess: true,
    };
  } catch (error) {
    console.error('[Viral] Failed to parse inviter data', error);
    return baseResolution;
  }
}

export async function verifyPremiumReadingAccess(
  params: PremiumAccessParams
): Promise<PremiumAccessResolution> {
  if (!params.isPremiumRequest) {
    return {
      ok: true,
      storedReadingMetadata: {},
      hasVerifiedPremiumAccess: false,
    };
  }

  const isInviteAllowedForPhase = Boolean(
    params.isInvitePremiumAccess && (!params.phase || params.phase === 1)
  );

  if (!params.readingId && !isInviteAllowedForPhase) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: '결제 정보가 확인되지 않습니다.', code: 'PAYMENT_REQUIRED' },
        { status: 402 }
      ),
    };
  }

  let storedReadingMetadata: Record<string, unknown> = {};
  let hasVerifiedPremiumAccess = isInviteAllowedForPhase;

  if (params.readingId) {
    const storedReading = await prisma.readingResult.findUnique({
      where: { id: params.readingId },
      select: { id: true, metadata: true, userId: true },
    });

    if (!storedReading) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: '리딩을 찾을 수 없습니다.', code: 'READING_NOT_FOUND' },
          { status: 404 }
        ),
      };
    }

    const canAccessReading = hasReadingAccess({
      readingUserId: storedReading.userId,
      sessionUserId: params.sessionUserId,
      storedAccessKey: extractReadingAccessKey(storedReading.metadata),
      providedAccessKey: params.accessKey,
    });

    if (!canAccessReading) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: '이 리딩에 접근할 권한이 없습니다.', code: 'READING_ACCESS_DENIED' },
          { status: 403 }
        ),
      };
    }

    storedReadingMetadata = parseJsonRecord(storedReading.metadata);
    hasVerifiedPremiumAccess = storedReadingMetadata.isPremium === true;

    if (!hasVerifiedPremiumAccess) {
      const paymentRecord = await prisma.payment.findFirst({
        where: {
          readingId: params.readingId,
          status: 'DONE',
        },
        select: {
          orderId: true,
          metadata: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (paymentRecord) {
        const paymentMetadata = parseJsonRecord(paymentRecord.metadata);
        const paymentType = typeof paymentMetadata.type === 'string'
          ? paymentMetadata.type
          : 'premium_reading';

        if (paymentType === 'premium_reading') {
          hasVerifiedPremiumAccess = true;

          if (storedReadingMetadata.isPremium !== true) {
            const syncedMetadata = {
              ...storedReadingMetadata,
              isPremium: true,
              paymentVerifiedAt: new Date().toISOString(),
              paymentSource: 'payment_record',
              paymentOrderId: paymentRecord.orderId,
            };

            storedReadingMetadata = syncedMetadata;

            await prisma.readingResult.update({
              where: { id: storedReading.id },
              data: {
                metadata: JSON.stringify(syncedMetadata),
              },
            }).catch((updateError) => {
              console.error('Failed to sync premium status from payment record', updateError);
            });
          }
        }
      }
    }
  }

  if (!hasVerifiedPremiumAccess) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: '결제 정보가 확인되지 않습니다.', code: 'PAYMENT_REQUIRED' },
        { status: 402 }
      ),
    };
  }

  return {
    ok: true,
    storedReadingMetadata,
    hasVerifiedPremiumAccess,
  };
}
