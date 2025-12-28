'use client';

/**
 * 리딩 입력 컴포넌트
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ReadingContext } from '@/lib/ai/prompt-builder';

interface ReadingInputProps {
    onSubmit: (data: ReadingData) => void;
    isLoading?: boolean;
}

export interface ReadingData {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    birthTime: string;
    context: ReadingContext;
    question: string;
}

const contexts: { value: ReadingContext; label: string; icon: string }[] = [
    { value: 'career', label: '커리어', icon: '💼' },
    { value: 'love', label: '연애', icon: '❤️' },
    { value: 'money', label: '금전', icon: '💰' },
    { value: 'health', label: '건강', icon: '🏥' },
    { value: 'general', label: '전반적', icon: '🔮' },
];

export function ReadingInput({ onSubmit, isLoading = false }: ReadingInputProps) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [context, setContext] = useState<ReadingContext>('general');
    const [question, setQuestion] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, gender, birthDate, birthTime, context, question });
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 space-y-6"
        >
            {/* 이름 & 성별 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        이름 / 닉네임 <span className="text-gray-500 text-xs">(선택)</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="미입력시 익명"
                        className="input-cosmic w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        성별 <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setGender('male')}
                            className={`py-2.5 rounded-lg border transition-all ${gender === 'male'
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            남성
                        </button>
                        <button
                            type="button"
                            onClick={() => setGender('female')}
                            className={`py-2.5 rounded-lg border transition-all ${gender === 'female'
                                    ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            여성
                        </button>
                    </div>
                </div>
            </div>

            {/* 생년월일 & 생시 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        생년월일 <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="input-cosmic w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        생시 (선택)
                    </label>
                    <input
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="input-cosmic w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        모르면 정오(12:00)로 설정됩니다
                    </p>
                </div>
            </div>

            {/* 컨텍스트 선택 */}
            <div>
                <label className="block text-sm text-gray-400 mb-3">
                    어떤 영역이 궁금하신가요?
                </label>
                <div className="flex flex-wrap gap-2">
                    {contexts.map((ctx) => (
                        <button
                            key={ctx.value}
                            type="button"
                            onClick={() => setContext(ctx.value)}
                            className={`context-btn ${context === ctx.value ? 'active' : ''}`}
                        >
                            <span className="mr-1">{ctx.icon}</span>
                            {ctx.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 질문 입력 */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">
                    구체적인 질문 (선택)
                </label>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="예: 이번 달 이직 결정을 해도 괜찮을까요?"
                    className="input-cosmic w-full h-24 resize-none"
                />
            </div>

            {/* 제출 버튼 */}
            <motion.button
                type="submit"
                disabled={!birthDate || isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`btn-primary w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">✨</span>
                        우주의 신호를 해석하는 중...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <span>🌌</span>
                        3원 통합 리딩 시작하기
                    </span>
                )}
            </motion.button>
        </motion.form>
    );
}
