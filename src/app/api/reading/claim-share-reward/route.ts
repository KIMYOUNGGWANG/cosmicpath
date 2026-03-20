import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';
import { trackGrowthEvent } from '@/lib/growth-events';
import { z } from 'zod';
import { grantCreditsToReadingSession } from '@/lib/chat-session-rewards';

const ClaimRewardSchema = z.object({
    readingId: z.string().min(1, 'Reading ID is required'),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { readingId } = ClaimRewardSchema.parse(body);

        devLog.log(`[Reward API] Processing claim for readingId: ${readingId}`);
        const reading = await prisma.readingResult.findUnique({
            where: { id: readingId },
            select: { id: true },
        });

        if (!reading) {
            return NextResponse.json({ success: false, message: 'Reading not found' }, { status: 404 });
        }

        const result = await prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${readingId})::bigint)`;

            const session = await tx.chatSession.findUnique({
                where: { readingResultId: readingId },
                select: { id: true, credits: true, shareRewardClaimed: true },
            });

            if (!session) {
                const created = await grantCreditsToReadingSession(tx, readingId, 1, {
                    markShareRewardClaimed: true,
                });

                return {
                    success: true,
                    credits: created.credits,
                    message: 'Reward claimed',
                    alreadyClaimed: false,
                };
            }

            if (session.shareRewardClaimed) {
                return {
                    success: false,
                    credits: session.credits,
                    message: 'Reward already claimed',
                    alreadyClaimed: true,
                };
            }

            const updatedSession = await grantCreditsToReadingSession(tx, readingId, 1, {
                markShareRewardClaimed: true,
            });

            return {
                success: true,
                credits: updatedSession.credits,
                message: 'Reward claimed successfully',
                alreadyClaimed: false,
            };
        });

        if (result.success) {
            await trackGrowthEvent({
                event: 'share_reward_claimed',
                readingId,
                channel: 'claim_share_reward_api',
            });
        }

        return NextResponse.json(result);

    } catch (error) {
        devLog.error('Failed to claim share reward:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
