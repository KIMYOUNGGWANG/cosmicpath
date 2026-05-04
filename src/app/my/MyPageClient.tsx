"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    ChevronRight,
    Crown,
    Loader2,
    MessageSquareText,
    ShieldCheck,
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
type SubscriptionPlan = "pro_weekly" | "pro_monthly" | "pro_yearly" | "couple_monthly" | null;
type SmsOracleStep = "register" | "verify" | "complete";

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
    initialSmsOracleProfile: SmsOracleProfile | null;
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
        case "pro_weekly":
            return "Legacy Pro Plan";
        case "pro_monthly":
            return "Pro Monthly";
        case "pro_yearly":
            return "Pro Annual";
        case "couple_monthly":
            return "Legacy Couple Plan";
        default:
            return "Free Plan";
    }
}

function getTierBadge(status: SubscriptionTier): string {
    switch (status) {
        case "pro":
            return "Pro Member";
        case "couple":
            return "Premium Member";
        default:
            return "Free Member";
    }
}

function getMembershipSummary(subscription: SubscriptionStatusPayload): string {
    switch (subscription.status) {
        case "pro":
            return "Grand Oracle Chat 무제한, daily premium, 프리미엄 리딩 흐름이 활성화되어 있습니다. 인증된 번호에는 Daily Signal perk도 함께 이어집니다.";
        case "couple":
            return "기존 관계형 멤버십이 유지 중이며, 현재는 premium membership 범주 안에서 오라클 access와 Daily Signal perk를 함께 관리합니다.";
        default:
            return "현재는 무료 티어입니다. 멤버십을 열면 Grand Oracle Chat, daily premium, 프리미엄 리딩 흐름이 열리고, 인증된 번호에는 Daily Signal perk도 연결할 수 있습니다.";
    }
}

function getBadgeClasses(status: SubscriptionTier): string {
    switch (status) {
        case "pro":
            return "border-emerald-400/30 bg-emerald-400/15 text-emerald-200";
        case "couple":
            return "border-emerald-400/30 bg-emerald-400/15 text-emerald-200";
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

function getInitialSmsOracleStep(profile: SmsOracleProfile | null): SmsOracleStep {
    if (!profile) {
        return "register";
    }

    if (profile.isVerified && profile.isActive) {
        return "complete";
    }

    return "verify";
}

function maskPhoneNumber(phoneNumber: string): string {
    const digits = phoneNumber.replace(/[^\d]/g, "");

    if (digits.length < 8) {
        return phoneNumber;
    }

    const head = digits.slice(0, 3);
    const tail = digits.slice(-4);
    const middle = "*".repeat(Math.max(3, digits.length - 7));

    return `${head}-${middle}-${tail}`;
}

function extractApiErrorMessage(payload: unknown, fallback: string): string {
    if (!payload || typeof payload !== "object") {
        return fallback;
    }

    const record = payload as Record<string, unknown>;
    const error = record.error;

    if (typeof error === "string" && error.trim()) {
        return error;
    }

    if (error && typeof error === "object") {
        const message = (error as Record<string, unknown>).message;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
    }

    return fallback;
}

export default function MyPageClient({ initialSmsOracleProfile }: MyPageClientProps) {
    const router = useRouter();
    const [readings, setReadings] = useState<ReadingSummary[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionStatusPayload>(EMPTY_SUBSCRIPTION);
    const [loading, setLoading] = useState(true);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    const [smsOracleProfile, setSmsOracleProfile] = useState<SmsOracleProfile | null>(initialSmsOracleProfile);
    const [smsPhoneNumber, setSmsPhoneNumber] = useState(initialSmsOracleProfile?.phoneNumber ?? "");
    const [smsCode, setSmsCode] = useState("");
    const [smsStep, setSmsStep] = useState<SmsOracleStep>(getInitialSmsOracleStep(initialSmsOracleProfile));
    const [smsMessage, setSmsMessage] = useState("");
    const [smsError, setSmsError] = useState("");
    const [smsSubmitting, setSmsSubmitting] = useState(false);

    useEffect(() => {
        setSmsOracleProfile(initialSmsOracleProfile);
        setSmsPhoneNumber(initialSmsOracleProfile?.phoneNumber ?? "");
        setSmsCode("");
        setSmsError("");
        setSmsMessage("");
        setSmsStep(getInitialSmsOracleStep(initialSmsOracleProfile));
    }, [initialSmsOracleProfile]);

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

    const isSmsMembershipActive = subscription.status !== "free";
    const smsStatusLabel = useMemo(() => {
        if (!smsOracleProfile) {
            return isSmsMembershipActive ? "미등록" : "잠금됨";
        }

        if (smsOracleProfile.isVerified && isSmsMembershipActive) {
            return "활성화 완료";
        }

        if (smsOracleProfile.isVerified) {
            return "멤버십 대기";
        }

        return isSmsMembershipActive ? "인증 대기" : "잠금됨";
    }, [isSmsMembershipActive, smsOracleProfile]);

    async function submitSmsRegister() {
        if (!isSmsMembershipActive) {
            setSmsError("");
            setSmsMessage("");
            setIsSubscriptionModalOpen(true);
            return;
        }

        setSmsSubmitting(true);
        setSmsError("");
        setSmsMessage("");

        try {
            const response = await fetch("/api/sms-oracle/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phoneNumber: smsPhoneNumber,
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(extractApiErrorMessage(payload, "인증번호 발송에 실패했습니다."));
            }

            setSmsStep("verify");
            setSmsMessage("인증번호를 문자로 보냈습니다. 10분 안에 입력해주세요.");
            startTransition(() => {
                router.refresh();
            });
        } catch (error) {
            setSmsError(error instanceof Error ? error.message : "인증번호 발송에 실패했습니다.");
        } finally {
            setSmsSubmitting(false);
        }
    }

    async function handleSmsRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await submitSmsRegister();
    }

    async function handleSmsVerify(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!isSmsMembershipActive) {
            setSmsError("");
            setSmsMessage("");
            setIsSubscriptionModalOpen(true);
            return;
        }

        setSmsSubmitting(true);
        setSmsError("");
        setSmsMessage("");

        try {
            const response = await fetch("/api/sms-oracle/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phoneNumber: smsPhoneNumber,
                    code: smsCode,
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(extractApiErrorMessage(payload, "번호 인증에 실패했습니다."));
            }

            setSmsOracleProfile({
                phoneNumber: smsPhoneNumber,
                isVerified: true,
                isActive: true,
            });
            setSmsStep("complete");
            setSmsCode("");
            setSmsMessage(
                isSmsMembershipActive
                    ? "번호 인증이 완료되었습니다. 내일 아침 첫 Daily Signal이 도착합니다."
                    : "번호 인증이 완료되었습니다. 구독을 시작하면 내일 아침 첫 Daily Signal이 도착합니다."
            );
            startTransition(() => {
                router.refresh();
            });
        } catch (error) {
            setSmsError(error instanceof Error ? error.message : "번호 인증에 실패했습니다.");
        } finally {
            setSmsSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pb-12 pt-24 text-white">
            <div className="mx-auto max-w-[1820px] px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[300px_1fr] gap-8 xl:gap-14 items-start">

                    {/* ── SIDEBAR ── */}
                    <aside className="hidden lg:flex flex-col gap-5 sticky top-28">
                        {/* Nav */}
                        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Navigation</p>
                            <nav className="flex flex-col gap-1">
                                <Link href="/my" className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-3 text-sm font-semibold text-[#D4AF37]">
                                    <Sparkles size={15} />
                                    <span>My Hub</span>
                                </Link>
                                <Link href="/billing" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white">
                                    <Crown size={15} />
                                    <span>Membership</span>
                                </Link>
                                <Link href="/daily" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white">
                                    <MessageSquareText size={15} />
                                    <span>Daily Signal</span>
                                </Link>
                            </nav>
                        </div>

                        {/* Oracle Guide Card */}
                        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-5">
                            <div className="mb-4 flex items-center gap-3 border-b border-white/[0.06] pb-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                                    <span className="font-cinzel text-[#D4AF37] text-base">결</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Oracle Guide</p>
                                    <p className="text-xs text-white/40">Analytic &amp; Neutral</p>
                                </div>
                            </div>
                            <p className="mb-5 text-sm italic leading-relaxed text-white/55">
                                "이곳은 당신의 선택과 타이밍이 기록되는 공간입니다. 주기적인 점검이 가장 확실한 길을 만듭니다."
                            </p>
                            <Link
                                href="/start?reset=true"
                                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
                            >
                                새 질문 하기
                            </Link>
                        </div>
                    </aside>

                    {/* ── MAIN CONTENT ── */}
                    <div className="min-w-0">
                        <header className="mb-10">
                            <h1 className="mb-2 text-3xl text-starlight md:text-4xl font-cinzel">
                                My Oracle Hub
                            </h1>
                            <p className="font-outfit text-white/55">
                                Your cosmic history, saved insights, and membership status.
                            </p>
                        </header>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-10 overflow-hidden rounded-[32px] border border-[#D4AF37]/20 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_36%),radial-gradient(circle_at_85%_18%,rgba(245,216,138,0.08),transparent_24%),linear-gradient(145deg,#0a0d16,#111827)] p-6 shadow-[0_36px_140px_rgba(0,0,0,0.42)]"
                >
                    <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#F4D88A]/70 to-transparent" />
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F4D88A]">
                                    <Crown size={14} />
                                    Membership
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#F4D88A]/12 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                                    <Sparkles size={12} />
                                    Primary Access
                                </div>
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
                            <p className="mt-3 text-xs leading-6 text-[#F4D88A]/70">
                                메인 가치는 Grand Oracle Chat과 premium reading 루틴이고, Daily Signal은 그 흐름을 아침에 먼저 떠오르게 하는 보조 perk입니다.
                            </p>
                            <div className="mt-4 rounded-[24px] border border-[#D4AF37]/14 bg-[#D4AF37]/8 px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F4D88A]">
                                    Core Access
                                </p>
                                <p className="mt-2 text-sm leading-7 text-white/74">
                                    Grand Oracle Chat, daily premium, premium reading flow는 이 membership 카드가 여는 핵심 경험입니다.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/billing"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                            >
                                멤버십 흐름 보기
                            </Link>
                            {subscription.status === "free" ? (
                                <button
                                    type="button"
                                    onClick={() => setIsSubscriptionModalOpen(true)}
                                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0A0D16] transition-colors hover:bg-[#E7C867]"
                                >
                                    핵심 오라클 access 열기
                                </button>
                            ) : (
                                <Link
                                    href="/daily"
                                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0A0D16] transition-colors hover:bg-[#E7C867]"
                                >
                                    오늘의 오라클 흐름 이어가기
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-[#D4AF37]/16 bg-[#D4AF37]/8 p-4">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                                Access
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

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.05),transparent_34%),linear-gradient(145deg,#07111a,#0a1620)] p-5 shadow-[0_18px_64px_rgba(2,12,27,0.26)]"
                >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-xl">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/16 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
                                    <MessageSquareText size={14} />
                                    SMS Daily Signal
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/62">
                                    <Sparkles size={12} />
                                    Included Perk
                                </div>
                            </div>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <h2 className="text-xl font-semibold text-white md:text-2xl">
                                    아침 Daily Signal 연결
                                </h2>
                                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                    {smsStatusLabel}
                                </span>
                            </div>
                            <p className="text-sm leading-7 text-white/66">
                                구독 중인 사용자에게 아침마다 하루 한 번, 오늘의 흐름을 먼저 짧게 알려주는 personal daily signal입니다.
                            </p>
                            <p className="mt-3 text-xs leading-6 text-cyan-100/70">
                                활성 membership에서 번호 등록과 인증을 마치면, 다음날 아침부터 one-way Daily Signal이 시작됩니다.
                            </p>
                            <div className="mt-4 rounded-[22px] border border-cyan-300/12 bg-white/[0.03] px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/80">
                                    Secondary Channel
                                </p>
                                <p className="mt-2 text-sm leading-7 text-white/66">
                                    Daily Signal은 membership 위에 얹힌 아침 리텐션 채널입니다. 핵심 오라클 경험을 대신하지 않고, 먼저 떠오르게 돕는 역할만 합니다.
                                </p>
                            </div>
                        </div>

                        <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-md">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                                    Included With
                                </p>
                                <p className="mt-2 text-base font-semibold text-white">Premium</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                                    Frequency
                                </p>
                                <p className="mt-2 text-base font-semibold text-white">1 / day</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                                    Requires
                                </p>
                                <p className="mt-2 text-base font-semibold text-white">Verified phone</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                            {!isSmsMembershipActive ? (
                                <div className="space-y-4">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">멤버십에서 열리는 설정</p>
                                        <p className="mt-2 text-sm leading-6 text-white/62">
                                            Daily Signal은 유료 membership에 포함된 보조 perk입니다. free 상태에서는 번호 등록과 OTP 인증 대신, 잠금 안내와 업셀만 노출됩니다.
                                        </p>
                                    </div>
                                    <div className="rounded-[24px] border border-cyan-300/16 bg-cyan-400/10 px-4 py-4 text-sm leading-7 text-cyan-50">
                                        {smsOracleProfile?.isVerified
                                            ? `${maskPhoneNumber(smsOracleProfile.phoneNumber)} 번호는 이미 확인되었습니다. 멤버십을 다시 시작하면 다음날 아침부터 Daily Signal 발송이 재개됩니다.`
                                            : smsOracleProfile?.phoneNumber
                                              ? `${maskPhoneNumber(smsOracleProfile.phoneNumber)} 번호가 저장되어 있습니다. 멤버십을 시작한 뒤에만 OTP 인증과 발송 활성화를 이어갈 수 있습니다.`
                                              : "멤버십을 시작하면 여기서 번호 등록과 OTP 인증을 완료하고, 다음날 아침부터 Daily Signal을 받을 수 있습니다."}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsSubscriptionModalOpen(true)}
                                        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200"
                                    >
                                        핵심 오라클 access 열기
                                    </button>
                                </div>
                            ) : smsStep === "register" ? (
                                <form onSubmit={handleSmsRegister} className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-white">전화번호 등록</p>
                                        <p className="mt-2 text-sm leading-6 text-white/62">
                                            `+821012345678` 또는 `01012345678` 형식으로 입력하면 인증번호를 문자로 보냅니다.
                                        </p>
                                    </div>
                                    <label className="block">
                                        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/45">
                                            Phone Number
                                        </span>
                                        <input
                                            type="tel"
                                            value={smsPhoneNumber}
                                            onChange={(event) => setSmsPhoneNumber(event.target.value)}
                                            placeholder="+821012345678"
                                            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-cyan-300/45"
                                        />
                                    </label>
                                    {smsError ? (
                                        <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                                            {smsError}
                                        </p>
                                    ) : null}
                                    {smsMessage ? (
                                        <p className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm leading-6 text-cyan-100">
                                            {smsMessage}
                                        </p>
                                    ) : null}
                                    <button
                                        type="submit"
                                        disabled={smsSubmitting || !smsPhoneNumber.trim()}
                                        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {smsSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "인증번호 받기"}
                                    </button>
                                </form>
                            ) : null}

                            {isSmsMembershipActive && smsStep === "verify" ? (
                                <form onSubmit={handleSmsVerify} className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-white">OTP 인증</p>
                                        <p className="mt-2 text-sm leading-6 text-white/62">
                                            {smsPhoneNumber ? `${maskPhoneNumber(smsPhoneNumber)} 번호로 보낸 6자리 인증번호를 입력해주세요.` : "문자로 받은 6자리 인증번호를 입력해주세요."}
                                        </p>
                                    </div>
                                    <label className="block">
                                        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/45">
                                            Verification Code
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={smsCode}
                                            onChange={(event) => setSmsCode(event.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                                            placeholder="123456"
                                            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/28 focus:border-cyan-300/45"
                                        />
                                    </label>
                                    {smsError ? (
                                        <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                                            {smsError}
                                        </p>
                                    ) : null}
                                    {smsMessage ? (
                                        <p className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm leading-6 text-cyan-100">
                                            {smsMessage}
                                        </p>
                                    ) : null}
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            type="submit"
                                            disabled={smsSubmitting || smsCode.length !== 6}
                                            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {smsSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "인증 완료"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSmsStep("register");
                                                setSmsCode("");
                                                setSmsError("");
                                                setSmsMessage("");
                                            }}
                                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                                        >
                                            번호 다시 입력
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void submitSmsRegister()}
                                        disabled={smsSubmitting || !smsPhoneNumber.trim()}
                                        className="text-sm font-medium text-cyan-100/80 transition-colors hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        인증번호 다시 보내기
                                    </button>
                                </form>
                            ) : null}

                            {isSmsMembershipActive && smsStep === "complete" ? (
                                <div className="space-y-4">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
                                        <ShieldCheck size={22} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">연결 완료</p>
                                        <p className="mt-2 text-sm leading-6 text-white/62">
                                            {smsOracleProfile?.phoneNumber
                                                ? `${maskPhoneNumber(smsOracleProfile.phoneNumber)} 번호가 Daily Signal에 연결되었습니다.`
                                                : "Daily Signal 연결이 완료되었습니다."}
                                        </p>
                                    </div>
                                    <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-4 text-sm leading-7 text-emerald-50">
                                        {isSmsMembershipActive
                                            ? "내일 아침 첫 Daily Signal이 도착합니다. 이후에는 매일 한 번, 오늘의 흐름을 먼저 받아볼 수 있습니다."
                                            : "번호 등록은 완료되었습니다. 구독을 시작하면 내일 아침부터 Daily Signal이 도착합니다."}
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Link
                                            href="/daily"
                                            className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200"
                                        >
                                            오늘 흐름 계속 보기
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSmsStep("register");
                                                setSmsCode("");
                                                setSmsError("");
                                                setSmsMessage("");
                                            }}
                                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]"
                                        >
                                            번호 변경
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                            <p className="text-sm font-semibold text-white">Daily Signal checklist</p>
                            <p className="mt-2 text-sm leading-6 text-white/54">
                                membership 위에 붙는 perk가 실제로 켜질 준비가 됐는지 확인하는 패널입니다.
                            </p>
                            <div className="mt-4 space-y-3">
                                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">번호</p>
                                    <p className="mt-2 text-sm font-medium text-white">
                                        {smsOracleProfile?.phoneNumber ? maskPhoneNumber(smsOracleProfile.phoneNumber) : "아직 등록되지 않음"}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">상태</p>
                                    <p className="mt-2 text-sm font-medium text-white">{smsStatusLabel}</p>
                                </div>
                                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">시작 조건</p>
                                    <p className="mt-2 text-sm leading-6 text-white/70">
                                        전화번호 인증과 활성 membership이 모두 충족되면 다음날 아침부터 Daily Hook이 시작됩니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {readings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[32px] border border-white/[0.07] bg-white/[0.02] p-12 text-center"
                    >
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-[0_0_40px_rgba(212,175,55,0.12)]">
                            <span className="font-cinzel text-[#D4AF37] text-3xl">결</span>
                        </div>
                        <h3 className="mb-3 text-xl text-starlight font-cinzel tracking-wide">아직 리딩 기록이 없습니다</h3>
                        <p className="mb-8 max-w-sm mx-auto text-sm leading-relaxed text-white/50">
                            오라클 가이드 결이 당신의 첫 질문을 기다리고 있습니다. 막연한 고민보다 구체적인 질문으로 시작해보세요.
                        </p>
                        <Link
                            href="/start?reset=true"
                            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#D4AF37] px-10 font-bold text-black transition-all hover:bg-[#E7C867] hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]"
                        >
                            첫 질문 시작하기
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
                        className="grid gap-4 sm:grid-cols-2"
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
                    </div>{/* end main content */}
                </div>{/* end grid */}
            </div>{/* end max-width container */}

            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
                source="my"
            />
        </div>
    );
}
