import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  attachReadingAccessKey,
  createReadingAccessKey,
  extractReadingAccessKey,
  hasReadingAccess,
  stripPrivateReadingMetadata,
} from '../src/lib/reading-access.ts';

function runReadingAccessUnitTests() {
  const originalEnv = process.env.NODE_ENV;
  try {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

    const testAccessKey = createReadingAccessKey();
    const wrongAccessKey = createReadingAccessKey();
    assert(typeof testAccessKey === 'string' && testAccessKey.length === 48, 'Access key must be 48 hex chars');

    // Scenario 1: Account-linked reading (readingUserId exists), user opened from email link (no session) with matching accessKey
    const allowedEmailRecovery = hasReadingAccess({
      readingUserId: 'user_clerk_123',
      sessionUserId: null,
      storedAccessKey: testAccessKey,
      providedAccessKey: testAccessKey,
    });
    assert.equal(allowedEmailRecovery, true, 'Matching accessKey must grant access even when readingUserId is set');

    // Scenario 2: Account-linked reading, no session, wrong accessKey -> must be denied
    const deniedWrongKey = hasReadingAccess({
      readingUserId: 'user_clerk_123',
      sessionUserId: null,
      storedAccessKey: testAccessKey,
      providedAccessKey: wrongAccessKey,
    });
    assert.equal(deniedWrongKey, false, 'Mismatched accessKey must be denied');

    // Scenario 3: Account-linked reading, no session, no accessKey -> must be denied
    const deniedNoKey = hasReadingAccess({
      readingUserId: 'user_clerk_123',
      sessionUserId: null,
      storedAccessKey: testAccessKey,
      providedAccessKey: null,
    });
    assert.equal(deniedNoKey, false, 'Missing accessKey and session must be denied');

    // Scenario 4: Account-linked reading, matching session, no accessKey -> must be allowed
    const allowedSession = hasReadingAccess({
      readingUserId: 'user_clerk_123',
      sessionUserId: 'user_clerk_123',
      storedAccessKey: testAccessKey,
      providedAccessKey: null,
    });
    assert.equal(allowedSession, true, 'Matching sessionUserId must grant access');

    // Scenario 5: Account-linked reading, mismatched session, no accessKey -> must be denied
    const deniedWrongSession = hasReadingAccess({
      readingUserId: 'user_clerk_123',
      sessionUserId: 'user_clerk_999',
      storedAccessKey: testAccessKey,
      providedAccessKey: null,
    });
    assert.equal(deniedWrongSession, false, 'Mismatched sessionUserId must be denied');

    // Scenario 6: Anonymous reading (readingUserId is null), matching accessKey -> must be allowed
    const allowedAnonymous = hasReadingAccess({
      readingUserId: null,
      sessionUserId: null,
      storedAccessKey: testAccessKey,
      providedAccessKey: testAccessKey,
    });
    assert.equal(allowedAnonymous, true, 'Anonymous reading with matching accessKey must be allowed');

    // Roundtrip metadata attach and strip
    const rawMetadata = { language: 'ko', isPremium: true };
    const attached = attachReadingAccessKey(rawMetadata, testAccessKey);
    assert.equal(extractReadingAccessKey(attached), testAccessKey, 'Extracted access key must match attached key');

    const stripped = stripPrivateReadingMetadata(attached);
    assert(stripped !== null, 'Stripped metadata must not be null');
    assert.equal('__system' in stripped, false, 'Stripped metadata must not expose __system');
    assert.equal(extractReadingAccessKey(stripped), null, 'Stripped metadata must not return access key');
  } finally {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
  }
  console.log('✓ hasReadingAccess and metadata roundtrip unit tests passed');
}

function runSharedPageStaticContractTests() {
  const sharedPagePath = path.join(process.cwd(), 'src/app/share/[id]/SharedPageClient.tsx');
  const content = readFileSync(sharedPagePath, 'utf8');

  // Must have resolutionAttemptedRef
  assert(content.includes('resolutionAttemptedRef'), 'SharedPageClient must define resolutionAttemptedRef');

  // Must guard against re-running when ownerResolutionState !== 'idle'
  assert(
    content.includes("if (ownerResolutionState !== 'idle')"),
    "SharedPageClient must guard with ownerResolutionState !== 'idle'"
  );

  // Must not include isResolvingFullReport in useEffect dependencies
  const resolveEffectDeps = content.match(/void resolveFullReport\(\);[\s\S]*?\}, \[([\s\S]*?)\]\);/);
  assert(resolveEffectDeps, 'Must find resolveFullReport useEffect');
  const deps = resolveEffectDeps[1];
  assert(!deps.includes('isResolvingFullReport'), 'isResolvingFullReport must NOT be in dependencies');

  // Must not wipe storage on 403
  assert(
    !content.includes("sessionStorage.removeItem('pending_reading_access_key')"),
    'Must not remove access key from sessionStorage on 403'
  );
  assert(
    !content.includes("localStorage.removeItem('pending_reading_access_key')"),
    'Must not remove access key from localStorage on 403'
  );

  // Must include sign in button on denied
  assert(
    content.includes('/api/auth/signin?callbackUrl='),
    'SharedPageClient must provide a sign-in link when resolution is denied'
  );

  console.log('✓ SharedPageClient static contract tests passed');
}

function main() {
  runReadingAccessUnitTests();
  runSharedPageStaticContractTests();
  console.log('\nAll reading access recovery verifications passed successfully!');
}

main();
