const { assertMatch, assertNoMatch } = require('./guard-assertions.cjs');

function runEnglishSitemapGuards() {
  assertMatch(
    'src/app/en/contact-timing/page.tsx',
    /title:\s*'Contact Decision Note'[\s\S]*siteName:\s*'CosmicPath'[\s\S]*First Decision Note free · Detailed Decision Note via Stripe[\s\S]*Decision support only/s,
    'English contact timing route should keep CosmicPath as site brand and Decision Note as product name'
  );
  assertNoMatch(
    'src/app/en/contact-timing/page.tsx',
    /\$3\.99|COSMICPATH|siteName:\s*'Decision Note'/,
    'English contact timing route should not leak half-rebranded Decision Note site brand or $3.99 acquisition copy'
  );
  assertMatch(
    'src/components/landing/EnglishGuideSection.tsx',
    /Open Decision Note/,
    'English landing guide section should expose the Decision Note entry path'
  );
  assertMatch(
    'src/app/sitemap.ts',
    /\/relationship\/contact-timing[\s\S]*\/terms[\s\S]*\/privacy/s,
    'Sitemap should include the MVP route and legal pages'
  );
  assertNoMatch(
    'src/app/sitemap.ts',
    /\/daily|\/career\/uncertainty/,
    'Sitemap should not promote legacy Daily or Career acquisition routes during the Next Move MVP'
  );
}

module.exports = { runEnglishSitemapGuards };
