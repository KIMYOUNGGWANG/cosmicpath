import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

function readProjectFile(path: string): string {
  return readFileSync(path, 'utf8');
}

function verifyCheckoutAttributionWiring(): void {
  const checkout = readProjectFile('src/components/payment/use-reading-checkout.ts');
  assert.ok(
    checkout.includes('getGrowthAttribution'),
    'use-reading-checkout.ts must import and use getGrowthAttribution'
  );
  assert.ok(
    checkout.includes('postId: resolvedPostId'),
    'use-reading-checkout.ts must pass resolvedPostId to /api/payment'
  );
  console.log('✓ use-reading-checkout attribution wiring passed');
}

function verifyPaymentRouteMetadataWiring(): void {
  const paymentRoute = readProjectFile('src/app/api/payment/route.ts');
  assert.ok(
    paymentRoute.includes('postId') && paymentRoute.includes('normalizedPostId'),
    'src/app/api/payment/route.ts must extract and normalize postId'
  );
  assert.ok(
    paymentRoute.includes('postId: normalizedPostId'),
    'src/app/api/payment/route.ts must include postId in Stripe checkout session metadata'
  );

  const chatCreditRoute = readProjectFile('src/app/api/payment/chat-credit/route.ts');
  assert.ok(
    chatCreditRoute.includes('postId: normalizedPostId'),
    'chat-credit/route.ts must include postId in session metadata'
  );
  console.log('✓ payment route metadata wiring passed');
}

function verifyStripeWebhookRelayWiring(): void {
  const stripeSession = readProjectFile('src/lib/payment/stripe-checkout-session.ts');
  assert.ok(
    stripeSession.includes('trackGrowthEvent'),
    'stripe-checkout-session.ts must import trackGrowthEvent'
  );
  assert.ok(
    stripeSession.includes('relayPaidConversionEvent'),
    'stripe-checkout-session.ts must define relayPaidConversionEvent'
  );
  assert.ok(
    stripeSession.includes("event: 'paid_conversion'"),
    "stripe-checkout-session.ts must trigger 'paid_conversion' event"
  );
  assert.ok(
    stripeSession.includes('await relayPaidConversionEvent({ session });'),
    'handleCheckoutSessionCompleted must invoke relayPaidConversionEvent'
  );
  console.log('✓ stripe webhook relay wiring passed');
}

function verifyMarketingWebhookRelayConfig(): void {
  const growthEvents = readProjectFile('src/lib/growth-events.ts');
  assert.ok(
    growthEvents.includes('relayToMarketingWebhook'),
    'growth-events.ts must define relayToMarketingWebhook'
  );
  assert.ok(
    growthEvents.includes('THREADS_UPLOADER_WEBHOOK_URL'),
    'growth-events.ts must check THREADS_UPLOADER_WEBHOOK_URL'
  );
  assert.ok(
    growthEvents.includes('THREADS_UPLOADER_SECRET') || growthEvents.includes('CONVERSION_WEBHOOK_SECRET'),
    'growth-events.ts must authenticate with THREADS_UPLOADER_SECRET or CONVERSION_WEBHOOK_SECRET'
  );
  assert.ok(
    growthEvents.includes('/api/webhooks/conversion'),
    'growth-events.ts must target /api/webhooks/conversion endpoint'
  );

  const envExample = readProjectFile('.env.example');
  assert.ok(
    envExample.includes('THREADS_UPLOADER_WEBHOOK_URL'),
    '.env.example must document THREADS_UPLOADER_WEBHOOK_URL'
  );
  assert.ok(
    envExample.includes('THREADS_UPLOADER_SECRET'),
    '.env.example must document THREADS_UPLOADER_SECRET'
  );
  console.log('✓ marketing webhook relay configuration passed');
}

function main(): void {
  console.log('--- Verifying Threads Growth Conversion Relay Contract ---');
  verifyCheckoutAttributionWiring();
  verifyPaymentRouteMetadataWiring();
  verifyStripeWebhookRelayWiring();
  verifyMarketingWebhookRelayConfig();
  console.log('--- ALL THREADS CONVERSION RELAY CHECKS PASSED ---');
}

main();
