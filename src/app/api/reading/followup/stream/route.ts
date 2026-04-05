import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildChatSystemPrompt, buildChatUserPrompt, type ChatReadingData } from '@/lib/ai/prompt-builder';
import { mergeFollowUpMetadata, resolveFollowUpAdvisorContext } from '@/lib/ai/oracle-followup-context';
import { generateStreamingCompletion } from '@/lib/ai/llm-client';
import { buildFactsOfDestiny } from '@/lib/engines/intelligence-bridge';
import type { AstrologyResult } from '@/lib/engines/astrology';
import type { SajuResult } from '@/lib/engines/saju';
import { authorizeOracleAccess, OracleAccessError } from '@/lib/oracle-access';
import { trackGrowthEvent } from '@/lib/growth-events';

function errorResponse(status: number, message: string, code: string) {
    return new Response(
        JSON.stringify({
            error: {
                code,
                message,
            },
        }),
        {
            status,
            headers: { 'Content-Type': 'application/json' },
        }
    );
}

function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

function getLanguage(metadata: Record<string, unknown> | null): 'ko' | 'en' {
    const readingData = asRecord(metadata?.readingData);
    const value = metadata?.language ?? readingData?.language;
    return value === 'en' ? 'en' : 'ko';
}

function getString(record: Record<string, unknown> | null, key: string): string | undefined {
    const value = record?.[key];
    return typeof value === 'string' ? value : undefined;
}

/**
 * POST /api/reading/followup/stream
 * 상담권(Chat) 기능: 스트리밍 버전 추가 질문 처리
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null);
        const readingId = typeof body?.readingId === 'string' ? body.readingId : '';
        const accessKey = typeof body?.accessKey === 'string' ? body.accessKey : null;
        const question = typeof body?.question === 'string' ? body.question.trim() : '';

        if (!readingId || !question) {
            return errorResponse(400, 'Missing required fields', 'BAD_REQUEST');
        }

        const { reading, isUnlimited } = await authorizeOracleAccess(readingId, accessKey);

        // 2. 채팅 세션 확인 및 생성
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

        const isFirstFollowUp = session.messages.every((message) => message.role !== 'user');

        // 3. 크레딧 확인
        if (!isUnlimited && session.credits <= 0) {
            return errorResponse(402, 'Not enough credits', 'PAYMENT_REQUIRED');
        }

        // 4. AI 컨텍스트 구성
        const reportData = JSON.parse(reading.data);
        const parsedMetadata = reading.metadata ? JSON.parse(reading.metadata) : null;
        const metadata = asRecord(parsedMetadata);
        const readingData = asRecord(metadata?.readingData);
        const chatLanguage = getLanguage(metadata);
        const advisorContext = resolveFollowUpAdvisorContext({
            metadata,
            question,
            language: chatLanguage,
        });
        const chatContext: ChatReadingData = {
            saju: (metadata?.saju as ChatReadingData['saju']) || reportData.saju_sections?.overview || '사주 정보 없음',
            astrology: (metadata?.astrology as ChatReadingData['astrology']) || reportData.summary?.astro_anchor || '점성술 정보 없음',
            tarot: Array.isArray(metadata?.tarotCards)
                ? metadata.tarotCards as ChatReadingData['tarot']
                : Array.isArray(metadata?.tarot)
                    ? metadata.tarot as ChatReadingData['tarot']
                    : [],
            name: getString(readingData, 'name'),
            characterId: advisorContext.characterId,
            questionIntent: advisorContext.questionIntent,
            selectionMode: advisorContext.selectionMode,
            advisorProfile: advisorContext.advisorProfile,
            advisorEvidenceSummary: advisorContext.advisorEvidenceSummary,
        };

        // Facts of Destiny: 원천 데이터가 있으면 정량화된 데이터 블록 생성
        let factsOfDestinyBlock: string | undefined;
        try {
            const rawSaju = asRecord(metadata?.sajuResult);
            const rawAstro = asRecord(metadata?.astrologyResult);
            const hasAstroPlanets = Array.isArray(rawAstro?.planets) && rawAstro.planets.length > 0;
            if (rawSaju?.dayMaster && rawAstro?.sunSign !== undefined && hasAstroPlanets) {
                const factsData = buildFactsOfDestiny(
                    rawSaju as unknown as SajuResult,
                    rawAstro as unknown as AstrologyResult
                );
                factsOfDestinyBlock = factsData.fullDataBlock;
            }
        } catch (bridgeError) {
            console.warn('[Facts of Destiny] Bridge generation skipped:', bridgeError);
        }

        const localSajuPromptBlock = advisorContext.localSajuPromptBlock;
        const systemPrompt = buildChatSystemPrompt(
            chatContext,
            chatLanguage,
            factsOfDestinyBlock,
            localSajuPromptBlock
        );

        // 이전 대화 내역 (최근 6개 참조)
        const historyText = session.messages.slice(-6).map((m: { role: string; content: string }) =>
            `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n');

        const fullUserPrompt = buildChatUserPrompt(question, historyText);

        // 5. 스트리밍 호출
        const response = await generateStreamingCompletion(systemPrompt, fullUserPrompt, 'free');
        if (!response.body) {
            return errorResponse(500, 'Failed to start stream', 'STREAM_INIT_FAILED');
        }

        // 6. 비동기적으로 메시지 및 크레딧 업데이트 (Stream Pass-through)
        // Note: Edge Runtime이나 서버 환경에 따라 이 패턴이 다를 수 있으나,
        // 여기서는 응답 스트림을 반환하면서 백그라운드에서 완료 처리를 시뮬레이션하거나
        // 클라이언트에서 완료 후 저장을 따로 요청할 수도 있음.
        // 현재는 가장 안전한 '완료 후 저장'을 위해 스트림 데이터를 가로채서 처리하는 형태로 구성.

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        let fullResponse = '';
        let sseBuffer = '';
        const nextMetadata = mergeFollowUpMetadata(metadata, advisorContext);

        const parseGeminiSseLine = (line: string): string => {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) return '';

            const payload = trimmed.slice(5).trim();
            if (!payload || payload === '[DONE]') return '';

            try {
                const parsed = JSON.parse(payload);
                const parts = parsed?.candidates?.[0]?.content?.parts;
                if (!Array.isArray(parts)) return '';

                return parts
                    .map((part: { text?: string } | null | undefined) => (
                        typeof part?.text === 'string' ? part.text : ''
                    ))
                    .join('');
            } catch {
                return '';
            }
        };

        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                const text = decoder.decode(chunk, { stream: true });
                sseBuffer += text;

                const lines = sseBuffer.split(/\r?\n/);
                sseBuffer = lines.pop() ?? '';

                for (const line of lines) {
                    const content = parseGeminiSseLine(line);
                    if (!content) continue;
                    fullResponse += content;
                    controller.enqueue(encoder.encode(content));
                }
            },
            async flush() {
                // 버퍼에 남은 마지막 이벤트도 처리 시도
                if (sseBuffer.trim()) {
                    const content = parseGeminiSseLine(sseBuffer);
                    if (content) {
                        fullResponse += content;
                    }
                }

                // 스트림 종료 후 비동기 저장 (응답은 이미 클라이언트로 전달됨)
                try {
                    await prisma.$transaction(async (transaction) => {
                        await transaction.chatMessage.create({
                            data: {
                                chatSessionId: session!.id,
                                role: 'user',
                                content: question,
                            },
                        });

                        await transaction.chatMessage.create({
                            data: {
                                chatSessionId: session!.id,
                                role: 'assistant',
                                content: fullResponse || '(답변을 생성하지 못했습니다)',
                            },
                        });

                        if (!isUnlimited) {
                            await transaction.chatSession.update({
                                where: { id: session!.id },
                                data: { credits: { decrement: 1 } },
                            });
                        }

                        await transaction.readingResult.update({
                            where: { id: readingId },
                            data: { metadata: JSON.stringify(nextMetadata) },
                        });
                    });

                    if (isFirstFollowUp) {
                        await trackGrowthEvent({
                            event: 'followup_start',
                            readingId,
                            channel: 'oracle_followup_stream',
                            metadata: {
                                sessionId: session!.id,
                                questionIntent: advisorContext.questionIntent,
                                selectionMode: advisorContext.selectionMode,
                            },
                        });
                    }
                } catch (dbError) {
                    console.error('[Oracle Stream DB Update Error]', dbError);
                }
            }
        });

        return new Response(response.body.pipeThrough(transformStream), {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error: unknown) {
        if (error instanceof OracleAccessError) {
            return errorResponse(error.status, error.message, error.code);
        }

        const message = error instanceof Error ? error.message : String(error);
        console.error('Streaming follow-up failed:', error);
        return errorResponse(500, message, 'INTERNAL_SERVER_ERROR');
    }
}
