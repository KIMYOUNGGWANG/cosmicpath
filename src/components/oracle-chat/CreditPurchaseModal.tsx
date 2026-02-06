'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Check } from 'lucide-react';

interface CreditPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectOption: (option: 'single' | 'pack') => void;
    isLoading?: boolean;
}

/**
 * 질문권 구매 옵션 선택 모달
 * Single ($1/1회) vs Pack ($1.99/3회)
 */
export function CreditPurchaseModal({
    isOpen,
    onClose,
    onSelectOption,
    isLoading = false,
}: CreditPurchaseModalProps) {
    const [selectedOption, setSelectedOption] = useState<'single' | 'pack'>('pack');

    const handlePurchase = () => {
        onSelectOption(selectedOption);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-gradient-to-b from-[#1A1F2E] to-[#0F1419] rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative p-6 pb-4 border-b border-white/10">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"
                            >
                                <X size={20} className="text-white/60" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#D4AF37]/20 rounded-xl">
                                    <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">질문권 충전</h2>
                                    <p className="text-sm text-white/50">Oracle에게 더 물어보세요</p>
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="p-6 space-y-4">
                            {/* Single Option */}
                            <button
                                onClick={() => setSelectedOption('single')}
                                disabled={isLoading}
                                className={`
                                    w-full p-4 rounded-xl border-2 transition-all text-left active:scale-[0.98]
                                    ${selectedOption === 'single'
                                        ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                            ${selectedOption === 'single' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/30'}
                                        `}>
                                            {selectedOption === 'single' && (
                                                <Check size={12} className="text-black" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">1회 질문권</p>
                                            <p className="text-xs text-white/50">기본 충전</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-white">$1.00</p>
                                        <p className="text-xs text-white/40">$1.00/회</p>
                                    </div>
                                </div>
                            </button>

                            {/* Pack Option (Recommended) */}
                            <button
                                onClick={() => setSelectedOption('pack')}
                                disabled={isLoading}
                                className={`
                                    w-full p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden active:scale-[0.98]
                                    ${selectedOption === 'pack'
                                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }
                                `}
                            >
                                {/* Recommended Badge */}
                                <div className="absolute top-0 right-0 bg-gradient-to-l from-[#D4AF37] to-[#B4941F] text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                                    추천
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                                            ${selectedOption === 'pack' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/30'}
                                        `}>
                                            {selectedOption === 'pack' && (
                                                <Check size={12} className="text-black" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-white">3회 패키지</p>
                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
                                                    33% 할인
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/50">가장 인기 있는 선택</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-[#D4AF37]">$1.99</p>
                                        <p className="text-xs text-white/40 line-through">$3.00</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* CTA */}
                        <div className="p-6 pt-2">
                            <button
                                onClick={handlePurchase}
                                disabled={isLoading}
                                className={`
                                    w-full py-4 rounded-xl font-semibold text-lg
                                    transition-all flex items-center justify-center gap-2 active:scale-[0.98]
                                    ${isLoading
                                        ? 'bg-white/10 text-white/50 cursor-wait'
                                        : 'bg-gradient-to-r from-[#D4AF37] to-[#B4941F] text-black hover:opacity-90 shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40'
                                    }
                                `}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        처리 중...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={20} />
                                        {selectedOption === 'single' ? '$1.00 결제하기' : '$1.99 결제하기'}
                                    </>
                                )}
                            </button>
                            <p className="text-center text-white/30 text-xs mt-3">
                                안전한 Stripe 결제 • 즉시 충전
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
