/**
 * 태그 엔진 (Tag Engine)
 * 사주/점성술/타로 결과를 공통 태그로 변환
 */

import { SajuResult, TEN_GODS, FIVE_ELEMENTS } from '../engines/saju';
import { AstrologyResult, PLANETS, HOUSES, ASPECTS, ZODIAC_SIGNS } from '../engines/astrology';
import { TarotCard } from '../engines/tarot';
import tagMapping from '../../data/tag-mapping.json';

// 태그 타입
export interface Tag {
    value: string;       // 태그 값 (예: #강한_압박)
    source: 'saju' | 'astrology' | 'tarot';
    category: string;    // 원본 카테고리 (예: 십신, planets)
    element: string;     // 원본 요소 (예: 편관, saturn)
    polarity: 'positive' | 'negative' | 'neutral' | 'caution' | 'transformative' | 'disruptive';
    weight: number;      // 가중치 (1-10)
}

export interface TagExtractionResult {
    sajuTags: Tag[];
    astrologyTags: Tag[];
    tarotTags: Tag[];
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
                    polarity: mapping.polarity as Tag['polarity'],
                    weight: pillar === 'day' ? 10 : pillar === 'month' ? 8 : 6,
                });
            });
        }
    });

    // 오행에서 태그 추출
    saju.elements.forEach((element, index) => {
        const stemElement = FIVE_ELEMENTS[element.stem];
        const branchElement = FIVE_ELEMENTS[element.branch];

        [stemElement, branchElement].forEach(el => {
            if (sajuMapping.오행[el as keyof typeof sajuMapping.오행]) {
                const mapping = sajuMapping.오행[el as keyof typeof sajuMapping.오행];
                mapping.tags.forEach(tagValue => {
                    // 중복 방지
                    if (!tags.find(t => t.value === tagValue && t.element === el)) {
                        tags.push({
                            value: tagValue,
                            source: 'saju',
                            category: '오행',
                            element: el,
                            polarity: 'neutral',
                            weight: 5,
                        });
                    }
                });
            }
        });
    });

    return tags;
}

/**
 * 점성술 결과에서 태그 추출
 */
export function extractAstrologyTags(astrology: AstrologyResult): Tag[] {
    const tags: Tag[] = [];
    const astroMapping = tagMapping.astrology;

    // 행성 위치에서 태그 추출
    astrology.planets.forEach(planet => {
        const planetKey = planet.planet;
        const houseNum = planet.house.toString();

        // 행성 태그
        if (astroMapping.planets[planetKey as keyof typeof astroMapping.planets]) {
            const mapping = astroMapping.planets[planetKey as keyof typeof astroMapping.planets];
            mapping.tags.forEach(tagValue => {
                tags.push({
                    value: tagValue,
                    source: 'astrology',
                    category: 'planets',
                    element: planetKey,
                    polarity: 'neutral',
                    weight: ['sun', 'moon'].includes(planetKey) ? 10 : 7,
                });
            });
        }

        // 하우스 태그 (행성이 위치한 하우스)
        if (astroMapping.houses[houseNum as keyof typeof astroMapping.houses]) {
            const houseMapping = astroMapping.houses[houseNum as keyof typeof astroMapping.houses];

            // 중요 행성(태양, 달, 화성, 토성)이 위치한 하우스는 더 중요
            const isImportantPlanet = ['sun', 'moon', 'mars', 'saturn'].includes(planetKey);

            if (isImportantPlanet) {
                houseMapping.tags.forEach(tagValue => {
                    tags.push({
                        value: tagValue,
                        source: 'astrology',
                        category: 'houses',
                        element: `${planetKey}_in_${houseNum}`,
                        polarity: 'neutral',
                        weight: 8,
                    });
                });
            }
        }
    });

    // 각도(Aspects)에서 태그 추출
    astrology.aspects.forEach(aspect => {
        if (astroMapping.aspects[aspect.aspect as keyof typeof astroMapping.aspects]) {
            const mapping = astroMapping.aspects[aspect.aspect as keyof typeof astroMapping.aspects];
            mapping.tags.forEach(tagValue => {
                // 중요한 aspect일수록 가중치 높음
                const weight = aspect.orb < 3 ? 9 : aspect.orb < 6 ? 7 : 5;

                tags.push({
                    value: tagValue,
                    source: 'astrology',
                    category: 'aspects',
                    element: `${aspect.planet1}_${aspect.aspect}_${aspect.planet2}`,
                    polarity: mapping.polarity as Tag['polarity'],
                    weight,
                });
            });
        }
    });

    return tags;
}

/**
 * 타로 결과에서 태그 추출
 */
export function extractTarotTags(cards: TarotCard[]): Tag[] {
    const tags: Tag[] = [];
    const tarotMapping = tagMapping.tarot.majorArcana;

    cards.forEach((card, index) => {
        const cardKey = card.id.toString();

        if (tarotMapping[cardKey as keyof typeof tarotMapping]) {
            const cardMapping = tarotMapping[cardKey as keyof typeof tarotMapping];
            const direction = card.isReversed ? 'reversed' : 'upright';
            const directionMapping = cardMapping[direction];

            directionMapping.tags.forEach(tagValue => {
                // 첫 번째 카드가 가장 중요
                const weight = index === 0 ? 10 : index === 1 ? 8 : 6;

                tags.push({
                    value: tagValue,
                    source: 'tarot',
                    category: 'majorArcana',
                    element: `${card.name}_${direction}`,
                    polarity: directionMapping.polarity as Tag['polarity'],
                    weight,
                });
            });
        }
    });

    return tags;
}

/**
 * 3원 모든 태그 추출 및 통합
 */
export function extractAllTags(
    saju: SajuResult,
    astrology: AstrologyResult,
    tarotCards: TarotCard[]
): TagExtractionResult {
    const sajuTags = extractSajuTags(saju);
    const astrologyTags = extractAstrologyTags(astrology);
    const tarotTags = extractTarotTags(tarotCards);

    const allTags = [...sajuTags, ...astrologyTags, ...tarotTags];

    // 고유한 태그 값들 (중복 제거)
    const uniqueTags = [...new Set(allTags.map(t => t.value))];

    return {
        sajuTags,
        astrologyTags,
        tarotTags,
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

    // 여러 소스에서 나타난 태그는 보너스 가중치
    tagScores.forEach((value, key) => {
        if (value.sources.size > 1) {
            value.score *= 1 + (value.sources.size - 1) * 0.5;
        }
    });

    // 점수 순 정렬
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
