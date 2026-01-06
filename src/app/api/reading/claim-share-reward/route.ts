import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';

export async function POST(req: NextRequest) {
    try {
        const { readingId } = await req.json();

        if (!readingId) {
            devLog.log('[Reward API] Error: Missing readingId');
            return NextResponse.json({ error: 'Reading ID is required' }, { status: 400 });
        }

        devLog.log(`[Reward API] Processing claim for readingId: ${readingId}`);

        // Find the chat session
        const session = await prisma.chatSession.findUnique({
            where: { readingResultId: readingId }
        });

        // Create session if it doesn't exist (edge case)
        if (!session) {
            await prisma.chatSession.create({
                data: {
                    readingResultId: readingId,
                    credits: 2, // 1 default + 1 reward
                    shareRewardClaimed: true
                }
            });
            return NextResponse.json({ success: true, credits: 2, message: 'Reward claimed' });
        }

        // Check if reward already claimed
        if (session.shareRewardClaimed) {
            return NextResponse.json({ success: false, message: 'Reward already claimed' });
        }

        // Grant reward
        const updatedSession = await prisma.chatSession.update({
            where: { id: session.id },
            data: {
                credits: { increment: 1 },
                shareRewardClaimed: true
            }
        });

        return NextResponse.json({
            success: true,
            credits: updatedSession.credits,
            message: 'Reward claimed successfully'
        });

    } catch (error) {
        devLog.error('Failed to claim share reward:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

