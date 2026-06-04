import { expect, type Page } from '@playwright/test';

export type JsonRecord = Record<string, unknown>;

export const decisionQuestion = '지금 이직을 밀어붙이는 게 맞을까, 조금 더 버티는 게 맞을까?';
export const decisionStartPath = `/start?reset=true&context=career&entry=decision_timing_rebuild_v1&lang=ko&question=${encodeURIComponent(decisionQuestion)}`;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseJsonRecord(raw: string | null): JsonRecord {
  const parsed: unknown = JSON.parse(raw ?? '{}');
  if (isJsonRecord(parsed)) return parsed;
  throw new Error('Expected request body to be a JSON object.');
}

export async function mockDecisionGrowthTracking(page: Page): Promise<JsonRecord[]> {
  const events: JsonRecord[] = [];
  await page.route('**/api/growth/track', async (route) => {
    events.push(parseJsonRecord(route.request().postData()));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
  return events;
}

export async function mockDecisionReadingPrice(page: Page): Promise<string[]> {
  const productIds: string[] = [];
  await page.route('**/api/payment/price**', async (route) => {
    const productId = new URL(route.request().url()).searchParams.get('productId') ?? '';
    productIds.push(productId);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        productId,
        priceId: 'price_oracle_decision_test',
        amount: 9,
        currency: 'USD',
        formattedPrice: '$9.00',
        metadata: {},
      }),
    });
  });
  return productIds;
}

export async function mockDecisionReadingGeneration(page: Page): Promise<void> {
  await page.route('**/api/reading', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        phase: 1,
        report: {
          free_focus: {
            decision_label: 'narrow_first',
            delayed_choice: '이직을 지금 밀어붙일지, 현재 역할을 더 버틸지',
            timing_boundary: '이번 주 안에 조건을 비교하고 다음 2주 안에 첫 지원 여부를 결정하세요.',
            first_action: '지원할 회사 3곳과 남을 조건 2개를 적어 비교하세요.',
            avoid: '감정적으로 바로 퇴사 통보하지 마세요.',
            confidence_note: '사주와 점성 신호는 움직임보다 기준 정리에 더 강하게 겹칩니다.',
            copy_ready_message: '지금은 바로 퇴사보다 역할 조건을 먼저 확인해보겠습니다.',
            action_conclusion: 'narrow_first: 지금은 이직 여부를 바로 확정하지 말고 선택지를 먼저 좁히세요.',
            evidence_summary: '사주와 점성술 신호가 무작정 이동보다 역할 조건 확인에 더 강하게 겹칩니다.',
            next_question: '지원할 회사와 남을 조건을 각각 몇 개로 좁힐 수 있나요?',
          },
          summary: {
            title: '선택지를 좁히면 다음 행동이 보입니다',
            content: '지금은 퇴사보다 기준 정리가 먼저입니다.',
            trust_score: 4,
            trust_reason: '결정 타이밍 근거가 같은 방향으로 겹칩니다.',
          },
          traits: [],
        },
        isPremium: false,
        metadata: {
          language: 'ko',
          tarotCards: [],
          decisionAction: {
            questionJob: 'choose_or_time_action',
            defaultVerdict: 'narrow_first',
            decisionLabelKo: '선택지 먼저 좁히기',
            decisionLabelEn: 'Narrow first',
          },
        },
      }),
    });
  });
}

export async function openDecisionStart(page: Page): Promise<void> {
  await mockDecisionGrowthTracking(page);
  await mockDecisionReadingPrice(page);
  await mockDecisionReadingGeneration(page);
  await page.goto(decisionStartPath);
  await expect(page.locator('textarea').first()).toHaveValue(decisionQuestion);
}
