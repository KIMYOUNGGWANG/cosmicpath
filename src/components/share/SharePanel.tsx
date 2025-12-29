'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';
import { Share2, MessageCircle, Download, Link2, Check, X, Loader2 } from 'lucide-react';

interface SharePanelProps {
    resultRef?: React.RefObject<HTMLElement | null>;
    shareUrl?: string;
    shareTitle?: string;
    shareDescription?: string;
    language?: 'ko' | 'en';
}

export function SharePanel({
    resultRef,
    shareUrl,
    shareTitle = 'CosmicPath 리딩 결과',
    shareDescription = '사주 + 점성술 + 타로 3원 통합 분석 결과를 확인해보세요',
    language = 'ko',
}: SharePanelProps) {
    const isEn = language === 'en';
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    // 이미지로 저장
    const handleSaveImage = async () => {
        if (!resultRef?.current) return;

        setIsSaving(true);

        try {
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(resultRef.current, {
                backgroundColor: '#0f0f23',
                scale: 2,
                logging: false,
                useCORS: true,
            });

            const link = document.createElement('a');
            link.download = `cosmicpath-reading-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to save image:', error);
            alert(isEn ? 'Failed to save image.' : '이미지 저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    // 카카오톡 공유
    const handleKakaoShare = () => {
        if (typeof window === 'undefined') return;

        const kakao = (window as any).Kakao;

        if (!kakao) {
            alert('카카오 SDK가 로드되지 않았습니다.');
            return;
        }

        if (!kakao.isInitialized()) {
            kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
        }

        kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: shareTitle,
                description: shareDescription,
                imageUrl: 'https://images.unsplash.com/photo-1543722530-d185855186ba?q=80&w=1200', // Cosmic placeholder from Unsplash
                link: {
                    mobileWebUrl: shareUrl || window.location.href,
                    webUrl: shareUrl || window.location.href,
                },
            },
            buttons: [
                {
                    title: '결과 보기',
                    link: {
                        mobileWebUrl: shareUrl || window.location.href,
                        webUrl: shareUrl || window.location.href,
                    },
                },
            ],
        });
    };

    // 링크 복사
    const handleCopyLink = async () => {
        const url = shareUrl || window.location.href;

        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <div className="relative">
            {/* 공유 버튼 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all"
                style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    color: '#a855f7',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
            >
                <Share2 size={18} />
                {isEn ? 'Share' : '공유하기'}
            </button>

            {/* 공유 패널 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden z-50"
                        style={{
                            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        {/* Header */}
                        <div
                            className="px-4 py-3 flex items-center justify-between"
                            style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}
                        >
                            <span className="font-medium" style={{ color: '#ffffff' }}>
                                {isEn ? 'Share Result' : '결과 공유하기'}
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Options */}
                        <div className="p-2">
                            {/* 카카오톡 */}
                            <button
                                onClick={handleKakaoShare}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/5"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: '#FEE500' }}
                                >
                                    <MessageCircle size={20} style={{ color: '#3C1E1E' }} />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium" style={{ color: '#ffffff' }}>
                                        {isEn ? 'KakaoTalk' : '카카오톡 공유'}
                                    </p>
                                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        {isEn ? 'Share with friends' : '친구에게 결과 공유'}
                                    </p>
                                </div>
                            </button>

                            {/* 이미지 저장 */}
                            <button
                                onClick={handleSaveImage}
                                disabled={isSaving}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/5"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                                >
                                    {isSaving ? (
                                        <Loader2 size={20} className="animate-spin" style={{ color: '#22c55e' }} />
                                    ) : (
                                        <Download size={20} style={{ color: '#22c55e' }} />
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="font-medium" style={{ color: '#ffffff' }}>
                                        {isSaving ? (isEn ? 'Saving...' : '저장 중...') : (isEn ? 'Save as Image' : '이미지로 저장')}
                                    </p>
                                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        {isEn ? 'Download as PNG' : 'PNG 파일로 다운로드'}
                                    </p>
                                </div>
                            </button>

                            {/* 링크 복사 */}
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/5"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                                >
                                    {copied ? (
                                        <Check size={20} style={{ color: '#22c55e' }} />
                                    ) : (
                                        <Link2 size={20} style={{ color: '#3b82f6' }} />
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="font-medium" style={{ color: '#ffffff' }}>
                                        {copied ? (isEn ? 'Copied!' : '복사됨!') : (isEn ? 'Copy Link' : '링크 복사')}
                                    </p>
                                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        {isEn ? 'Result page URL' : '결과 페이지 URL'}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Script
                id="kakao-sdk"
                src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (window.Kakao && !window.Kakao.isInitialized()) {
                        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
                    }
                }}
            />
        </div>
    );
}

declare global {
    interface Window {
        Kakao: any;
    }
}
