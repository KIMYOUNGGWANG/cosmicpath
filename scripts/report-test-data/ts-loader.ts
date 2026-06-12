import { createRequire } from 'node:module';
import { join, extname } from 'node:path';

const localRequire = createRequire(import.meta.url);
const fs = localRequire('node:fs') as typeof import('node:fs');
const Module = localRequire('node:module') as typeof import('node:module') & {
  _resolveFilename: (...args: unknown[]) => string;
};
const ts = localRequire('typescript') as typeof import('typescript');

const ROOT_DIR = process.cwd();

function candidatesFor(requestPath: string) {
  return [
    requestPath,
    `${requestPath}.ts`,
    `${requestPath}.tsx`,
    `${requestPath}.js`,
    `${requestPath}.json`,
    join(requestPath, 'index.ts'),
    join(requestPath, 'index.tsx'),
    join(requestPath, 'index.js'),
  ];
}

function resolveCandidate(
  requestPath: string,
  originalResolveFilename: (...args: unknown[]) => string,
  parent: unknown,
  isMain: boolean,
  options: unknown,
) {
  for (const candidate of candidatesFor(requestPath)) {
    try {
      return originalResolveFilename.call(Module, candidate, parent, isMain, options);
    } catch (error) {
      void error;
    }
  }

  return null;
}

function compileTypeScript(module: unknown, filename: string, isTsx: boolean) {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
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

  (module as { _compile: (source: string, filename: string) => void })._compile(output.outputText, filename);
}

function resolveAlias(
  request: string,
  originalResolveFilename: (...args: unknown[]) => string,
  parent: unknown,
  isMain: boolean,
  options: unknown,
) {
  const aliasPath = join(ROOT_DIR, 'src', request.slice(2));
  return resolveCandidate(aliasPath, originalResolveFilename, parent, isMain, options);
}

function resolveRelative(
  request: string,
  originalResolveFilename: (...args: unknown[]) => string,
  parent: unknown,
  isMain: boolean,
  options: unknown,
) {
  if (extname(request) || (!request.startsWith('.') && !request.startsWith('/'))) return null;
  return resolveCandidate(request, originalResolveFilename, parent, isMain, options);
}

export function registerTypeScriptLoader() {
  const originalResolveFilename = Module._resolveFilename;
  const originalTsLoader = localRequire.extensions['.ts'];
  const originalTsxLoader = localRequire.extensions['.tsx'];

  Module._resolveFilename = function patchedResolveFilename(...args: unknown[]) {
    const [request, parent, isMain, options] = args;
    const isMainFlag = typeof isMain === 'boolean' ? isMain : false;

    if (typeof request === 'string' && request.startsWith('@/')) {
      return resolveAlias(request, originalResolveFilename, parent, isMainFlag, options) ?? originalResolveFilename.call(Module, request, parent, isMainFlag, options);
    }

    try {
      return originalResolveFilename.call(Module, request, parent, isMainFlag, options);
    } catch (error) {
      if (typeof request !== 'string') throw error;
      return resolveRelative(request, originalResolveFilename, parent, isMainFlag, options) ?? (() => { throw error; })();
    }
  };

  localRequire.extensions['.ts'] = (module, filename) => compileTypeScript(module, filename, false);
  localRequire.extensions['.tsx'] = (module, filename) => compileTypeScript(module, filename, true);

  return () => {
    Module._resolveFilename = originalResolveFilename;
    if (originalTsLoader) localRequire.extensions['.ts'] = originalTsLoader;
    else delete localRequire.extensions['.ts'];

    if (originalTsxLoader) localRequire.extensions['.tsx'] = originalTsxLoader;
    else delete localRequire.extensions['.tsx'];
  };
}
