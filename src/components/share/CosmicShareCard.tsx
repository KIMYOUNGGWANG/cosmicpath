'use client';

import { forwardRef } from 'react';
import { Sparkles, Star } from 'lucide-react';

interface CosmicShareCardProps {
    title: string;
    matchLevel: 'PERFECT' | 'PARTIAL' | 'CONFLICT';
    keywords: string[];
}

/**
 * 인스타그램 스토리용 공유 카드 컴포넌트
 * 9:16 비율, 딥 네이비 + 골드 테마
 */
export const CosmicShareCard = forwardRef<HTMLDivElement, CosmicShareCardProps>(
    function CosmicShareCard({ title, matchLevel, keywords }, ref) {
        const matchLevelConfig = {
            PERFECT: { label: '완벽한 조화', color: 'from-emerald-400 to-teal-500', emoji: '✨' },
            PARTIAL: { label: '부분적 일치', color: 'from-amber-400 to-orange-500', emoji: '🌙' },
            CONFLICT: { label: '다양한 시각', color: 'from-purple-400 to-pink-500', emoji: '🔮' },
        };

        const config = matchLevelConfig[matchLevel] || matchLevelConfig.PARTIAL;

        return (
            <div
                ref={ref}
                className="relative overflow-hidden"
                style={{
                    width: '360px',
                    height: '640px',
                    background: 'linear-gradient(180deg, #0F1419 0%, #1A1F2E 50%, #0D1117 100%)',
                    fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
                }}
            >
                {/* 배경 장식 */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* 별 장식 */}
                    <div className="absolute top-8 left-6 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
                    <div className="absolute top-20 right-10 w-1.5 h-1.5 bg-white/20 rounded-full" />
                    <div className="absolute top-40 left-12 w-1 h-1 bg-white/40 rounded-full" />
                    <div className="absolute bottom-32 right-8 w-2 h-2 bg-white/25 rounded-full animate-pulse" />
                    <div className="absolute bottom-48 left-8 w-1.5 h-1.5 bg-white/30 rounded-full" />

                    {/* 그라디언트 오버레이 */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#A184FF]/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#D4AF37]/5 to-transparent" />
                </div>

                {/* 상단: 로고 영역 */}
                <div className="relative pt-10 pb-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-white/80 text-xs font-medium tracking-widest uppercase">
                            Cosmic Reading
                        </span>
                    </div>
                </div>

                {/* 중앙: 메인 콘텐츠 */}
                <div className="relative px-8 py-6 flex flex-col items-center">
                    {/* Public-safe summary mark */}
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#A184FF]/20 to-[#6366F1]/20 flex items-center justify-center border border-[#A184FF]/30">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                    Decision
                                </div>
                                <div className="text-[10px] text-white/50 uppercase tracking-wider mt-1">
                                    Note
                                </div>
                            </div>
                        </div>
                        {/* 글로우 효과 */}
                        <div className="absolute inset-0 rounded-full bg-[#A184FF]/20 blur-xl -z-10" />
                    </div>

                    {/* Match Level Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.color} mb-6`}>
                        <span className="text-lg">{config.emoji}</span>
                        <span className="text-white font-semibold text-sm">{config.label}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-white text-center mb-6 leading-relaxed px-4">
                        {title}
                    </h2>

                    {/* Keywords */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {keywords.slice(0, 4).map((keyword, index) => (
                            <div
                                key={index}
                                className="px-3 py-1.5 bg-white/5 rounded-full border border-white/10"
                            >
                                <span className="text-white/70 text-xs font-medium">
                                    #{keyword}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>

                {/* 하단: 워터마크 (바이럴용) */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-white/60 text-xs tracking-widest uppercase">
                            CosmicPath
                        </span>
                        <Star className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div className="text-center">
                        <span className="text-white/40 text-[10px] tracking-wider">
                            오늘 미룬 선택 정리하기
                        </span>
                    </div>
                </div>
            </div>
        );
    }
);
