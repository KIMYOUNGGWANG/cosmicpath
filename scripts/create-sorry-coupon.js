// One-time script to create a compensation promo code
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const code = await prisma.promotionCode.create({
        data: {
            code: 'SORRY-1USE',
            description: '이메일 미수신 보상 쿠폰 (1회용)',
            discount: 100,
            maxUses: 1,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
            isActive: true
        }
    });

    console.log('✅ 쿠폰 생성 완료:', code);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
