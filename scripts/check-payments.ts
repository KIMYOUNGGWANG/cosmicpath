import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const email = 'rladudrhkd1095@gmail.com'
    console.log(`Checking payments for: ${email}`)
    const count = await prisma.payment.count({
        where: { customerEmail: email }
    })
    console.log(`Total payments found (all statuses): ${count}`)

    const doneCount = await prisma.payment.count({
        where: { customerEmail: email, status: 'DONE' }
    })
    console.log(`Total 'DONE' payments found: ${doneCount}`)

    if (count === 0) {
        console.log("No payments found. Are you connected to the production DB?")
        const entries = await prisma.payment.findMany({ take: 5 });
        console.log("Sample of 5 payments in DB:", entries);
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => { await prisma.$disconnect() })
