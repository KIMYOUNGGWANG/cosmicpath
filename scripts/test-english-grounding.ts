import { strict as assert } from 'node:assert';
import { scorePremiumGrounding, assertPremiumGrounding } from '../src/lib/ai/premium-grounding';
import type { UserData } from '../src/lib/ai/phase-prompts';

const sampleUserDataEn: UserData = {
  name: 'Alex',
  gender: 'female',
  birthDate: '1992-03-15',
  birthTime: '14:30',
  context: 'career',
  question: 'Should I take the new leadership role?',
  language: 'en',
  currentDate: '2026-08-28',
  sajuData: {
    dayMaster: '갑',
    yeonPillar: { stem: '임', branch: '신' },
    monthPillar: { stem: '계', branch: '묘' },
    dayPillar: { stem: '갑', branch: '진' },
    hourPillar: { stem: '신', branch: '미' },
    elements: [],
    tenGods: {},
  } as any,
  astroData: {
    sunSign: '물고기자리',
    moonSign: '게자리',
    ascendant: '사자자리',
    planets: [],
    aspects: [],
  } as any,
  tarotCards: [
    { id: 1, name: 'The Chariot', isReversed: false },
    { id: 2, name: 'Two of Swords', isReversed: true },
  ],
};

const sampleUserDataKo: UserData = {
  ...sampleUserDataEn,
  language: 'ko',
};

function runTests() {
  console.log('Testing Bilingual Grounding Quality Gate...');

  // 1. English Phase 1 Test (Summary) - Needs saju: 1, astrology: 1, tarot: 1, sourceBoundary: 4
  const englishPhase1 = {
    summary: {
      title: 'Strategic Career Timing Overview',
      content: `Saju structure layer first, for Alex (1992-03-15) and the exact question 'Should I take the new leadership role?', from today 2026-08-28 through the 7-day review window, first action is prepare questions and compare contract terms, and decision boundary is a qualified review threshold.
Your Day Master Jia Wood indicates natural executive initiative and strategic momentum.
The Sun in Pisces provides visionary depth, while your Moon in Cancer heightens intuitive caution.
The Chariot Upright signals forward momentum when goals are clear, while Two of Swords Reversed suggests clarity will emerge from small concrete tests.
Calculation sources KASI/JPL are calculation-only and validate orbital and calendar positions.
Calculation sources are not doctrine or personality authority.
Waite and Tetrabiblos provide reviewed text candidates, and no raw source text is copied.
Tarot image rights are separate from meaning and do not dictate factual outcomes.`,
      trust_score: 4,
      trust_reason: 'Cross-validated between Day Master Jia Wood and Sun in Pisces transits.',
    },
  };

  const result1 = scorePremiumGrounding(englishPhase1, sampleUserDataEn, 1);
  assert.equal(result1.passed, true, `Phase 1 failed: ${result1.reasons.join('; ')}`);
  assert.ok(result1.matchedAnchors.length >= 7, `Expected >= 7 anchors, got ${result1.matchedAnchors.length}`);
  console.log('  [PASS] English Phase 1 (Summary + Traits) grounding passed');

  // 2. English Phase 2 Test (Astro Deep) - Needs astrology: 2, sourceBoundary: 4
  const englishPhase2 = {
    astro_deep: {
      sun_moon_dynamic: {
        title: 'Sun in Pisces and Moon in Cancer Alignment',
        content: `Your Sun in Pisces seeks broad systemic impact, while Moon in Cancer demands emotional safety.
Astrological timing windows show current transits activating the 10th house of career responsibility.
KASI/JPL calculation-only data confirms planetary ephemeris. Calculation sources are not doctrine or personality authority.
Waite/Tetrabiblos classical doctrines provide reviewed text candidates without raw source text copying.
Tarot image rights are separate from meaning in this analysis.`,
      },
      ascendant_influence: {
        title: 'Leo Rising / Ascendant in Leo Leadership Signature',
        content: `With Ascendant in Leo, your public presentation commands natural presence.`,
      },
    },
  };

  const result2 = scorePremiumGrounding(englishPhase2, sampleUserDataEn, 2);
  assert.equal(result2.passed, true, `Phase 2 failed: ${result2.reasons.join('; ')}`);
  console.log('  [PASS] English Phase 2 (Astro Deep) grounding passed');

  // 3. English Phase 3 Test (Tarot) - Needs tarot: 2, sourceBoundary: 4
  const englishPhase3 = {
    tarot_details: [
      {
        card_name: 'The Chariot',
        position: 'outcome',
        is_reversed: false,
        interpretation: `The Chariot Upright demonstrates strong momentum and overcoming obstacles through focus.
KASI/JPL are calculation-only ephemeris tools. Calculation sources are not doctrine or personality authority.
Waite/Tetrabiblos reviewed text candidates guide classical card symbolism without raw source text copying.
Tarot image rights are separate from meaning.`,
      },
      {
        card_name: 'Two of Swords',
        position: 'challenge',
        is_reversed: true,
        interpretation: `Two of Swords Reversed indicates that the phase of indecision has ended.`,
      },
    ],
  };

  const result3 = scorePremiumGrounding(englishPhase3, sampleUserDataEn, 3);
  assert.equal(result3.passed, true, `Phase 3 failed: ${result3.reasons.join('; ')}`);
  console.log('  [PASS] English Phase 3 (Tarot) grounding passed');

  // 4. English Phase 4 Test (Saju Basics) - Needs saju: 3, sourceBoundary: 4
  const englishPhase4 = {
    saju_sections: [
      {
        id: 'day_master',
        title: 'Day Master Analysis',
        content: `Your Day Master Jia Wood (갑) stands tall like an oak tree, representing principled leadership and growth.
Year Pillar Ren-Shen (임신) provides strategic water nourish to your wood stem.
Month Pillar Gui-Mao (계묘) adds adaptable communication instincts.
Four Pillars show strong executive resilience.
KASI/JPL validate calculation only. Calculation sources are not doctrine or personality authority.
Waite/Tetrabiblos reviewed text candidates serve as symbolic doctrine without raw source text copying.
Tarot image rights remain separate from meaning.`,
      },
    ],
  };

  const result4 = scorePremiumGrounding(englishPhase4, sampleUserDataEn, 4);
  assert.equal(result4.passed, true, `Phase 4 failed: ${result4.reasons.join('; ')}`);
  console.log('  [PASS] English Phase 4 (Saju Basics) grounding passed');

  // 5. Unknown Time Caveat Test in English
  const unknownTimeUserDataEn: UserData = {
    ...sampleUserDataEn,
    unknownTime: true,
  };
  const unknownTimePayloadEn = {
    summary: {
      content: `Because birth time is unknown, hour pillar and precise Ascendant angles are treated as provisional review boundaries.
Day Master Jia Wood and Sun in Pisces provide durable structural anchors.
The Chariot Upright confirms momentum.
KASI/JPL calculation-only data, calculation sources are not personality authority.
Waite/Tetrabiblos reviewed text candidates, no raw source text copying.
Tarot image rights are separate from meaning.`,
    },
  };

  const resultUnknown = scorePremiumGrounding(unknownTimePayloadEn, unknownTimeUserDataEn, 1);
  assert.equal(resultUnknown.passed, true, `Unknown time failed: ${resultUnknown.reasons.join('; ')}`);
  console.log('  [PASS] English Unknown Time caveat grounding passed');

  // 6. Korean Backward Compatibility Test
  const koreanPhase1 = {
    summary: {
      title: '경력 타이밍 분석',
      content: `사주 일간 갑목의 중심축과 태양 물고기자리 트랜짓, 타로 The Chariot 정방향 신호가 일치합니다.
연주 임신, 월주 계묘와의 상호작용에서 독립적 실행력이 두드러집니다.
KASI/JPL 계산 검증 전용이며 계산 원천은 해석 권위가 아닙니다.
Waite/Tetrabiblos 검토된 텍스트 후보를 따르며 원문 복사 금지 원칙을 지킵니다.
타로 이미지 권리와 의미 근거는 분리됩니다.`,
      trust_score: 5,
      trust_reason: '일간 갑목과 태양 물고기자리 교차 검증',
    },
  };

  const resultKo = scorePremiumGrounding(koreanPhase1, sampleUserDataKo, 1);
  assert.equal(resultKo.passed, true, `Korean Phase 1 failed: ${resultKo.reasons.join('; ')}`);
  console.log('  [PASS] Korean Phase 1 backward compatibility passed');

  // 7. Ungrounded Rejection Test (Ensuring quality gates still reject fake/thin content)
  const ungroundedEnglish = {
    summary: {
      content: 'This is generic well-wishing without naming Day Master, signs, cards, or boundaries.',
    },
  };
  const ungroundedResult = scorePremiumGrounding(ungroundedEnglish, sampleUserDataEn, 1);
  assert.equal(ungroundedResult.passed, false, 'Ungrounded English should fail');
  console.log('  [PASS] Ungrounded English payload rejected correctly');

  console.log('\nAll Bilingual Grounding Quality Gate tests passed successfully! 🎉');
}

runTests();
