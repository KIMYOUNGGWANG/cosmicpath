const { assertMatch } = require('./guard-assertions.cjs');

function runGrowthLegalGuards() {
  assertMatch(
    'src/lib/growth-metrics.ts',
    /key:\s*'relationship-contact'[\s\S]*next_move_report_mvp_v1[\s\S]*relationship_contact_timing_v1/,
    'Growth readout should group Next Move with relationship contact history'
  );
  assertMatch(
    'src/lib/growth-metrics.ts',
    /NEXT_MOVE_REPORT_DECISION_THRESHOLDS[\s\S]*visits:\s*300[\s\S]*days:\s*14[\s\S]*questionStarts:\s*45[\s\S]*freeVerdicts:\s*30[\s\S]*paywallOpens:\s*8[\s\S]*paidConversions:\s*2[\s\S]*followupSeeds:\s*8/,
    'Growth readout should encode the 14-day Next Move decision thresholds'
  );
  assertMatch(
    'src/components/ops/GrowthDashboard.tsx',
    /Decision Timing 14-day decision gate[\s\S]*visits 300 or 14 days[\s\S]*question starts 45[\s\S]*paid conversions 2/,
    'Ops dashboard should render the Decision Timing continuation thresholds'
  );
  assertMatch(
    'src/app/terms/page.tsx',
    /CosmicPath Decision Note[\s\S]*7-Day Decision Packet/,
    'Terms should disclose the Decision Note umbrella and paid report content'
  );
  assertMatch(
    'src/app/terms/page.tsx',
    /no guaranteed relationship, career, money, health, or life outcome[\s\S]*not therapy, medical, diagnostic, legal, or financial advice/s,
    'Terms should disclose Next Move relationship outcome and professional-advice boundaries'
  );
  assertMatch(
    'src/app/privacy/page.tsx',
    /decision context[\s\S]*optional birth data[\s\S]*note restore and storage[\s\S]*analytics[\s\S]*do not paste highly sensitive third-party secrets/s,
    'Privacy policy should disclose Next Move relationship input, optional birth data, restore, analytics, and sensitive third-party secret boundaries'
  );
}

module.exports = { runGrowthLegalGuards };
