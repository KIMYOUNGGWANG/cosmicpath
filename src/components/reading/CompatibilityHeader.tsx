import { motion } from 'framer-motion';
import { Heart, Sparkles, Infinity, Quote } from 'lucide-react';

interface CompatibilityHeaderProps {
    userName: string;
    partnerName: string;
    score: number;
    title: string;
    content: string;
    language?: 'ko' | 'en';
}

export function CompatibilityHeader({ userName, partnerName, score, title, content, language = 'ko' }: CompatibilityHeaderProps) {
    const isEn = language === 'en';

    return (
        <div className="relative w-full max-w-2xl mx-auto mb-12 text-center">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-pink-500/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Names & Connection */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 flex items-center justify-center gap-4 md:gap-8 mb-6"
            >
                <div className="text-center">
                    <div className="text-sm text-white/50 mb-1">{isEn ? 'You' : '본인'}</div>
                    <div className="text-xl md:text-2xl font-bold text-white font-cinzel">{userName}</div>
                </div>

                <div className="relative">
                    <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
                    <Infinity className="w-12 h-12 text-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />
                </div>

                <div className="text-center">
                    <div className="text-sm text-white/50 mb-1">{isEn ? 'Partner' : '상대방'}</div>
                    <div className="text-xl md:text-2xl font-bold text-white font-cinzel">{partnerName}</div>
                </div>
            </motion.div>

            {/* Score Badge */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-200 mb-8"
            >
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-lg">{score}%</span>
                <span className="text-xs uppercase tracking-widest opacity-80">{isEn ? 'Match Score' : '궁합 점수'}</span>
            </motion.div>

            {/* Title & Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 px-4"
            >
                <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-white font-cinzel leading-tight">
                    {title}
                </h1>

                <div className="relative mt-6 p-6 md:p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <Quote className="absolute top-4 left-4 w-6 h-6 text-white/10 rotate-180" />
                    <p className="text-white/80 leading-relaxed text-sm md:text-base whitespace-pre-line font-light">
                        {content}
                    </p>
                    <Quote className="absolute bottom-4 right-4 w-6 h-6 text-white/10" />
                </div>
            </motion.div>
        </div>
    );
}
