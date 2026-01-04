'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, MessageCircle, Link2, Check, X, Download } from 'lucide-react';

interface SharePanelProps {
    resultRef?: React.RefObject<HTMLElement | null>;
    shareUrl?: string;
    shareTitle?: string;
    shareDescription?: string;
    language?: 'ko' | 'en';
    onPrint?: () => void;
}

export function SharePanel({
    shareUrl,
    shareTitle = 'CosmicPath 리딩 결과',
    shareDescription = '사주 + 점성술 + 타로 3원 통합 분석 결과를 확인해보세요',
    language = 'ko',
    onPrint,
}: SharePanelProps) {
    const isEn = language === 'en';
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // 카카오톡 공유
    const handleKakaoShare = () => {
        if (typeof window === 'undefined') return;

        const kakao = (window as any).Kakao;

        if (!kakao) {
            alert(isEn ? 'Kakao SDK not loaded.' : '카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
        if (!jsKey) {
            console.error('Kakao JS Key is missing');
            return;
        }

        if (!kakao.isInitialized()) {
            try {
                kakao.init(jsKey);
            } catch (e) {
                console.error('Kakao init error:', e);
            }
        }

        // 도메인 구성을 위한 origin 확인
        const origin = window.location.origin;
        const appUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;

        // shareUrl이 있으면 절대경로로 완성, 없으면 현재 페이지 URL 사용
        let finalUrl = window.location.href;
        if (shareUrl) {
            finalUrl = shareUrl.startsWith('http') ? shareUrl : `${appUrl}${shareUrl.startsWith('/') ? '' : '/'}${shareUrl}`;
        }

        // 설명 글자수 제한
        const trimmedDescription = shareDescription.length > 120
            ? shareDescription.substring(0, 120) + '...'
            : shareDescription;

        // 카카오톡 메시지 전송 (고정된 프로덕션 이미지 사용으로 안정적인 로드 보장)
        kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: shareTitle,
                description: trimmedDescription,
                imageUrl: 'https://cosmicpath.app/og-image.png', // 프로덕션 이미지 고정
                imageWidth: 1200,
                imageHeight: 630,
                link: {
                    mobileWebUrl: finalUrl,
                    webUrl: finalUrl,
                },
            },
            buttons: [
                {
                    title: isEn ? 'View Result' : '상세 결과 보기',
                    link: {
                        mobileWebUrl: finalUrl,
                        webUrl: finalUrl,
                    },
                },
            ],
        });
    };

    // 링크 복사
    const handleCopyLink = async () => {
        const url = shareUrl || window.location.href;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                return;
            }

            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback copy failed:', err);
                alert(isEn ? 'Failed to copy link.' : '링크 복사에 실패했습니다.');
            }

            document.body.removeChild(textArea);
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
                        className="absolute right-0 mt-2 w-64 rounded-2xl overflow-hidden z-50 transition-all duration-300"
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
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
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

                            {/* PDF 저장 */}
                            {onPrint && (
                                <button
                                    onClick={() => {
                                        onPrint();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/5"
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                    >
                                        <Download size={20} style={{ color: '#ffffff' }} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium" style={{ color: '#ffffff' }}>
                                            {isEn ? 'Save as PDF' : 'PDF 소장본 저장'}
                                        </p>
                                        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                            {isEn ? 'High-quality booklet format' : '고퀄리티 책자 형태로 저장'}
                                        </p>
                                    </div>
                                </button>
                            )}

                            {/* 링크 복사 */}
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/5"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
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

                            {/* 궁합 공유 (Compatibility) */}
                            <button
                                onClick={() => {
                                    const compatUrl = shareUrl ? `${shareUrl}?match=invite` : `${window.location.href}?match=invite`;
                                    navigator.clipboard?.writeText(compatUrl);
                                    alert(isEn ? 'Compatibility link copied! Share with your partner.' : '궁합 링크가 복사되었습니다! 상대방에게 공유하세요.');
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/5"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                    style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)' }}
                                >
                                    <span className="text-lg">💕</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-medium" style={{ color: '#ffffff' }}>
                                        {isEn ? 'Check Compatibility' : '궁합 보기'}
                                    </p>
                                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        {isEn ? 'Compare elements with partner' : '상대방과 오행 비교하기'}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
