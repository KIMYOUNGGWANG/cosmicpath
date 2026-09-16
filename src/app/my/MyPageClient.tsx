"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    ChevronRight,
    Compass,
    Crown,
    FileText,
    Loader2,
    Sparkles,
    User as UserIcon,
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
    userContext?: string;
    isPremium?: boolean;
    language?: "ko" | "en";
    readingData?: {
        name?: string;
        birthDate?: string;
        birthTime?: string;
        question?: string;
        context?: string;
    };
}

type SubscriptionTier = "free" | "pro" | "couple";
type SubscriptionPlan = "pro_weekly" | "pro_monthly" | "pro_yearly" | "couple_monthly" | null;

interface SubscriptionStatusPayload {
    status: SubscriptionTier;
    expiresAt: string | null;
    stripeCustomerId: string | null;
    plan: SubscriptionPlan;
}

export interface SmsOracleProfile {
    phoneNumber: string;
    isVerified: boolean;
    isActive: boolean;
}

interface MyPageClientProps {
    initialSmsOracleProfile?: SmsOracleProfile | null;
    userEmail?: string | null;
    userName?: string | null;
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

function getReadingTitle(meta: ParsedReadingMetadata): string {
    if (meta.readingData?.question && meta.readingData.question.trim().length > 0) {
        return meta.readingData.question.trim();
    }
    if (meta.userContext && meta.userContext.trim().length > 0) {
        return meta.userContext.trim();
    }
    if (meta.title && meta.title.trim().length > 0) {
        return meta.title.trim();
    }
    return "Cosmic Decision Note";
}

function getContextCategory(meta: ParsedReadingMetadata): { label: string; badgeClass: string } {
    const context = meta.readingData?.context;
    switch (context) {
        case "career":
            return {
                label: "Career & Work",
                badgeClass: "border-sky-400/30 bg-sky-400/10 text-sky-200",
            };
        case "love":
            return {
                label: "Relationship",
                badgeClass: "border-rose-400/30 bg-rose-400/10 text-rose-200",
            };
        case "money":
            return {
                label: "Wealth & Timing",
                badgeClass: "border-amber-400/30 bg-amber-400/10 text-amber-200",
            };
        case "health":
            return {
                label: "Wellness & Health",
                badgeClass: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
            };
        default:
            return {
                label: "Decision Timing",
                badgeClass: "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F4D88A]",
            };
    }
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function formatExpiry(expiresAt: string | null): string {
    if (!expiresAt) return "Active / Syncing";

    try {
        return new Date(expiresAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return expiresAt;
    }
}

function getPlanLabel(plan: SubscriptionPlan): string {
    switch (plan) {
        case "pro_weekly":
            return "Pro Weekly";
        case "pro_monthly":
            return "Pro Monthly";
        case "pro_yearly":
            return "Pro Annual";
        case "couple_monthly":
            return "Premium Plan";
        default:
            return "Pro Membership";
    }
}

export default function MyPageClient({
    userEmail,
    userName,
}: MyPageClientProps) {
    const [readings, setReadings] = useState<ReadingSummary[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionStatusPayload>(EMPTY_SUBSCRIPTION);
    const [loading, setLoading] = useState(true);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    useEffect(() => {
        void fetchPageData();
    }, []);

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

    const isSubscriber = subscription.status !== "free";

    const latestReadingDate = useMemo(() => {
        if (readings.length === 0) return null;
        return formatDate(readings[0].createdAt);
    }, [readings]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#050505]">
                <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pb-24 pt-24 text-white lg:pb-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr] xl:gap-12">

                    {/* ── SIDEBAR (Profile & Quick Actions) ── */}
                    <aside className="sticky top-28 hidden flex-col gap-5 lg:flex">
                        {/* Profile & Stats Card */}
                        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                            <div className="mb-6 flex items-center gap-3 border-b border-white/[0.06] pb-5">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F4D88A]">
                                    <UserIcon size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {userName || "Cosmic Traveler"}
                                    </p>
                                    <p className="truncate text-xs text-white/40">
                                        {userEmail || "Connected"}
                                    </p>
                                </div>
                            </div>

                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                                Decision Metrics
                            </p>
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                                    <p className="text-[11px] uppercase tracking-wider text-white/40 font-outfit">
                                        Saved Decisions
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-starlight font-cinzel">
                                        {readings.length}
                                    </p>
                                </div>
                                {latestReadingDate && (
                                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                                        <p className="text-[11px] uppercase tracking-wider text-white/40 font-outfit">
                                            Latest Analysis
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-white/90 font-outfit">
                                            {latestReadingDate}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-5 border-t border-white/[0.06]">
                                <Link
                                    href="/start?reset=true"
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] py-3 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-[#E7C867] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                                >
                                    <Sparkles size={14} />
                                    New Decision Note
                                </Link>
                            </div>

                            {/* Active Subscriber link to billing */}
                            {isSubscriber && (
                                <div className="mt-3">
                                    <Link
                                        href="/billing"
                                        className="flex w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 py-2.5 text-xs font-semibold text-[#F4D88A] transition-all hover:bg-[#D4AF37]/20"
                                    >
                                        <Crown size={13} />
                                        Membership & Billing
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Decision Philosophy Tip */}
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
                            <p className="text-xs italic leading-relaxed text-white/45">
                                &ldquo;When you master the timing of action, even turbulent seasons turn into high-leverage pivots.&rdquo;
                            </p>
                        </div>
                    </aside>

                    {/* ── MAIN CONTENT ── */}
                    <div className="min-w-0 space-y-8">
                        {/* Active Subscription Banner (Only visible to paying subscribers) */}
                        {isSubscriber && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/15 via-[#D4AF37]/5 to-transparent p-5 backdrop-blur-md"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/20 text-[#F4D88A]">
                                        <Crown size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-white">
                                                {getPlanLabel(subscription.plan)}
                                            </span>
                                            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                                                Active Member
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-white/50 font-outfit">
                                            Next renewal: {formatExpiry(subscription.expiresAt)}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/billing"
                                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-all hover:border-[#D4AF37]/40 hover:bg-white/10"
                                >
                                    <span>Manage Subscription</span>
                                    <ChevronRight size={14} />
                                </Link>
                            </motion.div>
                        )}

                        {/* Section Header */}
                        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-starlight md:text-3xl font-cinzel">
                                    My Decision Archive
                                </h1>
                                <p className="mt-1 font-outfit text-sm text-white/55">
                                    Past decisions, timing analysis, and action blueprints.
                                </p>
                            </div>
                            <Link
                                href="/start?reset=true"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-6 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-[#E7C867] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] sm:w-auto"
                            >
                                <Sparkles size={14} />
                                New Decision Note
                            </Link>
                        </header>

                        {/* Readings Grid or Empty State */}
                        {readings.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-12 text-center backdrop-blur-md"
                            >
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F4D88A] shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                                    <Compass size={28} />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-starlight font-cinzel">
                                    No Saved Decision Notes Yet
                                </h3>
                                <p className="mx-auto mb-8 max-w-md font-outfit text-sm leading-relaxed text-white/50">
                                    Every major choice has a window of optimal timing. Start by structuring your first career, relationship, or investment decision.
                                </p>
                                <Link
                                    href="/start?reset=true"
                                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#D4AF37] px-8 text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-[#E7C867] hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]"
                                >
                                    Structure Your First Decision
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.08,
                                        },
                                    },
                                }}
                                initial="hidden"
                                animate="show"
                                className="grid gap-4 sm:grid-cols-2"
                            >
                                {readings.map((reading) => {
                                    const meta = parseReadingMetadata(reading.metadata);
                                    const title = getReadingTitle(meta);
                                    const category = getContextCategory(meta);
                                    const date = formatDate(reading.createdAt);
                                    const subjectName = meta.readingData?.name || meta.name || "User";
                                    const subjectBirth = meta.readingData?.birthDate || meta.birthDate || null;

                                    return (
                                        <motion.div
                                            key={reading.id}
                                            variants={{
                                                hidden: { opacity: 0, y: 15 },
                                                show: { opacity: 1, y: 0 },
                                            }}
                                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 backdrop-blur-md transition-all hover:border-[#D4AF37]/40 hover:bg-white/[0.04] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
                                        >
                                            <div className="pointer-events-none absolute right-0 top-0 p-5 opacity-5 transition-opacity group-hover:opacity-15">
                                                <FileText size={56} className="text-[#D4AF37]" />
                                            </div>

                                            <div>
                                                <div className="mb-4 flex items-center justify-between gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${category.badgeClass}`}
                                                    >
                                                        <Sparkles size={10} />
                                                        {category.label}
                                                    </span>
                                                    <span className="flex items-center gap-1 font-outfit text-xs text-white/40">
                                                        <Calendar size={12} />
                                                        {date}
                                                    </span>
                                                </div>

                                                <h3 className="mb-3 line-clamp-2 text-lg font-bold text-starlight transition-colors group-hover:text-[#F4D88A] font-cinzel leading-snug">
                                                    {title}
                                                </h3>

                                                <div className="mb-6 flex items-center gap-2 font-outfit text-xs text-white/45">
                                                    <span>{subjectName}</span>
                                                    {subjectBirth && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{subjectBirth}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/[0.06]">
                                                <Link
                                                    href={`/share/${reading.id}?view=full`}
                                                    className="inline-flex w-full items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white/80 transition-all group-hover:bg-[#D4AF37] group-hover:text-black"
                                                >
                                                    <span>View Decision Note</span>
                                                    <ChevronRight
                                                        size={14}
                                                        className="transition-transform group-hover:translate-x-1"
                                                    />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                source="my"
            />
        </div>
    );
}
