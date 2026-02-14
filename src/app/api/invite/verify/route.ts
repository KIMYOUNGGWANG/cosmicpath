import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackGrowthEvent } from '@/lib/growth-events';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        // 1. Find reading by code
        const reading = await prisma.readingResult.findUnique({
            where: { invitationCode: code },
        });

        if (!reading) {
            return NextResponse.json({ isValid: false, error: 'Invalid code' }, { status: 404 });
        }

        // 2. Extract Host Name safely (from JSON data)
        // We assume 'data' contains { name: "..." } or similar structure 
        let hostName = 'Unknown';
        try {
            const parsedData = JSON.parse(reading.data);
            hostName = parsedData.personal?.name || parsedData.name || 'Friend';
        } catch (e) {
            console.error('Failed to parse reading data:', e);
        }

        // 3. Return minimal info (Security: NO birth data here)
        await trackGrowthEvent({
            event: 'invite_link_opened',
            readingId: reading.id,
            referralCode: code,
            channel: 'verify_api',
        });

        return NextResponse.json({
            isValid: true,
            hostName: hostName
        });

    } catch (error) {
        console.error('Failed to verify invite:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
