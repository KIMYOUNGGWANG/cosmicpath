import { Prisma } from '@prisma/client';

const DEFAULT_FREE_CHAT_CREDITS = 1;

interface RewardOptions {
    markShareRewardClaimed?: boolean;
}

interface RewardResult {
    chatSessionId: string;
    readingResultId: string;
    credits: number;
    creditsAdded: number;
    created: boolean;
}

export async function grantCreditsToReadingSession(
    transaction: Prisma.TransactionClient,
    readingResultId: string,
    creditsToAdd: number,
    options: RewardOptions = {}
): Promise<RewardResult> {
    const existingSession = await transaction.chatSession.findUnique({
        where: { readingResultId },
        select: { id: true, credits: true, shareRewardClaimed: true },
    });

    if (!existingSession) {
        const createdSession = await transaction.chatSession.create({
            data: {
                readingResultId,
                credits: DEFAULT_FREE_CHAT_CREDITS + creditsToAdd,
                shareRewardClaimed: options.markShareRewardClaimed ?? false,
            },
            select: { id: true, credits: true },
        });

        return {
            chatSessionId: createdSession.id,
            readingResultId,
            credits: createdSession.credits,
            creditsAdded: creditsToAdd,
            created: true,
        };
    }

    const updatedSession = await transaction.chatSession.update({
        where: { id: existingSession.id },
        data: {
            credits: { increment: creditsToAdd },
            ...(options.markShareRewardClaimed ? { shareRewardClaimed: true } : {}),
        },
        select: { id: true, credits: true },
    });

    return {
        chatSessionId: updatedSession.id,
        readingResultId,
        credits: updatedSession.credits,
        creditsAdded: creditsToAdd,
        created: false,
    };
}

export async function grantCreditsToLatestUserSession(
    transaction: Prisma.TransactionClient,
    userId: string,
    creditsToAdd: number
): Promise<RewardResult | null> {
    const latestReading = await transaction.readingResult.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
    });

    if (!latestReading) {
        return null;
    }

    return grantCreditsToReadingSession(transaction, latestReading.id, creditsToAdd);
}
