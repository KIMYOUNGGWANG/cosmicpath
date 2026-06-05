import { expect, test } from '@playwright/test';

test.describe('Landing Smoke', () => {
    test('homepage shows primary navigation paths', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveTitle(/오늘의 결정 정리|Decision Note/i);

        if (test.info().project.name === 'mobile-chrome') {
            await expect(page.getByRole('button', { name: /메뉴 열기|Open menu/i })).toBeVisible();
            return;
        }

        await expect(page.locator('a[href="/start?reset=true&entry=decision_timing_rebuild_v1"]').first()).toBeVisible();
        await expect(page.getByText(/오늘의 결정 정리|Decision Note/i).first()).toBeVisible();
        await expect(page.locator('nav a[href="/daily"]')).toHaveCount(0);
        await expect(page.locator('nav a[href="/career/uncertainty"]')).toHaveCount(0);
        await expect(page.getByRole('button', { name: /^PRO$/i })).toHaveCount(0);
    });

    test('mobile navigation can be opened', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/');

        await page.getByRole('button', { name: /메뉴 열기|Open menu/i }).click();
        const drawer = page.getByRole('dialog', { name: /Mobile menu/i });

        await expect(drawer.locator('a[href="/start?reset=true&entry=decision_timing_rebuild_v1"]')).toBeVisible();
        await expect(drawer.locator('a[href="/daily"]')).toHaveCount(0);
        await expect(drawer.locator('a[href="/career/uncertainty"]')).toHaveCount(0);
        await expect(drawer.getByRole('button', { name: /^PRO$/i })).toHaveCount(0);
    });
});
