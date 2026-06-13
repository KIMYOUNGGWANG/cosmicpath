import type { BaselineReportArtifact, ReportQualityFixture } from './types.ts';

type BaselineFamily = 'saju' | 'astrology' | 'tarot';

function familyText(fixture: ReportQualityFixture, family: BaselineFamily) {
  const anchors = anchorsFor(fixture, family);
  return [
    roleIntro(family),
    `근거: ${anchors.join(', ')}.`,
    `판정: 질문 "${questionText(fixture)}"에 대해 이 신호들은 같은 결론이 아니라 서로 다른 검증축입니다.`,
    '함의: 각 근거를 분리해 비교해야 하며, 누락된 값은 조건부로 적어야 합니다.',
    '행동: 다음 결정은 7일 검증 창 안에서 실제 반응, 일정, 위험 신호를 함께 기록한 뒤 판단합니다.',
  ].join(' ');
}

export function buildBaselineReport(fixture: ReportQualityFixture): BaselineReportArtifact {
  const summaryContent = [
    `${fixture.label} 기준 baseline report입니다.`,
    familyText(fixture, 'saju'),
    familyText(fixture, 'astrology'),
    familyText(fixture, 'tarot'),
    caveatText(fixture),
    sourceBoundaryText(fixture),
  ].join('\n\n');

  return {
    id: `${fixture.id}-baseline`,
    label: fixture.label,
    sourceFixtureId: fixture.id,
    generatedAt: new Date().toISOString(),
    premiumUserData: fixture.premiumUserData,
    qualityAnchors: fixture.qualityAnchors,
    report: {
      summary: { title: `${fixture.label} grounded baseline`, content: summaryContent },
      sections: buildSections(fixture),
      phaseOnePayload: buildPhaseOnePayload(summaryContent),
    },
  };
}

function buildSections(fixture: ReportQualityFixture): BaselineReportArtifact['report']['sections'] {
  return [
    { family: 'saju', title: '사주 앵커', content: familyText(fixture, 'saju') },
    { family: 'astrology', title: '점성술 앵커', content: familyText(fixture, 'astrology') },
    { family: 'tarot', title: '타로 앵커', content: familyText(fixture, 'tarot') },
    { family: 'sourceBoundary', title: '원천 역할', content: sourceBoundaryText(fixture) },
  ];
}

function buildPhaseOnePayload(content: string): Record<string, unknown> {
  return {
    summary: { title: '근거 기반 프리미엄 baseline', content, trust_score: 5, trust_reason: content },
    traits: [{ type: 'grounded', name: '근거 검증형', description: content, grade: 'A' }],
    core_analysis: {
      lacking_elements: { elements: '검증값', remedy: '근거 직접 인용', description: content },
      abundant_elements: { elements: '판단근거', usage: '원천 역할 분리', description: content },
    },
  };
}

function roleIntro(family: BaselineFamily): string {
  switch (family) {
    case 'saju':
      return '원천 역할: 사주 구조 레이어는 반복 패턴과 장기 선택 습관을 먼저 잡습니다.';
    case 'astrology':
      return '원천 역할: 점성 타이밍 레이어는 지금의 시기, 압력, 검증 창을 보조로 조정합니다.';
    case 'tarot':
      return '원천 역할: 타로 즉각 신호 레이어는 현재 바로 드러난 감정과 장애물을 행동 크기로 바꿉니다.';
    default:
      return assertNever(family);
  }
}

function anchorsFor(fixture: ReportQualityFixture, family: BaselineFamily): readonly string[] {
  const predicates = {
    saju: /^(일간|연주|월주|일주|시주)\s/u,
    astrology: /^(태양|달|상승궁)\s/u,
    tarot: /(정방향|역방향)$/u,
  };
  return fixture.qualityAnchors.mustMention.filter((anchor) => predicates[family].test(anchor));
}

function caveatText(fixture: ReportQualityFixture) {
  const caveats = fixture.qualityAnchors.caveats.join(' ');
  return `경계: ${caveats.replace('unknownTime=true', '시간 미상 unknownTime=true')}`;
}

function sourceBoundaryText(fixture: ReportQualityFixture) {
  return [
    '계산 원천 역할: KASI와 JPL은 계산 검증에만 사용하고 해석 권위로 쓰지 않습니다.',
    '문헌 역할: Waite와 Tetrabiblos는 검토된 텍스트 후보로만 다루며 원문을 복사하지 않습니다.',
    `source boundaries: ${fixture.qualityAnchors.sourceBoundaries.join(' ')}`,
  ].join(' ');
}

function questionText(fixture: ReportQualityFixture) {
  const question = fixture.premiumUserData.question;
  return typeof question === 'string' ? question : '종합 질문';
}

function assertNever(value: never): never {
  throw new TypeError(`Unexpected baseline family: ${String(value)}`);
}
