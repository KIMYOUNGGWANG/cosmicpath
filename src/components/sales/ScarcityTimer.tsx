'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';

interface ScarcityTimerProps {
    durationMinutes?: number;
    language: 'ko' | 'en';
    onExpire?: () => void;
}

export function ScarcityTimer({ durationMinutes = 15, language, onExpire }: ScarcityTimerProps) {
    const isEn = language === 'en';
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        // Try to recover from sessionStorage
        const savedEndTime = sessionStorage.getItem('scarcity_timer_end');

        if (savedEndTime) {
            const now = Date.now();
            const end = parseInt(savedEndTime);
            const remaining = Math.max(0, Math.ceil((end - now) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) setIsActive(false);
        } else {
            // First run
            const now = Date.now();
            const end = now + durationMinutes * 60 * 1000;
            sessionStorage.setItem('scarcity_timer_end', end.toString());
        }
    }, [durationMinutes]);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) {
            if (timeLeft === 0 && onExpire) onExpire();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeLeft, onExpire]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (timeLeft <= 0) return null;

    return (
        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 animate-pulse">
            <Clock size={14} className="animate-spin-slow" />
            <span>
                {isEn ? "Offer expires in:" : "할인 마감:"}
            </span>
            <span className="font-mono text-base tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
}
