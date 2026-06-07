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
import { getPremiumPhaseSchema, parsePremiumPhaseResult } from './premium-report-schemas';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const PRIMARY_MODEL_NAME = 'gemini-3.5-flash';
const FAST_PHASE_REQUEST_TIMEOUT_MS = 18000;
const PHASE_ONE_REQUEST_TIMEOUT_MS = 55000;
const DEEP_PHASE_REQUEST_TIMEOUT_MS = 55000;
const FORTUNE_FLOW_REQUEST_TIMEOUT_MS = 55000;
const PHASE_EIGHT_REQUEST_TIMEOUT_MS = 55000;   // Past life + glossary + final verdict
const MAX_ATTEMPTS_PER_MODEL = 3;
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
        return PHASE_ONE_REQUEST_TIMEOUT_MS;
    }

    if (phaseNumber === 5) {
        return FORTUNE_FLOW_REQUEST_TIMEOUT_MS;
    }

    if (phaseNumber === 8) {
        return PHASE_EIGHT_REQUEST_TIMEOUT_MS;
    }

    if (phaseNumber >= 2) {
        return DEEP_PHASE_REQUEST_TIMEOUT_MS;
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

    if (phaseNumber >= 6) {
        return 0.6;
    }

    return 0.72;
}

function getPhaseThinkingConfig() {
    return {
        thinkingLevel: 'minimal',
    };
}

function isMaxTokensFinish(finishReason: string | null): boolean {
    return finishReason === 'MAX_TOKENS';
}



export interface PhaseResult {
    phase: number;
    success: boolean;
    data: PremiumReportPartial | null;
    error?: string;
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

        return { success: true, report: results };

    } catch (error) {
        console.error('[PremiumReading] Error:', error);
        return {
            success: false,
            report: results, // Return partial results
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

    const { system, user } = promptBuilder(userData, previousData);
    const phaseSchema = getPremiumPhaseSchema(phaseNumber);
    const responseJsonSchema = buildGoogleResponseJsonSchema(phaseSchema);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt++) {
        const requestTimeoutMs = getPhaseRequestTimeoutMs(phaseNumber);
        const maxOutputTokens = getPhaseMaxOutputTokens(phaseNumber, attempt);
        const thinkingConfig = getPhaseThinkingConfig();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

        try {
            const response = await fetch(
                `${GEMINI_API_BASE}/${PRIMARY_MODEL_NAME}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: system }] },
                        contents: [{
                            role: 'user',
                            parts: [{ text: user }],
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
                const errorMsg = `API Error (${PRIMARY_MODEL_NAME}): ${response.status} - ${errorText}`;

                if (response.status === 429) {
                    lastError = new Error(errorMsg);
                    const waitTime = Math.pow(2, attempt) * 3000;
                    console.warn(`[Phase ${phaseNumber}] Rate limited on ${PRIMARY_MODEL_NAME}. Waiting ${waitTime / 1000}s... (Attempt ${attempt + 1}/${MAX_ATTEMPTS_PER_MODEL})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }

                if (response.status >= 500) {
                    lastError = new Error(errorMsg);
                    const waitTime = 1500 * (attempt + 1);
                    console.warn(`[Phase ${phaseNumber}] Server Error on ${PRIMARY_MODEL_NAME} (${response.status}). Retrying...`);
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
                console.warn(`[Phase ${phaseNumber}] Empty content from ${PRIMARY_MODEL_NAME}. FinishReason: ${finishReason}`, { safetyRatings, rawResult: JSON.stringify(result) });

                lastError = new Error(`Empty content. FinishReason: ${finishReason}`);
                continue;
            }

            if (isMaxTokensFinish(finishReason)) {
                lastError = new Error(
                    `Phase ${phaseNumber} exceeded maxOutputTokens=${maxOutputTokens} on ${PRIMARY_MODEL_NAME}`
                );
                console.warn(
                    `[Phase ${phaseNumber}] MAX_TOKENS from ${PRIMARY_MODEL_NAME}; retrying with a larger output budget (attempt ${attempt + 1}/${MAX_ATTEMPTS_PER_MODEL}).`
                );
                continue;
            }

            if (finishReason && finishReason !== 'STOP') {
                console.warn(
                    `[Phase ${phaseNumber}] Non-STOP finish from ${PRIMARY_MODEL_NAME}: ${finishReason} (maxOutputTokens=${maxOutputTokens}, attempt=${attempt + 1}/${MAX_ATTEMPTS_PER_MODEL})`
                );
            }

            // Clean up markdown code blocks if present
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            // Parse JSON
            let data: PremiumReportPartial;
            try {
                const parsed = JSON.parse(text);
                data = parsePremiumPhaseResult(phaseNumber, parsed, { currentDate: userData.currentDate });
            } catch (e) {
                const validationMessage = e instanceof Error ? e.message : String(e);
                console.error(`[Phase ${phaseNumber}] JSON Schema Validation Error from ${PRIMARY_MODEL_NAME}. Raw text:`, text.substring(0, 200) + '...');
                lastError = new Error(
                    `Phase ${phaseNumber} schema validation failed${finishReason ? ` (finishReason: ${finishReason})` : ''}: ${validationMessage}`
                );
                continue;
            }

            console.log(`[Phase ${phaseNumber}] Success with ${PRIMARY_MODEL_NAME}:`, Object.keys(data));
            return { phase: phaseNumber, success: true, data };

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                lastError = new Error(`Phase ${phaseNumber} timed out after ${requestTimeoutMs}ms on ${PRIMARY_MODEL_NAME}`);
                console.error(`[Phase ${phaseNumber}] Timeout:`, lastError.message);
                continue;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[Phase ${phaseNumber}] Attempt ${attempt + 1} Error on ${PRIMARY_MODEL_NAME}:`, errorMessage);
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < MAX_ATTEMPTS_PER_MODEL - 1) {
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
