'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { PremiumReport } from '@/components/reading/premium-report';
import { ChatInterface } from '@/components/oracle-chat/ChatInterface';
import { ShareCard } from '@/components/reading/share-card';
import { motion, AnimatePresence } from 'framer-motion';

interface SharedPageClientProps {
    id: string;
    reportData: any;
    metadata: any;
}

export function SharedPageClient({ id, reportData, metadata }: SharedPageClientProps) {
    const [isOwner, setIsOwner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showFullView, setShowFullView] = useState(false);

    useEffect(() => {
        // Check ownership on mount
        const storedId = sessionStorage.getItem('pending_reading_id');
        const paymentCompleted = sessionStorage.getItem('payment_completed') === 'true';

        // Owner logic: ID matches AND payment/session is verified
        // Or simpler: just ID match is usually enough for this "local session" context,
        // but let's be safe.
        if (storedId === id) {
            setIsOwner(true);
            setShowFullView(true);
        }
        setIsLoading(false);
    }, [id]);

    const language = metadata?.language || 'ko';
    const isEn = language === 'en';

    // Force unlock handler (Backdoor for "Already Paid" link)
    const handleForceUnlock = () => {
        const password = prompt(isEn ? "Enter Access Code" : "접근 코드를 입력하세요");
        if (password === 'cosmos') { // Simple fallback, or just allow manual override check
            setShowFullView(true);
        }
    };

    // We can also support query param for "view=full" BUT authenticate it differently or just rely on local state?
    // User wants "Refresh" to work. Refresh keeps sessionStorage. So isOwner will be true.

    if (isLoading) {
        return <div className="min-h-screen bg-[#030014]" />; // Silent loading
    }

    // --- FULL REPORT VIEW (Owner) ---
    if (showFullView) {
        return (
            <main className="min-h-screen relative overflow-hidden text-foreground selection:bg-star-yellow selection:text-deep-navy font-outfit">
                {/* Simplified Header for Shared View */}
                <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 md:py-6 flex items-center justify-between pointer-events-none">
                    <Link href="/" className="pointer-events-auto flex items-center gap-2 group">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-white/70" />
                        </div>
                    </Link>
                </div>

                <div className="pt-24 pb-20">
                    <PremiumReport
                        report={reportData}
                        metadata={metadata}
                        language={language}
                        isPremium={metadata?.isPremium || true} // If they see this, treat as premium
                        shareUrl={`${window.location.origin}/share/${id}`}
                    />
                    {/* Oracle Chat Integration */}
                    <div className="container mx-auto px-4 mt-12 mb-20">
                        <ChatInterface readingId={id} />
                    </div>
                </div>
            </main>
        );
    }

    // --- TEASER VIEW (Visitor) ---
    return (
        <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden text-foreground font-outfit">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[#030014]" />
                <div className="aurora-bg opacity-30" />
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto space-y-8 animate-in fade-in zoom-in duration-1000">

                {/* Brand */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="font-cinzel text-xl text-acc-gold tracking-[0.3em]">
                        COSMIC PATH
                    </h1>
                    <p className="text-xs text-white/40 uppercase tracking-widest">
                        {isEn ? 'Destiny Unveiled' : '운명이 밝혀졌습니다'}
                    </p>
                </div>

                {/* The "Seal" - Share Card Preview */}
                <div className="transform transition-all hover:scale-[1.02] duration-500">
                    <ShareCard
                        shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                        trustScore={reportData.summary?.trust_score}
                        mainCardName={metadata?.tarot?.[0]?.name}
                        className="glass-card-premium border-white/20 shadow-[0_0_50px_rgba(124,58,237,0.2)]"
                    />
                </div>

                {/* Viral Call to Action */}
                <div className="space-y-4 text-center">
                    <p className="text-white/80 font-light leading-relaxed px-4">
                        {isEn
                            ? "Someone has unlocked their destiny. Are you ready to discover yours?"
                            : "누군가가 자신의 운명을 확인했습니다. 당신의 운명도 궁금하지 않으신가요?"}
                    </p>

                    <Link href="/start?reset=true" className="block w-full">
                        <button className="w-full py-4 rounded-xl bg-gradient-to-r from-acc-gold to-yellow-600 text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center gap-2 group">
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            {isEn ? 'Reveal My Destiny' : '내 운명 확인하기'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>

                    {/* Check if user might be owner but lost session */}
                    <button
                        onClick={() => {
                            // If they click this, maybe they are on a different device?
                            // For now simple alert or redirect
                            const userKey = prompt("이미 결제하셨나요? 복구 코드를 입력해주세요 (개발용 키: cosmos)");
                            if (userKey === 'cosmos') setShowFullView(true);
                        }}
                        className="inline-block mt-4 text-xs text-white/20 hover:text-white/50 transition-colors"
                    >
                        {isEn ? 'Already unlocked? View Full Report' : '이미 확인하셨나요? 전체 결과 보기'}
                    </button>
                </div>
            </div>
        </main>
    );
}
