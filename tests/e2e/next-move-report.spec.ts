import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const contactQuestion = '지금 먼저 연락할까?';
const startPath = `/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=${encodeURIComponent(contactQuestion)}`;

test.describe('Next Move Report MVP', () => {
    test('mvp route is branded and routes to start', async ({ page }) => {
        await page.goto('/relationship/contact-timing');

        await expect(page).toHaveTitle(/연락 결정 정리/i);
        await expect(page.getByRole('link', { name: /오늘의 결정 정리/i })).toBeVisible();
        await expect(page.getByText(/연락할까/).first()).toBeVisible();
        await expect(page.getByText(/기다릴까/).first()).toBeVisible();
        await expect(page.getByText(/첫 정리 무료/).first()).toBeVisible();
        await expect(page.getByText(/자세한 기록 결제/).first()).toBeVisible();

        const primaryCta = page.getByRole('link', { name: /이 질문으로 먼저 보기/i }).first();
        await expect(primaryCta).toHaveAttribute('href', /entry=next_move_report_mvp_v1/);
        await expect(primaryCta).toHaveAttribute('href', /context=love/);
    });

    test('home and nav contain only MVP acquisition', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/CosmicPath 3-Layer Reading/i);
        const heroCta = page.getByRole('link', { name: /Open my 3-layer reading|Start Reading|선택 정리하기/i }).first();
        await expect(heroCta).toBeVisible();
        await expect(heroCta).toHaveAttribute('href', '/start?reset=true&entry=decision_timing_rebuild_v1');
        await expect(page.getByText(/CosmicPath reading room|Saju \/ Astrology \/ Tarot/i).first()).toBeVisible();
        await expect(page.locator('a[href="/relationship/contact-timing"]')).toHaveCount(0);
        await expect(page.locator('nav a[href="/daily"]')).toHaveCount(0);
        await expect(page.locator('nav a[href="/career/uncertainty"]')).toHaveCount(0);
        await expect(page.getByRole('button', { name: /^PRO$/i })).toHaveCount(0);
    });

    test('start keeps Next Move source and prefilled question', async ({ page }) => {
        await page.goto(startPath);

        await expect(page.locator('textarea').first()).toHaveValue(contactQuestion);
        await expect(page.getByText(/01 질문 접수/).first()).toBeVisible();
        await expect(page.getByText(/02 사주·점성 기본정보/).first()).toBeVisible();
        await expect(page.getByText(/03 타로 준비/).first()).toBeVisible();
        await expect(page.getByText(/첫 판정은 연락, 대기, 축소, 보류/).first()).toBeVisible();
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
        await expect(page.getByText(/01 질문 접수/).first()).toBeVisible();
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

        expect(growthMetrics).toContain('decision-timing-home');
        expect(growthMetrics).toContain('decisionTimingFunnel');
        expect(growthMetrics).toContain('decision_timing_rebuild_v1');
        expect(growthMetrics).toContain('next_move_report_mvp_v1');
        expect(growthMetrics).toContain('relationship_contact_timing_v1');
        expect(growthMetrics).toContain('en_relationship_contact_timing_v1');
        expect(growthMetrics).toMatch(/key:\s*'decision-timing-home'[\s\S]*decision_timing_rebuild_v1/);
        expect(growthMetrics).toMatch(/key:\s*'relationship-contact'[\s\S]*next_move_report_mvp_v1[\s\S]*relationship_contact_timing_v1/);
    });

    test('trust pages expose Next Move boundaries', async ({ page }) => {
        await page.goto('/relationship/contact-timing');

        await expect(page.locator('footer a[href="/terms"]').first()).toBeVisible();
        await expect(page.locator('footer a[href="/privacy"]').first()).toBeVisible();

        await page.goto('/terms');

        await expect(page.getByText(/Decision Note/i).first()).toBeVisible();
        await expect(page.getByText(/decision-support notes/i).first()).toBeVisible();
        await expect(page.getByText(/no guaranteed relationship, career, money, health, or life outcome/i).first()).toBeVisible();
        await expect(page.getByText(/not therapy, medical, diagnostic, legal, or financial advice/i).first()).toBeVisible();
        await expect(page.getByText(/one-off detailed note/i).first()).toBeVisible();
        await expect(page.getByText(/Stripe checkout/i).first()).toBeVisible();
        await expect(page.getByText(/refund request may be limited once the note is generated or opened/i).first()).toBeVisible();

        await page.goto('/privacy');

        await expect(page.getByText(/질문 내용, 결정 맥락/i).first()).toBeVisible();
        await expect(page.getByText(/결정 정리 선택 정보/i).first()).toBeVisible();
        await expect(page.getByText(/결정 보조를 위해 입력한 상황 설명/i).first()).toBeVisible();
        await expect(page.getByText(/노트 복원 및 보관/i).first()).toBeVisible();
        await expect(page.getByText(/analytics/i).first()).toBeVisible();
        await expect(page.getByText(/고도로 민감한 제3자 비밀/i).first()).toBeVisible();
    });

    test('english probe is not half rebranded', async ({ page, request }) => {
        await page.goto('/en/contact-timing');

        const robots = await page.locator('meta[name="robots"]').getAttribute('content');
        const isNoIndex = robots?.toLowerCase().includes('noindex') ?? false;

        if (!isNoIndex) {
            await expect(page).toHaveTitle(/Contact Decision Note/i);
            await expect(page.getByRole('link', { name: /Decision Note/i }).first()).toBeVisible();
            await expect(page.getByText(/Detailed note via Stripe/i).first()).toBeVisible();
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
