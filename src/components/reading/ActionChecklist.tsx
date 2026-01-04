'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, Circle, Target } from 'lucide-react';
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
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target size={18} className="text-gold" />
                    {isEn ? 'Action Checklist' : '행동 체크리스트'}
                </h2>
                <span className="text-xs text-white/50">
                    {completedCount}/{totalCount} {isEn ? 'completed' : '완료'}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                <motion.div
                    className="h-full bg-gradient-to-r from-gold to-amber-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
                {items.map((item, index) => {
                    const isChecked = checkedItems.has(index);
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => toggleItem(index)}
                            className={cn(
                                "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-300",
                                isChecked
                                    ? "bg-green-500/10 border-green-500/30"
                                    : "bg-white/5 border-white/10 hover:border-gold/30"
                            )}
                        >
                            {/* Checkbox */}
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all",
                                isChecked
                                    ? "bg-green-500 text-white"
                                    : "border-2 border-white/30"
                            )}>
                                {isChecked ? (
                                    <Check size={14} strokeWidth={3} />
                                ) : (
                                    <Circle size={14} className="opacity-0" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        "text-sm font-bold transition-all",
                                        isChecked ? "text-green-400 line-through opacity-70" : "text-white"
                                    )}>
                                        {item.title}
                                    </span>
                                    {item.date && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                                            {item.date}
                                        </span>
                                    )}
                                </div>
                                <p className={cn(
                                    "text-xs leading-relaxed transition-all",
                                    isChecked ? "text-white/30 line-through" : "text-white/60"
                                )}>
                                    {item.description}
                                </p>
                            </div>

                            {/* Type Badge */}
                            <span className={cn(
                                "text-[10px] px-2 py-1 rounded-full shrink-0",
                                item.type === 'urgent' ? "bg-red-500/20 text-red-300" :
                                    item.type === 'opportunity' ? "bg-gold/20 text-gold" :
                                        "bg-white/10 text-white/50"
                            )}>
                                {item.type === 'urgent' ? (isEn ? 'Urgent' : '긴급') :
                                    item.type === 'opportunity' ? (isEn ? 'Chance' : '기회') :
                                        (isEn ? 'Task' : '할 일')}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Completion Message */}
            {progress === 100 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/10 rounded-xl border border-green-500/30 text-center"
                >
                    <span className="text-2xl">🎉</span>
                    <p className="text-sm text-green-300 font-medium mt-1">
                        {isEn ? 'All tasks completed! You\'re mastering your destiny.' : '모든 행동 지침 완료! 운명을 주도하고 있습니다.'}
                    </p>
                </motion.div>
            )}
        </motion.section>
    );
}
