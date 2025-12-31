'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';



export function VerdictSection() {
    return (
        <section className="py-32 bg-deep border-t border-white/5">
            <div className="container-cosmic text-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <span className="text-acc-logic/80 text-xs font-bold tracking-[0.3em] uppercase block mb-4">
                        Social Proof
                    </span>
                    <h2 className="font-cinzel text-3xl md:text-5xl text-starlight mb-6">
                        &quot;우연이 아닙니다. <span className="italic text-acc-logic">시스템</span>입니다.&quot;
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

                    {/* Stat 1 */}
                    <div className="p-8 border-l border-white/5 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm">
                        <div className="font-mono text-4xl md:text-6xl text-starlight mb-4">
                            3<span className="text-2xl ml-1 text-dim">X</span>
                        </div>
                        <p className="text-moonlight text-xs tracking-widest uppercase leading-relaxed">
                            Cross-Validation<br />Accuracy
                        </p>
                    </div>

                    {/* Stat 2 */}
                    <div className="p-8 border-l border-white/5 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm">
                        <div className="font-mono text-4xl md:text-6xl text-starlight mb-4">
                            <span ref={(node) => { if (node) node.textContent = '360'; }}>360</span>
                            <span className="text-2xl ml-1 text-dim">°</span>
                        </div>
                        <p className="text-moonlight text-xs tracking-widest uppercase leading-relaxed">
                            Holistic Life View
                        </p>
                    </div>

                    {/* Stat 3 */}
                    <div className="p-8 border-l border-white/5 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm">
                        <div className="font-mono text-4xl md:text-6xl text-starlight mb-4">
                            0<span className="text-2xl ml-1 text-dim">%</span>
                        </div>
                        <p className="text-moonlight text-xs tracking-widest uppercase leading-relaxed">
                            Bias & Hallucination
                        </p>
                    </div>

                </div>

                <p className="mt-16 text-dim text-xs font-mono">
                    Based on Kepler&apos;s Laws & Modern Data Science.
                </p>

            </div>
        </section>
    );
}
