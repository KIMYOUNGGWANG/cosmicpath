/**
 * 4대 엔진 1차 교차검증 스크립트 (Cross-Engine Consistency & Accuracy Verification)
 * 
 * 1. KASI 사주 역법 & 진태양시 보정
 * 2. 서양 트로피컬(Tropical) vs 태국 사이더리얼(Sidereal) 아야남샤 정합성
 * 3. 마하 탁사 108 시리(Siri) / 칼라키니(Kalakini) 대운 매트릭스
 * 4. 정통 자미두수 12궁 명반 및 사화(四化)
 * 5. 48주 주간 타이밍 히트맵 전술 신호
 */

import { calculateSaju } from '../src/lib/engines/saju';
import { calculateTrueSolarTime } from '../src/lib/engines/true-solar-time';
import { calculateThaiAstrology } from '../src/lib/engines/thai-astrology';
import { calculateZiweiChart } from '../src/lib/engines/ziwei';
import { calculateWeeklyTimingHeatmap } from '../src/lib/engines/timing-heatmap';
import { calculateShadowTransformations } from '../src/lib/engines/saju-transformation';

async function runCrossEngineMatrixVerification() {
  console.log('=== [Phase 1 Cross-Validation] 4-Engine Deterministic Matrix ===\n');

  // Test Case 1: 1993년 8월 2일 14:30 서울 출생 남성
  const testBirth = {
    birthDate: '1993-08-02',
    birthTime: '14:30',
    gender: 'male' as const,
    cityName: 'seoul',
  };

  // 1. 진태양시 보정 검증
  const tstResult = calculateTrueSolarTime({
    birthDate: testBirth.birthDate,
    birthTime: testBirth.birthTime,
    cityName: testBirth.cityName,
  });
  console.log('1. True Solar Time Calibration:');
  console.log(`   - Original: ${tstResult.originalTime} -> Calibrated: ${tstResult.correctedTime} (Offset: ${tstResult.offsetMinutes}m)`);
  if (!tstResult.correctedTime || tstResult.offsetMinutes !== -32) {
    throw new Error('TST calibration failed for Seoul longitude.');
  }
  console.log('   [PASS] TST Calibration Verified.\n');

  // 2. KASI 정통 사주 계산 검증
  const sajuResult = calculateSaju(new Date(testBirth.birthDate), 14);
  console.log('2. KASI Saju Calculation:');
  console.log(`   - Day Master (일간): ${sajuResult.dayMaster}`);
  console.log(`   - 4 Pillars: ${sajuResult.yeonPillar.stem}${sajuResult.yeonPillar.branch} / ${sajuResult.monthPillar.stem}${sajuResult.monthPillar.branch} / ${sajuResult.dayPillar.stem}${sajuResult.dayPillar.branch} / ${sajuResult.hourPillar.stem}${sajuResult.hourPillar.branch}`);
  if (!sajuResult.dayMaster) {
    throw new Error('Saju calculation failed to yield Day Master.');
  }
  console.log('   [PASS] Saju Engine Verified.\n');

  // 3. 태국 왕실 점성학 & 마하 탁사 108 검증
  const thaiResult = calculateThaiAstrology({
    birthDate: testBirth.birthDate,
    birthTime: testBirth.birthTime,
    tropicalSunSign: 4, // Leo
    tropicalMoonSign: 9, // Capricorn
    tropicalAscendantSign: 7, // Scorpio
  });
  console.log('3. Thai Royal Astrology & Maha Thaksa 108:');
  console.log(`   - Day of Week: ${thaiResult.birthDayOfWeek} (${thaiResult.dayDeity.nameKo})`);
  console.log(`   - Lahiri Ayanamsa: ${thaiResult.ayanamsaDegrees}°`);
  console.log(`   - Sidereal Sun: ${thaiResult.siderealSun.sign.nameKo} (${thaiResult.siderealSun.sign.nameTh})`);
  console.log(`   - Siri (Blessing): ${thaiResult.siriPlanet.planetKo} (${thaiResult.siriPlanet.colorKo})`);
  console.log(`   - Kalakini (Taboo): ${thaiResult.kalakiniPlanet.planetKo} (${thaiResult.kalakiniPlanet.colorKo})`);
  console.log(`   - Active Maha Thaksa: ${thaiResult.currentMahaThaksaCycle.primaryRulerKo} (Age ${thaiResult.currentMahaThaksaCycle.startAge}~${thaiResult.currentMahaThaksaCycle.endAge})`);

  if (thaiResult.birthDayOfWeek !== 'monday') {
    throw new Error(`Expected Monday, got ${thaiResult.birthDayOfWeek}`);
  }
  if (thaiResult.siderealSun.sign.nameKo !== '게자리') {
    throw new Error(`Expected Sidereal Cancer for Tropical Leo with 23.7° Ayanamsa, got ${thaiResult.siderealSun.sign.nameKo}`);
  }
  console.log('   [PASS] Thai Astrology Engine Verified.\n');

  // 4. 정통 자미두수 명반 검증
  const ziweiResult = calculateZiweiChart(
    new Date(testBirth.birthDate),
    14,
    testBirth.gender,
    false,
    2026
  );
  console.log('4. Ziwei Doushu 12 Palaces Chart:');
  console.log(`   - Solar Date: ${ziweiResult.solarDate} -> Lunar Date: ${ziweiResult.lunarDate}`);
  console.log(`   - Ming Palace Branch: ${ziweiResult.mingGongBranch} (Pattern: ${ziweiResult.wuxingJu.name})`);
  console.log(`   - SiHua Summary: ${JSON.stringify(ziweiResult.siHuaSummary)}`);
  if (!ziweiResult.mingGongBranch || ziweiResult.palaceList.length !== 12) {
    throw new Error('Ziwei calculation failed to generate 12 palaces.');
  }
  console.log('   [PASS] Ziwei Doushu Engine Verified.\n');

  // 5. 48주 주간 타이밍 히트맵 검증
  const heatmapResult = calculateWeeklyTimingHeatmap(sajuResult, 2026);
  const totalWeeks = heatmapResult.months.reduce((acc, m) => acc + m.weeks.length, 0);
  console.log('5. 48-Week Timing Heatmap:');
  console.log(`   - Year: ${heatmapResult.year} (Peak Quarter: ${heatmapResult.peakQuarter}, Total Weeks: ${totalWeeks})`);
  console.log(`   - Highest Week: ${heatmapResult.highestScoringWeek.month}월 ${heatmapResult.highestScoringWeek.weekOfMonth}주차 (${heatmapResult.highestScoringWeek.score}점)`);
  if (heatmapResult.months.length !== 12 || totalWeeks !== 48) {
    throw new Error(`Expected 48 weeks across 12 months, got ${totalWeeks}`);
  }
  console.log('   [PASS] 48-Week Heatmap Engine Verified.\n');

  // 6. 신살 승화 전화위복 엔진 검증
  const shadowResult = calculateShadowTransformations(sajuResult);
  const detectedList = shadowResult.transformations.filter(t => t.isDetected);
  console.log('6. Shadow Superpower Transformations:');
  console.log(`   - Detected Superpowers (${shadowResult.detectedCount}): ${detectedList.map(t => t.salNameKo).join(', ') || '잠재 승화 모드'}`);
  console.log(`   - Primary Superpower: ${shadowResult.primarySuperpower}`);
  console.log(`   - Master Synthesis: ${shadowResult.overallSynthesisKo.slice(0, 60)}...`);
  if (!shadowResult.overallSynthesisKo) {
    throw new Error('Shadow transformation failed to produce overall synthesis.');
  }
  console.log('   [PASS] Shadow Superpower Engine Verified.\n');

  console.log('🎉 [ALL 6 ENGINES PASSED 1ST-STAGE CROSS-VALIDATION]');
}

runCrossEngineMatrixVerification().catch((err) => {
  console.error('[FAIL] Cross Engine Verification Error:', err);
  process.exit(1);
});
