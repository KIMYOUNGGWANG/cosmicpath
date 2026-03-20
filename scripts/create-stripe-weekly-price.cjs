/**
 * CosmicPath 주간 구독 Price 생성 스크립트
 *
 * 사용법:
 *   node scripts/create-stripe-weekly-price.cjs test
 *   node scripts/create-stripe-weekly-price.cjs live sk_live_...
 */

const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
const liveKeyArg = process.argv[3];

const FILES = {
    test: path.join(__dirname, '..', '.env.local'),
    live: path.join(__dirname, '..', '.env'),
};

const ENV_KEYS = {
    test: {
        secret: 'STRIPE_SECRET_KEY',
        price: 'NEXT_PUBLIC_STRIPE_PRICE_PRO_WEEKLY_TEST',
    },
    live: {
        price: 'NEXT_PUBLIC_STRIPE_PRICE_PRO_WEEKLY',
    },
};

function fail(message) {
    console.error(`❌ ${message}`);
    process.exit(1);
}

function readFile(filepath) {
    if (!fs.existsSync(filepath)) {
        fail(`${path.basename(filepath)} not found`);
    }
    return fs.readFileSync(filepath, 'utf-8');
}

function readEnvValue(content, key) {
    const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

function upsertEnvValue(filepath, key, value) {
    let content = readFile(filepath);
    const line = `${key}=${value}`;
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (regex.test(content)) {
        content = content.replace(regex, line);
    } else {
        content += `\n${line}\n`;
    }

    fs.writeFileSync(filepath, content, 'utf-8');
}

function getStripeSecretKey() {
    if (mode === 'test') {
        const envLocalContent = readFile(FILES.test);
        const secretKey = readEnvValue(envLocalContent, ENV_KEYS.test.secret);
        if (!secretKey || !secretKey.startsWith('sk_test_')) {
            fail('Valid sk_test_ key not found in .env.local');
        }
        return secretKey;
    }

    if (mode === 'live') {
        if (!liveKeyArg || !liveKeyArg.startsWith('sk_live_')) {
            fail('Usage: node scripts/create-stripe-weekly-price.cjs live sk_live_...');
        }
        return liveKeyArg;
    }

    fail('Usage: node scripts/create-stripe-weekly-price.cjs <test|live> [sk_live_...]');
}

async function main() {
    const stripe = new Stripe(getStripeSecretKey(), { apiVersion: '2024-12-18.acacia' });
    const envFile = FILES[mode];
    const priceEnvKey = ENV_KEYS[mode].price;

    console.log(`🚀 Creating CosmicPath weekly subscription price (${mode})...`);

    const product = await stripe.products.create({
        name: 'CosmicPath Pro (Weekly)',
        description: '주간 스타터 구독 - 가장 낮은 진입 가격으로 7일 동안 무제한 Oracle Chat과 Daily Tarot premium advice 제공',
        metadata: {
            app: 'cosmicpath',
            type: 'subscription',
            plan: 'pro_weekly',
            mode,
        },
    });

    console.log(`✅ Product created: ${product.id}`);

    const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 399,
        currency: 'usd',
        recurring: {
            interval: 'week',
        },
        metadata: {
            app: 'cosmicpath',
            plan: 'pro_weekly',
            mode,
        },
    });

    console.log(`✅ Price created: ${price.id} ($3.99/week)`);

    upsertEnvValue(envFile, priceEnvKey, price.id);
    console.log(`✅ Updated ${path.basename(envFile)} with ${priceEnvKey}`);
}

main().catch((error) => {
    fail(error.message);
});
