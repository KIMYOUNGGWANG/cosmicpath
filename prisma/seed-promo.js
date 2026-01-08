const { PrismaClient } = require('@prisma/client');

// Use direct URL to avoid connection pooler issues
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL
        }
    }
});

async function main() {
    const code = 'BETA2026';

    try {
        const existing = await prisma.promotionCode.findUnique({
            where: { code }
        });

        if (existing) {
            console.log(`Promo code ${code} already exists.`);
            return;
        }

        await prisma.promotionCode.create({
            data: {
                code,
                description: 'Limited Beta Tester Access',
                discount: 100,
                maxUses: 50,
                expiresAt: new Date('2026-02-28T23:59:59Z'),
                isActive: true
            }
        });

        console.log(`✅ Created promo code: ${code}`);
    } catch (e) {
        console.error('Error seeding promo code:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
