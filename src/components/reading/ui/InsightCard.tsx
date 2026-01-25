'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
    title: string;
    icon?: LucideIcon;
    score?: number; // 0 to 100
    tag?: string;
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export function InsightCard({ title, icon: Icon, score, tag, children, className, delay = 0 }: InsightCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay, duration: 0.5, ease: "easeOut" }}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-8",
                "hover:bg-white/[0.07] transition-colors duration-300",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="p-2 rounded-lg bg-white/5 text-acc-gold border border-white/10">
                            <Icon size={20} />
                        </div>
                    )}
                    <div>
                        <h3 className="font-cinzel text-lg md:text-xl text-white font-bold tracking-wide">
                            {title}
                        </h3>
                        {tag && (
                            <span className="text-xs text-white/40 font-medium tracking-widest uppercase mt-0.5 block">
                                {tag}
                            </span>
                        )}
                    </div>
                </div>

                {/* Optional Score Badge */}
                {score !== undefined && (
                    <div className="flex flex-col items-end">
                        <div className={cn(
                            "text-xl font-bold font-cinzel",
                            score >= 80 ? "text-acc-gold" : score >= 50 ? "text-white" : "text-red-400"
                        )}>
                            {score}
                            <span className="text-xs text-white/30 ml-0.5 font-sans font-normal">/100</span>
                        </div>
                        {score >= 80 && (
                            <span className="text-[10px] text-acc-gold/70 uppercase tracking-wider">Excellent</span>
                        )}
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="prose prose-invert prose-p:text-gray-300 prose-p:leading-relaxed prose-sm max-w-none">
                {children}
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent -translate-y-1/2 translate-x-1/2 rounded-full blur-xl pointer-events-none" />
        </motion.div>
    );
}

// Sub-component for Key Takeaway/Insight Box
export function InsightHighlight({ children, type = 'default' }: { children: React.ReactNode, type?: 'default' | 'warning' | 'tip' }) {
    const styles = {
        default: "bg-indigo-500/10 border-indigo-500/20 text-indigo-200",
        warning: "bg-red-500/10 border-red-500/20 text-red-200",
        tip: "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
    };

    return (
        <div className={cn(
            "mt-4 p-4 rounded-xl border flex gap-3 text-sm leading-relaxed",
            styles[type]
        )}>
            <span className="text-lg">
                {type === 'warning' ? '⚠️' : type === 'tip' ? '💡' : '✨'}
            </span>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
