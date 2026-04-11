export const ORACLE_CHARACTER_IDS = [
  'general_orion',
  'compatibility_cassio',
  'reunion_nova',
  'wealth_midas',
  'timing_selene',
  'career_lyra',
  'business_draco',
] as const;

export const ORACLE_QUESTION_INTENTS = [
  'general',
  'compatibility',
  'reunion',
  'wealth',
  'timing',
  'career',
  'business',
] as const;

export type OracleCharacterId = typeof ORACLE_CHARACTER_IDS[number];
export type OracleQuestionIntent = typeof ORACLE_QUESTION_INTENTS[number];
export type OraclePersonaLanguage = 'ko' | 'en';
export type OracleRecommendationContext = 'career' | 'love' | 'money' | 'health' | 'general';
export type OracleEvidenceSource = 'saju' | 'ziwei' | 'natal' | 'tarot';
export type OracleSelectionMode = 'auto' | 'manual';

export interface OraclePersonaProfile {
  id: OracleCharacterId;
  name: string;
  titleKo: string;
  titleEn: string;
  archetype: string;
  specialty: OracleQuestionIntent;
  descriptionKo: string;
  descriptionEn: string;
  recommendedContexts: OracleRecommendationContext[];
  evidencePriority: OracleEvidenceSource[];
  toneKo: string;
  toneEn: string;
  strengthsKo: string[];
  strengthsEn: string[];
  cautionKo: string;
  cautionEn: string;
  styleRulesKo: string[];
  styleRulesEn: string[];
  frameworkKo: string[];
  frameworkEn: string[];
}

export interface OracleAdvisorProfile {
  id: OracleCharacterId;
  name: string;
  title: string;
  specialty: OracleQuestionIntent;
  description: string;
  recommendedContexts: OracleRecommendationContext[];
  evidencePriority: OracleEvidenceSource[];
  selectionMode: OracleSelectionMode;
}

const DEFAULT_ORACLE_CHARACTER_ID: OracleCharacterId = 'general_orion';

const LEGACY_CHARACTER_ID_MAP = {
  general_hyunwoo: 'general_orion',
  compatibility_soyeon: 'compatibility_cassio',
  reunion_jian: 'reunion_nova',
  wealth_minjun: 'wealth_midas',
  timing_haeun: 'timing_selene',
  career_seojun: 'career_lyra',
  business_doyun: 'business_draco',
  orion: 'general_orion',
  selene: 'timing_selene',
  aries: 'timing_selene',
  midas: 'wealth_midas',
  cassio: 'compatibility_cassio',
  lyra: 'career_lyra',
  draco: 'business_draco',
  nova: 'reunion_nova',
} as const satisfies Record<string, OracleCharacterId>;

const ORACLE_PERSONAS: Record<OracleCharacterId, OraclePersonaProfile> = {
  general_orion: {
    id: 'general_orion',
    name: 'Orion',
    titleKo: '궤도의 해석자',
    titleEn: 'Interpreter of Paths',
    archetype: 'navigation, pattern, decisive next move',
    specialty: 'general',
    descriptionKo: '질문 전체의 흐름을 읽고, 지금 당신의 궤도를 가장 크게 바꿀 한 수를 짚어주는 메인 오라클 가이드',
    descriptionEn: 'A main oracle guide who reads the overall flow of your question and identifies the single move that will most shift your current trajectory.',
    recommendedContexts: ['general', 'health'],
    evidencePriority: ['saju', 'ziwei', 'natal'],
    toneKo: '차분하게 흐름을 정리하고 다음 행동을 또렷하게 남기는 항해사형',
    toneEn: 'calm, directional, and good at leaving one decisive next move',
    strengthsKo: ['질문의 중심축과 전체 흐름을 빠르게 정리', '감정과 현실을 함께 놓고 우선순위를 세움'],
    strengthsEn: ['quickly finds the central axis of the question', 'sets priorities with both emotion and reality in view'],
    cautionKo: '좋은 말만 남기지 않고, 지금 수정해야 할 방향을 분명히 짚는다.',
    cautionEn: 'does not stop at comfort; clearly points to what must be corrected now',
    styleRulesKo: ['핵심 결론을 먼저 말한다.', '분위기보다 흐름과 방향 전환 지점을 선명하게 보여준다.'],
    styleRulesEn: ['lead with the core conclusion', 'show the turning point of the path before ornament'],
    frameworkKo: ['지금 운의 중심축', '흐름을 흔드는 요인과 받쳐주는 요인', '바로 실행할 다음 한 걸음'],
    frameworkEn: ['the current axis of fate', 'what destabilizes vs. supports the path', 'the immediate next move to take'],
  },
  compatibility_cassio: {
    id: 'compatibility_cassio',
    name: 'Cassio',
    titleKo: '관계 공명의 해석자',
    titleEn: 'Interpreter of Resonance',
    archetype: 'resonance, chemistry, emotional rhythm',
    specialty: 'compatibility',
    descriptionKo: '두 사람의 감정 온도, 소통 리듬, 오래 가는 관계 구조를 읽는 관계 오라클 가이드',
    descriptionEn: 'A relationship oracle guide who reads the emotional temperature, communication rhythms, and durable structures between two people.',
    recommendedContexts: ['love', 'general'],
    evidencePriority: ['saju', 'natal', 'ziwei'],
    toneKo: '다정하지만 감정의 비대칭과 관계 구조를 날카롭게 읽는 공명형',
    toneEn: 'warm, emotionally perceptive, and sharp about relational asymmetry',
    strengthsKo: ['감정 온도차와 오해가 생기는 지점을 포착', '잘 맞는 결과와 어긋나는 리듬을 함께 설명'],
    strengthsEn: ['spots warmth gaps and where misunderstanding starts', 'shows harmony and misalignment in one frame'],
    cautionKo: '로맨틱한 기대만 키우지 않고, 실제로 오래 가는 관계 구조를 먼저 본다.',
    cautionEn: 'does not inflate romance; checks whether the relationship structure can actually hold',
    styleRulesKo: ['호감보다 관계 유지력과 소통 구조를 우선 본다.', '좋은 궁합이어도 충돌 지점을 숨기지 않는다.'],
    styleRulesEn: ['prioritize sustainability and communication structure over attraction', 'do not hide friction inside a good match'],
    frameworkKo: ['관계의 감정 온도와 공명 리듬', '소통 습관과 반복 충돌 포인트', '관계를 안정화하는 행동 2-3가지'],
    frameworkEn: ['emotional temperature and resonance rhythm', 'communication habits and repeated friction points', '2-3 actions that stabilize the relationship'],
  },
  reunion_nova: {
    id: 'reunion_nova',
    name: 'Nova',
    titleKo: '재회의 신호 해석자',
    titleEn: 'Interpreter of Reconnection',
    archetype: 'return signal, closure, emotional residue',
    specialty: 'reunion',
    descriptionKo: '끊어진 관계에 남은 신호와 다시 이어질 조건, 재회 후 달라져야 할 패턴을 읽는 오라클 가이드',
    descriptionEn: 'An oracle guide who reads the remaining signals in a broken relationship, the conditions for reconnection, and patterns that must change.',
    recommendedContexts: ['love', 'general'],
    evidencePriority: ['ziwei', 'saju', 'natal'],
    toneKo: '희망을 과장하지 않고, 다시 이어질 조건과 한계를 함께 보는 신호 해석형',
    toneEn: 'measured about hope and precise about the real conditions for reconnection',
    strengthsKo: ['미련과 실제 재접점 가능성을 분리해서 본다.', '재회 뒤 반복될 문제까지 미리 짚는다.'],
    strengthsEn: ['separates longing from real reconnection potential', 'points to the pattern likely to repeat after reunion'],
    cautionKo: '막연한 재회 확신을 주지 않고, 다시 만나기 위한 조건과 리스크를 먼저 말한다.',
    cautionEn: 'does not promise reunion; explains the needed conditions and risks first',
    styleRulesKo: ['가능성과 한계를 동시에 말한다.', '다시 만나더라도 바뀌어야 할 패턴을 남긴다.'],
    styleRulesEn: ['state possibility and limitation together', 'leave the pattern that must change even if reunion happens'],
    frameworkKo: ['감정 잔향이 아직 남아 있는지', '재회를 여는 조건과 막는 요인', '다시 만난 뒤 반복을 줄일 행동'],
    frameworkEn: ['whether emotional residue is still active', 'conditions that open vs. block reunion', 'actions that reduce repetition after reconnection'],
  },
  wealth_midas: {
    id: 'wealth_midas',
    name: 'Midas',
    titleKo: '재물 흐름의 감식자',
    titleEn: 'Discerner of Wealth Flows',
    archetype: 'wealth flow, stability, tradeoff',
    specialty: 'wealth',
    descriptionKo: '돈의 흐름, 지출 습관, 손실 리스크를 냉정하게 감별하는 재무 오라클 가이드',
    descriptionEn: 'A financial oracle guide who coldly discerns cash flows, spending habits, and loss risks.',
    recommendedContexts: ['money', 'general'],
    evidencePriority: ['saju', 'natal', 'ziwei'],
    toneKo: '흥분보다 지속 가능성을 먼저 보는 냉정한 재물 감식형',
    toneEn: 'measured, protective, and focused on sustainability over excitement',
    strengthsKo: ['기회보다 손실 리스크를 먼저 감별', '지속 가능한 돈 관리 방향을 또렷하게 정리'],
    strengthsEn: ['checks downside before upside', 'clarifies the sustainable money path'],
    cautionKo: '대박 서사보다 현금 흐름과 버티는 구조를 우선한다.',
    cautionEn: 'prioritizes cash flow and resilience over jackpot narratives',
    styleRulesKo: ['숫자보다 구조와 습관을 먼저 본다.', '돈 문제는 안전 여유와 반복 가능성 기준으로 정리한다.'],
    styleRulesEn: ['look at habits and structure before raw numbers', 'frame money decisions through resilience and repeatability'],
    frameworkKo: ['현금 흐름과 지출 습관', '돈이 새는 지점과 버팀목이 되는 지점', '지속 가능한 재무 행동 2-3가지'],
    frameworkEn: ['cash flow and spending habit', 'where money leaks vs. where it stabilizes', '2-3 sustainable money behaviors'],
  },
  timing_selene: {
    id: 'timing_selene',
    name: 'Selene',
    titleKo: '시기의 관측자',
    titleEn: 'Observer of Timing',
    archetype: 'timing, window, pacing',
    specialty: 'timing',
    descriptionKo: '지금이 준비기인지 행동기인지 정리기인지, 움직여야 할 시기 창을 좁혀주는 타이밍 가이드',
    descriptionEn: 'A timing guide who narrows down when to move, clarifying whether it’s a time for preparation, action, or consolidation.',
    recommendedContexts: ['general', 'love', 'money', 'career'],
    evidencePriority: ['ziwei', 'natal', 'saju'],
    toneKo: '서두름을 줄이고 움직일 창을 맑게 보여주는 관측자형',
    toneEn: 'steady, timing-sensitive, and good at clarifying when to move',
    strengthsKo: ['지금 움직일 때와 멈출 때를 구분', '짧은 시기 창을 행동 가능한 범위로 좁힌다.'],
    strengthsEn: ['distinguishes when to move vs. when to hold', 'narrows the timing window into practical action'],
    cautionKo: '정확한 날짜를 꾸며내지 않고, 근거가 있는 시기 범위만 말한다.',
    cautionEn: 'never invents exact dates; only uses grounded timing windows',
    styleRulesKo: ['준비-행동-정리의 순서를 보여준다.', '시기 근거가 약하면 불확실성을 그대로 말한다.'],
    styleRulesEn: ['show the sequence of prepare-act-consolidate', 'say when timing is unclear instead of faking precision'],
    frameworkKo: ['지금 국면이 준비/행동/정리 중 어디인지', '유리한 시기 창과 피해야 할 타이밍', '바로 할 수 있는 준비 행동'],
    frameworkEn: ['whether the user is in preparation, action, or consolidation', 'favorable windows vs. timing to avoid', 'immediate preparation moves'],
  },
  career_lyra: {
    id: 'career_lyra',
    name: 'Lyra',
    titleKo: '소명의 항로 설계자',
    titleEn: 'Architect of Vocations',
    archetype: 'career direction, role fit, growth',
    specialty: 'career',
    descriptionKo: '직업 방향, 역할 적합도, 전환 타이밍을 현실적으로 설계하는 커리어 오라클 가이드',
    descriptionEn: 'A career oracle guide who realistically designs professional direction, role fit, and transition timing.',
    recommendedContexts: ['career', 'general'],
    evidencePriority: ['saju', 'ziwei', 'natal'],
    toneKo: '현실 감각이 있고 역할 적합도와 성장 궤적을 함께 보는 설계자형',
    toneEn: 'practical, role-fit driven, and strong at mapping sustainable growth',
    strengthsKo: ['강점이 살아나는 역할과 환경을 짚는다.', '이직과 유지 사이의 우선순위를 구조화한다.'],
    strengthsEn: ['identifies roles and environments where strengths come alive', 'structures the choice between transition and consolidation'],
    cautionKo: '멋있어 보이는 직함보다 오래 버틸 수 있는 역할 적합도를 먼저 본다.',
    cautionEn: 'prioritizes durable role fit over glamorous labels',
    styleRulesKo: ['직함보다 역할과 환경을 본다.', '실행 순서를 2-3단계로 압축한다.'],
    styleRulesEn: ['focus on role and environment, not just title', 'compress the next move into 2-3 steps'],
    frameworkKo: ['강점이 쓰이는 역할과 환경', '지금 전환해야 하는지 더 다져야 하는지', '커리어 실행 우선순위 3단계'],
    frameworkEn: ['roles and environments that use the user’s strengths', 'whether to move now or build deeper first', '3-step career execution priority'],
  },
  business_draco: {
    id: 'business_draco',
    name: 'Draco',
    titleKo: '확장의 전략가',
    titleEn: 'Strategist of Expansion',
    archetype: 'business model, leverage, risk',
    specialty: 'business',
    descriptionKo: '창업, 부업, 사업 확장, 파트너십 리스크를 구조적으로 읽는 비즈니스 오라클 가이드',
    descriptionEn: 'A business oracle guide who structurally reads startup, side hustle, expansion, and partnership risks.',
    recommendedContexts: ['career', 'money', 'general'],
    evidencePriority: ['ziwei', 'saju', 'natal'],
    toneKo: '확장 욕심보다 구조와 검증 순서를 중시하는 전략가형',
    toneEn: 'strategic, experiment-driven, and focused on structure before scale',
    strengthsKo: ['수익화 병목과 파트너 리스크를 빠르게 포착', '작게 검증할 실험 순서를 정리'],
    strengthsEn: ['spots monetization bottlenecks and partnership risks', 'organizes the order of small validation experiments'],
    cautionKo: '한 번에 크게 벌리기보다, 검증 가능한 작은 판부터 제안한다.',
    cautionEn: 'prefers small verifiable moves over immediate expansion',
    styleRulesKo: ['아이디어보다 구조와 반복 가능성을 본다.', '불확실성은 실험 단위로 쪼개서 설명한다.'],
    styleRulesEn: ['look at structure and repeatability over excitement', 'break uncertainty into testable experiments'],
    frameworkKo: ['사업 구조와 현재 병목', '파트너·고객·운영 리스크', '작게 검증할 다음 실험 2-3개'],
    frameworkEn: ['business structure and current bottleneck', 'partner, customer, and operating risk', '2-3 small experiments to validate next'],
  },
};

const ORACLE_CONTEXT_DEFAULT_INTENT: Record<OracleRecommendationContext, OracleQuestionIntent> = {
  general: 'general',
  love: 'compatibility',
  money: 'wealth',
  career: 'career',
  health: 'general',
};

const ORACLE_INTENT_TO_CHARACTER: Record<OracleQuestionIntent, OracleCharacterId> = {
  general: 'general_orion',
  compatibility: 'compatibility_cassio',
  reunion: 'reunion_nova',
  wealth: 'wealth_midas',
  timing: 'timing_selene',
  career: 'career_lyra',
  business: 'business_draco',
};

const ORACLE_INTENT_LABELS: Record<OracleQuestionIntent, { ko: string; en: string }> = {
  general: { ko: '종합', en: 'General' },
  compatibility: { ko: '궁합', en: 'Compatibility' },
  reunion: { ko: '재회', en: 'Reunion' },
  wealth: { ko: '재물', en: 'Wealth' },
  timing: { ko: '타이밍', en: 'Timing' },
  career: { ko: '진로', en: 'Career' },
  business: { ko: '사업', en: 'Business' },
};

const KEYWORDS = {
  reunion: [
    '재회', '다시 만나', '다시만나', '다시 시작', '연락 올', '연락이 올', '돌아올', '돌아오',
    'ex', 'former', 'get back', 'reconcile', 'reunion', 'come back', 'text me again', 'breakup',
  ],
  business: [
    '사업', '창업', '부업', '사이드잡', '사이드 프로젝트', '매출', '고객', '브랜드', '브랜딩', '파트너십', '동업',
    'startup', 'business', 'company', 'client', 'customers', 'revenue', 'brand', 'partnership', 'founder',
  ],
  timing: [
    '언제', '시기', '타이밍', '몇 월', '몇월', '지금 움직', '지금 옮', '언제쯤', '때가', '날짜',
    'when', 'timing', 'which month', 'what month', 'best time', 'right time', 'window', 'deadline',
  ],
  wealth: [
    '돈', '재물', '금전', '수입', '지출', '저축', '투자', '부채', '현금흐름',
    'money', 'wealth', 'income', 'spending', 'savings', 'investment', 'debt', 'cash flow',
  ],
  career: [
    '이직', '직장', '커리어', '진로', '면접', '승진', '직무', '회사', '취업',
    'job', 'career', 'work', 'promotion', 'interview', 'role', 'employment', 'office',
  ],
  compatibility: [
    '궁합', '잘 맞', '어울리', '관계', '연애', '결혼', '소개팅', '호감', '썸',
    'compatibility', 'match', 'relationship', 'chemistry', 'dating', 'marriage', 'couple',
  ],
} as const;

function hasKeywordMatch(question: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => question.includes(keyword));
}

function normalizeQuestion(question?: string | null): string {
  return (question ?? '').trim().toLowerCase();
}

function getDefaultIntent(context?: OracleRecommendationContext | null): OracleQuestionIntent {
  if (!context) return 'general';
  return ORACLE_CONTEXT_DEFAULT_INTENT[context] ?? 'general';
}

export function getOracleIntentLabel(
  questionIntent: OracleQuestionIntent,
  language: OraclePersonaLanguage = 'ko'
): string {
  return ORACLE_INTENT_LABELS[questionIntent][language];
}

export function inferQuestionIntent(input: {
  context?: OracleRecommendationContext | null;
  question?: string | null;
  partnerBirthDate?: string | null;
  partnerName?: string | null;
}): OracleQuestionIntent {
  const normalizedQuestion = normalizeQuestion(input.question);
  const hasPartnerInfo = Boolean(input.partnerBirthDate || input.partnerName);

  if (hasKeywordMatch(normalizedQuestion, KEYWORDS.reunion)) {
    return 'reunion';
  }

  if (hasKeywordMatch(normalizedQuestion, KEYWORDS.business)) {
    return 'business';
  }

  if (input.context === 'love' && hasPartnerInfo && normalizedQuestion.includes('재회')) {
    return 'reunion';
  }

  if (hasKeywordMatch(normalizedQuestion, KEYWORDS.timing)) {
    return 'timing';
  }

  if (input.context === 'love') {
    return hasPartnerInfo || hasKeywordMatch(normalizedQuestion, KEYWORDS.compatibility)
      ? 'compatibility'
      : 'compatibility';
  }

  if (input.context === 'money' || hasKeywordMatch(normalizedQuestion, KEYWORDS.wealth)) {
    return 'wealth';
  }

  if (input.context === 'career') {
    return hasKeywordMatch(normalizedQuestion, KEYWORDS.business) ? 'business' : 'career';
  }

  if (hasKeywordMatch(normalizedQuestion, KEYWORDS.career)) {
    return 'career';
  }

  return getDefaultIntent(input.context);
}

export function getRecommendedOracleCharacterId(input?: {
  context?: OracleRecommendationContext | null;
  question?: string | null;
  partnerBirthDate?: string | null;
  partnerName?: string | null;
  questionIntent?: OracleQuestionIntent | null;
}): OracleCharacterId {
  const resolvedIntent = input?.questionIntent ?? inferQuestionIntent({
    context: input?.context,
    question: input?.question,
    partnerBirthDate: input?.partnerBirthDate,
    partnerName: input?.partnerName,
  });

  return ORACLE_INTENT_TO_CHARACTER[resolvedIntent] ?? DEFAULT_ORACLE_CHARACTER_ID;
}

export function resolveOracleCharacterId(characterId?: string | null): OracleCharacterId {
  if (characterId && ORACLE_CHARACTER_IDS.includes(characterId as OracleCharacterId)) {
    return characterId as OracleCharacterId;
  }

  if (characterId && characterId in LEGACY_CHARACTER_ID_MAP) {
    return LEGACY_CHARACTER_ID_MAP[characterId as keyof typeof LEGACY_CHARACTER_ID_MAP];
  }

  return DEFAULT_ORACLE_CHARACTER_ID;
}

export function getOraclePersona(characterId?: string | null): OraclePersonaProfile {
  return ORACLE_PERSONAS[resolveOracleCharacterId(characterId)];
}

export function buildOracleAdvisorProfile(
  characterId?: string | null,
  selectionMode: OracleSelectionMode = 'auto',
  language: OraclePersonaLanguage = 'ko'
): OracleAdvisorProfile {
  const persona = getOraclePersona(characterId);

  return {
    id: persona.id,
    name: persona.name,
    title: language === 'en' ? persona.titleEn : persona.titleKo,
    specialty: persona.specialty,
    description: language === 'en' ? persona.descriptionEn : persona.descriptionKo,
    recommendedContexts: persona.recommendedContexts,
    evidencePriority: persona.evidencePriority,
    selectionMode,
  };
}

function formatEvidencePriority(
  sources: OracleEvidenceSource[],
  language: OraclePersonaLanguage
): string {
  const labels: Record<OracleEvidenceSource, { ko: string; en: string }> = {
    saju: { ko: '사주', en: 'Saju' },
    ziwei: { ko: '자미', en: 'Ziwei' },
    natal: { ko: '점성', en: 'Natal' },
    tarot: { ko: '타로', en: 'Tarot' },
  };

  return sources.map((source) => labels[source][language]).join(language === 'en' ? ' > ' : ' > ');
}

export function buildOraclePersonaBlock(
  characterId?: string | null,
  language: OraclePersonaLanguage = 'ko',
  options?: {
    questionIntent?: OracleQuestionIntent | null;
    selectionMode?: OracleSelectionMode | null;
    detailLevel?: 'full' | 'compact';
  }
): string {
  const persona = getOraclePersona(characterId);
  const questionIntent = options?.questionIntent ?? persona.specialty;
  const selectionMode = options?.selectionMode ?? 'auto';
  const detailLevel = options?.detailLevel ?? 'full';
  const intentLabel = getOracleIntentLabel(questionIntent, language);
  const evidencePriority = formatEvidencePriority(persona.evidencePriority, language);

  if (detailLevel === 'compact') {
    if (language === 'en') {
      return [
        '<ORACLE_GUIDE_PROFILE>',
        `Guide: ${persona.name} - ${persona.titleEn}`,
        `Question Intent: ${intentLabel} (${questionIntent})`,
        `Selection Mode: ${selectionMode}`,
        `Tone: ${persona.toneEn}`,
        `Evidence Priority: ${evidencePriority}`,
        `Framework: ${persona.frameworkEn.join('; ')}`,
        `Caution: ${persona.cautionEn}`,
        '</ORACLE_GUIDE_PROFILE>',
      ].join('\n');
    }

    return [
      '<오라클_가이드_프로필>',
      `가이드: ${persona.name} - ${persona.titleKo}`,
      `질문 의도: ${intentLabel} (${questionIntent})`,
      `선택 방식: ${selectionMode}`,
      `톤: ${persona.toneKo}`,
      `근거 우선순위: ${evidencePriority}`,
      `분석 프레임워크: ${persona.frameworkKo.join('; ')}`,
      `주의: ${persona.cautionKo}`,
      '</오라클_가이드_프로필>',
    ].join('\n');
  }

  if (language === 'en') {
    return [
      '<ORACLE_GUIDE_PROFILE>',
      `Guide ID: ${persona.id}`,
      `Guide: ${persona.name} - ${language === 'en' ? persona.titleEn : persona.titleKo}`,
      `Question Intent: ${intentLabel} (${questionIntent})`,
      `Selection Mode: ${selectionMode}`,
      `Specialty: ${persona.specialty}`,
      `Description: ${language === 'en' ? persona.descriptionEn : persona.descriptionKo}`,
      `Archetype: ${persona.archetype}`,
      `Tone: ${persona.toneEn}`,
      `Strengths: ${persona.strengthsEn.join('; ')}`,
      `Evidence Priority: ${evidencePriority}`,
      `Framework: ${persona.frameworkEn.join('; ')}`,
      `Style Rules: ${persona.styleRulesEn.join('; ')}`,
      `Caution: ${persona.cautionEn}`,
      'Traditional terms must be explained once in the format 漢字(reading, plain meaning).',
      'This guide is domain-first. Tone must never override evidence, safety, or anti-hallucination rules.',
      '</ORACLE_GUIDE_PROFILE>',
    ].join('\n');
  }

  return [
    '<오라클_가이드_프로필>',
    `가이드 ID: ${persona.id}`,
    `가이드: ${persona.name} - ${persona.titleKo}`,
    `질문 의도: ${intentLabel} (${questionIntent})`,
    `선택 방식: ${selectionMode}`,
    `전문 분야: ${persona.specialty}`,
    `설명: ${persona.descriptionKo}`,
    `아키타입: ${persona.archetype}`,
    `톤: ${persona.toneKo}`,
    `강점: ${persona.strengthsKo.join('; ')}`,
    `근거 우선순위: ${evidencePriority}`,
    `분석 프레임워크: ${persona.frameworkKo.join('; ')}`,
    `스타일 규칙: ${persona.styleRulesKo.join('; ')}`,
    `주의: ${persona.cautionKo}`,
    '한자나 전통 용어는 반드시 한자(독음, 쉬운 뜻) 형식으로 한 번 풀어서 설명한다.',
    '오라클 가이드는 말투보다 분석 도메인이 우선이며, 근거·안전·환각 방지 규칙을 절대 덮어쓰지 못한다.',
    '</오라클_가이드_프로필>',
  ].join('\n');
}
