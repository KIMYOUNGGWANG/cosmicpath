/**
 * 서양 점성술 해석 규칙 + 엔진 통합
 * Phase 4: AI 프롬프트 통합
 * 
 * 가중치: 30% (성향, 관계성)
 */

import {
    AstrologyResult,
    ZODIAC_SIGNS,
    PLANETS,
    ASPECTS,
    HOUSES,
} from '../../engines/astrology';

export const ASTRO_RULES = {
    version: '2.0.0',
    weight: 0.30,
    role: '성향, 관계, 타고난 기질 (천체 계산 기반)',

    // ============ 행성 (Planets) ============
    planets: {
        Sun: { korean: '태양', keyword: '자아, 정체성, 목표', cycle: '1개월/별자리' },
        Moon: { korean: '달', keyword: '감정, 무의식, 습관', cycle: '2.5일/별자리' },
        Mercury: { korean: '수성', keyword: '소통, 사고, 학습', cycle: '3-4주/별자리' },
        Venus: { korean: '금성', keyword: '사랑, 미, 가치', cycle: '4-5주/별자리' },
        Mars: { korean: '화성', keyword: '행동, 열정, 분노', cycle: '6-7주/별자리' },
        Jupiter: { korean: '목성', keyword: '확장, 행운, 철학', cycle: '1년/별자리' },
        Saturn: { korean: '토성', keyword: '제한, 책임, 성숙', cycle: '2.5년/별자리' },
        Uranus: { korean: '천왕성', keyword: '혁신, 독립, 반전', cycle: '7년/별자리' },
        Neptune: { korean: '해왕성', keyword: '꿈, 환상, 영성', cycle: '14년/별자리' },
        Pluto: { korean: '명왕성', keyword: '변혁, 죽음/재생', cycle: '12-30년/별자리' }
    },

    // ============ 12 별자리 (Signs) ============
    signs: {
        Aries: { korean: '양자리', element: 'Fire', mode: 'Cardinal', ruler: 'Mars', trait: '개척, 용기' },
        Taurus: { korean: '황소자리', element: 'Earth', mode: 'Fixed', ruler: 'Venus', trait: '안정, 인내' },
        Gemini: { korean: '쌍둥이자리', element: 'Air', mode: 'Mutable', ruler: 'Mercury', trait: '소통, 호기심' },
        Cancer: { korean: '게자리', element: 'Water', mode: 'Cardinal', ruler: 'Moon', trait: '가정, 보호' },
        Leo: { korean: '사자자리', element: 'Fire', mode: 'Fixed', ruler: 'Sun', trait: '자신감, 표현' },
        Virgo: { korean: '처녀자리', element: 'Earth', mode: 'Mutable', ruler: 'Mercury', trait: '분석, 봉사' },
        Libra: { korean: '천칭자리', element: 'Air', mode: 'Cardinal', ruler: 'Venus', trait: '조화, 관계' },
        Scorpio: { korean: '전갈자리', element: 'Water', mode: 'Fixed', ruler: 'Pluto', trait: '강렬, 변혁' },
        Sagittarius: { korean: '사수자리', element: 'Fire', mode: 'Mutable', ruler: 'Jupiter', trait: '탐험, 철학' },
        Capricorn: { korean: '염소자리', element: 'Earth', mode: 'Cardinal', ruler: 'Saturn', trait: '야망, 책임' },
        Aquarius: { korean: '물병자리', element: 'Air', mode: 'Fixed', ruler: 'Uranus', trait: '혁신, 인도주의' },
        Pisces: { korean: '물고기자리', element: 'Water', mode: 'Mutable', ruler: 'Neptune', trait: '직관, 공감' }
    },

    // ============ 12 하우스 (Houses) ============
    houses: {
        1: { area: '자아', keyword: '외모, 성격, 첫인상', question: '나는 누구인가?' },
        2: { area: '재물', keyword: '돈, 소유, 가치관', question: '무엇을 가지는가?' },
        3: { area: '소통', keyword: '형제, 학습, 단거리', question: '어떻게 표현하는가?' },
        4: { area: '가정', keyword: '뿌리, 부모, 집', question: '어디서 왔는가?' },
        5: { area: '창조', keyword: '연애, 취미, 자녀', question: '무엇을 창조하는가?' },
        6: { area: '일상', keyword: '건강, 직장, 봉사', question: '어떻게 개선하는가?' },
        7: { area: '관계', keyword: '파트너, 계약, 타인', question: '누구와 함께하는가?' },
        8: { area: '변혁', keyword: '죽음, 섹스, 타인 돈', question: '무엇을 공유하는가?' },
        9: { area: '확장', keyword: '철학, 여행, 고등교육', question: '무엇을 믿는가?' },
        10: { area: '사회', keyword: '직업, 명예, 공적 이미지', question: '무엇을 이루는가?' },
        11: { area: '공동체', keyword: '친구, 희망, 단체', question: '어떤 미래를 원하는가?' },
        12: { area: '무의식', keyword: '카르마, 비밀, 영성', question: '무엇을 놓아야 하는가?' }
    },

    // ============ 각도 (Aspects) ============
    aspects: {
        conjunction: { degree: 0, nature: 'fusion', effect: '에너지 증폭' },
        sextile: { degree: 60, nature: 'harmony', effect: '기회, 협력 (+)' },
        square: { degree: 90, nature: 'tension', effect: '도전, 성장통 (-)' },
        trine: { degree: 120, nature: 'flow', effect: '자연스러운 재능 (+)' },
        opposition: { degree: 180, nature: 'polarity', effect: '균형 필요, 갈등 (-)' }
    },

    // ============ 사주 원소 대응 ============
    elementMapping: {
        Fire: { saju: '火 (화)', shared: '열정, 표현, 리더십' },
        Earth: { saju: '土 (토)', shared: '안정, 현실, 실용' },
        Air: { saju: '金 (금)', shared: '사고, 소통, 논리' },
        Water: { saju: '水 (수)', shared: '감정, 직관, 유연' }
    }
};

/**
 * AstrologyResult를 AI 프롬프트 컨텍스트로 변환
 */
export function formatAstrologyForPrompt(astro: AstrologyResult, lang: 'ko' | 'en' = 'ko'): string {
    const lines: string[] = [];

    lines.push(lang === 'ko' ? '=== 점성술 분석 ===' : '=== Astrology Analysis ===');

    // 1. Big 3
    lines.push('');
    lines.push(lang === 'ko' ? '【Big 3】' : '【Big 3】');
    lines.push(`${lang === 'ko' ? '태양' : 'Sun'}: ${ZODIAC_SIGNS[astro.sunSign].name} (${ZODIAC_SIGNS[astro.sunSign].element})`);
    lines.push(`${lang === 'ko' ? '달' : 'Moon'}: ${ZODIAC_SIGNS[astro.moonSign].name} (${ZODIAC_SIGNS[astro.moonSign].element})`);
    lines.push(`${lang === 'ko' ? '상승궁' : 'Ascendant'}: ${ZODIAC_SIGNS[astro.ascendant].name}`);

    // 2. 행성 위치
    if (astro.planets && astro.planets.length > 0) {
        lines.push('');
        lines.push(lang === 'ko' ? '【행성 위치】' : '【Planet Positions】');
        astro.planets.slice(0, 7).forEach(p => { // 주요 7행성만
            const signName = ZODIAC_SIGNS[p.sign].name;
            const houseName = HOUSES[p.house - 1]?.name || `${p.house}하우스`;
            lines.push(`${PLANETS[p.planet].name}: ${signName} ${p.house}하우스 (${houseName})`);
        });
    }

    // 3. 행성 품위
    if (astro.dignities && Object.keys(astro.dignities).length > 0) {
        const significantDignities = Object.entries(astro.dignities).filter(([_, d]) => Math.abs(d.score) >= 4);
        if (significantDignities.length > 0) {
            lines.push('');
            lines.push(lang === 'ko' ? '【행성 품위 (중요)】' : '【Planet Dignities (Significant)】');
            significantDignities.forEach(([planet, dignity]) => {
                const scoreStr = dignity.score > 0 ? `+${dignity.score}` : dignity.score;
                lines.push(`${PLANETS[planet as keyof typeof PLANETS].name}: ${dignity.dignity} (${scoreStr})`);
            });
        }
    }

    // 4. 강력한 Aspects
    if (astro.enhancedAspects && astro.enhancedAspects.length > 0) {
        lines.push('');
        lines.push(lang === 'ko' ? '【주요 Aspects】' : '【Major Aspects】');
        const strongAspects = astro.enhancedAspects
            .filter(a => a.strength === 'strong')
            .slice(0, 5);

        strongAspects.forEach(a => {
            const aspectDef = ASPECTS[a.aspect];
            const icon = a.harmony === 'soft' ? '✦' : a.harmony === 'hard' ? '⚠' : '○';
            lines.push(`  ${icon} ${PLANETS[a.planet1].name} ${aspectDef.name} ${PLANETS[a.planet2].name}`);
        });
    }

    // 5. 차트 패턴
    if (astro.patterns && astro.patterns.length > 0) {
        lines.push('');
        lines.push(lang === 'ko' ? '【차트 패턴】' : '【Chart Patterns】');
        astro.patterns.forEach(p => {
            const icon = p.score > 0 ? '✦' : p.score < 0 ? '⚠' : '○';
            lines.push(`  ${icon} ${p.name}: ${p.description}`);
        });
    }

    return lines.join('\n');
}

/**
 * 점성술 해석 지시문 생성
 */
export function getAstrologyInterpretationDirective(astro: AstrologyResult, lang: 'ko' | 'en' = 'ko'): string {
    const astroContext = formatAstrologyForPrompt(astro, lang);
    const sunSign = ZODIAC_SIGNS[astro.sunSign].name;
    const moonSign = ZODIAC_SIGNS[astro.moonSign].name;
    const ascSign = ZODIAC_SIGNS[astro.ascendant].name;

    if (lang === 'ko') {
        return `
<ASTROLOGY_ANALYSIS>
${astroContext}
</ASTROLOGY_ANALYSIS>

<ASTROLOGY_INTERPRETATION_RULES>
1. 위 점성술 분석은 정확한 천체 계산 기반입니다.
2. Big 3 (태양${sunSign}, 달${moonSign}, 상승${ascSign})를 중심으로 해석하세요.
3. 행성 품위(Dignities)가 높은(+4~5) 행성은 강점, 낮은(-4~5) 행성은 보완점으로 언급하세요.
4. 강력한 Aspects는 성격과 관계에 큰 영향을 미칩니다.
5. 차트 패턴(Grand Trine, T-Square 등)은 전체적인 삶의 구조를 나타냅니다.
6. 점성술은 성향/관계(30% 가중치)이므로, 사주/타로와 교차 검증하세요.
</ASTROLOGY_INTERPRETATION_RULES>
`;
    } else {
        return `
<ASTROLOGY_ANALYSIS>
${astroContext}
</ASTROLOGY_ANALYSIS>

<ASTROLOGY_INTERPRETATION_RULES>
1. The astrology analysis above is based on accurate astronomical calculations.
2. Focus on Big 3 (Sun in ${sunSign}, Moon in ${moonSign}, Asc in ${ascSign}).
3. High Dignities (+4~5) = strengths; Low Dignities (-4~5) = areas to improve.
4. Strong Aspects significantly influence personality and relationships.
5. Chart Patterns represent overall life structure.
6. Astrology is 30% weight - cross-validate with Saju/Tarot.
</ASTROLOGY_INTERPRETATION_RULES>
`;
    }
}

export default ASTRO_RULES;
