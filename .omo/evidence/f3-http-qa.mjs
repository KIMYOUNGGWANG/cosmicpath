import { writeFile } from 'node:fs/promises';

const baseUrl = 'http://localhost:3100';

async function capture(pathname, init) {
  const response = await fetch(`${baseUrl}${pathname}`, init);
  const text = await response.text();
  return {
    pathname,
    status: response.status,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries()),
    fullBody: text,
    body: text.slice(0, 4000),
  };
}

const price = await capture('/api/payment/price?productId=prod_next_move_report_live_TBD');
const terms = await capture('/terms', { headers: { 'accept-language': 'en-US,en;q=0.9' } });
const privacy = await capture('/privacy', { headers: { 'accept-language': 'en-US,en;q=0.9' } });
const sitemap = await capture('/sitemap.xml');

const legacyRoutes = [
  '/daily',
  '/daily/tarot',
  '/k-destiny',
  '/oracle-chat',
  '/en/saju',
  '/career/uncertainty',
];

const legacy = [];
for (const route of legacyRoutes) {
  const response = await fetch(`${baseUrl}${route}`, { method: 'HEAD', redirect: 'manual' });
  legacy.push({
    route,
    status: response.status,
    ok: response.status !== 404 && response.status < 500,
  });
}

const legalSummary = [
  `terms_has_next_move=${terms.fullBody.includes('Next Move Report')}`,
  `terms_has_usd9=${terms.fullBody.includes('USD 9 one-off digital report')}`,
  `terms_has_refund=${terms.fullBody.includes('refund request may be limited once the report is generated or opened')}`,
  `privacy_has_relationship_dm=${privacy.fullBody.includes('relationship/DM context')}`,
  `privacy_has_optional_birth=${privacy.fullBody.includes('optional birth data')}`,
  `privacy_has_sensitive_warning=${privacy.fullBody.includes('do not paste highly sensitive third-party secrets')}`,
].join('\n');

const sitemapSummary = [
  `sitemap_has_mvp=${sitemap.fullBody.includes('/relationship/contact-timing')}`,
  `sitemap_has_terms=${sitemap.fullBody.includes('/terms')}`,
  `sitemap_has_privacy=${sitemap.fullBody.includes('/privacy')}`,
  `sitemap_has_daily=${sitemap.fullBody.includes('/daily')}`,
  `sitemap_has_career=${sitemap.fullBody.includes('/career/uncertainty')}`,
].join('\n');

await writeFile(
  '.omo/evidence/f3-price-http.txt',
  [
    `GET /api/payment/price?productId=prod_next_move_report_live_TBD`,
    `status=${price.status}`,
    price.fullBody,
  ].join('\n'),
);

await writeFile(
  '.omo/evidence/task-10-terms-http.txt',
  [`GET /terms`, `status=${terms.status}`, legalSummary, terms.fullBody.slice(0, 8000)].join('\n\n'),
);

await writeFile(
  '.omo/evidence/task-10-privacy-http.txt',
  [`GET /privacy`, `status=${privacy.status}`, legalSummary, privacy.fullBody.slice(0, 8000)].join('\n\n'),
);

await writeFile(
  '.omo/evidence/task-11-sitemap.txt',
  [`GET /sitemap.xml`, `status=${sitemap.status}`, sitemapSummary, sitemap.fullBody].join('\n\n'),
);

await writeFile(
  '.omo/evidence/criterion-C002-edge-http.txt',
  [
    `price_status=${price.status}`,
    `price_body_has_9=${price.fullBody.includes('$9.00') || price.fullBody.includes('"amount":9')}`,
    `empty_question_screenshot=.omo/evidence/criterion-C002-empty-question.png`,
  ].join('\n'),
);

await writeFile(
  '.omo/evidence/criterion-C003-regression-http.txt',
  legacy.map((entry) => `${entry.route} status=${entry.status} ok=${entry.ok}`).join('\n'),
);

await writeFile(
  '.omo/evidence/criterion-C003-legal.txt',
  [legalSummary, sitemapSummary].join('\n'),
);

await writeFile(
  '.omo/evidence/criterion-C003-growth.txt',
  [
    'Growth row evidence:',
    '- .omo/evidence/task-9-ops-growth-source-proof.txt',
    '- .omo/evidence/f3-ops-growth.png shows ADMIN access containment without exposing raw question text to unauthenticated users',
  ].join('\n'),
);

const failedLegacy = legacy.filter((entry) => !entry.ok);
if (!price.ok || !terms.ok || !privacy.ok || !sitemap.ok || failedLegacy.length > 0) {
  throw new Error(JSON.stringify({ price: price.status, terms: terms.status, privacy: privacy.status, sitemap: sitemap.status, failedLegacy }));
}
