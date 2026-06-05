import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CosmicRadar } from '@/components/reading/cosmic-radar';
import { DraftProposal } from '@/components/reading/draft-proposal';
import { EvidenceTooltip } from '@/components/ui/confidence-badge';

interface ResultStreamProps {
    isLoading: boolean;
    confidence?: {
        score: number;
        percentage: number;
        message: string;
    };
    matching?: {
        score: number;
        level: string;
        matchingTags: string[];
        conflictingTags?: string[];
    };
    radarScores?: {
        saju: number;
        astrology: number;
        tarot: number;
    };
    content: string;
}

export function ResultStream({
    isLoading,
    confidence,
    matching,
    radarScores,
    content,
}: ResultStreamProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [displayedContent, setDisplayedContent] = useState('');

    // 스트리밍 효과
    useEffect(() => {
        if (content.length > displayedContent.length) {
            const timer = setTimeout(() => {
                setDisplayedContent(content.slice(0, displayedContent.length + 3)); // 조금 더 빠르게
            }, 5);
            return () => clearTimeout(timer);
        }
    }, [content, displayedContent]);

    // 스크롤 자동 이동
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [displayedContent]);

    // 태그 하이라이팅
    const renderContent = (text: string) => {
        const parts = text.split(/(\[#[^\]]+\])/g);

        return parts.map((part, index) => {
            if (part.match(/^\[#[^\]]+\]$/)) {
                const tag = part.slice(2, -1); // '[#' 와 ']' 제거
                // 모의 소스 데이터 (실제 데이터와 연동 필요)
                const sources = ['saju', 'astrology', 'tarot'].filter(() => Math.random() > 0.5);
                if (sources.length === 0) sources.push('tarot');

                return (
                    <EvidenceTooltip
                        key={index}
                        tag={`#${tag}`}
                        sources={sources}
                        explanation="데이터 기반 추론"
                    />
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    // 모의 캘린더 제안 데이터 (실제로는 AI가 생성해야 함)
    const draftData = {
        title: "중요 결정 보류 및 재검토",
        date: new Date().toISOString().split('T')[0],
        time: "14:00",
        description: "AI 리딩 결과: 현재는 확정보다 관망이 필요한 시기입니다.",
        confidence: confidence?.percentage || 0
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Result & Stream */}
            <div className="lg:col-span-2 space-y-6">

                {/* Content Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-6 min-h-[400px] flex flex-col relative"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        <span className="text-sm text-gold font-medium tracking-wider">COSMIC INSIGHT</span>
                    </div>

                    {/* Text Stream */}
                    <div
                        ref={contentRef}
                        className="prose prose-invert max-w-none text-gray-200 leading-relaxed overflow-y-auto custom-scrollbar flex-grow"
                    >
                        <div className="whitespace-pre-wrap text-lg">
                            {displayedContent ? renderContent(displayedContent) : (
                                <span className="text-gray-500 animate-pulse">운명의 데이터를 수신 중...</span>
                            )}
                            {isLoading && displayedContent.length === content.length && (
                                <span className="typewriter-cursor ml-1" />
                            )}
                        </div>
                    </div>

                    {/* Action Area (Draft Proposal) */}
                    {!isLoading && displayedContent.length > 100 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 pt-6 border-t border-white/5"
                        >
                            <DraftProposal
                                title={draftData.title}
                                date={draftData.date}
                                time={draftData.time}
                                description={draftData.description}
                                confidence={draftData.confidence}
                                onConfirm={() => { }}
                                onCancel={() => { }}
                            />
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Right Column: Radar & Meta */}
            <div className="space-y-6">
                {/* Cosmic Radar */}
                <div className="glass-card p-6 flex flex-col items-center justify-center">
                    <h3 className="text-sm text-gray-400 mb-6 uppercase tracking-widest text-center">
                        Evidence Balance
                    </h3>
                    <CosmicRadar
                        sajuScore={radarScores?.saju || 0}
                        starScore={radarScores?.astrology || 0}
                        tarotScore={radarScores?.tarot || 0}
                        isLoading={isLoading}
                    />
                    <div className="mt-6 text-center text-xs text-gray-500">
                        * 세 가지 참고 근거가<br />어느 쪽으로 모이는지 보여줍니다
                    </div>
                </div>

                {/* Tags Summary */}
                {matching && matching.matchingTags.length > 0 && (
                    <div className="glass-card p-6">
                        <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-widest">
                            Core Signals
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {matching.matchingTags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gold">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
