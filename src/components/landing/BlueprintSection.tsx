'use client';

import { motion } from 'framer-motion';

// Static binary strings to avoid hydration mismatch (no Math.random())
const binaryRows = [
    '10110101001010110100101011010010101101001010110100101011010010',
    '01001011010010101101001010110100101011010010101101001010110100',
    '11010010101101001010110100101011010010101101001010110100101011',
    '00101011010010101101001010110100101011010010101101001010110100',
    '10101101001010110100101011010010101101001010110100101011010010',
    '01011010010101101001010110100101011010010101101001010110100101',
    '10010101101001010110100101011010010101101001010110100101011010',
    '01101001010110100101011010010101101001010110100101011010010101',
    '10100101011010010101101001010110100101011010010101101001010110',
    '01010110100101011010010101101001010110100101011010010101101001',
];

export function BlueprintSection() {
    return (
        <section className="relative py-16 md:py-40 overflow-hidden bg-surface">
            <div className="container-cosmic relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">

                {/* Left: Copy */}
                <div>
                    <span className="text-acc-gold text-xs font-bold tracking-widest uppercase mb-4 block">
                        The Product
                    </span>
                    <h2 className="font-cinzel text-3xl md:text-5xl text-starlight mb-6 md:mb-8 leading-tight">
                        운세를 보는 게 아니라, <br />
                        <span className="text-acc-gold">내 선택을 읽는 거예요.</span>
                    </h2>
                    <p className="text-moonlight text-lg mb-8 leading-relaxed">
                        막막한 기분으로 끝내지 않게. 지금 상태, 다음 흐름,
                        먼저 볼 포인트를 한 화면에 정리해드려요.
                    </p>

                    <ul className="space-y-6 text-dim mt-10">
                        <li className="relative pl-6 border-l border-acc-logic/30">
                            <h4 className="text-acc-logic font-bold text-sm mb-1 uppercase tracking-wider">Logic (사주)</h4>
                            <p className="text-sm text-moonlight">타고난 기질과 강점이 어디서 잘 쓰이는지</p>
                        </li>
                        <li className="relative pl-6 border-l border-tarot-purple/30">
                            <h4 className="text-tarot-purple font-bold text-sm mb-1 uppercase tracking-wider">Intuition (타로)</h4>
                            <p className="text-sm text-moonlight">지금 마음이 어디서 흔들리는지</p>
                        </li>
                        <li className="relative pl-6 border-l border-star-yellow/30">
                            <h4 className="text-star-yellow font-bold text-sm mb-1 uppercase tracking-wider">Flow (별자리)</h4>
                            <p className="text-sm text-moonlight">움직일 때와 기다릴 때를 가늠하는 힌트</p>
                        </li>
                    </ul>

                    <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-xs text-dim leading-relaxed">
                            💡 <span className="text-starlight font-bold">Cosmic Radar</span>는 이 3가지를 같이 봐요. 한쪽 해석만 믿지 않게, <span className="text-acc-gold underline decoration-acc-gold/50 underline-offset-4">균형 있게</span> 읽어드리려는 구조예요.
                        </p>
                    </div>
                </div>

                {/* Right: Visual Stack (PDF Preview) */}
                <div className="relative h-[400px] md:h-[500px] w-full flex items-center justify-center perspective-[1000px]">
                    {/* Decorative Background Numbers */}
                    <div className="absolute inset-0 overflow-hidden opacity-5 font-mono text-[10px] leading-none pointer-events-none select-none">
                        {binaryRows.map((row, i) => (
                            <div key={i}>{row}</div>
                        ))}
                    </div>

                    {/* Stacked Cards */}
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            initial={{
                                y: index * 40,
                                z: -index * 50,
                                scale: 1 - index * 0.05,
                                opacity: 0
                            }}
                            whileInView={{ opacity: 1 - index * 0.2 }}
                            whileHover={{
                                y: index * 60 - 40, /* Fan out */
                                rotateX: 10,
                                transition: { duration: 0.4 }
                            }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.8 }}
                            className="absolute w-64 md:w-80 aspect-[1/1.4] bg-bg-deep border border-white/10 shadow-2xl rounded-sm p-6 flex flex-col"
                            style={{
                                zIndex: 3 - index,
                                top: '10%'
                            }}
                        >
                            {/* Card Content Skeleton */}
                            <div className="w-12 h-12 border border-white/20 rounded-full mb-6 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white/5" />
                            </div>
                            <div className="h-2 w-20 bg-white/20 mb-4" />
                            <div className="h-px w-full bg-white/10 mb-6" />

                            <div className="space-y-3">
                                <div className="h-1.5 w-full bg-white/5" />
                                <div className="h-1.5 w-4/5 bg-white/5" />
                                <div className="h-1.5 w-5/6 bg-white/5" />
                            </div>

                            <div className="mt-auto h-32 border border-acc-logic/20 relative p-2">
                                <div className="absolute bottom-2 left-2 right-2 h-[1px] bg-acc-logic/50" />
                                <svg className="w-full h-full" overflow="visible">
                                    <path d="M0 80 C 40 40, 80 90, 120 40 S 200 60, 240 20" fill="none" stroke="#6366F1" strokeWidth="1" strokeDasharray="2 2" />
                                </svg>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
