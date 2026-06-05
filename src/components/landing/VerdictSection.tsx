'use client';

import { motion } from 'framer-motion';



export function VerdictSection() {
    return (
        <section className="py-16 md:py-32 bg-deep border-t border-white/5">
            <div className="container-cosmic px-6 text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 md:mb-20"
                >
                    <span className="text-acc-logic/80 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase block mb-4">
                        What You Leave With
                    </span>
                    <h2 className="font-cinzel text-2xl md:text-5xl text-starlight mb-6 leading-tight">
                        &quot;긴 설명보다, <span className="text-acc-gold">오늘 남길 세 줄.</span>&quot;
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

                    {/* Stat 1 */}
                    <div className="p-6 md:p-8 border-l border-white/5 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm">
                        <div className="font-mono text-3xl md:text-6xl text-starlight mb-4">
                            3<span className="text-xl md:text-2xl ml-1 text-dim">X</span>
                        </div>
                        <p className="text-moonlight text-xs tracking-widest uppercase leading-relaxed">
                            Criteria<br />Lines
                        </p>
                    </div>

                    {/* Stat 2 */}
                    <div className="p-8 border-l border-white/5 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm">
                        <div className="font-mono text-4xl md:text-6xl text-starlight mb-4">1</div>
                        <p className="text-moonlight text-xs tracking-widest uppercase leading-relaxed">
                            First Action<br />Today
                        </p>
                    </div>

                    {/* Stat 3 */}
                    <div className="p-8 border-l border-white/5 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm">
                        <div className="font-mono text-4xl md:text-6xl text-starlight mb-4">4</div>
                        <p className="text-moonlight text-xs tracking-widest uppercase leading-relaxed">
                            Hold<br />Signals
                        </p>
                    </div>

                </div>

                <p className="mt-16 text-dim text-xs font-mono">
                    질문, 기준, 행동, 보류선을 먼저 정리합니다.
                </p>

            </div>
        </section>
    );
}
