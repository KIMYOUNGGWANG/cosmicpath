'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, Copy, Gift, Twitter } from 'lucide-react';

interface ShareCardProps {
    shareUrl: string;
    readingId?: string;
    trustScore?: number;
    mainCardName?: string;
    className?: string;
}

export function ShareCard({
    shareUrl,
    readingId,
    trustScore = 4.5,
    mainCardName = 'Decision Note',
    className,
}: ShareCardProps) {
    const [copied, setCopied] = useState(false);

    const resolvedReadingId = readingId || shareUrl.split('/').filter(Boolean).at(-1);
    const ogImageUrl = resolvedReadingId
        ? `/api/og/reading/${resolvedReadingId}`
        : `/api/og?title=CosmicPath%20Decision%20Note&score=${trustScore}&card=${encodeURIComponent(mainCardName)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const shareText = `CosmicPath Decision Note로 막혀 있던 질문 하나를 판정했습니다. 신뢰도 ${trustScore}/5.0`;
    const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_50px_rgba(161,132,255,0.15)] hover:shadow-[0_22px_60px_rgba(161,132,255,0.25)] transition-[box-shadow,border-color] duration-500 ${className}`}
        >
            <div className="text-center mb-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-gold/20 border border-accent-gold/50 rounded-full text-accent-gold text-[10px] font-bold tracking-widest uppercase mb-1 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                    <Gift className="w-3 h-3" />
                    Note Reward
                </div>
                <h3 className="text-xl font-cinzel text-white tracking-widest uppercase font-bold">
                    Share & Get 1 Credit
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans px-2 pt-1">
                    정리가 도움이 됐다면, 같은 선택 앞에 선 친구에게도 보내보세요.<br />
                    <strong className="text-accent-gold font-normal">아래 링크로 친구를 초대하면 즉시 후속 질문권 1개가 지급됩니다.</strong>
                </p>
            </div>

            {/* Preview Image */}
            <div className="group relative mb-6 aspect-[1.91/1] w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-2xl">
                <Image
                    src={ogImageUrl}
                    alt="CosmicPath share preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="h-full w-full object-cover opacity-90 transition-[transform,opacity] duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
            </div>

            <div className="space-y-4">
                {/* Copy Link Main Action - Highly Visible */}
                <motion.button
                    onClick={handleCopy}
                    whileHover={{ y: -2, boxShadow: '0 18px 40px rgba(212,175,55,0.28)' }}
                    whileTap={{ scale: 0.985 }}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-accent-gold px-4 py-4 font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-[transform,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/70"
                >
                    {copied ? <Check className="w-5 h-5 relative z-10" /> : <Copy className="w-5 h-5 relative z-10" />}
                    <span className="relative z-10 tracking-widest uppercase text-sm">
                        {copied ? 'Link Copied ✨' : '초대 링크 복사 (크레딧 받기)'}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-xl" />
                </motion.button>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    {/* Threads */}
                    <motion.button
                        onClick={() => window.open(threadsUrl, '_blank')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.985 }}
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-900/80 px-4 py-3 text-xs tracking-wider text-white transition-[transform,background-color,border-color] duration-300 hover:border-zinc-500/60 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                        <span className="font-bold font-sans">@</span> THREADS
                    </motion.button>

                    {/* Twitter */}
                    <motion.button
                        onClick={() => window.open(twitterUrl, '_blank')}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.985 }}
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700/50 bg-black px-4 py-3 text-xs tracking-wider text-white transition-[transform,background-color,border-color] duration-300 hover:border-zinc-500/60 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                        <Twitter className="w-3 h-3" /> X (TWITTER)
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
