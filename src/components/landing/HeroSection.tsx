import { GrowthTrackedLink } from '@/components/common/GrowthTracking';
import { HeroScene } from '@/components/landing/HeroScene';
import { getLandingVariant } from '@/lib/language-preference';
import { ArrowRight, CornerDownRight } from 'lucide-react';

interface HeroSectionProps {
    language: 'ko' | 'en';
}

export function HeroSection({ language }: HeroSectionProps) {
    const isKo = language === 'ko';
    const landingVariant = getLandingVariant(language);
    const decisionEntry = 'decision_timing_rebuild_v1';
    const careerQuestion = isKo
        ? '하반기에 이직, 사업, 지금 일 중 어디에 힘을 실어야 할까.'
        : 'Should I change jobs, build my own thing, or deepen the work I have now?';
    const startHref = `/start?reset=true&entry=${decisionEntry}&context=career&question=${encodeURIComponent(careerQuestion)}`;
    const layerRows = isKo
        ? [
            { code: '命式', title: '사주 구조', detail: '타고난 구조와 반복되는 압력을 봅니다.' },
            { code: '星盤', title: '점성 타이밍', detail: '지금 움직여도 되는 시간 흐름을 봅니다.' },
            { code: '牌', title: '타로 즉각 신호', detail: '지금 질문에서 바로 올라온 신호를 확인합니다.' },
        ]
        : [
            { code: '命式', title: 'Saju structure', detail: 'The underlying pattern and recurring pressure.' },
            { code: '星盤', title: 'Astrology timing', detail: 'The timing window around the next move.' },
            { code: '牌', title: "Tarot's immediate signal", detail: 'The signal rising from this question right now.' },
        ];
    const sampleCases = isKo
        ? [
            {
                label: '커리어',
                context: 'career',
                question: careerQuestion,
                displayQuestion: '하반기엔 어디에 힘을 실을까?',
            },
            {
                label: '관계',
                context: 'love',
                question: '답장을 기다릴지, 한 번 더 보낼지, 이제 정리할지 보고 싶다.',
                displayQuestion: '답장을 더 보낼까, 기다릴까, 정리할까?',
            },
            {
                label: '돈',
                context: 'general',
                question: '막힌 돈 흐름에서 먼저 줄일 것과 밀어야 할 것을 알고 싶다.',
                displayQuestion: '막힌 돈 흐름에서 무엇을 줄이고 밀까?',
            },
        ]
        : [
            {
                label: 'Career',
                context: 'career',
                question: careerQuestion,
            },
            {
                label: 'Love',
                context: 'love',
                question: 'Should I wait, follow up once, or close this relationship loop?',
            },
            {
                label: 'Money',
                context: 'general',
                question: 'What should I cut or push first to loosen a blocked money flow?',
            },
        ];

    return (
        <HeroScene language={language}>
            <div className="mx-auto w-full max-w-7xl px-4 py-8 text-left sm:px-6 lg:px-8">
                <div className="grid overflow-hidden border-x border-white/10 lg:grid-cols-[86px_minmax(0,1fr)]">
                    <aside className="hidden border-r border-white/10 lg:grid">
                        {layerRows.map((layer, index) => (
                            <div
                                key={layer.code}
                                className="flex min-h-40 flex-col justify-between border-b border-white/10 p-5 last:border-b-0"
                            >
                                <span className="font-cinzel text-2xl text-acc-gold/82">{layer.code}</span>
                                <span className="text-[10px] uppercase tracking-[0.22em] text-white/30">0{index + 1}</span>
                            </div>
                        ))}
                    </aside>

                    <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)]">
                        <section className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-12">
                            <div className="mb-10 flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-3">
                                <span className="text-[11px] uppercase tracking-[0.28em] text-white/48">
                                    {isKo ? 'CosmicPath Decision Note room' : 'CosmicPath Decision Note room'}
                                </span>
                                <span className="text-[11px] uppercase tracking-[0.24em] text-acc-gold/72">
                                    {isKo ? '첫 판정은 무료' : 'First verdict free'}
                                </span>
                            </div>

                            <h1 className="max-w-3xl break-keep font-cinzel text-[36px] leading-[1.08] text-starlight sm:text-6xl lg:text-[52px] xl:text-[54px]">
                                {isKo ? (
                                    <>
                                        미뤄둔 선택 하나를 <br />
                                        먼저 판정하고 <br />
                                        <span className="text-acc-gold">세 신호로 대조합니다</span>
                                    </>
                                ) : (
                                    <>
                                        One delayed choice. <br />
                                        Three cross-checks. <br />
                                        <span className="text-acc-gold">One next move.</span>
                                    </>
                                )}
                            </h1>

                            <p className="mt-8 max-w-2xl break-keep text-base font-light leading-8 text-moonlight">
                                {isKo ? (
                                    <>
                                        <span className="block sm:hidden">사주로 구조를 봅니다.</span>
                                        <span className="block sm:hidden">점성으로 시기를 봅니다.</span>
                                        <span className="block sm:hidden">타로 신호까지 대조합니다.</span>
                                        <span className="block sm:hidden">질문 하나의 방향을 정리합니다.</span>
                                        <span className="hidden sm:block">사주로 구조를 봅니다. 점성으로 시기를 봅니다.</span>
                                        <span className="hidden sm:block">타로 즉시 신호까지 대조해 질문을 판정합니다.</span>
                                    </>
                                ) : (
                                    "CosmicPath Decision Note cross-checks Saju structure, astrology timing, and tarot's immediate signal before naming the next move."
                                )}
                            </p>

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
                                className="group mt-10 grid min-h-[76px] w-full max-w-xl grid-cols-[44px_minmax(0,1fr)_44px] overflow-hidden border border-[#d7c59a]/55 bg-[#11100d]/42 text-starlight shadow-[0_24px_70px_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(255,255,255,0.025)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d7c59a] hover:bg-[#d7c59a]/[0.065] sm:grid-cols-[58px_minmax(0,1fr)_64px]"
                            >
                                <span className="flex items-center justify-center border-r border-[#d7c59a]/18 font-cinzel text-sm text-[#d7c59a]/72">
                                    01
                                </span>
                                <span className="flex flex-col justify-center px-3 text-left sm:px-6">
                                    <span className="break-keep text-xs font-semibold tracking-[0.06em] sm:text-sm sm:tracking-[0.08em]">
                                        {isKo ? '커리어 결정부터 보기' : 'Start with a career decision'}
                                    </span>
                                    <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/38">
                                        {isKo ? (
                                            <>
                                                <span className="block sm:hidden">이직 · 사업 · 현재 일</span>
                                                <span className="block sm:hidden">첫 판정 무료</span>
                                                <span className="hidden sm:inline">이직 / 사업 / 현재 일 · 첫 판정 무료</span>
                                            </>
                                        ) : 'job / venture / current role · first verdict free'}
                                    </span>
                                </span>
                                <span className="flex items-center justify-center border-l border-[#d7c59a]/28 text-[#d7c59a]">
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </span>
                            </GrowthTrackedLink>
                        </section>

                        <section className="p-6 sm:p-8 lg:p-10">
                            <div className="border-b border-white/10 pb-6">
                                <div className="text-[11px] uppercase tracking-[0.28em] text-white/38">
                                    {isKo ? 'Decision Note 접수 예시' : 'Decision Note intake'}
                                </div>
                                <p className="mt-4 break-keep text-2xl font-light leading-snug text-starlight">
                                    {isKo
                                        ? (
                                            <>
                                                <span className="block">늦춘 질문과 생년월일로</span>
                                                <span className="block">세 신호를 대조합니다.</span>
                                            </>
                                        )
                                        : 'Bring one postponed question and your birth date; the note cross-checks the three source signals.'}
                                </p>
                            </div>

                            <div className="mt-6 divide-y divide-white/8 border-y border-white/8">
                                {layerRows.map((layer) => (
                                    <div key={layer.code} className="grid grid-cols-[58px_minmax(0,1fr)] gap-4 py-4">
                                        <span className="font-cinzel text-base text-acc-gold/78">{layer.code}</span>
                                        <div>
                                            <div className="font-cinzel text-lg text-starlight">{layer.title}</div>
                                            <p className="mt-1 break-keep text-xs leading-5 text-white/48">{layer.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-7">
                                <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-white/34">
                                    {isKo ? '빠른 질문 예시' : 'sample questions'}
                                </div>
                                <div className="grid gap-2">
                                    {sampleCases.map((item) => {
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
                                                        promptId: item.label,
                                                        hasPrefilledQuestion: true,
                                                    },
                                                }}
                                                className="group grid min-h-[58px] grid-cols-[72px_minmax(0,1fr)_34px] items-center border border-white/8 bg-white/[0.018] transition-colors duration-300 hover:border-acc-gold/32 hover:bg-white/[0.04]"
                                            >
                                                <span className="flex h-full items-center justify-center border-r border-white/8 text-xs text-acc-gold">
                                                    {item.label}
                                                </span>
                                        <span className="break-keep px-4 text-xs leading-5 text-white/54 group-hover:text-moonlight">
                                                    {'displayQuestion' in item ? item.displayQuestion : item.question}
                                                </span>
                                                <CornerDownRight className="h-4 w-4 text-white/24 group-hover:text-acc-gold" />
                                            </GrowthTrackedLink>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </HeroScene>
    );
}
