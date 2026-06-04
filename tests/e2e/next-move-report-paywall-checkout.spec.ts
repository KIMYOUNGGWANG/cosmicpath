import { expect, test } from '@playwright/test';
import {
    mockGrowthTracking,
    mockPaywallBasics,
    mockReadingSave,
    openNextMovePaywall,
    parseJsonRecord,
    type JsonRecord,
} from './next-move-report-paywall-helpers';

test.describe('Next Move Report checkout behavior', () => {
    test('paywall starts paid checkout with saved reading context', async ({ page }) => {
        const growthEvents = await mockGrowthTracking(page);
        const paymentRequests: JsonRecord[] = [];

        await mockPaywallBasics(page);
        const saveRequests = await mockReadingSave(page);
        await page.route('**/api/payment', async (route) => {
            paymentRequests.push(parseJsonRecord(route.request().postData()));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ url: '/start?checkout_session_mock=paid' }),
            });
        });

        await openNextMovePaywall(page);
        await page.getByRole('button', { name: /근거·타이밍·행동 순서 열기/ }).last().click();

        await expect(page).toHaveURL(/checkout_session_mock=paid/);
        expect(saveRequests).toHaveLength(1);
        expect(paymentRequests).toHaveLength(1);
        expect(paymentRequests.at(0)).toMatchObject({
            productId: expect.stringMatching(/^prod_/),
            readingId: 'qa-next-move-reading',
            accessKey: 'qa-access-key',
            language: 'ko',
            source: 'next_move_report_mvp_v1',
        });
        expect(growthEvents).toEqual(
            expect.arrayContaining([expect.objectContaining({ event: 'checkout_start' })])
        );
    });

    test('paywall redeems free promo with email and no Stripe checkout request', async ({ page }) => {
        const growthEvents = await mockGrowthTracking(page);
        const redeemRequests: JsonRecord[] = [];
        let paymentRequestCount = 0;

        await mockPaywallBasics(page);
        const saveRequests = await mockReadingSave(page);
        await page.route('**/api/promo/validate', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ valid: true, id: 'promo-free-qa', discount: 100, remaining: 3 }),
            });
        });
        await page.route('**/api/promo/redeem', async (route) => {
            redeemRequests.push(parseJsonRecord(route.request().postData()));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true }),
            });
        });
        await page.route('**/api/payment', async (route) => {
            paymentRequestCount += 1;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ url: '/start?unexpected_payment_request=true' }),
            });
        });

        await openNextMovePaywall(page);
        await page.getByPlaceholder('프로모션 코드 입력').fill('free100');
        await page.getByRole('button', { name: '적용' }).click();
        await expect(page.getByText(/코드 적용 완료/)).toBeVisible();

        await page.getByRole('button', { name: /무료로 결정 타이밍 열기/ }).click();
        await expect(page.getByText(/무료 쿠폰 사용 시 이메일 주소가 필요합니다/)).toBeVisible();
        expect(redeemRequests).toHaveLength(0);

        await page.getByPlaceholder('name@example.com').fill('bad-email');
        await page.getByRole('button', { name: /무료로 결정 타이밍 열기/ }).click();
        await expect(page.getByText(/올바른 이메일 형식이 아닙니다/)).toBeVisible();
        expect(redeemRequests).toHaveLength(0);

        await page.getByPlaceholder('name@example.com').fill('qa@example.com');
        await page.getByRole('button', { name: /무료로 결정 타이밍 열기/ }).click();

        await expect(page).toHaveURL(/paid=true&reading_id=qa-next-move-reading/);
        expect(saveRequests).toHaveLength(1);
        expect(redeemRequests).toHaveLength(1);
        expect(redeemRequests.at(0)).toMatchObject({
            codeId: 'promo-free-qa',
            email: 'qa@example.com',
            readingId: 'qa-next-move-reading',
        });
        expect(paymentRequestCount).toBe(0);
        await expect
            .poll(() =>
                page.evaluate(() => ({
                    isPremiumUser: sessionStorage.getItem('is_premium_user'),
                    paymentCompleted: sessionStorage.getItem('payment_completed'),
                    promoUser: sessionStorage.getItem('promo_user'),
                }))
            )
            .toEqual({
                isPremiumUser: 'true',
                paymentCompleted: 'true',
                promoUser: 'true',
            });
        expect(growthEvents).toEqual(
            expect.arrayContaining([expect.objectContaining({ event: 'checkout_success' })])
        );
    });
});
