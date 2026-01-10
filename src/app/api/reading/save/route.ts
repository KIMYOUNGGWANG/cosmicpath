import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';
import { sendResultEmail } from '@/lib/email/sender';

export async function POST(request: Request) {
    try {
        // DB 연결 상태 확인
        if (!process.env.DATABASE_URL) {
            devLog.error('Save API: DATABASE_URL is missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const body = await request.json().catch(() => null);

        if (!body) {
            devLog.error('Save API: Empty or invalid JSON body');
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const { data, metadata, id } = body;

        if (!data) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        let dataStr: string;
        let metaStr: string | null = null;

        try {
            dataStr = typeof data === 'string' ? data : JSON.stringify(data);
            metaStr = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;
        } catch (stringifyError: any) {
            devLog.error('Save API: JSON stringify failed:', stringifyError);
            return NextResponse.json({
                error: 'JSON Serialization Failed',
                details: stringifyError.message
            }, { status: 400 });
        }

        devLog.log('Save API: Saving to database...', {
            dataLength: dataStr.length,
            hasMetadata: !!metaStr
        });

        const result = id
            ? await prisma.readingResult.update({
                where: { id },
                data: {
                    data: dataStr,
                    metadata: metaStr,
                },
            })
            : await prisma.readingResult.create({
                data: {
                    data: dataStr,
                    metadata: metaStr,
                },
            });

        devLog.log('Save API: Success!', result.id);

        // [New] 서버사이드 이메일 발송 트리거
        // 프리미엄 리딩이고, 이메일이 있으며, 아직 발송되지 않은 경우
        const savedMeta = result.metadata ? JSON.parse(result.metadata) : {};
        if (savedMeta.isPremium && savedMeta.email && !savedMeta.emailSent) {
            devLog.log('Save API: Triggering server-side email for', savedMeta.email);

            // 직접 함수 호출 (HTTP 요청 오버헤드 및 URL 문제 제거)
            try {
                await sendResultEmail({
                    email: savedMeta.email,
                    resultId: result.id,
                    title: savedMeta.userContext || '통합 분석 리포트',
                    birthInfo: savedMeta.birthInfo,
                    sajuSummary: savedMeta.sajuSummary,
                    userContext: savedMeta.userContext
                });

                // 이메일 발송 완료 플래그 업데이트
                await prisma.readingResult.update({
                    where: { id: result.id },
                    data: {
                        metadata: JSON.stringify({ ...savedMeta, emailSent: true })
                    }
                });

                devLog.log('Save API: Email trigger success');
            } catch (emailError: any) {
                devLog.error('Save API: Email trigger failed:', emailError);
                // 이메일 실패해도 저장은 성공으로 리턴
            }
        }

        return NextResponse.json({ id: result.id, success: true });
    } catch (error: any) {
        devLog.error('Save API: Database error:', error);

        // Prisma 에러인 경우 더 구체적인 정보 전달
        return NextResponse.json(
            {
                error: 'Database Operation Failed',
                details: error.message,
                code: error.code,
                meta: error.meta
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const result = await prisma.readingResult.findUnique({
                where: { id },
            });

            if (!result) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                id: result.id,
                data: JSON.parse(result.data),
                metadata: result.metadata ? JSON.parse(result.metadata) : null,
                createdAt: result.createdAt,
            });
        }

        const count = await prisma.readingResult.count();
        return NextResponse.json({ status: 'ok', count });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
