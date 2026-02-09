"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, FileText, Settings, Sparkles } from "lucide-react";
import { useLoginModal } from "@/components/auth/LoginModal";
import Link from "next/link";

export default function UserMenu() {
    const { data: session, status } = useSession();
    const { openLoginModal } = useLoginModal();
    const [isOpen, setIsOpen] = useState(false);

    // Link Guest Data on first login
    useEffect(() => {
        if (status === "authenticated") {
            const guestReadings = localStorage.getItem("cosmic_guest_readings");
            let readingIds: string[] = [];

            if (guestReadings) {
                try {
                    const parsed = JSON.parse(guestReadings);
                    if (Array.isArray(parsed)) readingIds = parsed;
                } catch (e) {
                    console.error("Failed to parse guest readings", e);
                }
            }

            // Always call link API to handle email-based linking (retroactive)
            // even if local storage is empty
            fetch("/api/user/link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ readingIds, linkByEmail: true }),
            }).then(async (res) => {
                if (res.ok) {
                    localStorage.removeItem("cosmic_guest_readings");
                    const data = await res.json();
                    console.log("Linked readings count:", data.count);
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
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-outfit transition-all flex items-center gap-2"
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
                className="flex items-center gap-2 p-1 pr-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
            >
                {session?.user?.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                        <User className="w-4 h-4" />
                    </div>
                )}
                <span className="text-sm font-outfit max-w-[100px] truncate hidden sm:block">
                    {session?.user?.name || "Traveler"}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                        >
                            <div className="px-4 py-3 border-b border-white/5">
                                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Signed in as</p>
                                <p className="text-sm truncate w-full font-medium">{session?.user?.email}</p>
                            </div>

                            <div className="py-1">
                                <Link href="/my" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                                    <FileText className="w-4 h-4 text-[#D4AF37]" />
                                    <span>My Readings</span>
                                </Link>
                                <Link href="/match/new" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                    <span>Cosmic Match</span>
                                </Link>
                                <Link href="#" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors opacity-50 cursor-not-allowed">
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
                                </Link>
                            </div>

                            <div className="border-t border-white/5 py-1">
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
