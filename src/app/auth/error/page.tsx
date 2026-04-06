import Link from 'next/link';
import { headers } from 'next/headers';

import { AuthEntryCard } from '@/components/auth/AuthEntryCard';
import { resolvePreferredLanguage } from '@/lib/language-preference';

interface AuthErrorPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(params: Record<string, string | string[] | undefined>, key: string): string | null {
    const value = params[key];

    if (!value) {
        return null;
    }

    return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
    const params = searchParams ? await searchParams : {};
    const callbackUrl = getParam(params, 'callbackUrl');
    const error = getParam(params, 'error');
    const headerStore = await headers();
    const language = resolvePreferredLanguage(headerStore.get('accept-language'));
    const isEnglish = language === 'en';

    return (
        <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4 py-10 text-white'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_24%),radial-gradient(circle_at_bottom,rgba(212,175,55,0.12),transparent_26%)]' />

            <div className='relative z-10 w-full max-w-md space-y-6'>
                <Link
                    href='/'
                    className='inline-flex text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]/80 transition-opacity hover:opacity-80'
                >
                    COSMIC PATH
                </Link>

                <AuthEntryCard
                    callbackUrl={callbackUrl}
                    error={error}
                    language={language}
                    title={isEnglish ? 'Reconnect the sign-in flow' : '로그인 흐름을 다시 연결합니다'}
                    description={
                        isEnglish
                            ? 'Authentication was interrupted before we could return you to the same page. Use the provider below to reconnect the flow.'
                            : '카카오 인증 중에 흐름이 끊겼습니다. 아래 버튼으로 같은 페이지 흐름을 다시 이어가세요.'
                    }
                />
            </div>
        </main>
    );
}
