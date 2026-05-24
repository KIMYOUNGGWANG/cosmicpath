#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

require_match() {
  local file="$1"
  local needle="$2"
  if ! grep -F -q "$needle" "$file"; then
    echo "Missing expected pattern in $file: $needle" >&2
    exit 1
  fi
}

require_absence() {
  local file="$1"
  local needle="$2"
  if grep -F -q "$needle" "$file"; then
    echo "Unexpected pattern still present in $file: $needle" >&2
    exit 1
  fi
}

require_match "src/app/start/page.tsx" "from './start-input-stage'"
require_match "src/app/start/page.tsx" "from './start-result-stage'"
require_match "src/app/start/page.tsx" "useStartResume"
require_match "src/app/start/page.tsx" "useStartResultModals"
require_match "src/app/start/page.tsx" "useStartReviewGate"

require_match "src/app/api/reading/route.ts" "from './reading-runtime-service'"
require_match "src/app/api/reading/route.ts" "from './reading-generation-service'"
require_match "src/app/api/reading/route.ts" "from './reading-request-service'"
require_absence "src/app/api/reading/route.ts" "calculateOracleSajuProfile"

require_match "src/lib/ai/prompt-builder.ts" "from './prompt-shared-rules'"
require_match "src/lib/ai/phase-prompts.ts" "buildPromptSharedPrelude"
require_match "src/lib/ai/prompt-shared-rules.ts" "free_focus"

require_match "src/components/reading/premium-report.tsx" "from './premium-report-sections'"
require_absence "src/components/reading/premium-report.tsx" "function FortuneFlowSection"
require_absence "src/components/reading/premium-report.tsx" "function LifeAreasSection"
require_absence "src/components/reading/premium-report.tsx" "function CompatibilitySection"
require_absence "src/components/reading/premium-report.tsx" "function AstroDeepSection"

require_match "src/lib/ai/oracle-followup-context.ts" "followUpMetadata"
require_match "src/lib/ai/oracle-followup-context.ts" "sajuResult"
require_match "src/lib/ai/oracle-followup-context.ts" "localSajuPromptBlock"

require_match "src/app/api/reading/followup/route.ts" "authorizeOracleAccess"
require_match "src/app/api/reading/followup/route.ts" "mergeFollowUpMetadata"
require_match "src/app/api/reading/followup/stream/route.ts" "authorizeOracleAccess"
require_match "src/app/api/reading/followup/stream/route.ts" "mergeFollowUpMetadata"

require_match "src/app/api/payment/route.ts" "session_id"
require_match "src/app/api/payment/route.ts" "accessKey"
require_match "src/app/start/use-start-resume.ts" "getStoredReadingAccessKey"

# Grand Oracle Chat Trust Hardening (2026-04-17)
require_match "src/lib/oracle-chat.ts" "getOptionalSajuSummary(latestReadingContext)"
require_match "src/app/api/oracle-chat/message/route.ts" "### 🔮 수석 오라클의 최종 결론"
require_match "src/components/payment/SubscriptionModal.tsx" "DAILY_PAYWALL_COPY"

# Relationship Contact Timing Wedge (2026-05-24)
require_match "src/app/relationship/contact-timing/page.tsx" "utm_source"
require_match "src/app/start/start-result-stage.tsx" "relationship_contact_followup_seeded"
require_match "src/app/start/start-result-stage.tsx" "en_relationship_contact_followup_seeded"
require_match "src/lib/growth-metrics.ts" "english_contact_prompt_clicked"
require_match "src/lib/growth-metrics.ts" "relationship_followup_opt_in"
require_match "src/app/api/payment/route.ts" "source: checkoutSource"
require_match "src/app/payment/success/page.tsx" "source: resolvedSource"
require_match "docs/api-spec.md" "relationship_contact_followup_seeded"
require_match "docs/revenue/relationship-contact-timing-threads-batch-2026-05-24.json" "utm_campaign=relationship_contact_timing_v1"

echo "Refactor regression checks passed"
