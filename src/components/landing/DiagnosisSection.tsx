'use client';

import { motion } from 'framer-motion';

export function DiagnosisSection() {
    return (
        <section className="relative py-20 md:py-32 bg-deep overflow-hidden">
            <div className="container-cosmic relative z-10 flex flex-col md:flex-row gap-12 md:gap-16 items-center">

                {/* Left: Text Area (Asymmetry) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 md:pr-12"
                >
                    <span className="text-acc-nebula text-xs font-bold tracking-widest uppercase mb-4 block">
                        The Diagnosis
                    </span>
                    <h2 className="font-cinzel text-3xl md:text-4xl text-starlight mb-8 leading-tight">
                        겉으로는 <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">차분한 호수</span> 같지만,<br />
                        수면 아래에는 <span className="text-acc-nebula drop-shadow-[0_0_15px_rgba(255,59,48,0.4)]">화산</span>이 끓고 있습니다.
                    </h2>
                    <div className="space-y-6 text-moonlight font-light leading-relaxed">
                        <p>
                            남들은 당신을 &#39;안정적인 사람&#39;이라 생각합니다.
                            하지만 당신은 알고 있습니다. 지금 자신이 인생의 거대한 변곡점에 서 있다는 것을.
                        </p>
                        <p>
                            불안은 당신이 약해서가 아닙니다. <br />
                            자신의 &#39;설계도&#39;를 아직 본 적이 없기 때문입니다.
                        </p>
                    </div>
                </motion.div>

                {/* Right: Abstract Visualization */}
                <div className="flex-1 w-full relative h-[400px]">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {/* Abstract Volcanic Lake Representation */}
                        <div className="relative w-64 h-64">
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
