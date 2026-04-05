import { prisma } from '@/lib/prisma';
import { getCanonicalGrowthEvent, parseGrowthMetadata } from '@/lib/growth-analytics';

interface GrowthSeriesPoint {
    date: string;
    installs: number;
    activeUsers: number;
    shares: number;
    invites: number;
    inviteConversions: number;
    paidConversions: number;
}

interface GrowthSourcePoint {
    source: string;
    count: number;
}

interface GrowthActivationSnapshot {
    firstResultViews: number;
    followupStarts: number;
    dailyReturnsAfterReading: number;
    resultToFollowupRate: number;
    resultToDailyReturnRate: number;
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
    series: GrowthSeriesPoint[];
    topSources: GrowthSourcePoint[];
}

function toDayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function getGrowthSummary(days: number): Promise<GrowthSummary> {
    const safeDays = Math.max(7, Math.min(90, days));
    const rangeEnd = new Date();
    const rangeStart = startOfUtcDay(new Date(rangeEnd.getTime() - (safeDays - 1) * 24 * 60 * 60 * 1000));

    const events = await prisma.growthEvent.findMany({
        where: {
            createdAt: {
                gte: rangeStart,
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    const seriesMap = new Map<string, GrowthSeriesPoint>();
    const sourceCounter = new Map<string, number>();
    const activeUsersByDay = new Map<string, Set<string>>();
    const dailyActiveDaysBySession = new Map<string, Set<string>>();

    for (let index = 0; index < safeDays; index += 1) {
        const currentDate = new Date(rangeStart.getTime() + index * 24 * 60 * 60 * 1000);
        const dayKey = toDayKey(currentDate);
        seriesMap.set(dayKey, {
            date: dayKey,
            installs: 0,
            activeUsers: 0,
            shares: 0,
            invites: 0,
            inviteConversions: 0,
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

    for (const event of events) {
        const dayKey = toDayKey(event.createdAt);
        const series = seriesMap.get(dayKey);
        const metadata = parseGrowthMetadata(event.metadata);
        const canonicalEvent =
            typeof metadata.canonicalEvent === 'string'
                ? metadata.canonicalEvent
                : getCanonicalGrowthEvent(event.event);
        const sessionId = typeof metadata.sessionId === 'string' ? metadata.sessionId : null;
        const source = typeof event.channel === 'string' && event.channel.trim()
            ? event.channel.trim()
            : 'unknown';

        sourceCounter.set(source, (sourceCounter.get(source) ?? 0) + 1);

        if (sessionId) {
            activeUsersByDay.get(dayKey)?.add(sessionId);
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
                break;
            case 'followup_start':
                followupStarts += 1;
                break;
            case 'daily_return_after_reading':
                dailyReturnsAfterReading += 1;
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

    const activeUsers = new Set(
        Array.from(activeUsersByDay.values()).flatMap((sessions) => Array.from(sessions))
    ).size;

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
        },
        series,
        topSources,
    };
}
