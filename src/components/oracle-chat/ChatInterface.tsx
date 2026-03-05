'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { CreditPurchaseModal } from './CreditPurchaseModal';
import { SubscriptionModal } from '@/components/payment/SubscriptionModal';

interface Message {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ChatStatusResponse {
    credits: number;
    messages: Message[];
    isUnlimited?: boolean;
}

interface ErrorPayload {
    error?: string | { message?: string };
}

interface ChatInterfaceProps {
    readingId: string;
}

export function ChatInterface({ readingId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [credits, setCredits] = useState<number | null>(null);
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [accessError, setAccessError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();


    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/reading/followup?readingId=${readingId}`);
            const payload = (await res.json().catch(() => ({}))) as ChatStatusResponse & ErrorPayload;

            if (!res.ok) {
                const errorMessage =
                    typeof payload.error === 'string'
                        ? payload.error
                        : payload.error?.message;

                if (res.status === 401 || res.status === 403) {
                    setAccessError(errorMessage || '이 리딩에 접근할 권한이 없습니다.');
                    setIsUnlimited(false);
                    setCredits(0);
                    setMessages([]);
                    return;
                }

                throw new Error(errorMessage || 'Failed to load chat status');
            }

            setAccessError(null);
            setCredits(payload.credits);
            setMessages(payload.messages || []);
            setIsUnlimited(Boolean(payload.isUnlimited));
        } catch (error) {
            console.error('Failed to load chat status:', error);
        }
    }, [readingId]);

    // 초기 상태 로드
    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    // 결제 성공 처리
    useEffect(() => {
        if (searchParams.get('payment') !== 'success') return;

        const sessionId = searchParams.get('session_id');
        const syncKey = sessionId
            ? `chat-credit-payment-sync:${sessionId}`
            : `chat-credit-payment-sync:dev:${readingId}`;

        const syncState = window.sessionStorage.getItem(syncKey);
        if (syncState === 'processing' || syncState === 'done') {
            window.history.replaceState({}, '', window.location.pathname);
            return;
        }
        window.sessionStorage.setItem(syncKey, 'processing');
        window.history.replaceState({}, '', window.location.pathname);

        const finalizePayment = async () => {
            try {
                if (sessionId) {
                    const verifyRes = await fetch(`/api/payment?session_id=${encodeURIComponent(sessionId)}`);
                    if (!verifyRes.ok) {
                        throw new Error('Payment verification request failed');
                    }

                    const verifyData = await verifyRes.json();
                    if (verifyData.status !== 'paid') {
                        throw new Error('Payment was not confirmed as paid');
                    }
                } else if (process.env.NODE_ENV === 'development') {
                    // Dev fallback for local webhook-less flow
                    await fetch('/api/debug/force-credit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ readingId }),
                    });
                }

                await fetchStatus();
                window.sessionStorage.setItem(syncKey, 'done');
                alert('결제가 완료되었습니다! 추가 질문권이 지급되었습니다.');
            } catch (error) {
                console.error('[ChatCredit] Payment success sync failed:', error);
                window.sessionStorage.removeItem(syncKey);
                await fetchStatus();
                alert('결제는 완료되었지만 질문권 반영이 지연될 수 있습니다. 잠시 후 다시 확인해 주세요.');
            }
        };

        finalizePayment();
    }, [searchParams, fetchStatus, readingId]);

    // 공유 보상 실시간 반영 (SharePanel에서 발생시키는 이벤트 수신)
    useEffect(() => {
        const handleCreditUpdate = () => {
            console.log('[ChatInterface] Credit update event received, refreshing...');
            fetchStatus();
        };

        window.addEventListener('credit-updated', handleCreditUpdate);
        return () => window.removeEventListener('credit-updated', handleCreditUpdate);
    }, [fetchStatus]);

    // 스크롤 자동 이동 - 사용자가 상호작용한 후에만
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (hasInteracted) {
            scrollToBottom();
        }
    }, [messages, isThinking, hasInteracted]);

    // 모바일 키보드 대응: 뷰포트 크기 변경 시 스크롤 조정
    useEffect(() => {
        if (!hasInteracted) return;

        const handleResize = () => {
            // 약간의 딜레이를 주어 키보드 애니메이션 완료 후 스크롤
            setTimeout(scrollToBottom, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [hasInteracted]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || accessError) return;
        if (!isUnlimited && (!credits || credits <= 0)) return;

        setHasInteracted(true);
        const userMessage = input.trim();
        setInput('');

        // 사용자 메시지 즉시 추가
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        // AI 메시지 객체 선행 생성 (스트리밍용)
        const assistantMessageId = 'temp-' + Date.now();
        setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

        setIsLoading(true);
        setIsThinking(true);

        try {
            const res = await fetch('/api/reading/followup/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    readingId,
                    question: userMessage,
                }),
            });

            if (!res.ok) {
                const errorData = (await res.json().catch(() => ({}))) as ErrorPayload;
                const errorMessage =
                    typeof errorData.error === 'string'
                        ? errorData.error
                        : errorData.error?.message;

                if (res.status === 401 || res.status === 403) {
                    setAccessError(errorMessage || '이 리딩에 접근할 권한이 없습니다.');
                    setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
                    return;
                }

                if (res.status === 402) {
                    setIsPurchaseModalOpen(true);
                    setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
                    return;
                }
                throw new Error(errorMessage || 'Failed to send message');
            }

            setIsThinking(false);
            setAccessError(null);

            const reader = res.body?.getReader();
            if (!reader) throw new Error('No reader found');

            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;

                // 해당 메시지만 업데이트
                setMessages(prev => prev.map(m =>
                    m.id === assistantMessageId ? { ...m, content: accumulatedContent } : m
                ));
            }

            // 최종 크레딧 갱신
            setTimeout(fetchStatus, 500);

        } catch (error) {
            console.error(error);
            alert('메시지 전송 중 오류가 발생했습니다.');
            setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
        } finally {
            setIsLoading(false);
            setIsThinking(false);
        }
    };

    // 결제 핸들러 (모달에서 선택된 옵션으로 결제)
    const handlePayment = async (creditType: 'single' | 'pack') => {
        try {
            setIsLoading(true);
            setIsPurchaseModalOpen(false);

            const res = await fetch('/api/payment/chat-credit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    readingId,
                    returnUrl: window.location.href,
                    creditType: creditType
                }),
            });

            if (!res.ok) throw new Error('Payment initialization failed');

            const { url } = await res.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error(error);
            alert('결제 시스템 연결에 실패했습니다.');
            setIsLoading(false);
        }
    };

    const hasAvailableQuestions = isUnlimited || (credits !== null && credits > 0);
    const remainingLabel = isUnlimited ? '∞' : (credits !== null ? `${credits}` : '...');
    const remainingClassName = hasAvailableQuestions ? 'text-[#D4AF37]' : 'text-red-400';

    return (
        <div className="w-full max-w-2xl mx-auto mt-12 bg-[#0A0C1B]/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            {/* Background Aura */}
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B4941F] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        <Sparkles className="w-5 h-5 text-black" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-100 tracking-tight">Cosmic Oracle</h3>
                        <p className="text-[10px] text-star-yellow/70 uppercase tracking-widest font-medium">Digital Deviner</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-medium italic">Remaining:</span>
                    <span className={`text-sm font-bold ${remainingClassName}`}>
                        {remainingLabel}
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="h-[450px] overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10">
                {messages.length === 0 && !isThinking && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-star-yellow/40">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-gray-300 font-medium">운명의 설계도에 대해 더 깊이 물어보세요</p>
                            <p className="text-xs text-gray-500 mt-1">오라클이 당신의 데이터를 바탕으로 답변합니다.</p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 relative group ${msg.role === 'user'
                            ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#B4941F]/10 border border-[#D4AF37]/30 text-[#FFEBB0] rounded-tr-none'
                            : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-sm'
                            }`}>
                            {msg.role === 'assistant' && (
                                <div className="absolute -top-3 -left-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                    <Sparkles className="w-3 h-3 text-star-yellow" />
                                </div>
                            )}
                            <p className="text-[15px] whitespace-pre-wrap leading-relaxed font-light tracking-wide">{msg.content}</p>
                        </div>
                    </motion.div>
                ))}

                {isThinking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/5 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2 border border-white/5 shadow-inner">
                            <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_8px_#D4AF37]" />
                            <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse delay-75 shadow-[0_0_8px_#D4AF37]" />
                            <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse delay-150 shadow-[0_0_8px_#D4AF37]" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-b from-transparent to-black/40">
                {accessError ? (
                    <div className="rounded-2xl border border-red-400/35 bg-red-500/10 px-4 py-4 text-sm text-red-200">
                        {accessError}
                    </div>
                ) : hasAvailableQuestions ? (
                    <div className="relative flex items-center gap-3">
                        <div className="relative flex-1">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="당신만의 운명을 더 깊이 읽어보세요..."
                                disabled={isLoading}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[15px] text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all resize-none h-[60px] scrollbar-hide shadow-inner"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-mono tracking-tighter">
                                ENTER TO SEND
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B4941F] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] text-black rounded-2xl transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center group active:scale-95"
                        >
                            <Send className="w-6 h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                ) : credits === null ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/60">
                        채팅 접근 상태를 확인하는 중입니다...
                    </div>
                ) : (
                    <button
                        onClick={() => setIsPurchaseModalOpen(true)}
                        className="w-full py-5 bg-gradient-to-r from-[#D4AF37] via-[#F2D479] to-[#D4AF37] hover:opacity-95 rounded-2xl flex items-center justify-center gap-3 text-black font-bold text-lg transition-all shadow-[0_8px_30px_rgb(212,175,55,0.25)] hover:shadow-[0_8px_40px_rgb(212,175,55,0.4)] active:scale-[0.98]"
                    >
                        <Sparkles className="w-6 h-6" />
                        <span>오라클 질문권 충전하기</span>
                    </button>
                )}
            </div>

            {/* Credit Purchase Modal */}
            <CreditPurchaseModal
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                onSelectOption={handlePayment}
                onUpgradeToPro={() => setIsSubscriptionModalOpen(true)}
                isLoading={isLoading}
            />

            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
            />
        </div>
    );
}
