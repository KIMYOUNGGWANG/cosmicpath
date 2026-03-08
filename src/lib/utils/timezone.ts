export interface CalendarDateParts {
    year: number;
    month: number;
    day: number;
}

export interface ClockTimeParts {
    hour: number;
    minute: number;
}

export interface TimezoneAwareBirthData {
    civilDate: Date;
    utcCalendarDate: Date;
    calendarDate: CalendarDateParts;
    clockTime: ClockTimeParts;
    timeZone: string;
    timezoneOffsetMinutes: number;
    timezoneOffsetHours: number;
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DEFAULT_TIME_ZONE = 'Asia/Seoul';
const DEFAULT_CLOCK_TIME = '12:00';

export function isValidTimeZone(timeZone: string): boolean {
    try {
        Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
        return true;
    } catch {
        return false;
    }
}

export function normalizeTimeZone(
    timeZone?: string,
    fallbackTimeZone: string = DEFAULT_TIME_ZONE
): string {
    if (timeZone && isValidTimeZone(timeZone)) {
        return timeZone;
    }

    return fallbackTimeZone;
}

export function parseClockTime(value?: string): ClockTimeParts {
    const normalizedValue = value?.trim() || DEFAULT_CLOCK_TIME;
    const match = CLOCK_TIME_PATTERN.exec(normalizedValue);

    if (!match) {
        return parseClockTime(DEFAULT_CLOCK_TIME);
    }

    return {
        hour: Number.parseInt(match[1], 10),
        minute: Number.parseInt(match[2], 10),
    };
}

export function extractCalendarDateParts(input: Date | string): CalendarDateParts {
    if (typeof input === 'string') {
        const dateOnlyMatch = DATE_ONLY_PATTERN.exec(input.trim());
        if (dateOnlyMatch) {
            return {
                year: Number.parseInt(dateOnlyMatch[1], 10),
                month: Number.parseInt(dateOnlyMatch[2], 10),
                day: Number.parseInt(dateOnlyMatch[3], 10),
            };
        }

        const parsedDate = new Date(input);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error(`Invalid birth date string: ${input}`);
        }

        return {
            year: parsedDate.getUTCFullYear(),
            month: parsedDate.getUTCMonth() + 1,
            day: parsedDate.getUTCDate(),
        };
    }

    if (Number.isNaN(input.getTime())) {
        throw new Error('Invalid birth date object');
    }

    // Preserve the original civil date even when the Date came from UTC midnight storage.
    return {
        year: input.getUTCFullYear(),
        month: input.getUTCMonth() + 1,
        day: input.getUTCDate(),
    };
}

export function createLocalCivilDate(input: Date | string, birthTime?: string): Date {
    const { year, month, day } = extractCalendarDateParts(input);
    const { hour, minute } = parseClockTime(birthTime);

    return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function createUtcCalendarDate(input: Date | string): Date {
    const { year, month, day } = extractCalendarDateParts(input);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

export function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
    const normalizedTimeZone = normalizeTimeZone(timeZone);
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: normalizedTimeZone,
        timeZoneName: 'shortOffset',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const offsetValue = formatter
        .formatToParts(date)
        .find((part) => part.type === 'timeZoneName')
        ?.value;

    if (!offsetValue || offsetValue === 'GMT' || offsetValue === 'UTC') {
        return 0;
    }

    const match = /GMT([+-]\d{1,2})(?::?(\d{2}))?/.exec(offsetValue);
    if (!match) {
        throw new Error(`Unsupported timezone offset format: ${offsetValue}`);
    }

    const hours = Number.parseInt(match[1], 10);
    const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
    const sign = hours >= 0 ? 1 : -1;

    return hours * 60 + sign * minutes;
}

export function createTimezoneAwareBirthData(input: {
    birthDate: Date | string;
    birthTime?: string;
    timezone?: string;
    fallbackTimeZone?: string;
}): TimezoneAwareBirthData {
    const timeZone = normalizeTimeZone(input.timezone, input.fallbackTimeZone);
    const calendarDate = extractCalendarDateParts(input.birthDate);
    const clockTime = parseClockTime(input.birthTime);
    const civilDate = createLocalCivilDate(input.birthDate, input.birthTime);
    const utcCalendarDate = createUtcCalendarDate(input.birthDate);
    const timezoneOffsetMinutes = getTimezoneOffsetMinutes(utcCalendarDate, timeZone);

    return {
        civilDate,
        utcCalendarDate,
        calendarDate,
        clockTime,
        timeZone,
        timezoneOffsetMinutes,
        timezoneOffsetHours: timezoneOffsetMinutes / 60,
    };
}
