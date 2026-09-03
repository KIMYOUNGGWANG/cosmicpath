'use client';

import { BIRTH_CITY_OPTIONS } from '@/lib/saju/city-options';
import { sectionShellClass } from './constants';
import { formatDateInput } from './formatters';
import { SegmentedChoice } from './segmented-choice';
import type { ReadingCalendarType, ReadingGender, ReadingLanguage } from './types';

type EssentialCoordinatesSectionProps = {
    readonly language: ReadingLanguage;
    readonly birthLabel: string;
    readonly birthEyebrow: string;
    readonly isNextMoveReportEntry: boolean;
    readonly isRelationshipContactEntry: boolean;
    readonly name: string;
    readonly birthDate: string;
    readonly birthTime: string;
    readonly calendarType: ReadingCalendarType;
    readonly unknownTime: boolean;
    readonly cityName: string;
    readonly gender: ReadingGender;
    readonly coreFieldsComplete: boolean;
    readonly coreSignals: readonly string[];
    readonly onNameChange: (name: string) => void;
    readonly onBirthDateChange: (birthDate: string) => void;
    readonly onBirthTimeChange: (birthTime: string) => void;
    readonly onCalendarTypeChange: (calendarType: ReadingCalendarType) => void;
    readonly onUnknownTimeChange: (unknownTime: boolean) => void;
    readonly onCityNameChange: (cityName: string) => void;
    readonly onGenderChange: (gender: ReadingGender) => void;
    readonly ziSiMode?: 'tongja' | 'yaja' | 'joja';
    readonly onZiSiModeChange?: (ziSiMode: 'tongja' | 'yaja' | 'joja') => void;
};

export function EssentialCoordinatesSection({
    language,
    birthLabel,
    birthEyebrow,
    isNextMoveReportEntry,
    isRelationshipContactEntry,
    name,
    birthDate,
    birthTime,
    calendarType,
    unknownTime,
    cityName,
    gender,
    coreFieldsComplete,
    coreSignals,
    onNameChange,
    onBirthDateChange,
    onBirthTimeChange,
    onCalendarTypeChange,
    onUnknownTimeChange,
    onCityNameChange,
    onGenderChange,
    ziSiMode,
    onZiSiModeChange,
}: EssentialCoordinatesSectionProps) {
    const isEn = language === 'en';

    const toggleUnknownTime = () => {
        const nextUnknown = !unknownTime;
        onUnknownTimeChange(nextUnknown);
        if (nextUnknown) onBirthTimeChange('12:00');
    };

    return (
        <div className={`${sectionShellClass} order-2`}>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <label className="block text-xs uppercase tracking-widest text-acc-gold">
                        {birthLabel}
                    </label>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                        {isNextMoveReportEntry
                            ? (isRelationshipContactEntry
                                ? (isEn
                                    ? 'Birth date is required for the contact verdict. Name, birth time, city, gender, and partner details calibrate precision.'
                                    : '연락 판정에도 생년월일은 필수입니다. 이름, 생시, 출생지, 성별, 상대 정보는 정밀도 보정 입력입니다.')
                                : (isEn
                                    ? 'Birth date is required for the first verdict. Name, birth time, city, and gender calibrate precision.'
                                    : '첫 판정에도 생년월일은 필수입니다. 이름, 생시, 출생지, 성별은 정밀도 보정 입력입니다.'))
                            : (isEn
                                ? 'For saju, astrology timing, numerology, and true-solar-time calibration, the first result can use your name, birth date, birth city, birth time, gender, and calendar.'
                                : '사주, 점성 타이밍, 수비학과 진태양시 보정을 함께 쓰기 때문에 이름, 생년월일, 출생 도시, 태어난 시간, 성별, 양력/음력을 함께 받을 수 있습니다.')}
                    </p>
                </div>
                <span className="border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45">
                    {birthEyebrow}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:mt-5 md:grid-cols-2">
                <div>
                    <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                        {isEn ? 'Name' : '이름'}
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => onNameChange(event.target.value)}
                        placeholder={isEn ? 'Name used for numerology' : '수비학에 반영할 이름'}
                        required={!isNextMoveReportEntry}
                        className="mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/25 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                    />
                    <p className="mt-2 text-[11px] leading-5 text-white/42">
                        {isEn
                            ? 'We use your name for the numerology layer and a more grounded reading voice.'
                            : '이름은 수비학 레이어와 결과 호칭에 함께 반영됩니다.'}
                    </p>
                </div>

                <div>
                    <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                        {isEn ? 'Birth Date' : '생년월일'}
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={birthDate}
                        onChange={(event) => onBirthDateChange(formatDateInput(event.target.value))}
                        placeholder="YYYY-MM-DD"
                        maxLength={10}
                        pattern="\d{4}-\d{2}-\d{2}"
                        required
                        className="mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 font-mono text-base text-starlight transition-colors placeholder:text-white/20 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                    />
                    <p className="mt-2 font-mono text-[10px] tracking-widest text-dim">YYYY-MM-DD</p>
                </div>

                <div>
                    <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                        {isEn ? 'Birth Time' : '태어난 시간'}
                    </label>
                    <input
                        type="time"
                        step={60}
                        value={birthTime}
                        onChange={(event) => onBirthTimeChange(event.target.value)}
                        disabled={unknownTime}
                        className={`mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none ${
                            unknownTime ? 'cursor-not-allowed opacity-40' : ''
                        }`}
                    />
                    <button
                        type="button"
                        onClick={toggleUnknownTime}
                        className="mt-3 flex items-start gap-3 text-left"
                    >
                        <div
                            className={`mt-0.5 flex h-4 w-4 items-center justify-center border transition-colors ${
                                unknownTime ? 'border-acc-gold bg-acc-gold/10' : 'border-white/20'
                            }`}
                        >
                            {unknownTime ? (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 4L3.5 6.5L9 1" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="square" />
                                </svg>
                            ) : null}
                        </div>
                        <span className="pt-0.5 text-[10px] leading-tight text-dim">
                            {isEn
                                ? 'I do not know the birth time. Use 12:00 as a midpoint.'
                                : '태어난 시간을 모르겠어요. 이 경우 낮 12:00을 기준점으로 씁니다.'}
                        </span>
                    </button>
                </div>

                <div>
                    <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40">
                        {isEn ? 'Birth City' : '출생 도시'}
                    </label>
                    <input
                        type="text"
                        list="birth-city-options"
                        value={cityName}
                        onChange={(event) => onCityNameChange(event.target.value)}
                        placeholder={isEn ? 'Seoul, Busan, Jeju...' : '서울, 부산, 제주...'}
                        className="mt-3 block min-h-[48px] w-full rounded-[18px] border border-white/15 bg-white/[0.03] px-4 py-3 text-base text-starlight transition-colors placeholder:text-white/20 focus:border-acc-gold/80 focus:bg-white/[0.06] focus:outline-none"
                    />
                    <datalist id="birth-city-options">
                        {BIRTH_CITY_OPTIONS.map((city) => (
                            <option
                                key={city.value}
                                value={isEn ? city.labelEn : city.labelKo}
                            />
                        ))}
                    </datalist>

                    {/* 실시간 진태양시 보정 피드백 뱃지 */}
                    {cityName.trim() ? (
                        <div className="mt-2.5 rounded-xl border border-acc-gold/30 bg-acc-gold/10 p-2.5 text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-acc-gold">
                                <span className="inline-block h-2 w-2 rounded-full bg-acc-gold animate-pulse" />
                                <span>{isEn ? 'True Solar Time Live Correction' : '진태양시 실시간 정밀 보정'}</span>
                            </div>
                            <p className="mt-1 text-[11px] leading-relaxed text-starlight/90">
                                {isEn
                                    ? `Calibrating Tokyo 135°E standard meridian for ${cityName}. Eliminates longitude offset.`
                                    : `동경 135도(일본 아카시) 표준시 왜곡 교정: [${cityName}] 경도 오차를 자동 상쇄하여 진짜 사주 시주(時柱)를 확정합니다.`}
                            </p>
                        </div>
                    ) : (
                        <p className="mt-2 text-[11px] leading-5 text-white/42">
                            {isEn
                                ? 'Recommended for true-solar-time correction. If omitted, the reading falls back to Seoul.'
                                : '진태양시 보정용 권장 입력입니다. 비워두면 서울 기준으로 계산됩니다.'}
                        </p>
                    )}
                </div>

                <SegmentedChoice
                    label={isEn ? 'Gender' : '성별'}
                    leftLabel={isEn ? 'Male' : '남성'}
                    rightLabel={isEn ? 'Female' : '여성'}
                    isLeftSelected={gender === 'male'}
                    onLeftSelect={() => onGenderChange('male')}
                    onRightSelect={() => onGenderChange('female')}
                />
                <SegmentedChoice
                    label={isEn ? 'Calendar Type' : '달력 기준'}
                    leftLabel={isEn ? 'Solar' : '양력'}
                    rightLabel={isEn ? 'Lunar' : '음력'}
                    isLeftSelected={calendarType === 'solar'}
                    onLeftSelect={() => onCalendarTypeChange('solar')}
                    onRightSelect={() => onCalendarTypeChange('lunar')}
                />
            </div>

            {/* 자시법 (子時法) 선택 가이드 (Task 4) */}
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 md:p-4">
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-acc-gold">
                        {isEn ? 'Zi-Hour Method (子時法)' : '자시법(子時法) 선택'}
                    </label>
                    <span className="text-[10px] text-white/40">
                        {isEn ? 'Default: Tongja (Recommended)' : '기본값: 통자시 (전통 추천)'}
                    </span>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                    {[
                        { value: 'tongja', label: isEn ? 'Tongja (Default)' : '통자시 (기본)', desc: '23:30~ 다음날 일진' },
                        { value: 'yaja', label: isEn ? 'Yaja (23:30)' : '야자시', desc: '23시 전날 일진 유지' },
                        { value: 'joja', label: isEn ? 'Joja (23:00)' : '조자시', desc: '23시부터 다음날 일진' },
                    ].map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onZiSiModeChange?.(opt.value as 'tongja' | 'yaja' | 'joja')}
                            className={`flex flex-col items-center justify-center rounded-lg border py-2 px-2 text-center transition-all ${
                                (ziSiMode || 'tongja') === opt.value
                                    ? 'border-acc-gold bg-acc-gold/15 text-starlight shadow-md'
                                    : 'border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                            }`}
                        >
                            <span className="text-xs font-bold">{opt.label}</span>
                            <span className="mt-0.5 text-[10px] opacity-70">{opt.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4 md:p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-acc-gold/20 bg-acc-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-acc-gold">
                        {coreFieldsComplete
                            ? (isEn ? 'Ready For First Result' : '무료 결과 준비됨')
                            : (isEn ? 'Saju Essentials' : '핵심 사주 입력')}
                    </span>
                    {coreSignals.map((signal) => (
                        <span
                            key={signal}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45"
                        >
                            {signal}
                        </span>
                    ))}
                </div>

                <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <p className="max-w-2xl text-sm leading-6 text-white/58">
                        {isNextMoveReportEntry
                            ? (isRelationshipContactEntry
                                ? (isEn
                                    ? 'The free contact verdict needs your question and birth date first. Name, time, city, gender, and partner details calibrate precision.'
                                    : '무료 연락 판정은 질문과 생년월일을 먼저 필요로 합니다. 이름, 생시, 출생지, 성별, 상대 정보는 정밀도 보정 입력입니다.')
                                : (isEn
                                    ? 'The free Decision Note needs your question and birth date first. Name, time, city, and gender calibrate precision.'
                                    : '무료 Decision Note는 질문과 생년월일을 먼저 필요로 합니다. 이름, 생시, 출생지, 성별은 정밀도 보정 입력입니다.'))
                            : (isEn
                                ? 'The first result now uses the quality-critical inputs up front: name for numerology, birth city for calibration, and the core saju fields for the initial read.'
                                : '무료 결과도 이제 이름, 출생 도시, 핵심 사주 입력을 먼저 반영합니다. 수비학과 보정 정확도를 초반부터 같이 잡는 구조입니다.')}
                    </p>
                </div>
            </div>
        </div>
    );
}
