import { expect, test } from '@playwright/test';

test.describe('Landing Smoke', () => {
    test('homepage shows primary navigation paths', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/CosmicPath/i);
        await expect(page.getByRole('link', { name: /cosmic path|cosmic/i })).toBeVisible();

        if (test.info().project.name === 'mobile-chrome') {
            await expect(page.getByRole('button', { name: '메뉴 열기' })).toBeVisible();
            return;
        }

        await expect(page.locator('a[href="/start?reset=true"]').first()).toBeVisible();
        await expect(page.getByRole('link', { name: /오늘의 운세/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /k-destiny/i })).toBeVisible();
    });

    test('mobile navigation can be opened', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');

        await page.getByRole('button', { name: '메뉴 열기' }).click();
        await expect(page.getByRole('link', { name: /k-destiny/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /오늘의 운세/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /start analysis/i })).toBeVisible();
    });
});
