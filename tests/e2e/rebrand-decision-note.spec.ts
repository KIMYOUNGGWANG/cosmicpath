import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

test.use({ locale: 'ko-KR' });

const firstViewportOldBrandPattern =
  /\bAI\b|Destiny|Fortune|Cosmic Radar|Premium Report|전체 리포트|오라클/i;

const legacyVisibleCopyPattern =
  /Oracle Snapshot|Reveal My Destiny|Not generic fortune copy|Oracle Chat|Premium Report|Full Report|Full Reading|전체 해석|전체 리포트|오라클의 문|오라클 경로|Destiny Revealed|Detailed Decision Note|Cosmic Compatibility Full Report|optional evidence layers|선택적 근거 레이어로만|CosmicPath 3단분석/i;

function projectFile(relativePath: string) {
  return path.join(process.cwd(), relativePath);
}

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringField(record: JsonRecord | undefined, key: string): string | null {
  const value = record?.[key];
  return typeof value === 'string' ? value : null;
}

function arrayField(record: JsonRecord | undefined, key: string): readonly unknown[] {
  const value = record?.[key];
  return Array.isArray(value) ? value : [];
}

function jsonLdTypeIncludes(record: JsonRecord, type: string): boolean {
  const value = record['@type'];
  if (typeof value === 'string') return value === type;
  return Array.isArray(value) && value.some((item) => item === type);
}

function jsonLdGraphNodes(payload: unknown): readonly JsonRecord[] {
  if (!isJsonRecord(payload)) return [];

  const graph = payload['@graph'];
  if (Array.isArray(graph)) {
    return graph.filter(isJsonRecord);
  }

  return [payload];
}

test.describe('CosmicPath frontend rebrand', () => {
  test('landing presents CosmicPath Decision Note brand', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.addInitScript(() => localStorage.setItem('user_language', 'ko'));
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
    await page.goto('/');

    await expect(page).toHaveTitle(/CosmicPath.*Decision Note/i);
    await expect(
      page.getByRole('heading', {
        name: /One delayed choice.*Three cross-checks.*One next move|미뤄둔 선택 하나/i,
      })
    ).toBeVisible();

    await expect(page.getByText(/First verdict free|첫 판정은 무료/i).first()).toBeVisible();
    await expect(page.getByText(/Saju structure.*astrology timing.*tarot's immediate signal|사주.*구조.*점성.*타이밍.*타로.*즉각/i).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/3단분석으로 열기|Open my 3-layer reading|3단 근거 보기|3단분석 시작|CosmicPath 3단분석|optional evidence layers|선택적 근거 레이어로만/i);

    const cta = page.getByRole('link', {
      name: /커리어 결정부터 보기|Start with a career decision/i,
    }).first();
    const href = await cta.getAttribute('href');
    expect(href).not.toBeNull();

    const target = new URL(href ?? '', 'https://cosmicpath.app');
    expect(target.pathname).toBe('/start');
    expect(target.searchParams.get('reset')).toBe('true');
    expect(target.searchParams.get('entry')).toBe('decision_timing_rebuild_v1');
    expect(target.searchParams.get('context')).toBe('career');
    const prefilledQuestion = target.searchParams.get('question');
    expect([
      '하반기에 이직, 사업, 지금 일 중 어디에 힘을 실어야 할까.',
      'Should I change jobs, build my own thing, or deepen the work I have now?',
    ]).toContain(prefilledQuestion);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: '.omo/evidence/cosmicpath-career-first/home-desktop-1440-playwright-final.png',
    });

    await cta.click();
    await expect(page).toHaveURL(/\/start\?.*context=career/);
    await expect(page.locator('textarea').first()).toHaveValue(prefilledQuestion ?? '');
  });

  test('start empty relationship question keeps Decision Note reception language', async ({ page }) => {
    await page.goto('/start?reset=true&context=love&entry=next_move_report_mvp_v1&lang=ko&question=');

    await expect(page.locator('textarea').first()).toBeVisible();
    await expect(page.getByText(/Decision Note 접수실/).first()).toBeVisible();
    await expect(page.getByText(/01 선택 질문/).first()).toBeVisible();
    await expect(page.getByText(/02 생년월일 기준/).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error|Next\.js/);

    const firstScreenText = await page.locator('body').innerText();
    expect(firstScreenText).not.toMatch(firstViewportOldBrandPattern);
    expect(firstScreenText).not.toMatch(/3단분석 접수실|3-Layer Reading Intake/);
  });

  test('share legal and payment surfaces keep decision-note regression language', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('body')).toContainText('7일 결정 패킷은 Stripe checkout을 통해 $3.99 USD의 단건 디지털 리포트');
    await expect(page.locator('body')).not.toContainText(/AI-generated|Oracle|Fortune|Destiny|Premium Report/i);

    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
    await page.goto('/privacy');
    await expect(page.getByText(/결정 정리 선택 정보/i).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/AI-generated|Oracle|Fortune|Destiny|Premium Report/i);

    const publicCopyFiles = [
      'src/app/share/[id]/SharedPageClient.tsx',
      'src/app/share/[id]/page.tsx',
      'src/app/start/start-reveal-stage.tsx',
      'src/app/start/start-tarot-stage.tsx',
      'src/app/start/start-result-decision-brief.tsx',
      'src/components/share/SharePanel.tsx',
      'src/components/reading/share-card.tsx',
      'src/app/api/og/route.tsx',
      'src/app/api/og/reading/[id]/route.tsx',
      'src/lib/reading-share.ts',
      'src/lib/payment/payment-config.ts',
      'src/components/payment/PaymentModalPricePanel.tsx',
    ] as const;

    for (const relativePath of publicCopyFiles) {
      const source = readFileSync(projectFile(relativePath), 'utf8');
      expect(source, `${relativePath} should not expose old public brand copy`).not.toMatch(
        legacyVisibleCopyPattern
      );
    }

    const paymentConfig = readFileSync(projectFile('src/lib/payment/payment-config.ts'), 'utf8');
    expect(paymentConfig).toContain('name: PAID_DECISION_REPORT_NAME_EN');
    expect(paymentConfig).toContain("description: '7-day decision packet unlock'");

    const decisionBrief = readFileSync(projectFile('src/app/start/start-result-decision-brief.tsx'), 'utf8');
    expect(decisionBrief).toContain('one-time');
    expect(decisionBrief).toContain('7-Day Decision Packet');
    expect(decisionBrief).toContain('7일 결정 패킷');
    expect(decisionBrief).toContain('why this verdict');
    expect(decisionBrief).toContain('message/action variants');
    expect(decisionBrief).not.toMatch(/subscription|membership|auto-renew/i);
  });

  test('brand-product keeps CosmicPath as brand and Decision Note as product', async ({ page }) => {
    await page.goto('/brand');
    const brandFirstViewport = await page.locator('body').innerText();
    expect(brandFirstViewport).toContain('CosmicPath');
    expect(brandFirstViewport).not.toContain('Decision Note');

    const englishContactTiming = readFileSync(projectFile('src/app/en/contact-timing/page.tsx'), 'utf8');
    expect(englishContactTiming).toMatch(/title:\s*'Contact Decision Note'/);
    expect(englishContactTiming).toMatch(/>\s*CosmicPath\s*<\/Link>/);
    expect(englishContactTiming).toMatch(/First Decision Note free · 7-Day Decision Packet via Stripe/);
    expect(englishContactTiming).toMatch(/Decision support only/);

    await page.goto('/en/contact-timing');
    await expect(page.getByText('First Decision Note free · 7-Day Decision Packet via Stripe')).toBeVisible();
    await expect(page.getByText(/Saju = structure.*astrology = timing.*tarot = immediate signal/i).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Application error|Unhandled Runtime Error|Next\.js/);
  });

  test('structured-metadata keeps CosmicPath organization and Decision Note product', async ({ page }) => {
    await page.goto('/');

    const scripts = await page.locator('script[type="application/ld+json"]').evaluateAll((elements) =>
      elements.map((element) => element.textContent ?? '')
    );
    const nodes = scripts.flatMap((script) => {
      const parsed: unknown = JSON.parse(script);
      return jsonLdGraphNodes(parsed);
    });
    const organization = nodes.find((node) => jsonLdTypeIncludes(node, 'Organization'));
    const website = nodes.find((node) => jsonLdTypeIncludes(node, 'WebSite'));
    const service = nodes.find((node) => jsonLdTypeIncludes(node, 'Service'));
    const offerNames = arrayField(service, 'offers')
      .filter(isJsonRecord)
      .map((offer) => stringField(offer, 'name'));

    expect(stringField(organization, 'name')).toBe('CosmicPath');
    expect(stringField(website, 'name')).toBe('CosmicPath');
    expect(stringField(service, 'name')).toBe('CosmicPath Decision Note');
    expect(stringField(service, 'alternateName')).toBe('7-Day Decision Packet');
    expect(offerNames).toContain('First Decision Note');
    expect(offerNames).toContain('7-Day Decision Packet');

    const englishContactTiming = readFileSync(projectFile('src/app/en/contact-timing/page.tsx'), 'utf8');
    expect(englishContactTiming).toMatch(/title:\s*'Contact Decision Note'/);
    expect(englishContactTiming).toMatch(/siteName:\s*'CosmicPath'/);

    const heroScene = readFileSync(projectFile('src/components/landing/HeroScene.tsx'), 'utf8');
    const crossroadsSection = readFileSync(projectFile('src/components/landing/CrossroadsSection.tsx'), 'utf8');
    const globalHeader = readFileSync(projectFile('src/components/common/GlobalHeader.tsx'), 'utf8');
    const oldPrimaryCopy = /3단 근거 보기|3단분석 시작|CosmicPath 3단분석|Start one 3-layer reading|optional evidence layers|선택적 근거 레이어로만/;
    expect(heroScene).not.toMatch(oldPrimaryCopy);
    expect(crossroadsSection).not.toMatch(oldPrimaryCopy);
    expect(globalHeader).not.toMatch(oldPrimaryCopy);
  });
});
