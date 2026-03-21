'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LoaderCircle, MessageCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { resolveAuthErrorMessage, resolveCallbackUrl } from '@/components/auth/auth-flow';

type AuthProvider = 'kakao' | 'google';

interface AuthEntryCardProps {
    callbackUrl?: string | null;
    error?: string | null;
    title?: string;
    description?: string;
}

function GoogleMark() {
    return (
        <svg className='h-5 w-5' viewBox='0 0 24 24' aria-hidden='true'>
            <path
                fill='currentColor'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
                fill='currentColor'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
                fill='currentColor'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z'
            />
            <path
                fill='currentColor'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
            />
        </svg>
    );
}

export function AuthEntryCard({
    callbackUrl,
    error,
    title = 'CosmicPath에 연결',
    description = '카카오로 빠르게 로그인하고 읽은 운세를 저장하세요. 기기 변경 후에도 결과, 결제, 초대 보상이 자연스럽게 이어집니다.',
}: AuthEntryCardProps) {
    const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null);
    const errorMessage = resolveAuthErrorMessage(error);

    const handleSignIn = async (provider: AuthProvider) => {
        if (pendingProvider) {
            return;
        }

        setPendingProvider(provider);

        try {
            await signIn(provider, {
                callbackUrl: resolveCallbackUrl(callbackUrl),
            });
        } catch {
            setPendingProvider(null);
        }
    };

    const isPending = pendingProvider !== null;

    return (
        <div className='rounded-[28px] border border-white/12 bg-[#111111]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8'>
            <div className='mb-6 space-y-3'>
                <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]/80'>
                    Local Sign-In Flow
                </p>
                <h1 className='font-cinzel text-3xl text-white sm:text-4xl'>
                    {title}
                </h1>
                <p className='text-sm leading-6 text-white/65 sm:text-base'>
                    {description}
                </p>
            </div>

            {errorMessage ? (
                <div className='mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100'>
                    {errorMessage}
                </div>
            ) : null}

            <div className='space-y-3'>
                <button
                    type='button'
                    onClick={() => void handleSignIn('kakao')}
                    disabled={isPending}
                    className='flex h-[52px] w-full items-center justify-center gap-3 rounded-2xl bg-[#FEE500] px-4 font-semibold text-[#341d1d] transition-transform active:scale-[0.99] disabled:cursor-wait disabled:opacity-70'
                >
                    {pendingProvider === 'kakao' ? (
                        <LoaderCircle className='h-5 w-5 animate-spin' />
                    ) : (
                        <MessageCircle className='h-5 w-5 fill-current' />
                    )}
                    <span>카카오로 계속하기</span>
                </button>

                <button
                    type='button'
                    onClick={() => void handleSignIn('google')}
                    disabled={isPending}
                    className='flex h-[52px] w-full items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white px-4 font-semibold text-black transition-transform active:scale-[0.99] disabled:cursor-wait disabled:opacity-70'
                >
                    {pendingProvider === 'google' ? (
                        <LoaderCircle className='h-5 w-5 animate-spin' />
                    ) : (
                        <GoogleMark />
                    )}
                    <span>Google로 계속하기</span>
                </button>
            </div>

            <div className='mt-6 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/55'>
                카카오 로그인이 가장 안정적인 기본 경로입니다. 인증 후에는 현재 보고 있던 페이지로 바로 돌아갑니다.
            </div>

            <p className='mt-5 text-center text-xs leading-5 text-white/35'>
                계속하면{' '}
                <Link href='/terms' className='text-white/55 underline underline-offset-4'>
                    이용약관
                </Link>
                {' '}및{' '}
                <Link href='/privacy' className='text-white/55 underline underline-offset-4'>
                    개인정보처리방침
                </Link>
                에 동의하게 됩니다.
            </p>
        </div>
    );
}
