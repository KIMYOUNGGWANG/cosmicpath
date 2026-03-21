'use client';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
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

export function resolveAuthErrorMessage(error?: string | null): string | null {
    if (!error) {
        return null;
    }

    return AUTH_ERROR_MESSAGES[error] ?? AUTH_ERROR_MESSAGES.Default;
}
