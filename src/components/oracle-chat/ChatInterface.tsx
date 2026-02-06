'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditPurchaseModal } from './CreditPurchaseModal';

interface Message {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    readingId: string;
}

export function ChatInterface({ readingId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [credits, setCredits] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();
    const router = useRouter();


    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/reading/followup?readingId=${readingId}`);
            if (res.ok) {
                const data = await res.json();
                setCredits(data.credits);
                setMessages(data.messages || []);
            }
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
        if (searchParams.get('payment') === 'success') {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);

            // [DEV ONLY] 웹훅 설정 없이도 개발 환경에서 테스트 가능하도록 강제 지급
            if (process.env.NODE_ENV === 'development') {
                fetch('/api/debug/force-credit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ readingId })
                }).then(() => console.log('[Dev] Forced credit update'));
            }

            setTimeout(() => {
                fetchStatus();
                alert('결제가 완료되었습니다! 추가 질문권이 지급되었습니다.');
            }, 1000);
        }
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
        if (!input.trim() || !credits || credits <= 0 || isLoading) return;

        setHasInteracted(true);
        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setIsThinking(true);

        try {
            const res = await fetch('/api/reading/followup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    readingId,
                    question: userMessage,
                }),
            });

            if (!res.ok) throw new Error('Failed to send message');

            const data = await res.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer
            }]);
            setCredits(data.creditsLeft);

        } catch (error) {
            console.error(error);
            alert('메시지 전송 중 오류가 발생했습니다.');
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

    return (
        <div className="w-full max-w-2xl mx-auto mt-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-deep-navy/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-star-yellow animate-pulse" />
                    <h3 className="text-lg font-bold text-gray-100">Oracle Chat</h3>
                </div>
                <div className="text-sm font-medium">
                    <span className="text-gray-400 mr-2">남은 질문권:</span>
                    <span className={credits && credits > 0 ? "text-star-yellow" : "text-red-400"}>
                        {credits !== null ? `${credits}회` : '...'}
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {messages.length === 0 && !isThinking && (
                    <div className="text-center text-gray-400 py-10">
                        <p>운세에 대해 더 궁금한 점이 있으신가요?</p>
                        <p className="text-sm mt-2 opacity-70">AI 상담가에게 무엇이든 물어보세요.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                            ? 'bg-star-yellow/20 text-star-yellow rounded-tr-none'
                            : 'bg-white/10 text-gray-200 rounded-tl-none'
                            }`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </motion.div>
                ))}

                {isThinking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-deep-navy/30">
                {credits !== null && credits > 0 ? (
                    <div className="relative flex items-center gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="질문을 입력하세요..."
                            disabled={isLoading}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-star-yellow/50 resize-none h-[50px] scrollbar-hide"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="p-3 bg-star-yellow/20 hover:bg-star-yellow/30 text-star-yellow rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsPurchaseModalOpen(true)}
                        className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B4941F] hover:opacity-90 rounded-xl flex items-center justify-center gap-2 text-black font-semibold transition-all shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 active:scale-[0.98]"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>질문권 충전하기</span>
                    </button>
                )}
            </div>

            {/* Credit Purchase Modal */}
            <CreditPurchaseModal
                isOpen={isPurchaseModalOpen}
                onClose={() => setIsPurchaseModalOpen(false)}
                onSelectOption={handlePayment}
                isLoading={isLoading}
            />
        </div>
    );
}
