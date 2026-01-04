/**
 * 사주 오행 점수 계산 유틸리티
 * 실제 사주 데이터 기반 정확한 오행 비율 산출
 */

import type { SajuResult } from './saju';

export interface ElementScores {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
}

/**
 * 사주 데이터에서 오행 점수(퍼센트) 계산
 * 천간 4개 + 지지 4개 = 총 8글자 기준
 */
export function calculateElementScores(sajuData: SajuResult): ElementScores {
    const counts: ElementScores = {
        wood: 0,
        fire: 0,
        earth: 0,
        metal: 0,
        water: 0,
    };

    // elements 배열에서 각 기둥의 천간/지지 오행 집계
    // sajuData.elements = [yeonPillar, monthPillar, dayPillar, hourPillar]
    // 각 pillar는 { stem: 'wood'|'fire'|..., branch: 'wood'|'fire'|... }
    if (sajuData.elements && sajuData.elements.length > 0) {
        sajuData.elements.forEach(pillar => {
            if (pillar.stem && counts[pillar.stem] !== undefined) {
                counts[pillar.stem]++;
            }
            if (pillar.branch && counts[pillar.branch] !== undefined) {
                counts[pillar.branch]++;
            }
        });
    }

    // 총 8글자 기준 퍼센트로 변환
    const total = 8;
    return {
        wood: Math.round((counts.wood / total) * 100),
        fire: Math.round((counts.fire / total) * 100),
        earth: Math.round((counts.earth / total) * 100),
        metal: Math.round((counts.metal / total) * 100),
        water: Math.round((counts.water / total) * 100),
    };
}

/**
 * 가장 강한/약한 오행 찾기
 */
export function findDominantElement(scores: ElementScores): { dominant: string; lacking: string } {
    const entries = Object.entries(scores) as [keyof ElementScores, number][];

    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0][0];

    // 0%인 오행 찾기 (완전히 없는 경우)
    const zeroElements = entries.filter(([, score]) => score === 0);
    const lacking = zeroElements.length > 0 ? zeroElements[0][0] : sorted[sorted.length - 1][0];

    return { dominant, lacking };
}

/**
 * 오행 이름 변환 (영문 -> 한글)
 */
export const ELEMENT_NAMES = {
    wood: { ko: '木(목)', en: 'Wood' },
    fire: { ko: '火(화)', en: 'Fire' },
    earth: { ko: '土(토)', en: 'Earth' },
    metal: { ko: '金(금)', en: 'Metal' },
    water: { ko: '水(수)', en: 'Water' },
} as const;
