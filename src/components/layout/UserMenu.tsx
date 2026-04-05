"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, FileText, LayoutDashboard, MessageSquareQuote, Settings, Sparkles } from "lucide-react";
import { useLoginModal } from "@/components/auth/LoginModal";
import Link from "next/link";

export default function UserMenu() {
    const { data: session, status } = useSession();
    const { openLoginModal } = useLoginModal();
    const [isOpen, setIsOpen] = useState(false);
    const displayName =
        session?.user?.name?.split(" ")[0] ||
        session?.user?.email?.split("@")[0] ||
        "Guest";
    const signedInAs = session?.user?.email || session?.user?.name || "Oracle User";

    // Link Guest Data on first login
    useEffect(() => {
        if (status === "authenticated") {
            const guestReadings = localStorage.getItem("cosmic_guest_readings");
            let readingIds: string[] = [];
            const pendingReadingId = localStorage.getItem("pending_reading_id");
            const pendingReadingAccessKey = localStorage.getItem("pending_reading_access_key");

            if (guestReadings) {
                try {
                    const parsed = JSON.parse(guestReadings);
                    if (Array.isArray(parsed)) readingIds = parsed;
                } catch (e) {
                    console.error("Failed to parse guest readings", e);
                }
            }

            const readingLinks = [
                ...readingIds.map((id) => ({ id })),
                ...(pendingReadingId ? [{ id: pendingReadingId, accessKey: pendingReadingAccessKey || undefined }] : []),
            ];

            // Always call link API to handle email-based linking (retroactive)
            // even if local storage is empty
            fetch("/api/user/link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ readingLinks, linkByEmail: true }),
            }).then((res) => {
                if (res.ok) {
                    localStorage.removeItem("cosmic_guest_readings");
                }
            }).catch(e => console.error("Link failed", e));
        }
    }, [status]);

    if (status === "loading") {
        return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;
    }

    if (status === "unauthenticated") {
        return (
            <button
                onClick={openLoginModal}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all hover:bg-white/10"
            >
                <User className="w-4 h-4" />
                <span>Login</span>
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-3 rounded-full border py-1 pl-1 pr-4 transition-all duration-300 ${isOpen
                    ? "border-white/40 bg-black/80 ring-1 ring-[#D4AF37]/50"
                    : "border-white/20 bg-black/50 hover:border-white/40 hover:bg-black/70"
                    } border mix-blend-normal`}
            >
                {session?.user?.image ? (
                    <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[#D4AF37]/50 transition-all"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] ring-1 ring-[#D4AF37]/30 group-hover:ring-[#D4AF37]/60 transition-all">
                        <User className="w-4 h-4" />
                    </div>
                )}
                <div className="flex flex-col items-start text-left hidden sm:block">
                    <span className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#D4AF37]">
                        Oracle Member
                    </span>
                    <span className="text-sm font-outfit text-white/90 leading-none max-w-[100px] truncate">
                        {displayName}
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 top-full z-[100] mt-3 w-72 overflow-hidden rounded-[26px] border border-white/15 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(8,12,24,0.98))] shadow-[0_20px_50px_rgba(0,0,0,1)] ring-1 ring-white/10 mix-blend-normal"
                        >
                            <div className="border-b border-white/10 bg-white/[0.03] p-4">
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">
                                    Oracle Identity
                                </p>
                                <p className="text-sm font-medium text-white/90 truncate">{signedInAs}</p>
                            </div>

                            <div className="p-2 space-y-1">
                                <Link
                                    href="/my"
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                                        <FileText className="w-4 h-4 text-[#D4AF37]" />
                                    </div>
                                    <span className="font-medium">My Readings</span>
                                </Link>

                                {session?.user?.role === 'ADMIN' && (
                                    <>
                                        <Link
                                            href="/ops"
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                                <LayoutDashboard className="w-4 h-4 text-amber-300" />
                                            </div>
                                            <span className="font-medium">Ops Hub</span>
                                        </Link>

                                        <Link
                                            href="/ops/growth"
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <span className="font-medium">Growth Ops</span>
                                        </Link>

                                        <Link
                                            href="/ops/reviews"
                                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                                                <MessageSquareQuote className="w-4 h-4 text-sky-300" />
                                            </div>
                                            <span className="font-medium">Review Ops</span>
                                        </Link>
                                    </>
                                )}

                                <Link
                                    href="#"
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/40 cursor-not-allowed rounded-xl transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                        <Settings className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">Settings</span>
                                </Link>
                            </div>

                            <div className="p-2 border-t border-white/10 mt-1">
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all group text-left"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                        <LogOut className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
