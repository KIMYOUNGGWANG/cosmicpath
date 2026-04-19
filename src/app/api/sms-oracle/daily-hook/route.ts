import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runSmsOracleDailyHook } from '@/lib/sms-oracle';

const requestSchema = z.object({
  cronSecret: z.string().trim().min(1).optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const getRequestSchema = z.object({
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

function parseBearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
}

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

function isAuthorizedCronRequest(
  request: NextRequest,
  bodySecret?: string | null
): boolean {
  const configuredSecret = process.env.CRON_SECRET?.trim();

  if (!configuredSecret) {
    return false;
  }

  const bearerSecret = parseBearerToken(request.headers.get('authorization'));

  return bodySecret === configuredSecret || bearerSecret === configuredSecret;
}

async function handleDailyHook(targetDate?: string) {
  const summary = await runSmsOracleDailyHook({
    targetDate,
  });

  return NextResponse.json(summary);
}

export async function GET(request: NextRequest) {
  const parsed = getRequestSchema.safeParse({
    targetDate: request.nextUrl.searchParams.get('targetDate') ?? undefined,
  });

  if (!parsed.success) {
    return errorResponse(400, '유효하지 않은 입력입니다.', parsed.error.message);
  }

  if (!isAuthorizedCronRequest(request)) {
    return errorResponse(401, 'Unauthorized');
  }

  try {
    return await handleDailyHook(parsed.data.targetDate);
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SmsOracle Daily Hook] Route error', error);
    return errorResponse(500, '서버 오류가 발생했습니다.', details);
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(rawBody);

  if (!parsed.success) {
    return errorResponse(400, '유효하지 않은 입력입니다.', parsed.error.message);
  }

  if (!isAuthorizedCronRequest(request, parsed.data.cronSecret?.trim() ?? null)) {
    return errorResponse(401, 'Unauthorized');
  }

  try {
    return await handleDailyHook(parsed.data.targetDate);
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SmsOracle Daily Hook] Route error', error);
    return errorResponse(500, '서버 오류가 발생했습니다.', details);
  }
}
