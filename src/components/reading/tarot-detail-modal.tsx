'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Zap, X } from 'lucide-react';

interface TarotDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    cardName: string;
    role: string;
    isReversed?: boolean;
    convergenceData: {
        sajuConnection: string;
        astroConnection: string;
        insight: string;
    };
    language?: 'ko' | 'en';
}

export function TarotDetailModal({
    isOpen,
    onClose,
    cardName,
    role,
    isReversed,
    convergenceData,
    language = 'ko'
}: TarotDetailModalProps) {
    const isEn = language === 'en';

    // Handle browser back button - close modal instead of navigating away
    useEffect(() => {
        if (!isOpen) return;

        // Push a history state when modal opens
        const modalState = { modalType: 'tarot-detail', modalOpen: true };
        window.history.pushState(modalState, '');

        const handlePopState = (event: PopStateEvent) => {
            // When back button is pressed, close the modal
            if (isOpen) {
                onClose();
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isOpen, onClose]);

    // Handle X button click - need to also go back in history
    const handleClose = useCallback(() => {
        // Go back to remove the modal state from history
        if (window.history.state?.modalType === 'tarot-detail') {
            window.history.back();
        } else {
            onClose();
        }
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#1a1c23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-tarot-purple/20 to-cosmic-purple p-6 border-b border-white/5 relative">
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-16 bg-white/5 rounded border border-white/10 flex items-center justify-center text-xl">
                                    🔮
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        {cardName}
                                        {isReversed && <span className="text-red-400 text-xs">{isEn ? '(Reversed)' : '(역방향)'}</span>}
                                    </h2>
                                    <p className="text-sm text-gold font-medium">{role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Convergence Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-xl p-4 border border-saju-blue/20">
                                    <div className="flex items-center gap-2 mb-2 text-saju-blue">
                                        <Shield size={16} />
                                        <h3 className="text-xs font-bold uppercase tracking-widest">Saju Logic</h3>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        {convergenceData.sajuConnection}
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-star-yellow/20">
                                    <div className="flex items-center gap-2 mb-2 text-star-yellow">
                                        <Zap size={16} />
                                        <h3 className="text-xs font-bold uppercase tracking-widest">Astro Flow</h3>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        {convergenceData.astroConnection}
                                    </p>
                                </div>
                            </div>

                            {/* Deep Insight */}
                            <div className="bg-gradient-to-br from-tarot-purple/10 to-transparent border border-tarot-purple/20 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3 text-tarot-purple">
                                    <Sparkles size={18} />
                                    <h3 className="font-bold">The Convergence Insight</h3>
                                </div>
                                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line italic">
                                    &quot;{convergenceData.insight}&quot;
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-black/20 text-center border-t border-white/5">
                            <p className="text-[10px] text-gray-500">
                                {isEn
                                    ? "An integrated interpretation combining Tarot's intuition with Saju/Astrology's logic."
                                    : "타로의 직관과 사주/점성술의 논리가 결합된 통합 해석입니다."}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
