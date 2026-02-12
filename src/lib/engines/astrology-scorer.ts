/**
 * 점성술 정량화 엔진 v1.0 (Facts of Destiny)
 * 
 * 행성 배치를 기반으로 원소/양상/품위/조화 수치를 산출합니다.
 * AI 프롬프트에 주입할 정량적 데이터를 생성하는 것이 목표입니다.
 */

import {
    ZODIAC_SIGNS,
    PLANETS,
    ASPECTS,
    type AstrologyResult,
    type PlanetPosition,
    type EnhancedAspectResult,
    type PlanetDignityResult,
    type ChartPattern,
} from './astrology';

// ============================================================================
// 타입 정의
// ============================================================================

export interface ElementDistribution {
    fire: number;
    earth: number;
    air: number;
    water: number;
}

export interface ModalityDistribution {
    cardinal: number;
    fixed: number;
    mutable: number;
}

export interface AstrologyScoreReport {
    /** 원소 분포 (%) */
    elements: ElementDistribution;
    /** 양상 분포 (%) */
    modalities: ModalityDistribution;
    /** 행성 품위 총점 (-50 ~ +50) */
    dignityTotalScore: number;
    /** 조화 점수 (soft vs hard 비율, 0~100) */
    harmonyScore: number;
    /** 핵심 각도 TOP 3 (사람이 읽기 쉬운 형태) */
    topAspects: {
        label: string;
        type: string;
        precision: number;
        harmony: string;
    }[];
    /** 감지된 차트 패턴 */
    patterns: {
        name: string;
        nameEn: string;
        planets: string[];
        score: number;
    }[];
    /** 지배적 원소 */
    dominantElement: { element: string; ko: string; score: number };
    /** 부족한 원소 */
    lackingElement: { element: string; ko: string; score: number };
    /** 사람이 읽을 수 있는 한줄 요약 */
    summary: string;
}

// ============================================================================
// 한글 매핑
// ============================================================================

const ELEMENT_KO: Record<string, string> = {
    fire: '불(Fire)',
    earth: '흙(Earth)',
    air: '바람(Air)',
    water: '물(Water)',
};

const MODALITY_KO: Record<string, string> = {
    cardinal: '주도형(Cardinal)',
    fixed: '고정형(Fixed)',
    mutable: '변통형(Mutable)',
};

// 행성별 가중치 (내행성 > 외행성)
const PLANET_WEIGHTS: Record<string, number> = {
    sun: 3.0,
    moon: 2.5,
    mercury: 1.5,
    venus: 1.5,
    mars: 1.5,
    jupiter: 1.0,
    saturn: 1.0,
    uranus: 0.5,
    neptune: 0.5,
    pluto: 0.5,
};

// ============================================================================
// 메인 점수 산출 함수
// ============================================================================

/**
 * 점성술 결과에서 정량화된 스코어 리포트 생성
 */
export function calculateAstrologyScores(astro: AstrologyResult): AstrologyScoreReport {
    // === 1. 원소 분포 (Element Distribution) ===
    const elements = calculateElementDistribution(astro.planets);

    // === 2. 양상 분포 (Modality Distribution) ===
    const modalities = calculateModalityDistribution(astro.planets);

    // === 3. 품위 총점 (Dignity Score) ===
    const dignityTotalScore = calculateDignityTotal(astro.dignities);

    // === 4. 조화 점수 (Harmony Score) ===
    const harmonyScore = calculateHarmonyScore(astro.enhancedAspects || []);

    // === 5. 핵심 각도 TOP 3 ===
    const topAspects = extractTopAspects(astro.enhancedAspects || []);

    // === 6. 차트 패턴 ===
    const patterns = (astro.patterns || []).map(p => ({
        name: p.name,
        nameEn: p.nameEn,
        planets: p.planets.map(pk => PLANETS[pk].name),
        score: p.score,
    }));

    // === 7. 지배적/부족 원소 ===
    const elementEntries = Object.entries(elements) as [keyof ElementDistribution, number][];
    const sortedElements = [...elementEntries].sort((a, b) => b[1] - a[1]);

    const dominantElement = {
        element: sortedElements[0][0],
        ko: ELEMENT_KO[sortedElements[0][0]],
        score: sortedElements[0][1],
    };

    const lackingElement = {
        element: sortedElements[sortedElements.length - 1][0],
        ko: ELEMENT_KO[sortedElements[sortedElements.length - 1][0]],
        score: sortedElements[sortedElements.length - 1][1],
    };

    // === 8. 사람이 읽을 수 있는 요약 ===
    const summaryParts: string[] = [];
    summaryParts.push(`${dominantElement.ko} 원소가 ${dominantElement.score}%로 지배적입니다`);
    summaryParts.push(`${lackingElement.ko} 원소가 ${lackingElement.score}%로 가장 약합니다`);

    if (harmonyScore >= 60) {
        summaryParts.push('행성 간 조화가 양호합니다');
    } else {
        summaryParts.push('행성 간 긴장이 강하여 내적 성장의 동력이 됩니다');
    }

    if (patterns.length > 0) {
        summaryParts.push(`특수 패턴: ${patterns.map(p => p.name).join(', ')}`);
    }

    return {
        elements,
        modalities,
        dignityTotalScore,
        harmonyScore,
        topAspects,
        patterns,
        dominantElement,
        lackingElement,
        summary: summaryParts.join('. ') + '.',
    };
}

// ============================================================================
// 내부 계산 함수
// ============================================================================

function calculateElementDistribution(planets: PlanetPosition[]): ElementDistribution {
    const raw: ElementDistribution = { fire: 0, earth: 0, air: 0, water: 0 };

    planets.forEach(p => {
        const sign = ZODIAC_SIGNS[p.sign];
        if (!sign) return;

        const weight = PLANET_WEIGHTS[p.planet] || 1.0;
        const element = sign.element as keyof ElementDistribution;
        if (raw[element] !== undefined) {
            raw[element] += weight;
        }
    });

    const total = Object.values(raw).reduce((sum, v) => sum + v, 0);
    return {
        fire: total > 0 ? Math.round((raw.fire / total) * 100) : 0,
        earth: total > 0 ? Math.round((raw.earth / total) * 100) : 0,
        air: total > 0 ? Math.round((raw.air / total) * 100) : 0,
        water: total > 0 ? Math.round((raw.water / total) * 100) : 0,
    };
}

function calculateModalityDistribution(planets: PlanetPosition[]): ModalityDistribution {
    const raw: ModalityDistribution = { cardinal: 0, fixed: 0, mutable: 0 };

    planets.forEach(p => {
        const sign = ZODIAC_SIGNS[p.sign];
        if (!sign) return;

        const weight = PLANET_WEIGHTS[p.planet] || 1.0;
        const modality = sign.modality as keyof ModalityDistribution;
        if (raw[modality] !== undefined) {
            raw[modality] += weight;
        }
    });

    const total = Object.values(raw).reduce((sum, v) => sum + v, 0);
    return {
        cardinal: total > 0 ? Math.round((raw.cardinal / total) * 100) : 0,
        fixed: total > 0 ? Math.round((raw.fixed / total) * 100) : 0,
        mutable: total > 0 ? Math.round((raw.mutable / total) * 100) : 0,
    };
}

function calculateDignityTotal(
    dignities?: Record<string, PlanetDignityResult>
): number {
    if (!dignities) return 0;
    return Object.values(dignities).reduce((sum, d) => sum + d.score, 0);
}

function calculateHarmonyScore(aspects: EnhancedAspectResult[]): number {
    if (aspects.length === 0) return 50;

    const softCount = aspects.filter(a => a.harmony === 'soft').length;
    const hardCount = aspects.filter(a => a.harmony === 'hard').length;
    const total = softCount + hardCount;

    if (total === 0) return 50;
    return Math.round((softCount / total) * 100);
}

function extractTopAspects(aspects: EnhancedAspectResult[]): AstrologyScoreReport['topAspects'] {
    return aspects.slice(0, 3).map(a => {
        const p1Name = PLANETS[a.planet1].name;
        const p2Name = PLANETS[a.planet2].name;
        const aspectDef = ASPECTS[a.aspect];

        return {
            label: `${p1Name} ${aspectDef.name} ${p2Name}`,
            type: aspectDef.nameEn,
            precision: a.exactness,
            harmony: a.harmony === 'soft' ? '조화' : a.harmony === 'hard' ? '긴장' : '중립',
        };
    });
}
