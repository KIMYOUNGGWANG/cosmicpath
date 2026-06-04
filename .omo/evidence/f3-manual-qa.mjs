import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const baseUrl = 'http://localhost:3100';
const contactQuestion = '지금 먼저 연락할까?';
const startUrl = `${baseUrl}/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=${encodeURIComponent(contactQuestion)}`;
const emptyQuestionUrl = `${baseUrl}/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=`;

async function installReadingMocks(page) {
  await page.route('**/api/growth/track', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route('**/api/payment/price**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        productId: 'prod_next_move_report_live_TBD',
        priceId: 'price_next_move_report_test',
        amount: 9,
        currency: 'USD',
        formattedPrice: '$9.00',
        metadata: {},
      }),
    });
  });

  await page.route('**/api/reading', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        phase: 1,
        report: {
          free_focus: {
            action_conclusion: '연락: 오늘은 짧게 한 번만 보내도 됩니다.',
            evidence_summary: '관계 타이밍 신호가 짧은 확인 메시지 쪽으로 기울어 있습니다.',
            next_question: '첫 문장을 얼마나 짧게 줄일 수 있나요?',
          },
          summary: {
            title: '짧은 연락은 가능하지만 압박은 줄이세요',
            content: '짧은 확인 메시지만 유효합니다.',
            trust_score: 4,
            trust_reason: '관계 타이밍 신호가 겹칩니다.',
          },
          traits: [],
        },
        isPremium: false,
        metadata: {
          language: 'ko',
          tarotCards: [],
        },
      }),
    });
  });

  await page.route('**/api/reading/save', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'qa-next-move-reading',
        accessKey: 'qa-access-key',
      }),
    });
  });
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1366, height: 900 },
});

try {
  const page = await context.newPage();
  await installReadingMocks(page);

  await page.goto(startUrl);
  await expect(page.locator('textarea').first()).toHaveValue(contactQuestion);
  await expect(page.getByText(/연락 타이밍 질문/).first()).toBeVisible();
  await page.screenshot({ path: '.omo/evidence/criterion-C001-start.png', fullPage: true });

  await page.getByRole('button', { name: /무료 판정 먼저 보기/ }).click();
  await page.getByRole('button', { name: /타로 없이 무료 판정 보기/ }).click();
  await expect(page.getByText(/연락 판정/).first()).toBeVisible();
  await page.screenshot({ path: '.omo/evidence/criterion-C001-result.png', fullPage: true });

  await page.getByRole('button', { name: /연락 타이밍 열기/ }).click();
  await expect(page.getByText(/Next Move Report Full Report/i).first()).toBeVisible();
  await expect(page.getByText('$9.00').first()).toBeVisible();
  await page.screenshot({ path: '.omo/evidence/f3-start-flow.png', fullPage: true });

  await page.goto(emptyQuestionUrl);
  await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error|Next\.js/);
  await expect(page.locator('textarea').first()).toBeVisible();
  await expect(page.getByText(/연락 타이밍 질문/).first()).toBeVisible();
  await page.screenshot({ path: '.omo/evidence/criterion-C002-empty-question.png', fullPage: true });

  await page.goto(`${baseUrl}/en/contact-timing`);
  await expect(page).toHaveTitle(/Next Move Report/i);
  await expect(page.getByText(/Full report \$9/i).first()).toBeVisible();
  await page.screenshot({ path: '.omo/evidence/task-11-english-probe.png', fullPage: true });

  await page.goto(`${baseUrl}/ops/growth`);
  await expect(page.getByText(/로그인이 필요합니다|관리자 전용 페이지/).first()).toBeVisible();
  await page.screenshot({ path: '.omo/evidence/f3-ops-growth.png', fullPage: true });

  await writeFile(
    '.omo/evidence/f3-manual-qa.txt',
    [
      'Manual QA passed:',
      '- start URL preserved next_move_report_mvp_v1 and prefilled question',
      '- free verdict rendered before paywall',
      '- paywall showed Next Move Report Full Report and $9.00',
      '- empty question did not crash',
      '- English probe showed Next Move Report and Full report $9',
      '- /ops/growth showed protected ADMIN access state in an unauthenticated browser',
    ].join('\n'),
  );
} finally {
  await browser.close();
}
