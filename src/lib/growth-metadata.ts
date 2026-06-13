const SENSITIVE_METADATA_KEY_PARTS = [
    'birth',
    'contact',
    'email',
    'fullname',
    'handle',
    'intakedata',
    'name',
    'partner',
    'phone',
    'readingdata',
    'username',
] as const;

const ALLOWED_QUESTION_METADATA_KEYS = new Set(['hasprefilledquestion', 'questionlength']);

function normalizeMetadataKey(key: string): string {
    return key.replace(/[^a-z0-9]+/gi, '').toLowerCase();
}

export function isSensitiveGrowthMetadataKey(key: string): boolean {
    const normalizedKey = normalizeMetadataKey(key);

    if (SENSITIVE_METADATA_KEY_PARTS.some((part) => normalizedKey.includes(part))) {
        return true;
    }

    return normalizedKey.includes('question') && !ALLOWED_QUESTION_METADATA_KEYS.has(normalizedKey);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeGrowthMetadataValue(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value
            .map((item) => sanitizeGrowthMetadataValue(item))
            .filter((item) => item !== undefined);
    }

    if (!isRecord(value)) return value;

    const sanitized = sanitizeGrowthMetadata(value);
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

export function sanitizeGrowthMetadata(
    metadata: Record<string, unknown> | undefined
): Record<string, unknown> {
    if (!metadata) return {};

    return Object.fromEntries(
        Object.entries(metadata).flatMap(([key, value]) => {
            if (isSensitiveGrowthMetadataKey(key)) return [];

            const sanitizedValue = sanitizeGrowthMetadataValue(value);
            return sanitizedValue === undefined ? [] : [[key, sanitizedValue]];
        })
    );
}
