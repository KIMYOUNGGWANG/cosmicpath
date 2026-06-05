'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// Responsive orbital data — radius is a fraction of the container size
// Will be multiplied by a scale factor based on screen size
const ORBITAL_BASE = [
    { radiusFraction: 0.18, duration: 20, startAngle: 0 },
    { radiusFraction: 0.27, duration: 28, startAngle: 45 },
    { radiusFraction: 0.36, duration: 35, startAngle: 90 },
    { radiusFraction: 0.44, duration: 45, startAngle: 180 },
];

const DATA_NODES = [
    { id: 0, orbit: 0, icon: '命', label: '사주', color: '#7B8C9F' },
    { id: 1, orbit: 1, icon: '時', label: '시기', color: '#D7B25D' },
    { id: 2, orbit: 1, icon: '間', label: '간격', color: '#B77C6D' },
    { id: 3, orbit: 2, icon: '日', label: '겉의 흐름', color: '#CDBB83' },
    { id: 4, orbit: 2, icon: '月', label: '속의 흐름', color: '#94A3B8' },
    { id: 5, orbit: 3, icon: '牌', label: '카드', color: '#9F8F78' },
];

export function EngineSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const orbitalRef = useRef<HTMLDivElement>(null);
    const [orbitalSize, setOrbitalSize] = useState(480); // default desktop

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const rotate = useTransform(scrollYProgress, [0, 1], [0, 30]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.95]);

    // Optimized Counter Animation (No Re-renders)
    const pointsRef = useRef<HTMLDivElement>(null);
    const targetPoints = 214;

    // Measure container to compute responsive orbit radii
    useEffect(() => {
        const measure = () => {
            if (orbitalRef.current) {
                setOrbitalSize(orbitalRef.current.clientWidth);
            }
        };
        measure();
        const resizeObserver = new ResizeObserver(measure);
        if (orbitalRef.current) resizeObserver.observe(orbitalRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        let start = 0;
        const duration = 2000; // ms

        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            // Direct DOM update — no React re-render
            if (pointsRef.current) {
                pointsRef.current.textContent = String(Math.floor(eased * targetPoints));
            }

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

    // Compute actual pixel radii from current container size
    const orbitalPaths = ORBITAL_BASE.map((base) => ({
        radius: Math.floor((orbitalSize / 2) * base.radiusFraction * 2),
        duration: base.duration,
    }));

    return (
        <section
            ref={containerRef}
            className="relative py-20 md:py-48 overflow-hidden bg-void"
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
                        Quiet Cross-Check
                    </span>
                    <h2 className="font-cinzel text-2xl md:text-4xl text-starlight mb-6 leading-tight">
                        한 줄 조언보다, <br className="md:hidden" />
                        <span className="text-acc-gold">근거를 나누어 봅니다.</span>
                    </h2>
                    <p className="text-moonlight max-w-xl mx-auto text-base md:text-lg leading-relaxed">
                        사주, 점성, 타로는 전면 캐릭터가 아니라 판단 보조 자료입니다.<br />
                        결론보다 먼저 어떤 근거가 같은 방향을 가리키는지 확인합니다.
                    </p>
                </motion.div>

                {/* Engine Visualization — overflow-hidden prevents mobile scroll */}
                <motion.div
                    ref={orbitalRef}
                    style={{ rotate, scale, willChange: 'transform' }}
                    className="relative w-full max-w-lg mx-auto aspect-square mb-12 overflow-hidden"
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
                            <span className="font-cinzel text-xl md:text-3xl text-deep-navy font-bold block">결</span>
                            <span className="font-cinzel text-sm md:text-base text-deep-navy font-bold opacity-80">정리</span>
                        </div>
                    </motion.div>

                    {/* Orbital Paths — radius now computed from container size */}
                    {orbitalPaths.map((orbit, i) => (
                        <motion.div
                            key={i}
                            className="absolute top-1/2 left-1/2 rounded-full border border-white/5"
                            style={{
                                width: orbit.radius * 2,
                                height: orbit.radius * 2,
                                marginLeft: -orbit.radius,
                                marginTop: -orbit.radius,
                                willChange: 'transform',
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
                                const nodesOnOrbit = DATA_NODES.filter(n => n.orbit === i).length;
                                const angle = (360 / nodesOnOrbit) * nodeIdx;
                                return (
                                    <motion.div
                                        key={node.id}
                                        className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border border-white/20 backdrop-blur-sm cursor-pointer group"
                                        style={{
                                            top: '50%',
                                            left: '50%',
                                            transform: `rotate(${angle}deg) translateX(${orbit.radius}px) rotate(-${angle}deg)`,
                                            backgroundColor: `${node.color}20`,
                                            color: node.color,
                                            boxShadow: `0 0 15px ${node.color}40`,
                                            willChange: 'transform',
                                        }}
                                        whileHover={{ scale: 1.2, zIndex: 50 }}
                                        animate={{ rotate: -360 }}
                                        transition={{
                                            rotate: { duration: orbit.duration, repeat: Infinity, ease: 'linear' },
                                        }}
                                    >
                                        {node.icon}
                                        {/* Tooltip */}
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/90 bg-black/80 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
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
                        <div ref={pointsRef} className="text-4xl md:text-5xl font-bold text-acc-gold mb-2 font-cinzel">
                            0
                        </div>
                        <div className="text-sm font-bold text-white mb-1">참고 포인트</div>
                        <div className="text-xs text-dim text-center">사주와 별자리의<br />주요 기준을 압축해요</div>
                    </div>

                    {/* Stat 2 */}
                    <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-acc-logic/30 transition-colors">
                        <div className="text-4xl md:text-5xl font-bold text-acc-logic mb-2 font-cinzel">3</div>
                        <div className="text-sm font-bold text-white mb-1">근거 묶음</div>
                        <div className="text-xs text-dim text-center">사주 + 별자리 + 카드<br />세 방향을 같이 봐요</div>
                    </div>

                    {/* Stat 3 */}
                    <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-tarot-purple/30 transition-colors">
                        <div className="text-4xl md:text-5xl font-bold text-tarot-purple mb-2 font-cinzel">78</div>
                        <div className="text-sm font-bold text-white mb-1">카드 기준</div>
                        <div className="text-xs text-dim text-center">78장 기준으로 지금의 흔들림을<br />보조 근거로 봐요</div>
                    </div>

                    {/* Stat 4 */}
                    <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-star-yellow/30 transition-colors">
                        <div className="text-4xl md:text-5xl font-bold text-star-yellow mb-2 font-cinzel">1</div>
                        <div className="text-sm font-bold text-white mb-1">오늘 할 일</div>
                        <div className="text-xs text-dim text-center">첫 정리에서 가장 작은 행동을<br />먼저 보여드려요</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
