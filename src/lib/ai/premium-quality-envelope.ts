import type { PremiumReportPartial, UserData } from './phase-prompts';

type EvidenceFamily =
    | 'calculation'
    | 'myeongli_doctrine'
    | 'astrology_doctrine'
    | 'tarot_rws'
    | 'safety_boundary'
    | 'provider_recovery'
    | 'product_synthesis';

type ReportMode = 'full_premium' | 'degraded_premium' | 'fallback_static';

type EvidenceBlock = {
    readonly id: string;
    readonly sectionId: string;
    readonly family: EvidenceFamily;
    readonly sourceClaimId: string;
    readonly userImplication: string;
    readonly actionOrBoundary: string;
};

type SectionSnapshot = {
    readonly sectionId: string;
    readonly title: string;
    readonly content: string;
    readonly evidenceBlockIds: readonly string[];
};

type ProviderRecovery = {
    readonly attempted: boolean;
    readonly visibleToCustomer: boolean;
    readonly reason: string;
};

type EnvelopeOptions = {
    readonly reportMode?: ReportMode;
    readonly providerRecovery?: ProviderRecovery;
};

const DEFAULT_RECOVERY: ProviderRecovery = {
    attempted: false,
    visibleToCustomer: true,
    reason: 'primary_provider_completed',
};

export function attachPremiumQualityEnvelope(
    report: PremiumReportPartial,
    userData: UserData,
    options: EnvelopeOptions = {},
): PremiumReportPartial {
    const providerRecovery = options.providerRecovery ?? DEFAULT_RECOVERY;
    const reportMode = options.reportMode ?? (providerRecovery.attempted ? 'degraded_premium' : 'full_premium');
    const provenanceContent = buildProvenanceContent(providerRecovery, userData);
    const evidenceBlocks = buildEvidenceBlocks();
    const sections = buildSections(report, userData, provenanceContent);

    return {
        ...report,
        reportMode,
        providerRecovery,
        provenance_appendix: {
            title: 'Source roles and generation state',
            content: provenanceContent,
        },
        sections,
        evidenceBlocks,
    };
}

function buildSections(
    report: PremiumReportPartial,
    userData: UserData,
    provenanceContent: string,
): readonly SectionSnapshot[] {
    return [
        section('summary', 'Verdict snapshot', [
            fieldText(report.summary, 'content'),
            fieldText(report.summary, 'trust_reason'),
            `Birth context ${userData.birthDate} ${userData.birthTime} and current question "${userData.question}" are treated as calculation input, not destiny. The first boundary is document, question, and cost comparison before any regulated choice is fixed.`,
        ], ['calc.birth-context', 'safety.summary-boundary']),
        section('method_and_source_roles', 'Method and source roles', [
            'Saju is used as structure, astrology as timing, and Tarot as the immediate question signal. KASI/JPL-style calculation facts are calculation-only and not personality doctrine. Myeongli claims explain symbolic structure, while product synthesis converts the three layers into a bounded decision rule.',
            'Waite/Tetrabiblos reviewed text candidates are doctrine context, no raw source text is copied, and Tarot image rights stay separate from card meaning.',
        ], ['calc.source-role', 'myeongli.role', 'synthesis.role']),
        section('saju_doctrine', 'Saju doctrine deep reading', [
            collectReportText(report.saju_sections),
            `The Myeongli layer uses the supplied Day Master and pillars as evidence for decision structure. For ${userData.name ?? 'the user'}, the result must become one review rule: compare documents, cost, timing pressure, and qualified questions before scaling action. This prevents a chart label from becoming a guaranteed outcome claim. The doctrine role is to explain recurring structure, pressure, support, and constraint, then translate that structure into a measured review window. When the user question touches regulated life choices, the Saju layer should narrow the comparison criteria rather than decide the outcome for the user.`,
        ], ['calc.day-master', 'myeongli.structure', 'safety.no-fate', 'myeongli.action']),
        section('astrology_doctrine', 'Astrology timing layer', [
            collectReportText(report.astro_deep),
            'The astrology layer explains timing pressure through Sun, Moon, ascendant, transit, and aspect data when supplied. It supports review windows and uncertainty levels, not a stand-alone command. If any timing data is thin, the report keeps the action size smaller and names the boundary.',
        ], ['astro.moon', 'astro.ascendant', 'calc.unknown-time']),
        section('tarot_spread', 'Tarot spread signal', [
            collectReportText(report.tarot_details),
            'The Tarot layer is a spread signal around the question. Card names, position, and orientation are used to describe risk posture and immediate friction. RWS meaning candidates guide interpretation, while source boundaries prevent image provenance or dramatic symbolism from becoming a factual guarantee.',
        ], ['tarot.rws.spread', 'safety.tarot-boundary', 'tarot.image-fallback']),
        section('action_plan', 'Action plan', [
            collectReportText(report.action_plan),
            'Every action remains a bounded review task: write questions, compare documents, estimate costs, check dates, and define the review threshold. The plan measures evidence before committing to a larger life move.',
        ], ['calc.review-date', 'safety.action-boundary']),
        section('provenance_appendix', 'Provenance appendix', [
            provenanceContent,
        ], ['provider.primary-state', 'synthesis.boundary']),
        section('final_verdict', 'Final verdict', [
            collectReportText(report.final_verdict),
            'The final verdict repeats only supported signals: Saju structure, astrology timing, Tarot immediate signal, and a safety boundary for regulated decisions. The convergence diagnosis explains alignment or uncertainty, then keeps the next move measurable.',
        ], ['calc.final', 'myeongli.final', 'safety.final', 'synthesis.final']),
    ];
}

function buildEvidenceBlocks(): readonly EvidenceBlock[] {
    return [
        block('calc.birth-context', 'summary', 'calculation'),
        block('safety.summary-boundary', 'summary', 'safety_boundary'),
        block('calc.source-role', 'method_and_source_roles', 'calculation'),
        block('myeongli.role', 'method_and_source_roles', 'myeongli_doctrine'),
        block('synthesis.role', 'method_and_source_roles', 'product_synthesis'),
        block('calc.day-master', 'saju_doctrine', 'calculation'),
        block('myeongli.structure', 'saju_doctrine', 'myeongli_doctrine'),
        block('safety.no-fate', 'saju_doctrine', 'safety_boundary'),
        block('myeongli.action', 'saju_doctrine', 'myeongli_doctrine'),
        block('astro.moon', 'astrology_doctrine', 'astrology_doctrine'),
        block('astro.ascendant', 'astrology_doctrine', 'astrology_doctrine'),
        block('calc.unknown-time', 'astrology_doctrine', 'calculation'),
        block('tarot.rws.spread', 'tarot_spread', 'tarot_rws'),
        block('safety.tarot-boundary', 'tarot_spread', 'safety_boundary'),
        block('tarot.image-fallback', 'tarot_spread', 'tarot_rws'),
        block('calc.review-date', 'action_plan', 'calculation'),
        block('safety.action-boundary', 'action_plan', 'safety_boundary'),
        block('provider.primary-state', 'provenance_appendix', 'provider_recovery'),
        block('synthesis.boundary', 'provenance_appendix', 'product_synthesis'),
        block('calc.final', 'final_verdict', 'calculation'),
        block('myeongli.final', 'final_verdict', 'myeongli_doctrine'),
        block('safety.final', 'final_verdict', 'safety_boundary'),
        block('synthesis.final', 'final_verdict', 'product_synthesis'),
    ];
}

function buildProvenanceContent(providerRecovery: ProviderRecovery, userData: UserData): string {
    const recoveryState = providerRecovery.attempted
        ? `provider recovery was used and is customer-visible with reason ${providerRecovery.reason}`
        : `primary provider completed the report with reason ${providerRecovery.reason}`;
    return [
        `${recoveryState}.`,
        `Input context: ${userData.birthDate} ${userData.birthTime}, context ${userData.context}, question "${userData.question}".`,
        'Calculation records are used only for chart facts. Myeongli, astrology, and Tarot doctrine claims remain separate from calculation sources.',
        'KASI/JPL 계산 검증 전용 (calculation-only); 계산 원천은 해석 권위가 아님 (not doctrine/personality authority); Waite/Tetrabiblos 검토된 텍스트 후보 (reviewed text candidates); 원문 복사 금지 (no raw source text copying); 타로 이미지 권리와 의미 근거 분리 (tarot image rights separate from meaning).',
        'Product synthesis names the decision boundary, risk buffer, and review threshold so the paid report stays useful without pretending to be legal, medical, immigration, tax, or financial advice.',
    ].join(' ');
}

function section(sectionId: string, title: string, parts: readonly string[], evidenceBlockIds: readonly string[]): SectionSnapshot {
    return { sectionId, title, content: parts.filter(Boolean).join(' '), evidenceBlockIds };
}

function block(id: string, sectionId: string, family: EvidenceFamily): EvidenceBlock {
    return {
        id,
        sectionId,
        family,
        sourceClaimId: `source.${id}`,
        userImplication: `This evidence shapes the ${sectionId} decision boundary for the user.`,
        actionOrBoundary: `Use ${sectionId} as a measured action, comparison, or review threshold.`,
    };
}

function collectReportText(value: unknown): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(collectReportText).filter(Boolean).join(' ');
    if (!isRecord(value)) return '';
    return Object.values(value).map(collectReportText).filter(Boolean).join(' ');
}

function fieldText(value: unknown, key: string): string {
    if (!isRecord(value)) return '';
    const field = value[key];
    return typeof field === 'string' ? field : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
