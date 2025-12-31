import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlindSpotTeaserProps {
    title: string;
    previewText: string;
    hiddenText: string;
    language: 'ko' | 'en';
    onUnlock: () => void;
}

export function BlindSpotTeaser({ title, previewText, hiddenText, language }: BlindSpotTeaserProps) {
    const isEn = language === 'en';

    return (
        <div className="relative overflow-hidden rounded-xl border border-gold/30 bg-gold/5 mt-6 group transition-colors">
            {/* Header / Hook */}
            <div className="flex items-center gap-3 p-4 border-b border-gold/10 bg-gold/5">
                <div className="p-1.5 rounded-full bg-gold/10">
                    <Sparkles size={16} className="text-gold" />
                </div>
                <h3 className="font-bold text-starlight text-sm md:text-base tracking-wide flex items-center gap-2">
                    {title}
                    <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full uppercase tracking-widest border border-gold/30">
                        {isEn ? 'Unlocked' : '잠금 해제됨'}
                    </span>
                </h3>
            </div>

            {/* Content Area */}
            <div className="p-5 relative">
                {/* Visible Teaser */}
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4 font-medium italic border-l-2 border-gold/30 pl-4">
                    {previewText}
                </p>

                {/* Revealed Content */}
                <div className="relative p-4 rounded-lg bg-white/5 border border-white/10 shadow-inner">
                    <p className="text-starlight text-sm md:text-base leading-relaxed">
                        {hiddenText}
                    </p>
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
