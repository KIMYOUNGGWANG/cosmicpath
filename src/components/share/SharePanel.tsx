'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, MessageCircle, Link2, Check, X, Download, AtSign, Music2, Gift, Users } from 'lucide-react';

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

    const resolveShareUrl = useCallback(() => {
        if (typeof window === 'undefined') return shareUrl || '';
        if (!shareUrl) return window.location.href;

        const origin = window.location.origin;
        return shareUrl.startsWith('http')
            ? shareUrl
            : `${origin}${shareUrl.startsWith('/') ? '' : '/'}${shareUrl}`;
    }, [shareUrl]);

    const readingId = useMemo(() => {
        const resolvedUrl = resolveShareUrl();
        if (!resolvedUrl) return null;

        try {
            const parsed = new URL(resolvedUrl, typeof window !== 'undefined' ? window.location.origin : 'https://cosmicpath.app');
            const segments = parsed.pathname.split('/').filter(Boolean);
            return segments.at(-1) ?? null;
        } catch {
            const segments = resolvedUrl.split('/').filter(Boolean);
            return segments.at(-1) ?? null;
        }
    }, [resolveShareUrl]);

    const rewardStorageKey = useMemo(
        () => (readingId ? `share_reward_claimed:${readingId}` : null),
        [readingId]
    );

    const trackShareEvent = useCallback(async (event: string, metadata?: Record<string, unknown>) => {
        try {
            await fetch('/api/growth/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event,
                    readingId: readingId || undefined,
                    source: 'share_panel',
                    path: typeof window !== 'undefined' ? window.location.pathname : '/share',
                    metadata,
                }),
            });
        } catch (error) {
            console.error('[SharePanel] Failed to track share event:', error);
        }
    }, [readingId]);

    const buildTikTokTemplate = (url: string) => {
        if (isEn) {
            return `AI read my destiny today and this one line was too accurate... 🔮\n\nTry yours: ${url}\n#CosmicPath #AIFortune #Astrology #DailyEnergy #fyp`;
        }
        return `AI가 오늘 내 운세를 읽어줬는데 소름 돋았어요 🔮\n\n너도 해보기: ${url}\n#코스믹패스 #AI운세 #오늘의운세 #사주 #추천`;
    };

    const buildThreadsTemplate = (url: string) => {
        if (isEn) {
            return `This AI destiny reading gave me a much clearer answer than I expected.\n\n${shareDescription}\n\nTry yours: ${url}\n#CosmicPath #AIFortune #ThreadsFinds`;
        }

        return `오늘 리딩에서 가장 소름이었던 포인트:\n${shareDescription}\n\n나도 해본 링크 ${url}\n#코스믹패스 #AI운세 #사주 #타로 #Threads추천`;
    };

    const claimReward = useCallback(async () => {
        if (!readingId || !rewardStorageKey) return false;

        const hasClaimed = sessionStorage.getItem(rewardStorageKey);
        if (hasClaimed) return false;

        try {
            const res = await fetch('/api/reading/claim-share-reward', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ readingId }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                alert(isEn ? '🎁 Share Reward: +1 Free Question Credit!' : '🎁 공유 보상: 추가 질문권 1개가 지급되었습니다!');
                sessionStorage.setItem(rewardStorageKey, 'true');
                window.dispatchEvent(new Event('credit-updated'));
                await trackShareEvent('share_reward_claimed_client', { readingId });
                return true;
            } else {
                if (data?.alreadyClaimed || data?.message === 'Reward already claimed') {
                    sessionStorage.setItem(rewardStorageKey, 'true');
                }
                return false;
            }
        } catch (error) {
            console.error('Failed to claim reward:', error);
            return false;
        }
    }, [isEn, readingId, rewardStorageKey, trackShareEvent]);

    // 카카오톡 공유
    const handleKakaoShare = () => {
        if (typeof window === 'undefined') return;

        const kakao = (
            window as {
                Kakao?: {
                    isInitialized: () => boolean;
                    init: (key: string) => void;
                    Share: { sendDefault: (payload: unknown) => void };
                };
            }
        ).Kakao;

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

        const ogImageUrl = readingId
            ? `${appUrl}/api/og/reading/${readingId}`
            : 'https://cosmicpath.app/og-image.png';

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
                imageUrl: ogImageUrl,
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

        // 공유 시도 시 보상 청구
        void trackShareEvent('share_kakao_clicked');
        void claimReward();
    };

    // 링크 복사
    const handleCopyLink = async () => {
        const url = resolveShareUrl();

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                void trackShareEvent('share_link_copied');
                void claimReward();
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
                void trackShareEvent('share_link_copied_fallback');
                void claimReward();
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

    const handleThreadsShare = () => {
        if (typeof window === 'undefined') return;

        const url = resolveShareUrl();
        const text = buildThreadsTemplate(url);

        const intentUrl = `https://threads.net/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(intentUrl, '_blank', 'noopener,noreferrer');
        void trackShareEvent('share_threads_clicked');
        void claimReward();
    };

    const handleCopyTikTokTemplate = async () => {
        const url = resolveShareUrl();
        const template = buildTikTokTemplate(url);

        try {
            await navigator.clipboard.writeText(template);
            alert(isEn ? 'TikTok caption copied!' : 'TikTok 공유 문구가 복사되었습니다!');
            void trackShareEvent('share_tiktok_caption_copied');
            void claimReward();
        } catch {
            alert(isEn ? 'Failed to copy TikTok caption.' : 'TikTok 문구 복사에 실패했습니다.');
        }
    };

    // ... (중략)

    return (
        <div className="relative">
            {/* 공유 버튼 */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ y: -2, boxShadow: '0 18px 36px rgba(212,175,55,0.16)' }}
                whileTap={{ scale: 0.985 }}
                className="relative flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-[transform,box-shadow,background-color,border-color] duration-300 hover:bg-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.12)',
                    color: '#f4d88a',
                    border: '1px solid rgba(212, 175, 55, 0.24)',
                }}
            >
                <div className="absolute -top-3 -right-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-rose-950/40">
                    <Gift size={10} />
                    <span>+1 Credit</span>
                </div>
                <Share2 size={18} />
                {isEn ? 'Share & Get Reward' : '공유하고 선물받기'}
            </motion.button>

            {/* 공유 패널 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl backdrop-blur-xl"
                        style={{
                            background: 'linear-gradient(135deg, #15131b 0%, #101a24 100%)',
                            border: '1px solid rgba(212, 175, 55, 0.18)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <div
                            className="px-4 py-3 flex items-center justify-between"
                            style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.16)' }}
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-white">
                                    {isEn ? 'Share Result' : '결과 공유하기'}
                                </span>
                                <span className="text-xs font-medium mt-0.5 text-acc-gold">
                                    {isEn ? 'Threads-first viral copy included' : 'Threads용 바이럴 문구 포함'}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1 transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-2">
                            <div className="mb-2 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.22em] text-starlight/40">
                                    {isEn ? 'Recommended' : '추천 채널'}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-starlight/68">
                                    {isEn ? 'Threads is tuned for fast post-and-share loops.' : 'Threads는 지금 가장 빠르게 퍼지는 공유 루프에 맞춰 문구를 최적화했습니다.'}
                                </p>
                            </div>

                            <button
                                onClick={handleThreadsShare}
                                className="w-full rounded-xl px-4 py-3 text-left transition-[transform,background-color] duration-200 hover:translate-x-1 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                            >
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                                >
                                    <AtSign size={20} style={{ color: '#ffffff' }} />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium" style={{ color: '#ffffff' }}>
                                        {isEn ? 'Share to Threads' : 'Threads 공유'}
                                    </p>
                                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        {isEn ? 'Optimized viral caption included' : '바이럴 문구까지 자동 생성'}
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={handleKakaoShare}
                                className="w-full rounded-xl px-4 py-3 text-left transition-[transform,background-color] duration-200 hover:translate-x-1 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                            >
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200"
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

                            {/* TikTok 템플릿 복사 */}
                            <button
                                onClick={handleCopyTikTokTemplate}
                                className="w-full rounded-xl px-4 py-3 text-left transition-[transform,background-color] duration-200 hover:translate-x-1 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                            >
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200"
                                    style={{ backgroundColor: 'rgba(244, 63, 94, 0.2)' }}
                                >
                                    <Music2 size={20} style={{ color: '#f43f5e' }} />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium" style={{ color: '#ffffff' }}>
                                        {isEn ? 'Copy TikTok Caption' : 'TikTok 문구 복사'}
                                    </p>
                                    <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                        {isEn ? 'Optimized viral template' : '바이럴 최적화 템플릿'}
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
                                    className="w-full rounded-xl px-4 py-3 text-left transition-[transform,background-color] duration-200 hover:translate-x-1 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                                >
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200"
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
                                className="w-full rounded-xl px-4 py-3 text-left transition-[transform,background-color] duration-200 hover:translate-x-1 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                            >
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200"
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
                                    void trackShareEvent('share_compatibility_link_copied');
                                    alert(isEn ? 'Compatibility link copied! Share with your partner.' : '궁합 링크가 복사되었습니다! 상대방에게 공유하세요.');
                                    setIsOpen(false);
                                }}
                                className="w-full rounded-xl px-4 py-3 text-left transition-[transform,background-color] duration-200 hover:translate-x-1 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                            >
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200"
                                    style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)' }}
                                >
                                    <Users size={20} style={{ color: '#f472b6' }} />
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
