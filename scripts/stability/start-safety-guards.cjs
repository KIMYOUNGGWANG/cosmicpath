const { assertMatch, assertNoMatch } = require('./guard-assertions.cjs');

function runStartSafetyGuards() {
  assertMatch(
    'src/app/start/start-page-helpers.ts',
    /next_move_report_mvp_v1/,
    'Start flow should recognize the Next Move Report MVP source'
  );
  assertNoMatch(
    'src/components/landing/Navigation.tsx',
    /href="\/daily"|href="\/career\/uncertainty"|>\s*PRO\s*</,
    'Primary landing navigation should not expose legacy Daily/Career/PRO acquisition'
  );
  assertMatch(
    'src/lib/ai/prompt-shared-rules.ts',
    /buildRelationshipDecisionSafetyRule[\s\S]*guaranteed reply[\s\S]*무조건 답장[\s\S]*stalking[\s\S]*스토킹/i,
    'Shared prompt rules should include explicit relationship reply-guarantee and stalking boundaries'
  );
  assertMatch(
    'src/app/api/reading/route-helpers.ts',
    /계속 확인/,
    'Free reading high-risk terms should include repeated checking'
  );
  assertMatch(
    'src/app/api/reading/route-helpers.ts',
    /찾아가/,
    'Free reading high-risk terms should include showing-up behavior'
  );
  assertMatch(
    'src/app/api/reading/route-helpers.ts',
    /buildRelationshipSafetyFreeFocus[\s\S]*보류[\s\S]*Hold[\s\S]*스토킹[\s\S]*pressure/i,
    'Free reading fallback should convert high-risk relationship pressure into hold guidance'
  );
  assertMatch(
    'src/components/payment/PaymentModal.tsx',
    /const isRelationshipContactTiming[\s\S]*trackingSource === 'next_move_report_mvp_v1'/,
    'PaymentModal should treat Next Move as relationship contact timing'
  );
  assertMatch(
    'src/components/payment/payment-modal-copy.ts',
    /message pressure or surveillance[\s\S]*감시성 확인/i,
    'Payment modal copy should preserve relationship contact timing safety copy'
  );
  assertMatch(
    'src/app/relationship/contact-timing/page.tsx',
    /href="\/terms"[\s\S]*href="\/privacy"/,
    'Next Move public route should keep terms and privacy links visible'
  );
}

module.exports = { runStartSafetyGuards };
