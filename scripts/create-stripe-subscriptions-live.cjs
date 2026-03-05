/**
 * Stripe 구독 상품 및 가격 생성 (Live/Test 모드 지원)
 * 
 * 사용법:
 *   node scripts/create-stripe-subscriptions-live.cjs <STRIPE_LIVE_SECRET_KEY>
 */

const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

const liveKey = process.argv[2];

if (!liveKey || !liveKey.startsWith('sk_live_')) {
    console.error('❌ Usage: node scripts/create-stripe-subscriptions-live.cjs sk_live_...');
    console.error('   Stripe Live Secret Key를 인자로 넘겨주세요.');
    process.exit(1);
}

const stripe = new Stripe(liveKey, { apiVersion: '2024-12-18.acacia' });

const PLANS = [
    {
        envKey: 'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY',
        productName: 'CosmicPath Pro (Monthly)',
        productDescription: '무제한 Oracle Chat + Daily Fortune + 프리미엄 인사이트',
        unitAmount: 9900,
        currency: 'krw',
        interval: 'month',
    },
    {
        envKey: 'NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY',
        productName: 'CosmicPath Pro (Annual)',
        productDescription: '연간 구독 - 40% 이상 절약! 무제한 Oracle Chat + Daily Fortune',
        unitAmount: 69000,
        currency: 'krw',
        interval: 'year',
    },
    {
        envKey: 'NEXT_PUBLIC_STRIPE_PRICE_COUPLE_MONTHLY',
        productName: 'CosmicPath Couple Plan',
        productDescription: '커플 전용 실시간 궁합 모니터링 + Pro 기능 전체 포함',
        unitAmount: 14900,
        currency: 'krw',
        interval: 'month',
    },
];

async function main() {
    console.log('🚀 Stripe LIVE 모드 구독 상품 생성 시작...\n');

    const envPath = path.join(__dirname, '..', '.env');

    for (const plan of PLANS) {
        console.log(`📦 Creating product: ${plan.productName}`);

        const product = await stripe.products.create({
            name: plan.productName,
            description: plan.productDescription,
            metadata: { app: 'cosmicpath', type: 'subscription' },
        });
        console.log(`   ✅ Product created: ${product.id}`);

        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.unitAmount,
            currency: plan.currency,
            recurring: { interval: plan.interval },
            metadata: { app: 'cosmicpath' },
        });
        console.log(`   ✅ Price created: ${price.id} (${plan.unitAmount.toLocaleString()} ${plan.currency.toUpperCase()}/${plan.interval})\n`);

        // .env 업데이트 (기존 값 덮어쓰기 또는 추가)
        let envContent = fs.readFileSync(envPath, 'utf-8');
        const regex = new RegExp(`^${plan.envKey}=.*$`, 'm');
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${plan.envKey}=${price.id}`);
        } else {
            envContent += `\n${plan.envKey}=${price.id}`;
        }
        fs.writeFileSync(envPath, envContent, 'utf-8');
    }

    console.log('🎉 Live 모드 상품 생성 완료! .env가 업데이트되었습니다.');
}

main().catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
