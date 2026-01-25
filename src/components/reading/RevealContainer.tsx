'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface RevealContainerProps {
    children: React.ReactNode;
    onReveal?: () => void;
    title?: string;
}

export function RevealContainer({ children, onReveal, title = "UNSEAL YOUR DESTINY" }: RevealContainerProps) {
    const [isRevealed, setIsRevealed] = useState(false);

    const handleReveal = () => {
        if (isRevealed) return;
        setIsRevealed(true);
        if (onReveal) {
            setTimeout(onReveal, 800); // Trigger callback after animation starts
        }
    };

    return (
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] perspective-[2000px]">
            <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isRevealed ? 180 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                {/* Front (Sealed) */}
                <div
                    className="absolute inset-0 backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div
                        onClick={handleReveal}
                        className="w-full h-full cursor-pointer relative group rounded-2xl overflow-hidden border border-acc-gold/50 shadow-[0_0_50px_rgba(212,175,55,0.2)] bg-gradient-to-br from-[#1a1230] to-bg-void hover:shadow-[0_0_80px_rgba(212,175,55,0.4)] transition-shadow duration-500"
                    >
                        {/* Texture/Pattern */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

                        {/* Glowing Core */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-32 h-32 rounded-full bg-acc-gold/20 blur-2xl absolute"
                            />

                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <Sparkles className="w-12 h-12 text-acc-gold animate-pulse" />
                                <h3 className="font-cinzel text-xl text-acc-gold tracking-[0.3em] uppercase">
                                    {title}
                                </h3>
                                <span className="text-xs text-moonlight tracking-widest mt-2 group-hover:text-white transition-colors">
                                    Tap to Reveal
                                </span>
                            </div>
                        </div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-y-full group-hover:translate-y-[-200%] transition-transform duration-1000 ease-in-out" />
                    </div>
                </div>

                {/* Back (Result) */}
                <div
                    className="absolute inset-0 backface-hidden h-full w-full"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    <div className="w-full h-full rounded-2xl bg-bg-surface border border-white/10 overflow-auto relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-acc-gold/5 to-transparent pointer-events-none" />
                        {children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
