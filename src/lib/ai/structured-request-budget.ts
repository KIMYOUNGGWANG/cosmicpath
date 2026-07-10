import type { ModelTier } from './llm-client';

export interface StructuredRequestConfig {
    timeoutMs: number;
    maxRetries: number;
    maxOutputTokens: number;
    initialDelayMs: number;
    temperature: number;
}

export const PREMIUM_PHASE_REQUEST_TIMEOUT_MS = 45_000;
export const PREMIUM_PHASE_MAX_ATTEMPTS = 2;

export function getStructuredRequestConfig(
    tier: ModelTier,
    attempt: number
): StructuredRequestConfig {
    if (tier === 'basic') {
        return {
            timeoutMs: 26000,
            maxRetries: 1,
            maxOutputTokens: attempt > 0 ? 2304 : 1536,
            initialDelayMs: 1500,
            temperature: 0.3,
        };
    }

    if (tier === 'free') {
        return {
            timeoutMs: attempt > 0 ? 32000 : 30000,
            maxRetries: attempt > 0 ? 0 : 1,
            maxOutputTokens: attempt > 0 ? 8192 : 6144,
            initialDelayMs: 1500,
            temperature: 0.2,
        };
    }

    return {
        timeoutMs: attempt > 0 ? 28000 : 24000,
        maxRetries: 1,
        maxOutputTokens: attempt > 0 ? 5120 : 4096,
        initialDelayMs: 1500,
        temperature: 0.4,
    };
}

function requestBudgetMs(config: StructuredRequestConfig): number {
    let backoffMs = 0;
    for (let retry = 0; retry < config.maxRetries; retry += 1) {
        backoffMs += config.initialDelayMs * 2 ** retry;
    }

    return config.timeoutMs * (config.maxRetries + 1) + backoffMs;
}

export function getWorstCaseStructuredBudgetMs(tier: ModelTier): number {
    const attempts = tier === 'free' ? 2 : 1;
    let totalMs = 0;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
        totalMs += requestBudgetMs(getStructuredRequestConfig(tier, attempt));
    }

    return totalMs;
}

export function getWorstCasePremiumPhaseBudgetMs(): number {
    let rateLimitBackoffMs = 0;
    for (let attempt = 0; attempt < PREMIUM_PHASE_MAX_ATTEMPTS; attempt += 1) {
        rateLimitBackoffMs += 3_000 * 2 ** attempt;
    }
    return PREMIUM_PHASE_REQUEST_TIMEOUT_MS * PREMIUM_PHASE_MAX_ATTEMPTS + rateLimitBackoffMs;
}
