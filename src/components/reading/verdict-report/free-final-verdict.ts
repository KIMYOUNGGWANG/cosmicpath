import { buildFallbackConvergenceDiagnosis } from '@/lib/ai/three-layer-synthesis';
import type { PremiumReportData } from '../premium-report';
import type { VerdictReportLanguage } from './types';

type ResolveReportFinalVerdictInput = {
    readonly report: PremiumReportData;
    readonly language: VerdictReportLanguage;
    readonly isFreeView?: boolean;
};

export function resolveReportFinalVerdict({
    report,
    language,
    isFreeView,
}: ResolveReportFinalVerdictInput): PremiumReportData['final_verdict'] | undefined {
    if (!isFreeView || !report.free_focus) {
        return report.final_verdict;
    }

    return {
        title: '',
        core_message: report.free_focus.action_conclusion,
        saju_foundation: '',
        astro_support: '',
        tarot_insight: '',
        action_priorities: [],
        closing_words: report.free_focus.evidence_summary,
        convergence_diagnosis: buildFallbackConvergenceDiagnosis({
            language,
            advisorEvidenceSummary: report.free_focus.evidence_summary,
            convergenceScore: (report.summary?.trust_score ?? 3) * 20,
        }),
    };
}
