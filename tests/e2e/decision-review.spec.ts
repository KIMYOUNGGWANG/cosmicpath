import { expect, test } from '@playwright/test';
import {
    mockGrowthTracking,
    mockReadingGeneration,
    mockReadingSave,
} from './next-move-report-paywall-helpers';

const storageKey = 'cosmicpath_decision_review_v1';

function reviewSeed(overrides: Record<string, unknown> = {}) {
    const now = Date.now();

    return {
        version: 1,
        source: 'decision_timing_rebuild_v1',
        locale: 'ko',
        readingId: 'qa-career-reading',
        question: '이직 제안을 받을까, 지금 역할을 더 키울까?',
        intendedAction: 'wait',
        createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
        followUpDueAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ...overrides,
    };
}

test.describe('Decision Review', () => {
    test('career result seeds a context-appropriate seven-day review', async ({ page }) => {
        await mockGrowthTracking(page);
        await mockReadingGeneration(page);
        await mockReadingSave(page);
        const question = '이직 제안을 받을까, 지금 역할을 더 키울까?';
        await page.goto(`/start?reset=true&context=career&entry=career_timing_wedge_399&lang=ko&question=${encodeURIComponent(question)}`);
        await page.getByRole('textbox', { name: '수비학에 반영할 이름' }).fill('테스트');
        await page.locator('input[placeholder="YYYY-MM-DD"]').first().fill('1992-03-14');
        await page.getByRole('button', { name: /첫 판정 열기|무료 판정 먼저 보기/ }).click();
        await page.getByRole('button', { name: /타로 없이 (?:무료 )?판정 보기/ }).click();

        await expect(page.getByRole('button', { name: '작게 실행할게요' })).toBeVisible();
        await expect(page.getByRole('button', { name: '작게 실행할게요' })).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByRole('button', { name: '연락할게요' })).toHaveCount(0);
        await page.getByRole('button', { name: '선택지를 좁힐게요' }).click();
        await page.getByRole('button', { name: '7일 뒤 이 결정 확인하기' }).click();
        await expect(page.getByText('저장됨', { exact: true })).toBeVisible();

        const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), storageKey);
        expect(stored).toMatchObject({ question, intendedAction: 'reduce_scope' });
        await page.getByRole('link', { name: '결정 리뷰 열기' }).click();
        await expect(page.getByRole('heading', { name: '7일 뒤 결과를 확인하세요' })).toBeVisible();
        await expect(page.getByText(question)).toBeVisible();
        await expect(page.getByText('저장한 행동 · 선택지 좁히기')).toBeVisible();
    });

    test('review seed save failure stays retryable and reports the error', async ({ page }) => {
        await page.addInitScript((key) => {
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function (name: string, value: string) {
                if (name === key) throw new DOMException('Quota exceeded', 'QuotaExceededError');
                return originalSetItem.call(this, name, value);
            };
        }, storageKey);
        await mockGrowthTracking(page);
        await mockReadingGeneration(page);
        await mockReadingSave(page);
        await page.goto(`/start?reset=true&context=career&entry=career_timing_wedge_399&lang=ko&question=${encodeURIComponent('지금 옮길까?')}`);
        await page.getByRole('textbox', { name: '수비학에 반영할 이름' }).fill('테스트');
        await page.locator('input[placeholder="YYYY-MM-DD"]').first().fill('1992-03-14');
        await page.getByRole('button', { name: /첫 판정 열기|무료 판정 먼저 보기/ }).click();
        await page.getByRole('button', { name: /타로 없이 (?:무료 )?판정 보기/ }).click();
        await page.getByRole('button', { name: '7일 뒤 이 결정 확인하기' }).click();

        await expect(page.getByText(/이 기기에 리뷰를 저장하지 못했습니다/)).toBeVisible();
        await expect(page.getByRole('button', { name: '7일 뒤 이 결정 확인하기' })).toBeEnabled();
        await expect(page.getByRole('link', { name: '결정 리뷰 열기' })).toHaveCount(0);
    });

    test('records an outcome, persists it, and never generates another reading', async ({ page }) => {
        let readingRequests = 0;
        await page.route('**/api/reading', async (route) => {
            readingRequests += 1;
            await route.abort();
        });
        await page.addInitScript(
            ({ key, value }) => {
                localStorage.setItem('user_language', 'ko');
                localStorage.setItem(key, JSON.stringify(value));
            },
            { key: storageKey, value: reviewSeed() }
        );

        await page.goto('/review');
        await expect(page.getByRole('heading', { name: '7일 결정 리뷰' })).toBeVisible();
        await expect(page.getByText('이직 제안을 받을까, 지금 역할을 더 키울까?')).toBeVisible();

        await page.getByRole('button', { name: '부분적으로 맞음' }).click();
        await page.getByRole('button', { name: '아직 모르겠음' }).click();
        await page.getByRole('button', { name: '리뷰 저장' }).click();

        await expect(page.getByText('리뷰가 이 기기에 저장되었습니다.')).toBeVisible();
        await page.reload();
        await expect(page.getByRole('button', { name: '부분적으로 맞음' })).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByRole('button', { name: '아직 모르겠음' })).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByRole('button', { name: '그대로 유지' })).toBeVisible();
        await expect(page.getByRole('button', { name: '조정' })).toBeVisible();
        await expect(page.getByRole('button', { name: '닫기' })).toBeVisible();
        expect(readingRequests).toBe(0);
        await page.waitForTimeout(1200);
        await page.screenshot({
            path: '.omo/evidence/cosmicpath-career-first/review-active-desktop.png',
        });
    });

    test('preserves English across the saved seven-day review flow', async ({ page }) => {
        await page.addInitScript(
            ({ key, value }) => {
                localStorage.setItem('user_language', 'en');
                localStorage.setItem(key, JSON.stringify(value));
            },
            {
                key: storageKey,
                value: reviewSeed({
                    locale: 'en',
                    question: 'Should I take the new role or grow my current one?',
                }),
            }
        );

        await page.goto('/review');
        await expect(page.getByRole('heading', { name: '7-Day Decision Review' })).toBeVisible();
        await expect(page.getByText('Saved action · Wait with a deadline')).toBeVisible();
        await page.getByRole('button', { name: 'Partly worked' }).click();
        await page.getByRole('button', { name: 'Still uncertain' }).click();
        await page.getByRole('button', { name: 'Save review' }).click();
        await expect(page.getByText('Review saved on this device.')).toBeVisible();
        await expect(page.locator('main')).not.toContainText(/[가-힣]/);
    });

    test('malformed state is distinguished and fails safely', async ({ page }) => {
        await page.addInitScript((key) => localStorage.setItem(key, '{'), storageKey);

        await page.goto('/review');

        await expect(page.getByRole('heading', { name: '저장된 리뷰가 손상되었습니다' })).toBeVisible();
        await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), storageKey)).toBeNull();
        await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error|Next\.js/);
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(1200);
        await page.screenshot({
            path: '.omo/evidence/cosmicpath-career-first/review-empty-mobile.png',
        });
    });

    test('denied storage read resolves to a visible empty state', async ({ page }) => {
        await page.addInitScript(() => {
            Storage.prototype.getItem = function () {
                throw new DOMException('Access denied', 'SecurityError');
            };
        });
        await page.goto('/review');
        await expect(page.getByRole('heading', { name: '저장된 결정 리뷰가 없습니다' })).toBeVisible();
    });

    const malformedCases: readonly [string, Record<string, unknown>][] = [
        ['unknown action', { intendedAction: 'launch_everything' }],
        ['non-ISO date', { createdAt: '1' }],
        ['due date before creation', { followUpDueAt: '2020-01-01T00:00:00.000Z' }],
    ];
    for (const [label, malformed] of malformedCases) {
        test(`rejects semantically malformed review seed: ${label}`, async ({ page }) => {
            await page.addInitScript(
                ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
                { key: storageKey, value: reviewSeed(malformed) }
            );
            await page.goto('/review');
            await expect(page.getByRole('heading', { name: '저장된 리뷰가 손상되었습니다' })).toBeVisible();
        });
    }

    test('future review stays pending until the seven-day due date', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.addInitScript(
            ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
            {
                key: storageKey,
                value: reviewSeed({
                    followUpDueAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
                }),
            }
        );

        await page.goto('/review');

        await expect(page.getByRole('heading', { name: '7일 뒤 결과를 확인하세요' })).toBeVisible();
        await expect(page.getByText('이직 제안을 받을까, 지금 역할을 더 키울까?')).toBeVisible();
        await expect(page.getByRole('button', { name: '부분적으로 맞음' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: '리뷰 저장' })).toHaveCount(0);
        await page.waitForTimeout(1200);
        await page.screenshot({
            path: '.omo/evidence/cosmicpath-career-first/review-pending-mobile.png',
        });
    });

    test('expired state is not treated as an active decision', async ({ page }) => {
        await page.addInitScript(
            ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
            {
                key: storageKey,
                value: reviewSeed({ expiresAt: new Date(Date.now() - 1000).toISOString() }),
            }
        );

        await page.goto('/review');

        await expect(page.getByRole('heading', { name: '리뷰 기간이 지났습니다' })).toBeVisible();
        await expect(page.locator('body')).not.toContainText('이직 제안을 받을까, 지금 역할을 더 키울까?');
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1200);
        await page.screenshot({
            path: '.omo/evidence/cosmicpath-career-first/review-expired-tablet.png',
        });
    });
});
