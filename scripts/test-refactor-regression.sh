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

require_match "src/app/start/page.tsx" "from './start-page-stages'"
require_match "src/app/start/start-page-stages.tsx" "from './start-input-stage'"
require_match "src/app/start/start-page-stages.tsx" "from './start-result-stage'"
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
require_match "src/app/start/use-start-resume.ts" "start-resume-snapshot"
require_match "src/app/start/start-resume-snapshot.ts" "hydrateResumeSnapshotFromServer"
require_match "src/app/start/start-resume-snapshot-state.ts" "getStoredReadingAccessKey"

# Grand Oracle Chat Trust Hardening (2026-04-17)
require_match "src/lib/oracle-chat.ts" "getOptionalSajuSummary(latestReadingContext)"
require_match "src/app/api/oracle-chat/message/route.ts" "### 🔮 수석 오라클의 최종 결론"
require_match "src/components/payment/SubscriptionModal.tsx" "DAILY_PAYWALL_COPY"

# Relationship Contact Timing Wedge (2026-05-24)
require_match "src/app/relationship/contact-timing/page.tsx" "utm_source"
require_match "src/app/start/start-result-relationship.ts" "relationship_contact_followup_seeded"
require_match "src/app/start/start-result-relationship.ts" "en_relationship_contact_followup_seeded"
require_match "src/lib/growth-metrics.ts" "english_contact_prompt_clicked"
require_match "src/lib/growth-metrics.ts" "relationship_followup_opt_in"
require_match "src/app/api/payment/route.ts" "source: checkoutSource"
require_match "src/app/payment/success/page.tsx" "source: resolvedSource"
require_match "docs/api-spec.md" "relationship_contact_followup_seeded"
require_match "docs/revenue/relationship-contact-timing-threads-batch-2026-05-24.json" "utm_campaign=relationship_contact_timing_v1"

require_match "src/app/start/start-page-helpers.ts" "next_move_report_mvp_v1"
require_match "src/app/start/start-page-helpers.ts" "relationship_contact_timing_v1"
require_match "src/app/start/start-page-helpers.ts" "en_relationship_contact_timing_v1"
require_match "src/lib/payment/payment-config.ts" "Detailed Decision Note"
require_match "src/lib/payment/payment-config.ts" "prod_ThdoB65NmPU37y"
require_match "docs/api-spec.md" 'Next Move Report MVP Contract (2026-06-03)'
require_match "docs/api-spec.md" '$9.00'

require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "300 targeted visits"
require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "45 question starts"
require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "30 free verdicts"
require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "8 paywall opens"
require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "2 paid conversions"
require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "8 follow-up seeds"
require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "BLOCK LAUNCH"
require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "Weeks 9-12"
require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "Out of scope"

require_match "docs/revenue/oracle-shaped-decision-timing-evidence-2026-06-04.md" "2026-04-16"
require_match "docs/revenue/oracle-shaped-decision-timing-evidence-2026-06-04.md" "2026-06-01"
require_match "docs/revenue/oracle-shaped-decision-timing-evidence-2026-06-04.md" "145/200"
require_match "docs/revenue/oracle-shaped-decision-timing-evidence-2026-06-04.md" "decision_timing_rebuild_v1"
require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "decision_timing_rebuild_v1"
require_match "docs/revenue/next-move-report-mvp-operating-loop.md" "campaign wedge"

require_match "src/lib/ai/decision-action-contract.ts" "DecisionActionVerdict"
require_match "src/lib/ai/decision-action-contract.ts" "DecisionQuestionJob"
require_match "src/lib/ai/decision-action-contract.ts" "choose_or_time_action"
require_match "src/lib/ai/decision-action-contract.ts" "wants_timing_prediction"
require_match "src/lib/ai/decision-action-contract.ts" "wants_outcome_prediction"
require_match "src/lib/ai/decision-action-contract.ts" "needs_next_action"
require_match "src/lib/ai/decision-action-contract.ts" "broad_reading"
require_match "src/lib/ai/decision-action-contract.ts" "move_now"
require_match "src/lib/ai/decision-action-contract.ts" "wait_with_deadline"
require_match "src/lib/ai/decision-action-contract.ts" "narrow_first"
require_match "src/lib/ai/decision-action-contract.ts" "hold_or_stop"
require_match "src/app/api/reading/reading-runtime-service.ts" "decisionAction"
require_match "src/app/api/reading/route-helpers.ts" "decisionAction"
require_match "src/app/api/reading/route-helpers.ts" "decision_label"
require_match "src/app/api/reading/route-helpers.ts" "timing_boundary"
require_match "src/app/api/reading/route-helpers.ts" "first_action"
require_match "src/app/api/reading/route-helpers.ts" "copy_ready_message"
require_match "src/app/api/reading/route-helpers.ts" "FreeReadingCoreSchema"
require_match "src/app/api/reading/reading-generation-service.ts" "decisionAction: params.runtime.decisionAction"
require_match "src/app/api/reading/reading-generation-service.ts" "partial_json_recovery_outline"
require_match "src/lib/ai/prompt-shared-rules.ts" '"decision_label"'
require_match "src/lib/ai/prompt-shared-rules.ts" '"timing_boundary"'
require_match "src/lib/ai/prompt-shared-rules.ts" '"copy_ready_message"'
require_match "src/app/payment/success/page.tsx" "isDecisionTimingPayment"
require_match "src/app/payment/success/payment-success-routing.ts" "decision_timing_rebuild_v1"
require_match "src/lib/growth-metrics.ts" "decision-timing-home"
require_match "src/lib/growth-metrics.ts" "decisionTimingFunnel"
require_match "src/lib/growth-metrics.ts" "Decision Timing 14-day decision gate"
require_match "src/components/ops/GrowthDashboard.tsx" "canonical source는 decision_timing_rebuild_v1"

require_match "src/lib/promo-codes.ts" "이미 이 프로모션 코드를 사용하셨습니다."
require_absence "src/lib/promo-codes.ts" "alreadyRedeemed: true"

require_match "src/lib/ai/prompts/system-core.ts" "Decision Timing Oracle"
require_match "src/lib/ai/prompts/system-core.ts" "prediction-style"
require_match "src/lib/ai/prompts/system-core.ts" "move_now"
require_match "src/lib/ai/prompts/system-core.ts" "wait_with_deadline"
require_match "src/lib/ai/prompt-shared-rules.ts" "결정 타이밍 오라클"

require_match "src/lib/ai/premium-reading-service.ts" "const MAX_ATTEMPTS_PER_MODEL = 3"
require_match "src/lib/ai/premium-reading-service.ts" "isMaxTokensFinish"
require_absence "src/lib/ai/premium-reading-service.ts" "FALLBACK_MODEL_NAME"
require_absence "src/lib/ai/premium-reading-service.ts" "Switching to fallback model"
require_absence "src/lib/ai/premium-reading-service.ts" "failed after trying fallback model"
require_absence "src/lib/ai/llm-client.ts" "fallback:"
require_absence "src/lib/ai/llm-client.ts" "trying fallback"
require_absence "src/lib/ai/prompts/system-core.ts" "Fortune Analysis Architect"
require_absence "src/lib/ai/prompt-shared-rules.ts" "콜드리딩"
require_absence "src/lib/ai/prompt-shared-rules.ts" "10년 관찰"
require_absence "src/lib/ai/prompt-shared-rules.ts" "확정 판단"
require_absence "src/lib/ai/phase-prompts.ts" "확정 판단"
require_absence "src/lib/ai/prompt-builder.ts" "3/15-22"
require_absence "src/lib/ai/prompt-builder.ts" "March 15 - April 20"

require_match "scripts/verify-engine-accuracy.ts" "engine_accuracy_audit_script_contract"
require_match "scripts/verify-engine-accuracy.ts" "saju_2026_mangjong"
require_match "scripts/verify-engine-accuracy.ts" "astro_2026_march_equinox"
require_match "scripts/verify-engine-accuracy.ts" "Engine accuracy verification passed"
require_match "scripts/verify-engine-accuracy.ts" "scenario=happy"
require_match "tsconfig.engine-verify.json" "scripts/verify-engine-accuracy.ts"
require_match "scripts/verify-engine-accuracy.ts" "engine_accuracy_audit_edge_contract"
require_match "scripts/verify-engine-accuracy.ts" "invalid_scenario_rejected"
require_match "scripts/verify-engine-accuracy.ts" "saju_invalid_date_rejected"
require_match "scripts/verify-engine-accuracy.ts" "saju_hour_boundary"
require_match "scripts/verify-engine-accuracy.ts" "astro_timezone_boundary"
require_match "scripts/verify-engine-accuracy.ts" "astro_aspect_sanity"
require_match "scripts/verify-engine-accuracy.ts" "scenario=edge"
require_match "scripts/verify-engine-accuracy.ts" "engine_accuracy_audit_integration_contract"
require_match "scripts/verify-engine-accuracy.ts" "reading_metadata_saju_astrology_contract"
require_match "scripts/verify-engine-accuracy.ts" "dayMaster"
require_match "scripts/verify-engine-accuracy.ts" "sunSign"
require_match "scripts/verify-engine-accuracy.ts" "moonSign"
require_match "scripts/verify-engine-accuracy.ts" "ascendant"
require_match "scripts/verify-engine-accuracy.ts" "scenario=integration"
require_match "scripts/verify-engine-accuracy.ts" "engine_source_kim_fixture_contract"
require_match "scripts/verify-engine-accuracy.ts" "engine_source_consistency_contract"
require_match "scripts/verify-engine-accuracy.ts" "engine_source_unknown_time_contract"
require_match "scripts/verify-engine-accuracy.ts" "kim_young_gwang_19930802"
require_match "scripts/verify-engine-accuracy.ts" "canonical_astrology_source_of_truth"
require_match "scripts/verify-engine-accuracy.ts" "oracle_council_natal_summary_consistent"
require_match "scripts/verify-engine-accuracy.ts" "unknown_time_ascendant_approximate"
require_match "scripts/verify-engine-accuracy.ts" "scenario=kim_fixture"
require_match "scripts/verify-engine-accuracy.ts" "scenario=source_consistency"
require_match "scripts/verify-engine-accuracy.ts" "scenario=unknown_time"

echo "Refactor regression checks passed"
