import { expect, test } from '@playwright/test';

import {
    mockGrowthTracking,
    mockPaywallBasics,
    openNextMovePaywall,
} from './next-move-report-paywall-helpers';
import { parsePremiumPhaseResult, PremiumPhase8Schema } from '../../src/lib/ai/premium-report-schemas';
import { buildPremiumPhaseFallback } from '../../src/app/api/reading/reading-generation-service';

test.describe('7-Day Decision Packet', () => {
    test('premium phase contract requires every promised packet deliverable', () => {
        const finalVerdict = {
            title: '결정',
            core_message: '핵심',
            saju_foundation: '사주 근거',
            astro_support: '점성 근거',
            tarot_insight: '타로 근거',
            action_priorities: ['작은 시험'],
            closing_words: '결과를 확인하세요.',
            convergence_diagnosis: {
                level: 'two_aligned' as const,
                shared_signal: '공통 근거',
                conflict_note: '남은 충돌',
                decision_rule: '작게 시험',
                verdict_modifier: '중간 확신',
            },
            decision_packet: {
                decision_fork: { option_a: '지원', option_b: '현 역할 확장', recommended_test: '두 곳에 정보 인터뷰' },
                evidence_disagreement: { aligned: '변화 필요', conflicting: '시기는 불확실' },
                reality_checks: ['채용 공고 3개 확인', '상사와 역할 범위 확인'],
                seven_day_experiment: { action: '정보 인터뷰 2회', measure: '구체적 역할 차이 2개', stop_rule: '수면이나 본업이 무너지면 중단' },
                if_then_rules: [
                    { if: '역할 차이가 확인되면', then: '지원서 1개를 낸다' },
                    { if: '차이가 없으면', then: '현 역할 협상을 준비한다' },
                ],
            },
        };

        expect(PremiumPhase8Schema.shape.final_verdict.safeParse(finalVerdict).success).toBe(true);
        expect(PremiumPhase8Schema.shape.final_verdict.safeParse({ ...finalVerdict, decision_packet: undefined }).success).toBe(false);

    });

    test('phase-eight recovery still returns a complete decision packet', () => {
        const fallback = buildPremiumPhaseFallback(8, {
            birthDate: '1992-03-14',
            birthTime: '12:00',
            context: 'career',
            question: '지금 이직할까, 현 역할을 더 키울까?',
            language: 'ko',
        }, { currentDate: '2026-07-10', reason: 'provider timeout' });

        expect(PremiumPhase8Schema.safeParse(fallback).success).toBe(true);
        expect(fallback).toMatchObject({
            final_verdict: {
                decision_packet: {
                    seven_day_experiment: { stop_rule: expect.any(String) },
                    if_then_rules: expect.arrayContaining([expect.objectContaining({ if: expect.any(String), then: expect.any(String) })]),
                },
            },
        });

        for (const question of [
            '비자 만료 전에 체류 방향을 어떻게 검토할까?',
            '계약서에 서명하기 전 어떤 법률 질문을 확인할까?',
            '투자 손실 뒤 비용과 리스크를 어떻게 비교할까?',
        ]) {
            const regulatedFallback = buildPremiumPhaseFallback(8, {
                birthDate: '1992-03-14',
                birthTime: '12:00',
                context: 'career',
                question,
                language: 'ko',
            }, { currentDate: '2026-07-10', reason: 'provider timeout' });
            expect(() => parsePremiumPhaseResult(8, regulatedFallback, { currentDate: '2026-07-10' })).not.toThrow();
        }
    });

    test('keeps the free verdict useful and names the distinct paid deliverables', async ({ page }) => {
        await mockGrowthTracking(page);
        await mockPaywallBasics(page);

        await openNextMovePaywall(page);

        await expect(page.locator('body')).toContainText('짧은 연락은 가능하지만 압박은 줄이세요');

        const dialog = page.getByRole('dialog', { name: /Decision Note payment/i });
        await expect(dialog.getByRole('button', { name: 'Close payment modal' })).toBeFocused();
        await expect(dialog.getByText(/7-Day Decision Packet|7일 결정 패킷/i).first()).toBeVisible();
        await expect(dialog.getByText(/결정 갈림길|Decision fork/i).first()).toBeVisible();
        await expect(dialog.getByText(/근거 충돌|Evidence disagreement/i).first()).toBeVisible();
        await expect(dialog.getByText(/현실 확인|Reality checks/i).first()).toBeVisible();
        await expect(dialog.getByText(/7일 실험|7-day experiment/i).first()).toBeVisible();
        await expect(dialog.getByText(/조건별 다음 수|If\/Then rule/i).first()).toBeVisible();
        await expect(dialog.getByText(/영구 보관|Permanent access/i).first()).toBeVisible();
        await page.keyboard.press('Shift+Tab');
        await expect.poll(() => page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true);

        await page.waitForTimeout(700);
        await page.screenshot({
            path: '.omo/evidence/cosmicpath-career-first/decision-packet-desktop.png',
        });
    });
});
