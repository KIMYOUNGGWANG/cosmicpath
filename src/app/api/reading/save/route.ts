import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
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
        let parsedMeta: any = {};

        try {
            dataStr = typeof data === 'string' ? data : JSON.stringify(data);
            metaStr = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;
            if (metaStr) {
                parsedMeta = JSON.parse(metaStr);
            }
        } catch (stringifyError: any) {
            devLog.error('Save API: JSON stringify/parse failed:', stringifyError);
            return NextResponse.json({
                error: 'JSON Serialization Failed',
                details: stringifyError.message
            }, { status: 400 });
        }

        // [New] 세션 확인 및 userId 연결
        const session = await auth();
        const userId = session?.user?.id;

        devLog.log('Save API: Saving to database...', {
            dataLength: dataStr.length,
            hasMetadata: !!metaStr,
            userId: userId || 'anonymous'
        });

        // Career Oracle: Check context and premium status
        const isCareer = parsedMeta.context === 'career' || (typeof data === 'object' && data.context === 'career');
        const isPremium = parsedMeta.isPremium || parsedMeta.paymentSource === 'promo';

        const result = id
            ? await prisma.readingResult.update({
                where: { id },
                data: {
                    data: dataStr,
                    metadata: metaStr,
                    ...(userId ? { userId } : {})
                },
            })
            : await prisma.readingResult.create({
                data: {
                    data: dataStr,
                    metadata: metaStr,
                    userId: userId,
                    // Career Oracle: Initialize proxy counters
                    ...(isCareer ? {
                        proxyReadingCount: 0,
                        maxProxyCount: isPremium ? 3 : 0 // Premium users get 3 proxy slots
                    } : {})
                },
            });

        devLog.log('Save API: Success!', result.id);

        // [New] 서버사이드 이메일 발송 트리거
        // 프리미엄 리딩이고, 이메일이 있으며, 아직 발송되지 않은 경우
        // [MODIFIED] 중복 발송 방지: 'promo' 유저인 경우에만 여기서 발송 (Stripe는 Webhook이 담당)
        if (parsedMeta.isPremium && parsedMeta.email && !parsedMeta.emailSent && parsedMeta.paymentSource === 'promo') {
            devLog.log('Save API: Triggering server-side email for', parsedMeta.email);

            // 직접 함수 호출 (HTTP 요청 오버헤드 및 URL 문제 제거)
            try {
                await sendResultEmail({
                    email: parsedMeta.email,
                    resultId: result.id,
                    title: parsedMeta.userContext || '통합 분석 리포트',
                    birthInfo: parsedMeta.birthInfo,
                    sajuSummary: parsedMeta.sajuSummary,
                    userContext: parsedMeta.userContext
                });

                // 이메일 발송 완료 플래그 업데이트
                await prisma.readingResult.update({
                    where: { id: result.id },
                    data: {
                        metadata: JSON.stringify({ ...parsedMeta, emailSent: true })
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
