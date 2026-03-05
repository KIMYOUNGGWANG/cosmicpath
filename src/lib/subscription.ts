const PREMIUM_STATUSES = new Set(['pro', 'couple']);

function toValidDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;

    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
}

export function isSubscriptionActive(
    status: string | null | undefined,
    expiresAt: Date | string | null | undefined,
    now: Date = new Date()
): boolean {
    if (!status || !PREMIUM_STATUSES.has(status)) {
        return false;
    }

    const expirationDate = toValidDate(expiresAt);
    if (!expirationDate) {
        return true;
    }

    return expirationDate.getTime() > now.getTime();
}
