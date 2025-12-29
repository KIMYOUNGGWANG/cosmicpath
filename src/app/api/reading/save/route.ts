import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        // DB 연결 상태 확인
        if (!process.env.DATABASE_URL) {
            console.error('Save API: DATABASE_URL is missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const body = await request.json().catch(() => null);

        if (!body) {
            console.error('Save API: Empty or invalid JSON body');
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const { data, metadata } = body;

        if (!data) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        let dataStr: string;
        let metaStr: string | null = null;

        try {
            dataStr = typeof data === 'string' ? data : JSON.stringify(data);
            metaStr = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;
        } catch (stringifyError: any) {
            console.error('Save API: JSON stringify failed:', stringifyError);
            return NextResponse.json({
                error: 'JSON Serialization Failed',
                details: stringifyError.message
            }, { status: 400 });
        }

        console.log('Save API: Saving to database...', {
            dataLength: dataStr.length,
            hasMetadata: !!metaStr
        });

        const result = await prisma.readingResult.create({
            data: {
                data: dataStr,
                metadata: metaStr,
            },
        });

        console.log('Save API: Success!', result.id);
        return NextResponse.json({ id: result.id, success: true });
    } catch (error: any) {
        console.error('Save API: Database error:', error);

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

export async function GET() {
    try {
        const count = await prisma.readingResult.count();
        return NextResponse.json({ status: 'ok', count });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
