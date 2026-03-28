import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { birthDate, birthTime, gender } = await req.json();

    if (!birthDate) {
      return NextResponse.json({ error: '생년월일을 입력해주세요.' }, { status: 400 });
    }

    // TODO: 오행(목화토금수) 계산 및 Rule-based 매핑 로직 연결
    // 임시 하드코딩 Mock 응답 (프론트 UI 구현용)
    const mockResult = {
      jobId: "wood_fire_01",
      title: "사무실의 의적, 월급루팡",
      description: "당신의 사주는 목(木)과 화(火)가 강해 갇혀 있으면 병이 납니다. 가만히 앉아있는 사무직보다는 발로 뛰는 영업이나 도망칠 구석이 있는 프리랜서가 맞습니다.",
      traits: ["충동적", "상사 킬러", "자유영혼"],
      shareText: "사주로 본 내 진짜 직업은 '사무실의 의적, 월급루팡' ㅋㅋㅋ 너도 해봐👇\nhttps://cosmicpath.com/viral/career-test"
    };

    // 성능을 위해 의도적으로 인위적인 지연(딜레이)를 주지 않음. (Edge 서버 최적화)
    return NextResponse.json(mockResult);

  } catch (error) {
    console.error('[API/viral/career-test] Error:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
