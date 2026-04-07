'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles, AlertTriangle, Heart, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeaserCardProps {
    title: string;
    hook: string;
    language: 'ko' | 'en';
    type?: 'danger' | 'love' | 'money' | 'general';
    onUnlock: () => void;
    className?: string;
}

export function TeaserCard({ title, hook, language, type = 'general', onUnlock, className }: TeaserCardProps) {
    const isEn = language === 'en';

    // Type-specific styling and icons
    const config = {
        danger: {
            icon: AlertTriangle,
            color: 'text-red-400',
            bg: 'bg-red-500/5',
            border: 'border-red-500/20',
            glow: 'shadow-[0_0_15px_rgba(248,113,113,0.1)]'
        },
        love: {
            icon: Heart,
            color: 'text-pink-400',
            bg: 'bg-pink-500/5',
            border: 'border-pink-500/20',
            glow: 'shadow-[0_0_15px_rgba(244,114,182,0.1)]'
        },
        money: {
            icon: Coins,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/5',
            border: 'border-emerald-500/20',
            glow: 'shadow-[0_0_15px_rgba(52,211,153,0.1)]'
        },
        general: {
            icon: Sparkles,
            color: 'text-acc-gold',
            bg: 'bg-acc-gold/5',
            border: 'border-acc-gold/20',
            glow: 'shadow-[0_0_15px_rgba(255,215,0,0.1)]'
        }
    }[type];

    const Icon = config.icon;

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className={cn(
                "relative rounded-2xl overflow-hidden border transition-all duration-300 mt-6",
                config.bg,
                config.border,
                config.glow,
                className
            )}
            onClick={onUnlock}
        >
            {/* Header with Hook */}
            <div className="p-5 relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className={cn("p-2 rounded-full bg-black/20", config.color)}>
                        <Icon size={18} />
                    </div>
                    <span className={cn("text-xs font-bold uppercase tracking-widest border px-2 py-0.5 rounded-full", config.color, config.border)}>
                        {isEn ? "Premium Insight" : "프리미엄 분석"}
                    </span>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-cinzel">
                    {title}
                </h3>

                <p className={cn("text-sm md:text-base font-medium leading-relaxed", config.color)}>
                    {hook}
                </p>
            </div>

            {/* Blurred Content Section */}
            <div className="relative p-6 pt-2">
                {/* Fake Content Filtered */}
                <div className="space-y-3 opacity-30 blur-[6px] select-none grayscale mix-blend-overlay">
                    <p className="text-sm text-gray-300">
                        {isEn
                            ? "This area contains a critical analysis of your destiny flow. The elements in your chart indicate a strong shift in energy during the upcoming season."
                            : "이 영역에는 귀하의 운명 흐름에 대한 중요한 분석이 포함되어 있습니다. 귀하의 차트에 있는 오행 요소들은 다가오는 계절에 강력한 에너지 변화를 나타냅니다."}
                    </p>
                    <p className="text-sm text-gray-300">
                        {isEn
                            ? "Behind this question is a clearer reason, a better timing read, and a next step that is already starting to take shape."
                            : "이 질문 뒤에는 타이밍의 어긋남, 지금 눌리는 핵심 포인트, 그리고 먼저 정리해야 할 다음 행동이 숨어 있습니다."}
                    </p>
                    <div className="h-20 w-full bg-white/20 rounded-lg mt-4" />
                </div>

                {/* Unlock Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-deep-navy via-deep-navy/80 to-transparent">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-acc-gold to-amber-600 text-black font-bold rounded-full shadow-lg shadow-acc-gold/20"
                    >
                        <Lock size={16} />
                        <span>{isEn ? "See More" : "더 보기"}</span>
                    </motion.button>
                    <p className="text-xs text-white/40 mt-3 font-light">
                        {isEn ? "The fuller answer to this question is inside" : "이 질문의 더 자세한 답이 안에 있습니다"}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
