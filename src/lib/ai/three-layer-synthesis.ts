export const CONVERGENCE_DIAGNOSIS_LEVELS = ['all_aligned', 'two_aligned', 'divergent'] as const;

export type ConvergenceDiagnosisLevel = typeof CONVERGENCE_DIAGNOSIS_LEVELS[number];

export type ThreeLayerConvergenceDiagnosis = {
  readonly level: ConvergenceDiagnosisLevel;
  readonly shared_signal: string;
  readonly conflict_note: string;
  readonly decision_rule: string;
  readonly verdict_modifier: string;
};

type SynthesisLanguage = 'ko' | 'en';
type PromptFormat = 'markdown' | 'inline';
type SourceRole = {
  readonly label: string;
  readonly role: string;
  readonly failureMode: string;
};

export const THREE_LAYER_SOURCE_ROLES = {
  saju: {
    label: 'Saju',
    role: 'structure: durable pattern, baseline temperament, repeating pressure',
    failureMode: 'do not turn it into a daily mood or a short-term event prediction',
  },
  astrology: {
    label: 'Astrology',
    role: 'timing: current pressure, release window, situational activation',
    failureMode: 'do not use it as the whole product identity or generic horoscope copy',
  },
  tarot: {
    label: 'Tarot',
    role: 'immediate signal: emotional weather, near-term risk, question-specific trigger',
    failureMode: 'do not let tarot overwrite birth-data evidence or become the only proof',
  },
} as const satisfies Record<string, SourceRole>;

type BuildFallbackConvergenceDiagnosisParams = {
  readonly language: SynthesisLanguage;
  readonly advisorEvidenceSummary?: string;
  readonly convergenceScore?: number;
};

type NormalizeConvergenceDiagnosisParams = BuildFallbackConvergenceDiagnosisParams;

function trimSentence(value: string | undefined, fallback: string, limit: number): string {
  const normalized = value?.replace(/\s+/g, ' ').trim() || fallback;

  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit).trim()}...`;
}

function resolveLevel(convergenceScore: number | undefined): ConvergenceDiagnosisLevel {
  if (typeof convergenceScore !== 'number') return 'two_aligned';
  if (convergenceScore >= 78) return 'all_aligned';
  if (convergenceScore >= 58) return 'two_aligned';
  return 'divergent';
}

function buildLevelCopy(level: ConvergenceDiagnosisLevel, language: SynthesisLanguage) {
  const copy = {
    all_aligned: {
      ko: {
        conflict: '세 원천이 같은 방향을 가리키므로 판정 강도를 높여도 됩니다.',
        modifier: '사주 구조, 점성 타이밍, 타로의 즉각 신호가 같은 결론으로 수렴합니다.',
      },
      en: {
        conflict: 'All three sources point in the same direction, so the verdict can be direct.',
        modifier: 'Saju structure, astrology timing, and tarot signal converge on the same decision.',
      },
    },
    two_aligned: {
      ko: {
        conflict: '두 원천은 정렬되지만 한 원천은 조건부 신호라서 실행 범위를 좁혀야 합니다.',
        modifier: '두 원천은 같은 방향이고, 나머지 신호는 행동 크기와 재검토 경계를 조정합니다.',
      },
      en: {
        conflict: 'Two sources align while one remains conditional, so the action should stay bounded.',
        modifier: 'Two sources support the verdict; the remaining signal limits action size and review timing.',
      },
    },
    divergent: {
      ko: {
        conflict: '세 원천이 갈라지므로 결론은 확정이 아니라 조건부 판정으로 내려야 합니다.',
        modifier: '신호가 분산되어 큰 결정보다 작은 검증과 재판정 경계가 먼저입니다.',
      },
      en: {
        conflict: 'The sources diverge, so the result must be a conditional verdict rather than a certainty.',
        modifier: 'Signals are split; use a small test and a review boundary before a major decision.',
      },
    },
  } as const;

  return copy[level][language];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: keyof ThreeLayerConvergenceDiagnosis): string {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function isConvergenceDiagnosisLevel(value: unknown): value is ConvergenceDiagnosisLevel {
  return typeof value === 'string' && CONVERGENCE_DIAGNOSIS_LEVELS.some((level) => level === value);
}

export function buildThreeLayerSynthesisPromptRule(
  language: SynthesisLanguage,
  format: PromptFormat = 'markdown'
): string {
  if (format === 'inline') {
    return language === 'en'
      ? 'Three-layer synthesis: Saju is structure, astrology is timing, tarot is the immediate signal. The final verdict must say where they align, where they conflict, and what rule turns that into action.'
      : '3단 합성 규칙: 사주는 구조, 점성은 타이밍, 타로는 즉각 신호입니다. 최종판정에서 일치점, 충돌점, 행동으로 바꾸는 판정 규칙을 반드시 말하세요.';
  }

  return language === 'en'
    ? '# Three-Layer Synthesis Rule\n- Treat CosmicPath as a Saju + Astrology + Tarot cross-reading.\n- Source roles: Saju = durable structure and repeating pattern; Astrology = current timing pressure and release window; Tarot = immediate emotional/situational signal around the question.\n- Keep all three source roles active in the paid verdict.\n- The final verdict must explicitly state: shared signal, conflict note, decision rule, and verdict modifier.\n- If the three sources diverge, lower certainty and prescribe a smaller test or review boundary instead of forcing a confident prediction.'
    : '# 3단 합성 규칙\n- CosmicPath는 사주 + 점성 + 타로 교차 리딩입니다.\n- 역할 분담: 사주 = 오래 반복되는 구조와 패턴, 점성 = 지금의 타이밍 압력과 풀리는 창, 타로 = 질문 주변의 즉각적인 감정/상황 신호.\n- 유료 최종판정에서는 세 원천 역할을 모두 살아 있게 쓰세요.\n- 최종판정은 반드시 공통 신호, 충돌 메모, 판정 규칙, 결론 보정 문장을 포함해야 합니다.\n- 세 원천이 갈라지면 확신을 낮추고, 큰 예측 대신 작은 검증이나 재검토 경계를 처방하세요.';
}

export function buildThreeLayerVerdictQualityContract(
  language: SynthesisLanguage,
  format: PromptFormat = 'markdown'
): string {
  if (format === 'inline') {
    return language === 'en'
      ? 'Premium verdict contract: every important paragraph follows Claim -> Evidence -> User implication -> Action boundary. A missing layer is not silently replaced; name the missing evidence and lower certainty.'
      : '프리미엄 판정 계약: 중요한 문단은 Claim -> Evidence -> User implication -> Action boundary 순서를 따른다. A missing layer is not silently replaced; 빠진 근거는 명시하고 확신도를 낮춘다.';
  }

  return language === 'en'
    ? `<THREE_LAYER_VERDICT_QUALITY_CONTRACT>
- Paragraph contract: Claim -> Evidence -> User implication -> Action boundary.
- Source-role contract:
  - ${THREE_LAYER_SOURCE_ROLES.saju.label}: ${THREE_LAYER_SOURCE_ROLES.saju.role}; ${THREE_LAYER_SOURCE_ROLES.saju.failureMode}.
  - ${THREE_LAYER_SOURCE_ROLES.astrology.label}: ${THREE_LAYER_SOURCE_ROLES.astrology.role}; ${THREE_LAYER_SOURCE_ROLES.astrology.failureMode}.
  - ${THREE_LAYER_SOURCE_ROLES.tarot.label}: ${THREE_LAYER_SOURCE_ROLES.tarot.role}; ${THREE_LAYER_SOURCE_ROLES.tarot.failureMode}.
- A missing layer is not silently replaced. If Saju, astrology, or tarot evidence is absent or weak, say so and reduce certainty/action size.
- final_verdict.core_message must be a decision argument, not a mood summary: source agreement -> user-specific implication -> first action/review boundary.
- Avoid abstract padding such as current energy, harmony, flow, new beginning, or universe says unless tied to explicit source data.
</THREE_LAYER_VERDICT_QUALITY_CONTRACT>`
    : `<THREE_LAYER_VERDICT_QUALITY_CONTRACT>
- 문단 계약: Claim -> Evidence -> User implication -> Action boundary.
- 원천 역할 계약:
  - 사주: 구조(반복 패턴, 기본 기질, 장기 압력). 단기 기분이나 하루 운세처럼 쓰지 말 것.
  - 점성: 타이밍(현재 압력, 풀리는 창, 상황 활성화). 전체 상품 정체성이나 별자리 운세 카피로 쓰지 말 것.
  - 타로: 즉각 신호(감정 날씨, 단기 리스크, 질문별 촉발점). 생년월일 근거를 덮어쓰거나 유일한 증거로 쓰지 말 것.
- A missing layer is not silently replaced. 사주, 점성, 타로 중 빠지거나 약한 근거가 있으면 명시하고 확신도/행동 크기를 낮출 것.
- final_verdict.core_message는 분위기 요약이 아니라 판정 논증이어야 한다: 원천 일치 -> 사용자별 함의 -> 첫 행동/재검토 경계.
- 현재 에너지, 조화, 흐름, 새로운 시작, 우주가 말한다 같은 추상 패딩은 명시적 원천 데이터와 연결되지 않으면 금지.
</THREE_LAYER_VERDICT_QUALITY_CONTRACT>`;
}

export function buildFallbackConvergenceDiagnosis(
  params: BuildFallbackConvergenceDiagnosisParams
): ThreeLayerConvergenceDiagnosis {
  const level = resolveLevel(params.convergenceScore);
  const levelCopy = buildLevelCopy(level, params.language);
  const sharedSignal = params.language === 'en'
    ? trimSentence(
        params.advisorEvidenceSummary,
        'The strongest shared signal must be read across structure, timing, and immediate context.',
        220
      )
    : trimSentence(
        params.advisorEvidenceSummary,
        '가장 강한 공통 신호는 구조, 타이밍, 즉각 맥락을 함께 대조해 읽어야 합니다.',
        220
      );
  const decisionRule = params.language === 'en'
    ? 'Use Saju for the repeating structure, astrology for the timing window, and tarot for the near-term signal; act only where the sources can support the same next move.'
    : '사주는 반복 구조, 점성은 타이밍 창, 타로는 단기 신호로 읽고, 세 원천이 같은 다음 행동을 지지하는 범위에서만 움직입니다.';

  return {
    level,
    shared_signal: sharedSignal,
    conflict_note: levelCopy.conflict,
    decision_rule: decisionRule,
    verdict_modifier: levelCopy.modifier,
  };
}

export function normalizeConvergenceDiagnosis(
  value: unknown,
  params: NormalizeConvergenceDiagnosisParams
): ThreeLayerConvergenceDiagnosis {
  const fallback = buildFallbackConvergenceDiagnosis(params);

  if (!isRecord(value)) return fallback;

  const levelValue = value.level;
  const level = isConvergenceDiagnosisLevel(levelValue) ? levelValue : fallback.level;

  return {
    level,
    shared_signal: readString(value, 'shared_signal') || fallback.shared_signal,
    conflict_note: readString(value, 'conflict_note') || fallback.conflict_note,
    decision_rule: readString(value, 'decision_rule') || fallback.decision_rule,
    verdict_modifier: readString(value, 'verdict_modifier') || fallback.verdict_modifier,
  };
}
