'use client';

/**
 * 리딩 입력 컴포넌트 - Ethereal Brutalism Style
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
    calendarType: 'solar' | 'lunar';
    unknownTime: boolean;
}

const contexts: { value: ReadingContext; labelKo: string; labelEn: string }[] = [
    { value: 'career', labelKo: '커리어 / 직업', labelEn: 'Career / Job' },
    { value: 'love', labelKo: '연애 / 관계', labelEn: 'Love / Relationship' },
    { value: 'money', labelKo: '재물 / 금전', labelEn: 'Wealth / Money' },
    { value: 'health', labelKo: '건강 / 신체', labelEn: 'Health / Body' },
    { value: 'general', labelKo: '운세 / 종합', labelEn: 'Destiny / General' },
];

export function ReadingInput({ onSubmit, isLoading = false }: ReadingInputProps) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('12:00');
    const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
    const [unknownTime, setUnknownTime] = useState(false);
    const [context, setContext] = useState<ReadingContext>('general');
    const [question, setQuestion] = useState('');
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');

    const isEn = language === 'en';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, gender, birthDate, birthTime, context, question, language, calendarType, unknownTime });
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl mx-auto space-y-12"
        >
            {/* Header / Language */}
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <span className="text-xs font-mono text-dim tracking-widest uppercase">
                    Protocol: Initialization
                </span>
                <div className="flex gap-4 text-xs font-mono">
                    <button
                        type="button"
                        onClick={() => setLanguage('ko')}
                        className={`transition-colors ${language === 'ko' ? 'text-acc-gold' : 'text-dim hover:text-white'}`}
                    >
                        KR
                    </button>
                    <span className="text-dim">/</span>
                    <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`transition-colors ${language === 'en' ? 'text-acc-gold' : 'text-dim hover:text-white'}`}
                    >
                        EN
                    </button>
                </div>
            </div>

            {/* Input Grid */}
            <div className="space-y-12">

                {/* 1. Identity */}
                <div className="relative group">
                    <label className="block text-xs text-acc-gold tracking-widest uppercase mb-4">
                        {isEn ? '01. Subject Identity' : '01. Subject Identity (신원 정보)'}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={isEn ? "NAME (OPTIONAL)" : "이름 / 닉네임 (선택)"}
                                className="w-full bg-transparent border-b border-white/10 py-3 text-lg text-starlight focus:outline-none focus:border-acc-gold transition-colors placeholder:text-white/10 font-cinzel"
                            />
                        </div>
                        <div className="flex gap-8 items-end pb-3">
                            <button
                                type="button"
                                onClick={() => setGender('male')}
                                className={`text-sm tracking-widest uppercase transition-colors ${gender === 'male' ? 'text-starlight border-b border-starlight' : 'text-dim hover:text-moonlight border-b border-transparent'}`}
                            >
                                {isEn ? 'Male' : '남성'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('female')}
                                className={`text-sm tracking-widest uppercase transition-colors ${gender === 'female' ? 'text-starlight border-b border-starlight' : 'text-dim hover:text-moonlight border-b border-transparent'}`}
                            >
                                {isEn ? 'Female' : '여성'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Temporal Coordinates */}
                <div className="relative group">
                    <label className="block text-xs text-acc-gold tracking-widest uppercase mb-4">
                        {isEn ? '02. Temporal Coordinates' : '02. Temporal Coordinates (생년월일시)'}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            {/* Calendar Type Toggle (Styled like Gender tabs) */}
                            <div className="flex gap-6 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setCalendarType('solar')}
                                    className={`text-xs tracking-widest uppercase transition-colors pb-1 ${calendarType === 'solar' ? 'text-starlight border-b border-starlight' : 'text-dim hover:text-moonlight border-b border-transparent'}`}
                                >
                                    {isEn ? 'Solar' : '양력'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalendarType('lunar')}
                                    className={`text-xs tracking-widest uppercase transition-colors pb-1 ${calendarType === 'lunar' ? 'text-starlight border-b border-starlight' : 'text-dim hover:text-moonlight border-b border-transparent'}`}
                                >
                                    {isEn ? 'Lunar' : '음력'}
                                </button>
                            </div>

                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 py-3 text-lg text-starlight focus:outline-none focus:border-acc-gold transition-colors font-mono uppercase"
                                required
                            />
                            <p className="mt-2 text-[10px] text-dim font-mono">YYYY-MM-DD</p>
                        </div>
                        <div>
                            <input
                                type="time"
                                value={birthTime}
                                onChange={(e) => setBirthTime(e.target.value)}
                                disabled={unknownTime}
                                className={`w-full bg-transparent border-b border-white/10 py-3 text-lg text-starlight focus:outline-none focus:border-acc-gold transition-colors font-mono ${unknownTime ? 'opacity-30 cursor-not-allowed' : ''}`}
                            />
                            <p className="mt-2 text-[10px] text-dim font-mono mb-4">{isEn ? 'HH:MM (Local Time)' : 'HH:MM (태어난 시간)'}</p>

                            {/* Custom Styled Checkbox */}
                            <div className="flex items-start gap-3 group/check cursor-pointer" onClick={() => {
                                const newState = !unknownTime;
                                setUnknownTime(newState);
                                if (newState) setBirthTime('12:00');
                            }}>
                                <div className={`mt-0.5 w-4 h-4 border transition-colors flex items-center justify-center ${unknownTime ? 'border-acc-gold bg-acc-gold/10' : 'border-white/20 group-hover/check:border-white/40'}`}>
                                    {unknownTime && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="square" />
                                        </svg>
                                    )}
                                </div>
                                <label className="text-[10px] text-dim cursor-pointer leading-tight pt-0.5 group-hover/check:text-moonlight transition-colors select-none">
                                    {isEn
                                        ? "Unknown Time (Assume 12:00 PM - Accuracy may decrease)"
                                        : "시간 모름 (낮 12:00 기준으로 분석하며, 정확도가 다소 떨어질 수 있습니다)"}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Inquiry Vector */}
                <div className="relative group">
                    <label className="block text-xs text-acc-gold tracking-widest uppercase mb-4">
                        {isEn ? '03. Inquiry Vector' : '03. Inquiry Vector (고민 영역)'}
                    </label>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {contexts.map((ctx) => (
                            <button
                                key={ctx.value}
                                type="button"
                                onClick={() => setContext(ctx.value)}
                                className={`px-4 py-2 text-xs border transition-all uppercase tracking-wider ${context === ctx.value
                                    ? 'border-acc-gold text-bg-void bg-acc-gold font-bold'
                                    : 'border-white/10 text-dim hover:border-white/30 hover:text-moonlight bg-transparent'
                                    }`}
                            >
                                {isEn ? ctx.labelEn : ctx.labelKo}
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={isEn ? "Describe your anxiety or question specifically..." : "구체적인 고민이나 질문을 입력하세요..."}
                        className="w-full bg-white/5 border border-white/20 p-4 text-sm text-starlight focus:outline-none focus:border-acc-gold/80 focus:bg-white/10 transition-colors h-32 resize-none leading-relaxed placeholder:text-white/30"
                    />
                </div>

            </div>

            {/* Action */}
            <div className="pt-12 flex justify-center">
                <button
                    type="submit"
                    disabled={!birthDate || isLoading}
                    className={`group relative px-12 py-4 bg-transparent border border-white/20 overflow-hidden transition-all hover:border-acc-gold/50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className={`relative z-10 font-cinzel font-bold text-sm tracking-[0.3em] uppercase transition-colors ${isLoading ? 'text-dim' : 'text-starlight group-hover:text-acc-gold'}`}>
                        {isLoading ? (isEn ? 'CALCULATING...' : 'CALCULATING...') : (isEn ? 'INITIATE SEQUENCE' : '운명 분석 시작')}
                    </span>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-acc-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                </button>
            </div>

        </motion.form>
    );
}
