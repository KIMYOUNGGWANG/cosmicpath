import {
  ASPECTS,
  PLANETS,
  ZODIAC_SIGNS,
  type AstrologyResult,
} from '@/lib/engines/astrology';
import type {
  NatalAngles,
  NatalAspect,
  NatalChart,
  NatalHouse,
  PlanetId,
  PlanetPosition,
  ZodiacSign,
} from './saju-engine';

export const ASTROLOGY_SIGN_TO_ZODIAC_SIGN = [
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
] as const satisfies readonly ZodiacSign[];

export const PLANET_KEY_TO_ID = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
} as const satisfies Record<keyof typeof PLANETS, PlanetId>;

export type AstrologyAscendantConfidence = 'exact_time' | 'approximate_noon';

export function toZodiacSign(signIndex: number): ZodiacSign {
  if (!Number.isInteger(signIndex) || signIndex < 0 || signIndex >= ASTROLOGY_SIGN_TO_ZODIAC_SIGN.length) {
    throw new Error(`Invalid astrology sign index: ${signIndex}`);
  }

  const sign = ASTROLOGY_SIGN_TO_ZODIAC_SIGN[signIndex];
  if (sign === undefined) {
    throw new Error(`Missing astrology sign mapping: ${signIndex}`);
  }

  return sign;
}

export function toPlanetId(planetKey: keyof typeof PLANETS): PlanetId {
  return PLANET_KEY_TO_ID[planetKey];
}

function absoluteDegree(signIndex: number, degreeInSign: number): number {
  const normalized = signIndex * 30 + degreeInSign;
  const remainder = normalized % 360;
  return remainder < 0 ? remainder + 360 : remainder;
}

function buildHouses(ascendantIndex: number): NatalHouse[] {
  return Array.from({ length: 12 }, (_, index) => {
    const signIndex = (ascendantIndex + index) % 12;
    return {
      house: index + 1,
      sign: toZodiacSign(signIndex),
      degree: signIndex * 30,
    };
  });
}

function buildAngles(ascendantIndex: number): NatalAngles {
  const mcIndex = (ascendantIndex + 9) % 12;
  return {
    asc: {
      sign: toZodiacSign(ascendantIndex),
      degree: ascendantIndex * 30,
    },
    mc: {
      sign: toZodiacSign(mcIndex),
      degree: mcIndex * 30,
    },
  };
}

function buildPlanetPosition(position: AstrologyResult['planets'][number]): PlanetPosition {
  return {
    id: toPlanetId(position.planet),
    planet: toPlanetId(position.planet),
    sign: toZodiacSign(position.sign),
    degree: absoluteDegree(position.sign, position.degree),
    degreeInSign: position.degree,
    house: position.house,
    isRetrograde: false,
  };
}

function buildAspect(aspect: AstrologyResult['aspects'][number]): NatalAspect {
  const aspectInfo = ASPECTS[aspect.aspect];
  return {
    planet1: toPlanetId(aspect.planet1),
    planet2: toPlanetId(aspect.planet2),
    type: aspectInfo.nameEn,
    angle: aspectInfo.angle,
    orb: aspect.orb,
  };
}

function koreanSignName(signIndex: number): string {
  const sign = ZODIAC_SIGNS[signIndex];
  if (sign === undefined) {
    throw new Error(`Missing Korean astrology sign mapping: ${signIndex}`);
  }

  return sign.name;
}

export function buildCanonicalNatalChart(astrology: AstrologyResult): NatalChart {
  return {
    planets: astrology.planets.map(buildPlanetPosition),
    houses: buildHouses(astrology.ascendant),
    angles: buildAngles(astrology.ascendant),
    aspects: astrology.aspects.map(buildAspect),
  };
}

export function buildCanonicalNatalSummary(
  astrology: AstrologyResult,
  options: { readonly ascendantConfidence?: AstrologyAscendantConfidence } = {},
): string {
  const baseSummary = `태양 ${koreanSignName(astrology.sunSign)}, 달 ${koreanSignName(astrology.moonSign)}, 상승궁 ${koreanSignName(astrology.ascendant)} 조합입니다.`;
  if (options.ascendantConfidence === 'approximate_noon') {
    return `${baseSummary} 상승궁은 정오 기준 참고값입니다.`;
  }

  return baseSummary;
}

export function getCanonicalNatalThemes(astrology: AstrologyResult): ZodiacSign[] {
  return [
    toZodiacSign(astrology.sunSign),
    toZodiacSign(astrology.moonSign),
    toZodiacSign(astrology.ascendant),
  ];
}
