import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function parseBearerToken(header: string | null): string | null {
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token.trim();
}

function parseDate(input: string | null, fallback: Date): Date {
  if (!input) return fallback;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return fallback;
  return date;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const token = parseBearerToken(request.headers.get('authorization'));

  if (!cronSecret || token !== cronSecret) {
    return NextResponse.json({ error: { message: 'Unauthorized', code: 401 } }, { status: 401 });
  }

  const now = new Date();
  const fromDefault = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6));
  const toDefault = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

  const from = parseDate(request.nextUrl.searchParams.get('from'), fromDefault);
  const to = parseDate(request.nextUrl.searchParams.get('to'), toDefault);

  const rows = await prisma.usageCounterDaily.findMany({
    where: {
      day: {
        gte: from,
        lte: to,
      },
    },
    orderBy: [{ day: 'asc' }, { provider: 'asc' }, { metric: 'asc' }],
  });

  const totals: Record<string, { count: number; amount: number }> = {};
  for (const row of rows) {
    const key = `${row.provider}.${row.metric}`;
    if (!totals[key]) totals[key] = { count: 0, amount: 0 };
    totals[key].count += row.count;
    totals[key].amount += row.amount;
  }

  return NextResponse.json({
    from: from.toISOString(),
    to: to.toISOString(),
    rows,
    totals,
  });
}
