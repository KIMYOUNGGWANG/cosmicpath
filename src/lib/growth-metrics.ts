import { prisma } from '@/lib/prisma';
import {
    getCanonicalGrowthEvent,
    getPaidConversionTrackingKey,
    isCountablePaidConversionEvent,
    parseGrowthMetadata,
} from '@/lib/growth-analytics';
import { getRuntimeEnvironmentFromRecord, matchesCurrentRuntimeEnvironment } from '@/lib/runtime-environment';

interface GrowthSeriesPoint {
    date: string;
    installs: number;
    activeUsers: number;
    shares: number;
    invites: number;
    inviteConversions: number;
    firstResultViews: number;
    followupStarts: number;
    dailyReturnsAfterReading: number;
    paidConversions: number;
}

interface GrowthSourcePoint {
    source: string;
    count: number;
}

interface CampaignFunnelEventCounts {
    landingViews: number;
    promptClicks: number;
    questionSubmits: number;
    analysisStarts: number;
    firstResultViews: number;
    paywallViews: number;
    checkoutStarts: number;
    paidConversions: number;
    followupSeeds: number;
    followupStarts: number;
    dailyReturnsAfterReading: number;
}

export interface CampaignFunnelSummary {
    key: string;
    label: string;
    description: string;
    sources: string[];
    sessions: number;
    totalEvents: number;
    eventCounts: CampaignFunnelEventCounts;
    uniqueSessionCounts: CampaignFunnelEventCounts;
    rates: {
        landingToPromptRate: number;
        landingToAnalysisRate: number;
        analysisToResultRate: number;
        resultToPaywallRate: number;
        paywallToCheckoutRate: number;
        checkoutToPaidRate: number;
        resultToPaidRate: number;
        resultToFollowupSeedRate: number;
    };
    topSources: GrowthSourcePoint[];
}

interface GrowthEventSummaryRow {
    createdAt: Date;
    event: string;
    channel: string | null;
    metadata: string | null;
    readingId: string | null;
}

interface GrowthActivationSnapshot {
    firstResultViews: number;
    followupStarts: number;
    dailyReturnsAfterReading: number;
    resultToFollowupRate: number;
    resultToDailyReturnRate: number;
    resultToPaidConversionRate: number;
}

export interface GrowthSummary {
    dateRange: {
        from: string;
        to: string;
        days: number;
    };
    totals: {
        installs: number;
        activeUsers: number;
        shares: number;
        invites: number;
        inviteConversions: number;
        paidConversions: number;
        checkoutStarts: number;
        paywallViews: number;
        landingViews: number;
        returningUsers: number;
    };
    rates: {
        retentionRate: number;
        landingToCheckoutRate: number;
        checkoutConversionRate: number;
        viralCoefficientProxy: number;
    };
    activation: GrowthActivationSnapshot;
    visits: {
        today: number;
        last7Days: number;
        last30Days: number;
        dauMauRate: number;
    };
    series: GrowthSeriesPoint[];
    topSources: GrowthSourcePoint[];
    campaignFunnels: CampaignFunnelSummary[];
}

function toDayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

const CAMPAIGN_FUNNEL_DEFINITIONS = [
    {
        key: 'career-timing',
        label: '커리어 타이밍',
        description: '버틸지, 옮길지, 준비할지 판단하는 커리어 wedge',
        sources: [
            'career_timing_wedge_399',
            'career_uncertainty_experiment',
            'start_page_career_timing_wedge_399',
            'start_page_career_uncertainty_experiment',
        ],
    },
    {
        key: 'relationship-contact',
        label: '관계 연락 타이밍',
        description: '지금 연락할지 기다릴지 판단하는 한국어 contact wedge',
        sources: ['relationship_contact_timing_v1'],
    },
    {
        key: 'english-contact',
        label: 'English Contact Timing',
        description: 'Should I text them or wait? 영어권 contact wedge',
        sources: ['en_relationship_contact_timing_v1'],
    },
    {
        key: 'decision-timing-home',
        label: 'Decision Timing Home',
        description: '홈/스타트에서 들어오는 범용 decision timing 리빌드',
        sources: ['decision_timing_rebuild_v1', 'start_page_decision_timing_rebuild_v1'],
    },
] as const;

type CampaignFunnelDefinition = (typeof CAMPAIGN_FUNNEL_DEFINITIONS)[number];

interface CampaignSessionEvent {
    createdAt: Date;
    event: string;
    canonicalEvent: string;
    sessionId: string;
    source: string;
}

interface CampaignFunnelBucket {
    definition: CampaignFunnelDefinition;
    sessions: number;
    totalEvents: number;
    eventCounts: CampaignFunnelEventCounts;
    uniqueSessionCounts: CampaignFunnelEventCounts;
    sourceCounter: Map<string, number>;
}

function createEmptyFunnelCounts(): CampaignFunnelEventCounts {
    return {
        landingViews: 0,
        promptClicks: 0,
        questionSubmits: 0,
        analysisStarts: 0,
        firstResultViews: 0,
        paywallViews: 0,
        checkoutStarts: 0,
        paidConversions: 0,
        followupSeeds: 0,
        followupStarts: 0,
        dailyReturnsAfterReading: 0,
    };
}

function createCampaignFunnelBucket(definition: CampaignFunnelDefinition): CampaignFunnelBucket {
    return {
        definition,
        sessions: 0,
        totalEvents: 0,
        eventCounts: createEmptyFunnelCounts(),
        uniqueSessionCounts: createEmptyFunnelCounts(),
        sourceCounter: new Map<string, number>(),
    };
}

function getNormalizedGrowthSource(event: GrowthEventSummaryRow, metadata: Record<string, unknown>): string {
    const channel = typeof event.channel === 'string' && event.channel.trim()
        ? event.channel.trim()
        : 'unknown';
    const entry = typeof metadata.entry === 'string' && metadata.entry.trim()
        ? metadata.entry.trim()
        : null;
    const experiment = typeof metadata.experiment === 'string' && metadata.experiment.trim()
        ? metadata.experiment.trim()
        : null;

    if (channel === 'client' || channel === 'unknown' || channel.startsWith('/')) {
        return entry || experiment || channel;
    }

    return channel;
}

function getCampaignDefinitionForSource(source: string): CampaignFunnelDefinition | null {
    return CAMPAIGN_FUNNEL_DEFINITIONS.find((definition) =>
        definition.sources.some((candidate) => candidate === source)
    ) ?? null;
}

function getCampaignStageKeys(event: CampaignSessionEvent): Array<keyof CampaignFunnelEventCounts> {
    const stageKeys: Array<keyof CampaignFunnelEventCounts> = [];

    if (event.canonicalEvent === 'landing_view') stageKeys.push('landingViews');
    if (
        event.event === 'career_uncertainty_cta_clicked' ||
        event.event === 'relationship_contact_prompt_clicked' ||
        event.event === 'decision_timing_home_cta_clicked' ||
        event.event === 'decision_timing_prompt_clicked'
    ) {
        stageKeys.push('promptClicks');
    }
    if (event.event === 'decision_question_submit') stageKeys.push('questionSubmits');
    if (event.event === 'analysis_start') stageKeys.push('analysisStarts');
    if (event.canonicalEvent === 'first_result_view') stageKeys.push('firstResultViews');
    if (event.canonicalEvent === 'paywall_view') stageKeys.push('paywallViews');
    if (event.canonicalEvent === 'checkout_start') stageKeys.push('checkoutStarts');
    if (event.canonicalEvent === 'paid_conversion') stageKeys.push('paidConversions');
    if (
        event.event === 'relationship_contact_followup_seeded' ||
        event.event === 'en_relationship_contact_followup_seeded'
    ) {
        stageKeys.push('followupSeeds');
    }
    if (event.canonicalEvent === 'followup_start') stageKeys.push('followupStarts');
    if (event.canonicalEvent === 'daily_return_after_reading') {
        stageKeys.push('dailyReturnsAfterReading');
    }

    return stageKeys;
}

function toRate(numerator: number, denominator: number): number {
    return denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;
}

function getCampaignFunnels(
    campaignEventsBySession: Map<string, CampaignSessionEvent[]>
): CampaignFunnelSummary[] {
    const buckets = new Map(
        CAMPAIGN_FUNNEL_DEFINITIONS.map((definition) => [
            definition.key,
            createCampaignFunnelBucket(definition),
        ])
    );

    for (const sessionEvents of campaignEventsBySession.values()) {
        const sortedEvents = [...sessionEvents].sort(
            (left, right) => left.createdAt.getTime() - right.createdAt.getTime()
        );
        const firstCampaignEvent = sortedEvents
            .map((event) => ({
                event,
                definition: getCampaignDefinitionForSource(event.source),
            }))
            .find((entry) => entry.definition);

        if (!firstCampaignEvent?.definition) {
            continue;
        }

        const bucket = buckets.get(firstCampaignEvent.definition.key);
        if (!bucket) {
            continue;
        }

        const touchedStages = new Set<keyof CampaignFunnelEventCounts>();
        bucket.sessions += 1;

        for (const event of sortedEvents) {
            if (event.createdAt < firstCampaignEvent.event.createdAt) {
                continue;
            }

            bucket.totalEvents += 1;
            bucket.sourceCounter.set(event.source, (bucket.sourceCounter.get(event.source) ?? 0) + 1);

            for (const stageKey of getCampaignStageKeys(event)) {
                bucket.eventCounts[stageKey] += 1;
                touchedStages.add(stageKey);
            }
        }

        for (const stageKey of touchedStages) {
            bucket.uniqueSessionCounts[stageKey] += 1;
        }
    }

    return Array.from(buckets.values()).map((bucket) => {
        const uniqueCounts = bucket.uniqueSessionCounts;
        const landingDenominator = uniqueCounts.landingViews || bucket.sessions;

        return {
            key: bucket.definition.key,
            label: bucket.definition.label,
            description: bucket.definition.description,
            sources: [...bucket.definition.sources],
            sessions: bucket.sessions,
            totalEvents: bucket.totalEvents,
            eventCounts: bucket.eventCounts,
            uniqueSessionCounts: uniqueCounts,
            rates: {
                landingToPromptRate: toRate(uniqueCounts.promptClicks, landingDenominator),
                landingToAnalysisRate: toRate(uniqueCounts.analysisStarts, landingDenominator),
                analysisToResultRate: toRate(uniqueCounts.firstResultViews, uniqueCounts.analysisStarts),
                resultToPaywallRate: toRate(uniqueCounts.paywallViews, uniqueCounts.firstResultViews),
                paywallToCheckoutRate: toRate(uniqueCounts.checkoutStarts, uniqueCounts.paywallViews),
                checkoutToPaidRate: toRate(uniqueCounts.paidConversions, uniqueCounts.checkoutStarts),
                resultToPaidRate: toRate(uniqueCounts.paidConversions, uniqueCounts.firstResultViews),
                resultToFollowupSeedRate: toRate(uniqueCounts.followupSeeds, uniqueCounts.firstResultViews),
            },
            topSources: Array.from(bucket.sourceCounter.entries())
                .sort((left, right) => right[1] - left[1])
                .slice(0, 4)
                .map(([source, count]) => ({ source, count })),
        };
    });
}

export async function getGrowthSummary(days: number): Promise<GrowthSummary> {
    const DAY_IN_MS = 24 * 60 * 60 * 1000;
    const safeDays = Math.max(7, Math.min(90, days));
    const rangeEnd = new Date();
    const rangeStart = startOfUtcDay(new Date(rangeEnd.getTime() - (safeDays - 1) * DAY_IN_MS));
    const trailing7Start = startOfUtcDay(new Date(rangeEnd.getTime() - 6 * DAY_IN_MS));
    const trailing30Start = startOfUtcDay(new Date(rangeEnd.getTime() - 29 * DAY_IN_MS));
    const queryStart = rangeStart < trailing30Start ? rangeStart : trailing30Start;
    const todayKey = toDayKey(rangeEnd);

    const events = await prisma.growthEvent.findMany({
        where: {
            createdAt: {
                gte: queryStart,
            },
        },
        // Growth summary only needs a narrow column set; avoid fetching unused identifiers.
        select: {
            createdAt: true,
            event: true,
            channel: true,
            metadata: true,
            readingId: true,
        },
    }) as GrowthEventSummaryRow[];

    const seriesMap = new Map<string, GrowthSeriesPoint>();
    const sourceCounter = new Map<string, number>();
    const activeUsersByDay = new Map<string, Set<string>>();
    const activeUsersAcrossRange = new Set<string>();
    const dailyActiveDaysBySession = new Map<string, Set<string>>();
    const visitSessionsToday = new Set<string>();
    const visitSessionsLast7Days = new Set<string>();
    const visitSessionsLast30Days = new Set<string>();
    const campaignEventsBySession = new Map<string, CampaignSessionEvent[]>();

    for (let index = 0; index < safeDays; index += 1) {
        const currentDate = new Date(rangeStart.getTime() + index * DAY_IN_MS);
        const dayKey = toDayKey(currentDate);
        seriesMap.set(dayKey, {
            date: dayKey,
            installs: 0,
            activeUsers: 0,
            shares: 0,
            invites: 0,
            inviteConversions: 0,
            firstResultViews: 0,
            followupStarts: 0,
            dailyReturnsAfterReading: 0,
            paidConversions: 0,
        });
        activeUsersByDay.set(dayKey, new Set<string>());
    }

    let installs = 0;
    let shares = 0;
    let invites = 0;
    let inviteConversions = 0;
    let paidConversions = 0;
    let checkoutStarts = 0;
    let paywallViews = 0;
    let landingViews = 0;
    let firstResultViews = 0;
    let followupStarts = 0;
    let dailyReturnsAfterReading = 0;
    const countedPaidConversionKeys = new Set<string>();

    for (const event of events) {
        const dayKey = toDayKey(event.createdAt);
        const series = seriesMap.get(dayKey);
        const metadata = parseGrowthMetadata(event.metadata);
        const runtimeEnvironment = getRuntimeEnvironmentFromRecord(metadata);

        if (!matchesCurrentRuntimeEnvironment(runtimeEnvironment)) {
            continue;
        }

        const canonicalEvent =
            typeof metadata.canonicalEvent === 'string'
                ? metadata.canonicalEvent
                : getCanonicalGrowthEvent(event.event);
        const sessionId = typeof metadata.sessionId === 'string' ? metadata.sessionId : null;

        if (sessionId) {
            if (event.createdAt >= trailing30Start) {
                visitSessionsLast30Days.add(sessionId);
            }

            if (event.createdAt >= trailing7Start) {
                visitSessionsLast7Days.add(sessionId);
            }

            if (dayKey === todayKey) {
                visitSessionsToday.add(sessionId);
            }
        }

        if (event.createdAt < rangeStart) {
            continue;
        }

        const source = getNormalizedGrowthSource(event, metadata);

        sourceCounter.set(source, (sourceCounter.get(source) ?? 0) + 1);

        if (sessionId) {
            activeUsersByDay.get(dayKey)?.add(sessionId);
            activeUsersAcrossRange.add(sessionId);
            const sessionEvents = campaignEventsBySession.get(sessionId) ?? [];
            sessionEvents.push({
                createdAt: event.createdAt,
                event: event.event,
                canonicalEvent,
                sessionId,
                source,
            });
            campaignEventsBySession.set(sessionId, sessionEvents);

            if (canonicalEvent === 'daily_active') {
                const existingDays = dailyActiveDaysBySession.get(sessionId) ?? new Set<string>();
                existingDays.add(dayKey);
                dailyActiveDaysBySession.set(sessionId, existingDays);
            }
        }

        switch (canonicalEvent) {
            case 'install':
                installs += 1;
                if (series) series.installs += 1;
                break;
            case 'share':
                shares += 1;
                if (series) series.shares += 1;
                break;
            case 'first_result_view':
                firstResultViews += 1;
                if (series) series.firstResultViews += 1;
                break;
            case 'followup_start':
                followupStarts += 1;
                if (series) series.followupStarts += 1;
                break;
            case 'daily_return_after_reading':
                dailyReturnsAfterReading += 1;
                if (series) series.dailyReturnsAfterReading += 1;
                break;
            case 'invite':
                invites += 1;
                if (series) series.invites += 1;
                break;
            case 'invite_conversion':
                inviteConversions += 1;
                if (series) series.inviteConversions += 1;
                break;
            case 'paid_conversion':
                if (!isCountablePaidConversionEvent(metadata)) {
                    break;
                }

                {
                    const trackingKey = getPaidConversionTrackingKey({
                        metadata,
                        readingId: event.readingId,
                    });

                    if (trackingKey) {
                        if (countedPaidConversionKeys.has(trackingKey)) {
                            break;
                        }

                        countedPaidConversionKeys.add(trackingKey);
                    }
                }

                paidConversions += 1;
                if (series) series.paidConversions += 1;
                break;
            case 'checkout_start':
                checkoutStarts += 1;
                break;
            case 'paywall_view':
                paywallViews += 1;
                break;
            case 'landing_view':
                landingViews += 1;
                break;
            default:
                break;
        }
    }

    const series = Array.from(seriesMap.values()).map((point) => ({
        ...point,
        activeUsers: activeUsersByDay.get(point.date)?.size ?? 0,
    }));

    const activeUsers = activeUsersAcrossRange.size;

    const returningUsers = Array.from(dailyActiveDaysBySession.values()).filter(
        (daysSet) => daysSet.size >= 2
    ).length;

    const topSources = Array.from(sourceCounter.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 6)
        .map(([source, count]) => ({ source, count }));

    return {
        dateRange: {
            from: rangeStart.toISOString(),
            to: rangeEnd.toISOString(),
            days: safeDays,
        },
        totals: {
            installs,
            activeUsers,
            shares,
            invites,
            inviteConversions,
            paidConversions,
            checkoutStarts,
            paywallViews,
            landingViews,
            returningUsers,
        },
        rates: {
            retentionRate: installs > 0 ? Number(((returningUsers / installs) * 100).toFixed(1)) : 0,
            landingToCheckoutRate: landingViews > 0 ? Number(((checkoutStarts / landingViews) * 100).toFixed(1)) : 0,
            checkoutConversionRate: checkoutStarts > 0 ? Number(((paidConversions / checkoutStarts) * 100).toFixed(1)) : 0,
            viralCoefficientProxy: installs > 0 ? Number((inviteConversions / installs).toFixed(2)) : 0,
        },
        activation: {
            firstResultViews,
            followupStarts,
            dailyReturnsAfterReading,
            resultToFollowupRate: firstResultViews > 0
                ? Number(((followupStarts / firstResultViews) * 100).toFixed(1))
                : 0,
            resultToDailyReturnRate: firstResultViews > 0
                ? Number(((dailyReturnsAfterReading / firstResultViews) * 100).toFixed(1))
                : 0,
            resultToPaidConversionRate: firstResultViews > 0
                ? Number(((paidConversions / firstResultViews) * 100).toFixed(1))
                : 0,
        },
        visits: {
            today: visitSessionsToday.size,
            last7Days: visitSessionsLast7Days.size,
            last30Days: visitSessionsLast30Days.size,
            dauMauRate: visitSessionsLast30Days.size > 0
                ? Number(((visitSessionsToday.size / visitSessionsLast30Days.size) * 100).toFixed(1))
                : 0,
        },
        series,
        topSources,
        campaignFunnels: getCampaignFunnels(campaignEventsBySession),
    };
}
