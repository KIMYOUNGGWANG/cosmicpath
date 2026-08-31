'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ReadingSession,
    useFollowUp as addFollowUpQuestion,
    addAssistantMessage,
    getRemainingQuestions,
    addCredits
} from '@/lib/session/reading-session';
import { Send, Loader2, Lock, Sparkles, Share2 } from 'lucide-react';

interface FollowUpChatProps {
    session: ReadingSession;
    onSessionUpdate: (session: ReadingSession) => void;
    onPurchaseMore?: () => void;
    shareUrl?: string;
}

export function FollowUpChat({
    session,
    onSessionUpdate,
    shareUrl
}: FollowUpChatProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'done'>('idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const remaining = getRemainingQuestions(session);
    const isExhausted = remaining <= 0;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [session.followUpHistory]);

    // 카카오톡 공유 핸들러
    const handleKakaoShare = () => {
        if (typeof window === 'undefined') return;

        const kakao = (
            window as {
                Kakao?: {
                    isInitialized: () => boolean;
                    init: (key: string) => void;
                    Share: { sendDefault: (payload: unknown) => void };
                };
            }
        ).Kakao;

        if (!kakao) {
            alert('카카오톡 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        if (!kakao.isInitialized()) {
            const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
            if (jsKey) {
                try {
                    kakao.init(jsKey);
                } catch (e) {
                    console.error('Kakao init error:', e);
                }
            } else {
                console.error('Kakao JS Key is missing');
                return;
            }
        }

        setShareStatus('sharing');

        // 현재 도메인 기반으로 URL 구성
        const origin = window.location.origin;
        const appUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;

        // shareUrl이 있으면 절대경로로 완성, 없으면 현재 페이지 URL 사용
        let finalUrl = window.location.href;
        if (shareUrl) {
            finalUrl = shareUrl.startsWith('http') ? shareUrl : `${appUrl}${shareUrl.startsWith('/') ? '' : '/'}${shareUrl}`;
        }

        try {
            kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: '✨ 나의 CosmicPath 운세 리딩 결과',
                    description: '사주 + 점성술 + 자미두수 5대 엔진 통합 분석! 나의 운명을 확인해보세요 🌟',
                    imageUrl: 'https://www.cosmicpath.app/og-image.png',
                    imageWidth: 1200,
                    imageHeight: 630,
                    link: {
                        mobileWebUrl: finalUrl,
                        webUrl: finalUrl,
                    },
                },
                buttons: [
                    {
                        title: '결과 보러가기',
                        link: {
                            mobileWebUrl: finalUrl,
                            webUrl: finalUrl,
                        },
                    },
                ],
            });

            // 공유 창이 열리면 크레딧 지급
            setTimeout(() => {
                const updated = addCredits(session, 1);
                onSessionUpdate(updated);
                setShareStatus('done');
            }, 1000);
        } catch (error) {
            console.error('Kakao share failed:', error);
            setShareStatus('idle');
            // 폴백: 링크 복사
            navigator.clipboard.writeText(finalUrl).then(() => {
                alert('카카오톡 공유 중 오류가 발생하여 링크가 복사되었습니다! 친구에게 직접 공유해주세요.');
                const updated = addCredits(session, 1);
                onSessionUpdate(updated);
                setShareStatus('done');
            });
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || isExhausted) return;

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);

        // 질문 카운트 업데이트
        const updatedSession = addFollowUpQuestion(session, userMessage);
        if (!updatedSession) {
            setIsLoading(false);
            return;
        }
        onSessionUpdate(updatedSession);

        try {
            // AI 응답 요청
            const response = await fetch('/api/reading/followup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userMessage,
                    context: session.readingResult,
                    history: updatedSession.followUpHistory,
                }),
            });

            const data = await response.json();

            // AI 응답 추가
            const finalSession = addAssistantMessage(updatedSession, data.answer || '죄송합니다. 응답을 생성하지 못했습니다.');
            onSessionUpdate(finalSession);
        } catch (error) {
            console.error('Follow-up failed:', error);
            const errorSession = addAssistantMessage(updatedSession, '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
            onSessionUpdate(errorSession);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
        >
            {/* Header */}
            <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center relative"
                        style={{
                            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)',
                            boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)'
                        }}
                    >
                        <span className="text-2xl">🔮</span>
                        {/* Pulsing ring */}
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border border-gold/30"
                        />
                    </div>
                    <div>
                        <h3 className="font-cinzel font-semibold tracking-wide" style={{ color: '#D4AF37' }}>
                            Cosmic Oracle
                        </h3>
                        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            운명에 대해 물어보세요. 신탁이 답합니다.
                        </p>
                    </div>
                </div>

                {/* 남은 질문 카운터 */}
                <div
                    className="px-4 py-2 rounded-full flex items-center gap-2"
                    style={{
                        backgroundColor: isExhausted
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(34, 197, 94, 0.2)',
                    }}
                >
                    <span
                        className="text-sm font-medium"
                        style={{
                            color: isExhausted ? '#ef4444' : '#22c55e'
                        }}
                    >
                        {remaining}/{session.followUpMax} 남음
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div
                className="p-4 overflow-y-auto"
                style={{
                    maxHeight: '400px',
                    minHeight: '200px',
                }}
            >
                {session.followUpHistory.length === 0 ? (
                    <div className="text-center py-8">
                        <Sparkles
                            size={32}
                            className="mx-auto mb-3"
                            style={{ color: 'rgba(139, 92, 246, 0.5)' }}
                        />
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            리딩 결과가 궁금하신가요?<br />
                            아래에서 질문해보세요!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {session.followUpHistory.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className="max-w-[80%] px-4 py-3 rounded-2xl"
                                    style={{
                                        backgroundColor: message.role === 'user'
                                            ? 'rgba(139, 92, 246, 0.3)'
                                            : 'rgba(255, 255, 255, 0.1)',
                                        borderBottomRightRadius: message.role === 'user' ? '4px' : '16px',
                                        borderBottomLeftRadius: message.role === 'user' ? '16px' : '4px',
                                    }}
                                >
                                    <p
                                        className="text-sm whitespace-pre-wrap"
                                        style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                                    >
                                        {message.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div
                                    className="px-4 py-3 rounded-2xl flex items-center gap-2"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                >
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                        style={{ color: '#a855f7' }}
                                    />
                                    <span
                                        className="text-sm"
                                        style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                                    >
                                        답변 생성 중...
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div
                className="p-4"
                style={{ borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}
            >
                {isExhausted ? (
                    <div className="text-center">
                        <div
                            className="flex items-center justify-center gap-2 mb-3"
                            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        >
                            <Lock size={16} />
                            <span className="text-sm">추가 질문을 모두 사용했습니다</span>
                        </div>
                        {/* Viral Share Unlock */}
                        <div className="flex flex-col gap-3 items-center">
                            <button
                                onClick={handleKakaoShare}
                                disabled={shareStatus === 'sharing'}
                                className="group relative px-6 py-3 rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                                style={{
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                                }}
                            >
                                <div className="absolute inset-0 bg-white/20 sm:translate-x-[-100%] sm:group-hover:translate-x-[100%] transition-transform duration-700 blur-md rounded-xl" />
                                <div className="flex items-center gap-2 text-white font-bold relative z-10">
                                    {shareStatus === 'sharing' ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <Share2 size={18} />
                                    )}
                                    <span>
                                        {shareStatus === 'sharing'
                                            ? '공유 준비 중...'
                                            : shareStatus === 'done'
                                                ? '공유 완료!'
                                                : '친구에게 공유하고 질문권 받기 (+1)'}
                                    </span>
                                </div>
                            </button>

                            <p className="text-xs text-center leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                                친구에게 결과를 공유하면<br />
                                <span className="text-violet-400">무료 추가 질문</span>을 드립니다.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="질문을 입력하세요..."
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="px-4 py-3 rounded-xl transition-all"
                            style={{
                                background: input.trim() && !isLoading
                                    ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
                                    : 'rgba(139, 92, 246, 0.3)',
                                color: '#ffffff',
                                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                            }}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
