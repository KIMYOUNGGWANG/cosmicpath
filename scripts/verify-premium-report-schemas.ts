import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(`${process.cwd()}/scripts/verify-premium-report-schemas.ts`);
const Module = require('node:module');
const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');

function registerTypeScriptLoader() {
  const originalResolveFilename = Module._resolveFilename;
  const originalTsLoader = require.extensions['.ts'];
  const originalTsxLoader = require.extensions['.tsx'];

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

  require.extensions['.ts'] = function loadTs(module: NodeJS.Module, filename: string) {
    compileTypeScript(module, filename);
  };

  require.extensions['.tsx'] = function loadTsx(module: NodeJS.Module, filename: string) {
    compileTypeScript(module, filename);
  };

  return () => {
    Module._resolveFilename = originalResolveFilename;
    if (originalTsLoader) {
      require.extensions['.ts'] = originalTsLoader;
    } else {
      delete require.extensions['.ts'];
    }

    if (originalTsxLoader) {
      require.extensions['.tsx'] = originalTsxLoader;
    } else {
      delete require.extensions['.tsx'];
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

let phaseSchemaApi: PhaseSchemaApi | null = null;
let premiumServiceApi: PremiumServiceApi | null = null;

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
    language: 'ko',
    currentDate: '2026-06-06',
  };
}

function validPhaseOnePayload() {
  return {
    summary: {
      title: '전환 전 점검',
      content: '지금은 기준을 정리해 움직임을 작게 시작할 시점입니다.',
      trust_score: 4,
      trust_reason: '사주와 카드 신호가 같은 방향을 가리킵니다.',
    },
    traits: [{
      type: 'saju',
      name: '정리형',
      description: '결정을 내리기 전에 기준을 좁히는 힘이 강합니다.',
      grade: 'A',
    }],
    core_analysis: {
      lacking_elements: {
        elements: '목',
        remedy: '작은 실행',
        description: '시작 에너지를 의식적으로 보강해야 합니다.',
      },
      abundant_elements: {
        elements: '토',
        usage: '현실 점검',
        description: '안정성을 만드는 힘이 강합니다.',
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
    phaseSchemaApi = require('../src/lib/ai/premium-report-schemas.ts');
    premiumServiceApi = require('../src/lib/ai/premium-reading-service.ts');

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
