/**
 * 사주 오행 점수 계산 유틸리티 v2.0 (Facts of Destiny)
 * 
 * v1.0: 천간/지지 8글자 단순 카운트 → 퍼센트
 * v2.0: 지장간 가중치 반영 정밀 오행 점수 + 균형 지표 + 용신 연동
 */

import type { SajuResult } from './saju';
import { HIDDEN_STEMS, STEM_ELEMENTS } from './saju';

// ============================================================================
// 타입 정의
// ============================================================================

export interface ElementScores {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
}

export interface EnhancedElementReport {
    /** 오행별 100점 만점 점수 */
    scores: ElementScores;
    /** 전체 대비 퍼센트(%) */
    percentages: ElementScores;
    /** 가장 강한 오행 */
    dominant: { element: string; ko: string; score: number };
    /** 가장 약한 오행 */
    lacking: { element: string; ko: string; score: number };
    /** 오행 균형 지표 (0=극도 편향, 100=완벽 균형) */
    balanceScore: number;
    /** 부족 오행 목록 (0점인 것) */
    missingElements: string[];
    /** 용신 정보 (엔진에서 판별된 경우) */
    vitalElement?: { element: string; ko: string; reason: string };
    /** 사람이 읽을 수 있는 한줄 요약 */
    summary: string;
}

// ============================================================================
// 지장간 가중치 (정기 > 중기 > 여기)
// ============================================================================

const HIDDEN_STEM_WEIGHTS = {
    jeonggi: 1.0,   // 정기: 가장 강한 영향 (100%)
    junggi: 0.5,    // 중기: 중간 영향 (50%)
    yeogi: 0.3,     // 여기: 약한 영향 (30%)
} as const;

// ============================================================================
// 오행 이름 변환
// ============================================================================

export const ELEMENT_NAMES = {
    wood: { ko: '木(목)', en: 'Wood', emoji: '🪵' },
    fire: { ko: '火(화)', en: 'Fire', emoji: '🔥' },
    earth: { ko: '土(토)', en: 'Earth', emoji: '🟤' },
    metal: { ko: '金(금)', en: 'Metal', emoji: '⚪' },
    water: { ko: '水(수)', en: 'Water', emoji: '🌊' },
} as const;

// ============================================================================
// v1.0 호환 함수 (기존 코드 깨뜨리지 않음)
// ============================================================================

/**
 * [v1.0 호환] 사주 데이터에서 오행 점수(퍼센트) 계산
 * 천간 4개 + 지지 4개 = 총 8글자 기준
 */
export function calculateElementScores(sajuData: SajuResult): ElementScores {
    const counts: ElementScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

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

    const total = 8;
    return {
        wood: Math.round((counts.wood / total) * 100),
        fire: Math.round((counts.fire / total) * 100),
        earth: Math.round((counts.earth / total) * 100),
        metal: Math.round((counts.metal / total) * 100),
        water: Math.round((counts.water / total) * 100),
    };
}

// ============================================================================
// v2.0 정밀 오행 점수 (지장간 가중치 반영)
// ============================================================================

/**
 * [v2.0] 지장간 가중치를 반영한 정밀 오행 점수 산출
 * 
 * 계산 방식:
 * 1. 천간 4개: 각 1.0점
 * 2. 지지 4개: 정기(1.0) + 중기(0.5) + 여기(0.3)의 오행 합산
 * 3. 전체 합계를 100점 만점으로 정규화
 */
export function calculateEnhancedElementScores(sajuData: SajuResult): EnhancedElementReport {
    const rawScores: ElementScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

    // === 1단계: 천간 오행 합산 (각 1.0점) ===
    const pillars = [
        sajuData.yeonPillar,
        sajuData.monthPillar,
        sajuData.dayPillar,
        sajuData.hourPillar,
    ];

    pillars.forEach(pillar => {
        const stemElement = STEM_ELEMENTS[pillar.stem];
        if (stemElement && rawScores[stemElement] !== undefined) {
            rawScores[stemElement] += 1.0;
        }
    });

    // === 2단계: 지장간 가중치 합산 ===
    const branches = [
        sajuData.yeonPillar.branch,
        sajuData.monthPillar.branch,
        sajuData.dayPillar.branch,
        sajuData.hourPillar.branch,
    ];

    branches.forEach(branch => {
        const hidden = HIDDEN_STEMS[branch];
        if (!hidden) return;

        // 정기 (필수, 1.0점)
        if (hidden.jeonggi) {
            const el = STEM_ELEMENTS[hidden.jeonggi];
            if (el && rawScores[el] !== undefined) rawScores[el] += HIDDEN_STEM_WEIGHTS.jeonggi;
        }

        // 중기 (선택, 0.5점)
        if (hidden.junggi) {
            const el = STEM_ELEMENTS[hidden.junggi];
            if (el && rawScores[el] !== undefined) rawScores[el] += HIDDEN_STEM_WEIGHTS.junggi;
        }

        // 여기 (선택, 0.3점)
        if (hidden.yeogi) {
            const el = STEM_ELEMENTS[hidden.yeogi];
            if (el && rawScores[el] !== undefined) rawScores[el] += HIDDEN_STEM_WEIGHTS.yeogi;
        }
    });

    // === 3단계: 100점 만점 정규화 ===
    const totalRaw = Object.values(rawScores).reduce((sum, v) => sum + v, 0);
    const scores: ElementScores = {
        wood: totalRaw > 0 ? Math.round((rawScores.wood / totalRaw) * 100) : 0,
        fire: totalRaw > 0 ? Math.round((rawScores.fire / totalRaw) * 100) : 0,
        earth: totalRaw > 0 ? Math.round((rawScores.earth / totalRaw) * 100) : 0,
        metal: totalRaw > 0 ? Math.round((rawScores.metal / totalRaw) * 100) : 0,
        water: totalRaw > 0 ? Math.round((rawScores.water / totalRaw) * 100) : 0,
    };

    // === 4단계: 분석 지표 도출 ===
    const entries = Object.entries(scores) as [keyof ElementScores, number][];
    const sorted = [...entries].sort((a, b) => b[1] - a[1]);

    const dominant = {
        element: sorted[0][0],
        ko: ELEMENT_NAMES[sorted[0][0]].ko,
        score: sorted[0][1],
    };

    const lacking = {
        element: sorted[sorted.length - 1][0],
        ko: ELEMENT_NAMES[sorted[sorted.length - 1][0]].ko,
        score: sorted[sorted.length - 1][1],
    };

    const missingElements = entries
        .filter(([, score]) => score === 0)
        .map(([el]) => ELEMENT_NAMES[el].ko);

    // 균형 점수 (표준편차 기반, 20% 균등 = 100점)
    const mean = 20; // 5개 오행이 균등하면 각 20%
    const variance = entries.reduce((sum, [, score]) => sum + Math.pow(score - mean, 2), 0) / 5;
    const stdDev = Math.sqrt(variance);
    const balanceScore = Math.max(0, Math.round(100 - stdDev * 3));

    // === 5단계: 용신 연동 ===
    let vitalElement: EnhancedElementReport['vitalElement'];
    if (sajuData.enhancedYongsin) {
        const yongsin = sajuData.enhancedYongsin;
        if (yongsin.primary && ELEMENT_NAMES[yongsin.primary as keyof typeof ELEMENT_NAMES]) {
            const elKey = yongsin.primary as keyof typeof ELEMENT_NAMES;
            vitalElement = {
                element: elKey,
                ko: ELEMENT_NAMES[elKey].ko,
                reason: yongsin.reasoning || '용신 판별 결과',
            };
        }
    }

    // === 6단계: 사람이 읽을 수 있는 요약 ===
    const summaryParts: string[] = [];
    summaryParts.push(`${dominant.ko} 기운이 ${dominant.score}%로 가장 강합니다`);

    if (missingElements.length > 0) {
        summaryParts.push(`${missingElements.join(', ')} 기운이 완전히 부재합니다`);
    } else {
        summaryParts.push(`${lacking.ko} 기운이 ${lacking.score}%로 가장 약합니다`);
    }

    if (balanceScore >= 70) {
        summaryParts.push('전체적으로 오행의 균형이 양호합니다');
    } else if (balanceScore >= 40) {
        summaryParts.push('오행에 약간의 편중이 있습니다');
    } else {
        summaryParts.push('오행의 편중이 심하여 보완이 필요합니다');
    }

    if (vitalElement) {
        summaryParts.push(`용신(用神): ${vitalElement.ko} - ${vitalElement.reason}`);
    }

    return {
        scores,
        percentages: scores,
        dominant,
        lacking,
        balanceScore,
        missingElements,
        vitalElement,
        summary: summaryParts.join('. ') + '.',
    };
}

// ============================================================================
// v1.0 호환 유틸리티
// ============================================================================

/**
 * [v1.0 호환] 가장 강한/약한 오행 찾기
 */
export function findDominantElement(scores: ElementScores): { dominant: string; lacking: string } {
    const entries = Object.entries(scores) as [keyof ElementScores, number][];
    const sorted = [...entries].sort((a, b) => b[1] - a[1]);
    const dominant = sorted[0][0];
    const zeroElements = entries.filter(([, score]) => score === 0);
    const lacking = zeroElements.length > 0 ? zeroElements[0][0] : sorted[sorted.length - 1][0];
    return { dominant, lacking };
}
