import { expect, test } from '@playwright/test';
import { getSafeReturnUrl, isAllowedOrigin } from '../../src/lib/security-url';

test.describe('Security Access and Guardrails', () => {
  test('security-url validator blocks open redirects and validates origins', () => {
    // Protocol-relative attacks
    expect(getSafeReturnUrl('//evil.com', '/fallback')).toBe('/fallback');
    expect(getSafeReturnUrl('/\\evil.com', '/fallback')).toBe('/fallback');

    // External absolute URL attacks
    expect(getSafeReturnUrl('https://evil.com/phishing', '/fallback')).toBe('/fallback');
    expect(getSafeReturnUrl('http://attacker.com', '/fallback')).toBe('/fallback');
    expect(getSafeReturnUrl('javascript:alert(1)', '/fallback')).toBe('/fallback');

    // Safe relative URLs
    expect(getSafeReturnUrl('/share/reading-123', '/fallback')).toBe('/share/reading-123');
    expect(getSafeReturnUrl('/start?step=2', '/fallback')).toBe('/start?step=2');

    // Allowed origins check
    expect(isAllowedOrigin('https://evil.com')).toBe(false);
    expect(isAllowedOrigin('https://cosmicpath.live')).toBe(true);
    expect(isAllowedOrigin('https://cosmicpath.app')).toBe(true);
  });

  test('POST /api/match/[id]/unlock blocks unauthenticated requests', async ({ request }) => {
    const res = await request.post('/api/match/mock-session-id/unlock');
    expect([401, 403]).toContain(res.status());
    const json = await res.json().catch(() => ({}));
    expect(json.error).toBeDefined();
  });

  test('GET /api/report/pdf blocks unauthenticated reading access', async ({ request }) => {
    const res = await request.get('/api/report/pdf?readingId=non-existent-or-forbidden');
    expect([403, 404]).toContain(res.status());
  });

  test('POST /api/email/send-result blocks unauthenticated / invalid requests', async ({ request }) => {
    const res = await request.post('/api/email/send-result', {
      data: {
        email: 'test@example.com',
        resultId: 'fake-reading-id-123',
      },
    });
    expect([403, 404]).toContain(res.status());
  });

  test('GET /api/reading/save does not expose internal database count', async ({ request }) => {
    const res = await request.get('/api/reading/save');
    expect(res.status()).toBe(200);
    const json = await res.json().catch(() => ({}));
    expect(json.status).toBe('ok');
    expect(json.count).toBeUndefined();
  });

  test('GET /api/sajumind/checkin does not return data for unauthenticated arbitrary userId', async ({ request }) => {
    const res = await request.get('/api/sajumind/checkin?userId=attacker-target-user');
    expect(res.status()).toBe(200);
    const json = await res.json().catch(() => ({}));
    expect(json.history).toEqual([]);
  });

  test('GET /api/sajumind/decisions does not return data for unauthenticated arbitrary userId', async ({ request }) => {
    const res = await request.get('/api/sajumind/decisions?userId=attacker-target-user');
    expect(res.status()).toBe(200);
    const json = await res.json().catch(() => ({}));
    expect(json.decisions).toEqual([]);
  });
});
