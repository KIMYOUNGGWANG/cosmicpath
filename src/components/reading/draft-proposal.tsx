'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DraftProposalProps {
    title: string;
    date: string;
    time: string;
    description?: string;
    confidence: number;
    onConfirm: (data: ProposalData) => void;
    onCancel: () => void;
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
    onCancel
}: DraftProposalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<ProposalData>({
        title: initialTitle,
        date: initialDate,
        time: initialTime,
        description: initialDesc,
    });

    // 버튼 텍스트 결정
    const getButtonText = () => {
        if (confidence >= 80) return '🚀 실행하기';
        if (confidence >= 50) return '📅 일정 조율하기';
        return '🤔 판단 보류하기';
    };

    const handleConfirm = () => {
        onConfirm(data);
        setIsOpen(false);
        alert('✅ 캘린더에 초안이 저장되었습니다. (Phase 2 기능)');
    };

    return (
        <>
            {/* 1. 제안 버튼 (Action Trigger) */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(true)}
                className="w-full glass-card p-4 flex items-center justify-between border-l-4 border-l-gold hover:bg-white/5 transition-colors group"
            >
                <div className="text-left">
                    <div className="text-xs text-gold mb-1 flex items-center gap-2">
                        <span>✨ AI 제안</span>
                        <span className="opacity-50">|</span>
                        <span>신뢰도 {confidence}%</span>
                    </div>
                    <h3 className="font-semibold text-lg">{initialTitle}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {initialDate} {initialTime}
                    </p>
                </div>
                <div className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                    👉
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
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-[#1a1c23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-deep-navy to-cosmic-purple p-6 border-b border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">📋</span>
                                    <h2 className="text-xl font-bold text-white">제안서 검토</h2>
                                </div>
                                <p className="text-sm text-gray-400">
                                    AI가 제안한 내용을 검토하고 결정해주세요.
                                    <br />
                                    직접 수정하여 승인할 수 있습니다.
                                </p>
                            </div>

                            {/* Form */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">제목</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData({ ...data, title: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none transition-colors"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">날짜</label>
                                        <input
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData({ ...data, date: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">시간</label>
                                        <input
                                            type="time"
                                            value={data.time}
                                            onChange={(e) => setData({ ...data, time: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">메모 (선택)</label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData({ ...data, description: e.target.value })}
                                        className="w-full h-24 bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none transition-colors resize-none"
                                        placeholder="추가적인 메모를 남기세요..."
                                    />
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-black/20 flex gap-3 border-t border-white/5">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-xl text-gray-400 hover:bg-white/5 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-gold to-gold-dim text-deep-navy font-bold hover:shadow-lg hover:shadow-gold/20 transition-all active:scale-95"
                                >
                                    승인 및 등록
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
