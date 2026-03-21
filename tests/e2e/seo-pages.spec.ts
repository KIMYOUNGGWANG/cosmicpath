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
        await expect(page.getByText(/K-Destiny/i).first()).toBeVisible();
        await expectStructuredData(page, 'https://cosmicpath.app/k-destiny');
    });

    test('blog page has title and collection structured data', async ({ page }) => {
        await page.goto('/blog');

        await expect(page).toHaveTitle(/CosmicPath Blog/i);
        await expect(page.getByRole('heading', { name: /CosmicPath Blog/i })).toBeVisible();
        await expectStructuredData(page, 'CollectionPage');
    });

    test('match new page has title and page structured data', async ({ page }) => {
        await page.goto('/match/new');

        await expect(page).toHaveTitle(/궁합 초대 링크 만들기/i);
        await expect(page.getByRole('heading', { name: /Cosmic Affinity/i })).toBeVisible();
        await expectStructuredData(page, 'https://cosmicpath.app/match/new');
    });
});
