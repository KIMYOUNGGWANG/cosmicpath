'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ScarcityTimerProps {
    durationMinutes?: number;
    language: 'ko' | 'en';
    onExpire?: () => void;
    compact?: boolean;
}

function getInitialTimerState(durationMinutes: number) {
    if (typeof window === 'undefined') {
        return {
            timeLeft: durationMinutes * 60,
            isActive: true,
        };
    }

    const savedEndTime = sessionStorage.getItem('scarcity_timer_end');

    if (savedEndTime) {
        const remaining = Math.max(0, Math.ceil((parseInt(savedEndTime, 10) - Date.now()) / 1000));
        return {
            timeLeft: remaining,
            isActive: remaining > 0,
        };
    }

    const end = Date.now() + durationMinutes * 60 * 1000;
    sessionStorage.setItem('scarcity_timer_end', end.toString());

    return {
        timeLeft: durationMinutes * 60,
        isActive: true,
    };
}

export function ScarcityTimer({ durationMinutes = 15, language, onExpire, compact = false }: ScarcityTimerProps) {
    const isEn = language === 'en';
    const [initialTimerState] = useState(() => getInitialTimerState(durationMinutes));
    const [timeLeft, setTimeLeft] = useState(initialTimerState.timeLeft);
    const [isActive, setIsActive] = useState(initialTimerState.isActive);

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
        <div
            className={`flex items-center rounded-full border border-red-500/20 bg-red-500/10 font-bold text-red-400 ${
                compact ? 'gap-1.5 px-2.5 py-1 text-[11px]' : 'gap-2 px-3 py-1.5 text-xs md:text-sm'
            }`}
        >
            <Clock size={compact ? 12 : 14} />
            <span>
                {compact
                    ? (isEn ? 'Ends' : '마감')
                    : (isEn ? 'Offer expires in:' : '할인 마감:')}
            </span>
            <span className={`font-mono tabular-nums ${compact ? 'text-[13px]' : 'text-base'}`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
}
