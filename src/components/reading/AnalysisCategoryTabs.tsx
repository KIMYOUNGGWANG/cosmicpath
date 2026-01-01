'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, TrendingUp, Target, Zap } from 'lucide-react';

interface AnalysisCategoryProps {
    categories: {
        id: string;
        label: string;
        icon: React.ElementType;
        content: React.ReactNode;
    }[];
    language?: 'ko' | 'en';
}

export function AnalysisCategoryTabs({ categories, language = 'ko' }: AnalysisCategoryProps) {
    const [activeTab, setActiveTab] = useState(categories[0].id);

    return (
        <section className="mt-8 md:mt-10">
            {/* Tab Navigation */}
            <div className="sticky top-[60px] z-30 bg-deep-navy/95 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-2 mb-6 shadow-xl">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-300",
                                activeTab === cat.id
                                    ? "bg-gold text-deep-navy shadow-[0_0_15px_rgba(255,215,0,0.4)] scale-105"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <cat.icon size={14} className={activeTab === cat.id ? "text-deep-navy" : "text-gray-400"} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[400px]"
                >
                    {categories.find(c => c.id === activeTab)?.content}
                </motion.div>
            </AnimatePresence>
        </section>
    );
}
