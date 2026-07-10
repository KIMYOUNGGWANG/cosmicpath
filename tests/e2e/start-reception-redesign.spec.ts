import { expect, type Page, test } from '@playwright/test';
import path from 'node:path';

const oldStartViewportCopyPattern =
  /Oracle|Destiny|Premium Report|\bAI\b/i;

async function firstViewportText(page: Page): Promise<string> {
  return page.locator('body').evaluate(() => {
    const visibleTexts = Array.from(document.body.querySelectorAll<HTMLElement>('body *'))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom >= 0 &&
          rect.top <= window.innerHeight &&
          style.display !== 'none' &&
          style.visibility !== 'hidden'
        );
      })
      .map((element) => (element.innerText ?? element.textContent ?? '').trim())
      .filter(Boolean);

    return Array.from(new Set(visibleTexts)).join('\n');
  });
}

function c002EvidencePath(name: string): string {
  return path.join(process.cwd(), '.omo/ulw-loop/evidence', `three-layer-decision-report-alignment-c002-${name}.png`);
}

test.describe('Start reception redesign contract', () => {
  test('start route presents CosmicPath Decision Note intake desk', async ({ page }) => {
    await page.goto('/start?reset=true&lang=ko');

    await expect(page.getByText('CosmicPath Decision Note 접수실').first()).toBeVisible();
    await expect(page.getByText('01 선택 질문').first()).toBeVisible();
    await expect(page.getByText('02 생년월일 기준').first()).toBeVisible();
    await expect(page.getByText('03 타로 즉시 신호').first()).toBeVisible();
    await expect(page.getByText(/첫 판정은 무료/).first()).toBeVisible();

    const viewportText = await firstViewportText(page);
    expect(viewportText).not.toMatch(oldStartViewportCopyPattern);
    expect(viewportText).not.toMatch(/3단분석|3-Layer Reading/);
  });

  test('relationship entry keeps question-first intake safe', async ({ page }) => {
    const dialogs: string[] = [];
    const question = '올 하반기 어떻게 해야 좀 풀릴까요? <script>alert(1)</script>';

    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    await page.goto(
      `/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=${encodeURIComponent(question)}`
    );

    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error|Next\.js/);
    await expect(page.locator('textarea').first()).toHaveValue(question);
    await expect(page.getByText('01 선택 질문').first()).toBeVisible();
    await expect(page.getByText('02 생년월일 기준').first()).toBeVisible();
    await expect(page.getByText('03 타로 즉시 신호').first()).toBeVisible();

    const submitButton = page.locator('button[type="submit"]').last();
    const birthDateInput = page.locator('input[placeholder="YYYY-MM-DD"]').first();
    await expect(submitButton).toBeDisabled();
    await page.screenshot({
      path: c002EvidencePath('disabled'),
      fullPage: true,
    });

    for (const partialBirthDate of ['', '1992', '1992-03', '1992-3-4', '1992-13-40', '1992-02-31']) {
      await birthDateInput.fill(partialBirthDate);
      await expect(submitButton).toBeDisabled();
    }

    await birthDateInput.fill('1992-03-14');
    await expect(submitButton).toBeEnabled();
    await page.screenshot({
      path: c002EvidencePath('enabled'),
      fullPage: true,
    });
    expect(dialogs).toEqual([]);
  });

  test('english start route uses Decision Note intake copy', async ({ page }) => {
    await page.goto('/start?reset=true&lang=en');

    await expect(page.getByText('CosmicPath Decision Note Intake').first()).toBeVisible();
    await expect(page.getByText('01 Decision Question').first()).toBeVisible();
    await expect(page.getByText('02 Birth Date Baseline').first()).toBeVisible();
    await expect(page.getByText('03 Tarot Signal').first()).toBeVisible();
    await expect(page.getByText(/first verdict is free/i).first()).toBeVisible();

    const viewportText = await firstViewportText(page);
    expect(viewportText).not.toMatch(oldStartViewportCopyPattern);
    expect(viewportText).not.toMatch(/3-layer reading/i);
  });

  test('mobile start route has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/start?reset=true&lang=ko');

    await expect(page.getByText('CosmicPath Decision Note 접수실').first()).toBeVisible();
    await expect(page.getByText('01 선택 질문').first()).toBeVisible();

    const layout = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: '.omo/evidence/cosmicpath-career-first/start-mobile-375-final.png',
    });
  });
});
