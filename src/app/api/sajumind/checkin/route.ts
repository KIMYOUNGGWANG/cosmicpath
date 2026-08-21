import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateSajuMindProfile,
  calculateDailyTransit,
  DAY_MASTER_ARCHETYPES,
} from '@/lib/sajumind/engine';
import { generateSajuMindCheckInFeedback } from '@/lib/sajumind/ai';
import type { CheckInRequest, CheckInResult, SajuMindEmotion } from '@/lib/sajumind/types';

export async function POST(request: NextRequest) {
  try {
    const body: CheckInRequest = await request.json();
    const { emotion, tags = [], note = '', userId, guestId, userProfile } = body;

    if (!emotion) {
      return NextResponse.json(
        { error: 'Emotion selection is required' },
        { status: 400 }
      );
    }

    // Determine Day Master
    let dayMasterHangul = '갑';
    let dayMaster = DAY_MASTER_ARCHETYPES['갑'];

    if (userProfile?.birthDate) {
      const profile = calculateSajuMindProfile(
        userProfile.name || 'Friend',
        userProfile.birthDate,
        userProfile.birthTime,
        userProfile.birthCity || 'Seoul',
        userProfile.timezone || 'Asia/Seoul'
      );
      dayMaster = profile.dayMaster;
      dayMasterHangul = profile.dayMaster.stem.charAt(0);
      const hanjaToHangul: Record<string, string> = {
        '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
        '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계'
      };
      dayMasterHangul = hanjaToHangul[dayMasterHangul] || '갑';
    }

    // Calculate Daily Transit
    const dailyTransit = calculateDailyTransit(dayMasterHangul, new Date());

    // Generate AI Feedback (< 80 words)
    const aiFeedback = await generateSajuMindCheckInFeedback({
      userName: userProfile?.name,
      emotion: emotion as SajuMindEmotion,
      tags,
      note,
      dayMaster,
      dailyTransit,
    });

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Persist to Prisma if available
    let checkInId = `checkin-${Date.now()}`;
    try {
      if (prisma.sajuMindCheckIn) {
        const saved = await prisma.sajuMindCheckIn.create({
          data: {
            userId: userId || null,
            guestId: guestId || 'guest-session',
            emotion,
            tags: JSON.stringify(tags),
            note,
            dayMaster: dayMaster.englishName,
            dailyPillar: `${dailyTransit.pillar.stem} ${dailyTransit.pillar.branch}`,
            aiFeedback: aiFeedback.fullText,
          },
        });
        checkInId = saved.id;
      }
    } catch (dbError) {
      console.warn('[API /api/sajumind/checkin] Prisma save skipped/failed:', dbError);
    }

    const result: CheckInResult = {
      id: checkInId,
      date: dateStr,
      emotion: emotion as SajuMindEmotion,
      tags,
      note,
      dailyTransit,
      aiFeedback,
      createdAt: now.toISOString(),
    };

    return NextResponse.json({
      success: true,
      checkIn: result,
    });
  } catch (error: unknown) {
    console.error('[API /api/sajumind/checkin] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal error processing check-in';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const guestId = searchParams.get('guestId') || 'guest-session';

    let history: Array<{
      id: string;
      date: string;
      emotion: string;
      tags: string[];
      note: string | null;
      aiFeedback: string;
      createdAt: string;
    }> = [];

    try {
      if (prisma.sajuMindCheckIn) {
        const records = await prisma.sajuMindCheckIn.findMany({
          where: userId ? { userId } : { guestId },
          orderBy: { createdAt: 'desc' },
          take: 30,
        });

        history = records.map((r: { id: string; createdAt: Date; emotion: string; tags: string; note: string | null; aiFeedback: string }) => ({
          id: r.id,
          date: r.createdAt.toISOString().split('T')[0],
          emotion: r.emotion,
          tags: JSON.parse(r.tags || '[]'),
          note: r.note,
          aiFeedback: r.aiFeedback,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch (dbError) {
      console.warn('[API GET /api/sajumind/checkin] Prisma lookup skipped:', dbError);
    }

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error: unknown) {
    console.error('[API GET /api/sajumind/checkin] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve check-in history' }, { status: 500 });
  }
}
