
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, X } from 'lucide-react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    readingId?: string;
    accessKey?: string;
}

export function ReviewModal({ isOpen, onClose, readingId, accessKey }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [nickname, setNickname] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Handle browser back button - close modal
    useEffect(() => {
        if (!isOpen) return;

        const handlePopState = () => {
            onClose();
        };

        // Push a state so back button closes modal instead of page navigation
        window.history.pushState({ modalType: 'review' }, '');
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            // If checking history state is too complex, just skip explicit back() on unmount
            // relying on user action.
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        setSubmitError(null);
    }, [isOpen]);

    // Handle close button click
    const handleClose = useCallback(() => {
        onClose();
        // Optionally go back if we pushed state
        // if (window.history.state?.modalType === 'review') window.history.back();
    }, [onClose]);

    const handleSubmit = async () => {
        if (!content.trim() || !nickname.trim()) return;

        const resolvedAccessKey =
            accessKey ||
            (typeof window !== 'undefined'
                ? window.sessionStorage.getItem('pending_reading_access_key') ||
                window.localStorage.getItem('pending_reading_access_key')
                : undefined);

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const response = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    readingId,
                    accessKey: resolvedAccessKey,
                    nickname,
                    rating,
                    content,
                    isPromoUser: true // Assuming this modal is triggered for promo users mostly
                }),
            });

            if (response.ok) {
                setIsSubmitted(true);
                localStorage.setItem('review_submitted', 'true');
                setTimeout(onClose, 2000);
                return;
            }

            const payload = await response.json().catch(() => null);
            const fallbackMessage = '후기 등록에 실패했습니다. 잠시 후 다시 시도해주세요.';

            if (response.status === 409) {
                setSubmitError('이미 이 리딩에 대한 후기가 등록되어 있습니다.');
                return;
            }

            if (response.status === 403) {
                setSubmitError('이 리딩에 대한 후기 권한을 확인할 수 없습니다.');
                return;
            }

            setSubmitError(
                typeof payload?.error === 'string' ? payload.error : fallbackMessage
            );
        } catch (error) {
            console.error('Failed to submit review', error);
            setSubmitError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
            >
                <div className="p-6 relative">
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {isSubmitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-acc-gold to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Star className="text-black fill-black" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">🎁 보상 지급 완료!</h3>
                            <p className="text-white/80">
                                소중한 후기 감사합니다.<br />
                                <span className="text-acc-gold font-bold">무료 질문권 1회</span>가 추가되었습니다.
                            </p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-white mb-2">무료 체험은 어떠셨나요?</h2>
                            <p className="text-white/60 text-sm mb-6">
                                솔직한 후기를 남겨주시면<br />
                                더 좋은 서비스를 만드는 데 큰 도움이 됩니다.
                            </p>

                            <div className="space-y-4">
                                {/* Rating */}
                                <div className="flex justify-center gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                size={32}
                                                className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Inputs */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-white/40 mb-1 ml-1">닉네임</label>
                                        <input
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            placeholder="공유될 이름을 입력해주세요"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#A184FF]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/40 mb-1 ml-1">후기 내용</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="자유롭게 작성해주세요 (최소 10자)"
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#A184FF] resize-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!nickname || content.length < 10 || isSubmitting}
                                    className="w-full py-4 bg-[#A184FF] text-white font-bold rounded-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8F6FFF] transition-colors"
                                >
                                    {isSubmitting ? '등록 중...' : '후기 등록하기'}
                                </button>
                                {submitError ? (
                                    <p className="text-sm text-rose-300 text-center">
                                        {submitError}
                                    </p>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
