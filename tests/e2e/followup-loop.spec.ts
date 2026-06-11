import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
    mockGrowthTracking,
    mockPaywallBasics,
    openNextMovePaywall,
} from './next-move-report-paywall-helpers';

function readProjectFile(filePath: string): string {
    return readFileSync(path.join(process.cwd(), filePath), 'utf8');
}

test.describe('seven-day follow-up loop', () => {
    test('API and payment sync protect follow-up scheduling', async ({ request }) => {
        const unauthorizedSchedule = await request.post('/api/email/drip/schedule', {
            data: {
                readingId: 'qa-next-move-reading',
                email: 'qa@example.com',
                source: 'next_move_report_mvp_v1',
            },
        });
        expect(unauthorizedSchedule.status()).toBe(401);

        const followupRoute = readProjectFile('src/app/api/reading/followup/route.ts');
        const paymentRoute = readProjectFile('src/app/api/payment/route.ts');
        const scheduleRoute = readProjectFile('src/app/api/email/drip/schedule/route.ts');

        const authorizationIndex = followupRoute.indexOf('const { reading, isUnlimited } = await authorizeOracleAccess');
        const trackingIndex = followupRoute.indexOf('await trackGrowthEvent({');
        expect(authorizationIndex).toBeGreaterThanOrEqual(0);
        expect(trackingIndex).toBeGreaterThan(authorizationIndex);
        expect(followupRoute).toContain("event: 'followup_start'");
        expect(followupRoute).toContain("channel: 'oracle_followup'");
        expect(followupRoute).toContain('isFirstFollowUp');

        expect(scheduleRoute).toContain("source: parsed.source || 'manual_drip'");
        expect(paymentRoute).toContain("source: checkoutSource || 'payment_sync'");
        expect(paymentRoute).toMatch(
            /scheduleDefaultFollowUps\(\{[\s\S]*readingId: result\.readingId[\s\S]*email: customerEmailForFollowUps[\s\S]*source: checkoutSource \|\| 'payment_sync'/
        );
    });

    test('panel and ops runner keep seven-day follow-up loop visible and protected', async ({ page, request }) => {
        await mockGrowthTracking(page);
        await mockPaywallBasics(page);

        await openNextMovePaywall(page);

        await expect(page.locator('body')).toContainText(/7일 뒤 결정 확인/);
        await expect(page.locator('body')).toContainText(/7일 뒤 체크인 메일/);
        await expect(page.locator('body')).not.toContainText('문자나 이메일 자동 발송은 아직 켜지지 않습니다');

        const unauthorizedRun = await request.post('/api/ops/followups/run', {
            data: { dryRun: true, limit: 1 },
        });
        expect(unauthorizedRun.status()).toBe(401);

        const panel = readProjectFile('src/app/start/start-result-followup-panel.tsx');
        const relationship = readProjectFile('src/app/start/start-result-relationship.ts');
        const opsRunner = readProjectFile('src/app/api/ops/followups/run/route.ts');

        expect(panel).toContain('Detailed Decision Note');
        expect(panel).toContain('7-day check-in');
        expect(panel).toContain('7일 뒤 체크인 메일');
        expect(panel).toContain('next_move_report_decision_seed');
        expect(panel).toContain("followUpDelayDays: 7");
        expect(panel).toContain("followUpChannel: 'email_and_local_seed'");
        expect(panel).not.toContain('No SMS or email automation is enabled');
        expect(panel).not.toContain('문자나 이메일 자동 발송은 아직 켜지지 않습니다');
        expect(relationship).toContain('next_move_report_followup_seeded');
        expect(opsRunner).toContain('parseBearerToken');
        expect(opsRunner).toContain('dryRun');
        expect(opsRunner).toContain('limit = Math.max(1, Math.min(1000');
    });
});
