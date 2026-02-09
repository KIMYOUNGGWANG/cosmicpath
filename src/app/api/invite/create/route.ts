import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
    try {
        const { readingId } = await req.json();

        if (!readingId) {
            return NextResponse.json({ error: 'Reading ID is required' }, { status: 400 });
        }

        // 1. Check if reading exists
        const reading = await prisma.readingResult.findUnique({
            where: { id: readingId },
        });

        if (!reading) {
            return NextResponse.json({ error: 'Reading not found' }, { status: 404 });
        }

        // 2. Return existing code or generate new one
        if (reading.invitationCode) {
            return NextResponse.json({ code: reading.invitationCode });
        }

        const code = nanoid(8); // Short 8-char code

        await prisma.readingResult.update({
            where: { id: readingId },
            data: { invitationCode: code }
        });

        return NextResponse.json({ code });

    } catch (error) {
        console.error('Failed to create invite:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
