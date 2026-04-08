'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function GapSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
    const opacityOld = useTransform(scrollYProgress, [0, 0.4], [1, 0.2]);
    const opacityNew = useTransform(scrollYProgress, [0.6, 1], [0.2, 1]);

    return (
        <section ref={containerRef} className="relative h-[250vh] bg-void">
            <div className="sticky top-0 h-screen overflow-hidden flex items-center">

                <div className="absolute inset-0 z-0 bg-void" />

                <motion.div
                    style={{ x }}
                    className="flex w-[200vw] h-full"
                >
                    {/* Panel 1: The Problem (Old) */}
                    <div className="w-screen h-full flex items-center justify-center relative px-6 border-r border-white/5 bg-void">
                        <motion.div style={{ opacity: opacityOld }} className="max-w-xl text-center">
                            <h3 className="text-gray-500 font-cinzel text-xl mb-4 tracking-widest uppercase">What Does Not Help</h3>
                            <h2 className="text-3xl md:text-5xl text-gray-400 font-medium mb-8 leading-tight blur-[2px] hover:blur-none transition-all duration-700">
                                &quot;좋은 말만 하는 리딩은 <br /> 필요 없어요.&quot;
                            </h2>
                            <p className="text-gray-600 font-serif italic text-lg">
                                &apos;다 잘 될 거예요&apos;, &apos;곧 기회가 와요&apos; 같은 말은 <br />
                                잠깐 위로는 돼도 지금의 선택을 도와주진 못해요.
                            </p>
                        </motion.div>
                    </div>

                    {/* Panel 2: The Solution (New) */}
                    <div className="w-screen h-full flex items-center justify-center relative px-6 bg-deep">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                        <motion.div style={{ opacity: opacityNew }} className="max-w-xl text-center relative z-10">
                            <h3 className="text-acc-logic font-cinzel text-xl mb-4 tracking-widest uppercase shadow-[0_0_15px_rgba(99,102,241,0.4)]">What You Need</h3>
                            <h2 className="text-3xl md:text-5xl text-starlight font-bold mb-8 leading-tight drop-shadow-2xl">
                                &quot;좋은 말 대신, <span className="text-acc-gold">지금 뭘 해야 할지</span> <br /> <span className="text-acc-logic">먼저 보여드려요.</span>&quot;
                            </h2>
                            <p className="text-moonlight text-lg">
                                언제 움직일지, <br />
                                뭘 먼저 준비할지, <br />
                                지금 피해야 할 선택이 뭔지.
                            </p>

                            {/* Visual Graph Element */}
                            <div className="mt-12 h-32 w-full border-b border-l border-acc-logic/30 relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-acc-logic/10 to-transparent" />
                                <svg className="absolute bottom-0 left-0 w-full h-full" overflow="visible">
                                    <path d="M0 100 Q 100 80, 200 110 T 400 60 T 600 20" fill="none" stroke="#6366F1" strokeWidth="2" />
                                    <circle cx="600" cy="20" r="4" fill="#6366F1">
                                        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                                    </circle>
                                </svg>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
