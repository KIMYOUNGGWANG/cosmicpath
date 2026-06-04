import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const contactQuestion = '지금 먼저 연락할까?';
const startPath = `/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=${encodeURIComponent(contactQuestion)}`;

test.describe('Next Move Report MVP', () => {
    test('mvp route is branded and routes to start', async ({ page }) => {
        await page.goto('/relationship/contact-timing');

        await expect(page).toHaveTitle(/Next Move Report/i);
        await expect(page.getByRole('link', { name: /Next Move Report/i })).toBeVisible();
        await expect(page.getByText(/연락할까/).first()).toBeVisible();
        await expect(page.getByText(/기다릴까/).first()).toBeVisible();
        await expect(page.getByText(/첫 판정 무료/).first()).toBeVisible();
        await expect(page.getByText(/풀 리포트 결제/).first()).toBeVisible();

        const primaryCta = page.getByRole('link', { name: /먼저 보기|첫 판정/i }).first();
        await expect(primaryCta).toHaveAttribute('href', /entry=next_move_report_mvp_v1/);
        await expect(primaryCta).toHaveAttribute('href', /context=love/);
    });

    test('home and nav contain only MVP acquisition', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/Next Move Report/i);
        const heroCta = page.getByRole('link', { name: /무료로 첫 판정 보기|See My First Verdict/i }).first();
        await expect(heroCta).toBeVisible();
        await expect(heroCta).toHaveAttribute('href', '/relationship/contact-timing');
        await expect(page.locator('nav a[href="/daily"]')).toHaveCount(0);
        await expect(page.locator('nav a[href="/career/uncertainty"]')).toHaveCount(0);
        await expect(page.getByRole('button', { name: /^PRO$/i })).toHaveCount(0);
    });

    test('start keeps Next Move source and prefilled question', async ({ page }) => {
        await page.goto(startPath);

        await expect(page.locator('textarea').first()).toHaveValue(contactQuestion);
        await expect(page.getByText(/연락 타이밍 질문/).first()).toBeVisible();
        await expect(page.getByText(/선택 근거 레이어/).first()).toBeVisible();
        await expect(page.getByText(/무료 결과는 연락 판정, 근거 요약, 다음 연락 행동/).first()).toBeVisible();
        await expect(page).toHaveURL(/entry=next_move_report_mvp_v1/);

        const relationshipHelpers = readFileSync(path.join(process.cwd(), 'src/app/start/start-result-relationship.ts'), 'utf8');
        const followupPanel = readFileSync(path.join(process.cwd(), 'src/app/start/start-result-followup-panel.tsx'), 'utf8');

        expect(relationshipHelpers).toContain("source === 'next_move_report_mvp_v1'");
        expect(relationshipHelpers).toContain('next_move_report_followup_seeded');
        expect(followupPanel).toContain('next_move_report_decision_seed');
    });

    test('start handles empty Next Move question safely', async ({ page }) => {
        await page.goto('/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=');

        await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error|Next\.js/);
        await expect(page.locator('textarea').first()).toBeVisible();
        await expect(page.getByText(/연락 타이밍 질문/).first()).toBeVisible();
    });

    test('legacy routes remain directly reachable', async ({ request }) => {
        const legacyRoutes = [
            '/daily',
            '/daily/tarot',
            '/k-destiny',
            '/oracle-chat',
            '/en/saju',
            '/career/uncertainty',
        ] as const;

        for (const route of legacyRoutes) {
            const response = await request.get(route, { maxRedirects: 0 });
            expect(response.status(), `${route} should not be deleted`).not.toBe(404);
            expect(response.status(), `${route} should not 5xx`).toBeLessThan(500);
        }
    });

    test('ops groups Next Move with relationship history', async () => {
        const growthMetrics = readFileSync(path.join(process.cwd(), 'src/lib/growth-metrics.ts'), 'utf8');

        expect(growthMetrics).toContain('next_move_report_mvp_v1');
        expect(growthMetrics).toContain('relationship_contact_timing_v1');
        expect(growthMetrics).toContain('en_relationship_contact_timing_v1');
        expect(growthMetrics).toMatch(/key:\s*'relationship-contact'[\s\S]*next_move_report_mvp_v1[\s\S]*relationship_contact_timing_v1/);
    });

    test('trust pages expose Next Move boundaries', async ({ page }) => {
        await page.goto('/relationship/contact-timing');

        await expect(page.locator('footer a[href="/terms"]').first()).toBeVisible();
        await expect(page.locator('footer a[href="/privacy"]').first()).toBeVisible();

        await page.goto('/terms');

        await expect(page.getByText(/Next Move Report/i).first()).toBeVisible();
        await expect(page.getByText(/decision-support content/i).first()).toBeVisible();
        await expect(page.getByText(/no guaranteed relationship outcome/i).first()).toBeVisible();
        await expect(page.getByText(/not therapy, medical, diagnostic, legal, or financial advice/i).first()).toBeVisible();
        await expect(page.getByText(/one-off digital report/i).first()).toBeVisible();
        await expect(page.getByText(/Stripe checkout/i).first()).toBeVisible();
        await expect(page.getByText(/refund request may be limited once the report is generated or opened/i).first()).toBeVisible();

        await page.goto('/privacy');

        await expect(page.getByText(/relationship\/DM context/i).first()).toBeVisible();
        await expect(page.getByText(/optional birth data/i).first()).toBeVisible();
        await expect(page.getByText(/report restore and storage/i).first()).toBeVisible();
        await expect(page.getByText(/analytics/i).first()).toBeVisible();
        await expect(page.getByText(/do not paste highly sensitive third-party secrets/i).first()).toBeVisible();
    });

    test('english probe is not half rebranded', async ({ page, request }) => {
        await page.goto('/en/contact-timing');

        const robots = await page.locator('meta[name="robots"]').getAttribute('content');
        const isNoIndex = robots?.toLowerCase().includes('noindex') ?? false;

        if (!isNoIndex) {
            await expect(page).toHaveTitle(/Next Move Report/i);
            await expect(page.getByRole('link', { name: /Next Move Report/i }).first()).toBeVisible();
            await expect(page.getByText(/Full report via Stripe/i).first()).toBeVisible();
            await expect(page.getByText(/decision support only/i).first()).toBeVisible();
            await expect(page.locator('body')).not.toContainText('$3.99');
            await expect(page.locator('body')).not.toContainText('COSMICPATH');
        }

        const sitemap = await request.get('/sitemap.xml');
        expect(sitemap.ok()).toBe(true);

        const sitemapXml = await sitemap.text();
        expect(sitemapXml).toContain('/relationship/contact-timing');
        expect(sitemapXml).toContain('/terms');
        expect(sitemapXml).toContain('/privacy');
        expect(sitemapXml).not.toContain('/career/uncertainty');
        expect(sitemapXml).not.toContain('/daily</loc>');
    });
});
