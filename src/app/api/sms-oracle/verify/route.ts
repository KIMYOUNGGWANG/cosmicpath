import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import {
  hasSmsOracleMembershipAccess,
  normalizePhoneNumberToE164,
  verifySmsOraclePhone,
} from '@/lib/sms-oracle';

const requestSchema = z.object({
  phoneNumber: z.string().trim().min(1),
  code: z.string().trim().length(6),
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

    const verified = await verifySmsOraclePhone({
      userId,
      phoneNumber,
      code: payload.code,
    });

    if (!verified) {
      return errorResponse(400, '인증번호가 올바르지 않거나 만료되었습니다.');
    }

    return NextResponse.json({ verified: true });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, '유효하지 않은 입력입니다.', error.message);
    }

    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SmsOracle Verify] Route error', error);
    return errorResponse(500, '서버 오류가 발생했습니다.', details);
  }
}
