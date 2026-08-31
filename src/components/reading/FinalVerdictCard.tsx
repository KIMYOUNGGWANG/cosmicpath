'use client';

import React, { useState } from 'react';
import { Check, Scale, Sparkles, ScrollText, Quote } from 'lucide-react';

interface FinalVerdictProps {
    data: {
        title: string;
        core_message: string;
        saju_foundation: string;
        astro_support: string;
        tarot_insight: string;
        action_priorities: string[];
        closing_words: string;
    };
}

export function FinalVerdictCard({ data }: FinalVerdictProps) {
    const [checkedItems, setCheckedItems] = useState<number[]>([]);

    const toggleCheck = (index: number) => {
        if (checkedItems.includes(index)) {
            setCheckedItems(prev => prev.filter(i => i !== index));
        } else {
            setCheckedItems(prev => [...prev, index]);
            // TODO: Add confetti or toast effect here
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto my-12 relative group animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Background Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />

            <div className="relative bg-[#0f1021] border border-orange-200/20 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">

                {/* Header - Gold Border Top */}
                <div className="h-2 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200" />

                <div className="p-8 md:p-10 space-y-8">

                    {/* 1. Title Section */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-900/30 border border-amber-500/30 text-amber-400 mb-2">
                            <Scale className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif text-amber-100/90 font-bold tracking-wide">
                            {data.title || "최종 3단 판정"}
                        </h2>
                        <div className="flex justify-center items-center gap-2 text-xs font-medium text-amber-200/60 uppercase tracking-widest">
                            <span>Saju structure</span>
                            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
                            <span>Astro timing</span>
                            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
                            <span>Tarot signal</span>
                        </div>
                    </div>

                    {/* 2. Core Message (Quote) */}
                    <div className="relative p-8 bg-blue-950/20 rounded-lg border border-white/5">
                        <Quote className="absolute top-4 left-4 w-8 h-8 text-white/5 rotate-180" />
                        <p className="text-lg md:text-xl text-center leading-relaxed font-serif text-white/90 italic">
                            &ldquo;{data.core_message}&rdquo;
                        </p>
                        <Quote className="absolute bottom-4 right-4 w-8 h-8 text-white/5" />
                    </div>

                    {/* 3. Evidence / Foundation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                            <div className="flex items-center gap-2 text-indigo-300 mb-2 font-semibold">
                                <ScrollText className="w-4 h-4" /> 사주적 근거
                            </div>
                            <p className="text-slate-400 leading-relaxed">{data.saju_foundation}</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
                            <div className="flex items-center gap-2 text-purple-300 mb-2 font-semibold">
                                <Sparkles className="w-4 h-4" /> 점성술/자미두수 통찰
                            </div>
                            <p className="text-slate-400 leading-relaxed">
                                {data.astro_support} {data.tarot_insight && `+ ${data.tarot_insight}`}
                            </p>
                        </div>
                    </div>

                    {/* 4. Action Checklist */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-serif text-white/80 border-b border-white/10 pb-2 flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-400" />
                            Action Priorities
                        </h3>
                        <ul className="space-y-3">
                            {data.action_priorities?.map((action, index) => (
                                <li
                                    key={index}
                                    onClick={() => toggleCheck(index)}
                                    className={`
                    flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-300
                    ${checkedItems.includes(index)
                                            ? 'bg-green-900/20 border-green-500/30 text-slate-400 line-through'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-200'}
                  `}
                                >
                                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${checkedItems.includes(index) ? 'bg-green-500 border-green-500' : 'border-slate-500'
                                        }`}>
                                        {checkedItems.includes(index) && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className="flex-1">{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 5. Closing & Signature */}
                    <div className="pt-6 border-t border-white/10 text-center space-y-4">
                        <p className="text-indigo-200/80 font-medium leading-relaxed">
                            {data.closing_words}
                        </p>
                        <div className="pt-2 flex flex-col items-center">
                            <div className="font-serif italic text-2xl text-amber-500/80" style={{ fontFamily: 'Times New Roman, serif' }}>
                                CosmicPath
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                Saved for review
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Decoration */}
                <div className="h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
            </div>
        </div>
    );
}
