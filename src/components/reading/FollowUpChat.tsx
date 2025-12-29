'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ReadingSession,
    Message,
    useFollowUp,
    addAssistantMessage,
    getRemainingQuestions
} from '@/lib/session/reading-session';
import { MessageCircle, Send, Loader2, Lock, Sparkles } from 'lucide-react';

interface FollowUpChatProps {
    session: ReadingSession;
    onSessionUpdate: (session: ReadingSession) => void;
    onPurchaseMore?: () => void;
}

export function FollowUpChat({
    session,
    onSessionUpdate,
    onPurchaseMore
}: FollowUpChatProps) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const remaining = getRemainingQuestions(session);
    const isExhausted = remaining <= 0;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [session.followUpHistory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || isExhausted) return;

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);

        // 질문 카운트 업데이트
        const updatedSession = useFollowUp(session, userMessage);
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
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                    >
                        <MessageCircle size={20} style={{ color: '#a855f7' }} />
                    </div>
                    <div>
                        <h3 className="font-semibold" style={{ color: '#ffffff' }}>
                            추가 질문
                        </h3>
                        <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            리딩 결과에 대해 더 궁금한 점을 물어보세요
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
                        {onPurchaseMore && (
                            <button
                                onClick={onPurchaseMore}
                                className="px-6 py-2 rounded-full text-sm font-medium transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                                    color: '#ffffff',
                                }}
                            >
                                추가 질문권 구매 ($2.99)
                            </button>
                        )}
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
