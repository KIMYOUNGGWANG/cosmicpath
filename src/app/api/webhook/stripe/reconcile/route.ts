import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { devLog } from '@/lib/dev-logger';
import { sendOpsAlert } from '@/lib/ops-alert';

interface ReconcileResult {
    ok: boolean;
    scanned: number;
    matched: number;
    updated: number;
    missingMetadata: number;
    errors: number;
}

function getBearerToken(header: string | null): string | null {
    if (!header) return null;
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) return null;
    return token.trim();
}

function parseNumberInRange(value: string | null, fallback: number, min: number, max: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function parseJsonObject(value: string | null | undefined): Record<string, unknown> {
    if (!value) return {};
    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as Record<string, unknown>;
        }
        return {};
    } catch {
        return {};
    }
}

function asString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
}

export async function POST(req: NextRequest) {
    const cronSecret = process.env.CRON_SECRET?.trim();
    const token = getBearerToken(req.headers.get('authorization'));

    if (!cronSecret) {
        await sendOpsAlert({
            source: 'stripe-reconcile',
            severity: 'critical',
            title: 'CRON_SECRET missing',
            message: 'Stripe reconcile route is enabled but CRON_SECRET is not configured.',
        });
        return NextResponse.json({ error: { message: 'Server misconfiguration', code: 500 } }, { status: 500 });
    }

    if (token !== cronSecret) {
        await sendOpsAlert({
            source: 'stripe-reconcile',
            severity: 'warning',
            title: 'Unauthorized reconcile attempt',
            message: 'Rejected reconcile invocation due to invalid bearer token.',
            details: { ip: req.headers.get('x-forwarded-for') ?? 'unknown' },
            dedupeKey: 'stripe-reconcile:unauthorized',
        });
        return NextResponse.json({ error: { message: 'Unauthorized', code: 401 } }, { status: 401 });
    }

    const requestUrl = new URL(req.url);
    const lookbackHours = parseNumberInRange(requestUrl.searchParams.get('hours'), 72, 1, 720);
    const take = parseNumberInRange(requestUrl.searchParams.get('limit'), 100, 1, 1000);
    const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

    const summary: ReconcileResult = {
        ok: true,
        scanned: 0,
        matched: 0,
        updated: 0,
        missingMetadata: 0,
        errors: 0,
    };

    try {
        const payments = await prisma.payment.findMany({
            where: {
                method: 'STRIPE',
                status: 'DONE',
                createdAt: { gte: since },
            },
            orderBy: { createdAt: 'desc' },
            take,
        });

        summary.scanned = payments.length;

        for (const payment of payments) {
            const paymentMeta = parseJsonObject(payment.metadata);
            const productType = asString(paymentMeta.productType);
            const matchSessionId = asString(paymentMeta.matchSessionId);
            let matched = false;

            if (payment.readingId) {
                matched = true;
                summary.matched += 1;

                const reading = await prisma.readingResult.findUnique({
                    where: { id: payment.readingId },
                });

                if (!reading) {
                    summary.errors += 1;
                    devLog.warn(`[Reconcile] Missing reading for payment ${payment.orderId}: ${payment.readingId}`);
                } else {
                    const readingMeta = parseJsonObject(reading.metadata);
                    const isPremium = readingMeta.isPremium === true;

                    if (!isPremium) {
                        await prisma.readingResult.update({
                            where: { id: reading.id },
                            data: {
                                metadata: JSON.stringify({
                                    ...readingMeta,
                                    isPremium: true,
                                    paymentReconciledAt: new Date().toISOString(),
                                    paymentSource: 'stripe_reconcile',
                                }),
                            },
                        });
                        summary.updated += 1;
                    }
                }
            }

            if (productType === 'match' && matchSessionId) {
                matched = true;
                summary.matched += 1;

                const matchSession = await prisma.matchSession.findUnique({
                    where: { id: matchSessionId },
                });

                if (!matchSession) {
                    summary.errors += 1;
                    devLog.warn(`[Reconcile] Missing match session for payment ${payment.orderId}: ${matchSessionId}`);
                } else if (!matchSession.isUnlocked) {
                    await prisma.matchSession.update({
                        where: { id: matchSessionId },
                        data: {
                            isUnlocked: true,
                            unlockedAt: new Date(),
                            paymentId: payment.orderId,
                        },
                    });
                    summary.updated += 1;
                }
            }

            if (!matched) {
                summary.missingMetadata += 1;
            }
        }

        if (summary.errors > 0 || summary.missingMetadata > 0) {
            await sendOpsAlert({
                source: 'stripe-reconcile',
                severity: summary.errors > 0 ? 'critical' : 'warning',
                title: 'Reconcile completed with issues',
                message: 'Stripe reconcile finished, but at least one inconsistency was detected.',
                details: summary as unknown as Record<string, unknown>,
                dedupeKey: 'stripe-reconcile:issues',
            });
        }

        summary.ok = summary.errors === 0;
        return NextResponse.json(summary);
    } catch (error) {
        summary.ok = false;
        summary.errors += 1;

        const message = error instanceof Error ? error.message : String(error);
        await sendOpsAlert({
            source: 'stripe-reconcile',
            severity: 'critical',
            title: 'Reconcile execution failed',
            message: 'Stripe reconcile route failed with an unhandled error.',
            details: {
                ...summary,
                error: message.slice(0, 300),
            },
            dedupeKey: 'stripe-reconcile:runtime-failure',
        });

        return NextResponse.json(
            { error: { message: 'Reconcile failed', code: 500 }, ...summary },
            { status: 500 }
        );
    }
}
