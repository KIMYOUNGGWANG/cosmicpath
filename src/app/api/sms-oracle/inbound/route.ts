import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  hasSmsOracleWebhookSecret,
  isSmsOracleInboundEnabled,
  processSmsOracleInbound,
  verifySmsOracleWebhookSecret,
  type SmsOracleInboundWebhookPayload,
} from '@/lib/sms-oracle';

const requestSchema = z.object({
  from: z.string().trim().min(1),
  to: z.string().trim().min(1),
  content: z.string().trim().min(1).max(5000),
  receivedAt: z.string().trim().min(1),
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
  if (!isSmsOracleInboundEnabled()) {
    return errorResponse(410, '현재 비활성화된 기능입니다.', 'SMS_ORACLE_INBOUND_DISABLED');
  }

  if (!hasSmsOracleWebhookSecret()) {
    return errorResponse(500, '서버 설정이 올바르지 않습니다.', 'SMS_ORACLE_WEBHOOK_SECRET missing');
  }

  if (!verifySmsOracleWebhookSecret(request.headers.get('x-solapi-secret'))) {
    return errorResponse(403, 'Webhook 서명 검증에 실패했습니다.');
  }

  try {
    const payload = requestSchema.parse(await request.json()) satisfies SmsOracleInboundWebhookPayload;

    void processSmsOracleInbound(payload).catch((error) => {
      console.error('[SmsOracle Inbound] Background processing failed', error);
    });

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return errorResponse(400, '유효하지 않은 입력입니다.', error.message);
    }

    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SmsOracle Inbound] Route error', error);
    return errorResponse(500, '서버 오류가 발생했습니다.', details);
  }
}
