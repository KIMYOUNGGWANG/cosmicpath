'use client';

import { motion } from 'framer-motion';

interface TrustSectionProps {
    language: 'ko' | 'en';
}

export function TrustSection({ language }: TrustSectionProps) {
    const content = {
        ko: {
            title: "근거 있는 이유, 믿을 수 있는 결과",
            subtitle: "32만 건 데이터 기반 — 그냥 느낌이 아니에요",
            cards: [
                {
                    title: "근거 있는 분석",
                    desc: "오래된 지식 + 현대 데이터. 정밀하게 읽어요",
                    icon: "📊"
                },
                {
                    title: "5만 명이 써봤어요",
                    desc: "이미 많은 사람들이 자신의 흐름을 확인했어요",
                    icon: "⭐"
                },
                {
                    title: "내 정보는 안전해요",
                    desc: "리포트 생성 후 데이터 즉시 삭제해요",
                    icon: "🔒"
                }
            ]
        },
        en: {
            title: "Where Science Meets Mystery",
            subtitle: "Your destiny analyzed based on 320,000 real-world data points",
            cards: [
                {
                    title: "Data-Driven",
                    desc: "Precision algorithms combining ancient texts and modern stats",
                    icon: "📊"
                },
                {
                    title: "Proven Trust",
                    desc: "Over 50,000 users have already verified their paths",
                    icon: "⭐"
                },
                {
                    title: "Full Privacy",
                    desc: "Your data is deleted immediately after report generation",
                    icon: "🔒"
                }
            ]
        }
    };

    const t = content[language];

    return (
        <section className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold mb-6 font-cinzel"
                >
                    {t.title}
                </motion.h2>
                <p className="text-fg-secondary text-lg font-light">
                    {t.subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {t.cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-8 text-center hover:border-accent-gold/30 transition-colors"
                    >
                        <div className="text-4xl mb-6">{card.icon}</div>
                        <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                        <p className="text-fg-secondary text-sm leading-relaxed">
                            {card.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
