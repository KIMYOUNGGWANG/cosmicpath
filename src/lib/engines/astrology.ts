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

// 각도 (Aspects)
export const ASPECTS = {
    conjunction: { angle: 0, orb: 8, name: '합', meaning: '융합, 강화' },
    opposition: { angle: 180, orb: 8, name: '충', meaning: '긴장, 균형 필요' },
    trine: { angle: 120, orb: 8, name: '삼합', meaning: '조화, 행운' },
    square: { angle: 90, orb: 8, name: '사각', meaning: '도전, 성장' },
    sextile: { angle: 60, orb: 6, name: '육합', meaning: '기회, 협력' },
} as const;

// 결과 타입
export interface PlanetPosition {
    planet: keyof typeof PLANETS;
    sign: number; // 0-11
    degree: number; // 0-29.99
    house: number; // 1-12
}

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
}

/**
 * 율리우스 날짜 계산
 */
function toJulianDate(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate() + (date.getHours() + date.getMinutes() / 60) / 24;

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

            // 각 Aspect 확인
            for (const [aspectKey, aspectDef] of Object.entries(ASPECTS)) {
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
 * 메인 점성술 계산 함수
 */
export function calculateAstrology(
    birthDate: Date,
    birthTime: string = '12:00',
    latitude: number = 37.5665, // 서울 기본값
    longitude: number = 126.9780
): AstrologyResult {
    // 시간 파싱
    const [hourStr, minuteStr] = birthTime.split(':');
    const birthDateTime = new Date(birthDate);
    birthDateTime.setHours(parseInt(hourStr), parseInt(minuteStr));

    const jd = toJulianDate(birthDateTime);

    // 태양, 달 위치 계산
    const sunPos = calculateSunPosition(jd);
    const moonPos = calculateMoonPosition(jd);

    // 상승궁 계산
    const ascendant = calculateAscendant(jd, latitude, longitude);

    // 나머지 행성들 (간략화 - 실제로는 Swiss Ephemeris 필요)
    // 여기서는 시뮬레이션된 값 사용
    const otherPlanets = generateSimulatedPlanets(jd);

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

    return {
        sunSign: sunPos.sign,
        moonSign: moonPos.sign,
        ascendant,
        planets,
        aspects,
    };
}

/**
 * 나머지 행성 시뮬레이션 (실제 구현시 Swiss Ephemeris 대체 필요)
 */
function generateSimulatedPlanets(jd: number): { sign: number; degree: number }[] {
    const T = (jd - 2451545.0) / 36525;

    // 간략화된 평균 황경 계산
    const meanLongitudes = [
        // Mercury
        (252.250906 + 149472.6746358 * T) % 360,
        // Venus
        (181.979801 + 58517.8156760 * T) % 360,
        // Mars
        (355.433275 + 19140.2993313 * T) % 360,
        // Jupiter
        (34.351484 + 3034.9056746 * T) % 360,
        // Saturn
        (50.077471 + 1222.1137943 * T) % 360,
        // Uranus
        (314.055005 + 428.4669983 * T) % 360,
        // Neptune
        (304.348665 + 218.4862002 * T) % 360,
        // Pluto
        (238.92903833 + 145.20780515 * T) % 360,
    ];

    return meanLongitudes.map(long => {
        const normalized = ((long % 360) + 360) % 360;
        return {
            sign: Math.floor(normalized / 30),
            degree: normalized % 30,
        };
    });
}

/**
 * 점성술 결과를 읽기 쉬운 문자열로 변환
 */
export function formatAstrology(result: AstrologyResult): string {
    const sunSignName = ZODIAC_SIGNS[result.sunSign].name;
    const moonSignName = ZODIAC_SIGNS[result.moonSign].name;
    const ascName = ZODIAC_SIGNS[result.ascendant].name;

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
