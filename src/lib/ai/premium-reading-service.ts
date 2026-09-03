/**
 * Premium Reading Service
 * Orchestrates 8-phase multi-turn API calls for rich content generation
 * Phase 1 is split into 1A (summary/traits/core), 1B (astro), and 1C (tarot/numerology)
 * Phase 5 is split into 5A (action) and 5B (conclusion) for stability
 */

import {
    buildPhase1Prompt,
    buildPhase1BPrompt,
    buildPhase1CPrompt,
    buildPhase2Prompt,
    buildPhase3Prompt,
    buildPhase4Prompt,
    buildPhase5APrompt,
    buildPhase5BPrompt,
    PHASE_LABELS,
    type UserData,
    type PremiumReportPartial
} from './phase-prompts';
import { buildGoogleResponseJsonSchema } from './google-json-schema';
import { assertPremiumGrounding } from './premium-grounding';
import { attachPremiumQualityEnvelope } from './premium-quality-envelope';
import { getPremiumPhaseSchema, parsePremiumPhaseResult } from './premium-report-schemas';
import {
    PREMIUM_PHASE_MAX_ATTEMPTS,
    PREMIUM_PHASE_REQUEST_TIMEOUT_MS,
} from './structured-request-budget';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const PRIMARY_MODEL_NAME = 'gemini-3.5-flash';
const SECONDARY_MODEL_NAME = 'gemini-2.5-flash';
const FAST_PHASE_REQUEST_TIMEOUT_MS = 18000;
const PHASE_OUTPUT_TOKEN_BUDGETS: Record<number, { initial: number; retry: number; final: number }> = {
    1: { initial: 8192, retry: 12288, final: 16384 },   // Summary + traits + core analysis
    2: { initial: 6144, retry: 8192, final: 12288 },    // Astro deep
    3: { initial: 6144, retry: 8192, final: 12288 },    // Tarot details + numerology
    4: { initial: 12288, retry: 16384, final: 20480 },  // Saju sections
    5: { initial: 12288, retry: 16384, final: 20480 },  // Fortune flow
    6: { initial: 12288, retry: 16384, final: 20480 },  // Life areas + soulmate + compatibility
    7: { initial: 8192, retry: 12288, final: 16384 },   // Special analysis + action plan + date selection
    8: { initial: 12288, retry: 16384, final: 20480 },  // Past life + glossary + final verdict
};

function extractGoogleTextParts(parts: unknown): string {
    if (!Array.isArray(parts)) return '';

    return parts
        .map((part) => (
            part &&
            typeof part === 'object' &&
            typeof (part as { text?: unknown }).text === 'string'
        )
            ? (part as { text: string }).text
            : ''
        )
        .join('');
}

function getPhaseRequestTimeoutMs(phaseNumber: number) {
    if (phaseNumber === 1) {
        return PREMIUM_PHASE_REQUEST_TIMEOUT_MS;
    }

    if (phaseNumber === 5) {
        return PREMIUM_PHASE_REQUEST_TIMEOUT_MS;
    }

    if (phaseNumber === 8) {
        return PREMIUM_PHASE_REQUEST_TIMEOUT_MS;
    }

    if (phaseNumber >= 2) {
        return PREMIUM_PHASE_REQUEST_TIMEOUT_MS;
    }

    return FAST_PHASE_REQUEST_TIMEOUT_MS;
}

function getPhaseMaxOutputTokens(phaseNumber: number, attempt: number) {
    const budget = PHASE_OUTPUT_TOKEN_BUDGETS[phaseNumber];
    if (!budget) {
        return attempt > 1 ? 12288 : 8192;
    }

    if (attempt === 0) return budget.initial;
    if (attempt === 1) return budget.retry;
    return budget.final;
}

function getPhaseTemperature(phaseNumber: number) {
    if (phaseNumber === 5) {
        return 0.5;
    }

    if (phaseNumber === 8) {
        return 0.35;
    }

    if (phaseNumber >= 6) {
        return 0.6;
    }

    return 0.72;
}

function getPhaseThinkingConfig(modelName: string = PRIMARY_MODEL_NAME) {
    if (!modelName.startsWith('gemini-3')) {
        return undefined;
    }
    return {
        thinkingLevel: 'minimal',
    };
}

function isMaxTokensFinish(finishReason: string | null): boolean {
    return finishReason === 'MAX_TOKENS';
}

const NON_PROSE_QUALITY_KEYS = new Set(['keywords']);

function collectReportStrings(value: unknown, parentKey?: string): string[] {
    if (typeof value === 'string') {
        if (parentKey && NON_PROSE_QUALITY_KEYS.has(parentKey)) return [];
        return [value.trim()].filter(Boolean);
    }
    if (Array.isArray(value)) return value.flatMap((item) => collectReportStrings(item, parentKey));
    if (!value || typeof value !== 'object') return [];
    return Object.entries(value).flatMap(([key, item]) => collectReportStrings(item, key));
}

const GENERIC_REPORT_PATTERNS = [
    /trust your intuition/i,
    /everything happens for a reason/i,
    /stay positive/i,
    /focus on yourself/i,
    /the universe (?:will|is going to) guide/i,
    /자신(?:을|의 직감)을 믿으세요/,
    /우주의 흐름/,
    /긍정적인 마음/,
    /조화와 균형/,
    /새로운 시작(?:이|을|의)?\s*(?:열리|맞이|기대|믿|준비되|다가옵니다|찾아옵니다)/,
    /좋은 흐름/,
] as const;

const PHASE_MINIMUM_TEXT_LENGTH: Record<number, number> = {
    1: 900,
    2: 750,
    3: 750,
    4: 2200,
    5: 1400,
    6: 2600,
    7: 1300,
    8: 2200,
};

const EVIDENCE_MARKER_PATTERN =
    /근거|사주|일간|월지|대운|세운|오행|태양|달|상승궁|타로|카드|Saju|Four Pillars|Day Master|Soul Element|Elemental Blueprint|Sun|Moon|Rising|Ascendant|Tarot|Card|transit/i;

const DENSITY_MARKER_PATTERN =
    /판정|근거|함의|행동|지침|타이밍|경계|재검토|리스크|위험|기준|비교|측정|점검|결정|실행|보류|회신률|Claim|Evidence|implication|action|risk|timing|boundary|review|measure|compare|decision|specific|next move/i;

const PHASE_SIX_PROMPT_SAFETY_REPLACEMENTS = [
    [/의료\s*진단/g, '임상 판단'],
    [/투약\s*변경/g, '전문가 복약 조정'],
    [/투약/g, '전문가 복약 조정'],
    [/약물/g, '복약 관련 항목'],
    [/처방/g, '전문가 지시'],
    [/수술/g, '시술 일정'],
    [/치료\s*중단/g, '돌봄 중단'],
    [/치료\s*중지/g, '돌봄 중지'],
    [/특정\s*주식/g, '개별 금융상품'],
    [/주식\s*(?:매수|매도|추천)/g, '개별 금융상품 거래 지시'],
    [/코인/g, '고위험 디지털 자산'],
    [/암호화폐/g, '고위험 디지털 자산'],
    [/레버리지/g, '차입형 고위험 전략'],
    [/풀매수/g, '집중 매수'],
    [/몰빵/g, '집중 베팅'],
    [/포지션\s*규모/g, '거래 규모'],
    [/포트폴리오\s*배분/g, '자산 비중 산정'],
    [/medical\s+diagnosis/gi, 'clinical judgment'],
    [/medication\s+changes/gi, 'drug-management changes'],
    [/medication/gi, 'drug-management item'],
    [/schedule\s+surgery/gi, 'operation scheduling'],
    [/surgery/gi, 'operation scheduling'],
    [/stop\s+(?:your\s+)?(?:medicine|treatment)/gi, 'care interruption'],
    [/quit\s+(?:your\s+)?(?:medicine|treatment)/gi, 'care interruption'],
    [/specific\s+stocks?/gi, 'named market instruments'],
    [/buy\s+(?:bitcoin|ethereum|crypto|cryptocurrency|stock|stocks?|coin|coins?)/gi, 'named market buy instruction'],
    [/sell\s+(?:bitcoin|ethereum|crypto|cryptocurrency|stock|stocks?|coin|coins?)/gi, 'named market sell instruction'],
    [/bitcoin|ethereum|crypto(?:currency)?/gi, 'speculative digital asset'],
    [/leverage/gi, 'borrowed-risk tactic'],
    [/go\s+all\s+in|all-?in/gi, 'concentration-bet tactic'],
    [/portfolio\s+allocation/gi, 'asset mix'],
    [/position\s+size/gi, 'exposure sizing'],
    [/recover\s+investments?/gi, 'loss-recovery claim'],
] as const;

function assertPremiumPhaseQuality(phaseNumber: number, data: PremiumReportPartial) {
    const strings = collectReportStrings(data);
    const joined = strings.join('\n');
    const totalTextLength = strings.reduce((sum, value) => sum + value.length, 0);
    const minimumLength = getPhaseMinimumTextLength(phaseNumber);

    if (totalTextLength < minimumLength) {
        throw new Error(
            `Phase ${phaseNumber} quality check failed: response is too thin (${totalTextLength}/${minimumLength} chars)`
        );
    }

    const genericPattern = GENERIC_REPORT_PATTERNS.find((pattern) => pattern.test(joined));
    if (genericPattern) {
        throw new Error(
            `Phase ${phaseNumber} quality check failed: generic wording detected (${genericPattern.source})`
        );
    }

    if (!EVIDENCE_MARKER_PATTERN.test(joined)) {
        throw new Error(
            `Phase ${phaseNumber} quality check failed: no source evidence marker found`
        );
    }

    const evidenceMarkerCount = countPatternMatches(joined, EVIDENCE_MARKER_PATTERN);
    const densityMarkerCount = countPatternMatches(joined, DENSITY_MARKER_PATTERN);
    if (evidenceMarkerCount < 2 || densityMarkerCount < 4) {
        throw new Error(
            `Phase ${phaseNumber} quality check failed: insufficient evidence-action density (${evidenceMarkerCount} evidence markers, ${densityMarkerCount} density markers)`
        );
    }
}

function getPhaseMinimumTextLength(phaseNumber: number): number {
    return PHASE_MINIMUM_TEXT_LENGTH[phaseNumber] ?? 750;
}

function countPatternMatches(value: string, pattern: RegExp): number {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
    const globalPattern = new RegExp(pattern.source, flags);
    return [...value.matchAll(globalPattern)].length;
}

function sanitizePhaseSixPromptSafetyMarkers(prompt: string): string {
    let sanitized = prompt;
    for (const [pattern, replacement] of PHASE_SIX_PROMPT_SAFETY_REPLACEMENTS) {
        sanitized = sanitized.replace(pattern, replacement);
    }
    return sanitized;
}

function buildQualityRetryUserPrompt(userPrompt: string, lastError: Error | null, currentDate?: string): string {
    if (!lastError) return userPrompt;

    const errorMessage = lastError.message;
    const hasSafetyError = /Forbidden medical.*financial instruction marker found/i.test(errorMessage);
    const hasDateError = /past (?:month|date)|before currentDate|must be in YYYY-MM-DD format/i.test(errorMessage);
    const hasSourceBoundaryError = /missing_sourceBoundary_anchors/i.test(errorMessage);
    const currentMonth = currentDate?.slice(0, 7);
    const retryReason = hasSafetyError
        ? 'The last output crossed a regulated-advice wording boundary.'
        : hasDateError
            ? 'The last output used timing before the report date boundary or malformed a date.'
            : errorMessage;
    const safetyRetry = hasSafetyError ? `
<SAFETY_RETRY>
Rewrite regulated guidance as decision-support boundaries only. For wellness, use observation routines and professional consultation boundaries. For visa, immigration, legal, tax, and financial-risk cases, use document checks, deadline mapping, questions for qualified professionals, risk buffers, consultation triggers, and scenario comparisons. Avoid direct regulated outcome/action verbs; describe them only generically as "regulated outcome commands" when naming the boundary. Convert conditional pressure into review thresholds and scenario options instead.
Safe replacement patterns: "전문가에게 확인할 질문은 무엇인가", "문서와 마감 체크리스트를 점검한다", "A/B 시나리오의 비용과 리스크를 비교한다", "특정 선택을 확정하지 말고 상담 후 재검토한다". Do not include unsafe example phrases in the answer.
For the first summary sentence in regulated topics, use only this shape: "첫 행동은 전문가에게 물어볼 질문 목록과 문서/비용 비교표를 작성하는 것이고, 결정 경계는 전문가 검토 전 특정 선택을 확정하지 않는 재검토 기준입니다." Keep regulated outcome commands out of the first action and boundary.
For astrology/tarot/life-area section endings in regulated topics, use this safe ending shape: "따라서 이 항목의 실천은 문서/질문/비용 비교 점검이며, 전문가 검토 전 특정 선택 확정은 보류하는 재검토 기준으로 둡니다." Keep regulated outcome commands out of the ending sentence.
</SAFETY_RETRY>` : '';
    const dateRetry = hasDateError ? `
<DATE_RETRY>
Use ${currentDate ?? 'the report current date'} as the earliest boundary. For month-level windows, use ${currentMonth ? `${currentMonth} or later` : 'the current month or later'}. If supplied context contains earlier dates or months, treat them only as historical intake context and do not copy them into future guidance. When exact timing is weak, write a review window such as "기준일 이후 2-4주 검증 창" instead of a specific earlier date.
</DATE_RETRY>` : '';
    const sourceBoundaryRetry = hasSourceBoundaryError ? `
<SOURCE_BOUNDARY_RETRY>
Include at least four visible source-boundary clauses in the JSON fields, using these exact meanings: "KASI/JPL 계산 검증 전용 (calculation-only)", "계산 원천은 해석 권위가 아님 (not doctrine/personality authority)", "Waite/Tetrabiblos 검토된 텍스트 후보 (reviewed text candidates)", "원문 복사 금지 (no raw source text copying)", "타로 이미지 권리와 의미 근거 분리 (tarot image rights separate from meaning)".
</SOURCE_BOUNDARY_RETRY>` : '';

    return `${userPrompt}

<QUALITY_RETRY>
Previous attempt failed validation: ${retryReason}
Rewrite the phase as premium-grade analysis, not filler. Each important paragraph must include: (1) the source signal being used, (2) what that signal means for this user/question, and (3) a concrete implication, timing boundary, risk, or next action. The combined user-visible text must satisfy the depth and density implied by the validation error, without padding, repeated phrasing, or generic reassurance. Use supplied Saju, astrology, tarot, timing, and user-question evidence wherever relevant.
If the error mentions PREMIUM_QUALITY_GATE_FAILED, quote the missing supplied anchors exactly and name the source-role boundary before interpreting them.
</QUALITY_RETRY>${safetyRetry}${dateRetry}${sourceBoundaryRetry}`;
}



function buildFailoverBoosterDirective(phaseNumber: number): string {
    return `
<FAILOVER_QUALITY_BOOSTER>
[CRITICAL DEPTH & DENSITY REQUIREMENTS FOR PHASE ${phaseNumber}]
1. Thorough Elaboration: Do not write brief or generic summaries. Provide an exhaustive, multidimensional breakdown covering root causes, current manifestation, and future progression (at least 3-4 dense sentences per subsection).
2. Actionable Branching: Every guidance section must explicitly distinguish Option A (proactive move) vs Option B (conservative hold), comparing timing, risk tradeoffs, and specific deadlines.
3. Strict Grounding: Ground every conclusion directly in the provided Saju pillars, astrological aspects, or tarot cards. Generic platitudes, vague reassurances, and filler are strictly prohibited.
</FAILOVER_QUALITY_BOOSTER>`;
}

export interface PhaseResult {
    phase: number;
    success: boolean;
    data: PremiumReportPartial | null;
    error?: string;
    executedModel?: string;
    isFailover?: boolean;
    textLength?: number;
}

export interface ProgressCallback {
    (phase: number, label: string, icon: string): void;
}

/**
 * Generate premium report with phased API calls
 */
export async function generatePremiumReport(
    userData: UserData,
    apiKey: string,
    onProgress?: ProgressCallback
): Promise<{ success: boolean; report: PremiumReportPartial; error?: string }> {

    const results: PremiumReportPartial = {};

    try {
        // Phase 1: Summary + Traits + Core Analysis
        onProgress?.(1, PHASE_LABELS[0].label, PHASE_LABELS[0].icon);
        const phase1 = await generateSinglePhase(1, userData, null, apiKey);
        if (!phase1.success) throw new Error(`Phase 1 failed: ${phase1.error}`);
        Object.assign(results, phase1.data);

        // Phase 1B: Astro Deep
        onProgress?.(2, PHASE_LABELS[1].label, PHASE_LABELS[1].icon);
        const phase1B = await generateSinglePhase(2, userData, results, apiKey);
        if (!phase1B.success) throw new Error(`Phase 1B failed: ${phase1B.error}`);
        Object.assign(results, phase1B.data);

        // Phase 1C: Tarot + Numerology
        onProgress?.(3, PHASE_LABELS[2].label, PHASE_LABELS[2].icon);
        const phase1C = await generateSinglePhase(3, userData, results, apiKey);
        if (!phase1C.success) throw new Error(`Phase 1C failed: ${phase1C.error}`);
        Object.assign(results, phase1C.data);

        // Phase 2: Saju Basics
        onProgress?.(4, PHASE_LABELS[3].label, PHASE_LABELS[3].icon);
        const phase2 = await generateSinglePhase(4, userData, results, apiKey);
        if (!phase2.success) throw new Error(`Phase 2 failed: ${phase2.error}`);
        Object.assign(results, phase2.data);

        // Phase 3: Fortune Flow
        onProgress?.(5, PHASE_LABELS[4].label, PHASE_LABELS[4].icon);
        const phase3 = await generateSinglePhase(5, userData, results, apiKey);
        if (!phase3.success) throw new Error(`Phase 3 failed: ${phase3.error}`);
        Object.assign(results, phase3.data);

        // Phase 4: Life Areas
        onProgress?.(6, PHASE_LABELS[5].label, PHASE_LABELS[5].icon);
        const phase4 = await generateSinglePhase(6, userData, results, apiKey);
        if (!phase4.success) throw new Error(`Phase 4 failed: ${phase4.error}`);
        Object.assign(results, phase4.data);

        // Phase 5A: Special Analysis + Action Plan + Date Selection
        onProgress?.(7, PHASE_LABELS[6].label, PHASE_LABELS[6].icon);
        const phase5A = await generateSinglePhase(7, userData, results, apiKey);
        if (!phase5A.success) throw new Error(`Phase 5A failed: ${phase5A.error}`);
        Object.assign(results, phase5A.data);

        // Phase 5B (8): Past Life + Glossary + Final Verdict
        onProgress?.(8, PHASE_LABELS[7].label, PHASE_LABELS[7].icon);
        const phase5B = await generateSinglePhase(8, userData, results, apiKey);
        if (!phase5B.success) throw new Error(`Phase 5B failed: ${phase5B.error}`);
        Object.assign(results, phase5B.data);

        return {
            success: true,
            report: attachPremiumQualityEnvelope(results, userData),
        };

    } catch (error) {
        console.error('[PremiumReading] Error:', error);
        return {
            success: false,
            report: attachPremiumQualityEnvelope(results, userData, {
                reportMode: 'degraded_premium',
                providerRecovery: {
                    attempted: true,
                    visibleToCustomer: true,
                    reason: error instanceof Error ? error.message : 'unknown_premium_generation_error',
                },
            }),
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Execute a single phase
 */
export async function generateSinglePhase(
    phaseNumber: number,
    userData: UserData,
    previousData: PremiumReportPartial | null,
    apiKey: string
): Promise<PhaseResult> {
    if (!apiKey) {
        return {
            phase: phaseNumber,
            success: false,
            data: null,
            error: 'GOOGLE_AI_API_KEY is not configured',
        };
    }

    // Get the appropriate prompt builder
    let promptBuilder: (userData: UserData, prev?: PremiumReportPartial | null) => { system: string; user: string };

    switch (phaseNumber) {
        case 1:
            promptBuilder = buildPhase1Prompt;
            break;
        case 2:
            promptBuilder = buildPhase1BPrompt;
            break;
        case 3:
            promptBuilder = buildPhase1CPrompt;
            break;
        case 4:
            promptBuilder = buildPhase2Prompt;
            break;
        case 5:
            promptBuilder = buildPhase3Prompt;
            break;
        case 6:
            promptBuilder = buildPhase4Prompt;
            break;
        case 7:
            promptBuilder = buildPhase5APrompt;
            break;
        case 8:
            promptBuilder = buildPhase5BPrompt;
            break;
        default:
            return { phase: phaseNumber, success: false, data: null, error: 'Invalid phase' };
    }

    const prompt = promptBuilder(userData, previousData);
    const system = phaseNumber === 6
        ? sanitizePhaseSixPromptSafetyMarkers(prompt.system)
        : prompt.system;
    const user = phaseNumber === 6
        ? sanitizePhaseSixPromptSafetyMarkers(prompt.user)
        : prompt.user;
    const phaseSchema = getPremiumPhaseSchema(phaseNumber);
    const responseJsonSchema = buildGoogleResponseJsonSchema(phaseSchema);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < PREMIUM_PHASE_MAX_ATTEMPTS; attempt++) {
        const isFailover: boolean = attempt > 0 && lastError !== null && (
            lastError.message.includes('503') ||
            lastError.message.includes('429') ||
            lastError.message.includes('500') ||
            lastError.message.includes('502') ||
            lastError.message.includes('504') ||
            lastError.message.includes('timeout') ||
            lastError.message.includes('AbortError')
        );
        const currentModel: string = isFailover ? SECONDARY_MODEL_NAME : PRIMARY_MODEL_NAME;
        const requestTimeoutMs = getPhaseRequestTimeoutMs(phaseNumber);
        const maxOutputTokens = getPhaseMaxOutputTokens(phaseNumber, attempt);
        const thinkingConfig = getPhaseThinkingConfig(currentModel);
        const userPromptForAttempt: string = attempt === 0
            ? user
            : buildQualityRetryUserPrompt(user, lastError, userData.currentDate);
        const finalUserPrompt = isFailover
            ? `${userPromptForAttempt}\n${buildFailoverBoosterDirective(phaseNumber)}`
            : userPromptForAttempt;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

        try {
            const response: Response = await fetch(
                `${GEMINI_API_BASE}/${currentModel}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: system }] },
                        contents: [{
                            role: 'user',
                            parts: [{ text: finalUserPrompt }],
                        }],
                        generationConfig: {
                            temperature: getPhaseTemperature(phaseNumber),
                            maxOutputTokens,
                            responseMimeType: "application/json",
                            thinkingConfig,
                            ...(responseJsonSchema ? { responseJsonSchema } : {}),
                        },
                        // 안전 설정 추가: 민감한 주제 차단 방지
                        safetySettings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                const errorMsg: string = `API Error (${currentModel}): ${response.status} - ${errorText}`;

                if (response.status === 429) {
                    lastError = new Error(errorMsg);
                    const waitTime = Math.pow(2, attempt) * 2000;
                    console.warn(`[Phase ${phaseNumber}] Rate limited on ${currentModel}. Waiting ${waitTime / 1000}s... (Attempt ${attempt + 1}/${PREMIUM_PHASE_MAX_ATTEMPTS})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }

                if (response.status >= 500) {
                    lastError = new Error(errorMsg);
                    const waitTime = 1000 * (attempt + 1);
                    console.warn(`[Phase ${phaseNumber}] Server Error on ${currentModel} (${response.status}). Retrying with failover...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }

                throw new Error(errorMsg);
            }

            const result = await response.json();

            // Extract text from response
            const candidate = result.candidates?.[0];
            const finishReason = typeof candidate?.finishReason === 'string'
                ? candidate.finishReason
                : null;
            let text = extractGoogleTextParts(candidate?.content?.parts);

            // Log raw result for debugging (Gemini 3 compatibility check)
            if (!text) {
                const safetyRatings = candidate?.safetyRatings;
                console.warn(`[Phase ${phaseNumber}] Empty content from ${currentModel}. FinishReason: ${finishReason}`, { safetyRatings, rawResult: JSON.stringify(result) });

                lastError = new Error(`Empty content from ${currentModel}. FinishReason: ${finishReason}`);
                continue;
            }

            if (isMaxTokensFinish(finishReason)) {
                lastError = new Error(
                    `Phase ${phaseNumber} exceeded maxOutputTokens=${maxOutputTokens} on ${currentModel}`
                );
                console.warn(
                    `[Phase ${phaseNumber}] MAX_TOKENS from ${currentModel}; retrying with a larger output budget (attempt ${attempt + 1}/${PREMIUM_PHASE_MAX_ATTEMPTS}).`
                );
                continue;
            }

            if (finishReason && finishReason !== 'STOP') {
                console.warn(
                    `[Phase ${phaseNumber}] Non-STOP finish from ${currentModel}: ${finishReason} (maxOutputTokens=${maxOutputTokens}, attempt=${attempt + 1}/${PREMIUM_PHASE_MAX_ATTEMPTS})`
                );
            }

            // Clean up markdown code blocks if present
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            // Parse JSON
            let data: PremiumReportPartial;
            try {
                const parsed = JSON.parse(text);
                data = parsePremiumPhaseResult(phaseNumber, parsed, { currentDate: userData.currentDate });
                assertPremiumPhaseQuality(phaseNumber, data);
                assertPremiumGrounding(phaseNumber, data, userData);
            } catch (e) {
                const validationMessage = e instanceof Error ? e.message : String(e);
                console.error(`[Phase ${phaseNumber}] Schema or quality validation error from ${currentModel}. Raw text:`, text.substring(0, 200) + '...');
                lastError = new Error(
                    `Phase ${phaseNumber} schema validation failed${finishReason ? ` (finishReason: ${finishReason})` : ''}: ${validationMessage}`
                );
                continue;
            }

            console.log(`[Phase ${phaseNumber}] Success with ${currentModel}:`, Object.keys(data));
            return {
                phase: phaseNumber,
                success: true,
                data,
                executedModel: currentModel,
                isFailover,
                textLength: text.length,
            };

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                lastError = new Error(`Phase ${phaseNumber} timed out after ${requestTimeoutMs}ms on ${currentModel}`);
                console.error(`[Phase ${phaseNumber}] Timeout:`, lastError.message);
                continue;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[Phase ${phaseNumber}] Attempt ${attempt + 1} Error on ${currentModel}:`, errorMessage);
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < PREMIUM_PHASE_MAX_ATTEMPTS - 1) {
                const waitTime = 1500 * (attempt + 1);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        } finally {
            clearTimeout(timeoutId);
        }
    }

    return {
        phase: phaseNumber,
        success: false,
        data: null,
        error: lastError?.message || `Phase ${phaseNumber} failed on ${PRIMARY_MODEL_NAME}`,
    };
}

/**
 * Stream-based progress updates (for SSE)
 */
export function createProgressStream() {
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController;

    const stream = new ReadableStream({
        start(c) {
            controller = c;
        }
    });

    const push = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    const close = () => {
        controller.close();
    };

    return { stream, push, close };
}
