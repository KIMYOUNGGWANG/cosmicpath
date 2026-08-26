import type { SajuResult } from '@/lib/engines/saju';

export type RadarScores = {
    readonly saju?: number;
    readonly astrology?: number;
    readonly ziwei?: number;
    readonly tarot?: number;
};

function readOptionalNumber(value: unknown): number | undefined {
    return typeof value === 'number' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSajuResult(value: unknown): value is SajuResult {
    if (!isRecord(value)) return false;

    return (
        typeof value['dayMaster'] === 'string' &&
        Array.isArray(value['elements']) &&
        isRecord(value['yeonPillar']) &&
        isRecord(value['monthPillar']) &&
        isRecord(value['dayPillar']) &&
        isRecord(value['hourPillar'])
    );
}

export function readRadarScores(metadata?: Record<string, unknown>): RadarScores | undefined {
    const radarScores = metadata?.['radarScores'];

    if (!isRecord(radarScores)) {
        return undefined;
    }

    return {
        saju: readOptionalNumber(radarScores['saju']),
        astrology: readOptionalNumber(radarScores['astrology']),
        ziwei: readOptionalNumber(radarScores['ziwei']),
        tarot: readOptionalNumber(radarScores['tarot']),
    };
}

export function readSajuResult(metadata?: Record<string, unknown>): SajuResult | undefined {
    const sajuResult = metadata?.['sajuResult'];
    return isSajuResult(sajuResult) ? sajuResult : undefined;
}
