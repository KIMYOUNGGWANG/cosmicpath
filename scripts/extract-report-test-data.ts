import { createRequire } from 'node:module';

import { TEST_CASES, OUTPUT_PATH } from './report-test-data/cases.ts';
import { buildFixture } from './report-test-data/fixture-builder.ts';
import { registerTypeScriptLoader } from './report-test-data/ts-loader.ts';
import type {
  AssembleReadingRuntime,
  TarotArcana,
  ZodiacSign,
} from './report-test-data/types.ts';

const localRequire = createRequire(import.meta.url);

async function loadRuntimeModules() {
  const { assembleReadingRuntime } = localRequire('../src/app/api/reading/reading-runtime-service.ts') as {
    assembleReadingRuntime: AssembleReadingRuntime;
  };
  const { MAJOR_ARCANA } = localRequire('./report-test-data/tarot.ts') as {
    MAJOR_ARCANA: readonly TarotArcana[];
  };
  const { ZODIAC_SIGNS } = localRequire('../src/lib/engines/astrology.ts') as {
    ZODIAC_SIGNS: readonly ZodiacSign[];
  };

  return { assembleReadingRuntime, majorArcana: MAJOR_ARCANA, zodiacSigns: ZODIAC_SIGNS };
}

async function buildOutput() {
  const { assembleReadingRuntime, majorArcana, zodiacSigns } = await loadRuntimeModules();
  const cases = [];

  for (const testCase of TEST_CASES) {
    cases.push(await buildFixture(testCase, assembleReadingRuntime, majorArcana, zodiacSigns));
  }

  return {
    generatedAt: new Date().toISOString(),
    purpose: 'Premium report quality fixtures generated from the local saju, astrology, tarot, and reading runtime engines.',
    cases,
  };
}

async function main() {
  const restoreLoader = registerTypeScriptLoader();

  try {
    const fs = localRequire('node:fs') as typeof import('node:fs');
    const path = localRequire('node:path') as typeof import('node:path');
    const output = await buildOutput();

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
    console.log(`wrote ${OUTPUT_PATH}`);
    console.log(`cases=${output.cases.map((item) => item.id).join(',')}`);
  } finally {
    restoreLoader();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
