import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const firstViewportOldBrandPattern =
  /\bAI\b|Oracle|Destiny|Fortune|CosmicPath|Cosmic Radar|Premium Report|전체 리포트|오라클/i;

const legacyVisibleCopyPattern =
  /Oracle Snapshot|Reveal My Destiny|Not generic fortune copy|Oracle Chat|Premium Report|Full Report|전체 리포트|오라클의 문|오라클 경로|Destiny Revealed|CosmicPath Detailed Decision Note|Cosmic Compatibility Full Report/i;

function projectFile(relativePath: string) {
  return path.join(process.cwd(), relativePath);
}

test.describe('Decision Note frontend rebrand', () => {
  test('landing presents decision-note brand without AI-coded language', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
    await page.goto('/');

    await expect(page).toHaveTitle(/오늘의 결정 정리|Decision Note/i);
    await expect(
      page.getByRole('heading', {
        name: /미뤄둔 선택을\s*오늘 정리하세요|Write down the choice\s*you keep postponing/i,
      })
    ).toBeVisible();

    const cta = page.getByRole('link', { name: /선택 정리하기|Write the decision/i }).first();
    await expect(cta).toHaveAttribute('href', '/start?reset=true&entry=decision_timing_rebuild_v1');

    const firstViewportText = await page.locator('body').innerText();
    expect(firstViewportText).not.toMatch(firstViewportOldBrandPattern);
  });

  test('start empty relationship question keeps quiet decision-note language', async ({ page }) => {
    await page.goto('/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=');

    await expect(page.locator('textarea').first()).toBeVisible();
    await expect(page.getByText(/연락 타이밍 질문/).first()).toBeVisible();
    await expect(page.getByText(/선택 근거 레이어/).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error|Next\.js/);

    const firstScreenText = await page.locator('body').innerText();
    expect(firstScreenText).not.toMatch(firstViewportOldBrandPattern);
  });

  test('share legal and payment surfaces keep decision-note regression language', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByText(/decision-support notes/i).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/AI-generated|Oracle|Fortune|Destiny|Premium Report/i);

    await page.goto('/privacy');
    await expect(page.getByText(/결정 정리 선택 정보/i).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/AI-generated|Oracle|Fortune|Destiny|Premium Report/i);

    const publicCopyFiles = [
      'src/app/share/[id]/SharedPageClient.tsx',
      'src/app/start/start-reveal-stage.tsx',
      'src/app/start/start-tarot-stage.tsx',
      'src/app/start/start-result-decision-brief.tsx',
      'src/lib/reading-share.ts',
      'src/lib/payment/payment-config.ts',
    ] as const;

    for (const relativePath of publicCopyFiles) {
      const source = readFileSync(projectFile(relativePath), 'utf8');
      expect(source, `${relativePath} should not expose old public brand copy`).not.toMatch(
        legacyVisibleCopyPattern
      );
    }

    const paymentConfig = readFileSync(projectFile('src/lib/payment/payment-config.ts'), 'utf8');
    expect(paymentConfig).toContain("name: 'Detailed Decision Note'");
    expect(paymentConfig).toContain("description: 'Detailed decision timing note unlock'");
  });
});
