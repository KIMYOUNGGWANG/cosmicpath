import { expect, test } from '@playwright/test';

async function expectStructuredData(page: import('@playwright/test').Page, text: string) {
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(scripts.join('\n')).toContain(text);
}

test.describe('SEO Landing Pages', () => {
    test('daily page has title and structured data', async ({ page }) => {
        await page.goto('/daily');

        await expect(page).toHaveTitle(/오늘의 운세/i);
        await expect(page.getByRole('heading', { name: /오늘의 운세 & 타로/i })).toBeVisible();
        await expectStructuredData(page, 'https://cosmicpath.app/daily');
    });

    test('k-destiny page has title and structured data', async ({ page }) => {
        await page.goto('/k-destiny');

        await expect(page).toHaveTitle(/K-Destiny/i);
        await expect(page.getByRole('heading', { name: /K-Destiny Aura/i })).toBeVisible();
        await expectStructuredData(page, 'https://cosmicpath.app/k-destiny');
    });

    test('blog page has title and collection structured data', async ({ page }) => {
        await page.goto('/blog');

        await expect(page).toHaveTitle(/CosmicPath Archive/i);
        await expect(page.getByRole('heading', { name: /참고 글 모음/i })).toBeVisible();
        await expectStructuredData(page, 'CollectionPage');
    });

    test('match new page has archive title and global structured data', async ({ page }) => {
        await page.goto('/match/new');

        await expect(page).toHaveTitle(/Cosmic Compatibility Readings/i);
        await expect(page.getByRole('heading', { name: /궁합 실험실은/i })).toBeVisible();
        await expectStructuredData(page, 'Organization');
    });
});
