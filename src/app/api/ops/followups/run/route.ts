import { NextRequest, NextResponse } from 'next/server';
import { runDueFollowUps } from '@/lib/followup-jobs';
import { sendOpsAlert } from '@/lib/ops-alert';

function parseBearerToken(header: string | null): string | null {
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token.trim();
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const token = parseBearerToken(request.headers.get('authorization'));

  if (!cronSecret || token !== cronSecret) {
    return NextResponse.json({ error: { message: 'Unauthorized', code: 401 } }, { status: 401 });
  }

  let limit = 100;
  let dryRun = false;

  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.limit === 'number') {
      limit = Math.max(1, Math.min(1000, Math.floor(body.limit)));
    }
    if (typeof body.dryRun === 'boolean') {
      dryRun = body.dryRun;
    }
  } catch {
    // no-op
  }

  try {
    const summary = await runDueFollowUps({ limit, dryRun });

    if (summary.failed > 0) {
      await sendOpsAlert({
        source: 'followup-runner',
        severity: 'warning',
        title: 'Follow-up runner completed with failures',
        message: 'At least one follow-up job failed during cron execution.',
        details: summary as unknown as Record<string, unknown>,
        dedupeKey: 'followup-runner:partial-failure',
      });
    }

    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await sendOpsAlert({
      source: 'followup-runner',
      severity: 'critical',
      title: 'Follow-up runner crashed',
      message: 'Unexpected runtime error in follow-up scheduler execution.',
      details: { error: message.slice(0, 300) },
      dedupeKey: 'followup-runner:runtime-crash',
    });

    return NextResponse.json(
      { ok: false, error: { message: 'Follow-up run failed', code: 500 } },
      { status: 500 }
    );
  }
}
