'use client';

import { motion } from 'framer-motion';
import { sectionShellClass } from './constants';
import { formatDateInput, formatTimeInput } from './formatters';
import type { ReadingGender, ReadingLanguage } from './types';

type PartnerInformationSectionProps = {
    readonly language: ReadingLanguage;
    readonly showPrecisionFields: boolean;
    readonly showPartnerInfo: boolean;
    readonly partnerName: string;
    readonly partnerBirthDate: string;
    readonly partnerBirthTime: string;
    readonly partnerGender: ReadingGender;
    readonly onTogglePrecisionFields: () => void;
    readonly onTogglePartnerInfo: () => void;
    readonly onPartnerNameChange: (name: string) => void;
    readonly onPartnerBirthDateChange: (birthDate: string) => void;
    readonly onPartnerBirthTimeChange: (birthTime: string) => void;
    readonly onPartnerGenderChange: (gender: ReadingGender) => void;
};

export function PartnerInformationSection({
    language,
    showPrecisionFields,
    showPartnerInfo,
    partnerName,
    partnerBirthDate,
    partnerBirthTime,
    partnerGender,
    onTogglePrecisionFields,
    onTogglePartnerInfo,
    onPartnerNameChange,
    onPartnerBirthDateChange,
    onPartnerBirthTimeChange,
    onPartnerGenderChange,
}: PartnerInformationSectionProps) {
    const isEn = language === 'en';

    return (
        <>
            <div className="mt-5">
                <button
                    type="button"
                    onClick={onTogglePrecisionFields}
                    className="min-h-[48px] w-full rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.22em] text-white/72 transition-all hover:border-white/30 hover:text-white md:w-auto"
                >
                    {showPrecisionFields
                        ? (isEn ? 'Hide Relationship Inputs' : '상대 정보 닫기')
                        : (isEn ? 'Open Relationship Inputs' : '상대 정보 열기')}
                </button>
            </div>

            {showPrecisionFields ? (
                <div className={`${sectionShellClass} order-3`}>
                    <div className="mb-4 flex items-center justify-between">
                        <label className="block text-xs uppercase tracking-widest text-acc-gold">
                            {isEn ? 'Partner Information (Optional)' : '상대 정보 (선택)'}
                        </label>
                        <button
                            type="button"
                            onClick={onTogglePartnerInfo}
                            className={`text-xs uppercase tracking-widest transition-colors ${
                                showPartnerInfo ? 'text-acc-gold' : 'text-dim hover:text-moonlight'
                            }`}
                        >
                            {showPartnerInfo ? (isEn ? 'Hide' : '접기') : (isEn ? 'Expand' : '펼치기')}
                        </button>
                    </div>

                    {showPartnerInfo ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-5 rounded-[22px] border border-white/10 bg-white/[0.03] p-4 md:p-5"
                        >
                            <p className="text-xs leading-6 text-white/52">
                                {isEn
                                    ? "Add your partner's birth info if you want the compatibility or reunion layer to be grounded in both charts."
                                    : '궁합이나 재회 가능성을 두 사람의 차트 기준으로 읽고 싶다면 상대방 정보까지 함께 넣어주세요.'}
                            </p>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <input
                                    type="text"
                                    value={partnerName}
                                    onChange={(event) => onPartnerNameChange(event.target.value)}
                                    placeholder={isEn ? "Partner's name" : '상대방 이름'}
                                    className="w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/20 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                                />

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onPartnerGenderChange('male')}
                                        className={`flex-1 rounded-[18px] border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                                            partnerGender === 'male'
                                                ? 'border-acc-gold bg-acc-gold/10 text-acc-gold'
                                                : 'border-white/15 bg-white/[0.03] text-white/62 hover:border-white/30 hover:text-white'
                                        }`}
                                    >
                                        {isEn ? 'Male' : '남성'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onPartnerGenderChange('female')}
                                        className={`flex-1 rounded-[18px] border px-4 py-3 text-sm uppercase tracking-[0.22em] transition-all ${
                                            partnerGender === 'female'
                                                ? 'border-acc-gold bg-acc-gold/10 text-acc-gold'
                                                : 'border-white/15 bg-white/[0.03] text-white/62 hover:border-white/30 hover:text-white'
                                        }`}
                                    >
                                        {isEn ? 'Female' : '여성'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={partnerBirthDate}
                                        onChange={(event) => onPartnerBirthDateChange(formatDateInput(event.target.value))}
                                        placeholder="YYYY-MM-DD"
                                        maxLength={10}
                                        className="w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 font-mono text-base text-starlight transition-colors placeholder:text-white/20 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                                    />
                                    <p className="mt-2 font-mono text-[10px] tracking-widest text-dim">
                                        {isEn ? "PARTNER'S BIRTH DATE" : '상대방 생년월일'}
                                    </p>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={partnerBirthTime}
                                        onChange={(event) => onPartnerBirthTimeChange(formatTimeInput(event.target.value))}
                                        placeholder="HH:MM"
                                        maxLength={5}
                                        className="w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 font-mono text-base text-starlight transition-colors placeholder:text-white/20 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                                    />
                                    <p className="mt-2 font-mono text-[10px] tracking-widest text-dim">
                                        {isEn ? "PARTNER'S BIRTH TIME" : '상대방 생시'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </div>
            ) : null}
        </>
    );
}
