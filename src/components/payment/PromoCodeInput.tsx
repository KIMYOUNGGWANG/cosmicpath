
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check, X, Loader2 } from 'lucide-react';

interface PromoCodeInputProps {
    onApply: (codeId: string, discount: number) => void;
    disabled?: boolean;
}

export function PromoCodeInput({ onApply, disabled }: PromoCodeInputProps) {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
    const [message, setMessage] = useState('');

    const handleApply = async () => {
        if (!code.trim()) return;

        setStatus('validating');
        setMessage('');

        try {
            const response = await fetch('/api/promo/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim() }),
            });

            const data = await response.json();

            if (data.valid) {
                setStatus('valid');
                setMessage(`코드 적용 완료! (${data.remaining}명 남음)`);
                onApply(data.id, data.discount);
            } else {
                setStatus('invalid');
                setMessage(data.message || '유효하지 않은 코드입니다.');
            }
        } catch (error) {
            setStatus('invalid');
            setMessage('오류가 발생했습니다.');
        }
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setStatus('idle');
                    }}
                    placeholder="프로모션 코드 입력"
                    disabled={disabled || status === 'valid'}
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-20 text-white placeholder-white/40 focus:outline-none transition-colors
                        ${status === 'invalid' ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#A184FF]'}
                        ${status === 'valid' ? 'border-green-500/50 text-green-400' : ''}
                    `}
                />
                <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />

                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {status === 'valid' ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm font-medium px-2">
                            <Check size={14} /> 적용됨
                        </span>
                    ) : (
                        <button
                            onClick={handleApply}
                            disabled={!code || status === 'validating' || disabled}
                            className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                        >
                            {status === 'validating' ? <Loader2 size={14} className="animate-spin" /> : '적용'}
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {status !== 'idle' && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`text-xs pl-1 ${status === 'valid' ? 'text-green-400' : 'text-red-400'}`}
                    >
                        {message}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
