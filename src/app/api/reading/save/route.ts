import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { devLog } from '@/lib/dev-logger';
import { sendResultEmail } from '@/lib/email/sender';
import {
    attachReadingAccessKey,
    createReadingAccessKey,
    extractReadingAccessKey,
    hasReadingAccess,
    normalizeReadingMetadata,
    stripPrivateReadingMetadata,
} from '@/lib/reading-access';

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

function stringifyJson(value: unknown): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
}

function stringifyMetadata(metadata: Record<string, unknown>): string | null {
    return Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null;
}

async function canAccessReading(params: {
    id: string;
    accessKey?: string | null;
    sessionUserId?: string | null;
}) {
    const reading = await prisma.readingResult.findUnique({
        where: { id: params.id },
        select: {
            id: true,
            userId: true,
            metadata: true,
            createdAt: true,
            data: true,
        },
    });

    if (!reading) {
        return { reading: null, allowed: false as const };
    }

    const allowed = hasReadingAccess({
        readingUserId: reading.userId,
        sessionUserId: params.sessionUserId,
        storedAccessKey: extractReadingAccessKey(reading.metadata),
        providedAccessKey: params.accessKey,
    });

    return { reading, allowed };
}

export async function POST(request: Request) {
    try {
        if (!process.env.DATABASE_URL) {
            devLog.error('Save API: DATABASE_URL is missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const body = await request.json().catch(() => null);
        if (!body) {
            devLog.error('Save API: Empty or invalid JSON body');
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const { data, metadata, id, accessKey } = body as {
            data?: unknown;
            metadata?: unknown;
            id?: string;
            accessKey?: string;
        };

        if (!data) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        let dataStr: string;
        try {
            dataStr = stringifyJson(data);
        } catch (stringifyError) {
            const message = stringifyError instanceof Error ? stringifyError.message : 'Unknown error';
            devLog.error('Save API: JSON stringify failed:', stringifyError);
            return NextResponse.json(
                { error: 'JSON Serialization Failed', details: message },
                { status: 400 }
            );
        }

        const session = await auth();
        const userId = session?.user?.id ?? null;

        let responseAccessKey: string | null = null;
        let result;

        if (id) {
            const { reading, allowed } = await canAccessReading({
                id,
                accessKey,
                sessionUserId: userId,
            });

            if (!reading) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }

            if (!allowed) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const storedAccessKey = extractReadingAccessKey(reading.metadata);
            responseAccessKey = storedAccessKey;
            const nextMetadataSource =
                metadata === undefined
                    ? normalizeReadingMetadata(reading.metadata)
                    : normalizeReadingMetadata(metadata);
            const nextMetadata = storedAccessKey
                ? attachReadingAccessKey(nextMetadataSource, storedAccessKey)
                : nextMetadataSource;

            result = await prisma.readingResult.update({
                where: { id },
                data: {
                    data: dataStr,
                    metadata: stringifyMetadata(nextMetadata),
                    ...(userId && !reading.userId ? { userId } : {}),
                },
            });
        } else {
            const nextMetadataSource = normalizeReadingMetadata(metadata);
            responseAccessKey = userId ? null : createReadingAccessKey();
            const nextMetadata = responseAccessKey
                ? attachReadingAccessKey(nextMetadataSource, responseAccessKey)
                : nextMetadataSource;

            result = await prisma.readingResult.create({
                data: {
                    data: dataStr,
                    metadata: stringifyMetadata(nextMetadata),
                    userId,
                },
            });
        }

        const savedMeta = normalizeReadingMetadata(result.metadata);
        const savedEmail =
            typeof savedMeta.email === 'string' ? normalizeEmail(savedMeta.email) : null;

        if (
            savedMeta.isPremium === true &&
            savedEmail &&
            savedMeta.emailSent !== true &&
            savedMeta.paymentSource === 'promo'
        ) {
            const redemption = await prisma.promoRedemption.findFirst({
                where: {
                    readingId: result.id,
                    email: savedEmail,
                },
                select: { id: true },
            });

            if (redemption) {
                try {
                    const accessKeyForEmail =
                        responseAccessKey ?? extractReadingAccessKey(result.metadata);

                    await sendResultEmail({
                        email: savedEmail,
                        resultId: result.id,
                        language: savedMeta.language === 'en' ? 'en' : 'ko',
                        title:
                            typeof savedMeta.userContext === 'string'
                                ? savedMeta.userContext
                                : savedMeta.language === 'en'
                                    ? 'Your reading'
                                    : '통합 분석 리포트',
                        birthInfo:
                            typeof savedMeta.birthInfo === 'string'
                                ? savedMeta.birthInfo
                                : undefined,
                        sajuSummary:
                            typeof savedMeta.sajuSummary === 'string'
                                ? savedMeta.sajuSummary
                                : undefined,
                        userContext:
                            typeof savedMeta.userContext === 'string'
                                ? savedMeta.userContext
                                : undefined,
                        accessKey: accessKeyForEmail ?? undefined,
                    });

                    const accessKeyForUpdate = accessKeyForEmail;
                    const emailSentMetadata = accessKeyForUpdate
                        ? attachReadingAccessKey(
                            {
                                ...savedMeta,
                                emailSent: true,
                                emailSentVia: 'promo_redemption',
                            },
                            accessKeyForUpdate
                        )
                        : {
                            ...savedMeta,
                            emailSent: true,
                            emailSentVia: 'promo_redemption',
                        };

                    await prisma.readingResult.update({
                        where: { id: result.id },
                        data: { metadata: stringifyMetadata(emailSentMetadata) },
                    });
                } catch (emailError) {
                    devLog.error('Save API: Email trigger failed:', emailError);
                }
            }
        }

        return NextResponse.json({
            id: result.id,
            success: true,
            ...(responseAccessKey ? { accessKey: responseAccessKey } : {}),
        });
    } catch (error) {
        devLog.error('Save API: Database error:', error);
        const knownError = error as { message?: string; code?: string; meta?: unknown };

        return NextResponse.json(
            {
                error: 'Database Operation Failed',
                details: knownError.message,
                code: knownError.code,
                meta: knownError.meta,
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const accessKey = searchParams.get('accessKey');
        const session = await auth();
        const userId = session?.user?.id ?? null;

        if (id) {
            const { reading: result, allowed } = await canAccessReading({
                id,
                accessKey,
                sessionUserId: userId,
            });

            if (!result) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }

            if (!allowed) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            const parsedMetadata = stripPrivateReadingMetadata(result.metadata);
            const normalizedMetadata = parsedMetadata
                ? {
                    ...parsedMetadata,
                    precisionMetadata:
                        parsedMetadata.precisionMetadata ||
                        parsedMetadata.precision ||
                        null,
                }
                : null;

            return NextResponse.json({
                success: true,
                id: result.id,
                data: JSON.parse(result.data),
                metadata: normalizedMetadata,
                createdAt: result.createdAt,
            });
        }

        const count = await prisma.readingResult.count();
        return NextResponse.json({ status: 'ok', count });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ status: 'error', message }, { status: 500 });
    }
}
