import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Extend schema to allow optional email linking flag
const LinkGuestDataSchema = z.object({
    readingIds: z.array(z.string()).optional(),
    linkByEmail: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { readingIds, linkByEmail } = LinkGuestDataSchema.parse(body);

        let linkedCount = 0;

        // 1. Link specific IDs (LocalStorage)
        if (readingIds && readingIds.length > 0) {
            const result = await prisma.readingResult.updateMany({
                where: {
                    id: { in: readingIds },
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
            // Prisma doesn't support JSON deep search easily on all DBs, 
            // but since metadata is a stringified JSON in our schema (String type),
            // we can use string contains. 
            // WARNING: This is a loose check. "email":"foo@bar.com" 

            const emailQuery = `"${session.user.email}"`; // Simple check for quoted email

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
