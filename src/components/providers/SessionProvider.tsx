"use strict";
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { GrowthMetricsBridge } from "@/components/providers/GrowthMetricsBridge";
import { ReferralRewardBridge } from "@/components/providers/ReferralRewardBridge";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextAuthSessionProvider>
            <GrowthMetricsBridge />
            <ReferralRewardBridge />
            {children}
        </NextAuthSessionProvider>
    );
}
