import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  OracleChatRouteError,
  getOracleChatHistoryForUser,
  getOracleChatLimit,
  getOracleChatRoomForUser,
} from '@/lib/oracle-chat';

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

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return errorResponse(401, '로그인이 필요합니다.');
  }

  try {
    const roomId = request.nextUrl.searchParams.get('roomId');
    if (roomId) {
      const room = await getOracleChatRoomForUser(userId, roomId);
      if (!room) {
        throw new OracleChatRouteError(404, 'ROOM_NOT_FOUND', '대화방을 찾을 수 없습니다.');
      }
    }

    const payload = await getOracleChatHistoryForUser({
      userId,
      roomId,
      cursor: request.nextUrl.searchParams.get('cursor'),
      limit: getOracleChatLimit(request.nextUrl.searchParams.get('limit')),
    });

    return NextResponse.json(payload);
  } catch (error: unknown) {
    if (error instanceof OracleChatRouteError) {
      return errorResponse(error.status, error.message, error.code);
    }

    const details = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OracleChat History Error]', error);
    return errorResponse(500, '서버 오류가 발생했습니다.', details);
  }
}
