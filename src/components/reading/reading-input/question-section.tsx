'use client';

import type { RefObject } from 'react';
import type { ReadingContext } from '@/lib/ai/prompt-builder';
import { READING_CONTEXTS } from '@/components/reading/intake/reading-context-options';
import { sectionShellClass } from './constants';
import type { ReadingLanguage } from './types';

type QuestionSectionProps = {
    readonly language: ReadingLanguage;
    readonly questionLabel: string;
    readonly questionEyebrow: string;
    readonly context: ReadingContext;
    readonly activeContextLabel: string;
    readonly routePersonaName: string;
    readonly intentLabel: string;
    readonly question: string;
    readonly questionPlaceholder: string;
    readonly questionSuggestions: readonly string[];
    readonly isRelationshipContactEntry: boolean;
    readonly questionFieldRef: RefObject<HTMLTextAreaElement | null>;
    readonly scenarioA?: string;
    readonly scenarioB?: string;
    readonly onContextSelect: (context: ReadingContext) => void;
    readonly onQuestionChange: (question: string) => void;
    readonly onSuggestionSelect: (suggestion: string) => void;
    readonly onScenarioAChange?: (val: string) => void;
    readonly onScenarioBChange?: (val: string) => void;
};

export function QuestionSection({
    language,
    questionLabel,
    questionEyebrow,
    context,
    activeContextLabel,
    routePersonaName,
    intentLabel,
    question,
    questionPlaceholder,
    questionSuggestions,
    isRelationshipContactEntry,
    questionFieldRef,
    scenarioA = '',
    scenarioB = '',
    onContextSelect,
    onQuestionChange,
    onSuggestionSelect,
    onScenarioAChange,
    onScenarioBChange,
}: QuestionSectionProps) {
    const isEn = language === 'en';

    return (
        <div className={`${sectionShellClass} order-1`}>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <label className="block text-xs uppercase tracking-widest text-acc-gold">
                        {questionLabel}
                    </label>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                        {isRelationshipContactEntry
                            ? (isEn
                                ? 'Write the DM or relationship move you are considering. The first verdict separates contact, wait, narrow, or hold.'
                                : '고민 중인 DM이나 관계 행동을 적어주세요. 첫 판정은 연락, 대기, 축소, 보류 중 어디에 가까운지부터 분리합니다.')
                            : (isEn
                                ? 'Choose the area, then write the question. The first verdict turns it into move, wait, narrow, or stop.'
                                : '영역을 고르고 질문을 적어주세요. 첫 판정은 움직일지, 기다릴지, 좁힐지, 멈출지부터 답합니다.')}
                    </p>
                </div>
                <span className="border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                    {questionEyebrow}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 md:mt-5 md:grid-cols-3">
                {READING_CONTEXTS.map((contextOption) => {
                    const isSelected = context === contextOption.value;
                    return (
                        <button
                            key={contextOption.value}
                            type="button"
                            onClick={() => onContextSelect(contextOption.value)}
                            className={`rounded-[18px] border px-3 py-3 text-left transition-all duration-300 md:rounded-[20px] md:px-4 ${
                                isSelected
                                    ? 'border-acc-gold bg-acc-gold/10 shadow-[0_0_30px_rgba(212,175,55,0.12)]'
                                    : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                            }`}
                        >
                            <p className="hidden text-[10px] uppercase tracking-[0.24em] text-white/38 md:block">
                                {isEn ? contextOption.eyebrowEn : contextOption.eyebrowKo}
                            </p>
                            <h3 className={`font-cinzel text-[13px] leading-5 md:mt-2 md:text-base ${isSelected ? 'text-acc-gold' : 'text-starlight'}`}>
                                {isEn ? contextOption.labelEn : contextOption.labelKo}
                            </h3>
                        </button>
                    );
                })}
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4 md:p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-acc-gold">
                        {activeContextLabel}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                        {routePersonaName}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                        {intentLabel}
                    </span>
                </div>

                <label className="mt-4 block text-xs uppercase tracking-[0.24em] text-white/38">
                    {isEn ? 'Your Real Question' : '지금 제일 걸리는 질문'}
                </label>
                <textarea
                    ref={questionFieldRef}
                    value={question}
                    onChange={(event) => onQuestionChange(event.target.value)}
                    placeholder={questionPlaceholder}
                    required
                    className="mt-3 h-24 w-full resize-none rounded-[20px] border border-white/20 bg-white/5 p-4 text-base leading-relaxed text-starlight transition-colors placeholder:text-white/30 focus:border-acc-gold/80 focus:bg-white/10 focus:outline-none md:text-sm"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                    {questionSuggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => onSuggestionSelect(suggestion)}
                            className="min-h-[36px] rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-left text-[11px] leading-5 text-white/68 transition-all hover:border-white/28 hover:text-white"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-[11px] leading-5 text-white/38">
                    {isRelationshipContactEntry
                        ? (isEn
                            ? 'Concrete context produces a sharper contact direction, cleaner evidence, and a safer message boundary.'
                            : '상황이 구체적일수록 연락 방향, 근거 요약, 다음 연락 행동이 더 안전하고 선명해집니다.')
                        : (isEn
                            ? 'Concrete questions produce sharper notes, cleaner evidence, and a more useful action window.'
                            : '질문이 구체적일수록 방향, 근거, 행동 시점이 훨씬 선명해집니다.')}
                </p>

                {/* A vs B 의사결정 시나리오 입력 필드 */}
                <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-acc-gold">
                            {isEn ? 'Scenario Comparison (Optional)' : 'A vs B 선택지 비교 (선택)'}
                        </label>
                        <span className="text-[10px] text-white/40">
                            {isEn ? 'Compare two paths' : '두 가지 경로를 교차 검증'}
                        </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-acc-gold/90">
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-acc-gold/20 font-bold">A</span>
                                <span>{isEn ? 'Option A' : 'A안 (선택 1)'}</span>
                            </div>
                            <input
                                type="text"
                                value={scenarioA}
                                onChange={(e) => onScenarioAChange?.(e.target.value)}
                                placeholder={isEn ? 'e.g. Accept new job offer' : '예: 이직 제안 수락, 이직 실행'}
                                className="mt-1.5 block min-h-[42px] w-full rounded-[14px] border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm text-starlight transition-colors placeholder:text-white/25 focus:border-acc-gold/70 focus:bg-white/[0.08] focus:outline-none"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-sky-400/90">
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-400/20 font-bold">B</span>
                                <span>{isEn ? 'Option B' : 'B안 (선택 2)'}</span>
                            </div>
                            <input
                                type="text"
                                value={scenarioB}
                                onChange={(e) => onScenarioBChange?.(e.target.value)}
                                placeholder={isEn ? 'e.g. Stay at current company' : '예: 현 직장 잔류, 기존 프로젝트 유지'}
                                className="mt-1.5 block min-h-[42px] w-full rounded-[14px] border border-white/15 bg-white/[0.04] px-3.5 py-2 text-sm text-starlight transition-colors placeholder:text-white/25 focus:border-acc-gold/70 focus:bg-white/[0.08] focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
