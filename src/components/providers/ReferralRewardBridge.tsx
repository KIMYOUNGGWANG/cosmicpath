'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

const PENDING_REFERRAL_CODE_KEY = 'cosmicpath.pending_referral_code';
const REFERRAL_ATTEMPT_PREFIX = 'cosmicpath.referral_reward_attempt';

function extractReferralCodeFromUrl(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const params = new URLSearchParams(window.location.search);
    const referralCode =
        params.get('ref') ||
        params.get('referralCode') ||
        params.get('promo');

    return referralCode?.trim().toUpperCase() || null;
}

export function ReferralRewardBridge() {
    const { data: session, status } = useSession();
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        const referralCode = extractReferralCodeFromUrl();

        if (!referralCode) {
            return;
        }

        localStorage.setItem(PENDING_REFERRAL_CODE_KEY, referralCode);
    }, []);

    useEffect(() => {
        const userId = session?.user?.id;

        if (status !== 'authenticated' || !userId || isSubmittingRef.current) {
            return;
        }

        const referralCode = localStorage.getItem(PENDING_REFERRAL_CODE_KEY);

        if (!referralCode) {
            return;
        }

        const attemptKey = `${REFERRAL_ATTEMPT_PREFIX}:${userId}:${referralCode}`;
        if (sessionStorage.getItem(attemptKey) === 'done') {
            return;
        }

        isSubmittingRef.current = true;
        sessionStorage.setItem(attemptKey, 'pending');

        void (async () => {
            try {
                const response = await fetch('/api/referral/reward', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        referralCode,
                        inviteeUserId: userId,
                    }),
                });

                if (response.ok || [400, 401, 404, 409].includes(response.status)) {
                    localStorage.removeItem(PENDING_REFERRAL_CODE_KEY);
                    sessionStorage.setItem(attemptKey, 'done');
                    return;
                }

                sessionStorage.removeItem(attemptKey);
            } catch {
                sessionStorage.removeItem(attemptKey);
            } finally {
                isSubmittingRef.current = false;
            }
        })();
    }, [session?.user?.id, status]);

    return null;
}
