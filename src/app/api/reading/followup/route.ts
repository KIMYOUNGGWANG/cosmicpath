import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildChatSystemPrompt, buildChatUserPrompt } from '@/lib/ai/prompt-builder';
import {
    generateCompletion,
    getAIModelBusyMessage,
    isAIModelBusyError
} from '@/lib/ai/llm-client';
import { buildFactsOfDestiny } from '@/lib/engines/intelligence-bridge';
import { authorizeOracleAccess, OracleAccessError } from '@/lib/oracle-access';

function errorResponse(code: number, message: string, details?: string) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
                ...(details ? { details } : {}),
            },
        },
        { status: code }
    );
}

/**
 * POST /api/reading/followup
 * 상담권(Chat) 기능: 추가 질문 처리
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null);
        const readingId = typeof body?.readingId === 'string' ? body.readingId : '';
        const question = typeof body?.question === 'string' ? body.question.trim() : '';

        if (!readingId || !question) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { reading, isUnlimited } = await authorizeOracleAccess(readingId);

        // 2. 채팅 세션 확인 및 생성 (없으면 무료 1회 생성)
        let session = await prisma.chatSession.findUnique({
            where: { readingResultId: readingId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!session) {
            session = await prisma.chatSession.create({
                data: {
                    readingResultId: readingId,
                    credits: 1, // 무료 1회
                },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                    },
                },
            });
        }

        // 3. 크레딧 확인
        if (!isUnlimited && session.credits <= 0) {
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

        // Facts of Destiny: 원천 데이터가 있으면 정량화된 데이터 블록 생성
        let factsOfDestinyBlock: string | undefined;
        try {
            const rawSaju = metadata?.sajuResult || metadata?.saju;
            const rawAstro = metadata?.astrologyResult || metadata?.astrology;
            const hasAstroPlanets = Array.isArray(rawAstro?.planets) && rawAstro.planets.length > 0;
            if (rawSaju && typeof rawSaju === 'object' && rawSaju.dayMaster &&
                rawAstro && typeof rawAstro === 'object' && rawAstro.sunSign !== undefined && hasAstroPlanets) {
                const factsData = buildFactsOfDestiny(rawSaju, rawAstro);
                factsOfDestinyBlock = factsData.fullDataBlock;
            }
        } catch (bridgeError) {
            console.warn('[Facts of Destiny] Bridge generation skipped:', bridgeError);
        }

        const systemPrompt = buildChatSystemPrompt(chatContext, 'ko', factsOfDestinyBlock);

        // 이전 대화 내역 포맷팅 (최근 3개만 참조하여 컨텍스트 유지)
        const historyText = session.messages.slice(-6).map((m: { role: string; content: string }) =>
            `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n');

        const fullUserPrompt = buildChatUserPrompt(question, historyText);

        const aiResponse = await generateCompletion(systemPrompt, fullUserPrompt, 'free');

        // 5. DB 저장 (User & Assistant) - 트랜잭션 추천
        // Note: 크레딧 차감은 답변 성공 시에만

        await prisma.$transaction(async (transaction) => {
            await transaction.chatMessage.create({
                data: {
                    chatSessionId: session.id,
                    role: 'user',
                    content: question,
                },
            });

            await transaction.chatMessage.create({
                data: {
                    chatSessionId: session.id,
                    role: 'assistant',
                    content: aiResponse.content,
                },
            });

            if (!isUnlimited) {
                await transaction.chatSession.update({
                    where: { id: session.id },
                    data: { credits: { decrement: 1 } },
                });
            }
        });


        // 6. 응답 반환
        return NextResponse.json({
            answer: aiResponse.content,
            creditsLeft: isUnlimited ? session.credits : Math.max(session.credits - 1, 0),
            isUnlimited,
            success: true,
        });

    } catch (error: unknown) {
        if (error instanceof OracleAccessError) {
            return errorResponse(error.status, error.message, error.code);
        }

        if (isAIModelBusyError(error)) {
            return errorResponse(503, getAIModelBusyMessage('ko'), 'AI_MODEL_BUSY');
        }

        const message = error instanceof Error ? error.message : String(error);
        console.error('Follow-up question failed:', error);
        return NextResponse.json(
            { error: 'Failed to process follow-up question', details: message },
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

        const { isUnlimited } = await authorizeOracleAccess(readingId);

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
                hasSession: false,
                isUnlimited,
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
            hasSession: true,
            isUnlimited,
        });

    } catch (error: unknown) {
        if (error instanceof OracleAccessError) {
            return errorResponse(error.status, error.message, error.code);
        }

        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { error: 'Failed to fetch chat status', details: message },
            { status: 500 }
        );
    }
}
