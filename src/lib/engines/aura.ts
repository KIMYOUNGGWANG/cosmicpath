import { calculateAstrology, ZODIAC_SIGNS } from './astrology';
import { calculateAstrologyScores, type AstrologyScoreReport } from './astrology-scorer';
import {
    calculateEnhancedElementScores,
    ELEMENT_NAMES,
    type ElementScores,
    type EnhancedElementReport,
} from './element-calculator';
import { calculateLifePathNumber, getLifePathKeyword } from './numerology';
import { calculateSaju } from './saju';
import { createTimezoneAwareBirthData } from '@/lib/utils/timezone';

export type AuraLanguage = 'ko' | 'en';

export interface AuraGenerationInput {
    name: string;
    birthDate: Date | string;
    birthTime?: string;
    timezone?: string;
    language?: AuraLanguage;
    latitude?: number;
    longitude?: number;
}

export interface AuraSignals {
    calendarDate: string;
    birthTime: string;
    timezone: string;
    dayMaster: string;
    lifePathNumber: number;
    lifePathKeyword: string;
    dominantSajuElement: keyof ElementScores;
    dominantSajuElementLabel: string;
    sajuBalanceScore: number;
    dominantAstroElement: keyof AstrologyScoreReport['elements'];
    dominantAstroElementLabel: string;
    dominantModality: keyof AstrologyScoreReport['modalities'];
    astroHarmonyScore: number;
    sunSign: string;
    moonSign: string;
    ascendant: string;
}

export interface AuraProfile {
    auraColorHex: [string, string];
    keywords: [string, string, string];
    catchphrase: string;
    summary: string;
    promptFacts: string;
    signals: AuraSignals;
}

const DEFAULT_LANGUAGE: AuraLanguage = 'en';
const DEFAULT_LATITUDE = 37.5665;
const DEFAULT_LONGITUDE = 126.9780;

const SAJU_ELEMENT_LABELS: Record<keyof ElementScores, { ko: string; en: string }> = {
    wood: { ko: '목(木)', en: 'Wood' },
    fire: { ko: '화(火)', en: 'Fire' },
    earth: { ko: '토(土)', en: 'Earth' },
    metal: { ko: '금(金)', en: 'Metal' },
    water: { ko: '수(水)', en: 'Water' },
};

const ASTRO_ELEMENT_LABELS: Record<keyof AstrologyScoreReport['elements'], { ko: string; en: string }> = {
    fire: { ko: '불(Fire)', en: 'Fire' },
    earth: { ko: '흙(Earth)', en: 'Earth' },
    air: { ko: '바람(Air)', en: 'Air' },
    water: { ko: '물(Water)', en: 'Water' },
};

const MODALITY_LABELS: Record<keyof AstrologyScoreReport['modalities'], { ko: string; en: string }> = {
    cardinal: { ko: '주도형', en: 'Cardinal' },
    fixed: { ko: '고정형', en: 'Fixed' },
    mutable: { ko: '변통형', en: 'Mutable' },
};

const SIGN_NAMES_EN = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
] as const;

const SAJU_COLOR_PALETTES: Record<keyof ElementScores, readonly [string, string, string]> = {
    wood: ['#0F8A5F', '#4CBF88', '#B7E4C7'],
    fire: ['#FF5A36', '#FF8A3D', '#FFD166'],
    earth: ['#8C6239', '#C89B5A', '#E9C46A'],
    metal: ['#7B8A9A', '#B7C5D3', '#E8EEF2'],
    water: ['#0A4DCC', '#2D7FF9', '#7BDFF2'],
};

const ASTRO_COLOR_PALETTES: Record<keyof AstrologyScoreReport['elements'], readonly [string, string, string]> = {
    fire: ['#FF7A59', '#FFB26B', '#FFE29A'],
    earth: ['#9C6D3C', '#D4A373', '#F2D0A4'],
    air: ['#4CC9F0', '#90E0EF', '#DDF6FF'],
    water: ['#1565C0', '#4FC3F7', '#B3E5FC'],
};

const SAJU_KEYWORD_BANK: Record<keyof ElementScores, readonly [string, string, string]> = {
    wood: ['verdant', 'healing', 'expansive'],
    fire: ['radiant', 'bold', 'magnetic'],
    earth: ['grounded', 'steady', 'abundant'],
    metal: ['luminous', 'precise', 'regal'],
    water: ['fluid', 'intuitive', 'mystic'],
};

const ASTRO_KEYWORD_BANK: Record<keyof AstrologyScoreReport['elements'], readonly [string, string, string]> = {
    fire: ['vivid', 'magnetic', 'fearless'],
    earth: ['anchored', 'sensual', 'reliable'],
    air: ['lucid', 'social', 'electric'],
    water: ['dreamy', 'empathic', 'deep'],
};

const MODALITY_KEYWORD_BANK: Record<keyof AstrologyScoreReport['modalities'], readonly [string, string, string]> = {
    cardinal: ['initiating', 'trailblazing', 'direct'],
    fixed: ['magnetic', 'steadfast', 'unshaken'],
    mutable: ['shape-shifting', 'adaptable', 'mercurial'],
};

const LIFE_PATH_KEYWORDS: Record<number, string> = {
    1: 'pioneer',
    2: 'harmonizer',
    3: 'creator',
    4: 'builder',
    5: 'explorer',
    6: 'nurturer',
    7: 'seeker',
    8: 'powerhouse',
    9: 'humanitarian',
    11: 'intuitive',
    22: 'architect',
    33: 'guide',
};

const BALANCE_WORDS = {
    aligned: { ko: '정돈된', en: 'aligned' },
    dynamic: { ko: '입체적인', en: 'dynamic' },
    untamed: { ko: '거침없는', en: 'untamed' },
} as const;

const HARMONY_WORDS = {
    smooth: { ko: '유연한', en: 'smooth' },
    layered: { ko: '겹이 많은', en: 'layered' },
    electric: { ko: '전류 같은', en: 'electric' },
} as const;

export function generateAuraProfile(input: AuraGenerationInput): AuraProfile {
    const language = input.language ?? DEFAULT_LANGUAGE;
    const name = input.name.trim();
    const latitude = input.latitude ?? DEFAULT_LATITUDE;
    const longitude = input.longitude ?? DEFAULT_LONGITUDE;

    const birthData = createTimezoneAwareBirthData({
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        timezone: input.timezone,
    });

    const sajuResult = calculateSaju(
        birthData.civilDate,
        birthData.clockTime.hour,
        birthData.clockTime.minute
    );
    const sajuReport = calculateEnhancedElementScores(sajuResult);

    const birthTime = formatBirthTime(birthData.clockTime.hour, birthData.clockTime.minute);
    const astrologyResult = calculateAstrology(
        birthData.utcCalendarDate,
        birthTime,
        latitude,
        longitude,
        birthData.timezoneOffsetHours
    );
    const astroReport = calculateAstrologyScores(astrologyResult);

    const lifePathNumber = calculateLifePathNumber(birthData.civilDate);
    const lifePathKeyword = LIFE_PATH_KEYWORDS[lifePathNumber] ?? 'visionary';
    const lifePathLabel = getLifePathKeyword(lifePathNumber, language);

    const dominantSajuElement = sajuReport.dominant.element as keyof ElementScores;
    const dominantAstroElement =
        astroReport.dominantElement.element as keyof AstrologyScoreReport['elements'];
    const dominantModality = pickHighestKey(astroReport.modalities);
    const variantIndex = selectVariantIndex(lifePathNumber, sajuReport, astroReport);

    const auraColorHex: [string, string] = [
        SAJU_COLOR_PALETTES[dominantSajuElement][variantIndex],
        ASTRO_COLOR_PALETTES[dominantAstroElement][(variantIndex + 1) % 3],
    ];

    const keywords = selectKeywords([
        SAJU_KEYWORD_BANK[dominantSajuElement][variantIndex],
        ASTRO_KEYWORD_BANK[dominantAstroElement][variantIndex],
        MODALITY_KEYWORD_BANK[dominantModality][variantIndex],
        lifePathKeyword,
        describeBalance(sajuReport.balanceScore).en,
        describeHarmony(astroReport.harmonyScore).en,
    ]);

    const catchphrase = buildCatchphrase({
        language,
        name,
        primaryKeyword: keywords[0],
        secondaryKeyword: keywords[1],
        lifePathKeyword,
        lifePathLabel,
        sajuReport,
    });

    const summary = buildSummary({
        language,
        name,
        colors: auraColorHex,
        keywords,
        lifePathNumber,
        lifePathLabel,
        sajuReport,
        astroReport,
        astrologyResult,
    });

    const signals: AuraSignals = {
        calendarDate: formatCalendarDate(
            birthData.calendarDate.year,
            birthData.calendarDate.month,
            birthData.calendarDate.day
        ),
        birthTime,
        timezone: birthData.timeZone,
        dayMaster: sajuResult.dayMaster,
        lifePathNumber,
        lifePathKeyword,
        dominantSajuElement,
        dominantSajuElementLabel: SAJU_ELEMENT_LABELS[dominantSajuElement][language],
        sajuBalanceScore: sajuReport.balanceScore,
        dominantAstroElement,
        dominantAstroElementLabel: ASTRO_ELEMENT_LABELS[dominantAstroElement][language],
        dominantModality,
        astroHarmonyScore: astroReport.harmonyScore,
        sunSign: getSignLabel(astrologyResult.sunSign, language),
        moonSign: getSignLabel(astrologyResult.moonSign, language),
        ascendant: getSignLabel(astrologyResult.ascendant, language),
    };

    const promptFacts = buildAuraPromptFacts({
        name,
        colors: auraColorHex,
        keywords,
        catchphrase,
        signals,
        sajuReport,
        astroReport,
        lifePathLabel: getLifePathKeyword(lifePathNumber, 'en'),
        astrologyResult,
    });

    return {
        auraColorHex,
        keywords,
        catchphrase,
        summary,
        promptFacts,
        signals,
    };
}

interface CatchphraseInput {
    language: AuraLanguage;
    name: string;
    primaryKeyword: string;
    secondaryKeyword: string;
    lifePathKeyword: string;
    lifePathLabel: string;
    sajuReport: EnhancedElementReport;
}

function buildCatchphrase(input: CatchphraseInput): string {
    const displayName = input.name || (input.language === 'ko' ? '이 오라' : 'This aura');

    if (input.language === 'ko') {
        return `${displayName}는 ${input.sajuReport.dominant.ko} 결에 ${input.lifePathLabel} 궤도를 가진 오라입니다.`;
    }

    return `${displayName} carries a ${input.primaryKeyword}, ${input.secondaryKeyword} aura with ${input.lifePathKeyword} gravity.`;
}

interface SummaryInput {
    language: AuraLanguage;
    name: string;
    colors: [string, string];
    keywords: [string, string, string];
    lifePathNumber: number;
    lifePathLabel: string;
    sajuReport: EnhancedElementReport;
    astroReport: AstrologyScoreReport;
    astrologyResult: ReturnType<typeof calculateAstrology>;
}

function buildSummary(input: SummaryInput): string {
    const displayName = input.name || (input.language === 'ko' ? '이 사람' : 'This aura');
    const dominantSajuElement =
        SAJU_ELEMENT_LABELS[input.sajuReport.dominant.element as keyof ElementScores];
    const dominantAstroElement =
        ASTRO_ELEMENT_LABELS[
            input.astroReport.dominantElement.element as keyof AstrologyScoreReport['elements']
        ];
    const dominantModality = MODALITY_LABELS[pickHighestKey(input.astroReport.modalities)];
    const balanceWord = describeBalance(input.sajuReport.balanceScore);
    const harmonyWord = describeHarmony(input.astroReport.harmonyScore);

    if (input.language === 'ko') {
        return [
            `${displayName}의 오라는 ${dominantSajuElement.ko} 기운이 중심을 잡고, ${dominantAstroElement.ko} 원소가 배경 톤을 만듭니다. ${getSignLabel(input.astrologyResult.sunSign, 'ko')} 태양과 ${getSignLabel(input.astrologyResult.moonSign, 'ko')} 달이 그 결을 더합니다.`,
            `라이프 패스 ${input.lifePathNumber}(${input.lifePathLabel})와 ${dominantModality.ko} 흐름이 만나 전체 무드는 ${balanceWord.ko} 동시에 ${harmonyWord.ko} 편입니다.`,
            `${input.colors[0]}와 ${input.colors[1]} 사이의 팔레트라서 인상은 ${input.keywords.join(', ')} 쪽으로 읽힙니다.`,
        ].join(' ');
    }

    return [
        `${displayName}'s aura is led by ${dominantSajuElement.en.toLowerCase()} energy, while ${dominantAstroElement.en.toLowerCase()} undertones and ${getSignLabel(input.astrologyResult.sunSign, 'en')} sun/${getSignLabel(input.astrologyResult.moonSign, 'en')} moon signatures shape the mood.`,
        `Life Path ${input.lifePathNumber} (${input.lifePathLabel}) adds a ${dominantModality.en.toLowerCase()} arc, so the chart feels ${balanceWord.en} and ${harmonyWord.en} rather than flat.`,
        `The palette sits between ${input.colors[0]} and ${input.colors[1]}, giving the overall vibe a ${input.keywords.join(', ')} finish.`,
    ].join(' ');
}

interface PromptFactsInput {
    name: string;
    colors: [string, string];
    keywords: [string, string, string];
    catchphrase: string;
    signals: AuraSignals;
    sajuReport: EnhancedElementReport;
    astroReport: AstrologyScoreReport;
    lifePathLabel: string;
    astrologyResult: ReturnType<typeof calculateAstrology>;
}

function buildAuraPromptFacts(input: PromptFactsInput): string {
    return [
        `Name: ${input.name || 'Unknown'}`,
        `Birth: ${input.signals.calendarDate} ${input.signals.birthTime} (${input.signals.timezone})`,
        `Day master: ${input.signals.dayMaster}`,
        `Saju dominant element: ${SAJU_ELEMENT_LABELS[input.signals.dominantSajuElement].en} (${input.sajuReport.dominant.score}%)`,
        `Saju lacking element: ${ELEMENT_NAMES[input.sajuReport.lacking.element as keyof ElementScores].en} (${input.sajuReport.lacking.score}%)`,
        `Saju balance score: ${input.signals.sajuBalanceScore}/100`,
        `Astrology dominant element: ${ASTRO_ELEMENT_LABELS[input.signals.dominantAstroElement].en} (${input.astroReport.dominantElement.score}%)`,
        `Astrology harmony score: ${input.signals.astroHarmonyScore}/100`,
        `Dominant modality: ${MODALITY_LABELS[input.signals.dominantModality].en}`,
        `Core signs: Sun ${getSignLabel(input.astrologyResult.sunSign, 'en')}, Moon ${getSignLabel(input.astrologyResult.moonSign, 'en')}, Ascendant ${getSignLabel(input.astrologyResult.ascendant, 'en')}`,
        `Life path: ${input.signals.lifePathNumber} (${input.lifePathLabel})`,
        `Keywords: ${input.keywords.join(', ')}`,
        `Aura colors: ${input.colors.join(', ')}`,
        `Catchphrase: ${input.catchphrase}`,
    ].join('\n');
}

function selectVariantIndex(
    lifePathNumber: number,
    sajuReport: EnhancedElementReport,
    astroReport: AstrologyScoreReport
): 0 | 1 | 2 {
    const score =
        lifePathNumber +
        Math.round(sajuReport.balanceScore / 10) +
        Math.round(astroReport.harmonyScore / 10);

    return (score % 3) as 0 | 1 | 2;
}

function selectKeywords(candidates: string[]): [string, string, string] {
    const uniqueKeywords = Array.from(
        new Set(
            candidates
                .map((keyword) => keyword.trim().toLowerCase())
                .filter(Boolean)
        )
    );

    const filled = [...uniqueKeywords];
    while (filled.length < 3) {
        filled.push('magnetic');
    }

    return [filled[0], filled[1], filled[2]];
}

function pickHighestKey<T extends string>(values: Record<T, number>): T {
    const sortedEntries = (Object.entries(values) as [T, number][])
        .sort((left, right) => right[1] - left[1]);

    return sortedEntries[0][0];
}

function describeBalance(score: number): { ko: string; en: string } {
    if (score >= 70) {
        return BALANCE_WORDS.aligned;
    }

    if (score >= 40) {
        return BALANCE_WORDS.dynamic;
    }

    return BALANCE_WORDS.untamed;
}

function describeHarmony(score: number): { ko: string; en: string } {
    if (score >= 70) {
        return HARMONY_WORDS.smooth;
    }

    if (score >= 45) {
        return HARMONY_WORDS.layered;
    }

    return HARMONY_WORDS.electric;
}

function getSignLabel(signIndex: number, language: AuraLanguage): string {
    if (language === 'ko') {
        return ZODIAC_SIGNS[signIndex]?.name ?? '알 수 없음';
    }

    return SIGN_NAMES_EN[signIndex] ?? 'Unknown';
}

function formatCalendarDate(year: number, month: number, day: number): string {
    return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

function formatBirthTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}
