'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Five Elements with daily advice
const ELEMENTS = [
    {
        name: '木',
        en: 'Wood',
        color: '#22C55E',
        icon: '🌳',
        advice: {
            ko: '새로운 시작에 유리한 날입니다. 창의적인 아이디어를 실행에 옮겨보세요.',
            en: 'A day for new beginnings. Put your creative ideas into action.'
        },
        tip: { ko: '초록색 착용 추천', en: 'Wear green' }
    },
    {
        name: '火',
        en: 'Fire',
        color: '#EF4444',
        icon: '🔥',
        advice: {
            ko: '열정과 에너지가 넘치는 날입니다. 중요한 발표나 미팅을 잡아보세요.',
            en: 'A day full of passion and energy. Schedule important presentations.'
        },
        tip: { ko: '붉은색 착용 추천', en: 'Wear red' }
    },
    {
        name: '土',
        en: 'Earth',
        color: '#F59E0B',
        icon: '🏔️',
        advice: {
            ko: '안정과 신뢰를 쌓는 날입니다. 관계를 돈독히 하는 활동이 좋습니다.',
            en: 'A day for stability and trust. Focus on strengthening relationships.'
        },
        tip: { ko: '갈색/베이지 착용 추천', en: 'Wear brown/beige' }
    },
    {
        name: '金',
        en: 'Metal',
        color: '#94A3B8',
        icon: '⚔️',
        advice: {
            ko: '결단력이 빛나는 날입니다. 미루던 결정을 내리기에 좋습니다.',
            en: 'A day for decisive action. Make those delayed decisions.'
        },
        tip: { ko: '흰색/은색 착용 추천', en: 'Wear white/silver' }
    },
    {
        name: '水',
        en: 'Water',
        color: '#3B82F6',
        icon: '🌊',
        advice: {
            ko: '유연하게 흘러가는 날입니다. 억지로 밀어붙이지 말고 자연스럽게.',
            en: 'A day to go with the flow. Don\'t force things, be natural.'
        },
        tip: { ko: '검정/남색 착용 추천', en: 'Wear black/navy' }
    },
];

interface DailyPulseProps {
    language?: 'ko' | 'en';
}

export function DailyPulse({ language = 'ko' }: DailyPulseProps) {
    const isEn = language === 'en';

    // Get today's element based on date (deterministic)
    const todayElement = useMemo(() => {
        const today = new Date();
        const dayOfYear = Math.floor(
            (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
        );
        return ELEMENTS[dayOfYear % 5];
    }, []);

    // Format date
    const formattedDate = useMemo(() => {
        const today = new Date();
        if (isEn) {
            return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    }, [isEn]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden"
        >
            <div
                className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-4"
                style={{
                    background: `linear-gradient(135deg, ${todayElement.color}15 0%, ${todayElement.color}05 100%)`,
                    borderBottom: `1px solid ${todayElement.color}30`,
                }}
            >
                {/* Left: Element Icon & Date */}
                <div className="flex items-center gap-3 shrink-0">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="text-2xl md:text-3xl"
                    >
                        {todayElement.icon}
                    </motion.div>
                    <div>
                        <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-wider font-medium">
                            {isEn ? "Today's Energy" : '오늘의 기운'}
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="text-sm md:text-base font-bold"
                                style={{ color: todayElement.color }}
                            >
                                {todayElement.name} ({todayElement.en})
                            </span>
                            <span className="text-[10px] text-white/30">•</span>
                            <span className="text-[10px] md:text-xs text-white/40">{formattedDate}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Advice */}
                <div className="flex-1 text-right">
                    <p className="text-xs md:text-sm text-white/80 leading-relaxed line-clamp-2">
                        {isEn ? todayElement.advice.en : todayElement.advice.ko}
                    </p>
                    <p
                        className="text-[10px] md:text-xs mt-1 font-medium"
                        style={{ color: todayElement.color }}
                    >
                        💡 {isEn ? todayElement.tip.en : todayElement.tip.ko}
                    </p>
                </div>
            </div>

            {/* Animated gradient line at bottom */}
            <motion.div
                className="absolute bottom-0 left-0 h-[2px] w-full"
                style={{
                    background: `linear-gradient(90deg, transparent, ${todayElement.color}, transparent)`
                }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
        </motion.div>
    );
}
