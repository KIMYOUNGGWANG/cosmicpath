import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const readings = await prisma.readingResult.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                createdAt: true,
                metadata: true,
                // We don't fetch the full 'data' blob here to save bandwidth
                // metadata often contains summary/title if parsed, 
                // but currently metadata is a JSON string.
                // We might need to parse it client side or here.
            }
        });

        return NextResponse.json({ readings });
    } catch (error) {
        console.error("Failed to fetch readings:", error);
        return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 });
    }
}
