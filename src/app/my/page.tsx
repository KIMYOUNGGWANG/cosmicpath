"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Loader2, Sparkles } from "lucide-react";

interface ReadingSummary {
    id: string;
    createdAt: string;
    metadata: string | null;
}

export default function MyPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [readings, setReadings] = useState<ReadingSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        } else if (status === "authenticated") {
            fetchReadings();
        }
    }, [status, router]);

    const fetchReadings = async () => {
        try {
            const res = await fetch("/api/user/readings");
            if (res.ok) {
                const data = await res.json();
                setReadings(data.readings);
            }
        } catch (error) {
            console.error("Failed to load readings", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 px-4 pb-12">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-cinzel text-starlight mb-2">
                        My Journey
                    </h1>
                    <p className="text-white/60 font-outfit">
                        Your cosmic history and saved insights.
                    </p>
                </header>

                {readings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 glass-card rounded-2xl"
                    >
                        <Sparkles className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-4" />
                        <h3 className="text-xl font-cinzel text-white mb-2">No Readings Yet</h3>
                        <p className="text-white/60 mb-6 font-outfit">
                            Your destiny is waiting to be uncovered.
                        </p>
                        <Link
                            href="/start?reset=true"
                            className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FDD835] text-black font-bold rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1"
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
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                        initial="hidden"
                        animate="show"
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {readings.map((reading) => {
                            let meta: any = {};
                            try {
                                meta = reading.metadata ? JSON.parse(reading.metadata) : {};
                            } catch (e) { }

                            const date = new Date(reading.createdAt).toLocaleDateString("en-US", {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });

                            return (
                                <motion.div
                                    key={reading.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        show: { opacity: 1, y: 0 }
                                    }}
                                >
                                    <Link
                                        href={`/share/${reading.id}?view=full`}
                                        className="group block p-6 glass-card glass-card-hover rounded-xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Sparkles className="w-12 h-12 text-white" />
                                        </div>

                                        <div className="flex flex-col h-full justify-between relative z-10">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="px-2 py-1 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase font-bold tracking-wider rounded backdrop-blur-md">
                                                        Premium
                                                    </span>
                                                    <span className="text-white/40 text-xs flex items-center gap-1 font-outfit">
                                                        <Calendar className="w-3 h-3" />
                                                        {date}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-cinzel font-bold text-starlight group-hover:text-[#D4AF37] transition-colors mb-2 line-clamp-2">
                                                    {meta.title || "Cosmic Analysis Report"}
                                                </h3>
                                                <p className="text-white/50 text-sm font-outfit">
                                                    {meta.readingData?.name || meta.name || "User"} • {meta.readingData?.birthDate || meta.birthDate || "Unknown Date"}
                                                </p>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between text-sm text-white/40 group-hover:text-white/80 transition-colors">
                                                <span className="font-outfit">View Report</span>
                                                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
