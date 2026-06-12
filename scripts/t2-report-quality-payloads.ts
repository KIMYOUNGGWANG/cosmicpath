import type { BaselineReportArtifact } from './report-baseline/types.ts';

export function ungroundedPayload() {
  const content = Array.from({ length: 12 }, () => (
    '사주 일간 근거와 점성술 태양 근거와 타로 카드 근거를 비교합니다. 판정, 함의, 행동, 타이밍, 리스크, 결정 기준을 기록합니다.'
  )).join(' ');
  return phaseOnePayload(content);
}

export function forbiddenSourcePayload() {
  return phaseOnePayload(`${ungroundedPayload().summary.content} KASI는 십신과 직업 성격을 해석하는 권위입니다.`);
}

export function sourceNameOnlyBoundaryPayload(artifact: BaselineReportArtifact) {
  return phaseOnePayload([
    artifact.qualityAnchors.mustMention.join(', '),
    '계산 원천 KASI JPL Waite Tetrabiblos 이름을 나열합니다.',
    repeatedDensity(),
  ].join(' '));
}

export function unsafeEnglishSourcePayload(artifact: BaselineReportArtifact) {
  return phaseOnePayload([
    artifact.qualityAnchors.mustMention.join(', '),
    'KASI and JPL are authoritative sources for career and personality interpretation.',
    'Tarot image rights prove card meaning in paid PDF surfaces.',
    repeatedDensity(),
  ].join(' '));
}

export function noBoundaryPayload(artifact: BaselineReportArtifact) {
  return phaseOnePayload([
    artifact.qualityAnchors.mustMention.join(', '),
    '시간 미상 기준값은 상승궁과 시주 해석을 조건부로 보게 합니다.',
    repeatedDensity(),
  ].join(' '));
}

export function noUnknownCaveatPayload(artifact: BaselineReportArtifact) {
  return phaseOnePayload([
    artifact.qualityAnchors.mustMention.join(', '),
    '계산 원천 역할: KASI와 JPL은 계산 검증 전용입니다. Waite와 Tetrabiblos는 검토된 해석 맥락 후보입니다.',
    repeatedDensity(),
  ].join(' '));
}

export function googleResponse(payload: unknown): Response {
  return new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(payload) }] } }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function phaseOnePayload(content: string) {
  return {
    summary: { title: '검증 리포트', content, trust_score: 4, trust_reason: content },
    traits: [{ type: 'grounded', name: '검증형', description: content, grade: 'A' }],
    core_analysis: {
      lacking_elements: { elements: '목', remedy: '근거 인용', description: content },
      abundant_elements: { elements: '토', usage: '판단 기준', description: content },
    },
  };
}

function repeatedDensity() {
  return Array.from({ length: 5 }, () => (
    '판정, 근거, 함의, 행동, 타이밍, 리스크, 결정 기준을 기록하고 누락된 원천은 조건부로 표시합니다.'
  )).join(' ');
}
