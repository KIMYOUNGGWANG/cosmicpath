'use client';

import { Suspense, useEffect, useState, useSyncExternalStore } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, XCircle, Home, RefreshCw } from 'lucide-react';
import { trackClientGrowthEvent } from '@/lib/client-growth-events';
import { getLandingVariant, readPreferredClientLanguage, type SupportedLanguage } from '@/lib/language-preference';

const subscribeToLanguagePreference = () => () => {};

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [checkoutContext, setCheckoutContext] = useState<{
        source?: string;
        language?: SupportedLanguage;
        readingId?: string | null;
    }>({});

    const sessionId = searchParams.get('session_id');
    const readingId = searchParams.get('reading_id');
    const language = useSyncExternalStore<SupportedLanguage>(
        subscribeToLanguagePreference,
        readPreferredClientLanguage,
        () => 'ko'
    );
    const isEnglish = language === 'en';
    const isNextMovePayment =
        checkoutContext.source === 'next_move_report_mvp_v1';
    const isDecisionTimingPayment = checkoutContext.source === 'decision_timing_rebuild_v1';
    const buildPaidReturnPath = (targetReadingId?: string | null) => {
        const params = new URLSearchParams({ paid: 'true' });
        const source = checkoutContext.source;
        const resolvedLanguage = checkoutContext.language || language;

        if (targetReadingId) params.set('reading_id', targetReadingId);
        if (source === 'next_move_report_mvp_v1' || source === 'decision_timing_rebuild_v1') {
            params.set('entry', source);
        }
        if (resolvedLanguage) params.set('lang', resolvedLanguage);

        return `/start?${params.toString()}`;
    };

    useEffect(() => {
        const verifyPayment = async () => {
            if (!sessionId) {
                setStatus('error');
                setErrorMsg(language === 'en' ? 'Missing checkout session ID.' : '세션 ID가 누락되었습니다.');
                void trackClientGrowthEvent({
                    event: 'checkout_failure',
                    source: 'payment_success_page',
                    step: 'payment_verification',
                    language,
                    readingId: readingId || undefined,
                    metadata: {
                        reason: 'missing_session_id',
                        landingVariant: getLandingVariant(language),
                    },
                });
                return;
            }

            try {
                sessionStorage.setItem('payment_session_id', sessionId);
                if (readingId) {
                    sessionStorage.setItem('payment_reading_id', readingId);
                }

                // Use the existing Stripe GET handler
                const response = await fetch(`/api/payment?session_id=${sessionId}`);
                const result = await response.json();

                if (result.status === 'paid') {
                    const resolvedReadingId =
                        typeof result.reading_id === 'string' && result.reading_id
                            ? result.reading_id
                            : readingId;
                    const resolvedSource =
                        typeof result.source === 'string' && result.source
                            ? result.source
                            : 'payment_success_page';
                    const resolvedLanguage: SupportedLanguage =
                        result.language === 'en' || result.language === 'ko'
                            ? result.language
                            : language;

                    setCheckoutContext({
                        source: resolvedSource,
                        language: resolvedLanguage,
                        readingId: resolvedReadingId || null,
                    });
                    setStatus('success');
                    void trackClientGrowthEvent({
                        event: 'checkout_success',
                        source: resolvedSource,
                        step: 'payment_verification',
                        language: resolvedLanguage,
                        readingId: resolvedReadingId || undefined,
                        plan: result.payment_type || 'premium_reading',
                        metadata: {
                            sessionId,
                            landingVariant: getLandingVariant(resolvedLanguage),
                        },
                    });
                    // Mark payment completed in storage for start/page.tsx to pick up
                    sessionStorage.setItem('payment_completed', 'true');
                    sessionStorage.setItem('is_premium_user', 'true');
                    sessionStorage.setItem('payment_source', resolvedSource);
                    sessionStorage.setItem('payment_language', resolvedLanguage);
                    if (resolvedReadingId) {
                        sessionStorage.setItem('pending_reading_id', resolvedReadingId);
                        sessionStorage.setItem('payment_reading_id', resolvedReadingId);
                    }

                    setTimeout(() => {
                        const params = new URLSearchParams({ paid: 'true' });
                        if (resolvedReadingId) params.set('reading_id', resolvedReadingId);
                        if (resolvedSource === 'next_move_report_mvp_v1' || resolvedSource === 'decision_timing_rebuild_v1') {
                            params.set('entry', resolvedSource);
                        }
                        params.set('lang', resolvedLanguage);
                        router.replace(`/start?${params.toString()}`);
                    }, 1000);
                } else {
                    setStatus('error');
                    setErrorMsg(language === 'en' ? 'The payment was not completed.' : '결제가 완료되지 않았습니다.');
                    void trackClientGrowthEvent({
                        event: 'checkout_failure',
                        source: 'payment_success_page',
                        step: 'payment_verification',
                        language,
                        readingId: readingId || undefined,
                        metadata: {
                            sessionId,
                            status: result.status || 'unknown',
                            landingVariant: getLandingVariant(language),
                        },
                    });
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setErrorMsg(language === 'en' ? 'An error occurred while verifying your payment.' : '결제 검증 중 오류가 발생했습니다.');
                void trackClientGrowthEvent({
                    event: 'checkout_failure',
                    source: 'payment_success_page',
                    step: 'payment_verification',
                    language,
                    readingId: readingId || undefined,
                    metadata: {
                        sessionId,
                        reason: error instanceof Error ? error.message : 'payment_verification_error',
                        landingVariant: getLandingVariant(language),
                    },
                });
            }
        };

        verifyPayment();
    }, [language, readingId, router, sessionId]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl text-center"
        >
            {status === 'loading' && (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-[#A184FF] border-t-transparent rounded-full animate-spin mx-auto" />
                    <h1 className="text-xl font-bold text-white">{isEnglish ? 'Confirming your checkout...' : '결제 승인 중...'}</h1>
                    <p className="text-white/60 text-sm">{isEnglish ? 'Please wait a moment.' : '잠시만 기다려 주세요.'}</p>
                </div>
            )}

            {status === 'success' && (
                <div className="space-y-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} className="text-green-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">{isEnglish ? 'Payment complete!' : '결제가 완료되었습니다!'}</h1>
                        <p className="text-white/60 text-sm leading-relaxed">
                            {isNextMovePayment ? (
                                isEnglish ? (
                                    <>
                                        Your Next Move Report full report is opening now.<br />
                                        We will move you back to the result in a moment.
                                    </>
                                ) : (
                                    <>
                                        Next Move Report 전체 리포트를 여는 중입니다.<br />
                                        곧 결과로 돌아갑니다.
                                    </>
                                )
                            ) : isDecisionTimingPayment ? (
                                isEnglish ? (
                                    <>
                                        Your decision timing full report is opening now.<br />
                                        We will move you back to the result in a moment.
                                    </>
                                ) : (
                                    <>
                                        결정 타이밍 전체 리포트를 여는 중입니다.<br />
                                        곧 결과로 돌아갑니다.
                                    </>
                                )
                            ) : isEnglish ? (
                                <>
                                    Your Korean saju decision reading is being prepared now.<br />
                                    We will move you back to the result in a moment.
                                </>
                            ) : (
                                <>
                                    운명의 설계자가 당신만을 위한 통합 리포트를<br />
                                    정교하게 다듬고 있습니다. 곧 결과로 안내합니다.
                                </>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            const resolvedReadingId = sessionStorage.getItem('payment_reading_id') || readingId;
                            router.replace(buildPaidReturnPath(resolvedReadingId));
                        }}
                        className="w-full py-4 bg-[#A184FF] text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                    >
                        {isEnglish ? 'See My Reading' : '결과 확인하기'} <ArrowRight size={18} />
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <XCircle size={32} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">{isEnglish ? 'Checkout failed' : '결제 처리 실패'}</h1>
                        <p className="text-white/60 text-sm">
                            {errorMsg || (isEnglish ? 'Something went wrong. Please try again.' : '문제가 발생했습니다. 다시 시도해 주세요.')}
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.replace(`/start${readingId ? `?reading_id=${readingId}` : ''}`)}
                            className="w-full py-4 bg-[#A184FF] text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} /> {isEnglish ? 'Back to reading' : '결과로 돌아가기'}
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-4 bg-white/5 text-white/40 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                        >
                            <Home size={18} /> {isEnglish ? 'Go Home' : '홈으로'}
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
                        <h1 className="text-xl font-bold text-white">결제 정보 로드 중... / Loading payment details...</h1>
                    </div>
                </div>
            }>
                <PaymentSuccessContent />
            </Suspense>
        </div>
    );
}
