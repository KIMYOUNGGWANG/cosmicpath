'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, animate } from 'framer-motion';
import { Heart, Lock, Share2, Sparkles, AlertCircle, Copy, Check, Unlock, Star, AlertTriangle, MessageCircle, Loader2, Zap, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
    MatchRadar,
    InsightBadge,
    CosmicSignatureBadge,
    TimelineCard,
    ActionChecklist,
    LuckyElements,
    ProsperityCard
} from '@/components/match/MatchVisuals';

// AI Analysis types (v3.0 - with rich visual data)
interface AIAnalysis {
    energyAnalysis: {
        title: string;
        content: string;
        highlights: string[];
    };
    emotionalCompatibility: {
        title: string;
        content: string;
        chemistryLevel: 'high' | 'medium' | 'low';
    };
    longTermOutlook: {
        title: string;
        content: string;
        timeline: { period: string; prediction: string; title?: string; advice?: string; riskLevel?: string }[];
    };
    strengths: { title: string; description: string; icon?: string }[];
    challenges: { title: string; description: string; icon?: string }[];
    advice: {
        summary: string;
        actionItems: string[];
    };
    // New rich data from v3.0
    _cosmicSignature?: {
        title: string;
        archetype: string;
        emoji: string;
        oneLiner: string;
    };
    _overallScore?: {
        total: number;
        chemistry: number;
        stability: number;
        growth: number;
        passion: number;
    };
    _quickInsights?: Array<{
        icon: string;
        label: string;
        value: string;
        sentiment: 'positive' | 'neutral' | 'caution';
    }>;
    _emotionalRadar?: {
        communication: number;
        trust: number;
        intimacy: number;
        support: number;
        fun: number;
        conflict: number;
    };
    _dailyLifeCards?: Array<{
        area: string;
        score: number;
        insight: string;
    }>;
    _prosperitySync?: {
        score: number;
        wealthStyle: string;
        prosperityTip: string;
    };
    _careerSynergy?: {
        compatibility: number;
        businessPotential: string;
    };
    _socialMirror?: {
        publicImage: string;
        socialAura: string;
    };
    _timelineForecasts?: Array<{
        period: string;
        title: string;
        prediction: string;
        advice: string;
        riskLevel: 'low' | 'medium' | 'high';
    }>;
    _doAndDont?: {
        do: string[];
        dont: string[];
    };
    _luckyElements?: {
        colors: string[];
        numbers: number[];
        direction: string;
        season: string;
    };
    _weeklyRituals?: Array<{
        day: string;
        activity: string;
        benefit: string;
    }>;
}

interface MatchDetails {
    hostSign: string;
    guestSign: string;
    hostElement: string;
    guestElement: string;
    sajuScore?: number;
    astroScore?: number;
    numScore?: number;
    summary?: string;
    aiAnalysis?: AIAnalysis;
}

interface MatchData {
    id: string;
    hostName: string;
    guestName: string | null;
    score: number | null;
    isUnlocked: boolean;
    isExpired: boolean;
    hasGuest: boolean;
    summary: string | null;
    details: MatchDetails | null;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function MatchResultPage({ params }: PageProps) {
    const { id } = use(params);
    const searchParams = useSearchParams();

    const [data, setData] = useState<MatchData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const fetchResult = useCallback(async () => {
        try {
            const response = await fetch(`/api/match/${id}`);
            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Failed to load result');
                return;
            }

            if (!result.hasGuest) {
                setError('상대방이 아직 참여하지 않았습니다.');
                return;
            }

            setData(result);

            // Check if AI analysis is in the response
            if (result.details?.aiAnalysis) {
                setAiAnalysis(result.details.aiAnalysis);
            }
        } catch (err) {
            setError('결과를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    // Fetch AI analysis when unlocked
    const fetchAIAnalysis = useCallback(async () => {
        // Only run if unlocked and NOT already complete
        const isAlreadyComplete = aiAnalysis && (aiAnalysis as any)._prosperitySync && (aiAnalysis as any)._weeklyRituals;
        if (!data?.isUnlocked || isAlreadyComplete) return;

        setIsLoadingAI(true);
        setAiError(null);

        try {
            const response = await fetch(`/api/match/${id}/analyze`, { method: 'POST' });
            const result = await response.json();

            if (!response.ok) {
                setAiError(result.error || 'AI 분석에 실패했습니다');
                return;
            }

            setAiAnalysis(result.analysis);
        } catch (err) {
            setAiError('AI 분석 중 오류가 발생했습니다');
        } finally {
            setIsLoadingAI(false);
        }
    }, [id, data?.isUnlocked, aiAnalysis]);

    useEffect(() => {
        fetchResult();
    }, [fetchResult]);

    // Auto-fetch AI analysis when unlocked and no existing analysis
    useEffect(() => {
        if (data?.isUnlocked && !aiAnalysis && !isLoadingAI) {
            fetchAIAnalysis();
        }
    }, [data?.isUnlocked, aiAnalysis, isLoadingAI, fetchAIAnalysis]);

    // Refetch when returning from Stripe with ?unlocked=true
    useEffect(() => {
        const unlocked = searchParams.get('unlocked');
        const sessionId = searchParams.get('session_id');

        if (unlocked === 'true') {
            // 결제 완료 후: 직접 unlock API 호출 (로컬에서 webhook 대체)
            const performUnlock = async () => {
                try {
                    setIsLoading(true);
                    // Unlock API 호출
                    const unlockRes = await fetch(`/api/match/${id}/unlock`, { method: 'POST' });
                    if (!unlockRes.ok) {
                        console.warn('Unlock API failed, may already be unlocked via webhook');
                    }

                    // Clear the URL params and refetch
                    window.history.replaceState({}, '', `/match/${id}/result`);
                    await fetchResult();
                } catch (err) {
                    console.error('Unlock failed:', err);
                    setError('결제 처리 중 오류가 발생했습니다.');
                } finally {
                    setIsLoading(false);
                }
            };
            performUnlock();
        }
    }, [searchParams, id, fetchResult]);

    // Score animation
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        if (data?.score !== undefined && data.score !== null) {
            const controls = animate(0, data.score, {
                duration: 2,
                ease: "easeOut",
                onUpdate: (value: number) => setDisplayScore(Math.round(value))
            });
            return () => controls.stop();
        }
    }, [data?.score]);

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/match/${id}/join`;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'from-yellow-400 via-orange-500 to-red-500';
        if (score >= 70) return 'from-emerald-400 via-teal-500 to-cyan-500';
        if (score >= 55) return 'from-blue-400 via-indigo-500 to-purple-500';
        if (score >= 40) return 'from-orange-400 via-red-500 to-pink-500';
        return 'from-gray-400 via-gray-500 to-gray-600';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-[var(--acc-gold)] border-r-[var(--acc-gold)] border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-[var(--acc-gold)] font-cinzel tracking-widest text-sm animate-pulse">
                        DIVINING FATE...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center p-6 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-10 text-center max-w-md w-full border-red-500/30"
                >
                    <AlertCircle className="text-red-400 mx-auto mb-6" size={48} />
                    <h1 className="text-2xl font-cinzel font-bold mb-4">Connection Failed</h1>
                    <p className="text-[var(--fg-moonlight)] mb-8 font-outfit">{error}</p>
                    <Link
                        href="/match/new"
                        className="btn-primary w-full inline-flex items-center justify-center"
                    >
                        Try Again
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[var(--bg-deep)] text-white py-12 px-6">
            {/* Background Effects */}
            <div className="noise-overlay" />
            <div className="cosmic-dust" />
            <div className="aurora-bg opacity-70" />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-lg mx-auto space-y-10 relative z-10"
            >
                {/* Header */}
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-6 relative group"
                    >
                        <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl group-hover:blur-2xl transition-all duration-700 opacity-50" />
                        <Heart className="text-pink-400 relative z-10 drop-shadow-lg" size={48} />
                    </motion.div>
                    <h1 className="text-xl font-cinzel font-bold text-[var(--acc-gold)] mb-2 tracking-widest uppercase">
                        Cosmic Resonance
                    </h1>
                    <p className="text-white/80 font-outfit text-lg">
                        <span className="font-bold text-pink-300">{data.hostName}</span>
                        <span className="mx-2 opacity-50">&</span>
                        <span className="font-bold text-purple-300">{data.guestName}</span>
                    </p>
                </div>

                {/* Score Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-10 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--acc-gold)] to-transparent opacity-50" />

                    <div className="text-8xl font-black mb-4 font-cinzel relative flex items-center justify-center">
                        <span className={`bg-gradient-to-b ${getScoreColor(displayScore)} bg-clip-text text-transparent drop-shadow-2xl`}>
                            {displayScore}
                        </span>
                        <span className="text-4xl text-white/20 align-top ml-2">%</span>
                    </div>

                    <p className="text-white font-outfit text-lg leading-relaxed px-4">
                        {data.summary}
                    </p>
                </motion.div>

                {/* Details Grid */}
                {data.details && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className="glass-card p-6 text-center border-pink-500/20 hover:border-pink-500/40 transition-colors group">
                            <p className="text-[var(--fg-moonlight)] text-xs uppercase tracking-widest font-cinzel mb-2">{data.hostName}</p>
                            <div className="text-2xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                                {data.details.hostSign}
                            </div>
                            <p className="text-pink-400 text-sm font-outfit">{data.details.hostElement}</p>
                        </div>
                        <div className="glass-card p-6 text-center border-purple-500/20 hover:border-purple-500/40 transition-colors group">
                            <p className="text-[var(--fg-moonlight)] text-xs uppercase tracking-widest font-cinzel mb-2">{data.guestName}</p>
                            <div className="text-2xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                                {data.details.guestSign}
                            </div>
                            <p className="text-purple-400 text-sm font-outfit">{data.details.guestElement}</p>
                        </div>
                    </motion.div>
                )}
                {/* Unlocked Premium Content - AI Analysis */}
                {data.isUnlocked && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 text-green-400 mb-2">
                            <Unlock size={20} />
                            <span className="font-cinzel font-bold text-sm uppercase tracking-widest">Premium AI Analysis</span>
                        </div>

                        {/* Score Breakdown */}
                        {data.details && (data.details.sajuScore || data.details.astroScore || data.details.numScore) && (
                            <div className="glass-card p-6 border-green-500/20">
                                <h3 className="text-white font-cinzel font-bold mb-4 flex items-center gap-2">
                                    <Star size={18} className="text-[var(--acc-gold)]" />
                                    Score Breakdown
                                </h3>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-3xl font-bold text-pink-400">{data.details.sajuScore || 0}</p>
                                        <p className="text-xs text-[var(--fg-moonlight)] uppercase tracking-widest mt-1">사주</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-purple-400">{data.details.astroScore || 0}</p>
                                        <p className="text-xs text-[var(--fg-moonlight)] uppercase tracking-widest mt-1">점성술</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-cyan-400">{data.details.numScore || 0}</p>
                                        <p className="text-xs text-[var(--fg-moonlight)] uppercase tracking-widest mt-1">수비학</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AI Loading State */}
                        {isLoadingAI && (
                            <div className="glass-card p-8 border-purple-500/20 text-center">
                                <Loader2 size={32} className="animate-spin text-purple-400 mx-auto mb-4" />
                                <p className="text-white font-cinzel font-bold">이어지는 분석... (Resuming Analysis)</p>
                                <p className="text-[var(--fg-moonlight)] text-sm mt-2">이전까지 완료된 단계를 확인하고 남은 분석을 이어갑니다</p>
                                <div className="flex justify-center gap-2 mt-4">
                                    {[1, 2, 3, 4, 5].map((phase) => {
                                        const isDone = aiAnalysis && (
                                            phase === 1 ? !!(aiAnalysis as any).energyAnalysis :
                                                phase === 2 ? !!(aiAnalysis as any).emotionalCompatibility :
                                                    phase === 3 ? !!(aiAnalysis as any)._prosperitySync :
                                                        phase === 4 ? !!(aiAnalysis as any)._timelineForecasts :
                                                            phase === 5 ? !!(aiAnalysis as any)._weeklyRituals : false
                                        );
                                        const isCurrent = !isDone && (
                                            phase === 1 || (
                                                phase === 2 ? !!(aiAnalysis as any)?.energyAnalysis :
                                                    phase === 3 ? !!(aiAnalysis as any)?.emotionalCompatibility :
                                                        phase === 4 ? !!(aiAnalysis as any)?._prosperitySync :
                                                            phase === 5 ? !!(aiAnalysis as any)?._timelineForecasts : false
                                            )
                                        );

                                        return (
                                            <div
                                                key={phase}
                                                className={`w-10 h-1.5 rounded-full overflow-hidden transition-colors duration-500 ${isDone ? 'bg-purple-500' : 'bg-white/10'
                                                    }`}
                                            >
                                                {isCurrent && (
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                        initial={{ x: '-100%' }}
                                                        animate={{ x: '100%' }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                    />
                                                )}
                                                {isDone && <div className="h-full w-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* AI Error State */}
                        {aiError && (
                            <div className="glass-card p-6 border-red-500/30 text-center">
                                <AlertCircle size={24} className="text-red-400 mx-auto mb-3" />
                                <p className="text-red-400 font-outfit text-sm">{aiError}</p>
                                <button
                                    onClick={fetchAIAnalysis}
                                    className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                                >
                                    다시 시도
                                </button>
                            </div>
                        )}

                        {/* AI Analysis Content */}
                        {aiAnalysis && (
                            <>
                                {/* Phase 1: Energy Analysis */}
                                <div className="glass-card p-6 border-purple-500/20">
                                    <h3 className="text-white font-cinzel font-bold mb-4 flex items-center gap-2">
                                        <Zap size={18} className="text-purple-400" />
                                        {aiAnalysis.energyAnalysis.title}
                                    </h3>
                                    <p className="text-white/80 text-sm font-outfit leading-relaxed mb-4">
                                        {aiAnalysis.energyAnalysis.content}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {aiAnalysis.energyAnalysis.highlights.map((h, i) => (
                                            <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-300">
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Emotional Compatibility */}
                                <div className="glass-card p-6 border-pink-500/20">
                                    <h3 className="text-white font-cinzel font-bold mb-4 flex items-center gap-2">
                                        <Heart size={18} className="text-pink-400" />
                                        {aiAnalysis.emotionalCompatibility.title}
                                        <span className={`ml-auto px-2 py-0.5 rounded text-xs font-outfit ${aiAnalysis.emotionalCompatibility.chemistryLevel === 'high' ? 'bg-emerald-500/20 text-emerald-400' :
                                            aiAnalysis.emotionalCompatibility.chemistryLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-orange-500/20 text-orange-400'
                                            }`}>
                                            {aiAnalysis.emotionalCompatibility.chemistryLevel === 'high' ? '높음' :
                                                aiAnalysis.emotionalCompatibility.chemistryLevel === 'medium' ? '보통' : '낮음'}
                                        </span>
                                    </h3>
                                    <p className="text-white/80 text-sm font-outfit leading-relaxed">
                                        {aiAnalysis.emotionalCompatibility.content}
                                    </p>
                                </div>

                                {/* Wealth & Success Synchronization (New Phase 3) */}
                                {(aiAnalysis._prosperitySync || aiAnalysis._careerSynergy) && (
                                    <ProsperityCard
                                        prosperity={aiAnalysis._prosperitySync || { score: 0, wealthStyle: '', prosperityTip: '' }}
                                        career={aiAnalysis._careerSynergy || { compatibility: 0, businessPotential: '' }}
                                        social={aiAnalysis._socialMirror || { publicImage: '', socialAura: '' }}
                                    />
                                )}

                                {/* Long-term Outlook */}
                                <div className="glass-card p-6 border-blue-500/20">
                                    <h3 className="text-white font-cinzel font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-blue-400" />
                                        {aiAnalysis.longTermOutlook.title}
                                    </h3>
                                    <p className="text-white/80 text-sm font-outfit leading-relaxed mb-4">
                                        {aiAnalysis.longTermOutlook.content}
                                    </p>
                                    <div className="space-y-3">
                                        {aiAnalysis.longTermOutlook.timeline.map((t, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <span className="flex-shrink-0 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300 font-outfit">
                                                    {t.period}
                                                </span>
                                                <p className="text-white/70 text-sm">{t.prediction}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Strengths */}
                                <div className="glass-card p-6 border-emerald-500/20">
                                    <h3 className="text-white font-cinzel font-bold mb-4 flex items-center gap-2">
                                        <Star size={18} className="text-emerald-400" />
                                        Cosmic Harmony Factors
                                    </h3>
                                    <div className="space-y-4">
                                        {aiAnalysis.strengths.map((s, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <span className="text-emerald-400 mt-0.5 flex-shrink-0">✦</span>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{s.title}</p>
                                                    <p className="text-white/70 text-sm mt-1">{s.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Challenges */}
                                <div className="glass-card p-6 border-orange-500/20">
                                    <h3 className="text-white font-cinzel font-bold mb-4 flex items-center gap-2">
                                        <AlertTriangle size={18} className="text-orange-400" />
                                        Potential Conflict Zones
                                    </h3>
                                    <div className="space-y-4">
                                        {aiAnalysis.challenges.map((c, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <span className="text-orange-400 mt-0.5 flex-shrink-0">⚠</span>
                                                <div>
                                                    <p className="text-white font-bold text-sm">{c.title}</p>
                                                    <p className="text-white/70 text-sm mt-1">{c.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Advice */}
                                <div className="glass-card p-6 border-[var(--acc-gold)]/20">
                                    <h3 className="text-white font-cinzel font-bold mb-4 flex items-center gap-2">
                                        <MessageCircle size={18} className="text-[var(--acc-gold)]" />
                                        Relationship Advice
                                    </h3>
                                    <p className="text-white/80 text-sm font-outfit leading-relaxed mb-4">
                                        {aiAnalysis.advice.summary}
                                    </p>
                                    <div className="space-y-2">
                                        {aiAnalysis.advice.actionItems.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <Calendar size={14} className="text-[var(--acc-gold)]" />
                                                <span className="text-white/70">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Locked Section */}
                {!data.isUnlocked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="glass-card p-8 border-[var(--acc-gold)]/30 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-[var(--acc-gold)]/5 group-hover:bg-[var(--acc-gold)]/10 transition-colors duration-500 pointer-events-none" />

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="p-3 rounded-full bg-[var(--acc-gold)]/10 text-[var(--acc-gold)] border border-[var(--acc-gold)]/20">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-cinzel font-bold text-lg">In-Depth Analysis</h3>
                                <p className="text-[var(--acc-gold)] text-xs uppercase tracking-wider">Premium Feature</p>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8 relative z-10">
                            {['Cosmic Harmony Factors', 'Potential Conflict Zones', 'Relationship Advice'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/60 text-sm font-outfit">
                                    <Lock size={14} className="text-white/20" />
                                    <span className="blur-[2px] select-none hover:blur-none transition-all duration-300">
                                        Hidden Content: {item}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full relative py-5 px-10 rounded-2xl font-cinzel tracking-[0.2em] font-bold overflow-hidden transition-all duration-500 group z-10"
                            onClick={async () => {
                                try {
                                    const res = await fetch(`/api/match/${id}/pay`, { method: 'POST' });
                                    const json = await res.json();
                                    if (json.url) {
                                        window.location.href = json.url;
                                    } else {
                                        alert(json.error || 'Failed to initiate payment');
                                    }
                                } catch (err) {
                                    alert('Payment failed. Please try again.');
                                }
                            }}
                        >
                            {/* Glassmorphism Background with stronger default border */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--acc-gold)]/20 to-orange-500/20 backdrop-blur-xl border border-[var(--acc-gold)]/40 group-hover:border-[var(--acc-gold)] transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.1)] group-hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]" />

                            {/* Inner Glow - Persistent subtle gold tint */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--acc-gold)]/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

                            {/* Animated Shimmer Line */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 pointer-events-none overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer" />
                            </div>

                            {/* Content with Gold text */}
                            <span className="relative z-10 flex items-center justify-center gap-3 text-white group-hover:scale-105 transition-transform duration-300">
                                <Sparkles size={20} className="text-[var(--acc-gold)] animate-pulse" />
                                <span className="text-sm md:text-base">Unlock Full Report ($2.99)</span>
                                <ArrowRight size={18} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-75" />
                            </span>

                            {/* External Bloom Glow - Always slightly visible */}
                            <div className="absolute -inset-4 bg-[var(--acc-gold)]/10 blur-3xl opacity-100 group-hover:bg-[var(--acc-gold)]/20 transition-all duration-1000 pointer-events-none" />
                        </motion.button>
                    </motion.div>
                )}

                {/* Share Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col gap-4"
                >
                    <motion.button
                        onClick={handleShare}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--acc-gold)]/30 transition-all duration-300 font-cinzel text-sm tracking-widest flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                        {copied ? (
                            <>
                                <Check size={18} className="text-green-400 animate-in zoom-in duration-300" />
                                <span className="text-green-400">Link Copied</span>
                            </>
                        ) : (
                            <>
                                <Share2 size={18} className="text-white/40 group-hover:text-[var(--acc-gold)] group-hover:scale-110 transition-all duration-300" />
                                <span className="text-white/70 group-hover:text-white transition-colors">Share Results</span>
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                    </motion.button>
                    <Link
                        href="/match/new"
                        className="text-center text-[var(--fg-moonlight)] hover:text-white text-sm transition-colors font-outfit"
                    >
                        Test Another Match →
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
