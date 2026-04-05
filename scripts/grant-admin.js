#!/usr/bin/env node

const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const { PrismaClient } = require('@prisma/client');

function printUsage() {
    console.log(`
Usage:
  npm run grant:admin -- --email you@example.com
  npm run grant:admin -- --user-id clx123...

Options:
  --email <value>     Promote the matching user to ADMIN
  --user-id <value>   Promote the matching user to ADMIN
  --dry-run           Show the target user without updating
  --help              Show this message
`);
}

function parseArgs(argv) {
    const parsed = {
        email: undefined,
        userId: undefined,
        dryRun: false,
        help: false,
    };

    for (let index = 0; index < argv.length; index += 1) {
        const current = argv[index];

        if (current === '--help') {
            parsed.help = true;
            continue;
        }

        if (current === '--dry-run') {
            parsed.dryRun = true;
            continue;
        }

        if (current === '--email') {
            parsed.email = argv[index + 1];
            index += 1;
            continue;
        }

        if (current === '--user-id') {
            parsed.userId = argv[index + 1];
            index += 1;
            continue;
        }

        throw new Error(`Unknown argument: ${current}`);
    }

    return parsed;
}

function validateArgs(args) {
    if (args.help) {
        printUsage();
        process.exit(0);
    }

    if ((!args.email && !args.userId) || (args.email && args.userId)) {
        printUsage();
        throw new Error('Provide exactly one of --email or --user-id.');
    }

    if (args.email === '' || args.userId === '') {
        throw new Error('Target value cannot be empty.');
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    validateArgs(args);

    const prisma = new PrismaClient();

    try {
        const where = args.email
            ? { email: args.email }
            : { id: args.userId };

        const user = await prisma.user.findUnique({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            throw new Error('No matching user was found.');
        }

        console.log('Target user:');
        console.table([user]);

        if (user.role === 'ADMIN') {
            console.log('No change needed. This account is already ADMIN.');
            return;
        }

        if (args.dryRun) {
            console.log('Dry run complete. No database changes were made.');
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        console.log('Updated user:');
        console.table([updatedUser]);
        console.log('Session note: if this user is already signed in, sign out and sign back in to refresh the role.');
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error(`\n❌ ${error.message}`);
    process.exit(1);
});
