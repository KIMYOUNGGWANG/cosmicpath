import {
  calculateSaju,
  calculateIlwoon,
  HEAVENLY_STEMS_DATA,
  EARTHLY_BRANCHES_DATA,
} from '@/lib/engines/saju';
import type {
  DayMasterArchetype,
  FiveElement,
  SajuChartProfile,
  DailyTransitInfo,
} from './types';

// =====================================
// 10 Day Master Archetypes (English Wellness Framework)
// =====================================
export const DAY_MASTER_ARCHETYPES: Record<string, DayMasterArchetype> = {
  갑: {
    stem: '甲 (Yang Wood)',
    element: 'wood',
    yinYang: 'yang',
    englishName: 'The Pioneer Tree (Yang Wood)',
    shortTitle: 'Sturdy Pine',
    archetype: 'Visionary Pioneer',
    coreNature: 'Upward driving, independent, values principled growth and integrity.',
    emotionalTension: 'Frustration or impatience when blocked, difficulty bending under pressure.',
    groundingHabit: 'Engage in slow stretching or walking in nature; practice flexible compromise.',
  },
  을: {
    stem: '乙 (Yin Wood)',
    element: 'wood',
    yinYang: 'yin',
    englishName: 'The Resilient Vine (Yin Wood)',
    shortTitle: 'Adaptable Flora',
    archetype: 'Empathetic Diplomat',
    coreNature: 'Flexible, highly intuitive, excellent networking and survival instincts.',
    emotionalTension: 'Over-adapting to others, codependency, vulnerability to emotional burnout.',
    groundingHabit: 'Set clear personal boundaries; write down distinct priorities daily.',
  },
  병: {
    stem: '丙 (Yang Fire)',
    element: 'fire',
    yinYang: 'yang',
    englishName: 'The Radiant Sun (Yang Fire)',
    shortTitle: 'Solar Radiance',
    archetype: 'Inspirational Catalyst',
    coreNature: 'Warm, expressive, illuminating, acts as a natural beacon of optimism.',
    emotionalTension: 'Sudden depletion/burnout after giving away too much warmth; fear of being unseen.',
    groundingHabit: 'Schedule quiet recharge time without an audience; practice silent meditation.',
  },
  정: {
    stem: '丁 (Yin Fire)',
    element: 'fire',
    yinYang: 'yin',
    englishName: 'The Sacred Flame (Yin Fire)',
    shortTitle: 'Focused Torch',
    archetype: 'Intuitive Craftsman',
    coreNature: 'Deeply insightful, warm, detail-oriented, with intense quiet focus.',
    emotionalTension: 'Internal over-sensitivity, brooding, sudden emotional flares when hurt.',
    groundingHabit: 'Express feelings through art or journaling before reacting.',
  },
  무: {
    stem: '戊 (Yang Earth)',
    element: 'earth',
    yinYang: 'yang',
    englishName: 'The Majestic Mountain (Yang Earth)',
    shortTitle: 'Ancient Mountain',
    archetype: 'Steadfast Anchor',
    coreNature: 'Reliable, patient, holding deep space, highly trustworthy.',
    emotionalTension: 'Inertia, stubbornness, holding onto old emotional weight for too long.',
    groundingHabit: 'Try vigorous physical movement to get heavy energy circulating.',
  },
  기: {
    stem: '己 (Yin Earth)',
    element: 'earth',
    yinYang: 'yin',
    englishName: 'The Fertile Soil (Yin Earth)',
    shortTitle: 'Nurturing Earth',
    archetype: 'Quiet Cultivator',
    coreNature: 'Nurturing, practical, detail-oriented, adaptable to complex situations.',
    emotionalTension: 'Worry, anxiety, absorbing everyone else’s stress into your own center.',
    groundingHabit: 'Mindful eating and grounding barefoot walking; clear digital clutter.',
  },
  경: {
    stem: '庚 (Yang Metal)',
    element: 'metal',
    yinYang: 'yang',
    englishName: 'The Forged Blade (Yang Metal)',
    shortTitle: 'Tempered Steel',
    archetype: 'Decisive Strategist',
    coreNature: 'Direct, loyal, loves clarity and decisive action, high sense of justice.',
    emotionalTension: 'Harsh self-criticism, black-and-white thinking, rigidity.',
    groundingHabit: 'Practice self-compassion and gentle breathing; allow gray areas.',
  },
  신: {
    stem: '辛 (Yin Metal)',
    element: 'metal',
    yinYang: 'yin',
    englishName: 'The Refined Gem (Yin Metal)',
    shortTitle: 'Polished Jewel',
    archetype: 'Perfectionist Alchemist',
    coreNature: 'Sharp-minded, aesthetic, values precision, excellence, and dignity.',
    emotionalTension: 'Obsessive overthinking about flaws, hypersensitivity to criticism.',
    groundingHabit: 'Accept “good enough” milestones; celebrate progress over perfection.',
  },
  임: {
    stem: '壬 (Yang Water)',
    element: 'water',
    yinYang: 'yang',
    englishName: 'The Vast Ocean (Yang Water)',
    shortTitle: 'Deep Tide',
    archetype: 'Philosophical Visionary',
    coreNature: 'Fluid, broad-minded, deeply intelligent, embraces change and flow.',
    emotionalTension: 'Restlessness, emotional undertows, escaping into overthinking.',
    groundingHabit: 'Structure daily routines to channel vast emotional tides productively.',
  },
  계: {
    stem: '癸 (Yin Water)',
    element: 'water',
    yinYang: 'yin',
    englishName: 'The Gentle Mist (Yin Water)',
    shortTitle: 'Spring Rain',
    archetype: 'Intuitive Empath',
    coreNature: 'Subtle, receptive, imaginative, quietly transformative and wise.',
    emotionalTension: 'Anxiety, mood swings, feeling overwhelmed by subtle emotional atmospheres.',
    groundingHabit: 'Drink herbal tea, take warm baths, and ground yourself in physical sensory tasks.',
  },
};

/**
 * Calculate SajuMind Chart Profile from birth details
 */
export function calculateSajuMindProfile(
  name: string,
  birthDateStr: string,
  birthTimeStr?: string,
  birthCity: string = 'Seoul',
  timezone: string = 'Asia/Seoul'
): SajuChartProfile {
  const [year, month, day] = birthDateStr.split('-').map(Number);
  let hour = 12;
  let minute = 0;

  if (birthTimeStr) {
    const [h, m] = birthTimeStr.split(':').map(Number);
    if (!Number.isNaN(h)) hour = h;
    if (!Number.isNaN(m)) minute = m;
  }

  const birthDate = new Date(year, month - 1, day, hour, minute);
  const sajuResult = calculateSaju(birthDate, hour, minute, false, 'male');

  const dayStemHangul = sajuResult.dayMaster || sajuResult.dayPillar.stem;
  const dayMaster = DAY_MASTER_ARCHETYPES[dayStemHangul] || DAY_MASTER_ARCHETYPES['갑'];

  // Calculate elemental breakdown
  const elementCounts: Record<FiveElement, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  sajuResult.elements.forEach((pair) => {
    if (pair.stem) elementCounts[pair.stem as FiveElement] = (elementCounts[pair.stem as FiveElement] || 0) + 1;
    if (pair.branch) elementCounts[pair.branch as FiveElement] = (elementCounts[pair.branch as FiveElement] || 0) + 1;
  });

  const total =
    elementCounts.wood +
    elementCounts.fire +
    elementCounts.earth +
    elementCounts.metal +
    elementCounts.water || 1;

  const elementPercentages: Record<FiveElement, number> = {
    wood: Math.round((elementCounts.wood / total) * 100),
    fire: Math.round((elementCounts.fire / total) * 100),
    earth: Math.round((elementCounts.earth / total) * 100),
    metal: Math.round((elementCounts.metal / total) * 100),
    water: Math.round((elementCounts.water / total) * 100),
  };

  // Find dominant element
  let dominantElement: FiveElement = 'wood';
  let maxPct = -1;
  (Object.keys(elementPercentages) as FiveElement[]).forEach((el) => {
    if (elementPercentages[el] > maxPct) {
      maxPct = elementPercentages[el];
      dominantElement = el;
    }
  });

  const getBranchData = (hangul: string) =>
    EARTHLY_BRANCHES_DATA.find((b) => b.hangul === hangul);

  const getStemData = (hangul: string) =>
    HEAVENLY_STEMS_DATA.find((s) => s.hangul === hangul);

  const yearBranch = getBranchData(sajuResult.yeonPillar.branch);
  const monthBranch = getBranchData(sajuResult.monthPillar.branch);
  const dayBranch = getBranchData(sajuResult.dayPillar.branch);
  const hourBranch = sajuResult.hourPillar
    ? getBranchData(sajuResult.hourPillar.branch)
    : undefined;

  const yearStem = getStemData(sajuResult.yeonPillar.stem);
  const monthStem = getStemData(sajuResult.monthPillar.stem);
  const dayStem = getStemData(sajuResult.dayPillar.stem);
  const hourStem = sajuResult.hourPillar
    ? getStemData(sajuResult.hourPillar.stem)
    : undefined;

  return {
    name,
    birthDate: birthDateStr,
    birthTime: birthTimeStr,
    birthCity,
    timezone,
    dayMaster,
    fourPillars: {
      year: {
        stem: yearStem?.english || sajuResult.yeonPillar.stem,
        branch: yearBranch?.english || sajuResult.yeonPillar.branch,
        element: (yearStem?.element as FiveElement) || 'wood',
        animalEn: yearBranch?.animalEn || 'Rat',
      },
      month: {
        stem: monthStem?.english || sajuResult.monthPillar.stem,
        branch: monthBranch?.english || sajuResult.monthPillar.branch,
        element: (monthStem?.element as FiveElement) || 'wood',
        animalEn: monthBranch?.animalEn || 'Dragon',
      },
      day: {
        stem: dayStem?.english || sajuResult.dayPillar.stem,
        branch: dayBranch?.english || sajuResult.dayPillar.branch,
        element: (dayStem?.element as FiveElement) || 'wood',
        animalEn: dayBranch?.animalEn || 'Tiger',
      },
      ...(hourStem && hourBranch
        ? {
            hour: {
              stem: hourStem.english,
              branch: hourBranch.english,
              element: hourStem.element as FiveElement,
              animalEn: hourBranch.animalEn,
            },
          }
        : {}),
    },
    elementPercentages,
    dominantElement,
    currentDaeunSummary: sajuResult.daeun?.sequence?.[0]
      ? `${sajuResult.daeun.sequence[0].stem}${sajuResult.daeun.sequence[0].branch} Major Cycle`
      : undefined,
  };
}

/**
 * Calculate Today's Daily Transit and its energetic relation to the user's Day Master
 */
export function calculateDailyTransit(
  dayMasterHangul: string,
  targetDate: Date = new Date()
): DailyTransitInfo {
  // calculateIlwoon(targetDate, dayMaster)
  const ilwoon = calculateIlwoon(targetDate, dayMasterHangul);

  const stemData = HEAVENLY_STEMS_DATA.find((s) => s.hangul === ilwoon.stem) || HEAVENLY_STEMS_DATA[0];
  const branchData = EARTHLY_BRANCHES_DATA.find((b) => b.hangul === ilwoon.branch) || EARTHLY_BRANCHES_DATA[0];

  const transitElement = stemData.element as FiveElement;
  const userDayMaster = DAY_MASTER_ARCHETYPES[dayMasterHangul] || DAY_MASTER_ARCHETYPES['갑'];
  const userElement = userDayMaster.element;

  // Determine energetic relation
  let relationType: DailyTransitInfo['relationToDayMaster']['type'] = 'same';
  let labelEn = 'Peer Energy & Expansion';
  let weatherMetaphor = 'Clear and steady sky with high peer synergy.';

  if (transitElement === userElement) {
    relationType = 'same';
    labelEn = 'Self & Peer Resonance (Same Element)';
    weatherMetaphor = 'High personal energy. Strong confidence, but watch out for stubbornness.';
  } else if (
    (userElement === 'wood' && transitElement === 'water') ||
    (userElement === 'fire' && transitElement === 'wood') ||
    (userElement === 'earth' && transitElement === 'fire') ||
    (userElement === 'metal' && transitElement === 'earth') ||
    (userElement === 'water' && transitElement === 'metal')
  ) {
    relationType = 'generates_me';
    labelEn = 'Deep Nourishment & Inflow (Resource Energy)';
    weatherMetaphor = 'Warm supportive atmosphere. Great for learning, healing, and inward processing.';
  } else if (
    (userElement === 'wood' && transitElement === 'fire') ||
    (userElement === 'fire' && transitElement === 'earth') ||
    (userElement === 'earth' && transitElement === 'metal') ||
    (userElement === 'metal' && transitElement === 'water') ||
    (userElement === 'water' && transitElement === 'wood')
  ) {
    relationType = 'i_generate';
    labelEn = 'Creative Expression & Output (Action Energy)';
    weatherMetaphor = 'Brisk momentum. Ideal for brainstorming, speaking up, and shipping work.';
  } else if (
    (userElement === 'wood' && transitElement === 'metal') ||
    (userElement === 'fire' && transitElement === 'water') ||
    (userElement === 'earth' && transitElement === 'wood') ||
    (userElement === 'metal' && transitElement === 'fire') ||
    (userElement === 'water' && transitElement === 'earth')
  ) {
    relationType = 'controls_me';
    labelEn = 'External Pressure & Structure (Testing Energy)';
    weatherMetaphor = 'Crisp mountain wind. Demands discipline and boundary-setting; prone to tension.';
  } else {
    relationType = 'i_control';
    labelEn = 'Focus & Manifestation (Wealth/Control Energy)';
    weatherMetaphor = 'Active marketplace climate. Focus on tangible results, execution, and organization.';
  }

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');

  return {
    date: `${yyyy}-${mm}-${dd}`,
    pillar: {
      stem: stemData.english,
      branch: branchData.english,
      stemHangul: stemData.hangul,
      branchHangul: branchData.hangul,
      element: transitElement,
      animalEn: branchData.animalEn,
    },
    relationToDayMaster: {
      type: relationType,
      labelEn,
      energyIntensity: ilwoon.score >= 75 ? 'high' : ilwoon.score >= 50 ? 'moderate' : 'gentle',
      weatherMetaphor,
    },
  };
}
