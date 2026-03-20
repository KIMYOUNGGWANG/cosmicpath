const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

function loadEnvFile(filename) {
    const filePath = path.join(__dirname, '..', filename);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    for (const rawLine of content.split('\n')) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) continue;

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const baseUrl = process.argv[2] || 'http://localhost:3001';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: {
            email: {
                not: null,
            },
        },
        select: {
            id: true,
            email: true,
            name: true,
        },
        orderBy: {
            id: 'asc',
        },
    });

    if (!user) {
        throw new Error('No user with email found for session verification');
    }

    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.session.create({
        data: {
            sessionToken,
            userId: user.id,
            expires,
        },
    });

    try {
        const response = await fetch(`${baseUrl}/api/subscription/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `authjs.session-token=${sessionToken}`,
            },
            body: JSON.stringify({
                planType: 'WEEKLY',
            }),
        });

        const payload = await response.json().catch(() => null);
        console.log(JSON.stringify({
            baseUrl,
            user: {
                id: user.id,
                email: user.email,
            },
            status: response.status,
            ok: response.ok,
            payload,
        }, null, 2));

        if (!response.ok) {
            process.exitCode = 1;
        }
    } finally {
        await prisma.session.deleteMany({
            where: {
                sessionToken,
            },
        });
        await prisma.$disconnect();
    }
}

main().catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
