import { buildTarotCards } from './tarot.ts';
import type {
  AssembleReadingRuntime,
  AstrologyResult,
  Pillar,
  RuntimeSnapshot,
  TarotArcana,
  TestCase,
  ZodiacSign,
} from './types.ts';

function pillarText(pillar: Pillar) {
  return `${pillar.stem}${pillar.branch}`;
}

function planetWithSignName(planet: { sign: number; [key: string]: unknown }, zodiacSigns: readonly ZodiacSign[]) {
  return {
    ...planet,
    signName: zodiacSigns[planet.sign]?.name ?? 'unknown',
    signElement: zodiacSigns[planet.sign]?.element ?? 'unknown',
  };
}

function buildAstroData(astrology: AstrologyResult, zodiacSigns: readonly ZodiacSign[]) {
  return {
    sunSign: zodiacSigns[astrology.sunSign].name,
    sunSignIndex: astrology.sunSign,
    sunSignElement: zodiacSigns[astrology.sunSign].element,
    moonSign: zodiacSigns[astrology.moonSign].name,
    moonSignIndex: astrology.moonSign,
    moonSignElement: zodiacSigns[astrology.moonSign].element,
    ascendant: zodiacSigns[astrology.ascendant].name,
    ascendantIndex: astrology.ascendant,
    ascendantElement: zodiacSigns[astrology.ascendant].element,
    planets: astrology.planets.map((planet) => planetWithSignName(planet, zodiacSigns)),
    aspects: astrology.aspects,
    enhancedAspects: astrology.enhancedAspects,
    dignities: astrology.dignities,
    patterns: astrology.patterns,
    calculationSource: 'server_calculateAstrology',
  };
}

function buildMentionAnchors(runtime: RuntimeSnapshot, zodiacSigns: readonly ZodiacSign[]) {
  const { saju, astrology } = runtime;

  return [
    `일간 ${saju.dayMaster}`,
    `연주 ${pillarText(saju.yeonPillar)}`,
    `월주 ${pillarText(saju.monthPillar)}`,
    `일주 ${pillarText(saju.dayPillar)}`,
    `시주 ${pillarText(saju.hourPillar)}`,
    `태양 ${zodiacSigns[astrology.sunSign].name}`,
    `달 ${zodiacSigns[astrology.moonSign].name}`,
    `상승궁 ${zodiacSigns[astrology.ascendant].name}`,
    ...runtime.cards.map((card) => `${card.name}${card.isReversed ? ' 역방향' : ' 정방향'}`),
  ];
}

function buildCaveats(testCase: TestCase) {
  if (testCase.unknownTime) {
    return ['unknownTime=true: 상승궁/하우스/시주 기반 해석은 정오 기준 참고값으로 표시해야 함'];
  }

  return ['birthTime provided: 진태양시 보정값과 원 입력 시간을 구분해야 함'];
}

function buildQualityAnchors(testCase: TestCase, runtime: RuntimeSnapshot, zodiacSigns: readonly ZodiacSign[]) {
  return {
    mustMention: buildMentionAnchors(runtime, zodiacSigns),
    caveats: buildCaveats(testCase),
    sourceBoundaries: [
      'KASI/calendar data can validate calculation only, not doctrine interpretation.',
      'Astrology ephemeris can validate positions only, not personality claims by itself.',
      'Tarot card text/image rights must remain separate in paid PDF surfaces.',
    ],
  };
}

function buildRuntimeInput(testCase: TestCase, tarotCards: ReturnType<typeof buildTarotCards>) {
  return {
    birthDate: testCase.birthDate,
    birthTime: testCase.birthTime,
    gender: testCase.gender,
    cityName: testCase.cityName,
    longitude: testCase.longitude,
    latitude: testCase.latitude,
    calendarType: testCase.calendarType,
    unknownTime: testCase.unknownTime,
    partnerBirthDate: testCase.partner?.birthDate,
    partnerBirthTime: testCase.partner?.birthTime,
    partnerGender: testCase.partner?.gender,
    partnerName: testCase.partner?.name,
    context: testCase.context,
    question: testCase.question,
    language: testCase.language,
    tarotCards,
    storedReadingMetadata: {},
    useStoredRuntime: false,
    selectionMode: 'auto' as const,
    currentPhase: 1,
  };
}

function buildPremiumUserData(testCase: TestCase, runtime: RuntimeSnapshot, zodiacSigns: readonly ZodiacSign[]) {
  return {
    name: testCase.name,
    gender: testCase.gender,
    birthDate: testCase.birthDate,
    birthTime: testCase.birthTime,
    unknownTime: testCase.unknownTime,
    characterId: runtime.resolvedCharacterId,
    selectionMode: runtime.effectiveSelectionMode,
    questionIntent: runtime.resolvedQuestionIntent,
    advisorProfile: runtime.advisorProfile,
    advisorEvidenceSummary: runtime.advisorEvidenceSummary,
    context: testCase.context,
    question: testCase.question,
    sajuData: runtime.saju,
    astroData: buildAstroData(runtime.astrology, zodiacSigns),
    tarotCards: runtime.cards,
    language: testCase.language,
    currentDate: '2026-06-12',
    partnerName: testCase.partner?.name,
    partnerBirthDate: testCase.partner?.birthDate,
    partnerBirthTime: testCase.partner?.birthTime,
    partnerSajuData: runtime.partnerSaju,
  };
}

export async function buildFixture(
  testCase: TestCase,
  assembleReadingRuntime: AssembleReadingRuntime,
  arcana: readonly TarotArcana[],
  zodiacSigns: readonly ZodiacSign[],
) {
  const tarotCards = buildTarotCards(testCase.cards, arcana);
  const runtime = await assembleReadingRuntime(buildRuntimeInput(testCase, tarotCards));

  return {
    id: testCase.id,
    label: testCase.label,
    input: testCase,
    premiumUserData: buildPremiumUserData(testCase, runtime, zodiacSigns),
    qualityAnchors: buildQualityAnchors(testCase, runtime, zodiacSigns),
    runtimeSummary: {
      guide: runtime.guide,
      precisionMetadata: runtime.precisionMetadata,
      oracleCouncil: runtime.oracleCouncil,
      decisionAction: runtime.decisionAction,
    },
  };
}
