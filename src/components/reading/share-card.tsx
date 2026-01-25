'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Twitter } from 'lucide-react';

interface ShareCardProps {
    shareUrl: string;
    trustScore?: number;
    mainCardName?: string;
    className?: string;
}

export function ShareCard({ shareUrl, trustScore = 4.5, mainCardName = 'Destiny', className }: ShareCardProps) {
    const [copied, setCopied] = useState(false);

    // Construct the OG image URL using the relative API path
    const ogImageUrl = `/api/og?title=Destiny Revealed&score=${trustScore}&card=${encodeURIComponent(mainCardName)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const shareText = `CosmicPath에서 내 운명을 확인했습니다. 신뢰도 ${trustScore}/5.0 ✨`;
    const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md max-w-md mx-auto my-8 ${className}`}
        >
            <h3 className="text-lg font-cinzel text-white mb-4 text-center tracking-widest uppercase">
                Share the Prophecy
            </h3>

            {/* Preview Image */}
            <div className="relative aspect-[1.91/1] w-full rounded-xl overflow-hidden mb-6 border border-white/10 shadow-2xl group block bg-black/40">
                {/* We use an img tag for the preview of what will be shared */}
                <img
                    src={ogImageUrl}
                    alt="Share Preview"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
            </div>

            <div className="space-y-3">
                {/* Copy Link Main Action */}
                <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent-gold/10 border border-accent-gold/30 hover:bg-accent-gold/20 text-accent-gold transition-all font-medium"
                >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Link Copied' : 'Copy Link'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                    {/* Threads */}
                    <button
                        onClick={() => window.open(threadsUrl, '_blank')}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black hover:bg-zinc-900 border border-zinc-800 text-white transition-all text-sm"
                    >
                        <span className="font-bold font-sans">@</span> Threads
                    </button>

                    {/* Twitter */}
                    <button
                        onClick={() => window.open(twitterUrl, '_blank')}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#000000] hover:bg-zinc-900 border border-zinc-800 text-white transition-all text-sm"
                    >
                        <Twitter className="w-4 h-4" /> X (Twitter)
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
