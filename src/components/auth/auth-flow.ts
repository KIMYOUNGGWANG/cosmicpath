'use client';

import type { SupportedLanguage } from '@/lib/language-preference';

const AUTH_ERROR_MESSAGES: Record<SupportedLanguage, Record<string, string>> = {
    ko: {
        AccessDenied: '카카오 로그인 권한이 취소되었어요. 다시 시도해주세요.',
        Callback: '로그인 처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
        Configuration: '로그인 설정에 문제가 있어요. 관리자에게 문의해주세요.',
        Default: '로그인에 실패했어요. 잠시 후 다시 시도해주세요.',
        OAuthAccountNotLinked: '같은 이메일로 다른 로그인 방식이 이미 연결되어 있어요.',
        OAuthCallback: '카카오 인증 응답을 처리하지 못했어요. 다시 시도해주세요.',
        OAuthCreateAccount: '카카오 계정을 연결하는 중 문제가 발생했어요.',
        OAuthSignin: '카카오 로그인 화면으로 이동하지 못했어요. 다시 시도해주세요.',
        SessionRequired: '이 페이지는 로그인 후 이용할 수 있어요.',
        Verification: '인증이 만료되었어요. 다시 로그인해주세요.',
    },
    en: {
        AccessDenied: 'Permission was canceled during sign-in. Please try again.',
        Callback: 'Something went wrong while finishing sign-in. Please try again.',
        Configuration: 'The sign-in configuration is unavailable. Please contact support.',
        Default: 'We could not sign you in. Please try again shortly.',
        OAuthAccountNotLinked: 'This email is already connected to a different sign-in method.',
        OAuthCallback: 'We could not process the provider response. Please try again.',
        OAuthCreateAccount: 'Something went wrong while linking your account.',
        OAuthSignin: 'We could not open the sign-in provider page. Please try again.',
        SessionRequired: 'Please sign in to continue.',
        Verification: 'Your verification has expired. Please sign in again.',
    },
};

export function resolveCallbackUrl(input?: string | null): string {
    if (!input) {
        if (typeof window === 'undefined') {
            return '/';
        }

        return `${window.location.pathname}${window.location.search}` || '/';
    }

    if (input.startsWith('/')) {
        return input;
    }

    if (typeof window !== 'undefined') {
        try {
            const parsedUrl = new URL(input);

            if (parsedUrl.origin === window.location.origin) {
                return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}` || '/';
            }
        } catch {
            return '/';
        }
    }

    return '/';
}

export function resolveAuthErrorMessage(
    error?: string | null,
    language: SupportedLanguage = 'ko'
): string | null {
    if (!error) {
        return null;
    }

    const messages = AUTH_ERROR_MESSAGES[language];
    return messages[error] ?? messages.Default;
}
