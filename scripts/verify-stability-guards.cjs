const fs = require('fs');
const path = require('path');

function read(filePath) {
  return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
}

function assertMatch(filePath, pattern, message) {
  const content = read(filePath);
  if (!pattern.test(content)) {
    throw new Error(`${message} [${filePath}]`);
  }
}

function assertNoMatch(filePath, pattern, message) {
  const content = read(filePath);
  if (pattern.test(content)) {
    throw new Error(`${message} [${filePath}]`);
  }
}

function run() {
  assertMatch(
    'src/components/payment/PaymentModal.tsx',
    /getReadingFallbackPriceLabel/,
    'PaymentModal should use a fallback price label'
  );
  assertMatch(
    'src/components/payment/PaymentModal.tsx',
    /Syncing live Stripe price|Stripe 실시간 가격을 확인하는 중입니다/,
    'PaymentModal should expose a loading state for price lookup'
  );
  assertNoMatch(
    'src/components/payment/PaymentModal.tsx',
    /price \|\| fetchedPrice \|\| '\.\.\.'/,
    'PaymentModal should not fall back to an ellipsis price placeholder'
  );

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

  console.log('verify:stability passed');
}

run();
