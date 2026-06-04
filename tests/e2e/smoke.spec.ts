import { expect, test } from '@playwright/test';

test.describe('Landing Smoke', () => {
    test('homepage shows primary navigation paths', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/Next Move Report/i);
        await expect(page.locator('a[href="/relationship/contact-timing"]').first()).toBeVisible();

        if (test.info().project.name === 'mobile-chrome') {
            await expect(page.getByRole('button', { name: '메뉴 열기' })).toBeVisible();
            return;
        }

        await expect(page.locator('nav a[href="/daily"]')).toHaveCount(0);
        await expect(page.locator('nav a[href="/career/uncertainty"]')).toHaveCount(0);
        await expect(page.getByRole('button', { name: /^PRO$/i })).toHaveCount(0);
    });

    test('mobile navigation can be opened', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');

        await page.getByRole('button', { name: '메뉴 열기' }).click();
        await expect(page.getByRole('link', { name: /Next Move|첫 판정|무료로 시작/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /오늘의 운세|Daily Signals/i })).toHaveCount(0);
        await expect(page.getByRole('link', { name: /커리어 고민|K-Destiny|PRO/i })).toHaveCount(0);
    });
});
