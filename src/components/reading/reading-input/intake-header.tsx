'use client';

import Link from 'next/link';
import { PRIMARY_ENGLISH_GUIDE_HREF } from '@/components/reading/intake/reading-context-options';
import type { ReadingLanguage } from './types';

type IntakeHeaderProps = {
    readonly language: ReadingLanguage;
    readonly sequenceLabel: string;
    readonly sequenceSummary: string;
    readonly isRelationshipContactEntry: boolean;
    readonly onLanguageSelect: (language: ReadingLanguage) => void;
};

export function IntakeHeader({
    language,
    sequenceLabel,
    sequenceSummary,
    isRelationshipContactEntry,
    onLanguageSelect,
}: IntakeHeaderProps) {
    const isEn = language === 'en';

    return (
        <div className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs uppercase tracking-widest text-dim">
                    {sequenceLabel}
                </span>
                <div className="flex gap-4 font-mono text-xs">
                    <button
                        type="button"
                        onClick={() => onLanguageSelect('ko')}
                        className={`transition-colors ${language === 'ko' ? 'text-acc-gold' : 'text-dim hover:text-white'}`}
                    >
                        KR
                    </button>
                    <span className="text-dim">/</span>
                    <button
                        type="button"
                        onClick={() => onLanguageSelect('en')}
                        className={`transition-colors ${language === 'en' ? 'text-acc-gold' : 'text-dim hover:text-white'}`}
                    >
                        EN
                    </button>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-[#d7c59a]/18 bg-[#0f1113] p-4 md:mt-5 md:flex-row md:items-end md:justify-between md:p-5">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="border border-[#d7c59a]/25 bg-[#d7c59a]/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#d7c59a]">
                            {isEn ? 'First verdict free' : '첫 판정 무료'}
                        </span>
                        <span className="border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                            {sequenceSummary}
                        </span>
                    </div>
                    <p className="mt-2 break-keep text-sm leading-6 text-white/62">
                        {isRelationshipContactEntry
                            ? (isEn
                                ? 'Ask the contact-or-wait decision first. Birth date is required; name, time, city, gender, partner details, and tarot calibrate precision.'
                                : '연락할지 기다릴지 먼저 적어주세요. 생년월일만 필수입니다. 나머지 입력은 정밀도를 보정합니다.')
                            : (isEn
                                ? 'Ask one real question. Birth date is required; name, birth time, city, gender, and tarot calibrate precision.'
                                : '질문 하나를 적어주세요. 생년월일만 필수입니다. 나머지 입력은 정밀도를 보정합니다.')}
                    </p>
                </div>
                {isEn ? (
                    <Link
                        href={PRIMARY_ENGLISH_GUIDE_HREF}
                        className="text-[11px] uppercase tracking-[0.24em] text-white/58 transition-colors hover:text-white"
                    >
                        New here? Read the quick guide
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
