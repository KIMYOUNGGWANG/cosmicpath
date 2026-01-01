'use client';

import { motion } from 'framer-motion';
import { Book, ChevronRight } from 'lucide-react';

interface GlossaryItem {
    term: string;
    hanja: string;
    definition: string;
    context: string;
}

interface GlossarySectionProps {
    data: GlossaryItem[];
    language?: 'ko' | 'en';
}

export function GlossarySection({ data, language = 'ko' }: GlossarySectionProps) {
    const isEn = language === 'en';

    if (!data || data.length === 0) return null;

    return (
        <section className="mt-16 space-y-8">
            <div className="flex items-center gap-3 mb-6 px-4">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                    <Book size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white leading-tight">
                        {isEn ? 'My Fate Encyclopedia' : '나만의 사주 용어집'}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        {isEn
                            ? 'Understand the key concepts that make up your destiny.'
                            : '나의 운명을 구성하는 핵심 개념들을 상세히 풀어드립니다.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                {data.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300"
                    >
                        {/* Background Deco */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {item.term}
                                    <span className="text-sm font-serif text-gray-500 bg-black/30 px-2 py-0.5 rounded border border-white/5">
                                        {item.hanja}
                                    </span>
                                </h3>
                                <span className="text-xs font-mono text-purple-300/50">#{idx + 1}</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-300 leading-relaxed dark-glossary-def">
                                        {item.definition}
                                    </p>
                                </div>

                                <div className="relative pl-3 border-l-2 border-purple-500/30">
                                    <h4 className="text-xs font-bold text-purple-300 mb-1 flex items-center gap-1">
                                        {isEn ? 'Meaning for You' : '내 삶에서의 의미'}
                                        <ChevronRight size={10} />
                                    </h4>
                                    <p className="text-sm text-gray-200 leading-relaxed font-medium">
                                        {item.context}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
