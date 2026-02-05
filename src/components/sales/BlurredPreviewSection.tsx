'use client';

import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlurredPreviewSectionProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    onUnlock: () => void;
    language: 'ko' | 'en';
    icon?: React.ReactNode;
    className?: string;
}

/**
 * BlurredPreviewSection
 * 실제 프리미엄 콘텐츠를 블러 처리하여 보여주는 Paywall 컴포넌트.
 * FOMO를 극대화하여 전환율을 높입니다.
 */
export function BlurredPreviewSection({
    children,
    title,
    subtitle,
    onUnlock,
    language,
    icon,
    className,
}: BlurredPreviewSectionProps) {
    const isEn = language === 'en';

    return (
        <div className={cn("relative mt-6 mx-4 md:mx-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {icon || <Sparkles size={18} className="text-[#FFD700]" />}
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30">
                    {isEn ? 'Premium' : '프리미엄'}
                </span>
            </div>

            {subtitle && (
                <p className="text-sm text-white/60 mb-4">{subtitle}</p>
            )}

            {/* Blurred Content Container */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                {/* Actual Content - Heavily Blurred */}
                <div
                    className="blur-[8px] select-none pointer-events-none opacity-70 max-h-[300px] overflow-hidden"
                    aria-hidden="true"
                >
                    {children}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F1419]" />

                {/* Unlock CTA Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onUnlock}
                        className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold rounded-full shadow-lg shadow-[#FFD700]/20 transition-all hover:shadow-[#FFD700]/40"
                    >
                        <Lock size={16} />
                        <span>{isEn ? 'Unlock Full Analysis' : '전체 분석 잠금 해제'}</span>
                    </motion.button>
                    <p className="text-xs text-white/40 mt-3 text-center max-w-[200px]">
                        {isEn
                            ? 'Your personalized insight is ready'
                            : '당신만을 위한 분석이 준비되어 있습니다'}
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-[#FFD700]/50 animate-pulse" />
                </div>
                <div className="absolute bottom-4 left-4 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-[#FFD700]/30 animate-pulse delay-300" />
                </div>
            </div>
        </div>
    );
}

/**
 * BlurredPreviewWrapper
 * 조건부 블러 처리를 위한 간편 래퍼.
 * isPremium이 true면 children을, false면 블러 처리된 children을 보여줍니다.
 */
interface BlurredPreviewWrapperProps extends Omit<BlurredPreviewSectionProps, 'children'> {
    isPremium: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function BlurredPreviewWrapper({
    isPremium,
    children,
    fallback,
    ...props
}: BlurredPreviewWrapperProps) {
    if (isPremium) {
        return <>{children}</>;
    }

    // 데이터가 없으면 fallback 사용
    if (!children && fallback) {
        return <>{fallback}</>;
    }

    return (
        <BlurredPreviewSection {...props}>
            {children}
        </BlurredPreviewSection>
    );
}
