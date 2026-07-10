import { expect, test } from '@playwright/test';

const evidenceDir = '.omo/evidence/cosmicpath-career-first';

test.use({ locale: 'ko-KR' });

test.describe('career-first responsive positioning', () => {
    test('home hero stays readable at mobile, tablet, and desktop widths', async ({ page }) => {
        await page.goto('/');

        for (const viewport of [
            { width: 375, height: 812, file: 'home-mobile-375-final.png' },
            { width: 768, height: 1024, file: 'home-tablet-768-final.png' },
            { width: 1440, height: 1000, file: 'home-desktop-1440-playwright-final.png' },
        ]) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.reload();
            await expect(page.getByRole('link', { name: /커리어 결정부터 보기/ })).toBeVisible();
            await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
            await page.waitForTimeout(1200);
            await page.screenshot({ path: `${evidenceDir}/${viewport.file}`, fullPage: false });
        }
    });

    test('career acquisition names the actual packet on mobile and desktop', async ({ page }) => {
        await page.goto('/career/uncertainty');
        await expect(page.getByText(/7일 결정 패킷 \$3\.99/).first()).toBeVisible();
        await expect(page.getByText(/근거 충돌, 현실 확인, 중단 기준, 조건별 다음 수/)).toBeVisible();

        for (const viewport of [
            { width: 375, height: 812, file: 'career-packet-mobile-375.png' },
            { width: 1440, height: 1000, file: 'career-packet-desktop-1440.png' },
        ]) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.reload();
            await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
            await page.waitForTimeout(800);
            await page.screenshot({ path: `${evidenceDir}/${viewport.file}`, fullPage: false });
        }
    });
});
