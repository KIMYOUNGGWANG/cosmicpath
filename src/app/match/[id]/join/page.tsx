'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Users, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function MatchJoinPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [hostName, setHostName] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [unknownTime, setUnknownTime] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionError, setSessionError] = useState<string | null>(null);

    // Auto-formatting helper functions
    const handleDateChange = (val: string) => {
        const numbers = val.replace(/\D/g, '');
        let formatted = numbers;
        if (numbers.length > 4) {
            formatted = `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        }
        if (numbers.length > 6) {
            formatted = `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
        }
        setBirthDate(formatted);
    };

    const handleTimeChange = (val: string) => {
        const numbers = val.replace(/\D/g, '');
        let formatted = numbers;
        if (numbers.length > 2) {
            formatted = `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
        }
        setBirthTime(formatted);
    };

    // Fetch session info
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`/api/match/${id}`);
                const data = await response.json();

                if (!response.ok) {
                    setSessionError(data.error || 'Session not found');
                    return;
                }

                if (data.isExpired) {
                    setSessionError('이 초대 링크는 만료되었습니다.');
                    return;
                }

                if (data.hasGuest) {
                    router.replace(`/match/${id}/result`);
                    return;
                }

                setHostName(data.hostName);
            } catch (err) {
                setSessionError('세션 정보를 불러오는데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSession();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !birthDate) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/match/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: id,
                    guestName: name.trim(),
                    guestBirth: birthDate,
                    guestBirthTime: unknownTime ? '12:00' : birthTime,
                    guestTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to join');
            }

            router.push(`/match/${id}/result`);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--acc-gold)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (sessionError) {
        return (
            <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md glass-card p-8 text-center border-red-500/30"
                >
                    <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
                    <h1 className="text-xl font-cinzel font-bold text-white mb-2">오류</h1>
                    <p className="text-[var(--fg-moonlight)]">{sessionError}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[var(--bg-deep)] text-white">
            <div className="noise-overlay" />
            <div className="cosmic-dust" />
            <div className="aurora-bg opacity-70" />

            <div className="container-cosmic min-h-screen flex items-center justify-center py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md relative z-10"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 mb-6 relative"
                        >
                            <div className="absolute inset-0 rounded-full blur-md bg-purple-500/20 animate-pulse pointer-events-none" />
                            <Users className="text-purple-400 relative z-10" size={36} />
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#EFEFEF] to-[#9CA3AF] mb-3">
                            Join Compatibility
                        </h1>
                        <p className="text-[var(--fg-moonlight)] font-outfit text-sm tracking-wide">
                            <span className="text-[var(--acc-gold)] font-medium mx-1">{hostName}</span> has invited you
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="glass-card p-8 space-y-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            {/* Name Input */}
                            <div className="relative z-10">
                                <label className="block text-xs font-bold text-[var(--acc-gold)] uppercase tracking-widest mb-2 font-cinzel">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="이름 / 닉네임"
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-lg text-white focus:outline-none focus:border-[var(--acc-gold)] transition-colors font-cinzel placeholder:text-white/30"
                                    required
                                />
                            </div>

                            {/* Birth Date Input */}
                            <div className="relative z-10">
                                <label className="block text-xs font-bold text-[var(--acc-gold)] uppercase tracking-widest mb-2 font-cinzel">
                                    Birth Date
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={birthDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    placeholder="YYYY-MM-DD"
                                    maxLength={10}
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-lg text-white focus:outline-none focus:border-[var(--acc-gold)] transition-colors font-mono placeholder:text-white/30"
                                    required
                                />
                                <p className="mt-2 text-[10px] text-[var(--fg-moonlight)] font-mono tracking-widest">
                                    YYYY-MM-DD (예: 1995-03-15)
                                </p>
                            </div>

                            {/* Birth Time Input */}
                            <div className="relative z-10">
                                <label className="block text-xs font-bold text-[var(--acc-gold)] uppercase tracking-widest mb-2 font-cinzel">
                                    Birth Time (Optional)
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={birthTime}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    placeholder="HH:MM"
                                    maxLength={5}
                                    disabled={unknownTime}
                                    className={`w-full bg-transparent border-b border-white/20 py-3 text-lg text-white focus:outline-none focus:border-[var(--acc-gold)] transition-colors font-mono placeholder:text-white/30 ${unknownTime ? 'opacity-30 cursor-not-allowed' : ''}`}
                                />
                                <p className="mt-2 text-[10px] text-[var(--fg-moonlight)] font-mono tracking-widest mb-3">
                                    HH:MM (태어난 시간)
                                </p>

                                {/* Unknown Time Checkbox */}
                                <div
                                    className="flex items-start gap-3 cursor-pointer group/check"
                                    onClick={() => {
                                        const newState = !unknownTime;
                                        setUnknownTime(newState);
                                        if (newState) setBirthTime('12:00');
                                    }}
                                >
                                    <div className={`mt-0.5 w-4 h-4 border transition-colors flex items-center justify-center ${unknownTime ? 'border-[var(--acc-gold)] bg-[var(--acc-gold)]/10' : 'border-white/20 group-hover/check:border-white/40'}`}>
                                        {unknownTime && (
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 4L3.5 6.5L9 1" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="square" />
                                            </svg>
                                        )}
                                    </div>
                                    <label className="text-[10px] text-[var(--fg-moonlight)] cursor-pointer leading-tight pt-0.5 group-hover/check:text-white transition-colors select-none">
                                        시간 모름 (낮 12시 기준)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm text-center font-outfit"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim() || !birthDate}
                            className="btn-primary w-full flex items-center justify-center gap-2 group relative overflow-hidden"
                        >
                            <span className="relative z-10 font-cinzel tracking-wider flex items-center gap-2">
                                {isSubmitting ? (
                                    <span className="animate-pulse">Analyzing...</span>
                                ) : (
                                    <>
                                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                        Reveal Compatibility
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none" />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
