import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import {
  hasSmsOracleMembershipAccess,
  normalizePhoneNumberToE164,
  registerSmsOraclePhone,
} from '@/lib/sms-oracle';

const requestSchema = z.object({
  phoneNumber: z.string().trim().min(1),
});

function errorResponse(status: number, message: string, details?: string) {
  return NextResponse.json(
    {
      error: {
        code: status,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return errorResponse(401, '로그인이 필요합니다.');
  }

  const hasMembershipAccess = await hasSmsOracleMembershipAccess(userId);
  if (!hasMembershipAccess) {
    return errorResponse(
      403,
      '활성 멤버십에서만 Daily Signal을 설정할 수 있습니다.',
      'SMS_ORACLE_MEMBERSHIP_REQUIRED'
    );
  }

  try {
    const payload = requestSchema.parse(await request.json());
    const phoneNumber = normalizePhoneNumberToE164(payload.phoneNumber);

    if (!phoneNumber) {
      return errorResponse(400, '유효한 전화번호를 입력해주세요.');
    }

    await registerSmsOraclePhone({
      userId,
      phoneNumber,
    });

    return NextResponse.json({
      success: true,
      verificationSent: true,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, '유효하지 않은 입력입니다.', error.message);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return errorResponse(409, '이미 사용 중인 전화번호입니다.');
    }

    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SmsOracle Register] Route error', error);
    return errorResponse(500, '서버 오류가 발생했습니다.', details);
  }
}
