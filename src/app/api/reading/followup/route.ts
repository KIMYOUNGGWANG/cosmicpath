import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/reading/followup - 추가 질문 처리
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { question, context, history } = body;

        // TODO: 실제 AI 서비스 연동
        // 현재는 임시 응답 반환

        const mockAnswer = generateMockAnswer(question, context);

        return NextResponse.json({
            answer: mockAnswer,
            success: true,
        });
    } catch (error) {
        console.error('Follow-up question failed:', error);
        return NextResponse.json(
            { error: 'Failed to process follow-up question' },
            { status: 500 }
        );
    }
}

function generateMockAnswer(question: string, context: any): string {
    // 임시 응답 생성 (실제 AI 연동 전)
    const responses = [
        `좋은 질문이에요. "${question}"에 대해 말씀드리자면, 당신의 3원 통합 분석 결과를 바탕으로 볼 때, 현재 시기는 신중함이 필요한 때입니다. 특히 내면의 목소리에 귀 기울이시길 권합니다.`,
        `"${question}"에 대한 답을 드리자면, 사주와 점성술 모두 이 시점에서 새로운 시작보다는 기존의 것들을 정리하는 데 집중하라고 조언합니다. 타로의 메시지도 비슷한 방향을 가리키고 있어요.`,
        `흥미로운 질문이네요. "${question}"을 보면, 당신이 현재 많은 생각을 하고 계신 것 같습니다. 3원 분석에 따르면, 이 고민은 조만간 해결의 실마리가 보일 것입니다. 조급해하지 마세요.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}
