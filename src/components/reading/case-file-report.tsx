'use client';

import { ArrowRight, Lock } from 'lucide-react';
import type { PremiumReportData } from './premium-report';

type TarotCard = {
    readonly name: string;
    readonly isReversed?: boolean;
};

type CaseFileReportProps = {
    readonly report: PremiumReportData;
    readonly language?: 'ko' | 'en';
    readonly isFreeView?: boolean;
    readonly isLoading?: boolean;
    readonly onRetry?: () => void;
    readonly onUnlock?: (source?: string) => void;
    readonly onOpenTarotCard?: (index: number) => void;
    readonly tarotCards?: readonly TarotCard[];
    readonly displayPrice?: string;
    readonly personName?: string;
    readonly question?: string;
};

type EvidenceItem = {
    readonly label: string;
    readonly title: string;
    readonly body: string;
};

type TimelineItem = {
    readonly marker: string;
    readonly title: string;
    readonly body: string;
    readonly score?: number;
};

const CHAPTERS_KO = ['판정', '사주', '점성', '타로', '타이밍', '실행'];
const CHAPTERS_EN = ['Verdict', 'Saju', 'Astro', 'Tarot', 'Timing', 'Action'];

function compactText(value: string | undefined, fallback: string, limit = 210) {
    const text = value?.trim() || fallback;

    if (text.length <= limit) return text;
    return `${text.slice(0, limit).trim()}...`;
}

function buildEvidence(report: PremiumReportData, isEn: boolean): readonly EvidenceItem[] {
    return [
        {
            label: isEn ? '01 / Saju' : '01 / 사주',
            title: isEn ? 'Foundation' : '기질과 구조',
            body: compactText(
                report.final_verdict?.saju_foundation || report.saju_sections?.[0]?.content,
                isEn ? 'Your birth structure sets the baseline for this decision.' : '사주는 이번 선택에서 반복되는 기질과 구조를 보여줍니다.'
            ),
        },
        {
            label: isEn ? '02 / Astrology' : '02 / 점성술',
            title: isEn ? 'Current Weather' : '현재의 기상도',
            body: compactText(
                report.final_verdict?.astro_support || report.astro_deep?.sun_moon_dynamic?.content,
                isEn ? 'The sky layer clarifies when the pressure rises or releases.' : '점성술은 압력이 높아지는 시점과 풀리는 리듬을 보완합니다.'
            ),
        },
        {
            label: isEn ? '03 / Tarot' : '03 / 타로',
            title: isEn ? 'Near-term Signal' : '가까운 신호',
            body: compactText(
                report.final_verdict?.tarot_insight || report.tarot_details?.[0]?.interpretation,
                isEn ? 'Tarot reads the immediate emotional signal around the question.' : '타로는 지금 질문 주변의 즉각적인 심리 신호를 잡아냅니다.'
            ),
        },
    ];
}

function buildTimeline(report: PremiumReportData, isEn: boolean): readonly TimelineItem[] {
    const monthlyLuck = report.fortune_flow?.monthly_luck?.slice(0, 6).map((item) => ({
        marker: item.month,
        title: item.theme,
        body: item.advice || item.opportunity || item.warning || '',
        score: item.score,
    }));

    if (monthlyLuck?.length) return monthlyLuck;

    const monthlyHighlights = report.fortune_flow?.monthly_highlights?.slice(0, 6).map((item) => ({
        marker: item.month,
        title: item.theme,
        body: item.advice,
    }));

    if (monthlyHighlights?.length) return monthlyHighlights;

    return [
        {
            marker: isEn ? 'Major' : '대운',
            title: report.fortune_flow?.major_luck?.title || (isEn ? 'Long Cycle' : '큰 흐름'),
            body: compactText(report.fortune_flow?.major_luck?.content, isEn ? 'Read the larger cycle before forcing a move.' : '큰 흐름을 먼저 보고 움직임의 강도를 조절해야 합니다.'),
        },
        {
            marker: isEn ? 'Year' : '세운',
            title: report.fortune_flow?.yearly_luck?.title || (isEn ? 'This Year' : '올해 흐름'),
            body: compactText(report.fortune_flow?.yearly_luck?.content, isEn ? 'This year asks for cleaner priorities.' : '올해는 우선순위를 더 선명하게 정리해야 풀립니다.'),
        },
    ];
}

function buildActions(report: PremiumReportData, isEn: boolean): readonly string[] {
    if (report.final_verdict?.action_priorities?.length) {
        return report.final_verdict.action_priorities.slice(0, 4);
    }

    if (report.action_plan?.length) {
        return report.action_plan.slice(0, 4).map((item) => `${item.title}: ${item.description}`);
    }

    return [
        report.free_focus?.first_action || (isEn ? 'Choose one concrete next move and make it measurable.' : '가장 작은 다음 행동 하나를 수치로 정해 실행하세요.'),
        report.free_focus?.avoid || (isEn ? 'Do not add more choices before the first signal returns.' : '첫 신호가 돌아오기 전까지 선택지를 더 늘리지 마세요.'),
    ];
}

type ConvergenceLevel = NonNullable<NonNullable<PremiumReportData['final_verdict']>['convergence_diagnosis']>['level'];

function getConvergenceLevelLabel(level: ConvergenceLevel, isEn: boolean): string {
    const labels = {
        all_aligned: isEn ? 'All aligned' : '세 원천 일치',
        two_aligned: isEn ? 'Two aligned' : '두 원천 정렬',
        divergent: isEn ? 'Divergent' : '조건부 판정',
    } as const;

    return labels[level];
}

export function CaseFileReport({
    report,
    language = 'ko',
    isFreeView = false,
    isLoading = false,
    onRetry,
    onUnlock,
    onOpenTarotCard,
    tarotCards = [],
    displayPrice,
    personName,
    question,
}: CaseFileReportProps) {
    const isEn = language === 'en';
    const chapters = isEn ? CHAPTERS_EN : CHAPTERS_KO;
    const evidence = buildEvidence(report, isEn);
    const timeline = buildTimeline(report, isEn);
    const actions = buildActions(report, isEn);
    const trustPercent = Math.round((report.summary.trust_score || 0) * 20);
    const verdictTitle = report.final_verdict?.title || report.summary.title;
    const verdictBody = report.final_verdict?.core_message || report.summary.content;
    const closingWords = report.final_verdict?.closing_words || report.summary.trust_reason;
    const displayQuestion = question || report.free_focus?.delayed_choice;
    const convergence = report.final_verdict?.convergence_diagnosis;

    return (
        <section className="mx-auto mt-4 max-w-7xl border border-white/12 bg-[#0c0b09] text-stone-100 shadow-[0_32px_90px_rgba(0,0,0,0.34)]">
            <div className="grid lg:grid-cols-[148px_1fr]">
                <aside className="hidden border-r border-white/10 bg-[#11100d] px-5 py-8 lg:block">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c8a84d]">
                        {isEn ? 'Case File' : '상세 판정문'}
                    </p>
                    <nav className="mt-10 space-y-5">
                        {chapters.map((chapter, index) => (
                            <a key={chapter} href={`#case-file-${index}`} className="block border-l border-white/12 pl-3 text-[11px] uppercase tracking-[0.2em] text-stone-500 transition hover:border-[#c8a84d] hover:text-[#c8a84d]">
                                {chapter}
                            </a>
                        ))}
                    </nav>
                </aside>

                <div className="min-w-0">
                    <header id="case-file-0" className="border-b border-white/10 px-5 py-7 md:px-10 md:py-10">
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#c8a84d]">
                                    {isEn ? 'Three-layer verdict' : '사주 + 점성술 + 타로 3단 판정'}
                                </p>
                                <h1 className="mt-4 font-cinzel text-3xl font-semibold leading-tight text-stone-50 md:text-5xl">
                                    {verdictTitle}
                                </h1>
                                <p className="mt-5 text-lg leading-8 text-stone-300 md:text-xl">
                                    {isLoading ? (isEn ? 'Compiling the final case file...' : '최종 판정문을 정리하는 중입니다...') : verdictBody}
                                </p>
                            </div>
                            <div className="grid min-w-[168px] grid-cols-2 border border-white/12 text-center md:grid-cols-1">
                                <div className="border-r border-white/12 px-4 py-4 md:border-b md:border-r-0">
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">{isEn ? 'Trust' : '신뢰도'}</p>
                                    <p className="mt-2 font-cinzel text-3xl text-[#c8a84d]">{trustPercent}%</p>
                                </div>
                                <div className="px-4 py-4">
                                    <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">{isEn ? 'Sources' : '원천'}</p>
                                    <p className="mt-2 font-cinzel text-3xl text-stone-100">3</p>
                                </div>
                            </div>
                        </div>
                        {(personName || displayQuestion) && (
                            <div className="mt-8 grid gap-px bg-white/10 text-sm md:grid-cols-2">
                                <div className="bg-[#0c0b09] px-4 py-3 text-stone-400">{isEn ? 'Subject' : '대상'} · {personName || (isEn ? 'Private reading' : '개인 리딩')}</div>
                                <div className="bg-[#0c0b09] px-4 py-3 text-stone-400">{isEn ? 'Question' : '질문'} · {displayQuestion || (isEn ? 'Current season' : '현재 흐름')}</div>
                            </div>
                        )}
                        <p className="mt-5 border-l border-[#c8a84d]/40 pl-3 text-xs leading-5 text-stone-500">
                            {isEn
                                ? 'Professional-boundary areas are framed as documents, deadlines, questions, risk buffers, and qualified consultation checkpoints.'
                                : '전문 자격이 필요한 비자·법률·세금·재무 영역은 문서·마감·질문·리스크 버퍼·전문가 상담 체크포인트로만 정리합니다.'}
                        </p>
                        {convergence && (
                            <div className="mt-8 grid gap-px bg-[#c8a84d]/20 md:grid-cols-[180px_1fr_1fr]">
                                <div className="bg-[#11100d] px-4 py-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c8a84d]">{isEn ? 'Convergence' : '3단 수렴도'}</p>
                                    <p className="mt-2 font-cinzel text-xl text-stone-100">{getConvergenceLevelLabel(convergence.level, isEn)}</p>
                                    <p className="mt-2 text-xs leading-5 text-stone-500">{convergence.conflict_note}</p>
                                </div>
                                <div className="bg-[#0c0b09] px-4 py-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">{isEn ? 'Shared Signal' : '공통 신호'}</p>
                                    <p className="mt-2 text-sm leading-6 text-stone-300">{convergence.shared_signal}</p>
                                </div>
                                <div className="bg-[#0c0b09] px-4 py-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500">{isEn ? 'Decision Rule' : '판정 규칙'}</p>
                                    <p className="mt-2 text-sm leading-6 text-stone-300">{convergence.decision_rule}</p>
                                </div>
                            </div>
                        )}
                    </header>

                    <div className="grid gap-px bg-white/10 md:grid-cols-3">
                        {evidence.map((item, index) => (
                            <article key={item.label} id={`case-file-${index + 1}`} className="bg-[#0c0b09] px-5 py-7 md:px-7">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c8a84d]">{item.label}</p>
                                <h2 className="mt-4 font-cinzel text-2xl text-stone-100">{item.title}</h2>
                                <p className="mt-4 leading-7 text-stone-400">{item.body}</p>
                                {index === 2 && tarotCards.length > 0 && (
                                    <button onClick={() => onOpenTarotCard?.(0)} className="mt-5 inline-flex items-center gap-2 border-b border-[#c8a84d]/50 pb-1 text-sm text-[#c8a84d] transition hover:border-[#c8a84d]">
                                        {tarotCards[0]?.name} <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </article>
                        ))}
                    </div>

                    <section id="case-file-4" className="grid gap-px bg-white/10 lg:grid-cols-[1fr_360px]">
                        <div className="bg-[#0c0b09] px-5 py-8 md:px-10">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#c8a84d]">{isEn ? 'Timing Ledger' : '하반기 타이밍 장부'}</p>
                            <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                                {timeline.map((item) => (
                                    <div key={`${item.marker}-${item.title}`} className="grid gap-3 py-4 md:grid-cols-[88px_1fr_54px] md:items-start">
                                        <p className="font-cinzel text-lg text-[#c8a84d]">{item.marker}</p>
                                        <div>
                                            <h3 className="font-medium text-stone-100">{item.title}</h3>
                                            <p className="mt-1 text-sm leading-6 text-stone-400">{item.body}</p>
                                        </div>
                                        {typeof item.score === 'number' && <p className="text-right font-cinzel text-xl text-stone-300">{item.score}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <aside id="case-file-5" className="bg-[#11100d] px-5 py-8 md:px-7">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#c8a84d]">{isEn ? 'Action Order' : '실행 순서'}</p>
                            <ol className="mt-6 space-y-4">
                                {actions.map((action, index) => (
                                    <li key={`${index}-${action}`} className="grid grid-cols-[28px_1fr] gap-3 text-sm leading-6 text-stone-300">
                                        <span className="font-cinzel text-[#c8a84d]">{String(index + 1).padStart(2, '0')}</span>
                                        <span>{action}</span>
                                    </li>
                                ))}
                            </ol>
                            <p className="mt-8 border-t border-white/10 pt-5 text-sm leading-6 text-stone-500">{closingWords}</p>
                        </aside>
                    </section>

                    {isFreeView && (
                        <div className="border-t border-[#c8a84d]/25 bg-[#18150d] px-5 py-5 md:px-10">
                            <button onClick={() => onUnlock?.('case_file_locked_evidence')} className="flex w-full flex-col gap-3 text-left md:flex-row md:items-center md:justify-between">
                                <span className="inline-flex items-center gap-3 text-sm text-stone-300">
                                    <Lock className="h-4 w-4 text-[#c8a84d]" />
                                    {isEn ? 'Open the full evidence file, risk notes, and timing detail.' : '전체 근거 파일, 리스크 메모, 세부 타이밍을 열어보세요.'}
                                </span>
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#c8a84d]">
                                    {displayPrice || (isEn ? 'Unlock report' : '상세 리포트 열기')} <ArrowRight className="h-4 w-4" />
                                </span>
                            </button>
                        </div>
                    )}

                    {onRetry && (
                        <div className="border-t border-white/10 px-5 py-5 md:px-10">
                            <button onClick={onRetry} className="text-sm text-stone-500 underline decoration-white/20 underline-offset-4 transition hover:text-stone-200">
                                {isEn ? 'Refresh missing premium sections' : '누락된 상세 섹션 다시 생성하기'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
