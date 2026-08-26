/**
 * 태그 엔진 (Tag Engine)
 * 사주/점성술/자미두수 결과를 공통 태그로 변환
 */

import { SajuResult, TEN_GODS } from '../engines/saju';
import { AstrologyResult } from '../engines/astrology';
import tagMapping from '../../data/tag-mapping.json';

// 태그 타입
export interface Tag {
    value: string;       // 태그 값 (예: #강한_압박)
    source: 'saju' | 'astrology' | 'ziwei';
    category: string;    // 원본 카테고리 (예: 십신, planets)
    element: string;     // 원본 요소 (예: 편관, saturn)
    polarity: 'positive' | 'negative' | 'neutral' | 'caution' | 'transformative' | 'disruptive';
    weight: number;      // 가중치 (1-10)
}

export interface TagExtractionResult {
    sajuTags: Tag[];
    astrologyTags: Tag[];
    ziweiTags: Tag[];
    allTags: Tag[];
    uniqueTags: string[];
}

/**
 * 사주 결과에서 태그 추출
 */
export function extractSajuTags(saju: SajuResult): Tag[] {
    const tags: Tag[] = [];
    const sajuMapping = tagMapping.saju;

    // 십신에서 태그 추출
    if (saju.tenGods) {
        Object.entries(saju.tenGods).forEach(([pillar, godName]) => {
            const godKey = Object.keys(TEN_GODS).find(
                key => TEN_GODS[key as keyof typeof TEN_GODS] === godName
            );

            if (godKey && sajuMapping.십신[godName as keyof typeof sajuMapping.십신]) {
                const mapping = sajuMapping.십신[godName as keyof typeof sajuMapping.십신];
                mapping.tags.forEach(tagValue => {
                    tags.push({
                        value: tagValue,
                        source: 'saju',
                        category: '십신',
                        element: godName,
                        polarity: (mapping.polarity || 'neutral') as Tag['polarity'],
                        weight: pillar === 'day' ? 10 : pillar === 'month' ? 8 : 6,
                    });
                });
            }
        });
    }

    return tags;
}

/**
 * 점성술 결과에서 태그 추출
 */
export function extractAstrologyTags(astrology: AstrologyResult): Tag[] {
    const tags: Tag[] = [];
    const astroMapping = tagMapping.astrology;

    // 행성-별자리 조합에서 태그 추출
    if (astrology.planets) {
        Object.entries(astrology.planets).forEach(([planetKey, planetData]) => {
            if (astroMapping.planets[planetKey as keyof typeof astroMapping.planets]) {
                const mapping = astroMapping.planets[planetKey as keyof typeof astroMapping.planets];
                const weight = ['sun', 'moon'].includes(planetKey) ? 10 :
                    ['ascendant', 'mars', 'saturn'].includes(planetKey) ? 8 : 6;

                mapping.tags.forEach(tagValue => {
                    tags.push({
                        value: tagValue,
                        source: 'astrology',
                        category: 'planets',
                        element: `${planetKey}_in_${planetData.sign}`,
                        polarity: 'neutral',
                        weight,
                    });
                });
            }
        });
    }

    // 주요 아스펙트에서 태그 추출
    if (Array.isArray(astrology.aspects)) {
        astrology.aspects.forEach(aspect => {
            if (astroMapping.aspects[aspect.aspect as keyof typeof astroMapping.aspects]) {
                const mapping = astroMapping.aspects[aspect.aspect as keyof typeof astroMapping.aspects];
                mapping.tags.forEach(tagValue => {
                    tags.push({
                        value: tagValue,
                        source: 'astrology',
                        category: 'aspects',
                        element: `${aspect.planet1}_${aspect.aspect}_${aspect.planet2}`,
                        polarity: (aspect.aspect === 'trine' || aspect.aspect === 'sextile') ? 'positive' : 'caution',
                        weight: aspect.orb < 2 ? 8 : 5,
                    });
                });
            }
        });
    }

    return tags;
}

/**
 * 자미두수/에너지 결과에서 태그 추출
 */
export function extractZiweiTags(stars: { name: string; palace: string }[] = []): Tag[] {
    const tags: Tag[] = [];

    stars.forEach((star, index) => {
        const weight = index === 0 ? 10 : index === 1 ? 8 : 6;
        tags.push({
            value: `#${star.name}_${star.palace}`,
            source: 'ziwei',
            category: 'palaceStars',
            element: `${star.name}_in_${star.palace}`,
            polarity: 'positive',
            weight,
        });
    });

    return tags;
}

/**
 * 3원 모든 태그 추출 및 통합
 */
export function extractAllTags(
    saju: SajuResult,
    astrology: AstrologyResult,
    stars: { name: string; palace: string }[] = []
): TagExtractionResult {
    const sajuTags = extractSajuTags(saju);
    const astrologyTags = extractAstrologyTags(astrology);
    const ziweiTags = extractZiweiTags(stars);

    const allTags = [...sajuTags, ...astrologyTags, ...ziweiTags];
    const uniqueTags = [...new Set(allTags.map(t => t.value))];

    return {
        sajuTags,
        astrologyTags,
        ziweiTags,
        allTags,
        uniqueTags,
    };
}

/**
 * 태그 빈도 및 가중치 기반 상위 태그 추출
 */
export function getTopTags(
    tags: Tag[],
    limit: number = 10
): { tag: string; score: number; sources: string[] }[] {
    const tagScores: Map<string, { score: number; sources: Set<string> }> = new Map();

    tags.forEach(tag => {
        const existing = tagScores.get(tag.value);
        if (existing) {
            existing.score += tag.weight;
            existing.sources.add(tag.source);
        } else {
            tagScores.set(tag.value, {
                score: tag.weight,
                sources: new Set([tag.source]),
            });
        }
    });

    tagScores.forEach((value) => {
        if (value.sources.size > 1) {
            value.score *= 1 + (value.sources.size - 1) * 0.5;
        }
    });

    const sorted = Array.from(tagScores.entries())
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, limit);

    return sorted.map(([tag, data]) => ({
        tag,
        score: Math.round(data.score * 10) / 10,
        sources: Array.from(data.sources),
    }));
}

/**
 * 태그를 카테고리별로 그룹화
 */
export function groupTagsByCategory(tags: Tag[]): Record<string, Tag[]> {
    const grouped: Record<string, Tag[]> = {};

    tags.forEach(tag => {
        const key = `${tag.source}_${tag.category}`;
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(tag);
    });

    return grouped;
}
