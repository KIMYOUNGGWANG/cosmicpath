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
    const startHref = `/start?reset=true&entry=${decisionEntry}`;
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
                label: '관계',
                context: 'love',
                question: '답장을 기다릴지, 한 번 더 보낼지, 이제 정리할지 보고 싶다.',
            },
            {
                label: '커리어',
                context: 'career',
                question: '하반기에 이직, 사업, 지금 일 중 어디에 힘을 실어야 할까.',
            },
            {
                label: '돈',
                context: 'general',
                question: '막힌 돈 흐름에서 먼저 줄일 것과 밀어야 할 것을 알고 싶다.',
            },
        ]
        : [
            {
                label: 'Love',
                context: 'love',
                question: 'Should I wait, follow up once, or close this relationship loop?',
            },
            {
                label: 'Career',
                context: 'career',
                question: 'Where should I place my energy for the rest of this year?',
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

                    <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(330px,0.92fr)]">
                        <section className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-12">
                            <div className="mb-10 flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-3">
                                <span className="text-[11px] uppercase tracking-[0.28em] text-white/48">
                                    {isKo ? 'CosmicPath Decision Note room' : 'CosmicPath Decision Note room'}
                                </span>
                                <span className="text-[11px] uppercase tracking-[0.24em] text-acc-gold/72">
                                    {isKo ? '첫 판정은 무료' : 'First verdict free'}
                                </span>
                            </div>

                            <h1 className="max-w-3xl break-keep font-cinzel text-[36px] leading-[1.08] text-starlight sm:text-6xl lg:text-[72px]">
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
                                {isKo
                                    ? '사주로 구조를 보고, 점성으로 타이밍을 보고, 타로로 지금 질문의 즉각 신호를 확인해 하나의 질문을 판정합니다.'
                                    : "CosmicPath Decision Note cross-checks Saju structure, astrology timing, and tarot's immediate signal before naming the next move."}
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
                                className="group mt-10 grid min-h-[76px] w-full max-w-xl grid-cols-[58px_minmax(0,1fr)_64px] overflow-hidden border border-[#d7c59a]/55 bg-[#11100d]/42 text-starlight shadow-[0_24px_70px_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(255,255,255,0.025)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d7c59a] hover:bg-[#d7c59a]/[0.065]"
                            >
                                <span className="flex items-center justify-center border-r border-[#d7c59a]/18 font-cinzel text-sm text-[#d7c59a]/72">
                                    01
                                </span>
                                <span className="flex flex-col justify-center px-5 text-left sm:px-6">
                                    <span className="text-sm font-semibold tracking-[0.08em]">
                                        {isKo ? 'Decision Note 시작' : 'Open Decision Note'}
                                    </span>
                                    <span className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/38">
                                        {isKo ? '선택 질문 / 생년월일 / 선택 타로' : 'decision question / birth date / tarot'}
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
                                        ? '지금 늦추고 있는 질문 하나와 생년월일을 바탕으로 세 신호를 대조합니다.'
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
                                                <span className="px-4 text-xs leading-5 text-white/54 group-hover:text-moonlight">
                                                    {item.question}
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
