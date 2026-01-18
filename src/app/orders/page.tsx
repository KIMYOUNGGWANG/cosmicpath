'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, ArrowRight, ExternalLink } from 'lucide-react';

export default function OrdersPage() {
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

            // Auto fetch orders
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

    return (
        <main className="min-h-screen bg-[#030308] text-white pt-24 pb-12 px-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-center mb-8 font-cinzel">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        My Orders
                    </span>
                </h1>

                <AnimatePresence mode="wait">
                    {step === 'EMAIL' && (
                        <motion.div
                            key="email"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-[#0a0a1a] p-6 rounded-2xl border border-white/5"
                        >
                            <h2 className="text-lg mb-4 text-center text-gray-300">이메일 인증으로 내역 찾기</h2>
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="결제 시 사용한 이메일 입력"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#050510] border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                                    />
                                </div>
                                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : '인증번호 받기'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 'OTP' && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-[#0a0a1a] p-6 rounded-2xl border border-white/5"
                        >
                            <h2 className="text-lg mb-2 text-center text-gray-300">인증번호 입력</h2>
                            <p className="text-sm text-gray-500 text-center mb-6">{email}로 전송된 6자리를 입력해주세요.</p>
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="123456"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-[#050510] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-center tracking-widest text-lg font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                                    />
                                </div>
                                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : '확인'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('EMAIL')}
                                    className="w-full text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    이메일 다시 입력하기
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 'LIST' && (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="flex justify-between items-center px-2">
                                <span className="text-gray-400 text-sm">{email}님의 결제 내역</span>
                                <button onClick={() => window.location.reload()} className="text-xs text-gray-600 underline">로그아웃</button>
                            </div>

                            {orders.length === 0 ? (
                                <div className="bg-[#0a0a1a] p-8 rounded-2xl border border-white/5 text-center text-gray-500">
                                    결제 내역이 없습니다.
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {orders.map((order) => (
                                        <a
                                            key={order.id}
                                            href={order.readingId ? `/share/${order.readingId}` : '#'}
                                            target="_blank"
                                            className="group bg-[#0a0a1a] p-5 rounded-xl border border-white/5 hover:border-purple-500/50 hover:bg-[#0f0f2a] transition-all flex justify-between items-center"
                                        >
                                            <div>
                                                {/* Assuming implementation of metadata parsing if needed, but simplistic for now */}
                                                <h3 className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                                                    {order.amount === 4500 ? '☕️ Coffee Price Reading' : '운세 분석 리포트'}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                    <span className="ml-2 text-xs bg-white/5 px-2 py-0.5 rounded text-gray-400">
                                                        {order.status}
                                                    </span>
                                                </p>
                                            </div>
                                            <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
