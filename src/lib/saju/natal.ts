import type {
  Gender,
  NatalAngles,
  NatalAspect,
  NatalChart,
  NatalHouse,
  PlanetId,
  PlanetPosition,
  ZodiacSign,
} from './saju-engine';

const SIGNS: ZodiacSign[] = [
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
];

const PLANETS: PlanetId[] = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

const SIGN_STARTS = [
  [1, 20],
  [2, 19],
  [3, 21],
  [4, 20],
  [5, 21],
  [6, 22],
  [7, 23],
  [8, 23],
  [9, 23],
  [10, 23],
  [11, 22],
  [12, 22],
];

function getSunSignIndex(month: number, day: number): number {
  for (let index = SIGN_STARTS.length - 1; index >= 0; index -= 1) {
    const [startMonth, startDay] = SIGN_STARTS[index];
    if (month > startMonth) return index;
    if (month === startMonth && day >= startDay) return index;
  }
  return 11;
}

function normalizeDegree(value: number): number {
  const remainder = value % 360;
  return remainder < 0 ? remainder + 360 : remainder;
}

function createPlanetPosition(planet: PlanetId, longitude: number, ascIndex: number): PlanetPosition {
  const normalized = normalizeDegree(longitude);
  const signIndex = Math.floor(normalized / 30);
  return {
    id: planet,
    planet,
    sign: SIGNS[signIndex],
    degree: normalized,
    degreeInSign: normalized % 30,
    house: ((signIndex - ascIndex + 12) % 12) + 1,
    isRetrograde: ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(planet) && normalized % 40 < 7,
  };
}

function createHouses(ascIndex: number): NatalHouse[] {
  return Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    sign: SIGNS[(ascIndex + index) % 12],
    degree: ((ascIndex + index) % 12) * 30,
  }));
}

function createAngles(ascIndex: number): NatalAngles {
  return {
    asc: { sign: SIGNS[ascIndex], degree: ascIndex * 30 },
    mc: { sign: SIGNS[(ascIndex + 9) % 12], degree: ((ascIndex + 9) % 12) * 30 },
  };
}

function createAspects(planets: PlanetPosition[]): NatalAspect[] {
  const aspects: NatalAspect[] = [];
  const aspectAngles = [0, 60, 90, 120, 180];
  const aspectNames = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition'];

  for (let index = 0; index < planets.length; index += 1) {
    for (let inner = index + 1; inner < planets.length; inner += 1) {
      const rawDiff = Math.abs(planets[index].degree - planets[inner].degree);
      const diff = Math.min(rawDiff, 360 - rawDiff);
      const aspectIndex = aspectAngles.findIndex((angle) => Math.abs(diff - angle) <= 6);
      if (aspectIndex === -1) continue;
      aspects.push({
        planet1: planets[index].planet,
        planet2: planets[inner].planet,
        type: aspectNames[aspectIndex],
        angle: aspectAngles[aspectIndex],
        orb: Number(Math.abs(diff - aspectAngles[aspectIndex]).toFixed(1)),
      });
    }
  }

  return aspects.slice(0, 8);
}

export function calculateNatal(options: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  latitude?: number;
  longitude?: number;
}): NatalChart {
  const sunIndex = getSunSignIndex(options.month, options.day);
  const ascIndex = Math.floor(((options.hour + options.minute / 60) * 15) / 30) % 12;
  const baseLongitude = sunIndex * 30 + options.day + options.hour / 24;

  const planets = PLANETS.map((planet, index) => {
    const genderBias = options.gender === 'female' ? 3 : 0;
    const longitude = baseLongitude + index * 28 + genderBias + (options.longitude ?? 126.978) / 30;
    return createPlanetPosition(planet, longitude, ascIndex);
  });

  return {
    planets,
    houses: createHouses(ascIndex),
    angles: createAngles(ascIndex),
    aspects: createAspects(planets),
  };
}
