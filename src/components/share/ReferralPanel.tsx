'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Gift, Users } from 'lucide-react';

interface ReferralPanelProps {
    language?: 'ko' | 'en';
    className?: string;
}

interface InviteCodeResponse {
    referralCode: string;
    totalInvited: number;
    rewardEarned: number;
}

interface RedeemInviteResponse {
    success: boolean;
    message: string;
    proExpiresAt: string;
}

export function ReferralPanel({ language = 'ko', className }: ReferralPanelProps) {
    const isEn = language === 'en';
    const [codeInfo, setCodeInfo] = useState<InviteCodeResponse | null>(null);
    const [isLoadingCode, setIsLoadingCode] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const [noticeType, setNoticeType] = useState<'success' | 'error' | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const text = useMemo(
        () => ({
            title: isEn ? 'Referral Program' : '친구 초대 프로그램',
            subtitle: isEn
                ? 'Invite a friend and both of you get 7 days of Pro access.'
                : '친구를 초대하면 두 사람 모두 Pro 7일 혜택을 받습니다.',
            myCode: isEn ? 'My Referral Code' : '내 초대 코드',
            copy: isEn ? 'Copy' : '복사',
            copied: isEn ? 'Copied' : '복사됨',
            invited: isEn ? 'Total Invited' : '총 초대 수',
            rewardDays: isEn ? 'Reward Earned' : '획득 혜택',
            redeemTitle: isEn ? 'Redeem Code' : '코드 등록',
            redeemPlaceholder: isEn ? 'Enter referral code' : '초대 코드를 입력하세요',
            redeemButton: isEn ? 'Activate 7-day Pro' : '7일 Pro 활성화',
            loginRequired: isEn ? 'Login required' : '로그인이 필요합니다.',
        }),
        [isEn]
    );

    const showNotice = (message: string, type: 'success' | 'error') => {
        setNotice(message);
        setNoticeType(type);
    };

    const fetchCodeInfo = useCallback(async () => {
        setIsLoadingCode(true);
        setNotice(null);
        setNoticeType(null);
        try {
            const response = await fetch('/api/invite/code', { cache: 'no-store' });
            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload?.error?.message || text.loginRequired);
            }

            setCodeInfo(payload as InviteCodeResponse);
        } catch (error) {
            const message = error instanceof Error ? error.message : text.loginRequired;
            showNotice(message, 'error');
        } finally {
            setIsLoadingCode(false);
        }
    }, [text.loginRequired]);

    useEffect(() => {
        void fetchCodeInfo();
    }, [fetchCodeInfo]);

    const handleCopyCode = async () => {
        if (!codeInfo?.referralCode) return;

        try {
            await navigator.clipboard.writeText(codeInfo.referralCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1200);
        } catch {
            showNotice(isEn ? 'Failed to copy code' : '코드 복사에 실패했습니다.', 'error');
        }
    };

    const handleRedeem = async () => {
        const normalized = redeemCode.trim().toUpperCase();
        if (!normalized) {
            showNotice(isEn ? 'Please enter a referral code.' : '초대 코드를 입력해주세요.', 'error');
            return;
        }

        setIsSubmitting(true);
        setNotice(null);
        setNoticeType(null);

        try {
            const response = await fetch('/api/invite/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referralCode: normalized }),
            });
            const payload = (await response.json()) as RedeemInviteResponse & {
                error?: { message?: string };
            };

            if (!response.ok) {
                throw new Error(payload?.error?.message || 'Failed to redeem referral code');
            }

            showNotice(
                isEn
                    ? `${payload.message} (Expires: ${new Date(payload.proExpiresAt).toLocaleDateString()})`
                    : `${payload.message} (만료일: ${new Date(payload.proExpiresAt).toLocaleDateString()})`,
                'success'
            );
            setRedeemCode('');
            await fetchCodeInfo();
        } catch (error) {
            const message = error instanceof Error ? error.message : (isEn ? 'Failed to redeem code' : '코드 등록에 실패했습니다.');
            showNotice(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className={`rounded-2xl border border-white/10 bg-[#0f0f23] p-5 md:p-6 ${className ?? ''}`}>
            <div className="mb-5">
                <h3 className="text-white text-xl font-bold">{text.title}</h3>
                <p className="text-white/60 text-sm mt-1">{text.subtitle}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-4">
                <p className="text-xs uppercase tracking-wider text-white/50 mb-2">{text.myCode}</p>
                <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white font-semibold tracking-wider">
                        {isLoadingCode ? 'Loading...' : (codeInfo?.referralCode ?? '--------')}
                    </div>
                    <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-3 py-2 rounded-lg border border-white/15 text-white/80 hover:bg-white/10 transition-colors flex items-center gap-1.5"
                        disabled={!codeInfo?.referralCode}
                    >
                        <Copy size={14} />
                        <span className="text-xs">{isCopied ? text.copied : text.copy}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-white/50 text-xs mb-1 flex items-center gap-1">
                        <Users size={12} />
                        {text.invited}
                    </p>
                    <p className="text-white font-semibold">{codeInfo?.totalInvited ?? 0}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-white/50 text-xs mb-1 flex items-center gap-1">
                        <Gift size={12} />
                        {text.rewardDays}
                    </p>
                    <p className="text-white font-semibold">{codeInfo?.rewardEarned ?? 0} days</p>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white mb-3">{text.redeemTitle}</p>
                <div className="flex gap-2">
                    <input
                        value={redeemCode}
                        onChange={(event) => setRedeemCode(event.target.value.toUpperCase())}
                        placeholder={text.redeemPlaceholder}
                        className="flex-1 rounded-lg bg-black/35 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-[#A184FF]/50"
                    />
                    <button
                        type="button"
                        onClick={handleRedeem}
                        disabled={isSubmitting}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] disabled:opacity-60"
                    >
                        {isSubmitting ? '...' : text.redeemButton}
                    </button>
                </div>
            </div>

            {notice && (
                <p
                    className={`mt-4 rounded-lg border px-3 py-2 text-sm ${noticeType === 'success'
                        ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-200'
                        : 'border-red-400/35 bg-red-500/10 text-red-200'
                        }`}
                >
                    {notice}
                </p>
            )}
        </section>
    );
}
