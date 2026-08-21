import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDailyTransit } from '@/lib/sajumind/engine';
import type { DecisionLogEntry } from '@/lib/sajumind/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, dayMasterHangul = '갑', userId, guestId = 'guest-session' } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const transit = calculateDailyTransit(dayMasterHangul, new Date());
    const timingScore = transit.relationToDayMaster.energyIntensity === 'high' ? 88 : 72;

    const sajuSnapshot = {
      transitDate: transit.date,
      elementalInfluence: transit.relationToDayMaster.labelEn,
      timingScore,
    };

    let decisionId = `dec-${Date.now()}`;
    try {
      if (prisma.sajuMindDecision) {
        const saved = await prisma.sajuMindDecision.create({
          data: {
            userId: userId || null,
            guestId,
            title,
            description,
            sajuSnapshot: JSON.stringify(sajuSnapshot),
            status: 'PENDING',
          },
        });
        decisionId = saved.id;
      }
    } catch (e) {
      console.warn('[API /api/sajumind/decisions] Prisma save fallback:', e);
    }

    const entry: DecisionLogEntry = {
      id: decisionId,
      title,
      description,
      sajuTimingSnapshot: sajuSnapshot,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, decision: entry });
  } catch (error: unknown) {
    console.error('[API /api/sajumind/decisions] Error:', error);
    return NextResponse.json({ error: 'Failed to record decision' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const guestId = searchParams.get('guestId') || 'guest-session';

    let decisions: DecisionLogEntry[] = [];
    try {
      if (prisma.sajuMindDecision) {
        const records = await prisma.sajuMindDecision.findMany({
          where: userId ? { userId } : { guestId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });

        decisions = records.map((r: { id: string; title: string; description: string | null; sajuSnapshot: string | null; status: string; outcomeNote: string | null; createdAt: Date }) => ({
          id: r.id,
          title: r.title,
          description: r.description || undefined,
          sajuTimingSnapshot: JSON.parse(r.sajuSnapshot || '{}'),
          status: r.status as 'PENDING' | 'DECIDED' | 'REVIEWED',
          outcomeNote: r.outcomeNote || undefined,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (e) {
      console.warn('[API GET /api/sajumind/decisions] Prisma lookup fallback:', e);
    }

    return NextResponse.json({ success: true, decisions });
  } catch (error: unknown) {
    console.error('[API GET /api/sajumind/decisions] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}
