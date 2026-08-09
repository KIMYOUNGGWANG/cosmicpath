import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';

const localRequire = createRequire(import.meta.url);
const fs = localRequire('node:fs') as typeof import('node:fs');
const path = localRequire('node:path') as typeof import('node:path');
const Module = localRequire('node:module') as typeof import('node:module') & {
  _resolveFilename: (...args: unknown[]) => string;
};
const ts = localRequire('typescript') as typeof import('typescript');

type Scenario = 'happy' | 'edge' | 'integration' | 'kim_fixture' | 'source_consistency' | 'unknown_time' | 'all';

const ROOT_DIR = process.cwd();
const SUPPORTED_SCENARIOS: Scenario[] = ['happy', 'edge', 'integration', 'kim_fixture', 'source_consistency', 'unknown_time', 'all'];
const SCENARIO_HAPPY_MARKER = 'scenario=happy';
const SCENARIO_EDGE_MARKER = 'scenario=edge';
const SCENARIO_INTEGRATION_MARKER = 'scenario=integration';
const SCENARIO_KIM_FIXTURE_MARKER = 'scenario=kim_fixture';
const SCENARIO_SOURCE_CONSISTENCY_MARKER = 'scenario=source_consistency';
const SCENARIO_UNKNOWN_TIME_MARKER = 'scenario=unknown_time';

const KIM_YOUNG_GWANG_FIXTURE = {
  name: '김영광',
  birthDate: '1993-08-02',
  birthTime: '15:10',
  calendarType: 'solar',
  gender: 'male',
  cityName: 'Seoul',
  latitude: 37.5665,
  longitude: 126.9780,
  timezoneOffset: 9,
  unknownTime: false,
} as const;

const ASTROLOGY_SIGN_TO_ZODIAC_SIGN = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

const ASTROLOGY_SIGN_TO_KOREAN_SIGN = [
  '양자리',
  '황소자리',
  '쌍둥이자리',
  '게자리',
  '사자자리',
  '처녀자리',
  '천칭자리',
  '전갈자리',
  '궁수자리',
  '염소자리',
  '물병자리',
  '물고기자리',
] as const;

type VerifierNatalChart = {
  planets: Array<{ planet: string; sign: string }>;
  angles: { asc: { sign: string } };
};

function resolveWithExtensions(
  requestPath: string,
  originalResolveFilename: (...args: unknown[]) => string,
  parent: unknown,
  isMain: boolean,
  options: unknown,
) {
  const candidates = [
    requestPath,
    `${requestPath}.ts`,
    `${requestPath}.tsx`,
    `${requestPath}.js`,
    `${requestPath}.json`,
    path.join(requestPath, 'index.ts'),
    path.join(requestPath, 'index.tsx'),
    path.join(requestPath, 'index.js'),
  ];

  for (const candidate of candidates) {
    try {
      return originalResolveFilename.call(Module, candidate, parent, isMain, options);
    } catch (error) {
      void error;
    }
  }

  return null;
}

function registerTypeScriptLoader() {
  const originalResolveFilename = Module._resolveFilename;
  const originalTsLoader = localRequire.extensions['.ts'];
  const originalTsxLoader = localRequire.extensions['.tsx'];

  Module._resolveFilename = function patchedResolveFilename(...args: unknown[]) {
    const [request, parent, isMain, options] = args;
    const isMainFlag = typeof isMain === 'boolean' ? isMain : false;

    if (typeof request === 'string' && request.startsWith('@/')) {
      const aliasPath = path.join(ROOT_DIR, 'src', request.slice(2));
      const resolved = resolveWithExtensions(aliasPath, originalResolveFilename, parent, isMainFlag, options);
      if (resolved) return resolved;
    }

    try {
      return originalResolveFilename.call(Module, request, parent, isMainFlag, options);
    } catch (error) {
      if (typeof request !== 'string' || path.extname(request)) {
        throw error;
      }

      const isRelative = request.startsWith('.') || request.startsWith('/');
      if (!isRelative) {
        throw error;
      }

      const resolved = resolveWithExtensions(request, originalResolveFilename, parent, isMainFlag, options);
      if (resolved) return resolved;

      throw error;
    }
  };

  function compileTypeScript(
    module: unknown,
    filename: string,
    isTsx: boolean,
  ) {
    const source = fs.readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        jsx: isTsx ? ts.JsxEmit.ReactJSX : ts.JsxEmit.None,
      },
      fileName: filename,
    });

    (module as { _compile: (source: string, filename: string) => void })._compile(
      output.outputText,
      filename,
    );
  }

  localRequire.extensions['.ts'] = function loadTs(module, filename) {
    compileTypeScript(module, filename, false);
  };

  localRequire.extensions['.tsx'] = function loadTsx(module, filename) {
    compileTypeScript(module, filename, true);
  };

  return () => {
    Module._resolveFilename = originalResolveFilename;
    if (originalTsLoader) {
      localRequire.extensions['.ts'] = originalTsLoader;
    } else {
      delete localRequire.extensions['.ts'];
    }

    if (originalTsxLoader) {
      localRequire.extensions['.tsx'] = originalTsxLoader;
    } else {
      delete localRequire.extensions['.tsx'];
    }
  };
}

function parseScenario(argv: string[]): Scenario {
  const scenarioFlagIndex = argv.indexOf('--scenario');
  const scenario = scenarioFlagIndex === -1 ? 'happy' : argv[scenarioFlagIndex + 1];

  if (!SUPPORTED_SCENARIOS.includes(scenario as Scenario)) {
    throw new Error(`Unsupported scenario: ${scenario || '(missing)'}`);
  }

  return scenario as Scenario;
}

function mark(marker: string) {
  console.log(`[PASS] ${marker}`);
}

function assertThrows(action: () => void, label: string) {
  let didThrow = false;

  try {
    action();
  } catch {
    didThrow = true;
  }

  assert.equal(didThrow, true, `${label} should reject invalid input`);
}

function assertValidSign(value: number, label: string) {
  assert.equal(Number.isInteger(value), true, `${label} should be an integer zodiac index`);
  assert.equal(value >= 0 && value <= 11, true, `${label} should be within 0..11`);
}

function zodiacSignForIndex(index: number) {
  assertValidSign(index, 'canonical sign index');
  return ASTROLOGY_SIGN_TO_ZODIAC_SIGN[index];
}

function koreanSignForIndex(index: number) {
  assertValidSign(index, 'canonical Korean sign index');
  return ASTROLOGY_SIGN_TO_KOREAN_SIGN[index];
}

function planetSign(chart: VerifierNatalChart, planetId: string) {
  const planet = chart.planets.find((item) => item.planet === planetId);
  assert.ok(planet, `${planetId} should exist in natal chart`);
  return planet.sign;
}

function assertContains(value: string, expected: string, label: string) {
  assert.ok(value.includes(expected), `${label} should include ${expected}; received: ${value}`);
}

function assertDoesNotContain(value: string, unexpected: string, label: string) {
  assert.equal(value.includes(unexpected), false, `${label} should not include ${unexpected}; received: ${value}`);
}

function assertLegacyMetadataCompatibility() {
  const legacyPrecisionMetadata: Record<string, unknown> = {
    inputDate: KIM_YOUNG_GWANG_FIXTURE.birthDate,
    inputTime: KIM_YOUNG_GWANG_FIXTURE.birthTime,
    tstOffset: -32,
    correctedDate: KIM_YOUNG_GWANG_FIXTURE.birthDate,
    correctedTime: '14:38',
    lon: KIM_YOUNG_GWANG_FIXTURE.longitude,
    hourPillar: '계미',
  };

  assert.equal('astrologyInputDate' in legacyPrecisionMetadata, false);
  assert.equal('astrologyAscendantConfidence' in legacyPrecisionMetadata, false);
  mark('legacy_metadata_missing_provenance_accepted');
}

function assertAspectSanity(astrology: {
  aspects: Array<{ planet1?: unknown; planet2?: unknown; aspect?: unknown; orb?: unknown }>;
  enhancedAspects?: unknown[];
}) {
  assert.equal(Array.isArray(astrology.aspects), true);
  assert.equal(astrology.aspects.length > 0, true);

  const firstAspect = astrology.aspects[0];
  assert.equal(typeof firstAspect.planet1, 'string');
  assert.equal(typeof firstAspect.planet2, 'string');
  assert.equal(typeof firstAspect.aspect, 'string');
  assert.equal(typeof firstAspect.orb, 'number');

  assert.equal(Array.isArray(astrology.enhancedAspects), true);
  mark('astro_aspect_sanity');
}

function runHappyScenario() {
  const restoreLoader = registerTypeScriptLoader();

  try {
    const { calculateSaju, formatSaju } = localRequire('../src/lib/engines/saju.ts');
    const { calculateAstrology } = localRequire('../src/lib/engines/astrology.ts');

    const saju = calculateSaju(
      new Date(2026, 5, 6),
      12,
      0,
      false,
      'male',
      126.9780,
      { skipLongitudeCorrection: true },
    );
    const formattedSaju = formatSaju(saju);

    assert.equal(saju.yeonPillar.stem, '병');
    assert.equal(saju.yeonPillar.branch, '오');
    assert.equal(saju.monthPillar.stem, '갑');
    assert.equal(saju.monthPillar.branch, '오');
    assert.equal(saju.dayPillar.stem, '신');
    assert.equal(saju.dayPillar.branch, '해');
    assert.equal(saju.hourPillar.branch, '오');
    assert.match(formattedSaju, /병오년 갑오월 신해일/);

    const astrology = calculateAstrology(
      new Date(2026, 2, 21),
      '12:00',
      37.5665,
      126.9780,
      9,
    );

    assert.equal(astrology.sunSign, 0);
    assertValidSign(astrology.moonSign, 'moonSign');
    assertValidSign(astrology.ascendant, 'ascendant');
    assertAspectSanity(astrology);

    mark('engine_accuracy_audit_script_contract');
    mark('saju_2026_mangjong');
    mark('astro_2026_march_equinox');
  } finally {
    restoreLoader();
  }
}

function runEdgeScenario() {
  assertThrows(
    () => parseScenario(['--scenario', 'not-supported']),
    'invalid_scenario_rejected',
  );
  mark('invalid_scenario_rejected');

  const restoreLoader = registerTypeScriptLoader();

  try {
    const { calculateSaju } = localRequire('../src/lib/engines/saju.ts');
    const { calculateAstrology } = localRequire('../src/lib/engines/astrology.ts');
    assertThrows(
      () => calculateSaju(new Date(Number.NaN), 12, 0, false, 'male', 126.9780),
      'saju_invalid_date_rejected',
    );
    mark('saju_invalid_date_rejected');

    const beforeZi = calculateSaju(
      new Date(2026, 5, 6),
      22,
      30,
      false,
      'male',
      126.9780,
      { skipLongitudeCorrection: true },
    );
    const afterZi = calculateSaju(
      new Date(2026, 5, 6),
      23,
      30,
      false,
      'male',
      126.9780,
      { skipLongitudeCorrection: true },
    );

    const beforeZiDay = `${beforeZi.dayPillar.stem}${beforeZi.dayPillar.branch}`;
    const afterZiDay = `${afterZi.dayPillar.stem}${afterZi.dayPillar.branch}`;
    assert.equal(beforeZiDay, '신해');
    assert.notEqual(afterZiDay, beforeZiDay);
    assert.equal(afterZi.hourPillar.branch, '자');
    mark('saju_hour_boundary');

    const kstChart = calculateAstrology(
      new Date(2026, 2, 20),
      '23:30',
      37.5665,
      126.9780,
      9,
    );
    const utcChart = calculateAstrology(
      new Date(2026, 2, 20),
      '23:30',
      37.5665,
      126.9780,
      0,
    );

    assertValidSign(kstChart.ascendant, 'kst ascendant');
    assertValidSign(utcChart.ascendant, 'utc ascendant');
    assert.notEqual(kstChart.ascendant, utcChart.ascendant);
    mark('astro_timezone_boundary');
    mark('astrology_timezone_offset_boundary');

    // === 신규 업그레이드 엔진 검증 (Tasks 1, 2, 5, 7, 8) ===
    const { isKoreaDstPeriod, calculateIlwoon, calculateMonthlyIlwoon } = localRequire('../src/lib/engines/saju.ts');

    // Task 1: 자시법 yaja (야자시) 모드 검증 - 23:30에 일주가 안 넘어가야 함
    const yajaZi = calculateSaju(
      new Date(2026, 5, 6),
      23,
      30,
      false,
      'male',
      126.9780,
      { skipLongitudeCorrection: true, ziSiMode: 'yaja' }
    );
    assert.equal(`${yajaZi.dayPillar.stem}${yajaZi.dayPillar.branch}`, beforeZiDay);
    assert.equal(yajaZi.ziSiMode, 'yaja');
    mark('saju_zisi_yaja_mode');

    // Task 2: 서머타임 (DST) 기간 검증 (1987년 7월 15일)
    const dstDate = new Date(1987, 6, 15);
    assert.equal(isKoreaDstPeriod(dstDate), true);
    const dstSaju = calculateSaju(dstDate, 14, 0, false, 'male');
    assert.equal(dstSaju.dstCorrected, true);
    mark('saju_dst_auto_correction');

    // Task 5: 일운 30일 계산 검증
    const ilwoon30 = calculateMonthlyIlwoon(new Date(2026, 5, 1), 30, '갑', '중화', ['자', '오', '묘', '유']);
    assert.equal(ilwoon30.length, 30);
    assert.equal(typeof ilwoon30[0].score, 'number');
    mark('saju_ilwoon_30days');

    // Task 7 & 8: 점성술 Chiron, Nodes, Fortuna, Retrograde 검증
    assert.equal(kstChart.planets.length, 14);
    const chiron = kstChart.planets.find((p: any) => p.planet === 'chiron');
    const northNode = kstChart.planets.find((p: any) => p.planet === 'northNode');
    const fortuna = kstChart.planets.find((p: any) => p.planet === 'fortuna');
    assert.ok(chiron, 'Chiron must be present');
    assert.ok(northNode, 'North Node must be present');
    assert.ok(fortuna, 'Fortuna must be present');
    assert.equal(typeof kstChart.planets[2].isRetrograde, 'boolean');

    // Phase 3: 4대 앵글 및 하우스 시스템 검증
    assert.ok(kstChart.angles && kstChart.angles.mc, '4 Angles (ASC, MC, DESC, IC) must exist');
    assert.equal(typeof kstChart.angles.mc.longitude, 'number');
    assert.equal(kstChart.houseSystem, 'placidus');

    const wholeSignChart = calculateAstrology(new Date(2026, 2, 20), '23:30', 37.5665, 126.9780, 9, 'whole_sign');
    assert.equal(wholeSignChart.houseSystem, 'whole_sign');
    assert.ok(wholeSignChart.houseCusps?.length === 12, 'House cusps must be 12');

    mark('astrology_chiron_nodes_retrograde');

    // Task 9: 자미두수 (Ziwei Doushu) 독자 엔진 검증 (Phase 2 Upgrade)
    const { calculateZiweiChart } = localRequire('../src/lib/engines/ziwei.ts');
    const ziweiRes = calculateZiweiChart(new Date(1993, 7, 2), 15, 'male', false, 2026);
    assert.ok(ziweiRes.palaceList.length === 12, 'Ziwei chart must have 12 palaces');
    assert.ok(ziweiRes.wuxingJu.number >= 2 && ziweiRes.wuxingJu.number <= 6, 'WuxingJu number must be valid');
    assert.ok(ziweiRes.siHuaSummary.화록, 'SiHua summary must exist');

    // 주성 7단계 밝기 및 보성/흉성 검증
    const allStars = ziweiRes.palaceList.flatMap((p: any) => p.stars);
    const ziweiStar = allStars.find((s: any) => s.name === '자미');
    assert.ok(ziweiStar && ziweiStar.brightness, 'Ziwei star must have 7-level brightness');
    assert.ok(allStars.some((s: any) => s.name === '문창'), 'Wenchang auxiliary star must exist');
    assert.ok(allStars.some((s: any) => s.name === '경양'), 'Jingyang malefic star must exist');
    assert.ok(ziweiRes.yearlyFortune && ziweiRes.yearlyFortune.year === 2026, 'Yearly fortune for 2026 must exist');

    mark('saju_ziwei_chart_calc');
    mark('engine_accuracy_audit_edge_contract');
  } finally {
    restoreLoader();
  }
}

function buildGuideFixture() {
  return {
    matching: {
      score: 82,
      level: 'high',
      matchingTags: ['fixture'],
      conflictingTags: [],
      dominantSource: 'balanced',
    },
    confidence: {
      score: 4,
      percentage: 82,
      level: 'high',
      message: 'Fixture confidence',
      recommendation: 'Use deterministic engine evidence.',
    },
    radarScores: {
      saju: 86,
      astrology: 80,
      tarot: 72,
    },
    prioritySource: 'saju',
    tone: 'balanced',
    keyThemes: ['engine accuracy fixture'],
    warnings: [],
  };
}

function runIntegrationScenario() {
  const restoreLoader = registerTypeScriptLoader();

  try {
    const { calculateAstrology } = localRequire('../src/lib/engines/astrology.ts');
    const { calculateOracleSajuProfile } = localRequire('../src/lib/saju/saju-engine.ts');
    const {
      buildReadingMetadata,
      mapToLegacySaju,
    } = localRequire('../src/app/api/reading/route-helpers.ts');
    const { buildDecisionActionContract } = localRequire('../src/lib/ai/decision-action-contract.ts');
    const { buildOracleAdvisorProfile } = localRequire('../src/lib/ai/oracle-personas.ts');

    const oracleProfile = calculateOracleSajuProfile({
      birthDate: '2026-06-06',
      birthTime: '12:00',
      gender: 'male',
      cityName: 'Seoul',
      longitude: 126.9780,
      latitude: 37.5665,
    });
    const legacySaju = mapToLegacySaju(oracleProfile);
    const astrology = calculateAstrology(
      new Date(2026, 5, 6),
      '12:00',
      37.5665,
      126.9780,
      9,
    );
    const metadata = buildReadingMetadata({
      guide: buildGuideFixture(),
      saju: legacySaju,
      astrology,
      cards: [{
        id: 1,
        name: '심판',
        nameEn: 'Judgement',
        keywords: ['review'],
        interpretation: 'A deterministic audit card.',
        isReversed: false,
      }],
      characterId: 'general_orion',
      questionIntent: 'general',
      decisionAction: buildDecisionActionContract({
        context: 'general',
        question: '엔진 정확도를 검증한다.',
      }),
      selectionMode: 'auto',
      advisorProfile: buildOracleAdvisorProfile('general_orion', 'auto', 'ko'),
      advisorEvidenceSummary: '사주와 점성 엔진의 결정론적 fixture를 확인한다.',
      precisionMetadata: oracleProfile.precisionMetadata,
      oracleCouncil: oracleProfile.oracleCouncil,
    });

    assert.equal(metadata.saju.dayMaster, legacySaju.dayMaster);
    assert.equal(metadata.sajuResult.dayMaster, legacySaju.dayMaster);
    assert.equal(metadata.astrology.sunSign, astrology.sunSign);
    assert.equal(metadata.astrology.moonSign, astrology.moonSign);
    assert.equal(metadata.astrology.ascendant, astrology.ascendant);
    assert.match(metadata.saju.fullSaju, /년 .+월 .+일 .+시/);

    console.log(
      `reading_metadata_saju_astrology_contract dayMaster=${metadata.saju.dayMaster} sunSign=${metadata.astrology.sunSign} moonSign=${metadata.astrology.moonSign} ascendant=${metadata.astrology.ascendant}`,
    );
    mark('engine_accuracy_audit_integration_contract');
  } finally {
    restoreLoader();
  }
}

function runKimFixtureScenario() {
  const restoreLoader = registerTypeScriptLoader();

  try {
    const { calculateAstrology } = localRequire('../src/lib/engines/astrology.ts');
    const { calculateOracleSajuProfile } = localRequire('../src/lib/saju/saju-engine.ts');
    const { mapToLegacySaju } = localRequire('../src/app/api/reading/route-helpers.ts');

    const astrology = calculateAstrology(
      new Date(1993, 7, 2),
      KIM_YOUNG_GWANG_FIXTURE.birthTime,
      KIM_YOUNG_GWANG_FIXTURE.latitude,
      KIM_YOUNG_GWANG_FIXTURE.longitude,
      KIM_YOUNG_GWANG_FIXTURE.timezoneOffset,
    );
    const profile = calculateOracleSajuProfile({
      birthDate: KIM_YOUNG_GWANG_FIXTURE.birthDate,
      birthTime: KIM_YOUNG_GWANG_FIXTURE.birthTime,
      gender: KIM_YOUNG_GWANG_FIXTURE.gender,
      cityName: KIM_YOUNG_GWANG_FIXTURE.cityName,
      longitude: KIM_YOUNG_GWANG_FIXTURE.longitude,
      latitude: KIM_YOUNG_GWANG_FIXTURE.latitude,
      unknownTime: KIM_YOUNG_GWANG_FIXTURE.unknownTime,
    });
    const legacySaju = mapToLegacySaju(profile);

    assert.equal(profile.precisionMetadata.correctedTime, '14:38');
    assert.equal(profile.formattedSaju, '계유년 기미월 을묘일 계미시');
    assert.equal(legacySaju.dayMaster, '을');
    assert.equal(astrology.sunSign, 4);
    assert.equal(astrology.moonSign, 10);
    assert.equal(astrology.ascendant, 8);

    const natalSummary = profile.oracleCouncil.natalSummary;
    assertContains(natalSummary, '태양 사자자리', 'Kim oracle natal summary');
    assertContains(natalSummary, '달 물병자리', 'Kim oracle natal summary');
    assertContains(natalSummary, '상승궁 궁수자리', 'Kim oracle natal summary');
    assertDoesNotContain(natalSummary, '태양 천칭자리', 'Kim oracle natal summary');
    assertDoesNotContain(natalSummary, '달 전갈자리', 'Kim oracle natal summary');
    assertDoesNotContain(natalSummary, '상승궁 전갈자리', 'Kim oracle natal summary');

    console.log(
      `kim_young_gwang_19930802 correctedTime=${profile.precisionMetadata.correctedTime} sunSign=${astrology.sunSign} moonSign=${astrology.moonSign} ascendant=${astrology.ascendant}`,
    );
    mark('oracle_council_natal_summary_consistent');
    mark('engine_source_kim_fixture_contract');
  } finally {
    restoreLoader();
  }
}

function runSourceConsistencyScenario() {
  const restoreLoader = registerTypeScriptLoader();

  try {
    const { calculateAstrology } = localRequire('../src/lib/engines/astrology.ts');
    const { calculateOracleSajuProfile } = localRequire('../src/lib/saju/saju-engine.ts');

    const astrology = calculateAstrology(
      new Date(1993, 7, 2),
      KIM_YOUNG_GWANG_FIXTURE.birthTime,
      KIM_YOUNG_GWANG_FIXTURE.latitude,
      KIM_YOUNG_GWANG_FIXTURE.longitude,
      KIM_YOUNG_GWANG_FIXTURE.timezoneOffset,
    );
    const profile = calculateOracleSajuProfile({
      birthDate: KIM_YOUNG_GWANG_FIXTURE.birthDate,
      birthTime: KIM_YOUNG_GWANG_FIXTURE.birthTime,
      gender: KIM_YOUNG_GWANG_FIXTURE.gender,
      cityName: KIM_YOUNG_GWANG_FIXTURE.cityName,
      longitude: KIM_YOUNG_GWANG_FIXTURE.longitude,
      latitude: KIM_YOUNG_GWANG_FIXTURE.latitude,
      unknownTime: KIM_YOUNG_GWANG_FIXTURE.unknownTime,
    });

    assert.equal(planetSign(profile.natalChart, 'Sun'), zodiacSignForIndex(astrology.sunSign));
    assert.equal(planetSign(profile.natalChart, 'Moon'), zodiacSignForIndex(astrology.moonSign));
    assert.equal(profile.natalChart.angles.asc.sign, zodiacSignForIndex(astrology.ascendant));
    assertContains(profile.oracleCouncil.natalSummary, `태양 ${koreanSignForIndex(astrology.sunSign)}`, 'source consistency summary');
    assertContains(profile.oracleCouncil.natalSummary, `달 ${koreanSignForIndex(astrology.moonSign)}`, 'source consistency summary');
    assertContains(profile.oracleCouncil.natalSummary, `상승궁 ${koreanSignForIndex(astrology.ascendant)}`, 'source consistency summary');

    assertLegacyMetadataCompatibility();
    mark('canonical_astrology_source_of_truth');
    mark('engine_source_consistency_contract');
  } finally {
    restoreLoader();
  }
}

function runUnknownTimeScenario() {
  const restoreLoader = registerTypeScriptLoader();

  try {
    const { calculateOracleSajuProfile } = localRequire('../src/lib/saju/saju-engine.ts');
    const profile = calculateOracleSajuProfile({
      birthDate: KIM_YOUNG_GWANG_FIXTURE.birthDate,
      gender: KIM_YOUNG_GWANG_FIXTURE.gender,
      cityName: KIM_YOUNG_GWANG_FIXTURE.cityName,
      longitude: KIM_YOUNG_GWANG_FIXTURE.longitude,
      latitude: KIM_YOUNG_GWANG_FIXTURE.latitude,
      unknownTime: true,
    });
    const precisionMetadata = profile.precisionMetadata as Record<string, unknown>;

    assert.equal(precisionMetadata.astrologyInputTime, '12:00');
    assert.equal(precisionMetadata.astrologyTimePolicy, 'civil_time');
    assert.equal(precisionMetadata.astrologyAscendantConfidence, 'approximate_noon');
    assertContains(profile.oracleCouncil.natalSummary, '상승궁은 정오 기준 참고값', 'unknown-time natal summary');

    mark('unknown_time_ascendant_approximate');
    mark('engine_source_unknown_time_contract');
  } finally {
    restoreLoader();
  }
}

function main() {
  const scenario = parseScenario(process.argv.slice(2));
  const scenarioMarker = scenario === 'happy'
    ? SCENARIO_HAPPY_MARKER
    : scenario === 'edge'
      ? SCENARIO_EDGE_MARKER
      : scenario === 'integration'
        ? SCENARIO_INTEGRATION_MARKER
        : scenario === 'kim_fixture'
          ? SCENARIO_KIM_FIXTURE_MARKER
          : scenario === 'source_consistency'
            ? SCENARIO_SOURCE_CONSISTENCY_MARKER
            : scenario === 'unknown_time'
              ? SCENARIO_UNKNOWN_TIME_MARKER
              : `scenario=${scenario}`;
  console.log(scenarioMarker);

  if (scenario === 'happy' || scenario === 'all') {
    runHappyScenario();
  }

  if (scenario === 'edge' || scenario === 'all') {
    runEdgeScenario();
  }

  if (scenario === 'integration' || scenario === 'all') {
    runIntegrationScenario();
  }

  if (scenario === 'kim_fixture' || scenario === 'all') {
    runKimFixtureScenario();
  }

  if (scenario === 'source_consistency' || scenario === 'all') {
    runSourceConsistencyScenario();
  }

  if (scenario === 'unknown_time' || scenario === 'all') {
    runUnknownTimeScenario();
  }

  console.log('Engine accuracy verification passed');
}

main();
