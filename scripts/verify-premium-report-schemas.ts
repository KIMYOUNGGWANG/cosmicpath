import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';

const localRequire = createRequire(`${process.cwd()}/scripts/verify-premium-report-schemas.ts`);
const Module = localRequire('node:module');
const ts = localRequire('typescript');
const fs = localRequire('node:fs');
const path = localRequire('node:path');

function registerTypeScriptLoader() {
  const originalResolveFilename = Module._resolveFilename;
  const originalTsLoader = localRequire.extensions['.ts'];
  const originalTsxLoader = localRequire.extensions['.tsx'];

  Module._resolveFilename = function patchedResolveFilename(
    request: string,
    parent: unknown,
    isMain: boolean,
    options: unknown
  ) {
    try {
      return originalResolveFilename.call(this, request, parent, isMain, options);
    } catch (error) {
      if (typeof request !== 'string' || path.extname(request)) {
        throw error;
      }

      const isRelative = request.startsWith('.') || request.startsWith('/');
      if (!isRelative) {
        throw error;
      }

      const extensions = ['.ts', '.tsx', '.js', '.json'];
      for (const extension of extensions) {
        try {
          return originalResolveFilename.call(this, `${request}${extension}`, parent, isMain, options);
        } catch {
          // Continue to the next extension.
        }
      }

      throw error;
    }
  };

  type CompilableModule = NodeJS.Module & {
    _compile(source: string, filename: string): void;
  };

  function isCompilableModule(module: NodeJS.Module): module is CompilableModule {
    return '_compile' in module && typeof module._compile === 'function';
  }

  function compileTypeScript(module: NodeJS.Module, filename: string) {
    if (!isCompilableModule(module)) {
      throw new Error('TypeScript loader received a non-compilable module.');
    }

    const source = fs.readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        esModuleInterop: true,
        resolveJsonModule: true,
      },
      fileName: filename,
    });

    module._compile(output.outputText, filename);
  }

  localRequire.extensions['.ts'] = function loadTs(module: NodeJS.Module, filename: string) {
    compileTypeScript(module, filename);
  };

  localRequire.extensions['.tsx'] = function loadTsx(module: NodeJS.Module, filename: string) {
    compileTypeScript(module, filename);
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

type SchemaAssertion = () => void | Promise<void>;

interface AssertionResult {
  name: string;
  passed: boolean;
  message?: string;
}

type PhaseSchemaApi = {
  readonly getPremiumPhaseSchema: (phaseNumber: number) => { parse(value: unknown): unknown };
  readonly parsePremiumPhaseResult: (
    phaseNumber: number,
    value: unknown,
    options?: { readonly currentDate?: string }
  ) => unknown;
};

type PremiumServiceApi = {
  readonly generateSinglePhase: (
    phaseNumber: number,
    userData: unknown,
    previousData: unknown,
    apiKey: string
  ) => Promise<{ readonly success: boolean; readonly error?: string }>;
};

type PhasePromptApi = {
  readonly buildPhase1Prompt: (userData: Record<string, unknown>) => { readonly system: string; readonly user: string };
};

let phaseSchemaApi: PhaseSchemaApi | null = null;
let premiumServiceApi: PremiumServiceApi | null = null;
let phasePromptApi: PhasePromptApi | null = null;

function schemas(): PhaseSchemaApi {
  if (!phaseSchemaApi) {
    throw new Error('Premium phase schema API was not loaded.');
  }
  return phaseSchemaApi;
}

function premiumService(): PremiumServiceApi {
  if (!premiumServiceApi) {
    throw new Error('Premium service API was not loaded.');
  }
  return premiumServiceApi;
}

function phasePrompts(): PhasePromptApi {
  if (!phasePromptApi) {
    throw new Error('Phase prompt API was not loaded.');
  }
  return phasePromptApi;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function runAssertion(name: string, assertion: SchemaAssertion): Promise<AssertionResult> {
  try {
    await assertion();
    console.log(`[PASS] ${name}`);
    return { name, passed: true };
  } catch (error) {
    const message = errorMessage(error);
    console.error(`[FAIL] ${name}: ${message}`);
    return { name, passed: false, message };
  }
}

function schema_accepts_valid_minimal_phase_payloads() {
  const phasePayloads: Record<number, unknown> = {
    1: {
      summary: {
        title: '정산한 운세의 시작',
        content: '이번 시기는 기본 축의 강약이 명확해집니다.',
        trust_score: 3,
        trust_reason: '현재 데이터의 일관성으로 판단됩니다.',
      },
      traits: [{
        type: 'saju',
        name: '토의 기반',
        description: '내실형 에너지의 편향이 관측됩니다.',
        grade: 'B',
      }],
      core_analysis: {
        lacking_elements: {
          elements: '목',
          remedy: '휴식 루틴',
          description: '목 기운이 부족해 진로 판단에서 흔들립니다.',
        },
        abundant_elements: {
          elements: '토',
          usage: '안정화',
          description: '토의 기반이 계획 정리에 유리합니다.',
        },
      },
    },
    2: {
      astro_deep: {
        sun_moon_dynamic: {
          title: '월식기',
          content: '태양과 달의 리듬이 감정 전환을 유도합니다.',
        },
      },
    },
    3: {
      tarot_details: [
        {
          position: '과거',
          card_name: 'The High Priestess',
          interpretation: '과거의 침묵이 현재 판단을 지연시켰습니다.',
        },
      ],
      numerology: {
        life_path: {
          number: 7,
          title: '내면형',
          meaning: '성찰을 우선으로 삼는 구조입니다.',
          saju_connection: '일간의 균형 축과 동일한 흐름입니다.',
        },
        lucky_numbers: [3, 7],
        lucky_day_advice: '월별 반복 패턴을 참고하세요.',
      },
    },
    4: {
      saju_sections: [
        {
          id: 'day_master',
          title: '일간',
          content: '일간은 결정을 앞당기는 성향을 강화합니다.',
        },
      ],
    },
    5: {
      fortune_flow: {
        major_luck: {
          title: '현재의 대운',
          period: '2026-06',
          content: '장기 흐름은 보수적 실행을 요구합니다.',
        },
        yearly_luck: {
          title: '올해 운영 포인트',
          content: '연도 전반은 신호를 분리해 읽을 필요가 있습니다.',
        },
      },
    },
    6: {
      life_areas: {
        career: {
          title: '직업',
          content: '실행은 빠르되 우선순위를 명확히 두는 것이 중요합니다.',
        },
      },
    },
    7: {
      special_analysis: {
        noble_person: {
          title: '귀인',
          content: '주변 조언자의 관측이 실마리 역할을 합니다.',
        },
      },
      lucky_assets: {
        colors: [{
          name: 'Deep Blue',
          hex: '#123456',
          reason: '판단을 차분하게 유지합니다.',
        }],
        foods: [{
          name: '따뜻한 차',
          benefit: '긴장을 낮추는 루틴을 만듭니다.',
        }],
        places: [{
          name: '조용한 서점',
          description: '정보를 천천히 정리하기 좋은 장소입니다.',
        }],
      },
      action_plan: [
        {
          date: '2026-06-10',
          title: '현황 점검',
          description: '현재 패턴을 정리해 다음 행동을 고정하세요.',
          type: 'routine',
        },
      ],
      date_selection: {
        auspicious: [
          {
            date: '2026-06-20',
            purpose: '정리',
            reason: '변곡점 점검용으로 안정적인 날짜입니다.',
          },
        ],
        inauspicious: [
          {
            date: '2026-06-22',
            purpose: '큰 결정 보류',
            reason: '현재 신호가 약할 가능성이 있습니다.',
          },
        ],
      },
    },
    8: {
      past_life: {
        theme: { title: '계속된 반복', content: '반복되는 선택 패턴이 드러납니다.' },
        karma: { title: '업보', content: '과거의 미완성이 현재를 밀어올립니다.' },
        soul_mission: { title: '전환', content: '완성을 미루지 않는 태도를 연습하세요.' },
      },
      glossary: [{
        term: '일간',
        hanja: '日干',
        definition: '나를 대표하는 중심 글자입니다.',
        context: '이 리딩에서는 판단 방식과 반복되는 선택 패턴을 읽는 기준점입니다.',
      }],
      final_verdict: {
        title: '최종 정리',
        core_message: '행동보다 기준이 먼저입니다.',
        saju_foundation: '일간-일지 정합성으로 요약됩니다.',
        astro_support: '점성의 시점은 방어를 강화합니다.',
        tarot_insight: '카드 흐름은 현재 선택을 조용히 지지합니다.',
        action_priorities: ['우선순위 조정', '리스크 축소'],
        closing_words: '당장의 정리에서 안정이 옵니다.',
      },
    },
  };

  for (const [phaseText, payload] of Object.entries(phasePayloads)) {
    const phaseNumber = Number(phaseText);
    schemas().parsePremiumPhaseResult(phaseNumber, payload, { currentDate: '2026-06-06' });
    assert.equal(schemas().getPremiumPhaseSchema(phaseNumber), schemas().getPremiumPhaseSchema(phaseNumber));
    schemas().getPremiumPhaseSchema(phaseNumber).parse(payload);
  }
}

function schema_rejects_invalid_phase_number() {
  assert.throws(
    () => schemas().parsePremiumPhaseResult(9, {}),
    /Invalid premium phase number/i,
  );
}

function schema_rejects_past_phase5_dates_for_current_date_2026_06_06() {
  assert.throws(
    () => schemas().parsePremiumPhaseResult(5, {
      fortune_flow: {
        major_luck: {
          title: '월말 경향',
          content: '과거 월중 조짐이 누적됩니다.',
          period: '2025-12',
        },
        yearly_luck: {
          title: '연간 요약',
          content: '신중한 확정이 필요합니다.',
        },
        monthly_luck: [
          {
            month: '2026-05',
            theme: '수습',
            advice: '리스크 완충이 먼저 필요합니다.',
          },
        ],
      },
    }, {
      currentDate: '2026-06-06',
    }),
    /past month/i
  );
}

function schema_rejects_localized_past_phase5_month_for_current_date_2026_06_06() {
  assert.throws(
    () => schemas().parsePremiumPhaseResult(5, {
      fortune_flow: {
        major_luck: {
          title: '월별 경향',
          content: '과거 월중 조짐이 누적됩니다.',
        },
        yearly_luck: {
          title: '연간 요약',
          content: '신중한 확정이 필요합니다.',
        },
        monthly_luck: [
          {
            month: '1월',
            theme: '수습',
            advice: '리스크 완충이 먼저 필요합니다.',
          },
        ],
      },
    }, {
      currentDate: '2026-06-06',
    }),
    /past month/i
  );

  assert.throws(
    () => schemas().parsePremiumPhaseResult(5, {
      fortune_flow: {
        major_luck: {
          title: '월별 경향',
          content: '과거 월중 조짐이 누적됩니다.',
          period: '2026년 5월',
        },
        yearly_luck: {
          title: '연간 요약',
          content: '신중한 확정이 필요합니다.',
        },
      },
    }, {
      currentDate: '2026-06-06',
    }),
    /past month/i
  );
}

function schema_rejects_english_past_phase5_month_for_current_date_2026_06_06() {
  assert.throws(
    () => schemas().parsePremiumPhaseResult(5, {
      fortune_flow: {
        major_luck: {
          title: 'Monthly trend',
          content: 'Past month guidance should not be accepted as future guidance.',
        },
        yearly_luck: {
          title: 'Yearly overview',
          content: 'Future windows must be bounded by the current date.',
        },
        monthly_luck: [
          {
            month: 'January',
            theme: 'Reset',
            advice: 'Rebuild the buffer before taking action.',
          },
        ],
      },
    }, {
      currentDate: '2026-06-06',
    }),
    /past month/i
  );

  assert.throws(
    () => schemas().parsePremiumPhaseResult(5, {
      fortune_flow: {
        major_luck: {
          title: 'Monthly trend',
          content: 'Past month guidance should not be accepted as future guidance.',
          period: 'May 2026',
        },
        yearly_luck: {
          title: 'Yearly overview',
          content: 'Future windows must be bounded by the current date.',
        },
      },
    }, {
      currentDate: '2026-06-06',
    }),
    /past month/i
  );
}

function schema_rejects_direct_medical_and_financial_instruction_markers() {
  assert.throws(
    () => schemas().parsePremiumPhaseResult(6, {
      life_areas: {
        health: {
          title: '건강',
          content: '의료 진단 없이 약물을 더 먹고 수술 일정을 잡는 방식은 추천되지 않습니다.',
        },
      },
    }),
    /forbidden.*(medical|financial)/i
  );
}

function schema_rejects_english_medical_instruction_markers() {
  assert.throws(
    () => schemas().parsePremiumPhaseResult(6, {
      life_areas: {
        health: {
          title: 'Health',
          content: 'Stop your medication and schedule surgery next month.',
        },
      },
    }),
    /forbidden.*(medical|financial)/i
  );
}

function validPhaseSevenPayload() {
  return {
    special_analysis: {
      noble_person: {
        title: '귀인',
        content: '주변 조언자의 관측이 실마리 역할을 합니다.',
      },
    },
    lucky_assets: {
      colors: [{
        name: 'Deep Blue',
        hex: '#123456',
        reason: '판단을 차분하게 유지합니다.',
      }],
    },
    action_plan: [
      {
        date: '2026-06-10',
        title: '현황 점검',
        description: '현재 패턴을 정리해 다음 행동을 고정하세요.',
        type: 'routine',
      },
    ],
    date_selection: {
      auspicious: [
        {
          date: '2026-06-20',
          purpose: '정리',
          reason: '변곡점 점검용으로 안정적인 날짜입니다.',
        },
      ],
    },
  };
}

function validPhaseEightPayload() {
  return {
    past_life: {
      theme: { title: '계속된 반복', content: '반복되는 선택 패턴이 드러납니다.' },
      karma: { title: '업보', content: '과거의 미완성이 현재를 밀어올립니다.' },
      soul_mission: { title: '전환', content: '완성을 미루지 않는 태도를 연습하세요.' },
    },
    glossary: [{
      term: '일간',
      hanja: '日干',
      definition: '나를 대표하는 중심 글자입니다.',
      context: '이 리딩에서는 판단 방식과 반복되는 선택 패턴을 읽는 기준점입니다.',
    }],
    final_verdict: {
      title: '최종 정리',
      core_message: '행동보다 기준이 먼저입니다.',
      saju_foundation: '일간-일지 정합성으로 요약됩니다.',
      astro_support: '점성의 시점은 방어를 강화합니다.',
      tarot_insight: '카드 흐름은 현재 선택을 조용히 지지합니다.',
      action_priorities: ['우선순위 조정', '리스크 축소'],
      closing_words: '당장의 정리에서 안정이 옵니다.',
    },
  };
}

function schema_rejects_unsafe_phase7_and_phase8_guidance() {
  const unsafePhaseSeven = validPhaseSevenPayload();
  unsafePhaseSeven.action_plan[0].description = '특정 주식 매수와 암호화폐 풀매수를 바로 실행하세요.';

  assert.throws(
    () => schemas().parsePremiumPhaseResult(7, unsafePhaseSeven, { currentDate: '2026-06-06' }),
    /forbidden.*(medical|financial)/i
  );

  const unsafePhaseEight = validPhaseEightPayload();
  unsafePhaseEight.final_verdict.action_priorities = ['레버리지 코인 매수', '특정 주식 매수'];

  assert.throws(
    () => schemas().parsePremiumPhaseResult(8, unsafePhaseEight, { currentDate: '2026-06-06' }),
    /forbidden.*(medical|financial)/i
  );
}

function schema_rejects_english_crypto_and_all_in_phase7_guidance() {
  const unsafePhaseSeven = validPhaseSevenPayload();
  unsafePhaseSeven.action_plan[0].description = 'Buy Bitcoin and go all in today.';

  assert.throws(
    () => schemas().parsePremiumPhaseResult(7, unsafePhaseSeven, { currentDate: '2026-06-06' }),
    /forbidden.*(medical|financial)/i
  );
}

function schema_rejects_past_phase8_action_priority_dates() {
  const unsafePhaseEight = validPhaseEightPayload();
  unsafePhaseEight.final_verdict.action_priorities = ['2026-05-01에 결정을 끝내세요.'];

  assert.throws(
    () => schemas().parsePremiumPhaseResult(8, unsafePhaseEight, { currentDate: '2026-06-06' }),
    /past date/i
  );
}

function schema_rejects_malformed_phase7_dates() {
  assert.throws(
    () => schemas().parsePremiumPhaseResult(7, {
      date_selection: {
        auspicious: [
          {
            date: '06/20/2026',
            purpose: '행동 타이밍',
            reason: '포맷 확인용',
          },
        ],
      },
    }, { currentDate: '2026-06-06' }),
    /must be in YYYY-MM-DD format/i
  );
}

function buildGoogleResponse(payload: unknown): Response {
  return new Response(JSON.stringify({
    candidates: [{
      finishReason: 'STOP',
      content: { parts: [{ text: JSON.stringify(payload) }] },
    }],
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function sampleUserData() {
  return {
    birthDate: '1994-04-12',
    birthTime: '12:00',
    context: 'career',
    question: '이직을 지금 해야 할까요?',
    sajuData: {
      dayMaster: '甲',
      yeonPillar: { stem: '壬', branch: '申' },
      monthPillar: { stem: '丙', branch: '寅' },
      dayPillar: { stem: '甲', branch: '子' },
      hourPillar: { stem: '庚', branch: '午' },
    },
    astroData: sampleAstroData(),
    tarotCards: [
      { id: 1, name: '마법사', nameEn: 'The Magician', isReversed: false, keywords: [], interpretation: '', image: '' },
      { id: 11, name: '정의', nameEn: 'Justice', isReversed: false, keywords: [], interpretation: '', image: '' },
      { id: 17, name: '별', nameEn: 'The Star', isReversed: true, keywords: [], interpretation: '', image: '' },
    ],
    language: 'ko',
    currentDate: '2026-06-06',
  };
}

function sampleAstroData() {
  return {
    sunSign: '양자리',
    sunSignIndex: 0,
    sunSignElement: 'fire',
    moonSign: '황소자리',
    moonSignIndex: 1,
    moonSignElement: 'earth',
    ascendant: '쌍둥이자리',
    ascendantIndex: 2,
    ascendantElement: 'air',
    planets: [
      { planet: 'sun', sign: 0, signName: '양자리', signElement: 'fire', degree: 12.3, house: 10 },
      { planet: 'moon', sign: 1, signName: '황소자리', signElement: 'earth', degree: 5.2, house: 11 },
    ],
    aspects: [{ planet1: 'sun', planet2: 'moon', aspect: 'sextile', orb: 2.1 }],
    enhancedAspects: [{ planet1: 'sun', planet2: 'moon', aspect: 'sextile', orb: 2.1, applying: true }],
    dignities: { sun: { dignity: 'exaltation', score: 4 } },
    patterns: [{ name: 'bucket', planets: ['sun', 'moon'] }],
    calculationSource: 'server_calculateAstrology',
  };
}

function premium_prompt_uses_computed_source_contract_and_full_astro_data() {
  const prompt = phasePrompts().buildPhase1Prompt({
    ...sampleUserData(),
    sajuData: {
      dayPillar: { stem: '甲', branch: '子' },
      monthPillar: { stem: '丙', branch: '寅' },
      daeun: { currentDaeun: { stem: '戊', branch: '辰' } },
      sewoon: { year: 2026, stem: '丙', branch: '午' },
    },
    astroData: sampleAstroData(),
  });
  const combined = `${prompt.system}\n${prompt.user}`;

  assert.match(combined, /계산_원천_계약/);
  assert.match(combined, /모델 내부에서 사주 기둥, 별자리, 하우스, 각도, 품위, 대운, 세운, 월운을 다시 계산하지 마십시오/);
  assert.match(combined, /server_calculateAstrology/);
  assert.match(combined, /enhancedAspects/);
  assert.match(combined, /dignities/);
  assert.match(combined, /patterns/);
  assert.match(combined, /signName/);
}

function validPhaseOnePayload() {
  return {
    summary: {
      title: '전환 전 점검',
      content: '이직을 지금 바로 크게 확정하기보다, 2026-06 안에 지원 직무 2개와 보류 조건 2개를 먼저 좁혀야 합니다. 사주 앵커는 일간 甲, 월주 丙寅, 일주 甲子이고 점성술 앵커는 태양 양자리, 달 황소자리, 상승궁 쌍둥이자리입니다. 타로 앵커는 마법사 정방향, 정의 정방향, 별 역방향이며, 이 신호는 작은 실행 뒤 반응을 비교하라고 말합니다. 지금 필요한 것은 감정 확신이 아니라 실제 회신률과 면접 가능성이라는 증거입니다. KASI와 JPL은 계산 원천 검증 전용이고 계산 원천은 해석 권위가 아님을 밝힙니다. Waite와 Tetrabiblos는 검토된 해석 맥락 후보이며 원문을 복사하지 않습니다. 타로 이미지 권리와 의미 근거는 분리해 다룹니다. 그래서 이번 리포트의 핵심은 퇴사 결심을 크게 부풀리는 것이 아니라, 현재 회사에 남을 조건과 나갈 조건을 문장으로 분리한 뒤 실제 시장 반응을 확인하는 것입니다.',
      trust_score: 4,
      trust_reason: '일간 甲, 태양 양자리, 마법사 정방향 근거가 모두 큰 사직보다 작은 검증을 먼저 요구합니다. 특히 기준일 이후 7일 안에 회신률을 비교해야 감정이 아니라 증거로 판단할 수 있습니다.',
    },
    traits: [{
      type: 'saju',
      name: '정리형',
      description: '일간 甲과 월주 丙寅 구조상 결정을 내리기 전에 기준을 좁히는 힘이 강하지만, 기준이 많아지면 실행이 늦어지는 패턴도 함께 커집니다. 좋은 선택지를 고르는 능력은 있지만, 선택지를 비교하는 시간이 길어지면 결국 가장 중요한 타이밍을 놓치기 쉽습니다.',
      grade: 'A',
    }],
    core_analysis: {
      lacking_elements: {
        elements: '목',
        remedy: '작은 실행',
        description: '목 기운은 새 출발과 확장성을 뜻하므로, 부족할 때는 이력서 수정 같은 준비만 반복하고 실제 지원을 미루기 쉽습니다. 이번에는 48시간 안에 한 곳에 먼저 보내는 행동으로 보강해야 합니다. 지원 후에는 답장이 왔는지, 면접 가능성이 열렸는지, 조건이 현재 회사보다 나은지 세 가지 지표만 기록하십시오. 이 세 지표가 없으면 이직 운을 더 해석해도 판단은 선명해지지 않습니다.',
      },
      abundant_elements: {
        elements: '토',
        usage: '현실 점검',
        description: '토 기운은 현실 점검과 안정성을 만들지만 과하면 손실 계산만 반복합니다. 장점은 체크리스트로 쓰고, 단점은 2026-06-13 review date를 정해 멈추는 방식으로 제어해야 합니다. 이 날짜까지 새 정보가 없으면 더 고민하지 말고 현재 직장의 협상 카드, 이직 지원, 보류 중 하나로 분류해야 합니다. 계속 생각만 늘리는 것은 안정이 아니라 판단 회피입니다.',
      },
    },
  };
}

function compactButEvidencePhaseOnePayload() {
  return {
    summary: {
      title: '근거는 있으나 짧은 리포트',
      content: '사주 일간과 타로 카드가 모두 작은 실행을 먼저 보라고 합니다. 2026-06 안에 회신률을 비교하세요.',
      trust_score: 4,
      trust_reason: '사주 일간과 타로 카드 근거가 있습니다.',
    },
    traits: [{
      type: 'saju',
      name: '검증형',
      description: '사주 기준으로 실행 전 확인이 필요합니다.',
      grade: 'A',
    }],
    core_analysis: {
      lacking_elements: {
        elements: '목',
        remedy: '작은 실행',
        description: '사주 목 기운 보완을 위해 작은 실행이 필요합니다.',
      },
      abundant_elements: {
        elements: '토',
        usage: '현실 점검',
        description: '사주 토 기운이 강해 현실 점검이 중요합니다.',
      },
    },
  };
}

function longButLowDensityPhaseOnePayload() {
  const paddedContent = Array.from({ length: 14 }, () => (
    '사주 일간은 현재 구조를 설명합니다. 사주 월지는 생활 리듬을 설명합니다. 타로 카드는 현재 심리를 설명합니다.'
  )).join(' ');

  return {
    summary: {
      title: '길지만 밀도가 낮은 리포트',
      content: paddedContent,
      trust_score: 4,
      trust_reason: '사주 일간과 사주 월지와 타로 카드가 함께 언급됩니다.',
    },
    traits: [{
      type: 'saju',
      name: '구조형',
      description: '사주 일간과 월지가 반복적으로 언급됩니다.',
      grade: 'A',
    }],
    core_analysis: {
      lacking_elements: {
        elements: '목',
        remedy: '관찰',
        description: '사주 일간과 월지가 현재 구조를 설명합니다. 타로 카드는 현재 심리를 설명합니다.',
      },
      abundant_elements: {
        elements: '토',
        usage: '정리',
        description: '사주 일간과 월지가 현재 구조를 설명합니다. 타로 카드는 현재 심리를 설명합니다.',
      },
    },
  };
}

function thinPhaseOnePayload() {
  return {
    summary: {
      title: '좋은 흐름',
      content: '긍정적인 마음으로 자신을 믿으세요.',
      trust_score: 4,
      trust_reason: '좋은 흐름입니다.',
    },
    traits: [{
      type: 'saju',
      name: '좋은 사람',
      description: '좋은 선택을 할 수 있습니다.',
      grade: 'A',
    }],
    core_analysis: {
      lacking_elements: {
        elements: '목',
        remedy: '휴식',
        description: '균형이 필요합니다.',
      },
      abundant_elements: {
        elements: '토',
        usage: '안정',
        description: '조화와 균형이 중요합니다.',
      },
    },
  };
}

async function premium_generation_sends_response_schema_and_retries_invalid_payload() {
  const originalFetch = globalThis.fetch;
  const requestBodies: string[] = [];

  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    requestBodies.push(typeof init?.body === 'string' ? init.body : '');
    return buildGoogleResponse(validPhaseOnePayload());
  };

  try {
    const result = await premiumService().generateSinglePhase(1, sampleUserData(), null, 'test-key');
    assert.equal(result.success, true);
    const firstBody = JSON.parse(requestBodies[0] ?? '{}');
    assert.equal(firstBody.generationConfig.responseMimeType, 'application/json');
    assert.equal(typeof firstBody.generationConfig.responseJsonSchema, 'object');
  } finally {
    globalThis.fetch = originalFetch;
  }

  const compactRetryBodies: string[] = [];
  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    compactRetryBodies.push(typeof init?.body === 'string' ? init.body : '');
    return buildGoogleResponse(compactButEvidencePhaseOnePayload());
  };

  try {
    const result = await premiumService().generateSinglePhase(1, sampleUserData(), null, 'test-key');
    assert.equal(result.success, false);
    assert.match(result.error ?? '', /too thin|900 chars/i);
    assert.match(compactRetryBodies[1] ?? '', /QUALITY_RETRY/);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const lowDensityRetryBodies: string[] = [];
  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    lowDensityRetryBodies.push(typeof init?.body === 'string' ? init.body : '');
    return buildGoogleResponse(longButLowDensityPhaseOnePayload());
  };

  try {
    const result = await premiumService().generateSinglePhase(1, sampleUserData(), null, 'test-key');
    assert.equal(result.success, false);
    assert.match(result.error ?? '', /insufficient evidence-action density/i);
    assert.match(lowDensityRetryBodies[1] ?? '', /QUALITY_RETRY/);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const thinRetryBodies: string[] = [];
  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    thinRetryBodies.push(typeof init?.body === 'string' ? init.body : '');
    return buildGoogleResponse(thinPhaseOnePayload());
  };

  try {
    const result = await premiumService().generateSinglePhase(1, sampleUserData(), null, 'test-key');
    assert.equal(result.success, false);
    assert.match(result.error ?? '', /quality check|generic wording|too thin/i);
    assert.match(thinRetryBodies[1] ?? '', /QUALITY_RETRY/);
  } finally {
    globalThis.fetch = originalFetch;
  }

  globalThis.fetch = async (): Promise<Response> => buildGoogleResponse({ summary: {} });

  try {
    const result = await premiumService().generateSinglePhase(1, sampleUserData(), null, 'test-key');
    assert.equal(result.success, false);
    assert.match(result.error ?? '', /schema validation|Phase 1/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const assertions: Array<{ name: string; run: SchemaAssertion }> = [
  { name: 'schema_accepts_valid_minimal_phase_payloads', run: schema_accepts_valid_minimal_phase_payloads },
  { name: 'premium_prompt_uses_computed_source_contract_and_full_astro_data', run: premium_prompt_uses_computed_source_contract_and_full_astro_data },
  { name: 'schema_rejects_invalid_phase_number', run: schema_rejects_invalid_phase_number },
  { name: 'schema_rejects_past_phase5_dates_for_current_date_2026_06_06', run: schema_rejects_past_phase5_dates_for_current_date_2026_06_06 },
  { name: 'schema_rejects_localized_past_phase5_month_for_current_date_2026_06_06', run: schema_rejects_localized_past_phase5_month_for_current_date_2026_06_06 },
  { name: 'schema_rejects_english_past_phase5_month_for_current_date_2026_06_06', run: schema_rejects_english_past_phase5_month_for_current_date_2026_06_06 },
  { name: 'schema_rejects_direct_medical_and_financial_instruction_markers', run: schema_rejects_direct_medical_and_financial_instruction_markers },
  { name: 'schema_rejects_english_medical_instruction_markers', run: schema_rejects_english_medical_instruction_markers },
  { name: 'schema_rejects_unsafe_phase7_and_phase8_guidance', run: schema_rejects_unsafe_phase7_and_phase8_guidance },
  { name: 'schema_rejects_english_crypto_and_all_in_phase7_guidance', run: schema_rejects_english_crypto_and_all_in_phase7_guidance },
  { name: 'schema_rejects_past_phase8_action_priority_dates', run: schema_rejects_past_phase8_action_priority_dates },
  { name: 'schema_rejects_malformed_phase7_dates', run: schema_rejects_malformed_phase7_dates },
  { name: 'premium_generation_sends_response_schema_and_retries_invalid_payload', run: premium_generation_sends_response_schema_and_retries_invalid_payload },
];

async function run() {
  const restoreLoader = registerTypeScriptLoader();
  try {
    phaseSchemaApi = localRequire('../src/lib/ai/premium-report-schemas.ts');
    premiumServiceApi = localRequire('../src/lib/ai/premium-reading-service.ts');
    phasePromptApi = localRequire('../src/lib/ai/phase-prompts.ts');

    const results: AssertionResult[] = [];
    for (const assertion of assertions) {
      results.push(await runAssertion(assertion.name, assertion.run));
    }
    const failed = results.filter((entry) => !entry.passed);

    if (failed.length > 0) {
      const names = failed.map((entry) => entry.name).join(', ');
      throw new Error(`Premium phase schema assertions failed: ${names}`);
    }

    console.log('Premium report schema verification passed');
  } finally {
    restoreLoader();
  }
}

run().catch((error: unknown) => {
  console.error(errorMessage(error));
  process.exitCode = 1;
});
