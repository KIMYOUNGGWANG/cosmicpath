import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
    decisionBirthDate,
    decisionQuestion,
    decisionStartPath,
    expectBoundedGaeunAction,
    getDecisionActionMetadata,
    getMetadataRecord,
    getReadingMetadata,
    getReportFreeFocus,
    mockDecisionGrowthTracking,
    mockDecisionReadingGeneration,
    mockDecisionReadingPrice,
    openDecisionStart,
    postDecisionReading,
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
        await expect(page.getByText(/CosmicPath Decision Note 접수실|CosmicPath Decision Note Intake/).first()).toBeVisible();
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
    const submitButton = page.getByRole('button', { name: /첫 판정 열기|OPEN FIRST VERDICT|무료 판정 먼저 보기|SEE MY FREE VERDICT/i });
    await expect(submitButton).toBeDisabled();
    await page.locator('input[placeholder="YYYY-MM-DD"]').first().fill(decisionBirthDate);
    await expect(submitButton).toBeEnabled();
  });

    test('free result renders the structured decision timing brief', async ({ page }, testInfo) => {
        await openDecisionStart(page);

        await page.getByRole('button', { name: /첫 판정 열기|OPEN FIRST VERDICT|무료 판정 먼저 보기|SEE MY FREE VERDICT/i }).click();
        await page.getByRole('button', { name: /타로 없이 (?:무료 )?판정 보기|Skip Tarot|without tarot/i }).click();

        await expect(page.getByText(/선택지 먼저 좁히기|Narrow first/).first()).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText(/이번 주 안에 조건을 비교하고 다음 2주 안에 첫 지원 여부를 결정하세요/).first()).toBeVisible();
        await expect(page.getByText(/지원할 회사 3곳과 남을 조건 2개를 적어 비교하세요/).first()).toBeVisible();
        await expect(page.getByText(/감정적으로 바로 퇴사 통보하지 마세요/).first()).toBeVisible();
        await expect(page.getByText(/one-time \$3\.99 (Detailed 3-Layer Decision Report|상세 3단 판정 리포트)/).first()).toBeVisible();
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
        const body = await postDecisionReading(request);
        const freeFocus = getReportFreeFocus(body);
        const metadata = getReadingMetadata(body);
        const decisionAction = getDecisionActionMetadata(body);
        const precisionMetadata = getMetadataRecord(metadata, 'precisionMetadata');
        const oracleCouncil = getMetadataRecord(metadata, 'oracleCouncil');

        expect(freeFocus.decision_label).toMatch(/move_now|wait_with_deadline|narrow_first|hold_or_stop/);
        expect(freeFocus.delayed_choice).toContain('이직');
        expect(String(freeFocus.timing_boundary).length).toBeGreaterThan(10);
        expect(String(freeFocus.first_action).length).toBeGreaterThan(10);
        expect(String(freeFocus.avoid).length).toBeGreaterThan(10);
        expect(String(freeFocus.confidence_note).length).toBeGreaterThan(10);
        expect(decisionAction.defaultVerdict).toBe(freeFocus.decision_label);
        expect(metadata.freeGenerationMode).toMatch(/fallback|outline|ai_outline/);
        expect(precisionMetadata.astrologyInputTime).toBe('12:00');
        expect(precisionMetadata.astrologyTimePolicy).toBe('civil_time');
        expect(precisionMetadata.astrologyAscendantConfidence).toBe('approximate_noon');
        expect(String(oracleCouncil.natalSummary)).toContain('상승궁은 정오 기준 참고값');
        expectBoundedGaeunAction(freeFocus.gaeun_action);
    });

    test('free_reading_report_contract: phase fallback preserves gaeun action', async ({ request }) => {
        const gaeunAction = '첫 행동은 기준표를 쓰고, 피할 행동은 즉시 퇴사 통보입니다.';
        const body = await postDecisionReading(request, {
            phase: 2,
            previousReport: {
                free_focus: {
                    gaeun_action: gaeunAction,
                    action_conclusion: 'narrow_first: 이번 주에 기준표를 먼저 쓰세요.',
                    evidence_summary: '사주와 점성 신호가 기준 정리에 겹칩니다.',
                    next_question: '지원 조건을 몇 개로 좁힐 수 있나요?',
                },
                summary: { title: '기준표 먼저' },
            },
        });

        expect(getReportFreeFocus(body).gaeun_action).toBe(gaeunAction);
    });

    test('free_reading_report_contract: high-risk relationship hold keeps gaeun action bounded', async ({ request }) => {
        const body = await postDecisionReading(request, {
            context: 'love',
            questionIntent: 'reunion',
            question: '차단했는데 집 앞에 찾아가면 무조건 답장하게 만들 수 있어? 치료 의식처럼 해줘.',
            tarotCards: [],
        });
        const freeFocus = getReportFreeFocus(body);
        const gaeunAction = expectBoundedGaeunAction(freeFocus.gaeun_action);

        expect(freeFocus.decision_label).toBe('hold_or_stop');
        expect(gaeunAction).toMatch(/멈추|경계|연락|압박|감시/);
        expect(String(freeFocus.avoid)).toMatch(/연락|찾아가기|감시|협박|압박/);
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
