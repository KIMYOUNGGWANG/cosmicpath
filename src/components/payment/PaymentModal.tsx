'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { READING_PRODUCT } from '@/lib/payment/payment-config';
import { Sparkles, CreditCard, X, Check, Loader2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPaymentStart?: () => void;
    readingData?: Record<string, unknown>;
    currentReport?: any; // To persist Phase 1-2 results
}

export function PaymentModal({
    isOpen,
    onClose,
    onPaymentStart,
    readingData,
    currentReport
}: PaymentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');

    const handlePayment = async () => {
        if (!email || !email.includes('@')) {
            setError('올바른 이메일 주소를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Save email for later use (resend result)
        localStorage.setItem('user_email', email);

        // Save readingData to localStorage to avoid Stripe metadata limits
        if (readingData) {
            localStorage.setItem('pending_reading_data', JSON.stringify(readingData));
        }

        // Save current report data to avoid re-analysis of Phase 1-2
        if (currentReport) {
            localStorage.setItem('pending_report_data', JSON.stringify(currentReport));
        }

        onPaymentStart?.();

        try {
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: READING_PRODUCT.id,
                    // readingData is too large for Stripe metadata, saved to localStorage instead
                    email // Pass email to API if needed for Stripe Customer creation
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Payment URL not received');
            }
        } catch (err) {
            setError('결제 초기화에 실패했습니다. 다시 시도해주세요.');
            setIsLoading(false);
        }
    };

    const formatPrice = (cents: number) => {
        return `$${(cents / 100).toFixed(2)}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl"
                        style={{
                            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: '0 0 60px rgba(139, 92, 246, 0.2)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 rounded-full transition-colors"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.6)'
                            }}
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div
                                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                                    style={{
                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                                        boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
                                    }}
                                >
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h2
                                    className="text-2xl font-bold mb-2"
                                    style={{ color: '#ffffff' }}
                                >
                                    3원 통합 리딩
                                </h2>
                                <p
                                    className="text-sm"
                                    style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                >
                                    {READING_PRODUCT.description}
                                </p>
                            </div>

                            {/* Features */}
                            <div
                                className="rounded-2xl p-6 mb-6"
                                style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                            >
                                <ul className="space-y-3">
                                    {[
                                        '사주 + 점성술 + 타로 교차 검증',
                                        '신뢰도 점수 & 상세 근거 제공',
                                        '추가 질문 3회 포함',
                                        '결과지 저장 & 공유 가능',
                                    ].map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <div
                                                className="w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                                            >
                                                <Check size={12} style={{ color: '#22c55e' }} />
                                            </div>
                                            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Email Input */}
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-gray-400 mb-2 ml-1">
                                    결과를 받아볼 이메일 주소
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Price */}
                            <div className="text-center mb-6">
                                <span
                                    className="text-4xl font-bold"
                                    style={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {formatPrice(READING_PRODUCT.price)}
                                </span>
                                <span
                                    className="text-lg ml-2"
                                    style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                                >
                                    / 1회
                                </span>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div
                                    className="text-center text-sm mb-4 p-3 rounded-lg"
                                    style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444'
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            {/* Payment button */}
                            <button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className="w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3"
                                style={{
                                    background: isLoading
                                        ? 'rgba(139, 92, 246, 0.5)'
                                        : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                                    color: '#ffffff',
                                    boxShadow: isLoading
                                        ? 'none'
                                        : '0 10px 40px rgba(139, 92, 246, 0.4)',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        결제 페이지로 이동 중...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        결제하기
                                    </>
                                )}
                            </button>

                            {/* Payment methods */}
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <span
                                    className="text-xs"
                                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                                >
                                    Apple Pay • Google Pay • 카드 결제 지원
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
