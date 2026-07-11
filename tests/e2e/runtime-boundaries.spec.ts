import { expect, test } from '@playwright/test';

import {
    getWorstCasePremiumPhaseBudgetMs,
    getWorstCaseStructuredBudgetMs,
} from '../../src/lib/ai/structured-request-budget';

test.describe('public and runtime boundaries', () => {
    test('sitemap exposes acquisition pages and excludes stateful or legal surfaces', async ({ page, request }) => {
        const response = await request.get('/sitemap.xml');
        expect(response.ok()).toBe(true);

        const sitemap = await response.text();
        expect(sitemap).toContain('/career/uncertainty');
        expect(sitemap).toContain('/relationship/contact-timing');
        expect(sitemap).not.toContain('/start</loc>');
        expect(sitemap).not.toContain('/review</loc>');
        expect(sitemap).not.toContain('/terms</loc>');
        expect(sitemap).not.toContain('/privacy</loc>');
        expect(sitemap).not.toContain('/en/contact-timing</loc>');

        await page.goto('/start?reset=true');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
        await page.goto('/review');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
    });

    test('auth-dependent daily responses are never publicly cacheable', async ({ request }) => {
        for (const path of [
            '/api/daily/fortune?birthday=1990-01-01',
            '/api/daily/tarot?birthday=1990-01-01',
        ]) {
            const response = await request.get(path);
            expect(response.ok(), `${path} should respond successfully`).toBe(true);
            const cacheControl = response.headers()['cache-control'] ?? '';
            expect(cacheControl, `${path} cache-control`).toContain('private');
            expect(cacheControl, `${path} cache-control`).toContain('no-store');
            expect(cacheControl, `${path} cache-control`).not.toContain('public');
            expect(cacheControl, `${path} cache-control`).not.toContain('s-maxage');
        }
    });

    test('structured AI retries finish below the reading route ceiling', () => {
        const routeCeilingMs = 120_000;

        expect(getWorstCaseStructuredBudgetMs('free')).toBeLessThan(routeCeilingMs);
        expect(getWorstCaseStructuredBudgetMs('basic')).toBeLessThan(routeCeilingMs);
        expect(getWorstCaseStructuredBudgetMs('premium')).toBeLessThan(routeCeilingMs);
        expect(getWorstCasePremiumPhaseBudgetMs()).toBeLessThan(routeCeilingMs);
    });
});
