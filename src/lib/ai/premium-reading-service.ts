/**
 * Premium Reading Service
 * Orchestrates 5-phase multi-turn API calls for rich content generation
 */

import {
    buildPhase1Prompt,
    buildPhase2Prompt,
    buildPhase3Prompt,
    buildPhase4Prompt,
    buildPhase5Prompt,
    PHASE_LABELS,
    type UserData,
    type PremiumReportPartial
} from './phase-prompts';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL_NAME = 'gemini-3-flash-preview'; // Correct model name found in llm-client.ts



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
 * Generate premium report with 5 phased API calls
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

        // Phase 2: Saju Basics
        onProgress?.(2, PHASE_LABELS[1].label, PHASE_LABELS[1].icon);
        const phase2 = await generateSinglePhase(2, userData, results, apiKey);
        if (!phase2.success) throw new Error(`Phase 2 failed: ${phase2.error}`);
        Object.assign(results, phase2.data);

        // Phase 3: Fortune Flow
        onProgress?.(3, PHASE_LABELS[2].label, PHASE_LABELS[2].icon);
        const phase3 = await generateSinglePhase(3, userData, results, apiKey);
        if (!phase3.success) throw new Error(`Phase 3 failed: ${phase3.error}`);
        Object.assign(results, phase3.data);

        // Phase 4: Life Areas
        onProgress?.(4, PHASE_LABELS[3].label, PHASE_LABELS[3].icon);
        const phase4 = await generateSinglePhase(4, userData, results, apiKey);
        if (!phase4.success) throw new Error(`Phase 4 failed: ${phase4.error}`);
        Object.assign(results, phase4.data);

        // Phase 5: Special Analysis + Action Plan
        onProgress?.(5, PHASE_LABELS[4].label, PHASE_LABELS[4].icon);
        const phase5 = await generateSinglePhase(5, userData, results, apiKey);
        if (!phase5.success) throw new Error(`Phase 5 failed: ${phase5.error}`);
        Object.assign(results, phase5.data);

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

    // Get the appropriate prompt builder
    let promptBuilder: (userData: UserData, prev?: PremiumReportPartial | null) => { system: string; user: string };

    switch (phaseNumber) {
        case 1:
            promptBuilder = buildPhase1Prompt;
            break;
        case 2:
            promptBuilder = buildPhase2Prompt;
            break;
        case 3:
            promptBuilder = buildPhase3Prompt;
            break;
        case 4:
            promptBuilder = buildPhase4Prompt;
            break;
        case 5:
            promptBuilder = buildPhase5Prompt;
            break;
        default:
            return { phase: phaseNumber, success: false, data: null, error: 'Invalid phase' };
    }

    const { system, user } = promptBuilder(userData, previousData);

    // Retry logic
    let retries = 0;
    const maxRetries = 5; // 3회 -> 5회로 증가
    let lastError: Error | null = null;

    while (retries <= maxRetries) {
        try {
            const response = await fetch(
                `${GEMINI_API_BASE}/${MODEL_NAME}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: system }] },
                        contents: [{
                            role: 'user',
                            parts: [{ text: user }],
                        }],
                        generationConfig: {
                            temperature: 0.8,
                            maxOutputTokens: 8192,
                            responseMimeType: "application/json",
                        },
                        // 안전 설정 추가: 민감한 주제 차단 방지
                        safetySettings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                const errorMsg = `API Error: ${response.status} - ${errorText}`;

                // 429 Rate Limit - Wait and Retry
                if (response.status === 429) {
                    lastError = new Error(errorMsg); // 429 에러도 기록
                    const waitTime = Math.pow(2, retries) * 4000;
                    console.warn(`[Phase ${phaseNumber}] Rate limited (429). Waiting ${waitTime / 1000}s... (Attempt ${retries + 1}/${maxRetries + 1})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    retries++;
                    continue;
                }

                // 503이나 500 에러도 재시도 대상
                if (response.status >= 500) {
                    lastError = new Error(errorMsg);
                    console.warn(`[Phase ${phaseNumber}] Server Error (${response.status}). Retrying...`);
                    const waitTime = 2000 * (retries + 1);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    retries++;
                    continue;
                }

                throw new Error(errorMsg);
            }

            const result = await response.json();

            // Extract text from response
            let text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                const finishReason = result.candidates?.[0]?.finishReason;
                const safetyRatings = result.candidates?.[0]?.safetyRatings;

                console.warn(`[Phase ${phaseNumber}] Empty content. Reason: ${finishReason}`, safetyRatings);
                lastError = new Error(`Empty content. FinishReason: ${finishReason}`);

                // SAFETY 차단인 경우 재시도해도 안될 가능성이 높음 -> 에러 던지고 종료? 아니면 재시도?
                // 일단 재시도.
                retries++;
                continue;
            }

            // Clean up markdown code blocks if present
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            // Parse JSON
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error(`[Phase ${phaseNumber}] JSON Parse Error. Raw text:`, text.substring(0, 200) + '...');
                lastError = new Error(`Failed to parse JSON: ${e}`);

                // JSON 파싱 에러는 재시도해볼만 함 (잘린 응답일 수 있음)
                retries++;
                continue;
            }

            console.log(`[Phase ${phaseNumber}] Success:`, Object.keys(data));
            return { phase: phaseNumber, success: true, data };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[Phase ${phaseNumber}] Attempt ${retries + 1} Error:`, errorMessage);
            lastError = error instanceof Error ? error : new Error(String(error));

            if (retries >= maxRetries) {
                break;
            }

            const waitTime = 2000 * (retries + 1);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries++;
        }
    }

    return {
        phase: phaseNumber,
        success: false,
        data: null,
        error: `Max retries exceeded (${maxRetries}). Last error: ${lastError?.message || 'Unknown error'}`
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
