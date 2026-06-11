const { assertMatch } = require('./guard-assertions.cjs');

function runReviewGrowthDataGuards() {
  assertMatch(
    'prisma/schema.prisma',
    /model Review[\s\S]*readingId\s+String\?\s+@unique/,
    'Review model should enforce one review per reading'
  );
  assertMatch(
    'src/app/api/review/route.ts',
    /hasReadingAccess/,
    'Review route should verify reading ownership or access key'
  );
  assertMatch(
    'src/app/api/review/route.ts',
    /status:\s*409/,
    'Review route should return 409 for duplicate review attempts'
  );
  assertMatch(
    'prisma/schema.prisma',
    /model GrowthEvent[\s\S]*@@index\(\[createdAt\]\)/,
    'GrowthEvent should have a createdAt index for range scans'
  );
  assertMatch(
    'src/lib/growth-metrics.ts',
    /select:\s*\{[\s\S]*createdAt:\s*true[\s\S]*event:\s*true[\s\S]*channel:\s*true[\s\S]*metadata:\s*true/,
    'Growth summary should use a narrow column select'
  );
  assertMatch(
    'src/app/api/growth/summary/route.ts',
    /NextResponse\.json\(summary\)/,
    'Growth summary route should keep the existing response shape contract'
  );
}

module.exports = { runReviewGrowthDataGuards };
