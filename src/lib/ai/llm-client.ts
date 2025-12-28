/**
 * LLM 클라이언트 (LLM Client)
 * 다중 AI 모델 지원 및 스트리밍 응답 처리
 */

// 지원 모델 타입
export type ModelProvider = 'openai' | 'anthropic' | 'google';
export type ModelTier = 'free' | 'basic' | 'premium';

// 모델 설정 (2025.12 최신)
// - Free/Basic: Gemini (비용 효율 최고, 한국어 우수)
// - Premium: Claude Sonnet 4.5 (감성적 톤, 고품질) - 추후 활성화 예정
export const MODEL_CONFIG: Record<ModelTier, {
    provider: ModelProvider;
    model: string;
    fallback?: { provider: ModelProvider; model: string };
}> = {
    free: {
        provider: 'google',
        model: 'gemini-3-flash-preview',
        // 무료 티어는 fallback 없음 (비용 절약)
    },
    basic: {
        provider: 'google',
        model: 'gemini-3-flash-preview',
        fallback: { provider: 'google', model: 'gemini-2.5-flash' },
    },
    premium: {
        provider: 'anthropic',
        model: 'claude-sonnet-4-5',  // 2025.09 출시, 감성 표현 최강
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

// 스트리밍 청크 타입
export interface StreamChunk {
    content: string;
    done: boolean;
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

    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    return response;
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

    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
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

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    return response;
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

    if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY is not configured');
    }

    const endpoint = stream
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
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
                temperature: 0.85,
                maxOutputTokens: 4000,  // 더 긴 응답을 위해 증가
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Google AI API error: ${error.error?.message || response.statusText}`);
    }

    return response;
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
        // 폴백 시도
        if (config.fallback) {
            console.warn(`Primary model failed, trying fallback: ${config.fallback.model}`);
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
 * 프로바이더별 호출 라우팅
 */
async function callProvider(
    provider: ModelProvider,
    systemPrompt: string,
    userPrompt: string,
    model: string,
    stream: boolean
): Promise<Response> {
    switch (provider) {
        case 'openai':
            return callOpenAI(systemPrompt, userPrompt, model, stream);
        case 'anthropic':
            return callAnthropic(systemPrompt, userPrompt, model, stream);
        case 'google':
            return callGoogle(systemPrompt, userPrompt, model, stream);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
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

    return {
        content,
        model,
        provider,
        usage,
    };
}

/**
 * 스트리밍 LLM 호출 (ReadableStream 반환)
 */
export async function generateStreamingCompletion(
    systemPrompt: string,
    userPrompt: string,
    tier: ModelTier = 'free'
): Promise<ReadableStream<Uint8Array>> {
    const config = MODEL_CONFIG[tier];

    const response = await callProvider(
        config.provider,
        systemPrompt,
        userPrompt,
        config.model,
        true
    );

    if (!response.body) {
        throw new Error('No response body for streaming');
    }

    return transformStream(response.body, config.provider);
}

/**
 * 프로바이더별 스트림 변환
 */
function transformStream(
    body: ReadableStream<Uint8Array>,
    provider: ModelProvider
): ReadableStream<Uint8Array> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    return new ReadableStream({
        async pull(controller) {
            const { done, value } = await reader.read();

            if (done) {
                controller.close();
                return;
            }

            const text = decoder.decode(value, { stream: true });
            const lines = text.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    let content = '';

                    if (provider === 'openai') {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') continue;
                            const parsed = JSON.parse(data);
                            content = parsed.choices?.[0]?.delta?.content || '';
                        }
                    } else if (provider === 'anthropic') {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            const parsed = JSON.parse(data);
                            if (parsed.type === 'content_block_delta') {
                                content = parsed.delta?.text || '';
                            }
                        }
                    } else if (provider === 'google') {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            const parsed = JSON.parse(data);
                            content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        }
                    }

                    if (content) {
                        controller.enqueue(encoder.encode(content));
                    }
                } catch {
                    // 파싱 에러 무시 (스트림 청크가 불완전할 수 있음)
                }
            }
        },
    });
}

/**
 * 토큰 사용량 추정 (비용 계산용)
 */
export function estimateTokens(text: string): number {
    // 대략적인 추정: 한국어는 약 2-3자당 1토큰
    // 영어는 약 4자당 1토큰
    const koreanChars = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
    const otherChars = text.length - koreanChars;

    return Math.ceil(koreanChars / 2.5 + otherChars / 4);
}

/**
 * 예상 비용 계산 (USD)
 */
export function estimateCost(
    inputTokens: number,
    outputTokens: number,
    tier: ModelTier
): number {
    // 2024년 기준 대략적인 가격 (1M 토큰당)
    const pricing: Record<ModelTier, { input: number; output: number }> = {
        free: { input: 0.15, output: 0.6 },     // GPT-4o-mini
        basic: { input: 0.15, output: 0.6 },    // GPT-4o-mini
        premium: { input: 3, output: 15 },       // Claude Sonnet
    };

    const price = pricing[tier];
    return (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
}

/**
 * 구조화된 JSON 응답 생성 (Cosmic Report용)
 * Gemini의 JSON Output 모드 활용
 */
export async function generateStructuredReport<T>(
    systemPrompt: string,
    userPrompt: string,
    tier: ModelTier = 'free'
): Promise<T> {
    const config = MODEL_CONFIG[tier];
    const apiKey = process.env.GOOGLE_AI_API_KEY; // 모든 티어에서 Gemini 활용 (JSON 특화)

    // 현재 구조화된 응답은 Gemini가 가장 강력하므로 Provider를 Google로 고정 (또는 Fallback)
    const model = config.provider === 'google' ? config.model : 'gemini-1.5-flash';

    if (!apiKey) throw new Error('GOOGLE_AI_API_KEY is not configured');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: systemPrompt }],
            },
            contents: [{
                role: 'user',
                parts: [{ text: userPrompt }],
            }],
            generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 8192, // 긴 리포트를 위해 충분히 확보
                responseMimeType: "application/json", // 핵심: JSON 강제
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Google AI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    try {
        return JSON.parse(text) as T;
    } catch (e) {
        console.error("JSON Parse Error:", text);
        throw new Error("Failed to parse AI response as JSON");
    }
}
