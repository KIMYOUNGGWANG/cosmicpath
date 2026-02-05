'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Check } from 'lucide-react';
import { CosmicShareCard } from './CosmicShareCard';
import { useShareCard } from '@/hooks/useShareCard';

interface ShareCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    trustScore: number;
    matchLevel: 'PERFECT' | 'PARTIAL' | 'CONFLICT';
    keywords: string[];
    userName?: string;
}

/**
 * 공유 카드 모달
 * 카드 미리보기 + 다운로드 버튼 제공
 */
export function ShareCardModal({
    isOpen,
    onClose,
    title,
    trustScore,
    matchLevel,
    keywords,
    userName,
}: ShareCardModalProps) {
    const { cardRef, isCapturing, captureAndDownload } = useShareCard({
        filename: 'cosmic-reading',
    });
    const [isDownloaded, setIsDownloaded] = useState(false);

    const handleDownload = async () => {
        await captureAndDownload();
        setIsDownloaded(true);
        setTimeout(() => setIsDownloaded(false), 3000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 닫기 버튼 */}
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                        >
                            <X size={24} className="text-white/60" />
                        </button>

                        {/* 카드 미리보기 */}
                        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#A184FF]/20 mb-6">
                            <CosmicShareCard
                                ref={cardRef}
                                title={title}
                                trustScore={trustScore}
                                matchLevel={matchLevel}
                                keywords={keywords}
                                userName={userName}
                            />
                        </div>

                        {/* 다운로드 버튼 */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownload}
                                disabled={isCapturing}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm
                                    transition-all shadow-lg
                                    ${isDownloaded
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                        : 'bg-gradient-to-r from-[#A184FF] to-[#6366F1] text-white shadow-[#A184FF]/30 hover:opacity-90'
                                    }
                                    disabled:opacity-50
                                `}
                            >
                                {isCapturing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        저장 중...
                                    </>
                                ) : isDownloaded ? (
                                    <>
                                        <Check size={18} />
                                        저장 완료!
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        이미지 저장
                                    </>
                                )}
                            </button>
                        </div>

                        {/* 안내 문구 */}
                        <p className="text-white/40 text-xs mt-4 text-center">
                            저장한 이미지를 인스타그램 스토리에 공유해보세요 ✨
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
