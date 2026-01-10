const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const reviews = [
    {
        nickname: '김**',
        rating: 5,
        content: '소름끼치게 잘 맞아서 놀랐습니다. 특히 직장운이 너무 정확해서 앞으로의 계획을 세우는데 큰 도움이 되었습니다.',
        isApproved: true,
        isPromoUser: false
    },
    {
        nickname: 'Sarah J.',
        rating: 5,
        content: 'Astrology and Saju combined gave me a new perspective on my career path. Truly insightful analysis.',
        isApproved: true,
        isPromoUser: false
    },
    {
        nickname: '박*수',
        rating: 4,
        content: '처음엔 반신반의했는데, 과거 맞추는 거 보고 소름 돋았습니다. 올해 조심해야 할 부분 명심하겠습니다.',
        isApproved: true,
        isPromoUser: true
    },
    {
        nickname: 'CosmicLover',
        rating: 5,
        content: 'Worth every penny. The detailed analysis was much deeper than I expected. Highly recommended!',
        isApproved: true,
        isPromoUser: false
    },
    {
        nickname: '이*진',
        rating: 5,
        content: '친구 추천으로 해봤는데 정말 신기하네요. 특히 연애운 관련해서 조언해 주신 부분이 마음에 와닿았습니다.',
        isApproved: true,
        isPromoUser: false
    },
    {
        nickname: 'Michael K.',
        rating: 4,
        content: 'Very detailed report. I liked how it combines eastern and western philosophy. Good UI too.',
        isApproved: true,
        isPromoUser: false
    }
];

async function main() {
    console.log('🌱 Seeding reviews...');

    // 기존 리뷰 삭제 (선택 사항 - 여기서는 유지)
    // await prisma.review.deleteMany({});

    for (const review of reviews) {
        await prisma.review.create({
            data: review
        });
    }

    console.log(`✅ Created ${reviews.length} reviews`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
