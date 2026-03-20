interface MatchMetadata {
    summary?: string;
    hostSign?: string;
    guestSign?: string;
    hostElement?: string;
    guestElement?: string;
}

interface MatchShareInput {
    hostName: string;
    guestName: string | null;
    score: number | null;
    metadata: string | null;
}

interface MatchShareSummary {
    title: string;
    description: string;
    score: number | null;
    hostName: string;
    guestName: string | null;
    hostSign: string | null;
    guestSign: string | null;
    hostElement: string | null;
    guestElement: string | null;
    status: 'invite' | 'result';
    tierLabel: string;
    cta: string;
}

function parseMetadata(raw: string | null): MatchMetadata {
    if (!raw) {
        return {};
    }

    try {
        return JSON.parse(raw) as MatchMetadata;
    } catch {
        return {};
    }
}

function truncate(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function clampScore(score: number | null): number | null {
    if (typeof score !== 'number' || Number.isNaN(score)) {
        return null;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
}

function getTierLabel(score: number | null): string {
    if (score === null) {
        return 'Destiny Invitation';
    }

    if (score >= 85) {
        return 'Fated Alignment';
    }

    if (score >= 70) {
        return 'Golden Harmony';
    }

    if (score >= 55) {
        return 'Rising Chemistry';
    }

    if (score >= 40) {
        return 'Tension & Spark';
    }

    return 'Complex Orbit';
}

export function getMatchShareSummary(input: MatchShareInput): MatchShareSummary {
    const metadata = parseMetadata(input.metadata);
    const score = clampScore(input.score);
    const hasGuest = Boolean(input.guestName);
    const tierLabel = getTierLabel(score);

    if (!hasGuest) {
        return {
            title: truncate(`${input.hostName} sent a cosmic match invite`, 70),
            description: truncate(
                `${input.hostName} invited you to unlock a Saju, astrology, and tarot compatibility reading on CosmicPath.`,
                140
            ),
            score: null,
            hostName: input.hostName,
            guestName: null,
            hostSign: metadata.hostSign ?? null,
            guestSign: null,
            hostElement: metadata.hostElement ?? null,
            guestElement: null,
            status: 'invite',
            tierLabel,
            cta: 'Enter your birth date and reveal the full compatibility chart.',
        };
    }

    const elementLine = metadata.hostElement && metadata.guestElement
        ? `${metadata.hostElement} x ${metadata.guestElement}`
        : 'Saju • Astrology • Tarot';

    const description =
        typeof metadata.summary === 'string' && metadata.summary.trim()
            ? metadata.summary.trim()
            : score !== null
                ? `${tierLabel}. ${input.hostName} and ${input.guestName} are showing a ${score}% resonance across ${elementLine}.`
                : `${input.hostName} and ${input.guestName} unlocked a CosmicPath compatibility reading.`;

    return {
        title: truncate(`${input.hostName} × ${input.guestName}`, 70),
        description: truncate(description, 140),
        score,
        hostName: input.hostName,
        guestName: input.guestName,
        hostSign: metadata.hostSign ?? null,
        guestSign: metadata.guestSign ?? null,
        hostElement: metadata.hostElement ?? null,
        guestElement: metadata.guestElement ?? null,
        status: 'result',
        tierLabel,
        cta: 'Open the compatibility report and decode the relationship pattern.',
    };
}
