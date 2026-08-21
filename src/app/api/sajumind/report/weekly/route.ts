import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculateSajuMindProfile,
} from '@/lib/sajumind/engine';
import { generateSajuMindWeeklyReport } from '@/lib/sajumind/ai';
import type { SajuMindEmotion, WeeklyPatternSummary } from '@/lib/sajumind/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const birthDate = searchParams.get('birthDate') || '1995-05-15';
    const birthTime = searchParams.get('birthTime') || '12:00';
    const name = searchParams.get('name') || 'Friend';
    const userId = searchParams.get('userId');
    const guestId = searchParams.get('guestId') || 'guest-session';

    const profile = calculateSajuMindProfile(name, birthDate, birthTime);
    const dayMaster = profile.dayMaster;

    // Fetch past 7 days check-ins
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let checkIns: Array<{
      date: string;
      emotion: SajuMindEmotion;
      tags: string[];
      note?: string;
    }> = [];

    try {
      if (prisma.sajuMindCheckIn) {
        const records = await prisma.sajuMindCheckIn.findMany({
          where: {
            ...(userId ? { userId } : { guestId }),
            createdAt: { gte: sevenDaysAgo },
          },
          orderBy: { createdAt: 'asc' },
        });

        checkIns = records.map((r: { createdAt: Date; emotion: string; tags: string; note: string | null }) => ({
          date: r.createdAt.toISOString().split('T')[0],
          emotion: r.emotion as SajuMindEmotion,
          tags: JSON.parse(r.tags || '[]'),
          note: r.note || undefined,
        }));
      }
    } catch (e) {
      console.warn('[API /api/sajumind/report/weekly] Prisma lookup fallback:', e);
    }

    // Default mock check-ins if user is testing with zero logs
    if (checkIns.length === 0) {
      checkIns = [
        { date: 'Mon', emotion: 'Overthinking', tags: ['work', 'decision'] },
        { date: 'Tue', emotion: 'Anxious', tags: ['fatigue', 'pressure'] },
        { date: 'Wed', emotion: 'Neutral', tags: ['routine'] },
        { date: 'Thu', emotion: 'Motivated', tags: ['clarity', 'focus'] },
        { date: 'Fri', emotion: 'Peaceful', tags: ['rest', 'completion'] },
      ];
    }

    // Tally emotions
    const emotionCounts: Record<string, number> = {};
    checkIns.forEach((c) => {
      emotionCounts[c.emotion] = (emotionCounts[c.emotion] || 0) + 1;
    });

    let dominantEmotion: SajuMindEmotion = 'Neutral';
    let maxCount = -1;
    Object.entries(emotionCounts).forEach(([emo, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        dominantEmotion = emo as SajuMindEmotion;
      }
    });

    const elementalSummary = `Dominant Element: ${profile.dominantElement.toUpperCase()} (${profile.elementPercentages[profile.dominantElement]}%), Day Master: ${dayMaster.englishName}`;

    const aiWeeklyInsight = await generateSajuMindWeeklyReport({
      userName: name,
      dayMaster,
      checkInHistory: checkIns,
      dominantEmotion,
      elementalSummary,
    });

    const now = new Date();
    const weekStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const weekEndDate = now.toISOString().split('T')[0];

    const summary: WeeklyPatternSummary = {
      weekRange: `${weekStartDate} ~ ${weekEndDate}`,
      totalCheckIns: checkIns.length,
      dominantEmotion,
      emotionBreakdown: emotionCounts,
      elementalFlowSummary: elementalSummary,
      aiWeeklyInsight,
    };

    return NextResponse.json({
      success: true,
      report: summary,
    });
  } catch (error: unknown) {
    console.error('[API /api/sajumind/report/weekly] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate weekly pattern report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
