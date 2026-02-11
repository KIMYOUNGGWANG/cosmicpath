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
                className={`flex items-center gap-3 pl-1 pr-4 py-1 rounded-full transition-all duration-300 group ${isOpen
                    ? "bg-black border-white/40 ring-1 ring-[#D4AF37]/50"
                    : "bg-black border-white/20 hover:border-white/40"
                    } border mix-blend-normal`}
            >
                {session?.user?.image ? (
                    <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[#D4AF37]/50 transition-all"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] ring-1 ring-[#D4AF37]/30 group-hover:ring-[#D4AF37]/60 transition-all">
                        <User className="w-4 h-4" />
                    </div>
                )}
                <div className="flex flex-col items-start text-left hidden sm:block">
                    <span className="text-xs text-[#D4AF37] font-medium leading-none mb-0.5">Traveler</span>
                    <span className="text-sm font-outfit text-white/90 leading-none max-w-[100px] truncate">
                        {session?.user?.name?.split(' ')[0] || "Guest"}
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
                            className="absolute right-0 top-full mt-3 w-64 bg-black border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,1)] z-[100] overflow-hidden ring-1 ring-white/10 mix-blend-normal"
                        >
                            <div className="p-4 border-b border-white/10 bg-white/3">
                                <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-semibold mb-1">Signed in as</p>
                                <p className="text-sm font-medium text-white/90 truncate">{session?.user?.email}</p>
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

                                <Link
                                    href="/match/new"
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span className="font-medium">Cosmic Match</span>
                                </Link>

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
