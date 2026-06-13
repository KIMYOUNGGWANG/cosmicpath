import type { PremiumGroundingAnchor } from './premium-grounding';

const SOURCE_BOUNDARY_RULES = [
  {
    label: 'calculationOnly',
    text: 'KASI/JPL 계산 검증 전용 (calculation-only)',
    pattern: /(?:KASI|JPL)[^.\n]*(?:계산|검증|calendar|ephemeris|position)[^.\n]*(?:전용|만|only|validate)|(?:계산|검증|calendar|ephemeris|position)[^.\n]*(?:KASI|JPL)[^.\n]*(?:전용|만|only|validate)/iu,
  },
  {
    label: 'notDoctrineAuthority',
    text: '계산 원천은 해석 권위가 아님 (not doctrine/personality authority)',
    pattern: /(?:해석\s*권위|doctrine|personality claims?)[^.\n]*(?:쓰지|아님|아닙|not|by itself)|(?:not|아님|아닙|쓰지)[^.\n]*(?:해석\s*권위|doctrine|personality claims?)/iu,
  },
  {
    label: 'reviewedTextCandidates',
    text: 'Waite/Tetrabiblos 검토된 텍스트 후보 (reviewed text candidates)',
    pattern: /(?:Waite|Tetrabiblos)[^.\n]*(?:검토|후보|review|candidate|classical|doctrine)|(?:검토|후보|review|candidate)[^.\n]*(?:Waite|Tetrabiblos)/iu,
  },
  {
    label: 'noRawSourceCopying',
    text: '원문 복사 금지 (no raw source text copying)',
    pattern: /(?:원문|raw source text)[^.\n]*(?:복사하지|copy|not|never|금지)|(?:do not|never|not)[^.\n]*(?:copy|raw source text)/iu,
  },
  {
    label: 'tarotImageRightsSeparated',
    text: '타로 이미지 권리와 의미 근거 분리 (tarot image rights separate from meaning)',
    pattern: /(?:타로\s*이미지\s*권리|tarot image rights|text\/image rights|image rights)[^.\n]*(?:의미|근거|separate|prove|not|아님|아닙|분리)/iu,
  },
] as const;

const FORBIDDEN_SOURCE_PATTERNS = [
  /KASI[^.\n]*(?:십신|격국|용신|성격|연애|직업)/iu,
  /JPL[^.\n]*(?:성격|연애|직업|타로|사주\s*해석)/iu,
  /(?:KASI|JPL)[^.\n]*(?:are|is|as)[^.\n]*(?:authority|authoritative|basis|source)[^.\n]*(?:personality|career|relationship|tarot|saju|doctrine|interpretation)/iu,
  /(?:이미지\s*권리|image rights|visual rights)[^.\n]*(?:카드\s*의미의?\s*근거|해석\s*근거|prove|ground|authorize|determine)/iu,
] as const;

export function buildSourceBoundaryAnchors(): readonly PremiumGroundingAnchor[] {
  return SOURCE_BOUNDARY_RULES.map((rule) => ({
    family: 'sourceBoundary',
    label: rule.label,
    text: rule.text,
    pattern: rule.pattern,
  }));
}

export function sourceBoundaryReasons(joined: string): readonly string[] {
  return FORBIDDEN_SOURCE_PATTERNS
    .filter((pattern) => pattern.test(joined))
    .map((pattern) => `forbidden_source_boundary:${pattern.source}`);
}
