/**
 * Safe Error Handler
 * 
 * Masks internal errors in production to prevent information leakage
 */

export interface SafeErrorResult {
    message: string;
    code: string;
    details?: unknown; // Only in development
}

// Known error codes that are safe to expose
const SAFE_ERROR_CODES = new Set([
    'VALIDATION_ERROR',
    'NOT_FOUND',
    'RATE_LIMITED',
    'PAYMENT_REQUIRED',
    'PROMO_INVALID',
    'PROMO_EXPIRED',
    'SESSION_EXPIRED',
]);

/**
 * Converts any error to a safe, user-facing error response.
 * In production, internal details are hidden.
 */
export function safeError(error: unknown, code: string = 'INTERNAL_ERROR'): SafeErrorResult {
    const isDev = process.env.NODE_ENV === 'development';

    // If it's a known safe error code, expose the message
    if (SAFE_ERROR_CODES.has(code)) {
        return {
            message: error instanceof Error ? error.message : String(error),
            code,
        };
    }

    // In development, expose full error
    if (isDev) {
        return {
            message: error instanceof Error ? error.message : String(error),
            code,
            details: error instanceof Error ? error.stack : undefined,
        };
    }

    // In production, hide internal errors
    console.error('[SafeError] Internal error masked:', error);
    return {
        message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        code: 'INTERNAL_ERROR',
    };
}

/**
 * Wraps an API handler with error masking
 */
export function withSafeError<T>(
    handler: () => Promise<T>,
    errorCode: string = 'INTERNAL_ERROR'
): Promise<T | SafeErrorResult> {
    return handler().catch((error) => safeError(error, errorCode));
}

/**
 * Log error securely (with redaction of sensitive data)
 */
export function logSecureError(context: string, error: unknown, metadata?: Record<string, unknown>): void {
    const sanitizedMeta = metadata ? redactSensitive(metadata) : undefined;

    console.error(`[${context}]`, {
        message: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
        metadata: sanitizedMeta,
        timestamp: new Date().toISOString(),
    });
}

// Redact sensitive fields
function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'email', 'card', 'ssn'];
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            result[key] = redactSensitive(value as Record<string, unknown>);
        } else {
            result[key] = value;
        }
    }

    return result;
}
