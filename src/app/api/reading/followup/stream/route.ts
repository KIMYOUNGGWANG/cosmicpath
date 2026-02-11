import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildOracleChatSystemPrompt } from '@/lib/ai/oracle-prompts';
import { generateStreamingCompletion } from '@/lib/ai/llm-client';

/**
 * POST /api/reading/followup/stream
 * 상담권(Chat) 기능: 스트리밍 버전 추가 질문 처리
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { readingId, question } = body;

        if (!readingId || !question) {
            return new Response('Missing required fields', { status: 400 });
        }

        // 1. 리딩 결과 조회
        const reading = await prisma.readingResult.findUnique({
            where: { id: readingId },
        });

        if (!reading) {
            return new Response('Reading not found', { status: 404 });
        }

        // 2. 채팅 세션 확인 및 생성
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
                include: { messages: true },
            });
        }

        // 3. 크레딧 확인
        if (session.credits <= 0) {
            return new Response(JSON.stringify({ error: 'Not enough credits', code: 'PAYMENT_REQUIRED' }), {
                status: 402,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 4. AI 컨텍스트 구성
        const reportData = JSON.parse(reading.data);
        const metadata = reading.metadata ? JSON.parse(reading.metadata) : null;

        const chatContext = {
            saju: metadata?.saju || reportData.saju_sections?.overview || '사주 정보 없음',
            astrology: metadata?.astrology || reportData.summary?.astro_anchor || '점성술 정보 없음',
            tarot: metadata?.tarotCards?.map((c: any) => c.name).join(', ') || '타로 정보 없음',
            name: metadata?.readingData?.name
        };

        const systemPrompt = buildOracleChatSystemPrompt(chatContext);

        // 이전 대화 내역 (최근 6개 참조)
        const historyText = session.messages.slice(-6).map((m: any) =>
            `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n');

        const fullUserPrompt = historyText
            ? `Previous Conversation:\n${historyText}\n\nCurrent Question: ${question}`
            : question;

        // 5. 스트리밍 호출
        const response = await generateStreamingCompletion(systemPrompt, fullUserPrompt, 'free');

        // 6. 비동기적으로 메시지 및 크레딧 업데이트 (Stream Pass-through)
        // Note: Edge Runtime이나 서버 환경에 따라 이 패턴이 다를 수 있으나,
        // 여기서는 응답 스트림을 반환하면서 백그라운드에서 완료 처리를 시뮬레이션하거나
        // 클라이언트에서 완료 후 저장을 따로 요청할 수도 있음.
        // 현재는 가장 안전한 '완료 후 저장'을 위해 스트림 데이터를 가로채서 처리하는 형태로 구성.

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let fullResponse = '';

        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                const text = decoder.decode(chunk);
                fullResponse += text;
                controller.enqueue(chunk);
            },
            async flush() {
                // 스트림 종료 시 DB 저장
                try {
                    await prisma.$transaction([
                        prisma.chatMessage.create({
                            data: {
                                chatSessionId: session!.id,
                                role: 'user',
                                content: question,
                            }
                        }),
                        prisma.chatMessage.create({
                            data: {
                                chatSessionId: session!.id,
                                role: 'assistant',
                                content: fullResponse || '(답변을 생성하지 못했습니다)',
                            }
                        }),
                        prisma.chatSession.update({
                            where: { id: session!.id },
                            data: { credits: { decrement: 1 } },
                        })
                    ]);
                    console.log(`[Oracle Stream] Session ${session!.id} updated and credit deducted.`);
                } catch (dbError) {
                    console.error('[Oracle Stream DB Update Error]', dbError);
                }
            }
        });

        return new Response(response.body?.pipeThrough(transformStream), {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: any) {
        console.error('Streaming follow-up failed:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
