import { motion } from 'framer-motion';
import { Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlindSpotTeaserProps {
    title: string;
    previewText: string;
    hiddenText: string;
    language: 'ko' | 'en';
    isLocked?: boolean;
    onUnlock: () => void;
}

export function BlindSpotTeaser({ title, previewText, hiddenText, language, isLocked = false, onUnlock }: BlindSpotTeaserProps) {
    const isEn = language === 'en';

    return (
        <div className="relative overflow-hidden rounded-xl border border-gold/30 bg-gold/5 mt-6 group transition-colors">
            {/* Header / Hook */}
            <div className="flex items-center justify-between p-4 border-b border-gold/10 bg-gold/5">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-gold/10">
                        <Sparkles size={16} className="text-gold" />
                    </div>
                    <h3 className="font-bold text-starlight text-sm md:text-base tracking-wide flex items-center gap-2">
                        {title}
                    </h3>
                </div>
                <div className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest border font-bold h-fit transition-all duration-500",
                    isLocked
                        ? "bg-red-500/10 text-red-300 border-red-500/20"
                        : "bg-gold/20 text-gold border-gold/30"
                )}>
                    {isEn
                        ? (isLocked ? 'Locked' : 'Unlocked')
                        : (isLocked ? '잠금됨' : '잠금 해제됨')}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 relative">
                {/* Visible Teaser */}
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4 font-medium italic border-l-2 border-gold/30 pl-4">
                    {previewText}
                </p>

                {/* Hidden Content Area */}
                <div className="relative p-4 rounded-lg bg-white/5 border border-white/10 shadow-inner overflow-hidden min-h-[80px]">
                    <p className={cn(
                        "text-starlight text-sm md:text-base leading-relaxed transition-all duration-1000",
                        isLocked && "blur-md select-none opacity-50"
                    )}>
                        {hiddenText}
                    </p>

                    {/* Lock Overlay */}
                    {isLocked && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[2px]">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onUnlock}
                                className="flex items-center gap-2 bg-gradient-to-r from-gold to-yellow-600 text-black font-bold text-xs px-4 py-2 rounded-full shadow-lg hover:shadow-gold/20 transition-all"
                            >
                                <Lock size={12} fill="currentColor" />
                                {isEn ? 'Unlock Deep Insight' : '숨겨진 깊은 통찰 읽기'}
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
}
