import type { ReadingCalendarType } from './types';

type BuildCoreSignalsInput = {
    readonly isNextMoveReportEntry: boolean;
    readonly isEn: boolean;
    readonly name: string;
    readonly normalizedBirthDate: string;
    readonly birthDate: string;
    readonly hasCompleteBirthDate: boolean;
    readonly birthTime: string;
    readonly unknownTime: boolean;
    readonly calendarType: ReadingCalendarType;
    readonly cityName: string;
};

export function buildCoreSignals({
    isNextMoveReportEntry,
    isEn,
    name,
    normalizedBirthDate,
    birthDate,
    hasCompleteBirthDate,
    birthTime,
    unknownTime,
    calendarType,
    cityName,
}: BuildCoreSignalsInput): readonly string[] {
    if (isNextMoveReportEntry) {
        return [
            name.trim()
                ? (isEn ? `Name ${name.trim()}` : `이름 ${name.trim()}`)
                : (isEn ? 'Name Optional' : '이름 선택'),
            hasCompleteBirthDate
                ? (isEn ? `Birth Date ${normalizedBirthDate}` : `생년월일 ${normalizedBirthDate}`)
                : (birthDate ? (isEn ? 'Complete Birth Date Needed' : '생년월일 완성 필요') : (isEn ? 'Birth Date Needed' : '생년월일 필요')),
            unknownTime || !birthTime
                ? (isEn ? 'Unknown Time OK' : '생시 몰라도 진행')
                : `${isEn ? 'Birth Time' : '생시'} ${birthTime}`,
            isEn ? 'Tarot Prep Ready' : '타로 준비 가능',
        ];
    }

    return [
        name.trim()
            ? (isEn ? `Name ${name.trim()}` : `이름 ${name.trim()}`)
            : (isEn ? 'Name Needed' : '이름 필요'),
        calendarType === 'solar'
            ? (isEn ? 'Solar Calendar' : '양력')
            : (isEn ? 'Lunar Calendar' : '음력'),
        cityName.trim()
            ? (isEn ? `Birth City ${cityName.trim()}` : `출생지 ${cityName.trim()}`)
            : (isEn ? 'Birth City Recommended' : '출생지 권장'),
        unknownTime
            ? (isEn ? 'Time Unknown' : '시간 모름')
            : `${isEn ? 'Birth Time' : '생시'} ${birthTime}`,
    ];
}
