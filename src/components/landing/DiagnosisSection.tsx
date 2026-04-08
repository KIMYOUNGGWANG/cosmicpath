'use client';

import { motion } from 'framer-motion';

export function DiagnosisSection() {
    return (
        <section className="relative py-20 md:py-32 bg-deep overflow-hidden">

            {/* Background glow — visible on all screens as ambient decoration */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 md:w-[480px] md:h-[480px] rounded-full bg-acc-nebula/5 blur-3xl pointer-events-none" />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-40 h-40 md:w-64 md:h-64 rounded-full border border-white/5 pointer-events-none hidden md:block" />

            <div className="container-cosmic relative z-10 flex flex-col md:flex-row gap-12 md:gap-16 items-center">

                {/* Left: Text Area */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 md:pr-12 relative z-20 w-full"
                >
                    <span className="text-acc-nebula text-xs font-bold tracking-widest uppercase mb-4 block">
                        Why It Feels Hard
                    </span>
                    <h2 className="font-cinzel text-2xl md:text-4xl text-starlight mb-6 md:mb-8 leading-tight">
                        겉으론 괜찮아 보여도, <br />
                        <span className="text-acc-nebula drop-shadow-[0_0_15px_rgba(255,59,48,0.4)]">속으론 계속 걸리죠.</span>
                    </h2>
                    <div className="space-y-4 md:space-y-6 text-moonlight font-light leading-relaxed text-sm md:text-base">
                        <p>
                            버텨야 하는지, 그만둬야 하는지. <br />
                            잘하고 있는 건지, 그냥 익숙해서 붙잡고 있는 건지.
                        </p>
                        <p>
                            답답한 건 약해서가 아니에요. <br />
                            아직 질문이 제대로 정리되지 않았기 때문일 수 있어요.
                        </p>
                    </div>
                </motion.div>

                {/* Right: Abstract Visualization — desktop only to prevent mobile overlap */}
                <div className="hidden md:flex flex-1 w-full relative h-[400px] z-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="relative w-72 h-72">
                            {/* Lake Surface */}
                            <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-br from-blue-900/10 to-transparent backdrop-blur-sm" />
                            {/* Inner Volcano / Core */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-acc-nebula/20 blur-2xl"
                            />
                            <div className="absolute inset-0 m-auto w-48 h-48 border border-acc-nebula/10 rounded-full animate-spin-slow" />
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
