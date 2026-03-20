import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getGrowthSummary } from '@/lib/growth-metrics';

function errorResponse(code: number, message: string) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
            },
        },
        { status: code }
    );
}

export async function GET(request: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return errorResponse(401, '로그인이 필요합니다.');
    }

    if (session.user.role !== 'ADMIN') {
        return errorResponse(403, '관리자만 접근할 수 있습니다.');
    }

    const daysParam = request.nextUrl.searchParams.get('days');
    const days = daysParam ? Number.parseInt(daysParam, 10) : 30;

    const summary = await getGrowthSummary(Number.isNaN(days) ? 30 : days);

    return NextResponse.json(summary);
}
