import { GrowthTrackedLink } from '@/components/common/GrowthTracking';
import { HeroScene } from '@/components/landing/HeroScene';
import { getLandingVariant } from '@/lib/language-preference';

interface HeroSectionProps {
    language: 'ko' | 'en';
}

export function HeroSection({ language }: HeroSectionProps) {
    const isKo = language === 'ko';
    const landingVariant = getLandingVariant(language);
    const decisionEntry = 'decision_timing_rebuild_v1';
    const startHref = `/start?reset=true&entry=${decisionEntry}`;
    const decisionSignals = isKo
        ? ['관계', '커리어', '재물', '타이밍']
        : ['Relationship', 'Career', 'Wealth', 'Timing'];
    const quickQuestions = isKo
        ? [
            {
                label: '이직',
                context: 'career',
                question: '지금 이직을 밀어붙이는 게 맞을까, 조금 더 기다리는 게 맞을까?',
            },
            {
                label: '관계',
                context: 'love',
                question: '지금 먼저 연락하는 게 맞을까, 기다리는 게 맞을까?',
            },
            {
                label: '돈',
                context: 'money',
                question: '이번 결정은 지금 실행해도 될까, 손실 리스크가 더 클까?',
            },
        ]
        : [
            {
                label: 'Career',
                context: 'career',
                question: 'Should I push this job move now, or wait a little longer?',
            },
            {
                label: 'Love',
                context: 'love',
                question: 'Should I reach out now, or would waiting create a better opening?',
            },
            {
                label: 'Money',
                context: 'money',
                question: 'Should I act on this money decision now, or is the downside too high?',
            },
        ];

    return (
        <HeroScene language={language}>
            <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                {/* Left Column: Hero Message */}
                <div className="flex-1 flex flex-col items-start text-left z-10 w-full">
                    <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-xl">
                        <span className="text-[11px] text-white/62">
                            {isKo
                                ? 'Decision Timing · 첫 판정 무료'
                                : 'Decision Timing · First verdict free'}
                        </span>
                    </div>

                    <h1 className="mb-6 max-w-3xl break-keep font-cinzel text-4xl font-bold leading-tight tracking-tight text-starlight sm:text-5xl md:text-6xl lg:text-[64px]">
                        {isKo ? (
                            <>
                                지금 움직일지, 기다릴지 <br className="hidden md:block" />
                                <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">먼저 판정합니다</span>
                            </>
                        ) : (
                            <>
                                Move now, or wait? <br className="hidden md:block" />
                                <span className="text-acc-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">Get the verdict first</span>
                            </>
                        )}
                    </h1>

                    <p className="mb-10 max-w-2xl break-keep text-base font-light leading-relaxed text-moonlight sm:text-lg md:text-xl">
                        {isKo ? (
                            <>
                                질문 하나를 넣으면 사주, 점성술, 타로를 교차해서 결론, 근거, 다음 행동을 먼저 보여줍니다. 막연한 운세보다 오늘 결정에 필요한 답에 집중합니다.
                            </>
                        ) : (
                            <>
                                Ask one real question. CosmicPath cross-checks Saju, Astrology, and Tarot, then shows the verdict, evidence, and next action before the full report.
                            </>
                        )}
                    </p>

                    <div className="mb-6 flex flex-wrap gap-2">
                        {decisionSignals.map((signal) => (
                            <span
                                key={signal}
                                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/52"
                            >
                                {signal}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
                        <GrowthTrackedLink
                            href={startHref}
                            trackingEvent={{
                                event: 'decision_timing_home_cta_clicked',
                                source: decisionEntry,
                                step: 'hero',
                                language,
                                metadata: {
                                    landingVariant,
                                },
                            }}
                            className="group relative inline-flex w-full sm:w-auto min-h-[56px] items-center justify-center rounded-full bg-gradient-to-r from-acc-gold via-amber-300 to-acc-gold bg-[length:200%_auto] px-8 py-4 text-lg font-bold tracking-tight text-deep-navy shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)]"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isKo ? '무료로 첫 판정 보기' : 'See My First Verdict'}
                                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </GrowthTrackedLink>
                    </div>

                    <div className="mt-5 flex w-full max-w-2xl flex-wrap gap-2">
                        {quickQuestions.map((item) => {
                            const href = `${startHref}&context=${item.context}&question=${encodeURIComponent(item.question)}`;
                            return (
                                <GrowthTrackedLink
                                    key={item.label}
                                    href={href}
                                    trackingEvent={{
                                        event: 'decision_timing_prompt_clicked',
                                        source: decisionEntry,
                                        step: 'hero_prompt',
                                        language,
                                        context: item.context,
                                        metadata: {
                                            landingVariant,
                                            question: item.question,
                                        },
                                    }}
                                    className="min-h-[38px] rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs text-white/68 transition-all hover:border-acc-gold/35 hover:bg-acc-gold/10 hover:text-acc-gold"
                                >
                                    {item.label}: {isKo ? '예시 질문으로 시작' : 'Start with prompt'}
                                </GrowthTrackedLink>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Live Preview & Guide (Hidden on Mobile/Tablet) */}
                <div className="hidden lg:flex flex-1 relative z-10 w-full items-center justify-center">
                    <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface-2/80 p-8 shadow-2xl backdrop-blur-xl">
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10">
                                    <span className="font-cinzel text-acc-gold text-lg">결</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-starlight">Oracle Guide</h3>
                                    <p className="text-xs text-moonlight">Analytic & Neutral</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-sm italic text-moonlight">
                                    {isKo
                                        ? '"이번 선택은 기다리기보다 작은 실행으로 먼저 확인하는 편이 유리합니다."'
                                        : '"This choice favors a small first move over waiting for perfect certainty."'}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 rounded-lg bg-black/40 p-3">
                                        <div className="h-2 w-2 rounded-full bg-acc-gold"></div>
                                        <span className="text-xs font-medium text-starlight">
                                            {isKo ? 'Verdict: Move carefully' : 'Verdict: Move carefully'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg bg-black/40 p-3">
                                        <div className="h-2 w-2 rounded-full bg-saju-blue"></div>
                                        <span className="text-xs font-medium text-starlight">
                                            {isKo ? 'Next: 이번 주 안에 작은 제안 보내기' : 'Next: Send a small proposal this week'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HeroScene>
    );
}
