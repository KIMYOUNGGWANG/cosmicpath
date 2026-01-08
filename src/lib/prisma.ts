import { PrismaClient } from '@prisma/client';
import { devLog } from './dev-logger';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

devLog.log('Initializing Prisma Client...');

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
