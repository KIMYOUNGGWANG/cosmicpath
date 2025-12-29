import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing database write...');
        const result = await prisma.readingResult.create({
            data: {
                data: JSON.stringify({ test: "data" }),
                metadata: JSON.stringify({ test: "metadata" }),
            },
        });
        console.log('Success! Created record with ID:', result.id);
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
