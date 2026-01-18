/**
 * 점성술 (Astrology) 계산 엔진
 * 행성 위치 및 하우스 계산
 */

// 황도 12궁
export const ZODIAC_SIGNS = [
    { name: '양자리', symbol: '♈', element: 'fire', modality: 'cardinal' },
    { name: '황소자리', symbol: '♉', element: 'earth', modality: 'fixed' },
    { name: '쌍둥이자리', symbol: '♊', element: 'air', modality: 'mutable' },
    { name: '게자리', symbol: '♋', element: 'water', modality: 'cardinal' },
    { name: '사자자리', symbol: '♌', element: 'fire', modality: 'fixed' },
    { name: '처녀자리', symbol: '♍', element: 'earth', modality: 'mutable' },
    { name: '천칭자리', symbol: '♎', element: 'air', modality: 'cardinal' },
    { name: '전갈자리', symbol: '♏', element: 'water', modality: 'fixed' },
    { name: '궁수자리', symbol: '♐', element: 'fire', modality: 'mutable' },
    { name: '염소자리', symbol: '♑', element: 'earth', modality: 'cardinal' },
    { name: '물병자리', symbol: '♒', element: 'air', modality: 'fixed' },
    { name: '물고기자리', symbol: '♓', element: 'water', modality: 'mutable' },
] as const;

// 행성
export const PLANETS = {
    sun: { name: '태양', symbol: '☉', meaning: '자아, 정체성' },
    moon: { name: '달', symbol: '☽', meaning: '감정, 본능' },
    mercury: { name: '수성', symbol: '☿', meaning: '의사소통, 사고' },
    venus: { name: '금성', symbol: '♀', meaning: '사랑, 미적 감각' },
    mars: { name: '화성', symbol: '♂', meaning: '행동, 에너지' },
    jupiter: { name: '목성', symbol: '♃', meaning: '확장, 행운' },
    saturn: { name: '토성', symbol: '♄', meaning: '제한, 책임' },
    uranus: { name: '천왕성', symbol: '♅', meaning: '혁신, 변화' },
    neptune: { name: '해왕성', symbol: '♆', meaning: '직관, 환상' },
    pluto: { name: '명왕성', symbol: '♇', meaning: '변환, 재생' },
} as const;

// 12하우스
export const HOUSES = [
    { number: 1, name: '상승궁', meaning: '자아, 외모' },
    { number: 2, name: '재물궁', meaning: '재산, 가치관' },
    { number: 3, name: '형제궁', meaning: '의사소통, 단거리 여행' },
    { number: 4, name: '가정궁', meaning: '가정, 뿌리' },
    { number: 5, name: '자녀궁', meaning: '창의성, 연애' },
    { number: 6, name: '건강궁', meaning: '건강, 일상' },
    { number: 7, name: '배우자궁', meaning: '파트너십, 결혼' },
    { number: 8, name: '죽음궁', meaning: '변환, 공유 자원' },
    { number: 9, name: '여행궁', meaning: '철학, 장거리 여행' },
    { number: 10, name: '사회궁', meaning: '커리어, 명성' },
    { number: 11, name: '우정궁', meaning: '친구, 희망' },
    { number: 12, name: '무의식궁', meaning: '영성, 숨겨진 것' },
] as const;

// 각도 (Aspects) - Major + Minor
export const ASPECTS = {
    // Major Aspects (주요 각도)
    conjunction: { angle: 0, orb: 10, name: '합', nameEn: 'Conjunction', meaning: '융합, 강화', type: 'major', harmony: 'neutral' },
    opposition: { angle: 180, orb: 10, name: '충', nameEn: 'Opposition', meaning: '긴장, 균형 필요', type: 'major', harmony: 'hard' },
    trine: { angle: 120, orb: 8, name: '삼합', nameEn: 'Trine', meaning: '조화, 행운', type: 'major', harmony: 'soft' },
    square: { angle: 90, orb: 8, name: '사각', nameEn: 'Square', meaning: '도전, 성장', type: 'major', harmony: 'hard' },
    sextile: { angle: 60, orb: 6, name: '육합', nameEn: 'Sextile', meaning: '기회, 협력', type: 'major', harmony: 'soft' },
    // Minor Aspects (보조 각도)
    semisextile: { angle: 30, orb: 3, name: '반육합', nameEn: 'Semi-sextile', meaning: '미세 조정', type: 'minor', harmony: 'soft' },
    semisquare: { angle: 45, orb: 3, name: '반사각', nameEn: 'Semi-square', meaning: '내적 긴장', type: 'minor', harmony: 'hard' },
    sesquiquadrate: { angle: 135, orb: 3, name: '세스퀴사각', nameEn: 'Sesquiquadrate', meaning: '좌절, 돌파', type: 'minor', harmony: 'hard' },
    quincunx: { angle: 150, orb: 3, name: '퀸컨스', nameEn: 'Quincunx', meaning: '조정 필요, 건강', type: 'minor', harmony: 'hard' },
    quintile: { angle: 72, orb: 2, name: '퀸타일', nameEn: 'Quintile', meaning: '재능, 창의성', type: 'minor', harmony: 'soft' },
    biquintile: { angle: 144, orb: 2, name: '바이퀸타일', nameEn: 'Bi-quintile', meaning: '숙련된 재능', type: 'minor', harmony: 'soft' },
} as const;

// 행성 품위 (Dignities)
export interface DignityInfo {
    domicile: string[];   // Rulership (+5)
    exaltation: string[]; // (+4)
    detriment: string[];  // (-5)
    fall: string[];       // (-4)
}

// 각 행성별 품위 테이블 (Modern + Traditional mix)
export const PLANET_DIGNITIES: Record<string, DignityInfo> = {
    sun: {
        domicile: ['사자자리'],
        exaltation: ['양자리'],
        detriment: ['물병자리'],
        fall: ['천칭자리']
    },
    moon: {
        domicile: ['게자리'],
        exaltation: ['황소자리'],
        detriment: ['염소자리'],
        fall: ['전갈자리']
    },
    mercury: {
        domicile: ['쌍둥이자리', '처녀자리'],
        exaltation: ['처녀자리'], // 처녀자리는 룰러십이자 고양
        detriment: ['궁수자리', '물고기자리'],
        fall: ['물고기자리']
    },
    venus: {
        domicile: ['황소자리', '천칭자리'],
        exaltation: ['물고기자리'],
        detriment: ['전갈자리', '양자리'],
        fall: ['처녀자리']
    },
    mars: {
        domicile: ['양자리', '전갈자리'], // 전갈자리는 현대에서 명왕성이지만 고전은 화성
        exaltation: ['염소자리'],
        detriment: ['천칭자리', '황소자리'],
        fall: ['게자리']
    },
    jupiter: {
        domicile: ['궁수자리', '물고기자리'], // 물고기자리는 현대에서 해왕성이지만 고전은 목성
        exaltation: ['게자리'],
        detriment: ['쌍둥이자리', '처녀자리'],
        fall: ['염소자리']
    },
    saturn: {
        domicile: ['염소자리', '물병자리'], // 물병자리는 현대에서 천왕성이지만 고전은 토성
        exaltation: ['천칭자리'],
        detriment: ['게자리', '사자자리'],
        fall: ['양자리']
    },
    uranus: {
        domicile: ['물병자리'],
        exaltation: ['전갈자리'],
        detriment: ['사자자리'],
        fall: ['황소자리']
    },
    neptune: {
        domicile: ['물고기자리'],
        exaltation: ['게자리'], // 논란 있음, 흔히 게자리/사자자리
        detriment: ['처녀자리'],
        fall: ['염소자리']
    },
    pluto: {
        domicile: ['전갈자리'],
        exaltation: ['사자자리'], // 논란 있음, 흔히 사자자리/양자리
        detriment: ['황소자리'],
        fall: ['물병자리']
    }
};

// 행성별 오브 조정 (태양/달은 넓게, 외행성은 좁게)
export const PLANET_ORB_MODIFIERS: Record<string, number> = {
    sun: 1.2,      // +20%
    moon: 1.2,     // +20%
    mercury: 1.0,
    venus: 1.0,
    mars: 1.0,
    jupiter: 0.9,
    saturn: 0.9,
    uranus: 0.8,   // -20%
    neptune: 0.8,  // -20%
    pluto: 0.7,    // -30%
};

// 결과 타입
export interface PlanetPosition {
    planet: keyof typeof PLANETS;
    sign: number; // 0-11
    degree: number; // 0-29.99
    house: number; // 1-12
    longitude?: number; // 0-359.99 (전체 황경)
}

// 강화된 Aspect 결과
export interface EnhancedAspectResult {
    planet1: keyof typeof PLANETS;
    planet2: keyof typeof PLANETS;
    aspect: keyof typeof ASPECTS;
    orb: number;
    exactness: number;        // 0-100 (100 = 정확한 각도)
    applying: boolean;        // 접근 중 (더 강함) vs 분리 중
    strength: 'strong' | 'medium' | 'weak';
    harmony: 'soft' | 'hard' | 'neutral';
}

// 품위 결과
export interface PlanetDignityResult {
    planet: keyof typeof PLANETS;
    dignity: 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine'; // peregrine = 일반
    score: number;
    description: string;
}

// 차트 패턴
export interface ChartPattern {
    name: string;
    nameEn: string;
    planets: (keyof typeof PLANETS)[];
    description: string;
    score: number;
}

// 기존 호환용
export interface AspectResult {
    planet1: keyof typeof PLANETS;
    planet2: keyof typeof PLANETS;
    aspect: keyof typeof ASPECTS;
    orb: number;
}

export interface AstrologyResult {
    sunSign: number;
    moonSign: number;
    ascendant: number;
    planets: PlanetPosition[];
    aspects: AspectResult[];
    // Phase 1: 강화된 Aspect
    enhancedAspects?: EnhancedAspectResult[];
    // Phase 2: 행성 품위
    dignities?: Record<string, PlanetDignityResult>;
    // Phase 3: 차트 패턴
    patterns?: ChartPattern[];
}

// 율리우스 날짜 계산 (UTC 기준)
function toJulianDate(date: Date): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;

    let y = year;
    let m = month;

    if (m <= 2) {
        y -= 1;
        m += 12;
    }

    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);

    return Math.floor(365.25 * (y + 4716)) +
        Math.floor(30.6001 * (m + 1)) +
        day + B - 1524.5;
}

/**
 * 태양 위치 계산 (간략화된 버전)
 */
function calculateSunPosition(julianDate: number): { sign: number; degree: number } {
    // T = 율리우스 세기
    const T = (julianDate - 2451545.0) / 36525;

    // 평균 황경
    let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    L0 = L0 % 360;
    if (L0 < 0) L0 += 360;

    // 평균 근점
    let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    M = M * Math.PI / 180;

    // 태양의 황경 보정
    const C = (1.914602 - 0.004817 * T) * Math.sin(M) +
        (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
        0.000289 * Math.sin(3 * M);

    let sunLongitude = L0 + C;
    sunLongitude = sunLongitude % 360;
    if (sunLongitude < 0) sunLongitude += 360;

    const sign = Math.floor(sunLongitude / 30);
    const degree = sunLongitude % 30;

    return { sign, degree };
}

/**
 * 달 위치 계산 (간략화된 버전)
 */
function calculateMoonPosition(julianDate: number): { sign: number; degree: number } {
    const T = (julianDate - 2451545.0) / 36525;

    // 달의 평균 황경
    let L = 218.3165 + 481267.8813 * T;
    L = L % 360;
    if (L < 0) L += 360;

    const sign = Math.floor(L / 30);
    const degree = L % 30;

    return { sign, degree };
}

/**
 * 상승궁 (Ascendant) 계산 (간략화)
 */
function calculateAscendant(
    julianDate: number,
    latitude: number,
    longitude: number
): number {
    // 지역 항성시 계산
    const T = (julianDate - 2451545.0) / 36525;
    let GMST = 280.46061837 + 360.98564736629 * (julianDate - 2451545.0) +
        0.000387933 * T * T;
    GMST = GMST % 360;

    const LST = (GMST + longitude) % 360;

    // 상승궁 계산 (간략화)
    const obliquity = 23.439 - 0.00013 * T;
    const oblRad = obliquity * Math.PI / 180;
    const latRad = latitude * Math.PI / 180;
    const lstRad = LST * Math.PI / 180;

    let ascendant = Math.atan2(
        Math.cos(lstRad),
        -(Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad))
    ) * 180 / Math.PI;

    if (ascendant < 0) ascendant += 360;

    return Math.floor(ascendant / 30);
}

/**
 * 행성들의 하우스 배치 계산 (간략화)
 */
function calculatePlanetHouses(
    planets: { sign: number; degree: number }[],
    ascendant: number
): number[] {
    return planets.map(planet => {
        const longitude = planet.sign * 30 + planet.degree;
        const ascLongitude = ascendant * 30;
        let house = Math.floor(((longitude - ascLongitude + 360) % 360) / 30) + 1;
        if (house > 12) house -= 12;
        return house;
    });
}

/**
 * 행성 간 각도 (Aspect) 계산
 */
function calculateAspects(planets: PlanetPosition[]): AspectResult[] {
    const aspects: AspectResult[] = [];
    const planetKeys = Object.keys(PLANETS) as (keyof typeof PLANETS)[];

    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            const long1 = planets[i].sign * 30 + planets[i].degree;
            const long2 = planets[j].sign * 30 + planets[j].degree;

            let diff = Math.abs(long1 - long2);
            if (diff > 180) diff = 360 - diff;

            // 각 Aspect 확인 (Major만)
            for (const [aspectKey, aspectDef] of Object.entries(ASPECTS)) {
                if (aspectDef.type !== 'major') continue; // 호환성: major만
                const orb = Math.abs(diff - aspectDef.angle);
                if (orb <= aspectDef.orb) {
                    aspects.push({
                        planet1: planetKeys[i],
                        planet2: planetKeys[j],
                        aspect: aspectKey as keyof typeof ASPECTS,
                        orb,
                    });
                }
            }
        }
    }

    return aspects;
}

/**
 * 강화된 Aspect 계산 (Phase 1)
 * - 행성별 오브 조정
 * - 정확도 점수화
 * - Applying/Separating 구분
 */
export function calculateEnhancedAspects(planets: PlanetPosition[]): EnhancedAspectResult[] {
    const aspects: EnhancedAspectResult[] = [];
    const planetKeys = Object.keys(PLANETS) as (keyof typeof PLANETS)[];

    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            const p1 = planets[i];
            const p2 = planets[j];

            const long1 = p1.sign * 30 + p1.degree;
            const long2 = p2.sign * 30 + p2.degree;

            let diff = long1 - long2;
            // 정규화
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            const absDiff = Math.abs(diff);

            // 행성별 오브 조정
            const orb1 = PLANET_ORB_MODIFIERS[p1.planet] || 1.0;
            const orb2 = PLANET_ORB_MODIFIERS[p2.planet] || 1.0;
            const orbModifier = (orb1 + orb2) / 2;

            // 각 Aspect 확인
            for (const [aspectKey, aspectDef] of Object.entries(ASPECTS)) {
                const adjustedOrb = aspectDef.orb * orbModifier;
                const orbDistance = Math.abs(absDiff - aspectDef.angle);

                if (orbDistance <= adjustedOrb) {
                    // 정확도 계산 (0-100, 100 = 정확한 각도)
                    const exactness = Math.round((1 - orbDistance / adjustedOrb) * 100);

                    // Applying vs Separating (단순화: diff 부호로 판단)
                    // 실제로는 행성 속도 비교 필요하지만 근사치
                    const applying = diff > 0; // planet1이 앞서있고 다가가는 중

                    // 강도 결정
                    let strength: 'strong' | 'medium' | 'weak';
                    if (exactness >= 80 && aspectDef.type === 'major') {
                        strength = 'strong';
                    } else if (exactness >= 50 || aspectDef.type === 'major') {
                        strength = 'medium';
                    } else {
                        strength = 'weak';
                    }

                    aspects.push({
                        planet1: planetKeys[i],
                        planet2: planetKeys[j],
                        aspect: aspectKey as keyof typeof ASPECTS,
                        orb: orbDistance,
                        exactness,
                        applying,
                        strength,
                        harmony: aspectDef.harmony as 'soft' | 'hard' | 'neutral',
                    });
                }
            }
        }
    }

    // 강도순 정렬 (strong > medium > weak, 같으면 exactness)
    aspects.sort((a, b) => {
        const strengthOrder = { strong: 0, medium: 1, weak: 2 };
        if (strengthOrder[a.strength] !== strengthOrder[b.strength]) {
            return strengthOrder[a.strength] - strengthOrder[b.strength];
        }
        return b.exactness - a.exactness;
    });

    return aspects;
}

/**
 * Aspect 요약 생성
 */
export function getAspectSummary(aspects: EnhancedAspectResult[]): {
    totalCount: number;
    majorCount: number;
    minorCount: number;
    softCount: number;
    hardCount: number;
    strongAspects: string[];
} {
    const majorAspects = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];

    const majorCount = aspects.filter(a => majorAspects.includes(a.aspect)).length;
    const minorCount = aspects.length - majorCount;
    const softCount = aspects.filter(a => a.harmony === 'soft').length;
    const hardCount = aspects.filter(a => a.harmony === 'hard').length;

    const strongAspects = aspects
        .filter(a => a.strength === 'strong')
        .map(a => {
            const def = ASPECTS[a.aspect];
            return `${PLANETS[a.planet1].name}${def.name}${PLANETS[a.planet2].name}`;
        });

    return {
        totalCount: aspects.length,
        majorCount,
        minorCount,
        softCount,
        hardCount,
        strongAspects,
    };
}

/**
 * 차트 패턴 감지 (Phase 3)
 */
export function detectChartPatterns(
    planets: PlanetPosition[],
    aspects: EnhancedAspectResult[]
): ChartPattern[] {
    const patterns: ChartPattern[] = [];

    // Grand Trine (대삼합): 3개 행성이 120도씩 3개의 Trine
    const trines = aspects.filter(a => a.aspect === 'trine');
    if (trines.length >= 3) {
        // 모든 3개 조합 확인
        for (let i = 0; i < trines.length; i++) {
            for (let j = i + 1; j < trines.length; j++) {
                for (let k = j + 1; k < trines.length; k++) {
                    const t1 = trines[i];
                    const t2 = trines[j];
                    const t3 = trines[k];

                    // 3개 행성 추출
                    const planetsInvolved = new Set([
                        t1.planet1, t1.planet2,
                        t2.planet1, t2.planet2,
                        t3.planet1, t3.planet2
                    ]);

                    if (planetsInvolved.size === 3) {
                        patterns.push({
                            name: '대삼합',
                            nameEn: 'Grand Trine',
                            planets: Array.from(planetsInvolved) as (keyof typeof PLANETS)[],
                            description: '강력한 조화와 행운의 흐름. 재능이 자연스럽게 발휘됨',
                            score: 10
                        });
                        break;
                    }
                }
            }
        }
    }

    // T-Square: 2개의 Square + 1개의 Opposition
    const squares = aspects.filter(a => a.aspect === 'square');
    const oppositions = aspects.filter(a => a.aspect === 'opposition');

    if (squares.length >= 2 && oppositions.length >= 1) {
        for (const opp of oppositions) {
            for (const sq1 of squares) {
                for (const sq2 of squares) {
                    if (sq1 === sq2) continue;

                    const planetsInvolved = new Set([
                        opp.planet1, opp.planet2,
                        sq1.planet1, sq1.planet2,
                        sq2.planet1, sq2.planet2
                    ]);

                    if (planetsInvolved.size === 3) {
                        patterns.push({
                            name: 'T스퀘어',
                            nameEn: 'T-Square',
                            planets: Array.from(planetsInvolved) as (keyof typeof PLANETS)[],
                            description: '강한 내적 긴장과 동기부여. 도전을 통한 성장',
                            score: -3
                        });
                        break;
                    }
                }
            }
        }
    }

    // Grand Cross (대십자): 4개 행성이 2개의 Opposition + 4개의 Square
    if (oppositions.length >= 2 && squares.length >= 4) {
        for (let i = 0; i < oppositions.length; i++) {
            for (let j = i + 1; j < oppositions.length; j++) {
                const planetsInvolved = new Set([
                    oppositions[i].planet1, oppositions[i].planet2,
                    oppositions[j].planet1, oppositions[j].planet2
                ]);

                if (planetsInvolved.size === 4) {
                    patterns.push({
                        name: '대십자',
                        nameEn: 'Grand Cross',
                        planets: Array.from(planetsInvolved) as (keyof typeof PLANETS)[],
                        description: '극도의 긴장과 위기. 강한 의지력과 인내 필요',
                        score: -8
                    });
                    break;
                }
            }
        }
    }

    // Stellium (스텔리움): 같은 별자리에 3개 이상의 행성
    const signGroups: Record<number, (keyof typeof PLANETS)[]> = {};
    planets.forEach(p => {
        if (!signGroups[p.sign]) signGroups[p.sign] = [];
        signGroups[p.sign].push(p.planet);
    });

    Object.entries(signGroups).forEach(([sign, planetsInSign]) => {
        if (planetsInSign.length >= 3) {
            patterns.push({
                name: '스텔리움',
                nameEn: 'Stellium',
                planets: planetsInSign as (keyof typeof PLANETS)[],
                description: `${ZODIAC_SIGNS[parseInt(sign)].name}에 에너지 집중. 강력하지만 편향될 수 있음`,
                score: 5
            });
        }
    });

    // Yod (요드/핑거 오브 갓): 2개의 Quincunx + 1개의 Sextile
    const quincunxes = aspects.filter(a => a.aspect === 'quincunx');
    const sextiles = aspects.filter(a => a.aspect === 'sextile');

    if (quincunxes.length >= 2 && sextiles.length >= 1) {
        for (const sextile of sextiles) {
            for (const q1 of quincunxes) {
                for (const q2 of quincunxes) {
                    if (q1 === q2) continue;

                    const planetsInvolved = new Set([
                        sextile.planet1, sextile.planet2,
                        q1.planet1, q1.planet2,
                        q2.planet1, q2.planet2
                    ]);

                    if (planetsInvolved.size === 3) {
                        patterns.push({
                            name: '요드',
                            nameEn: 'Yod',
                            planets: Array.from(planetsInvolved) as (keyof typeof PLANETS)[],
                            description: '운명의 손가락. 특별한 사명이나 조정이 필요한 영역',
                            score: 3
                        });
                        break;
                    }
                }
            }
        }
    }

    return patterns;
}

/**
 * 행성 품위 계산 (Phase 2)
 */
export function calculateDignities(planets: PlanetPosition[]): Record<string, PlanetDignityResult> {
    const results: Record<string, PlanetDignityResult> = {};

    planets.forEach(pos => {
        const signName = ZODIAC_SIGNS[pos.sign].name;
        const planetKey = pos.planet;
        const dignityInfo = PLANET_DIGNITIES[planetKey];

        if (!dignityInfo) return; // 10행성 외 (노드 등) 제외

        let dignity: PlanetDignityResult['dignity'] = 'peregrine';
        let score = 0;
        let description = '일반적인 상태';

        if (dignityInfo.domicile.includes(signName)) {
            dignity = 'domicile';
            score = 5;
            description = '본거지 (Rulership): 행성의 힘이 가장 강력하고 자연스럽게 발휘됨';
        } else if (dignityInfo.exaltation.includes(signName)) {
            dignity = 'exaltation';
            score = 4;
            description = '고양 (Exaltation): 행성의 힘이 명예롭게 드러나고 존중받음';
        } else if (dignityInfo.detriment.includes(signName)) {
            dignity = 'detriment';
            score = -5;
            description = '불리 (Detriment): 본거지 반대편, 행성의 힘이 약화되거나 왜곡됨';
        } else if (dignityInfo.fall.includes(signName)) {
            dignity = 'fall';
            score = -4;
            description = '추락 (Fall): 고양 반대편, 행성의 힘을 쓰기 어렵고 불편함';
        }

        results[planetKey] = {
            planet: planetKey,
            dignity,
            score,
            description
        };
    });

    return results;
}

/**
 * 메인 점성술 계산 함수
 */
export function calculateAstrology(
    birthDate: Date,
    birthTime: string = '12:00',
    latitude: number = 37.5665, // 서울 기본값
    longitude: number = 126.9780,
    timezoneOffset: number = 9 // Timezone Offset (시간), 기본값 KST (+9)
): AstrologyResult {
    // 시간 파싱
    const [hourStr, minuteStr] = birthTime.split(':');

    // UTC 시간으로 변환하여 Date 객체 생성
    // 입력된 시간(Local) - TimezoneOffset = UTC 시간
    // 예: 15:10 KST -> 15 - 9 = 06 UTC
    const utcDate = new Date(birthDate);
    utcDate.setUTCHours(parseInt(hourStr) - timezoneOffset, parseInt(minuteStr), 0, 0);

    const jd = toJulianDate(utcDate);
    // 태양, 달 위치 계산
    const sunPos = calculateSunPosition(jd);
    const moonPos = calculateMoonPosition(jd);

    // 상승궁 계산
    const ascendant = calculateAscendant(jd, latitude, longitude);

    // 나머지 행성들 (VSOP87 기반 정확한 계산)
    const otherPlanets = calculateAllPlanetPositions(jd);

    // 모든 행성 위치
    const planetPositions = [
        sunPos,
        moonPos,
        ...otherPlanets,
    ];

    const houses = calculatePlanetHouses(planetPositions, ascendant);

    const planetKeys = Object.keys(PLANETS) as (keyof typeof PLANETS)[];
    const planets: PlanetPosition[] = planetPositions.map((pos, index) => ({
        planet: planetKeys[index],
        sign: pos.sign,
        degree: pos.degree,
        house: houses[index],
    }));

    // Aspect 계산
    const aspects = calculateAspects(planets);

    // Phase 1: 강화된 Aspect 계산
    const enhancedAspects = calculateEnhancedAspects(planets);

    // Phase 2: 행성 품위 계산
    const dignities = calculateDignities(planets);

    // Phase 3: 차트 패턴 감지
    const patterns = detectChartPatterns(planets, enhancedAspects);

    return {
        sunSign: sunPos.sign,
        moonSign: moonPos.sign,
        ascendant,
        planets,
        aspects,
        enhancedAspects,
        dignities,
        patterns,
    };
}

/**
 * 각도를 라디안으로 변환
 */
function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}

/**
 * 라디안을 각도로 변환
 */
function toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
}

/**
 * 각도를 0-360 범위로 정규화
 */
function normalizeDegrees(degrees: number): number {
    let result = degrees % 360;
    if (result < 0) result += 360;
    return result;
}

/**
 * 케플러 방정식 풀이 (이심이상 계산)
 */
function solveKepler(M: number, e: number): number {
    const tolerance = 1e-8;
    let E = M;
    for (let i = 0; i < 50; i++) {
        const delta = E - e * Math.sin(E) - M;
        if (Math.abs(delta) < tolerance) break;
        E = E - delta / (1 - e * Math.cos(E));
    }
    return E;
}

/**
 * 수성 위치 계산 (VSOP87 축약)
 */
function calculateMercuryPosition(jd: number): { sign: number; degree: number; longitude: number } {
    const T = (jd - 2451545.0) / 36525;

    // 궤도 요소 (J2000.0 기준 + 세기당 변화량)
    const a = 0.38709927 + 0.00000037 * T;  // 장반경 (AU)
    const e = 0.20563593 + 0.00001906 * T;  // 이심률
    const I = toRadians(7.00497902 - 0.00594749 * T);  // 궤도 경사
    const L = normalizeDegrees(252.25032350 + 149472.67411175 * T);  // 평균 황경
    const longPeri = normalizeDegrees(77.45779628 + 0.16047689 * T);  // 근일점 경도
    const longNode = normalizeDegrees(48.33076593 - 0.12534081 * T);  // 승교점 경도

    // 평균 근점각
    const M = toRadians(normalizeDegrees(L - longPeri));

    // 케플러 방정식으로 이심이상 계산
    const E = solveKepler(M, e);

    // 진근점각
    const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    // 태양으로부터의 거리
    const r = a * (1 - e * Math.cos(E));

    // 궤도면에서의 위치
    const xOrbit = r * Math.cos(nu);
    const yOrbit = r * Math.sin(nu);

    // 황도 좌표로 변환
    const longPeriRad = toRadians(longPeri);
    const longNodeRad = toRadians(longNode);
    const omega = longPeriRad - longNodeRad;  // 근일점 인수

    const cosNode = Math.cos(longNodeRad);
    const sinNode = Math.sin(longNodeRad);
    const cosI = Math.cos(I);
    const sinI = Math.sin(I);
    const cosOmega = Math.cos(omega);
    const sinOmega = Math.sin(omega);

    const x = (cosNode * cosOmega - sinNode * sinOmega * cosI) * xOrbit +
        (-cosNode * sinOmega - sinNode * cosOmega * cosI) * yOrbit;
    const y = (sinNode * cosOmega + cosNode * sinOmega * cosI) * xOrbit +
        (-sinNode * sinOmega + cosNode * cosOmega * cosI) * yOrbit;

    // 황경 계산
    let longitude = toDegrees(Math.atan2(y, x));
    longitude = normalizeDegrees(longitude);

    return {
        sign: Math.floor(longitude / 30),
        degree: longitude % 30,
        longitude
    };
}

/**
 * 금성 위치 계산 (VSOP87 축약)
 */
function calculateVenusPosition(jd: number): { sign: number; degree: number; longitude: number } {
    const T = (jd - 2451545.0) / 36525;

    const e = 0.00677672 - 0.00004107 * T;
    const L = normalizeDegrees(181.97909950 + 58517.81538729 * T);
    const longPeri = normalizeDegrees(131.60246718 + 0.00268329 * T);
    const longNode = normalizeDegrees(76.67984255 - 0.27769418 * T);
    const I = toRadians(3.39467605 - 0.00078890 * T);

    const M = toRadians(normalizeDegrees(L - longPeri));
    const E = solveKepler(M, e);

    const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    // 섭동 보정
    const Mj = toRadians(normalizeDegrees(34.35 + 3034.9 * T));  // Jupiter mean anomaly approx
    const perturbation = 0.00313 * Math.cos(2 * M - 2 * Mj - toRadians(148.3));

    let longitude = normalizeDegrees(L + toDegrees(nu - M) + perturbation);

    return {
        sign: Math.floor(longitude / 30),
        degree: longitude % 30,
        longitude
    };
}

/**
 * 화성 위치 계산 (VSOP87 축약)
 */
function calculateMarsPosition(jd: number): { sign: number; degree: number; longitude: number } {
    const T = (jd - 2451545.0) / 36525;

    const e = 0.09339410 + 0.00007882 * T;
    const L = normalizeDegrees(355.45332650 + 19140.30268499 * T);
    const longPeri = normalizeDegrees(336.04084219 + 0.44441088 * T);

    const M = toRadians(normalizeDegrees(L - longPeri));
    const E = solveKepler(M, e);

    const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    // 섭동 보정 (목성/토성 영향)
    const Mj = toRadians(normalizeDegrees(34.35 + 3034.9 * T));
    const perturbation = -0.01133 * Math.sin(Mj) + 0.00678 * Math.cos(2 * Mj);

    let longitude = normalizeDegrees(L + toDegrees(nu - M) + perturbation);

    return {
        sign: Math.floor(longitude / 30),
        degree: longitude % 30,
        longitude
    };
}

/**
 * 목성 위치 계산 (VSOP87 축약)
 */
function calculateJupiterPosition(jd: number): { sign: number; degree: number; longitude: number } {
    const T = (jd - 2451545.0) / 36525;

    const e = 0.04838624 - 0.00013253 * T;
    const L = normalizeDegrees(34.39644051 + 3034.74612775 * T);
    const longPeri = normalizeDegrees(14.72847983 + 0.21252668 * T);

    const M = toRadians(normalizeDegrees(L - longPeri));
    const E = solveKepler(M, e);

    const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    // 토성과의 대섭동
    const Ms = toRadians(normalizeDegrees(50.08 + 1222.11 * T));
    const perturbation = -0.332 * Math.sin(2 * M - 5 * Ms + toRadians(67.6))
        - 0.056 * Math.sin(2 * M - 2 * Ms + toRadians(21))
        + 0.042 * Math.sin(3 * M - 5 * Ms + toRadians(21));

    let longitude = normalizeDegrees(L + toDegrees(nu - M) + perturbation);

    return {
        sign: Math.floor(longitude / 30),
        degree: longitude % 30,
        longitude
    };
}

/**
 * 토성 위치 계산 (VSOP87 축약)
 */
function calculateSaturnPosition(jd: number): { sign: number; degree: number; longitude: number } {
    const T = (jd - 2451545.0) / 36525;

    const e = 0.05386179 - 0.00050991 * T;
    const L = normalizeDegrees(49.94432077 + 1222.49362201 * T);
    const longPeri = normalizeDegrees(92.59887831 - 0.41897216 * T);

    const M = toRadians(normalizeDegrees(L - longPeri));
    const E = solveKepler(M, e);

    const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    // 목성과의 대섭동
    const Mj = toRadians(normalizeDegrees(34.35 + 3034.9 * T));
    const perturbation = 0.812 * Math.sin(2 * M - 5 * Mj + toRadians(67.6))
        - 0.229 * Math.cos(2 * M - 4 * Mj + toRadians(2))
        + 0.119 * Math.sin(M - 2 * Mj + toRadians(3));

    let longitude = normalizeDegrees(L + toDegrees(nu - M) + perturbation);

    return {
        sign: Math.floor(longitude / 30),
        degree: longitude % 30,
        longitude
    };
}

/**
 * 천왕성 위치 계산 (간략화 - 느린 이동)
 */
function calculateUranusPosition(jd: number): { sign: number; degree: number; longitude: number } {
    const T = (jd - 2451545.0) / 36525;

    const e = 0.04725744 - 0.00004397 * T;
    const L = normalizeDegrees(313.23810451 + 428.48202785 * T);
    const longPeri = normalizeDegrees(170.95427630 + 0.40805281 * T);

    const M = toRadians(normalizeDegrees(L - longPeri));
    const E = solveKepler(M, e);

    const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    let longitude = normalizeDegrees(L + toDegrees(nu - M));

    return {
        sign: Math.floor(longitude / 30),
        degree: longitude % 30,
        longitude
    };
}

/**
 * 해왕성 위치 계산 (간략화 - 느린 이동)
 */
function calculateNeptunePosition(jd: number): { sign: number; degree: number; longitude: number } {
    const T = (jd - 2451545.0) / 36525;

    const e = 0.00859048 + 0.00005105 * T;
    const L = normalizeDegrees(304.87997031 + 218.45945325 * T);
    const longPeri = normalizeDegrees(44.96476227 - 0.32241464 * T);

    const M = toRadians(normalizeDegrees(L - longPeri));
    const E = solveKepler(M, e);

    const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    let longitude = normalizeDegrees(L + toDegrees(nu - M));

    return {
        sign: Math.floor(longitude / 30),
        degree: longitude % 30,
        longitude
    };
}

/**
 * 명왕성 위치 계산 (간략화 - 매우 느린 이동)
 */
function calculatePlutoPosition(jd: number): { sign: number; degree: number; longitude: number } {
    const T = (jd - 2451545.0) / 36525;

    // 명왕성은 궤도가 특이하므로 경험적 공식 사용
    const L = normalizeDegrees(238.92903833 + 145.20780515 * T);
    const e = 0.2488273;
    const longPeri = normalizeDegrees(224.06891629 - 0.04062942 * T);

    const M = toRadians(normalizeDegrees(L - longPeri));
    const E = solveKepler(M, e);

    const nu = 2 * Math.atan2(
        Math.sqrt(1 + e) * Math.sin(E / 2),
        Math.sqrt(1 - e) * Math.cos(E / 2)
    );

    let longitude = normalizeDegrees(L + toDegrees(nu - M));

    return {
        sign: Math.floor(longitude / 30),
        degree: longitude % 30,
        longitude
    };
}

/**
 * 모든 행성 위치 계산 (VSOP87 기반)
 * 태양, 달 제외 (별도 계산)
 */
function calculateAllPlanetPositions(jd: number): { sign: number; degree: number }[] {
    return [
        calculateMercuryPosition(jd),
        calculateVenusPosition(jd),
        calculateMarsPosition(jd),
        calculateJupiterPosition(jd),
        calculateSaturnPosition(jd),
        calculateUranusPosition(jd),
        calculateNeptunePosition(jd),
        calculatePlutoPosition(jd),
    ].map(pos => ({ sign: pos.sign, degree: pos.degree }));
}

/**
 * 점성술 결과를 읽기 쉬운 문자열로 변환
 */
export function formatAstrology(result: AstrologyResult | string | null | undefined): string {
    if (!result) return '점성술 정보 없음';
    if (typeof result === 'string') return result;

    const sunSignName = ZODIAC_SIGNS[result.sunSign]?.name || 'Unknown';
    const moonSignName = ZODIAC_SIGNS[result.moonSign]?.name || 'Unknown';
    const ascName = ZODIAC_SIGNS[result.ascendant]?.name || 'Unknown';

    return `태양: ${sunSignName}, 달: ${moonSignName}, 상승궁: ${ascName}`;
}

/**
 * 행성 위치 상세 정보 반환
 */
export function getPlanetInfo(position: PlanetPosition): {
    planetName: string;
    signName: string;
    houseName: string;
    meaning: string;
} {
    const planet = PLANETS[position.planet];
    const sign = ZODIAC_SIGNS[position.sign];
    const house = HOUSES[position.house - 1];

    return {
        planetName: planet.name,
        signName: sign.name,
        houseName: house.name,
        meaning: `${planet.meaning} - ${house.meaning}`,
    };
}
