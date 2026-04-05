import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { birthDate } = await req.json();

    if (!birthDate) {
      return NextResponse.json({ error: '생년월일을 입력해주세요.' }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: '커리어 테스트 실험은 현재 중단된 상태입니다.',
        code: 'CAREER_TEST_FROZEN',
        status: 'unavailable'
      },
      { status: 410 }
    );
  } catch (error: unknown) {
    console.error('[API/viral/career-test] Error:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
