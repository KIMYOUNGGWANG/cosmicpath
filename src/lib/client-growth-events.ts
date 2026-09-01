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

export interface GrowthAttribution {
    pid?: string;
    fid?: string;
    cid?: string;
    ref?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
}

const SESSION_STORAGE_KEY = 'cosmic_growth_session_id';
const LOCAL_STORAGE_KEY = 'cosmic_growth_session_id_backup';
const ATTRIBUTION_STORAGE_KEY = 'cosmic_growth_attribution';

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

export function getGrowthAttribution(): GrowthAttribution {
    if (typeof window === 'undefined') return {};

    try {
        const searchParams = new URLSearchParams(window.location.search);
        const pid = searchParams.get('pid') || searchParams.get('postId') || undefined;
        const fid = searchParams.get('fid') || searchParams.get('formulaId') || undefined;
        const cid = searchParams.get('cid') || searchParams.get('campaignId') || undefined;
        const ref = searchParams.get('ref') || searchParams.get('utm_source') || undefined;
        const utm_medium = searchParams.get('utm_medium') || undefined;
        const utm_campaign = searchParams.get('utm_campaign') || undefined;

        if (pid || ref) {
            const fresh: GrowthAttribution = {
                pid,
                fid,
                cid,
                ref,
                utm_source: ref,
                utm_medium,
                utm_campaign,
            };
            sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(fresh));
            localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(fresh));
            return fresh;
        }

        const stored =
            sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) ||
            localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Fallback gracefully on storage exceptions
    }

    return {};
}

export async function trackClientGrowthEvent(input: ClientGrowthEventInput): Promise<void> {
    if (typeof window === 'undefined') return;

    const attribution = getGrowthAttribution();
    const payload = JSON.stringify({
        ...input,
        sessionId: input.sessionId || getGrowthSessionId(),
        path: input.path || window.location.pathname,
        metadata: {
            ...attribution,
            ...input.metadata,
        },
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
