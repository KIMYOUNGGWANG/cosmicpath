#!/usr/bin/env node

import { spawn } from 'node:child_process';
import process from 'node:process';
import readline from 'node:readline';

const [, , nodeBin, nextBin, ...nextArgs] = process.argv;

if (!nodeBin || !nextBin) {
  console.error('Usage: filter-next-dev-logs.mjs <node-bin> <next-bin> [...next-args]');
  process.exit(1);
}

const ANSI_PATTERN = /\u001b\[[0-9;]*m/g;

const REQUEST_LOG_PATTERN = /^\s*(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+\/.*\s+\d{3}\s+in\s+/;
const INFO_LOG_PATTERNS = [
  /^\[Stripe\]\s+Resolved price:/,
  /^\[Stripe\]\s+Using fallback price label/,
];

function shouldSuppress(line) {
  const normalized = line.replace(ANSI_PATTERN, '').trim();
  if (!normalized) {
    return false;
  }

  if (REQUEST_LOG_PATTERN.test(normalized)) {
    return true;
  }

  return INFO_LOG_PATTERNS.some((pattern) => pattern.test(normalized));
}

const child = spawn(nodeBin, [nextBin, ...nextArgs], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: process.env,
});

const stdout = readline.createInterface({ input: child.stdout });
stdout.on('line', (line) => {
  if (!shouldSuppress(line)) {
    process.stdout.write(`${line}\n`);
  }
});

child.stderr.pipe(process.stderr);

child.on('exit', (code, signal) => {
  stdout.close();

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    child.kill(signal);
  });
}
