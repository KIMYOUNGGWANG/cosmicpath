'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, FileCheck2, Zap, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface DraftProposalProps {
    title: string;
    date: string;
    time: string;
    description?: string;
    confidence: number;
    onConfirm: (data: ProposalData) => void;
    onCancel: () => void;
    language?: 'ko' | 'en';
}

export interface ProposalData {
    title: string;
    date: string;
    time: string;
    description: string;
}

export function DraftProposal({
    title: initialTitle,
    date: initialDate,
    time: initialTime,
    description: initialDesc = '',
    confidence,
    onConfirm,
    onCancel,
    language = 'ko'
}: DraftProposalProps) {
    const isEn = language === 'en';
    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [data, setData] = useState<ProposalData>({
        title: initialTitle,
        date: initialDate,
        time: initialTime,
        description: initialDesc,
    });

    const cleanTitle = (initialTitle || '').replace(/[🚀⚠️💰👉🎂📋✨⚡🤝]/g, '').trim();
    const impactLevel = Math.max(1, Math.min(5, Math.round(confidence / 20)));

    const handleConfirm = () => {
        onConfirm(data);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            setIsOpen(false);
        }, 1200);
    };

    return (
        <>
            {/* 1. 제안 버튼 (Action Trigger) */}
            <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsOpen(true)}
                className="w-full text-left rounded-xl border border-white/10 bg-[#151824]/80 p-4 transition-all duration-300 hover:border-[#d4af37]/40 hover:bg-[#1c2033] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] group relative overflow-hidden"
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4af37] px-2 py-0.5 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/25">
                                {isEn ? 'Strategic Window' : '전략적 실행 창'}
                            </span>
                            <span className="text-white/20 text-xs">•</span>
                            <div className="flex items-center gap-1.5 text-xs text-stone-300 font-medium">
                                <span className="text-stone-400">{isEn ? 'Impact' : '예상 파급력'}</span>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`h-1.5 w-3 rounded-sm ${
                                                i < impactLevel ? 'bg-[#d4af37]' : 'bg-white/15'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-sm md:text-base text-white tracking-tight truncate group-hover:text-[#f3e3b2] transition-colors">
                            {cleanTitle || initialTitle}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-stone-400 mt-1.5">
                            <Calendar size={13} className="text-[#d4af37]/70 shrink-0" />
                            <span>{initialDate}</span>
                            <span className="text-white/20">|</span>
                            <span>{initialTime}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-[#d4af37] group-hover:text-white transition-colors shrink-0 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg group-hover:bg-[#d4af37]/20 group-hover:border-[#d4af37]/40">
                        <span>{isEn ? 'Review' : '검토'}</span>
                        <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </motion.button>

            {/* 2. 결재판 팝업 (Draft Modal) */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/75 backdrop-blur-md"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="relative w-full max-w-md bg-[#12131d] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden z-10"
                        >
                            {/* Header */}
                            <div className="p-5 border-b border-white/10 bg-gradient-to-b from-[#1c2033] to-[#12131d]">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <div className="p-1.5 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37]">
                                        <FileCheck2 size={18} />
                                    </div>
                                    <h2 className="text-base font-bold text-white tracking-tight">
                                        {isEn ? 'Executive Action Review' : '전략 실행 제안서 검토'}
                                    </h2>
                                </div>
                                <p className="text-xs text-stone-400 pl-9">
                                    {isEn
                                        ? 'Review the proposed window and adjust parameters before confirming.'
                                        : '제안된 일정을 확인하고 필요에 따라 내용을 직접 수정한 뒤 승인하세요.'}
                                </p>
                            </div>

                            {/* Form */}
                            <div className="p-5 space-y-4">
                                {isSaved ? (
                                    <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <p className="text-sm font-bold text-white">
                                            {isEn ? 'Action Window Registered' : '실행 일정이 등록되었습니다'}
                                        </p>
                                        <p className="text-xs text-stone-400">
                                            {isEn ? 'Your strategic plan has been updated.' : '의사결정 캘린더에 반영되었습니다.'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                                                {isEn ? 'Action Title' : '행동 목표'}
                                            </label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData({ ...data, title: e.target.value })}
                                                className="w-full bg-[#181a26] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#d4af37] outline-none transition-colors"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                                                    {isEn ? 'Target Date' : '목표 날짜'}
                                                </label>
                                                <input
                                                    type="date"
                                                    value={data.date}
                                                    onChange={(e) => setData({ ...data, date: e.target.value })}
                                                    className="w-full bg-[#181a26] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#d4af37] outline-none transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                                                    {isEn ? 'Optimal Time' : '권장 시간'}
                                                </label>
                                                <input
                                                    type="time"
                                                    value={data.time}
                                                    onChange={(e) => setData({ ...data, time: e.target.value })}
                                                    className="w-full bg-[#181a26] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#d4af37] outline-none transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                                                {isEn ? 'Strategic Notes / Rules' : '실행 원칙 및 메모'}
                                            </label>
                                            <textarea
                                                value={data.description}
                                                onChange={(e) => setData({ ...data, description: e.target.value })}
                                                className="w-full h-24 bg-[#181a26] border border-white/10 rounded-xl p-3 text-xs text-stone-200 focus:border-[#d4af37] outline-none transition-colors resize-none leading-relaxed"
                                                placeholder={isEn ? "Add strategic guidelines or fallback conditions..." : "실행 시 주의사항이나 대체 플랜을 기록하세요..."}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer Actions */}
                            {!isSaved && (
                                <div className="p-4 bg-[#0d0e17] flex gap-3 border-t border-white/10">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-400 hover:bg-white/5 transition-colors border border-white/5"
                                    >
                                        {isEn ? 'Cancel' : '닫기'}
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f4d88a] text-[#08080f] font-bold text-xs hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all active:scale-98 flex items-center justify-center gap-1.5"
                                    >
                                        <Sparkles size={14} />
                                        <span>{isEn ? 'Approve & Register' : '일정 확정 및 승인'}</span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
