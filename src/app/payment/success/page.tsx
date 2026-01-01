'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, XCircle, Home, RefreshCw } from 'lucide-react';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setStatus('error');
                setErrorMsg('세션 ID가 누락되었습니다.');
                return;
            }

            try {
                // Use the existing Stripe GET handler
                const response = await fetch(`/api/payment?session_id=${sessionId}`);
                const result = await response.json();

                if (result.status === 'paid') {
                    setStatus('success');
                    // Mark payment completed in storage for start/page.tsx to pick up
                    sessionStorage.setItem('payment_completed', 'true');

                    setTimeout(() => {
                        router.push('/start?paid=true');
                    }, 2000);
                } else {
                    setStatus('error');
                    setErrorMsg('결제가 완료되지 않았습니다.');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setErrorMsg('결제 검증 중 오류가 발생했습니다.');
            }
        };

        verifyPayment();
    }, [sessionId, router]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl text-center"
        >
            {status === 'loading' && (
                <div className="space-y-4">
                    <div className="w-12 h-12 border-4 border-[#A184FF] border-t-transparent rounded-full animate-spin mx-auto" />
                    <h1 className="text-xl font-bold text-white">결제 승인 중...</h1>
                    <p className="text-white/60 text-sm">잠시만 기다려 주세요.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="space-y-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">결제가 완료되었습니다!</h1>
                        <p className="text-white/60 text-sm leading-relaxed">
                            운명의 설계자가 당신만을 위한 통합 리포트를<br />
                            정교하게 다듬고 있습니다. 곧 결과로 안내합니다.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-4 bg-[#A184FF] text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                    >
                        결과 확인하기 <ArrowRight size={18} />
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <XCircle size={32} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">결제 처리 실패</h1>
                        <p className="text-white/60 text-sm">
                            {errorMsg || '문제가 발생했습니다. 다시 시도해 주세요.'}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.push('/start')}
                            className="w-full py-4 bg-[#A184FF] text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} /> 결과로 돌아가기
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-4 bg-white/5 text-white/40 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                        >
                            <Home size={18} /> 홈으로
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <Suspense fallback={
                <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-[#A184FF] border-t-transparent rounded-full animate-spin mx-auto" />
                        <h1 className="text-xl font-bold text-white">결제 정보 로드 중...</h1>
                    </div>
                </div>
            }>
                <PaymentSuccessContent />
            </Suspense>
        </div>
    );
}
