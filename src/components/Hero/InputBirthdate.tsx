'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface InputBirthdateProps {
    onDateSelect: (date: string) => void;
    label?: string;
}

export function InputBirthdate({ onDateSelect, label }: InputBirthdateProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="flex flex-col items-center w-full max-w-xs mx-auto">
            {label && (
                <label className="text-xs uppercase tracking-[0.2em] text-fg-secondary mb-4 opacity-70">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                <input
                    type="date"
                    onChange={(e) => onDateSelect(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="w-full bg-transparent border-none text-fg-primary text-xl md:text-2xl py-3 text-center focus:outline-none appearance-none cursor-pointer"
                    style={{ WebkitAppearance: 'none' }}
                />
                {/* Animated underline */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10" />
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFocused ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-0 left-0 w-full h-[1px] bg-accent-gold origin-left"
                />
            </div>
        </div>
    );
}
