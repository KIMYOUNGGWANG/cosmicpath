const { assertMatch, assertNoMatch } = require('./guard-assertions.cjs');

function runEnglishSitemapGuards() {
  assertMatch(
    'src/app/en/contact-timing/page.tsx',
    /title:\s*'Contact Decision Note'[\s\S]*siteName:\s*'CosmicPath'[\s\S]*First Decision Note free[\s\S]*Saju = structure, astrology = timing/s,
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
    /\/career\/uncertainty[\s\S]*\/relationship\/contact-timing/s,
    'Sitemap should include the validated Career and Relationship acquisition routes'
  );
  assertNoMatch(
    'src/app/sitemap.ts',
    /\/daily|\/start|\/review|\/terms|\/privacy|\/en\/contact-timing/,
    'Sitemap should not publish stateful, legal, internal, or unvalidated probe routes'
  );
}

module.exports = { runEnglishSitemapGuards };
