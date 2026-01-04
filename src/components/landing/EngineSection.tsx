'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// Static orbital data for deterministic rendering
const ORBITAL_PATHS = [
    { radius: 80, duration: 20, startAngle: 0 },
    { radius: 120, duration: 28, startAngle: 45 },
    { radius: 160, duration: 35, startAngle: 90 },
    { radius: 200, duration: 45, startAngle: 180 },
];

const DATA_NODES = [
    { id: 0, orbit: 0, icon: '甲', label: '사주 (Logic)', color: '#6366F1' },
    { id: 1, orbit: 1, icon: '♄', label: '토성 (Karma)', color: '#F59E0B' },
    { id: 2, orbit: 1, icon: '♃', label: '목성 (Luck)', color: '#EF4444' },
    { id: 3, orbit: 2, icon: '☉', label: '태양 (Self)', color: '#FBBF24' },
    { id: 4, orbit: 2, icon: '☽', label: '달 (Inner)', color: '#94A3B8' },
    { id: 5, orbit: 3, icon: '🔮', label: '타로 (Intuition)', color: '#A855F7' },
];

export function EngineSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const rotate = useTransform(scrollYProgress, [0, 1], [0, 30]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.95]);

    // Animated counter for "214 Analysis Points"
    const [points, setPoints] = useState(0);
    const targetPoints = 214;

    useEffect(() => {
        let start = 0;
        const duration = 2000; // ms
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setPoints(Math.floor(eased * targetPoints));
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(step);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative py-32 md:py-48 overflow-hidden bg-void"
        >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(212, 175, 55, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(212, 175, 55, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            <div className="container-cosmic relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 md:mb-24"
                >
                    <span className="text-acc-logic text-xs font-bold tracking-[0.3em] uppercase block mb-4">
                        Cosmic Intelligence
                    </span>
                    <h2 className="font-cinzel text-3xl md:text-5xl text-starlight mb-6 leading-tight">
                        모호한 운세는 그만.<br className="md:hidden" />
                        <span className="text-acc-gold">데이터</span>로 증명합니다.
                    </h2>
                    <p className="text-moonlight max-w-xl mx-auto text-base md:text-lg leading-relaxed">
                        수천 년의 역사가 담긴 사주와 점성학의 알고리즘,<br />
                        그리고 현대적 데이터 분석 기술이 당신의 운명을 정밀하게 판독합니다.
                    </p>
                </motion.div>

                {/* Engine Visualization */}
                <motion.div
                    style={{ rotate, scale }}
                    className="relative w-full max-w-lg mx-auto aspect-square mb-12"
                >
                    {/* Central Core */}
                    <motion.div
                        animate={{
                            boxShadow: [
                                '0 0 30px rgba(212, 175, 55, 0.3)',
                                '0 0 60px rgba(212, 175, 55, 0.5)',
                                '0 0 30px rgba(212, 175, 55, 0.3)',
                            ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-acc-gold via-amber-500 to-acc-gold flex items-center justify-center z-20 shadow-2xl"
                    >
                        <div className="text-center">
                            <span className="font-cinzel text-xl md:text-3xl text-deep-navy font-bold block">TOTAL</span>
                            <span className="font-cinzel text-sm md:text-base text-deep-navy font-bold opacity-80">INSIGHT</span>
                        </div>
                    </motion.div>

                    {/* Orbital Paths */}
                    {ORBITAL_PATHS.map((orbit, i) => (
                        <motion.div
                            key={i}
                            className="absolute top-1/2 left-1/2 rounded-full border border-white/5"
                            style={{
                                width: orbit.radius * 2,
                                height: orbit.radius * 2,
                                marginLeft: -orbit.radius,
                                marginTop: -orbit.radius,
                            }}
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: orbit.duration,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            {/* Nodes on this orbit */}
                            {DATA_NODES.filter(n => n.orbit === i).map((node, nodeIdx) => {
                                const angle = (360 / DATA_NODES.filter(n => n.orbit === i).length) * nodeIdx;
                                return (
                                    <motion.div
                                        key={node.id}
                                        className="absolute w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-base font-bold border border-white/20 backdrop-blur-sm cursor-pointer group"
                                        style={{
                                            top: '50%',
                                            left: '50%',
                                            transform: `rotate(${angle}deg) translateX(${orbit.radius}px) rotate(-${angle}deg)`,
                                            backgroundColor: `${node.color}20`,
                                            color: node.color,
                                            boxShadow: `0 0 15px ${node.color}40`,
                                        }}
                                        whileHover={{ scale: 1.2, zIndex: 50 }}
                                        animate={{ rotate: -360 }} // Counter-rotate to keep upright
                                        transition={{
                                            rotate: { duration: orbit.duration, repeat: Infinity, ease: 'linear' },
                                        }}
                                    >
                                        {node.icon}
                                        {/* Tooltip */}
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-white/90 bg-black/80 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            {node.label}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Stats / Concrete Proof */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4"
                >
                    {/* Stat 1 */}
                    <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-gold/30 transition-colors">
                        <div className="text-4xl md:text-5xl font-bold text-acc-gold mb-2 font-cinzel">
                            {points}
                        </div>
                        <div className="text-sm font-bold text-white mb-1">판독 포인트</div>
                        <div className="text-xs text-dim text-center">당신의 사주와 별자리를<br />214가지 관점에서 정밀 분석</div>
                    </div>

                    {/* Stat 2 */}
                    <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-acc-logic/30 transition-colors">
                        <div className="text-4xl md:text-5xl font-bold text-acc-logic mb-2 font-cinzel">3</div>
                        <div className="text-sm font-bold text-white mb-1">차원 입체 검증</div>
                        <div className="text-xs text-dim text-center">사주(논리) + 점성술(흐름)<br />+ 타로(직관) 통합 엔진</div>
                    </div>

                    {/* Stat 3 */}
                    <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-tarot-purple/30 transition-colors">
                        <div className="text-4xl md:text-5xl font-bold text-tarot-purple mb-2 font-cinzel">78</div>
                        <div className="text-sm font-bold text-white mb-1">운명의 원형</div>
                        <div className="text-xs text-dim text-center">78장의 타로 아키타입으로<br />무의식의 영역까지 해석</div>
                    </div>

                    {/* Stat 4 */}
                    <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-star-yellow/30 transition-colors">
                        <div className="text-4xl md:text-5xl font-bold text-star-yellow mb-2 font-cinzel">1</div>
                        <div className="text-sm font-bold text-white mb-1">단 하나의 설계도</div>
                        <div className="text-xs text-dim text-center">복사 붙여넣기가 아닌<br />오직 당신만을 위한 리포트</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
