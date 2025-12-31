'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch(`/api/payment?session_id=${sessionId}`);
                const data = await response.json();

                if (data.success) {
                    // 결제 성공!
                    setStatus('success');

                    // 로컬 스토리지 -> 세션 스토리지로 변경 (브라우저 닫으면 세션 종료)
                    // page.tsx에서 이 데이터를 확인하여 리딩을 재개
                    if (data.metadata?.readingData) {
                        sessionStorage.setItem('pending_reading_data', data.metadata.readingData);
                    }
                    sessionStorage.setItem('payment_completed', 'true');
                    sessionStorage.setItem('last_payment_session', sessionId);

                    // 2초 후 홈으로 이동
                    setTimeout(() => {
                        router.push('/start?paid=true');
                    }, 2500);
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error('Payment verification failed:', error);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [sessionId, router]);

    return (
        <div className="text-center max-w-md w-full">
            {status === 'loading' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                    <h2 className="text-xl font-medium">결제 확인 중...</h2>
                    <p className="text-gray-400">잠시만 기다려주세요.</p>
                </motion.div>
            )}

            {status === 'success' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold">결제 완료!</h2>
                    <p className="text-gray-400">
                        프리미엄 리딩이 해제되었습니다.<br />
                        결과 페이지로 이동합니다.
                    </p>
                </motion.div>
            )}

            {status === 'error' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold">결제 확인 실패</h2>
                    <p className="text-gray-400">
                        결제 정보를 확인하는 도중 오류가 발생했습니다.<br />
                        문제가 지속되면 고객센터로 문의해주세요.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                    >
                        홈으로 돌아가기
                    </button>
                </motion.div>
            )}
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f23] text-white p-4">
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                    <h2 className="text-xl font-medium">로딩 중...</h2>
                </div>
            }>
                <PaymentSuccessContent />
            </Suspense>
        </div>
    );
}
