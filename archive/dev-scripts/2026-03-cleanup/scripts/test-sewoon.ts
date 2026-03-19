/**
 * 세운(歲運) 계산 테스트
 */

import { calculateSaju, formatSewoon } from '../src/lib/engines/saju';

// 테스트 데이터: 1994-05-06 10:10 남자
const birthDate = new Date('1994-05-06');
const birthHour = 10;
const birthMinute = 10;
const gender = 'male' as const;

console.log('=== 세운(歲運) 계산 테스트 ===\n');
console.log(`생년월일시: 1994-05-06 ${birthHour}:${birthMinute}`);
console.log(`성별: ${gender === 'male' ? '남자' : '여자'}\n`);

// 사주 계산
const saju = calculateSaju(birthDate, birthHour, birthMinute, false, gender);

console.log('=== 사주 기본 정보 ===');
console.log(`일간(Day Master): ${saju.dayMaster}`);
console.log(`일지(Day Branch): ${saju.dayPillar.branch}`);
console.log(`신강/신약: ${saju.enhancedYongsin?.bodyStrength || '중화'}\n`);

console.log('=== 현재 대운 ===');
if (saju.daeun?.currentDaeun) {
    const d = saju.daeun.currentDaeun;
    console.log(`${d.stem}${d.branch} (${d.startAge}~${d.endAge}세) - ${d.tenGod}`);
}

console.log('\n=== 올해 세운 ===');
if (saju.sewoon) {
    console.log(formatSewoon(saju.sewoon));
    console.log('\n상호작용:');
    console.log(`  - 일지충: ${saju.sewoon.interactions.clashWithDayBranch ? '⚠️ 있음' : '없음'}`);
    console.log(`  - 운충운(대운충): ${saju.sewoon.interactions.clashWithDaewoon ? '⚠️ 있음' : '없음'}`);
    console.log(`  - 일지합: ${saju.sewoon.interactions.combineWithDayBranch ? '✨ 있음' : '없음'}`);
}

console.log('\n=== 향후 5년 세운 ===');
if (saju.sewoonMultiYear) {
    saju.sewoonMultiYear.forEach(s => {
        const markers = [];
        if (s.interactions.clashWithDaewoon) markers.push('운충운!');
        if (s.interactions.clashWithDayBranch) markers.push('일지충!');
        const markerStr = markers.length > 0 ? ` ⚠️(${markers.join(', ')})` : '';
        console.log(`  ${s.year}년 ${s.stem}${s.branch}: ${s.tenGod} / ${s.twelveStage} → ${s.grade} (${s.score > 0 ? '+' : ''}${s.score}점)${markerStr}`);
    });
}
