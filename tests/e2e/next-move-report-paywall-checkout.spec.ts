import { expect, test, type Page } from '@playwright/test';

const contactQuestion = '지금 먼저 연락할까?';
const startPath = `/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=${encodeURIComponent(contactQuestion)}`;

function parseJsonRecord(raw: string | null): Record<string, unknown> {
    const parsed: unknown = JSON.parse(raw ?? '{}');
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) return parsed;
    throw new Error('Expected request body to be a JSON object.');
}

async function mockGrowthTracking(page: Page): Promise<Record<string, unknown>[]> {
    const events: Record<string, unknown>[] = [];
    await page.route('**/api/growth/track', async (route) => {
        events.push(parseJsonRecord(route.request().postData()));
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ ok: true }),
        });
    });
    return events;
}

async function mockPaywallBasics(page: Page): Promise<string[]> {
    const priceProductIds: string[] = [];
    await page.route('**/api/payment/price**', async (route) => {
        const productId = new URL(route.request().url()).searchParams.get('productId') ?? '';
        priceProductIds.push(productId);
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                productId,
                priceId: 'price_next_move_test',
                amount: 9,
                currency: 'USD',
                formattedPrice: '$9.00',
                metadata: {},
            }),
        });
    });
    await page.route('**/api/reading', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                phase: 1,
                report: {
                    free_focus: {
                        action_conclusion: '연락: 오늘은 짧게 한 번만 보내도 됩니다.',
                        evidence_summary: '사주와 점성술 신호가 짧은 확인 메시지 쪽으로 기울어 있습니다.',
                        next_question: '첫 문장을 얼마나 짧게 줄일 수 있나요?',
                    },
                    summary: {
                        title: '짧은 연락은 가능하지만 압박은 줄이세요',
                        content: '짧은 확인 메시지만 유효합니다.',
                        trust_score: 4,
                        trust_reason: '관계 타이밍 신호가 겹칩니다.',
                    },
                    traits: [],
                },
                isPremium: false,
                metadata: { language: 'ko', tarotCards: [] },
            }),
        });
    });
    return priceProductIds;
}

async function mockReadingSave(page: Page, requests: Record<string, unknown>[]): Promise<void> {
    await page.route('**/api/reading/save', async (route) => {
        requests.push(parseJsonRecord(route.request().postData()));
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                id: 'qa-next-move-reading',
                accessKey: 'qa-access-key',
            }),
        });
    });
}

async function openNextMovePaywall(page: Page): Promise<void> {
    await page.goto(startPath);
    await page.getByRole('button', { name: /무료 판정 먼저 보기/ }).click();
    await page.getByRole('button', { name: /타로 없이 무료 판정 보기/ }).click();
    await expect(page.getByText(/연락 판정/).first()).toBeVisible();
    await page.getByRole('button', { name: /연락 타이밍 열기/ }).click();
    await expect(page.getByText(/Next Move Report Full Report/i).first()).toBeVisible();
}

test.describe('Next Move Report checkout behavior', () => {
    test('paywall starts paid checkout with saved reading context', async ({ page }) => {
        const growthEvents = await mockGrowthTracking(page);
        const saveRequests: Record<string, unknown>[] = [];
        const paymentRequests: Record<string, unknown>[] = [];

        await mockPaywallBasics(page);
        await mockReadingSave(page, saveRequests);
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
            productId: expect.stringMatching(/^prod_next_move_report_/),
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
        const saveRequests: Record<string, unknown>[] = [];
        const redeemRequests: Record<string, unknown>[] = [];
        let paymentRequestCount = 0;

        await mockPaywallBasics(page);
        await mockReadingSave(page, saveRequests);
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
