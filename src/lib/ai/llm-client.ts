/**
 * LLM 클라이언트 (LLM Client)
 * 다중 AI 모델 지원 및 스트리밍 응답 처리 + 지수 백오프 재시도 로직 포함
 */

import { z } from 'zod';
import { safeIncrementUsageCounter } from '@/lib/usage-metrics';

// 지원 모델 타입
export type ModelProvider = 'openai' | 'anthropic' | 'google';
export type ModelTier = 'free' | 'basic' | 'premium';

// 모델 설정
export const MODEL_CONFIG: Record<ModelTier, {
    provider: ModelProvider;
    model: string;
    fallback?: { provider: ModelProvider; model: string };
}> = {
    free: {
        provider: 'google',
        model: 'gemini-3-flash-preview',
    },
    basic: {
        provider: 'google',
        model: 'gemini-3-flash-preview',
        fallback: { provider: 'google', model: 'gemini-2.0-flash' },
    },
    premium: {
        provider: 'google',
        model: 'gemini-3-flash-preview',
        fallback: { provider: 'google', model: 'gemini-1.5-pro' },
    },
};

// 응답 타입
export interface LLMResponse {
    content: string;
    model: string;
    provider: ModelProvider;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/**
 * 지수 백오프를 이용한 fetch 재시도 헬퍼
 * 503 (High Demand) 또는 429 (Rate Limit) 오류 시 재시도 수행
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = 3,
    initialDelay: number = 1500,
    timeoutMs: number = 12000
): Promise<Response> {
    let lastError: Error | null = null;

    for (let i = 0; i <= maxRetries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            // 503 (High Demand) 또는 429 (Rate Limit)인 경우에만 재시도
            if (response.status === 503 || response.status === 429) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.error?.message || response.statusText;
                throw new Error(`API error (${response.status}): ${message}`);
            }

            return response;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            const isTimeoutError = error instanceof Error && error.name === 'AbortError';

            lastError = isTimeoutError
                ? new Error(`API timeout after ${timeoutMs}ms`)
                : (error instanceof Error ? error : new Error(message));

            // 마지막 시도거나 503/429가 아닌 치명적 에러인 경우 즉시 중단
            if (i === maxRetries || (!message.includes('503') && !message.includes('429'))) {
                break;
            }

            const delay = initialDelay * Math.pow(2, i);
            console.warn(`[AI Client Retry] Attempt ${i + 1} failed (Status: ${message}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        } finally {
            clearTimeout(timeoutId);
        }
    }

    throw lastError || new Error('All retry attempts failed');
}

/**
 * OpenAI API 호출
 */
async function callOpenAI(
    systemPrompt: string,
    userPrompt: string,
    model: string,
    stream: boolean = false
): Promise<Response> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

    return fetchWithRetry('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            stream,
            temperature: 0.7,
            max_tokens: 2000,
        }),
    });
}

/**
 * Anthropic API 호출
 */
async function callAnthropic(
    systemPrompt: string,
    userPrompt: string,
    model: string,
    stream: boolean = false
): Promise<Response> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

    return fetchWithRetry('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model,
            system: systemPrompt,
            messages: [
                { role: 'user', content: userPrompt },
            ],
            stream,
            max_tokens: 2000,
            temperature: 0.7,
        }),
    });
}

/**
 * Google AI (Gemini) API 호출
 */
async function callGoogle(
    systemPrompt: string,
    userPrompt: string,
    model: string,
    stream: boolean = false
): Promise<Response> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_AI_API_KEY is not configured');

    const endpoint = stream
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    return fetchWithRetry(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: systemPrompt }],
            },
            contents: [
                {
                    role: 'user',
                    parts: [{ text: userPrompt }],
                },
            ],
            generationConfig: {
                temperature: 0.75, // 0.85 -> 0.75 for reduced hallucination in chat
                maxOutputTokens: 4000,
            },
        }),
    });
}

/**
 * 비스트리밍 LLM 호출
 */
export async function generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    tier: ModelTier = 'free'
): Promise<LLMResponse> {
    const config = MODEL_CONFIG[tier];

    try {
        const response = await callProvider(
            config.provider,
            systemPrompt,
            userPrompt,
            config.model,
            false
        );

        return await parseResponse(response, config.provider, config.model);
    } catch (error) {
        if (config.fallback) {
            console.warn(`[AI Client] Primary model failed, trying fallback: ${config.fallback.model}`);
            const fallbackResponse = await callProvider(
                config.fallback.provider,
                systemPrompt,
                userPrompt,
                config.fallback.model,
                false
            );
            return await parseResponse(fallbackResponse, config.fallback.provider, config.fallback.model);
        }
        throw error;
    }
}

/**
 * 스트리밍 LLM 호출
 */
export async function generateStreamingCompletion(
    systemPrompt: string,
    userPrompt: string,
    tier: ModelTier = 'free'
): Promise<Response> {
    const config = MODEL_CONFIG[tier];

    try {
        const response = await callProvider(
            config.provider,
            systemPrompt,
            userPrompt,
            config.model,
            true
        );

        if (!response.ok) {
            throw new Error(`Streaming API call failed: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        if (config.fallback) {
            console.warn(`[AI Client] Primary streaming failed, trying fallback: ${config.fallback.model}`);
            return await callProvider(
                config.fallback.provider,
                systemPrompt,
                userPrompt,
                config.fallback.model,
                true
            );
        }
        throw error;
    }
}

/**
 * 프로바이더별 호출 라우팅
 */
async function callProvider(
    provider: ModelProvider,
    systemPrompt: string,
    userPrompt: string,
    model: string,
    stream: boolean
): Promise<Response> {
    const metadata = { stream, model };

    switch (provider) {
        case 'openai': {
            const response = await callOpenAI(systemPrompt, userPrompt, model, stream);
            await safeIncrementUsageCounter({ provider: 'openai', metric: 'api_requests', count: 1, metadata });
            return response;
        }
        case 'anthropic': {
            const response = await callAnthropic(systemPrompt, userPrompt, model, stream);
            await safeIncrementUsageCounter({ provider: 'anthropic', metric: 'api_requests', count: 1, metadata });
            return response;
        }
        case 'google': {
            const response = await callGoogle(systemPrompt, userPrompt, model, stream);
            await safeIncrementUsageCounter({ provider: 'google', metric: 'api_requests', count: 1, metadata });
            return response;
        }
        default: throw new Error(`Unsupported provider: ${provider}`);
    }
}

/**
 * 응답 파싱
 */
async function parseResponse(
    response: Response,
    provider: ModelProvider,
    model: string
): Promise<LLMResponse> {
    const data = await response.json();
    let content: string;
    let usage: LLMResponse['usage'];

    switch (provider) {
        case 'openai':
            content = data.choices[0]?.message?.content || '';
            usage = data.usage ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
            } : undefined;
            break;
        case 'anthropic':
            content = data.content[0]?.text || '';
            usage = data.usage ? {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens,
            } : undefined;
            break;
        case 'google':
            content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            usage = data.usageMetadata ? {
                promptTokens: data.usageMetadata.promptTokenCount,
                completionTokens: data.usageMetadata.candidatesTokenCount,
                totalTokens: data.usageMetadata.totalTokenCount,
            } : undefined;
            break;
        default:
            content = '';
    }

    if (usage?.totalTokens) {
        await safeIncrementUsageCounter({
            provider,
            metric: 'tokens_total',
            count: 1,
            amount: usage.totalTokens,
            metadata: { model },
        });
    }

    return { content, model, provider, usage };
}

/**
 * 구조화된 JSON 응답 생성 (Cosmic Report용)
 */
export async function generateStructuredReport<T>(
    systemPrompt: string,
    userPrompt: string,
    tier: ModelTier = 'free',
    schema?: z.ZodSchema<T>
): Promise<T> {
    const config = MODEL_CONFIG[tier];
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const model = config.provider === 'google' ? config.model : 'gemini-3-flash-preview';

    if (!apiKey) throw new Error('GOOGLE_AI_API_KEY is not configured');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
                temperature: 0.7, // 0.85 -> 0.7 for higher stability
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            },
        }),
    };

    const response = await fetchWithRetry(url, options);
    const data = await response.json();
    await safeIncrementUsageCounter({
        provider: 'google',
        metric: 'api_requests',
        count: 1,
        metadata: { model, mode: 'structured_report' },
    });

    const tokenTotal = data.usageMetadata?.totalTokenCount;
    if (typeof tokenTotal === 'number' && tokenTotal > 0) {
        await safeIncrementUsageCounter({
            provider: 'google',
            metric: 'tokens_total',
            count: 1,
            amount: tokenTotal,
            metadata: { model, mode: 'structured_report' },
        });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    // Helper: Clean problematic JSON content
    const cleanJsonString = (str: string) => {
        let cleaned = str.trim();
        // 1. Remove markdown code blocks if present
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '');
        }

        // 2. Handle unescaped internal double quotes more robustly
        // This is a common issue where AI says "He said "Hello""
        // We look for quotes that aren't structural (not after : { [ , or before : } ] ,)
        // Note: This is an approximation.
        cleaned = cleaned.replace(/([^\\:[{,\s\n])"([^,:\]}\s\n])/g, "$1'$2");

        // 3. Handle raw newlines within string values (Critical for long poetic responses)
        // JSON requires \n, but AI often gives raw newlines in multi-line strings.
        // We look for parts between : " and " , or " }
        // We replace newlines with \n only inside quotes
        let inString = false;
        let finalResult = '';
        for (let i = 0; i < cleaned.length; i++) {
            const char = cleaned[i];
            const prevChar = i > 0 ? cleaned[i - 1] : '';

            if (char === '"' && prevChar !== '\\') {
                inString = !inString;
                finalResult += char;
            } else if (char === '\n' && inString) {
                finalResult += '\\n';
            } else {
                finalResult += char;
            }
        }
        cleaned = finalResult;

        // 4. Remove trailing commas (e.g., [1, 2, ] -> [1, 2])
        cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

        return cleaned;
    };

    const text = cleanJsonString(rawText);

    try {
        const parsed = JSON.parse(text);
        if (schema) {
            const validation = schema.safeParse(parsed);
            if (!validation.success) {
                console.error("[AI Schema Validation Failed]", validation.error);
                console.error("[Bad Response Body]", text);
                throw new Error(`Schema Validation Failed: ${validation.error.message}`);
            }
            return validation.data;
        }
        return parsed as T;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        // Advanced diagnostics: Find error position
        const errorPosMatch = message.match(/position (\d+)/);
        if (errorPosMatch) {
            const pos = parseInt(errorPosMatch[1], 10);
            const start = Math.max(0, pos - 50);
            const end = Math.min(text.length, pos + 50);
            console.error(`[JSON Parse Detail] Error around position ${pos}:`);
            console.error(`...${text.substring(start, pos)} >>> ${text.charAt(pos)} <<< ${text.substring(pos + 1, end)}...`);
        }

        console.error("JSON Parse Error Message:", message);
        console.error("Failed JSON Content (Full):", text);
        throw new Error(`Failed to parse AI response: ${message}`);
    }
}
