import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const readingProductId = 'prod_TgwKnGfpJBusty';

type PriceApiPayload = {
    readonly productId: string;
    readonly priceId: string;
    readonly amount: number;
    readonly currency: string;
    readonly formattedPrice: string;
};

function projectFile(filePath: string): string {
    return path.join(process.cwd(), filePath);
}

function readProjectFile(filePath: string): string {
    return readFileSync(projectFile(filePath), 'utf8');
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPriceApiPayload(value: unknown): value is PriceApiPayload {
    return (
        isRecord(value) &&
        typeof value.productId === 'string' &&
        typeof value.priceId === 'string' &&
        typeof value.amount === 'number' &&
        typeof value.currency === 'string' &&
        typeof value.formattedPrice === 'string'
    );
}

const staleDetailedDecisionNotePrice =
    /Detailed Decision Note[\s\S]{0,180}(?:\$9\.99|9\.99)|(?:\$9\.99|9\.99)[\s\S]{0,180}Detailed Decision Note/;

test.describe('Decision Note payment price consistency', () => {
    test('price API returns USD 3.99 reading product contract', async ({ request }) => {
        const response = await request.get(`/api/payment/price?productId=${readingProductId}`);
        expect(response.ok()).toBeTruthy();

        const payload: unknown = await response.json();
        expect(isPriceApiPayload(payload)).toBe(true);
        if (!isPriceApiPayload(payload)) {
            throw new Error('Expected price API payload shape.');
        }

        expect(payload.productId).toBe(readingProductId);
        expect(payload.amount).toBe(3.99);
        expect(payload.currency).toBe('USD');
        expect(payload.formattedPrice).toBe('$3.99');

        const paymentConfig = readProjectFile('src/lib/payment/payment-config.ts');
        expect(paymentConfig).toMatch(/name:\s*'Detailed Decision Note'[\s\S]*price:\s*399/);

        const jsonLd = readProjectFile('src/components/seo/json-ld.tsx');
        expect(jsonLd).toMatch(/name:\s*'Detailed Decision Note',\s*price:\s*'3\.99'/);
        expect(jsonLd).not.toMatch(/name:\s*'Detailed Decision Note'[\s\S]{0,140}9\.99/);
    });

    test('terms and success surfaces keep USD 3.99 Decision Note copy', async ({ page }) => {
        await page.addInitScript(() => {
            window.localStorage.setItem('user_language', 'en');
        });
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

        await page.goto('/terms');

        await expect(page.getByText(/Detailed Decision Note/i).first()).toBeVisible();
        await expect(page.getByText(/\$3\.99 USD/i).first()).toBeVisible();
        await expect(page.getByText(/refund request may be limited once the note is generated or opened/i)).toBeVisible();
        await expect(page.locator('body')).not.toContainText('$9.99');

        await page.route(/\/api\/payment\?session_id=.*/, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'paid',
                    source: 'next_move_report_mvp_v1',
                    reading_id: 'qa-next-move-reading',
                    language: 'en',
                    payment_type: 'premium_reading',
                }),
            });
        });

        await page.goto('/payment/success?session_id=cs_test_price&reading_id=qa-next-move-reading');

        await expect(page.getByText(/Payment complete/i)).toBeVisible();
        await expect(page.getByText(/Your Detailed Decision Note is opening now/i)).toBeVisible();
        await expect(page).toHaveURL(/\/start\?.*paid=true/, { timeout: 5000 });

        const termsSource = readProjectFile('src/app/terms/page.tsx');
        expect(termsSource).toContain('$3.99 USD');
        expect(termsSource).not.toMatch(staleDetailedDecisionNotePrice);

        const paymentSuccessSource = readProjectFile('src/app/payment/success/page.tsx');
        expect(paymentSuccessSource).toContain('Your Detailed Decision Note is opening now.');
        expect(paymentSuccessSource).not.toMatch(staleDetailedDecisionNotePrice);

        const billingSuccessSource = readProjectFile('src/app/billing/success/page.tsx');
        expect(billingSuccessSource).not.toMatch(staleDetailedDecisionNotePrice);
    });
});
