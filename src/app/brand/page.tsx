'use client';

import { CosmicRadar } from '@/components/reading/cosmic-radar';
import { ConfidenceBadge, EvidenceTooltip } from '@/components/ui/confidence-badge';
import { motion } from 'framer-motion';

export default function BrandAssetsPage() {
    return (
        <div className="min-h-screen bg-void text-starlight p-10 space-y-20 flex flex-col items-center">
            {/* Header for guidance */}
            <div className="text-center max-w-2xl">
                <h1 className="font-cinzel text-3xl text-acc-gold mb-4">Brand Asset Generator</h1>
                <p className="text-dim text-sm">
                    이 페이지는 Threads 및 인스타그램 홍보를 위한 고품질 스크린샷을 생성하기 위해 제작되었습니다.
                    실제 서비스 UI 컴포넌트를 사용하여 프로덕트의 정체성을 100% 반영합니다.
                </p>
            </div>

            {/* Poster 1: The Cosmic Analysis (1:1 Ratio) */}
            <div id="poster-analysis" className="w-[600px] h-[600px] bg-bg-deep border-4 border-acc-gold/20 rounded-[40px] overflow-hidden relative flex flex-col items-center justify-center p-12 shadow-[0_0_100px_rgba(212,175,55,0.1)]">
                {/* Brand Logo at Top */}
                <div className="absolute top-10 flex flex-col items-center">
                    <h1 className="font-cinzel text-3xl text-acc-gold tracking-[0.2em] mb-1">CosmicPath</h1>
                    <div className="h-px w-20 bg-acc-gold/30" />
                </div>

                <div className="w-full scale-125 my-12">
                    <CosmicRadar
                        sajuScore={88}
                        starScore={95}
                        tarotScore={82}
                        isLoading={false}
                    />
                </div>

                <div className="absolute bottom-12 text-center">
                    <h2 className="font-cinzel text-xl mb-4 text-starlight tracking-widest">3-WAY INTEGRATED ENGINE</h2>
                    <div className="flex gap-4 justify-center">
                        <div className="px-4 py-1.5 bg-acc-logic/10 border border-acc-logic/30 rounded-full text-xs text-acc-logic font-bold uppercase tracking-wider">Logic (사주)</div>
                        <div className="px-4 py-1.5 bg-tarot-purple/10 border border-tarot-purple/30 rounded-full text-xs text-tarot-purple font-bold uppercase tracking-wider">Intuition (타로)</div>
                        <div className="px-4 py-1.5 bg-star-yellow/10 border border-star-yellow/30 rounded-full text-xs text-star-yellow font-bold uppercase tracking-wider">Flow (별자리)</div>
                    </div>
                </div>
            </div>

            {/* Poster 2: Confidence & Evidence (4:5 Ratio) */}
            <div id="poster-trust" className="w-[480px] h-[600px] bg-bg-deep border border-white/10 rounded-3xl overflow-hidden relative flex flex-col p-10 shadow-2xl">
                <div className="flex justify-between items-start mb-12">
                    <div className="font-cinzel text-2xl text-acc-gold font-bold tracking-tight">CosmicPath</div>
                    <div className="px-3 py-1 border border-acc-gold/30 rounded-full text-[8px] text-acc-gold tracking-widest uppercase mt-1">AI Verified Insight</div>
                </div>

                <h3 className="text-4xl font-light mb-8 leading-[1.2]">
                    <span className="text-dim">Your Destiny</span><br />
                    <span className="text-acc-gold font-medium italic underline decoration-acc-gold/20 underline-offset-8">Cross-Validated.</span>
                </h3>

                <div className="my-auto space-y-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-acc-gold animate-pulse" />
                            <span className="text-[10px] text-dim font-bold uppercase tracking-[0.3em]">Alignment Score</span>
                        </div>
                        <ConfidenceBadge
                            score={5}
                            percentage={94}
                            message="사주, 점성술, 타로의 흐름이 한 곳으로 정렬되었습니다. 이 길은 당신을 위한 가장 확실한 선택지입니다."
                        />
                    </div>

                    <div className="space-y-4">
                        <span className="text-[10px] text-dim block mb-1 uppercase tracking-widest">Evidence Verification</span>
                        <div className="flex flex-wrap gap-2">
                            <EvidenceTooltip tag="#급격한_변화" sources={['saju', 'astrology', 'tarot']} explanation="모든 지표가 현재 당신의 궤도가 큰 전환점에 있음을 가리킵니다." />
                            <EvidenceTooltip tag="#커리어_도약" sources={['saju', 'astrology']} explanation="사주의 '관운'과 점성술의 '10하우스'가 동시에 활성화되었습니다." />
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[9px] text-dim leading-relaxed">
                        The only platform that speaks <br />
                        <span className="text-starlight font-bold">3 Ancient Languages</span> in 1 AI.
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] text-acc-gold tracking-widest font-bold">START NOW</span>
                        <div className="w-8 h-8 border border-acc-gold/30 rounded-full flex items-center justify-center text-acc-gold">
                            →
                        </div>
                    </div>
                </div>
            </div>

            {/* Poster 3: Actionable Insight (Landscape for Stories/Banners) */}
            <div id="poster-action" className="w-[800px] h-[400px] bg-gradient-to-br from-void to-[#1a1230] border border-white/10 rounded-3xl overflow-hidden relative flex items-center p-12 shadow-2xl">
                <div className="w-1/2 space-y-6">
                    <span className="px-3 py-1 bg-acc-gold/20 text-acc-gold text-[10px] font-bold rounded-full uppercase tracking-widest">The Soul of CosmicPath</span>
                    <h4 className="font-cinzel text-4xl leading-tight">
                        운명을 <br />
                        <span className="text-acc-gold underline decoration-acc-gold/30">행동</span>으로 <br />
                        동기화하세요.
                    </h4>
                    <p className="text-dim text-sm leading-relaxed max-w-sm">
                        단순히 읽고 끝내는 운세가 아닙니다. <br />
                        가장 적절한 타이밍을 당신의 캘린더에 동기화하여 <br />
                        실제 변화를 만들어냅니다.
                    </p>
                </div>

                <div className="w-1/2 relative h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.1),transparent)]" />
                    {/* Simulated Calendar UI */}
                    <div className="w-64 bg-white/5 border border-white/10 rounded-xl p-4 rotate-2 shadow-2xl">
                        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                            <div className="w-3 h-3 rounded-full bg-red-400/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
                            <div className="w-3 h-3 rounded-full bg-green-400/50" />
                        </div>
                        <div className="space-y-3">
                            <div className="bg-acc-gold/10 p-2 rounded border border-acc-gold/20">
                                <span className="text-[8px] text-acc-gold block mb-1">Upcoming Luck</span>
                                <span className="text-xs font-bold text-starlight">중요 계약 추천일 (BY CP)</span>
                            </div>
                            <div className="bg-white/5 p-2 rounded">
                                <div className="h-1.5 w-full bg-white/10 mb-1" />
                                <div className="h-1.5 w-2/3 bg-white/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Poster 4: Fortune Timeline (Story Vertical) */}
            <div id="poster-timeline" className="w-[450px] h-[800px] bg-bg-deep border-2 border-white/10 rounded-[40px] overflow-hidden relative flex flex-col p-12 shadow-2xl">
                <div className="flex items-center justify-between mb-16">
                    <span className="font-cinzel text-acc-gold text-lg font-bold">CosmicPath</span>
                    <span className="text-[10px] text-dim tracking-[0.3em] uppercase">Life Biorhythm</span>
                </div>

                <h3 className="text-3xl font-light mb-12 leading-tight">
                    <span className="text-starlight">Visualize</span> your <br />
                    <span className="text-acc-gold font-bold italic">Peak Moments.</span>
                </h3>

                <div className="flex-1 flex flex-col justify-center gap-8">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-xs text-dim uppercase font-bold tracking-widest">Growth Curve</span>
                            <span className="text-xs text-acc-gold font-bold">2026 - 2030</span>
                        </div>
                        <div className="h-32 w-full flex items-end justify-between px-2">
                            {[40, 65, 92, 55, 80].map((h, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div
                                        className="w-8 rounded-t-sm"
                                        style={{
                                            height: `${h}%`,
                                            background: i === 2 ? 'var(--acc-gold)' : 'rgba(255,255,255,0.1)',
                                            boxShadow: i === 2 ? '0 0 20px rgba(212,175,55,0.4)' : 'none'
                                        }}
                                    />
                                    <span className="text-[10px] text-dim">{2026 + i}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-acc-gold/10 border border-acc-gold/20 rounded-xl">
                            <span className="text-2xl">🏆</span>
                            <div>
                                <div className="text-sm font-bold text-starlight">최고의 도약기: 2028년</div>
                                <p className="text-[10px] text-dim">3중 교차 검증 결과, 당신의 모든 에너지가 한 곳으로 모이는 해입니다.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <span className="text-[10px] text-dim uppercase tracking-[0.4em]">Decide with Data</span>
                </div>
            </div>

            {/* Poster 5: Lunar Cycle / Lucky Assets (Landscape) */}
            <div id="poster-assets" className="w-[900px] h-[450px] bg-bg-deep border border-white/10 rounded-3xl overflow-hidden relative flex shadow-2xl">
                <div className="w-1/3 p-12 flex flex-col justify-center border-r border-white/10 bg-white/2">
                    <div className="font-cinzel text-acc-gold mb-6">CosmicPath</div>
                    <h4 className="text-3xl font-light mb-4">행운의 <br /> <span className="font-bold">에너지 자산.</span></h4>
                    <p className="text-dim text-xs leading-relaxed">
                        당신의 타고난 기질과 현재의 우주 흐름을 분석하여, <br />
                        가장 조화로운 요소들을 제안합니다.
                    </p>
                </div>

                <div className="w-2/3 p-12 grid grid-cols-2 gap-6 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#E6BE8A] shadow-[0_0_15px_rgba(230,190,138,0.3)] border-2 border-white/20" />
                            <div>
                                <div className="text-[10px] text-acc-gold uppercase font-bold tracking-widest">Lucky Color</div>
                                <div className="text-sm font-bold">샴페인 골드 (Gold)</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 text-2xl">🏔️</div>
                            <div>
                                <div className="text-[10px] text-acc-gold uppercase font-bold tracking-widest">Lucky Place</div>
                                <div className="text-sm font-bold">탁 트인 산 정상</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 bg-white/2 border border-white/10 rounded-2xl text-center space-y-4">
                        <div className="text-[10px] text-dim uppercase tracking-widest">Sync Insight</div>
                        <div className="text-2xl font-cinzel">94%</div>
                        <p className="text-[10px] text-dim leading-relaxed">
                            이 요소들은 현재 당신의 <br />
                            <span className="text-starlight">'도약'</span> 에너지를 극대화합니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* Poster 6: Digital Lifestyle - Night Meditation (1:1 Vertical Focus) */}
            <div id="poster-lifestyle-1" className="w-[600px] h-[600px] bg-void rounded-[40px] overflow-hidden relative shadow-2xl group border border-white/5">
                {/* Background: Using one of our generated cosmic visuals as a texture provider */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/50 to-void" />
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2000')] bg-cover bg-center" />
                </div>

                <div className="relative h-full flex flex-col items-center justify-between p-12">
                    <div className="text-center">
                        <span className="text-[10px] text-acc-gold font-bold tracking-[0.5em] uppercase mb-2 block">Premium Experience</span>
                        <h3 className="font-cinzel text-2xl text-starlight">A Moment for Your Soul</h3>
                    </div>

                    {/* Floating Phone with REAL UI */}
                    <div className="relative group-hover:scale-105 transition-transform duration-700 ease-cosmic">
                        <div className="absolute -inset-10 bg-acc-gold/20 blur-[60px] rounded-full opacity-50" />
                        <div className="w-56 h-[460px] bg-bg-deep border-4 border-white/10 rounded-[35px] overflow-hidden relative shadow-2xl rotate-[-2deg]">
                            {/* Inner App UI */}
                            <div className="p-5 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[8px] font-cinzel text-acc-gold">CosmicPath</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-acc-gold animate-pulse" />
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="mb-4">
                                        <div className="text-[8px] text-dim mb-1">Current Insight</div>
                                        <div className="text-sm font-bold text-starlight leading-tight">행운의 정점이 <br /> 다가오고 있습니다.</div>
                                    </div>
                                    <div className="w-full aspect-square scale-110">
                                        <CosmicRadar sajuScore={94} starScore={88} tarotScore={91} isLoading={false} />
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/5 text-[7px] text-dim">
                                    AI Verified 3-Way Analysis Result
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-[9px] text-dim flex items-center gap-2">
                        <div className="w-8 h-[1px] bg-white/10" />
                        <span className="uppercase tracking-widest">Design Your Destiny</span>
                        <div className="w-8 h-[1px] bg-white/10" />
                    </div>
                </div>
            </div>

            {/* Poster 7: The Master Plan (Landscape) */}
            <div id="poster-lifestyle-2" className="w-[800px] h-[450px] bg-[#050505] rounded-3xl overflow-hidden relative flex shadow-2xl border border-white/10">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267953ba?q=80&w=2000')] bg-cover" />

                <div className="w-1/2 p-16 flex flex-col justify-center relative z-10">
                    <h4 className="font-cinzel text-acc-gold text-lg mb-4">Masterpiece of Destiny</h4>
                    <p className="text-3xl font-light text-starlight leading-relaxed mb-6">
                        당신의 매일이 <br />
                        <span className="text-acc-gold font-bold">하나의 설계도</span>가 됩니다.
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <span className="text-acc-gold">✨</span>
                        </div>
                        <span className="text-xs text-dim">AI-Sync Life Calendar</span>
                    </div>
                </div>

                <div className="w-1/2 relative flex items-center justify-center p-12">
                    {/* Layered Card UI */}
                    <div className="relative w-full h-[300px]">
                        <div className="absolute top-0 right-10 w-48 h-64 bg-bg-deep border border-acc-gold/30 rounded-2xl p-4 shadow-2xl rotate-3 z-20 backdrop-blur-xl">
                            <div className="text-[10px] text-acc-gold font-bold mb-4 uppercase">Success Timing</div>
                            <div className="space-y-3">
                                <div className="h-2 w-full bg-acc-gold/10 rounded" />
                                <div className="h-2 w-4/5 bg-white/5 rounded" />
                                <div className="h-2 w-5/6 bg-white/5 rounded" />
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 text-center py-2 bg-acc-gold text-bg-deep text-[10px] font-bold rounded-lg cursor-default">
                                CALENDAR SYNC
                            </div>
                        </div>
                        <div className="absolute top-10 right-0 w-48 h-64 bg-bg-surface border border-white/10 rounded-2xl p-4 shadow-xl -rotate-6 z-10">
                            <div className="text-[10px] text-dim mb-4 uppercase">Risk Alert</div>
                            <div className="space-y-2">
                                <div className="h-1.5 w-full bg-red-400/10 rounded" />
                                <div className="h-1.5 w-3/4 bg-white/5 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button className="px-8 py-3 bg-white text-deep-navy font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
                Download All Assets (Extended)
            </button>
        </div>
    );
}
