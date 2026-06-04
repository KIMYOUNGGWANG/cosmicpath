import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
    decisionQuestion,
    decisionStartPath,
    mockDecisionGrowthTracking,
    mockDecisionReadingGeneration,
    mockDecisionReadingPrice,
    openDecisionStart,
} from './oracle-decision-timing-helpers';

function evidenceScreenshotPath(projectName: string, name: string) {
    return path.join(process.cwd(), '.omo/evidence', `task-9-${projectName}-${name}.png`);
}

test.describe('Oracle decision timing harness', () => {
    test('start route accepts canonical decision timing entry', async ({ page }, testInfo) => {
        await page.goto('/');
        await page.screenshot({
            path: evidenceScreenshotPath(testInfo.project.name, 'home'),
            fullPage: true,
        });

        await openDecisionStart(page);

        await expect(page).toHaveURL(/entry=decision_timing_rebuild_v1/);
        await expect(page.getByText(/미뤄둔 선택|End One Delayed Choice/).first()).toBeVisible();
        await page.screenshot({
            path: evidenceScreenshotPath(testInfo.project.name, 'start'),
            fullPage: true,
        });
    });

  test('mock helpers are available for later result and paywall flows', async ({ page }) => {
    const events = await mockDecisionGrowthTracking(page);
    const productIds = await mockDecisionReadingPrice(page);
    await mockDecisionReadingGeneration(page);

    await page.goto(decisionStartPath);

    expect(events).toEqual([]);
    expect(productIds).toEqual([]);
    await expect(page.locator('textarea').first()).toBeVisible();
  });

    test('free result renders the structured decision timing brief', async ({ page }, testInfo) => {
        await openDecisionStart(page);

        await page.getByRole('button', { name: /무료 판정 먼저 보기|SEE MY FREE VERDICT/i }).click();
        await page.getByRole('button', { name: /타로 없이 무료 판정 보기|without tarot/i }).click();

    await expect(page.getByText(/선택지 먼저 좁히기|Narrow first/).first()).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText(/이번 주 안에 조건을 비교하고 다음 2주 안에 첫 지원 여부/).first()).toBeVisible();
        await expect(page.getByText(/지원할 회사 3곳과 남을 조건 2개/).first()).toBeVisible();
        await expect(page.getByText(/감정적으로 바로 퇴사 통보하지 마세요/).first()).toBeVisible();
        await page.screenshot({
            path: evidenceScreenshotPath(testInfo.project.name, 'free-result'),
            fullPage: true,
        });

        await page.getByRole('button', { name: /타이밍 열기|Unlock timing/i }).click();
        await expect(page.getByText(/전체 결정 타이밍 리포트|Full Decision Timing Report/i).first()).toBeVisible();
        await expect(page.getByText(/타이밍 구간|Timing Window/i).first()).toBeVisible();
        await page.screenshot({
            path: evidenceScreenshotPath(testInfo.project.name, 'paywall'),
            fullPage: true,
        });
    });

    test('growth summary remains admin gated', async ({ request }) => {
        const response = await request.get('/api/growth/summary?days=14');
        expect([401, 403]).toContain(response.status());

        const body = await response.json();
        expect(body.error.message).toMatch(/로그인|관리자/);
    });

    test('real reading API fallback returns decision timing fields', async ({ request }) => {
        const response = await request.post('/api/reading', {
            data: {
                name: 'QA',
                gender: 'female',
                birthDate: '1994-04-12',
                birthTime: '12:00',
                calendarType: 'solar',
                unknownTime: true,
                context: 'career',
                question: decisionQuestion,
                language: 'ko',
                tier: 'free',
                selectionMode: 'auto',
                tarotCards: [
                    {
                        id: 1,
                        name: '마법사',
                        nameEn: 'The Magician',
                        keywords: ['시작', '실행'],
                        interpretation: '작은 실행으로 상황을 확인하는 카드입니다.',
                        isReversed: false,
                    },
                ],
            },
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        const freeFocus = body.report.free_focus;

        expect(freeFocus.decision_label).toMatch(/move_now|wait_with_deadline|narrow_first|hold_or_stop/);
        expect(freeFocus.delayed_choice).toContain('이직');
        expect(freeFocus.timing_boundary.length).toBeGreaterThan(10);
        expect(freeFocus.first_action.length).toBeGreaterThan(10);
        expect(freeFocus.avoid.length).toBeGreaterThan(10);
        expect(freeFocus.confidence_note.length).toBeGreaterThan(10);
        expect(body.metadata.decisionAction.defaultVerdict).toBe(freeFocus.decision_label);
        expect(body.metadata.freeGenerationMode).toMatch(/fallback|outline|ai_outline/);
    });

    test('harness stays free of future-only assertions', async () => {
    const helperSource = readFileSync(
      path.join(process.cwd(), 'tests/e2e/oracle-decision-timing-helpers.ts'),
      'utf8'
    );
    const specSource = readFileSync(
      path.join(process.cwd(), 'tests/e2e/oracle-decision-timing.spec.ts'),
      'utf8'
    );

    expect(helperSource).toContain('decision_label');
    expect(helperSource).toContain('timing_boundary');
    expect(specSource).not.toMatch(/test\.only\s*\(/);
    expect(specSource).not.toMatch(/test\.skip\s*\(/);
  });
});
