import { expect, test, type Page } from '@playwright/test';
import {
    mockDefaultReadingPrice,
    mockGrowthTracking,
    mockReadingGeneration,
    mockReadingSave,
    openNextMovePaywall,
} from './next-move-report-paywall-helpers';

async function mockCheckoutBlocked(page: Page): Promise<void> {
    await page.route('**/api/payment', async (route) => {
        throw new Error(`Checkout API should stay blocked: ${route.request().url()}`);
    });
}

async function mockUnavailableReadingPrice(page: Page): Promise<void> {
    await page.route('**/api/payment/price**', async (route) => {
        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Price lookup unavailable' }),
        });
    });
}

async function mockFallbackReadingPrice(page: Page): Promise<void> {
    await page.route('**/api/payment/price**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                productId: 'prod_ThdoB65NmPU37y',
                priceId: '',
                amount: 9.99,
                currency: 'USD',
                formattedPrice: '$9.99',
                metadata: { fallback: 'true' },
            }),
        });
    });
}

async function mockPriceGuardBasics(page: Page): Promise<void> {
    await mockGrowthTracking(page);
    await mockReadingGeneration(page);
    await mockReadingSave(page);
    await mockCheckoutBlocked(page);
}

test.describe('Next Move Report paywall price lookup', () => {
    test('paywall shows existing Stripe reading offer', async ({ page }) => {
        await mockGrowthTracking(page);
        await mockDefaultReadingPrice(page);
        await mockReadingGeneration(page);
        await mockReadingSave(page);

        await openNextMovePaywall(page);

        await expect(page.getByText('$9.99').first()).toBeVisible();
        await expect(page.getByText(/왜 이 판정인지/).first()).toBeVisible();
        await expect(page.getByText(/연락 타이밍/).first()).toBeVisible();
        await expect(page.getByText(/피해야 할 메시지/).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /^PRO$/i })).toHaveCount(0);
    });

    test('paywall pauses checkout when live Stripe price is unavailable', async ({ page }) => {
        await mockPriceGuardBasics(page);
        await mockUnavailableReadingPrice(page);

        await openNextMovePaywall(page);

        await expect(page.getByText(/Stripe 가격 확인 보류/).first()).toBeVisible();
        await expect(page.getByText(/라이브 Stripe 가격을 확인하지 못해/).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /결제 일시 중지/ })).toBeDisabled();
        await expect(page.getByText('$9.99')).toHaveCount(0);
    });

    test('paywall pauses checkout when live Stripe price falls back', async ({ page }) => {
        await mockPriceGuardBasics(page);
        await mockFallbackReadingPrice(page);

        await openNextMovePaywall(page);

        await expect(page.getByText(/Stripe 가격 확인 보류/).first()).toBeVisible();
        await expect(page.getByText(/라이브 Stripe 가격을 확인하지 못해/).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /결제 일시 중지/ })).toBeDisabled();
        await expect(page.getByText('$9.99')).toHaveCount(0);
    });
});
