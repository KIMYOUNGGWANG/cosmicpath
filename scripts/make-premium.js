const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Finding latest reading...');

    const reading = await prisma.readingResult.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!reading) {
        console.log('❌ No readings found.');
        return;
    }

    console.log(`✅ Found reading: ${reading.id} (${reading.createdAt})`);

    let metadata = {};
    if (reading.metadata) {
        if (typeof reading.metadata === 'string') {
            metadata = JSON.parse(reading.metadata);
        } else {
            metadata = reading.metadata;
        }
    }

    // Set Premium
    metadata.isPremium = true;
    metadata.emailSent = true; // Optional: Treat as if email also sent

    await prisma.readingResult.update({
        where: { id: reading.id },
        data: {
            metadata: JSON.stringify(metadata) // Correctly serialized
        }
    });

    console.log('✨ Successfully upgraded reading to PREMIUM!');
    console.log('👉 You can now refresh the page and continue.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
