'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { READING_PRODUCT } from '@/lib/payment/payment-config';
// import TossPaymentWidget from './TossPaymentWidget'; // Toss Payments (Commented out)

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentStart?: () => void;
    readingData?: Record<string, unknown>;
    currentReport?: any; // To persist Phase 1-2 results
    metadata?: any;
    isDecisionAccepted?: boolean;
}

export function PaymentModal({
    isOpen,
    onClose,
    onPaymentStart,
    readingData,
    currentReport,
    metadata,
    isDecisionAccepted
}: PaymentModalProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            // 1. 사전 처리 (데이터 저장)
            if (readingData) {
                sessionStorage.setItem('pending_reading_data', JSON.stringify(readingData));
            }
            if (currentReport) {
                sessionStorage.setItem('pending_report_data', JSON.stringify(currentReport));
            }
            if (metadata) {
                sessionStorage.setItem('pending_metadata', JSON.stringify(metadata));
            }
            if (isDecisionAccepted) {
                sessionStorage.setItem('decision_accepted', 'true');
            }
            if (email) {
                localStorage.setItem('user_email', email);
            }

            onPaymentStart?.();

            // 2. Stripe 결제 세션 생성 요청
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: READING_PRODUCT.id,
                    email
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create payment session');
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            alert(`결제 오류: ${error.message || '잠시 후 다시 시도해 주세요.'}`);
        } finally {
            setIsLoading(false);
        }
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
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-xl bg-[#0f0f23] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(161,132,255,0.2)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} className="text-white/40" />
                        </button>

                        <div className="p-8 md:p-12">
                            <div className="text-center mb-10">
                                <h3 className="text-2xl font-bold text-white mb-3">통합 분석 리포트 잠금 해제</h3>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    사주 + 점성술 + 타로가 융합된<br />
                                    전체 분석 결과와 솔루션을 확인하세요.
                                </p>
                                <div className="mt-6 inline-block px-4 py-2 bg-[#A184FF]/10 rounded-full border border-[#A184FF]/20">
                                    <span className="text-[#A184FF] font-bold text-xl">$3.99</span>
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="mb-8">
                                <label className="block text-xs font-semibold text-[#A184FF] mb-3 ml-1 uppercase tracking-widest">
                                    결과를 받아볼 이보다 더 나은
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#A184FF]/50 transition-all font-light"
                                />
                                <p className="mt-2 ml-1 text-[10px] text-white/40 italic">
                                    * 입력 시 결제 완료 후 이메일로 분석 결과 링크가 발송됩니다.
                                </p>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
                            >
                                {isLoading ? '처리 중...' : '결제하고 전체 읽기'}
                            </button>

                            {/* 
                            <TossPaymentWidget
                                product={READING_PRODUCT}
                                onFail={(err) => {
                                    console.error('Toss widget failed in modal:', err);
                                }}
                            /> 
                            */}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
