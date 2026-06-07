import { expect, type Page, test } from '@playwright/test';
import {
    JsonRecord,
    mockGrowthTracking,
    mockReadingGeneration,
} from './next-move-report-paywall-helpers';

type FlowScenario = {
    name: string;
    startPath: string;
    ctaLabel: RegExp;
    promptEvent: string;
    source: string;
};

const decisionTimingFlows: readonly FlowScenario[] = [
    {
        name: 'relationship contact timing',
        startPath: '/relationship/contact-timing',
        ctaLabel: /이 질문으로 먼저 보기|See whether to text or wait/i,
        promptEvent: 'relationship_contact_prompt_clicked',
        source: 'next_move_report_mvp_v1',
    },
    {
        name: 'english contact timing',
        startPath: '/en/contact-timing',
        ctaLabel: /See whether to text or wait|Should I text them or wait\?/i,
        promptEvent: 'english_contact_prompt_clicked',
        source: 'en_relationship_contact_timing_v1',
    },
    {
        name: 'career timing',
        startPath: '/career/uncertainty',
        ctaLabel: /버틸지 옮길지 먼저 보기/i,
        promptEvent: 'career_uncertainty_cta_clicked',
        source: 'career_timing_wedge_399',
    },
];

async function mockGrowthTrackingAndReading(page: Page): Promise<JsonRecord[]> {
    const growthEvents = await mockGrowthTracking(page);
    await mockReadingGeneration(page);
    return growthEvents;
}

function hasEventWithSource(events: JsonRecord[], eventName: string, source: string): boolean {
    return events.some(
        (event) => event.event === eventName && event.source === source,
    );
}

function indexOfEventSequence(events: JsonRecord[], eventName: string, source: string): number {
    return events.findIndex((event) => event.event === eventName && event.source === source);
}

test.describe('Decision timing funnel growth event sequence', () => {
    for (const flow of decisionTimingFlows) {
        test(`tracks ${flow.name} as landing -> prompt -> analysis -> decision submit -> free result`, async ({ page }) => {
            const growthEvents = await mockGrowthTrackingAndReading(page);

            await page.goto(flow.startPath);
            await expect(page.getByRole('link', { name: flow.ctaLabel })).toBeVisible();
            await page.getByRole('link', { name: flow.ctaLabel }).click();
            await expect(page).toHaveURL(/\/start/);
            await expect(page.getByText(/02 사주·점성 기본정보|02 Saju & Astrology Basics/).first()).toBeVisible();

            const textInputs = page.locator('input[type="text"]');

            if (await textInputs.count() > 0) {
                await textInputs.nth(0).fill('QA');
            }

            if (await textInputs.count() > 1) {
                await textInputs.nth(1).fill('1990-01-01');
            }

            const questionInput = page.locator('textarea').first();
            if (await questionInput.count() > 0) {
                const currentQuestion = await questionInput.inputValue();
                if (!currentQuestion.trim()) {
                    await questionInput.fill(
                        flow.source === 'en_relationship_contact_timing_v1'
                            ? 'Should I text them now or wait?'
                            : '지금 움직이는 게 맞을까, 조금 더 기다리는 게 맞을까?'
                    );
                }
            }

            const submitButton = page.getByRole('button', { name: /첫 판정 열기|OPEN FIRST VERDICT|무료 판정 먼저 보기|SEE MY FREE VERDICT/i });
            await expect(submitButton).toBeEnabled();
            await submitButton.click();

            const skipTarotButton = page.getByRole('button', { name: /타로 없이 (?:무료 )?판정 보기|Skip Tarot|Skip Tarot Evidence/i });
            if (await skipTarotButton.count() > 0) {
                await skipTarotButton.click();
            } else {
                await page.locator('.tarot-card').first().click();
            }

            await expect(page.getByText(/첫 결정 브리프|First Decision Brief/i)).toBeVisible({ timeout: 15_000 });

            expect(hasEventWithSource(growthEvents, 'landing_view', flow.source)).toBeTruthy();
            expect(hasEventWithSource(growthEvents, flow.promptEvent, flow.source)).toBeTruthy();
            expect(hasEventWithSource(growthEvents, 'analysis_start', flow.source)).toBeTruthy();
            expect(hasEventWithSource(growthEvents, 'decision_question_submit', flow.source)).toBeTruthy();
            expect(hasEventWithSource(growthEvents, 'first_result_view', flow.source)).toBeTruthy();

            const landingIndex = indexOfEventSequence(growthEvents, 'landing_view', flow.source);
            const promptIndex = indexOfEventSequence(growthEvents, flow.promptEvent, flow.source);
            const analysisIndex = indexOfEventSequence(growthEvents, 'analysis_start', flow.source);
            const decisionIndex = indexOfEventSequence(growthEvents, 'decision_question_submit', flow.source);
            const firstResultIndex = indexOfEventSequence(growthEvents, 'first_result_view', flow.source);

            expect(landingIndex).toBeGreaterThanOrEqual(0);
            expect(promptIndex).toBeGreaterThan(landingIndex);
            expect(analysisIndex).toBeGreaterThan(promptIndex);
            expect(decisionIndex).toBeGreaterThan(analysisIndex);
            expect(firstResultIndex).toBeGreaterThan(decisionIndex);
        });
    }
});
