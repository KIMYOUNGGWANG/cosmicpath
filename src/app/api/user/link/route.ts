import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user) {
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
        return NextResponse.json({ error: "Failed to link data" }, { status: 500 });
    }
}
