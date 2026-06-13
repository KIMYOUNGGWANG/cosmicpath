'use client';

import type { ReadingLanguage } from './types';

type TarotSubmitSectionProps = {
    readonly language: ReadingLanguage;
    readonly tarotLabel: string;
    readonly tarotSummary: string;
    readonly isLoading: boolean;
    readonly inviteCode?: string;
    readonly isSubmitDisabled: boolean;
};

export function TarotSubmitSection({
    language,
    tarotLabel,
    tarotSummary,
    isLoading,
    inviteCode,
    isSubmitDisabled,
}: TarotSubmitSectionProps) {
    const isEn = language === 'en';

    return (
        <div className="flex flex-col items-center justify-center gap-3 pt-1">
            <div className="w-full rounded-[18px] border border-[#d7c59a]/20 bg-[#0f1113] p-4 text-left md:max-w-2xl md:p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-acc-gold">
                            {tarotLabel}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/58">
                            {tarotSummary}
                        </p>
                    </div>
                    <span className="inline-flex items-center gap-2 border border-[#d7c59a]/18 bg-[#d7c59a]/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#d7c59a]/70">
                        <span className="h-px w-4 bg-[#d7c59a]/35" />
                        {isEn ? 'Tarot signal' : '타로 신호'}
                    </span>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`group relative grid w-full max-w-[380px] grid-cols-[72px_1fr_58px] overflow-hidden border border-[#d7c59a]/42 bg-[#0c0d0b] text-left text-starlight shadow-[0_22px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d7c59a]/72 hover:bg-[#11110e] md:w-[380px] ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
            >
                <span className="pointer-events-none absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#d7c59a]/28 bg-[#080806]" />
                <span className="pointer-events-none absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#d7c59a]/28 bg-[#080806]" />
                <span className="pointer-events-none absolute inset-x-4 top-2 h-px bg-[#d7c59a]/12 transition-colors group-hover:bg-[#d7c59a]/24" />
                <span className="relative flex min-h-[72px] flex-col items-center justify-center border-r border-[#d7c59a]/24 bg-[#d7c59a]/[0.08]">
                    <span className="font-cinzel text-[17px] leading-none text-[#d7c59a]">
                        {isLoading ? '…' : '01'}
                    </span>
                    <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-[#d7c59a]/62">
                        {isEn ? 'Free' : '무료'}
                    </span>
                </span>
                <span className="relative flex min-h-[72px] flex-col justify-center px-5 py-4">
                    <span className="text-[9px] font-bold uppercase tracking-[0.26em] text-[#d7c59a]/58">
                        {isEn ? 'First verdict' : '첫 판정'}
                    </span>
                    <span className="mt-1 font-cinzel text-base font-semibold tracking-[0.18em] text-starlight">
                        {isLoading
                            ? (isEn ? 'CALCULATING...' : 'CALCULATING...')
                            : (inviteCode
                                ? (isEn ? 'OPEN COMPATIBILITY' : '궁합 판정 열기')
                                : (isEn ? 'OPEN FIRST VERDICT' : '첫 판정 열기'))}
                    </span>
                </span>
                <span className="relative flex min-h-[72px] items-center justify-center border-l border-[#d7c59a]/24 bg-[#d7c59a]/[0.05] text-2xl text-[#d7c59a] transition-colors group-hover:bg-[#d7c59a]/[0.1]">
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
            </button>
            <p className="text-center text-[11px] uppercase tracking-[0.16em] text-white/38">
                {isEn
                    ? 'One intake opens the first verdict, evidence, and next action.'
                    : '한 번 입력하면 판정, 근거, 다음 행동이 먼저 열립니다.'}
            </p>
        </div>
    );
}
