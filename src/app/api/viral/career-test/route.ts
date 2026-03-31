import { NextResponse } from 'next/server';
import { getCareerResult } from '@/lib/saju/careerMapping';

export const runtime = 'edge'; // Edge Runtime 최적화

export async function POST(req: Request) {
  try {
    const { birthDate, birthTime, gender } = await req.json();

    if (!birthDate) {
      return NextResponse.json({ error: '생년월일을 입력해주세요.' }, { status: 400 });
    }

    const result = getCareerResult(birthDate, birthTime, gender);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[API/viral/career-test] Error:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
