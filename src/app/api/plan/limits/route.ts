import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/audit-logger';
import { getDailyQuotaStatus } from '@/lib/plan-limits';

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'daily_free_reading';
  const ip = getClientIp(request.headers);

  const quota = await getDailyQuotaStatus(ip, action);

  return NextResponse.json({
    action,
    identifier: ip,
    ...quota,
  });
}
