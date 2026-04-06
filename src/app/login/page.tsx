import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { AuthEntryCard } from '@/components/auth/AuthEntryCard';
import { resolvePreferredLanguage } from '@/lib/language-preference';

interface LoginPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getServerCallbackUrl(input: string | string[] | undefined): string | null {
    const value = Array.isArray(input) ? input[0] : input;

    if (!value) {
        return null;
    }

    return value.startsWith('/') ? value : null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = searchParams ? await searchParams : {};
    const callbackUrl = getServerCallbackUrl(params.callbackUrl);
    const error = Array.isArray(params.error) ? params.error[0] : params.error;
    const headerStore = await headers();
    const language = resolvePreferredLanguage(headerStore.get('accept-language'));
    const isEnglish = language === 'en';
    const session = await auth();

    if (session) {
        redirect(callbackUrl ?? '/');
    }

    return (
        <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4 py-10 text-white'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.16),transparent_32%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.1),transparent_28%)]' />
            <div className='absolute inset-0 opacity-[0.04] mix-blend-screen'
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 240 240\'%3E%3Cg fill=\'white\'%3E%3Ccircle cx=\'20\' cy=\'30\' r=\'1\'/%3E%3Ccircle cx=\'120\' cy=\'80\' r=\'1.2\'/%3E%3Ccircle cx=\'200\' cy=\'50\' r=\'1\'/%3E%3Ccircle cx=\'70\' cy=\'180\' r=\'1.1\'/%3E%3Ccircle cx=\'180\' cy=\'170\' r=\'0.9\'/%3E%3C/g%3E%3C/svg%3E")',
                }}
            />

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
                    title={isEnglish ? 'Reconnect your reading path' : '로그인으로 흐름을 이어가세요'}
                    description={
                        isEnglish
                            ? 'Use Google to jump back into your saved reading, payment state, and invite rewards. Kakao stays available if that is already part of your routine.'
                            : '카카오 로그인 후 현재 보던 화면으로 돌아갑니다. 저장된 리딩, 결제 상태, 추천 보상까지 같은 흐름으로 이어집니다.'
                    }
                />
            </div>
        </main>
    );
}
