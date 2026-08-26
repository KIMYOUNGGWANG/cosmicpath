'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface DecisionGuardProps {
    isOpen: boolean;
    onAccept: () => void;
    language?: 'ko' | 'en';
}

export function DecisionGuard({ isOpen, onAccept, language = 'ko' }: DecisionGuardProps) {
    const isEn = language === 'en';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="relative mx-auto mb-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-rose-500/30 bg-[#141520] p-6 text-center shadow-2xl"
                >
                    <div className="absolute inset-0 bg-rose-500/5 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                            <ShieldAlert size={26} />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-white">
                            {isEn ? 'Strategic Uncertainty Notice' : '전략적 신중 검토 권고'}
                        </h3>
                        <p className="mb-6 text-sm leading-relaxed text-gray-300 md:text-base">
                            {isEn ? (
                                <>
                                    This reading shows <strong>very low confidence</strong> or unusually mixed signals.
                                    Treat it as a reference point, not a verdict, and use your own judgment for important choices.
                                </>
                            ) : (
                                <>
                                    이번 결과는 <strong>신뢰도가 매우 낮거나</strong> 신호가 유난히 엇갈리는 상태입니다.
                                    참고용으로만 받아들이고, 중요한 결정은 반드시 당신의 판단을 우선하세요.
                                </>
                            )}
                        </p>

                        <button
                            onClick={onAccept}
                            className="inline-flex min-w-[220px] items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-red-800 px-6 py-3 text-sm font-bold text-white transition-all hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] active:scale-95"
                        >
                            {isEn ? 'Hide this warning' : '이 경고 닫기'}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
