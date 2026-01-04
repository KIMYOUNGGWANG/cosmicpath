import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildChatSystemPrompt } from '@/lib/ai/prompt-builder';
import { generateCompletion } from '@/lib/ai/llm-client';

/**
 * POST /api/reading/followup
 * 상담권(Chat) 기능: 추가 질문 처리
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { readingId, question } = body;

        if (!readingId || !question) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. 리딩 결과 조회 (컨텍스트용)
        const reading = await prisma.readingResult.findUnique({
            where: { id: readingId },
        });

        if (!reading) {
            return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
        }

        // 2. 채팅 세션 확인 및 생성 (없으면 무료 1회 생성)
        let session = await prisma.chatSession.findUnique({
            where: { readingResultId: readingId },
            include: { messages: true },
        });

        if (!session) {
            session = await prisma.chatSession.create({
                data: {
                    readingResultId: readingId,
                    credits: 1, // 무료 1회
                },
                include: { messages: true }, // 빈 배열
            });
        }

        // 3. 크레딧 확인
        if (session.credits <= 0) {
            return NextResponse.json(
                { error: 'Not enough credits', code: 'PAYMENT_REQUIRED' },
                { status: 402 } // Payment Required
            );
        }

        // 4. AI 답변 생성
        // 저장된 리딩 데이터 및 메타데이터 파싱
        const reportData = JSON.parse(reading.data);
        const metadata = reading.metadata ? JSON.parse(reading.metadata) : null;

        // buildChatSystemPrompt가 기대하는 구조: { saju, astrology, tarot }
        // metadata에서 원본 saju 데이터를 추출하거나, report에서 요약 정보 추출
        const chatContext = {
            saju: metadata?.saju || reportData.saju_sections?.overview || '사주 정보 없음',
            astrology: metadata?.astrology || reportData.summary?.astro_anchor || '점성술 정보 없음',
            tarot: metadata?.tarotCards || metadata?.tarot || [],
            name: metadata?.readingData?.name
        };

        const systemPrompt = buildChatSystemPrompt(chatContext);

        // 이전 대화 내역 포맷팅 (최근 3개만 참조하여 컨텍스트 유지)
        const historyText = session.messages.slice(-6).map((m: { role: string; content: string }) =>
            `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n');

        const fullUserPrompt = historyText
            ? `Previous Conversation:\n${historyText}\n\nCurrent Question: ${question}`
            : question;

        const aiResponse = await generateCompletion(systemPrompt, fullUserPrompt, 'free');

        // 5. DB 저장 (User & Assistant) - 트랜잭션 추천
        // Note: 크레딧 차감은 답변 성공 시에만

        await prisma.$transaction([
            // 사용자 질문 저장
            prisma.chatMessage.create({
                data: {
                    chatSessionId: session.id,
                    role: 'user',
                    content: question,
                }
            }),
            // AI 답변 저장
            prisma.chatMessage.create({
                data: {
                    chatSessionId: session.id,
                    role: 'assistant',
                    content: aiResponse.content,
                }
            }),
            // 크레딧 차감
            prisma.chatSession.update({
                where: { id: session.id },
                data: { credits: { decrement: 1 } },
            })
        ]);


        // 6. 응답 반환
        return NextResponse.json({
            answer: aiResponse.content,
            creditsLeft: session.credits - 1,
            success: true,
        });

    } catch (error: any) {
        console.error('Follow-up question failed:', error);
        return NextResponse.json(
            { error: 'Failed to process follow-up question', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/reading/followup?readingId=...
 * 채팅 상태 조회 (크레딧, 내역)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const readingId = searchParams.get('readingId');

        if (!readingId) {
            return NextResponse.json({ error: 'Missing readingId' }, { status: 400 });
        }

        const session = await prisma.chatSession.findUnique({
            where: { readingResultId: readingId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            },
        });

        if (!session) {
            // 세션이 없으면 기본 상태 반환 (1 크레딧, 메시지 없음)
            return NextResponse.json({
                credits: 1,
                messages: [],
                hasSession: false
            });
        }

        return NextResponse.json({
            credits: session.credits,
            messages: session.messages.map((m: { id: string; role: string; content: string; createdAt: Date }) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                createdAt: m.createdAt
            })),
            hasSession: true
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch chat status', details: error.message },
            { status: 500 }
        );
    }
}
