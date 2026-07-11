import { expect, type APIRequestContext, type Page } from '@playwright/test';

export type JsonRecord = Record<string, unknown>;

export const decisionQuestion = '지금 이직을 밀어붙이는 게 맞을까, 조금 더 버티는 게 맞을까?';
export const decisionBirthDate = '1994-04-12';
export const decisionStartPath = `/start?reset=true&context=career&entry=decision_timing_rebuild_v1&lang=ko&question=${encodeURIComponent(decisionQuestion)}`;
export const forbiddenGaeunActionPattern =
  /(?:치료|임상|진단|투약|상담\s*치료|반드시|무조건|100%|보장|답장하게|guarantee|guaranteed|clinical|therapy|therapeutic|diagnosis|treatment|make\s+them\s+respond)/iu;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseJsonRecord(raw: string | null): JsonRecord {
  const parsed: unknown = JSON.parse(raw ?? '{}');
  if (isJsonRecord(parsed)) return parsed;
  throw new Error('Expected request body to be a JSON object.');
}

export function buildDecisionReadingData(overrides: JsonRecord = {}): JsonRecord {
  return {
    name: 'QA',
    gender: 'female',
    birthDate: decisionBirthDate,
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
    ...overrides,
  };
}

export async function postDecisionReading(
  request: APIRequestContext,
  overrides: JsonRecord = {}
): Promise<JsonRecord> {
  const response = await request.post('/api/reading', {
    data: buildDecisionReadingData(overrides),
  });
  expect(response.status()).toBe(200);
  const body: unknown = await response.json();
  if (isJsonRecord(body)) return body;
  throw new Error('Expected reading response body to be a JSON object.');
}

export function getReportFreeFocus(body: JsonRecord): JsonRecord {
  const report = isJsonRecord(body.report) ? body.report : null;
  const freeFocus = report && isJsonRecord(report.free_focus) ? report.free_focus : null;
  if (freeFocus) return freeFocus;
  throw new Error('Expected reading response report.free_focus to be a JSON object.');
}

export function getReadingMetadata(body: JsonRecord): JsonRecord {
  const metadata = isJsonRecord(body.metadata) ? body.metadata : null;
  if (metadata) return metadata;
  throw new Error('Expected reading response metadata to be a JSON object.');
}

export function getMetadataRecord(metadata: JsonRecord, key: string): JsonRecord {
  const value = metadata[key];
  if (isJsonRecord(value)) return value;
  throw new Error(`Expected reading response metadata.${key} to be a JSON object.`);
}

export function expectBoundedGaeunAction(value: unknown): string {
  expect(typeof value).toBe('string');
  const text = typeof value === 'string' ? value.trim() : '';
  expect(text.length).toBeGreaterThanOrEqual(1);
  expect(text.length).toBeLessThanOrEqual(180);
  expect(text).not.toMatch(forbiddenGaeunActionPattern);
  return text;
}

export function getDecisionActionMetadata(body: JsonRecord): JsonRecord {
  return getMetadataRecord(getReadingMetadata(body), 'decisionAction');
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
        amount: 3.99,
        currency: 'USD',
        formattedPrice: '$3.99',
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
            gaeun_action: '가은 액션: 오늘 15분 동안 지원 조건표를 쓰고, 바로 퇴사 통보는 피하세요.',
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

export async function mockDecisionReadingSave(page: Page): Promise<JsonRecord[]> {
  const requests: JsonRecord[] = [];
  await page.route('**/api/reading/save', async (route) => {
    requests.push(parseJsonRecord(route.request().postData()));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'qa-decision-reading',
        accessKey: 'qa-access-key',
      }),
    });
  });
  return requests;
}

export async function openDecisionStart(page: Page): Promise<void> {
  await mockDecisionGrowthTracking(page);
  await mockDecisionReadingPrice(page);
  await mockDecisionReadingGeneration(page);
  await mockDecisionReadingSave(page);
  await page.goto(decisionStartPath);
  await expect(page.locator('textarea').first()).toHaveValue(decisionQuestion);
  const submitButton = page.getByRole('button', { name: /첫 판정 열기|OPEN FIRST VERDICT|무료 판정 먼저 보기|SEE MY FREE VERDICT/i });
  const birthDateInput = page.locator('input[placeholder="YYYY-MM-DD"]').first();
  await expect(submitButton).toBeDisabled();

  for (const partialBirthDate of ['1992', '1992-03', '1992-3-4']) {
    await birthDateInput.fill(partialBirthDate);
    await expect(submitButton).toBeDisabled();
  }

  await birthDateInput.fill(decisionBirthDate);
  await expect(submitButton).toBeEnabled();
}
