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

function engineSourceEvidencePath(name: string) {
    return path.join(process.cwd(), '.omo/ulw-loop/evidence', name);
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
        await expect(page.getByText(/CosmicPath 3단분석 접수실|CosmicPath 3-Layer Reading Intake/).first()).toBeVisible();
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

        await page.getByRole('button', { name: /첫 판정 열기|OPEN FIRST VERDICT|무료 판정 먼저 보기|SEE MY FREE VERDICT/i }).click();
        await page.getByRole('button', { name: /타로 없이 (?:무료 )?판정 보기|Skip Tarot|without tarot/i }).click();

        await expect(page.getByText(/선택지 먼저 좁히기|Narrow first/).first()).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText(/결제 후 정밀 타이밍 구간 확인 가능/).first()).toBeVisible();
        await expect(page.getByText(/결제 후 첫 번째 추천 행동 단계 확인 가능/).first()).toBeVisible();
        await expect(page.getByText(/결제 후 반드시 피해야 할 리스크 확인 가능/).first()).toBeVisible();
        await page.screenshot({
            path: evidenceScreenshotPath(testInfo.project.name, 'free-result'),
            fullPage: true,
        });

        await page.getByRole('button', { name: /타이밍 열기|Unlock timing/i }).click();
        await expect(page.getByText(/상세 판정문|Detailed/i).first()).toBeVisible();
        await expect(page.getByText(/타이밍|Timing/i).first()).toBeVisible();
        await page.screenshot({
            path: evidenceScreenshotPath(testInfo.project.name, 'paywall'),
            fullPage: true,
        });
    });

    test('calibration panel renders astrology provenance copy', async ({ page }) => {
        await mockDecisionGrowthTracking(page);
        await mockDecisionReadingPrice(page);
        const readingData = {
            name: 'QA',
            gender: 'female',
            birthDate: '1994-04-12',
            birthTime: '12:00',
            calendarType: 'solar',
            unknownTime: true,
            context: 'career',
            question: decisionQuestion,
            language: 'ko',
            cityName: '서울',
            longitude: 126.978,
            latitude: 37.5665,
            characterId: 'mentor',
            tarotCards: [],
        };
        const metadata = {
            language: 'ko',
            characterId: 'mentor',
            readingData,
            precisionMetadata: {
                inputDate: '1994-04-12',
                inputTime: '12:00',
                tstOffset: -32,
                correctedDate: '1994-04-12',
                correctedTime: '11:28',
                lon: 126.978,
                hourPillar: '병오시',
                astrologyInputDate: '1994-04-12',
                astrologyInputTime: '12:00',
                astrologyTimezoneOffset: 9,
                astrologyTimePolicy: 'civil_time',
                astrologyAscendantConfidence: 'approximate_noon',
            },
            oracleCouncil: {
                convergenceScore: 72,
                ziweiSummary: '보정된 시각 기준으로 흐름을 확인합니다.',
                natalSummary: '태양 양자리, 달 황소자리, 상승궁은 정오 기준 참고값입니다.',
            },
        };

        await page.addInitScript(({ readingData, metadata }) => {
            sessionStorage.setItem('pending_reading_data', JSON.stringify(readingData));
            sessionStorage.setItem('pending_metadata', JSON.stringify(metadata));
            sessionStorage.setItem('reading_step', 'reveal');
            sessionStorage.setItem('is_session_active', 'true');
        }, { readingData, metadata });

        await page.goto('/start?context=career&entry=decision_timing_rebuild_v1&lang=ko');
        await page.getByText('Tap to Reveal').click();
        await page.waitForTimeout(950);
        await expect(page.getByText('점성술 기준: 1994-04-12 12:00 KST (출생시 미상, 상승궁 참고값)')).toBeVisible({ timeout: 15_000 });
        await page.screenshot({
            path: engineSourceEvidencePath('engine-source-c003-provenance-ui.png'),
            fullPage: true,
        });
    });

    test('growth summary remains admin gated', async ({ request }) => {
        const response = await request.get('/api/growth/summary?days=14');
        expect([401, 403]).toContain(response.status());

        const body = await response.json();
        expect(body.error.message).toMatch(/로그인|관리자/);
    });

    test('free_reading_report_contract: real reading API fallback returns decision timing fields', async ({ request }) => {
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
        expect(body.metadata.precisionMetadata.astrologyInputTime).toBe('12:00');
        expect(body.metadata.precisionMetadata.astrologyTimePolicy).toBe('civil_time');
        expect(body.metadata.precisionMetadata.astrologyAscendantConfidence).toBe('approximate_noon');
        expect(body.metadata.oracleCouncil.natalSummary).toContain('상승궁은 정오 기준 참고값');
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
