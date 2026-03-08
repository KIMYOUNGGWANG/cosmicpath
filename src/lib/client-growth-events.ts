'use client';

export interface ClientGrowthEventInput {
    event: string;
    sessionId?: string;
    readingId?: string;
    referralCode?: string;
    source?: string;
    step?: string;
    language?: 'ko' | 'en';
    context?: string;
    invitationMode?: boolean;
    price?: string;
    plan?: string;
    path?: string;
    metadata?: Record<string, unknown>;
}

const SESSION_STORAGE_KEY = 'cosmic_growth_session_id';
const LOCAL_STORAGE_KEY = 'cosmic_growth_session_id_backup';

function createSessionId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `growth_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getGrowthSessionId(): string {
    if (typeof window === 'undefined') {
        return createSessionId();
    }

    try {
        const existingSessionId =
            sessionStorage.getItem(SESSION_STORAGE_KEY) ||
            localStorage.getItem(LOCAL_STORAGE_KEY);

        if (existingSessionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, existingSessionId);
            localStorage.setItem(LOCAL_STORAGE_KEY, existingSessionId);
            return existingSessionId;
        }

        const nextSessionId = createSessionId();
        sessionStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
        localStorage.setItem(LOCAL_STORAGE_KEY, nextSessionId);
        return nextSessionId;
    } catch {
        return createSessionId();
    }
}

export async function trackClientGrowthEvent(input: ClientGrowthEventInput): Promise<void> {
    if (typeof window === 'undefined') return;

    const payload = JSON.stringify({
        ...input,
        sessionId: input.sessionId || getGrowthSessionId(),
        path: input.path || window.location.pathname,
    });

    try {
        await fetch('/api/growth/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
        });
    } catch {
        // Analytics must never block the user flow.
    }
}
