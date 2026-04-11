import { PrismaClient } from '@prisma/client';
import { devLog } from './dev-logger';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const shouldLogPrismaQueries =
    process.env.NODE_ENV === 'development' &&
    ['1', 'true', 'yes', 'on'].includes((process.env.PRISMA_QUERY_LOGS ?? '').toLowerCase());

if (shouldLogPrismaQueries) {
    devLog.log('Initializing Prisma Client...');
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: shouldLogPrismaQueries ? ['query'] : [],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
