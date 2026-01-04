'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 초기 상태 로드
    useEffect(() => {
        const fetchStatus = async () => {
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
        };
        fetchStatus();
    }, [readingId]);

    // 스크롤 자동 이동
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!input.trim() || !credits || credits <= 0 || isLoading) return;

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

    // 결제 핸들러 (임시)
    const handlePayment = () => {
        if (confirm('질문권을 충전하시겠습니까? ($1.00)')) {
            alert('결제 시스템 연동 준비 중입니다.');
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
                        onClick={handlePayment}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all shadow-lg hover:shadow-purple-500/25"
                    >
                        <Lock className="w-4 h-4" />
                        <span>추가 질문권 구매하기 ($1.00)</span>
                    </button>
                )}
            </div>
        </div>
    );
}
