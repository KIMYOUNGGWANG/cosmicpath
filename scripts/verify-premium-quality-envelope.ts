import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

import { registerTypeScriptLoader } from './report-test-data/ts-loader.ts';

type QualityEnvelopeApi = {
  readonly attachPremiumQualityEnvelope: (
    report: Record<string, unknown>,
    userData: Record<string, unknown>,
  ) => Record<string, unknown>;
};

const localRequire = createRequire(import.meta.url);

function loadQualityEnvelopeApi(): QualityEnvelopeApi {
  const loaded: unknown = localRequire('../src/lib/ai/premium-quality-envelope.ts');
  if (isQualityEnvelopeApi(loaded)) return loaded;
  throw new TypeError('premium quality envelope API unavailable');
}

function isQualityEnvelopeApi(value: unknown): value is QualityEnvelopeApi {
  return isRecord(value) && typeof value.attachPremiumQualityEnvelope === 'function';
}

function sampleReport(): Record<string, unknown> {
  return {
    summary: {
      title: '밴쿠버 비자 결정 창',
      content: '2026-06-20부터 문서와 비용 비교를 먼저 점검하는 리포트입니다.',
      trust_score: 4,
      trust_reason: '사주 일간, Moon timing, Tarot spread, risk boundary가 같은 검토 창을 가리킵니다.',
    },
    saju_sections: [{ id: 'structure', title: '사주 구조', content: 'Day Master와 Four Pillars는 기준을 글로 고정한 뒤 비교하라는 구조를 보여줍니다.' }],
    astro_deep: { sun_moon_dynamic: { title: 'Moon timing', content: 'Moon and ascendant timing support a review boundary before a larger decision.' } },
    tarot_details: [{ position: 'advice', card_name: 'Justice', is_reversed: false, interpretation: 'Tarot spread says compare evidence before action.' }],
    action_plan: [
      { date: '2026-06-20', title: '문서 점검', description: '전문가 질문과 문서 목록을 작성합니다.', type: 'opportunity' },
      { date: '2026-06-27', title: '비용 비교', description: 'A/B 시나리오 비용과 리스크를 비교합니다.', type: 'opportunity' },
      { date: '2026-07-04', title: '재검토 기준', description: '검토 기준과 다음 상담 질문을 정리합니다.', type: 'warning' },
    ],
    final_verdict: {
      title: '최종 결론',
      core_message: 'Saju, astrology, and Tarot all point to a measurable review window.',
      saju_foundation: 'Four Pillars evidence asks for a written boundary.',
      astro_support: 'Moon and ascendant timing favor a short review window.',
      tarot_insight: 'The Justice card frames comparison and evidence.',
      convergence_diagnosis: {
        level: 'all_aligned',
        shared_signal: 'All three layers point to comparison before commitment.',
        conflict_note: 'The uncertainty is outcome timing, not the need for review.',
        decision_rule: 'Write questions, compare documents, and review after the window.',
        verdict_modifier: 'Aligned sources allow a clear but bounded recommendation.',
      },
      action_priorities: ['문서 비교', '비용 리스크 산정', '전문가 질문 정리'],
      closing_words: 'The next move is measurable review, not a fixed outcome.',
    },
  };
}

function sampleUserData(): Record<string, unknown> {
  return {
    name: '김영광',
    birthDate: '1993-08-02',
    birthTime: '15:10',
    context: 'career',
    question: '밴쿠버에서 버텨야 할지 한국으로 돌아가야 할지 모르겠고 11월에 비자가 만료됩니다.',
  };
}

function run(): void {
  const restoreLoader = registerTypeScriptLoader();
  const directory = mkdtempSync(join(tmpdir(), 'premium-quality-envelope-'));
  try {
    const enriched = loadQualityEnvelopeApi().attachPremiumQualityEnvelope(sampleReport(), sampleUserData());
    assert.equal(enriched.reportMode, 'full_premium');
    assert.ok(Array.isArray(enriched.sections));
    assert.ok(Array.isArray(enriched.evidenceBlocks));

    const fixturePath = join(directory, 'quality-envelope.json');
    writeFileSync(fixturePath, `${JSON.stringify(enriched, null, 2)}\n`, 'utf8');
    const output = execFileSync(process.execPath, ['scripts/verify-premium-report-quality.ts', '--fixture', fixturePath], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    assert.match(output, /premium_report_quality_fixture_passed/);
    console.log('premium_quality_envelope_scores_current_report_contract');
  } finally {
    restoreLoader();
    rmSync(directory, { recursive: true, force: true });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

run();
