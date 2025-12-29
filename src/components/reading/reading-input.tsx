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
    language: 'ko' | 'en';
}

const contexts: { value: ReadingContext; labelKo: string; labelEn: string; icon: string }[] = [
    { value: 'career', labelKo: '커리어', labelEn: 'Career', icon: '💼' },
    { value: 'love', labelKo: '연애', labelEn: 'Love', icon: '❤️' },
    { value: 'money', labelKo: '금전', labelEn: 'Money', icon: '💰' },
    { value: 'health', labelKo: '건강', labelEn: 'Health', icon: '🏥' },
    { value: 'general', labelKo: '전반적', labelEn: 'General', icon: '🔮' },
];

export function ReadingInput({ onSubmit, isLoading = false }: ReadingInputProps) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [context, setContext] = useState<ReadingContext>('general');
    const [question, setQuestion] = useState('');
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');

    const isEn = language === 'en';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, gender, birthDate, birthTime, context, question, language });
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="glass-card p-6 space-y-6"
        >
            {/* 언어 선택 (Language Selection) */}
            <div className="flex justify-center mb-2">
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
                    <button
                        type="button"
                        onClick={() => setLanguage('ko')}
                        className={`px-4 py-1.5 rounded-full text-xs transition-all ${language === 'ko' ? 'bg-gold text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                        한국어
                    </button>
                    <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`px-4 py-1.5 rounded-full text-xs transition-all ${language === 'en' ? 'bg-gold text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                        English
                    </button>
                </div>
            </div>

            {/* 이름 & 성별 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-300 font-medium mb-2">
                        {isEn ? 'Name / Nickname' : '이름 / 닉네임'} <span className="text-gray-500 text-xs">{isEn ? '(Optional)' : '(선택)'}</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isEn ? "Anonymous if blank" : "미입력시 익명"}
                        className="input-cosmic w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-300 font-medium mb-2">
                        {isEn ? 'Gender' : '성별'} <span className="text-red-400">*</span>
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
                            {isEn ? 'Male' : '남성'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setGender('female')}
                            className={`py-2.5 rounded-lg border transition-all ${gender === 'female'
                                ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {isEn ? 'Female' : '여성'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 생년월일 & 생시 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-300 font-medium mb-2">
                        {isEn ? 'Birth Date' : '생년월일'} <span className="text-red-400">*</span>
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
                    <label className="block text-sm text-gray-300 font-medium mb-2">
                        {isEn ? 'Birth Time (Optional)' : '생시 (선택)'}
                    </label>
                    <input
                        type="time"
                        value={birthTime}
                        onChange={(e) => setBirthTime(e.target.value)}
                        className="input-cosmic w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {isEn ? "Defaults to noon (12:00) if unknown" : "모르면 정오(12:00)로 설정됩니다"}
                    </p>
                </div>
            </div>

            {/* 컨텍스트 선택 */}
            <div>
                <label className="block text-sm text-gray-300 font-medium mb-3">
                    {isEn ? 'Which area are you curious about?' : '어떤 영역이 궁금하신가요?'}
                </label>
                <div className="flex flex-wrap gap-2 w-full">
                    {contexts.map((ctx) => (
                        <button
                            key={ctx.value}
                            type="button"
                            onClick={() => setContext(ctx.value)}
                            className={`context-btn whitespace-nowrap ${context === ctx.value ? 'active' : ''}`}
                        >
                            <span className="mr-1">{ctx.icon}</span>
                            {isEn ? ctx.labelEn : ctx.labelKo}
                        </button>
                    ))}
                </div>
            </div>

            {/* 질문 입력 */}
            <div>
                <label className="block text-sm text-gray-300 font-medium mb-2">
                    {isEn ? 'Specific Question (Optional)' : '구체적인 질문 (선택)'}
                </label>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={isEn ? "e.g., Is it a good idea to decide on a career change this month?" : "예: 이번 달 이직 결정을 해도 괜찮을까요?"}
                    className="input-cosmic w-full h-24 resize-none"
                />
            </div>

            {/* 제출 버튼 */}
            <motion.button
                type="submit"
                disabled={!birthDate || isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`btn-primary w-full py-4 text-lg mt-4 shadow-gold/20 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin text-black">✨</span>
                        <span className="text-black font-bold">{isEn ? 'Interpreting cosmic signals...' : '우주의 신호를 해석하는 중...'}</span>
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <span className="text-black text-xl">🌌</span>
                        <span className="text-black font-bold">
                            {isEn ? 'Start Integrated Reading (Saju·Astrology·Tarot)' : '사주·점성·타로 통합 리딩 시작하기'}
                        </span>
                    </span>
                )}
            </motion.button>
        </motion.form>
    );
}
