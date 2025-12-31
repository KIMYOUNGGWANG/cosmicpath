import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface StickyCTAProps {
    price: string;
    originalPrice: string;
    onUnlock: () => void;
    language: 'ko' | 'en';
}

export function StickyCTA({ price, originalPrice, onUnlock, language }: StickyCTAProps) {
    const [isVisible, setIsVisible] = useState(false);
    const isEn = language === 'en';

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling down 300px
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[400px] z-50 safe-area-bottom"
                >
                    <div className="bg-deep-navy/90 backdrop-blur-xl border border-acc-gold/30 rounded-full p-2 pl-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                <Clock size={10} className="text-red-400 animate-pulse" />
                                {isEn ? "Offer ends soon" : "할인 마감 임박"}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-gray-500 line-through text-xs font-serif">{originalPrice}</span>
                                <span className="text-acc-gold font-bold font-cinzel text-lg">{price}</span>
                            </div>
                        </div>

                        <button
                            onClick={onUnlock}
                            className="bg-gradient-to-r from-acc-gold to-amber-600 text-black font-bold px-6 py-3 rounded-full text-sm hover:scale-105 transition-transform shadow-lg"
                        >
                            {isEn ? "Unlock Destination" : "내 운명 확인하기"}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
