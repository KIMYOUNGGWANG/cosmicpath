import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isSubscriptionActive } from '@/lib/subscription';

export class OracleAccessError extends Error {
    status: number;
    code: string;

    constructor(status: number, code: string, message: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

export interface AuthorizedOracleContext {
    userId: string;
    reading: {
        id: string;
        data: string;
        metadata: string | null;
        userId: string | null;
    };
    isUnlimited: boolean;
}

export async function authorizeOracleAccess(readingId: string): Promise<AuthorizedOracleContext> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        throw new OracleAccessError(401, 'UNAUTHORIZED', 'Unauthorized');
    }

    let reading = await prisma.readingResult.findUnique({
        where: { id: readingId },
        select: {
            id: true,
            data: true,
            metadata: true,
            userId: true,
        },
    });

    if (!reading) {
        throw new OracleAccessError(404, 'READING_NOT_FOUND', 'Reading not found');
    }

    if (!reading.userId) {
        const claimResult = await prisma.readingResult.updateMany({
            where: {
                id: readingId,
                userId: null,
            },
            data: { userId },
        });

        if (claimResult.count === 0) {
            const refreshedReading = await prisma.readingResult.findUnique({
                where: { id: readingId },
                select: {
                    id: true,
                    data: true,
                    metadata: true,
                    userId: true,
                },
            });

            if (!refreshedReading) {
                throw new OracleAccessError(404, 'READING_NOT_FOUND', 'Reading not found');
            }
            reading = refreshedReading;
        } else {
            reading = { ...reading, userId };
        }
    }

    if (reading.userId !== userId) {
        throw new OracleAccessError(403, 'FORBIDDEN', 'You do not have access to this reading');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionStatus: true,
            subscriptionExpiresAt: true,
        },
    });

    if (!user) {
        throw new OracleAccessError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const isUnlimited = isSubscriptionActive(
        user.subscriptionStatus,
        user.subscriptionExpiresAt
    );

    return {
        userId,
        reading,
        isUnlimited,
    };
}
