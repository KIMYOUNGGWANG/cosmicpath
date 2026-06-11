export interface WebhookHandlerResult {
    readonly ok: boolean;
    readonly error?: string;
    readonly status?: number;
}

export const WEBHOOK_OK: WebhookHandlerResult = { ok: true };

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }

    return Object.fromEntries(Object.entries(value));
}

export function parseJsonObject(raw: string | null | undefined): Record<string, unknown> {
    if (!raw) return {};

    try {
        const parsed: unknown = JSON.parse(raw);
        return asRecord(parsed) ?? {};
    } catch (error) {
        if (error instanceof SyntaxError) {
            return {};
        }
        throw error;
    }
}

export function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}
