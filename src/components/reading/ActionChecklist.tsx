'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Circle, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionItem {
    date: string;
    title: string;
    description: string;
    type: string;
}

interface ActionChecklistProps {
    items: ActionItem[];
    language?: 'ko' | 'en';
    storageKey?: string;
}

export function ActionChecklist({ items, language = 'ko', storageKey = 'cosmic-action-checklist' }: ActionChecklistProps) {
    const isEn = language === 'en';
    const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setCheckedItems(new Set(parsed));
            } catch (e) {
                console.error('Failed to parse checklist state:', e);
            }
        }
        setIsHydrated(true);
    }, [storageKey]);

    // Save to localStorage when checkedItems changes
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(storageKey, JSON.stringify([...checkedItems]));
        }
    }, [checkedItems, storageKey, isHydrated]);

    const toggleItem = (index: number) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const completedCount = checkedItems.size;
    const totalCount = items.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    if (!items || items.length === 0) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-8 px-4 md:px-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Target size={18} className="text-[#d4af37]" />
                    <span>{isEn ? 'Action Checklist' : '행동 체크리스트'}</span>
                </h2>
                <span className="text-xs text-white/50">
                    {completedCount}/{totalCount} {isEn ? 'completed' : '완료'}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                <motion.div
                    className="h-full bg-gradient-to-r from-[#d4af37] to-amber-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
                {items.map((item, index) => {
                    const isChecked = checkedItems.has(index);
                    const cleanTitle = (item.title || '').replace(/[🚀⚠️💰👉🎂📋✨⚡🤝]/g, '').trim();
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleItem(index)}
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-300",
                                isChecked
                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                    : "bg-[#141622]/80 border-white/10 hover:border-[#d4af37]/40 hover:bg-[#1a1e30]"
                            )}
                        >
                            {/* Checkbox */}
                            <div className={cn(
                                "w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all",
                                isChecked
                                    ? "bg-emerald-500 text-white"
                                    : "border border-white/30 bg-black/20"
                            )}>
                                {isChecked ? (
                                    <Check size={13} strokeWidth={3} />
                                ) : (
                                    <Circle size={10} className="opacity-0" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        "text-xs md:text-sm font-bold transition-all truncate",
                                        isChecked ? "text-emerald-400 line-through opacity-70" : "text-white"
                                    )}>
                                        {cleanTitle || item.title}
                                    </span>
                                    {item.date && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white/50 shrink-0">
                                            {item.date}
                                        </span>
                                    )}
                                </div>
                                <p className={cn(
                                    "text-xs leading-relaxed transition-all",
                                    isChecked ? "text-white/30 line-through" : "text-stone-400"
                                )}>
                                    {item.description}
                                </p>
                            </div>

                            {/* Type Badge */}
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border",
                                item.type === 'urgent' || item.type === 'warning'
                                    ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                    : item.type === 'opportunity'
                                        ? "bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30"
                                        : "bg-white/10 text-stone-300 border-white/10"
                            )}>
                                {item.type === 'urgent' || item.type === 'warning'
                                    ? (isEn ? 'Defend' : '방어')
                                    : item.type === 'opportunity'
                                        ? (isEn ? 'Action' : '실행')
                                        : (isEn ? 'Review' : '검토')}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Completion Message */}
            {progress === 100 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-center flex flex-col items-center"
                >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-1.5">
                        <Award size={18} />
                    </div>
                    <p className="text-xs font-bold text-emerald-300">
                        {isEn ? 'All strategic actions completed' : '모든 행동 지침을 성공적으로 완수했습니다'}
                    </p>
                </motion.div>
            )}
        </motion.section>
    );
}

