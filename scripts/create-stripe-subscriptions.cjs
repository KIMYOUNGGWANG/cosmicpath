/**
 * Stripe 구독 상품 및 가격 자동 생성 스크립트
 * 
 * 실행: node scripts/create-stripe-subscriptions.cjs
 */

const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

// .env.local에서 Secret Key 읽기
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envLocalContent = fs.readFileSync(envLocalPath, 'utf-8');
const secretKeyMatch = envLocalContent.match(/STRIPE_SECRET_KEY=(.+)/);

if (!secretKeyMatch) {
    console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
    process.exit(1);
}

const stripe = new Stripe(secretKeyMatch[1].trim(), { apiVersion: '2024-12-18.acacia' });

const PLANS = [
    {
        envKey: 'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY',
        productName: 'CosmicPath Pro (Monthly)',
        productDescription: '무제한 Oracle Chat + Daily Fortune + 프리미엄 인사이트',
        unitAmount: 9900, // ₩9,900
        currency: 'krw',
        interval: 'month',
    },
    {
        envKey: 'NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY',
        productName: 'CosmicPath Pro (Annual)',
        productDescription: '연간 구독 - 40% 이상 절약! 무제한 Oracle Chat + Daily Fortune',
        unitAmount: 69000, // ₩69,000
        currency: 'krw',
        interval: 'year',
    },
    {
        envKey: 'NEXT_PUBLIC_STRIPE_PRICE_COUPLE_MONTHLY',
        productName: 'CosmicPath Couple Plan',
        productDescription: '커플 전용 실시간 궁합 모니터링 + Pro 기능 전체 포함',
        unitAmount: 14900, // ₩14,900
        currency: 'krw',
        interval: 'month',
    },
];

async function main() {
    console.log('🚀 Stripe 구독 상품 생성 시작...\n');

    const envLines = [];

    for (const plan of PLANS) {
        console.log(`📦 Creating product: ${plan.productName}`);

        // 1. Product 생성
        const product = await stripe.products.create({
            name: plan.productName,
            description: plan.productDescription,
            metadata: {
                app: 'cosmicpath',
                type: 'subscription',
            },
        });
        console.log(`   ✅ Product created: ${product.id}`);

        // 2. Price 생성 (recurring)
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.unitAmount,
            currency: plan.currency,
            recurring: {
                interval: plan.interval,
            },
            metadata: {
                app: 'cosmicpath',
            },
        });
        console.log(`   ✅ Price created: ${price.id} (${plan.unitAmount.toLocaleString()} ${plan.currency.toUpperCase()}/${plan.interval})`);

        envLines.push(`${plan.envKey}=${price.id}`);
        console.log('');
    }

    // 3. .env에 추가
    const envPath = path.join(__dirname, '..', '.env');
    const existingEnv = fs.readFileSync(envPath, 'utf-8');

    const newEntries = [];
    for (const line of envLines) {
        const key = line.split('=')[0];
        if (!existingEnv.includes(key)) {
            newEntries.push(line);
        } else {
            // 기존 값을 업데이트
            const regex = new RegExp(`^${key}=.*$`, 'm');
            const updatedEnv = existingEnv.replace(regex, line);
            fs.writeFileSync(envPath, updatedEnv, 'utf-8');
            console.log(`🔄 Updated ${key} in .env`);
        }
    }

    if (newEntries.length > 0) {
        const appendContent = '\n# Subscription Price IDs (Auto-generated)\n' + newEntries.join('\n') + '\n';
        fs.appendFileSync(envPath, appendContent, 'utf-8');
        console.log(`\n✅ Added ${newEntries.length} new env vars to .env`);
    }

    console.log('\n🎉 완료! 생성된 Price IDs:');
    for (const line of envLines) {
        console.log(`   ${line}`);
    }

    console.log('\n📝 .env 파일이 업데이트되었습니다. 서버를 재시작하세요.');
}

main().catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
