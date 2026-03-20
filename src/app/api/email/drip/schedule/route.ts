import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DEFAULT_FOLLOW_UP_STAGES, scheduleDefaultFollowUps } from '@/lib/followup-jobs';

function parseBearerToken(header: string | null): string | null {
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token.trim();
}

const ScheduleDripSchema = z.object({
  readingId: z.string().min(1, 'readingId is required'),
  email: z.string().email('email is required'),
  fromDate: z.string().datetime().optional(),
});

function errorResponse(code: number, message: string, details?: string) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
      ok: false,
    },
    { status: code }
  );
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const token = parseBearerToken(request.headers.get('authorization'));

  if (!cronSecret || token !== cronSecret) {
    return errorResponse(401, '인증에 실패했습니다.');
  }

  try {
    const body = await request.json();
    const parsed = ScheduleDripSchema.parse(body);

    await scheduleDefaultFollowUps({
      readingId: parsed.readingId,
      email: parsed.email,
      fromDate: parsed.fromDate ? new Date(parsed.fromDate) : undefined,
    });

    return NextResponse.json({
      ok: true,
      readingId: parsed.readingId,
      email: parsed.email,
      scheduledStages: DEFAULT_FOLLOW_UP_STAGES,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to schedule drip emails';
    return errorResponse(400, '드립 이메일 예약에 실패했습니다.', message);
  }
}
