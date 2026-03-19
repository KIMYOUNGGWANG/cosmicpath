/**
 * 패턴 분석 테스트
 */

import { calculateSaju } from '../src/lib/engines/saju';
import { analyzePatterns } from '../src/lib/engines/saju-patterns';

// 테스트 데이터: 1994-05-06 10:10 남자
const birthDate = new Date('1994-05-06');
const birthHour = 10;
const birthMinute = 10;
const gender = 'male' as const;

console.log('=== 패턴 분석 테스트 ===\n');

// 사주 계산
const saju = calculateSaju(birthDate, birthHour, birthMinute, false, gender);

console.log('=== 사주 기본 정보 ===');
console.log(`사주: ${saju.yeonPillar.stem}${saju.yeonPillar.branch}년 ${saju.monthPillar.stem}${saju.monthPillar.branch}월 ${saju.dayPillar.stem}${saju.dayPillar.branch}일 ${saju.hourPillar.stem}${saju.hourPillar.branch}시`);
console.log(`일간: ${saju.dayMaster}`);
console.log(`신강/신약: ${saju.enhancedYongsin?.bodyStrength || '중화'}`);
console.log(`십신: ${Object.entries(saju.tenGods).map(([k, v]) => `${k}=${v}`).join(', ')}`);

// 패턴 분석
const patterns = analyzePatterns(saju);

console.log('\n=== 패턴 분석 결과 ===');
console.log(`총 ${patterns.patterns.length}개 패턴 발견`);
console.log(`종합 점수: ${patterns.overallScore}점 | 등급: ${patterns.grade}`);
console.log(`요약: ${patterns.summary}`);

console.log('\n=== 발견된 패턴 목록 ===');
patterns.patterns.forEach((p, i) => {
    const icon = p.category === 'positive' ? '✅' : p.category === 'negative' ? '❌' : '⚪';
    console.log(`${i + 1}. ${icon} ${p.name} (${p.score > 0 ? '+' : ''}${p.score}점)`);
    console.log(`   ${p.description}`);
    console.log(`   💡 ${p.advice}`);
});

console.log('\n=== 카테고리별 집계 ===');
const positive = patterns.patterns.filter(p => p.category === 'positive');
const negative = patterns.patterns.filter(p => p.category === 'negative');
const neutral = patterns.patterns.filter(p => p.category === 'neutral');
console.log(`길격: ${positive.length}개 (${positive.map(p => p.name).join(', ') || '없음'})`);
console.log(`흉격: ${negative.length}개 (${negative.map(p => p.name).join(', ') || '없음'})`);
console.log(`중립: ${neutral.length}개 (${neutral.map(p => p.name).join(', ') || '없음'})`);
