type GrowthMetadata = Record<string, unknown>;

export type CanonicalGrowthEvent =
    | 'install'
    | 'daily_active'
    | 'first_result_view'
    | 'followup_start'
    | 'daily_return_after_reading'
    | 'share'
    | 'invite'
    | 'invite_conversion'
    | 'paid_conversion'
    | 'checkout_start'
    | 'paywall_view'
    | 'landing_view'
    | 'retention'
    | 'other';

const EVENT_ALIASES: Record<string, CanonicalGrowthEvent> = {
    install: 'install',
    app_install: 'install',
    first_visit: 'install',
    daily_active: 'daily_active',
    session_active: 'daily_active',
    first_result_view: 'first_result_view',
    free_result_shown: 'first_result_view',
    followup_start: 'followup_start',
    daily_return_after_reading: 'daily_return_after_reading',
    share_clicked: 'share',
    share_kakao_clicked: 'share',
    share_link_copied: 'share',
    share_compatibility_link_copied: 'share',
    share_reward_claimed: 'share',
    share_reward_claimed_client: 'share',
    share_card_download: 'share',
    invite_cta_clicked: 'invite',
    invite_link_copied: 'invite',
    invite_link_opened: 'invite',
    referral_reward_redeemed: 'invite',
    invite_converted: 'invite_conversion',
    referral_reward_granted: 'invite_conversion',
    checkout_success: 'paid_conversion',
    paid_conversion: 'paid_conversion',
    checkout_start: 'checkout_start',
    paywall_open: 'paywall_view',
    soft_paywall_shown: 'paywall_view',
    landing_view: 'landing_view',
    guide_hub_view: 'landing_view',
    guide_article_view: 'landing_view',
};

export function getCanonicalGrowthEvent(event: string): CanonicalGrowthEvent {
    return EVENT_ALIASES[event] ?? 'other';
}

export function parseGrowthMetadata(rawValue: string | null | undefined): GrowthMetadata {
    if (!rawValue) {
        return {};
    }

    try {
        const parsed = JSON.parse(rawValue);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as GrowthMetadata;
        }
    } catch {
        return {};
    }

    return {};
}

function getMetadataString(metadata: GrowthMetadata, key: string): string | null {
    const value = metadata[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function isCountablePaidConversionEvent(metadata: GrowthMetadata): boolean {
    const plan = getMetadataString(metadata, 'plan');
    const price = getMetadataString(metadata, 'price');

    if (plan === 'promo_free_unlock') {
        return false;
    }

    if (price?.toUpperCase() === 'FREE') {
        return false;
    }

    return true;
}

export function getPaidConversionTrackingKey(input: {
    metadata: GrowthMetadata;
    readingId?: string | null;
}): string | null {
    const checkoutSessionId =
        getMetadataString(input.metadata, 'checkoutSessionId') ||
        getMetadataString(input.metadata, 'stripeSessionId');
    const genericSessionId = getMetadataString(input.metadata, 'sessionId');
    const orderId = getMetadataString(input.metadata, 'orderId');

    if (orderId) {
        return `order:${orderId}`;
    }

    if (checkoutSessionId) {
        return `checkout:${checkoutSessionId}`;
    }

    if (genericSessionId?.startsWith('cs_')) {
        return `checkout:${genericSessionId}`;
    }

    if (input.readingId) {
        return `reading:${input.readingId}`;
    }

    return null;
}

export function getGrowthDistinctId(input: {
    readingId?: string;
    referralCode?: string;
    metadata?: GrowthMetadata;
}): string {
    const metadata = input.metadata ?? {};
    const sessionId = typeof metadata.sessionId === 'string' ? metadata.sessionId : null;
    const userId = typeof metadata.userId === 'string' ? metadata.userId : null;

    return (
        userId ||
        sessionId ||
        input.readingId ||
        input.referralCode ||
        `growth_${Date.now()}`
    );
}

async function mirrorToPostHog(input: {
    event: CanonicalGrowthEvent;
    distinctId: string;
    properties: GrowthMetadata;
}) {
    const apiKey = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    if (!apiKey) {
        return;
    }

    await fetch(`${host.replace(/\/$/, '')}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: apiKey,
            event: input.event,
            distinct_id: input.distinctId,
            properties: input.properties,
        }),
    });
}

async function mirrorToMixpanel(input: {
    event: CanonicalGrowthEvent;
    distinctId: string;
    properties: GrowthMetadata;
}) {
    const token = process.env.MIXPANEL_TOKEN;

    if (!token) {
        return;
    }

    const payload = {
        event: input.event,
        properties: {
            token,
            distinct_id: input.distinctId,
            ...input.properties,
        },
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');

    await fetch('https://api.mixpanel.com/track?verbose=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: encoded }),
    });
}

export async function mirrorGrowthEvent(input: {
    originalEvent: string;
    readingId?: string;
    referralCode?: string;
    channel?: string;
    metadata?: GrowthMetadata;
}) {
    const canonicalEvent = getCanonicalGrowthEvent(input.originalEvent);
    const properties: GrowthMetadata = {
        canonicalEvent,
        originalEvent: input.originalEvent,
        channel: input.channel,
        readingId: input.readingId,
        referralCode: input.referralCode,
        ...input.metadata,
    };
    const distinctId = getGrowthDistinctId({
        readingId: input.readingId,
        referralCode: input.referralCode,
        metadata: properties,
    });

    const tasks: Promise<void>[] = [];

    tasks.push(
        mirrorToPostHog({
            event: canonicalEvent,
            distinctId,
            properties,
        })
    );
    tasks.push(
        mirrorToMixpanel({
            event: canonicalEvent,
            distinctId,
            properties,
        })
    );

    await Promise.allSettled(tasks);
}
