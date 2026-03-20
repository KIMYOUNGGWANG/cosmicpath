"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    ChevronRight,
    Crown,
    Loader2,
    Sparkles,
} from "lucide-react";
import { SubscriptionModal } from "@/components/payment/SubscriptionModal";

interface ReadingSummary {
    id: string;
    createdAt: string;
    metadata: string | null;
}

interface ParsedReadingMetadata {
    title?: string;
    name?: string;
    birthDate?: string;
    readingData?: {
        name?: string;
        birthDate?: string;
    };
}

type SubscriptionTier = "free" | "pro" | "couple";
type SubscriptionPlan = "pro_monthly" | "pro_yearly" | "couple_monthly" | null;

interface SubscriptionStatusPayload {
    status: SubscriptionTier;
    expiresAt: string | null;
    stripeCustomerId: string | null;
    plan: SubscriptionPlan;
}

const EMPTY_SUBSCRIPTION: SubscriptionStatusPayload = {
    status: "free",
    expiresAt: null,
    stripeCustomerId: null,
    plan: null,
};

function parseReadingMetadata(metadata: string | null): ParsedReadingMetadata {
    if (!metadata) return {};

    try {
        const parsed = JSON.parse(metadata) as ParsedReadingMetadata;
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function getPlanLabel(plan: SubscriptionPlan): string {
    switch (plan) {
        case "pro_monthly":
            return "Pro Monthly";
        case "pro_yearly":
            return "Pro Annual";
        case "couple_monthly":
            return "Couple Monthly";
        default:
            return "Free Plan";
    }
}

function getTierBadge(status: SubscriptionTier): string {
    switch (status) {
        case "pro":
            return "Pro Member";
        case "couple":
            return "Couple Member";
        default:
            return "Free Member";
    }
}

function getMembershipSummary(subscription: SubscriptionStatusPayload): string {
    switch (subscription.status) {
        case "pro":
            return "무제한 Oracle Chat과 프리미엄 테마, 월간 인사이트가 활성화되어 있습니다.";
        case "couple":
            return "커플 전용 리포트와 프리미엄 기능이 활성화되어 있습니다.";
        default:
            return "현재 무료 플랜입니다. 구독을 시작하면 프리미엄 리포트와 Oracle 혜택을 계속 사용할 수 있습니다.";
    }
}

function getBadgeClasses(status: SubscriptionTier): string {
    switch (status) {
        case "pro":
            return "border-emerald-400/30 bg-emerald-400/15 text-emerald-200";
        case "couple":
            return "border-pink-400/30 bg-pink-400/15 text-pink-100";
        default:
            return "border-white/10 bg-white/5 text-white/70";
    }
}

function formatExpiry(expiresAt: string | null): string {
    if (!expiresAt) return "Active / syncing";

    return new Date(expiresAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function MyPage() {
    const { status } = useSession();
    const router = useRouter();
    const [readings, setReadings] = useState<ReadingSummary[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionStatusPayload>(EMPTY_SUBSCRIPTION);
    const [loading, setLoading] = useState(true);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
            return;
        }

        if (status === "authenticated") {
            void fetchPageData();
        }
    }, [status, router]);

    async function fetchPageData() {
        setLoading(true);

        try {
            const [readingsResponse, subscriptionResponse] = await Promise.all([
                fetch("/api/user/readings", { cache: "no-store" }),
                fetch("/api/subscription/status", { cache: "no-store" }),
            ]);

            if (readingsResponse.ok) {
                const readingsPayload = await readingsResponse.json();
                setReadings(Array.isArray(readingsPayload.readings) ? readingsPayload.readings : []);
            }

            if (subscriptionResponse.ok) {
                const subscriptionPayload = await subscriptionResponse.json();
                setSubscription({
                    status: subscriptionPayload.status ?? "free",
                    expiresAt: subscriptionPayload.expiresAt ?? null,
                    stripeCustomerId: subscriptionPayload.stripeCustomerId ?? null,
                    plan: subscriptionPayload.plan ?? null,
                });
            } else {
                setSubscription(EMPTY_SUBSCRIPTION);
            }
        } catch (error) {
            console.error("Failed to load my page data", error);
            setSubscription(EMPTY_SUBSCRIPTION);
        } finally {
            setLoading(false);
        }
    }

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] px-4 pb-12 pt-24 text-white">
            <div className="mx-auto max-w-5xl">
                <header className="mb-10">
                    <h1 className="mb-2 text-3xl text-starlight md:text-4xl font-cinzel">
                        My Journey
                    </h1>
                    <p className="font-outfit text-white/60">
                        Your cosmic history, saved insights, and membership status.
                    </p>
                </header>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 overflow-hidden rounded-[28px] border border-[#D4AF37]/15 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_38%),linear-gradient(145deg,#0a0d16,#111827)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
                >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F4D88A]">
                                <Crown size={14} />
                                Membership
                            </div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-semibold text-white md:text-3xl">
                                    {getPlanLabel(subscription.plan)}
                                </h2>
                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getBadgeClasses(subscription.status)}`}
                                >
                                    {getTierBadge(subscription.status)}
                                </span>
                            </div>
                            <p className="text-sm leading-7 text-white/70 md:text-base">
                                {getMembershipSummary(subscription)}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/billing"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                            >
                                구독 관리 보기
                            </Link>
                            {subscription.status === "free" ? (
                                <button
                                    type="button"
                                    onClick={() => setIsSubscriptionModalOpen(true)}
                                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0A0D16] transition-colors hover:bg-[#E7C867]"
                                >
                                    구독 시작하기
                                </button>
                            ) : (
                                <Link
                                    href="/daily"
                                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0A0D16] transition-colors hover:bg-[#E7C867]"
                                >
                                    오늘의 운세 열기
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                                Tier
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white">
                                {subscription.status === "free" ? "Free" : "Premium"}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                                Renewal
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white">
                                {formatExpiry(subscription.expiresAt)}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                                Billing
                            </p>
                            <p className="mt-2 truncate text-lg font-semibold text-white">
                                {subscription.stripeCustomerId ? "Stripe connected" : "Not connected"}
                            </p>
                        </div>
                    </div>
                </motion.section>

                {readings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-2xl py-20 text-center"
                    >
                        <Sparkles className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]/50" />
                        <h3 className="mb-2 text-xl text-white font-cinzel">No Readings Yet</h3>
                        <p className="mb-6 font-outfit text-white/60">
                            Your destiny is waiting to be uncovered.
                        </p>
                        <Link
                            href="/start?reset=true"
                            className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FDD835] px-8 py-3 font-bold text-black transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                        >
                            Start New Journey
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1,
                                },
                            },
                        }}
                        initial="hidden"
                        animate="show"
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {readings.map((reading) => {
                            const meta = parseReadingMetadata(reading.metadata);
                            const date = new Date(reading.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            });

                            return (
                                <motion.div
                                    key={reading.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        show: { opacity: 1, y: 0 },
                                    }}
                                >
                                    <Link
                                        href={`/share/${reading.id}?view=full`}
                                        className="group relative block overflow-hidden rounded-xl p-6 glass-card glass-card-hover"
                                    >
                                        <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                                            <Sparkles className="h-12 w-12 text-white" />
                                        </div>

                                        <div className="relative z-10 flex h-full flex-col justify-between">
                                            <div>
                                                <div className="mb-4 flex items-center justify-between">
                                                    <span className="rounded border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] backdrop-blur-md">
                                                        Premium
                                                    </span>
                                                    <span className="flex items-center gap-1 font-outfit text-xs text-white/40">
                                                        <Calendar className="h-3 w-3" />
                                                        {date}
                                                    </span>
                                                </div>
                                                <h3 className="mb-2 line-clamp-2 text-xl font-bold text-starlight transition-colors group-hover:text-[#D4AF37] font-cinzel">
                                                    {meta.title || "Cosmic Analysis Report"}
                                                </h3>
                                                <p className="font-outfit text-sm text-white/50">
                                                    {meta.readingData?.name || meta.name || "User"} •{" "}
                                                    {meta.readingData?.birthDate || meta.birthDate || "Unknown Date"}
                                                </p>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between text-sm text-white/40 transition-colors group-hover:text-white/80">
                                                <span className="font-outfit">View Report</span>
                                                <ChevronRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
            />
        </div>
    );
}
