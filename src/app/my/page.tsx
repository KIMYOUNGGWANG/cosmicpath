import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyPageClient from "./MyPageClient";

export const dynamic = "force-dynamic";

export default async function MyPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        redirect("/login?callbackUrl=/my");
    }

    const smsOracleProfile = await prisma.smsOracleSubscriber.findUnique({
        where: {
            userId,
        },
        select: {
            phoneNumber: true,
            isVerified: true,
            isActive: true,
        },
    });

    return (
        <MyPageClient
            initialSmsOracleProfile={smsOracleProfile ? {
                phoneNumber: smsOracleProfile.phoneNumber,
                isVerified: smsOracleProfile.isVerified,
                isActive: smsOracleProfile.isActive,
            } : null}
        />
    );
}
