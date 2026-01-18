'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, X, ExternalLink } from 'lucide-react';

interface OrderLookupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OrderLookupModal({ isOpen, onClose }: OrderLookupModalProps) {
    const [step, setStep] = useState<'EMAIL' | 'OTP' | 'LIST'>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orders, setOrders] = useState<any[]>([]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) throw new Error('인증번호 발송 실패');
            setStep('OTP');
        } catch (err: any) {
            setError(err.message || '오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: otp }),
            });

            if (!res.ok) throw new Error('인증번호 확인 실패');
            await fetchOrders();
        } catch (err: any) {
            setError(err.message || '인증번호가 올바르지 않습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (!res.ok) throw new Error('주문 내역 조회 실패');
            const data = await res.json();
            setOrders(data.orders || []);
            setStep('LIST');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const reset = () => {
        setStep('EMAIL');
        setEmail('');
        setOtp('');
        setOrders([]);
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={reset}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[9999] px-4"
                    >
                        <div className="bg-[#0f0f2a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
                            {/* Close Button */}
                            <button
                                onClick={reset}
                                className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#0f0f2a] to-[#1a1a3a] px-6 py-6 border-b border-white/5">
                                <h2 className="text-xl font-bold font-cinzel text-white">
                                    {step === 'LIST' ? 'My Orders' : 'Find My Orders'}
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    {step === 'EMAIL' && '이메일로 지난 점사 결과를 찾아보세요'}
                                    {step === 'OTP' && '인증번호를 입력해주세요'}
                                    {step === 'LIST' && `${email}님의 보관함`}
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <AnimatePresence mode="wait">
                                    {step === 'EMAIL' && (
                                        <motion.form
                                            key="email"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onSubmit={handleSendOtp}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400 ml-1">이메일 주소</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="name@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full bg-[#050510] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-600"
                                                    />
                                                </div>
                                            </div>
                                            {error && <p className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded">{error}</p>}
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : '인증번호 전송'}
                                            </button>
                                        </motion.form>
                                    )}

                                    {step === 'OTP' && (
                                        <motion.form
                                            key="otp"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            onSubmit={handleVerifyOtp}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400 ml-1">인증번호 (6자리)</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="000000"
                                                        maxLength={6}
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        className="w-full bg-[#050510] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-center tracking-widest text-lg font-bold focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-600"
                                                    />
                                                </div>
                                            </div>
                                            {error && <p className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded">{error}</p>}
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : '확인'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStep('EMAIL')}
                                                className="w-full text-xs text-gray-500 hover:text-white transition-colors"
                                            >
                                                이메일 다시 입력하기
                                            </button>
                                        </motion.form>
                                    )}

                                    {step === 'LIST' && (
                                        <motion.div
                                            key="list"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                                        >
                                            {orders.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500 bg-white/5 rounded-xl">
                                                    <p className="text-sm">보관된 내역이 없습니다.</p>
                                                </div>
                                            ) : (
                                                orders.map((order) => (
                                                    <a
                                                        key={order.id}
                                                        href={order.readingId ? `/share/${order.readingId}` : '#'}
                                                        target="_blank"
                                                        className="block bg-[#050510] p-4 rounded-xl border border-white/5 hover:border-purple-500/50 hover:bg-[#0a0a1a] transition-all group"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-medium text-gray-200 text-sm group-hover:text-purple-300 transition-colors">
                                                                    {order.type === 'PROMO' ? '🎁 프로모션 운세' : (order.amount === 4500 ? '☕️ 커피 한 잔의 운세' : '심화 분석 리포트')}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                                        </div>
                                                    </a>
                                                ))
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
