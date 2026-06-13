import type { PremiumReportPartial } from './types';

// ============================================================================
// R3: Phase 간 핵심 결론 전달 헬퍼
// Phase 2만 previousData를 사용하던 것을 Phase 3-5B까지 확장
// 전체 JSON을 덤프하지 않고, 핵심 결론만 추출하여 토큰 절약
// ============================================================================
export function buildPreviousPhaseContext(
  previousData: PremiumReportPartial | null | undefined,
  lang: 'ko' | 'en' = 'ko'
): string {
  if (!previousData) return '';

  const isEn = lang === 'en';
  const lines: string[] = [];

  // Phase 1 핵심: 요약 제목 + 신뢰 점수
  if (previousData.summary) {
    lines.push(isEn
      ? `- Report title: "${previousData.summary.title}"`
      : `- 리포트 제목: "${previousData.summary.title}"`
    );
    lines.push(isEn
      ? `- Trust score: ${previousData.summary.trust_score}/5 (${previousData.summary.trust_reason})`
      : `- 신뢰 점수: ${previousData.summary.trust_score}/5 (${previousData.summary.trust_reason})`
    );
  }

  // Phase 1 핵심: 오행 균형 (core_analysis)
  const coreAnalysis = previousData.core_analysis as { lacking_elements?: { elements?: string }; abundant_elements?: { elements?: string } } | undefined;
  if (coreAnalysis) {
    if (coreAnalysis.lacking_elements?.elements) {
      lines.push(isEn
        ? `- Lacking elements: ${coreAnalysis.lacking_elements.elements}`
        : `- 부족 오행: ${coreAnalysis.lacking_elements.elements}`
      );
    }
    if (coreAnalysis.abundant_elements?.elements) {
      lines.push(isEn
        ? `- Abundant elements: ${coreAnalysis.abundant_elements.elements}`
        : `- 과다 오행: ${coreAnalysis.abundant_elements.elements}`
      );
    }
  }

  // Phase 2 핵심: 사주 분석 결론 (일간, 신강/신약)
  const sajuSections = previousData.saju_sections as Array<{ id?: string; title?: string; content?: string }> | undefined;
  if (sajuSections && Array.isArray(sajuSections)) {
    const dayMaster = sajuSections.find(s => s.id === 'day_master');
    const strength = sajuSections.find(s => s.id === 'strength');
    if (dayMaster?.content) {
      const snippet = dayMaster.content.slice(0, 150);
      lines.push(isEn
        ? `- Day master analysis (summary): ${snippet}...`
        : `- 일간 분석 (요약): ${snippet}...`
      );
    }
    if (strength?.content) {
      const snippet = strength.content.slice(0, 100);
      lines.push(isEn
        ? `- Strength assessment (summary): ${snippet}...`
        : `- 신강/신약 판단 (요약): ${snippet}...`
      );
    }
  }

  if (lines.length === 0) return '';

  const tag = isEn ? 'previous_phase_context' : '이전_분석_핵심';
  const instruction = isEn
    ? 'Reference these prior conclusions for consistency. Do not contradict them unless new data warrants it.'
    : '이전 Phase의 핵심 결론입니다. 일관성을 위해 참조하되, 새로운 데이터가 있을 때만 수정하세요.';

  return `\n<${tag}>\n${instruction}\n${lines.join('\n')}\n</${tag}>`;
}
