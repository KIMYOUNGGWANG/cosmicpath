'use client';

import { motion } from 'framer-motion';
import {
    getOracleIntentLabel,
    getOraclePersona,
    ORACLE_CHARACTER_IDS,
    type OracleCharacterId,
    type OraclePersonaProfile,
    type OracleQuestionIntent,
} from '@/lib/ai/oracle-personas';
import { OracleSelectCard } from '@/components/reading/OracleSelectCard';
import { sectionShellClass } from './constants';
import type { AlternativeGuideOption, ReadingLanguage, ReadingSelectionMode } from './types';

type GuideSelectionSectionProps = {
    readonly language: ReadingLanguage;
    readonly selectionMode: ReadingSelectionMode;
    readonly routePersona: OraclePersonaProfile;
    readonly inferredQuestionIntent: OracleQuestionIntent;
    readonly selectedCharacterId: OracleCharacterId;
    readonly recommendedCharacterId: OracleCharacterId;
    readonly isUsingRecommendedGuide: boolean;
    readonly guideFitCopy: string;
    readonly guideStrengths: readonly string[];
    readonly showAllGuides: boolean;
    readonly alternativeGuides: readonly AlternativeGuideOption[];
    readonly onOpenGuideSelection: () => void;
    readonly onCloseGuideSelection: () => void;
    readonly onGuideSelect: (id: OracleCharacterId) => void;
};

export function GuideSelectionSection({
    language,
    selectionMode,
    routePersona,
    inferredQuestionIntent,
    selectedCharacterId,
    recommendedCharacterId,
    isUsingRecommendedGuide,
    guideFitCopy,
    guideStrengths,
    showAllGuides,
    alternativeGuides,
    onOpenGuideSelection,
    onCloseGuideSelection,
    onGuideSelect,
}: GuideSelectionSectionProps) {
    const isEn = language === 'en';

    return (
        <div className={sectionShellClass}>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <label className="block text-xs uppercase tracking-widest text-acc-gold">
                        {isEn ? 'Recommended Lens' : '이번 질문의 정리 관점'}
                    </label>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/40">
                        {isEn
                            ? 'Reads the overall flow and points to the single most important path right now.'
                            : '질문 전체의 흐름을 읽고, 지금 가장 먼저 정리해야 할 기준을 잡아줍니다.'}
                    </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                    {selectionMode === 'auto'
                        ? (isEn ? 'Best Match First' : '기본은 추천 가이드')
                        : (isEn ? 'Custom Guide On' : '직접 고른 가이드')}
                </span>
            </div>

            <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4 md:p-5">
                <div className="flex flex-col gap-5">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-acc-gold/25 bg-acc-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-acc-gold">
                                {routePersona.name}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
                                {getOracleIntentLabel(inferredQuestionIntent, language)}
                            </span>
                        </div>

                        <p className="mt-3 text-sm uppercase tracking-[0.22em] text-white/40">
                            {isEn ? routePersona.titleEn : routePersona.titleKo}
                        </p>

                        <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.04] p-4 md:p-5">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
                                {isUsingRecommendedGuide
                                    ? (isEn ? 'Why this guide came first' : '왜 이 가이드가 먼저 나왔을까요')
                                    : (isEn ? 'What changes with this guide' : '이 가이드로 바꾸면')}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/72">
                                {guideFitCopy}
                            </p>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-white/68">
                            {isEn ? routePersona.descriptionEn : routePersona.descriptionKo}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {guideStrengths.slice(0, 2).map((strength) => (
                                <p
                                    key={strength}
                                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-white/55"
                                >
                                    {strength}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="mt-2 flex flex-col gap-4 rounded-[18px] border border-white/10 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between">
                        <p className="text-[11px] leading-5 text-white/45 md:max-w-[65%]">
                            {isEn
                                ? 'Keep the best match, or open the full list below when you want another reading style.'
                                : '추천 가이드를 그대로 써도 되고, 원하면 아래 전체 목록에서 다른 가이드로 바꿀 수 있습니다.'}
                        </p>
                        <button
                            type="button"
                            onClick={onOpenGuideSelection}
                            className="min-h-[44px] whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.22em] text-white/78 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
                        >
                            {isEn ? 'See All Guides' : '전체 가이드 보기'}
                        </button>
                    </div>
                </div>
            </div>

            {showAllGuides ? (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 md:p-5"
                >
                    <div className="mb-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                            {isEn ? 'All Guides' : '전체 가이드 목록'}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/58">
                            {isEn
                                ? 'The guide changes how the question is read. Pick any guide you want.'
                                : '가이드는 결과 말투가 아니라 질문을 읽는 관점을 바꿉니다. 원하는 시선으로 직접 골라보세요.'}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {ORACLE_CHARACTER_IDS.map((id) => {
                            const persona = getOraclePersona(id);
                            return (
                                <OracleSelectCard
                                    key={id}
                                    language={language}
                                    persona={persona}
                                    selected={selectedCharacterId === id}
                                    recommended={recommendedCharacterId === id}
                                    onSelect={() => onGuideSelect(id)}
                                />
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        onClick={onCloseGuideSelection}
                        className="mt-4 w-full rounded-full border border-white/15 bg-white/[0.03] px-4 py-3 text-xs uppercase tracking-[0.22em] text-white/62 hover:bg-white/[0.06] hover:text-white"
                    >
                        {isEn ? 'Show Less' : '목록 접기'}
                    </button>
                </motion.div>
            ) : alternativeGuides.length > 0 ? (
                <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 md:p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                                {isEn ? 'Other guides you can try fast' : '다른 가이드도 바로 바꿔볼 수 있어요'}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/58">
                                {isEn
                                    ? 'If the default guide feels slightly off, switch with one tap before you even open the full list.'
                                    : '기본 추천이 조금 다르게 느껴지면, 전체 목록을 열기 전에도 여기서 바로 바꿔볼 수 있습니다.'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {alternativeGuides.map(({ id, persona, strength }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => onGuideSelect(id)}
                                className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-left transition-all hover:border-white/25 hover:bg-white/[0.04]"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/75">
                                        {persona.name}
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/45">
                                        {getOracleIntentLabel(persona.specialty, language)}
                                    </span>
                                    {id === recommendedCharacterId ? (
                                        <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-acc-gold">
                                            {isEn ? 'Default Pick' : '기본 추천'}
                                        </span>
                                    ) : null}
                                </div>

                                <p className="mt-3 text-sm uppercase tracking-[0.22em] text-white/40">
                                    {isEn ? persona.titleEn : persona.titleKo}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-white/64">
                                    {strength}
                                </p>
                                <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/45">
                                    {isEn ? 'Tap to switch to this guide' : '누르면 이 가이드로 바로 바뀝니다'}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
