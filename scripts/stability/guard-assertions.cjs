const fs = require('fs');
const path = require('path');

function read(filePath) {
  return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
}

function assertMatch(filePath, pattern, message) {
  const content = read(filePath);
  if (!pattern.test(content)) {
    throw new Error(`${message} [${filePath}]`);
  }
}

function assertNoMatch(filePath, pattern, message) {
  const content = read(filePath);
  if (pattern.test(content)) {
    throw new Error(`${message} [${filePath}]`);
  }
}

function pureLoc(filePath) {
  return read(filePath)
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed !== '' && !trimmed.startsWith('//') && !trimmed.startsWith('#');
    })
    .length;
}

function assertPureLocAtMost(filePath, maxLoc, message) {
  const count = pureLoc(filePath);
  if (count > maxLoc) {
    throw new Error(`${message}: ${count} > ${maxLoc} [${filePath}]`);
  }
}

module.exports = {
  assertMatch,
  assertNoMatch,
  assertPureLocAtMost,
};
