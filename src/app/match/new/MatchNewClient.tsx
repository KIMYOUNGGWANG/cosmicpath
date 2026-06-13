'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MatchNewClient() {
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [unknownTime, setUnknownTime] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !birthDate) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/match/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hostName: name.trim(),
                    hostBirth: birthDate,
                    hostBirthTime: unknownTime ? '12:00' : birthTime,
                    hostTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create invite');
            }

            setInviteUrl(data.inviteUrl);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!inviteUrl) return;
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[var(--bg-deep)] text-white">
            <div className="noise-overlay" />
            <div className="cosmic-dust" />
            <div className="aurora-bg opacity-70" />

            <div className="container-cosmic min-h-screen flex items-center justify-center py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-6 relative"
                        >
                            <div className="absolute inset-0 rounded-full blur-md bg-pink-500/20 animate-pulse pointer-events-none" />
                            <Heart className="text-pink-400 relative z-10" size={36} />
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#EFEFEF] to-[#9CA3AF] mb-3">
                            Cosmic Affinity
                        </h1>
                        <p className="text-[var(--fg-moonlight)] font-outfit text-sm tracking-wide">
                            당신과 상대방의 관계 흐름을 확인해보세요
                        </p>
                    </div>

                    {!inviteUrl ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="glass-card p-8 space-y-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

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

                                    <div
                                        className="flex items-start gap-3 cursor-pointer group/check"
                                        onClick={() => {
                                            const newState = !unknownTime;
                                            setUnknownTime(newState);
                                            if (newState) setBirthTime('12:00');
                                        }}
                                    >
                                        <div className={`mt-0.5 w-4 h-4 border transition-colors flex items-center justify-center ${unknownTime ? 'border-[var(--acc-gold)] bg-[var(--acc-gold)]/10' : 'border-white/20 group-hover/check:border-white/40'}`}>
                                            {unknownTime ? (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 4L3.5 6.5L9 1" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="square" />
                                                </svg>
                                            ) : null}
                                        </div>
                                        <label className="text-[10px] text-[var(--fg-moonlight)] cursor-pointer leading-tight pt-0.5 group-hover/check:text-white transition-colors select-none">
                                            시간 모름 (낮 12시 기준)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {error ? (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-400 text-sm text-center font-outfit"
                                >
                                    {error}
                                </motion.p>
                            ) : null}

                            <motion.button
                                type="submit"
                                disabled={isLoading || !name.trim() || !birthDate}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full relative py-6 px-10 rounded-2xl font-cinzel tracking-[0.25em] font-bold overflow-hidden transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed group"
                            >
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-[var(--acc-gold)]/30 group-hover:border-[var(--acc-gold)]/60 transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.05)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]" />
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--acc-gold)]/10 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />
                                </div>

                                <span className="relative z-10 flex items-center justify-center gap-3 text-[var(--acc-gold)] group-hover:text-white transition-all duration-300">
                                    {isLoading ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-[var(--acc-gold)] border-t-transparent rounded-full animate-spin" />
                                            <span className="animate-pulse tracking-widest text-xs">SUMMONING STARS...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Sparkles size={20} className="text-[var(--acc-gold)] group-hover:rotate-12 group-hover:scale-125 transition-all duration-500" />
                                            <span className="text-sm md:text-base">Generate Invite Link</span>
                                            <ArrowRight size={18} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-75" />
                                        </>
                                    )}
                                </span>

                                <div className="absolute -inset-4 bg-[var(--acc-gold)]/5 blur-3xl opacity-100 group-hover:bg-[var(--acc-gold)]/15 transition-all duration-1000 pointer-events-none" />
                            </motion.button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="glass-card p-8 text-center relative overflow-hidden">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                                    <Check className="text-green-400" size={28} />
                                </div>
                                <h2 className="text-xl font-cinzel font-bold text-white mb-2">Link Generated</h2>
                                <p className="text-[var(--fg-moonlight)] text-sm mb-6 font-outfit">
                                    아래 링크를 복사하여 상대방에게 전달하세요
                                </p>

                                <div className="bg-black/40 border border-white/5 rounded-xl p-4 break-all text-xs text-[var(--acc-gold)] font-mono mb-6 relative group">
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    {inviteUrl}
                                </div>

                                <motion.button
                                    onClick={handleCopy}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--acc-gold)]/30 transition-all duration-300 font-cinzel text-sm tracking-widest flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    {copied ? (
                                        <>
                                            <Check size={18} className="text-green-400 animate-in zoom-in duration-300" />
                                            <span className="text-green-400">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} className="text-white/40 group-hover:text-[var(--acc-gold)] group-hover:scale-110 transition-all duration-300" />
                                            <span className="text-white/70 group-hover:text-white transition-colors">Copy Link</span>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                                </motion.button>
                            </div>

                            <div className="text-center">
                                <Link
                                    href="/"
                                    className="text-[var(--fg-moonlight)] hover:text-white text-sm transition-colors inline-flex items-center gap-1 font-outfit"
                                >
                                    Back to Home <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
