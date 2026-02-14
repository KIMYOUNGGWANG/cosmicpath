import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackGrowthEvent } from '@/lib/growth-events';

const ACTIONS = new Set([
  'invite_cta_clicked',
  'invite_link_copied',
  'invite_link_opened',
  'invite_converted',
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const action = typeof body.action === 'string' ? body.action.trim() : '';
    const channel = typeof body.channel === 'string' ? body.channel.trim() : undefined;
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : undefined;

    if (!code || !action || !ACTIONS.has(action)) {
      return NextResponse.json(
        { error: { message: 'Invalid invite track payload', code: 400 } },
        { status: 400 }
      );
    }

    const inviter = await prisma.readingResult.findUnique({
      where: { invitationCode: code },
      select: { id: true },
    });

    if (!inviter) {
      return NextResponse.json({ ok: false, reason: 'INVALID_CODE' }, { status: 404 });
    }

    await trackGrowthEvent({
      event: action,
      readingId: inviter.id,
      referralCode: code,
      channel,
      metadata,
    });

    return NextResponse.json({ ok: true, inviterReadingId: inviter.id });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Internal Server Error', code: 500 } },
      { status: 500 }
    );
  }
}
