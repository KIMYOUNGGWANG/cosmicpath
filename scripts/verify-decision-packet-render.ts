import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';

const premiumReport = readFileSync('src/components/reading/premium-report.tsx', 'utf8');
const caseFileReport = readFileSync('src/components/reading/case-file-report.tsx', 'utf8');
const printLayout = readFileSync('src/components/reading/PrintLayout.tsx', 'utf8');

assert.match(
  premiumReport,
  /<CaseFileReport[\s\S]*report=\{report\}/,
  'PremiumReport must mount CaseFileReport as the active visible report renderer.'
);
assert.match(
  caseFileReport,
  /const decisionPacket = !isFreeView \? report\.final_verdict\?\.decision_packet : undefined/,
  'The active renderer must expose packet data only for paid views.'
);

for (const field of [
  'decision_fork',
  'evidence_disagreement',
  'reality_checks',
  'seven_day_experiment',
  'seven_day_experiment.stop_rule',
  'if_then_rules',
]) {
  assert.ok(
    caseFileReport.includes(`decisionPacket.${field}`) || caseFileReport.includes(`decisionPacket?.${field}`),
    `Active CaseFileReport must render decision packet field: ${field}`
  );
}

assert.match(printLayout, /data\.final_verdict\.decision_packet/);
assert.match(printLayout, /id: 'decision-packet'/);

console.log('Decision Packet active renderer verification passed');
