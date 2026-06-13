import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';

import { registerTypeScriptLoader } from './report-test-data/ts-loader.ts';

type GroundingResult = {
  readonly passed: boolean;
  readonly reasons: readonly string[];
};

type GroundingApi = {
  readonly scorePremiumGrounding: (
    value: unknown,
    userData: unknown,
    phaseNumber?: number,
  ) => GroundingResult;
};

const localRequire = createRequire(import.meta.url);

const USER_DATA = {
  language: 'ko',
  currentDate: '2026-06-06',
  sajuData: {
    dayMaster: '甲',
    yeonPillar: { stem: '甲', branch: '子' },
    monthPillar: { stem: '丙', branch: '寅' },
    dayPillar: { stem: '甲', branch: '午' },
    hourPillar: { stem: '丁', branch: '卯' },
  },
  astroData: {
    sunSign: '양자리',
    moonSign: '황소자리',
    ascendant: '게자리',
  },
  tarotCards: [
    { name: '마법사', isReversed: false },
    { name: '절제', isReversed: false },
  ],
} as const;

const BASE_EVIDENCE_TEXT = [
  '일간 甲, 연주 甲子, 월주 丙寅, 일주 甲午, 시주 丁卯를 근거로 판단합니다.',
  '태양 양자리, 달 황소자리, 상승궁 게자리의 타이밍 차이를 함께 봅니다.',
  '마법사 정방향과 절제 정방향은 질문 주변의 즉각 신호입니다.',
  'KASI/JPL 계산 검증 전용 (calculation-only) 경계를 리포트에 표시합니다.',
  '계산 원천은 해석 권위가 아님 (not doctrine/personality authority)을 분리합니다.',
  'Waite/Tetrabiblos 검토된 텍스트 후보 (reviewed text candidates)만 의미 맥락에 씁니다.',
  '원문 복사 금지 (no raw source text copying)를 지킵니다.',
  '타로 이미지 권리와 의미 근거 분리를 밝힙니다.',
].join(' ');

function loadGroundingApi(): GroundingApi {
  const restoreLoader = registerTypeScriptLoader();
  try {
    const moduleValue: unknown = localRequire('../src/lib/ai/premium-grounding.ts');
    if (!isGroundingApi(moduleValue)) {
      throw new Error('premium-grounding API shape changed');
    }
    return moduleValue;
  } finally {
    restoreLoader();
  }
}

function isGroundingApi(value: unknown): value is GroundingApi {
  return isRecord(value) && typeof value.scorePremiumGrounding === 'function';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function payloadWith(content: string): unknown {
  return {
    summary: {
      title: '상용 톤 검증',
      content: `${BASE_EVIDENCE_TEXT} ${content}`,
      trust_reason: '사주, 점성, 타로, 출처 경계가 모두 직접 인용되었습니다.',
    },
  };
}

function assertCommercialToneGuard(api: GroundingApi): void {
  const safe = api.scorePremiumGrounding(
    payloadWith('결론은 실행 검증 창을 열고 행동 크기를 줄여 재검토하는 것입니다.'),
    USER_DATA,
    1,
  );
  assert.equal(safe.passed, true, safe.reasons.join(','));

  const unsafeKorean = api.scorePremiumGrounding(
    payloadWith('운명의 터닝 포인트이자 D-Day입니다. 우주가 문을 열어주는 날이니 수확의 날로 단정합니다.'),
    USER_DATA,
    1,
  );
  assert.equal(unsafeKorean.passed, false);
  assert.match(unsafeKorean.reasons.join(','), /commercial_tone/);

  const unsafeSymbolic = api.scorePremiumGrounding(
    payloadWith('전생의 테마와 해소해야 할 카르마가 이번 생의 영혼 미션을 확정합니다.'),
    USER_DATA,
    1,
  );
  assert.equal(unsafeSymbolic.passed, false);
  assert.match(unsafeSymbolic.reasons.join(','), /commercial_tone/);

  console.log('premium_commercial_tone_quality_guard');
}

assertCommercialToneGuard(loadGroundingApi());
console.log('Premium commercial tone quality verification passed');
