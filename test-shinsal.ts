import { calculateShinSal, ShinSalType } from './src/lib/engines/saju';

const mockSaju = {
  yeonPillar: { stem: '갑', branch: '진' },
  monthPillar: { stem: '병', branch: '인' },
  dayPillar: { stem: '갑', branch: '술' },
  hourPillar: { stem: '무', branch: '진' },
  dayMaster: '갑'
};

const results = calculateShinSal(mockSaju);
console.log('Test Results:', JSON.stringify(results, null, 2));

if (results.length > 0) {
  console.log('SUCCESS: Shin-sal detected!');
} else {
  console.log('FAILURE: No Shin-sal detected for mock data.');
}
