'use client';

import Link from 'next/link';
import { ArrowLeft, Check, GitBranch, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    DECISION_REVIEW_STORAGE_KEY,
    parseDecisionReview,
    saveDecisionReview,
    type DecisionCertainty,
    type DecisionIntendedAction,
    type DecisionOutcome,
    type DecisionResolution,
    type DecisionReviewState,
} from '@/lib/decision-review';

const labels = {
    ko: {
        outcomes: { worked: '맞았음', partly: '부분적으로 맞음', did_not_work: '맞지 않았음' },
        certainty: { clear: '결과가 분명함', unknown: '아직 모르겠음' },
        resolution: { keep: '그대로 유지', adjust: '조정', close: '닫기' },
        actions: { contact_now: '연락하기', act_now: '작게 실행하기', wait: '기한을 두고 기다리기', reduce_scope: '선택지 좁히기', unsure: '아직 정하지 않음' },
    },
    en: {
        outcomes: { worked: 'Worked', partly: 'Partly worked', did_not_work: 'Did not work' },
        certainty: { clear: 'The outcome is clear', unknown: 'Still uncertain' },
        resolution: { keep: 'Keep', adjust: 'Adjust', close: 'Close' },
        actions: { contact_now: 'Contact them', act_now: 'Run a small test', wait: 'Wait with a deadline', reduce_scope: 'Narrow the options', unsure: 'Not decided yet' },
    },
} satisfies Record<'ko' | 'en', {
    outcomes: Record<DecisionOutcome, string>;
    certainty: Record<DecisionCertainty, string>;
    resolution: Record<DecisionResolution, string>;
    actions: Record<DecisionIntendedAction, string>;
}>;

export function DecisionReviewExperience() {
    const [reviewState, setReviewState] = useState<DecisionReviewState | null>(null);
    const [result, setResult] = useState<DecisionOutcome>('partly');
    const [certainty, setCertainty] = useState<DecisionCertainty>('unknown');
    const [resolution, setResolution] = useState<DecisionResolution | undefined>();
    const [saved, setSaved] = useState(false);
    const [fallbackLanguage, setFallbackLanguage] = useState<'ko' | 'en'>('ko');

    useEffect(() => {
        let isActive = true;

        queueMicrotask(() => {
            if (!isActive) return;
            try {
                setFallbackLanguage(localStorage.getItem('user_language') === 'en' ? 'en' : 'ko');
            } catch {
            }
            let raw: string | null = null;
            try {
                raw = localStorage.getItem(DECISION_REVIEW_STORAGE_KEY);
            } catch {
                setReviewState({ status: 'empty' });
                return;
            }
            const nextState = parseDecisionReview(raw);
            setReviewState(nextState);
            if (nextState.status === 'malformed' || nextState.status === 'expired') {
                try {
                    localStorage.removeItem(DECISION_REVIEW_STORAGE_KEY);
                } catch {
                }
            }
            if (nextState.status === 'active' && nextState.seed.outcome) {
                setResult(nextState.seed.outcome.result);
                setCertainty(nextState.seed.outcome.certainty);
                setResolution(nextState.seed.outcome.resolution);
            }
        });

        return () => { isActive = false; };
    }, []);

    if (!reviewState) {
        return <main className="min-h-screen bg-void" aria-busy="true" />;
    }

    if (reviewState.status === 'pending') {
        const isEn = (reviewState.seed.locale ?? fallbackLanguage) === 'en';
        const copy = labels[isEn ? 'en' : 'ko'];
        const dueDate = new Intl.DateTimeFormat(isEn ? 'en-US' : 'ko-KR', {
            month: 'long',
            day: 'numeric',
        }).format(new Date(reviewState.seed.followUpDueAt));

        return (
            <main className="flex min-h-screen items-center justify-center bg-void px-5 text-starlight">
                <section className="w-full max-w-xl border border-white/10 bg-white/[0.03] p-7 sm:p-10">
                    <div className="font-cinzel text-xs uppercase tracking-[0.26em] text-acc-gold">
                        Decision Review · {dueDate}
                    </div>
                    <h1 className="mt-4 break-keep text-3xl font-semibold">{isEn ? 'Check the outcome in 7 days' : '7일 뒤 결과를 확인하세요'}</h1>
                    <p className="mt-4 text-balance break-keep text-lg leading-8 text-white/82">
                        {reviewState.seed.question}
                    </p>
                    <p className="mt-3 text-sm text-acc-gold">{isEn ? 'Saved action' : '저장한 행동'} · {copy.actions[reviewState.seed.intendedAction]}</p>
                    <p className="mt-4 break-keep text-sm leading-7 text-white/58">
                        <span className="block">{isEn ? 'We will not add another interpretation before the outcome is visible.' : '결과가 보이기 전에는 해석을 더하지 않습니다.'}</span>
                        {isEn ? `Record what actually happened starting ${dueDate}.` : <><span className="whitespace-nowrap">{dueDate}부터</span> 실제 결과를 기록하세요.</>}
                    </p>
                    <Link
                        href="/"
                        className="mt-7 inline-flex min-h-11 items-center gap-2 border border-acc-gold/30 px-4 text-sm font-semibold text-acc-gold"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {isEn ? 'Back home' : '홈으로 돌아가기'}
                    </Link>
                </section>
            </main>
        );
    }

    if (reviewState.status !== 'active') {
        const isExpired = reviewState.status === 'expired';
        const isMalformed = reviewState.status === 'malformed';
        const isEn = fallbackLanguage === 'en';

        return (
            <main className="flex min-h-screen items-center justify-center bg-void px-5 text-starlight">
                <section className="w-full max-w-xl border border-white/10 bg-white/[0.03] p-7 sm:p-10">
                    <div className="font-cinzel text-xs uppercase tracking-[0.26em] text-acc-gold">
                        Decision Review
                    </div>
                    <h1 className="mt-4 break-keep text-3xl font-semibold">
                        {isExpired
                            ? (isEn ? 'The review window has expired' : '리뷰 기간이 지났습니다')
                            : isMalformed
                                ? (isEn ? 'The saved review is invalid' : '저장된 리뷰가 손상되었습니다')
                                : (isEn ? 'No saved decision review' : '저장된 결정 리뷰가 없습니다')}
                    </h1>
                    <p className="mt-4 break-keep text-sm leading-7 text-white/58">
                        {isExpired
                            ? (isEn ? 'We do not overwrite an old question with a new prediction. You can start a new note for your current situation.' : '지난 질문은 새 예측으로 덮지 않습니다. 지금 상황으로 새 노트를 시작할 수 있습니다.')
                            : isMalformed
                                ? (isEn ? 'Invalid or outdated data was not opened. Save the 7-day review again from the result page.' : '손상되거나 오래된 데이터는 열지 않았습니다. 결과 화면에서 7일 리뷰를 다시 저장해 주세요.')
                                : (isEn ? 'Save a 7-day review from a decision result to compare it with what actually happened.' : '결정 결과 화면에서 7일 리뷰를 저장하면 이곳에서 실제 결과를 비교할 수 있습니다.')}
                    </p>
                    <Link
                        href="/"
                        className="mt-7 inline-flex min-h-11 items-center gap-2 border border-acc-gold/30 px-4 text-sm font-semibold text-acc-gold"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {isEn ? 'Back home' : '홈으로 돌아가기'}
                    </Link>
                </section>
            </main>
        );
    }

    const saveOutcome = () => {
        const nextSeed = {
            ...reviewState.seed,
            outcome: {
                result,
                certainty,
                resolution,
                reviewedAt: new Date().toISOString(),
            },
        };

        if (saveDecisionReview(nextSeed)) {
            setReviewState({ status: 'active', seed: nextSeed });
            setSaved(true);
        }
    };

    const isEn = (reviewState.seed.locale ?? fallbackLanguage) === 'en';
    const copy = labels[isEn ? 'en' : 'ko'];
    const outcomeOptions = Object.entries(copy.outcomes) as [DecisionOutcome, string][];
    const certaintyOptions = Object.entries(copy.certainty) as [DecisionCertainty, string][];
    const resolutionOptions = Object.entries(copy.resolution) as [DecisionResolution, string][];

    return (
        <main className="min-h-screen bg-void px-5 py-10 text-starlight sm:py-16">
            <section className="mx-auto w-full max-w-3xl overflow-hidden border border-white/10 bg-white/[0.025] shadow-[0_28px_90px_rgba(0,0,0,0.36)]">
                <header className="border-b border-white/10 p-6 sm:p-9">
                    <div className="flex items-center gap-2 font-cinzel text-xs uppercase tracking-[0.26em] text-acc-gold">
                        <RotateCcw className="h-4 w-4" />
                        <span className="sm:hidden">Outcome Review</span>
                        <span className="hidden sm:inline">Outcome, not another prediction</span>
                    </div>
                    <h1 className="mt-4 break-keep text-3xl font-semibold sm:text-4xl">{isEn ? '7-Day Decision Review' : '7일 결정 리뷰'}</h1>
                    <p className="mt-3 break-keep text-sm leading-7 text-white/58">
                        {isEn ? 'Compare the action you chose with the actual outcome, without predicting the same question again.' : '같은 질문을 다시 점치지 않고, 내가 정한 행동과 실제 결과를 비교합니다.'}
                    </p>
                </header>

                <div className="grid gap-px bg-white/10 md:grid-cols-[0.9fr_1.1fr]">
                    <aside className="bg-[#0c0c0f] p-6 sm:p-8">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/38">Saved decision</div>
                        <p className="mt-4 text-balance break-keep text-lg leading-8 text-white/88 sm:text-xl">{reviewState.seed.question}</p>
                        <p className="mt-4 text-sm text-acc-gold">{isEn ? 'Saved action' : '저장한 행동'} · {copy.actions[reviewState.seed.intendedAction]}</p>
                        <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-6 text-white/48">
                            {isEn ? 'Record the 7-day experiment using observable facts. If it is too early to judge, mark it as uncertain.' : <>7일 실험 결과를 사실 기준으로 기록하세요. 아직 판단하기{' '}<span className="whitespace-nowrap">어렵다면</span> 그대로 표시해도 됩니다.</>}
                        </div>
                    </aside>

                    <div className="bg-[#101014] p-6 sm:p-8">
                        <fieldset>
                            <legend className="text-sm font-semibold text-white">{isEn ? 'What actually happened?' : '실제 결과는 어땠나요?'}</legend>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                {outcomeOptions.map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={result === value}
                                        onClick={() => { setResult(value); setSaved(false); }}
                                        className="min-h-11 whitespace-nowrap border border-white/12 px-2 text-xs text-white/68 aria-pressed:border-acc-gold/55 aria-pressed:bg-acc-gold/10 aria-pressed:text-acc-gold sm:px-3 sm:text-sm"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="mt-7">
                            <legend className="text-sm font-semibold text-white">{isEn ? 'Is the outcome clear enough?' : '결과가 충분히 보이나요?'}</legend>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {certaintyOptions.map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={certainty === value}
                                        onClick={() => { setCertainty(value); setSaved(false); }}
                                        className="min-h-11 border border-white/12 px-3 text-sm text-white/68 aria-pressed:border-acc-gold/55 aria-pressed:bg-acc-gold/10 aria-pressed:text-acc-gold"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="mt-7">
                            <legend className="text-sm font-semibold text-white">{isEn ? 'What will you do with this decision?' : '이 결정을 어떻게 다룰까요?'}</legend>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {resolutionOptions.map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={resolution === value}
                                        onClick={() => { setResolution(value); setSaved(false); }}
                                        className="min-h-11 border border-white/12 px-2 text-sm text-white/68 aria-pressed:border-acc-gold/55 aria-pressed:bg-acc-gold/10 aria-pressed:text-acc-gold"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <button
                            type="button"
                            onClick={saveOutcome}
                            className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-acc-gold px-5 text-sm font-bold text-black"
                        >
                            <Check className="h-4 w-4" />
                            {isEn ? 'Save review' : '리뷰 저장'}
                        </button>
                        {saved ? (
                            <p className="mt-3 text-center text-sm text-emerald-200">{isEn ? 'Review saved on this device.' : '리뷰가 이 기기에 저장되었습니다.'}</p>
                        ) : null}
                    </div>
                </div>

                <footer className="flex flex-col gap-3 border-t border-white/10 px-6 py-5 text-xs text-white/42 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <span className="inline-flex items-center gap-2"><GitBranch className="h-4 w-4" />{isEn ? 'Record the outcome without adding another prediction.' : '예측 추가 없이 결과만 기록합니다.'}</span>
                    <Link href="/" className="text-acc-gold">{isEn ? 'CosmicPath home' : 'CosmicPath 홈'}</Link>
                </footer>
            </section>
        </main>
    );
}
