import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { data, metadata } = body;

        if (!data) {
            return NextResponse.json(
                { error: 'Missing data' },
                { status: 400 }
            );
        }

        const result = await prisma.readingResult.create({
            data: {
                data: JSON.stringify(data),
                metadata: metadata ? JSON.stringify(metadata) : null,
            },
        });

        return NextResponse.json({ id: result.id, success: true });
    } catch (error: any) {
        console.error('Failed to save reading:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            meta: error.meta
        });

        return NextResponse.json(
            {
                error: 'Database Save Failed',
                details: error.message
            },
            { status: 500 }
        );
    }
}
