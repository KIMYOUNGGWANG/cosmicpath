import { NextRequest, NextResponse } from 'next/server';
import { calculateSajuMindProfile } from '@/lib/sajumind/engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name = 'Seeker', birthDate, birthTime, birthCity = 'Seoul', timezone = 'Asia/Seoul' } = body;

    if (!birthDate) {
      return NextResponse.json(
        { error: 'birthDate is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const profile = calculateSajuMindProfile(
      name,
      birthDate,
      birthTime,
      birthCity,
      timezone
    );

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: unknown) {
    console.error('[API /api/sajumind/chart] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to calculate SajuMind chart';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
