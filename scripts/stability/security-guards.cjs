const { assertMatch, assertNoMatch } = require('./guard-assertions.cjs');

function runSecurityGuards() {
  // 1. Match unlock must enforce admin role check
  assertMatch(
    'src/app/api/match/[id]/unlock/route.ts',
    /sessionAuth\.user\.role !== 'ADMIN'/,
    'Match unlock route must require ADMIN role'
  );

  // 2. Report PDF route must enforce reading access check
  assertMatch(
    'src/app/api/report/pdf/route.ts',
    /hasReadingAccess\(/,
    'Report PDF route must enforce reading access permissions'
  );

  // 3. Email send-result route must enforce reading access check and rate limit
  assertMatch(
    'src/app/api/email/send-result/route.ts',
    /hasReadingAccess\(/,
    'Email send-result route must enforce reading access permissions'
  );
  assertMatch(
    'src/app/api/email/send-result/route.ts',
    /rateLimit\(request/,
    'Email send-result route must enforce rate limiting'
  );

  // 4. Payment chat-credit route must use safe returnUrl and safe app origin
  assertMatch(
    'src/app/api/payment/chat-credit/route.ts',
    /getSafeReturnUrl\(/,
    'Payment chat-credit route must sanitize returnUrl against open redirects'
  );
  assertMatch(
    'src/app/api/payment/chat-credit/route.ts',
    /resolveSafeAppOrigin\(/,
    'Payment chat-credit route must resolve origin safely'
  );

  // 5. Stripe payment route must use resolveSafeAppOrigin
  assertMatch(
    'src/app/api/payment/route.ts',
    /resolveSafeAppOrigin\(request\)/,
    'Payment route must use resolveSafeAppOrigin'
  );

  // 6. Match pay route must use resolveSafeAppOrigin
  assertMatch(
    'src/app/api/match/[id]/pay/route.ts',
    /resolveSafeAppOrigin\(request\)/,
    'Match pay route must use resolveSafeAppOrigin'
  );

  // 7. Subscription create route must use resolveSafeAppOrigin
  assertMatch(
    'src/app/api/subscription/create/route.ts',
    /resolveSafeAppOrigin\(request\)/,
    'Subscription create route must use resolveSafeAppOrigin'
  );

  // 8. Promo code exempt account must not have hardcoded personal emails
  assertNoMatch(
    'src/lib/promo-codes.ts',
    /@gmail\.com|@naver\.com|@kakao\.com/,
    'Promo codes must not contain hardcoded personal email addresses'
  );

  // 9. Reading save route must not expose count to unauthenticated callers
  assertNoMatch(
    'src/app/api/reading/save/route.ts',
    /prisma\.readingResult\.count\(\)/,
    'Reading save route must not leak reading count on unauthenticated GET'
  );

  // 10. SajuMind routes must not query arbitrary client-provided userId
  assertNoMatch(
    'src/app/api/sajumind/checkin/route.ts',
    /where:\s*userId\s*\?\s*\{\s*userId\s*\}\s*:/,
    'SajuMind checkin route must not trust query param userId'
  );
  assertNoMatch(
    'src/app/api/sajumind/decisions/route.ts',
    /where:\s*userId\s*\?\s*\{\s*userId\s*\}\s*:/,
    'SajuMind decisions route must not trust query param userId'
  );
  assertNoMatch(
    'src/app/api/sajumind/report/weekly/route.ts',
    /where:\s*\{\s*\.\.\.\(userId\s*\?\s*\{\s*userId\s*\}\s*:/,
    'SajuMind weekly report route must not trust query param userId'
  );
}

module.exports = { runSecurityGuards };
