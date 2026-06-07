import { expect, type Page, test } from '@playwright/test';

const oldStartViewportCopyPattern =
  /Decision Note|오늘의 결정 정리|Oracle|Destiny|Premium Report|\bAI\b/i;

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

test.describe('Start reception redesign contract', () => {
  test('start route presents CosmicPath 3-layer intake desk', async ({ page }) => {
    await page.goto('/start?reset=true&lang=ko');

    await expect(page.getByText('CosmicPath 3단분석 접수실').first()).toBeVisible();
    await expect(page.getByText('01 질문 접수').first()).toBeVisible();
    await expect(page.getByText('02 사주·점성 기본정보').first()).toBeVisible();
    await expect(page.getByText('03 타로 준비').first()).toBeVisible();

    const viewportText = await firstViewportText(page);
    expect(viewportText).not.toMatch(oldStartViewportCopyPattern);
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
    await expect(page.getByText('01 질문 접수').first()).toBeVisible();
    await expect(page.getByText('02 사주·점성 기본정보').first()).toBeVisible();
    await expect(page.getByText('03 타로 준비').first()).toBeVisible();
    expect(dialogs).toEqual([]);
  });

  test('english start route uses 3-layer reading intake copy', async ({ page }) => {
    await page.goto('/start?reset=true&lang=en');

    await expect(page.getByText('CosmicPath 3-Layer Reading Intake').first()).toBeVisible();
    await expect(page.getByText('01 Question Intake').first()).toBeVisible();
    await expect(page.getByText('02 Saju & Astrology Basics').first()).toBeVisible();
    await expect(page.getByText('03 Tarot Prep').first()).toBeVisible();

    const viewportText = await firstViewportText(page);
    expect(viewportText).not.toMatch(oldStartViewportCopyPattern);
  });

  test('mobile start route has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto('/start?reset=true&lang=ko');

    await expect(page.getByText('CosmicPath 3단분석 접수실').first()).toBeVisible();
    await expect(page.getByText('01 질문 접수').first()).toBeVisible();

    const layout = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
  });
});
