import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { generateStreamingCompletion } from '@/lib/ai/llm-client';
import {
  OracleChatRouteError,
  applyFinalVerdict,
  buildOracleChatPromptContext,
  consumeOracleChatQuota,
  getOracleChatRoomForUser,
  getOracleChatUsage,
  resolveOracleChatDomain,
  saveOracleChatExchange,
} from '@/lib/oracle-chat';

const requestSchema = z.object({
  roomId: z.string().min(1).optional(),
  domain: z.enum(['career', 'love', 'wealth', 'general']).optional(),
  content: z.string().trim().min(1).max(1000),
  userContext: z.object({
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    birthPlace: z.string().min(1).max(100).optional(),
  }).optional(),
});

function errorResponse(status: number, message: string, details?: string) {
  return NextResponse.json(
    {
      error: {
        code: status,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

function parseGeminiSseLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) {
    return '';
  }

  const payload = trimmed.slice(5).trim();
  if (!payload || payload === '[DONE]') {
    return '';
  }

  try {
    const parsed = JSON.parse(payload) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
    const parts = parsed.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) {
      return '';
    }

    return parts
      .map((part) => (typeof part.text === 'string' ? part.text : ''))
      .join('');
  } catch {
    return '';
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return errorResponse(401, '로그인이 필요합니다.');
  }

  try {
    const payload = requestSchema.parse(await request.json());
    const domain = resolveOracleChatDomain(payload.domain);

    if (payload.roomId) {
      const room = await getOracleChatRoomForUser(userId, payload.roomId);
      if (!room) {
        throw new OracleChatRouteError(404, 'ROOM_NOT_FOUND', '대화방을 찾을 수 없습니다.');
      }
    }

    const usage = await getOracleChatUsage(userId);
    if (!usage.isUnlimited) {
      await consumeOracleChatQuota(userId);
    }

    const promptContext = await buildOracleChatPromptContext({
      userId,
      roomId: payload.roomId,
      domain,
      content: payload.content,
      userContext: payload.userContext,
    });
    const tier = promptContext.mode === 'council_briefing' ? 'premium' : 'free';
    const providerResponse = await generateStreamingCompletion(
      promptContext.systemPrompt,
      payload.content,
      tier
    );

    if (!providerResponse.ok || !providerResponse.body) {
      throw new Error('스트리밍을 시작할 수 없습니다.');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let responseText = '';
    let sseBuffer = '';

    const stream = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        sseBuffer += decoder.decode(chunk, { stream: true });
        const lines = sseBuffer.split(/\r?\n/);
        sseBuffer = lines.pop() ?? '';

        for (const line of lines) {
          const delta = parseGeminiSseLine(line);
          if (!delta) {
            continue;
          }

          responseText += delta;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ delta, done: false })}\n\n`)
          );
        }
      },
      async flush(controller) {
        if (sseBuffer.trim()) {
          const delta = parseGeminiSseLine(sseBuffer);
          if (delta) {
            responseText += delta;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ delta, done: false })}\n\n`)
            );
          }
        }

        let finalText = responseText.trim();
        if (!finalText && promptContext.mode === 'council_briefing') {
          finalText = `### 📜 사주 분석결과\n위 데이터를 바탕으로 검토하고 있습니다.\n\n### ⚖️ 타로 리딩\n위 카드의 흐름을 참조하세요.\n\n### 🌠 현재 행성 흐름\n현재 별자리의 흐름을 짚어보고 있습니다.\n\n### 🔮 수석 오라클의 최종 결론\n오라클 위원회의 답변을 생성하는 중에 연결이 고르지 못했습니다. 번거로우시더라도 같은 흐름으로 질문을 한 번 더 던져주세요.`;
        } else if (!finalText) {
          finalText = '지금은 답을 또렷하게 만들 재료가 부족합니다. 질문을 한 문장 더 구체적으로 알려주세요.';
        }
        const councilData = applyFinalVerdict(promptContext.councilData, finalText);
        const saved = await saveOracleChatExchange({
          userId,
          roomId: payload.roomId,
          domain,
          content: payload.content,
          responseText: finalText,
          mode: promptContext.mode,
          councilData,
        });

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              delta: '',
              done: true,
              messageId: saved.messageId,
              mode: promptContext.mode,
            })}\n\n`
          )
        );
      },
    });

    return new Response(providerResponse.body.pipeThrough(stream), {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    if (error instanceof OracleChatRouteError) {
      if (error.status === 402) {
        return errorResponse(402, error.message, error.code);
      }
      return errorResponse(error.status, error.message, error.code);
    }

    if (error instanceof z.ZodError) {
      return errorResponse(400, '유효하지 않은 입력입니다.', error.message);
    }

    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OracleChat Message Error]', error);
    return errorResponse(500, '서버 오류가 발생했습니다.', details);
  }
}
