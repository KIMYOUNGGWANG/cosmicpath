'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Check, Lock } from 'lucide-react';
import {
    CHAT_CREDIT_PACK,
    CHAT_CREDIT_SINGLE,
    formatUsdFromCents,
} from '@/lib/payment/payment-config';

interface CreditPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectOption: (option: 'single' | 'pack') => void;
    onUpgradeToPro?: () => void;
    isLoading?: boolean;
}

interface ProductPriceState {
    amount: number;
    formattedPrice: string;
}

/**
 * 질문권 구매 옵션 선택 모달
 * Single ($1/1회) vs Pack ($1.99/3회)
 */
export function CreditPurchaseModal({
    isOpen,
    onClose,
    onSelectOption,
    onUpgradeToPro,
    isLoading = false,
}: CreditPurchaseModalProps) {
    const [selectedOption, setSelectedOption] = useState<'single' | 'pack'>('pack');
    const [singlePrice, setSinglePrice] = useState<ProductPriceState>({
        amount: CHAT_CREDIT_SINGLE.price / 100,
        formattedPrice: formatUsdFromCents(CHAT_CREDIT_SINGLE.price),
    });
    const [packPrice, setPackPrice] = useState<ProductPriceState>({
        amount: CHAT_CREDIT_PACK.price / 100,
        formattedPrice: formatUsdFromCents(CHAT_CREDIT_PACK.price),
    });

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let isMounted = true;

        async function loadPrices() {
            const requests = [
                fetch(`/api/payment/price?productId=${CHAT_CREDIT_SINGLE.productId}`, { cache: 'no-store' }),
                fetch(`/api/payment/price?productId=${CHAT_CREDIT_PACK.productId}`, { cache: 'no-store' }),
            ];

            try {
                const [singleResponse, packResponse] = await Promise.all(requests);
                const [singlePayload, packPayload] = await Promise.all([
                    singleResponse.json(),
                    packResponse.json(),
                ]);

                if (!isMounted) {
                    return;
                }

                if (singleResponse.ok && typeof singlePayload.amount === 'number' && typeof singlePayload.formattedPrice === 'string') {
                    setSinglePrice({
                        amount: singlePayload.amount,
                        formattedPrice: singlePayload.formattedPrice,
                    });
                }

                if (packResponse.ok && typeof packPayload.amount === 'number' && typeof packPayload.formattedPrice === 'string') {
                    setPackPrice({
                        amount: packPayload.amount,
                        formattedPrice: packPayload.formattedPrice,
                    });
                }
            } catch (error) {
                console.error('Failed to load chat credit prices:', error);
            }
        }

        void loadPrices();

        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    const packComparePrice = useMemo(() => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(singlePrice.amount * CHAT_CREDIT_PACK.credits);
    }, [singlePrice.amount]);

    const savingsPercent = useMemo(() => {
        const regularTotal = singlePrice.amount * CHAT_CREDIT_PACK.credits;
        if (regularTotal <= 0) return 0;

        return Math.max(0, Math.round((1 - packPrice.amount / regularTotal) * 100));
    }, [packPrice.amount, singlePrice.amount]);

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
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-[#0A0C1B] rounded-[2rem] border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#D4AF37]/10 blur-[60px] pointer-events-none" />
                        {/* Header */}
                        <div className="relative p-8 pb-4">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90 border border-white/5"
                            >
                                <X size={18} className="text-white/40" />
                            </button>
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B4941F] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                                    <Sparkles className="w-8 h-8 text-black" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">질문권 충전</h2>
                                    <p className="text-sm text-star-yellow/60 mt-1 font-medium uppercase tracking-widest text-[10px]">Divine Credits</p>
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="p-8 space-y-4">
                            {/* Single Option */}
                            <button
                                onClick={() => setSelectedOption('single')}
                                disabled={isLoading}
                                className={`
                                    w-full p-5 rounded-2xl border transition-all text-left active:scale-[0.98] relative overflow-hidden group
                                    ${selectedOption === 'single'
                                        ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5 shadow-[0_0_20px_rgba(212,175,55,0.05)]'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                            ${selectedOption === 'single' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20'}
                                        `}>
                                            {selectedOption === 'single' && (
                                                <Check size={14} className="text-black stroke-[3px]" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-100 italic">Single Quest</p>
                                            <p className="text-[11px] text-gray-500 font-medium tracking-wide">1회 질문권</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-white">{singlePrice.formattedPrice}</p>
                                    </div>
                                </div>
                            </button>

                            {/* Pack Option (Recommended) */}
                            <button
                                onClick={() => setSelectedOption('pack')}
                                disabled={isLoading}
                                className={`
                                    w-full p-5 rounded-2xl border transition-all text-left relative overflow-hidden active:scale-[0.98] group
                                    ${selectedOption === 'pack'
                                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_5px_25px_rgba(212,175,55,0.1)]'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                                    }
                                `}
                            >
                                {/* Recommended Badge */}
                                <div className="absolute top-0 right-0 bg-gradient-to-l from-[#D4AF37] to-[#B4941F] text-black text-[9px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-tighter">
                                    Best Value
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                            ${selectedOption === 'pack' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20'}
                                        `}>
                                            {selectedOption === 'pack' && (
                                                <Check size={14} className="text-black stroke-[3px]" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-100 italic">Destiny Pack</p>
                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-md tracking-tighter">
                                                    SAVE {savingsPercent}%
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 font-medium tracking-wide">3회 패키지</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-[#D4AF37]">{packPrice.formattedPrice}</p>
                                        <p className="text-[10px] text-white/20 line-through tracking-tighter">{packComparePrice}</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* CTA */}
                        <div className="p-8 pt-2">
                            <button
                                onClick={handlePurchase}
                                disabled={isLoading}
                                className={`
                                    w-full py-5 rounded-2xl font-bold text-lg
                                    transition-all flex items-center justify-center gap-3 active:scale-[0.98] relative overflow-hidden
                                    ${isLoading
                                        ? 'bg-white/10 text-white/20 cursor-wait'
                                        : 'bg-gradient-to-r from-[#D4AF37] via-[#F2D479] to-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 active:grayscale-[0.2]'
                                    }
                                `}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="animate-pulse">Divining...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap size={22} className="fill-current" />
                                        <span>
                                            {selectedOption === 'single'
                                                ? `Charge ${singlePrice.formattedPrice}`
                                                : `Charge ${packPrice.formattedPrice}`}
                                        </span>
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-2 mt-5 opacity-30">
                                <Lock size={10} className="text-white" />
                                <p className="text-[10px] text-white font-medium uppercase tracking-widest">
                                    Secured by Stripe
                                </p>
                            </div>

                            {/* Upsell to PRO */}
                            {onUpgradeToPro && (
                                <div className="mt-6 pt-5 border-t border-white/10 text-center">
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onUpgradeToPro();
                                        }}
                                        className="w-full py-3.5 rounded-xl font-bold text-sm bg-white/5 border border-[#D4AF37]/30 text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={16} />
                                        <span>CosmicPath Pro 무제한 구독하기</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
