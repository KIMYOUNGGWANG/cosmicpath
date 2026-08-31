import { prisma } from '@/lib/prisma';
import { getGrowthSummary } from '@/lib/growth-metrics';
import {
    getCanonicalGrowthEvent,
    isCountablePaidConversionEvent,
    parseGrowthMetadata,
} from '@/lib/growth-analytics';
import { extractReadingAccessKey, normalizeReadingMetadata } from '@/lib/reading-access';
import { getOracleIntentLabel } from '@/lib/ai/oracle-personas';
import { getRuntimeEnvironmentFromRecord, matchesCurrentRuntimeEnvironment } from '@/lib/runtime-environment';

type JsonRecord = Record<string, unknown>;

interface DateRange {
    from: string;
    to: string;
    days: number;
}

interface CountPoint {
    label: string;
    count: number;
}

interface ReadingSnapshot {
    id: string;
    createdAt: string;
    ownerType: 'account' | 'anonymous';
    ownerLabel: string;
    userEmail: string | null;
    hasAccessKey: boolean;
    isPremium: boolean;
    monetizationType: 'standard_paid' | 'promo_discount' | 'promo_free' | 'none';
    paymentSource: string | null;
    questionIntent: string;
    advisorName: string;
    selectionMode: 'auto' | 'manual';
    credits: number | null;
    supportRiskFlags: string[];
}

export interface PaymentOpsSeriesPoint {
    date: string;
    revenueCents: number;
    completedPayments: number;
    standardPayments: number;
    premiumReadingPayments: number;
    chatCreditPayments: number;
    promoPayments: number;
}

export interface PaymentOpsSummary {
    dateRange: DateRange;
    totals: {
        grossRevenueCents: number;
        averageOrderValueCents: number;
        completedPayments: number;
        standardPayments: number;
        premiumReadingPayments: number;
        chatCreditPayments: number;
        promoPayments: number;
        unresolvedPremiumReadings: number;
    };
    subscriptions: {
        activePro: number;
        activeCouple: number;
        expiringSoon: number;
    };
    funnel: {
        checkoutStarts: number;
        paidConversions: number;
        checkoutConversionRate: number;
    };
    series: PaymentOpsSeriesPoint[];
    statusMix: CountPoint[];
    productMix: CountPoint[];
    recentPayments: Array<{
        orderId: string;
        createdAt: string;
        amountCents: number;
        status: string;
        type: string;
        customerEmail: string | null;
        readingId: string | null;
        discountPercent: number | null;
        paymentSource: string | null;
    }>;
}

export interface ReadingSupportSeriesPoint {
    date: string;
    readings: number;
    anonymousReadings: number;
    premiumReadings: number;
    chatReadyReadings: number;
    supportRiskReadings: number;
}

export interface ReadingSupportSummary {
    dateRange: DateRange;
    totals: {
        readings: number;
        anonymousReadings: number;
        premiumReadings: number;
        chatReadyReadings: number;
        supportRiskReadings: number;
        missingAccessKeys: number;
        premiumWithoutPaymentRecord: number;
    };
    series: ReadingSupportSeriesPoint[];
    recentReadings: ReadingSnapshot[];
    searchQuery: string | null;
    searchResults: ReadingSnapshot[];
}

export interface TrustOpsSeriesPoint {
    date: string;
    alerts: number;
    criticalAlerts: number;
    failedJobs: number;
    pendingJobs: number;
    sentJobs: number;
}

export interface TrustOpsSummary {
    dateRange: DateRange;
    totals: {
        openAlerts: number;
        criticalOpenAlerts: number;
        duePendingJobs: number;
        failedJobs: number;
        sentJobs: number;
        failedJobRate: number;
    };
    series: TrustOpsSeriesPoint[];
    alertsBySource: CountPoint[];
    jobsByStage: CountPoint[];
    openAlerts: Array<{
        id: string;
        source: string;
        severity: string;
        status: string;
        title: string;
        message: string;
        lastSeenAt: string;
        occurrenceCount: number;
    }>;
    failedJobs: Array<{
        id: string;
        readingId: string;
        stage: string;
        status: string;
        scheduledFor: string;
        attempts: number;
        lastError: string | null;
    }>;
}

export interface AdvisorOpsSeriesPoint {
    date: string;
    readings: number;
    manualSelections: number;
    followups: number;
    paidReadings: number;
}

export interface AdvisorBreakdownRow {
    key: string;
    label: string;
    readings: number;
    manualSelections: number;
    followups: number;
    dailyReturns: number;
    paidReadings: number;
    followupRate: number;
    paidRate: number;
    manualShare: number;
}

export interface AdvisorOpsSummary {
    dateRange: DateRange;
    totals: {
        readings: number;
        manualSelections: number;
        autoSelections: number;
        followupReadings: number;
        dailyReturnReadings: number;
        paidReadings: number;
    };
    series: AdvisorOpsSeriesPoint[];
    intentRows: AdvisorBreakdownRow[];
    advisorRows: AdvisorBreakdownRow[];
}

function asRecord(value: unknown): JsonRecord | null {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as JsonRecord
        : null;
}

function parseJsonRecord(raw: string | null | undefined): JsonRecord {
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw);
        return asRecord(parsed) ?? {};
    } catch {
        return {};
    }
}

function getString(record: JsonRecord | null, key: string): string | null {
    const value = record?.[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getBoolean(record: JsonRecord | null, key: string): boolean {
    return record?.[key] === true;
}

function getNumber(record: JsonRecord | null, key: string): number | null {
    const value = record?.[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function isRecordVisibleInCurrentRuntime(record: JsonRecord | null | undefined): boolean {
    return matchesCurrentRuntimeEnvironment(getRuntimeEnvironmentFromRecord(record));
}

function toDayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildDateWindow(days: number) {
    const safeDays = Math.max(7, Math.min(90, days));
    const rangeEnd = new Date();
    const rangeStart = startOfUtcDay(new Date(rangeEnd.getTime() - (safeDays - 1) * 24 * 60 * 60 * 1000));

    return {
        safeDays,
        rangeStart,
        rangeEnd,
        dateRange: {
            from: rangeStart.toISOString(),
            to: rangeEnd.toISOString(),
            days: safeDays,
        },
    };
}

function createDaySeriesMap<T extends { date: string }>(
    rangeStart: Date,
    days: number,
    factory: (date: string) => T
) {
    const dayMap = new Map<string, T>();

    for (let index = 0; index < days; index += 1) {
        const currentDate = new Date(rangeStart.getTime() + index * 24 * 60 * 60 * 1000);
        const dayKey = toDayKey(currentDate);
        dayMap.set(dayKey, factory(dayKey));
    }

    return dayMap;
}

function sortCounts(input: Map<string, number>, take = 6): CountPoint[] {
    return Array.from(input.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, take)
        .map(([label, count]) => ({ label, count }));
}

function formatIntentLabel(intent: string) {
    const supportedIntents = ['general', 'compatibility', 'reunion', 'wealth', 'timing', 'career', 'business'];
    if (supportedIntents.includes(intent)) {
        return getOracleIntentLabel(intent as Parameters<typeof getOracleIntentLabel>[0], 'ko');
    }
    return intent;
}

function normalizeSelectionMode(value: string | null): 'auto' | 'manual' {
    return value === 'manual' ? 'manual' : 'auto';
}

function resolvePaymentType(metadata: JsonRecord, readingId: string | null): string {
    const explicitType = getString(metadata, 'type') ?? getString(metadata, 'productType');

    if (explicitType === 'premium_reading' || explicitType === 'chat_credit' || explicitType === 'match') {
        return explicitType;
    }

    if (getString(metadata, 'matchSessionId')) {
        return 'match';
    }

    if (readingId) {
        return 'premium_reading';
    }

    return explicitType ?? 'unknown';
}

function buildReadingSnapshot(
    reading: {
        id: string;
        createdAt: Date;
        userId: string | null;
        metadata: string | null;
        user: { email: string | null } | null;
        chatSession: { credits: number } | null;
    },
    paymentInfo: { hasPaymentRecord: boolean; discountPercent?: number | null } | boolean
): ReadingSnapshot {
    const metadata = normalizeReadingMetadata(reading.metadata);
    const advisorProfile = asRecord(metadata.advisorProfile);
    const paymentSource = getString(metadata, 'paymentSource');
    const questionIntent = getString(metadata, 'questionIntent') ?? 'general';
    const selectionMode = normalizeSelectionMode(getString(metadata, 'selectionMode'));
    const isPremium = getBoolean(metadata, 'isPremium');
    const hasAccessKey = Boolean(extractReadingAccessKey(reading.metadata));
    const hasPaymentRecord = typeof paymentInfo === 'boolean' ? paymentInfo : paymentInfo.hasPaymentRecord;
    const discountPercent = typeof paymentInfo === 'object' ? paymentInfo.discountPercent : undefined;
    const hasMonetizationProof = hasPaymentRecord || paymentSource === 'promo_redemption' || paymentSource === 'override';

    let monetizationType: 'standard_paid' | 'promo_discount' | 'promo_free' | 'none' = 'none';
    if (isPremium) {
        if (paymentSource === 'promo_redemption') {
            monetizationType = 'promo_free';
        } else if (hasPaymentRecord) {
            if ((discountPercent ?? 0) > 0) {
                monetizationType = 'promo_discount';
            } else {
                monetizationType = 'standard_paid';
            }
        } else {
            monetizationType = 'standard_paid';
        }
    }

    const supportRiskFlags: string[] = [];

    if (!reading.userId && !hasAccessKey) {
        supportRiskFlags.push('anonymous without access key');
    }

    if (isPremium && !hasMonetizationProof) {
        supportRiskFlags.push('premium without payment proof');
    }

    if (isPremium && !paymentSource && !hasPaymentRecord) {
        supportRiskFlags.push('premium without source trace');
    }

    return {
        id: reading.id,
        createdAt: reading.createdAt.toISOString(),
        ownerType: reading.userId ? 'account' : 'anonymous',
        ownerLabel: reading.userId ? '계정 연결' : '익명 리딩',
        userEmail: reading.user?.email ?? getString(metadata, 'email'),
        hasAccessKey,
        isPremium,
        monetizationType,
        paymentSource,
        questionIntent,
        advisorName: getString(advisorProfile, 'name') ?? getString(metadata, 'characterId') ?? 'Unknown',
        selectionMode,
        credits: reading.chatSession?.credits ?? null,
        supportRiskFlags,
    };
}

function createAdvisorAccumulator(key: string, label: string): AdvisorBreakdownRow {
    return {
        key,
        label,
        readings: 0,
        manualSelections: 0,
        followups: 0,
        dailyReturns: 0,
        paidReadings: 0,
        followupRate: 0,
        paidRate: 0,
        manualShare: 0,
    };
}

function finalizeAdvisorRows(rows: Iterable<AdvisorBreakdownRow>, take = 7) {
    return Array.from(rows)
        .map((row) => ({
            ...row,
            followupRate: row.readings > 0 ? Number(((row.followups / row.readings) * 100).toFixed(1)) : 0,
            paidRate: row.readings > 0 ? Number(((row.paidReadings / row.readings) * 100).toFixed(1)) : 0,
            manualShare: row.readings > 0 ? Number(((row.manualSelections / row.readings) * 100).toFixed(1)) : 0,
        }))
        .sort((left, right) => right.readings - left.readings)
        .slice(0, take);
}

export async function getPaymentOpsSummary(days: number): Promise<PaymentOpsSummary> {
    const { safeDays, rangeStart, dateRange } = buildDateWindow(days);

    const [payments, activePro, activeCouple, expiringSoon, growthSummary] = await Promise.all([
        prisma.payment.findMany({
            where: {
                createdAt: { gte: rangeStart },
            },
            select: {
                orderId: true,
                amount: true,
                status: true,
                currency: true,
                customerEmail: true,
                readingId: true,
                metadata: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({
            where: {
                subscriptionStatus: 'pro',
                OR: [
                    { subscriptionExpiresAt: null },
                    { subscriptionExpiresAt: { gte: new Date() } },
                ],
            },
        }),
        prisma.user.count({
            where: {
                subscriptionStatus: 'couple',
                OR: [
                    { subscriptionExpiresAt: null },
                    { subscriptionExpiresAt: { gte: new Date() } },
                ],
            },
        }),
        prisma.user.count({
            where: {
                subscriptionStatus: { in: ['pro', 'couple'] },
                subscriptionExpiresAt: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            },
        }),
        getGrowthSummary(safeDays),
    ]);

    const premiumReadingIds = Array.from(new Set(
        payments
            .filter((payment) => payment.readingId)
            .filter((payment) => resolvePaymentType(parseJsonRecord(payment.metadata), payment.readingId) === 'premium_reading')
            .map((payment) => payment.readingId as string)
    ));

    const relatedReadings = premiumReadingIds.length > 0
        ? await prisma.readingResult.findMany({
            where: { id: { in: premiumReadingIds } },
            select: { id: true, metadata: true },
        })
        : [];

    const readingMap = new Map(relatedReadings.map((reading) => [reading.id, normalizeReadingMetadata(reading.metadata)]));
    const seriesMap = createDaySeriesMap(rangeStart, safeDays, (date) => ({
        date,
        revenueCents: 0,
        completedPayments: 0,
        standardPayments: 0,
        premiumReadingPayments: 0,
        chatCreditPayments: 0,
        promoPayments: 0,
    }));
    const statusCounter = new Map<string, number>();
    const productCounter = new Map<string, number>();

    let grossRevenueCents = 0;
    let completedPayments = 0;
    let standardPayments = 0;
    let premiumReadingPayments = 0;
    let chatCreditPayments = 0;
    let promoPayments = 0;
    let unresolvedPremiumReadings = 0;
    const visiblePayments = payments.filter((payment) => isRecordVisibleInCurrentRuntime(parseJsonRecord(payment.metadata)));

    for (const payment of visiblePayments) {
        const metadata = parseJsonRecord(payment.metadata);
        const productType = resolvePaymentType(metadata, payment.readingId);
        const dayKey = toDayKey(payment.createdAt);
        const point = seriesMap.get(dayKey);
        const isCompleted = payment.status === 'DONE';
        const hasPromo = Boolean(getString(metadata, 'promoCodeId')) || (getNumber(metadata, 'discount') ?? 0) > 0;

        statusCounter.set(payment.status, (statusCounter.get(payment.status) ?? 0) + 1);
        productCounter.set(productType, (productCounter.get(productType) ?? 0) + 1);

        if (!isCompleted) {
            continue;
        }

        grossRevenueCents += payment.amount;
        completedPayments += 1;

        if (hasPromo) {
            promoPayments += 1;
            if (point) {
                point.promoPayments += 1;
            }
        } else {
            standardPayments += 1;
            if (point) {
                point.standardPayments += 1;
            }
        }

        if (point) {
            point.revenueCents += payment.amount;
            point.completedPayments += 1;
        }

        if (productType === 'premium_reading') {
            premiumReadingPayments += 1;
            if (point) {
                point.premiumReadingPayments += 1;
            }

            if (payment.readingId) {
                const readingMetadata = readingMap.get(payment.readingId);
                if (!readingMetadata || readingMetadata.isPremium !== true) {
                    unresolvedPremiumReadings += 1;
                }
            }
        }

        if (productType === 'chat_credit') {
            chatCreditPayments += 1;
            if (point) {
                point.chatCreditPayments += 1;
            }
        }
    }

    return {
        dateRange,
        totals: {
            grossRevenueCents,
            averageOrderValueCents: completedPayments > 0 ? Math.round(grossRevenueCents / completedPayments) : 0,
            completedPayments,
            standardPayments,
            premiumReadingPayments,
            chatCreditPayments,
            promoPayments,
            unresolvedPremiumReadings,
        },
        subscriptions: {
            activePro,
            activeCouple,
            expiringSoon,
        },
        funnel: {
            checkoutStarts: growthSummary.totals.checkoutStarts,
            paidConversions: growthSummary.totals.paidConversions,
            checkoutConversionRate: growthSummary.rates.checkoutConversionRate,
        },
        series: Array.from(seriesMap.values()),
        statusMix: sortCounts(statusCounter),
        productMix: sortCounts(productCounter),
        recentPayments: visiblePayments.slice(0, 12).map((payment) => {
            const metadata = parseJsonRecord(payment.metadata);
            return {
                orderId: payment.orderId,
                createdAt: payment.createdAt.toISOString(),
                amountCents: payment.amount,
                status: payment.status,
                type: resolvePaymentType(metadata, payment.readingId),
                customerEmail: payment.customerEmail,
                readingId: payment.readingId,
                discountPercent: getNumber(metadata, 'discount'),
                paymentSource: getString(metadata, 'paymentSource'),
            };
        }),
    };
}

export async function getReadingSupportSummary(days: number, query?: string | null): Promise<ReadingSupportSummary> {
    const { safeDays, rangeStart, dateRange } = buildDateWindow(days);
    const searchQuery = query?.trim() ? query.trim() : null;

    const readings = await prisma.readingResult.findMany({
        where: {
            createdAt: { gte: rangeStart },
        },
        select: {
            id: true,
            createdAt: true,
            userId: true,
            metadata: true,
            user: {
                select: {
                    email: true,
                },
            },
            chatSession: {
                select: {
                    credits: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    const searchResultsRaw = searchQuery
        ? await prisma.readingResult.findMany({
            where: {
                OR: [
                    { id: { contains: searchQuery, mode: 'insensitive' } },
                    { userId: { contains: searchQuery, mode: 'insensitive' } },
                    { metadata: { contains: searchQuery, mode: 'insensitive' } },
                    { user: { is: { email: { contains: searchQuery, mode: 'insensitive' } } } },
                ],
            },
            select: {
                id: true,
                createdAt: true,
                userId: true,
                metadata: true,
                user: {
                    select: {
                        email: true,
                    },
                },
                chatSession: {
                    select: {
                        credits: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        })
        : [];

    const visibleReadings = readings.filter((reading) => isRecordVisibleInCurrentRuntime(normalizeReadingMetadata(reading.metadata)));
    const visibleSearchResults = searchResultsRaw.filter((reading) => isRecordVisibleInCurrentRuntime(normalizeReadingMetadata(reading.metadata)));
    const visibleScopedReadingIds = Array.from(new Set([
        ...visibleReadings.map((reading) => reading.id),
        ...visibleSearchResults.map((reading) => reading.id),
    ]));

    const paymentRows = visibleScopedReadingIds.length > 0
        ? await prisma.payment.findMany({
            where: {
                readingId: { in: visibleScopedReadingIds },
                status: 'DONE',
            },
            select: {
                readingId: true,
                metadata: true,
            },
        })
        : [];

    const paidReadingMap = new Map<string, { hasPaymentRecord: boolean; discountPercent?: number | null }>();
    for (const payment of paymentRows) {
        if (!payment.readingId) continue;
        const meta = parseJsonRecord(payment.metadata);
        const discountPercent = getNumber(meta, 'discount');
        paidReadingMap.set(payment.readingId, {
            hasPaymentRecord: true,
            discountPercent,
        });
    }

    const seriesMap = createDaySeriesMap(rangeStart, safeDays, (date) => ({
        date,
        readings: 0,
        anonymousReadings: 0,
        premiumReadings: 0,
        chatReadyReadings: 0,
        supportRiskReadings: 0,
    }));

    let anonymousReadings = 0;
    let premiumReadings = 0;
    let chatReadyReadings = 0;
    let supportRiskReadings = 0;
    let missingAccessKeys = 0;
    let premiumWithoutPaymentRecord = 0;

    const recentReadings = visibleReadings.slice(0, 12).map((reading) =>
        buildReadingSnapshot(reading, paidReadingMap.get(reading.id) ?? false)
    );
    const searchResults = visibleSearchResults.map((reading) =>
        buildReadingSnapshot(reading, paidReadingMap.get(reading.id) ?? false)
    );

    for (const reading of visibleReadings) {
        const snapshot = buildReadingSnapshot(reading, paidReadingMap.get(reading.id) ?? false);
        const dayKey = toDayKey(reading.createdAt);
        const point = seriesMap.get(dayKey);

        if (point) {
            point.readings += 1;
        }

        if (snapshot.ownerType === 'anonymous') {
            anonymousReadings += 1;
            if (point) {
                point.anonymousReadings += 1;
            }
        }

        if (snapshot.isPremium) {
            premiumReadings += 1;
            if (point) {
                point.premiumReadings += 1;
            }
        }

        if (reading.chatSession) {
            chatReadyReadings += 1;
            if (point) {
                point.chatReadyReadings += 1;
            }
        }

        if (!snapshot.hasAccessKey && snapshot.ownerType === 'anonymous') {
            missingAccessKeys += 1;
        }

        if (snapshot.supportRiskFlags.includes('premium without payment proof')) {
            premiumWithoutPaymentRecord += 1;
        }

        if (snapshot.supportRiskFlags.length > 0) {
            supportRiskReadings += 1;
            if (point) {
                point.supportRiskReadings += 1;
            }
        }
    }

    return {
        dateRange,
        totals: {
            readings: visibleReadings.length,
            anonymousReadings,
            premiumReadings,
            chatReadyReadings,
            supportRiskReadings,
            missingAccessKeys,
            premiumWithoutPaymentRecord,
        },
        series: Array.from(seriesMap.values()),
        recentReadings,
        searchQuery,
        searchResults,
    };
}

export async function getTrustOpsSummary(days: number): Promise<TrustOpsSummary> {
    const { safeDays, rangeStart, dateRange } = buildDateWindow(days);
    const now = new Date();

    const [alerts, jobs] = await Promise.all([
        prisma.opsAlert.findMany({
            where: {
                OR: [
                    { lastSeenAt: { gte: rangeStart } },
                    { status: 'OPEN' },
                ],
            },
            select: {
                id: true,
                source: true,
                severity: true,
                status: true,
                title: true,
                message: true,
                details: true,
                lastSeenAt: true,
                occurrenceCount: true,
            },
            orderBy: { lastSeenAt: 'desc' },
        }),
        prisma.followUpJob.findMany({
            where: {
                OR: [
                    { scheduledFor: { gte: rangeStart } },
                    { status: { in: ['PENDING', 'FAILED'] } },
                ],
            },
            select: {
                id: true,
                readingId: true,
                stage: true,
                status: true,
                scheduledFor: true,
                attempts: true,
                lastError: true,
                metadata: true,
            },
            orderBy: { scheduledFor: 'desc' },
        }),
    ]);

    const visibleAlerts = alerts.filter((alert) => isRecordVisibleInCurrentRuntime(parseJsonRecord(alert.details)));
    const visibleJobs = jobs.filter((job) => isRecordVisibleInCurrentRuntime(parseJsonRecord(job.metadata)));

    const seriesMap = createDaySeriesMap(rangeStart, safeDays, (date) => ({
        date,
        alerts: 0,
        criticalAlerts: 0,
        failedJobs: 0,
        pendingJobs: 0,
        sentJobs: 0,
    }));
    const sourceCounter = new Map<string, number>();
    const stageCounter = new Map<string, number>();

    const openAlerts = visibleAlerts.filter((alert) => alert.status === 'OPEN');
    const criticalOpenAlerts = openAlerts.filter((alert) => alert.severity === 'critical').length;

    for (const alert of visibleAlerts) {
        sourceCounter.set(alert.source, (sourceCounter.get(alert.source) ?? 0) + 1);

        if (alert.lastSeenAt < rangeStart) {
            continue;
        }

        const point = seriesMap.get(toDayKey(alert.lastSeenAt));
        if (!point) continue;

        point.alerts += 1;
        if (alert.severity === 'critical') {
            point.criticalAlerts += 1;
        }
    }

    let failedJobs = 0;
    let sentJobs = 0;
    let duePendingJobs = 0;

    for (const job of visibleJobs) {
        stageCounter.set(job.stage, (stageCounter.get(job.stage) ?? 0) + 1);

        if (job.status === 'FAILED') {
            failedJobs += 1;
        }

        if (job.status === 'SENT') {
            sentJobs += 1;
        }

        if (job.status === 'PENDING' && job.scheduledFor <= now) {
            duePendingJobs += 1;
        }

        if (job.scheduledFor < rangeStart) {
            continue;
        }

        const point = seriesMap.get(toDayKey(job.scheduledFor));
        if (!point) continue;

        if (job.status === 'FAILED') {
            point.failedJobs += 1;
        }
        if (job.status === 'PENDING') {
            point.pendingJobs += 1;
        }
        if (job.status === 'SENT') {
            point.sentJobs += 1;
        }
    }

    const deliveryBase = failedJobs + sentJobs;

    return {
        dateRange,
        totals: {
            openAlerts: openAlerts.length,
            criticalOpenAlerts,
            duePendingJobs,
            failedJobs,
            sentJobs,
            failedJobRate: deliveryBase > 0 ? Number(((failedJobs / deliveryBase) * 100).toFixed(1)) : 0,
        },
        series: Array.from(seriesMap.values()),
        alertsBySource: sortCounts(sourceCounter),
        jobsByStage: sortCounts(stageCounter),
        openAlerts: openAlerts.slice(0, 10).map((alert) => ({
            id: alert.id,
            source: alert.source,
            severity: alert.severity,
            status: alert.status,
            title: alert.title,
            message: alert.message,
            lastSeenAt: alert.lastSeenAt.toISOString(),
            occurrenceCount: alert.occurrenceCount,
        })),
        failedJobs: visibleJobs
            .filter((job) => job.status === 'FAILED')
            .slice(0, 10)
            .map((job) => ({
                id: job.id,
                readingId: job.readingId,
                stage: job.stage,
                status: job.status,
                scheduledFor: job.scheduledFor.toISOString(),
                attempts: job.attempts,
                lastError: job.lastError,
            })),
    };
}

export async function getAdvisorOpsSummary(days: number): Promise<AdvisorOpsSummary> {
    const { safeDays, rangeStart, dateRange } = buildDateWindow(days);

    const [readings, events] = await Promise.all([
        prisma.readingResult.findMany({
            where: {
                createdAt: { gte: rangeStart },
            },
            select: {
                id: true,
                createdAt: true,
                metadata: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.growthEvent.findMany({
            where: {
                createdAt: { gte: rangeStart },
                readingId: { not: null },
            },
            select: {
                readingId: true,
                event: true,
                metadata: true,
            },
        }),
    ]);

    const visibleReadings = readings.filter((reading) => isRecordVisibleInCurrentRuntime(normalizeReadingMetadata(reading.metadata)));
    const visibleEvents = events.filter((event) => isRecordVisibleInCurrentRuntime(parseGrowthMetadata(event.metadata)));

    const eventMap = new Map<string, { followup: boolean; dailyReturn: boolean; paid: boolean }>();

    for (const event of visibleEvents) {
        if (!event.readingId) continue;

        const metadata = parseGrowthMetadata(event.metadata);
        const canonicalEvent =
            typeof metadata.canonicalEvent === 'string'
                ? metadata.canonicalEvent
                : getCanonicalGrowthEvent(event.event);
        const aggregate = eventMap.get(event.readingId) ?? { followup: false, dailyReturn: false, paid: false };

        if (canonicalEvent === 'followup_start') {
            aggregate.followup = true;
        }
        if (canonicalEvent === 'daily_return_after_reading') {
            aggregate.dailyReturn = true;
        }
        if (canonicalEvent === 'paid_conversion' && isCountablePaidConversionEvent(metadata)) {
            aggregate.paid = true;
        }

        eventMap.set(event.readingId, aggregate);
    }

    const seriesMap = createDaySeriesMap(rangeStart, safeDays, (date) => ({
        date,
        readings: 0,
        manualSelections: 0,
        followups: 0,
        paidReadings: 0,
    }));
    const intentMap = new Map<string, AdvisorBreakdownRow>();
    const advisorMap = new Map<string, AdvisorBreakdownRow>();

    let manualSelections = 0;
    let followupReadings = 0;
    let dailyReturnReadings = 0;
    let paidReadings = 0;

    for (const reading of visibleReadings) {
        const metadata = normalizeReadingMetadata(reading.metadata);
        const advisorProfile = asRecord(metadata.advisorProfile);
        const intent = getString(metadata, 'questionIntent') ?? 'general';
        const selectionMode = normalizeSelectionMode(getString(metadata, 'selectionMode'));
        const advisorId = getString(advisorProfile, 'id') ?? getString(metadata, 'characterId') ?? 'unknown_advisor';
        const advisorName = getString(advisorProfile, 'name') ?? advisorId;
        const signals = eventMap.get(reading.id) ?? { followup: false, dailyReturn: false, paid: false };
        const isPaid = getBoolean(metadata, 'isPremium') || signals.paid;
        const dayKey = toDayKey(reading.createdAt);
        const point = seriesMap.get(dayKey);

        const intentRow = intentMap.get(intent) ?? createAdvisorAccumulator(intent, formatIntentLabel(intent));
        const advisorRow = advisorMap.get(advisorId) ?? createAdvisorAccumulator(advisorId, advisorName);

        intentRow.readings += 1;
        advisorRow.readings += 1;

        if (point) {
            point.readings += 1;
        }

        if (selectionMode === 'manual') {
            manualSelections += 1;
            intentRow.manualSelections += 1;
            advisorRow.manualSelections += 1;
            if (point) {
                point.manualSelections += 1;
            }
        }

        if (signals.followup) {
            followupReadings += 1;
            intentRow.followups += 1;
            advisorRow.followups += 1;
            if (point) {
                point.followups += 1;
            }
        }

        if (signals.dailyReturn) {
            dailyReturnReadings += 1;
            intentRow.dailyReturns += 1;
            advisorRow.dailyReturns += 1;
        }

        if (isPaid) {
            paidReadings += 1;
            intentRow.paidReadings += 1;
            advisorRow.paidReadings += 1;
            if (point) {
                point.paidReadings += 1;
            }
        }

        intentMap.set(intent, intentRow);
        advisorMap.set(advisorId, advisorRow);
    }

    return {
        dateRange,
        totals: {
            readings: visibleReadings.length,
            manualSelections,
            autoSelections: Math.max(visibleReadings.length - manualSelections, 0),
            followupReadings,
            dailyReturnReadings,
            paidReadings,
        },
        series: Array.from(seriesMap.values()),
        intentRows: finalizeAdvisorRows(intentMap.values(), 7),
        advisorRows: finalizeAdvisorRows(advisorMap.values(), 7),
    };
}
