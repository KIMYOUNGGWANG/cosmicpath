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
        ? ['질문 정리', '판단 기준', '오늘 할 일', '보류선']
        : ['Question', 'Criteria', 'Next action', 'Hold line'];
    const quickQuestions = isKo
        ? [
            {
                label: '팔로업',
                context: 'love',
                question: '답장을 더 기다릴지, 오늘 한 번 더 보내고 정리할지 정하고 싶어.',
            },
            {
                label: '커리어',
                context: 'career',
                question: '미루고 있는 이직 결정을 오늘 어디까지 움직이면 좋을까?',
            },
            {
                label: '경계',
                context: 'general',
                question: '계속 미루고 있는 불편한 말을 오늘 어떻게 꺼내야 할까?',
            },
        ]
        : [
            {
                label: 'Follow-up',
                context: 'love',
                question: 'Should I wait for a reply, send one clean follow-up, or close the loop today?',
            },
            {
                label: 'Career',
                context: 'career',
                question: 'What is the smallest next move I should take on the job decision I keep delaying?',
            },
            {
                label: 'Boundary',
                context: 'general',
                question: 'How should I say the uncomfortable thing I have been avoiding?',
            },
        ];

    return (
        <HeroScene language={language}>
            <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                {/* Left Column: Hero Message */}
                <div className="flex-1 flex flex-col items-start text-left z-10 w-full">
                    <div className="mb-6 inline-flex flex-wrap items-center gap-2 border border-white/10 bg-[#15130f]/75 px-4 py-2 backdrop-blur-xl">
                        <span className="text-[11px] text-white/62">
                            {isKo
                                ? '오늘의 결정 정리 · 첫 정리 무료'
                                : 'Decision Note · First note free'}
                        </span>
                    </div>

                    <h1 className="mb-6 max-w-3xl break-keep font-cinzel text-4xl leading-tight text-starlight sm:text-5xl md:text-6xl lg:text-[64px]">
                        {isKo ? (
                            <>
                                미뤄둔 선택을 <br className="hidden md:block" />
                                <span className="text-acc-gold">오늘 정리하세요</span>
                            </>
                        ) : (
                            <>
                                Write down the choice <br className="hidden md:block" />
                                <span className="text-acc-gold">you keep postponing</span>
                            </>
                        )}
                    </h1>

                    <p className="mb-10 max-w-2xl break-keep text-base font-light leading-relaxed text-moonlight sm:text-lg md:text-xl">
                        {isKo ? (
                            <>
                                고민을 한 문장으로 적으면, 선택지와 기준, 오늘 할 일을 짧게 정리합니다. 사주, 점성술, 타로는 배경 근거로만 조용히 반영합니다.
                            </>
                        ) : (
                            <>
                                Bring one decision you keep postponing. We turn it into a plain question, a few criteria, and one careful next action for today.
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
                            className="group relative inline-flex w-full min-h-[56px] items-center justify-center border border-[#e7dac4]/80 bg-[#f3ead9] px-8 py-4 text-base font-semibold tracking-tight text-[#15130f] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#fff6e8] sm:w-auto"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isKo ? '선택 정리하기' : 'Write the decision'}
                                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </GrowthTrackedLink>
                    </div>

                    <div className="mt-5 flex w-full max-w-2xl flex-wrap gap-2">
                        {quickQuestions.map((item) => {
                            const href = `/start?reset=true&entry=${decisionEntry}&context=${item.context}&question=${encodeURIComponent(item.question)}`;
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
                                    {item.label}: {isKo ? '예시로 정리' : 'Use this note'}
                                </GrowthTrackedLink>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Live Preview & Guide (Hidden on Mobile/Tablet) */}
                <div className="hidden lg:flex flex-1 relative z-10 w-full items-center justify-center">
                    <div className="relative w-full max-w-md border border-white/10 bg-[#171510]/88 p-8 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl">
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                                <div className="flex h-12 w-12 items-center justify-center border border-white/10 bg-white/5">
                                    <span className="font-cinzel text-acc-gold text-lg">결</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-starlight">{isKo ? '결의 정리' : "Gyeol's note"}</h3>
                                    <p className="text-xs text-moonlight">{isKo ? '기준을 나누고 행동을 좁힙니다' : 'Criteria first, action second'}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-sm leading-7 text-moonlight">
                                    {isKo
                                        ? '이번 선택은 크게 결론내기보다, 이번 주 안에 확인 가능한 작은 행동으로 좁히는 편이 안전합니다.'
                                        : 'This choice is safer when narrowed into one small action you can check this week.'}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 border border-white/8 bg-black/20 p-3">
                                        <div className="h-2 w-2 rounded-full bg-acc-gold"></div>
                                        <span className="text-xs font-medium text-starlight">
                                            {isKo ? '방향: 작게 움직이기' : 'Direction: move small'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 border border-white/8 bg-black/20 p-3">
                                        <div className="h-2 w-2 rounded-full bg-saju-blue"></div>
                                        <span className="text-xs font-medium text-starlight">
                                            {isKo ? '오늘 할 일: 보낼 말 한 문장 쓰기' : 'Today: draft one sentence'}
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
