import { expect, type Page } from '@playwright/test';

const contactQuestion = '지금 먼저 연락할까?';

export const startPath = `/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=${encodeURIComponent(contactQuestion)}`;

export type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseJsonRecord(raw: string | null): JsonRecord {
    const parsed: unknown = JSON.parse(raw ?? '{}');
    if (isJsonRecord(parsed)) return parsed;
    throw new Error('Expected request body to be a JSON object.');
}

export async function mockGrowthTracking(page: Page): Promise<JsonRecord[]> {
    const events: JsonRecord[] = [];
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

export async function mockDefaultReadingPrice(page: Page): Promise<string[]> {
    const priceProductIds: string[] = [];
    await page.route('**/api/payment/price**', async (route) => {
        const productId = new URL(route.request().url()).searchParams.get('productId') ?? '';
        priceProductIds.push(productId);
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                productId,
                priceId: 'price_existing_reading_test',
                amount: 3.99,
                currency: 'USD',
                formattedPrice: '$3.99',
                metadata: {},
            }),
        });
    });
    return priceProductIds;
}

export async function mockReadingGeneration(page: Page): Promise<void> {
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
                        gaeun_action: '가은 액션: 오늘은 한 문장만 보내고, 답장을 압박하지 마세요.',
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
}

export async function mockReadingSave(page: Page): Promise<JsonRecord[]> {
    const requests: JsonRecord[] = [];
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
    return requests;
}

export async function mockPaywallBasics(page: Page): Promise<string[]> {
    const priceProductIds = await mockDefaultReadingPrice(page);
    await mockReadingGeneration(page);
    return priceProductIds;
}

export async function openNextMovePaywall(page: Page): Promise<void> {
    await page.goto(startPath);
    const submitButton = page.getByRole('button', { name: /첫 판정 열기|무료 판정 먼저 보기/ });
    await expect(submitButton).toBeDisabled();
    await page.locator('input[placeholder="YYYY-MM-DD"]').first().fill('1992-03-14');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    await page.getByRole('button', { name: /타로 없이 (?:무료 )?판정 보기/ }).click();
    await expect(page.getByText(/연락 판정/).first()).toBeVisible();
    await page.getByRole('button', { name: /연락 타이밍 열기/ }).click();
    const paymentDialog = page.getByRole('dialog', { name: /Decision Note payment/i });
    await expect(paymentDialog).toBeVisible();
    await expect(paymentDialog.getByText(/Detailed 3-Layer Decision Report/i).first()).toBeVisible();
}
