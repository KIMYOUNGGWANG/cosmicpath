import { motion } from 'framer-motion';
import { Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlindSpotTeaserProps {
    title: string;
    previewText: string;
    hiddenText: string;
    language: 'ko' | 'en';
    onUnlock: () => void;
}

export function BlindSpotTeaser({ title, previewText, hiddenText, language, onUnlock }: BlindSpotTeaserProps) {
    const isEn = language === 'en';

    return (
        <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-red-900/5 mt-6 group hover:border-red-500/50 transition-colors">
            {/* Header / Hook */}
            <div className="flex items-center gap-3 p-4 border-b border-red-500/10 bg-red-500/5">
                <div className="p-1.5 rounded-full bg-red-500/10 animate-pulse">
                    <AlertTriangle size={16} className="text-red-400" />
                </div>
                <h3 className="font-bold text-red-200 text-sm md:text-base tracking-wide">
                    {title}
                </h3>
            </div>

            {/* Content Area */}
            <div className="p-5 relative">
                {/* Visible Teaser */}
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-2 font-medium">
                    {previewText}
                    <span className="text-gray-500/50 ml-1">...</span>
                </p>

                {/* Blurred/Hidden Content Simulation */}
                <div className="relative">
                    <p className="text-gray-600 blur-[6px] select-none text-sm md:text-base leading-relaxed" aria-hidden="true">
                        {hiddenText}
                    </p>

                    {/* Unlock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onUnlock}
                            className="flex flex-col items-center gap-2 group/btn"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-acc-gold to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover/btn:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-shadow">
                                <Lock size={20} className="text-black" />
                            </div>
                            <span className="text-xs font-bold text-acc-gold tracking-widest uppercase border-b border-acc-gold/30 pb-0.5 group-hover/btn:border-acc-gold transition-colors">
                                {isEn ? "Unlock Meaning" : "의미 확인하기"}
                            </span>
                        </motion.button>
                    </div>
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
