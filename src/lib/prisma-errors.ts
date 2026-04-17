import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const DATABASE_CONNECTIVITY_MARKERS = [
    "Can't reach database server",
    'P1001',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
] as const;

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return String(error);
}

export function isDatabaseConnectivityError(error: unknown): boolean {
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return true;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1001') {
        return true;
    }

    const message = getErrorMessage(error);
    return DATABASE_CONNECTIVITY_MARKERS.some((marker) => message.includes(marker));
}

export async function isDatabaseReachable(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        if (isDatabaseConnectivityError(error)) {
            return false;
        }

        throw error;
    }
}
