import { randomBytes, timingSafeEqual } from 'crypto';

const PRIVATE_METADATA_KEY = '__system';
const OWNER_ACCESS_KEY = 'ownerAccessKey';

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as JsonRecord
        : null;
}

function cloneRecord(value: JsonRecord | null): JsonRecord {
    return value ? { ...value } : {};
}

function getPrivateMetadata(metadata: JsonRecord): JsonRecord {
    return cloneRecord(asRecord(metadata[PRIVATE_METADATA_KEY]));
}

function safeCompare(value: string | null | undefined, expected: string | null | undefined): boolean {
    if (!value || !expected) return false;

    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);

    if (valueBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return timingSafeEqual(valueBuffer, expectedBuffer);
}

export function createReadingAccessKey(): string {
    return randomBytes(24).toString('hex');
}

export function normalizeReadingMetadata(input: unknown): JsonRecord {
    if (typeof input === 'string') {
        try {
            return normalizeReadingMetadata(JSON.parse(input));
        } catch {
            return {};
        }
    }

    return cloneRecord(asRecord(input));
}

export function extractReadingAccessKey(input: unknown): string | null {
    const metadata = normalizeReadingMetadata(input);
    const privateMetadata = getPrivateMetadata(metadata);
    return typeof privateMetadata[OWNER_ACCESS_KEY] === 'string'
        ? privateMetadata[OWNER_ACCESS_KEY] as string
        : null;
}

export function attachReadingAccessKey(input: unknown, accessKey: string): JsonRecord {
    const metadata = normalizeReadingMetadata(input);
    const privateMetadata = getPrivateMetadata(metadata);

    return {
        ...metadata,
        [PRIVATE_METADATA_KEY]: {
            ...privateMetadata,
            [OWNER_ACCESS_KEY]: accessKey,
        },
    };
}

export function stripPrivateReadingMetadata(input: unknown): JsonRecord | null {
    const metadata = normalizeReadingMetadata(input);

    if (Object.keys(metadata).length === 0) {
        return null;
    }

    const publicMetadata = { ...metadata };
    delete publicMetadata[PRIVATE_METADATA_KEY];
    return publicMetadata;
}

export function hasReadingAccess(params: {
    readingUserId: string | null;
    sessionUserId?: string | null;
    storedAccessKey?: string | null;
    providedAccessKey?: string | null;
}): boolean {
    if (params.readingUserId) {
        return Boolean(params.sessionUserId && params.sessionUserId === params.readingUserId);
    }

    return safeCompare(params.providedAccessKey, params.storedAccessKey);
}
