/**
 * Saju Calculation Test Script
 * Birth: 1993-08-02 15:10, Male
 */

import {
    calculateSaju,
    calculateDaeun,
    calculateBodyStrength,
    countTenGodGroups,
    analyzeElementDistribution,
    FIVE_ELEMENTS,
    STEM_ELEMENTS,
    HIDDEN_STEMS,
    SajuResult
} from '../src/lib/engines/saju';

import { calculateAstrology } from '../src/lib/engines/astrology';

const birthDate = new Date(1993, 7, 2);  // 로컬 시간대 기준 (월은 0부터 시작)
const birthHour = 15; // 15시
const birthMinute = 10; // 10분
const gender: 'male' | 'female' = 'male';
const isLunar = false; // 양력
const latitude = 37.5665; // Seoul
const longitude = 126.9780; // Seoul (프스텔러 기준 -32분 보정)

console.log('='.repeat(60));
console.log('🔮 SAJU CALCULATION TEST');
console.log('='.repeat(60));
console.log(`Birth: 1993-08-02 15:10 (Male, Solar Calendar)`);
console.log(`Location: Seoul (${longitude}°E) → Time correction: -${Math.round((135 - longitude) * 4)}min`);
console.log('');

// 1. Calculate Full Saju
const sajuResult: SajuResult = calculateSaju(
    birthDate,
    birthHour,
    birthMinute,
    isLunar,
    gender,
    longitude  // 경도 파라미터 추가
);

console.log('📜 FOUR PILLARS (사주팔자):');
console.log(`  Year (연주):  ${sajuResult.yeonPillar?.stem}${sajuResult.yeonPillar?.branch}`);
console.log(`  Month (월주): ${sajuResult.monthPillar?.stem}${sajuResult.monthPillar?.branch}`);
console.log(`  Day (일주):   ${sajuResult.dayPillar?.stem}${sajuResult.dayPillar?.branch}`);
console.log(`  Hour (시주):  ${sajuResult.hourPillar?.stem}${sajuResult.hourPillar?.branch}`);
console.log('');

// 2. Day Master Info
const dayStem = sajuResult.dayMaster;
console.log(`🌟 DAY MASTER (일간): ${dayStem}`);
console.log('');

// 3. Element Distribution
console.log('🎨 ELEMENTS (오행):');
if (sajuResult.elements && sajuResult.elements.length > 0) {
    const counts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    sajuResult.elements.forEach((el) => {
        if (el.stem) counts[el.stem] = (counts[el.stem] || 0) + 1;
        if (el.branch) counts[el.branch] = (counts[el.branch] || 0) + 1;
    });
    Object.entries(counts).forEach(([el, count]) => {
        const bar = '█'.repeat(count);
        const name = (FIVE_ELEMENTS as any)[el] || el;
        console.log(`  ${name}: ${bar} (${count})`);
    });
}
console.log('');

// 4. Ten Gods
console.log('💫 TEN GODS (십신):');
if (sajuResult.tenGods) {
    console.log(`  Year (연주):  ${sajuResult.tenGods.year || 'N/A'}`);
    console.log(`  Month (월주): ${sajuResult.tenGods.month || 'N/A'}`);
    console.log(`  Day (일주):   (일간 자체)`);
    console.log(`  Hour (시주):  ${sajuResult.tenGods.hour || 'N/A'}`);
}
console.log('');

// 5. Calculate Daeun
console.log('🚀 DAEUN (대운):');
const yearStem = sajuResult.yeonPillar?.stem || '';
const monthStem = sajuResult.monthPillar?.stem || '';
const monthBranch = sajuResult.monthPillar?.branch || '';
const currentAge = 2026 - 1993 + 1; // Korean age = 34

const daeunResult = calculateDaeun(
    birthDate,
    birthHour,
    gender,
    yearStem,
    monthStem,
    monthBranch,
    dayStem,
    currentAge
);

console.log(`  Direction (방향): ${daeunResult.direction} (${daeunResult.basis})`);
console.log(`  Start Age (시작): ${daeunResult.startAge}세`);
console.log('  Sequence (대운 흐름):');
daeunResult.sequence.forEach(d => {
    const isCurrent = daeunResult.currentDaeun === d ? ' ◀ CURRENT' : '';
    console.log(`    ${d.startAge}~${d.endAge}세: ${d.stem}${d.branch} (${d.tenGod})${isCurrent}`);
});
console.log('');

// 6. Yongsin
console.log('⚡ YONGSIN (용신):');
if (sajuResult.enhancedYongsin) {
    const yong = sajuResult.enhancedYongsin;
    console.log(`  Primary (1순위): ${(FIVE_ELEMENTS as any)[yong.primary]} (${yong.primary})`);
    console.log(`  Secondary (2순위): ${(FIVE_ELEMENTS as any)[yong.secondary]} (${yong.secondary})`);
    console.log(`  Body Strength (신강/신약): ${yong.bodyStrength} (Score: ${yong.bodyScore})`);
    console.log(`  Basis (기준): ${yong.basis}`);
    console.log(`  Xi Shin (희신): ${yong.xiShin.map((e: any) => (FIVE_ELEMENTS as any)[e]).join(', ')}`);
    console.log(`  Ji Shin (기신): ${yong.jiShin.map((e: any) => (FIVE_ELEMENTS as any)[e]).join(', ')}`);
    console.log(`  Reasoning: ${yong.reasoning}`);
} else {
    console.log('  (Not calculated - may require full analysis)');
}
console.log('');

// 7. Gyeokguk
console.log('🏛️ GYEOKGUK (격국):');
if (sajuResult.gyeokguk) {
    const g = sajuResult.gyeokguk;
    console.log(`  Type (격): ${g.type}`);
    console.log(`  Month Jeonggi (월지정기): ${g.monthJeonggi} → ${g.monthTenGod}`);
    console.log(`  Strength (강도): ${g.strength}`);
} else {
    console.log('  (Not calculated)');
}
console.log('');

// 8. Twelve Stages
console.log('🔄 TWELVE STAGES (12운성):');
if (sajuResult.twelveStages) {
    console.log(`  Year:  ${sajuResult.twelveStages.year}`);
    console.log(`  Month: ${sajuResult.twelveStages.month}`);
    console.log(`  Day:   ${sajuResult.twelveStages.day}`);
    console.log(`  Hour:  ${sajuResult.twelveStages.hour}`);
}
console.log('');

// 9. Daeun from SajuResult (if included)
if (sajuResult.daeun) {
    console.log('📊 DAEUN FROM RESULT (결과에 포함된 대운):');
    console.log(`  Direction: ${sajuResult.daeun.direction}`);
    console.log(`  Start Age: ${sajuResult.daeun.startAge}세`);
}
console.log('');

// 10. Astrology (Ascendant)
console.log('🌌 ASTROLOGY (점성술):');
try {
    const astroResult = calculateAstrology(
        birthDate,
        `${birthHour.toString().padStart(2, '0')}:${birthMinute.toString().padStart(2, '0')}`,
        latitude,
        longitude
    );

    const ZODIAC = ['양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리',
        '천칭자리', '전갈자리', '궁수자리', '염소자리', '물병자리', '물고기자리'];

    console.log(`  Sun Sign (태양궁): ${ZODIAC[astroResult.sunSign]}`);
    console.log(`  Moon Sign (달궁): ${ZODIAC[astroResult.moonSign]}`);
    console.log(`  Ascendant (상승궁): ${ZODIAC[astroResult.ascendant]}`);
} catch (e: any) {
    console.log(`  Error: ${e.message}`);
}

console.log('');
console.log('='.repeat(60));
console.log('Test complete!');
