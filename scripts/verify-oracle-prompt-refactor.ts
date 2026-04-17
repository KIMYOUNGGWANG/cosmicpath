// @ts-nocheck
import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function registerTypeScriptLoader() {
  const originalResolveFilename = Module._resolveFilename;
  const originalTsLoader = require.extensions['.ts'];
  const originalTsxLoader = require.extensions['.tsx'];

  Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
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

      for (const extension of ['.ts', '.tsx', '.js', '.json']) {
        try {
          return originalResolveFilename.call(this, `${request}${extension}`, parent, isMain, options);
        } catch {
          // Try the next extension.
        }
      }

      throw error;
    }
  };

  function compileTypeScript(module, filename, isTsx) {
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

    module._compile(output.outputText, filename);
  }

  require.extensions['.ts'] = function loadTs(module, filename) {
    compileTypeScript(module, filename, false);
  };

  require.extensions['.tsx'] = function loadTsx(module, filename) {
    compileTypeScript(module, filename, true);
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

function runGoldenSamples() {
  const restoreLoader = registerTypeScriptLoader();

  try {
    const {
      buildChatSystemPrompt,
      buildChatUserPrompt,
      buildStructuredSystemPrompt,
    } = require('../src/lib/ai/prompt-builder.ts');
    const { buildPhase1Prompt } = require('../src/lib/ai/phase-prompts.ts');
    const goldenSamples = require('./oracle-prompt-golden-samples.json');

    for (const sample of goldenSamples.samples) {
      let prompt = '';

      switch (sample.type) {
        case 'structured':
          prompt = buildStructuredSystemPrompt(
            sample.language,
            sample.currentDate,
            sample.options
          );
          break;
        case 'chat':
          prompt = buildChatSystemPrompt(
            sample.readingData,
            sample.language,
            sample.factsOfDestinyBlock
          );
          break;
        case 'phase1':
          prompt = buildPhase1Prompt(sample.userData).system;
          break;
        default:
          throw new Error(`Unknown golden sample type: ${String(sample.type)}`);
      }

      for (const expected of sample.expectedContains ?? []) {
        assert.match(prompt, new RegExp(escapeRegExp(expected)), `${sample.id} missing expected text: ${expected}`);
      }

      for (const unexpected of sample.expectedNotContains ?? []) {
        assert.doesNotMatch(prompt, new RegExp(escapeRegExp(unexpected)), `${sample.id} still contains forbidden text: ${unexpected}`);
      }
    }

    const noFactsPrompt = buildChatSystemPrompt(
      {
        saju: '사주 요약 없음',
        astrology: '점성 요약 없음',
        tarot: [],
        name: '테스터',
      },
      'ko'
    );

    assert.match(noFactsPrompt, /제공된 문자 데이터만 인용/);
    assert.doesNotMatch(noFactsPrompt, /엔진 수치 최소 2개 인용/);
    assert.match(noFactsPrompt, /의료 진단, 투약 변경, 수술, 치료 중단 관련 질문/);
    assert.match(noFactsPrompt, /대화 이력과 현재 Facts가 충돌하면/);

    const userPrompt = buildChatUserPrompt(
      '주식 풀매수 할까요?',
      'User: 안녕하세요\nAssistant: 반갑습니다'
    );
    assert.match(userPrompt, /<chat_history>/);
    assert.match(userPrompt, /Facts of Destiny 원본 데이터와 충돌하면 원본을 우선/);
    assert.match(userPrompt, /현재 질문: 주식 풀매수 할까요\?/);
  } finally {
    restoreLoader();
  }
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

runGoldenSamples();
console.log('Oracle prompt verification passed');
