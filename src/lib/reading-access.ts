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
    const hasSessionAccess = Boolean(
        params.readingUserId &&
        params.sessionUserId &&
        params.sessionUserId === params.readingUserId
    );
    const canUseAccessKey = !params.readingUserId;
    const hasAccessKeyMatch =
        canUseAccessKey &&
        safeCompare(params.providedAccessKey, params.storedAccessKey);

    return hasSessionAccess || hasAccessKeyMatch;
}

/**
 * 일운(日運) 캘린더 등급별 게이팅 (Task 14)
 * - free: 첫 3일만 미리보기 제공
 * - basic / premium: 30일 전체 제공
 */
export function filterIlwoonForTier<T>(ilwoonList: T[] | undefined, hasVerifiedAccess: boolean): {
    visibleList: T[];
    isGated: boolean;
    hiddenCount: number;
} {
    if (!ilwoonList || ilwoonList.length === 0) {
        return { visibleList: [], isGated: false, hiddenCount: 0 };
    }

    if (hasVerifiedAccess) {
        return { visibleList: ilwoonList, isGated: false, hiddenCount: 0 };
    }

    const freeLimit = 3;
    const visibleList = ilwoonList.slice(0, freeLimit);
    const hiddenCount = Math.max(0, ilwoonList.length - freeLimit);

    return {
        visibleList,
        isGated: hiddenCount > 0,
        hiddenCount,
    };
}
