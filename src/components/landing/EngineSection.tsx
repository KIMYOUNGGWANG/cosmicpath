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
    { id: 1, orbit: 1, icon: '星', label: '점성술', color: '#D7B25D' },
    { id: 2, orbit: 1, icon: '宮', label: '자미두수', color: '#B77C6D' },
    { id: 3, orbit: 2, icon: '數', label: '수비학', color: '#CDBB83' },
    { id: 4, orbit: 2, icon: '運', label: '10년대운', color: '#94A3B8' },
    { id: 5, orbit: 3, icon: '時', label: '골든타임', color: '#9F8F78' },
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
        radius: Math.floor(orbitalSize * base.radiusFraction * 2),
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
                        <span className="text-acc-gold">독립된 근거를 교차합니다.</span>
                    </h2>
                    <p className="text-moonlight max-w-xl mx-auto text-base md:text-lg leading-relaxed">
                        사주(구조), 점성술(타이밍), 자미두수(명반), 수비학(주기)을 결합합니다.<br />
                        결론보다 먼저 어떤 천문 데이터가 같은 방향을 가리키는지 검증합니다.
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

                    {/* Orbital Rings with Floating Nodes */}
                    {orbitalPaths.map((orbit, index) => (
                        <motion.div
                            key={index}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]"
                            style={{
                                width: orbit.radius,
                                height: orbit.radius,
                            }}
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: orbit.duration,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            {/* Render Nodes on this Orbit */}
                            {DATA_NODES.filter((n) => n.orbit === index).map((node, nodeIndex) => {
                                const angle = (nodeIndex * (360 / DATA_NODES.filter((n) => n.orbit === index).length)) * (Math.PI / 180);
                                const x = Math.cos(angle) * (orbit.radius / 2);
                                const y = Math.sin(angle) * (orbit.radius / 2);

                                return (
                                    <motion.div
                                        key={node.id}
                                        className="group absolute w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/20 flex items-center justify-center text-xs md:text-sm font-bold shadow-lg cursor-pointer transition-all hover:scale-125 hover:border-gold"
                                        style={{
                                            left: `calc(50% + ${x}px - 16px)`,
                                            top: `calc(50% + ${y}px - 16px)`,
                                            backgroundColor: '#05070B',
                                            color: node.color,
                                        }}
                                        animate={{
                                            rotate: -360,
                                        }}
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
                        <div className="text-4xl md:text-5xl font-bold text-acc-logic mb-2 font-cinzel">4</div>
                        <div className="text-sm font-bold text-white mb-1">융합 엔진</div>
                        <div className="text-xs text-dim text-center">사주 + 점성 + 자미두수 + 수비학<br />4대 체계를 교차 검증해요</div>
                    </div>

                    {/* Stat 3 */}
                    <div className="flex flex-col items-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-[#c8a84d]/30 transition-colors">
                        <div className="text-4xl md:text-5xl font-bold text-[#e6ca7d] mb-2 font-cinzel">12</div>
                        <div className="text-sm font-bold text-white mb-1">월별 장부</div>
                        <div className="text-xs text-dim text-center">12개월 월별 운세와 9년 주기를<br />정밀하게 산출해요</div>
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
