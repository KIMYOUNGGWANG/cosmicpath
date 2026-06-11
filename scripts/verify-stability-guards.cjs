const { runBrandPriceGuards } = require('./stability/brand-price-guards.cjs');
const { runEnglishSitemapGuards } = require('./stability/english-sitemap-guards.cjs');
const { runGrowthLegalGuards } = require('./stability/growth-legal-guards.cjs');
const { runPaymentCheckoutGuards } = require('./stability/payment-checkout-guards.cjs');
const { runReviewGrowthDataGuards } = require('./stability/review-growth-data-guards.cjs');
const { runSizeGuards } = require('./stability/size-guards.cjs');
const { runStartSafetyGuards } = require('./stability/start-safety-guards.cjs');

function run() {
  runSizeGuards();
  runStartSafetyGuards();
  runGrowthLegalGuards();
  runBrandPriceGuards();
  runEnglishSitemapGuards();
  runPaymentCheckoutGuards();
  runReviewGrowthDataGuards();
  console.log('verify:stability passed');
}

run();
