import { calculateSaju } from '../lib/engines/saju';
import { calculateAstrology } from '../lib/engines/astrology';

const birthDate = new Date('1993-08-02');
const birthTime = '15:10';
const gender = 'male';

const saju = calculateSaju(birthDate, 15, 10, false, gender);
const astro = calculateAstrology(birthDate, birthTime);

console.log('--- SAJU DATA ---');
console.log('일간:', saju.dayMaster);
console.log('사주:', `${saju.yeonPillar.stem}${saju.yeonPillar.branch} ${saju.monthPillar.stem}${saju.monthPillar.branch} ${saju.dayPillar.stem}${saju.dayPillar.branch} ${saju.hourPillar.stem}${saju.hourPillar.branch}`);
console.log('오행:', saju.elements);

console.log('\n--- ASTRO DATA ---');
console.log('Sun Sign Index:', astro.sunSign);
console.log('Moon Sign Index:', astro.moonSign);
console.log('Ascendant Index:', astro.ascendant);
console.log('Aspects:', JSON.stringify(astro.enhancedAspects?.slice(0, 3), null, 2));
