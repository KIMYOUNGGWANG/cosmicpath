import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDatabaseConnectivityError, isDatabaseReachable } from "@/lib/prisma-errors";
import { z } from "zod";
import { extractReadingAccessKey, hasReadingAccess } from "@/lib/reading-access";

const ReadingLinkSchema = z.object({
    id: z.string(),
    accessKey: z.string().optional(),
});

const LinkGuestDataSchema = z.object({
    readingIds: z.array(z.string()).optional(),
    readingLinks: z.array(ReadingLinkSchema).optional(),
    linkByEmail: z.boolean().optional(),
});

type ReadingLinkInput = z.infer<typeof ReadingLinkSchema>;

const AUTH_SESSION_COOKIE_PREFIXES = [
    'authjs.session-token',
    '__Secure-authjs.session-token',
] as const;

function hasAuthSessionCookie(req: NextRequest): boolean {
    return req.cookies.getAll().some((cookie) =>
        AUTH_SESSION_COOKIE_PREFIXES.some((prefix) => cookie.name === prefix || cookie.name.startsWith(`${prefix}.`))
    );
}

function serviceUnavailableResponse(message: string, details: string) {
    return NextResponse.json(
        {
            error: {
                code: 503,
                message,
                details,
            },
        },
        { status: 503 }
    );
}

export async function POST(req: NextRequest) {
    let session = null;

    try {
        session = await auth();
    } catch (error) {
        console.error("Failed to resolve session for user link:", error);
        if (isDatabaseConnectivityError(error)) {
            return serviceUnavailableResponse(
                "인증 저장소에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
                "AUTH_SESSION_STORE_UNAVAILABLE"
            );
        }

        return NextResponse.json({ error: "Failed to resolve session" }, { status: 500 });
    }

    if (!session || !session.user) {
        if (hasAuthSessionCookie(req)) {
            try {
                const databaseReachable = await isDatabaseReachable();
                if (!databaseReachable) {
                    return serviceUnavailableResponse(
                        "인증 저장소에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
                        "AUTH_SESSION_STORE_UNAVAILABLE"
                    );
                }
            } catch (error) {
                console.error("Failed to verify database reachability for user link:", error);
                if (isDatabaseConnectivityError(error)) {
                    return serviceUnavailableResponse(
                        "인증 저장소에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
                        "AUTH_SESSION_STORE_UNAVAILABLE"
                    );
                }
            }
        }

        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { readingIds, readingLinks, linkByEmail } = LinkGuestDataSchema.parse(body);

        let linkedCount = 0;
        const explicitLinks: ReadingLinkInput[] = [
            ...(readingLinks ?? []),
            ...((readingIds ?? []).map((id) => ({ id }))),
        ];

        for (const link of explicitLinks) {
            const reading = await prisma.readingResult.findUnique({
                where: { id: link.id },
                select: {
                    id: true,
                    userId: true,
                    metadata: true,
                },
            });

            if (!reading || reading.userId) {
                continue;
            }

            const canLink = hasReadingAccess({
                readingUserId: reading.userId,
                sessionUserId: session.user.id,
                storedAccessKey: extractReadingAccessKey(reading.metadata),
                providedAccessKey: link.accessKey,
            });

            if (!canLink) {
                continue;
            }

            const result = await prisma.readingResult.updateMany({
                where: {
                    id: reading.id,
                    userId: null,
                },
                data: {
                    userId: session.user.id,
                },
            });
            linkedCount += result.count;
        }

        // 2. Link by Email (Retroactive)
        if (linkByEmail && session.user.email) {
            const normalizedEmail = session.user.email.trim().toLowerCase();
            const emailQuery = `"email":"${normalizedEmail}"`;

            const result = await prisma.readingResult.updateMany({
                where: {
                    userId: null,
                    metadata: {
                        contains: emailQuery,
                    }
                },
                data: {
                    userId: session.user.id,
                }
            });
            linkedCount += result.count;
        }

        return NextResponse.json({ success: true, count: linkedCount });
    } catch (error) {
        console.error("Failed to link guest data:", error);
        if (isDatabaseConnectivityError(error)) {
            return serviceUnavailableResponse(
                "데이터 저장소에 일시적으로 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
                "DATABASE_UNAVAILABLE"
            );
        }
        return NextResponse.json({ error: "Failed to link data" }, { status: 500 });
    }
}
