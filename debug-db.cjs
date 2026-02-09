// Debug script to check birth dates
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const session = await prisma.matchSession.findUnique({
        where: { id: '8d2ec6cf-1765-455c-bdf1-186a6838f387' },
    });
    console.log('Host Birth:', session.hostBirth);
    console.log('Host Birth (UTC string):', session.hostBirth.toUTCString());
    console.log('Host Birth (ISO string):', session.hostBirth.toISOString());
    console.log('Host Birth (Local string):', session.hostBirth.toString());

    console.log('Guest Birth:', session.guestBirth);
    console.log('Guest Birth (UTC string):', session.guestBirth.toUTCString());
    console.log('Guest Birth (ISO string):', session.guestBirth.toISOString());
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
