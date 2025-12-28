'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface DecisionGuardProps {
    isOpen: boolean;
    onAccept: () => void;
}

export function DecisionGuard({ isOpen, onAccept }: DecisionGuardProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#1a1c23] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden p-8 text-center"
                    >
                        <div className="absolute inset-0 bg-red-500/5 z-0" />

                        <div className="relative z-10">
                            <div className="text-5xl mb-6">⚠️</div>
                            <h3 className="text-2xl font-bold text-white mb-4">운명의 경고</h3>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                현재 당신의 사주와 타로 신호가 <strong>강하게 충돌</strong>하거나,
                                분석 결과의 <strong>신뢰도가 낮은 수준</strong>으로 감지되었습니다.
                                <br /><br />
                                AI의 조언은 참고용일 뿐이며, 중요한 선택의 주도권은
                                오직 <strong>당신 자신</strong>에게 있습니다.
                                <br /><br />
                                이 위험성을 인지하고 결과를 확인하시겠습니까?
                            </p>

                            <button
                                onClick={onAccept}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-bold hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all active:scale-95"
                            >
                                네, 제 의지로 판단하겠습니다
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
